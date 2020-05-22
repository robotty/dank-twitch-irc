import { ChannelIRCMessage } from "../../irc/channel-irc-message";
import { IRCMessageData, requireNickname } from "../../irc/irc-message";

export class PartMessage extends ChannelIRCMessage {
  public readonly partedUsername: string;

  public constructor(message: IRCMessageData) {
    super(message);
    this.partedUsername = requireNickname(this);
  }
}
