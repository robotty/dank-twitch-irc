# dank-twitch-irc [![CircleCI](https://circleci.com/gh/robotty/dank-twitch-irc.svg?style=svg)](https://circleci.com/gh/robotty/dank-twitch-irc) [![codecov](https://codecov.io/gh/robotty/dank-twitch-irc/branch/master/graph/badge.svg)](https://codecov.io/gh/robotty/dank-twitch-irc) [![Maintainability](https://api.codeclimate.com/v1/badges/ec6b5c956de4ed3071ab/maintainability)](https://codeclimate.com/github/robotty/dank-twitch-irc/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/ec6b5c956de4ed3071ab/test_coverage)](https://codeclimate.com/github/robotty/dank-twitch-irc/test_coverage)

Node.js-only Twitch IRC lib, written in TypeScript.

Requires Node.js 10 (LTS) or above.

- [View on GitHub](https://github.com/robotty/dank-twitch-irc)
- [View on npm](https://www.npmjs.com/package/dank-twitch-irc)
- [View documentation](https://robotty.github.io/dank-twitch-irc/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Usage](#usage)
- [Available client events](#available-client-events)
  - [Handling `USERNOTICE` messages](#handling-usernotice-messages)
    - [Sub and resub](#sub-and-resub)
    - [Incoming raids](#incoming-raids)
    - [Subgift](#subgift)
    - [Anonsubgift](#anonsubgift)
    - [anongiftpaidupgrade, giftpaidupgrade](#anongiftpaidupgrade-giftpaidupgrade)
    - [ritual](#ritual)
    - [bitsbadgetier](#bitsbadgetier)
- [ChatClient API](#chatclient-api)
- [API Documentation](#api-documentation)
- [Client options](#client-options)
- [Features](#features)
- [Extra Mixins](#extra-mixins)
- [Tests](#tests)
- [Lint and check code style](#lint-and-check-code-style)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
  client.on("CLEARCHAT", msg => {
    if (msg.isTimeout()) {
      console.log(
        `${msg.targetUsername} just got timed out for ` +
          `${msg.banDuration} seconds in channel ${msg.channelName}`
      );
    }
  });
  ```

  Other message types that have specific message parsing are:

  - **`CLEARCHAT`** (maps to [`ClearchatMessage`][clearchat]) - Timeout and ban
    messages
  - **`CLEARMSG`** (maps to [`ClearmsgMessage`][clearmsg]) - Single message
    deletions (initiated by `/delete`)
  - **`HOSTTARGET`** (maps to [`HosttargetMessage`][hosttarget]) - A channel
    entering or exiting host mode.
  - **`NOTICE`** (maps to [`NoticeMessage`][notice]) - Various notices, such as
    when you `/help`, a command fails, the error response when you are timed
    out, etc.
  - **`PRIVMSG`** (maps to [`PrivmsgMessage`][privmsg]) - Normal chat messages
  - **`ROOMSTATE`** (maps to [`RoomstateMessage`][roomstate]) - A change to a
    channel's followers mode, subscribers-only mode, r9k mode, followers mode,
    slow mode etc.
  - **`USERNOTICE`** (maps to [`UsernoticeMessage`][usernotice]) - Subs, resubs,
    sub gifts, rituals, raids, etc. - See more details about how to handle this
    message type below.
  - **`USERSTATE`** (maps to [`UserstateMessage`][userstate]) - Your own state
    (e.g. badges, color, display name, emote sets, mod status), sent on every
    time you join a channel or send a `PRIVMSG` to a channel
  - **`GLOBALUSERSTATE`** (maps to
    [`GlobaluserstateMessage`][globaluserstate]) - Logged in user's "global
    state", sent once on every login (Note that due to the used connection pool
    you can receive this multiple times during your bot's runtime)
  - **`WHISPER`** (maps to [`WhisperMessage`][whisper]) - Somebody else
    whispering you
  - **`JOIN`** (maps to [`JoinMessage`][join]) - You yourself joining a channel,
    of if you have `requestMembershipCapability` enabled, also other users
    joining channels you are joined to.
  - **`PART`** (maps to [`JoinMessage`][part]) - You yourself parting (leaving)
    a channel, of if you have `requestMembershipCapability` enabled, also other
    users parting channels you are joined to.
  - **`RECONNECT`** (maps to [`ReconnectMessage`][reconnect]) - When the twitch
    server tells a client to reconnect and re-join channels (You don't have to
    listen for this yourself, this is done automatically already)
  - **`PING`** (maps to [`PingMessage`][ping]) - When the twitch server sends a
    ping, expecting a pong back from the client to verify if the connection is
    still alive. (You don't have to listen for this yourself, the client
    automatically responds for you)
  - **`PONG`** (maps to [`PongMessage`][pong]) - When the twitch server responds
    to our `PING` requests (The library automatically sends a `PING` request
    every 30 seconds to verify connections are alive)
  - **`CAP`** (maps to [`CapMessage`][cap]) - Message type received once during
    connection startup, acknowledging requested capabilities.

All other commands (if they don't have a special parsed type like the ones
listed above) will still be emitted under their command name as an
[`IRCMessage`][ircmessage], e.g.:

```javascript
// :tmi.twitch.tv 372 botfactory :You are in a maze of twisty passages, all alike.
// msg will be an instance of IRCMessage
client.on("372", msg => console.log(`Server MOTD is: ${msg.ircParameters[1]}`));
```

### Handling `USERNOTICE` messages

The `USERNOTICE` message type is special because it encapsulates a wide range of
events, including:

- Subs
- Resubs
- Gift subscription
- Incoming raid and
- Channel rituals,

which are all emitted under the `USERNOTICE` event. See also
[the offical documentation](https://dev.twitch.tv/docs/irc/tags/#usernotice-twitch-tags)
about the `USERNOTICE` command.

Every `USERNOTICE` message is sent by a user, and always contains a
`msg.systemMessage` (This is a message that twitch formats for you, e.g.
`4 raiders from PotehtoO have joined!` for a `raid` message.) Additionally,
every `USERNOTICE` message can have a message that is additionally sent/shared
from the sending user, for example the "share this message with the streamer"
message sent with resubs and subs. If no message is sent by the user,
`msg.messageText` is `undefined`.

`dank-twitch-irc` currently does not have special parsing code for each
`USERNOTICE` `messageTypeID` (e.g. `sub`, `resub`, `raid`, etc...) - Instead the
parser assigns all `msg-param-` tags to the `msg.msgParams` object. See below on
what `msg.msgParams` are available for each of the `messageTypeID`s.

<details>
<summary>
Here's examples on how to handle each of these events with `dank-twitch-irc`: (Click to expand)
</summary>

#### Sub and resub

When a user subscribes or resubscribes with his own money/prime (this is NOT
sent for gift subs, see below)

```javascript
chatClient.on("USERNOTICE", msg => {
  // sub and resub messages have the same parameters, so we can handle them both the same way
  if (!msg.isSub() && !msg.isResub()) {
    return;
  }

  /*
   * msg.msgParams are:
   *
   * {
   *   "cumulativeMonths": 10,
   *   "cumulativeMonthsRaw": "10",
   *   "subPlan": "1000", // Prime, 1000, 2000 or 3000
   *   "subPlanName": "The Ninjas",
   *
   *   // if shouldShareStreak is false, then
   *   // streakMonths/streakMonthsRaw will be 0
   *   // (the user did not share their sub streak in chat)
   *   "shouldShareStreak": true,
   *   "streakMonths": 7,
   *   "streakMonthsRaw": "7"
   * }
   * Sender user of the USERNOTICE message is the user subbing/resubbing.
   */

  if (msg.isSub()) {
    // Leppunen just subscribed to ninja with a tier 1000 (The Ninjas) sub for the first time!
    console.log(
      msg.displayName +
        " just subscribed to " +
        msg.channelName +
        " with a tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams.subPlanName +
        ") sub for the first time!"
    );
  } else if (msg.isResub()) {
    let streakMessage = "";
    if (msg.msgParams.shouldShareStreak) {
      streakMessage =
        ", currently " + msg.msgParams.streakMonths + " months in a row";
    }

    // Leppunen just resubscribed to ninja with a tier 1000 (The Ninjas) sub!
    // They are resubscribing for 10 months, currently 7 months in a row!
    console.log(
      msg.displayName +
        " just resubscribed to " +
        msg.channelName +
        " with a tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams.subPlanName +
        ") sub! They are resubscribing for " +
        msg.msgParams.cumulativeMonths +
        " months" +
        streakMessage +
        "!"
    );
  }

  if (msg.messageText != null) {
    // you also have access to lots of other properties also present on PRIVMSG messages,
    // such as msg.badges, msg.senderUsername, msg.badgeInfo, msg.bits/msg.isCheer(),
    // msg.color, msg.emotes, msg.messageID, msg.serverTimestamp, etc...
    console.log(
      msg.displayName +
        " shared the following message with the streamer: " +
        msg.messageText
    );
  } else {
    console.log("They did not share a message with the streamer.");
  }
});
```

#### Incoming raids

Twitch says:

> Incoming raid to a channel. Raid is a Twitch tool that allows broadcasters to
> send their viewers to another channel, to help support and grow other members
> in the community.)

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isRaid()) {
    return;
  }

  /*
   * msg.msgParams are:
   * {
   *   "displayName": "Leppunen",
   *   "login": "leppunen",
   *   "viewerCount": 12,
   *   "viewerCountRaw": "12"
   * }
   * Sender user of the USERNOTICE message is the user raiding this channel.
   * Note that the display name and login present in msg.msgParams are
   * the same as msg.displayName and msg.senderUsername, so it doesn't matter
   * which one you use (although I recommend the properties directly on the
   * message object, not in msgParams)
   */

  // source user is the channel/streamer raiding
  // Leppunen just raided Supinic with 12 viewers!
  console.log(
    msg.displayName +
      " just raided " +
      msg.channelName +
      " with " +
      msg.msgParams.viewerCount +
      " viewers!"
  );
});
```

#### Subgift

When a user gifts somebody else a subscription.

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isSubgift()) {
    return;
  }

  /*
   * msg.msgParams are:
   * {
   *   "months": 5,
   *   "monthsRaw": "5",
   *   "recipientDisplayName": "Leppunen",
   *   "recipientID": "42239452",
   *   "recipientUsername": "leppunen",
   *   "subPlan": "1000",
   *   "subPlanName": "The Ninjas"
   * }
   * Sender user of the USERNOTICE message is the user gifting the subscription.
   */

  if (msg.msgParams.months === 1) {
    // Leppunen just gifted NymN a fresh tier 1000 (The Ninjas) sub to ninja!
    console.log(
      msg.displayName +
        " just gifted " +
        msg.msgParams.recipientDisplayName +
        " a fresh tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams +
        ") sub to " +
        msg.channelName +
        "!"
    );
  } else {
    // Leppunen just gifted NymN a tier 1000 (The Ninjas) resub to ninja, that's 7 months in a row!
    console.log(
      msg.displayName +
        " just gifted " +
        msg.msgParams.recipientDisplayName +
        " a tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams +
        ") resub to " +
        msg.channelName +
        ", that's " +
        msg.msgParams.months +
        " in a row!"
    );
  }

  // note: if the subgift was from an anonymous user, the sender user for the USERNOTICE message will be
  // AnAnonymousGifter (user ID 274598607)
  if (msg.senderUserID === "274598607") {
    console.log("That (re)sub was gifted anonymously!");
  }
});
```

#### Anonsubgift

When an anonymous user gifts a subscription to a viewer.

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isAnonSubgift()) {
    return;
  }

  /*
   * msg.msgParams are:
   * {
   *   "months": 5,
   *   "monthsRaw": "5",
   *   "recipientDisplayName": "Leppunen",
   *   "recipientID": "42239452",
   *   "recipientUsername": "leppunen",
   *   "subPlan": "1000",
   *   "subPlanName": "The Ninjas"
   * }
   *
   * WARNING! Sender user of the USERNOTICE message is the broadcaster (e.g. Ninja
   * in the example below)
   */

  if (msg.msgParams.months === 1) {
    // An anonymous gifter just gifted NymN a fresh tier 1000 (The Ninjas) sub to ninja!
    console.log(
      "An anonymous gifter just gifted " +
        msg.msgParams.recipientDisplayName +
        " a fresh tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams +
        ") sub to " +
        msg.channelName +
        "!"
    );
  } else {
    // An anonymous gifter just gifted NymN a tier 1000 (The Ninjas) resub to ninja, that's 7 months in a row!
    console.log(
      "An anonymous gifter just gifted " +
        msg.msgParams.recipientDisplayName +
        " a tier " +
        msg.msgParams.subPlan +
        " (" +
        msg.msgParams +
        ") resub to " +
        msg.channelName +
        ", that's " +
        msg.msgParams.months +
        " in a row!"
    );
  }
});
```

#### anongiftpaidupgrade, giftpaidupgrade

When a user commits to continue the gift sub by another user (or an anonymous
gifter).

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isAnonGiftPaidUpgrade()) {
    return;
  }

  /*
   * msg.msgParams are:
   * EITHER: (ONLY when a promotion is running!)
   * {
   *   "promoName": "Subtember 2018",
   *   "promoGiftTotal": 3987234,
   *   "promoGiftTotalRaw": "3987234"
   * }
   * OR: (when no promotion is running)
   * {}
   *
   * Sender user of the USERNOTICE message is the user continuing their sub.
   */

  // Leppunen is continuing their ninja gift sub they got from an anonymous user!
  console.log(
    msg.displayName +
      " is continuing their " +
      msg.channelName +
      " gift sub they got from an anonymous user!"
  );
});
```

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isGiftPaidUpgrade()) {
    return;
  }

  /*
   * msg.msgParams are:
   * EITHER: (ONLY when a promotion is running!)
   * {
   *   "promoName": "Subtember 2018",
   *   "promoGiftTotal": 3987234,
   *   "promoGiftTotalRaw": "3987234",
   *   "senderLogin": "krakenbul",
   *   "senderName": "Krakenbul"
   * }
   * OR: (when no promotion is running)
   * {
   *   "senderLogin": "krakenbul",
   *   "senderName": "Krakenbul"
   * }
   *
   * Sender user of the USERNOTICE message is the user continuing their sub.
   */

  // Leppunen is continuing their ninja gift sub they got from Krakenbul!
  console.log(
    msg.displayName +
      " is continuing their " +
      msg.channelName +
      " gift sub they got from " +
      msg.msgParam.senderName +
      "!"
  );
});
```

#### ritual

Channel ritual. Twitch says:

> Channel _ritual_. Many channels have special rituals to celebrate viewer
> milestones when they are shared. The rituals notice extends the sharing of
> these messages to other viewer milestones (initially, a new viewer chatting
> for the first time).

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isRitual()) {
    return;
  }

  /*
   * msg.msgParams are:
   * {
   *   "ritualName": "new_chatter"
   * }
   *
   * Sender user of the USERNOTICE message is the user performing the
   * ritual (e.g. the new chatter).
   */

  // Leppunen is new to ninja's chat! Say hello!
  if (msg.msgParams.ritualName === "new_chatter") {
    console.log(
      msg.displayName + " is new to " + msg.channelName + "'s chat! Say hello!"
    );
  } else {
    console.warn(
      "Unknown (unhandled) ritual type: " + msg.msgParams.ritualName
    );
  }
});
```

#### bitsbadgetier

When a user cheers and earns himself a new bits badge with that cheer (e.g. they
just cheered more than/exactly 10000 bits in total, and just earned themselves
the 10k bits badge)

```javascript
chatClient.on("USERNOTICE", msg => {
  if (!msg.isBitsBadgeTier()) {
    return;
  }

  /*
   * msg.msgParams are:
   * {
   *   "threshold": 10000,
   *   "thresholdRaw": "10000",
   * }
   *
   * Sender user of the USERNOTICE message is the user cheering the bits.
   */

  // Leppunen just earned themselves the 10000 bits badge in ninja's channel!
  console.log(
    msg.displayName +
      " just earned themselves the " +
      msg.threshold +
      " bits badge in " +
      msg.channelName +
      "'s channel!"
  );
});
```

</details>

## ChatClient API

You probably will want to use these functions on `ChatClient` most frequently:

- `client.join(channelName: string): Promise<void>` - Join (Listen to) the
  channel given by the channel name
- `client.joinAll(channelNames: string[]): Promise<void>` - Join (Listen to) all
  of the listed channels at once (bulk join)
- `client.part(channelName: string): Promise<void>` - Part (Leave/Unlisten) the
  channel given by the channel name
- `client.privmsg(channelName: string, message: string): Promise<void>` - Send a
  raw `PRIVMSG` to the given channel. You can issue chat commands with this
  function, e.g. `client.privmsg("forsen", "/timeout weeb123 5")` or normal
  messages, e.g. `client.privmsg("forsen", "Kappa Keepo PogChamp")`.
- `client.say(channelName: string, message: string): Promise<void>` - Say a
  normal chat message in the given channel. If a command is given as `message`,
  it will be escaped.
- `client.me(channelName: string, message: string): Promise<void>` - Post a
  `/me` message in the given channel.
- `client.timeout(channelName: string, username: string, length: number, reason?: string): Promise<void>` -
  Timeout `username` for `length` seconds in `channelName`. Optionally accepts a
  reason to set.
- `client.ping()` - Send a `PING` on a connection from the pool, and awaits the
  `PONG` response. You can use this to measure server latency, for example.
- `client.whisper(username: string, message: string)` - Send the user a whisper
  from the bot.

Extra functionality:

- `client.sendRaw(command: string): void` - Send a raw IRC command to a
  connection in the connection pool.
- `client.unconnected (boolean)` - Returns whether the client is unconnected.
- `client.connecting (boolean)` - Returns whether the client is connecting.
- `client.connected (boolean)` - Returns whether the client is connected
  (Transport layer is connected).
- `client.ready (boolean)` - Returns whether the client is ready (Logged into
  IRC server).
- `client.closed (boolean)` - Returns whether the client is closed.

Note that channel names in the above functions always refer to the "login name"
of a twitch channel. Channel names may not be capitalized, e.g. `Forsen` would
be invalid, but `forsen` not. This library also does not accept the leading `#`
character and never returns it on any message objects (e.g. `msg.channelName`
would be `forsen`, not `#forsen`).

## API Documentation

Generated API documentation can be found here:
https://robotty.github.io/dank-twitch-irc

## Client options

Pass options to the `ChatClient` constructor. More available options are
documented in the Below are all possible options and their default values:

```javascript
let client = new ChatClient({
  username: "your-bot-username", // justinfan12345 by default - For anonymous chat connection
  password: "0123456789abcdef1234567", // undefined by default (no password)

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

  // Silence UnandledPromiseRejectionWarnings on all client methods
  // that return promises.
  // With this option enabled, the returned promises will still be rejected/
  // resolved as without this option, this option ONLY silences the
  // UnhandledPromiseRejectionWarning.
  ignoreUnhandledPromiseRejections: true // false by default
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
  message within a 30 seconds period. You must also use `client.say` and
  `client.me` for this mixin to behave consistently and reliably.
- `new SlowModeRateLimiter(client, /* optional */ maxWaitingMessages)` will rate
  limit your messages in channels where your bot is not moderator, VIP or
  broadcaster and has to wait a bit between sending messages. If more than
  `maxWaitingMessages` are waiting, the outgoing message will be dropped
  silently. `maxWaitingMessages` defaults to 10. Note this mixin only has an
  effect on `client.say` and `client.me` functions, not `client.privmsg`.

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
- `new IgnoreUnhandledPromiseRejectionsMixin()` - Silences
  `UnhandledPromiseRejectionWarning`s on promises returned by the client's
  functions. (installed for you if you activate the
  `ignoreUnhandledPromiseRejections` client option)

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

[clearchat]: https://robotty.github.io/dank-twitch-irc/classes/clearchatmessage.html
[clearmsg]: https://robotty.github.io/dank-twitch-irc/classes/clearmsgmessage.html
[hosttarget]: https://robotty.github.io/dank-twitch-irc/classes/hosttargetmessage.html
[notice]: https://robotty.github.io/dank-twitch-irc/classes/noticemessage.html
[privmsg]: https://robotty.github.io/dank-twitch-irc/classes/privmsgmessage.html
[roomstate]: https://robotty.github.io/dank-twitch-irc/classes/roomstatemessage.html
[usernotice]: https://robotty.github.io/dank-twitch-irc/classes/usernoticemessage.html
[userstate]: https://robotty.github.io/dank-twitch-irc/classes/userstatemessage.html
[globaluserstate]: https://robotty.github.io/dank-twitch-irc/classes/globaluserstatemessage.html
[whisper]: https://robotty.github.io/dank-twitch-irc/classes/whispermessage.html
[join]: https://robotty.github.io/dank-twitch-irc/classes/joinmessage.html
[part]: https://robotty.github.io/dank-twitch-irc/classes/partmessage.html
[reconnect]: https://robotty.github.io/dank-twitch-irc/classes/reconnectmessage.html
[ping]: https://robotty.github.io/dank-twitch-irc/classes/pingmessage.html
[pong]: https://robotty.github.io/dank-twitch-irc/classes/pongmessage.html
[cap]: https://robotty.github.io/dank-twitch-irc/classes/capmessage.html
[ircmessage]: https://robotty.github.io/dank-twitch-irc/classes/ircmessage.html
