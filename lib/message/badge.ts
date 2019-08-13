export class TwitchBadge {
  public name: string;
  public version: number;

  public constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
  }

  public get isAdmin(): boolean {
    return this.name === "admin";
  }

  public get isBits(): boolean {
    return this.name === "bits";
  }

  public get isBroadcaster(): boolean {
    return this.name === "broadcaster";
  }

  public get isGlobalMod(): boolean {
    return this.name === "global_mod";
  }

  public get isModerator(): boolean {
    return this.name === "moderator";
  }

  public get isSubscriber(): boolean {
    return this.name === "subscriber";
  }

  public get isStaff(): boolean {
    return this.name === "staff";
  }

  public get isTurbo(): boolean {
    return this.name === "turbo";
  }

  public get isVIP(): boolean {
    return this.name === "vip";
  }

  public toString(): string {
    return `${this.name}/${this.version}`;
  }
}
