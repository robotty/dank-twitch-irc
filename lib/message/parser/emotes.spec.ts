import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { TwitchEmote } from "../emote";
import { parseEmotes } from "./emotes";
import { ParseError } from "./parse-error";

describe("./message/parser/emotes", function () {
  describe("#parseEmotes()", function () {
    it("should parse empty string as no emotes", function () {
      assert.deepStrictEqual(parseEmotes("", ""), []);
    });

    it("should parse single emote", function () {
      assert.deepStrictEqual(parseEmotes(":)", "1:0-1"), [
        new TwitchEmote("1", 0, 2, ":)"),
      ]);
    });

    it("should parse multiple instances of the same emote", function () {
      assert.deepStrictEqual(parseEmotes(":) :)", "1:0-1,3-4"), [
        new TwitchEmote("1", 0, 2, ":)"),
        new TwitchEmote("1", 3, 5, ":)"),
      ]);
    });

    it("should parse multiple emotes in the same message", function () {
      assert.deepStrictEqual(parseEmotes("Kappa Keepo", "25:0-4/1902:6-10"), [
        new TwitchEmote("25", 0, 5, "Kappa"),
        new TwitchEmote("1902", 6, 11, "Keepo"),
      ]);
    });

    it("should sort results by start index", function () {
      assert.deepStrictEqual(
        parseEmotes("Kappa Keepo Kappa", "25:0-4,12-16/1902:6-10"),
        [
          new TwitchEmote("25", 0, 5, "Kappa"),
          new TwitchEmote("1902", 6, 11, "Keepo"),
          new TwitchEmote("25", 12, 17, "Kappa"),
        ]
      );
    });

    it("should throw a ParseError if emote index range has no dash", function () {
      assertThrowsChain(
        () => parseEmotes("", "25:12"),
        ParseError,
        'No - found in emote index range "12"'
      );
    });

    it("should accept non-integer emote IDs", function () {
      assert.deepStrictEqual(parseEmotes(":)", "asd:0-1"), [
        new TwitchEmote("asd", 0, 2, ":)"),
      ]);
    });

    it("should throw a ParseError if the from index is not a valid integer", function () {
      assertThrowsChain(
        () => parseEmotes("", "25:abc-5"),
        ParseError,
        'Invalid integer for string "abc"'
      );
    });

    it("should throw a ParseError if the to index is not a valid integer", function () {
      assertThrowsChain(
        () => parseEmotes("", "25:0-abc"),
        ParseError,
        'Invalid integer for string "abc"'
      );
    });

    it("should gracefully handle it if a end index is out of range (1)", function () {
      assert.deepStrictEqual(parseEmotes("Kappa", "25:0-5"), [
        new TwitchEmote("25", 0, 5, "Kappa"),
      ]);
    });

    it("should gracefully handle it if a start index is out of range (2)", function () {
      assert.deepStrictEqual(parseEmotes("Kappa", "25:1-5"), [
        new TwitchEmote("25", 1, 5, "appa"),
      ]);
    });

    it("should gracefully handle it if an end index is extremely out of range", function () {
      assert.deepStrictEqual(parseEmotes("Kappa", "25:2-10"), [
        new TwitchEmote("25", 2, 5, "ppa"),
      ]);
    });

    it("should parse correctly with emoji present", function () {
      assert.deepStrictEqual(parseEmotes("-tags 👉 <3", "483:8-9"), [
        new TwitchEmote("483", 8, 10, "<3"),
      ]);
    });

    it("should parse multiple instances of the same emote if preceeded by emoji", function () {
      assert.deepStrictEqual(parseEmotes("👉 <3 👉 <3", "445:2-3,7-8"), [
        new TwitchEmote("445", 2, 4, "<3"),
        new TwitchEmote("445", 7, 9, "<3"),
      ]);
    });

    it("should parse multiple emotes in the same message when multiple emojis exist between them", function () {
      assert.deepStrictEqual(
        parseEmotes(
          "🌚 Kappa 🌚 🐈 Keepo 🐈 🎨 KappaRoss 🎨",
          "25:2-6/1902:12-16/70433:22-30"
        ),
        [
          new TwitchEmote("25", 2, 7, "Kappa"),
          new TwitchEmote("1902", 12, 17, "Keepo"),
          new TwitchEmote("70433", 22, 31, "KappaRoss"),
        ]
      );
    });
  });
});
