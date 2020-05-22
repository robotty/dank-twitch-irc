import { TwitchBadge } from "./badge";

export class TwitchBadgesList extends Array<TwitchBadge> {
  public get hasAdmin(): boolean {
    return this.find((e) => e.isAdmin) != null;
  }

  public get hasBits(): boolean {
    return this.find((e) => e.isBits) != null;
  }

  public get hasBroadcaster(): boolean {
    return this.find((e) => e.isBroadcaster) != null;
  }

  public get hasGlobalMod(): boolean {
    return this.find((e) => e.isGlobalMod) != null;
  }

  public get hasModerator(): boolean {
    return this.find((e) => e.isModerator) != null;
  }

  public get hasSubscriber(): boolean {
    return this.find((e) => e.isSubscriber) != null;
  }

  public get hasStaff(): boolean {
    return this.find((e) => e.isStaff) != null;
  }

  public get hasTurbo(): boolean {
    return this.find((e) => e.isTurbo) != null;
  }

  public get hasVIP(): boolean {
    return this.find((e) => e.isVIP) != null;
  }

  public toString(): string {
    return this.join(",");
  }
}
