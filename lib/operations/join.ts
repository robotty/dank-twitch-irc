import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { JoinMessage } from "../message/twitch-types/membership/join";
import { NoticeMessage } from "../message/twitch-types/notice";

export class JoinError extends MessageError {
  public readonly failedChannelName: string;

  public constructor(
    failedChannelName: string,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.failedChannelName = failedChannelName;
  }
}

export function awaitJoinResponse(
  conn: SingleConnection,
  channelName: string
): Promise<JoinMessage> {
  return awaitResponse(conn, {
    success: (msg) =>
      msg instanceof JoinMessage &&
      msg.channelName === channelName &&
      msg.joinedUsername === conn.configuration.username,
    failure: (msg) =>
      msg instanceof NoticeMessage &&
      msg.channelName === channelName &&
      msg.messageID === "msg_channel_suspended",
    errorType: (m, e) => new JoinError(channelName, m, e),
    errorMessage: `Failed to join channel ${channelName}`,
  }) as Promise<JoinMessage>;
}

export function joinNothingToDo(
  conn: SingleConnection,
  channelName: string
): boolean {
  return (
    conn.wantedChannels.has(channelName) && conn.joinedChannels.has(channelName)
  );
}

export async function joinChannel(
  conn: SingleConnection,
  channelName: string
): Promise<JoinMessage | undefined> {
  if (joinNothingToDo(conn, channelName)) {
    return;
  }

  conn.wantedChannels.add(channelName);
  conn.sendRaw(`JOIN #${channelName}`);
  const response = await awaitJoinResponse(conn, channelName);
  conn.joinedChannels.add(channelName);
  return response;
}
