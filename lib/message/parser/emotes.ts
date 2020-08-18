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

  const messageCharacters = [...messageText];

  for (const emoteInstancesSrc of emotesSrc.split("/")) {
    const [emoteID, instancesSrc] = emoteInstancesSrc.split(":", 2);
    for (const instanceSrc of instancesSrc.split(",")) {
      let [startIndex, endIndex] = instanceSrc.split("-").map(parseIntThrowing);
      if (endIndex == null) {
        throw new ParseError(
          `No - found in emote index range "${instanceSrc}"`
        );
      }

      // to make endIndex exclusive
      endIndex = endIndex + 1;

      // workaround for Twitch bug: https://github.com/twitchdev/issues/issues/104
      if (startIndex < 0) {
        startIndex = 0;
      }
      if (endIndex > messageCharacters.length) {
        endIndex = messageCharacters.length;
      }

      const emoteText = messageCharacters.slice(startIndex, endIndex).join("");

      emotes.push(new TwitchEmote(emoteID, startIndex, endIndex, emoteText));
    }
  }

  // sort by start index
  emotes.sort((a, b) => a.startIndex - b.startIndex);

  return emotes;
}
