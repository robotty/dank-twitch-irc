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
  UsernoticeMessage,
} from "./usernotice";

describe("./message/twitch-types/usernotice", function () {
  describe("#extractEventParams()", function () {
    it("should camelCase all properties that start with msg-param-", function () {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-user-name": "pajlada",
          "msg-id": "abc123efg",
          "msg-parameter-msg-id": "987398274923",
        }),
        {
          username: "pajlada",
        }
      );
    });

    it("should parse integer properties and add a raw- property for them", function () {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-months": "12",
        }),
        {
          months: 12,
          monthsRaw: "12",
        }
      );
    });

    it("should parse boolean properties and add a raw- property for them", function () {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-should-share-streak": "1",
        }),
        {
          shouldShareStreak: true,
          shouldShareStreakRaw: "1",
        }
      );

      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-should-share-streak": "0",
        }),
        {
          shouldShareStreak: false,
          shouldShareStreakRaw: "0",
        }
      );
    });

    it("should camelCase -id as ID", function () {
      assert.deepStrictEqual(
        extractEventParams({
          "msg-param-user-id": "1234567",
        }),
        {
          userID: "1234567",
        }
      );
    });
  });

  describe("UsernoticeMessage", function () {
    it("should be able to parse a USERNOTICE with no message, only system-msg", function () {
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
        new TwitchBadgesList(new TwitchBadge("subscriber", "5"))
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
        subPlan: "1000",
        subPlanRaw: "1000",
      });

      assert.isTrue(msg.isResub());
      assert.isFalse(msg.isCheer());

      // typescript test:
      if (msg.isResub()) {
        expectType<ResubUsernoticeMessage>(msg);
        expectType<SubEventParams>(msg.eventParams);
        expectType<number>(msg.eventParams.cumulativeMonths);
        expectType<string>(msg.eventParams.cumulativeMonthsRaw);
      }
    });

    it("should be able to parse a resub with message", function () {
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
        new TwitchEmote("1076725", 0, 11, "dafranPrime"),
      ]);
      assert.strictEqual(msg.emotesRaw, "1076725:0-10");

      assert(msg.isResub());
    });

    it("trims spaces at the end of display names", function () {
      const msg = parseTwitchMessage(
        "@badge-info=subscriber/15;badges=subscriber/12;color=#00CCBE" +
          ";display-name=5weatyNuts;emotes=1076725:0-10;flags=;id=fda4d92" +
          "4-cde3-421d-8eea-713401194446;login=5weatynutss;mod=0;msg-id=resu" +
          "b;msg-param-cumulative-months=15;msg-param-months=0;msg-param-sh" +
          "ould-share-streak=0;msg-param-sub-plan-name=Channel\\sSubscripti" +
          "on\\s(dafrancsgo);msg-param-sub-plan=Prime;room-id=41314239;subs" +
          "criber=1;system-msg=5weatyNuts\\ssubscribed\\swith\\sTwitch\\sPri" +
          "me.\\sThey've\\ssubscribed\\sfor\\s15\\smonths!;tmi-sent-ts=1565" +
          "699032594;user-id=169613447;user-type= :tmi.twitch.tv USERNOTICE " +
          "#dafran :dafranPrime Clap"
      ) as UsernoticeMessage;

      assert.strictEqual(msg.displayName, "5weatyNuts");
    });

    it("parses subgift params correctly (correct camelcasing)", function () {
      const msg = parseTwitchMessage(
        "@badge-info=;badges=sub-gifter/50;color=;display-name=AdamAtReflectStudios;emotes=;flags=;id=e21409b1-d25d-4a1a-b5cf-ef27d8b7030e;login=adamatreflectstudios;mod=0;msg-id=subgift;msg-param-gift-months=1;msg-param-months=2;msg-param-origin-id=da\\s39\\sa3\\see\\s5e\\s6b\\s4b\\s0d\\s32\\s55\\sbf\\sef\\s95\\s60\\s18\\s90\\saf\\sd8\\s07\\s09;msg-param-recipient-display-name=qatarking24xd;msg-param-recipient-id=236653628;msg-param-recipient-user-name=qatarking24xd;msg-param-sender-count=0;msg-param-sub-plan-name=Channel\\sSubscription\\s(xqcow);msg-param-sub-plan=1000;room-id=71092938;subscriber=0;system-msg=AdamAtReflectStudios\\sgifted\\sa\\sTier\\s1\\ssub\\sto\\sqatarking24xd!;tmi-sent-ts=1594583782376;user-id=211711554;user-type= :tmi.twitch.tv USERNOTICE #xqcow"
      ) as UsernoticeMessage;

      assert.deepStrictEqual(msg.eventParams, {
        giftMonths: 1,
        giftMonthsRaw: "1",
        months: 2,
        monthsRaw: "2",
        originID: "da 39 a3 ee 5e 6b 4b 0d 32 55 bf ef 95 60 18 90 af d8 07 09",
        originIDRaw:
          "da 39 a3 ee 5e 6b 4b 0d 32 55 bf ef 95 60 18 90 af d8 07 09",
        recipientDisplayName: "qatarking24xd",
        recipientID: "236653628",
        recipientUsername: "qatarking24xd",
        senderCount: 0,
        senderCountRaw: "0",
        subPlanName: "Channel Subscription (xqcow)",
        subPlan: "1000",
        subPlanRaw: "1000",
      });
    });

    it("should be able to parse a masssubgift with message", function () {
      const msg = parseTwitchMessage(
        "@badge-info=subscriber/12;badges=subscriber/12,premium/1;color=;display-name=realuser;emotes=;flags=;id=99b77ba7-c77f-4d92-ac3a-ad556e921672;login=realuser;mod=0;msg-id=submysterygift;msg-param-mass-gift-count=1;msg-param-origin-id=4e\\sd1\\s19\\sc5\\s33\\s80\\s68\\s8c\\sdc\\sc9\\s4d\\s96\\s73\\sd0\\sad\\s40\\s52\\sf3\\s19\\s02;msg-param-sender-count=1;msg-param-sub-plan=1000;room-id=38244999;subscriber=1;system-msg=realuser\\sis\\sgifting\\s1\\sTier\\s1\\sSubs\\sto\\sbroadcaster's\\scommunity!\\sThey've\\sgifted\\sa\\stotal\\sof\\s1\\sin\\sthe\\schannel!;tmi-sent-ts=1633549401426;user-id=239909999;user-type= :tmi.twitch.tv USERNOTICE #broadcaster"
      ) as UsernoticeMessage;

      assert.strictEqual(msg.ircCommand, "USERNOTICE");
      assert.strictEqual(msg.ircParameters[0], "#broadcaster");
      assert.strictEqual(msg.ircTags["msg-param-mass-gift-count"], "1");
      assert.strictEqual(
        msg.systemMessage,
        "realuser is gifting 1 Tier 1 Subs to broadcaster's community! They've gifted a total of 1 in the channel!"
      );
      assert.strictEqual(msg.messageTypeID, "submysterygift");

      assert.isTrue(msg.isMassSubgift());

      assert.deepStrictEqual(msg.eventParams, {
        massGiftCount: 1,
        massGiftCountRaw: "1",
        originID: "4e d1 19 c5 33 80 68 8c dc c9 4d 96 73 d0 ad 40 52 f3 19 02",
        originIDRaw:
          "4e d1 19 c5 33 80 68 8c dc c9 4d 96 73 d0 ad 40 52 f3 19 02",
        senderCount: 1,
        senderCountRaw: "1",
        subPlan: "1000",
        subPlanRaw: "1000",
      });
    });
  });
});
