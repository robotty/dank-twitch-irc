import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { TwitchEmote } from "../emote";
import { IRCMessageTags } from "../irc/tags";
import { MissingTagError } from "./missing-tag-error";
import { ParseError } from "./parse-error";
import {
  getNonEmptyTagString,
  getTagBadges,
  getTagBoolean,
  getTagColor,
  getTagEmotes,
  getTagEmoteSets,
  getTagInt,
  getTagString,
  getTagTimestamp,
  tagParserFor
} from "./tag-values";

describe("./message/parser/tag-values", function() {
  function checkThrowsBasic<T extends any[]>(
    fn: (tags: IRCMessageTags, key: string, ...rest: T) => any,
    ...rest: T
  ): void {
    it("should throw MissingTagError on missing key", function() {
      assertThrowsChain(
        () => fn({}, "key", ...rest),
        MissingTagError,
        'Required tag value not present at key "key" (is undefined)'
      );
    });

    it("should throw MissingTagValueError on null value", function() {
      assertThrowsChain(
        () => fn({ key: null }, "key", ...rest),
        MissingTagError,
        'Required tag value not present at key "key" (is null)'
      );
    });
  }

  function checkThrowsEmptyString(
    fn: (tags: IRCMessageTags, key: string) => any
  ): void {
    it("should throw MissingTagValueError on empty string value", function() {
      assertThrowsChain(
        () => fn({ key: "" }, "key"),
        MissingTagError,
        'Required tag value not present at key "key" (is empty string)'
      );
    });
  }

  describe("#getTagString()", function() {
    checkThrowsBasic(getTagString);

    it("should return the value if value exists (also on empty string)", function() {
      assert.strictEqual(getTagString({ key: "value" }, "key"), "value");
      assert.strictEqual(getTagString({ key: "" }, "key"), "");
    });
  });

  describe("#getNonEmptyTagString()", function() {
    checkThrowsBasic(getNonEmptyTagString);
    checkThrowsEmptyString(getNonEmptyTagString);

    it("should return the value if value exists", function() {
      assert.strictEqual(
        getNonEmptyTagString({ key: "value" }, "key"),
        "value"
      );
    });
  });

  function checkThrowsUnparseableInt(
    fn: (tags: IRCMessageTags, key: string) => any
  ): void {
    it("should throw ParseError on invalid integer input", function() {
      assertThrowsChain(
        () => fn({ key: "abc" }, "key"),
        ParseError,
        'Failed to parse integer from tag value "abc"'
      );
    });
  }

  describe("#getTagInt()", function() {
    checkThrowsBasic(getTagInt);
    checkThrowsEmptyString(getTagInt);

    checkThrowsUnparseableInt(getTagInt);

    it("should return a number if value exists and was parseable", function() {
      assert.strictEqual(15, getTagInt({ key: "15" }, "key"));
    });
  });

  describe("#getTagBoolean()", function() {
    checkThrowsBasic(getTagBoolean);
    checkThrowsEmptyString(getTagBoolean);

    checkThrowsUnparseableInt(getTagInt);

    it("should return false if the parsed integer is 0", function() {
      assert.isFalse(getTagBoolean({ key: "0" }, "key"));
      assert.isFalse(getTagBoolean({ key: "0.0" }, "key"));
    });

    it("should return false if the parsed integer is non-0", function() {
      assert.isTrue(getTagBoolean({ key: "1" }, "key"));
      assert.isTrue(getTagBoolean({ key: "-1" }, "key"));
      assert.isTrue(getTagBoolean({ key: "15" }, "key"));
      assert.isTrue(getTagBoolean({ key: "-15" }, "key"));
    });
  });

  describe("#getTagColor()", function() {
    checkThrowsBasic(getTagColor);
    checkThrowsEmptyString(getTagColor);

    it("should parse #RRGGBB color input correctly", function() {
      assert.deepStrictEqual(getTagColor({ key: "#aabbcc" }, "key"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc
      });
      assert.deepStrictEqual(getTagColor({ key: "#AABBCC" }, "key"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc
      });
      assert.deepStrictEqual(getTagColor({ key: "#12D3FF" }, "key"), {
        r: 0x12,
        g: 0xd3,
        b: 0xff
      });
    });
  });

  describe("#getTagTimestamp()", function() {
    checkThrowsBasic(getTagTimestamp);
    checkThrowsEmptyString(getTagTimestamp);
    checkThrowsUnparseableInt(getTagTimestamp);

    it("should interpret given integer values as milliseconds since UTC epoch", function() {
      assert.strictEqual(
        getTagTimestamp({ key: "1234567" }, "key").getTime(),
        1234567
      );
    });
  });

  describe("#getTagBadges()", function() {
    checkThrowsBasic(getTagBadges);

    it("should return an empty list on empty string input", function() {
      assert.deepStrictEqual(
        getTagBadges({ key: "" }, "key"),
        new TwitchBadgesList()
      );
    });

    it("should return single-element array on single badge", function() {
      assert.deepStrictEqual(
        getTagBadges({ key: "admin/1" }, "key"),
        new TwitchBadgesList(new TwitchBadge("admin", 1))
      );
    });

    it("should accept two badges in the tag source", function() {
      assert.deepStrictEqual(
        getTagBadges({ key: "admin/1,subscriber/32" }, "key"),
        new TwitchBadgesList(
          new TwitchBadge("admin", 1),
          new TwitchBadge("subscriber", 32)
        )
      );
    });

    it("should accept three badges in the tag source", function() {
      assert.deepStrictEqual(
        getTagBadges({ key: "admin/1,subscriber/32,bits/1000" }, "key"),
        new TwitchBadgesList(
          new TwitchBadge("admin", 1),
          new TwitchBadge("subscriber", 32),
          new TwitchBadge("bits", 1000)
        )
      );
    });
  });

  describe("#getTagEmotes()", function() {
    checkThrowsBasic(getTagEmotes, "test message");

    it("should return an empty list on empty string input", function() {
      const actual = getTagEmotes({ key: "" }, "key", "test");
      assert.deepStrictEqual(actual, []);
    });

    it("should return single-element array on single emote", function() {
      const actual = getTagEmotes({ key: "25:4-8" }, "key", "asd Kappa def");
      assert.deepStrictEqual(actual, [new TwitchEmote("25", 4, 9, "Kappa")]);
    });

    it("should return 2-element array on 2 identical emotes", function() {
      const actual = getTagEmotes(
        { key: "25:4-8,14-18" },
        "key",
        "asd Kappa def Kappa def"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 4, 9, "Kappa"),
        new TwitchEmote("25", 14, 19, "Kappa")
      ]);
    });

    it("should return 2-element array on 2 different emotes", function() {
      const actual = getTagEmotes(
        { key: "25:4-8/1902:14-18" },
        "key",
        "asd Kappa def Keepo def"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 4, 9, "Kappa"),
        new TwitchEmote("1902", 14, 19, "Keepo")
      ]);
    });

    it("should return sorted 3-element array on interleaved emotes", function() {
      const actual = getTagEmotes(
        { key: "25:5-9,27-31/1902:16-20" },
        "key",
        "test Kappa test Keepo test Kappa"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 5, 10, "Kappa"),
        new TwitchEmote("1902", 16, 21, "Keepo"),
        new TwitchEmote("25", 27, 32, "Kappa")
      ]);
    });
  });

  describe("#getTagEmoteSets()", function() {
    checkThrowsBasic(getTagEmoteSets);

    it("should return an empty list on empty string input", function() {
      const actual = getTagEmoteSets({ key: "" }, "key");
      assert.deepStrictEqual(actual, []);
    });

    it("should parse one emote set correctly", function() {
      const actual = getTagEmoteSets({ key: "0" }, "key");
      assert.deepStrictEqual(actual, ["0"]);
    });

    it("should parse two emote set correctly", function() {
      const actual = getTagEmoteSets({ key: "0,3343" }, "key");
      assert.deepStrictEqual(actual, ["0", "3343"]);
    });

    it("should parse three emote set correctly", function() {
      // also tests that function preserves order (no sorting)
      const actual = getTagEmoteSets({ key: "0,7897,3343" }, "key");
      assert.deepStrictEqual(actual, ["0", "7897", "3343"]);
    });
  });

  describe("#tagParserFor()", function() {
    it(".getString() should behave like #getTagString()", function() {
      const parser = tagParserFor({ key: "value" });

      assert.strictEqual(parser.getString("key"), "value");
    });

    it(".getNonEmptyString() should behave like #getNonEmptyTagString()", function() {
      const parser = tagParserFor({ key: "value" });
      assert.strictEqual(parser.getNonEmptyString("key"), "value");
      assertThrowsChain(
        () => parser.getNonEmptyString("anotherKey"),
        MissingTagError,
        'Required tag value not present at key "anotherKey" (is undefined)'
      );
    });

    it(".getEmotes() should behave like #getTagEmotes()", function() {
      // special one because getEmotes takes an extra argument
      const parser = tagParserFor({ key: "25:5-9,27-31/1902:16-20" });

      const actual = parser.getEmotes(
        "key",
        "test Kappa test Keepo test Kappa"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 5, 10, "Kappa"),
        new TwitchEmote("1902", 16, 21, "Keepo"),
        new TwitchEmote("25", 27, 32, "Kappa")
      ]);
    });
  });
});
