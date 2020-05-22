import { assertThrowsChain } from "../helpers.spec";
import { validateIRCCommand } from "./irc-command";
import { ValidationError } from "./validation-error";

describe("./validation/irc-command", function () {
  describe("#validateIRCCommand", function () {
    it("should reject newlines", function () {
      assertThrowsChain(
        () => validateIRCCommand("JOIN\n"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("\n"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("\nJOIN"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("JOIN\nJOIN"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
    });

    it("should reject carriage returns", function () {
      assertThrowsChain(
        () => validateIRCCommand("JOIN\r"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("\r"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("\rJOIN"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
      assertThrowsChain(
        () => validateIRCCommand("JOIN\rJOIN"),
        ValidationError,
        "IRC command may not include \\n or \\r"
      );
    });

    it("should pass normal IRC commands", function () {
      validateIRCCommand("JOIN");
      validateIRCCommand("");
      validateIRCCommand("PRIVMSG #forsen :asd");
      validateIRCCommand("JOIN #pajlada");
    });
  });
});
