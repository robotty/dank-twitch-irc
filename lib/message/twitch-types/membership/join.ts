import { ChannelMessage } from '../../message';
import { TwitchMessage } from '../../twitch';

export class JoinMessage extends TwitchMessage implements ChannelMessage {
    public static get command(): string {
        return 'JOIN';
    }

    public get channelName(): string {
        return this.ircMessage.ircChannelName;
    }

    public get joinedUsername(): string {
        return this.ircMessage.ircNickname;
    }
}
