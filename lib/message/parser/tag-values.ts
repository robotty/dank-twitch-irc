import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { TwitchFlagList } from "../flags";
import { IRCMessageTags } from "../irc/tags";
import { parseBadges } from "./badges";
import { parseColor } from "./color";
import { parseEmoteSets, TwitchEmoteSets } from "./emote-sets";
import { parseEmotes } from "./emotes";
import { parseFlags } from "./flags";
import { MissingTagError } from "./missing-tag-error";
import { ParseError } from "./parse-error";

export function requireData<V, A extends any[]>(
  ircTags: IRCMessageTags,
  key: string,
  converter: (value: string, ...converterArgs: A) => V | undefined,
  ...converterArgs: A
): V {
  const stringValue = ircTags[key];
  if (stringValue == null) {
    throw new MissingTagError(key, stringValue);
  }

  const value = converter(stringValue, ...converterArgs);
  if (value == null) {
    throw new MissingTagError(key, stringValue);
  }
  return value;
}

export function getData<V, A extends any[]>(
  ircTags: IRCMessageTags,
  key: string,
  converter: (value: string, ...converterArgs: A) => V,
  ...converterArgs: A
): V | undefined {
  const stringValue = ircTags[key];
  if (stringValue == null) {
    return undefined;
  }
  return converter(stringValue, ...converterArgs);
}

export function convertToString(value: string): string {
  return value;
}

export function convertToInt(value: string): number {
  const parsedInt = parseInt(value);
  if (isNaN(parsedInt)) {
    throw new ParseError(`Failed to parse integer from tag value "${value}"`);
  }
  return parsedInt;
}

export function convertToBoolean(value: string): boolean {
  return Boolean(convertToInt(value));
}

export function convertToColor(value: string): Color | undefined {
  if (value.length <= 0) {
    return undefined;
  }
  return parseColor(value);
}

export function convertToTimestamp(value: string): Date {
  return new Date(convertToInt(value));
}

export function convertToBadges(value: string): TwitchBadgesList {
  return parseBadges(value);
}

export function convertToEmotes(
  value: string,
  messageText: string
): TwitchEmoteList {
  return parseEmotes(messageText, value);
}

export function convertToEmoteSets(value: string): TwitchEmoteSets {
  return parseEmoteSets(value);
}

export function convertToFlags(
  value: string,
  messageText: string
): TwitchFlagList {
  return parseFlags(messageText, value);
}

export interface TagValueParser {
  getString(key: string): string | undefined;
  requireString(key: string): string;
  getInt(key: string): number | undefined;
  requireInt(key: string): number;
  getBoolean(key: string): boolean | undefined;
  requireBoolean(key: string): boolean;
  getColor(key: string): Color | undefined;
  requireColor(key: string): Color;
  getTimestamp(key: string): Date | undefined;
  requireTimestamp(key: string): Date;
  getBadges(key: string): TwitchBadgesList | undefined;
  requireBadges(key: string): TwitchBadgesList;
  getEmotes(key: string, messageText: string): TwitchEmoteList | undefined;
  requireEmotes(key: string, messageText: string): TwitchEmoteList;
  getEmoteSets(key: string): TwitchEmoteSets | undefined;
  requireEmoteSets(key: string): TwitchEmoteSets;
  getFlags(key: string, messageText: string): TwitchFlagList | undefined;
}

export function tagParserFor(ircTags: IRCMessageTags): TagValueParser {
  return {
    getString: (key: string) => getData(ircTags, key, convertToString),
    requireString: (key: string) => requireData(ircTags, key, convertToString),
    getInt: (key: string) => getData(ircTags, key, convertToInt),
    requireInt: (key: string) => requireData(ircTags, key, convertToInt),
    getBoolean: (key: string) => getData(ircTags, key, convertToBoolean),
    requireBoolean: (key: string) =>
      requireData(ircTags, key, convertToBoolean),
    getColor: (key: string) => getData(ircTags, key, convertToColor),
    requireColor: (key: string) => requireData(ircTags, key, convertToColor),
    getTimestamp: (key: string) => getData(ircTags, key, convertToTimestamp),
    requireTimestamp: (key: string) =>
      requireData(ircTags, key, convertToTimestamp),
    getBadges: (key: string) => getData(ircTags, key, convertToBadges),
    requireBadges: (key: string) => requireData(ircTags, key, convertToBadges),
    getEmotes: (key: string, messageText: string) =>
      getData(ircTags, key, convertToEmotes, messageText),
    requireEmotes: (key: string, messageText: string) =>
      requireData(ircTags, key, convertToEmotes, messageText),
    getEmoteSets: (key: string) => getData(ircTags, key, convertToEmoteSets),
    requireEmoteSets: (key: string) =>
      requireData(ircTags, key, convertToEmoteSets),
    getFlags: (key: string, messageText: string) =>
      getData(ircTags, key, convertToFlags, messageText),
  };
}
