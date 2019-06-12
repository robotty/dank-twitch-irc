import { IClient } from './client/interface';
import { RoomstateMessage } from './message/twitch-types';
import * as debugLogger from 'debug-logger';
import { hasAllStateTags, RoomState } from './message/twitch-types/roomstate';

const log = debugLogger('dank-twitch-irc:roomstate-tracker');

/**
 * Tracks the state of the logged in user (the bot) in all channels the bot operates in
 */
export class RoomStateTracker {

    private channelStates: Map<string, RoomState> = new Map<string, RoomState>();

    public getState(channelName: string): RoomState | undefined {
        return this.channelStates.get(channelName);
    }

    private onRoomstateMessage(msg: RoomstateMessage): void {
        let currentState: RoomState | undefined = this.getState(msg.channelName);
        let newState: Partial<RoomState> = msg.extractRoomState();

        if (currentState == null) {
            if (!hasAllStateTags(newState)) {
                log.warn('Got incomplete ROOMSTATE before receiving complete roomstate:', msg.rawSource);
                return;
            }
            this.channelStates.set(msg.channelName, newState);
        } else {
            for (let [k, v] of Object.entries(newState)) {
                if (v == null) {
                    continue;
                }
                currentState[k] = v;
            }
        }
    }

    public registerListenersOn(client: IClient): void {
        client.subscribe('ROOMSTATE', this.onRoomstateMessage.bind(this));
    }

}
