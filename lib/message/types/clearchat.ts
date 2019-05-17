import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../message';

export class ClearchatMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

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

    public static get typeDescription(): MessageTypeDeclaration<ClearchatMessage> {
        return {
            command: 'CLEARCHAT',
            construct(ircMessage: IRCMessage): ClearchatMessage {
                return new ClearchatMessage(ircMessage);
            }
        };
    }
}
