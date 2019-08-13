import { Socket } from "net";
import { TLSSocket } from "tls";
import { ExpandedTcpTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class TcpTransport implements Transport {
  public readonly stream: Socket | TLSSocket;
  private readonly config: ExpandedTcpTransportConfiguration;

  public constructor(config: ExpandedTcpTransportConfiguration) {
    this.config = config;

    if (config.secure) {
      this.stream = new TLSSocket(new Socket());
    } else {
      this.stream = new Socket();
    }

    this.stream.setNoDelay(true);
    this.stream.setDefaultEncoding("utf-8");
    this.stream.cork();
  }

  public connect(connectionListener?: () => void): void {
    this.stream.connect(this.config.port, this.config.host, () => {
      this.stream.uncork();
      if (connectionListener != null) {
        connectionListener();
      }
    });
  }
}
