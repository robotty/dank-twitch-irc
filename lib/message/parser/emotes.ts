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

  for (const emoteInstancesSrc of emotesSrc.split("/")) {
    const [emoteID, instancesSrc] = emoteInstancesSrc.split(":", 2);
    for (const instanceSrc of instancesSrc.split(",")) {
      const [startIndex, endIndexInclusive] = instanceSrc
        .split("-")
        .map(parseIntThrowing);
      if (endIndexInclusive == null) {
        throw new ParseError(
          `No - found in emote index range "${instanceSrc}"`
        );
      }

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
