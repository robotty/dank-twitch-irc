import { IRCMessage } from '../irc';

const ircParseRegex = /^(?:@([^ ]+) )?(?::((?:(?:([^\s!@]+)(?:!([^\s@]+))?)@)?(\S+)) )?((?:[a-zA-Z]+)|(?:[0-9]{3}))(?: ([^:].*?))?(?: :(.*))?$/;

export function parseMessage(messageSrc: string): IRCMessage | null {
    // Parse the complete line
    let matches = ircParseRegex.exec(messageSrc);
    if (!matches) {
        // The line was not parsed correctly, must be malformed
        return null;
    }

    let msg = new IRCMessage();
    msg.rawSource = messageSrc;

    // Nick will be in the prefix slot if a full user mask is not used
    msg.ircNickname = matches[3] || '';
    msg.ircUsername = matches[4] || '';
    msg.ircHostname = matches[5] || '';
    msg.ircCommand = matches[6];
    msg.ircParameters = matches[7] ? matches[7].split(/ +/) : [];

    // Add the trailing param to the params list
    if (typeof matches[8] !== 'undefined') {
        msg.ircParameters.push(matches[8]);
    }

    return msg;

}
