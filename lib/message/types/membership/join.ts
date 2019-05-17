import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../../message';

export class JoinMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get joinedUsername(): string {
        return this.ircMessage.nickname;
    }

    public static get typeDescription(): MessageTypeDeclaration<JoinMessage> {
        return {
            command: 'JOIN',
            construct(ircMessage: IRCMessage): JoinMessage {
                return new JoinMessage(ircMessage);
            }
        };
    }
}
