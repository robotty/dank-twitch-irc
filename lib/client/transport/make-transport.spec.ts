import { assert } from "chai";
import { Duplex } from "stream";
import {
  ExpandedDuplexTransportConfiguration,
  ExpandedTcpTransportConfiguration,
  ExpandedWebSocketTransportConfiguration,
} from "../../config/expanded";
import { DuplexTransport } from "./duplex-transport";
import { makeTransport } from "./make-transport";
import { TcpTransport } from "./tcp-transport";
import { WebSocketTransport } from "./websocket-transport";

describe("./client/transport/make-transport", function () {
  describe("#makeTransport()", function () {
    it("should make a TcpTransport for tcp configurations", function () {
      const config: ExpandedTcpTransportConfiguration = {
        type: "tcp",
        secure: true,
        host: "irc.chat.twitch.tv",
        port: 6697,
        preSetup: false,
      };

      const transport = makeTransport(config);

      assert.instanceOf(transport, TcpTransport);
    });

    it("should make a DuplexTransport for duplex configurations", function () {
      const config: ExpandedDuplexTransportConfiguration = {
        type: "duplex",
        stream: () => new Duplex(),
        preSetup: false,
      };

      const transport = makeTransport(config);

      assert.instanceOf(transport, DuplexTransport);
    });

    it("should make a WebSocketTransport for websocket configurations", function () {
      const config: ExpandedWebSocketTransportConfiguration = {
        type: "websocket",
        url: "wss://irc-ws.chat.twitch.tv",
        preSetup: false,
      };

      const transport = makeTransport(config);

      assert.instanceOf(transport, WebSocketTransport);
    });

    it("should throw an error on unknown transport type", function () {
      // @ts-ignore override typescript correcting us
      assert.throws(() => makeTransport({ type: "invalid" }), Error);
    });
  });
});
