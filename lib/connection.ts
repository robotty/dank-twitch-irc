import {TLSSocket} from 'tls';
import * as tls from 'tls';
import * as carrier from 'carrier';
import * as pTimeout from 'p-timeout';
import {ircLineParser as parseIRCMessage, Message} from 'irc-framework';

import {IEvent, EventDispatcher} from 'strongly-typed-events';
import {ClientConfiguration} from './client';

export class SingleConnection {
    private readonly socket: TLSSocket;
    public readonly channels: Set<string> = new Set<string>();
    // boolean = hadError
    private readonly _onClose = new EventDispatcher<SingleConnection, boolean>();
    private readonly _onConnect = new EventDispatcher<SingleConnection, void>();
    private readonly _onError = new EventDispatcher<SingleConnection, Error>();
    private readonly _onMessage = new EventDispatcher<SingleConnection, Message>();

    private readonly configuration: ClientConfiguration;

    public get onConnect(): IEvent<SingleConnection, void> {
        return this._onConnect.asEvent();
    };

    public get onClose(): IEvent<SingleConnection, boolean> {
        return this._onClose.asEvent();
    };

    public get onError(): IEvent<SingleConnection, Error> {
        return this._onError.asEvent();
    };

    public get onMessage(): IEvent<SingleConnection, Message> {
        return this._onMessage.asEvent();
    };

    public constructor(configuration: ClientConfiguration) {
        this.configuration = configuration;

        this.socket = tls.connect({
            host: 'irc.chat.twitch.tv',
            port: 6667,
        });

        let handleLine = (line: string): void => {
            let ircMessage: Message | undefined = parseIRCMessage(line);

            if (typeof ircMessage === 'undefined') {
                return;
            }

            this._onMessage.dispatch(this, ircMessage);
        };
        carrier.carry(this.socket, handleLine, 'utf-8');

        this.socket.on('connect', () => {
            this._onConnect.dispatch(this);
        });

        this.socket.on('close', (hadError: boolean) => {
            this._onClose.dispatch(this, hadError);
        });

        this.socket.on('error', (e: Error) => {
            this._onError.dispatch(this, e);
        });

        this.onConnect.sub(() => {
            this.setupConnection();
        });
    }

    private setupConnection(): void {
        let capReqCommand = 'CAP REQ :twitch.tv/commands twitch.tv/tags';
        if (this.configuration.requestMembershipCapability) {
            capReqCommand += ' twitch.tv/membership';
        }
        this.send(capReqCommand);

        if (this.configuration.password !== null) {
            this.send(`PASS ${this.configuration.password}`);
        }
        this.send(`NICK ${this.configuration.username}`);
    }

    /**
     * send the irc server a command
     * @param command the command
     */
    public send(command): void {
        if (command.indexOf('\n') >= 0 || command.indexOf('\r') >= 0) {
            throw new Error('Cannot send messages containing newline characters');
        }

        this.socket.write(command + '\r\n', 'utf-8');
    }

    public async join(channelName): Promise<void> {
        // TODO validate channelName
        this.channels.add(channelName);

        this.send(`JOIN #${channelName}`);
        // await response...
        await this.awaitIRCResponse((msg: Message): Error | undefined => {
            const badMessageIDs = ['no_permission', 'msg_channel_suspended'];
            let msgId: string|undefined = msg.tags['msg-id'];
            if (msg.command === 'NOTICE' && typeof msgId === 'string' && badMessageIDs.includes(msgId)) {
                return new Error('Received bad NOTICE: ' + msg.to1459());
            }
        },
        (msg: Message): boolean => {
            // expected:
            // :own_username!own_username@own_username.tmi.twitch.tv JOIN #channelName
            // or:
            // @some_tags :tmi.twitch.tv ROOMSTATE #channelName
            // or:
            // @some_tags :tmi.twitch.tv USERSTATE #channelName
            return (msg.command === 'JOIN' && msg.nick === this.configuration.username) ||
                    msg.command === 'ROOMSTATE' ||
                    msg.command === 'USERSTATE';
        }, channelName);
    }

    public async privmsg(channelName: string, message: string): Promise<void> {
        // TODO validate channelName and message
        this.send(`PRIVMSG #${channelName} :${message}`);
    }

    public awaitIRCResponse(failureFilter: (Message) => Error | undefined,
        successFilter: (Message) => boolean,
        channelName?: string): Promise<Message> {
        let promise = new Promise<Message>((resolve, reject) => {
            let unsubscribers: (() => void)[] = [];

            let unsubscribe = (): void => {
                unsubscribers.forEach(e => e());
            };
            unsubscribers.push(this.onMessage.sub((_, msg) => {
                if (!(typeof channelName !== 'undefined' &&
                    msg.params.length >= 1 &&
                    msg.params[0] === `#${channelName}`)) {
                    // ignore messages not from the channel specified
                    return;
                }

                if (successFilter(msg)) {
                    resolve(msg);
                    unsubscribe();
                    return;
                }

                let failureError: Error | undefined = failureFilter(msg);
                if (typeof failureError !== 'undefined') {
                    reject(failureError);
                    unsubscribe();
                    return;
                }
            }));
            unsubscribers.push(this.onError.sub((_, error) => {
                reject(error);
                unsubscribe();
            }));
            unsubscribers.push(this.onClose.sub((_, hadError) => {
                if (hadError) {
                    reject(new Error('Connection closed with error'));
                } else {
                    reject(new Error('Connection closed without error'));
                }
                unsubscribe();
            }));
        });

        promise = pTimeout(promise, 2000);
        return promise;
    }
}