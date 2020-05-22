import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import {
  acknowledgesCapabilities,
  CapabilitiesError,
  deniedAnyCapability,
  requestCapabilities,
} from "./request-capabilities";

describe("./operations/request-capabilities", function () {
  describe("#acknowledgesCapabilities()", function () {
    it("should only return true if given capabilities are a subset of requested capabilities", function () {
      assert.isTrue(
        acknowledgesCapabilities(["a", "b", "c"])(
          parseTwitchMessage("CAP * ACK :a b c d")
        )
      );

      assert.isTrue(
        acknowledgesCapabilities(["a", "b", "c"])(
          parseTwitchMessage("CAP * ACK :c b a")
        )
      );

      assert.isFalse(
        acknowledgesCapabilities(["a", "b", "c"])(
          parseTwitchMessage("CAP * ACK :a b")
        )
      );
    });

    it("should only consider the ACK subcommand", function () {
      assert.isFalse(
        acknowledgesCapabilities(["a", "b", "c"])(
          parseTwitchMessage("CAP * DEF :a b c")
        )
      );
    });
  });

  describe("#deniedAnyCapability()", function () {
    it("should return true if any given capability is rejected", function () {
      assert.isTrue(
        deniedAnyCapability(["a", "b", "c"])(
          parseTwitchMessage("CAP * NAK :a b c")
        )
      );

      assert.isTrue(
        deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :a"))
      );

      assert.isTrue(
        deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :c"))
      );

      assert.isFalse(
        deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :d"))
      );
    });

    it("should only consider the NAK subcommand", function () {
      assert.isFalse(
        acknowledgesCapabilities(["a", "b", "c"])(
          parseTwitchMessage("CAP * DEF :a")
        )
      );
    });
  });

  describe("#requestCapabilities()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();

      const { client, data } = fakeConnection();

      requestCapabilities(client, false);
      requestCapabilities(client, true);

      assert.deepStrictEqual(data, [
        "CAP REQ :twitch.tv/commands twitch.tv/tags\r\n",
        "CAP REQ :twitch.tv/commands twitch.tv/tags twitch.tv/membership\r\n",
      ]);
    });

    it("should resolve on CAP message acknowledging all capabilities", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = requestCapabilities(client, false);

      emitAndEnd(":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags");

      await promise;
      await clientError;
    });

    it("should reject on CAP message rejecting one or more of the requested capabilities", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = requestCapabilities(client, false);

      emitAndEnd(
        ":tmi.twitch.tv CAP * ACK :twitch.tv/commands",
        ":tmi.twitch.tv CAP * NAK :twitch.tv/tags"
      );

      await assertErrorChain(
        promise,
        CapabilitiesError,
        "Failed to request server capabilities twitch.tv/commands, " +
          "twitch.tv/tags: Bad response message: :tmi.twitch.tv CAP " +
          "* NAK :twitch.tv/tags",
        MessageError,
        "Bad response message: :tmi.twitch.tv CAP * NAK :twitch.tv/tags"
      );

      await assertErrorChain(
        clientError,
        CapabilitiesError,
        "Failed to request server capabilities twitch.tv/commands, " +
          "twitch.tv/tags: Bad response message: :tmi.twitch.tv CAP * " +
          "NAK :twitch.tv/tags",
        MessageError,
        "Bad response message: :tmi.twitch.tv CAP * NAK :twitch.tv/tags"
      );
    });
  });

  describe("CapabilitiesError", function () {
    it("should be instanceof ConnectionError", function () {
      assert.instanceOf(new CapabilitiesError(), ConnectionError);
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(new CapabilitiesError(), ClientError);
    });
  });
});
