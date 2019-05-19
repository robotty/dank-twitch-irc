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

export class ConnectionRateLimiter {
    private semaphore: Semaphore = new Semaphore(1);

    public async schedule<T>(func: (notConsumed: (b?: boolean) => void) => Promise<T>): Promise<T> {
        await this.semaphore.acquire();
        let wasNotConsumed = false;
        let notConsumed = (b: boolean = true): void => {
            wasNotConsumed = b;
        };

        try {
            return await func(notConsumed);
        } finally {
            if (wasNotConsumed) {
                this.semaphore.release();
            } else {
                setTimeout(() => this.semaphore.release(), 3000);
            }
        }
    }
}
