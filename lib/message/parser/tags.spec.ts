import { assert } from "chai";
import { decodeValue, parseTags } from "./tags";

describe("./message/parser/tags", function () {
  describe("#decodeValue()", function () {
    it("should decode undefined as null", function () {
      assert.isNull(decodeValue(undefined));
    });
    it("should decode empty string as empty string", function () {
      assert.strictEqual("", decodeValue(""));
    });
    it("should decode semicolons", function () {
      assert.strictEqual("abc;def", decodeValue("abc\\:def"));
      assert.strictEqual(";", decodeValue("\\:"));
    });
    it("should decode spaces", function () {
      assert.strictEqual("abc def", decodeValue("abc\\sdef"));
      assert.strictEqual(" ", decodeValue("\\s"));
    });
    it("should decode backslashes", function () {
      assert.strictEqual("abc\\def", decodeValue("abc\\\\def"));
      assert.strictEqual("\\", decodeValue("\\\\"));
    });
    it("should decode CR", function () {
      assert.strictEqual("abc\rdef", decodeValue("abc\\rdef"));
      assert.strictEqual("\r", decodeValue("\\r"));
    });
    it("should decode LF", function () {
      assert.strictEqual("abc\ndef", decodeValue("abc\\ndef"));
      assert.strictEqual("\n", decodeValue("\\n"));
    });
    it("should not apply unescaping multiple times", function () {
      assert.strictEqual("abc\\ndef", decodeValue("abc\\\\ndef"));
    });
    it("should ignore dangling backslashes", function () {
      assert.strictEqual("abc def", decodeValue("abc\\sdef\\"));
    });
    it("should support a combination of all escape sequences", function () {
      assert.strictEqual(
        "abc; \\\r\ndef",
        decodeValue("abc\\:\\s\\\\\\r\\ndef\\")
      );
    });
  });

  describe("#parseTags()", function () {
    it("should parse no-value tag as null", function () {
      assert.deepStrictEqual(parseTags("enabled"), { enabled: null });
    });

    it("should parse empty-value tag as empty string", function () {
      assert.deepStrictEqual(parseTags("enabled="), { enabled: "" });
    });

    it("should keep boolean/numeric values as-is without coercion", function () {
      assert.deepStrictEqual(parseTags("enabled=1"), { enabled: "1" });
    });

    it("should decode escaped tag values", function () {
      assert.deepStrictEqual(parseTags("message=Hello\\sWorld!"), {
        message: "Hello World!",
      });
    });

    it("should override double tags with the last definition", function () {
      assert.deepStrictEqual(parseTags("message=1;message=2"), {
        message: "2",
      });
    });

    it("should override double tags with the last definition, even if value is null", function () {
      assert.deepStrictEqual(parseTags("message=1;message"), { message: null });
    });

    it("should to-lower-case tag keys", function () {
      assert.deepStrictEqual(parseTags("MESSAGE=Hi"), { message: "Hi" });
    });

    it("should support multiple different keys", function () {
      assert.deepStrictEqual(parseTags("abc=1;def=2;xd;xd;hi=;abc"), {
        abc: null,
        def: "2",
        xd: null,
        hi: "",
      });
    });
  });
});
