import {
    ISignal,
    ISimpleEvent,
    ISimpleEventHandler,
    SignalDispatcher,
    SimpleEventDispatcher,
    SimpleEventList
} from 'strongly-typed-events';
import { IRCMessage } from './message/irc';
import { TwitchMessage, TwitchMessageStatic } from './message/twitch';
import { toTwitchMessage } from './message/twitch-types';
import { Message } from './message/message';

export interface Prototype<X> {
    new(...args: any[]): X;
}

export interface TwitchMessagePrototype<X extends TwitchMessage> extends Prototype<X>, TwitchMessageStatic {
}

function commandKeyFor<T extends TwitchMessage>(key: string | TwitchMessagePrototype<T>): string {
    if (typeof key === 'string') {
        return key;
    } else if (typeof key === 'function' && 'command' in key) {
        return (key as TwitchMessageStatic).command;
    } else {
        throw new TypeError('Invalid "key" argument');
    }
}

export class BaseMessageEmitter {

    public constructor() {
        this.onConnect.sub(() => {
            this.connected = true;
        });
    }

    // boolean = hadError
    protected readonly _onClose = new SimpleEventDispatcher<boolean>();
    public connected = false;
    protected readonly _onConnect = new SignalDispatcher();
    protected readonly _onError = new SimpleEventDispatcher<Error>();

    public get onConnect(): ISignal {
        return this._onConnect.asEvent();
    };

    public get onClose(): ISimpleEvent<boolean> {
        return this._onClose.asEvent();
    };

    public get onError(): ISimpleEvent<Error> {
        return this._onError.asEvent();
    };

    protected readonly _onMessage = new SimpleEventDispatcher<Message>();
    protected readonly events = new SimpleEventList<Message>();

    public get onMessage(): ISimpleEvent<Message> {
        return this._onMessage.asEvent();
    };

    public subscribe<T extends TwitchMessage>(key: string | TwitchMessagePrototype<T>,
                                              fn: ISimpleEventHandler<T>): () => void {
        return this.events.get(commandKeyFor(key)).subscribe(fn);
    }

    public unsubscribe<T extends TwitchMessage>(key: string | TwitchMessagePrototype<T>, fn: ISimpleEventHandler<T>): void {
        this.events.get(commandKeyFor(key)).unsubscribe(fn);
    }

    protected dispatch(message: Message): void {
        this._onMessage.dispatch(message);
        this.events.get(message.ircCommand).dispatch(message);
    }

    protected handleIRCMessage(ircMessage: IRCMessage): void {
        let twitchMessage: TwitchMessage | null = toTwitchMessage(ircMessage);
        if (twitchMessage == null) {
            this.dispatch(ircMessage);
            return;
        }
        this.dispatch(twitchMessage);
    }

    public forwardEmitter(emitter: BaseMessageEmitter, commandFilter: (cmd: string) => boolean = () => true): void {
        this.onMessage.sub(msg => {
            if (!commandFilter(msg.ircCommand)) {
                return;
            }
            emitter.dispatch(msg);
        });
    }

}
