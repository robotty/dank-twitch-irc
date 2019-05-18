function findByPredicate<T>(arr: T[], filter: (t: T) => boolean): { index: number; value: T } {
    for (let [index, value] of arr.entries()) {
        if (filter(value)) {
            return {index, value};
        }
    }

    return {index: -1, value: undefined};
}

export function findAndPushToEnd<T>(arr: T[], filter: (t: T) => boolean): T | undefined {
    let {index, value} = findByPredicate(arr, filter);
    if (index < 0) {
        return undefined;
    }

    arr.splice(index, 1);
    arr.push(value);

    return value;
}

export function removeInPlace<T>(arr: T[], element: T): void {
    let index;
    while ((index = arr.indexOf(element) >= 0)) {
        arr.splice(index, 1);
    }
}
