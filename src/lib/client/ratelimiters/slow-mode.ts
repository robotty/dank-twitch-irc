import Semaphore from 'semaphore-async-await';
import { RoomStateTracker } from '../../roomstate-tracker';
import { UserStateTracker } from '../../userstate-tracker';
import { canSpamFast } from './utils';

export class SlowModeRateLimiter {
    private readonly loggedInUsername: string;
    private readonly roomstateTracker: RoomStateTracker;
    private readonly userstateTracker: UserStateTracker;

    private readonly semaphores: Map<string, Semaphore> = new Map<string, Semaphore>();

    public constructor(loggedInUsername: string,
                       userstateTracker: UserStateTracker,
                       roomstateTracker: RoomStateTracker) {
        this.loggedInUsername = loggedInUsername;
        this.userstateTracker = userstateTracker;
        this.roomstateTracker = roomstateTracker;
    }

    private canSpamFast(channelName: string): boolean {
        return canSpamFast(channelName, this.loggedInUsername, this.userstateTracker);
    }

    private getSemaphore(channelName: string): Semaphore {
        let semaphore = this.semaphores.get(channelName);
        if (semaphore == null) {
            semaphore = new Semaphore(1);
            this.semaphores.set(channelName, semaphore);
        }

        return semaphore;
    }

    private async acquire(channelName: string): Promise<void> {
        if (this.canSpamFast(channelName)) {
            return;
        }

        let semaphore = this.getSemaphore(channelName);
        await semaphore.acquire();
    }

    private scheduleRelease(channelName: string): void {
        let semaphore = this.getSemaphore(channelName);
        if (this.canSpamFast(channelName)) {
            let permits = semaphore.getPermits();
            if (permits <= 0) {
                semaphore.release();
            }
            return;
        }

        let roomState = this.roomstateTracker.getState(channelName);
        let slowModeDuration: number;
        if (roomState != null) {
            slowModeDuration = roomState.slowModeDuration;
        } else {
            slowModeDuration = 0;
        }

        slowModeDuration = Math.max(slowModeDuration, 1.3);

        setTimeout(() => semaphore.release(), slowModeDuration * 1000);
    }

    public async rateLimitMessage<T>(channelName: string, func: () => Promise<T>): Promise<T> {
        await this.acquire(channelName);
        try {
            return await func();
        } finally {
            this.scheduleRelease(channelName);
        }
    }

    // TODO on userstate and on roomstate apply changes to waiting executers

}
