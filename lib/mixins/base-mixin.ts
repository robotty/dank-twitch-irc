import { ChatClient } from "../client/client";
import { SingleConnection } from "../client/connection";

export interface ClientMixin {
  applyToClient(client: ChatClient): void;
}

export interface ConnectionMixin {
  applyToConnection(connection: SingleConnection): void;
}
