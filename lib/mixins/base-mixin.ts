import { Client } from "../client/client";
import { SingleConnection } from "../client/connection";

export interface ClientMixin {
  applyToClient(client: Client): void;
}

export interface ConnectionMixin {
  applyToConnection(connection: SingleConnection): void;
}
