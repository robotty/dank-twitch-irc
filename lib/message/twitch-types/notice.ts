import { getIRCChannelName } from "../irc/channel-irc-message";
import { getParameter, IRCMessage, IRCMessageData } from "../irc/irc-message";
import { optionalData } from "../parser/common";
import { tagParserFor } from "../parser/tag-values";

export class NoticeMessage extends IRCMessage {
  public readonly channelName: string | undefined;
  public readonly messageText: string;
  public readonly messageID: string | undefined;

  public constructor(message: IRCMessageData) {
    super(message);

    // optional = true
    // so we can parse messages like :tmi.twitch.tv NOTICE * :Improperly formatted auth
    // that don't have a valid channel name
    this.channelName = getIRCChannelName(this, true);

    const tagParser = tagParserFor(this.ircTags);
    this.messageText = getParameter(this, 1);
    this.messageID = optionalData(() => tagParser.getString("msg-id"));
  }
}
