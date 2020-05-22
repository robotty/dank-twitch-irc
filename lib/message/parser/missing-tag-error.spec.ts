import { assert } from "chai";
import { MissingTagError } from "./missing-tag-error";

describe("./message/parser/missing-tag-error", function () {
  describe("MissingTagError", function () {
    it("should have a special formatted message on undefined", function () {
      const e = new MissingTagError("exampleKey", undefined);
      assert.strictEqual(
        e.message,
        'Required tag value not present at key "exampleKey" (is undefined)'
      );
    });

    it("should have a special formatted message on null", function () {
      const e = new MissingTagError("exampleKey", null);
      assert.strictEqual(
        e.message,
        'Required tag value not present at key "exampleKey" (is null)'
      );
    });

    it("should have a special formatted message on empty string", function () {
      const e = new MissingTagError("exampleKey", "");
      assert.strictEqual(
        e.message,
        'Required tag value not present at key "exampleKey" (is empty string)'
      );
    });

    it("should have a formatted message on other string values", function () {
      const e = new MissingTagError("exampleKey", "test");
      assert.strictEqual(
        e.message,
        'Required tag value not present at key "exampleKey" (is "test")'
      );
    });

    it("should store the given values as instance properties", function () {
      const e = new MissingTagError("exampleKey", "testValue");
      assert.strictEqual(e.tagKey, "exampleKey");
      assert.strictEqual(e.actualValue, "testValue");
    });
  });
});
