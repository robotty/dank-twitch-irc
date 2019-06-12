import { UserStateTracker } from '../../userstate-tracker';

export function canSpamFast(channelName: string,
                            loggedInUsername: string,
                            userstateTracker: UserStateTracker): boolean {
    if (channelName === loggedInUsername) {
        return true;
    }

    let userState = userstateTracker.getState(channelName);
    if (userState == null) {
        return false;
    }

    return userState.isMod ||
        userState.badges.hasVIP ||
        userState.badges.hasModerator ||
        userState.badges.hasBroadcaster;
}
