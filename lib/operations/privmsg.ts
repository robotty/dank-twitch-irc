import { SingleConnection } from "../client/connection";

export async function sendPrivmsg(
  conn: SingleConnection,
  channelName: string,
  message: string
): Promise<void> {
  conn.sendRaw(`PRIVMSG #${channelName} :${message}`);
}
