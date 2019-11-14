import { MissingDataError } from "../parser/missing-data-error";
import { IRCMessagePrefix } from "./prefix";
import { IRCMessageTags } from "./tags";

export interface IRCMessageData {
  readonly rawSource: string;

  readonly ircPrefixRaw: string | undefined;
  readonly ircPrefix: IRCMessagePrefix | undefined;

  /**
   * The parser ensures this is always uppercase
   */
  readonly ircCommand: string;
  readonly ircParameters: string[];
  readonly ircTags: IRCMessageTags;
}

export class IRCMessage implements IRCMessageData {
  public readonly rawSource: string;

  public readonly ircPrefixRaw: string | undefined;
  public readonly ircPrefix: IRCMessagePrefix | undefined;

  /**
   * The parser ensures this is always uppercase
   */
  public readonly ircCommand: string;
  public readonly ircParameters: string[];
  public readonly ircTags: IRCMessageTags;

  public constructor(messageData: IRCMessageData) {
    this.rawSource = messageData.rawSource;
    this.ircPrefixRaw = messageData.ircPrefixRaw;
    this.ircPrefix = messageData.ircPrefix;
    this.ircCommand = messageData.ircCommand;
    this.ircParameters = messageData.ircParameters;
    this.ircTags = messageData.ircTags;
  }
}

export function getParameter(
  message: Pick<IRCMessage, "ircParameters">,
  idx: number
): string {
  return message.ircParameters[idx];
}

export function requireParameter(
  message: Pick<IRCMessage, "ircParameters">,
  idx: number
): string {
  if (message.ircParameters.length <= idx) {
    throw new MissingDataError(`Parameter at index ${idx} missing`);
  }

  return message.ircParameters[idx];
}

export function requireNickname(
  message: Pick<IRCMessage, "ircPrefix">
): string {
  if (message.ircPrefix == null || message.ircPrefix.nickname == null) {
    throw new MissingDataError("Missing prefix or missing nickname in prefix");
  }

  return message.ircPrefix.nickname;
}
