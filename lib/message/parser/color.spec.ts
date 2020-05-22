import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { parseColor } from "./color";
import { ParseError } from "./parse-error";

describe("./message/parser/color", function () {
  describe("#parseColor()", function () {
    it("should parse numeric color string", function () {
      assert.deepStrictEqual(parseColor("#000000"), {
        r: 0x00,
        g: 0x00,
        b: 0x00,
      });
      assert.deepStrictEqual(parseColor("#123456"), {
        r: 0x12,
        g: 0x34,
        b: 0x56,
      });
      assert.deepStrictEqual(parseColor("#789011"), {
        r: 0x78,
        g: 0x90,
        b: 0x11,
      });
    });

    it("should parse uppercase hex color string", function () {
      assert.deepStrictEqual(parseColor("#AABBCC"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc,
      });
      assert.deepStrictEqual(parseColor("#FFFFFF"), {
        r: 0xff,
        g: 0xff,
        b: 0xff,
      });
    });

    it("should parse lowercase hex color string", function () {
      assert.deepStrictEqual(parseColor("#aabbcc"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc,
      });
      assert.deepStrictEqual(parseColor("#ffffff"), {
        r: 0xff,
        g: 0xff,
        b: 0xff,
      });
    });

    it("should parse mixed-case hex color string", function () {
      assert.deepStrictEqual(parseColor("#aAbBcC"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc,
      });
      assert.deepStrictEqual(parseColor("#FFffFF"), {
        r: 0xff,
        g: 0xff,
        b: 0xff,
      });
    });

    it("should parse alphanumeric hex color string", function () {
      assert.deepStrictEqual(parseColor("#A7F1FF"), {
        r: 0xa7,
        g: 0xf1,
        b: 0xff,
      });
      assert.deepStrictEqual(parseColor("#FF00FF"), {
        r: 0xff,
        g: 0x00,
        b: 0xff,
      });
    });

    it("should throw ParseError on missing leading hash", function () {
      assertThrowsChain(
        () => parseColor("aabbcc"),
        ParseError,
        'Malformed color value "aabbcc", must be in format #AABBCC'
      );
    });

    it("should throw ParseError on too-long input string", function () {
      assertThrowsChain(
        () => parseColor("aabbccFF"),
        ParseError,
        'Malformed color value "aabbccFF", must be in format #AABBCC'
      );
    });

    it("should throw ParseError on too-short input string", function () {
      assertThrowsChain(
        () => parseColor("aabbc"),
        ParseError,
        'Malformed color value "aabbc", must be in format #AABBCC'
      );
    });

    it("should throw ParseError on out-of-range hex characters input string", function () {
      assertThrowsChain(
        () => parseColor("AAAEAA"),
        ParseError,
        'Malformed color value "AAAEAA", must be in format #AABBCC'
      );
    });
  });
});
