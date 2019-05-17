import {Memoize} from 'typescript-memoize';
import * as Color from 'color';
import * as moment from 'moment';
import {Moment} from 'moment';

export class TwitchBadge {
    public name: string;
    public version: number;

    public constructor(name: string, version: number) {
        this.name = name;
        this.version = version;
    }

    public get isAdmin(): boolean {
        return this.name === 'admin';
    }

    public get isBits(): boolean {
        return this.name === 'bits';
    }

    public get isBroadcaster(): boolean {
        return this.name === 'broadcaster';
    }

    public get isGlobalMod(): boolean {
        return this.name === 'global_mod';
    }

    public get isModerator(): boolean {
        return this.name === 'moderator';
    }

    public get isSubscriber(): boolean {
        return this.name === 'subscriber';
    }

    public get isStaff(): boolean {
        return this.name === 'staff';
    }

    public get isTurbo(): boolean {
        return this.name === 'turbo';
    }
}

export class TwitchBadgesList extends Array<TwitchBadge> {
    public get hasAdmin(): boolean {
        return this.find(e => e.isAdmin) !== undefined;
    }

    public get hasBits(): boolean {
        return this.find(e => e.isBits) !== undefined;
    }

    public get hasBroadcaster(): boolean {
        return this.find(e => e.isBroadcaster) !== undefined;
    }

    public get hasGlobalMod(): boolean {
        return this.find(e => e.isGlobalMod) !== undefined;
    }

    public get hasModerator(): boolean {
        return this.find(e => e.isModerator) !== undefined;
    }

    public get hasSubscriber(): boolean {
        return this.find(e => e.isSubscriber) !== undefined;
    }

    public get hasStaff(): boolean {
        return this.find(e => e.isStaff) !== undefined;
    }

    public get hasTurbo(): boolean {
        return this.find(e => e.isTurbo) !== undefined;
    }
}

export class IRCMessageTags extends Map<string, string | null> {

    public constructor() {
        super();
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
        let badges = new TwitchBadgesList();
        for (let badgeSrc of this.get(key).split(',')) {
            let [badgeName, badgeVersionSrc] = badgeSrc.split('/', 1);
            if (typeof badgeName === 'undefined' || typeof badgeVersionSrc === 'undefined') {
                continue;
            }

            let badgeVersion = parseInt(badgeVersionSrc);
            if (isNaN(badgeVersion)) {
                continue;
            }

            badges.push(new TwitchBadge(badgeName, badgeVersion));
        }
        return badges;
    }

}

export class IRCMessage {

    public tags: IRCMessageTags;
    public nickname: string;
    public username: string;
    public hostname: string;
    public command: string;
    public parameters: string[];

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

}

export interface ChannelMessage {
    /**
     * channel that this message occurred in/was sent to
     */
    channelName: string;
}

export interface MessageTypeDeclaration<MsgType> {
    command: string;
    construct(ircMessage: IRCMessage): MsgType;
}

