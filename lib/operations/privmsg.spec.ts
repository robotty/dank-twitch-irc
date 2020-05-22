import { assert } from "chai";
import { fakeConnection } from "../helpers.spec";
import { sendPrivmsg } from "./privmsg";

describe("./operations/privmsg", function () {
  describe("#sendPrivmsg()", function () {
    it("should send the correct wire command", function () {
      const { client, data } = fakeConnection();

      sendPrivmsg(client, "forsen", "Kappa Keepo PogChamp");

      assert.deepStrictEqual(data, [
        "PRIVMSG #forsen :Kappa Keepo PogChamp\r\n",
      ]);
    });
  });
});
