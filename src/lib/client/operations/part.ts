import { awaitResponse } from '../../await/await-response';
import { channelIs, commandIs, nicknameIs } from '../../await/conditions';
import { PartMessage} from '../../message/twitch-types';
import { validateChannelName } from '../../validation';
import { MessageError } from '../errors';
import { Client } from '../interface';

export class PartError extends MessageError {
    public failedChannelName: string;

    public constructor(message: string, cause: Error | undefined, failedChannelName: string) {
        super(message, cause);
        this.failedChannelName = failedChannelName;
    }
}

export async function awaitPartResponse(client: Client, channelName: string): Promise<PartMessage> {
    return awaitResponse(client, {
        // :justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv PART #pajlada
        success: channelIs(channelName).and(commandIs('PART')).and(nicknameIs(client.configuration.username)),
        errorType: (m, e) => new PartError(m, e, channelName),
        errorMessage: `Failed to part channel ${channelName}`
    }) as Promise<PartMessage>;
}

export async function partChannel(client: Client, channelName: string): Promise<PartMessage> {
    validateChannelName(channelName);
    client.send(`PART #${channelName}`);
    client.channels.delete(channelName);
    try {
        return awaitPartResponse(client, channelName);
    } catch (e) {
        client.channels.add(channelName);
        throw e;
    }
}
