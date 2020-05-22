import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { ClientError, ConnectionError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { PingTimeoutError, sendPing } from "./ping";

describe("./operations/ping", function () {
  describe("#sendPing()", function () {
    it("should send the correct wire command if ping identifier is specified", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();

      sendPing(client, "some identifier");

      assert.deepStrictEqual(data, ["PING :some identifier\r\n"]);
    });

    it("should send a random ping identifier if no ping identifier is specified", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();

      sendPing(client);

      assert.strictEqual(data.length, 1);
      assert.match(data[0], /^PING :dank-twitch-irc:manual:[0-9a-f]{32}\r\n$/);
    });

    it("should resolve on matching PONG", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();

      const promise = sendPing(client, "some identifier");

      emitAndEnd(":tmi.twitch.tv PONG tmi.twitch.tv :some identifier");

      const pongMessage = await promise;
      assert.strictEqual(pongMessage.argument, "some identifier");

      await clientError;
    });

    it("should reject on timeout of 2000 milliseconds by default", async function () {
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      const promise = sendPing(client, "some identifier");

      sinon.clock.tick(2000);

      await assertErrorChain(
        promise,
        PingTimeoutError,
        "Server did not PONG back: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        PingTimeoutError,
        "Server did not PONG back: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );
    });
  });

  describe("PingTimeoutError", function () {
    it("should be instanceof ConnectionError", function () {
      assert.instanceOf(new PingTimeoutError(), ConnectionError);
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new PingTimeoutError(), ClientError);
    });
  });
});
