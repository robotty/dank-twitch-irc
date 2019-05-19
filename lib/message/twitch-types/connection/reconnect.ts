import { TwitchMessage } from '../../twitch';

export class ReconnectMessage extends TwitchMessage {
    public static get command(): string {
        return 'RECONNECT';
    }
}
