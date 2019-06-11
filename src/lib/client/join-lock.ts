import * as AsyncLock from 'async-lock';

export class JoinLock {
    private lock: AsyncLock = new AsyncLock();

    public wrap<T>(channelName: string, wrapped: () => T): Promise<T> {
        return this.lock.acquire(channelName, wrapped);
    }

    public wrapAll<T>(channelNames: string[], wrapped: () => T): Promise<T> {
        return this.lock.acquire(channelNames, wrapped);
    }
}
