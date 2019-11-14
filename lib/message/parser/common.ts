import { ParseError } from "./parse-error";

export function parseIntThrowing(str: string | null | undefined): number {
  if (str == null) {
    throw new ParseError("String source for integer is null/undefined");
  }

  const parsedInt = parseInt(str);
  if (isNaN(parsedInt)) {
    throw new ParseError(`Invalid integer for string "${str}"`);
  }

  return parsedInt;
}
