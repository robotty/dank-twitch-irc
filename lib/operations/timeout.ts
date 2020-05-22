import ms = require("ms");
import { awaitResponse } from "../await/await-response";
import { matchingNotice } from "../await/conditions";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { validateChannelName } from "../validation/channel";
import { sendPrivmsg } from "./privmsg";

export class UserTimeoutError extends MessageError {
  public channelName: string;
  public username: string;
  public length: number;
  public reason: string | undefined;

  public constructor(
    channelName: string,
    username: string,
    length: number,
    reason: string | undefined,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.channelName = channelName;
    this.username = username;
    this.length = length;
    this.reason = reason;
  }
}

const failureNoticeIDs = [
  "no_permission",
  "bad_timeout_admin",
  "bad_timeout_anon",
  "bad_timeout_broadcaster",
  "bad_timeout_duration",
  "bad_timeout_global_mod",
  "bad_timeout_mod",
  "bad_timeout_self",
  "bad_timeout_staff",
  "usage_timeout",
];

const successNoticeIDs = ["timeout_success", "already_banned"];

export async function timeout(
  conn: SingleConnection,
  channelName: string,
  username: string,
  length: number,
  reason?: string
): Promise<void> {
  validateChannelName(channelName);
  validateChannelName(username);

  let cmd;
  if (reason != null) {
    cmd = `/timeout ${username} ${length} ${reason}`;
  } else {
    cmd = `/timeout ${username} ${length}`;
  }

  await sendPrivmsg(conn, channelName, cmd);

  await awaitResponse(conn, {
    success: matchingNotice(channelName, successNoticeIDs),
    failure: matchingNotice(channelName, failureNoticeIDs),
    errorType: (msg, cause) =>
      new UserTimeoutError(channelName, username, length, reason, msg, cause),
    errorMessage:
      `Failed to timeout ${username} for ` +
      `${ms(length * 1000)} in #${channelName}`,
  });
}
