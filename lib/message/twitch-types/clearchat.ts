import { optionalTag } from '../irc';
import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class ClearchatMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'CLEARCHAT';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    /**
     * The target username, undefined if this <code>CLEARCHAT</code> message clears
     * the entire chat.
     */
    public get targetUsername(): string | undefined {
        return optionalTag(() => this.ircMessage.trailingParameter);
    }

    /**
     * length in seconds (integer), undefined if permanent ban
     */
    public get banDuration(): number | undefined {
        return optionalTag(() => this.ircMessage.ircTags.getInt('ban-duration'));
    }

    public isChatCleared(): this is ClearChatClearchatMessage {
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
