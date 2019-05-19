import * as Color from 'color';
import {TwitchBadgesList} from '../badges';
import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class UserstateMessage extends TwitchMessage implements ChannelMessage {

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

    // TODO parse
    public get emoteSets(): string {
        return this.ircMessage.ircTags.getString('emote-sets');
    }

    public get displayName(): string {
        return this.ircMessage.ircTags.getString('display-name');
    }

    public get isMod(): boolean {
        return this.ircMessage.ircTags.getBoolean('mod') ||
            this.badges.hasModerator;
    }
}
