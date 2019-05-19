import {TwitchEmote, TwitchEmoteList} from '../emotes';
import { IRCMessage } from '../irc';

export function parseEmotes(emotesSrc: string, ircMessage: IRCMessage): TwitchEmoteList {
    let emotes = new TwitchEmoteList();

    let cleanedMessageText = ircMessage.trailingParameter.replace(/^\u0001ACTION |\u0001$/g, '');

    for (let emoteInstancesSrc of emotesSrc.split('/')) {
        let [emoteIDSrc, instancesSrc] = emoteInstancesSrc.split(':', 2);
        let emoteID = parseInt(emoteIDSrc);
        for (let instanceSrc of instancesSrc.split(',')) {
            let [startIndex, endIndex] = instanceSrc.split('-').map(parseInt);
            // to make endIndex exclusive
            endIndex += 1;
            let emoteText = cleanedMessageText.slice(startIndex, endIndex);

            emotes.push(new TwitchEmote(emoteID, startIndex, endIndex, emoteText));
        }
    }
    return emotes;
}
