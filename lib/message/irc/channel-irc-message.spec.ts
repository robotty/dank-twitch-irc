import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { parseIRCMessage } from "../parser/irc-message";
import { MissingDataError } from "../parser/missing-data-error";
import { ParseError } from "../parser/parse-error";
import { ChannelIRCMessage, getIRCChannelName } from "./channel-irc-message";

describe("./message/irc/channel-irc-message", function () {
  describe("#getIRCChannelName()", function () {
    it("should return valid channel names, trimmed of the leading # character", function () {
      assert.strictEqual(
        getIRCChannelName({ ircParameters: ["#pajlada"] }),
        "pajlada"
      );
      assert.strictEqual(getIRCChannelName({ ircParameters: ["#a"] }), "a");
      assert.strictEqual(
        getIRCChannelName({ ircParameters: ["#a", "more arguments"] }),
        "a"
      );
      assert.strictEqual(
        getIRCChannelName({ ircParameters: ["#a", "more", "arguments"] }),
        "a"
      );
    });

    it("should handle chatroom channel ID normally", function () {
      const ircParameters = [
        "#chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386",
        "more",
        "arguments",
      ];
      assert.strictEqual(
        getIRCChannelName({ ircParameters }),
        "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386"
      );
    });

    it("should throw ParseError if no argument is present", function () {
      assertThrowsChain(
        () => getIRCChannelName({ ircParameters: [] }),
        MissingDataError,
        "Parameter at index 0 missing"
      );
    });

    it("should throw ParseError on empty first argument", function () {
      assertThrowsChain(
        () => getIRCChannelName({ ircParameters: [""] }),
        ParseError,
        'Received malformed IRC channel name ""'
      );
    });

    it("should throw ParseError if argument does not begin with a # character", function () {
      assertThrowsChain(
        () => getIRCChannelName({ ircParameters: ["abc"] }),
        ParseError,
        'Received malformed IRC channel name "abc"'
      );
      assertThrowsChain(
        () => getIRCChannelName({ ircParameters: ["pajlada"] }),
        ParseError,
        'Received malformed IRC channel name "pajlada"'
      );
    });

    it("should throw ParseError on standalone # character", function () {
      assertThrowsChain(
        () => getIRCChannelName({ ircParameters: ["#"] }),
        ParseError,
        'Received malformed IRC channel name "#"'
      );
    });
  });

  describe("ChannelIRCMessage", function () {
    it("should parse argument 0 into #channelName", function () {
      const msg = new ChannelIRCMessage(parseIRCMessage("PRIVMSG #pajlada"));
      assert.strictEqual(msg.channelName, "pajlada");
    });

    it("should throw ParseError on error parsing the channel name", function () {
      // some examples from above
      assertThrowsChain(
        () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG #")),
        ParseError,
        'Received malformed IRC channel name "#"'
      );
      assertThrowsChain(
        () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG :")),
        ParseError,
        'Received malformed IRC channel name ""'
      );
      assertThrowsChain(
        () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG")),
        MissingDataError,
        "Parameter at index 0 missing"
      );
    });
  });
});
