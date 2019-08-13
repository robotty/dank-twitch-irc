# dank-twitch-irc [![CircleCI](https://circleci.com/gh/robotty/dank-twitch-irc.svg?style=svg)](https://circleci.com/gh/robotty/dank-twitch-irc) ![Codecov](https://img.shields.io/codecov/c/github/robotty/dank-twitch-irc?token=bc46f1da4846461f99b4f0317b7cab82)

Node.js-only Twitch IRC lib, written in TypeScript.

This library is **not** compatible with Node.JS LTS until i set up babel or
something. For now you need Node.js 12 or later.

## Usage

```javascript
const { ChatClient } = require("dank-twitch-irc");

let client = new ChatClient();

client.on("ready", () => console.log("Successfully connected to chat"));
client.on("close", error => {
  if (error != null) {
    console.error("Client closed due to error", error);
  }
});

// .on("COMMANDNAME", msg => {}) for that command
// or .on("message", msg => {}) for all messages
client.on("PRIVMSG", msg => {
  console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
});

// More events are listed under https://robotty.github.io/dank-twitch-irc/interfaces/specificclientevents.html

client.connect();
client.join("forsen");
```

## API Documentation

Generated documentation can be found here:
https://robotty.github.io/dank-twitch-irc

## Client options

Pass options to the `ChatClient` constructor. More available options are
documented in the Below are all possible options and their default values:

```javascript
let client = new ChatClient({
  username: "your-bot-username", // justinfan12345 by default - For anonymous chat connection
  password: "oauth:bot-access-token", // undefined by default (no password)

  // Message rate limits configuration for verified and known bots
  // pick one of the presets or configure custom rates as shown below:
  rateLimits: "default",
  // or:
  rateLimits: "knownBot",
  // or:
  rateLimits: "verifiedBot",
  // or:
  rateLimits: {
    highPrivmsgLimits: 100,
    lowPrivmsgLimits: 20
  },

  // Configuration options for the backing connections:
  // Plain TCP or TLS
  connection: {
    type: "tcp", // tcp by default
    secure: false, // true by default
    // host and port must both be specified at once
    host: "custom-chat-server.com", // irc.chat.twitch.tv by default
    port: 1234 // 6697/6667 by default, depending on the "secure" setting
  },
  // or:
  connection: {
    type: "websocket",
    secure: true // use preset URL of irc-ws.chat.twitch.tv
  },
  // or:
  connection: {
    type: "websocket",
    url: "wss://custom-url.com/abc/def" // custom URL
  },
  // or:
  connection: {
    type: "duplex",
    stream: () => aNodeJsDuplexInstance, // read and write to a custom object
    // implementing the Duplex interface from Node.js
    // the function you specify is called for each new connection

    preSetup: true // false by default, makes the lib skip login
    // and capabilities negotiation on connection startup
  },

  // how many channels each individual connection should join at max
  maxChannelCountPerConnection: 100, // 50 by default

  // custom parameters for connection rate limiting
  connectionRateLimits: {
    parallelConnections: 5, // 10 by default
    // time to wait after each connection before a new connection can begin
    releaseTime: 20 * 1000 // in milliseconds, 10 seconds by default
  },

  // I recommend you leave this off by default, it makes your bot faster
  // If you need live update of who's joining and leaving chat,
  // poll the tmi.twitch.tv chatters endpoint instead since it
  // is also more reliable
  requestMembershipCapability: false, // false by default

  // read more about mixins below
  // this disables the connection rate limiter, message rate limiter
  // and Room- and Userstate trackers (which are important for other mixins)
  installDefaultMixins: false // true by default
});
```

## Features

This client currently supports the following features:

- Connection pooling and round-robin connection usage
- Automatic rate limiter for connection opening and chat commands
- All twitch-specific message types parsed (`CLEARCHAT`, `CLEARMSG`,
  `GLOBALUSERSTATE`, `HOSTTARGET`, `JOIN`, `NOTICE`, `PART`, `PING`, `PONG`,
  `PRIVMSG`, `RECONNECT`, `ROOMSTATE`, `USERNOTICE`, `USERSTATE`, `WHISPER`,
  `CAP`)
- Accurate response to server responses (e.g. error thrown if you are banned
  from channel/channel is suspended/login is invalid etc.)
- Bulk join functionality to join lots of channels quickly
- Implements the recommended connection control, utilizing `RECONNECT`, `PING`
  and `PONG`
- Full tracking of room state (e.g. submode, emote-only mode, followers mode,
  r9k etc.) and user state (badges, moderator state, color, etc).
- Most function calls return promises but errors can also be handled by
  subscribing to the error event
- Slow-mode rate limiter for non-VIP/moderator bots (waits either the global
  ~1.3 sec/channel-specific slow mode)
- Support for different types of transport (in-memory, TCP, WebSocket)

## Extra Mixins

There are some features you might find useful in your bot that are not necessary
for general client/bot operations, so they were packaged as **mixins**. You can
activate mixins by calling:

```javascript
const { ChatClient } = require("dank-twitch-irc");
const { AlternateMessageModifier } = require("dank-twitch-irc/mixins");

let client = new ChatClient();

client.use(new AlternateMessageModifier(client));
```

Available mixins are:

- `new AlternateMessageModifier(client)` will allow your bot to send the same
  message within a 30 seconds period.
- `new SlowModeRateLimiter(client, /* optional */ maxWaitingMessages)` will rate
  limit your messages in channels where your bot is not moderator, VIP or
  broadcaster and has to wait a bit between sending messages. If more than
  `maxWaitingMessages` are waiting, the outgoing message will be dropped
  silently. `maxWaitingMessages` defaults to 10.

and the mixins installed by default:

- `new PrivmsgMessageRateLimiter(client)` - Rate limits outgoing messages
  according to the rate limits imposed by Twitch. Configure the verified/known
  status of your bot using the config (see above).
- `new ConnectionRateLimiter(client)` - Rate limits new connections accoding to
  the rate limits set in the config.
- `new UserStateTracker(client)` - Used by other mixins. Keeps track of what
  state your bot user has in all channels.
- `new RoomStateTracker()` - Used by other mixins. Keeps track of each channel's
  state, e.g. sub-mode etc.
- `new IgnorePromiseRejectionsMixin()` - Swallows rejected promises returned by
  the client's functions.

## Tests

    npm run test

Test run report is available in `./mochawesome-report/mochawesome.html`.
Coverage report is produced as `./coverage/index.html`.

## Lint and check code style

```bash
# Run eslint and tslint rules and checks code style with prettier
npm run lint
```

```bash
# Run eslint, tslint and pretter fixers
npm run lintfix
```
