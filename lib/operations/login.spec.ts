import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { LoginError, sendLogin } from "./login";

describe("./operations/login", function () {
  describe("#sendLogin()", function () {
    it("should only send NICK if password == null", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();

      sendLogin(client, "justinfan12345", undefined);
      assert.deepEqual(data, ["NICK justinfan12345\r\n"]);
    });

    it("should send NICK and PASS if password is specified", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();

      sendLogin(client, "justinfan12345", "SCHMOOPIE");
      assert.deepEqual(data, ["PASS SCHMOOPIE\r\n", "NICK justinfan12345\r\n"]);
    });

    it("should prepend oauth: if missing", function () {
      sinon.useFakeTimers(); // prevent the promise timing out
      const { data, client } = fakeConnection();

      sendLogin(client, "pajlada", "12345");
      assert.deepEqual(data, ["PASS oauth:12345\r\n", "NICK pajlada\r\n"]);
    });

    it("should resolve on 001", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = sendLogin(client, "justinfan12345", "SCHMOOPIE");

      emitAndEnd(":tmi.twitch.tv 001 justinfan12345 :Welcome, GLHF!");

      // no error should occur
      await promise;
      await clientError;
    });

    it("should reject with LoginError on NOTICE", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = sendLogin(client, "justinfan12345", "SCHMOOPIE");

      emitAndEnd(":tmi.twitch.tv NOTICE * :Improperly formatted auth");

      await assertErrorChain(
        promise,
        LoginError,
        "Failed to login: Bad response message: :tmi.twitch" +
          ".tv NOTICE * :Improperly formatted auth",
        MessageError,
        "Bad response message: :tmi.twitch.tv NOTICE * :Improperly formatted auth"
      );

      await assertErrorChain(
        clientError,
        LoginError,
        "Failed to login: Bad response message: :tmi.twitch." +
          "tv NOTICE * :Improperly formatted auth",
        MessageError,
        "Bad response message: :tmi.twitch.tv NOTICE * :Improperly formatted auth"
      );
    });
  });

  describe("LoginError", function () {
    it("should be instanceof ConnectionError", function () {
      assert.instanceOf(new LoginError(), ConnectionError);
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new LoginError(), ClientError);
    });
  });
});
