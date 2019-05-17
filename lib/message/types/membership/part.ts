import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../../message';

export class PartMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get partedUsername(): string {
        return this.ircMessage.nickname;
    }

    public static get typeDescription(): MessageTypeDeclaration<PartMessage> {
        return {
            command: 'PART',
            construct(ircMessage: IRCMessage): PartMessage {
                return new PartMessage(ircMessage);
            }
        };
    }
}
