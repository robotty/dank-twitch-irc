import { assert } from "chai";
import { parseTwitchMessage } from "../../parser/twitch-message";
import { PingMessage } from "./ping";

describe("./message/twitch-types/connection/ping", function () {
  describe("PingMessage", function () {
    it("should be able to parse a real PING message with no argument", function () {
      const msg = parseTwitchMessage(":tmi.twitch.tv PING") as PingMessage;

      assert.instanceOf(msg, PingMessage);

      assert.strictEqual(msg.argument, undefined);
    });
    it("should be able to parse a real PING message with argument", function () {
      const msg = parseTwitchMessage(
        ":tmi.twitch.tv PING tmi.twitch.tv :argument test"
      ) as PingMessage;

      assert.instanceOf(msg, PingMessage);

      assert.strictEqual(msg.argument, "argument test");
    });
  });
});
