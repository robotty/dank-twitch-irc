import { assert } from "chai";
import {
  MAX_OUTGOING_COMMAND_LENGTH,
  MAX_OUTGOING_LINE_LENGTH,
} from "./constants";

describe("./constants", function () {
  describe("MAX_OUTGOING_LINE_LENGTH", function () {
    it("should be 4096", function () {
      assert.strictEqual(MAX_OUTGOING_LINE_LENGTH, 4096);
    });
  });

  describe("MAX_OUTGOING_COMMAND_LENGTH", function () {
    it("should be 4094", function () {
      assert.strictEqual(MAX_OUTGOING_COMMAND_LENGTH, 4094);
    });
  });
});
