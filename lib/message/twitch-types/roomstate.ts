import pickBy = require("lodash.pickby");
import { ChannelIRCMessage } from "../irc/channel-irc-message";
import { IRCMessageData } from "../irc/irc-message";
import { tagParserFor } from "../parser/tag-values";

export interface RoomState {
  emoteOnly: boolean;
  emoteOnlyRaw: string;

  /**
   * followers-only duration in minutes
   */
  followersOnlyDuration: number;
  followersOnlyDurationRaw: string;

  r9k: boolean;
  r9kRaw: string;

  slowModeDuration: number;
  slowModeDurationRaw: string;

  subscribersOnly: boolean;
  subscribersOnlyRaw: string;
}

export function hasAllStateTags(
  partialRoomState: Partial<RoomState>
): partialRoomState is RoomState {
  return (
    partialRoomState.emoteOnly != null &&
    partialRoomState.followersOnlyDuration != null &&
    partialRoomState.r9k != null &&
    partialRoomState.slowModeDuration != null &&
    partialRoomState.subscribersOnly != null
  );
}

export class RoomstateMessage extends ChannelIRCMessage {
  public readonly channelID: string;

  public readonly emoteOnly: boolean | undefined;
  public readonly emoteOnlyRaw: string | undefined;

  public readonly followersOnlyDuration: number | undefined;
  public readonly followersOnlyDurationRaw: string | undefined;

  public readonly r9k: boolean | undefined;
  public readonly r9kRaw: string | undefined;

  public readonly slowModeDuration: number | undefined;
  public readonly slowModeDurationRaw: string | undefined;

  public readonly subscribersOnly: boolean | undefined;
  public readonly subscribersOnlyRaw: string | undefined;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.channelID = tagParser.requireString("room-id");

    this.emoteOnly = tagParser.getBoolean("emote-only");
    this.emoteOnlyRaw = tagParser.getString("emote-only");

    this.followersOnlyDuration = tagParser.getInt("followers-only");
    this.followersOnlyDurationRaw = tagParser.getString("followers-only");

    this.r9k = tagParser.getBoolean("r9k");
    this.r9kRaw = tagParser.getString("r9k");

    this.slowModeDuration = tagParser.getInt("slow");
    this.slowModeDurationRaw = tagParser.getString("slow");

    this.subscribersOnly = tagParser.getBoolean("subs-only");
    this.subscribersOnlyRaw = tagParser.getString("subs-only");
  }

  public extractRoomState(): Partial<RoomState> {
    // this object has "undefined" mapped for missing properties,
    // but we want to return an object where those keys are not
    // even present.
    const fullObj = {
      emoteOnly: this.emoteOnly,
      emoteOnlyRaw: this.emoteOnlyRaw,

      followersOnlyDuration: this.followersOnlyDuration,
      followersOnlyDurationRaw: this.followersOnlyDurationRaw,

      r9k: this.r9k,
      r9kRaw: this.r9kRaw,

      slowModeDuration: this.slowModeDuration,
      slowModeDurationRaw: this.slowModeDurationRaw,

      subscribersOnly: this.subscribersOnly,
      subscribersOnlyRaw: this.subscribersOnlyRaw,
    };

    return pickBy(fullObj, (v) => v != null);
  }
}
