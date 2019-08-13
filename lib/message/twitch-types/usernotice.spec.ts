import { assert } from "chai";
import { expectType } from "tsd";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { TwitchEmote } from "../emote";
import { parseTwitchMessage } from "../parser/twitch-message";
import {
  extractEventParams,
  ResubUsernoticeMessage,
  SubEventParams,
  UsernoticeMessage
} from "./usernotice";

describe("./message/twitch-types/usernotice", function() {
  describe("#extractEventParams()", function() {
    it("should camelCase all properties that start with msg-param-", function() {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-user-name": "pajlada",
          "msg-id": "abc123efg",
          "msg-parameter-msg-id": "987398274923"
        }),
        {
          userName: "pajlada"
        }
      );
    });

    it("should parse integer properties and add a raw- property for them", function() {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-months": "12"
        }),
        {
          months: 12,
          monthsRaw: "12"
        }
      );
    });

    it("should parse boolean properties and add a raw- property for them", function() {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-should-share-streak": "1"
        }),
        {
          shouldShareStreak: true,
          shouldShareStreakRaw: "1"
        }
      );

      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-should-share-streak": "0"
        }),
        {
          shouldShareStreak: false,
          shouldShareStreakRaw: "0"
        }
      );
    });

    it("should camelCase -id as ID", function() {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-user-id": "1234567"
        }),
        {
          userID: "1234567"
        }
      );
    });
  });

  describe("UsernoticeMessage", function() {
    it("should be able to parse a USERNOTICE with no message, only system-msg", function() {
      const msgText =
        "@badge-info=subscriber/5;badges=subscriber/3;color=;display-name=kakarot127;" +
        "emotes=;flags=;id=5dc14bb3-684b-4c04-8fbb-3c870958ac69;login=kakarot127;mod=0;msg-id=resub;" +
        "msg-param-cumulative-months=5;msg-param-months=0;msg-param-should-share-streak=0;" +
        "msg-param-sub-plan-name=Channel\\sSubscription\\s(faker);msg-param-sub-plan=1000;" +
        "room-id=43691;subscriber=1;system-msg=kakarot127\\ssubscribed\\sat\\sTier\\s1.\\sThey'" +
        "ve\\ssubscribed\\sfor\\s5\\smonths!;tmi-sent-ts=1563102742440;user-id=147030570;user-type= " +
        ":tmi.twitch.tv USERNOTICE #faker";

      const msg = parseTwitchMessage(msgText) as UsernoticeMessage;

      assert.instanceOf(msg, UsernoticeMessage);

      assert.strictEqual(msg.channelName, "faker");
      assert.strictEqual(msg.channelID, "43691");

      assert.isUndefined(msg.messageText);
      assert.strictEqual(
        msg.systemMessage,
        "kakarot127 subscribed at Tier 1. They've subscribed " + "for 5 months!"
      );
      assert.strictEqual(msg.messageTypeID, "resub");

      assert.strictEqual(msg.senderUsername, "kakarot127");
      assert.strictEqual(msg.senderUserID, "147030570");

      assert.deepStrictEqual(
        msg.badgeInfo,
        new TwitchBadgesList(new TwitchBadge("subscriber", 5))
      );
      assert.strictEqual(msg.badgeInfoRaw, "subscriber/5");

      assert.isUndefined(msg.bits);
      assert.isUndefined(msg.bitsRaw);

      assert.isUndefined(msg.color);
      assert.strictEqual(msg.colorRaw, "");

      assert.strictEqual(msg.displayName, "kakarot127");
      assert.deepStrictEqual(msg.emotes, []);
      assert.deepStrictEqual(msg.emotesRaw, "");

      assert.strictEqual(msg.isMod, false);
      assert.strictEqual(msg.isModRaw, "0");

      assert.strictEqual(msg.serverTimestamp.getTime(), 1563102742440);
      assert.strictEqual(msg.serverTimestampRaw, "1563102742440");

      assert.deepStrictEqual(msg.eventParams, {
        cumulativeMonths: 5,
        cumulativeMonthsRaw: "5",
        months: 0,
        monthsRaw: "0",
        shouldShareStreak: false,
        shouldShareStreakRaw: "0",
        subPlanName: "Channel Subscription (faker)",
        subPlan: "1000"
      });

      assert.isTrue(msg.isResub());

      // typescript test:
      if (msg.isResub()) {
        expectType<ResubUsernoticeMessage>(msg);
        expectType<SubEventParams>(msg.eventParams);
        expectType<number>(msg.eventParams.cumulativeMonths);
        expectType<string>(msg.eventParams.cumulativeMonthsRaw);
      }
    });

    it("should be able to parse a resub with message", function() {
      const msg = parseTwitchMessage(
        "@badge-info=subscriber/15;badges=subscriber/12;color=#00CCBE" +
          ";display-name=5weatyNuts;emotes=1076725:0-10;flags=;id=fda4d92" +
          "4-cde3-421d-8eea-713401194446;login=5weatynuts;mod=0;msg-id=resu" +
          "b;msg-param-cumulative-months=15;msg-param-months=0;msg-param-sh" +
          "ould-share-streak=0;msg-param-sub-plan-name=Channel\\sSubscripti" +
          "on\\s(dafrancsgo);msg-param-sub-plan=Prime;room-id=41314239;subs" +
          "criber=1;system-msg=5weatyNuts\\ssubscribed\\swith\\sTwitch\\sPri" +
          "me.\\sThey've\\ssubscribed\\sfor\\s15\\smonths!;tmi-sent-ts=1565" +
          "699032594;user-id=169613447;user-type= :tmi.twitch.tv USERNOTICE " +
          "#dafran :dafranPrime Clap"
      ) as UsernoticeMessage;

      assert.strictEqual(msg.messageText, "dafranPrime Clap");
      assert.deepStrictEqual(msg.emotes, [
        new TwitchEmote("1076725", 0, 11, "dafranPrime")
      ]);
      assert.strictEqual(msg.emotesRaw, "1076725:0-10");

      assert(msg.isResub());
    });
  });
});
