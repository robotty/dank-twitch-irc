import * as Color from 'color';
import { TwitchBadgesList } from '../badges';
import { TwitchEmoteList } from '../emotes';
import { IRCMessage } from '../irc';
import { TwitchMessage } from '../twitch';
import { parseEmotes } from '../parser';

// @badges=;color=#1E90FF;display-name=BotFactory;emotes=;message-id=6134;thread-id=40286300_403015524;turbo=0;user-id=403015524;user-type= :botfactory!botfactory@botfactory.tmi.twitch.tv WHISPER randers :Pong
export class WhisperMessage extends TwitchMessage {
    public constructor(ircMessage: IRCMessage) {
        super(ircMessage);
    };

    public static get command(): string {
        return 'WHISPER';
    }

    public get senderUsername(): string {
        return this.ircMessage.ircNickname;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
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

    public get emotes(): TwitchEmoteList {
        // this.message is cleaned of \u0001ACTION \u001
        return parseEmotes(this.message, this.ircMessage.ircTags.getString('emotes'));
    }

    public get messageID(): string {
        return this.ircMessage.ircTags.getString('message-id');
    }

    public get threadID(): string {
        return this.ircMessage.ircTags.getString('thread-id');
    }

    public get senderUserID(): number {
        return this.ircMessage.ircTags.getInt('user-id');
    }
}
