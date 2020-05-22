import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { IRCMessageData, requireParameter } from "../irc/irc-message";
import { tagParserFor } from "../parser/tag-values";

export class ClearmsgMessage extends ChannelIRCMessage {
  public readonly targetUsername: string;
  public readonly targetMessageID: string;
  public readonly targetMessageContent: string;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.targetUsername = tagParser.requireString("login");
    this.targetMessageID = tagParser.requireString("target-msg-id");
    this.targetMessageContent = requireParameter(this, 1);
  }
}
