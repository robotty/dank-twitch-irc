import { Memoize } from 'typescript-memoize';
import { parseBadges, parseEmotes, parseMessage, parseTags } from './parser';
import { Message } from './message';
import { Moment } from 'moment';
import { TwitchBadgesList } from './badges';
import { TwitchEmoteList } from './emotes';
import * as moment from 'moment';
import * as Color from 'color';

export class IRCMessageTags extends Map<string, string | null> {

    private readonly ircMessage: IRCMessage;

    public constructor(ircMessage: IRCMessage) {
        super();
        this.ircMessage = ircMessage;
    }

    public getString(key: string): string | undefined {
        return this.get(key);
    }

    /**
     * Returns true if and only if the string at the given key is '1'.
     * A non-mapped key will return false.
     * @param key Tag key name
     */
    public getBoolean(key: string): boolean {
        return this.get(key) === '1';
    }

    public getOptionalBoolean(key: string): boolean | null {
        let strValue = this.get(key);
        if (typeof strValue !== 'string') {
            return null;
        }
        return strValue === '1';
    }

    public getInt(key: string): number | null {
        let number = parseInt(this.get(key));
        if (isNaN(number)) {
            return null;
        }
        return number;
    }

    public getColor(key: string = 'color'): Color {
        return Color(this.get(key));
    }

    public getTimestamp(key: string = 'tmi-sent-ts'): Moment {
        return moment(this.getInt(key));
    }

    @Memoize()
    public getBadges(key: string = 'badges'): TwitchBadgesList {
        return parseBadges(this.getString(key));
    }

    @Memoize()
    public getEmotes(key: string = 'emotes'): TwitchEmoteList {
        return parseEmotes(this.getString(key), this.ircMessage);
    }

}

export class IRCMessage implements Message {
    public rawSource: string;
    public ircNickname: string;
    public ircUsername: string;
    public ircHostname: string;
    public ircCommand: string;
    public ircParameters: string[];
    public tagsSrc: string | undefined;

    @Memoize()
    public get ircTags(): IRCMessageTags {
        return parseTags(this.tagsSrc, this);
    }

    public get trailingParameter(): string | undefined {
        return this.ircParameters[this.ircParameters.length - 1];
    }

    public get ircChannelName(): string | null {
        let param: string | undefined = this.ircParameters[0];
        if (param == null) {
            return undefined;
        }
        // slice away the #
        return param.slice(1);
    }

    public static parse(messageSrc: string): IRCMessage | null {
        return parseMessage(messageSrc);
    }

}
