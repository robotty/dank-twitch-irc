import camelCase = require("lodash.camelcase");
import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { TwitchFlagList } from "../flags";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { getParameter, IRCMessageData } from "../irc/irc-message";
import { IRCMessageTags } from "../irc/tags";
import {
  convertToBoolean,
  convertToInt,
  convertToString,
  requireData,
  tagParserFor,
} from "../parser/tag-values";

const convertersMap: Record<string, (value: string) => any> = {
  "msg-param-cumulative-months": convertToInt,
  "msg-param-gift-months": convertToInt,
  "msg-param-sender-count": convertToInt,
  "msg-param-months": convertToInt,
  "msg-param-promo-gift-total": convertToInt,
  "msg-param-should-share-streak": convertToBoolean,
  "msg-param-streak-months": convertToInt,
  "msg-param-viewerCount": convertToInt,
  "msg-param-threshold": convertToInt,
  "msg-param-mass-gift-count": convertToInt,
  "msg-param-origin-id": convertToString,
  "msg-param-sub-plan": convertToString,
};

export function getCamelCasedName(tagKey: string): string {
  let newKey = tagKey;

  // remove the leading msg-param-
  newKey = newKey.substring(10);

  // camel case
  newKey = camelCase(newKey);

  // convert somethingId to somethingID
  newKey = newKey.replace(/Id$/g, "ID");

  // To be consistent with the rest of the library,
  // don't camelcase username as userName
  newKey = newKey.replace(/([uU])serName/g, "$1sername");

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
      params[newKey] = requireData(tags, tagKey, converter);
      params[newKey + "Raw"] = requireData(tags, tagKey, convertToString);
    } else {
      params[newKey] = requireData(tags, tagKey, convertToString);
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
  streakMonths: 0;
  streakMonthsRaw: "0";
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

  recipientUsername: string;

  subPlan: string;
  subPlanName: string;
}
export type AnonSubgiftParameters = SubgiftParameters;

// massgift
export interface MassSubgiftParameters extends EventParams {
  massGiftCount: number;
  subPlan: string;
}

// anongiftpaidupgrade
export type AnonGiftPaidUpgradeParameters = EventParams & {
  promoGiftTotal?: number;
  promoGiftTotalRaw?: string;
  promoName?: string;
};

// giftpaidupgrade
export type GiftPaidUpgradeParameters = AnonGiftPaidUpgradeParameters & {
  senderLogin: string;
  senderName: string;
};

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
export type MassSubgiftUsernoticeMessage = SpecificUsernoticeMessage<
  "submysterygift",
  MassSubgiftParameters
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

  /**
   * Can be an array of Twitch AutoMod flagged words, for use in moderation and/or filtering purposes.
   *
   * If the `flags` tag is missing or of a unparseable format, this will be `undefined`. This is unlike most other
   * attributes which when missing or malformed will fail the message parsing. However since this attribute is
   * completely undocumented we cannot rely on the `flags` tag being stable, so this soft fallback is used instead.
   * While it will be a major version release if this attribute changes format in dank-twitch-irc, using this is still
   * at your own risk since it may suddenly contain unexpected data or turn `undefined` one day as
   * Twitch changes something. In short: **Use at your own risk** and make sure your
   * implementation can handle the case where this is `undefined`.
   */
  public readonly flags: TwitchFlagList | undefined;

  /**
   * Twitch AutoMod raw flags string.
   *
   * If the `flags` tag is missing or of a unparseable format, this will be `undefined`. This is unlike most other
   * attributes which when missing or malformed will fail the message parsing. However since this attribute is
   * completely undocumented we cannot rely on the `flags` tag being stable, so this soft fallback is used instead.
   * In short, ensure your implementation can handle the case where this is `undefined` or is in
   * a format you don't expect.
   */
  public readonly flagsRaw: string | undefined;

  public readonly messageID: string;

  public readonly isMod: boolean;
  public readonly isModRaw: string;

  public readonly serverTimestamp: Date;
  public readonly serverTimestampRaw: string;

  public readonly eventParams: EventParams;

  public constructor(message: IRCMessageData) {
    super(message);

    this.messageText = getParameter(this, 1);

    const tagParser = tagParserFor(this.ircTags);
    this.channelID = tagParser.requireString("room-id");

    this.systemMessage = tagParser.requireString("system-msg");

    this.messageTypeID = tagParser.requireString("msg-id");

    this.senderUsername = tagParser.requireString("login");

    this.senderUserID = tagParser.requireString("user-id");

    this.badgeInfo = tagParser.requireBadges("badge-info");
    this.badgeInfoRaw = tagParser.requireString("badge-info");

    this.badges = tagParser.requireBadges("badges");
    this.badgesRaw = tagParser.requireString("badges");

    this.bits = tagParser.getInt("bits");
    this.bitsRaw = tagParser.getString("bits");

    this.color = tagParser.getColor("color");
    this.colorRaw = tagParser.requireString("color");

    // trim: Twitch workaround for unsanitized data, see https://github.com/robotty/dank-twitch-irc/issues/33
    this.displayName = tagParser.requireString("display-name").trim();

    if (this.messageText != null) {
      this.emotes = tagParser.requireEmotes("emotes", this.messageText);
      this.flags = tagParser.getFlags("flags", this.messageText);
    } else {
      this.emotes = [];
    }
    this.emotesRaw = tagParser.requireString("emotes");

    this.flagsRaw = tagParser.getString("flags");

    this.messageID = tagParser.requireString("id");

    this.isMod = tagParser.requireBoolean("mod");
    this.isModRaw = tagParser.requireString("mod");

    this.serverTimestamp = tagParser.requireTimestamp("tmi-sent-ts");
    this.serverTimestampRaw = tagParser.requireString("tmi-sent-ts");

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

  public isMassSubgift(): this is MassSubgiftParameters {
    return this.messageTypeID === "submysterygift";
  }

  public isAnonSubgift(): this is AnonSubgiftUsernoticeMessage {
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
