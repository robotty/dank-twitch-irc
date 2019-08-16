import { ExpandedTransportConfiguration } from "../../config/expanded";
import { DuplexTransport } from "./duplex-transport";
import { TcpTransport } from "./tcp-transport";
import { Transport } from "./transport";
import { WebSocketTransport } from "./websocket-transport";

export function makeTransport(
  config: ExpandedTransportConfiguration
): Transport {
  switch (config.type) {
    case "tcp":
      return new TcpTransport(config);
    case "duplex":
      return new DuplexTransport(config);
    case "websocket":
      return new WebSocketTransport(config);
    default:
      throw new Error("Unknown transport type");
  }
}
