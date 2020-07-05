import { TwitchEmote } from "../emote";
import { TwitchEmoteList } from "../emotes";
import { parseIntThrowing } from "./common";
import { ParseError } from "./parse-error";

export function parseEmotes(
  messageText: string,
  emotesSrc: string
): TwitchEmoteList {
  const emotes: TwitchEmoteList = [];

  if (emotesSrc.length <= 0) {
    return emotes;
  }

  // Gets emojis in text
  const emojis = [];

  // Lodash library regexp for matching emojis.
  const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;
  const matchedEmojis = [...messageText.matchAll(regex)];
  for (let index = 0; index < matchedEmojis.length; index++) {
    const emoji = matchedEmojis[index];
    if (emoji.index !== undefined) {
      emojis.push(emoji.index);
    }
  }

  for (const emoteInstancesSrc of emotesSrc.split("/")) {
    const [emoteID, instancesSrc] = emoteInstancesSrc.split(":", 2);
    let emojiCount = 0;
    for (const instanceSrc of instancesSrc.split(",")) {
      let [startIndex, endIndexInclusive] = instanceSrc
        .split("-")
        .map(parseIntThrowing);
      if (endIndexInclusive == null) {
        throw new ParseError(
          `No - found in emote index range "${instanceSrc}"`
        );
      }

      // Fix for when emojis exist before this emote.
      emojiCount = emojis.filter(
        (emojiIndex) =>
          emojiIndex <= startIndex + (emojiCount > 0 ? emojiCount - 1 : 0)
      ).length;
      startIndex += emojiCount;
      endIndexInclusive += emojiCount;

      // to make endIndex exclusive
      const endIndex = endIndexInclusive + 1;
      if (endIndex > messageText.length) {
        throw new ParseError(
          `End index ${endIndexInclusive} is out of range for given message string`
        );
      }

      const emoteText = messageText.slice(startIndex, endIndex);

      emotes.push(new TwitchEmote(emoteID, startIndex, endIndex, emoteText));
    }
  }

  // sort by start index
  emotes.sort((a, b) => a.startIndex - b.startIndex);

  return emotes;
}
