import {ChannelMessage, IRCMessage, TwitchMessage} from '../message';

export class ClearmsgMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'CLEARMSG';
    }

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get targetUsername(): string {
        return this.ircMessage.tags.getString('login');
    }

    public get targetMessageID(): string {
        return this.ircMessage.tags.getString('target-msg-id');
    }

    public get targetMessageContent(): string {
        return this.ircMessage.trailingParameter;
    }
}
