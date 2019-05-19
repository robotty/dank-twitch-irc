import { TwitchMessage } from '../../twitch';

export class PongMessage extends TwitchMessage {
    public get argument(): string | null {
        let param = this.ircMessage.ircParameters[1];
        if (typeof param === 'undefined') {
            return null;
        }
        return param;
    }

    public static get command(): string {
        return 'PONG';
    }
}
