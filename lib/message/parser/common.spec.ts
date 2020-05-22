import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { parseIntThrowing } from "./common";
import { ParseError } from "./parse-error";

describe("./message/parser/common", function () {
  describe("#parseIntThrowing()", function () {
    it("should fail on undefined", function () {
      assertThrowsChain(
        () => parseIntThrowing(undefined),
        ParseError,
        "String source for integer is null/undefined"
      );
    });
    it("should fail on null", function () {
      assertThrowsChain(
        () => parseIntThrowing(null),
        ParseError,
        "String source for integer is null/undefined"
      );
    });
    it("should fail on non-number string input", function () {
      assertThrowsChain(
        () => parseIntThrowing("xd"),
        ParseError,
        'Invalid integer for string "xd"'
      );
    });
    it("should parse integers normally", function () {
      assert.strictEqual(parseIntThrowing("0"), 0);
      assert.strictEqual(parseIntThrowing("1"), 1);
      assert.strictEqual(parseIntThrowing("1.0"), 1);
      assert.strictEqual(parseIntThrowing("1.000"), 1);
      assert.strictEqual(parseIntThrowing("01.00"), 1);
      assert.strictEqual(parseIntThrowing("01"), 1);
      assert.strictEqual(parseIntThrowing("1.1"), 1);
      assert.strictEqual(parseIntThrowing("1.5"), 1);
      assert.strictEqual(parseIntThrowing("1.9999999999"), 1);
      assert.strictEqual(
        parseIntThrowing("9007199254740991"),
        Number.MAX_SAFE_INTEGER
      );
      assert.strictEqual(parseIntThrowing("-1"), -1);
      assert.strictEqual(
        parseIntThrowing("-9007199254740991"),
        Number.MIN_SAFE_INTEGER
      );
    });
  });
});
