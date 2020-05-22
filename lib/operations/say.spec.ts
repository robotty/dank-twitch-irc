import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { me, removeCommands, say, SayError } from "./say";

describe("./operations/say", function () {
  describe("#removeCommands()", function () {
    it("should remove all twitch commands", function () {
      assert.strictEqual(removeCommands("/me hi"), "/ /me hi");
      assert.strictEqual(removeCommands(".me hi"), "/ .me hi");
      assert.strictEqual(
        removeCommands("/timeout weeb123 5"),
        "/ /timeout weeb123 5"
      );
    });

    it("should not prepend a slash to other messages", function () {
      assert.strictEqual(removeCommands(""), "");
      assert.strictEqual(removeCommands("\\me hi"), "\\me hi");
      assert.strictEqual(removeCommands("hello world!"), "hello world!");
    });
  });

  describe("SayError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(
        new SayError("pajlada", "test", true),
        ConnectionError
      );
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new SayError("pajlada", "test", true), ClientError);
    });
  });

  describe("#say()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();
      const { data, client } = fakeConnection();

      say(client, "pajlada", "/test test abc KKona");

      assert.deepStrictEqual(data, [
        "PRIVMSG #pajlada :/ /test test abc KKona\r\n",
      ]);
    });

    it("should resolve on USERSTATE", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = say(client, "pajlada", "/test test abc KKona");

      const userstateResponse =
        "@badge-info=;badges=;color=;display-name=justinfan12345;emote-sets=0;mod=0;" +
        "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #pajlada";
      emitAndEnd(userstateResponse);

      const response = await promise;
      assert.strictEqual(response.rawSource, userstateResponse);

      await clientError;
    });

    it("should reject on msg_channel_suspended", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = say(client, "pajlada", "abc def");

      emitAndEnd(
        "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE" +
          " #pajlada :This channel has been suspended."
      );

      await assertErrorChain(
        promise,
        SayError,
        "Failed to say [#pajlada]: abc def: Bad response message: " +
          "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlad" +
          "a :This channel has been suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twit" +
          "ch.tv NOTICE #pajlada :This channel has been suspended."
      );

      await assertErrorChain(
        clientError,
        SayError,
        "Failed to say [#pajlada]: abc def: Bad response message: @msg" +
          "-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlada :Th" +
          "is channel has been suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twitc" +
          "h.tv NOTICE #pajlada :This channel has been suspended."
      );
    });
  });

  describe("#me()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();
      const { data, client } = fakeConnection();

      me(client, "pajlada", "test abc KKona");

      assert.deepStrictEqual(data, [
        "PRIVMSG #pajlada :/me test abc KKona\r\n",
      ]);
    });

    it("should resolve on USERSTATE", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = me(client, "pajlada", "test test abc KKona");

      const userstateResponse =
        "@badge-info=;badges=;color=;display-name=justinfan12345;emote-sets=0;mod=0;" +
        "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #pajlada";
      emitAndEnd(userstateResponse);

      const response = await promise;
      assert.strictEqual(response.rawSource, userstateResponse);

      await clientError;
    });

    it("should reject on msg_channel_suspended", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = me(client, "pajlada", "abc def");

      emitAndEnd(
        "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE" +
          " #pajlada :This channel has been suspended."
      );

      await assertErrorChain(
        promise,
        SayError,
        "Failed to say [#pajlada]: /me abc def: Bad response message: " +
          "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlad" +
          "a :This channel has been suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twit" +
          "ch.tv NOTICE #pajlada :This channel has been suspended."
      );

      await assertErrorChain(
        clientError,
        SayError,
        "Failed to say [#pajlada]: /me abc def: Bad response message: @msg" +
          "-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlada :Th" +
          "is channel has been suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twitc" +
          "h.tv NOTICE #pajlada :This channel has been suspended."
      );
    });
  });
});
