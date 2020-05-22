export interface MessageRateLimits {
  highPrivmsgLimits: number;
  lowPrivmsgLimits: number;

  // whispersPerSecond: number;
  // whispersPerMinute: number;
  // whisperTargetsPerDay: number;
}

export type PresetKeys = "default" | "knownBot" | "verifiedBot";

export const messageRateLimitPresets: Record<PresetKeys, MessageRateLimits> = {
  default: {
    highPrivmsgLimits: 100,
    lowPrivmsgLimits: 20,

    // whispersPerSecond: 3,
    // whispersPerMinute: 100,
    // whisperTargetsPerDay: 40
  },
  knownBot: {
    highPrivmsgLimits: 100,
    lowPrivmsgLimits: 50,

    // whispersPerSecond: 10,
    // whispersPerMinute: 200,
    // whisperTargetsPerDay: 500
  },
  verifiedBot: {
    highPrivmsgLimits: 7500,
    lowPrivmsgLimits: 7500,

    // whispersPerSecond: 20,
    // whispersPerMinute: 1200,
    // whisperTargetsPerDay: 100000
  },
};
