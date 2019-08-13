import { Duplex } from "stream";

export interface Transport {
  readonly stream: Duplex;
  connect(connectionListener?: () => void): void;
}
