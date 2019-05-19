import {ConnectionRateLimiter, PrivmsgRateLimiter} from './ratelimiter';
import {SingleConnection} from './connection';
import {TwitchAPI} from './twitchapi';
import { findAndPushToEnd, removeInPlace } from './utils';
import {BaseMessageEmitter} from './messageemitter';
import * as debugLogger from 'debug-logger';

const log = debugLogger('dank-twitch-irc:client');

export class ClientConfiguration {
    /**
     * lowercase twitch login name
     */
    public username: string = 'justinfan12345';

    /**
     * Optional password. If unset no PASS is sent to the server.
     *
     * If set, this must begin with "<code>oauth:</code>"
     */
    public password: string | null = null;

    /**
     * Can be disabled to lower the load on the bot by not requesting useless membership messages.
     *
     * Disabled by default.
     */
    public requestMembershipCapability: boolean = false;

    public constructor(values: Partial<ClientConfiguration> = {}) {
        Object.assign(this, values);
    }
}

export class Client extends BaseMessageEmitter {
    private readonly connections: SingleConnection[] = [];

    private readonly configuration: ClientConfiguration;
    private readonly privmsgRateLimiter: PrivmsgRateLimiter;

    public constructor(configuration: ClientConfiguration, privmsgRateLimiter: PrivmsgRateLimiter) {
        super();
        this.configuration = configuration;
        this.privmsgRateLimiter = privmsgRateLimiter;

        this._onConnect.dispatch();
    }

    public static async newClient(apiClient: TwitchAPI, partialConfig: Partial<ClientConfiguration> = {}): Promise<Client> {
        let config = new ClientConfiguration(partialConfig);
        let rateLimits = await apiClient.getUserChatRateLimits(config.username);
        return new Client(config, new PrivmsgRateLimiter(rateLimits.highLimits, rateLimits.lowLimits));
    }

    // wait 1 second minimum between new connections (reduces load on the
    // twitch IRC server on startup and reconnect)
    private readonly connectionRateLimiter = new ConnectionRateLimiter();

    private static readonly neverForwardCommands: string[] = [
        'PING',
        'PONG',
        'RECONNECT'
    ];

    // current whisper conn
    private activeWhisperConn: SingleConnection | null = null;

    private newConnection(): SingleConnection {
        log.info('Creating new connection');

        let conn = new SingleConnection(this.configuration);
        conn.onError.sub(e => {
            log.warn('Connection encountered error', e);
        });
        
        conn.onClose.sub(async (hadError) => {
            log.warn('Connection was closed, hadError=%s', hadError);
            removeInPlace(this.connections, conn);
            if (this.activeWhisperConn === conn) {
                this.activeWhisperConn = null;
            }
            await this.ensureWhisperConnection();

            for (let channelName of conn.channels) {
                // rejoin
                await this.join(channelName);
            }
        });
        conn.onConnect.sub(() => {
            if (this.activeWhisperConn == null) {
                this.activeWhisperConn = conn;
            }
        });
        // forward events to this client
        conn.forwardEmitter(this, cmd => {
            if (Client.neverForwardCommands.includes(cmd)) {
                return false;
            }

            // only forward whispers from the currently active whisper connection
            if (cmd === 'WHISPER') {
                return this.activeWhisperConn === conn;
            }

            return true;
        });
        // connection will be used by the code that requested the connection therefore it's added to the back
        // of the queue
        this.connections.push(conn);
        return conn;
    }

    private async ensureWhisperConnection(): Promise<void> {
        if (this.activeWhisperConn == null) {
            this.activeWhisperConn = await this.requireConnection();
        }
    }

    private async requireConnection(filter: (conn: SingleConnection) => boolean = () => true): Promise<SingleConnection> {
        let conn = this.nextConnection(filter);
        if (conn != null) {
            return conn;
        }

        return await this.connectionRateLimiter.schedule(async (notConsumed) => {
            // check condition again, maybe it's satisfied now?
            let conn = this.nextConnection(filter);
            if (conn != null) {
                notConsumed();
                return conn;
            }

            return this.newConnection();
        });
    }

    private nextConnection(filter: (conn: SingleConnection) => boolean): SingleConnection | undefined {
        // take the first connection from the head of the queue and put it back onto the end of the queue
        // so connections are used round-robin for sending purposes.
        return findAndPushToEnd(this.connections, filter);
    }

    public async connect(): Promise<void> {
        await this.ensureWhisperConnection();
    }

    public async join(channelName: string): Promise<void> {
        let conn = await this.requireConnection(e => e.channels.size < 50);
        await conn.join(channelName);
    }

    public async privmsg(channelName: string, message: string): Promise<void> {
        await (await this.requireConnection()).privmsg(channelName, message);
    }

}
