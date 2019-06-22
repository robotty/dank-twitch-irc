import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class NoticeMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'NOTICE';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
    }

    public get messageID(): string {
        return this.ircMessage.ircTags.getString('msg-id');
    }
}
