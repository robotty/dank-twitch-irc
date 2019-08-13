import { SingleConnection } from "../client/connection";

export function replyToServerPing(conn: SingleConnection): void {
  conn.on("PING", msg => {
    if (msg.argument == null) {
      conn.send("PONG");
    } else {
      conn.send(`PONG :${msg.argument}`);
    }
  });
}
