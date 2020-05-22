import { assert } from "chai";
import { parseTwitchMessage } from "../parser/twitch-message";
import { NoticeMessage } from "./notice";

describe("./message/twitch-types/notice", function () {
  describe("NoticeMessage", function () {
    it("should parse a normal NOTICE sent by the twitch server", function () {
      const msgText =
        "@msg-id=msg_banned :tmi.twitch.tv NOTICE #forsen " +
        ":You are permanently banned from talking in forsen.";

      const msg: NoticeMessage = parseTwitchMessage(msgText) as NoticeMessage;

      assert.instanceOf(msg, NoticeMessage);

      assert.strictEqual(msg.channelName, "forsen");
      assert.strictEqual(
        msg.messageText,
        "You are permanently banned from talking in forsen."
      );
      assert.strictEqual(msg.messageID, "msg_banned");
    });

    it("should parse a NOTICE message received before successfuly login", function () {
      const msgText = ":tmi.twitch.tv NOTICE * :Improperly formatted auth";

      const msg: NoticeMessage = parseTwitchMessage(msgText) as NoticeMessage;

      assert.instanceOf(msg, NoticeMessage);

      assert.isUndefined(msg.channelName);
      assert.strictEqual(msg.messageText, "Improperly formatted auth");
      assert.isUndefined(msg.messageID);
    });
  });
});
