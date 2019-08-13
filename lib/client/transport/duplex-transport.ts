import { Duplex } from "stream";
import { ExpandedDuplexTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class DuplexTransport implements Transport {
  public readonly stream: Duplex;
  private readonly config: ExpandedDuplexTransportConfiguration;

  public constructor(config: ExpandedDuplexTransportConfiguration) {
    this.config = config;
    this.stream = config.stream();
  }

  public connect(connectionListener?: () => void): void {
    if (connectionListener != null) {
      // invoke now (duplex is already connected)
      setImmediate(connectionListener);
    }
  }
}
