import { assert } from "chai";
import { TwitchBadge } from "./badge";

describe("./message/badge", function () {
  describe("TwitchBadge", function () {
    describe("isKnownBadge style getters", function () {
      const testCases: [string, string, (b: TwitchBadge) => boolean][] = [
        ["admin", "1", (b) => b.isAdmin],
        ["bits", "1", (b) => b.isBits],
        ["bits", "1000", (b) => b.isBits],
        ["broadcaster", "1", (b) => b.isBroadcaster],
        ["global_mod", "1", (b) => b.isGlobalMod],
        ["moderator", "1", (b) => b.isModerator],
        ["subscriber", "1", (b) => b.isSubscriber],
        ["subscriber", "6", (b) => b.isSubscriber],
        ["subscriber", "12", (b) => b.isSubscriber],
        ["subscriber", "15", (b) => b.isSubscriber],
        ["staff", "1", (b) => b.isStaff],
        ["turbo", "1", (b) => b.isTurbo],
        ["vip", "1", (b) => b.isVIP],
      ];

      for (const [badgeName, badgeVersion, getter] of testCases) {
        it(`should recognize ${badgeName}/${badgeVersion}`, function () {
          const badge = new TwitchBadge(badgeName, badgeVersion);

          assert(getter(badge));
        });
      }
    });

    it("should return badgeName/badgeVersion from toString()", function () {
      assert.strictEqual(
        new TwitchBadge("subscriber", "1").toString(),
        "subscriber/1"
      );
      assert.strictEqual(
        new TwitchBadge("subscriber", "10").toString(),
        "subscriber/10"
      );
    });

    it("should return badgeName/badgeVersion from implcit toString() conversion", function () {
      assert.strictEqual(
        new TwitchBadge("subscriber", "10") + "",
        "subscriber/10"
      );
      assert.strictEqual(
        `${new TwitchBadge("subscriber", "10")}`,
        "subscriber/10"
      );
    });
  });
});
