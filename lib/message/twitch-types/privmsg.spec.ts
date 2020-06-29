import { assert } from "chai";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { parseTwitchMessage } from "../parser/twitch-message";
import { parseActionAndMessage, PrivmsgMessage } from "./privmsg";

describe("./message/twitch-types/privmsg", function () {
  describe("#parseActionAndMessage()", function () {
    it("should return non-actions unmodified", function () {
      assert.deepStrictEqual(parseActionAndMessage("HeyGuys"), {
        isAction: false,
        message: "HeyGuys",
      });

      assert.deepStrictEqual(parseActionAndMessage("\u0001ACTION HeyGuys"), {
        isAction: false,
        message: "\u0001ACTION HeyGuys",
      });

      assert.deepStrictEqual(parseActionAndMessage("HeyGuys\u0001"), {
        isAction: false,
        message: "HeyGuys\u0001",
      });

      // missing space
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTIONHeyGuys\u0001"),
        {
          isAction: false,
          message: "\u0001ACTIONHeyGuys\u0001",
        }
      );
    });

    it("should remove action prefix and suffix on valid actions", function () {
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTION HeyGuys\u0001"),
        {
          isAction: true,
          message: "HeyGuys",
        }
      );

      // nested
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTION \u0001ACTION HeyGuys\u0001\u0001"),
        {
          isAction: true,
          message: "\u0001ACTION HeyGuys\u0001",
        }
      );
    });
  });

  describe("PrivmsgMessage", function () {
    it("should be able to parse a real PRIVMSG message", function () {
      const msgText =
        "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;" +
        "mod=0;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;turbo=0;" +
        "user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.instanceOf(msg, PrivmsgMessage);

      assert.strictEqual(msg.channelName, "randers");

      assert.strictEqual(msg.messageText, "test");
      assert.isFalse(msg.isAction);

      assert.strictEqual(msg.senderUsername, "randers");

      assert.strictEqual(msg.senderUserID, "40286300");

      assert.deepStrictEqual(
        msg.badgeInfo,
        new TwitchBadgesList(new TwitchBadge("subscriber", "5"))
      );
      assert.strictEqual(msg.badgeInfoRaw, "subscriber/5");

      assert.deepStrictEqual(
        msg.badges,
        new TwitchBadgesList(
          new TwitchBadge("broadcaster", "1"),
          new TwitchBadge("subscriber", "0")
        )
      );
      assert.strictEqual(msg.badgesRaw, "broadcaster/1,subscriber/0");

      assert.isUndefined(msg.bits);
      assert.isUndefined(msg.bitsRaw);

      assert.deepStrictEqual(msg.color, { r: 0x19, g: 0xe6, b: 0xe6 });
      assert.strictEqual(msg.colorRaw, "#19E6E6");

      assert.strictEqual(msg.displayName, "randers");

      assert.deepStrictEqual(msg.emotes, []);
      assert.strictEqual(msg.emotesRaw, "");

      assert.strictEqual(msg.messageID, "7eb848c9-1060-4e5e-9f4c-612877982e79");

      assert.isFalse(msg.isMod);
      assert.strictEqual(msg.isModRaw, "0");

      assert.strictEqual(msg.channelID, "40286300");

      assert.strictEqual(msg.serverTimestamp.getTime(), 1563096499780);
      assert.strictEqual(msg.serverTimestampRaw, "1563096499780");

      assert.deepStrictEqual(msg.extractUserState(), {
        badgeInfo: new TwitchBadgesList(new TwitchBadge("subscriber", "5")),
        badgeInfoRaw: "subscriber/5",
        badges: new TwitchBadgesList(
          new TwitchBadge("broadcaster", "1"),
          new TwitchBadge("subscriber", "0")
        ),
        badgesRaw: "broadcaster/1,subscriber/0",
        color: { r: 0x19, g: 0xe6, b: 0xe6 },
        colorRaw: "#19E6E6",
        displayName: "randers",
        isMod: false,
        isModRaw: "0",
      });

      assert.isFalse(msg.isCheer());
    });

    it("trims spaces at the end of display names", function () {
      const msgText =
        "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers\\s;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;" +
        "mod=0;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;turbo=0;" +
        "user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.strictEqual(msg.displayName, "randers");
      assert.strictEqual(msg.extractUserState().displayName, "randers");
    });
  });
});
