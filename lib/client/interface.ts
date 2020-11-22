import { IRCMessage } from "../message/irc/irc-message";
import { TwitchCommands } from "../message/parser/twitch-message";
import { SingleConnection } from "./connection";

export enum ClientState {
  UNCONNECTED,
  CONNECTING,
  CONNECTED,
  READY,
  CLOSED,
}

export interface ClientStateChangeEvent {
  oldState: ClientState;
  newState: ClientState;
}

export interface SpecificConnectionEvents {
  connecting: [];
  connect: [];
  ready: [];
  close: [Error | undefined];
  error: [Error];

  message: [IRCMessage];
}

export interface SpecificClientEvents {
  connecting: [];
  connect: [];
  ready: [];
  close: [Error | undefined];
  error: [Error];

  message: [IRCMessage];

  reconnect: [SingleConnection];

  rawCommmand: [string];
}

// these are the events that are mapped to twitch messages (e.g. PRIVMSG)
export type TwitchMessageEvents = {
  [P in keyof TwitchCommands]: [InstanceType<TwitchCommands[P]>];
};

// these are all other messages that are not mapped to twitch messages specifically, e.g. 001
export interface IRCMessageEvents {
  [command: string]: [IRCMessage];
}

export type ClientEvents = SpecificClientEvents &
  TwitchMessageEvents &
  IRCMessageEvents;
