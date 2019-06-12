import { ReconnectMessage } from '../../message/twitch-types';
import { ConnectionError } from '../errors';
import { IClient } from '../interface';

export class ReconnectError extends ConnectionError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

export function handleReconnectMessage(client: IClient): void {
    client.subscribe('RECONNECT', (msg: ReconnectMessage) => {
        client.dispatchError(new ReconnectError('RECONNECT command received by server: ' + msg.rawSource));
    });
}
