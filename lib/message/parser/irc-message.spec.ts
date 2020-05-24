import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { IRCMessage } from "../irc/irc-message";
import { parseIRCMessage } from "./irc-message";
import { ParseError } from "./parse-error";

describe("./message/parser/irc-message", function () {
  describe("#parseIRCMessage", function () {
    it("should throw a ParseError on empty string input", function () {
      assertThrowsChain(
        () => parseIRCMessage(""),
        ParseError,
        'Invalid format for IRC command (given src: "")'
      );
    });
    it("should throw a ParseError on malformed input", function () {
      // double space
      assertThrowsChain(
        () => parseIRCMessage(":tmi.twitch.tv  PRIVMSG"),
        ParseError,
        'Invalid format for IRC command (given src: ":tmi.twitch.tv  PRIVMSG")'
      );
    });
    it("should error on empty prefix", function () {
      assertThrowsChain(
        () => parseIRCMessage(": PING xD"),
        ParseError,
        'Empty prefix declaration (nothing after : sign) (given src: ": PING xD")'
      );
      assertThrowsChain(
        () => parseIRCMessage(":a@ PING xD"),
        ParseError,
        'Host, nick or user is empty in prefix (given src: ":a@ PING xD")'
      );
      assertThrowsChain(
        () => parseIRCMessage(":a!@b PING xD"),
        ParseError,
        'Host, nick or user is empty in prefix (given src: ":a!@b PING xD")'
      );
    });
    it("should parse this one", function () {
      parseIRCMessage(
        ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345"
      );
    });
    it("should parse tags optionally", function () {
      const actual = parseIRCMessage(
        ":tetyys!tetyys@tetyys.tmi.twitch.tv PRIVMSG #pajlada :KKona"
      );
      const expected = new IRCMessage({
        rawSource:
          ":tetyys!tetyys@tetyys.tmi.twitch.tv PRIVMSG #pajlada :KKona",
        ircPrefixRaw: "tetyys!tetyys@tetyys.tmi.twitch.tv",
        ircPrefix: {
          nickname: "tetyys",
          username: "tetyys",
          hostname: "tetyys.tmi.twitch.tv",
        },
        ircCommand: "PRIVMSG",
        ircParameters: ["#pajlada", "KKona"],
        ircTags: {},
      });

      assert.deepStrictEqual(actual, expected);
    });
    it("should parse tags", function () {
      const actual = parseIRCMessage("@abc=def;kkona=kkona;def;def PONG");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "@abc=def;kkona=kkona;def;def PONG",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: [],
          ircTags: {
            abc: "def",
            kkona: "kkona",
            def: null,
          },
        })
      );
    });
    it("should parse prefix optionally", function () {
      const actual = parseIRCMessage("PONG :tmi.twitch.tv");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG :tmi.twitch.tv",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["tmi.twitch.tv"],
          ircTags: {},
        })
      );
    });
    it("should parse multiple middle parameters", function () {
      const actual = parseIRCMessage("PONG a b cd");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG a b cd",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["a", "b", "cd"],
          ircTags: {},
        })
      );
    });
    it('should allow ":" character in middle parameters', function () {
      const actual = parseIRCMessage("PONG a:b b: :cd");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG a:b b: :cd",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["a:b", "b:", "cd"],
          ircTags: {},
        })
      );
    });
    it("should uppercase the command", function () {
      const actual = parseIRCMessage("pong");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "pong",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: [],
          ircTags: {},
        })
      );
    });
    it("should recognize host-only prefixes", function () {
      const actual = parseIRCMessage(":tmi.twitch.tv PING");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: ":tmi.twitch.tv PING",
          ircPrefixRaw: "tmi.twitch.tv",
          ircPrefix: {
            nickname: undefined,
            username: undefined,
            hostname: "tmi.twitch.tv",
          },
          ircCommand: "PING",
          ircParameters: [],
          ircTags: {},
        })
      );
    });
    it("should recognize server-only prefixes", function () {
      const actual = parseIRCMessage(":leppunen PRIVMSG");
      // note: this could also be a nickname-only prefix but those
      // don't really exist on Twitch so we assume a :<single thing>
      // prefix to be a hostname regardless of content
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: ":leppunen PRIVMSG",
          ircPrefixRaw: "leppunen",
          ircPrefix: {
            nickname: undefined,
            username: undefined,
            hostname: "leppunen",
          },
          ircCommand: "PRIVMSG",
          ircParameters: [],
          ircTags: {},
        })
      );
    });
    it("should recognize full prefixes", function () {
      const actual = parseIRCMessage(
        ":leppunen!crazyusername@local.host PRIVMSG"
      );
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: ":leppunen!crazyusername@local.host PRIVMSG",
          ircPrefixRaw: "leppunen!crazyusername@local.host",
          ircPrefix: {
            nickname: "leppunen",
            username: "crazyusername",
            hostname: "local.host",
          },
          ircCommand: "PRIVMSG",
          ircParameters: [],
          ircTags: {},
        })
      );
    });
    it("should allow numeric commands", function () {
      const actual = parseIRCMessage("001");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "001",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "001",
          ircParameters: [],
          ircTags: {},
        })
      );
    });
    it("should only allow 3-digit numeric commands", function () {
      assertThrowsChain(
        () => parseIRCMessage("01"),
        ParseError,
        'Invalid format for IRC command (given src: "01")'
      );
      assertThrowsChain(
        () => parseIRCMessage("0001"),
        ParseError,
        'Invalid format for IRC command (given src: "0001")'
      );
    });
  });

  it("should allow underscores in usernames", function () {
    const actual = parseIRCMessage(
      "@historical=1;badge-info=subscriber/4;" +
        "badges=subscriber/3,sub-gifter/1;color=#492F2F;" +
        "display-name=Billy_Bones_U;emotes=;flags=;id=d3805a32-df90-4844-a3ab" +
        "-4ea116fcf1c6;mod=0;room-id=11148817;subscriber=1;tmi-sent-ts=15656850" +
        "67248;turbo=0;user-id=411604091;user-type= :billy_bones_u!billy_bones_" +
        "u@billy_bones_u.tmi.twitch.tv PRIVMSG #pajlada :FeelsDankMan ..."
    );

    assert.deepStrictEqual(
      actual,
      new IRCMessage({
        rawSource:
          "@historical=1;badge-info=subscriber/4;" +
          "badges=subscriber/3,sub-gifter/1;color=#492F2F;" +
          "display-name=Billy_Bones_U;emotes=;flags=;id=d3805a32-df90-4844-a3ab" +
          "-4ea116fcf1c6;mod=0;room-id=11148817;subscriber=1;tmi-sent-ts=15656850" +
          "67248;turbo=0;user-id=411604091;user-type= :billy_bones_u!billy_bones_" +
          "u@billy_bones_u.tmi.twitch.tv PRIVMSG #pajlada :FeelsDankMan ...",
        ircPrefixRaw: "billy_bones_u!billy_bones_u@billy_bones_u.tmi.twitch.tv",
        ircPrefix: {
          hostname: "billy_bones_u.tmi.twitch.tv",
          nickname: "billy_bones_u",
          username: "billy_bones_u",
        },
        ircParameters: ["#pajlada", "FeelsDankMan ..."],
        ircCommand: "PRIVMSG",
        ircTags: {
          "historical": "1",
          "badge-info": "subscriber/4",
          "badges": "subscriber/3,sub-gifter/1",
          "color": "#492F2F",
          "display-name": "Billy_Bones_U",
          "emotes": "",
          "flags": "",
          "id": "d3805a32-df90-4844-a3ab-4ea116fcf1c6",
          "mod": "0",
          "room-id": "11148817",
          "subscriber": "1",
          "tmi-sent-ts": "1565685067248",
          "turbo": "0",
          "user-id": "411604091",
          "user-type": "",
        },
      })
    );
  });
});
