import { assert } from "chai";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import { matchingNotice } from "./conditions";

describe("./await/conditions", function () {
  describe("#matchingNotice()", function () {
    it("should not match anything that's not a NOTICE", function () {
      const msg = parseTwitchMessage(
        "@msg-id=timeout_success :tmi.twitch.tv TEST #pajlada :WEEB123 has been timed out for 1 second."
      );
      assert.isFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
    });

    it("should not match anything from the wrong channel", function () {
      const msg = parseTwitchMessage(
        "@msg-id=timeout_success :tmi.twitch.tv NOTICE #forsen :WEEB123 has been timed out for 1 second."
      );
      assert.isFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
    });

    it("should not match any non-matching notice IDs", function () {
      const msg = parseTwitchMessage(
        "@msg-id=timeout_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second."
      );
      assert.isFalse(matchingNotice("pajlada", ["timeout_success_lol"])(msg));
      assert.isTrue(matchingNotice("pajlada", ["timeout_success"])(msg));
    });

    it("should return false if msg-id is not present on the NOTICE message", function () {
      const msg = parseTwitchMessage(
        ":tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second."
      );
      assert.isFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
    });

    it("should return true for matching message", function () {
      const msg1 = parseTwitchMessage(
        "@msg-id=timeout_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second."
      );
      assert.isTrue(
        matchingNotice("pajlada", ["timeout_success", "lol"])(msg1)
      );

      const msg2 = parseTwitchMessage(
        "@msg-id=lol :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second."
      );
      assert.isTrue(
        matchingNotice("pajlada", ["timeout_success", "lol"])(msg2)
      );
    });
  });
});
