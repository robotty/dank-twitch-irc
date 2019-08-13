import {
  getParameter,
  IRCMessage,
  IRCMessageData
} from "../../irc/irc-message";
import { optionalData } from "../../parser/common";

export class PingMessage extends IRCMessage {
  public readonly argument: string | undefined;
  public constructor(message: IRCMessageData) {
    super(message);

    this.argument = optionalData(() => getParameter(this, 1));
  }
}
