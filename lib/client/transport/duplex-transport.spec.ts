import { assert } from "chai";
import * as sinon from "sinon";
import { Duplex } from "stream";
import { ExpandedDuplexTransportConfiguration } from "../../config/expanded";
import { DuplexTransport } from "./duplex-transport";

describe("./client/transport/duplex-transport", function () {
  describe("DuplexTransport", function () {
    it("should call the stream-getter function from the config once", function () {
      const stream = new Duplex();

      const streamGetter = sinon.fake.returns(stream);
      const config: ExpandedDuplexTransportConfiguration = {
        type: "duplex",
        stream: streamGetter,
        preSetup: false,
      };

      const transport = new DuplexTransport(config);

      assert.strictEqual(streamGetter.callCount, 1);
      assert.strictEqual(transport.stream, stream);
    });
  });
});
