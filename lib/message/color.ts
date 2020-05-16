export interface Color {
  r: number;
  g: number;
  b: number;
}

function toPaddedHex(i: number, shouldBeLength: number): string {
  const s = i.toString(16);
  return "0".repeat(shouldBeLength - s.length) + s;
}

/**
 * Make a hexadecimal color string (like e.g. #AABBCC) from a given color object.
 */
export function colorToHexString(color: Color): string {
  return (
    "#" +
    toPaddedHex(color.r, 2) +
    toPaddedHex(color.g, 2) +
    toPaddedHex(color.b, 2)
  );
}
