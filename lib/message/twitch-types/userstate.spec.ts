import { assert } from "chai";
import { TwitchBadgesList } from "../badges";
import { parseTwitchMessage } from "../parser/twitch-message";
import { UserstateMessage } from "./userstate";

describe("./message/twitch-types/userstate", function () {
  describe("UserstateMessage", function () {
    it("should be able to parse a real userstate message", function () {
      const msg = parseTwitchMessage(
        "@badge-info=;badges=;color=#FF0000;" +
          "display-name=zwb3_pyramids;emote-sets=0;mod=0;subscriber=0;user-type=" +
          " :tmi.twitch.tv USERSTATE #randers"
      ) as UserstateMessage;

      assert.instanceOf(msg, UserstateMessage);

      assert.strictEqual(msg.channelName, "randers");

      assert.deepStrictEqual(msg.badgeInfo, new TwitchBadgesList());
      assert.strictEqual(msg.badgeInfoRaw, "");

      assert.deepStrictEqual(msg.badges, new TwitchBadgesList());
      assert.strictEqual(msg.badgesRaw, "");

      assert.deepStrictEqual(msg.color, {
        r: 0xff,
        g: 0x00,
        b: 0x00,
      });
      assert.strictEqual(msg.colorRaw, "#FF0000");

      assert.strictEqual(msg.displayName, "zwb3_pyramids");

      assert.deepStrictEqual(msg.emoteSets, ["0"]);
      assert.strictEqual(msg.emoteSetsRaw, "0");

      assert.strictEqual(msg.isMod, false);
      assert.strictEqual(msg.isModRaw, "0");
    });

    it("should extract the correct values with extractUserState()", function () {
      const msg = parseTwitchMessage(
        "@badge-info=;badges=;color=#FF0000;" +
          "display-name=zwb3_pyramids;emote-sets=0;mod=0;subscriber=0;user-type=" +
          " :tmi.twitch.tv USERSTATE #randers"
      ) as UserstateMessage;

      assert.deepStrictEqual(msg.extractUserState(), {
        badgeInfo: new TwitchBadgesList(),
        badgeInfoRaw: "",
        badges: new TwitchBadgesList(),
        badgesRaw: "",
        color: { r: 0xff, g: 0x00, b: 0x00 },
        colorRaw: "#FF0000",
        displayName: "zwb3_pyramids",
        emoteSets: ["0"],
        emoteSetsRaw: "0",
        isMod: false,
        isModRaw: "0",
      });
    });

    it("trims spaces at the end of display names", function () {
      const msg = parseTwitchMessage(
        "@badge-info=;badges=;color=#FF0000;" +
          "display-name=zwb3_pyramids\\s;emote-sets=0;mod=0;subscriber=0;user-type=" +
          " :tmi.twitch.tv USERSTATE #randers"
      ) as UserstateMessage;

      assert.strictEqual(msg.displayName, "zwb3_pyramids");
    });
  });
});
