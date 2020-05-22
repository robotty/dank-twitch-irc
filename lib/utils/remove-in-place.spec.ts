import { assert } from "chai";
import { removeInPlace } from "./remove-in-place";

describe("./utils/remove-in-place", function () {
  describe("#removeInPlace()", function () {
    it("empty array", () => {
      const arr: number[] = [];
      removeInPlace(arr, 1);
      assert.deepStrictEqual(arr, []);
    });

    it("correct on one", () => {
      const arr = [1, 2, 3];
      removeInPlace(arr, 2);
      assert.deepStrictEqual(arr, [1, 3]);
    });

    it("correct on multiple", () => {
      const arr = [1, 2, 3, 2];
      removeInPlace(arr, 2);
      assert.deepStrictEqual(arr, [1, 3]);
    });

    it("at the start", () => {
      const arr = [1, 2, 3];
      removeInPlace(arr, 1);
      assert.deepStrictEqual(arr, [2, 3]);
    });

    it("at the end", () => {
      const arr = [1, 2, 3];
      removeInPlace(arr, 2);
      assert.deepStrictEqual(arr, [1, 3]);
    });
  });
});
