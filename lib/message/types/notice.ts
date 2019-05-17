import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../message';

export class NoticeMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
    }

    public get messageID(): string {
        return this.ircMessage.tags.getString('msg-id');
    }

    public static get typeDescription(): MessageTypeDeclaration<NoticeMessage> {
        return {
            command: 'NOTICE',
            construct(ircMessage: IRCMessage): NoticeMessage {
                return new NoticeMessage(ircMessage);
            }
        };
    }
}
