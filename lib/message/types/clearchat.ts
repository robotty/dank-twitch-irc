import {ChannelMessage, IRCMessage, TwitchMessage} from '../message';

export class ClearchatMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    }

    public static get command(): string {
        return 'CLEARCHAT';
    }

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
    }

    public get senderUsername(): string {
        return this.ircMessage.nickname;
    }

    public get badgeInfo(): string {
        return this.ircMessage.tags.getString('badge-info');
    }

    /**
     * length in seconds (integer), null if permanent ban
     */
    public get banDuration(): number | null {
        return this.ircMessage.tags.getInt('ban-duration');
    }
}
