import { SingleConnection } from "../client/connection";
import { sendPing } from "../operations/ping";
import { setDefaults } from "../utils/set-defaults";

export interface ClientPingConfig {
  /**
   * send interval in milliseconds
   */
  interval: number;

  /**
   * timeout in milliseconds
   */
  timeout: number;
}

const configDefaults: ClientPingConfig = {
  interval: 60 * 1000,
  timeout: 2 * 1000,
};

export function sendClientPings(
  conn: SingleConnection,
  config: Partial<ClientPingConfig> = {}
): void {
  const { interval, timeout } = setDefaults(config, configDefaults);

  let pingIDCounter = 0;
  const runAutomaticPing = async (): Promise<void> => {
    const pingIdentifier = `dank-twitch-irc:automatic:${pingIDCounter++}`;
    try {
      await sendPing(conn, pingIdentifier, timeout);
    } catch (e) {
      // ignored
    }
  };

  const registeredInterval = setInterval(runAutomaticPing, interval);
  conn.once("close", () => clearInterval(registeredInterval));
}
