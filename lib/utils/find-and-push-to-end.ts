function findByPredicate<T>(
  arr: T[],
  filter: (t: T) => boolean
): { index: number; value: T } | undefined {
  for (const [index, value] of arr.entries()) {
    if (filter(value)) {
      return { index, value };
    }
  }

  return undefined;
}

export function findAndPushToEnd<T>(
  arr: T[],
  filter: (t: T) => boolean
): T | undefined {
  const result = findByPredicate(arr, filter);
  if (result == null) {
    return undefined;
  }

  const { index, value } = result;

  arr.splice(index, 1);
  arr.push(value);

  return value;
}
