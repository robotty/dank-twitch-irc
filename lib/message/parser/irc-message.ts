import { IRCMessage } from "../irc/irc-message";
import { IRCMessageTags } from "../irc/tags";
import { ParseError } from "./parse-error";
import { parseTags } from "./tags";

const VALID_CMD_REGEX = /^(?:[a-zA-Z]+|[0-9]{3})$/;

export function parseIRCMessage(messageSrc: string): IRCMessage {
  let remainder = messageSrc;

  let ircTags: IRCMessageTags;
  if (messageSrc.startsWith("@")) {
    remainder = remainder.slice(1); // remove @ sign

    const spaceIdx = remainder.indexOf(" ");
    if (spaceIdx < 0) {
      // not found
      throw new ParseError(
        `No space found after tags declaration (given src: "${messageSrc}")`
      );
    }

    const tagsSrc = remainder.slice(0, spaceIdx);

    if (tagsSrc.length === 0) {
      throw new ParseError(
        `Empty tags declaration (nothing after @ sign) (given src: "${messageSrc}")`
      );
    }

    ircTags = parseTags(tagsSrc);
    remainder = remainder.slice(spaceIdx + 1);
  } else {
    ircTags = {};
  }

  let ircPrefix;
  let ircPrefixRaw;
  if (remainder.startsWith(":")) {
    remainder = remainder.slice(1); // remove : sign

    const spaceIdx = remainder.indexOf(" ");
    if (spaceIdx < 0) {
      // not found
      throw new ParseError(
        `No space found after prefix declaration (given src: "${messageSrc}")`
      );
    }

    ircPrefixRaw = remainder.slice(0, spaceIdx);
    remainder = remainder.slice(spaceIdx + 1);

    if (ircPrefixRaw.length === 0) {
      throw new ParseError(
        `Empty prefix declaration (nothing after : sign) (given src: "${messageSrc}")`
      );
    }

    if (!ircPrefixRaw.includes("@")) {
      // just a hostname or just a nickname
      ircPrefix = {
        nickname: undefined,
        username: undefined,
        hostname: ircPrefixRaw,
      };
    } else {
      // full prefix (nick[[!user]@host])
      // valid forms:
      // nick (but this is not really possible to differentiate
      //       from the hostname only, so if we don't get any @
      //       we just assume it's a hostname.)
      // nick@host
      // nick!user@host

      // split on @ first, then on !
      const atIndex = ircPrefixRaw.indexOf("@");
      const nickAndUser = ircPrefixRaw.slice(0, atIndex);
      const host = ircPrefixRaw.slice(atIndex + 1);

      // now nickAndUser is either "nick" or "nick!user"
      // => split on !
      const exclamationIndex = nickAndUser.indexOf("!");
      let nick;
      let user;
      if (exclamationIndex < 0) {
        // no ! found
        nick = nickAndUser;
        user = undefined;
      } else {
        nick = nickAndUser.slice(0, exclamationIndex);
        user = nickAndUser.slice(exclamationIndex + 1);
      }

      if (
        host.length === 0 ||
        nick.length === 0 ||
        (user != null && user.length === 0)
      ) {
        throw new ParseError(
          `Host, nick or user is empty in prefix (given src: "${messageSrc}")`
        );
      }

      ircPrefix = {
        nickname: nick,
        username: user,
        hostname: host,
      };
    }
  } else {
    ircPrefix = undefined;
    ircPrefixRaw = undefined;
  }

  const spaceAfterCommandIdx = remainder.indexOf(" ");

  let ircCommand;
  let ircParameters;

  if (spaceAfterCommandIdx < 0) {
    // no space after commands, i.e. no params.
    ircCommand = remainder;
    ircParameters = [];
  } else {
    // split command off
    ircCommand = remainder.slice(0, spaceAfterCommandIdx);
    remainder = remainder.slice(spaceAfterCommandIdx + 1);

    ircParameters = [];

    // introduce a new variable so it can be null (typescript shenanigans)
    let paramsRemainder: string | null = remainder;
    while (paramsRemainder !== null) {
      if (paramsRemainder.startsWith(":")) {
        // trailing param, remove : and consume the rest of the input
        ircParameters.push(paramsRemainder.slice(1));
        paramsRemainder = null;
      } else {
        // middle param
        const spaceIdx = paramsRemainder.indexOf(" ");

        let param;
        if (spaceIdx < 0) {
          // no space found
          param = paramsRemainder;
          paramsRemainder = null;
        } else {
          param = paramsRemainder.slice(0, spaceIdx);
          paramsRemainder = paramsRemainder.slice(spaceIdx + 1);
        }

        if (param.length === 0) {
          throw new ParseError(
            `Too many spaces found while trying to parse middle parameters (given src: "${messageSrc}")`
          );
        }
        ircParameters.push(param);
      }
    }
  }

  if (!VALID_CMD_REGEX.test(ircCommand)) {
    throw new ParseError(
      `Invalid format for IRC command (given src: "${messageSrc}")`
    );
  }

  ircCommand = ircCommand.toUpperCase();

  return new IRCMessage({
    rawSource: messageSrc,
    ircPrefixRaw,
    ircPrefix,
    ircCommand,
    ircParameters,
    ircTags,
  });
}
