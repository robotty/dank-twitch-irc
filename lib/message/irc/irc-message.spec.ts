import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { parseIRCMessage } from "../parser/irc-message";
import { MissingDataError } from "../parser/missing-data-error";
import { getNickname, getParameter } from "./irc-message";

describe("./message/irc/irc-message", function() {
  describe("#getParameter()", function() {
    it("should throw MissingDataError if parameters have length 0", function() {
      assertThrowsChain(
        () => getParameter({ ircParameters: [] }, 0),
        MissingDataError,
        "Parameter at index 0 missing"
      );
      assertThrowsChain(
        () => getParameter({ ircParameters: [] }, 1),
        MissingDataError,
        "Parameter at index 1 missing"
      );
      assertThrowsChain(
        () => getParameter({ ircParameters: [] }, 2),
        MissingDataError,
        "Parameter at index 2 missing"
      );
    });

    it("should be able to return parameter 0 if parameters have length 1", function() {
      assert.strictEqual(
        "test parameter",
        getParameter({ ircParameters: ["test parameter"] }, 0)
      );
      assertThrowsChain(
        () => getParameter({ ircParameters: ["test parameter"] }, 1),
        MissingDataError,
        "Parameter at index 1 missing"
      );
      assertThrowsChain(
        () => getParameter({ ircParameters: ["test parameter"] }, 2),
        MissingDataError,
        "Parameter at index 2 missing"
      );
    });

    it("should be able to return parameter 0 and 1 if parameters have length 2", function() {
      assert.strictEqual(
        "test",
        getParameter({ ircParameters: ["test", "parameters"] }, 0)
      );
      assert.strictEqual(
        "parameters",
        getParameter({ ircParameters: ["test", "parameters"] }, 1)
      );
      assertThrowsChain(
        () => getParameter({ ircParameters: ["test", "parameters"] }, 2),
        MissingDataError,
        "Parameter at index 2 missing"
      );
    });
  });

  describe("#getNickname()", function() {
    it("should throw MissingDataError if nickname or prefix is missing", function() {
      assertThrowsChain(
        () => getNickname(parseIRCMessage("JOIN #pajlada")),
        MissingDataError,
        "Missing prefix or missing nickname in prefix"
      );

      assertThrowsChain(
        () => getNickname(parseIRCMessage(":tmi.twitch.tv JOIN #pajlada")),
        MissingDataError,
        "Missing prefix or missing nickname in prefix"
      );
    });

    it("should return the nickname otherwise", function() {
      const message = parseIRCMessage(
        ":leppunen!LEPPUNEN@lePPunen.tmi.twitch.tv JOIN #pajlada"
      );
      assert.strictEqual(getNickname(message), "leppunen");
    });
  });
});
