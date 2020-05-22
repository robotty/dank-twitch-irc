import { assert } from "chai";
import * as sinon from "sinon";
import { promisify } from "util";
import { fakeClient } from "../helpers.spec";
import { TwitchBadge } from "../message/badge";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import { GlobaluserstateMessage } from "../message/twitch-types/globaluserstate";
import { UserstateMessage } from "../message/twitch-types/userstate";
import { UserStateTracker } from "./userstate-tracker";

describe("./mixins/userstate-tracker", function () {
  describe("UserstateTracker", function () {
    it("should set client.userstateTracker on the client when applied", function () {
      const { client } = fakeClient(false);
      const userStateTracker = new UserStateTracker(client);

      assert.isUndefined(client.userStateTracker);

      client.use(userStateTracker);

      assert.strictEqual(client.userStateTracker, userStateTracker);
    });

    it("should save incoming USERSTATE messages", async function () {
      const { client, emitAndEnd } = fakeClient();
      const userStateTracker = new UserStateTracker(client);

      client.use(userStateTracker);

      assert.isUndefined(userStateTracker.getChannelState("randers"));

      const msgRaw =
        "@badge-info=subscriber/6;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers;emote-sets=0,42,237,954," +
        "1349,3188,4236,13653,15961,19194,22197,103040,164050,540476" +
        ",588170,669914,771847,1537468,1641460,1641461,1641462,30020" +
        "6307;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTATE" +
        " #randers";
      emitAndEnd(msgRaw);

      const expectedState = (parseTwitchMessage(
        msgRaw
      ) as UserstateMessage).extractUserState();

      await promisify(setImmediate);

      assert.deepStrictEqual(
        userStateTracker.getChannelState("randers"),
        expectedState
      );
    });

    it("should emit newChannelState on new USERSTATE", async function () {
      const { client, emitAndEnd } = fakeClient();
      const userStateTracker = new UserStateTracker(client);
      client.use(userStateTracker);

      const listenerCallback = sinon.fake();
      userStateTracker.on("newChannelState", listenerCallback);

      emitAndEnd(
        "@badge-info=subscriber/6;badges=broadcaster/1,subscriber/0;" +
          "color=#19E6E6;display-name=randers;emote-sets=0,42,237,954," +
          "1349,3188,4236,13653,15961,19194,22197,103040,164050,540476" +
          ",588170,669914,771847,1537468,1641460,1641461,1641462,30020" +
          "6307;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTATE" +
          " #randers"
      );

      await promisify(setImmediate);

      assert(
        listenerCallback.calledOnceWithExactly(
          "randers",
          userStateTracker.getChannelState("randers")
        )
      );
    });

    it("should save incoming GLOBALUSERSTATE messages", async function () {
      const { client, emitAndEnd } = fakeClient();
      const userStateTracker = new UserStateTracker(client);

      client.use(userStateTracker);

      assert.isUndefined(userStateTracker.globalState);
      assert.isUndefined(userStateTracker.getGlobalState());

      const msgRaw =
        "@badge-info=;badges=;color=#19E6E6;display-name=randers;" +
        "emote-sets=0,42,237,954,1349,3188,4236,13653,15961,191" +
        "94,22197,103040,164050,540476,588170,669914,771849,151" +
        "1983,1641460,1641461,1641462,300206298;user-id=4028630" +
        "0;user-type= :tmi.twitch.tv GLOBALUSERSTATE";
      emitAndEnd(msgRaw);

      const expectedState = (parseTwitchMessage(
        msgRaw
      ) as GlobaluserstateMessage).extractGlobalUserState();

      await promisify(setImmediate);

      assert.deepStrictEqual(userStateTracker.globalState, expectedState);
      assert.deepStrictEqual(userStateTracker.getGlobalState(), expectedState);
    });

    it("should emit newGlobalState on new GLOBALUSERSTATE", async function () {
      const { client, emitAndEnd } = fakeClient();
      const userStateTracker = new UserStateTracker(client);
      client.use(userStateTracker);

      const listenerCallback = sinon.fake();
      userStateTracker.on("newGlobalState", listenerCallback);

      emitAndEnd(
        "@badge-info=;badges=;color=#19E6E6;display-name=randers;" +
          "emote-sets=0,42,237,954,1349,3188,4236,13653,15961,191" +
          "94,22197,103040,164050,540476,588170,669914,771849,151" +
          "1983,1641460,1641461,1641462,300206298;user-id=4028630" +
          "0;user-type= :tmi.twitch.tv GLOBALUSERSTATE"
      );

      await promisify(setImmediate);

      assert(
        listenerCallback.calledOnceWithExactly(
          userStateTracker.getGlobalState()
        )
      );
    });

    it("should update the userstate on PRIVMSG coming from the logged in user", async function () {
      const { client, emit, emitAndEnd } = fakeClient();
      client.configuration.username = "randers";

      const userStateTracker = new UserStateTracker(client);

      client.use(userStateTracker);

      assert.isUndefined(userStateTracker.getChannelState("randers"));

      const firstMsg =
        "@badge-info=subscriber/6;badges=broadcaster/" +
        "1,subscriber/0;color=#19E6E6;display-name=randers;emotes=;f" +
        "lags=;id=a9d86456-450b-4d74-8a0c-e067fb8a9d1d;mod=0;room-id" +
        "=40286300;subscriber=1;tmi-sent-ts=1566072586745;turbo=0;us" +
        "er-id=40286300;user-type= :randers!randers@randers.tmi.twit" +
        "ch.tv PRIVMSG #randers :asd";

      emit(firstMsg);

      await promisify(setImmediate);

      // PRIVMSG without a USERSTATE first does nothing
      assert.isUndefined(userStateTracker.getChannelState("randers"));

      const secondMessage =
        "@badge-info=subscriber/6;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers;emote-sets=0,42,237,954," +
        "1349,3188,4236,13653,15961,19194,22197,103040,164050,540476" +
        ",588170,669914,771847,1537468,1641460,1641461,1641462,30020" +
        "6307;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTATE" +
        " #randers";

      emit(secondMessage);

      await promisify(setImmediate);

      const secondMessageState = (parseTwitchMessage(
        secondMessage
      ) as UserstateMessage).extractUserState();

      assert.deepStrictEqual(
        userStateTracker.getChannelState("randers"),
        secondMessageState
      );

      // message from another user
      const thirdMsg =
        "@badge-info=subscriber/6;badges=broadcaster/1,subscriber/0" +
        ",glhf-pledge/1;color=#19E6E6;display-name=randers;emotes=" +
        ";flags=;id=e70cd84c-b8ed-4bc3-b1fc-b580f052a309;mod=0;room" +
        "-id=40286300;subscriber=1;tmi-sent-ts=1566072900564;turbo=" +
        "0;user-id=40286300;user-type= :randers00!randers00@randers" +
        "00.tmi.twitch.tv PRIVMSG #randers :asd2";
      emit(thirdMsg);

      await promisify(setImmediate);

      assert.deepStrictEqual(
        userStateTracker.getChannelState("randers"),
        secondMessageState
      );

      // a new badge
      const fourthMsg =
        "@badge-info=subscriber/6;badges=broadcaster/1,subscriber/0" +
        ",glhf-pledge/1;color=#19E6E6;display-name=randers;emotes=" +
        ";flags=;id=e70cd84c-b8ed-4bc3-b1fc-b580f052a309;mod=0;room" +
        "-id=40286300;subscriber=1;tmi-sent-ts=1566072900564;turbo=" +
        "0;user-id=40286300;user-type= :randers!randers@randers.tmi" +
        ".twitch.tv PRIVMSG #randers :asd2";
      emitAndEnd(fourthMsg);

      await promisify(setImmediate);

      assert.deepStrictEqual(
        userStateTracker.getChannelState("randers")!.badges,
        [
          new TwitchBadge("broadcaster", "1"),
          new TwitchBadge("subscriber", "0"),
          new TwitchBadge("glhf-pledge", "1"),
        ]
      );

      assert.deepStrictEqual(
        userStateTracker.getChannelState("randers")!.badgesRaw,
        "broadcaster/1,subscriber/0,glhf-pledge/1"
      );

      client.close();
    });
  });
});
