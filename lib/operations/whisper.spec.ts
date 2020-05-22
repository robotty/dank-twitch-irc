import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { sendPing } from "./ping";
import { whisper, WhisperError } from "./whisper";

describe("./operations/whisper", function () {
  describe("WhisperError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(
        new WhisperError("pajlada", "test"),
        ConnectionError
      );
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new WhisperError("pajlada", "test"), ClientError);
    });
  });

  describe("#whisper()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();
      const { data, client } = fakeConnection();

      whisper(client, "pajlada", "hello world");

      assert.deepStrictEqual(data, [
        "PRIVMSG #justinfan12345 :/w pajlada hello world\r\n",
      ]);
    });

    it("should resolve after 1000 milliseconds", async function () {
      sinon.useFakeTimers();
      const { client, clientError, end } = fakeConnection();

      const promise = whisper(client, "pajlada", "hello world");

      sinon.clock.tick(1000);

      await promise;

      end();
      await clientError;
    });

    it("should resolve if outpaced by other command response", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const whisperPromise = whisper(client, "pajlada", "hello world");
      const pingPromise = sendPing(client, "test1234");

      emitAndEnd(":tmi.twitch.tv PONG tmi.twitch.tv :test1234");

      await whisperPromise;
      await pingPromise;
      await clientError;
    });

    it("should be rejected on incoming bad NOTICE", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = whisper(client, "pajlada", "hello world");

      emitAndEnd(
        "@msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfan12345 " +
          ":You are sending whispers too fast. Try again in a second."
      );

      await assertErrorChain(
        promise,
        WhisperError,
        "Failed to whisper [pajlada]: hello world: Bad response message:" +
          " @msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfa" +
          "n12345 :You are sending whispers too fast. Try again in a second.",
        MessageError,
        "Bad response message: @msg-id=whisper_limit_per_sec" +
          " :tmi.twitch.tv NOTICE #justinfan12345 :You are " +
          "sending whispers too fast. Try again in a second."
      );

      await assertErrorChain(
        clientError,
        WhisperError,
        "Failed to whisper [pajlada]: hello world: Bad response message:" +
          " @msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfa" +
          "n12345 :You are sending whispers too fast. Try again in a second.",
        MessageError,
        "Bad response message: @msg-id=whisper_limit_per_sec" +
          " :tmi.twitch.tv NOTICE #justinfan12345 :You are " +
          "sending whispers too fast. Try again in a second."
      );
    });
  });
});
