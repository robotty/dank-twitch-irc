import { TwitchMessage } from '../twitch';
import { ChannelMessage } from '../message';

export class HosttargetMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'HOSTTARGET';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    /**
     * channel name if now hosting channel,
     *
     * null if host mode was exited.
     */
    public get hostedChannelName(): string | null {
        let stringValue = this.ircMessage.trailingParameter.split(' ')[0];
        if (stringValue === '-' || stringValue.length === 0) {
            return null;
        }
        return stringValue;
    }

    /**
     * Returns the viewer count of the enabled host.
     *
     * null if viewercount is unknown or host mode was exited.
     */
    public get viewerCount(): number | null {
        let numberValue = parseInt(this.ircMessage.trailingParameter.split(' ')[1]);
        if (isNaN(numberValue)) {
            return null;
        }
        return numberValue;
    }
}
