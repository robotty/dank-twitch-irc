import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { getParameter, IRCMessageData } from "../irc/irc-message";
import { tagParserFor } from "../parser/tag-values";

export class ClearmsgMessage extends ChannelIRCMessage {
  public readonly targetUsername: string;
  public readonly targetMessageID: string;
  public readonly targetMessageContent: string;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.targetUsername = tagParser.getString("login");
    this.targetMessageID = tagParser.getString("target-msg-id");
    this.targetMessageContent = getParameter(this, 1);
  }
}
