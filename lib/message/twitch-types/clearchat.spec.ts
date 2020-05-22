import { assert } from "chai";
import { parseTwitchMessage } from "../parser/twitch-message";
import { ClearchatMessage } from "./clearchat";

describe("./message/twitch-types/clearchat", function () {
  describe("ClearchatMessage", function () {
    it("should be able to parse a real CLEARCHAT timeout message from twitch", function () {
      const msgText =
        "@ban-duration=600;room-id=40286300;target-user-id=70948394;" +
        "tmi-sent-ts=1563051113633 :tmi.twitch.tv CLEARCHAT #randers :weeb123";

      const msg: ClearchatMessage = parseTwitchMessage(
        msgText
      ) as ClearchatMessage;

      assert.instanceOf(msg, ClearchatMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.strictEqual(msg.targetUsername, "weeb123");
      assert.strictEqual(msg.banDuration, 600);
      assert.isFalse(msg.wasChatCleared());
      assert.isTrue(msg.isTimeout());
      assert.isFalse(msg.isPermaban());
    });

    it("should be able to parse a real CLEARCHAT ban message from twitch", function () {
      const msgText =
        "@room-id=40286300;target-user-id=70948394;tmi-sent-ts=1563051758128 " +
        ":tmi.twitch.tv CLEARCHAT #randers :weeb123";

      const msg: ClearchatMessage = parseTwitchMessage(
        msgText
      ) as ClearchatMessage;

      assert.instanceOf(msg, ClearchatMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.strictEqual(msg.targetUsername, "weeb123");
      assert.isUndefined(msg.banDuration);
      assert.isFalse(msg.wasChatCleared());
      assert.isFalse(msg.isTimeout());
      assert.isTrue(msg.isPermaban());
    });

    it("should be able to parse a real CLEARCHAT chat clear message from twitch", function () {
      const msgText =
        "@room-id=40286300;tmi-sent-ts=1563051778390 :tmi.twitch.tv CLEARCHAT #randers";

      const msg: ClearchatMessage = parseTwitchMessage(
        msgText
      ) as ClearchatMessage;

      assert.instanceOf(msg, ClearchatMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.isUndefined(msg.targetUsername);
      assert.isUndefined(msg.banDuration);
      assert.isTrue(msg.wasChatCleared());
      assert.isFalse(msg.isTimeout());
      assert.isFalse(msg.isPermaban());
    });
  });
});
