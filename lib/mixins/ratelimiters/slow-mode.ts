import Semaphore from "semaphore-async-await";
import { ChatClient } from "../../client/client";
import { RoomState } from "../../message/twitch-types/roomstate";
import { UserState } from "../../message/twitch-types/userstate";
import { applyReplacements } from "../../utils/apply-function-replacements";
import { EditableTimeout } from "../../utils/editable-timeout";
import { ClientMixin } from "../base-mixin";
import { canSpamFast } from "./utils";

export class SlowModeRateLimiter implements ClientMixin {
  public static GLOBAL_SLOW_MODE_COOLDOWN = 1.5;

  private readonly client: ChatClient;
  private readonly maxQueueLength: number;
  private readonly semaphores: Record<string, Semaphore> = {};
  private readonly runningTimers: Record<string, EditableTimeout> = {};

  public constructor(client: ChatClient, maxQueueLength: number = 10) {
    this.client = client;
    this.maxQueueLength = maxQueueLength;
  }

  public applyToClient(client: ChatClient): void {
    const genericReplament = async (
      oldFn: (channelName: string, message: string) => Promise<void>,
      channelName: string,
      message: string
    ): Promise<void> => {
      const releaseFn = await this.acquire(channelName);
      if (releaseFn == null) {
        // queue is full
        // message is dropped
        return;
      }

      try {
        return await oldFn(channelName, message);
      } finally {
        releaseFn();
      }
    };

    applyReplacements(this, client, {
      say: genericReplament,
      me: genericReplament,
      privmsg: genericReplament
    });

    if (client.roomStateTracker != null) {
      client.roomStateTracker.on(
        "newChannelState",
        this.onRoomStateChange.bind(this)
      );
    }

    if (client.userStateTracker != null) {
      client.userStateTracker.on(
        "newChannelState",
        this.onUserStateChange.bind(this)
      );
    }
  }

  private getSemaphore(channelName: string): Semaphore {
    let semaphore = this.semaphores[channelName];
    if (semaphore == null) {
      semaphore = new Semaphore(1);
      this.semaphores[channelName] = semaphore;
    }

    return semaphore;
  }

  private onUserStateChange(channelName: string, newState: UserState): void {
    const { fastSpam, certain } = canSpamFast(
      channelName,
      this.client.configuration.username,
      newState
    );

    const runningTimer = this.runningTimers[channelName];
    if (fastSpam && runningTimer != null) {
      runningTimer.update(0);
    }

    if (certain && channelName in this.semaphores) {
      const semaphore = this.getSemaphore(channelName);

      // @ts-ignore private member access
      const waiterQueue: Array<() => void> = semaphore.promiseResolverQueue;
      // trim waiter queue
      waiterQueue.splice(10);
    }
  }

  private onRoomStateChange(channelName: string, newState: RoomState): void {
    // new slow mode?

    const newSlowModeDuration = Math.max(
      newState.slowModeDuration,
      SlowModeRateLimiter.GLOBAL_SLOW_MODE_COOLDOWN
    );

    const runningTimer = this.runningTimers[channelName];
    if (runningTimer != null) {
      runningTimer.update(newSlowModeDuration);
    }
  }

  private async acquire(
    channelName: string
  ): Promise<(() => void) | undefined> {
    // TODO
    const { fastSpam, certain } = canSpamFast(
      channelName,
      this.client.configuration.username,
      this.client.userStateTracker
    );

    // nothing is acquired and nothing has to be released
    if (fastSpam) {
      // tslint:disable-next-line:no-empty
      return () => {};
    }

    const semaphore = this.getSemaphore(channelName);

    // @ts-ignore private member access
    const waiterQueue: Array<() => void> = semaphore.promiseResolverQueue;

    // too many waiting. Message will be dropped.
    // note that we do NOT drop messages when we are unsure about
    // fast spam state (e.g. before the first USERSTATE is received)
    if (certain && waiterQueue.length >= this.maxQueueLength) {
      return undefined;
    }

    const releaseFn = (): void => {
      // TODO
      const { fastSpam: fastSpamAfterRelease } = canSpamFast(
        channelName,
        this.client.configuration.username,
        this.client.userStateTracker
      );

      if (fastSpamAfterRelease) {
        semaphore.release();
        return;
      }

      let slowModeDuration: number;
      if (
        this.client.roomStateTracker != null &&
        this.client.userStateTracker != null
      ) {
        const roomState = this.client.roomStateTracker.getChannelState(
          channelName
        );
        if (roomState != null) {
          slowModeDuration = roomState.slowModeDuration;
        } else {
          slowModeDuration = 0;
        }
      } else {
        slowModeDuration = 0;
      }

      slowModeDuration = Math.max(
        slowModeDuration,
        SlowModeRateLimiter.GLOBAL_SLOW_MODE_COOLDOWN
      );

      this.runningTimers[channelName] = new EditableTimeout(() => {
        delete this.runningTimers[channelName];
        semaphore.release();
      }, slowModeDuration * 1000);
    };

    await semaphore.acquire();

    // if we were released by a incoming USERSTATE change (the timer was
    // edited) and spam can now be fast, return the token immediately
    // and return a no-op releaseFn.
    const { fastSpam: fastSpamAfterAwait } = canSpamFast(
      channelName,
      this.client.configuration.username,
      this.client.userStateTracker
    );

    if (fastSpamAfterAwait) {
      semaphore.release();
      // tslint:disable-next-line:no-empty
      return () => {};
    }

    return releaseFn;
  }
}
