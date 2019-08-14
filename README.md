# dank-twitch-irc [![CircleCI](https://circleci.com/gh/robotty/dank-twitch-irc.svg?style=svg)](https://circleci.com/gh/robotty/dank-twitch-irc) [![codecov](https://codecov.io/gh/robotty/dank-twitch-irc/branch/master/graph/badge.svg)](https://codecov.io/gh/robotty/dank-twitch-irc)

Node.js-only Twitch IRC lib, written in TypeScript.

Requires Node.js 10 (LTS) or above.

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

client.on("PRIVMSG", msg => {
  console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
});

// See below for more events

client.connect();
client.join("forsen");
```

## Available client events

- **`client.on("connecting", () => { /* ... */ })`**: Called when the client
  starts connecting for the first time.
- **`client.on("connect", () => { /* ... */ })`**: Called when the client
  connects for the first time. This is called when the transport layer
  connections (e.g. TCP or WebSocket connection is established), not when login
  to IRC succeeds.
- **`client.on("ready", ()) => { /* ... */ })`**: Called when the client becomes
  ready for the first time (login to the chat server is successful.)
- **`client.on("close", (error?: Error) => { /* ... */ })`**: Called when the
  client is terminated as a whole. Not called for individual connections that
  were disconnected. Can be caused for example by a invalid OAuth token (failure
  to login), or when `client.close()` or `client.destroy()` was called. `error`
  is only non-null if the client was closed by a call to `client.close()`.
- **`client.on("error", (error: Error?) => { /* ... */ })`**: Called when any
  error occurs on the client, including non-fatal errors such as a message that
  could not be delivered due to an error.
- **`client.on("message", (message: IRCMessage) => { /* ... */ })`**: Called on
  every incoming message. If the message is a message that is further parsed (I
  called these "twitch messages" in this library) then the `message` passed to
  this handler will already be the specific type, e.g. `PrivmsgMessage` if the
  command is `PRIVMSG`.
- **`client.on("PRIVMSG", (message: PrivmsgMessage) => { /* ... */ })`**: Called
  on incoming messages whose command is `PRIVMSG`. The `message` parameter is
  always instanceof `PrivmsgMessage`. (See the API documentation for what
  properties exist on all `PrivmsgMessage` instances)

  For example:

  ```javascript
  client.on("CLEARCHAT", msg =>
    console.log(`${msg.targetUsername} just got timed out or banned`)
  );
  ```

  Other message types that have specific message parsing are:

  | Command and event name | Message type             | Description                                                                                                                                                                                                    |
  | ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `CLEARCHAT`            | `ClearchatMessage`       | Timeout and ban messages                                                                                                                                                                                       |
  | `CLEARMSG`             | `ClearmsgMessage`        | Single message deletions (initiated by `/delete`)                                                                                                                                                              |
  | `HOSTTARGET`           | `HosttargetMessage`      | A channel entering or exiting host mode.                                                                                                                                                                       |
  | `NOTICE`               | `NoticeMessage`          | Various notices, such as when you `/help`, a command fails, the error response when you are timed out, etc.                                                                                                    |
  | `PRIVMSG`              | `PrivmsgMessage`         | Normal chat messages                                                                                                                                                                                           |
  | `ROOMSTATE`            | `RoomstateMessage`       | A change to a channel's followers mode, subscribers-only mode, r9k mode, followers mode, slow mode etc.                                                                                                        |
  | `USERNOTICE`           | `UsernoticeMessage`      | Subs, resubs, sub gifts, rituals, raids, etc...                                                                                                                                                                |
  | `USERSTATE`            | `UserstateMessage`       | Your own state (e.g. badges, color, display name, emote sets, mod status), sent on every time you join a channel or send a `PRIVMSG` to a channel                                                              |
  | `GLOBALUSERSTATE`      | `GlobaluserstateMessage` | Logged in user's "global state", sent once on every login (Note that due to the used connection pool you can receive this multiple times during your bot's runtime)                                            |
  | `WHISPER`              | `WhisperMessage`         | Somebody else whispering you                                                                                                                                                                                   |
  | `JOIN`                 | `JoinMessage`            | You yourself joining a channel, of if you have `requestMembershipCapability` enabled, also other users joining channels you are joined to.                                                                     |
  | `PART`                 | `JoinMessage`            | You yourself parting (leaving) a channel, of if you have `requestMembershipCapability` enabled, also other users parting channels you are joined to.                                                           |
  | `RECONNECT`            | `ReconnectMessage`       | When the twitch server tells a client to reconnect and re-join channels (You don't have to listen for this yourself, this is done automatically already)                                                       |
  | `PING`                 | `PingMessage`            | When the twitch server sends a ping, expecting a pong back from the client to verify if the connection is still alive. (You don't have to listen for this yourself, the client automatically responds for you) |
  | `PONG`                 | `PongMessage`            | When the twitch server responds to our `PING` requests (The library automatically sends a `PING` request every 30 seconds to verify connections are alive)                                                     |
  | `CAP`                  | `CapMessage`             | Message type received once during connection startup, acknowledging requested capabilities.                                                                                                                    |

  All other commands (if they don't have a special parsed type like the ones
  listed above) will still be emitted under their command name, e.g.:

  ```javascript
  // :tmi.twitch.tv 372 botfactory :You are in a maze of twisty passages, all alike.
  // msg will be an instance of IRCMessage
  client.on("372", msg =>
    console.log(`Server MOTD is: ${msg.ircParameters[1]}`)
  );
  ```

## API Documentation

Generated API documentation can be found here:
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
  installDefaultMixins: false, // true by default

  // Don't reject the promises returned by client methods such as `.say()`.
  // On Error, they will be resolved with undefined instead.
  suppressPromiseRejections: true // false by default
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
const { ChatClient, AlternateMessageModifier } = require("dank-twitch-irc");

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
