import camelCase = require("lodash.camelcase");
import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { getParameter, IRCMessageData } from "../irc/irc-message";
import { IRCMessageTags } from "../irc/tags";
import { optionalData } from "../parser/common";
import {
  getTagBoolean,
  getTagInt,
  getTagString,
  tagParserFor
} from "../parser/tag-values";

const convertersMap: Record<
  string,
  (ircTags: IRCMessageTags, key: string) => any
> = {
  "msg-param-cumulative-months": getTagInt,
  "msg-param-months": getTagInt,
  "msg-param-promo-gift-total": getTagInt,
  "msg-param-should-share-streak": getTagBoolean,
  "msg-param-streak-months": getTagInt,
  "msg-param-viewerCount": getTagInt,
  "msg-param-threshold": getTagInt
};

export function getCamelCasedName(tagKey: string): string {
  let newKey = tagKey;

  // remove the leading msg-param-
  newKey = newKey.substring(10);

  // camel case
  newKey = camelCase(newKey);

  // convert somethingId to somethingID
  if (newKey.endsWith("Id")) {
    newKey = newKey.slice(0, -1) + "D";
  }

  return newKey;
}

export interface EventParams {
  [key: string]: string | number | boolean;
}

export function extractEventParams(tags: IRCMessageTags): EventParams {
  const params: EventParams = {};

  // converts all msg-param-* tags into a new "params" object where keys are camelCased
  // and boolean/integer tags are parsed (including a identically named "Raw" property).
  // e.g. msg-param-should-share-streak would become
  // shouldShareStreak: true
  // shouldShareStreakRaw: '1'
  for (const tagKey of Object.keys(tags)) {
    if (!tagKey.startsWith("msg-param-")) {
      continue;
    }

    const newKey = getCamelCasedName(tagKey);

    const converter = convertersMap[tagKey];
    if (converter != null) {
      params[newKey] = converter(tags, tagKey);
      params[newKey + "Raw"] = getTagString(tags, tagKey);
    } else {
      params[newKey] = getTagString(tags, tagKey);
    }
  }

  return params;
}

export interface SharesStreakSubParams extends EventParams {
  shouldShareStreak: true;
  streakMonths: number;
  streakMonthsRaw: string;
}

export interface HiddenStreakSubParams extends EventParams {
  shouldShareStreak: false;
}

export type StreakSubParams = SharesStreakSubParams | HiddenStreakSubParams;

// sub, resub
export type SubEventParams = EventParams &
  StreakSubParams & {
    cumulativeMonths: number;
    cumulativeMonthsRaw: string;

    subPlan: string;
    subPlanName: string;
  };

// raid
export interface RaidParams extends EventParams {
  displayName: string;
  login: string;
  viewerCount: number;
  viewerCountRaw: string;
}

// subgift, anonsubgift
export interface SubgiftParameters extends EventParams {
  months: number;
  monthsRaw: string;

  recipientDisplayName: string;
  recipientID: number;

  recipientUserName: string;

  subPlan: string;
  subPlanName: string;
}
export type AnonSubgiftParameters = SubgiftParameters;

// anongiftpaidupgrade
export interface AnonGiftPaidUpgradeParameters extends EventParams {
  promoGiftTotal: number;
  promoGiftTotalRaw: string;

  promoName: string;
}

// giftpaidupgrade
export interface GiftPaidUpgradeParameters
  extends AnonGiftPaidUpgradeParameters {
  senderLogin: string;
  senderName: string;
}

// ritual
export interface RitualParameters extends EventParams {
  ritualName: string;
}

// bitsbadgetier
export interface BitsBadgeTierParameters extends EventParams {
  threshold: number;
  thresholdRaw: string;
}

export interface SpecificUsernoticeMessage<
  I extends string,
  E extends EventParams
> {
  readonly messageTypeID: I;
  readonly eventParams: E;
}

export type SubUsernoticeMessage = SpecificUsernoticeMessage<
  "sub",
  SubEventParams
>;
export type ResubUsernoticeMessage = SpecificUsernoticeMessage<
  "resub",
  SubEventParams
>;
export type RaidUsernoticeMessage = SpecificUsernoticeMessage<
  "raid",
  RaidParams
>;
export type SubgiftUsernoticeMessage = SpecificUsernoticeMessage<
  "subgift",
  SubgiftParameters
>;
export type AnonSubgiftUsernoticeMessage = SpecificUsernoticeMessage<
  "anonsubgift",
  AnonSubgiftParameters
>;
export type AnonGiftPaidUpgradeUsernoticeMessage = SpecificUsernoticeMessage<
  "anongiftpaidupgrade",
  AnonGiftPaidUpgradeParameters
>;
export type GiftPaidUpgradeUsernoticeMessage = SpecificUsernoticeMessage<
  "giftpaidupgrade",
  GiftPaidUpgradeParameters
>;
export type RitualUsernoticeMessage = SpecificUsernoticeMessage<
  "ritual",
  RitualParameters
>;
export type BitsBadgeTierUsernoticeMessage = SpecificUsernoticeMessage<
  "bitsbadgetier",
  BitsBadgeTierParameters
>;

interface CheerUsernoticeMessage extends UsernoticeMessage {
  readonly bits: number;
  readonly bitsRaw: string;
}

export class UsernoticeMessage extends ChannelIRCMessage {
  public readonly channelID: string;

  public readonly messageText: string | undefined;
  public readonly systemMessage: string;

  /** sub, resub, subgift, etc... */
  public readonly messageTypeID: string;

  public readonly senderUsername: string;
  public readonly senderUserID: string;

  public readonly badgeInfo: TwitchBadgesList;
  public readonly badgeInfoRaw: string;

  public readonly badges: TwitchBadgesList;
  public readonly badgesRaw: string;

  public readonly bits: number | undefined;
  public readonly bitsRaw: string | undefined;

  public readonly color: Color | undefined;
  public readonly colorRaw: string;

  public readonly displayName: string;

  public readonly emotes: TwitchEmoteList;
  public readonly emotesRaw: string;

  public readonly messageID: string;

  public readonly isMod: boolean;
  public readonly isModRaw: string;

  public readonly serverTimestamp: Date;
  public readonly serverTimestampRaw: string;

  public readonly eventParams: EventParams;

  public constructor(message: IRCMessageData) {
    super(message);

    this.messageText = optionalData(() => getParameter(this, 1));

    const tagParser = tagParserFor(this.ircTags);
    this.channelID = tagParser.getString("room-id");

    this.systemMessage = tagParser.getString("system-msg");

    this.messageTypeID = tagParser.getString("msg-id");

    this.senderUsername = tagParser.getString("login");

    this.senderUserID = tagParser.getString("user-id");

    this.badgeInfo = tagParser.getBadges("badge-info");
    this.badgeInfoRaw = tagParser.getString("badge-info");

    this.badges = tagParser.getBadges("badges");
    this.badgesRaw = tagParser.getString("badges");

    this.bits = optionalData(() => tagParser.getInt("bits"));
    this.bitsRaw = optionalData(() => tagParser.getString("bits"));

    this.color = optionalData(() => tagParser.getColor("color"));
    this.colorRaw = tagParser.getString("color");

    this.displayName = tagParser.getString("display-name");

    if (this.messageText != null) {
      this.emotes = tagParser.getEmotes("emotes", this.messageText);
    } else {
      this.emotes = [];
    }
    this.emotesRaw = tagParser.getString("emotes");

    this.messageID = tagParser.getString("id");

    this.isMod = tagParser.getBoolean("mod");
    this.isModRaw = tagParser.getString("mod");

    this.serverTimestamp = tagParser.getTimestamp("tmi-sent-ts");
    this.serverTimestampRaw = tagParser.getString("tmi-sent-ts");

    this.eventParams = extractEventParams(this.ircTags);
  }

  public isCheer(): this is CheerUsernoticeMessage {
    return this.bits != null;
  }

  public isSub(): this is SubUsernoticeMessage {
    return this.messageTypeID === "sub";
  }

  public isResub(): this is ResubUsernoticeMessage {
    return this.messageTypeID === "resub";
  }

  public isRaid(): this is RaidUsernoticeMessage {
    return this.messageTypeID === "raid";
  }

  public isSubgift(): this is SubgiftUsernoticeMessage {
    return this.messageTypeID === "subgift";
  }

  public isAnonSubgift(): this is SubgiftUsernoticeMessage {
    return this.messageTypeID === "anonsubgift";
  }

  public isAnonGiftPaidUpgrade(): this is AnonGiftPaidUpgradeUsernoticeMessage {
    return this.messageTypeID === "anongiftpaidupgrade";
  }

  public isGiftPaidUpgrade(): this is GiftPaidUpgradeUsernoticeMessage {
    return this.messageTypeID === "giftpaidupgrade";
  }

  public isRitual(): this is RitualUsernoticeMessage {
    return this.messageTypeID === "ritual";
  }

  public isBitsBadgeTier(): this is BitsBadgeTierUsernoticeMessage {
    return this.messageTypeID === "bitsbadgetier";
  }
}
