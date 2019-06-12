import { PingMessage } from '../../message/twitch-types';
import { IClient } from '../interface';

export function replyToServerPing(client: IClient): void {
    client.subscribe('PING', (msg: PingMessage) => {
        if (msg.argument == null) {
            client.send('PONG');
        } else {
            client.send(`PONG :${msg.argument}`);
        }
    });
}
