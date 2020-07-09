/**
 * Single instance of a twitch emote in a message string.
 */
export class TwitchEmote {
  /**
   * Numeric ID identifying the emote.
   */
  public id: string;

  /**
   * inclusive start index in the original message text.
   * Note that we count unicode code points, not bytes with this.
   * If you use this, make sure your code splits or indexes strings by their
   * unicode code points, and not their bytes.
   */
  public startIndex: number;

  /**
   * exclusive end index in the original message text.
   * Note that we count unicode code points, not bytes with this.
   * If you use this, make sure your code splits or indexes strings by their
   * unicode code points, and not their bytes.
   */
  public endIndex: number;

  /**
   * The part of the original message string that was recognizes as an emote, e.g. "Kappa".
   */
  public code: string;

  public constructor(
    id: string,
    startIndex: number,
    endIndex: number,
    text: string
  ) {
    this.id = id;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.code = text;
  }
}
