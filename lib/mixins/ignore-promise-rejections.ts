import { ChatClient } from "../client/client";
import { applyReplacements } from "../utils/apply-function-replacements";
import { ignoreErrors } from "../utils/ignore-errors";
import { ClientMixin } from "./base-mixin";

export class IgnoreUnhandledPromiseRejectionsMixin implements ClientMixin {
  public applyToClient(client: ChatClient): void {
    const genericReplacement = <V, A extends any[]>(
      originalFn: (...args: A) => Promise<V>,
      ...args: A
    ): Promise<V | undefined> => {
      const originalPromise = originalFn(...args);
      originalPromise.catch(ignoreErrors);
      return originalPromise;
    };

    applyReplacements(this, client, {
      join: genericReplacement,
      part: genericReplacement,
      privmsg: genericReplacement,
      say: genericReplacement,
      me: genericReplacement,
      whisper: genericReplacement,
      setColor: genericReplacement,
      ping: genericReplacement,
    });
  }
}
