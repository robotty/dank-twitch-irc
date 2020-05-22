import { assert } from "chai";
import * as sinon from "sinon";
import { EditableTimeout } from "./editable-timeout";

describe("./utils/editable-timeout", function () {
  describe("EditableTimeout", function () {
    beforeEach(function () {
      // initialize the time to be 5000 milliseconds after
      // UTC epoch
      sinon.useFakeTimers(5000);
    });

    it("should capture run time and current time at creation", function () {
      // tslint:disable-next-line:no-empty
      const timeout = new EditableTimeout(() => {}, 1234);
      assert.strictEqual(timeout.startTime, 5000);
      assert.strictEqual(timeout.runTime, 1234);
    });

    it("should run the callback after `runTime` if not edited", function () {
      let wasHit = false;
      const timeout = new EditableTimeout(() => {
        wasHit = true;
      }, 1234);

      sinon.clock.tick(1233);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      sinon.clock.tick(1);
      assert.isTrue(wasHit);
      assert.isTrue(timeout.completed);
    });

    it("should be stoppable", function () {
      let wasHit = false;
      const timeout = new EditableTimeout(() => {
        wasHit = true;
      }, 1234);

      sinon.clock.tick(1233);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      timeout.stop();
      sinon.clock.tick(1);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      sinon.clock.tick(1000000);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);
    });

    it("should do nothing if stop is called after timeout is completed", function () {
      let wasHit = false;
      const timeout = new EditableTimeout(() => {
        wasHit = true;
      }, 1234);

      sinon.clock.tick(1234);
      assert.isTrue(wasHit);
      assert.isTrue(timeout.completed);

      timeout.stop();
      assert.isTrue(wasHit);
      assert.isTrue(timeout.completed);
    });

    it("should be possible to update the remaining run time", function () {
      let wasHit = false;
      const timeout = new EditableTimeout(() => {
        wasHit = true;
      }, 2000);

      sinon.clock.tick(1000);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      timeout.update(1500);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      sinon.clock.tick(499);
      assert.isFalse(wasHit);
      assert.isFalse(timeout.completed);

      sinon.clock.tick(1);
      assert.isTrue(wasHit);
      assert.isTrue(timeout.completed);
    });

    it("should do nothing if update is called after timeout is completed", function () {
      let hitCount = 0;
      const timeout = new EditableTimeout(() => {
        hitCount += 1;
      }, 1000);

      sinon.clock.tick(999);
      assert.strictEqual(hitCount, 0);
      assert.isFalse(timeout.completed);

      sinon.clock.tick(1);
      assert.strictEqual(hitCount, 1);
      assert.isTrue(timeout.completed);

      timeout.update(2000);
      assert.strictEqual(hitCount, 1);
      assert.isTrue(timeout.completed);

      sinon.clock.tick(1000);
      assert.strictEqual(hitCount, 1);
      assert.isTrue(timeout.completed);
    });
  });
});
