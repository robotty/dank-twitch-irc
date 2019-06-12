import { Message} from '../message';
import { ClearchatMessage } from './clearchat';
import { ClearmsgMessage } from './clearmsg';
import { GlobaluserstateMessage } from './globaluserstate';
import { HosttargetMessage } from './hosttarget';
import { NoticeMessage } from './notice';
import { PrivmsgMessage } from './privmsg';
import { RoomstateMessage } from './roomstate';
import { UsernoticeMessage } from './usernotice';
import { UserstateMessage } from './userstate';
import { WhisperMessage } from './whisper';
import { JoinMessage } from './membership';
import { PartMessage } from './membership';
import { ReconnectMessage } from './connection';
import { PongMessage } from './connection';
import { PingMessage } from './connection';
import { IRCMessage } from '../irc';
import { TwitchMessage, TwitchMessageStatic } from '../twitch';

export let knownTypes: TwitchMessageStatic[] = [
    ClearchatMessage,
    ClearmsgMessage,
    GlobaluserstateMessage,
    HosttargetMessage,
    NoticeMessage,
    PrivmsgMessage,
    RoomstateMessage,
    UsernoticeMessage,
    UserstateMessage,
    WhisperMessage,
    JoinMessage,
    PartMessage,
    ReconnectMessage,
    PingMessage,
    PongMessage
];

export let commandClassMap: Map<string, TwitchMessageStatic> = new Map<string, TwitchMessageStatic>();

export function refreshCommandClassMap(): void {
    commandClassMap.clear();
    for (let knownType of knownTypes) {
        commandClassMap.set(knownType.command, knownType);
    }
}

refreshCommandClassMap();

export function toTwitchMessage(message: Message): TwitchMessage | undefined {
    if (message instanceof TwitchMessage) {
        return message;
    }

    if (!(message instanceof IRCMessage)) {
        return undefined;
    }

    let prototype: TwitchMessageStatic | undefined = commandClassMap.get(message.ircCommand);
    if (prototype == null) {
        return undefined;
    }

    return new prototype(message as IRCMessage);
}
