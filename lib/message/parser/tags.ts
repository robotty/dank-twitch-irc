import {IRCMessage, IRCMessageTags} from '../message';

const decodeMap: { [key: string]: string } = {
    '\\\\': '\\',
    '\\:':  ';',
    '\\s':  ' ',
    '\\n':  '\n',
    '\\r':  '\r',
    '\\': '', // remove invalid backslashes
};

const decodeLookupRegex = /\\\\|\\:|\\s|\\n|\\r|\\/g;

// if value is undefined (no = in tagSrc) then value becomes null
function decodeValue(value: string | undefined): string | null {
    if (typeof value === 'undefined') {
        return null;
    }
    return value.replace(decodeLookupRegex, m => decodeMap[m] || '');
}

export function parseTags(tagsSrc: string | undefined, ircMessage: IRCMessage): IRCMessageTags {
    let tags = new IRCMessageTags(ircMessage);

    if (typeof tagsSrc === 'undefined') {
        return tags;
    }

    for (let tagSrc of tagsSrc.split(';')) {
        let [key, value] = tagSrc.split('=', 2);
        key = key.toLowerCase();
        value = decodeValue(value);

        tags.set(key, value);
    }

    return tags;
}
