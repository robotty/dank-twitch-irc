import * as debugLogger from "debug-logger";
import * as EventEmitter from "eventemitter3";
import { ChatClient } from "../client/client";
import {
  hasAllStateTags,
  RoomState,
  RoomstateMessage
} from "../message/twitch-types/roomstate";
import { ClientMixin } from "./base-mixin";

const log = debugLogger("dank-twitch-irc:roomstate-tracker");

export interface RoomStateTrackerEvents {
  newChannelState: [string, RoomState];
}

/**
 * Tracks the state of the logged in user (the bot) in all channels the bot operates in
 */
export class RoomStateTracker extends EventEmitter<RoomStateTrackerEvents>
  implements ClientMixin {
  private readonly channelStates: Record<string, RoomState> = {};

  public getState(channelName: string): RoomState | undefined {
    return this.channelStates[channelName];
  }

  public applyToClient(client: ChatClient): void {
    client.roomStateTracker = this;
    client.on("ROOMSTATE", this.onRoomstateMessage.bind(this));
  }

  private onRoomstateMessage(msg: RoomstateMessage): void {
    const currentState: RoomState | undefined = this.getState(msg.channelName);
    const newState: Partial<RoomState> = msg.extractRoomState();

    if (currentState == null) {
      if (!hasAllStateTags(newState)) {
        log.warn(
          "Got incomplete ROOMSTATE before receiving complete roomstate:",
          msg.rawSource
        );
        return;
      }
      this.channelStates[msg.channelName] = newState;
      this.emit("newChannelState", msg.channelName, newState);
    } else {
      for (const [k, v] of Object.entries(newState)) {
        // @ts-ignore implicit any warning
        currentState[k] = v;
      }
      this.emit("newChannelState", msg.channelName, currentState);
    }
  }
}
