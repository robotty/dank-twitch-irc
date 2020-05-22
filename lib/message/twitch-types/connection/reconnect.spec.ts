import { assert } from "chai";
import { parseTwitchMessage } from "../../parser/twitch-message";
import { ReconnectMessage } from "./reconnect";

describe("./message/twitch-types/connection/reconnect", function () {
  describe("ReconnectMessage", function () {
    it("should be able to parse a real RECONNECT message", function () {
      const msg = parseTwitchMessage(
        ":tmi.twitch.tv RECONNECT"
      ) as ReconnectMessage;

      assert.instanceOf(msg, ReconnectMessage);
    });
  });
});
