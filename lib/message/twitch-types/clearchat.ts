import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { getParameter, IRCMessageData } from "../irc/irc-message";
import { tagParserFor } from "../parser/tag-values";

export class ClearchatMessage extends ChannelIRCMessage {
  /**
   * The target username, undefined if this <code>CLEARCHAT</code> message clears
   * the entire chat.
   */
  public readonly targetUsername: string | undefined;

  /**
   * length in seconds (integer), undefined if permanent ban
   */
  public readonly banDuration: number | undefined;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.targetUsername = getParameter(this, 1);
    this.banDuration = tagParser.getInt("ban-duration");
  }

  public wasChatCleared(): this is ClearChatClearchatMessage {
    return this.targetUsername == null && this.banDuration == null;
  }

  public isTimeout(): this is TimeoutClearchatMessage {
    return this.targetUsername != null && this.banDuration != null;
  }

  public isPermaban(): this is PermabanClearchatMessage {
    return this.targetUsername != null && this.banDuration == null;
  }
}

export interface ClearChatClearchatMessage extends ClearchatMessage {
  targetUsername: undefined;
  banDuration: undefined;
}

export interface TimeoutClearchatMessage extends ClearchatMessage {
  targetUsername: string;
  banDuration: number;
}

export interface PermabanClearchatMessage extends ClearchatMessage {
  targetUsername: string;
  banDuration: undefined;
}
