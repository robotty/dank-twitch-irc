import {IRCMessage, MessageTypeDeclaration, TwitchBadgesList} from '../message';
import * as Color from 'color';

export class GlobaluserstateMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

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

    public static get typeDescription(): MessageTypeDeclaration<GlobaluserstateMessage> {
        return {
            command: 'GLOBALUSERSTATE',
            construct(ircMessage: IRCMessage): GlobaluserstateMessage {
                return new GlobaluserstateMessage(ircMessage);
            }
        };
    }
}
