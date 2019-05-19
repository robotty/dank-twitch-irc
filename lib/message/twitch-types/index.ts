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
import { JoinMessage } from './membership/join';
import { PartMessage } from './membership/part';
import { ReconnectMessage } from './connection/reconnect';
import { PongMessage } from './connection/pong';
import { PingMessage } from './connection/ping';
import { IRCMessage } from '../irc';
import { TwitchMessage, TwitchMessageStatic } from '../twitch';

export {ClearchatMessage} from './clearchat';
export {ClearmsgMessage} from './clearmsg';
export {GlobaluserstateMessage} from './globaluserstate';
export {HosttargetMessage} from './hosttarget';
export {NoticeMessage} from './notice';
export {PrivmsgMessage} from './privmsg';
export {ReconnectMessage} from './connection/reconnect';
export {RoomstateMessage} from './roomstate';
export {UsernoticeMessage} from './usernotice';
export {UserstateMessage} from './userstate';
export {JoinMessage} from './membership/join';
export {PartMessage} from './membership/part';
export {PingMessage} from './connection/ping';
export {PongMessage} from './connection/pong';


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

export function toTwitchMessage(message: Message): TwitchMessage | null {
    if (message instanceof TwitchMessage) {
        return message;
    }

    if (!(message instanceof IRCMessage)) {
        return null;
    }

    let prototype: TwitchMessageStatic = commandClassMap.get(message.ircCommand);
    if (prototype == null) {
        return null;
    }

    return new prototype(message as IRCMessage);
}

