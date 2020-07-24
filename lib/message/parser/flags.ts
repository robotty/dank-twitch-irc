import { TwitchFlag } from "../flag";
import { TwitchFlagList } from "../flags";
import { ParseError } from "./parse-error";

export function parseFlags(
  messageText: string,
  flagsSrc: string
): TwitchFlagList {
  const flags: TwitchFlagList = [];

  const regex = /^(,?(?:[0-9]+-[0-9]+:)(?:(?:[ISAP]\.[0-9]+\/?)+)?)+$/g;

  const matchFlagsSrc = flagsSrc.match(regex);

  if (flagsSrc.length <= 0 || matchFlagsSrc === null) {
    return flags;
  }

  const messageCharacters = [...messageText];

  for (const flagInstancesSrc of flagsSrc.split(",")) {
    const [indexes, instancesSrc] = flagInstancesSrc.split(":", 2);

    const [startIndex, endIndexInclusive] = indexes
      .split("-")
      .map((s) => Number(s));

    // to make endIndex exclusive
    const endIndex = endIndexInclusive + 1;
    if (endIndex > messageCharacters.length) {
      throw new ParseError(
        `End index ${endIndexInclusive} is out of range for given message string`
      );
    }

    const flagText = messageCharacters.slice(startIndex, endIndex).join("");

    const categories: TwitchFlag["categories"] = [];
    for (const instanceSrc of instancesSrc.split("/")) {
      if (instanceSrc.length > 0) {
        const [category, score] = instanceSrc.split(".");
        categories.push({
          category,
          score: Number(score),
        });
      }
    }

    flags.push(new TwitchFlag(startIndex, endIndex, flagText, categories));
  }

  // sort by start index
  flags.sort((a, b) => a.startIndex - b.startIndex);

  return flags;
}
