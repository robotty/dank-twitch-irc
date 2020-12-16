import { awaitResponse } from "../await/await-response";
import { matchingNotice } from "../await/conditions";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { validateChannelName } from "../validation/channel";
import { sendPrivmsg } from "./privmsg";

export class UserBanError extends MessageError {
  public channelName: string;
  public username: string;
  public reason: string | undefined;

  public constructor(
    channelName: string,
    username: string,
    reason: string | undefined,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.channelName = channelName;
    this.username = username;
    this.reason = reason;
  }
}

const failureNoticeIDs = [
  "no_permission",
  "bad_ban_admin",
  "bad_ban_anon",
  "bad_ban_broadcaster",
  "bad_ban_global_mod",
  "bad_ban_mod",
  "bad_ban_self",
  "bad_ban_staff",
  "usage_ban",
];

const successNoticeIDs = ["ban_success", "already_banned"];

export async function ban(
  conn: SingleConnection,
  channelName: string,
  username: string,
  reason?: string
): Promise<void> {
  validateChannelName(channelName);
  validateChannelName(username);

  let cmd;
  if (reason != null) {
    cmd = `/ban ${username} ${reason}`;
  } else {
    cmd = `/ban ${username}`;
  }

  await sendPrivmsg(conn, channelName, cmd);

  await awaitResponse(conn, {
    success: matchingNotice(channelName, successNoticeIDs),
    failure: matchingNotice(channelName, failureNoticeIDs),
    errorType: (msg, cause) =>
      new UserBanError(channelName, username, reason, msg, cause),
    errorMessage: `Failed to ban ${username} in #${channelName}`,
  });
}
