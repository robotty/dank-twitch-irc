import { ParseError } from "../parser/parse-error";
import { IRCMessage, IRCMessageData, requireParameter } from "./irc-message";

export function getIRCChannelName(
  message: Pick<IRCMessage, "ircParameters">,
  optional?: false
): string;
export function getIRCChannelName(
  message: Pick<IRCMessage, "ircParameters">,
  optional: true
): string | undefined;

export function getIRCChannelName(
  message: Pick<IRCMessage, "ircParameters">,
  optional = false
): string | undefined {
  const parameter = requireParameter(message, 0);

  if (optional && parameter === "*") {
    return undefined;
  }

  if (!parameter.startsWith("#") || parameter.length < 2) {
    throw new ParseError(`Received malformed IRC channel name "${parameter}"`);
  }

  return parameter.slice(1);
}

export class ChannelIRCMessage extends IRCMessage {
  public readonly channelName: string;

  public constructor(message: IRCMessageData) {
    super(message);
    this.channelName = getIRCChannelName(this);
  }
}
