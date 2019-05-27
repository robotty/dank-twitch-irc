import { TwitchBadge, TwitchBadgesList } from '../badges';

function parseSingleBadge(badgeSrc: string): TwitchBadge {
    // src format: <badge>/<version>

    let [badgeName, badgeVersionSrc] = badgeSrc.split('/', 2);
    if (typeof badgeName === 'undefined' || typeof badgeVersionSrc === 'undefined') {
        throw new Error('Invalid badge source: ' + badgeSrc);
    }

    let badgeVersion = parseInt(badgeVersionSrc);
    if (isNaN(badgeVersion)) {
        throw new Error('Unparseable badge version string: ' + badgeVersionSrc);
    }

    return new TwitchBadge(badgeName, badgeVersion);
}

export function parseBadges(badgesSrc: string): TwitchBadgesList {
    // src format: <badge>/<version>,<badge>/<version>,<badge>/<version>

    let badges = new TwitchBadgesList();
    for (let badgeSrc of badgesSrc.split(',')) {
        badges.push(parseSingleBadge(badgeSrc));
    }
    return badges;
}
