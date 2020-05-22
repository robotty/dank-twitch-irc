import { assert } from "chai";
import * as sinon from "sinon";
import { ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { parseTwitchMessage } from "../message/parser/twitch-message";
import { BaseError } from "../utils/base-error";
import { ignoreErrors } from "../utils/ignore-errors";
import { awaitResponse, ResponseAwaiter } from "./await-response";
import { TimeoutError } from "./timeout-error";

describe("./await/await-response", function () {
  describe("ResponseAwaiter", function () {
    it("should add itself to list of waiters", function () {
      const { client, end } = fakeConnection();

      const awaiter1 = new ResponseAwaiter(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter 1 failure",
      });
      awaiter1.promise.catch(ignoreErrors);

      const awaiter2 = new ResponseAwaiter(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter 2 failure",
      });
      awaiter2.promise.catch(ignoreErrors);

      assert.deepStrictEqual(client.pendingResponses, [awaiter1, awaiter2]);

      end();
    });

    it("should resolve on matching incoming message", async function () {
      const { client, end } = fakeConnection();

      const wantedMsg = parseTwitchMessage("PONG :tmi.twitch.tv");

      const promise = awaitResponse(client, {
        success: (msg) => msg === wantedMsg,
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
      });

      client.emitMessage(wantedMsg);

      end();

      assert.strictEqual(await promise, wantedMsg);
      assert.deepStrictEqual(client.pendingResponses, []);
    });

    it("should reject on matching incoming message", async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const wantedMsg = "PONG :tmi.twitch.tv";

      const promise = awaitResponse(client, {
        failure: (msg) => msg.rawSource === wantedMsg,
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
      });

      emitAndEnd(wantedMsg);

      await assertErrorChain(
        promise,
        BaseError,
        "test awaiter failure: Bad response message: PONG :tmi.twitch.tv",
        MessageError,
        "Bad response message: PONG :tmi.twitch.tv"
      );
      assert.deepStrictEqual(client.pendingResponses, []);

      await assertErrorChain(
        clientError,
        BaseError,
        "test awaiter failure: Bad response message: PONG :tmi.twitch.tv",
        MessageError,
        "Bad response message: PONG :tmi.twitch.tv"
      );
    });

    it("should reject on connection close (no error)", async function () {
      const { client, end, clientError } = fakeConnection();

      const promise = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
      });

      end();

      const clientErrorAfterClose = new Promise((resolve, reject) => {
        client.once("error", reject);
      });

      await assertErrorChain(
        [promise, clientErrorAfterClose],
        BaseError,
        "test awaiter failure: Connection closed with no error",
        ConnectionError,
        "Connection closed with no error"
      );

      // the client is closed so the error occurring after close is not
      // emitted -> clientError is resolved because on("close") happens
      // before our ResponseAwaiter emits the error
      await clientError;
    });

    it("should reject on connection close (with error)", async function () {
      const { client, end, clientError } = fakeConnection();

      const promise = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
      });

      end(new Error("peer reset connection"));

      // TODO create a utility to await error no #N on arbitrary EventEmitter
      const clientErrorAfterClose = new Promise((resolve, reject) => {
        let counter = 0;
        const target = 1;
        client.on("error", (e) => {
          if (counter++ === target) {
            reject(e);
          }
        });
      });

      await assertErrorChain(
        promise,
        BaseError,
        "test awaiter failure: Connection closed due to error: Error occurred in transport layer: peer reset connection",
        ConnectionError,
        "Connection closed due to error: Error occurred in transport layer: peer reset connection",
        ConnectionError,
        "Error occurred in transport layer: peer reset connection",
        Error,
        "peer reset connection"
      );

      await assertErrorChain(
        clientError,
        ConnectionError,
        "Error occurred in transport layer: peer reset connection",
        Error,
        "peer reset connection"
      );

      await assertErrorChain(
        clientErrorAfterClose,
        BaseError,
        "test awaiter failure: Connection closed due to error: Error occurred in transport layer: peer reset connection",
        ConnectionError,
        "Connection closed due to error: Error occurred in transport layer: peer reset connection",
        ConnectionError,
        "Error occurred in transport layer: peer reset connection",
        Error,
        "peer reset connection"
      );
    });

    it("should timeout after specified timeout (noResponseAction = failure)", async function () {
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      // awaiter is going to be the only awaiter in the queue so
      // it starts the timeout
      // awaiters should wait until they are at the head of the queue
      // to start their timeout
      const promise = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
        timeout: 3000,
      });

      sinon.clock.tick(3000);

      await assertErrorChain(
        [promise, clientError],
        BaseError,
        "test awaiter failure: Timed out after waiting for response for 3000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 3000 milliseconds"
      );
    });

    it("should timeout after specified timeout (noResponseAction = success)", async function () {
      sinon.useFakeTimers();
      const { client, clientError, end } = fakeConnection();

      // awaiter is going to be the only awaiter in the queue so
      // it starts the timeout
      // awaiters should wait until they are at the head of the queue
      // to start their timeout
      const promise = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter failure",
        timeout: 3000,
        noResponseAction: "success",
      });

      sinon.clock.tick(3000);
      end();

      await Promise.all([promise, clientError]);
    });

    it("should begin timeout only once awaiter is moved to head of queue", async function () {
      sinon.useFakeTimers();
      const { client, clientError } = fakeConnection();

      const promise1 = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter1 failure",
        timeout: 1000,
      });

      const promise2 = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter2 failure",
        timeout: 1000,
      });

      sinon.clock.tick(1000);

      await assertErrorChain(
        [promise1, clientError],
        BaseError,
        "test awaiter1 failure: Timed out after waiting for response for 1000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 1000 milliseconds"
      );

      sinon.clock.tick(1000);

      await assertErrorChain(
        promise2,
        BaseError,
        "test awaiter2 failure: Timed out after waiting for response for 1000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 1000 milliseconds"
      );
    });

    it("should notify other awaiters that they are outpaced", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();

      const promise1 = awaitResponse(client, {
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter1 failure",
      });
      const expectedMsg = "PONG :tmi.twitch.tv";

      const promise2 = awaitResponse(client, {
        success: (msg) => msg.rawSource === expectedMsg,
        errorType: (message, cause) => new BaseError(message, cause),
        errorMessage: "test awaiter2 failure",
      });

      // awaiter2 will resolve -> awaiter1 will be rejected because it was
      // outpaced

      emitAndEnd(expectedMsg);

      await assertErrorChain(
        [promise1, clientError],
        BaseError,
        "test awaiter1 failure: A response to a command issued later than this command was received",
        TimeoutError,
        "A response to a command issued later than this command was received"
      );

      const matchedMsg = await promise2;
      assert.strictEqual(matchedMsg.rawSource, expectedMsg);
    });
  });
});
