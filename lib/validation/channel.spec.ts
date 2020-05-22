import { assertThrowsChain } from "../helpers.spec";
import { validateChannelName } from "./channel";
import { ValidationError } from "./validation-error";

describe("./validation/channel", function () {
  describe("#validateChannelName()", function () {
    it("rejects undefined", function () {
      assertThrowsChain(
        () => validateChannelName(undefined),
        ValidationError,
        "Channel name undefined is invalid/malformed"
      );
    });

    it("rejects null", function () {
      assertThrowsChain(
        () => validateChannelName(null),
        ValidationError,
        "Channel name null is invalid/malformed"
      );
    });

    it("rejects empty strings", function () {
      assertThrowsChain(
        () => validateChannelName(""),
        ValidationError,
        "Channel name empty string is invalid/malformed"
      );
    });

    it("allows single letters", function () {
      validateChannelName("a");
      validateChannelName("b");
      validateChannelName("x");
      validateChannelName("z");
    });

    it("allows underscores", function () {
      validateChannelName("a_b");
      validateChannelName("b___c");
      validateChannelName("lack_of_sanity");
      validateChannelName("just__get__a__house");
    });

    it("rejects uppercase letters", function () {
      assertThrowsChain(
        () => validateChannelName("Pajlada"),
        ValidationError,
        'Channel name "Pajlada" is invalid/malformed'
      );
    });

    describe("allows chatroom channel names", function () {
      it("allows ID 0", function () {
        validateChannelName("chatrooms:0:85c31777-b181-46ab-8e08-73e4ecd7a386");
      });
      it("doesn't allow no user ID", function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms::85c31777-b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "chatrooms::85c31777-b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
      });
      it("allows ID 123", function () {
        validateChannelName("chatrooms:1:85c31777-b181-46ab-8e08-73e4ecd7a386");
      });
      it("allows random normal ID from a real user", function () {
        validateChannelName(
          "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386"
        );
      });
      it("allows different UUIDs", function () {
        validateChannelName(
          "chatrooms:11148817:7ca40445-41f9-4151-a6ac-76188d1ec3ac"
        );
        validateChannelName(
          "chatrooms:11148817:b3cb91e8-c731-41b0-a89b-f22026e01bfd"
        );
        validateChannelName(
          "chatrooms:11148817:31f1d84f-a6ab-48b7-8494-edb0360e9edf"
        );
        validateChannelName(
          "chatrooms:11148817:86cdab44-5b71-4231-a6ce-5d917083d660"
        );
        validateChannelName(
          "chatrooms:11148817:5ffa74e2-7544-49ee-9be6-27bbfe53610e"
        );
        validateChannelName(
          "chatrooms:11148817:b23b0191-5e36-415a-8d09-66e401d0191f"
        );
        validateChannelName(
          "chatrooms:11148817:1f68ab79-04d8-4fcd-a6b3-30d4f21a1d2e"
        );
        validateChannelName(
          "chatrooms:11148817:deaf7d7b-2d1f-4648-b1a4-2f54d8d3607e"
        );
        validateChannelName(
          "chatrooms:11148817:2db7c329-d09e-45bd-b6b5-2272bf231338"
        );
        validateChannelName(
          "chatrooms:11148817:0be13de5-812a-41a3-b124-6736f1fd65c0"
        );
      });
      it("allows maximum 64 bit integer user ID", function () {
        validateChannelName(
          "chatrooms:9223372036854775807:85c31777-b181-46ab-8e08-73e4ecd7a386"
        );
      });
      it('doesn\'t allow capizalization in "chatrooms"', function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "Chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "Chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
      });
      it("doesn't allow capizalization in the UUID", function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms:11148817:85C31777-B181-46AB-8E08-73E4ECD7A386"
            ),
          ValidationError,
          'Channel name "chatrooms:11148817:85C31777-B181-46AB-8E08-73E4ECD7A386" ' +
            "is invalid/malformed"
        );
      });
      it("doesn't allow non-hex characters in the UUID", function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms:11148817:85k31777-b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "chatrooms:11148817:85k31777-b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
      });
      it("doesn't allow non-dashes in the UUID", function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms:11148817:85c31777_b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "chatrooms:11148817:85c31777_b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
      });
      it("doesn't allow partial matches", function () {
        assertThrowsChain(
          () =>
            validateChannelName(
              "a chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "a chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
        assertThrowsChain(
          () =>
            validateChannelName(
              "achatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386"
            ),
          ValidationError,
          'Channel name "achatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386" ' +
            "is invalid/malformed"
        );
        assertThrowsChain(
          () =>
            validateChannelName(
              "a chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386 b"
            ),
          ValidationError,
          'Channel name "a chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386 b" ' +
            "is invalid/malformed"
        );
        assertThrowsChain(
          () =>
            validateChannelName(
              "achatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386b"
            ),
          ValidationError,
          'Channel name "achatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386b" ' +
            "is invalid/malformed"
        );
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386 b"
            ),
          ValidationError,
          'Channel name "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386 b" ' +
            "is invalid/malformed"
        );
        assertThrowsChain(
          () =>
            validateChannelName(
              "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386b"
            ),
          ValidationError,
          'Channel name "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386b" ' +
            "is invalid/malformed"
        );
      });
    });
  });
});
