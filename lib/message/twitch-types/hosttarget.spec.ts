import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { MissingDataError } from "../parser/missing-data-error";
import { ParseError } from "../parser/parse-error";
import { parseTwitchMessage } from "../parser/twitch-message";
import {
  HosttargetMessage,
  parseHostedChannelName,
  parseHosttargetParameter,
  parseViewerCount,
} from "./hosttarget";

describe("./message/twitch-types/hosttarget", function () {
  describe("#parseHostedChannelName()", function () {
    it("should throw a ParseError if passed undefined", function () {
      assertThrowsChain(
        () => parseHostedChannelName(undefined),
        ParseError,
        "Malformed channel part in HOSTTARGET message: undefined"
      );
    });

    it("should throw a ParseError if passed an empty string", function () {
      assertThrowsChain(
        () => parseHostedChannelName(""),
        ParseError,
        "Malformed channel part in HOSTTARGET message: empty string"
      );
    });

    it('should return undefined if passed exactly "-"', function () {
      assert.isUndefined(parseHostedChannelName("-"));
    });

    it("should return the input string as-is in all other cases", function () {
      assert.strictEqual("a", parseHostedChannelName("a"));
      assert.strictEqual("xd", parseHostedChannelName("xd"));
      assert.strictEqual("pajlada", parseHostedChannelName("pajlada"));
    });
  });

  describe("#parseViewerCount()", function () {
    it("should throw a ParseError if passed undefined", function () {
      assertThrowsChain(
        () => parseViewerCount(undefined),
        ParseError,
        "Malformed viewer count part in HOSTTARGET message: undefined"
      );
    });

    it("should throw a ParseError if passed an empty string", function () {
      assertThrowsChain(
        () => parseViewerCount(""),
        ParseError,
        "Malformed viewer count part in HOSTTARGET message: empty string"
      );
    });

    it("should throw a ParseError if passed an invalid integer string", function () {
      assertThrowsChain(
        () => parseViewerCount("abc"),
        ParseError,
        'Malformed viewer count part in HOSTTARGET message: "abc"'
      );
    });

    it('should return undefined if passed exactly "-"', function () {
      assert.isUndefined(parseViewerCount("-"));
    });

    it("should return a parsed number if passed a value integer value", function () {
      assert.strictEqual(0, parseViewerCount("0"));
      assert.strictEqual(50, parseViewerCount("50"));
    });
  });

  describe("#parsHosttargetParameter()", function () {
    it("should throw a ParseError if passed an empty string", function () {
      assertThrowsChain(
        () => parseHosttargetParameter(""),
        ParseError,
        "HOSTTARGET accepts exactly 2 arguments in second parameter, given: empty string"
      );
    });

    it("should throw a ParseError if given more than 2 arguments", function () {
      assertThrowsChain(
        () => parseHosttargetParameter("a b c"),
        ParseError,
        'HOSTTARGET accepts exactly 2 arguments in second parameter, given: "a b c"'
      );
    });

    it("should parse channel name and viewer count if present", function () {
      assert.deepStrictEqual(parseHosttargetParameter("leebaxd 10"), {
        hostedChannelName: "leebaxd",
        viewerCount: 10,
      });
      assert.deepStrictEqual(parseHosttargetParameter("leebaxd -"), {
        hostedChannelName: "leebaxd",
        viewerCount: undefined,
      });
      assert.deepStrictEqual(parseHosttargetParameter("- 10"), {
        hostedChannelName: undefined,
        viewerCount: 10,
      });
      assert.deepStrictEqual(parseHosttargetParameter("- 0"), {
        hostedChannelName: undefined,
        viewerCount: 0,
      });
      assert.deepStrictEqual(parseHosttargetParameter("- -"), {
        hostedChannelName: undefined,
        viewerCount: undefined,
      });
    });
  });

  describe("HosttargetMessage", function () {
    it("should parse fresh Host-On message", function () {
      const msgText = ":tmi.twitch.tv HOSTTARGET #randers :leebaxd 0";

      const msg: HosttargetMessage = parseTwitchMessage(
        msgText
      ) as HosttargetMessage;

      assert.instanceOf(msg, HosttargetMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.strictEqual(msg.hostedChannelName, "leebaxd");
      assert.strictEqual(msg.viewerCount, 0);

      assert.isFalse(msg.wasHostModeExited());
      assert.isTrue(msg.wasHostModeEntered());
    });

    it("should parse non-fresh Host-On message", function () {
      const msgText = ":tmi.twitch.tv HOSTTARGET #randers :leebaxd -";

      const msg: HosttargetMessage = parseTwitchMessage(
        msgText
      ) as HosttargetMessage;

      assert.instanceOf(msg, HosttargetMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.strictEqual(msg.hostedChannelName, "leebaxd");
      assert.isUndefined(msg.viewerCount);

      assert.isFalse(msg.wasHostModeExited());
      assert.isTrue(msg.wasHostModeEntered());
    });

    it("should parse host exit message", function () {
      const msgText = ":tmi.twitch.tv HOSTTARGET #randers :- 0";

      const msg: HosttargetMessage = parseTwitchMessage(
        msgText
      ) as HosttargetMessage;

      assert.instanceOf(msg, HosttargetMessage);

      assert.strictEqual(msg.channelName, "randers");
      assert.isUndefined(msg.hostedChannelName);
      assert.strictEqual(msg.viewerCount, 0);

      assert.isTrue(msg.wasHostModeExited());
      assert.isFalse(msg.wasHostModeEntered());
    });

    it("should require a second IRC parameter to be present", function () {
      const msgText = ":tmi.twitch.tv HOSTTARGET #randers";

      assertThrowsChain(
        () => parseTwitchMessage(msgText),
        MissingDataError,
        "Parameter at index 1 missing"
      );
    });
  });
});
