import { UserState } from "../../message/twitch-types/userstate";
import { UserStateTracker } from "../userstate-tracker";

// userStateTracker is optional in case no user state tracker
// is installed on the client
export function canSpamFast(
  channelName: string,
  loggedInUsername: string,
  userStateTracker?: UserStateTracker
): boolean;

export function canSpamFast(
  channelName: string,
  loggedInUsername: string,
  userState: UserState
): boolean;

export function canSpamFast(
  channelName: string,
  loggedInUsername: string,
  userStateInput: UserStateTracker | UserState | undefined
): boolean {
  // broadcaster?
  if (channelName === loggedInUsername) {
    return true;
  }

  let userState: UserState | undefined;
  if (userStateInput instanceof UserStateTracker) {
    userState = userStateInput.getChannelState(channelName);
  } else {
    userState = userStateInput;
  }

  // no data
  if (userState == null) {
    return false;
  }

  // any of these?
  return (
    userState.isMod ||
    userState.badges.hasVIP ||
    userState.badges.hasModerator ||
    userState.badges.hasBroadcaster
  );
}
