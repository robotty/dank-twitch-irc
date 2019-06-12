import { err, ok, Result } from 'neverthrow/dist';

function findByPredicate<T>(arr: T[], filter: (t: T) => boolean): { index: number; value: T } | undefined {
    for (let [index, value] of arr.entries()) {
        if (filter(value)) {
            return { index, value };
        }
    }

    return undefined;
}

export function findAndPushToEnd<T>(arr: T[], filter: (t: T) => boolean): T | undefined {
    let result = findByPredicate(arr, filter);
    if (result == null) {
        return undefined;
    }

    let { index, value } = result;

    arr.splice(index, 1);
    arr.push(value);

    return value;
}

export function removeInPlace<T>(arr: T[], element: T): void {
    let index;
    while ((index = arr.indexOf(element)) != -1) {
        arr.splice(index, 1);
    }
}

export function setDefaults<T>(input: Partial<T> = {}, defaults: T): T {
    return Object.assign({}, defaults, input);
}

export function applyMixins(derivedCtor: any, baseCtors: any[]): void {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}

export function splitIntoChunks(bits: string[], separator: string = ' ', limit: number = 500): string[][] {
    let chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentChunkJoinedLength = 0;

    let tryAppend = (bit, recursive = false): void => {

        let addedLength;
        if (currentChunk.length <= 0) {
            addedLength = bit.length;
        } else {
            addedLength = separator.length + bit.length;
        }

        if (currentChunkJoinedLength + addedLength <= limit) {
            currentChunk.push(bit);
            currentChunkJoinedLength += addedLength;
        } else {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkJoinedLength = 0;

            if (recursive) {
                throw new Error('Found a piece that can never fit the target length limit');
            }

            tryAppend(bit, true);
        }
    };

    for (let bit of bits) {
        tryAppend(bit);
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export function promiseToResult<T>(p: Promise<T>): Promise<Result<T, Error>> {
    return (p.then(r => ok(r), (e) => err(e))) as Promise<Result<T, Error>>;
}
