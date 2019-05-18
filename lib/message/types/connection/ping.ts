import {IRCMessage, TwitchMessage} from '../../message';

export class PingMessage extends TwitchMessage {
    public constructor(public ircMessage: IRCMessage) {
        super();
    };

    public get argument(): string | null {
        let param = this.ircMessage.parameters[1];
        if (typeof param === 'undefined') {
            return null;
        }
        return param;
    }

    public static get command(): string {
        return 'PING';
    }
}
