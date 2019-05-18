import {ChannelMessage, IRCMessage, TwitchMessage} from '../../message';

export class PartMessage extends TwitchMessage implements ChannelMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'PART';
    }

    public get channelName(): string {
        return this.ircMessage.channelName;
    }

    public get partedUsername(): string {
        return this.ircMessage.nickname;
    }
}
