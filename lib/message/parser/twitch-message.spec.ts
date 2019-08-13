import { assert } from "chai";
import { IRCMessage } from "../irc/irc-message";
import { CapMessage } from "../twitch-types/cap";
import { ClearchatMessage } from "../twitch-types/clearchat";
import { ClearmsgMessage } from "../twitch-types/clearmsg";
import { PingMessage } from "../twitch-types/connection/ping";
import { PongMessage } from "../twitch-types/connection/pong";
import { ReconnectMessage } from "../twitch-types/connection/reconnect";
import { GlobaluserstateMessage } from "../twitch-types/globaluserstate";
import { HosttargetMessage } from "../twitch-types/hosttarget";
import { JoinMessage } from "../twitch-types/membership/join";
import { PartMessage } from "../twitch-types/membership/part";
import { NoticeMessage } from "../twitch-types/notice";
import { PrivmsgMessage } from "../twitch-types/privmsg";
import { RoomstateMessage } from "../twitch-types/roomstate";
import { UsernoticeMessage } from "../twitch-types/usernotice";
import { UserstateMessage } from "../twitch-types/userstate";
import { WhisperMessage } from "../twitch-types/whisper";
import { parseIRCMessage } from "./irc-message";
import { parseTwitchMessage } from "./twitch-message";

describe("./message/parser/twitch-message", function() {
  describe("#parseTwitchpMessage", function() {
    const testCases = [
      {
        irc:
          "@ban-duration=5;room-id=11148817;target-user-id=70948394;tmi-sent-ts=1562587662677 " +
          ":tmi.twitch.tv CLEARCHAT #pajlada :weeb123",
        instanceOf: ClearchatMessage
      },
      {
        irc:
          "@login=supinic;room-id=;target-msg-id=e8a4dcfe-9db3-43eb-98d4-b5101ba6a20e;" +
          "tmi-sent-ts=-6795364578871 :tmi.twitch.tv CLEARMSG #pajlada :this is retarded",
        instanceOf: ClearmsgMessage
      },
      {
        irc:
          "@badge-info=;badges=;color=;display-name=receivertest3;emote-sets=0;user-id=" +
          "422021310;user-type= :tmi.twitch.tv GLOBALUSERSTATE",
        instanceOf: GlobaluserstateMessage
      },
      {
        irc: ":tmi.twitch.tv HOSTTARGET #randers :redshell 0",
        instanceOf: HosttargetMessage
      },
      {
        irc:
          "@msg-id=host_on :tmi.twitch.tv NOTICE #randers :Now hosting Redshell.",
        instanceOf: NoticeMessage
      },
      {
        irc:
          "@badge-info=subscriber/10;badges=moderator/1,subscriber/6,sub-gifter/1;" +
          "color=#19E6E6;display-name=randers;emotes=;flags=;id=0e7f0a13-3885-42a3-ab23-722b874eb864;" +
          "mod=1;room-id=11148817;subscriber=1;tmi-sent-ts=1562588302071;turbo=0;user-id=40286300;" +
          "user-type=mod :randers!randers@randers.tmi.twitch.tv PRIVMSG #pajlada :asd",
        instanceOf: PrivmsgMessage
      },
      {
        irc: "@emote-only=1;room-id=40286300 :tmi.twitch.tv ROOMSTATE #randers",
        instanceOf: RoomstateMessage
      },
      {
        irc:
          "@badge-info=;badges=subscriber/0,premium/1;color=;display-name=FletcherCodes;" +
          "emotes=;flags=;id=57cbe8d9-8d17-4760-b1e7-0d888e1fdc60;login=fletchercodes;mod=0;" +
          "msg-id=sub;msg-param-cumulative-months=0;msg-param-months=0;" +
          "msg-param-should-share-streak=0;msg-param-sub-plan-name=The\\sWhatevas;" +
          "msg-param-sub-plan=Prime;room-id=408892348;subscriber=1;system-msg=fletchercodes" +
          "\\ssubscribed\\swith\\sTwitch\\sPrime.;tmi-sent-ts=1551486064328;" +
          "turbo=0;user-id=269899575;user-type= :tmi.twitch.tv USERNOTICE #clippyassistant",
        instanceOf: UsernoticeMessage
      },
      {
        irc:
          "@badge-info=;badges=;color=;display-name=receivertest3;emote-sets=0;mod=0;" +
          "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #randers",
        instanceOf: UserstateMessage
      },
      {
        irc:
          "@badges=;color=#19E6E6;display-name=randers;emotes=;message-id=1;" +
          "thread-id=40286300_422021310;turbo=0;user-id=40286300;user-type= " +
          ":randers!randers@randers.tmi.twitch.tv WHISPER receivertest3 :test",
        instanceOf: WhisperMessage
      },
      {
        irc:
          ":receivertest3!receivertest3@receivertest3.tmi.twitch.tv JOIN #randers",
        instanceOf: JoinMessage
      },
      {
        irc:
          ":receivertest3!receivertest3@receivertest3.tmi.twitch.tv PART #randers",
        instanceOf: PartMessage
      },
      {
        irc: ":tmi.twitch.tv RECONNECT",
        instanceOf: ReconnectMessage
      },
      {
        irc: ":tmi.twitch.tv PING",
        instanceOf: PingMessage
      },
      {
        irc: "PONG :tmi.twitch.tv",
        instanceOf: PongMessage
      },
      {
        irc: ":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags",
        instanceOf: CapMessage
      }
    ];

    for (const { irc, instanceOf } of testCases) {
      const ircMessage = parseIRCMessage(irc);
      const command = ircMessage.ircCommand;

      it(`should map ${command} to ${instanceOf.name}`, function() {
        const twitchMessage = parseTwitchMessage(irc);

        assert.instanceOf(twitchMessage, instanceOf);
      });
    }

    it("should leave unknown commands as bare IRCMessages", function() {
      const parsed = parseTwitchMessage(":tmi.twitch.tv UNKNOWN");
      assert.strictEqual(Object.getPrototypeOf(parsed), IRCMessage.prototype);
    });

    it("should leave numeric commands as bare IRCMessages", function() {
      const parsed = parseTwitchMessage(":tmi.twitch.tv 001");
      assert.strictEqual(Object.getPrototypeOf(parsed), IRCMessage.prototype);
    });
  });
});
