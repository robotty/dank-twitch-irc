import {ChannelMessage, IRCMessage, MessageTypeDeclaration, TwitchBadgesList} from '../message';
import * as Color from 'color';
import {Moment} from 'moment';

export class UsernoticeMessage implements ChannelMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get senderUsername(): string {
        return this.ircMessage.tags.getString('login');
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

    public get message(): string {
        return this.ircMessage.tags.getString('message');
    }

    public get isMod(): boolean {
        return this.ircMessage.tags.getBoolean('mod') ||
            this.badges.hasModerator;
    }

    /** sub, resub, subgift, etc... */
    public get messageTypeID(): string {
        return this.ircMessage.tags.getString('msg-id');
    }

    public get channelID(): number {
        return this.ircMessage.tags.getInt('room-id');
    }

    public get systemMessage(): string {
        return this.ircMessage.tags.getString('system-msg');
    }

    public get serverTimestamp(): Moment {
        return this.ircMessage.tags.getTimestamp();
    }

    public get senderUserID(): number {
        return this.ircMessage.tags.getInt('user-id');
    }

    public static get typeDescription(): MessageTypeDeclaration<UsernoticeMessage> {
        return {
            command: 'USERNOTICE',
            construct(ircMessage: IRCMessage): UsernoticeMessage {
                return new UsernoticeMessage(ircMessage);
            }
        };
    }
}
