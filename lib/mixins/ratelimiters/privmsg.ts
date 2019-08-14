import Semaphore from "semaphore-async-await";
import { ChatClient } from "../../client/client";
import { applyReplacements } from "../../utils/apply-function-replacements";
import { ClientMixin } from "../base-mixin";
import { canSpamFast } from "./utils";

export class PrivmsgMessageRateLimiter implements ClientMixin {
  private readonly client: ChatClient;
  private readonly highPrivmsgSemaphore: Semaphore;
  private readonly lowPrivmsgSemaphore: Semaphore;

  public constructor(client: ChatClient) {
    this.client = client;

    this.highPrivmsgSemaphore = new Semaphore(
      this.client.configuration.rateLimits.highPrivmsgLimits
    );
    this.lowPrivmsgSemaphore = new Semaphore(
      this.client.configuration.rateLimits.lowPrivmsgLimits
    );
  }

  public applyToClient(client: ChatClient): void {
    const genericReplament = async <V>(
      oldFn: (channelName: string, message: string) => Promise<V>,
      channelName: string,
      message: string
    ): Promise<V> => {
      const releaseFn = await this.acquire(message);
      try {
        return await oldFn(channelName, message);
      } finally {
        setTimeout(releaseFn, 35 * 1000);
      }
    };

    applyReplacements(this, client, {
      say: genericReplament,
      me: genericReplament,
      privmsg: genericReplament
    });
  }

  private async acquire(channelName: string): Promise<() => void> {
    const fastSpam = canSpamFast(
      channelName,
      this.client.configuration.username,
      this.client.userStateTracker
    );

    const promises: Array<Promise<boolean>> = [];
    promises.push(this.highPrivmsgSemaphore.acquire());
    if (!fastSpam) {
      promises.push(this.lowPrivmsgSemaphore.acquire());
    }

    const releaseFn = (): void => {
      if (fastSpam) {
        this.lowPrivmsgSemaphore.release();
      }

      this.highPrivmsgSemaphore.release();
    };

    await Promise.all(promises);
    return releaseFn;
  }
}
