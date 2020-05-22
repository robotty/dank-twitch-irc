import { assert } from "chai";
import { BaseError } from "make-error-cause";
import { anyCauseInstanceof, causeOf } from "./any-cause-instanceof";

describe("./utils/any-cause-instanceof", function () {
  describe("#causeOf()", function () {
    it("returns undefined on Error", function () {
      assert.isUndefined(causeOf(new Error()));
    });

    it("returns the cause on BaseErrors", function () {
      // given
      const cause = new Error("cause");
      const error = new BaseError("error", cause);

      // when
      const gottenCause = causeOf(error);

      // then
      assert.strictEqual(gottenCause, cause);
    });

    it("ignores #cause property on non-BaseErrors", function () {
      // given
      const error = new Error("error");
      // @ts-ignore
      error.cause = "cause string";

      // when
      const gottenCause = causeOf(error);

      // then
      assert.isUndefined(gottenCause);
    });
  });

  describe("#anyCauseInstanceof()", function () {
    // tslint:disable:max-classes-per-file
    class TestErrorA extends BaseError {}

    class TestErrorB extends BaseError {}

    class TestErrorC extends BaseError {}

    it("returns false on undefined input", function () {
      assert.isFalse(anyCauseInstanceof(undefined, Error));
      assert.isFalse(anyCauseInstanceof(undefined, TestErrorA));
    });

    it("works on errors without a cause field", function () {
      const error = Error("E");

      assert.isTrue(anyCauseInstanceof(error, Error));
      assert.isFalse(anyCauseInstanceof(error, TestErrorA));
      assert.isFalse(anyCauseInstanceof(error, TestErrorB));
      assert.isFalse(anyCauseInstanceof(error, TestErrorC));
    });

    it("level 0", function () {
      const errorA = new TestErrorA("A");

      // validate that the function finds the error at level 0 (top-level/the error that was passed)
      assert.isTrue(anyCauseInstanceof(errorA, Error));
      assert.isTrue(anyCauseInstanceof(errorA, TestErrorA));
      assert.isFalse(anyCauseInstanceof(errorA, TestErrorB));
      assert.isFalse(anyCauseInstanceof(errorA, TestErrorC));
    });

    it("level 1", function () {
      const errorA = new TestErrorA("A");
      const errorB = new TestErrorB("B", errorA);

      // validate that the function finds the error at level 1
      assert.isTrue(anyCauseInstanceof(errorB, Error));
      assert.isTrue(anyCauseInstanceof(errorB, TestErrorA));
      assert.isTrue(anyCauseInstanceof(errorB, TestErrorB));
      assert.isFalse(anyCauseInstanceof(errorB, TestErrorC));
    });

    it("level 2", function () {
      const errorA = new TestErrorA("A");
      const errorB = new TestErrorB("B", errorA);
      const errorC = new TestErrorC("C", errorB);

      // validate that the function finds the error at level 2
      assert.isTrue(anyCauseInstanceof(errorC, Error));
      assert.isTrue(anyCauseInstanceof(errorC, BaseError));
      assert.isTrue(anyCauseInstanceof(errorC, TestErrorA));
      assert.isTrue(anyCauseInstanceof(errorC, TestErrorB));
      assert.isTrue(anyCauseInstanceof(errorC, TestErrorC));
    });
  });
});
