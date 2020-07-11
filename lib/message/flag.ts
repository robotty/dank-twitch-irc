/**
 * Single instance of a twitch automod flagged word in a message string.
 *
 * **Note:** This is an undocumented Twitch IRC feature and may change at any time, use at your own risk.
 */
export class TwitchFlag {
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
   * The part of the original message string that was recognized as flagged, e.g. "stfu".
   */
  public word: string;

  /**
   * Flag category, as per the AutoMod moderation categories:
   * * **I:** Identity language - Words referring to race, religion, gender,
   * orientation, disability, or similar. Hate speech falls under this category.
   * * **S:** Sexually explicit language - Words or phrases referring to
   * sexual acts, sexual content, and body parts.
   * * **A:** Aggressive language - Hostility towards other people, often
   * associated with bullying.
   * * **P:** Profanity - Expletives, curse words, and vulgarity. This
   * filter especially helps those who wish to keep their community family-friendly.
   *
   * If this array is empty, this means that Twitch flagged it for a
   * non-specified reason.
   */
  public categories: Array<{ category: string; score: number }>;

  public constructor(
    startIndex: number,
    endIndex: number,
    text: string,
    category: Array<{ category: string; score: number }>
  ) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.word = text;
    this.categories = category;
  }
}
