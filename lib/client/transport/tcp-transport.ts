import { Socket } from "net";
import { TLSSocket } from "tls";
import { ExpandedTcpTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class TcpTransport implements Transport {
  public readonly stream: Socket | TLSSocket;
  private readonly backingSocket?: Socket;
  private readonly config: ExpandedTcpTransportConfiguration;

  public constructor(config: ExpandedTcpTransportConfiguration) {
    this.config = config;

    if (config.secure) {
      this.backingSocket = new Socket();
      this.backingSocket.setNoDelay(true);

      this.stream = new TLSSocket(this.backingSocket);
    } else {
      this.stream = new Socket();
    }

    this.stream.setNoDelay(true);
    this.stream.setDefaultEncoding("utf-8"); // for writing
    this.stream.setEncoding("utf-8"); // for reading

    this.stream.cork();
  }

  public connect(connectionListener?: () => void): void {
    if (this.backingSocket != null) {
      this.backingSocket.connect(this.config.port, this.config.host);
    }

    this.stream.connect(this.config.port, this.config.host, () => {
      this.stream.uncork();
      if (connectionListener != null) {
        connectionListener();
      }
    });
  }
}
