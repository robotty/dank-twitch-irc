import { assert } from "chai";
import "mocha";
import { invisibleSuffix } from "./alternate-message-modifier";

describe("./modules/alternate-message-modifier", function() {
  describe("AlternateMessageModifier", () => {
    it("should have the correct escape for the invisible suffix", () => {
      // 1 (space) + 2 (invisible character)
      assert.equal(invisibleSuffix.length, 3);
    });

    // TODO
  });
});
