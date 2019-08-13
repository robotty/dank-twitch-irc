export function removeInPlace<T>(arr: T[], element: T): void {
  let index;
  while ((index = arr.indexOf(element)) !== -1) {
    arr.splice(index, 1);
  }
}
