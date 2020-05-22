import { assert } from "chai";
import { findAndPushToEnd } from "./find-and-push-to-end";

describe("./utils/find-and-push-to-end", function () {
  describe("findAndPushToEnd", () => {
    it("empty array", () => {
      assert.isUndefined(findAndPushToEnd([], (e) => e === 1));
    });

    it("no filter match", () => {
      assert.isUndefined(findAndPushToEnd([1, 2, 3], (e) => e === 4));
    });

    it("mutated correctly 1", () => {
      const inArr = [1, 2, 3];
      assert.strictEqual(
        findAndPushToEnd(inArr, (e) => e === 1),
        1
      );

      assert.deepStrictEqual(inArr, [2, 3, 1]);
    });

    it("mutated correctly 2", () => {
      const inArr = [1, 2, 3];
      assert.strictEqual(
        findAndPushToEnd(inArr, (e) => e === 2),
        2
      );

      assert.deepStrictEqual(inArr, [1, 3, 2]);
    });
  });
});
