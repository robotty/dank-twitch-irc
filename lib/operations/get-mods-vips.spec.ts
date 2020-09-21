import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { ClientError, ConnectionError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { getMods, GetUsersError, getVips } from "./get-mods-vips";

describe("./operations/join", function () {
  describe("#getMods()", function () {
    it("sends the correct wire command", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();
      getMods(client, "pajlada");
      assert.deepEqual(data, ["PRIVMSG #pajlada :/mods\r\n"]);
    });

    it("resolves on incoming no_mods", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getMods(client, "tmijs");

      emitAndEnd(
        "@msg-id=no_mods :tmi.twitch.tv NOTICE #tmijs :There are no moderators of this channel."
      );

      assert.deepStrictEqual(await promise, []);
      await clientError;
    });

    it("resolves on incoming room_mods", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getMods(client, "randers");

      emitAndEnd(
        "@msg-id=room_mods :tmi.twitch.tv NOTICE #randers :The moderators of this channel are: test, abc, def"
      );

      assert.deepStrictEqual(await promise, ["test", "abc", "def"]);
      await clientError;
    });

    it("resolves on incoming room_mods (just 1 mod)", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getMods(client, "randers");

      emitAndEnd(
        "@msg-id=room_mods :tmi.twitch.tv NOTICE #randers :The moderators of this channel are: test"
      );

      assert.deepStrictEqual(await promise, ["test"]);
      await clientError;
    });

    it("should fail on timeout of 2000 ms", async function () {
      // given
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      // when
      const promise = getMods(client, "test");

      // then
      sinon.clock.tick(2000);
      await assertErrorChain(
        promise,
        GetUsersError,
        "Failed to get mods of channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        GetUsersError,
        "Failed to get mods of channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );
    });
  });

  describe("#getVips()", function () {
    it("sends the correct wire command", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();
      getVips(client, "pajlada");
      assert.deepEqual(data, ["PRIVMSG #pajlada :/vips\r\n"]);
    });

    it("resolves on incoming no_vips", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getVips(client, "tmijs");

      emitAndEnd(
        "@msg-id=no_vips :tmi.twitch.tv NOTICE #tmijs :This channel does not have any VIPs."
      );

      assert.deepStrictEqual(await promise, []);
      await clientError;
    });

    it("resolves on incoming vips_success", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getVips(client, "randers");

      emitAndEnd(
        "@msg-id=vips_success :tmi.twitch.tv NOTICE #randers :The VIPs of this channel are: eeya_, pajlada, pastorbruce, ragglefraggle, supervate, supibot."
      );

      assert.deepStrictEqual(await promise, [
        "eeya_",
        "pajlada",
        "pastorbruce",
        "ragglefraggle",
        "supervate",
        "supibot",
      ]);
      await clientError;
    });

    it("resolves on incoming room_mods (just 1 mod)", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = getVips(client, "randers");

      emitAndEnd(
        "@msg-id=vips_success :tmi.twitch.tv NOTICE #randers :The VIPs of this channel are: supibot."
      );

      assert.deepStrictEqual(await promise, ["supibot"]);
      await clientError;
    });

    it("should fail on timeout of 2000 ms", async function () {
      // given
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      // when
      const promise = getVips(client, "test");

      // then
      sinon.clock.tick(2000);
      await assertErrorChain(
        promise,
        GetUsersError,
        "Failed to get vips of channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        GetUsersError,
        "Failed to get vips of channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );
    });
  });

  describe("GetUsersError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(new GetUsersError("test", "mods"), ConnectionError);
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new GetUsersError("test", "mods"), ClientError);
    });
  });
});
