import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { joinNothingToDo } from "./join";
import { partChannel, PartError, partNothingToDo } from "./part";

describe("./operations/part", function () {
  describe("#partNothingToDo()", function () {
    it("should be true if channel is not joined or wanted", function () {
      // channel is not joined and is not wanted either
      // (e.g. no join in progress)
      const { client } = fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();

      assert.isTrue(partNothingToDo(client, "pajlada"));
    });

    it("should be false if channel is joined but not wanted", function () {
      // e.g. previous PART command failed, and channel remained joined
      // but not wanted.
      const { client } = fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();
      client.joinedChannels.add("pajlada");

      assert.isFalse(partNothingToDo(client, "pajlada"));
    });

    it("should be false if channel is not joined but wanted", function () {
      // e.g. JOIN is currently in progress and we want to part already
      // again

      const { client } = fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assert.isFalse(partNothingToDo(client, "pajlada"));
    });

    it("should be false if channel is joined and wanted", function () {
      // normal situation where channel is joined and wanted and must be
      // parted.
      const { client } = fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assert.isFalse(joinNothingToDo(client, "pajlada"));
    });
  });

  describe("#partChannel()", function () {
    it("should send the correct wire command", function () {
      sinon.useFakeTimers();

      const { client, data } = fakeConnection();
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      partChannel(client, "pajlada");

      assert.deepStrictEqual(data, ["PART #pajlada\r\n"]);
    });

    it("should do nothing if channel is neither wanted nor joined", async function () {
      const { client, data } = fakeConnection();

      await partChannel(client, "pajlada");

      assert.deepStrictEqual(data, []);
    });

    it("should remove channel from wanted channels even on timeout error", async function () {
      sinon.useFakeTimers();

      const { client, clientError } = fakeConnection();
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      const promise = partChannel(client, "pajlada");

      sinon.clock.tick(2000);

      await assertErrorChain(
        promise,
        PartError,
        "Failed to part channel pajlada: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        PartError,
        "Failed to part channel pajlada: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      assert.sameMembers([...client.joinedChannels], ["pajlada"]);
      assert.sameMembers([...client.wantedChannels], []);
    });

    it("should remove channel from joined and wanted channels on success", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      const promise = partChannel(client, "pajlada");

      emitAndEnd(
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv PART #pajlada"
      );

      await promise;

      assert.sameMembers([...client.joinedChannels], []);
      assert.sameMembers([...client.wantedChannels], []);

      await clientError;
    });
  });
});
