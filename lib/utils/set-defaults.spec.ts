import { assert } from "chai";
import { setDefaults } from "./set-defaults";

describe("./utils/set-defaults", function () {
  describe("#setDefaults()", function () {
    it("assigns to empty object", function () {
      assert.deepStrictEqual(setDefaults({}, { a: 1, b: 2 }), { a: 1, b: 2 });
    });

    it("does not override inputs", function () {
      assert.deepStrictEqual(setDefaults({ a: 3 }, { a: 1, b: 2 }), {
        a: 3,
        b: 2,
      });
    });

    it("accepts undefined inputs", function () {
      assert.deepStrictEqual(setDefaults(undefined, { a: 1, b: 2 }), {
        a: 1,
        b: 2,
      });
    });

    it("keeps extra input properties", function () {
      // @ts-ignore TS compiler forbids the "c" key but since this is JS and the
      // compiler is no guarantee i want to test for this case too.
      assert.deepStrictEqual(setDefaults({ c: 3 }, { a: 1, b: 2 }), {
        a: 1,
        b: 2,
        c: 3,
      });
    });
  });
});
