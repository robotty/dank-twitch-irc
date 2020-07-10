import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { TwitchFlag } from "../flag";
import { parseFlags } from "./flags";
import { ParseError } from "./parse-error";

describe("./message/parser/flags", function () {
  describe("#parseFlags()", function () {
    it("should parse empty string as no flags", function () {
      assert.deepStrictEqual(parseFlags("", ""), []);
    });

    it("should parse single flag, with one I category", function () {
      assert.deepStrictEqual(parseFlags("retard streamer", "0-5:I.3"), [
        new TwitchFlag(0, 6, "retard", [{ category: "I", score: 3 }]),
      ]);
    });

    it("should parse single flag, with one S category", function () {
      assert.deepStrictEqual(parseFlags("a phallic object", "2-8:S.7"), [
        new TwitchFlag(2, 9, "phallic", [{ category: "S", score: 7 }]),
      ]);
    });

    it("should parse single flag, with one A category", function () {
      assert.deepStrictEqual(parseFlags("you kill", "4-7:A.7"), [
        new TwitchFlag(4, 8, "kill", [{ category: "A", score: 7 }]),
      ]);
    });

    it("should parse single flag, with one P category", function () {
      assert.deepStrictEqual(parseFlags("stfu", "0-3:P.6"), [
        new TwitchFlag(0, 4, "stfu", [{ category: "P", score: 6 }]),
      ]);
    });

    it("should parse multiple instances of the same flag, with one P category", function () {
      assert.deepStrictEqual(
        parseFlags("shit in my asshole", "0-3:P.6,11-17:P.6"),
        [
          new TwitchFlag(0, 4, "shit", [{ category: "P", score: 6 }]),
          new TwitchFlag(11, 18, "asshole", [{ category: "P", score: 6 }]),
        ]
      );
    });

    it("should sort results by start index", function () {
      assert.deepStrictEqual(
        parseFlags(
          "shit in my asshole fucking shit mechanics",
          "0-3:P.7,11-17:P.7,19-25:P.7,27-30:P.7"
        ),
        [
          new TwitchFlag(0, 4, "shit", [{ category: "P", score: 7 }]),
          new TwitchFlag(11, 18, "asshole", [{ category: "P", score: 7 }]),
          new TwitchFlag(19, 26, "fucking", [{ category: "P", score: 7 }]),
          new TwitchFlag(27, 31, "shit", [{ category: "P", score: 7 }]),
        ]
      );
    });

    it("should throw a ParseError if flag index range has no dash", function () {
      assertThrowsChain(
        () => parseFlags("", "3:P.7"),
        ParseError,
        'No - found in flag index range "3"'
      );
    });

    it("should throw a ParseError if the from index is not a valid integer", function () {
      assertThrowsChain(
        () => parseFlags("", "abc-3:P.7"),
        ParseError,
        'Invalid integer for string "abc"'
      );
    });

    it("should throw a ParseError if the to index is not a valid integer", function () {
      assertThrowsChain(
        () => parseFlags("", "0-abc:P.7"),
        ParseError,
        'Invalid integer for string "abc"'
      );
    });

    it("should throw a ParseError if a end index is out of range", function () {
      assertThrowsChain(
        () => parseFlags("stfu", "0-4:P.6"),
        ParseError,
        "End index 4 is out of range for given message string"
      );
    });

    it("should throw a ParseError if category's score is a string", function () {
      assertThrowsChain(
        () => parseFlags("stfu", "0-3:P.abc"),
        ParseError,
        'Invalid integer for string "abc"'
      );
    });

    it("should parse four flags, with multiple categories", function () {
      assert.deepStrictEqual(
        parseFlags(
          "shut the fuck up retard streamer you kill a phallic object",
          "0-15:A.7/I.6/P.6,17-22:A.7/I.6,37-40:A.7,44-50:S.7"
        ),
        [
          new TwitchFlag(0, 16, "shut the fuck up", [
            { category: "A", score: 7 },
            { category: "I", score: 6 },
            { category: "P", score: 6 },
          ]),
          new TwitchFlag(17, 23, "retard", [
            { category: "A", score: 7 },
            { category: "I", score: 6 },
          ]),
          new TwitchFlag(37, 41, "kill", [{ category: "A", score: 7 }]),
          new TwitchFlag(44, 51, "phallic", [{ category: "S", score: 7 }]),
        ]
      );
    });
  });
});
