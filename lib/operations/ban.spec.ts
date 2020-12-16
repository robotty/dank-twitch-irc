import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { ValidationError } from "../validation/validation-error";
import { ban, UserBanError } from "./ban";

describe("./operations/ban", function () {
  describe("UserBanError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(
        new UserBanError("pajlada", "weeb123", "read the rules >("),
        ConnectionError
      );
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(
        new UserBanError("pajlada", "weeb123", "read the rules >("),
        ClientError
      );
    });
  });

  describe("#ban()", function () {
    it("should send the correct wire command if no reason is given", async function () {
      sinon.useFakeTimers();
      const { client, data } = fakeConnection();

      ban(client, "pajlada", "weeb123");

      assert.deepStrictEqual(data, ["PRIVMSG #pajlada :/ban weeb123\r\n"]);
    });

    it("should send the correct wire command if a reason is given", async function () {
      sinon.useFakeTimers();
      const { client, clientError, end, data } = fakeConnection();

      ban(client, "pajlada", "weeb123", "read the rules >(");

      assert.deepStrictEqual(data, [
        "PRIVMSG #pajlada :/ban weeb123 read the rules >(\r\n",
      ]);
      end();
      await clientError;
    });

    it("should validate the given channel name", async function () {
      const { client, clientError, end, data } = fakeConnection();

      const promise = ban(client, "PAJLADA", "weeb123");
      await assertErrorChain(
        promise,
        ValidationError,
        'Channel name "PAJLADA" is invalid/malformed'
      );
      end();
      await clientError;
      assert.isEmpty(data);
    });

    it("should validate the given username", async function () {
      const { client, clientError, end, data } = fakeConnection();

      const promise = ban(client, "pajlada", "WEEB123");
      await assertErrorChain(
        promise,
        ValidationError,
        'Channel name "WEEB123" is invalid/malformed'
      );
      end();
      await clientError;
      assert.isEmpty(data);
    });

    it("should not send newlines in the reason", async function () {
      const { client, clientError, end, data } = fakeConnection();

      const promise = ban(
        client,
        "pajlada",
        "weeb123",
        "Please\r\nread the rules!"
      );

      await assertErrorChain(
        promise,
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      end();
      await clientError;
      assert.isEmpty(data);
    });

    it("should resolve on incoming ban_success", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();

      const promise = ban(
        client,
        "pajlada",
        "weeb123",
        "Please read the rules!"
      );

      emitAndEnd(
        "@msg-id=ban_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 is now banned from this channel."
      );

      await promise;
      await clientError;
    });

    it("should reject on incoming no_permission", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();

      const promise = ban(
        client,
        "forsen",
        "weeb123",
        "Please read the rules!"
      );

      const response =
        "@msg-id=no_permission :tmi.twitch.tv NOTICE #forsen " +
        ":You don't have permission to perform that action.";
      emitAndEnd(response);

      await assertErrorChain(
        [promise, clientError],
        UserBanError,
        "Failed to ban weeb123 in #forsen: Bad response message: " + response,
        MessageError,
        "Bad response message: " + response
      );
    });
  });
});
