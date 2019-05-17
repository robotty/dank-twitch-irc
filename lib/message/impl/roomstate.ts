import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../message';

export class RoomstateMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get isEmoteOnly(): boolean | null {
        return this.ircMessage.tags.getOptionalBoolean('emote-only');
    }

    public get isFollowersOnly(): boolean | null {
        let intValue = this.followersOnlyDuration;
        if (intValue === null) {
            return null;
        }

        return intValue < 0;
    }

    public get followersOnlyDuration(): number | null {
        return this.ircMessage.tags.getInt('followers-only');
    }

    public get isR9K(): boolean | null {
        return this.ircMessage.tags.getBoolean('r9k');
    }

    public get slowModeDuration(): number | null {
        return this.ircMessage.tags.getInt('slow');
    }

    public get isSubscribersOnly(): boolean | null {
        return this.ircMessage.tags.getBoolean('subs-only');
    }

    public static get typeDescription(): MessageTypeDeclaration<RoomstateMessage> {
        return {
            command: 'ROOMSTATE',
            construct(ircMessage: IRCMessage): RoomstateMessage {
                return new RoomstateMessage(ircMessage);
            }
        };
    }
}
