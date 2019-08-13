export function unionSets<T>(sets: Array<Set<T>>): Set<T> {
  const newSet = new Set<T>();

  for (const set of sets) {
    for (const element of set) {
      newSet.add(element);
    }
  }

  return newSet;
}
