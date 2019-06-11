import { PingMessage } from '../../message/twitch-types';
import { Client } from '../interface';

export function replyToServerPing(client: Client): void {
    client.subscribe('PING', (msg: PingMessage) => {
        if (msg.argument == null) {
            client.send('PONG');
        } else {
            client.send(`PONG :${msg.argument}`);
        }
    });
}
