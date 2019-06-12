import { awaitResponse } from '../../await';
import { channelIs, commandIs, noticesWithIDs } from '../../await';
import { RoomstateMessage } from '../../message/twitch-types';
import { hasAllStateTags, RoomState } from '../../message/twitch-types';
import { validateChannelName } from '../../validation';
import { MessageError } from '../errors';
import { Client } from '../interface';

export class JoinError extends MessageError {
    public failedChannelName: string;

    public constructor(message: string, cause: Error | undefined, failedChannelName: string) {
        super(message, cause);
        this.failedChannelName = failedChannelName;
    }
}

export async function awaitJoinResponse(client: Client, channelName: string): Promise<RoomState> {
    let response = await awaitResponse(client, {
        success: channelIs(channelName).and(commandIs('ROOMSTATE')),
        failure: channelIs(channelName).and(noticesWithIDs('msg_channel_suspended')),
        errorType: (m, e) => new JoinError(m, e, channelName),
        errorMessage: `Failed to join channel ${channelName}`
    }) as RoomstateMessage;

    if (!hasAllStateTags(response)) {
        throw new JoinError('Twitch server sent partial roomstate on channel join', undefined, channelName);
    }

    return response;
}

export async function joinChannel(client: Client, channelName: string): Promise<RoomState> {
    validateChannelName(channelName);
    client.send(`JOIN #${channelName}`);
    try {
        let response = awaitJoinResponse(client, channelName);
        client.channels.add(channelName);
        return response;
    } catch (e) {
        throw e;
    }
}
