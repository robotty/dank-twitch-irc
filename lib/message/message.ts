import { IRCMessageTags } from './irc';

export interface Message {

    readonly rawSource: string;
    readonly ircNickname: string;
    readonly ircUsername: string;
    readonly ircHostname: string;
    readonly ircCommand: string;
    readonly ircParameters: string[];

    readonly ircTags: IRCMessageTags;

    // TODO this was changed from null to undefined, check usages
    readonly trailingParameter: string | undefined;
}

export interface ChannelMessage {

    readonly channelName: string;

}
