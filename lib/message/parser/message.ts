import {IRCMessage} from '../message';

const ircParseRegex = /^(?:@([^ ]+) )?(?::((?:(?:([^\s!@]+)(?:!([^\s@]+))?)@)?(\S+)) )?((?:[a-zA-Z]+)|(?:[0-9]{3}))(?: ([^:].*?))?(?: :(.*))?$/;

export function parseMessage(messageSrc: string): IRCMessage | null {
    // Parse the complete line, removing any carriage returns
    let matches = ircParseRegex.exec(messageSrc);
    if (!matches) {
        // The line was not parsed correctly, must be malformed
        return null;
    }

    // Nick will be in the prefix slot if a full user mask is not used
    let nickname = matches[3] || matches[2];
    let username = matches[4] || '';
    let hostname = matches[5] || '';
    let command = matches[6];
    let parameters = matches[7] ? matches[7].split(/ +/) : [];

    // Add the trailing param to the params list
    if (typeof matches[8] !== 'undefined') {
        parameters.push(matches[8]);
    }

    return new IRCMessage(messageSrc, matches[1], nickname, username, hostname, command, parameters);
}
