import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class RoomstateMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'ROOMSTATE';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get isEmoteOnly(): boolean | null {
        return this.ircMessage.ircTags.getOptionalBoolean('emote-only');
    }

    public get isFollowersOnly(): boolean | null {
        let intValue = this.followersOnlyDuration;
        if (intValue === null) {
            return null;
        }

        return intValue < 0;
    }

    public get followersOnlyDuration(): number | null {
        return this.ircMessage.ircTags.getInt('followers-only');
    }

    public get isR9K(): boolean | null {
        return this.ircMessage.ircTags.getBoolean('r9k');
    }

    public get slowModeDuration(): number | null {
        return this.ircMessage.ircTags.getInt('slow');
    }

    public get isSubscribersOnly(): boolean | null {
        return this.ircMessage.ircTags.getBoolean('subs-only');
    }
}
