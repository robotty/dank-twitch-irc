import { assert } from "chai";
import { assertThrowsChain } from "../helpers.spec";
import { splitIntoChunks } from "./split-into-chunks";

describe("./utils/split-into-chunks", function () {
  describe("#splitIntoChunks()", function () {
    describe("splitIntoChunks", () => {
      it("should return an empty array when an empty array is passed", () => {
        assert.deepStrictEqual(splitIntoChunks([], " ", 500), []);
      });

      it("should return a single-element array as is", () => {
        assert.deepStrictEqual(splitIntoChunks(["test"], " ", 500), [["test"]]);
      });

      it("should return a two-element array that does not need to be split as is", () => {
        assert.deepStrictEqual(splitIntoChunks(["test", "abc"], " ", 500), [
          ["test", "abc"],
        ]);
      });

      it("should handle custom-length separators correctly", () => {
        // test123KKona
        assert.deepStrictEqual(
          splitIntoChunks(["test", "KKona", "abc"], "123", 13),
          [["test", "KKona"], ["abc"]]
        );
      });

      // for when the resulting chunk of bits is of the exact same length that was requested
      it("should handle exact-requested-length output chunks", () => {
        const s =
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
          "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed " +
          "diam voluptua. At vero eos et accusam et justo duo dolores";

        assert.deepStrictEqual(splitIntoChunks(s.split(" "), " ", 72), [
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy".split(
            " "
          ),
          "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam".split(
            " "
          ),
          "voluptua. At vero eos et accusam et justo duo dolores".split(" "),
        ]);
      });

      it("should throw an error when the split is impossible", () => {
        assertThrowsChain(
          () => splitIntoChunks(["superlongmessage", "NaM"], " ", 15),
          Error,
          "Found a piece that can never fit the target length limit"
        );
      });
    });
  });
});
