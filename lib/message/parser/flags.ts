import { TwitchFlag } from "../flag";
import { TwitchFlagList } from "../flags";
import { parseIntThrowing } from "./common";
import { ParseError } from "./parse-error";

export function parseFlags(
  messageText: string,
  flagsSrc: string
): TwitchFlagList {
  const flags: TwitchFlagList = [];

  if (flagsSrc.length <= 0) {
    return flags;
  }

  const messageCharacters = [...messageText];

  for (const flagInstancesSrc of flagsSrc.split(",")) {
    const [indexes, instancesSrc] = flagInstancesSrc.split(":", 2);

    const [startIndex, endIndexInclusive] = indexes
      .split("-")
      .map(parseIntThrowing);
    if (endIndexInclusive == null) {
      throw new ParseError(`No - found in flag index range "${indexes}"`);
    }

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
      const [category, score] = instanceSrc.split(".");
      categories.push({
        category,
        score: parseIntThrowing(score),
      });
    }

    flags.push(new TwitchFlag(startIndex, endIndex, flagText, categories));
  }

  // sort by start index
  flags.sort((a, b) => a.startIndex - b.startIndex);

  return flags;
}
