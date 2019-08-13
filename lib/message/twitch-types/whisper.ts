import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { getNickname, getParameter, IRCMessage } from "../irc/irc-message";
import { optionalData } from "../parser/common";
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

    this.messageText = getParameter(this, 1);

    this.senderUsername = getNickname(this);

    const tagParser = tagParserFor(this.ircTags);
    this.senderUserID = tagParser.getString("user-id");

    this.recipientUsername = this.ircParameters[0];

    this.badges = tagParser.getBadges("badges");
    this.badgesRaw = tagParser.getString("badges");
    this.color = optionalData(() => tagParser.getColor("color"));
    this.colorRaw = tagParser.getString("color");

    this.displayName = tagParser.getString("display-name");
    this.emotes = tagParser.getEmotes("emotes", this.messageText);
    this.emotesRaw = tagParser.getString("emotes");

    this.messageID = tagParser.getString("message-id");
    this.threadID = tagParser.getString("thread-id");
  }
}
