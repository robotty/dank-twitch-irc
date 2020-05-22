import { assert } from "chai";
import { reasonForValue } from "./reason-for-value";

describe("./utils/reason-for-value", function () {
  describe("#reasonForValue()", function () {
    it('should return "undefined" for undefined', function () {
      assert.strictEqual(reasonForValue(undefined), "undefined");
    });
    it('should return "null" for null', function () {
      assert.strictEqual(reasonForValue(null), "null");
    });
    it('should return "empty string" for an empty string', function () {
      assert.strictEqual(reasonForValue(""), "empty string");
    });
    it('should return ""the string value"" for string values', function () {
      assert.strictEqual(reasonForValue("test"), '"test"');
    });
  });
});
