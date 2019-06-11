import { Result } from 'neverthrow/dist';
import { RoomState } from '../../message/twitch-types/roomstate';
import { promiseToResult, splitIntoChunks } from '../../utils';
import { validateChannelName } from '../../validation';
import { Client } from '../interface';
import { awaitJoinResponse } from './join';

export async function joinAll(client: Client,
                              channelNames: string[]): Promise<Record<string, Result<RoomState, Error>>> {
    channelNames.forEach(validateChannelName);

    // e.g. "JOIN #firstchannel,#secondchannel,#thirdchannel"
    // joining channels this way is much faster than sending individual JOIN commands
    // the twitch server cuts off messages at 4096 characters so we produce chunks of that size

    let results: Record<string, Result<RoomState, Error>> = {};

    let channelChunks = splitIntoChunks(channelNames.map(e => `#${e}`), ',', 4096);
    for (let chunk of channelChunks) {
        client.send(`JOIN ${chunk.join(',')}`);

        let chunkNames = chunk.map(s => s.slice(1));

        // we await the joining of all channels of this chunk in parallel
        let promises: Promise<void>[] = [];
        for (let channelName of chunkNames) {
            promises.push((async () => {
                results[channelName] = await promiseToResult(awaitJoinResponse(client, channelName));
            })());
        }
        await Promise.all(promises);
    }

    for (let [channelName, result] of Object.entries(results)) {
        if (result.isOk) {
            client.channels.add(channelName);
        }
    }

    return results;
}
