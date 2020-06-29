import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import {
  IRCMessage,
  requireNickname,
  requireParameter,
} from "../irc/irc-message";
import { tagParserFor } from "../parser/tag-values";

// @badges=;color=#1E90FF;display-name=BotFactory;emotes=;message-id=6134;thread-id=40286300_403015524;turbo=0;
// user-id=403015524;user-type= :botfactory!botfactory@botfactory.tmi.twitch.tv WHISPER randers :Pong
export class WhisperMessage extends IRCMessage {
  public readonly messageText: string;

  public readonly senderUsername: string;
  public readonly senderUserID: string;

  public readonly recipientUsername: string;

  public readonly badges: TwitchBadgesList;
  public readonly badgesRaw: string;
  public readonly color: Color | undefined;
  public readonly colorRaw: string;
  public readonly displayName: string;
  public readonly emotes: TwitchEmoteList;
  public readonly emotesRaw: string;

  public readonly messageID: string;
  public readonly threadID: string;

  public constructor(ircMessage: IRCMessage) {
    super(ircMessage);

    this.messageText = requireParameter(this, 1);

    this.senderUsername = requireNickname(this);

    const tagParser = tagParserFor(this.ircTags);
    this.senderUserID = tagParser.requireString("user-id");

    this.recipientUsername = this.ircParameters[0];

    this.badges = tagParser.requireBadges("badges");
    this.badgesRaw = tagParser.requireString("badges");
    this.color = tagParser.getColor("color");
    this.colorRaw = tagParser.requireString("color");

    // trim: Twitch workaround for unsanitized data, see https://github.com/robotty/dank-twitch-irc/issues/33
    this.displayName = tagParser.requireString("display-name").trim();
    this.emotes = tagParser.requireEmotes("emotes", this.messageText);
    this.emotesRaw = tagParser.requireString("emotes");

    this.messageID = tagParser.requireString("message-id");
    this.threadID = tagParser.requireString("thread-id");
  }
}
