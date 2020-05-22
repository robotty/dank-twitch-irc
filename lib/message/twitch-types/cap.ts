import {
  IRCMessage,
  IRCMessageData,
  requireParameter,
} from "../irc/irc-message";

// https://ircv3.net/specs/core/capability-negotiation.html

// example messages:
// :tmi.twitch.tv CAP * LS :twitch.tv/commands twitch.tv/tags twitch.tv/membership
// :tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags twitch.tv/membership
// :tmi.twitch.tv CAP * NAK :twitch.tv/invalid

export class CapMessage extends IRCMessage {
  public readonly subCommand: string;
  public readonly capabilities: string[];
  public constructor(message: IRCMessageData) {
    super(message);
    // ignore the first parameter (the '*') since twitch doesn't ever send anything but a '*' in that slot
    this.subCommand = requireParameter(this, 1);
    this.capabilities = requireParameter(this, 2).split(" ");
  }
}
