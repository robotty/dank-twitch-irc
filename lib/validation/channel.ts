import { reasonForValue } from "../utils/reason-for-value";
import { ValidationError } from "./validation-error";

const channelNameRegex = /^[a-z0-9_]{1,25}$/;
const chatRoomRegex = /^chatrooms:\d{1,20}:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/;

export function validateChannelName(input?: string | null): void {
  if (input != null) {
    if (chatRoomRegex.test(input) || channelNameRegex.test(input)) {
      return;
    }
  }

  throw new ValidationError(
    `Channel name ${reasonForValue(input)} is invalid/malformed`
  );
}
