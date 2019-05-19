import { IRCMessage, IRCMessageTags } from './irc';
import { Message } from './message';

/** static interface of all TwitchMessage types */
export interface TwitchMessageStatic {
    readonly command: string;

    new(ircMessage: IRCMessage): TwitchMessage;
}

export abstract class TwitchMessage implements Message {
    public constructor(public ircMessage: IRCMessage) {
    }

    public get ircCommand(): string {
        return this.ircMessage.ircCommand;
    }

    public get ircHostname(): string {
        return this.ircMessage.ircHostname;
    }

    public get ircNickname(): string {
        return this.ircMessage.ircNickname;
    }

    public get ircParameters(): string[] {
        return this.ircMessage.ircParameters;
    }

    public get rawSource(): string {
        return this.ircMessage.rawSource;
    }

    public get ircUsername(): string {
        return this.ircMessage.ircUsername;
    }

    public get ircTags(): IRCMessageTags {
        return this.ircMessage.ircTags;
    }

    public get trailingParameter(): string | null {
        return this.ircMessage.trailingParameter;
    }
}
