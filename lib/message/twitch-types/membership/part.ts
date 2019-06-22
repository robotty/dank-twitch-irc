import {ChannelMessage} from '../../message';
import { TwitchMessage } from '../../twitch';

export class PartMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'PART';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get partedUsername(): string {
        return this.ircMessage.ircNickname;
    }
}
