import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { IRCMessageData } from "../irc/irc-message";
import { optionalData } from "../parser/common";
import { TwitchEmoteSets } from "../parser/emote-sets";
import { tagParserFor } from "../parser/tag-values";

/**
 * State of the logged in user in a channel.
 */
export interface UserState {
  badgeInfo: TwitchBadgesList;
  badgeInfoRaw: string;
  badges: TwitchBadgesList;
  badgesRaw: string;
  color: Color | undefined;
  colorRaw: string;
  displayName: string;
  emoteSets: TwitchEmoteSets;
  emoteSetsRaw: string;
  isMod: boolean;
  isModRaw: string;
}

export class UserstateMessage extends ChannelIRCMessage implements UserState {
  public readonly badgeInfo: TwitchBadgesList;
  public readonly badgeInfoRaw: string;
  public readonly badges: TwitchBadgesList;
  public readonly badgesRaw: string;
  public readonly color: Color | undefined;
  public readonly colorRaw: string;
  public readonly displayName: string;
  public readonly emoteSets: TwitchEmoteSets;
  public readonly emoteSetsRaw: string;
  public readonly isMod: boolean;
  public readonly isModRaw: string;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.badgeInfo = tagParser.getBadges("badge-info");
    this.badgeInfoRaw = tagParser.getString("badge-info");

    this.badges = tagParser.getBadges("badges");
    this.badgesRaw = tagParser.getString("badges");

    this.color = optionalData(() => tagParser.getColor("color"));
    this.colorRaw = tagParser.getString("color");

    this.displayName = tagParser.getString("display-name");

    this.emoteSets = tagParser.getEmoteSets("emote-sets");
    this.emoteSetsRaw = tagParser.getString("emote-sets");

    this.isMod = tagParser.getBoolean("mod");
    this.isModRaw = tagParser.getString("mod");
  }

  public extractUserState(): UserState {
    return {
      badgeInfo: this.badgeInfo,
      badgeInfoRaw: this.badgeInfoRaw,
      badges: this.badges,
      badgesRaw: this.badgesRaw,
      color: this.color,
      colorRaw: this.colorRaw,
      displayName: this.displayName,
      emoteSets: this.emoteSets,
      emoteSetsRaw: this.emoteSetsRaw,
      isMod: this.isMod,
      isModRaw: this.isModRaw
    };
  }
}
