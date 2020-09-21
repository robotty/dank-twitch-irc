import { awaitResponse } from "../await/await-response";
import { matchingNotice } from "../await/conditions";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { NoticeMessage } from "../message/twitch-types/notice";

interface GetUsersConfig {
  command: "mods" | "vips";
  msgIdError: string;
  msgIdNone: string;
  msgIdSome: string;
  someMessagePrefix: string;
  someMessageSuffix: string;
}

const getModsInfo: GetUsersConfig = {
  command: "mods",
  msgIdError: "usage_mods",
  msgIdNone: "no_mods",
  msgIdSome: "room_mods",
  someMessagePrefix: "The moderators of this channel are: ",
  someMessageSuffix: "",
};
const getVipsInfo: GetUsersConfig = {
  command: "vips",
  msgIdError: "usage_vips",
  msgIdNone: "no_vips",
  msgIdSome: "vips_success",
  someMessagePrefix: "The VIPs of this channel are: ",
  someMessageSuffix: ".",
};

export class GetUsersError extends MessageError {
  public channelName: string;
  public type: "mods" | "vips";

  public constructor(
    channelName: string,
    type: "mods" | "vips",
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.channelName = channelName;
    this.type = type;
  }
}

export async function getMods(
  conn: SingleConnection,
  channelName: string
): Promise<string[]> {
  return await getModsOrVips(conn, channelName, getModsInfo);
}

export async function getVips(
  conn: SingleConnection,
  channelName: string
): Promise<string[]> {
  return await getModsOrVips(conn, channelName, getVipsInfo);
}

async function getModsOrVips(
  conn: SingleConnection,
  channelName: string,
  config: GetUsersConfig
): Promise<string[]> {
  conn.sendRaw(`PRIVMSG #${channelName} :/${config.command}`);

  const responseMsg = (await awaitResponse(conn, {
    success: matchingNotice(channelName, [config.msgIdNone, config.msgIdSome]),
    failure: matchingNotice(channelName, [config.msgIdError]),
    errorType: (msg, cause) =>
      new GetUsersError(channelName, config.command, msg, cause),
    errorMessage: `Failed to get ${config.command} of channel ${channelName}`,
  })) as NoticeMessage;

  if (responseMsg.messageID === config.msgIdNone) {
    return [];
  }

  if (responseMsg.messageID === config.msgIdSome) {
    let text = responseMsg.messageText;

    if (
      !text.startsWith(config.someMessagePrefix) ||
      !text.endsWith(config.someMessageSuffix)
    ) {
      throw new GetUsersError(
        channelName,
        config.command,
        `Failed to get ${config.command} of channel ${channelName}: Response message had unexpected format: ${responseMsg.rawSource}`
      );
    }

    // slice away the prefix and suffix
    text = text.slice(
      config.someMessagePrefix.length,
      text.length - config.someMessageSuffix.length
    );

    return text.split(", ");
  }

  throw new Error("unreachable");
}
