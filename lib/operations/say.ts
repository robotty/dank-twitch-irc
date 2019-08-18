import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { NoticeMessage } from "../message/twitch-types/notice";
import { UserstateMessage } from "../message/twitch-types/userstate";
import { sendPrivmsg } from "./privmsg";

export function removeCommands(message: string): string {
  if (message.startsWith(".") || message.startsWith("/")) {
    return `/ ${message}`;
  } else {
    return message;
  }
}

export class SayError extends MessageError {
  public failedChannelName: string;
  public failedMessage: string;

  public constructor(
    failedChannelName: string,
    failedMessage: string,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.failedChannelName = failedChannelName;
    this.failedMessage = failedMessage;
  }
}

const badNoticeIDs = [
  "msg_banned", // You are permanently banned from talking in <channel>.
  "msg_bad_characters", // Your message was not sent because it contained too many unprocessable characters.
  // If you believe this is an error, please rephrase and try again.
  "msg_channel_blocked", // Your message was not sent because your account is not in good standing in this channel.
  "msg_channel_suspended", // This channel has been suspended.
  "msg_duplicate", // Your message was not sent because it is identical to the previous one you sent,
  // less than 30 seconds ago.
  "msg_emoteonly", // This room is in emote only mode. You can find your currently available emoticons using
  // the smiley in the chat text area.
  "msg_facebook", // You must Facebook Connect to send messages to this channel. You can Facebook Connect in
  // your Twitch settings under the connections tab.
  "msg_followersonly", // This room is in <duration> followers-only mode. Follow <channel> to join the community!
  "msg_followersonly_followed", // This room is in <duration1> followers-only mode. You have been following for
  // <duration2>. Continue following to chat!
  "msg_followersonly_zero", // This room is in followers-only mode. Follow <channel> to join the community!
  "msg_r9k", // This room is in r9k mode and the message you attempted to send is not unique.
  "msg_ratelimit", // Your message was not sent because you are sending messages too quickly.
  "msg_rejected", // 	Hey! Your message is being checked by mods and has not been sent.
  "msg_rejected_mandatory", // Your message wasn't posted due to conflicts with the channel's moderation settings.
  "msg_room_not_found", // The room was not found.
  "msg_slowmode", // This room is in slow mode and you are sending messages too quickly. You will be able to
  // talk again in <number> seconds.
  "msg_subsonly", // This room is in subscribers only mode. To talk, purchase a channel subscription at
  // https://www.twitch.tv/products/<broadcaster login name>/ticket?ref=subscriber_only_mode_chat.
  "msg_suspended", // Your account has been suspended.
  "msg_timedout", // You are banned from talking in <channel> for <number> more seconds.
  "msg_verified_email" // 	This room requires a verified email address to chat. Please verify your email at
  // https://www.twitch.tv/settings/profile.
];

export async function say(
  conn: SingleConnection,
  channelName: string,
  message: string,
  action = false
): Promise<UserstateMessage> {
  let command;
  let errorMessage;
  if (action) {
    command = `/me ${message}`;
    errorMessage = `Failed to say [#${channelName}]: /me ${message}`;
  } else {
    command = removeCommands(message);
    errorMessage = `Failed to say [#${channelName}]: ${message}`;
  }
  sendPrivmsg(conn, channelName, command);

  return awaitResponse(conn, {
    success: msg =>
      msg instanceof UserstateMessage && msg.channelName === channelName,
    failure: msg =>
      msg instanceof NoticeMessage &&
      msg.channelName === channelName &&
      badNoticeIDs.includes(msg.messageID!),
    errorType: (msg, cause) => new SayError(channelName, message, msg, cause),
    errorMessage: errorMessage
  }) as Promise<UserstateMessage>;
}

export async function me(
  conn: SingleConnection,
  channelName: string,
  message: string
): Promise<UserstateMessage> {
  return say(conn, channelName, message, true);
}
