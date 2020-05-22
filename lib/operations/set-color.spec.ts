import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { setColor, SetColorError } from "./set-color";

describe("./operations/set-color", function () {
  describe("SetColorError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(
        new SetColorError({ r: 255, g: 0, b: 0 }),
        ConnectionError
      );
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(
        new SetColorError({ r: 255, g: 0, b: 0 }),
        ClientError
      );
    });
  });

  describe("#setColor()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();
      const { data, client } = fakeConnection();

      setColor(client, { r: 255, g: 0, b: 1 });

      assert.deepStrictEqual(data, [
        "PRIVMSG #justinfan12345 :/color #ff0001\r\n",
      ]);
    });

    it("should fail after 2000 milliseconds of no response", async function () {
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      const promise = setColor(client, { r: 255, g: 0, b: 1 });

      sinon.clock.tick(2000);

      await assertErrorChain(
        promise,
        SetColorError,
        "Failed to set color to #ff0001: " +
          "Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        SetColorError,
        "Failed to set color to #ff0001: " +
          "Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );
    });

    it("should be rejected on incoming bad NOTICE (type 1)", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = setColor(client, { r: 255, g: 0, b: 1 });

      emitAndEnd(
        "@msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 :" +
          "Only turbo users can specify an arbitrary hex color. Use one of " +
          "the following instead: Blue, BlueViolet, CadetBlue, Chocolate, " +
          "Coral, DodgerBlue, Firebrick, GoldenRod, Green, HotPink, OrangeRed, " +
          "Red, SeaGreen, SpringGreen, YellowGreen."
      );

      await assertErrorChain(
        promise,
        SetColorError,
        "Failed to set color to #ff0001: Bad response message:" +
          " @msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 " +
          ":Only turbo users can specify an arbitrary hex color. " +
          "Use one of the following instead: Blue, BlueViolet, CadetBlue, " +
          "Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, Green, " +
          "HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
        MessageError,
        "Bad response message: @msg-id=turbo_only_color :tmi.twitch.tv" +
          " NOTICE #justinfan12345 :Only turbo users can specify an arbitrary" +
          " hex color. Use one of the following instead: Blue, BlueViolet," +
          " CadetBlue, Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod," +
          " Green, HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen."
      );

      await assertErrorChain(
        clientError,
        SetColorError,
        "Failed to set color to #ff0001: Bad response message:" +
          " @msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 " +
          ":Only turbo users can specify an arbitrary hex color. " +
          "Use one of the following instead: Blue, BlueViolet, CadetBlue, " +
          "Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, Green, " +
          "HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
        MessageError,
        "Bad response message: @msg-id=turbo_only_color :tmi.twitch.tv " +
          "NOTICE #justinfan12345 :Only turbo users can specify an arbitrary " +
          "hex color. Use one of the following instead: Blue, BlueViolet, " +
          "CadetBlue, Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, " +
          "Green, HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen."
      );
    });

    it("should be rejected on incoming bad NOTICE (type 2)", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = setColor(client, { r: 255, g: 0, b: 1 });

      emitAndEnd(
        "@msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla"
      );

      await assertErrorChain(
        promise,
        SetColorError,
        "Failed to set color to #ff0001: Bad response message:" +
          " @msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
        MessageError,
        "Bad response message: @msg-id=usage_color " +
          ":tmi.twitch.tv NOTICE #justinfan12345 :bla bla"
      );

      await assertErrorChain(
        clientError,
        SetColorError,
        "Failed to set color to #ff0001: Bad response message:" +
          " @msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
        MessageError,
        "Bad response message: " +
          "@msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla"
      );
    });

    it("should resolve on good NOTICE", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = setColor(client, { r: 255, g: 0, b: 1 });

      emitAndEnd(
        "@msg-id=color_changed :tmi.twitch.tv NOTICE " +
          "#justinfan12345 :Your color has been changed."
      );

      await promise;
      await clientError;
    });
  });
});
