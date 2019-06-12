import { setDefaults } from '../../utils';
import { IClient } from '../interface';
import { sendPing } from '../operations/ping';

export interface ClientPingConfig {

    /**
     * send interval in milliseconds
     */
    interval: number;

    /**
     * timeout in milliseconds
     */
    timeout: number;

}

const configDefaults: ClientPingConfig = {
    interval: 60 * 1000,
    timeout: 2 * 1000
};

export function sendClientPings(client: IClient, config: Partial<ClientPingConfig> = {}): void {
    let { interval, timeout } = setDefaults(config, configDefaults);

    let pingIDCounter = 0;
    let runAutomaticPing = async (): Promise<void> => {
        let pingIdentifier = `dank-twitch-irc:automatic:${pingIDCounter++}`;
        try {
            await sendPing(client, pingIdentifier, timeout);
        } catch (e) {
            // ignored
        }
    };

    let registeredInterval = setInterval(runAutomaticPing, interval);
    client.onClose.sub(() => clearInterval(registeredInterval));
}
