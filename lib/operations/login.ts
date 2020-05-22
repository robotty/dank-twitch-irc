import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { ConnectionError } from "../client/errors";
import { NoticeMessage } from "../message/twitch-types/notice";
import { isAnonymousUsername } from "../utils/is-anonymous-username";

export class LoginError extends ConnectionError {}

export async function sendLogin(
  conn: SingleConnection,
  username: string,
  password?: string
): Promise<void> {
  if (password != null) {
    if (!isAnonymousUsername(username) && !password.startsWith("oauth:")) {
      // don't append oauth: for the fake passwords that can be sent for
      // anonymous usernames, such as `PASS SCHMOOPIE`
      password = "oauth:" + password;
    }

    conn.sendRaw(`PASS ${password}`);
  }
  conn.sendRaw(`NICK ${username}`);

  // successful login if we're greeted with a 001,
  // e.g. :tmi.twitch.tv 001 justinfan12345 :Welcome, GLHF!
  // some kind of error occurred if the server sends us a NOTICE.
  // e.g. :tmi.twitch.tv NOTICE * :Improperly formatted auth
  // or :tmi.twitch.tv NOTICE * :Login authentication failed
  await awaitResponse(conn, {
    success: (msg) => msg.ircCommand === "001",
    failure: (msg) => msg instanceof NoticeMessage,
    errorType: (message, cause) => new LoginError(message, cause),
    errorMessage: "Failed to login",
  });
}
