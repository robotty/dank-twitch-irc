import * as EventEmitter from "eventemitter3";
import { ChatClient } from "../client/client";
import {
  GlobalUserState,
  GlobaluserstateMessage,
} from "../message/twitch-types/globaluserstate";
import { PrivmsgMessage } from "../message/twitch-types/privmsg";
import { UserState, UserstateMessage } from "../message/twitch-types/userstate";
import { ClientMixin } from "./base-mixin";

export interface UserStateTrackerEvents {
  newGlobalState: [GlobalUserState];
  newChannelState: [string, UserState];
  [idx: string]: any;
}

/**
 * Tracks the state of the logged in user (the bot) in all channels the bot operates in
 */
export class UserStateTracker extends EventEmitter<UserStateTrackerEvents>
  implements ClientMixin {
  public globalState?: GlobalUserState;
  public channelStates: Record<string, UserState> = {};
  private readonly client: ChatClient;

  public constructor(client: ChatClient) {
    super();
    this.client = client;
  }

  public getChannelState(channelName: string): UserState | undefined {
    return this.channelStates[channelName];
  }

  public getGlobalState(): GlobalUserState | undefined {
    return this.globalState;
  }

  public applyToClient(client: ChatClient): void {
    client.userStateTracker = this;
    client.on("USERSTATE", this.onUserstateMessage.bind(this));
    client.on("GLOBALUSERSTATE", this.onGlobaluserstateMessage.bind(this));
    client.on("PRIVMSG", this.onPrivmsgMessage.bind(this));
  }

  private onUserstateMessage(msg: UserstateMessage): void {
    const newState = msg.extractUserState();
    this.channelStates[msg.channelName] = newState;
    this.emit("newChannelState", msg.channelName, newState);
  }

  private onGlobaluserstateMessage(msg: GlobaluserstateMessage): void {
    this.globalState = msg.extractGlobalUserState();
    this.emit("newGlobalState", this.globalState);
  }

  private onPrivmsgMessage(msg: PrivmsgMessage): void {
    if (msg.senderUsername !== this.client.configuration.username) {
      return;
    }

    const channelState = this.channelStates[msg.channelName];
    if (channelState != null) {
      const newState = Object.assign({}, channelState, msg.extractUserState());
      this.channelStates[msg.channelName] = newState;
      this.emit("newChannelState", msg.channelName, newState);
    }
  }
}
