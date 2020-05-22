import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { parseBadges, parseSingleBadge } from "./badges";
import { ParseError } from "./parse-error";

describe("./message/parser/badges", function () {
  describe("#parseSingleBadge()", function () {
    it("should parse correct badge normally", function () {
      assert.deepStrictEqual(
        parseSingleBadge("subscriber/24"),
        new TwitchBadge("subscriber", "24")
      );
      assert.deepStrictEqual(
        parseSingleBadge("subscriber/12"),
        new TwitchBadge("subscriber", "12")
      );
      assert.deepStrictEqual(
        parseSingleBadge("vip/1"),
        new TwitchBadge("vip", "1")
      );
    });

    it("should preserve non-integer versions as-is", function () {
      assert.deepStrictEqual(
        parseSingleBadge("vip/1.0"),
        new TwitchBadge("vip", "1.0")
      );
      assert.deepStrictEqual(
        parseSingleBadge("vip/1.0000"),
        new TwitchBadge("vip", "1.0000")
      );
      assert.deepStrictEqual(
        parseSingleBadge("vip/01"),
        new TwitchBadge("vip", "01")
      );
      assert.deepStrictEqual(
        parseSingleBadge("vip/00001"),
        new TwitchBadge("vip", "00001")
      );
      assert.deepStrictEqual(
        parseSingleBadge("vip/special"),
        new TwitchBadge("vip", "special")
      );
    });

    it("should throw ParseError if no / is present", function () {
      assertThrowsChain(
        () => parseSingleBadge("subscriber12"),
        ParseError,
        "Badge source \"subscriber12\" did not contain '/' character"
      );
      assertThrowsChain(
        () => parseSingleBadge(""),
        ParseError,
        "Badge source \"\" did not contain '/' character"
      );
      assertThrowsChain(
        () => parseSingleBadge("test"),
        ParseError,
        "Badge source \"test\" did not contain '/' character"
      );
    });

    it("should throw ParseError if badge name is empty", function () {
      assertThrowsChain(
        () => parseSingleBadge("/5"),
        ParseError,
        'Empty badge name on badge "/5"'
      );
      assertThrowsChain(
        () => parseSingleBadge("/"),
        ParseError,
        'Empty badge name on badge "/"'
      );
    });

    it("should throw ParseError if badge version is empty", function () {
      assertThrowsChain(
        () => parseSingleBadge("subscriber/"),
        ParseError,
        'Empty badge version on badge "subscriber/"'
      );
    });
  });

  describe("#parseBadges()", function () {
    it("should parse empty string as empty list", function () {
      assert.deepStrictEqual(parseBadges(""), new TwitchBadgesList());
    });

    it("should parse badges tag with 1 badge correctly", function () {
      const expected = new TwitchBadgesList();
      expected.push(new TwitchBadge("subscriber", "1"));

      assert.deepStrictEqual(parseBadges("subscriber/1"), expected);
    });

    it("should parse badges tag with 2 badges correctly", function () {
      const expected = new TwitchBadgesList();
      expected.push(new TwitchBadge("subscriber", "12"));
      expected.push(new TwitchBadge("vip", "1"));

      assert.deepStrictEqual(parseBadges("subscriber/12,vip/1"), expected);
    });

    it("should parse badges tag with 3 badges correctly", function () {
      const expected = new TwitchBadgesList();
      expected.push(new TwitchBadge("subscriber", "12"));
      expected.push(new TwitchBadge("vip", "1"));
      expected.push(new TwitchBadge("staff", "1"));

      assert.deepStrictEqual(
        parseBadges("subscriber/12,vip/1,staff/1"),
        expected
      );
    });
  });
});
