import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { PartMessage } from "../message/twitch-types/membership/part";

export class PartError extends MessageError {
  public failedChannelName: string;

  public constructor(
    failedChannelName: string,
    message?: string,
    cause?: Error | undefined
  ) {
    super(message, cause);
    this.failedChannelName = failedChannelName;
  }
}

export async function awaitPartResponse(
  conn: SingleConnection,
  channelName: string
): Promise<PartMessage> {
  return awaitResponse(conn, {
    // :justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv PART #pajlada
    success: (msg) =>
      msg instanceof PartMessage &&
      msg.channelName === channelName &&
      msg.partedUsername === conn.configuration.username,
    errorType: (m, e) => new PartError(channelName, m, e),
    errorMessage: `Failed to part channel ${channelName}`,
  }) as Promise<PartMessage>;
}

export function partNothingToDo(
  conn: SingleConnection,
  channelName: string
): boolean {
  return (
    !conn.wantedChannels.has(channelName) &&
    !conn.joinedChannels.has(channelName)
  );
}

export async function partChannel(
  conn: SingleConnection,
  channelName: string
): Promise<PartMessage | undefined> {
  if (partNothingToDo(conn, channelName)) {
    // nothing to do (already parted)
    return;
  }

  conn.sendRaw(`PART #${channelName}`);

  conn.wantedChannels.delete(channelName);
  const response = await awaitPartResponse(conn, channelName);
  conn.joinedChannels.delete(channelName);
  return response;
}
