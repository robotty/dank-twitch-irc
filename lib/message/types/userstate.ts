import {ChannelMessage, IRCMessage, TwitchMessage} from '../message';
import * as Color from 'color';
import {TwitchBadgesList} from '../badges';

export class UserstateMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'USERSTATE';
    }

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
}
