import { TwitchBadge, TwitchBadgesList } from '../badges';
import { parseIntThrowing } from './common';
import { ParseError } from './parse-error';

function parseSingleBadge(badgeSrc: string): TwitchBadge {
    // src format: <badge>/<version>

    let [badgeName, badgeVersionSrc] = badgeSrc.split('/', 2);
    if (badgeName == null || badgeVersionSrc == null) {
        throw new ParseError('Badge source did not contain \'/\' character', badgeSrc);
    }

    let badgeVersion = parseIntThrowing(badgeVersionSrc);

    return new TwitchBadge(badgeName, badgeVersion);
}

export function parseBadges(badgesSrc: string): TwitchBadgesList {
    // src format: <badge>/<version>,<badge>/<version>,<badge>/<version>

    if (badgesSrc.length <= 0) {
        return new TwitchBadgesList();
    }

    let badges = new TwitchBadgesList();
    for (let badgeSrc of badgesSrc.split(',')) {
        badges.push(parseSingleBadge(badgeSrc));
    }
    return badges;
}
