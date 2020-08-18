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
  });
});
