import * as Color from 'color';
import {TwitchBadgesList} from '../badges';
import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

/**
 * State of a user in a channel.
 */
export interface UserState {
    badgeInfo: string;
    badges: TwitchBadgesList;
    color: Color;
    displayName: string;
    emoteSets: string;
    isMod: boolean;
}

export class UserstateMessage extends TwitchMessage implements ChannelMessage, UserState {
    public static get command(): string {
        return 'USERSTATE';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get badgeInfo(): string {
        return this.ircMessage.ircTags.getString('badge-info');
    }

    public get badges(): TwitchBadgesList {
        return this.ircMessage.ircTags.getBadges();
    }

    public get color(): Color {
        return this.ircMessage.ircTags.getColor();
    }

    public get displayName(): string {
        return this.ircMessage.ircTags.getString('display-name');
    }

    // TODO parse
    public get emoteSets(): string {
        return this.ircMessage.ircTags.getString('emote-sets');
    }

    public get isMod(): boolean {
        return this.ircMessage.ircTags.getBoolean('mod') ||
            this.badges.hasModerator;
    }

    public extractUserState(): UserState {
        return {
            badgeInfo: this.badgeInfo,
            badges: this.badges,
            color: this.color,
            displayName: this.displayName,
            emoteSets: this.emoteSets,
            isMod: this.isMod
        };
    }
}
