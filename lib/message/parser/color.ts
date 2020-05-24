import { Color } from "../color";
import { ParseError } from "./parse-error";

const rgbColorRegex = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

export function parseColor(colorSrc: string): Color {
  const match = rgbColorRegex.exec(colorSrc);
  if (match == null) {
    throw new ParseError(
      `Malformed color value "${colorSrc}", must be in format #AABBCC`
    );
  }

  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);

  return { r, g, b };
}
