import * as request from 'request-promise-native';
import { messageRateLimitPresets, MessageRateLimits } from '../client/ratelimiters/message-rate-limiter';

export class TwitchAPI {
    private readonly clientID: string;

    public constructor(clientID: string) {
        this.clientID = clientID;
    }

    public async getTwitchUserID(username: string): Promise<number | undefined> {
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
            return undefined;
        }

        return data['users'][0]['_id'];
    }

    public async getUserChatRateLimits(username: string): Promise<MessageRateLimits> {
        let userID: number | undefined = await this.getTwitchUserID(username);
        if (userID == null) {
            // unknown username or anonymous username.
            return messageRateLimitPresets.default;
        }

        let data = await request.get(`https://api.twitch.tv/kraken/users/${encodeURIComponent(String(userID))}/chat`,
            {
                headers: {
                    'Client-ID': this.clientID,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                },
                json: true
            });

        let { 'is_verified_bot': verified, 'is_known_bot': known } = data;
        if (verified === true) {
            return messageRateLimitPresets.verifiedBot;
        }

        if (known === true) {
            return messageRateLimitPresets.knownBot;
        }

        return messageRateLimitPresets.default;
    }
}
