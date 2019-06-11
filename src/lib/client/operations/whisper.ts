import { awaitResponse } from '../../await/await-response';
import { channelIs, noticesWithIDs } from '../../await/conditions';
import { validateChannelName } from '../../validation';
import { MessageError } from '../errors';
import { Client } from '../interface';

export class WhisperError extends MessageError {
    public targetUsername: string;
    public failedMessage: string;

    public constructor(message: string, cause: Error | undefined, targetUsername: string, failedMessage: string) {
        super(message, cause);
        this.targetUsername = targetUsername;
        this.failedMessage = failedMessage;
    }
}

const badNoticeIDs = [
    'whisper_banned', // You have been banned from sending whispers.
    'whisper_banned_recipient', // That user has been banned from receiving whispers.
    'whisper_invalid_args', // Usage: <login> <message>
    'whisper_invalid_login', // No user matching that login.
    'whisper_invalid_self', // You cannot whisper to yourself.
    'whisper_limit_per_min', // You are sending whispers too fast. Try again in a minute.
    'whisper_limit_per_sec', // You are sending whispers too fast. Try again in a second.
    'whisper_restricted', // Your settings prevent you from sending this whisper.
    'whisper_restricted_recipient' // That user's settings prevent them from receiving this whisper.
];

export async function whisper(client: Client, username: string, message: string): Promise<void> {
    validateChannelName(username);
    client.privmsg(client.configuration.username, `/w ${username} ${message}`);

    return awaitResponse(client, {
        failure: channelIs(client.configuration.username).and(noticesWithIDs(...badNoticeIDs)),
        timeoutAction: 'success',
        timeout: 1000,
        errorType: (message, cause) => new WhisperError(message, cause, username, message),
        errorMessage: `Failed to whisper [${username}]: ${message}`
    }) as unknown as Promise<void>;
}
