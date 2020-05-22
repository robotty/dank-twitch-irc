import { SingleConnection } from "../client/connection";

export function replyToServerPing(conn: SingleConnection): void {
  conn.on("PING", (msg) => {
    if (msg.argument == null) {
      conn.sendRaw("PONG");
    } else {
      conn.sendRaw(`PONG :${msg.argument}`);
    }
  });
}
