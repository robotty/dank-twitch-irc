import * as request from 'request-promise-native';

export interface ChatRateLimitsSet {
    highLimits: number;
    lowLimits: number;
}

export class TwitchAPI {
    private readonly clientID: string;

    public constructor(clientID: string) {
        this.clientID = clientID;
    }

    public async getTwitchUserID(username: string): Promise<number | null> {
        let data = await request.get('https://api.twitch.tv/kraken/users', {
            qs: {
                login: username
            },
            headers: {
                'Client-ID': this.clientID,
                'Accept': 'application/vnd.twitchtv.v5+json'
            },
            json: true
        });

        if (data['users'].length < 1) {
            return null;
        }

        return data['users'][0]['_id'];
    }

    public static get defaultChatRateLimits(): ChatRateLimitsSet {
        return {highLimits: 100, lowLimits: 20};
    }

    public static get knownBotRateLimits(): ChatRateLimitsSet {
        return {highLimits: 100, lowLimits: 50};
    }

    public static get verifiedBotRateLimits(): ChatRateLimitsSet {
        return {highLimits: 7500, lowLimits: 7500};
    }

    public async getUserChatRateLimits(username: string): Promise<ChatRateLimitsSet> {
        let userID = await this.getTwitchUserID(username);
        if (userID === null) {
            return TwitchAPI.defaultChatRateLimits;
        }

        let data = await request.get(`https://api.twitch.tv/kraken/users/${encodeURIComponent(String(userID))}/chat`,
            {
                headers: {
                    'Client-ID': this.clientID,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                },
                json: true
            });

        let verified = data['is_verified_bot'];
        let known = data['is_known_bot'];
        if (verified) {
            return TwitchAPI.verifiedBotRateLimits;
        }

        if (known) {
            return TwitchAPI.knownBotRateLimits;
        }

        return TwitchAPI.defaultChatRateLimits;
    }
}
