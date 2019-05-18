import {ChannelMessage, IRCMessage, TwitchMessage} from '../message';

export class NoticeMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'NOTICE';
    }

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
    }

    public get messageID(): string {
        return this.ircMessage.tags.getString('msg-id');
    }
}
