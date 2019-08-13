import { assert } from "chai";
import { assertThrowsChain } from "../../helpers.spec";
import { IRCMessage } from "../irc/irc-message";
import {
  ircParseRegex,
  parseIRCMessage,
  parseMiddleParameters
} from "./irc-message";
import { ParseError } from "./parse-error";

describe("./message/parser/irc-message", function() {
  describe("#ircParseRegex", function() {
    it("should be equal to the expanded version", function() {
      // making sure there are no copy paste or escaping errors
      assert.strictEqual(
        ircParseRegex.source,
        "^(?:@(?<tags>[^ ]+) )?(?::(?<prefix>(?<hostname>[a-zA-Z0-9-_]+\\" +
          ".[a-zA-Z0-9-_.]+)|(?:(?<nickname>[a-zA-Z0-9-[\\]\\\\`_^{|}]+)(?:(?:!(?<username>[^\\x00\\r\\n @]+))?@" +
          "(?<hostname2>[a-zA-Z0-9-_.]+))?)) )?(?<command>[a-zA-Z]+|[0-9]{3})(?<middleParameters>(?: [^\\x00\\r" +
          "\\n :][^\\x00\\r\\n ]*){0,14})?(?: :(?<trailingParameter>[^\\x00\\r\\n]*))?$"
      );
    });
  });

  describe("#parseMiddleParameters()", function() {
    it("should return an empty array on undefined input", function() {
      assert.deepStrictEqual(parseMiddleParameters(undefined), []);
    });
    it("should return an empty array on empty string input", function() {
      assert.deepStrictEqual(parseMiddleParameters(""), []);
    });
    it("should parse a single argument correctly", function() {
      assert.deepStrictEqual(parseMiddleParameters(" #pajlada"), ["#pajlada"]);
    });
    it("should parse two arguments correctly", function() {
      assert.deepStrictEqual(parseMiddleParameters(" #pajlada *"), [
        "#pajlada",
        "*"
      ]);
    });
    it("should parse three arguments correctly", function() {
      assert.deepStrictEqual(parseMiddleParameters(" #pajlada * ACK"), [
        "#pajlada",
        "*",
        "ACK"
      ]);
    });
  });

  describe("#parseIRCMessage", function() {
    it("should throw a ParseError on empty string input", function() {
      assertThrowsChain(
        () => parseIRCMessage(""),
        ParseError,
        'IRC message malformed (given line: "")'
      );
    });
    it("should throw a ParseError on malformed input", function() {
      // double space
      assertThrowsChain(
        () => parseIRCMessage(":tmi.twitch.tv  PRIVMSG"),
        ParseError,
        'IRC message malformed (given line: ":tmi.twitch.tv  PRIVMSG")'
      );
    });
    it("should parse tags optionally", function() {
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
          hostname: "tetyys.tmi.twitch.tv"
        },
        ircCommand: "PRIVMSG",
        ircParameters: ["#pajlada", "KKona"],
        ircTags: {}
      });

      assert.deepStrictEqual(actual, expected);
    });
    it("should parse tags", function() {
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
            def: null
          }
        })
      );
    });
    it("should parse prefix optionally", function() {
      const actual = parseIRCMessage("PONG :tmi.twitch.tv");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG :tmi.twitch.tv",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["tmi.twitch.tv"],
          ircTags: {}
        })
      );
    });
    it("should parse multiple middle parameters", function() {
      const actual = parseIRCMessage("PONG a b cd");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG a b cd",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["a", "b", "cd"],
          ircTags: {}
        })
      );
    });
    it('should allow ":" character in middle parameters', function() {
      const actual = parseIRCMessage("PONG a:b b: :cd");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "PONG a:b b: :cd",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: ["a:b", "b:", "cd"],
          ircTags: {}
        })
      );
    });
    it("should uppercase the command", function() {
      const actual = parseIRCMessage("pong");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "pong",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "PONG",
          ircParameters: [],
          ircTags: {}
        })
      );
    });
    it("should recognize host-only prefixes", function() {
      const actual = parseIRCMessage(":tmi.twitch.tv PING");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: ":tmi.twitch.tv PING",
          ircPrefixRaw: "tmi.twitch.tv",
          ircPrefix: {
            nickname: undefined,
            username: undefined,
            hostname: "tmi.twitch.tv"
          },
          ircCommand: "PING",
          ircParameters: [],
          ircTags: {}
        })
      );
    });
    it("should recognize nickname-only prefixes", function() {
      const actual = parseIRCMessage(":leppunen PRIVMSG");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: ":leppunen PRIVMSG",
          ircPrefixRaw: "leppunen",
          ircPrefix: {
            nickname: "leppunen",
            username: undefined,
            hostname: undefined
          },
          ircCommand: "PRIVMSG",
          ircParameters: [],
          ircTags: {}
        })
      );
    });
    it("should recognize full prefixes", function() {
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
            hostname: "local.host"
          },
          ircCommand: "PRIVMSG",
          ircParameters: [],
          ircTags: {}
        })
      );
    });
    it("should allow numeric commands", function() {
      const actual = parseIRCMessage("001");
      assert.deepStrictEqual(
        actual,
        new IRCMessage({
          rawSource: "001",
          ircPrefixRaw: undefined,
          ircPrefix: undefined,
          ircCommand: "001",
          ircParameters: [],
          ircTags: {}
        })
      );
    });
    it("should only allow 3-digit numeric commands", function() {
      assertThrowsChain(
        () => parseIRCMessage("01"),
        ParseError,
        'IRC message malformed (given line: "01")'
      );
      assertThrowsChain(
        () => parseIRCMessage("0001"),
        ParseError,
        'IRC message malformed (given line: "0001")'
      );
    });
  });

  it("should allow underscores in usernames", function() {
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
          username: "billy_bones_u"
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
          "user-type": ""
        }
      })
    );
  });
});
