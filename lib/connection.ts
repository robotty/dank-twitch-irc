import * as tls from 'tls';
import { TLSSocket } from 'tls';
import * as carrier from 'carrier';
import { ClientConfiguration } from './client';
import { parseMessage } from './message/parser';
import { IRCMessage } from './message/message';
import * as debugLogger from 'debug-logger';
import { BaseMessageEmitter } from './messageemitter';
import { PingMessage, PongMessage, ReconnectMessage } from './message/types';
import * as VError from 'verror';
import { awaitResponse } from './await-response';

const log = debugLogger('dank-twitch-irc:connection');

export class SingleConnection extends BaseMessageEmitter {
    private readonly socket: TLSSocket;
    public readonly channels: Set<string> = new Set<string>();

    private readonly configuration: ClientConfiguration;

    public constructor(configuration: ClientConfiguration) {
        super();
        this.configuration = configuration;

        this.socket = tls.connect({
            host: 'irc.chat.twitch.tv',
            port: 6697,
        });

        let handleLine = (line: string): void => {
            if (line.length <= 0) {
                // ignore empty lines
                return;
            }
            log.trace('< ' + line);

            let ircMessage: IRCMessage | null = parseMessage(line);

            if (ircMessage == null) {
                log.warn('Ignoring invalid IRC message', line);
                return;
            }

            this.handleIRCMessage(ircMessage);
        };
        carrier.carry(this.socket, handleLine, 'utf-8');

        this.socket.on('connect', () => {
            this._onConnect.dispatch();
        });

        this.socket.on('close', (hadError: boolean) => {
            this._onClose.dispatch(hadError);
        });

        this.socket.on('error', (e: Error) => {
            this._onError.dispatch(e);
        });

        // server-ping
        this.subscribe(PingMessage, (msg: PingMessage) => {
            if (msg.argument == null) {
                this.send('PONG');
            } else {
                this.send(`PONG :${msg.argument}`);
            }
        });

        // client-ping, every 60 seconds with a timeout of 2 seconds
        let pingIDCounter = 0;
        let interval = setInterval(() => {
            let pingID = String(pingIDCounter++);
            this.send(`PING :${pingID}`);
            awaitResponse(this, {
                types: [PongMessage],
                tMatcher: (m: PongMessage) => m.argument === pingID
            }).catch(e => {
                this.socket.destroy(new VError('Server failed to PONG, disconnecting', e));
            });
        }, 60 * 1000);
        this.onClose.sub(() => clearInterval(interval));

        // reonnect
        this.subscribe(ReconnectMessage, (msg: ReconnectMessage) => {
            this.socket.destroy(new Error('Reconnect command received by server: ' + msg.ircMessage.rawSource));
        });

        this.setupConnection();
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
     * @param command the command, not terminated by newline(s)
     */
    public send(command): void {
        if (command.indexOf('\n') >= 0 || command.indexOf('\r') >= 0) {
            throw new Error('Cannot send messages containing newline characters');
        }
        log.trace('> ' + command);

        this.socket.write(command + '\r\n', 'utf-8');
    }

    public async join(channelName): Promise<void> {
        // TODO validate channelName
        this.channels.add(channelName);

        this.send(`JOIN #${channelName}`);
        //  TODO await response
    }

    public async privmsg(channelName: string, message: string): Promise<void> {
        // TODO validate channelName and message
        this.send(`PRIVMSG #${channelName} :${message}`);
    }



}
