import { ConnectionRateLimiter, defaultConnectionRateLimiter } from './ratelimiters';

export interface ClientConfiguration {
    /**
     * lowercase twitch login name
     */
    username: string;

    /**
     * Optional password. If unset no PASS is sent to the server.
     *
     * If set, this must begin with "<code>oauth:</code>"
     */
    password?: string;

    /**
     * Can be disabled to lower the load on the bot by not requesting useless membership messages.
     *
     * Disabled by default.
     */
    requestMembershipCapability: boolean;

    /**
     * Whether the bot should store data about the bot's userstate for each channel the bot
     * participates in.
     *
     * Currently used to automatically use the correct rate limit parameters and make the bot wait
     * before sending messages too quickly in channels it is not VIP, moderator or broadcaster in.
     */
    trackOwnUserState: boolean;
    trackRoomState: boolean;
    trackOwnLastMessage: boolean;

    /**
     * Maximum number of channels the client will allow one connection to be joined to. 100 by default.
     */
    maxChannelCountPerConnection: number;

    /**
     * API Client ID so the bot can automatically determine the current rate limits for the logged in user.
     *
     * If undefined (the default), default user rate limits will be used as a fallback.
     */
    clientID?: string;

    connectionRateLimiter: ConnectionRateLimiter;

    receiveOwnMessagesBack: boolean;
}

export const configDefaults: ClientConfiguration = {
    username: 'justinfan12345',
    password: undefined,
    requestMembershipCapability: false,
    trackOwnUserState: true,
    trackRoomState: true,
    trackOwnLastMessage: true,
    maxChannelCountPerConnection: 100,
    clientID: undefined,
    connectionRateLimiter: defaultConnectionRateLimiter,
    receiveOwnMessagesBack: true
};
