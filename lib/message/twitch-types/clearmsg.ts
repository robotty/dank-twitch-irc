import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class ClearmsgMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'CLEARMSG';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get targetUsername(): string {
        return this.ircMessage.ircTags.getString('login');
    }

    public get targetMessageID(): string {
        return this.ircMessage.ircTags.getString('target-msg-id');
    }

    public get targetMessageContent(): string {
        return this.ircMessage.trailingParameter;
    }
}
