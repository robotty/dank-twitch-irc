"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const irc_1 = require("../irc");
const parse_error_1 = require("./parse-error");
const tags_1 = require("./tags");
const ircParseRegex = /^(?:@([^ ]+) )?(?::((?:(?:([^\s!@]+)(?:!([^\s@]+))?)@)?(\S+)) )?((?:[a-zA-Z]+)|(?:[0-9]{3}))(?: ([^:].*?))?(?: :(.*))?$/;
function parseMessage(messageSrc) {
    // Parse the complete line
    let matches = ircParseRegex.exec(messageSrc);
    if (!matches) {
        // The line was not parsed correctly, must be malformed
        throw new parse_error_1.ParseError('IRC Message malformed.', messageSrc);
    }
    let rawSource = messageSrc;
    let tagsSrc = matches[1];
    let tags = tags_1.parseTags(tagsSrc);
    // Nick will be in the prefix slot if a full user mask is not used
    let ircNickname = matches[3] || '';
    let ircUsername = matches[4] || '';
    let ircHostname = matches[5] || '';
    let ircCommand = matches[6];
    let ircParameters = matches[7] ? matches[7].split(/ +/) : [];
    // Add the trailing param to the params list
    if (matches[8] != null) {
        ircParameters.push(matches[8]);
    }
    return new irc_1.IRCMessage(rawSource, ircNickname, ircUsername, ircHostname, ircCommand, ircParameters, tags);
}
exports.parseMessage = parseMessage;
//# sourceMappingURL=message.js.map