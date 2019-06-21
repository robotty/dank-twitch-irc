import { IRCMessageTags } from './irc';

export interface Message {

    readonly rawSource: string;
    readonly ircNickname: string;
    readonly ircUsername: string;
    readonly ircHostname: string;
    readonly ircCommand: string;
    readonly ircParameters: string[];

    readonly ircTags: IRCMessageTags;

    readonly trailingParameter: string;
}

export interface ChannelMessage extends Message {

    readonly channelName: string;

}
