import { Result } from 'neverthrow/dist';
import {
    IEventManagement,
    ISignal,
    ISimpleEvent,
    ISimpleEventHandler,
    SignalDispatcher,
    SimpleEventDispatcher,
    SimpleEventList
} from 'strongly-typed-events';
import { Message } from '../message';
import { RoomstateMessage, UserstateMessage } from '../message/twitch-types';
import { RoomState } from '../message/twitch-types/roomstate';
import { setDefaults } from '../utils';
import { ClientConfiguration, configDefaults } from './config';
import { Client } from './interface';

const alwaysTrue = (): boolean => true;

export enum ClientState {
    UNCONNECTED,
    CONNECTING,
    CONNECTED,
    READY,
    CLOSED
}

export abstract class BaseClient implements Client {

    public readonly configuration: ClientConfiguration;
    public readonly abstract channels: Set<string>;

    protected constructor(partialConfig?: Partial<ClientConfiguration>) {
        this.configuration = setDefaults(partialConfig, configDefaults);

        this.onConnecting.sub((ev) => this.advanceState(ClientState.CONNECTING, ev));
        this.onConnect.sub((ev) => this.advanceState(ClientState.CONNECTED, ev));
        this.onReady.sub((ev) => this.advanceState(ClientState.READY, ev));
        this.onClose.sub((_, ev) => this.advanceState(ClientState.CLOSED, ev));
        this.onError.sub((_, ev) => {
            if (this.closed) {
                ev.stopPropagation();
            }
        });
    }

    protected readonly _onConnecting = new SignalDispatcher();
    protected readonly _onConnect = new SignalDispatcher();
    protected readonly _onReady = new SignalDispatcher();
    protected readonly _onClose = new SimpleEventDispatcher<boolean>();
    protected readonly _onError = new SimpleEventDispatcher<Error>();

    protected state: ClientState = ClientState.UNCONNECTED;

    public get unconnected(): boolean {
        return this.state === ClientState.UNCONNECTED;
    }

    public get connecting(): boolean {
        return this.state === ClientState.CONNECTING;
    }

    public get connected(): boolean {
        return this.state === ClientState.CONNECTED || this.ready;
    }

    public get ready(): boolean {
        return this.state === ClientState.READY;
    }

    public get closed(): boolean {
        return this.state === ClientState.CLOSED;
    }

    protected advanceState(newState: ClientState, ev?: IEventManagement): void {
        if (newState > this.state) {
            this.state = newState;
        } else if (ev != null) {
            // current state is already there or past it (e.g. double error/double close etc.) so we stop the event.
            ev.stopPropagation();
        }
    }

    public get onConnecting(): ISignal {
        return this._onConnecting.asEvent();
    };

    public get onConnect(): ISignal {
        return this._onConnect.asEvent();
    };

    public get onReady(): ISignal {
        return this._onReady.asEvent();
    };

    public get onClose(): ISimpleEvent<boolean> {
        return this._onClose.asEvent();
    };

    public get onError(): ISimpleEvent<Error> {
        return this._onError.asEvent();
    };

    protected readonly _onMessage = new SimpleEventDispatcher<Message>();

    public get onMessage(): ISimpleEvent<Message> {
        return this._onMessage.asEvent();
    };

    public dispatch(message: Message): void {
        this._onMessage.dispatch(message);
        this.events.get(message.ircCommand).dispatch(message);
    }

    protected readonly events = new SimpleEventList<Message>();

    public subscribe(command: string, fn: ISimpleEventHandler<Message>): () => void {
        return this.events.get(command).subscribe(fn);
    }

    public unsubscribe(command: string, fn: ISimpleEventHandler<Message>): void {
        this.events.get(command).unsubscribe(fn);
    }

    public forwardEvents(client: Client, commandFilter: (cmd: string) => boolean = alwaysTrue): void {
        this.onMessage.sub(msg => {
            if (!commandFilter(msg.ircCommand)) {
                return;
            }
            client.dispatch(msg);
        });
    }

    abstract connect(): void;

    abstract send(command: string): void;

    abstract join(channelName: string): Promise<RoomState>;

    abstract joinAll(channelNames: string[]): Promise<Record<string, Result<RoomState, Error>>>;

    abstract destroy(error?: Error): void;

    abstract close(): void;

    public dispatchError(error: Error): void {
        this._onError.dispatch(error);
    }

    public abstract me(channelName: string, message: string): Promise<UserstateMessage>;

    public abstract privmsg(channelName: string, message: string): void;

    public abstract say(channelName: string, message: string): Promise<UserstateMessage>;

    public abstract whisper(username: string, message: string): Promise<void>;

}
