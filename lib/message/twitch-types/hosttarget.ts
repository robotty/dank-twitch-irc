import { reasonForValue } from "../../utils/reason-for-value";
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { getParameter, IRCMessageData } from "../irc/irc-message";
import { ParseError } from "../parser/parse-error";

export function parseHostedChannelName(
  rawHostedChannelName: string | undefined
): string | undefined {
  if (rawHostedChannelName == null || rawHostedChannelName.length <= 0) {
    throw new ParseError(
      `Malformed channel part in HOSTTARGET message: ${reasonForValue(
        rawHostedChannelName
      )}`
    );
  }

  if (rawHostedChannelName === "-") {
    return undefined;
  } else {
    return rawHostedChannelName;
  }
}

export function parseViewerCount(
  rawViewerCount: string | undefined
): number | undefined {
  if (rawViewerCount == null || rawViewerCount.length <= 0) {
    throw new ParseError(
      `Malformed viewer count part in HOSTTARGET message: ${reasonForValue(
        rawViewerCount
      )}`
    );
  }

  if (rawViewerCount === "-") {
    return undefined;
  }

  const numberValue = parseInt(rawViewerCount);
  if (isNaN(numberValue)) {
    throw new ParseError(
      `Malformed viewer count part in HOSTTARGET message: ${reasonForValue(
        rawViewerCount
      )}`
    );
  }
  return numberValue;
}

export function parseHosttargetParameter(
  rawParameter: string
): {
  hostedChannelName: string | undefined;
  viewerCount: number | undefined;
} {
  const split = rawParameter.split(" ");
  if (split.length !== 2) {
    throw new ParseError(
      "HOSTTARGET accepts exactly 2 arguments in second parameter, " +
        `given: ${reasonForValue(rawParameter)}`
    );
  }

  const [rawHostedChannelName, rawViewerCount] = split;

  return {
    hostedChannelName: parseHostedChannelName(rawHostedChannelName),
    viewerCount: parseViewerCount(rawViewerCount)
  };
}

export class HosttargetMessage extends ChannelIRCMessage {
  /**
   * channel name if now hosting channel,
   *
   * null if host mode was exited.
   */
  public readonly hostedChannelName: string | undefined;

  /**
   * The viewer count of the enabled host.
   *
   * null if viewercount is unknown or host mode was exited.
   */
  public readonly viewerCount: number | undefined;

  public constructor(message: IRCMessageData) {
    super(message);

    const parsedSecondParameter = parseHosttargetParameter(
      getParameter(this, 1)
    );
    this.hostedChannelName = parsedSecondParameter.hostedChannelName;
    this.viewerCount = parsedSecondParameter.viewerCount;
  }

  public wasHostModeExited(): this is ExitHostModeHosttargetMessage {
    return this.hostedChannelName == null;
  }

  public wasHostModeEntered(): this is ExitedHostModeHosttargetMessage {
    return this.hostedChannelName != null;
  }
}

export interface ExitHostModeHosttargetMessage extends HosttargetMessage {
  readonly hostedChannelName: undefined;
  readonly viewerCount: undefined;
}

export interface ExitedHostModeHosttargetMessage extends HosttargetMessage {
  readonly hostedChannelName: string;
  readonly viewerCount: number | undefined;
}
