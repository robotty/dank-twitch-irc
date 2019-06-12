# dank-twitch-irc [![CircleCI](https://circleci.com/gh/robotty/dank-twitch-irc.svg?style=svg)](https://circleci.com/gh/robotty/dank-twitch-irc)

Node.JS-only Twitch IRC lib, written in TypeScript.

## Import

```javascript
// TypeScript and ES6 modules:
import { Client } from 'dank-twitch-irc';
// CommonJS:
const { Client } = require('dank-twitch-irc');
```

## Usage

```javascript
let client = new Client();

client.onConnecting.sub(() => log.info('onConnecting'));
client.onConnect.sub(() => log.info('onConnect'));
client.onReady.sub(() => log.info('onReady'));
client.onError.sub((e) => log.warn('onError', fullStack(e)));
client.onClose.sub(() => log.info('onClose'));

client.subscribe('PRIVMSG', msg => {
    log.info('[#%s] %s: %s', msg.channelName, msg.displayName, msg.message);
});

log.info('Connecting...');c
await client.connect();
log.info('Connected');

await client.join('forsen');
```

## Documentation

Generated documentation can be found here: https://robotty.github.io/dank-twitch-irc

## Client options

Pass options to the `Client` constructor. More available options are documented in the
[`ClientConfiguration`](https://robotty.github.io/dank-twitch-irc/interfaces/clientconfiguration.html)
```javascript
let client = new Client({
    username: 'lowercase-login-name',
    password: 'oauth:xxxxxxxxxxxxx',
    
    // for automatically determining bot verification
    clientID: 'abcdef12345629i832d90kd320',
    
    // true by default
    receiveOwnMessagesBack: true
    
});
```

## Features

This client currently supports the following features:
  - Automatic connection pooling to keep joined channel count (per connection)
    small to improve connection stability
  - Automatic rate limiter for connection opening, PRIVMSG commands and whispering
  - Automatic bot verification fetching (for rate limiter)
  - All twitch-specific message types parsed (`CLEARCHAT`, `CLEARMSG`, `GLOBALUSERSTATE`, `HOSTTARGET`,
    `JOIN`, `NOTICE`, `PART`, `PING`, `PONG`, `PRIVMSG`, `RECONNECT`, `ROOMSTATE`, `USERNOTICE`,
    `USERSTATE`, `WHISPER`)
  - Accurate response to server responses (e.g. error thrown if you are banned from channel/channel
    is suspended/login is invalid etc.)
  - Highly efficient bulk join functionality that gets your bot connected even to a large number of channels
    in seconds
  - Implements the recommended connection control, utilizing `RECONNECT`, `PING` and `PONG`
  - Automatically appends invisible character to duplicate messages for non-VIP and non-moderator bots
    (VIP and Mod status is automatically sensed)
  - Full tracking of room state (e.g. submode, emote-only mode, followers mode, r9k etc.) and user state
    (badges, moderator state, color, etc).
  - Most function calls return promises but errors can also be handled by subscribing to the error event.
  - Slow-mode rate limiter for non-VIP/moderator bots (waits either the global ~1.5 sec/channel-specific slow mode)

## Tests

Test runner is mocha and assertion library is Chai in expect-style.
Tests are mostly a TODO thing for now :)
