// wait 1 second minimum between new connections (reduces load on the
// twitch IRC server on startup and reconnect)
import Semaphore from 'semaphore-async-await';
import { IClient } from '../interface';

export class ConnectionRateLimiter {
    private semaphore;
    public readonly parallelConnections: number;
    public readonly releaseTime: number;

    public constructor(parallelConnections: number = 10, releaseTime: number = 10 * 1000) {
        this.semaphore = new Semaphore(parallelConnections);
        this.parallelConnections = parallelConnections;
        this.releaseTime = releaseTime;
    }

    public async  acquire(): Promise<void> {
        await this.semaphore.acquire();
    }

    public releaseOnConnect(client: IClient): void {
        let unsubscribers: (() => void)[] = [];

        let unsubscribe = (): void => {
            unsubscribers.forEach(e => e());
        };

        let done = (): void => {
            unsubscribe();
            setTimeout(() => this.semaphore.release(), this.releaseTime);
        };

        unsubscribers.push(client.onConnect.sub(() => done()));
        unsubscribers.push(client.onClose.sub(() => done()));
    }

    public release(): void {
        this.semaphore.release();
    }

}

export const defaultConnectionRateLimiter = new ConnectionRateLimiter();
