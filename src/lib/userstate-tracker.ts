import { Client } from './client/interface';
import { GlobaluserstateMessage, PrivmsgMessage, UserstateMessage } from './message/twitch-types';
import { GlobalUserState } from './message/twitch-types/globaluserstate';
import { UserState } from './message/twitch-types/userstate';

/**
 * Tracks the state of the logged in user (the bot) in all channels the bot operates in
 */
export class UserStateTracker {

    public globalState?: GlobalUserState;
    private channelStates: Map<string, UserState> = new Map<string, UserState>();

    public getState(channel: string): UserState | undefined {
        return this.channelStates.get(channel);
    }

    private onUserstateMessage(msg: UserstateMessage): void {
        this.channelStates.set(msg.channelName, msg.extractUserState());
    }

    private onGlobaluserstateMessage(msg: GlobaluserstateMessage): void {
        this.globalState = msg.extractGlobalUserState();
    }

    private onPrivmsgMessage(msg: PrivmsgMessage): void {
        let channelState = this.channelStates.get(msg.channelName);
        if (channelState != null) {
            Object.assign(channelState, msg.extractUserState());
        }
    }

    public registerListenersOn(client: Client): void {
        client.subscribe('USERSTATE', this.onUserstateMessage.bind(this));
        client.subscribe('GLOBALUSERSTATE', this.onGlobaluserstateMessage.bind(this));
        client.subscribe('PRIVMSG', this.onPrivmsgMessage.bind(this));
    }

}
