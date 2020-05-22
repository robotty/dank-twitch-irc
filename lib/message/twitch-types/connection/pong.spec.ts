import { assert } from "chai";
import { parseTwitchMessage } from "../../parser/twitch-message";
import { PongMessage } from "./pong";

describe("./message/twitch-types/connection/pong", function () {
  describe("PongMessage", function () {
    it("should be able to parse a real PONG message with no argument", function () {
      const msg = parseTwitchMessage(":tmi.twitch.tv PONG") as PongMessage;

      assert.instanceOf(msg, PongMessage);

      assert.strictEqual(msg.argument, undefined);
    });
    it("should be able to parse a real PONG message with argument", function () {
      const msg = parseTwitchMessage(
        ":tmi.twitch.tv PONG tmi.twitch.tv :argument test"
      ) as PongMessage;

      assert.instanceOf(msg, PongMessage);

      assert.strictEqual(msg.argument, "argument test");
    });
  });
});
