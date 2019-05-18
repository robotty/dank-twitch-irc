import {ChannelMessage, IRCMessage, TwitchMessage} from '../../message';

export class JoinMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'JOIN';
    }

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get joinedUsername(): string {
        return this.ircMessage.nickname;
    }
}
