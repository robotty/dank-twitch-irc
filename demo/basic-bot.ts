import { Client } from '../lib/client';
import { TwitchAPI } from '../lib/twitchapi';
import { PrivmsgMessage } from '../lib/message/twitch-types';
// @ts-ignore
import * as LineByLineReader from 'line-by-line';
import * as debugLogger from 'debug-logger';
import 'fs';

let apiClient = new TwitchAPI('0ueddjv33bkiuryv60jcd5pidk5fgs');

const log = debugLogger('basic-bot');

(async () => {
    try {
        log.info('Running!');

        let client = await Client.newClient(apiClient);
        await client.connect();

        client.subscribe(PrivmsgMessage, (msg: PrivmsgMessage) => {
            log.debug(`[#${msg.channelName}] ${msg.displayName}: ${msg.message}`);
        });

        log.info('Joining...');
        await client.join('randers00');
        log.info('Joined!');

        return;
        // @ts-ignore
        let linereader = new LineByLineReader(__dirname + '/../../demo/channels2.txt', {
            encoding: 'utf-8',
            skipEmptyLines: true
        });

        linereader.on('error', err => {
            log.error(err);
        });

        let linesReadSoFar = 0;
        let linesLimit = 10000;
        linereader.on('line', line => {
            client.join(line).catch(e => {
                log.warn('Failed to join channel %s', line, e);
            });
            linesReadSoFar++;

            if (linesReadSoFar >= linesLimit) {
                linereader.close();
            }
        });

    } catch (e) {
        log.error(e);
    }
})();
