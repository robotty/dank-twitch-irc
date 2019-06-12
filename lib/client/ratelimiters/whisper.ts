import Semaphore from 'semaphore-async-await';
import { MessageRateLimits } from './message-rate-limiter';
import * as debugLogger from 'debug-logger';

const log = debugLogger('dank-twitch-irc:rate-limiters:whisper');


export class WhisperMessageRateLimiter {
    private readonly whispersPerSecondSemaphore: Semaphore = new Semaphore(0);
    private readonly whispersPerMinuteSemaphore: Semaphore = new Semaphore(0);
    private readonly whisperTargetsPerDaySemaphore: Semaphore = new Semaphore(0);
    private readonly recentWhisperTargets: Map<string, number> = new Map<string, number>();

    public applyRateLimits(rateLimits: MessageRateLimits): void {
        for (let i = 0; i < rateLimits.whispersPerSecond; i++) {
            this.whispersPerSecondSemaphore.release();
        }

        for (let i = 0; i < rateLimits.whispersPerMinute; i++) {
            this.whispersPerMinuteSemaphore.release();
        }

        for (let i = 0; i < rateLimits.whisperTargetsPerDay; i++) {
            this.whisperTargetsPerDaySemaphore.release();
        }
    }

    private async acquire(targetUsername: string): Promise<void> {
        let promises: Promise<boolean>[] = [];

        // we increment by one, and set a timer to decrement in one day.
        // Once the counter reaches zero, we release from the semaphore
        let currentAccountCount = this.recentWhisperTargets.get(targetUsername);
        if (currentAccountCount == null) {
            currentAccountCount = 0;
        }

        this.recentWhisperTargets.set(targetUsername, currentAccountCount + 1);

        promises.push(this.whispersPerSecondSemaphore.acquire());
        promises.push(this.whispersPerMinuteSemaphore.acquire());
        if (currentAccountCount == 0) {
            promises.push(this.whisperTargetsPerDaySemaphore.acquire());
        }
        await Promise.all(promises);
    }

    private scheduleRelease(targetUsername: string): void {
        setTimeout(() => this.whispersPerSecondSemaphore.release(), 1500);
        setTimeout(() => this.whispersPerMinuteSemaphore.release(), 65 * 1000);
        setTimeout(() => {
            let currentAccountCount = this.recentWhisperTargets.get(targetUsername);
            if (currentAccountCount == null) {
                log.warn('whisper targets per day: ERROR: count for that username was ' +
                    'null/undefined in timer. Ignoring.');
                return;
            }

            let newAccountCount = currentAccountCount - 1;
            if (newAccountCount <= 0) {
                this.recentWhisperTargets.delete(targetUsername);
                this.whisperTargetsPerDaySemaphore.release();
            } else {
                this.recentWhisperTargets.set(targetUsername, newAccountCount);
            }
        }, 24 * 60 * 60 * 1000);
    }

    public async rateLimitWhisper<T>(targetUsername: string, func: () => Promise<T>): Promise<T> {
        await this.acquire(targetUsername);
        try {
            return await func();
        } finally {
            this.scheduleRelease(targetUsername);
        }
    }
}
