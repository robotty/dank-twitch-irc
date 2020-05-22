import { Duplexify } from "duplexify";
import * as duplexify from "duplexify";
import * as WebSocketDuplex from "simple-websocket";
import { PassThrough } from "stream";
import { ExpandedWebSocketTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class WebSocketTransport implements Transport {
  public readonly stream: Duplexify;
  private readonly readable: PassThrough;
  private readonly writable: PassThrough;

  private readonly config: ExpandedWebSocketTransportConfiguration;
  private wsStream: WebSocketDuplex | undefined;

  public constructor(config: ExpandedWebSocketTransportConfiguration) {
    this.config = config;

    this.readable = new PassThrough({ decodeStrings: false, objectMode: true });
    this.writable = new PassThrough({ decodeStrings: false, objectMode: true });
    this.stream = duplexify(this.writable, this.readable, {
      decodeStrings: false,
      objectMode: true,
    });
  }

  public connect(connectionListener?: () => void): void {
    this.wsStream = new WebSocketDuplex({
      url: this.config.url,
      decodeStrings: false,
      objectMode: true,
    });
    if (connectionListener != null) {
      this.wsStream.once("connect", connectionListener);
    }

    this.wsStream.pipe(this.readable);
    this.writable.pipe(this.wsStream);
  }
}
