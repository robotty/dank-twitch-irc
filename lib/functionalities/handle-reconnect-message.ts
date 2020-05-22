import { SingleConnection } from "../client/connection";
import { ConnectionError } from "../client/errors";

export class ReconnectError extends ConnectionError {
  public constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export function handleReconnectMessage(conn: SingleConnection): void {
  conn.on("RECONNECT", (msg) => {
    process.nextTick(() => {
      conn.emitError(
        new ReconnectError(
          "RECONNECT command received by server: " + msg.rawSource
        )
      );
    });
  });
}
