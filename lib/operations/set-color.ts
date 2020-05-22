import { awaitResponse } from "../await/await-response";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { Color, colorToHexString } from "../message/color";
import { NoticeMessage } from "../message/twitch-types/notice";
import { sendPrivmsg } from "./privmsg";

export class SetColorError extends MessageError {
  public wantedColor: Color;

  public constructor(wantedColor: Color, message?: string, cause?: Error) {
    super(message, cause);
    this.wantedColor = wantedColor;
  }
}

const badNoticeIDs = [
  "turbo_only_color", // Only turbo users can specify an arbitrary hex color. Use one of the following instead: <list of colors>.
  "usage_color", // Usage: “/color” <color> - Change your username color. Color must be in hex (#000000) [...]
];

export async function setColor(
  conn: SingleConnection,
  color: Color
): Promise<void> {
  const colorAsHex = colorToHexString(color);
  sendPrivmsg(conn, conn.configuration.username, `/color ${colorAsHex}`);

  await awaitResponse(conn, {
    failure: (msg) =>
      msg instanceof NoticeMessage &&
      msg.channelName === conn.configuration.username &&
      badNoticeIDs.includes(msg.messageID!),
    success: (msg) =>
      msg instanceof NoticeMessage &&
      msg.channelName === conn.configuration.username &&
      msg.messageID === "color_changed",
    errorType: (msg, cause) => new SetColorError(color, msg, cause),
    errorMessage: `Failed to set color to ${colorAsHex}`,
  });
}
