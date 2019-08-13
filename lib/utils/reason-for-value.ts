export function reasonForValue(actualValue: string | null | undefined): string {
  if (actualValue === undefined) {
    return "undefined";
  }

  if (actualValue === null) {
    return "null";
  }

  if (actualValue.length <= 0) {
    return "empty string";
  }

  return `"${actualValue}"`;
}
