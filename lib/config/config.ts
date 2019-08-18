import { Duplex } from "stream";
import { ConnectionRateLimits } from "../mixins/ratelimiters/connection";
import { MessageRateLimits, PresetKeys } from "./message-rate-limits";

export interface DuplexTransportConfiguration {
  type: "duplex";
  stream: () => Duplex;

  /**
   * Whether this stream is already set up (user logged in and
   * capabilities enabled). Defaults to false.
   */
  preSetup?: boolean;
}

export interface TcpTransportConfiguration {
  type?: "tcp";
  secure: boolean;
  host: string;
  port: number;
}

export type BasicTcpTransportConfiguration = Omit<
  TcpTransportConfiguration,
  "host" | "port"
>;

export interface WebSocketTransportConfiguration {
  type: "websocket";
  url: string;
}

export interface PresetWebSocketTransportConfiguration {
  type: "websocket";
  secure: boolean;
}

export type TransportConfiguration =
  | DuplexTransportConfiguration
  | TcpTransportConfiguration
  | BasicTcpTransportConfiguration
  | WebSocketTransportConfiguration
  | PresetWebSocketTransportConfiguration;

export type CustomRateLimitsConfig = MessageRateLimits;

// "default" | "knownBot" | "verifiedBot" | { ... } (custom config)
export type RateLimitsConfig = PresetKeys | CustomRateLimitsConfig;

export interface ClientConfiguration {
  /**
   * lowercase twitch login name
   */
  username?: string;

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
  requestMembershipCapability?: boolean;

  connection?: TransportConfiguration;

  /**
   * Maximum number of channels the client will allow one connection to be joined to. 100 by default.
   */
  maxChannelCountPerConnection?: number;

  rateLimits?: RateLimitsConfig;
  connectionRateLimits?: ConnectionRateLimits;
  installDefaultMixins?: boolean;
  ignoreUnhandledPromiseRejections?: boolean;
}
