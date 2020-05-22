import { assert } from "chai";
import { TwitchBadge } from "./badge";
import { TwitchBadgesList } from "./badges";

describe("./message/badges", function () {
  describe("TwitchBadgesList", function () {
    describe("hasKnownBadge style getters", function () {
      const testCases: [string, string, (b: TwitchBadgesList) => boolean][] = [
        ["admin", "1", (b) => b.hasAdmin],
        ["bits", "1", (b) => b.hasBits],
        ["bits", "1000", (b) => b.hasBits],
        ["broadcaster", "1", (b) => b.hasBroadcaster],
        ["global_mod", "1", (b) => b.hasGlobalMod],
        ["moderator", "1", (b) => b.hasModerator],
        ["subscriber", "1", (b) => b.hasSubscriber],
        ["subscriber", "6", (b) => b.hasSubscriber],
        ["subscriber", "12", (b) => b.hasSubscriber],
        ["subscriber", "15", (b) => b.hasSubscriber],
        ["staff", "1", (b) => b.hasStaff],
        ["turbo", "1", (b) => b.hasTurbo],
        ["vip", "1", (b) => b.hasVIP],
      ];

      for (const [badgeName, badgeVersion, getter] of testCases) {
        it(`should recognize ${badgeName}/${badgeVersion}`, function () {
          const badgeList = new TwitchBadgesList();
          badgeList.push(new TwitchBadge(badgeName, badgeVersion));
          assert(getter(badgeList));
        });
      }
    });

    it("should return badge1,badge2,badge3 from toString()", function () {
      const list = new TwitchBadgesList();
      list.push(
        new TwitchBadge("admin", "1"),
        new TwitchBadge("vip", "1"),
        new TwitchBadge("subscriber", "12")
      );

      assert.strictEqual("admin/1,vip/1,subscriber/12", list.toString());
    });

    it("should return badge1,badge2,badge3 from implicit toString()", function () {
      const list = new TwitchBadgesList();
      list.push(
        new TwitchBadge("admin", "1"),
        new TwitchBadge("vip", "1"),
        new TwitchBadge("subscriber", "12")
      );

      assert.strictEqual("admin/1,vip/1,subscriber/12", `${list.toString()}`);
      assert.strictEqual("admin/1,vip/1,subscriber/12", list + "");
    });
  });
});
