import {PrivmsgRateLimiter} from './ratelimiter';
import {SingleConnection} from './connection';
import {TwitchAPI} from './twitchapi';
import {Message} from 'irc-framework';
import {EventDispatcher} from 'strongly-typed-events';
import Bottleneck from 'bottleneck';
import {randomOfArray} from './utils';
import {IEvent} from 'strongly-typed-events';

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

export class Client {
    private readonly connections: Set<SingleConnection> = new Set<SingleConnection>();

    private get connectionsArr(): SingleConnection[] {
        return [...this.connections];
    }

    private readonly configuration: ClientConfiguration;
    private readonly privmsgRateLimiter: PrivmsgRateLimiter;

    private readonly _onClose = new EventDispatcher<Client, boolean>();
    private readonly _onConnect = new EventDispatcher<Client, void>();
    private readonly _onError = new EventDispatcher<Client, Error>();
    private readonly _onMessage = new EventDispatcher<Client, Message>();

    public get onConnect(): IEvent<Client, void> {
        return this._onConnect.asEvent();
    };

    public get onClose(): IEvent<Client, boolean> {
        return this._onClose.asEvent();
    };

    public get onError(): IEvent<Client, Error> {
        return this._onError.asEvent();
    };

    public get onMessage(): IEvent<Client, Message> {
        return this._onMessage.asEvent();
    };

    public constructor(configuration: ClientConfiguration, privmsgRateLimiter: PrivmsgRateLimiter) {
        this.configuration = configuration;
        this.privmsgRateLimiter = privmsgRateLimiter;
    }

    public static async newClient(configuration: ClientConfiguration, apiClient: TwitchAPI): Promise<Client> {
        let rateLimits = await apiClient.getUserChatRateLimits(configuration.username);
        return new Client(configuration, new PrivmsgRateLimiter(rateLimits.highLimits, rateLimits.lowLimits));
    }

    // wait 1 second minimum between new connections (reduces load on the
    // twitch IRC server on startup and reconnect)
    private readonly connectionOpenRateLimiter = new Bottleneck({
        minTime: 1000
    });

    private async newConnection(): Promise<SingleConnection> {
        return this.connectionOpenRateLimiter.schedule(async (): Promise<SingleConnection> => {
            let conn = new SingleConnection(this.configuration);
            conn.onClose.sub(() => {
                this.connections.delete(conn);
            });
            conn.onMessage.sub((_, msg) => {
                this._onMessage.dispatch(this, msg);
            });
            this.connections.add(conn);
            return conn;
        });
    }

    public async join(channelName: string): Promise<void> {
        let conn: SingleConnection | undefined = this.connectionsArr.find((e) => e.channels.size < 50);
        if (typeof conn === 'undefined') {
            conn = await this.newConnection();
        }

        await conn.join(channelName);
    }

    public async privmsg(channelName: string, message: string): Promise<void> {
        await randomOfArray(this.connectionsArr).privmsg(channelName, message);
    }

}
