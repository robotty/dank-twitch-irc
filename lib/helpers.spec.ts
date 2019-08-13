import * as chai from "chai";
import { assert } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "clarify";
import { BaseError } from "make-error-cause";
import * as sinon from "sinon";
import { DuplexMock } from "stream-mock";
import { inspect } from "util";
import * as util from "util";
import { SingleConnection } from "./client/connection";

chai.config.includeStack = true;
chai.use(chaiAsPromised);

afterEach(function() {
  sinon.restore();
});

export function errorOf(p: Promise<any>): Promise<any> {
  return p.catch(e => e);
}

export async function causeOf(p: Promise<any>): Promise<any> {
  return (await errorOf(p)).cause;
}

function assertLink(e: Error, chain: any[], depth: number = 0): void {
  const [errorType, message, ...newChain] = chain;

  const actualPrototype = Object.getPrototypeOf(e);
  const expectedPrototype = errorType.prototype;
  assert.strictEqual(
    actualPrototype,
    expectedPrototype,
    `Error at depth ${depth} should be directly instanceof ` +
      `${util.inspect(expectedPrototype)}, ` +
      `is instance of: ${util.inspect(actualPrototype)}`
  );

  assert.strictEqual(
    e.message,
    message,
    `Error at depth ${depth} should have error message "${message}"`
  );

  // @ts-ignore e.cause is unknown to the compiler
  const cause: Error | undefined = e.cause;
  if (newChain.length > 0) {
    assert("cause" in e, `Error at depth ${depth} should have a cause`);
    assert(cause != null, `Error at depth ${depth} should have a cause`);

    assertLink(cause!, newChain, depth + 1);
  } else {
    assert(
      cause == null,
      `Error at depth ${depth} should not have a cause, ` +
        `but has the following cause: ${inspect(cause)}`
    );
  }
}

export function assertErrorChain(
  p: Promise<any>,
  ...chain: any[]
): Promise<void>;
export function assertErrorChain(e: Error | undefined, ...chain: any[]): void;

export function assertErrorChain(
  e: Promise<any> | Error | undefined,
  ...chain: any[]
): Promise<void> | void {
  if (e instanceof Error || e == null) {
    assert(e != null, "Error must be non-null");
    assertLink(e!, chain);
  } else {
    return (async () => {
      await assert.isRejected(e);
      const error: BaseError = await errorOf(e);
      assertLink(error, chain);
    })();
  }
}

export function assertThrowsChain(f: () => void, ...chain: any[]): void {
  try {
    f();
  } catch (e) {
    assertErrorChain(e as Error, ...chain);
    return;
  }

  assert.fail("Function did not throw an exception");
}

export function fakeConnection(): {
  transport: DuplexMock;
  emit: (...lines: string[]) => void;
  end: () => void;
  emitAndEnd: (...lines: string[]) => void;
  client: SingleConnection;
  clientError: Promise<never>;
} {
  // don't start sending pings
  sinon.stub(SingleConnection.prototype, "onConnect");

  const transport = new DuplexMock(undefined, {
    objectMode: true
  });
  const fakeConn = new SingleConnection({
    connection: {
      type: "duplex",
      stream: () => transport,
      preSetup: true
    }
  });

  fakeConn.connect();

  transport.data = [];
  transport.flatData = [];

  const emit = (...lines: string[]): void => {
    transport.emit("data", lines.map(line => line + "\r\n").join(""));
  };

  const end = (): void => {
    transport.emit("close", false);
  };

  const emitAndEnd = (...lines: string[]): void => {
    emit(...lines);
    setImmediate(end);
  };

  return {
    transport,
    client: fakeConn,
    emit,
    end,
    emitAndEnd,
    clientError: new Promise<never>((resolve, reject) => {
      fakeConn.once("error", e => reject(e));
      fakeConn.once("close", () => resolve());
    })
  };
}
