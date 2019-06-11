import Semaphore from 'semaphore-async-await';
import { UserStateTracker } from '../../userstate-tracker';
import { MessageRateLimits } from './message-rate-limiter';
import { canSpamFast } from './utils';

export class PrivmsgMessageRateLimiter {
    private readonly loggedInUsername: string;
    private readonly userstateTracker: UserStateTracker;

    private readonly highPrivmsgSemaphore: Semaphore = new Semaphore(0);
    private readonly lowPrivmsgSemaphore: Semaphore = new Semaphore(0);

    public constructor(loggedInUsername: string,
                       userstateTracker: UserStateTracker) {
        this.loggedInUsername = loggedInUsername;
        this.userstateTracker = userstateTracker;
    }

    public applyRateLimits(rateLimits: MessageRateLimits): void {
        for (let i = 0; i < rateLimits.highPrivmsgLimits; i++) {
            this.highPrivmsgSemaphore.release();
        }

        for (let i = 0; i < rateLimits.lowPrivmsgLimits; i++) {
            this.lowPrivmsgSemaphore.release();
        }
    }

    private canSpamFast(channelName: string): boolean {
        return canSpamFast(channelName, this.loggedInUsername, this.userstateTracker);
    }

    private async acquire(fastSpam: boolean): Promise<void> {
        let promises: Promise<boolean>[] = [];
        promises.push(this.highPrivmsgSemaphore.acquire());
        if (!fastSpam) {
            promises.push(this.lowPrivmsgSemaphore.acquire());
        }
        await Promise.all(promises);
    }

    private release(fastSpam: boolean): void {
        this.highPrivmsgSemaphore.release();

        if (fastSpam) {
            this.lowPrivmsgSemaphore.release();
        }
    }

    public async rateLimitPrivmsg<T>(channelName: string, func: () => Promise<T>): Promise<T> {
        let fastSpam = this.canSpamFast(channelName);
        await this.acquire(fastSpam);
        try {
            return await func();
        } finally {
            // 35 keeps it safe
            setTimeout(() => this.release(fastSpam), 35 * 1000);
        }
    }

}
