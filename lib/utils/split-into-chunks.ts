export function splitIntoChunks(
  bits: string[],
  separator = " ",
  limit: number
): string[][] {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentChunkJoinedLength = 0;

  const tryAppend = (bit: string, recursive = false): void => {
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
        throw new Error(
          "Found a piece that can never fit the target length limit"
        );
      }

      tryAppend(bit, true);
    }
  };

  for (const bit of bits) {
    tryAppend(bit);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
