import { IRCMessage, toTwitchMessage, TwitchMessage, TwitchMessageStatic } from './message/message';
import {
    ISignal,
    ISimpleEvent,
    SimpleEventDispatcher,
    SignalDispatcher,
    SimpleEventList,
    ISimpleEventHandler
} from 'strongly-typed-events';

export interface Prototype<X> {
    new(...args: any[]): X;
}

export interface TwitchMessagePrototype<X> extends Prototype<X>, TwitchMessageStatic {
}

export class EventListForward {
    public list: SimpleEventList<TwitchMessage | IRCMessage>;
    public commandFilter: (cmd: string) => boolean;
}

export class BaseMessageEmitter {

    protected readonly events = new SimpleEventList<TwitchMessage | IRCMessage>();
    protected readonly forwards: EventListForward[] = [];
    // boolean = hadError
    protected readonly _onClose = new SimpleEventDispatcher<boolean>();
    protected readonly _onConnect = new SignalDispatcher();
    protected readonly _onError = new SimpleEventDispatcher<Error>();
    protected readonly _onMessage = new SimpleEventDispatcher<IRCMessage>();
    protected readonly _onUnparsedMessage = new SimpleEventDispatcher<IRCMessage>();

    public get onConnect(): ISignal {
        return this._onConnect.asEvent();
    };

    public get onClose(): ISimpleEvent<boolean> {
        return this._onClose.asEvent();
    };

    public get onError(): ISimpleEvent<Error> {
        return this._onError.asEvent();
    };

    public get onMessage(): ISimpleEvent<IRCMessage> {
        return this._onMessage.asEvent();
    };

    public get onUnparsedMessage(): ISimpleEvent<IRCMessage> {
        return this._onUnparsedMessage.asEvent();
    };

    protected subscribeByCommand(name: string, fn: ISimpleEventHandler<TwitchMessage | IRCMessage>): () => void {
        return this.events.get(name).subscribe(fn);
    }

    public subscribe<T extends TwitchMessage | IRCMessage>(proto: TwitchMessagePrototype<T>, fn: ISimpleEventHandler<T>): () => void {
        return this.subscribeByCommand(proto.command, fn);
    }

    protected unsubscribeByCommand(name: string, fn: ISimpleEventHandler<TwitchMessage | IRCMessage>): void {
        this.events.get(name).unsubscribe(fn);
    }

    public unsubscribe<T extends TwitchMessage | IRCMessage>(proto: TwitchMessagePrototype<T>, fn: ISimpleEventHandler<T>): void {
        this.unsubscribeByCommand(proto.command, fn);
    }

    protected dispatchByCommand(name: string, args: TwitchMessage | IRCMessage): void {
        this.events.get(name).dispatch(args);

        for (let { list, commandFilter } of this.forwards) {
            if (commandFilter(name)) {
                list.get(name).dispatch(args);
            }
        }
    }

    protected dispatchIRCMessage(ircMessage: IRCMessage): void {
        this.dispatchByCommand(ircMessage.command, ircMessage);
    }

    protected dispatchMessage(message: TwitchMessage): void {
        this.dispatchByCommand(message.ircMessage.command, message);
    }

    protected handleIRCMessage(ircMessage: IRCMessage): void {
        this._onMessage.dispatch(ircMessage);

        let twitchMessage: TwitchMessage | null = toTwitchMessage(ircMessage);
        if (twitchMessage == null) {
            this._onUnparsedMessage.dispatch(ircMessage);
            this.dispatchIRCMessage(ircMessage);
            return;
        }

        this.dispatchMessage(twitchMessage);
    }

    public forwardEmitter(emitter: BaseMessageEmitter, commandFilter: (cmd: string) => boolean = () => true): void {
        this.onUnparsedMessage.sub((msg) => {
            if (!commandFilter(msg.command)) {
                return;
            }
            emitter._onUnparsedMessage.dispatch(msg);
        });

        this.onMessage.sub((msg) => {
            if (!commandFilter(msg.command)) {
                return;
            }
            emitter._onMessage.dispatch(msg);
        });

        this.forwards.push({
            list: emitter.events,
            commandFilter: commandFilter
        });
    }

}
