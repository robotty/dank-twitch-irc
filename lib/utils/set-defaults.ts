export function setDefaults<I, D>(input: I | undefined, defaults: D): I & D {
  return Object.assign({}, defaults, input);
}
