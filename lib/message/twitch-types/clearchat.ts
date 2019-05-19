import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class ClearchatMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'CLEARCHAT';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get message(): string {
        return this.ircMessage.trailingParameter;
    }

    public get senderUsername(): string {
        return this.ircMessage.ircNickname;
    }

    public get badgeInfo(): string {
        return this.ircMessage.ircTags.getString('badge-info');
    }

    /**
     * length in seconds (integer), null if permanent ban
     */
    public get banDuration(): number | null {
        return this.ircMessage.ircTags.getInt('ban-duration');
    }
}
