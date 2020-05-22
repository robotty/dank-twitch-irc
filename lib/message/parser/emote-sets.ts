export type TwitchEmoteSets = string[];

export function parseEmoteSets(emoteSetsSrc: string): TwitchEmoteSets {
  // emote-sets=0,33,50,237,793,2126,3517,4578,5569,9400,10337,12239
  // emote-sets=0
  // 0 should never be absent, but we play extra safe and make "no emote sets"
  // a handled case that returns an empty array.

  if (emoteSetsSrc.length <= 0) {
    return [];
  }

  return emoteSetsSrc.split(",").filter((str) => str.length > 0);
}
