import { IRCMessage } from "../irc/irc-message";
import { IRCMessagePrefix } from "../irc/prefix";
import { ParseError } from "./parse-error";
import { parseTags } from "./tags";

// relevant RFC: https://tools.ietf.org/html/rfc2812#section-2.3.1
// also this should be helpful :) https://tools.ietf.org/html/rfc5234
// the regex below tries to follow the described format when possible,
// but ridiculous validation tasks like URL validation are not performed

export const ircParseRegex = new RegExp(
  "^(?:@(?<tags>[^ ]+) )?(?::(?<prefix>(?<hostname>[a-zA-Z0-9-_]+\\" +
    ".[a-zA-Z0-9-_.]+)|(?:(?<nickname>[a-zA-Z0-9-[\\]\\\\`_^{|}]+)(?:(?:!(?<username>[^\\x00\\r\\n @]+))?@" +
    "(?<hostname2>[a-zA-Z0-9-_.]+))?)) )?(?<command>[a-zA-Z]+|[0-9]{3})(?<middleParameters>(?: [^\\x00\\r\\" +
    "n :][^\\x00\\r\\n ]*){0,14})?(?: :(?<trailingParameter>[^\\x00\\r\\n]*))?$"
);

// splits the "middleParameters" group returned by the main parse regex
// into the individual arguments
const eachMiddleParameterRegex = /(?<= )[^\x00\r\n :][^\x00\r\n ]*/g;

/**
 * Parses what the "middleParameters" group of the main regex matched into a list
 * of "middle" parameters. E.g. in PRIVMSG #pajlada :xD the
 * `middleParametersRaw` would be ` #pajlada` (notice the leading space)
 * and the expected results would be `['#pajlada']`.
 * If no middle parameters were matched `middleParametersRaw` will be an empty string.
 *
 * @param middleParametersRaw The raw middle parameters from the regex match.
 */
export function parseMiddleParameters(
  middleParametersRaw: string | undefined
): string[] {
  if (middleParametersRaw == null || middleParametersRaw.length <= 0) {
    return [];
  }

  // middleParametersRaw an arguments list like:
  // " #pajlada anotherarg thirdarg" (each argument prefixed with a space)
  let match;
  const parameters: string[] = [];
  while ((match = eachMiddleParameterRegex.exec(middleParametersRaw)) != null) {
    parameters.push(match[0]);
  }
  return parameters;
}

export function parseIRCMessage(messageSrc: string): IRCMessage {
  const matches = ircParseRegex.exec(messageSrc);
  if (matches == null) {
    throw new ParseError(`IRC message malformed (given line: "${messageSrc}")`);
  }

  const ircTagsRaw: string | undefined = matches.groups!.tags;
  const ircTags = parseTags(ircTagsRaw);

  const ircPrefixRaw: string | undefined = matches.groups!.prefix;
  let ircPrefix: IRCMessagePrefix | undefined;
  if (matches.groups!.hostname != null) {
    // Variant 1: Just a hostname
    ircPrefix = {
      nickname: undefined,
      username: undefined,
      hostname: matches.groups!.hostname
    };
  } else if (matches.groups!.nickname != null) {
    // Variant 2: Nickname, username?, hostname?
    ircPrefix = {
      nickname: matches.groups!.nickname,
      username: matches.groups!.username,
      hostname: matches.groups!.hostname2
    };
  } else {
    ircPrefix = undefined;
  }

  const ircCommand = matches.groups!.command.toUpperCase();

  const middleParametersRaw = matches.groups!.middleParameters;
  const ircParameters = parseMiddleParameters(middleParametersRaw);

  const trailingParameterRaw = matches.groups!.trailingParameter;
  if (trailingParameterRaw != null) {
    ircParameters.push(trailingParameterRaw);
  }

  return new IRCMessage({
    rawSource: messageSrc,
    ircPrefixRaw,
    ircPrefix,
    ircCommand,
    ircParameters,
    ircTags
  });
}
