import { IRCMessageTags } from '../irc';

const decodeMap: { [key: string]: string } = {
    '\\\\': '\\',
    '\\:': ';',
    '\\s': ' ',
    '\\n': '\n',
    '\\r': '\r',
    '\\': '', // remove invalid backslashes
};

const decodeLookupRegex = /\\\\|\\:|\\s|\\n|\\r|\\/g;

// if value is undefined (no = in tagSrc) then value becomes null
function decodeValue(value: string | undefined): string | null {
    if (value == null) {
        return null;
    }
    return value.replace(decodeLookupRegex, m => decodeMap[m] || '');
}

export function parseTags(tagsSrc: string | undefined): IRCMessageTags {
    let tags = new IRCMessageTags();

    if (tagsSrc == null) {
        return tags;
    }

    for (let tagSrc of tagsSrc.split(';')) {
        let key: string;
        let valueSrc: string | undefined;
        [key, valueSrc] = tagSrc.split('=', 2);
        key = key.toLowerCase();
        let value = decodeValue(valueSrc);

        tags.set(key, value);
    }

    return tags;
}
