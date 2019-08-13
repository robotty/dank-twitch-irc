import { Client } from "../client/client";
import { applyReplacements } from "../utils/apply-function-replacements";
import { ignoreErrors } from "../utils/ignore-errors";
import { ClientMixin } from "./base-mixin";

export class IgnorePromiseRejectionsMixin implements ClientMixin {
  public applyToClient(client: Client): void {
    const genericReplacement = <V, A extends any[]>(
      originalFn: (...args: A) => Promise<V>,
      ...args: A
    ): Promise<V | undefined> => {
      return originalFn(...args).catch(ignoreErrors);
    };

    applyReplacements(this, client, {
      join: genericReplacement,
      part: genericReplacement,
      privmsg: genericReplacement,
      say: genericReplacement,
      me: genericReplacement,
      whisper: genericReplacement,
      ping: genericReplacement
    });
  }
}
