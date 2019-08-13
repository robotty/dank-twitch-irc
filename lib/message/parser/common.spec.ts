import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { optionalData, parseIntThrowing } from "./common";
import { MissingDataError } from "./missing-data-error";
import { MissingTagError } from "./missing-tag-error";
import { ParseError } from "./parse-error";

describe("./message/parser/common", function() {
  describe("#parseIntThrowing()", function() {
    it("should fail on undefined", function() {
      assertThrowsChain(
        () => parseIntThrowing(undefined),
        ParseError,
        "String source for integer is null/undefined"
      );
    });
    it("should fail on null", function() {
      assertThrowsChain(
        () => parseIntThrowing(null),
        ParseError,
        "String source for integer is null/undefined"
      );
    });
    it("should fail on non-number string input", function() {
      assertThrowsChain(
        () => parseIntThrowing("xd"),
        ParseError,
        'Invalid integer for string "xd"'
      );
    });
    it("should parse integers normally", function() {
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

  describe("#optionalData()", function() {
    it("should return the original value if no exception is thrown", function() {
      assert.strictEqual(optionalData(() => undefined), undefined);
      assert.strictEqual(optionalData(() => null), null);
      assert.strictEqual(optionalData(() => ""), "");
      assert.strictEqual(optionalData(() => "asd"), "asd");
    });

    it("should return undefined if MissingDataError is thrown", function() {
      assert.strictEqual(
        optionalData(() => {
          throw new MissingDataError("test");
        }),
        undefined
      );
    });

    it("should return undefined if MissingTagError caused by undefined is thrown", function() {
      assert.strictEqual(
        optionalData(() => {
          throw new MissingTagError("test", undefined);
        }),
        undefined
      );
    });

    it("should return undefined if MissingTagError caused by null is thrown", function() {
      assert.strictEqual(
        optionalData(() => {
          throw new MissingTagError("test", null);
        }),
        undefined
      );
    });

    it("should return undefined if MissingTagError caused by empty string is thrown", function() {
      assert.strictEqual(
        optionalData(() => {
          throw new MissingTagError("test", "");
        }),
        undefined
      );
    });

    it("should not catch other types of errors", function() {
      assertThrowsChain(
        () =>
          optionalData(() => {
            throw new Error("test");
          }),
        Error,
        "test"
      );
    });
  });
});
