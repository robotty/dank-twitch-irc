import * as Color from 'color';
import {Moment} from 'moment';
import {TwitchBadgesList} from '../badges';
import {TwitchEmoteList} from '../emotes';
import { IRCMessage } from '../irc';
import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';
import { parseEmotes } from '../parser';
import { UserState } from './userstate';

const actionRegex = /^\u0001ACTION (.*)\u0001$/;

export class PrivmsgMessage extends TwitchMessage implements ChannelMessage {
    public readonly message: string;
    public readonly action: boolean;

    public constructor(ircMessage: IRCMessage) {
        super(ircMessage);

        let match: RegExpExecArray | null = actionRegex.exec(ircMessage.trailingParameter);
        if (match == null) {
            this.action = false;
            this.message = ircMessage.trailingParameter;
        } else {
            this.action = true;
            this.message = match[1];
        }
    };

    public static get command(): string {
        return 'PRIVMSG';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get senderUsername(): string {
        return this.ircMessage.ircNickname;
    }

    public get badgeInfo(): string {
        return this.ircMessage.ircTags.getString('badge-info');
    }

    public get badges(): TwitchBadgesList {
        return this.ircMessage.ircTags.getBadges();
    }

    public get bits(): number | null {
        return this.ircMessage.ircTags.getInt('bits');
    }

    public get color(): Color {
        return this.ircMessage.ircTags.getColor();
    }

    public get displayName(): string {
        return this.ircMessage.ircTags.getString('display-name');
    }

    public get emotes(): TwitchEmoteList {
        // this.message is cleaned of \u0001ACTION \u001
        return parseEmotes(this.message, this.ircMessage.ircTags.getString('emotes'));
    }

    public get messageID(): string {
        return this.ircMessage.ircTags.getString('id');
    }

    public get isMod(): boolean {
        return this.ircMessage.ircTags.getBoolean('mod') ||
            this.badges.hasModerator;
    }

    public get channelID(): number {
        return this.ircMessage.ircTags.getInt('room-id');
    }

    public get serverTimestamp(): Moment {
        return this.ircMessage.ircTags.getTimestamp();
    }

    public get senderUserID(): number {
        return this.ircMessage.ircTags.getInt('user-id');
    }

    public extractUserState(): Partial<UserState> {
        return {
            badgeInfo: this.badgeInfo,
            badges: this.badges,
            color: this.color,
            displayName: this.displayName,
            isMod: this.isMod
        };
    }
}
