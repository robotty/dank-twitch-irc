import * as debugLogger from "debug-logger";
import { ClientConfiguration } from "../config/config";
import { JoinMessage } from "../message/twitch-types/membership/join";
import { IgnorePromiseRejectionsMixin } from "../mixins";
import { ClientMixin, ConnectionMixin } from "../mixins/base-mixin";
import { ConnectionRateLimiter } from "../mixins/ratelimiters/connection";
import { PrivmsgMessageRateLimiter } from "../mixins/ratelimiters/privmsg";
import { RoomStateTracker } from "../mixins/roomstate-tracker";
import { UserStateTracker } from "../mixins/userstate-tracker";
import { joinChannel, joinNothingToDo } from "../operations/join";
import { joinAll } from "../operations/join-all";
import { partChannel, partNothingToDo } from "../operations/part";
import { sendPing } from "../operations/ping";
import { sendPrivmsg } from "../operations/privmsg";
import { me, say } from "../operations/say";
import { whisper } from "../operations/whisper";
import { anyCauseInstanceof } from "../utils/any-cause-instanceof";
import { findAndPushToEnd } from "../utils/find-and-push-to-end";
import { removeInPlace } from "../utils/remove-in-place";
import { unionSets } from "../utils/union-sets";
import { validateChannelName } from "../validation/channel";
import { BaseClient } from "./base-client";
import { SingleConnection } from "./connection";
import { ClientError } from "./errors";

const log = debugLogger("dank-twitch-irc:client");

export type ConnectionPredicate = (conn: SingleConnection) => boolean;
const alwaysTrue = (): true => true as const;

export class ChatClient extends BaseClient {
  public get wantedChannels(): Set<string> {
    return unionSets(this.connections.map(c => c.wantedChannels));
  }

  public get joinedChannels(): Set<string> {
    return unionSets(this.connections.map(c => c.joinedChannels));
  }

  public roomStateTracker?: RoomStateTracker;
  public userStateTracker?: UserStateTracker;
  public readonly connectionMixins: ConnectionMixin[] = [];

  private readonly connections: SingleConnection[] = [];
  private activeWhisperConn: SingleConnection | undefined;

  public constructor(configuration?: ClientConfiguration) {
    super(configuration);

    if (this.configuration.installDefaultMixins) {
      this.use(new UserStateTracker(this));
      this.use(new RoomStateTracker());
      this.use(new ConnectionRateLimiter(this));
      this.use(new PrivmsgMessageRateLimiter(this));
    }

    if (this.configuration.suppressPromiseRejections) {
      this.use(new IgnorePromiseRejectionsMixin());
    }

    this.on("error", error => {
      if (anyCauseInstanceof(error, ClientError)) {
        this.connections.forEach(conn => conn.destroy(error));
      }
    });

    this.on("close", () => {
      this.connections.forEach(conn => conn.close());
    });
  }

  public connect(): void {
    this.requireConnection();
  }

  public close(): void {
    // -> connections are close()d via "close" event listener
    this.emitClosed();
  }

  public destroy(error?: Error): void {
    // we emit onError before onClose just like the standard node.js core modules do
    if (error != null) {
      this.emitError(error);
      this.emitClosed(error);
    } else {
      this.emitClosed();
    }
  }

  /**
   * Sends a raw IRC command to the server, e.g. <code>JOIN #forsen</code>.
   *
   * Throws an exception if the passed command contains one or more newline characters.
   *
   * @param command Raw IRC command.
   */
  public sendRaw(command: string): void {
    this.requireConnection().send(command);
  }

  public async join(channelName: string): Promise<JoinMessage | undefined> {
    validateChannelName(channelName);

    if (this.connections.some(c => joinNothingToDo(c, channelName))) {
      // are we joined already?
      return;
    }

    const conn = this.requireConnection(
      maxJoinedChannels(this.configuration.maxChannelCountPerConnection)
    );
    return joinChannel(conn, channelName);
  }

  public async part(channelName: string): Promise<void> {
    validateChannelName(channelName);

    if (this.connections.every(c => partNothingToDo(c, channelName))) {
      // are we parted already?
      return;
    }

    const conn = this.requireConnection(c => !partNothingToDo(c, channelName));
    await partChannel(conn, channelName);
  }

  public async joinAll(
    channelNames: string[]
  ): Promise<Record<string, Error | undefined>> {
    channelNames.forEach(validateChannelName);

    const needToJoin: string[] = channelNames.filter(
      channelName =>
        !this.connections.some(c => joinNothingToDo(c, channelName))
    );

    const promises: Array<Promise<Record<string, Error | undefined>>> = [];

    let idx = 0;
    while (idx < needToJoin.length) {
      const conn = this.requireConnection(
        maxJoinedChannels(this.configuration.maxChannelCountPerConnection)
      );

      const canJoin =
        this.configuration.maxChannelCountPerConnection -
        conn.wantedChannels.size;

      const channelsSlice = needToJoin.slice(idx, (idx += canJoin));

      promises.push(joinAll(conn, channelsSlice));
    }

    const errorChunks = await Promise.all(promises);
    return Object.assign({}, ...errorChunks);
  }

  public async privmsg(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    return sendPrivmsg(this.requireConnection(), channelName, message);
  }

  public async say(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    await say(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async me(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    await me(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async whisper(username: string, message: string): Promise<void> {
    validateChannelName(username);
    await whisper(this.requireConnection(), username, message);
  }

  public async ping(): Promise<void> {
    await sendPing(this.requireConnection());
  }

  public newConnection(): SingleConnection {
    log.debug("Creating new connection");

    const conn = new SingleConnection(this.configuration);

    for (const mixin of this.connectionMixins) {
      conn.use(mixin);
    }

    conn.on("connecting", () => this.emitConnecting());
    conn.on("connect", () => this.emitConnected());
    conn.on("ready", () => this.emitReady());
    conn.on("error", error => this.emitError(error));
    conn.on("close", hadError => {
      if (hadError) {
        log.warn(`Connection ${conn.connectionID} was closed due to error`);
      } else {
        log.debug(`Connection ${conn.connectionID} closed normally`);
      }

      removeInPlace(this.connections, conn);
      if (this.activeWhisperConn === conn) {
        this.activeWhisperConn = undefined;
      }

      if (!this.closed) {
        this.reconnectFailedConnection(conn);
      }
    });

    // forward events to this client
    conn.on("message", message => {
      // only forward whispers from the currently active whisper connection
      if (message.ircCommand === "WHISPER") {
        if (this.activeWhisperConn == null) {
          this.activeWhisperConn = conn;
        }

        if (this.activeWhisperConn !== conn) {
          // message is ignored.
          return;
        }
      }

      this.emitMessage(message);
    });

    conn.connect();

    this.connections.push(conn);
    return conn;
  }

  public use(mixin: ClientMixin): void {
    mixin.applyToClient(this);
  }

  private reconnectFailedConnection(conn: SingleConnection): void {
    // rejoin channels, creates connections on demand
    const channels = Array.from(conn.joinedChannels);

    if (channels.length > 0) {
      //noinspection JSIgnoredPromiseFromCall
      this.joinAll(channels);
    } else if (this.connections.length <= 0) {
      // this ensures that clients with zero joined channels stay connected (so they can receive whispers)
      this.requireConnection();
    }
  }

  /**
   * Finds a connection from the list of connections that satisfies the given predicate,
   * or if none was found, returns makes a new connection. This means that the given predicate must be specified
   * in a way that a new connection always satisfies it.
   *
   * @param predicate The predicate the connection must fulfill.
   */
  private requireConnection(
    predicate: ConnectionPredicate = alwaysTrue
  ): SingleConnection {
    return (
      findAndPushToEnd(this.connections, predicate) || this.newConnection()
    );
  }
}

function maxJoinedChannels(maxChannelCount: number): ConnectionPredicate {
  return conn => conn.wantedChannels.size < maxChannelCount;
}

function mustNotBeJoined(channelName: string): ConnectionPredicate {
  return conn =>
    !conn.wantedChannels.has(channelName) &&
    !conn.joinedChannels.has(channelName);
}
