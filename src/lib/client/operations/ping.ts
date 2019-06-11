import { awaitResponse } from '../../await/await-response';
import { fluid, FluidCondition } from '../../await/conditions';
import { PongMessage } from '../../message/twitch-types';
import { ConnectionError } from '../errors';
import * as randomstring from 'randomstring';
import { Client } from '../interface';

export class PingTimeoutError extends ConnectionError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

function randomPingIdentifier(): string {
    let randomHexString = randomstring.generate({
        charset: 'hex',
        length: 32,
        capitalization: 'lowercase'
    });
    return `dank-twitch-irc:manual:${randomHexString}`;
}

export function isPongTo(sentPingIdentifier: string): FluidCondition {
    return fluid(e => e instanceof PongMessage && (e as PongMessage).argument === sentPingIdentifier);
}

export async function sendPing(client: Client,
                               pingIdentifier: string = randomPingIdentifier(),
                               timeout: number = 2000): Promise<PongMessage> {
    client.send(`PING :${pingIdentifier}`);

    return awaitResponse(client, {
        success: isPongTo(pingIdentifier),
        timeout: timeout,
        errorType: (message, cause) => new PingTimeoutError(message, cause),
        errorMessage: 'Server did not PONG back',
        timeoutMinimumState: 'connected'
    }) as Promise<PongMessage>;
}
