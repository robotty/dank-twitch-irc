import { assert } from "chai";
import { parseEmoteSets } from "./emote-sets";

describe("./message/parser/emote-sets", function () {
  describe("#parseEmoteSets()", function () {
    it("should parse empty string as empty list", function () {
      assert.deepStrictEqual(parseEmoteSets(""), []);
    });

    it("should parse single digit as single element array", function () {
      assert.deepStrictEqual(parseEmoteSets("0"), ["0"]);
      assert.deepStrictEqual(parseEmoteSets("100"), ["100"]);
    });

    it("should ignore empty emote set IDs (two adjacent commas)", function () {
      assert.deepStrictEqual(parseEmoteSets("0,,,100,200,,33,4"), [
        "0",
        "100",
        "200",
        "33",
        "4",
      ]);
    });

    it("should parse multiple emote sets correctly", function () {
      assert.deepStrictEqual(parseEmoteSets("0,100,200,33,4"), [
        "0",
        "100",
        "200",
        "33",
        "4",
      ]);
    });

    it("should be able to accept non-number emote set IDs", function () {
      // it is doubtful twitch ever does this, but nowhere does it say
      // emote set IDs have to be numeric, so just make sure we're safe.
      assert.deepStrictEqual(parseEmoteSets("0,1,2-extra,something-else"), [
        "0",
        "1",
        "2-extra",
        "something-else",
      ]);
    });
  });
});
