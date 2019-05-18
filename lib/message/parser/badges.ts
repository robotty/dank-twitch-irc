import {TwitchBadge, TwitchBadgesList} from '../badges';

export function parseBadges(badgesSrc: string): TwitchBadgesList {
    let badges = new TwitchBadgesList();
    for (let badgeSrc of badgesSrc.split(',')) {
        let [badgeName, badgeVersionSrc] = badgeSrc.split('/', 2);
        if (typeof badgeName === 'undefined' || typeof badgeVersionSrc === 'undefined') {
            continue;
        }

        let badgeVersion = parseInt(badgeVersionSrc);
        if (isNaN(badgeVersion)) {
            continue;
        }

        badges.push(new TwitchBadge(badgeName, badgeVersion));
    }
    return badges;
}
