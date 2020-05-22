import { assert } from "chai";
import { parseTwitchMessage } from "../parser/twitch-message";
import { ClearmsgMessage } from "./clearmsg";

describe("./message/twitch-types/clearmsg", function () {
  describe("ClearmsgMessage", function () {
    it("should be able to parse a real CLEARMSG message from twitch", function () {
      const msgText =
        "@login=supibot;room-id=;target-msg-id=25fd76d9-4731-4907-978e-a391134ebd67;" +
        "tmi-sent-ts=-6795364578871 :tmi.twitch.tv CLEARMSG #randers :Pong! Uptime: 6h, " +
        "15m; Temperature: 54.8°C; Latency to TMI: 183ms; Commands used: 795";

      const msg: ClearmsgMessage = parseTwitchMessage(
        msgText
      ) as ClearmsgMessage;

      assert.strictEqual(Object.getPrototypeOf(msg), ClearmsgMessage.prototype);
      assert.strictEqual(msg.channelName, "randers");
      assert.strictEqual(msg.targetUsername, "supibot");
      assert.strictEqual(
        msg.targetMessageID,
        "25fd76d9-4731-4907-978e-a391134ebd67"
      );
      assert.strictEqual(
        msg.targetMessageContent,
        "Pong! Uptime: 6h, 15m; Temperature: 54.8°C; " +
          "Latency to TMI: 183ms; Commands used: 795"
      );
    });
  });
});
