import { TwitchEmote, TwitchEmoteList } from '../emotes';
import { parseIntThrowing } from './common';
import { ParseError } from './parse-error';

export function parseEmotes(messageText: string, emotesSrc: string): TwitchEmoteList {
    let emotes = new TwitchEmoteList();

    for (let emoteInstancesSrc of emotesSrc.split('/')) {
        let [emoteIDSrc, instancesSrc] = emoteInstancesSrc.split(':', 2);
        let emoteID = parseIntThrowing(emoteIDSrc);
        for (let instanceSrc of instancesSrc.split(',')) {
            let [startIndex, endIndex] = instanceSrc.split('-').map(parseIntThrowing);
            if (endIndex == null) {
                throw new ParseError('No - found in emote index range', instanceSrc);
            }

            // to make endIndex exclusive
            endIndex += 1;
            let emoteText = messageText.slice(startIndex, endIndex);

            emotes.push(new TwitchEmote(emoteID, startIndex, endIndex, emoteText));
        }
    }
    return emotes;
}
