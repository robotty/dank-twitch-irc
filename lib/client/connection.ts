import * as carrier from 'carrier';
import * as debugLogger from 'debug-logger';
import { Result } from 'neverthrow';
import * as tls from 'tls';
import { TLSSocket } from 'tls';
import { IRCMessage, toTwitchMessage, TwitchMessage } from '../message';
import { parseMessage } from '../message/parser';
import { PongMessage, UserstateMessage } from '../message/twitch-types';
import { RoomState } from '../message/twitch-types/roomstate';
import { validateIRCCommand } from '../validation/channel';
import { BaseClient } from './base-client';
import { ClientConfiguration } from './config';
import { ConnectionError } from './errors';
import {
    handleReconnectMessage,
    replyToServerPing,
    sendClientPings
} from './functionalities';
import {
    joinChannel,
    requestCapabilities,
    sendLogin,
    joinAll,
    sendPrivmsg,
    me,
    say,
    whisper, sendPing
} from './operations';

let connectionIDCounter = 0;

export class SingleConnection extends BaseClient {
    public readonly connectionID = connectionIDCounter++;
    protected readonly log = debugLogger(`dank-twitch-irc:connection:${String(this.connectionID)}`);
    public readonly channels: Set<string> = new Set<string>();
    private socket: TLSSocket;
    private connectQueue: string[] = [];

    public constructor(configuration?: Partial<ClientConfiguration>) {
        super(configuration);

        this.onError.sub(e => this.handleError(e));
    }

    public connect(): void {
        this.configuration.connectionRateLimiter.acquire().then(() => {
            if (this.closed) {
                this.configuration.connectionRateLimiter.release();
                return;
            }

            this.socket = tls.connect({
                host: 'irc.chat.twitch.tv',
                port: 6697
            });
            this.socket.setNoDelay(true);

            this._onConnecting.dispatch();

            // carrier dependency splits the byte stream from the socket into lines
            carrier.carry(this.socket, l => this.handleLine(l), 'utf-8');

            this.socket.on('secureConnect', () => this._onConnect.dispatch());
            this.socket.on('close', hadError => this._onClose.dispatch(hadError));
            this.socket.on('error', e => this._onError.dispatch(e));

            this.configuration.connectionRateLimiter.releaseOnConnect(this);
            replyToServerPing(this);
            handleReconnectMessage(this);
            sendClientPings(this);

            // queue up data to be sent on connect

            let promises: Promise<void>[] = [];

            promises.push(requestCapabilities(this, this.configuration.requestMembershipCapability).catch(() => {}));
            promises.push(sendLogin(this, this.configuration.username, this.configuration.password).catch(() => {}));

            Promise.all(promises).then(() => this._onReady.dispatch()).catch(() => {});

            this.sendAll(this.connectQueue);
            delete this.connectQueue;

            this.log.debug('Created connection %s', this.connectionID);
        });
    }

    private handleLine(line: string): void {
        if (line.length <= 0) {
            // ignore empty lines (allowed in IRC)
            return;
        }

        if (!this.connected) {
            this.log.warn('Ignored line while connection was disconnected:', line);
            return;
        }

        this.log.trace('<', line);

        let ircMessage: IRCMessage;
        try {
            ircMessage = parseMessage(line);
        } catch (e) {
            this._onError.dispatch(new ConnectionError('Error while parsing IRC message', e));
            return;
        }

        this.handleIRCMessage(ircMessage);
    }

    private handleIRCMessage(ircMessage: IRCMessage): void {
        let twitchMessage: TwitchMessage | undefined = toTwitchMessage(ircMessage);
        if (twitchMessage == null) {
            this.dispatch(ircMessage);
            return;
        }
        this.dispatch(twitchMessage);
    }

    public close(): void {
        // -> close is emitted
        this.socket.end();
    }

    public destroy(error?: Error): void {
        if (error == null) {
            // -> close is emitted
            this.socket.destroy();
        } else {
            // -> destroy(error) called (in handleError) -> close is emitted
            this._onError.dispatch(new ConnectionError('Client destroyed', error));
        }
    }

    private handleError(e: Error): void {
        if (e instanceof ConnectionError) {
            this._onClose.dispatch(true);

            if (this.socket != null) {
                // loops back and emits close event
                this.socket.destroy();
            }
        }
    }

    public send(command: string): void {
        validateIRCCommand(command);
        if (this.socket != null) {
            this.log.trace('>', command);
            this.socket.write(command + '\r\n', 'utf-8');
        } else {
            this.connectQueue.push(command);
        }
    }

    public sendAll(commands: string[]): void {
        commands.forEach(validateIRCCommand);
        if (this.socket != null) {
            for (let command of commands) {
                this.log.trace('>', command);
            }

            this.socket.write(commands.map(s => s + '\r\n').join(''), 'utf-8');
        } else {
            this.connectQueue.push(...commands);
        }
    }

    public async join(channelName: string): Promise<RoomState> {
        return joinChannel(this, channelName);
    }

    public async joinAll(channelNames: string[]): Promise<Record<string, Result<RoomState, Error>>> {
        return joinAll(this, channelNames);
    }

    public privmsg(channelName: string, message: string): void {
        return sendPrivmsg(this, channelName, message);
    }

    public me(channelName: string, message: string): Promise<UserstateMessage> {
        return me(this, channelName, message);
    }

    public say(channelName: string, message: string): Promise<UserstateMessage> {
        return say(this, channelName, message);
    }

    public whisper(username: string, message: string): Promise<void> {
        return whisper(this, username, message);
    }

    public ping(): Promise<PongMessage> {
        return sendPing(this);
    }
}
