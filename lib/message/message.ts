import {Memoize} from 'typescript-memoize';
import * as Color from 'color';
import * as moment from 'moment';
import {Moment} from 'moment';
import {TwitchBadgesList} from './badges';
import {TwitchEmoteList} from './emotes';
import {parseBadges, parseEmotes, parseMessage, parseTags} from './parser';

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

export class IRCMessage {

    public rawSource: string;
    private readonly tagsSrc: string | undefined;
    public nickname: string;
    public username: string;
    public hostname: string;
    public command: string;
    public get ircMessage(): IRCMessage {
        return this;
    }
    public parameters: string[];

    public constructor(rawSource: string, tagsSrc: string | undefined,
        nickname: string, username: string,
        hostname: string, command: string,
        parameters: string[]) {
        this.rawSource = rawSource;
        this.tagsSrc = tagsSrc;
        this.nickname = nickname;
        this.username = username;
        this.hostname = hostname;
        this.command = command;
        this.parameters = parameters;
    }

    @Memoize()
    public get tags(): IRCMessageTags {
        return parseTags(this.tagsSrc, this);
    }

    public get middleParameters(): string[] {
        return this.parameters.slice(0, this.parameters.length - 1);
    }

    /**
     * gets the last parameter (usually the trailing parameter)
     */
    public get trailingParameter(): string | null {
        return this.parameters[this.parameters.length - 1];
    }

    /**
     * get the channel name from the first parameter.
     *
     * Returns null if there is no first parameter.
     */
    public get channelName(): string | null {
        // slice away the #
        let param: string | undefined = this.parameters[0];
        if (typeof param === 'undefined') {
            return null;
        }
        return param.slice(1);
    }

    public static parse(messageSrc: string): IRCMessage | null {
        return parseMessage(messageSrc);
    }

}

export interface ChannelMessage {
    /**
     * channel that this message occurred in/was sent to
     */
    readonly channelName: string;
}

/** static interface of all TwitchMessage types */
export interface TwitchMessageStatic {
    readonly command: string;

    new(ircMessage: IRCMessage): TwitchMessage;
}

export abstract class TwitchMessage {
    abstract get ircMessage(): IRCMessage;

    public get command(): string {
        return this.ircMessage.command;
    }
}

import {
    ClearchatMessage,
    ClearmsgMessage,
    GlobaluserstateMessage,
    HosttargetMessage,
    JoinMessage,
    NoticeMessage,
    PartMessage,
    PrivmsgMessage,
    ReconnectMessage,
    RoomstateMessage,
    UsernoticeMessage,
    UserstateMessage,
    PingMessage,
    PongMessage
} from './types';

export let knownTypes: TwitchMessageStatic[] = [
    ClearchatMessage,
    ClearmsgMessage,
    GlobaluserstateMessage,
    HosttargetMessage,
    NoticeMessage,
    PrivmsgMessage,
    RoomstateMessage,
    UsernoticeMessage,
    UserstateMessage,
    JoinMessage,
    PartMessage,
    ReconnectMessage,
    PingMessage,
    PongMessage
];

export let commandClassMap: Map<string, TwitchMessageStatic> = new Map<string, TwitchMessageStatic>();
export function refreshCommandClassMap(): void {
    commandClassMap.clear();
    for (let knownType of knownTypes) {
        commandClassMap.set(knownType.command, knownType);
    }
}

refreshCommandClassMap();

export function toTwitchMessage(ircMessage: IRCMessage): TwitchMessage | null {
    let prototype: TwitchMessageStatic = commandClassMap.get(ircMessage.command);
    if (typeof prototype === 'undefined') {
        return null;
    }

    return new prototype(ircMessage);
}
