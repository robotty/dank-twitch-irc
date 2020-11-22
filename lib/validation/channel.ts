import { reasonForValue } from "../utils/reason-for-value";
import { ValidationError } from "./validation-error";

const channelNameRegex = /^[a-z0-9_]{1,25}$/;

export function validateChannelName(input?: string | null): void {
  if (input == null || !channelNameRegex.test(input)) {
    throw new ValidationError(
      `Channel name ${reasonForValue(input)} is invalid/malformed`
    );
  }
}

export function correctChannelName(input: string): string {
  return input.replace(/^#/, "");
}
