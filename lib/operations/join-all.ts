import { SingleConnection } from "../client/connection";
import { MAX_OUTGOING_COMMAND_LENGTH } from "../constants";
import { splitIntoChunks } from "../utils/split-into-chunks";
import { awaitJoinResponse } from "./join";

export async function joinAll(
  conn: SingleConnection,
  channelNames: string[]
): Promise<Record<string, Error | undefined>> {
  // e.g. "JOIN #firstchannel,#secondchannel,#thirdchannel"
  // joining channels this way is much faster than sending individual JOIN commands
  // the twitch server cuts off messages at 4096 characters so we produce chunks of that size
  channelNames.forEach((channelName) => conn.wantedChannels.add(channelName));

  const channelChunks = splitIntoChunks(
    channelNames.map((e) => `#${e}`),
    ",",
    MAX_OUTGOING_COMMAND_LENGTH - "JOIN ".length
  );

  const resultsMap: Record<string, Error | undefined> = {};

  for (const chunk of channelChunks) {
    conn.sendRaw(`JOIN ${chunk.join(",")}`);

    const chunkNames = chunk.map((s) => s.slice(1));
    const chunkPromises: Promise<any>[] = [];

    // we await the joining of all channels of this chunk in parallel
    for (const channelName of chunkNames) {
      chunkPromises.push(
        awaitJoinResponse(conn, channelName).then(
          () => {
            // on success
            conn.joinedChannels.add(channelName);
            resultsMap[channelName] = undefined;
          },
          (error) => {
            // on failure
            resultsMap[channelName] = error;
          }
        )
      );
    }

    await Promise.all(chunkPromises);
  }

  return resultsMap;
}
