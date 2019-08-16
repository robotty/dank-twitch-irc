import { Duplex } from "stream";
import { ExpandedDuplexTransportConfiguration } from "../../config/expanded";
import { Transport } from "./transport";

export class DuplexTransport implements Transport {
  public readonly stream: Duplex;

  public constructor(config: ExpandedDuplexTransportConfiguration) {
    this.stream = config.stream();
  }

  public connect(connectionListener?: () => void): void {
    if (connectionListener != null) {
      // invoke now (duplex is already connected)
      setImmediate(connectionListener);
    }
  }
}
