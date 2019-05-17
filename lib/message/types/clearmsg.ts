import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../message';

export class ClearmsgMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

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

    public static get typeDescription(): MessageTypeDeclaration<ClearmsgMessage> {
        return {
            command: 'CLEARMSG',
            construct(ircMessage: IRCMessage): ClearmsgMessage {
                return new ClearmsgMessage(ircMessage);
            }
        };
    }
}
