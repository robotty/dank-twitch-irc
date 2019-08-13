import { TwitchBadgesList } from "../badges";
import { Color } from "../color";
import { TwitchEmoteList } from "../emotes";
import { IRCMessageTags } from "../irc/tags";
import { parseBadges } from "./badges";
import { parseColor } from "./color";
import { parseEmoteSets, TwitchEmoteSets } from "./emote-sets";
import { parseEmotes } from "./emotes";
import { MissingTagError } from "./missing-tag-error";
import { ParseError } from "./parse-error";

export function getTagString(ircTags: IRCMessageTags, key: string): string {
  const value = ircTags[key];
  if (value == null) {
    throw new MissingTagError(key, value);
  }
  return value;
}

export function getNonEmptyTagString(
  ircTags: IRCMessageTags,
  key: string
): string {
  const value = getTagString(ircTags, key);

  if (value.length <= 0) {
    throw new MissingTagError(key, value);
  }

  return value;
}

export function getTagInt(ircTags: IRCMessageTags, key: string): number {
  const src = getNonEmptyTagString(ircTags, key);
  const parsedInt = parseInt(src);
  if (isNaN(parsedInt)) {
    throw new ParseError(`Failed to parse integer from tag value "${src}"`);
  }

  return parsedInt;
}

export function getTagBoolean(ircTags: IRCMessageTags, key: string): boolean {
  return Boolean(getTagInt(ircTags, key));
}

export function getTagColor(ircTags: IRCMessageTags, key: string): Color {
  return parseColor(getNonEmptyTagString(ircTags, key));
}

export function getTagTimestamp(ircTags: IRCMessageTags, key: string): Date {
  return new Date(getTagInt(ircTags, key));
}

export function getTagBadges(
  ircTags: IRCMessageTags,
  key: string
): TwitchBadgesList {
  return parseBadges(getTagString(ircTags, key));
}

export function getTagEmotes(
  ircTags: IRCMessageTags,
  key: string,
  messageText: string
): TwitchEmoteList {
  return parseEmotes(messageText, getTagString(ircTags, key));
}

export function getTagEmoteSets(
  ircTags: IRCMessageTags,
  key: string
): TwitchEmoteSets {
  return parseEmoteSets(getTagString(ircTags, key));
}

interface TagValueParser {
  getString(key: string): string;
  getNonEmptyString(key: string): string;
  getInt(key: string): number;
  getBoolean(key: string): boolean;
  getColor(key: string): Color;
  getTimestamp(key: string): Date;
  getBadges(key: string): TwitchBadgesList;
  getEmotes(key: string, messageText: string): TwitchEmoteList;
  getEmoteSets(key: string): TwitchEmoteSets;
}

export function tagParserFor(ircTags: IRCMessageTags): TagValueParser {
  return {
    getString: (...args) => getTagString(ircTags, ...args),
    getNonEmptyString: (...args) => getNonEmptyTagString(ircTags, ...args),
    getInt: (...args) => getTagInt(ircTags, ...args),
    getBoolean: (...args) => getTagBoolean(ircTags, ...args),
    getColor: (...args) => getTagColor(ircTags, ...args),
    getTimestamp: (...args) => getTagTimestamp(ircTags, ...args),
    getBadges: (...args) => getTagBadges(ircTags, ...args),
    getEmotes: (...args) => getTagEmotes(ircTags, ...args),
    getEmoteSets: (...args) => getTagEmoteSets(ircTags, ...args)
  };
}
