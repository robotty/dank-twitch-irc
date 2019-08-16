import * as carrier from "carrier";
import * as debugLogger from "debug-logger";
import { ResponseAwaiter } from "../await/await-response";
import { ClientConfiguration } from "../config/config";
import { handleReconnectMessage } from "../functionalities/handle-reconnect-message";
import { replyToServerPing } from "../functionalities/reply-to-ping";
import { sendClientPings } from "../functionalities/send-pings";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import { ConnectionMixin } from "../mixins/base-mixin";
import { sendLogin } from "../operations/login";
import { requestCapabilities } from "../operations/request-capabilities";
import { anyCauseInstanceof } from "../utils/any-cause-instanceof";
import { ignoreErrors } from "../utils/ignore-errors";
import { validateIRCCommand } from "../validation/irc-command";
import { BaseClient } from "./base-client";
import { ConnectionError, ProtocolError } from "./errors";
import { makeTransport } from "./transport/make-transport";
import { Transport } from "./transport/transport";

let connectionIDCounter = 0;

export class SingleConnection extends BaseClient {
  public readonly connectionID = connectionIDCounter++;

  public readonly wantedChannels: Set<string> = new Set<string>();
  public readonly joinedChannels: Set<string> = new Set<string>();

  public readonly pendingResponses: ResponseAwaiter[] = [];
  public readonly transport: Transport;

  protected readonly log = debugLogger(
    `dank-twitch-irc:connection:${this.connectionID}`
  );

  public constructor(configuration?: ClientConfiguration) {
    super(configuration);

    this.on("error", this.handleError.bind(this));
    this.on("connect", this.onConnect.bind(this));

    this.transport = makeTransport(this.configuration.connection);
    this.transport.stream.on("close", () => {
      // the hadError parameter is ignored, because if an error actually occurred the 'error' listener
      // would have been invoked first, advancing the state to CLOSED and emitting the error in the
      // 'close' event of this client.
      // Because the state is then already CLOSED, this.emitClosed() won't do anything if we had a transport
      // error.
      // (the emitClosed implementation only actually emits the 'close' event if this client is not
      // already closed)
      this.emitClosed();
    });
    this.transport.stream.on("error", e =>
      this.emitError(
        new ConnectionError("Error occurred in transport layer", e)
      )
    );
    carrier.carry(this.transport.stream, this.handleLine.bind(this));

    replyToServerPing(this);
    handleReconnectMessage(this);
  }

  public connect(): void {
    if (!this.unconnected) {
      throw new Error(
        "connect() may only be called on unconnected connections"
      );
    }

    this.emitConnecting();

    if (!this.configuration.connection.preSetup) {
      const promises = [
        requestCapabilities(
          this,
          this.configuration.requestMembershipCapability
        ),
        sendLogin(
          this,
          this.configuration.username,
          this.configuration.password
        )
      ];

      Promise.all(promises).then(() => this.emitReady(), ignoreErrors);
    } else {
      this.once("connect", () => {
        process.nextTick(() => this.emitReady());
      });
    }

    this.transport.connect(() => this.emitConnected());
  }

  public close(): void {
    // -> close is emitted
    this.transport.stream.end();
  }

  public destroy(error?: Error): void {
    this.transport.stream.destroy(error);
  }

  public send(command: string): void {
    validateIRCCommand(command);
    this.log.trace(">", command);
    this.transport.stream.write(command + "\r\n");
  }

  public onConnect(): void {
    sendClientPings(this);
  }

  public use(mixin: ConnectionMixin): void {
    mixin.applyToConnection(this);
  }

  private handleLine(line: string): void {
    if (line.length <= 0) {
      // ignore empty lines (allowed in IRC)
      return;
    }

    this.log.trace("<", line);

    let message;
    try {
      message = parseTwitchMessage(line);
    } catch (e) {
      this.emitError(new ProtocolError("Error while parsing IRC message", e));
      return;
    }
    this.emitMessage(message);
  }

  private handleError(e: Error): void {
    if (anyCauseInstanceof(e, ConnectionError)) {
      // this uses process.nextTick so the 'error' event can be fully dispatched
      // before the 'close' event is dispatched
      process.nextTick(() => {
        this.emitClosed(e);
        this.transport.stream.destroy(e);
      });
    }
  }
}
