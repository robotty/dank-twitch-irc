import 'source-map-support/register';

if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let longjohn = require('longjohn');
    // eslint-disable-next-line @typescript-eslint/camelcase
    longjohn.async_trace_limit = -1;  // unlimited
}

import { Client } from '../lib';
import { fullStack } from 'make-error-cause';
import * as debugLogger from 'debug-logger';
import { PrivmsgMessage } from '../lib/message/twitch-types';

const log = debugLogger('basic-bot');

(async () => {
    try {
        let client = new Client();

        client.onConnecting.sub(() => log.info('onConnecting'));
        client.onConnect.sub(() => log.info('onConnect'));
        client.onReady.sub(() => log.info('onReady'));
        client.onError.sub((e) => log.warn('onError', fullStack(e)));
        client.onClose.sub(() => log.info('onClose'));

        client.subscribe('PRIVMSG', (msg: PrivmsgMessage) => {
            log.info('[#%s] %s: %s', msg.channelName, msg.displayName, msg.message);
        });

        log.info('Connecting...');
        await client.connect();
        log.info('Connected');

        await client.join('forsen');
    } catch (e) {
        log.error('Basic bot caught error:', e);
    }
})();

