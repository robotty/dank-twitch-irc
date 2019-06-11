// eslint-disable-next-line @typescript-eslint/interface-name-prefix
import { Result } from 'neverthrow/dist';
import { ISignal } from 'ste-signals';
import { ISimpleEvent, ISimpleEventHandler } from 'ste-simple-events';
import { Message } from '../message';
import { RoomstateMessage, UserstateMessage } from '../message/twitch-types';
import { RoomState } from '../message/twitch-types/roomstate';
import { ClientConfiguration } from './config';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface Client {
    readonly configuration: ClientConfiguration;

    readonly unconnected: boolean;
    readonly connecting: boolean;
    readonly connected: boolean;
    readonly ready: boolean;

    readonly closed: boolean;
    readonly onConnecting: ISignal;
    readonly onConnect: ISignal;
    readonly onReady: ISignal;
    readonly onClose: ISimpleEvent<boolean>;
    readonly onError: ISimpleEvent<Error>;

    readonly onMessage: ISimpleEvent<Message>;
    readonly channels: Set<string>;

    dispatch(message: Message): void;

    subscribe(command: string, handler: ISimpleEventHandler<Message>): () => void;

    unsubscribe(command: string, handler: ISimpleEventHandler<Message>): void;

    forwardEvents(client: Client, commandFilter?: (cmd: string) => boolean): void;

    connect(): void;


    dispatchError(error: Error): void;

    /**
     * Forcefully destroys the client (aborts the connection). Invoking this method will cause {@link onError} and
     * and {@link onClose} (in that order) to be emitted.
     * @param error The cause error, if any. If no error is specified, this method behaves like {@link close}.
     */
    destroy(error?: Error): void;

    /**
     * Gracefully terminates this client. Invoking this method will cause {@link onClose} to be emitted.
     */
    close(): void;

    send(command: string): void;

    join(channelName: string): Promise<RoomState>;
    joinAll(channelNames: string[]): Promise<Record<string, Result<RoomState, Error>>>;

    privmsg(channelName: string, message: string): void;
    say(channelName: string, message: string): Promise<UserstateMessage>;
    me(channelName: string, message: string): Promise<UserstateMessage>;
    whisper(username: string, message: string): Promise<void>;

}
