import { assert } from "chai";
import { TwitchBadgesList } from "../badges";
import { TwitchEmote } from "../emote";
import { parseTwitchMessage } from "../parser/twitch-message";
import { WhisperMessage } from "./whisper";

describe("./message/twitch-types/whisper", function () {
  describe("WhisperMessage", function () {
    it("should be able to parse a real WHISPER message correctly", function () {
      const msg = parseTwitchMessage(
        "@badges=;color=#2E8B57;display-name=pajbot;emotes=25:7-11;message-id=" +
          "2034;thread-id=40286300_82008718;turbo=0;user-id=82008718;user-type= " +
          ":pajbot!pajbot@pajbot.tmi.twitch.tv WHISPER randers :Riftey Kappa"
      ) as WhisperMessage;

      assert.instanceOf(msg, WhisperMessage);

      assert.strictEqual(msg.messageText, "Riftey Kappa");

      assert.strictEqual(msg.senderUsername, "pajbot");
      assert.strictEqual(msg.senderUserID, "82008718");
      assert.strictEqual(msg.displayName, "pajbot");

      assert.strictEqual(msg.recipientUsername, "randers");

      assert.deepStrictEqual(msg.badges, new TwitchBadgesList());
      assert.strictEqual(msg.badgesRaw, "");

      assert.deepStrictEqual(msg.color, {
        r: 0x2e,
        g: 0x8b,
        b: 0x57,
      });
      assert.strictEqual(msg.colorRaw, "#2E8B57");

      assert.deepStrictEqual(msg.emotes, [
        new TwitchEmote("25", 7, 12, "Kappa"),
      ]);
      assert.strictEqual(msg.emotesRaw, "25:7-11");

      assert.strictEqual(msg.messageID, "2034");
      assert.strictEqual(msg.threadID, "40286300_82008718");
    });

    it("trims spaces at the end of display names", function () {
      const msg = parseTwitchMessage(
        "@badges=;color=#2E8B57;display-name=pajbot\\s;emotes=25:7-11;message-id=" +
          "2034;thread-id=40286300_82008718;turbo=0;user-id=82008718;user-type= " +
          ":pajbot!pajbot@pajbot.tmi.twitch.tv WHISPER randers :Riftey Kappa"
      ) as WhisperMessage;

      assert.strictEqual(msg.displayName, "pajbot");
    });
  });
});
