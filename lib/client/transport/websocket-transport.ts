import { Duplexify } from "duplexify";
import * as duplexify from "duplexify";
import * as WebSocketStream from "websocket-stream";
import { WebSocketDuplex } from "websocket-stream";
import { ExpandedWebSocketTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class WebsocketTransport implements Transport {
  public readonly stream: Duplexify;
  private readonly config: ExpandedWebSocketTransportConfiguration;
  private wsStream: WebSocketDuplex | undefined;

  public constructor(config: ExpandedWebSocketTransportConfiguration) {
    this.config = config;

    // A duplexify is "corked" by default
    // the write buffer will be forwarded to the websocket stream
    // via the setWritable call in connect()
    this.stream = duplexify();
  }

  public connect(connectionListener?: () => void): void {
    this.wsStream = WebSocketStream(this.config.url);
    if (connectionListener != null) {
      this.wsStream.once("connect", connectionListener);
    }

    // uncork
    this.stream.setReadable(this.wsStream);
    this.stream.setWritable(this.wsStream);
  }
}
