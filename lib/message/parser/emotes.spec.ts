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

    it("should throw a ParseError if a end index is out of range", function () {
      assertThrowsChain(
        () => parseEmotes("Kappa", "25:0-5"),
        ParseError,
        "End index 5 is out of range for given message string"
      );
    });
  });
});
