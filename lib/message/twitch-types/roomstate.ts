import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';
import { ParseError } from '../parser';
import { BaseError } from 'make-error-cause';

function optional<T>(func: () => T): T | undefined {
    try {
        return func();
    } catch (e) {
        if (e instanceof ParseError) {
            return undefined;
        } else {
            throw new BaseError('Error fetching optional value', e);
        }
    }
}

export interface RoomState {
    emoteOnly: boolean;
    /**
     * followers-only duration in minutes
     */
    followersOnlyDuration: number;
    r9k: boolean;
    slowModeDuration: number;
    subscribersOnly: boolean;
}

export function hasAllStateTags(obj: Partial<RoomState>): obj is RoomState {
    return obj.emoteOnly != null &&
        obj.followersOnlyDuration != null &&
        obj.r9k != null &&
        obj.slowModeDuration != null &&
        obj.subscribersOnly != null;
}

export class RoomstateMessage extends TwitchMessage implements ChannelMessage, Partial<RoomState> {
    public static get command(): string {
        return 'ROOMSTATE';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get emoteOnly(): boolean | undefined {
        return optional(() => this.ircMessage.ircTags.getBoolean('emote-only'));
    }

    public get followersOnlyDuration(): number | undefined {
        return optional(() => this.ircMessage.ircTags.getInt('followers-only'));
    }

    public get r9k(): boolean | undefined {
        return optional(() => this.ircMessage.ircTags.getBoolean('r9k'));
    }

    public get slowModeDuration(): number | undefined {
        return optional(() => this.ircMessage.ircTags.getInt('slow'));
    }

    public get subscribersOnly(): boolean | undefined {
        return optional(() => this.ircMessage.ircTags.getBoolean('subs-only'));
    }

    public extractRoomState(): Partial<RoomState> {
        return {
            emoteOnly: this.emoteOnly,
            followersOnlyDuration: this.followersOnlyDuration,
            r9k: this.r9k,
            slowModeDuration: this.slowModeDuration,
            subscribersOnly: this.subscribersOnly
        };
    }

}
