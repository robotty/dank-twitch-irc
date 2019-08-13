import { Color } from "../color";
import { ParseError } from "./parse-error";

const rgbColorRegex = /^#(?<r>[0-9a-fA-F]{2})(?<g>[0-9a-fA-F]{2})(?<b>[0-9a-fA-F]{2})$/;

export function parseColor(colorSrc: string): Color {
  const match = rgbColorRegex.exec(colorSrc);
  if (match == null) {
    throw new ParseError(
      `Malformed color value "${colorSrc}", must be in format #AABBCC`
    );
  }

  const r = parseInt(match.groups!.r, 16);
  const g = parseInt(match.groups!.g, 16);
  const b = parseInt(match.groups!.b, 16);

  return { r, g, b };
}
