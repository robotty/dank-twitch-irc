import {IRCMessage, TwitchMessage} from '../message';
import * as Color from 'color';
import {TwitchBadgesList} from '../badges';

export class GlobaluserstateMessage extends TwitchMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'GLOBALUSERSTATE';
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
    public get emoteSets(): string {
        return this.ircMessage.tags.getString('emote-sets');
    }

    public get userID(): number {
        return this.ircMessage.tags.getInt('user-id');
    }
}
