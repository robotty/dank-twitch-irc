import { setDefaults } from "../utils/set-defaults";
import {
  BasicTcpTransportConfiguration,
  ClientConfiguration,
  DuplexTransportConfiguration,
  RateLimitsConfig,
  TcpTransportConfiguration,
  TransportConfiguration,
  WebSocketTransportConfiguration
} from "./config";
import {
  messageRateLimitPresets,
  MessageRateLimits
} from "./message-rate-limits";

export type ExpandedDuplexTransportConfiguration = Required<
  DuplexTransportConfiguration
>;

export type ExpandedTcpTransportConfiguration = Required<
  TcpTransportConfiguration
> & {
  preSetup: false;
};

export type ExpandedWebSocketTransportConfiguration = WebSocketTransportConfiguration & {
  preSetup: false;
};

export type ExpandedTransportConfiguration =
  | ExpandedDuplexTransportConfiguration
  | ExpandedTcpTransportConfiguration
  | ExpandedWebSocketTransportConfiguration;

export type ExpandedClientConfiguration = Required<
  Omit<ClientConfiguration, "connection" | "password" | "rateLimits">
> & {
  password: string | undefined;
  connection: ExpandedTransportConfiguration;
  rateLimits: MessageRateLimits;
};

const defaults: Omit<
  ExpandedClientConfiguration,
  "connection" | "rateLimits"
> & {
  connection: BasicTcpTransportConfiguration;
} = {
  username: "justinfan12345",
  password: undefined,
  requestMembershipCapability: false,

  maxChannelCountPerConnection: 90,

  connection: {
    type: "tcp",
    secure: true
  },

  connectionRateLimits: {
    parallelConnections: 1,
    releaseTime: 2000 // 2 seconds
  },

  installDefaultMixins: true,
  ignoreUnhandledPromiseRejections: false
};

export function expandTransportConfig(
  config: TransportConfiguration | undefined
): ExpandedTransportConfiguration {
  if (config == null) {
    return expandTransportConfig({
      secure: true
    });
  }

  switch (config.type) {
    case "tcp":
    case undefined:
      let host;
      let port;

      if ("host" in config && "port" in config) {
        host = config.host;
        port = config.port;
      } else {
        host = "irc.chat.twitch.tv";
        port = config.secure ? 6697 : 6667;
      }

      return {
        type: "tcp",
        secure: config.secure,
        host,
        port,
        preSetup: false
      };

    case "duplex":
      return setDefaults(config, { preSetup: false });

    case "websocket":
      let url;
      if ("url" in config) {
        url = config.url;
      } else {
        url = (config.secure ? "wss" : "ws") + "://irc-ws.chat.twitch.tv";
      }

      return {
        type: "websocket",
        url,
        preSetup: false
      };

    default:
      throw new Error("Unknown transport type");
  }
}

export function expandRateLimitsConfig(
  config: RateLimitsConfig | undefined
): MessageRateLimits {
  if (config == null) {
    return messageRateLimitPresets.default;
  }

  if (typeof config === "string") {
    return messageRateLimitPresets[config];
  } else {
    return config;
  }
}

export function expandConfig(
  config?: ClientConfiguration
): ExpandedClientConfiguration {
  const newConfig = setDefaults(
    config,
    defaults
  ) as ExpandedClientConfiguration;

  newConfig.username = newConfig.username.toLowerCase();
  newConfig.connection = expandTransportConfig(newConfig.connection);
  newConfig.rateLimits = expandRateLimitsConfig(newConfig.rateLimits);
  return newConfig;
}
