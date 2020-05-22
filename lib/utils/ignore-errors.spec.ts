import { assert } from "chai";
import { ignoreErrors } from "./ignore-errors";

describe("./utils/ignore-errors", function () {
  describe("#ignoreErrors()", function () {
    it("should ignore errors as the first argument and return undefined", function () {
      // @ts-ignore more arguments than expected
      assert.isUndefined(ignoreErrors(new Error("something bad")));
    });
    it("should return undefined with no arguments", function () {
      assert.isUndefined(ignoreErrors());
    });
    it("should make a rejected promise return undefined if used as catch handler", async function () {
      const promise = Promise.reject(new Error("something bad"));
      assert.isUndefined(await promise.catch(ignoreErrors));
    });
    it("should not alter a resolved promise if used as catch handler", async function () {
      const promise = Promise.resolve("something good");
      assert.strictEqual(await promise.catch(ignoreErrors), "something good");
    });
  });
});
