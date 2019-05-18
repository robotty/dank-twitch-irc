import {IRCMessage, TwitchMessage} from '../../message';

export class ReconnectMessage extends TwitchMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public static get command(): string {
        return 'RECONNECT';
    }
}
