import { assert } from "chai";
import "mocha";
import { promisify } from "util";
import { fakeClient } from "../helpers.spec";
import {
  AlternateMessageModifier,
  invisibleSuffix,
} from "./alternate-message-modifier";

describe("./modules/alternate-message-modifier", function () {
  describe("AlternateMessageModifier", () => {
    it("should have the correct escape for the invisible suffix", () => {
      // 1 (space) + 2 (invisible character)
      assert.strictEqual(invisibleSuffix.length, 3);
      assert.strictEqual([...invisibleSuffix].length, 2);
    });

    it("should append invisible character if last message is equal", async function () {
      const { client, emitAndEnd } = fakeClient();
      client.configuration.username = "randers";
      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );

      // from a different user should be ignored
      emitAndEnd(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-p" +
          "ledge/1;color=#19E6E6;display-name=randers;emote-only=1;emotes=" +
          "25:0-4/1902:6-10/88:12-19;flags=;id=4556c83f-4dd6-4c6d-bb87-7a" +
          "b2472188e3;mod=0;room-id=22484632;subscriber=1;tmi-sent-ts=156" +
          "6127471330;turbo=0;user-id=40286300;user-type= :randers00!rander" +
          "s00@randers00.tmi.twitch.tv PRIVMSG #forsen :Kappa Keepo PogChamp"
      );

      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );

      emitAndEnd(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-p" +
          "ledge/1;color=#19E6E6;display-name=randers;emote-only=1;emotes=" +
          "25:0-4/1902:6-10/88:12-19;flags=;id=4556c83f-4dd6-4c6d-bb87-7a" +
          "b2472188e3;mod=0;room-id=22484632;subscriber=1;tmi-sent-ts=156" +
          "6127471330;turbo=0;user-id=40286300;user-type= :randers!rander" +
          "s@randers.tmi.twitch.tv PRIVMSG #forsen :Kappa Keepo PogChamp"
      );

      await promisify(setImmediate);

      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp \u{000e0000}"
      );

      // /me makes it different
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );
    });

    it("should not append invisible character if fast spam is enabled (mod, VIP, etc.)", async function () {
      const { client, emitAndEnd } = fakeClient();
      client.configuration.username = "randers";
      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "pajlada",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "pajlada",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );

      // userstate tracker will register that we are moderator
      // in #pajlada
      emitAndEnd(
        "@badge-info=subscriber/11;badges=moderator/1,subscriber/6" +
          ";color=#19E6E6;display-name=randers;emote-sets=0,42,237,9" +
          "54,1349,3188,4236,13653,15961,19194,22197,103040,164050,5" +
          "40476,588170,669914,771849,1511995,1641460,1641461,164146" +
          "2,300206298;mod=1;subscriber=1;user-type=mod :tmi.twitch." +
          "tv USERSTATE #pajlada",
        "@badge-info=subscriber/11;badges=moderator/1,subscriber/6;" +
          "color=#19E6E6;display-name=randers;emote-only=1;emotes=25" +
          ":0-4/1902:6-10/88:12-19;flags=;id=7467aa03-de47-4841-a0e0" +
          "-d392f1ec1811;mod=1;room-id=11148817;subscriber=1;tmi-sent" +
          "-ts=1566137969595;turbo=0;user-id=40286300;user-type=mod :" +
          "randers!randers@randers.tmi.twitch.tv PRIVMSG #pajlada :Ka" +
          "ppa Keepo PogChamp"
      );

      await promisify(setImmediate);

      // even though our last message was equal,
      // this should not append anything since fast spam
      // is enabled
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );
    });

    it("should append invisible character through the say() function (case where we are joined to channel)", async function () {
      const { client, end, transports } = fakeClient();
      client.configuration.username = "randers";
      client.connections[0].joinedChannels.add("forsen");
      client.connections[0].wantedChannels.add("forsen");

      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      const sayPromise = client.say("forsen", "Kappa Keepo PogChamp");

      await promisify(setImmediate);

      assert.deepStrictEqual(transports[1].data, [
        "PRIVMSG #forsen :Kappa Keepo PogChamp\r\n",
      ]);

      transports[1].emit(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-ple" +
          "dge/1;color=#19E6E6;display-name=randers;emote-sets=0,42,237" +
          ",954,1349,3188,4236,13653,15961,19194,22197,103040,164050,540" +
          "476,588170,669914,771845,1537481,1641460,1641461,1641462,300" +
          "206310;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTAT" +
          "E #forsen"
      );

      await sayPromise;

      // we were joined to the channel we sent a message to,
      // so AlternateMessageModifier should NOT save the sent message
      // as the last message (since we expect to receive it back)
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );

      transports[1].emit(
        "@badge-info=subscriber/13;badges=subscriber/12," +
          "glhf-pledge/1;color=#19E6E6;display-name=randers;emote-o" +
          "nly=1;emotes=25:0-4/1902:6-10/88:12-19;flags=;id=bc4e1af" +
          "8-2226-4e2a-8b18-90b05edfb01e;mod=0;room-id=22484632;subs" +
          "criber=1;tmi-sent-ts=1566133801254;turbo=0;user-id=40286" +
          "300;user-type= :randers!randers@randers.tmi.twitch.tv PR" +
          "IVMSG #forsen :Kappa Keepo PogChamp"
      );
      end();

      await promisify(setImmediate);

      // now our own message was received so it should have been set
      // as the last message.
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp \u{000e0000}"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );
    });

    it("should append invisible character through the say() function (case where we are not joined to channel)", async function () {
      const { client, end, transports } = fakeClient();
      client.configuration.username = "randers";

      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      const sayPromise = client.say("forsen", "Kappa Keepo PogChamp");

      await promisify(setImmediate);

      assert.deepStrictEqual(transports[0].data, [
        "PRIVMSG #forsen :Kappa Keepo PogChamp\r\n",
      ]);

      transports[0].emit(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-ple" +
          "dge/1;color=#19E6E6;display-name=randers;emote-sets=0,42,237" +
          ",954,1349,3188,4236,13653,15961,19194,22197,103040,164050,540" +
          "476,588170,669914,771845,1537481,1641460,1641461,1641462,300" +
          "206310;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTAT" +
          "E #forsen"
      );

      await sayPromise;

      // we were NOT joined to the channel we sent a message to,
      // so AlternateMessageModifier SHOULD save the sent message
      // as the last message (since we WILL not receive it back as a PRIVMSG)
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp \u{000e0000}"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );

      end();
    });

    it("should append invisible character through the me() function (case where we are joined to channel)", async function () {
      const { client, end, transports } = fakeClient();
      client.configuration.username = "randers";
      client.connections[0].joinedChannels.add("forsen");
      client.connections[0].wantedChannels.add("forsen");

      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      const mePromise = client.me("forsen", "Kappa Keepo PogChamp");

      await promisify(setImmediate);

      assert.deepStrictEqual(transports[1].data, [
        "PRIVMSG #forsen :/me Kappa Keepo PogChamp\r\n",
      ]);

      transports[1].emit(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-ple" +
          "dge/1;color=#19E6E6;display-name=randers;emote-sets=0,42,237" +
          ",954,1349,3188,4236,13653,15961,19194,22197,103040,164050,540" +
          "476,588170,669914,771845,1537481,1641460,1641461,1641462,300" +
          "206310;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTAT" +
          "E #forsen"
      );

      await mePromise;

      // we were joined to the channel we sent a message to,
      // so AlternateMessageModifier should NOT save the sent message
      // as the last message (since we expect to receive it back)
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp"
      );

      transports[1].emit(
        "@badge-info=subscriber/13;badges=subscriber/12," +
          "glhf-pledge/1;color=#19E6E6;display-name=randers;emote-o" +
          "nly=1;emotes=25:0-4/1902:6-10/88:12-19;flags=;id=bc4e1af" +
          "8-2226-4e2a-8b18-90b05edfb01e;mod=0;room-id=22484632;subs" +
          "criber=1;tmi-sent-ts=1566133801254;turbo=0;user-id=40286" +
          "300;user-type= :randers!randers@randers.tmi.twitch.tv PR" +
          "IVMSG #forsen :\u0001ACTION Kappa Keepo PogChamp\u0001"
      );
      end();

      await promisify(setImmediate);

      // now our own message was received so it should have been set
      // as the last message.
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp \u{000e0000}"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );
    });

    it("should append invisible character through the me() function (case where we are not joined to channel)", async function () {
      const { client, end, transports } = fakeClient();
      client.configuration.username = "randers";

      const messageModifier = new AlternateMessageModifier(client);
      client.use(messageModifier);

      const mePromise = client.me("forsen", "Kappa Keepo PogChamp");

      await promisify(setImmediate);

      assert.deepStrictEqual(transports[0].data, [
        "PRIVMSG #forsen :/me Kappa Keepo PogChamp\r\n",
      ]);

      transports[0].emit(
        "@badge-info=subscriber/13;badges=subscriber/12,glhf-ple" +
          "dge/1;color=#19E6E6;display-name=randers;emote-sets=0,42,237" +
          ",954,1349,3188,4236,13653,15961,19194,22197,103040,164050,540" +
          "476,588170,669914,771845,1537481,1641460,1641461,1641462,300" +
          "206310;mod=0;subscriber=1;user-type= :tmi.twitch.tv USERSTAT" +
          "E #forsen"
      );

      await mePromise;

      // we were NOT joined to the channel we sent a message to,
      // so AlternateMessageModifier SHOULD save the sent message
      // as the last message (since we WILL not receive it back as a PRIVMSG)
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          true
        ),
        "Kappa Keepo PogChamp \u{000e0000}"
      );
      assert.strictEqual(
        messageModifier.appendInvisibleCharacter(
          "forsen",
          "Kappa Keepo PogChamp",
          false
        ),
        "Kappa Keepo PogChamp"
      );

      end();
    });
  });
});
