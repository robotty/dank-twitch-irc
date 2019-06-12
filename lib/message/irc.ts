import { Memoize } from 'typescript-memoize';
import { parseBadges, parseEmotes, ParseError, parseMessage } from './parser';
import { Message } from './message';
import { Moment } from 'moment';
import { TwitchBadgesList } from './badges';
import { TwitchEmoteList } from './emotes';
import * as moment from 'moment';
import * as Color from 'color';

export class IRCMessageTags extends Map<string, string | null> {

    public constructor() {
        super();
    }

    public getString(key: string): string {
        let value = this.get(key);
        if (value == null) {
            throw new ParseError('Required tag not present: ' + key);
        }
        return value;
    }

    public getInt(key: string): number {
        let str = this.getString(key);
        let number = parseInt(str);
        if (isNaN(number)) {
            throw new ParseError('Invalid tag value for integer:', str);
        }

        return number;
    }

    public getBoolean(key: string): boolean {
        return Boolean(this.getInt(key));
    }

    public getColor(key: string = 'color'): Color {
        let str = this.getString(key);
        try {
            return Color(str);
        } catch (e) {
            throw new ParseError('Failed to parse color', str, e);
        }
    }

    public getTimestamp(key: string = 'tmi-sent-ts'): Moment {
        return moment.utc(this.getInt(key));
    }

    @Memoize()
    public getBadges(key: string = 'badges'): TwitchBadgesList {
        return parseBadges(this.getString(key));
    }

    @Memoize()
    public getEmotes(messageText: string, key: string = 'emotes'): TwitchEmoteList {
        return parseEmotes(messageText, this.getString(key));
    }

}

export class IRCMessage implements Message {
    public rawSource: string;
    public ircNickname: string;
    public ircUsername: string;
    public ircHostname: string;
    public ircCommand: string;
    public ircParameters: string[];
    public ircTags: IRCMessageTags;

    public constructor(rawSource: string, ircNickname: string, ircUsername: string,
                       ircHostname: string, ircCommand: string, ircParameters: string[],
                       ircTags: IRCMessageTags) {
        this.rawSource = rawSource;
        this.ircNickname = ircNickname;
        this.ircUsername = ircUsername;
        this.ircHostname = ircHostname;
        this.ircCommand = ircCommand;
        this.ircParameters = ircParameters;
        this.ircTags = ircTags;
    }

    public get trailingParameter(): string {
        let string = this.ircParameters[this.ircParameters.length - 1];
        if (string == null) {
            throw new ParseError('Trailing parameter missing');
        }
        return string;
    }

    public get ircChannelName(): string {
        let param: string | undefined = this.ircParameters[0];
        if (param == null) {
            throw new ParseError('First parameter missing');
        }
        // slice away the #
        return param.slice(1);
    }

    public static parse(messageSrc: string): IRCMessage {
        return parseMessage(messageSrc);
    }

}
