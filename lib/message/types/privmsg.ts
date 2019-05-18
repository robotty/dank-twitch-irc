import {ChannelMessage, IRCMessage, TwitchMessage} from '../message';
import * as Color from 'color';
import {Moment} from 'moment';
import {TwitchBadgesList} from '../badges';
import {TwitchEmoteList} from '../emotes';

const actionRegex = /^\u0001ACTION (.*)\u0001$/;

export class PrivmsgMessage extends TwitchMessage implements ChannelMessage {
    public readonly message: string;
    public readonly action: boolean;

    public constructor(public ircMessage: IRCMessage) {
        super();

        let match: RegExpExecArray | null = actionRegex.exec(ircMessage.trailingParameter);
        if (match == null) {
            this.action = false;
            this.message = ircMessage.trailingParameter;
        } else {
            this.action = true;
            this.message = match.groups[1];
        }
    };

    public static get command(): string {
        return 'PRIVMSG';
    }

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

    public get emotes(): TwitchEmoteList {
        return this.ircMessage.tags.getEmotes();
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
}
