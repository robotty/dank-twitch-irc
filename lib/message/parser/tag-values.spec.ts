import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { TwitchEmote } from "../emote";
import { MissingTagError } from "./missing-tag-error";
import { ParseError } from "./parse-error";
import { tagParserFor, TagValueParser } from "./tag-values";

describe("./message/parser/tag-values", function () {
  function checkRequire<V, A extends any[]>(
    subject: (
      tagParser: TagValueParser
    ) => (key: string, ...converterArgs: A) => V,
    ...converterArgs: A
  ): void {
    describe("#requireData", function () {
      it("should throw MissingTagError on missing key", function () {
        assertThrowsChain(
          () => subject(tagParserFor({}))("key", ...converterArgs),
          MissingTagError,
          'Required tag value not present at key "key" (is undefined)'
        );
      });

      it("should throw MissingTagError on null value", function () {
        assertThrowsChain(
          () => subject(tagParserFor({ key: null }))("key", ...converterArgs),
          MissingTagError,
          'Required tag value not present at key "key" (is null)'
        );
      });
    });
  }

  function checkGet<V, A extends any[]>(
    subject: (
      tagParser: TagValueParser
    ) => (key: string, ...converterArgs: A) => V | undefined,
    ...converterArgs: A
  ): void {
    describe("#getData", function () {
      it("should return undefined on missing key", function () {
        assert.isUndefined(subject(tagParserFor({}))("key", ...converterArgs));
      });

      it("should return undefined on null value", function () {
        assert.isUndefined(
          subject(tagParserFor({ key: null }))("key", ...converterArgs)
        );
      });
    });
  }

  describe("#getString(), #requireString()", function () {
    checkGet((p) => p.getString);
    checkRequire((p) => p.requireString);

    it("should return the value if value exists (also on empty string)", function () {
      assert.strictEqual(
        tagParserFor({ key: "value" }).getString("key"),
        "value"
      );
      assert.strictEqual(
        tagParserFor({ key: "value" }).requireString("key"),
        "value"
      );
      assert.strictEqual(tagParserFor({ key: "" }).getString("key"), "");
      assert.strictEqual(tagParserFor({ key: "" }).requireString("key"), "");
    });
  });

  function checkThrowsUnparseableInt<V, A extends any[]>(
    subject: (
      tagParser: TagValueParser
    ) => (key: string, ...converterArgs: A) => V | undefined,
    ...converterArgs: A
  ): void {
    it("should throw ParseError on empty string input", function () {
      assertThrowsChain(
        () => subject(tagParserFor({ key: "" }))("key", ...converterArgs),
        ParseError,
        'Failed to parse integer from tag value ""'
      );
    });
    it("should throw ParseError on invalid integer input", function () {
      assertThrowsChain(
        () => subject(tagParserFor({ key: "abc" }))("key", ...converterArgs),
        ParseError,
        'Failed to parse integer from tag value "abc"'
      );
    });
  }

  describe("#getInt(), #requireInt()", function () {
    checkGet((p) => p.getInt);
    checkRequire((p) => p.requireInt);

    checkThrowsUnparseableInt((p) => p.getInt);
    checkThrowsUnparseableInt((p) => p.requireInt);

    it("should return a number if value exists and was parseable", function () {
      assert.strictEqual(15, tagParserFor({ key: "15" }).getInt("key"));
      assert.strictEqual(15, tagParserFor({ key: "15" }).requireInt("key"));
    });
  });

  describe("#getBoolean(), #requireBoolean()", function () {
    checkGet((p) => p.getBoolean);
    checkRequire((p) => p.requireBoolean);

    checkThrowsUnparseableInt((p) => p.getInt);
    checkThrowsUnparseableInt((p) => p.requireInt);

    it("should return false if the parsed integer is 0", function () {
      assert.isFalse(tagParserFor({ key: "0" }).getBoolean("key"));
      assert.isFalse(tagParserFor({ key: "0.0" }).getBoolean("key"));
    });

    it("should return false if the parsed integer is non-0", function () {
      assert.isTrue(tagParserFor({ key: "1" }).getBoolean("key"));
      assert.isTrue(tagParserFor({ key: "-1" }).getBoolean("key"));
      assert.isTrue(tagParserFor({ key: "15" }).getBoolean("key"));
      assert.isTrue(tagParserFor({ key: "-15" }).getBoolean("key"));
    });
  });

  describe("#getColor(), #requireColor()", function () {
    checkGet((p) => p.getColor);
    checkRequire((p) => p.requireColor);

    it("should parse #RRGGBB color input correctly", function () {
      assert.deepStrictEqual(tagParserFor({ key: "#aabbcc" }).getColor("key"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc,
      });
      assert.deepStrictEqual(tagParserFor({ key: "#AABBCC" }).getColor("key"), {
        r: 0xaa,
        g: 0xbb,
        b: 0xcc,
      });
      assert.deepStrictEqual(tagParserFor({ key: "#12D3FF" }).getColor("key"), {
        r: 0x12,
        g: 0xd3,
        b: 0xff,
      });
    });

    it("#getColor() should return undefined on empty string input", function () {
      assert.isUndefined(tagParserFor({ key: "" }).getColor("key"));
    });

    it("#requireColor() should throw MissingDataError on empty string input", function () {
      assertThrowsChain(
        () => tagParserFor({ key: "" }).requireColor("key"),
        MissingTagError,
        'Required tag value not present at key "key" (is empty string)'
      );
    });
  });

  describe("#getTimestamp(), #requireTimestamp()", function () {
    checkGet((p) => p.getTimestamp);
    checkRequire((p) => p.requireTimestamp);
    checkThrowsUnparseableInt((p) => p.getTimestamp);
    checkThrowsUnparseableInt((p) => p.requireTimestamp);

    it("should interpret given integer values as milliseconds since UTC epoch", function () {
      assert.strictEqual(
        tagParserFor({ key: "1234567" }).requireTimestamp("key").getTime(),
        1234567
      );
    });
  });

  describe("#getBadges(), #requireBadges()", function () {
    checkGet((p) => p.getBadges);
    checkRequire((p) => p.requireBadges);

    it("should return an empty list on empty string input", function () {
      assert.deepStrictEqual(
        tagParserFor({ key: "" }).getBadges("key"),
        new TwitchBadgesList()
      );
    });

    it("should return single-element array on single badge", function () {
      assert.deepStrictEqual(
        tagParserFor({ key: "admin/1" }).getBadges("key"),
        new TwitchBadgesList(new TwitchBadge("admin", "1"))
      );
    });

    it("should accept two badges in the tag source", function () {
      assert.deepStrictEqual(
        tagParserFor({ key: "admin/1,subscriber/32" }).getBadges("key"),
        new TwitchBadgesList(
          new TwitchBadge("admin", "1"),
          new TwitchBadge("subscriber", "32")
        )
      );
    });

    it("should accept three badges in the tag source", function () {
      assert.deepStrictEqual(
        tagParserFor({ key: "admin/1,subscriber/32,bits/1000" }).getBadges(
          "key"
        ),
        new TwitchBadgesList(
          new TwitchBadge("admin", "1"),
          new TwitchBadge("subscriber", "32"),
          new TwitchBadge("bits", "1000")
        )
      );
    });
  });

  describe("#getTagEmotes()", function () {
    checkGet((p) => p.getEmotes, "lul");
    checkRequire((p) => p.requireEmoteSets, "lul");

    it("should return an empty list on empty string input", function () {
      const actual = tagParserFor({ key: "" }).getEmotes("key", "test");
      assert.deepStrictEqual(actual, []);
    });

    it("should return single-element array on single emote", function () {
      const actual = tagParserFor({ key: "25:4-8" }).getEmotes(
        "key",
        "asd Kappa def"
      );
      assert.deepStrictEqual(actual, [new TwitchEmote("25", 4, 9, "Kappa")]);
    });

    it("should return 2-element array on 2 identical emotes", function () {
      const actual = tagParserFor({ key: "25:4-8,14-18" }).getEmotes(
        "key",
        "asd Kappa def Kappa def"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 4, 9, "Kappa"),
        new TwitchEmote("25", 14, 19, "Kappa"),
      ]);
    });

    it("should return 2-element array on 2 different emotes", function () {
      const actual = tagParserFor({ key: "25:4-8/1902:14-18" }).getEmotes(
        "key",
        "asd Kappa def Keepo def"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 4, 9, "Kappa"),
        new TwitchEmote("1902", 14, 19, "Keepo"),
      ]);
    });

    it("should return a correctly sorted 3-element array on interleaved emotes", function () {
      const actual = tagParserFor({ key: "25:5-9,27-31/1902:16-20" }).getEmotes(
        "key",
        "test Kappa test Keepo test Kappa"
      );
      assert.deepStrictEqual(actual, [
        new TwitchEmote("25", 5, 10, "Kappa"),
        new TwitchEmote("1902", 16, 21, "Keepo"),
        new TwitchEmote("25", 27, 32, "Kappa"),
      ]);
    });
  });

  describe("#getEmoteSets(), #requireEmoteSets()", function () {
    checkGet((p) => p.getEmoteSets);
    checkRequire((p) => p.requireEmoteSets);

    it("should return an empty list on empty string input", function () {
      const actual = tagParserFor({ key: "" }).getEmoteSets("key");
      assert.deepStrictEqual(actual, []);
    });

    it("should parse one emote set correctly", function () {
      const actual = tagParserFor({ key: "0" }).getEmoteSets("key");
      assert.deepStrictEqual(actual, ["0"]);
    });

    it("should parse two emote set correctly", function () {
      const actual = tagParserFor({ key: "0,3343" }).getEmoteSets("key");
      assert.deepStrictEqual(actual, ["0", "3343"]);
    });

    it("should parse three emote set correctly", function () {
      // also tests that function preserves order (no sorting)
      const actual = tagParserFor({ key: "0,7897,3343" }).getEmoteSets("key");
      assert.deepStrictEqual(actual, ["0", "7897", "3343"]);
    });
  });
});
