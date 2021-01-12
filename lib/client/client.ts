import * as debugLogger from "debug-logger";
import { getMods, getVips } from "../operations/get-mods-vips";
import { ClientConfiguration } from "../config/config";
import { Color } from "../message/color";
import { ClientMixin, ConnectionMixin } from "../mixins/base-mixin";
import { IgnoreUnhandledPromiseRejectionsMixin } from "../mixins/ignore-promise-rejections";
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
import { setColor } from "../operations/set-color";
import { timeout } from "../operations/timeout";
import { ban } from "../operations/ban";
import { whisper } from "../operations/whisper";
import { anyCauseInstanceof } from "../utils/any-cause-instanceof";
import { findAndPushToEnd } from "../utils/find-and-push-to-end";
import { removeInPlace } from "../utils/remove-in-place";
import { unionSets } from "../utils/union-sets";
import { validateChannelName, correctChannelName } from "../validation/channel";
import { BaseClient } from "./base-client";
import { SingleConnection } from "./connection";
import { ClientError } from "./errors";

const log = debugLogger("dank-twitch-irc:client");

export type ConnectionPredicate = (conn: SingleConnection) => boolean;
const alwaysTrue = (): true => true as const;

export class ChatClient extends BaseClient {
  public get wantedChannels(): Set<string> {
    return unionSets(this.connections.map((c) => c.wantedChannels));
  }

  public get joinedChannels(): Set<string> {
    return unionSets(this.connections.map((c) => c.joinedChannels));
  }

  public roomStateTracker?: RoomStateTracker;
  public userStateTracker?: UserStateTracker;
  public readonly connectionMixins: ConnectionMixin[] = [];

  public readonly connections: SingleConnection[] = [];
  private activeWhisperConn: SingleConnection | undefined;

  public constructor(configuration?: ClientConfiguration) {
    super(configuration);

    if (this.configuration.installDefaultMixins) {
      this.use(new UserStateTracker(this));
      this.use(new RoomStateTracker());
      this.use(new ConnectionRateLimiter(this));
      this.use(new PrivmsgMessageRateLimiter(this));
    }

    if (this.configuration.ignoreUnhandledPromiseRejections) {
      this.use(new IgnoreUnhandledPromiseRejectionsMixin());
    }

    this.on("error", (error) => {
      if (anyCauseInstanceof(error, ClientError)) {
        process.nextTick(() => {
          this.emitClosed(error);
          this.connections.forEach((conn) => conn.destroy(error));
        });
      }
    });

    this.on("close", () => {
      this.connections.forEach((conn) => conn.close());
    });
  }

  public async connect(): Promise<void> {
    this.requireConnection();
    if (!this.ready) {
      await new Promise<void>((resolve) => this.once("ready", () => resolve()));
    }
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
    this.requireConnection().sendRaw(command);
  }

  public async join(channelName: string): Promise<void> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);

    if (this.connections.some((c) => joinNothingToDo(c, channelName))) {
      // are we joined already?
      return;
    }

    const conn = this.requireConnection(
      maxJoinedChannels(this.configuration.maxChannelCountPerConnection)
    );
    await joinChannel(conn, channelName);
  }

  public async part(channelName: string): Promise<void> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);

    if (this.connections.every((c) => partNothingToDo(c, channelName))) {
      // are we parted already?
      return;
    }

    const conn = this.requireConnection(
      (c) => !partNothingToDo(c, channelName)
    );
    await partChannel(conn, channelName);
  }

  public async joinAll(
    channelNames: string[]
  ): Promise<Record<string, Error | undefined>> {
    channelNames = channelNames.map((v) => {
      v = correctChannelName(v);
      validateChannelName(v);
      return v;
    });

    const needToJoin: string[] = channelNames.filter(
      (channelName) =>
        !this.connections.some((c) => joinNothingToDo(c, channelName))
    );

    const promises: Promise<Record<string, Error | undefined>>[] = [];

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
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);
    return sendPrivmsg(this.requireConnection(), channelName, message);
  }

  public async say(channelName: string, message: string): Promise<void> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);
    await say(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async me(channelName: string, message: string): Promise<void> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);
    await me(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async timeout(
    channelName: string,
    username: string,
    length: number,
    reason?: string
  ): Promise<void> {
    await timeout(
      this.requireConnection(),
      channelName,
      username,
      length,
      reason
    );
  }

  public async ban(
    channelName: string,
    username: string,
    reason?: string
  ): Promise<void> {
    await ban(this.requireConnection(), channelName, username, reason);
  }

  public async whisper(username: string, message: string): Promise<void> {
    validateChannelName(username);
    await whisper(this.requireConnection(), username, message);
  }

  public async setColor(color: Color): Promise<void> {
    await setColor(this.requireConnection(), color);
  }

  public async getMods(channelName: string): Promise<string[]> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);
    return await getMods(this.requireConnection(), channelName);
  }

  public async getVips(channelName: string): Promise<string[]> {
    channelName = correctChannelName(channelName);
    validateChannelName(channelName);
    return await getVips(this.requireConnection(), channelName);
  }

  public async ping(): Promise<void> {
    await sendPing(this.requireConnection());
  }

  public newConnection(): SingleConnection {
    const conn = new SingleConnection(this.configuration);

    log.debug(`Creating new connection (ID ${conn.connectionID})`);

    for (const mixin of this.connectionMixins) {
      conn.use(mixin);
    }

    conn.on("connecting", () => this.emitConnecting());
    conn.on("connect", () => this.emitConnected());
    conn.on("ready", () => this.emitReady());
    conn.on("error", (error) => this.emitError(error));
    conn.on("close", (hadError) => {
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

    // forward commands issued by this client
    conn.on("rawCommmand", (cmd) => this.emit("rawCommmand", cmd));

    // forward events to this client
    conn.on("message", (message) => {
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
    const channels = Array.from(conn.wantedChannels);

    if (channels.length > 0) {
      //noinspection JSIgnoredPromiseFromCall
      this.joinAll(channels);
    } else if (this.connections.length <= 0) {
      // this ensures that clients with zero joined channels stay connected (so they can receive whispers)
      this.requireConnection();
    }

    this.emit("reconnect", conn);
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
  return (conn) => conn.wantedChannels.size < maxChannelCount;
}

function mustNotBeJoined(channelName: string): ConnectionPredicate {
  return (conn) =>
    !conn.wantedChannels.has(channelName) &&
    !conn.joinedChannels.has(channelName);
}
