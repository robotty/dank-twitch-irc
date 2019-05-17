import {ChannelMessage, IRCMessage, MessageTypeDeclaration, TwitchBadgesList} from '../message';
import * as Color from 'color';
import {Moment} from 'moment';

export class PrivmsgMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get senderUsername(): string {
        return this.ircMessage.nickname;
    }

    public get badgeInfo(): string {
        return this.ircMessage.tags.getString('badge-info');
    }

    public get badges(): TwitchBadgesList {
        return this.ircMessage.tags.getBadges();
    }

    public get bits(): number | null {
        return this.ircMessage.tags.getInt('bits');
    }

    public get color(): Color {
        return this.ircMessage.tags.getColor();
    }

    public get displayName(): string {
        return this.ircMessage.tags.getString('display-name');
    }

    // TODO parse
    public get emotes(): string {
        return this.ircMessage.tags.getString('emotes');
    }

    public get messageID(): string {
        return this.ircMessage.tags.getString('id');
    }

    public get isMod(): boolean {
        return this.ircMessage.tags.getBoolean('mod') ||
            this.badges.hasModerator;
    }

    public get channelID(): number {
        return this.ircMessage.tags.getInt('room-id');
    }

    public get serverTimestamp(): Moment {
        return this.ircMessage.tags.getTimestamp();
    }

    public get senderUserID(): number {
        return this.ircMessage.tags.getInt('user-id');
    }

    public static get typeDescription(): MessageTypeDeclaration<PrivmsgMessage> {
        return {
            command: 'PRIVMSG',
            construct(ircMessage: IRCMessage): PrivmsgMessage {
                return new PrivmsgMessage(ircMessage);
            }
        };
    }
}
