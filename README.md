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

## Client options

Pass options to the `Client` constructor. More available options are documented in the [`ClientConfiguration`](./docs/interfaces/clientconfiguration.html)
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

## Tests

Test runner is mocha and assertion library is Chai in expect-style.
