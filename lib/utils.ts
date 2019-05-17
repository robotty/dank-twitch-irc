export function randomOfArray<T>(array: T[]): T {
    const length = array == null ? 0 : array.length;
    return length ? array[Math.floor(Math.random() * length)] : undefined;
}
