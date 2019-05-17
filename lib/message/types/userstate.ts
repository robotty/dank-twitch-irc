import {ChannelMessage, IRCMessage, MessageTypeDeclaration} from '../message';
import * as Color from 'color';
import {TwitchBadgesList} from '../badges';

export class UserstateMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get badgeInfo(): string {
        return this.ircMessage.tags.getString('badge-info');
    }

    public get badges(): TwitchBadgesList {
        return this.ircMessage.tags.getBadges();
    }

    public get color(): Color {
        return this.ircMessage.tags.getColor();
    }

    // TODO parse
    public get emoteSets(): string {
        return this.ircMessage.tags.getString('emote-sets');
    }

    public get displayName(): string {
        return this.ircMessage.tags.getString('display-name');
    }

    public get isMod(): boolean {
        return this.ircMessage.tags.getBoolean('mod') ||
            this.badges.hasModerator;
    }

    public static get typeDescription(): MessageTypeDeclaration<UserstateMessage> {
        return {
            command: 'USERSTATE',
            construct(ircMessage: IRCMessage): UserstateMessage {
                return new UserstateMessage(ircMessage);
            }
        };
    }
}
