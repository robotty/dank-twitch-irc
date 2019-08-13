import { MissingDataError } from "./missing-data-error";
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

export function optionalData<T>(func: () => T): T | undefined {
  try {
    return func();
  } catch (e) {
    if (e instanceof MissingDataError) {
      return undefined;
    } else {
      throw e;
    }
  }
}
