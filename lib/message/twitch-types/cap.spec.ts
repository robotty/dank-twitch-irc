import { assert } from "chai";
import { parseTwitchMessage } from "../parser/twitch-message";
import { CapMessage } from "./cap";

describe("./message/twitch-types/cap", function () {
  describe("CapMessage", function () {
    it("should parse a single CAP ACK message", function () {
      const msgText = ":tmi.twitch.tv CAP * ACK :twitch.tv/commands";

      const msg = parseTwitchMessage(msgText) as CapMessage;

      assert.instanceOf(msg, CapMessage);

      assert.strictEqual(msg.subCommand, "ACK");
      assert.deepStrictEqual(msg.capabilities, ["twitch.tv/commands"]);
    });

    it("should parse multiple capabilities CAP ACK message", function () {
      const msgText =
        ":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags twitch.tv/membership";

      const msg = parseTwitchMessage(msgText) as CapMessage;

      assert.instanceOf(msg, CapMessage);

      assert.strictEqual(msg.subCommand, "ACK");
      assert.deepStrictEqual(msg.capabilities, [
        "twitch.tv/commands",
        "twitch.tv/tags",
        "twitch.tv/membership",
      ]);
    });

    it("should parse a CAP NAK message", function () {
      const msgText = ":tmi.twitch.tv CAP * NAK :invalid twitch.tv/invalid";

      const msg = parseTwitchMessage(msgText) as CapMessage;

      assert.instanceOf(msg, CapMessage);

      assert.strictEqual(msg.subCommand, "NAK");
      assert.deepStrictEqual(msg.capabilities, [
        "invalid",
        "twitch.tv/invalid",
      ]);
    });

    it("should parse a CAP LS message", function () {
      const msgText =
        ":tmi.twitch.tv CAP * LS :twitch.tv/tags twitch.tv/commands twitch.tv/membership";

      const msg = parseTwitchMessage(msgText) as CapMessage;

      assert.instanceOf(msg, CapMessage);

      assert.strictEqual(msg.subCommand, "LS");
      assert.deepStrictEqual(msg.capabilities, [
        "twitch.tv/tags",
        "twitch.tv/commands",
        "twitch.tv/membership",
      ]);
    });
  });
});
