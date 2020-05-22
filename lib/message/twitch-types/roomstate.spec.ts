import { assert } from "chai";
import { parseTwitchMessage } from "../parser/twitch-message";
import { hasAllStateTags, RoomstateMessage } from "./roomstate";

describe("./message/twitch-types/roomstate", function () {
  describe("#hasAllStateTags()", function () {
    it("should return true if all properties are present", function () {
      assert.isTrue(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",

          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",

          r9k: false,
          r9kRaw: "0",

          slowModeDuration: 0,
          slowModeDurationRaw: "0",

          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
    });

    it("should return false if one property is absent", function () {
      assert.isFalse(
        hasAllStateTags({
          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",

          r9k: false,
          r9kRaw: "0",

          slowModeDuration: 0,
          slowModeDurationRaw: "0",

          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",

          r9k: false,
          r9kRaw: "0",

          slowModeDuration: 0,
          slowModeDurationRaw: "0",

          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",

          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",

          slowModeDuration: 0,
          slowModeDurationRaw: "0",

          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",

          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",

          r9k: false,
          r9kRaw: "0",

          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",

          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",

          r9k: false,
          r9kRaw: "0",

          slowModeDuration: 0,
          slowModeDurationRaw: "0",
        })
      );
    });

    it("should return false if only one property is present", function () {
      assert.isFalse(
        hasAllStateTags({
          emoteOnly: true,
          emoteOnlyRaw: "1",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          followersOnlyDuration: -1,
          followersOnlyDurationRaw: "-1",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          r9k: false,
          r9kRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          slowModeDuration: 0,
          slowModeDurationRaw: "0",
        })
      );
      assert.isFalse(
        hasAllStateTags({
          subscribersOnly: false,
          subscribersOnlyRaw: "0",
        })
      );
    });
  });

  describe("RoomstateMessage", function () {
    it("should be able to parse a fully-populated ROOMSTATE message", function () {
      const msgText =
        "@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=40286300;" +
        "slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers";

      const msg = parseTwitchMessage(msgText) as RoomstateMessage;

      assert.instanceOf(msg, RoomstateMessage);

      assert.strictEqual(msg.channelName, "randers");

      assert.strictEqual(msg.channelID, "40286300");

      assert.strictEqual(msg.emoteOnly, false);
      assert.strictEqual(msg.emoteOnlyRaw, "0");

      assert.strictEqual(msg.followersOnlyDuration, -1);
      assert.strictEqual(msg.followersOnlyDurationRaw, "-1");

      assert.strictEqual(msg.r9k, false);
      assert.strictEqual(msg.r9kRaw, "0");

      assert.strictEqual(msg.slowModeDuration, 0);
      assert.strictEqual(msg.slowModeDurationRaw, "0");

      assert.strictEqual(msg.subscribersOnly, false);
      assert.strictEqual(msg.subscribersOnlyRaw, "0");

      assert.deepStrictEqual(msg.extractRoomState(), {
        emoteOnly: false,
        emoteOnlyRaw: "0",

        followersOnlyDuration: -1,
        followersOnlyDurationRaw: "-1",

        r9k: false,
        r9kRaw: "0",

        slowModeDuration: 0,
        slowModeDurationRaw: "0",

        subscribersOnly: false,
        subscribersOnlyRaw: "0",
      });

      assert.isTrue(hasAllStateTags(msg.extractRoomState()));
    });

    it("should be able to parse a single property change ROOMSTATE message", function () {
      const msgText =
        "@emote-only=1;room-id=40286300 :tmi.twitch.tv ROOMSTATE #randers";

      const msg = parseTwitchMessage(msgText) as RoomstateMessage;

      assert.instanceOf(msg, RoomstateMessage);

      assert.strictEqual(msg.channelName, "randers");

      assert.strictEqual(msg.channelID, "40286300");

      assert.strictEqual(msg.emoteOnly, true);
      assert.strictEqual(msg.emoteOnlyRaw, "1");

      assert.isUndefined(msg.followersOnlyDuration);
      assert.isUndefined(msg.followersOnlyDurationRaw);
      assert.isUndefined(msg.r9k);
      assert.isUndefined(msg.r9kRaw);
      assert.isUndefined(msg.slowModeDuration);
      assert.isUndefined(msg.slowModeDurationRaw);
      assert.isUndefined(msg.subscribersOnly);
      assert.isUndefined(msg.subscribersOnlyRaw);

      assert.deepStrictEqual(msg.extractRoomState(), {
        emoteOnly: true,
        emoteOnlyRaw: "1",
      });

      assert.isFalse(hasAllStateTags(msg.extractRoomState()));
    });
  });
});
