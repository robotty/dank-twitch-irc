import { TwitchMessage } from '../../twitch';

export class PingMessage extends TwitchMessage {
    public get argument(): string | null {
        let param = this.ircMessage.ircParameters[0];
        if (typeof param === 'undefined') {
            return null;
        }
        return param;
    }

    public static get command(): string {
        return 'PING';
    }
}
