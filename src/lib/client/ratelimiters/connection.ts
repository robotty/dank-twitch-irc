// wait 1 second minimum between new connections (reduces load on the
// twitch IRC server on startup and reconnect)
import Semaphore from 'semaphore-async-await';
import { setDefaults } from '../../utils';
import { Client } from '../interface';

export interface ConnectionRateLimiterConfig {
    parallelConnections: number;
    releaseTime: number;
}

export const configDefaults: ConnectionRateLimiterConfig = {
    parallelConnections: 10,
    releaseTime: 10 * 1000
};

export class ConnectionRateLimiter {
    public configuration: ConnectionRateLimiterConfig;
    public connectionRateLimiter;

    public constructor(partialConfig?: Partial<ConnectionRateLimiterConfig>) {
        this.configuration = setDefaults(partialConfig, configDefaults);
        this.connectionRateLimiter = new Semaphore(this.configuration.parallelConnections);
    }

    public async  acquire(): Promise<void> {
        await this.connectionRateLimiter.acquire();
    }

    public releaseOnConnect(client: Client): void {
        let unsubscribers: (() => void)[] = [];

        let unsubscribe = (): void => {
            unsubscribers.forEach(e => e());
        };

        let done = (): void => {
            unsubscribe();
            setTimeout(() => this.connectionRateLimiter.release(), this.configuration.releaseTime);
        };

        unsubscribers.push(client.onConnect.sub(() => done()));
        unsubscribers.push(client.onClose.sub(() => done()));
    }

    public release(): void {
        this.connectionRateLimiter.release();
    }

}

export const defaultConnectionRateLimiter = new ConnectionRateLimiter();
