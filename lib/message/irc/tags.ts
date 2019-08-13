/**
 * Provides the values that the server sent.
 *
 * If the server specified no such tag, the mapping will be `undefined`.
 * If the server no mapping (omitted the `=` sign), like in @a;b;c, then the mapping will be `null`.
 * If the server sent an empty string or any other string, the mapping will be a `string`.
 */
export interface IRCMessageTags {
  [key: string]: string | null;
}
