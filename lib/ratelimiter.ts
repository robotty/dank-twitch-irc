import Semaphore from 'semaphore-async-await';

export class PrivmsgRateLimiter {
    private highSemaphore: Semaphore;
    private lowSemaphore: Semaphore;

    public constructor(highLimits, lowLimits) {
        this.highSemaphore = new Semaphore(highLimits);
        this.lowSemaphore = new Semaphore(lowLimits);
    }

    public async acquire(isHigh: boolean): Promise<void> {
        let promises: Promise<boolean>[] = [];
        promises.push(this.highSemaphore.acquire());
        if (!isHigh) {
            promises.push(this.lowSemaphore.acquire());
        }
        await Promise.all(promises);
    }

    public release(isHigh: boolean): void {
        this.highSemaphore.release();

        if (isHigh) {
            this.lowSemaphore.release();
        }
    }
}
