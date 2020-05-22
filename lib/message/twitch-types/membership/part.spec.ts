import { assert } from "chai";
import { parseTwitchMessage } from "../../parser/twitch-message";
import { PartMessage } from "./part";

describe("./message/twitch-types/membership/part", function () {
  describe("PartMessage", function () {
    it("should be able to parse a real PART message", function () {
      const msg = parseTwitchMessage(
        ":justinfan11111!justinfan11111@justinfan11111.tmi.twitch.tv PART #pajlada"
      ) as PartMessage;

      assert.instanceOf(msg, PartMessage);

      assert.strictEqual(msg.channelName, "pajlada");
      assert.strictEqual(msg.partedUsername, "justinfan11111");
    });
  });
});
