import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import { JoinMessage } from "../message/twitch-types/membership/join";
import { joinChannel, JoinError, joinNothingToDo } from "./join";

describe("./operations/join", function () {
  describe("#joinNotingToDo()", function () {
    it("should be false if channel is not joined or wanted", function () {
      // typical situation where channel is not joined and is now being
      // joined.
      const { client } = fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();

      assert.isFalse(joinNothingToDo(client, "pajlada"));
    });

    it("should be false if channel is joined but not wanted", function () {
      // situation where we are still joined but don't want to be, e.g.
      // a part is in progress, but we can already begin re-joining
      const { client } = fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();
      client.joinedChannels.add("pajlada");

      assert.isFalse(joinNothingToDo(client, "pajlada"));
    });

    it("should be false if channel is not joined but wanted", function () {
      // e.g. previously failed JOIN, allow the join to be retried
      const { client } = fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assert.isFalse(joinNothingToDo(client, "pajlada"));
    });

    it("should be true if channel is joined and wanted", function () {
      // channel is both joined and supposed to be joined, only in
      // this case is nothing to do.
      const { client } = fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assert.isFalse(joinNothingToDo(client, "pajlada"));
    });
  });

  describe("#joinChannel()", function () {
    it("sends the correct wire command", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();
      joinChannel(client, "pajlada");
      assert.deepEqual(data, ["JOIN #pajlada\r\n"]);
    });

    it("does nothing if channel is joined and wanted", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();
      client.wantedChannels.add("pajlada");
      client.joinedChannels.add("pajlada");
      joinChannel(client, "pajlada");
      assert.deepEqual(data, []);
    });

    it("sends the command if channel is not in joinedChannels but in wantedChannels", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();
      client.wantedChannels.add("pajlada");
      joinChannel(client, "pajlada");
      assert.deepEqual(data, ["JOIN #pajlada\r\n"]);
    });

    it("resolves on incoming JOIN", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = joinChannel(client, "pajlada");

      emitAndEnd(
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
        "@emote-only=0;followers-only=5;r9k=0;rituals=0;room-id=11148817;slow=0;subs-only=0 " +
          ":tmi.twitch.tv ROOMSTATE #pajlada",
        ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345",
        ":justinfan12345.tmi.twitch.tv 366 justinfan12345 #pajlada :End of /NAMES list"
      );

      assert.deepStrictEqual(
        await promise,
        parseTwitchMessage(
          ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada"
        ) as JoinMessage
      );
      await clientError;
    });

    it("adds channel to channel list on success", async function () {
      const { emitAndEnd, client, clientError } = fakeConnection();

      const promise = joinChannel(client, "pajlada");

      emitAndEnd(
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
        "@emote-only=0;followers-only=5;r9k=0;rituals=0;room-id=11148817;slow=0;subs-only=0 " +
          ":tmi.twitch.tv ROOMSTATE #pajlada",
        ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345",
        ":justinfan12345.tmi.twitch.tv 366 justinfan12345 #pajlada :End of /NAMES list"
      );

      await Promise.all([promise, clientError]);

      assert.deepStrictEqual([...client.joinedChannels], ["pajlada"]);
    });

    it("only adds to wantedChannels on msg_channel_suspended failure", async function () {
      // given
      const { client, emitAndEnd, clientError } = fakeConnection();

      // when
      const promise = joinChannel(client, "test");
      emitAndEnd(
        "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
          "#test :This channel has been suspended."
      );

      // then
      await assertErrorChain(
        promise,
        JoinError,
        "Failed to join channel test: Bad response message: @msg-id=msg_cha" +
          "nnel_suspended :tmi.twitch.tv NOTICE #test :This channel has bee" +
          "n suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
          "#test :This channel has been suspended."
      );

      await assertErrorChain(
        clientError,
        JoinError,
        "Failed to join channel test: Bad response message: @msg-id=msg_cha" +
          "nnel_suspended :tmi.twitch.tv NOTICE #test :This channel has bee" +
          "n suspended.",
        MessageError,
        "Bad response message: @msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
          "#test :This channel has been suspended."
      );

      assert.deepStrictEqual([...client.wantedChannels], ["test"]);
      assert.deepStrictEqual([...client.joinedChannels], []);
    });

    it("only adds to wantedChannels on connection close (no error)", async function () {
      // given
      const { end, client, clientError } = fakeConnection();

      // when
      const promise = joinChannel(client, "pajlada");
      end();

      // then
      await assertErrorChain(
        promise,
        JoinError,
        "Failed to join channel pajlada: Connection closed with no error",
        ConnectionError,
        "Connection closed with no error"
      );

      // no error
      await clientError;
      assert(client.closed, "Client should be closed");

      assert.deepStrictEqual([...client.wantedChannels], ["pajlada"]);
      assert.deepStrictEqual([...client.joinedChannels], []);
    });

    it("only adds to wantedChannels on connection close (with error)", async function () {
      // given
      const { end, client, clientError } = fakeConnection();

      // when
      const promise = joinChannel(client, "pajlada");
      end(new Error("peer reset connection"));

      // then
      await assertErrorChain(
        promise,
        JoinError,
        "Failed to join channel pajlada: Connection closed " +
          "due to error: Error occurred in transport layer: p" +
          "eer reset connection",
        ConnectionError,
        "Connection closed due to error: Error occurred in tran" +
          "sport layer: peer reset connection",
        ConnectionError,
        "Error occurred in transport layer: peer reset connection",
        Error,
        "peer reset connection"
      );

      await assertErrorChain(
        clientError,
        ConnectionError,
        "Error occurred in transport layer: peer reset connection",
        Error,
        "peer reset connection"
      );

      assert(client.closed, "Client should be closed");

      assert.deepStrictEqual([...client.wantedChannels], ["pajlada"]);
      assert.deepStrictEqual([...client.joinedChannels], []);
    });

    it("should fail on timeout of 2000 ms", async function () {
      // given
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      // when
      const promise = joinChannel(client, "test");

      // then
      sinon.clock.tick(2000);
      await assertErrorChain(
        promise,
        JoinError,
        "Failed to join channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        JoinError,
        "Failed to join channel test: Timed out after waiting for res" +
          "ponse for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );
    });
  });

  describe("JoinError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(new JoinError("test"), ConnectionError);
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new JoinError("test"), ClientError);
    });
  });
});
