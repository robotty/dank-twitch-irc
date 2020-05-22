import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { NoticeMessage } from "../message/twitch-types/notice";
import { validateChannelName } from "../validation/channel";
import { sendPrivmsg } from "./privmsg";

export class WhisperError extends MessageError {
  public targetUsername: string;
  public failedMessage: string;

  public constructor(
    targetUsername: string,
    failedMessage: string,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.targetUsername = targetUsername;
    this.failedMessage = failedMessage;
  }
}

const badNoticeIDs = [
  "whisper_banned", // You have been banned from sending whispers.
  "whisper_banned_recipient", // That user has been banned from receiving whispers.
  "whisper_invalid_args", // Usage: <login> <message>
  "whisper_invalid_login", // No user matching that login.
  "whisper_invalid_self", // You cannot whisper to yourself.
  "whisper_limit_per_min", // You are sending whispers too fast. Try again in a minute.
  "whisper_limit_per_sec", // You are sending whispers too fast. Try again in a second.
  "whisper_restricted", // Your settings prevent you from sending this whisper.
  "whisper_restricted_recipient", // That user's settings prevent them from receiving this whisper.
];

export async function whisper(
  conn: SingleConnection,
  username: string,
  message: string
): Promise<void> {
  validateChannelName(username);
  sendPrivmsg(conn, conn.configuration.username, `/w ${username} ${message}`);

  return awaitResponse(conn, {
    failure: (msg) =>
      msg instanceof NoticeMessage &&
      msg.channelName === conn.configuration.username &&
      badNoticeIDs.includes(msg.messageID!),
    noResponseAction: "success",
    timeout: 1000,
    errorType: (msg, cause) => new WhisperError(username, message, msg, cause),
    errorMessage: `Failed to whisper [${username}]: ${message}`,
  }) as Promise<void>;
}
