import { EventEmitter } from "eventemitter3";
import { ClientConfiguration } from "../config/config";
import { expandConfig, ExpandedClientConfiguration } from "../config/expanded";
import { IRCMessage } from "../message/irc/irc-message";
import { ClientEvents, ClientState } from "./interface";

export abstract class BaseClient extends EventEmitter<ClientEvents> {
  public get unconnected(): boolean {
    return this.state === ClientState.UNCONNECTED;
  }

  public get connecting(): boolean {
    return this.state === ClientState.CONNECTING;
  }

  public get connected(): boolean {
    return this.state === ClientState.CONNECTED;
  }

  public get ready(): boolean {
    return this.state === ClientState.READY;
  }

  public get closed(): boolean {
    return this.state === ClientState.CLOSED;
  }

  public readonly configuration: ExpandedClientConfiguration;
  public abstract readonly wantedChannels: Set<string>;
  public abstract readonly joinedChannels: Set<string>;

  public state: ClientState = ClientState.UNCONNECTED;

  protected constructor(partialConfig?: ClientConfiguration) {
    super();
    this.configuration = expandConfig(partialConfig);
  }

  public emitError(error: Error, emitEvenIfClosed = false): void {
    if (this.closed && !emitEvenIfClosed) {
      return;
    }

    this.emit("error", error);
  }

  public emitMessage(message: IRCMessage): void {
    this.emit("message", message);
    this.emit(message.ircCommand, message);
  }

  public emitConnecting(): void {
    if (this.advanceState(ClientState.CONNECTING)) {
      this.emit("connecting");
    }
  }

  public emitConnected(): void {
    if (this.advanceState(ClientState.CONNECTED)) {
      this.emit("connect");
    }
  }

  public emitReady(): void {
    if (this.advanceState(ClientState.READY)) {
      this.emit("ready");
    }
  }

  public emitClosed(error?: Error): void {
    if (this.advanceState(ClientState.CLOSED)) {
      this.emit("close", error);
    }
  }

  public advanceState(newState: ClientState): boolean {
    if (newState <= this.state) {
      return false;
    }

    this.state = newState;
    return true;
  }
}
