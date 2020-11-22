import { assert } from "chai";
import {
  applyReplacement,
  applyReplacements,
} from "./apply-function-replacements";

// tslint:disable:max-classes-per-file

describe("./utils/apply-function-replacements", function () {
  describe("#applyReplacement", function () {
    it("should delegate execution properly", function () {
      const self = {
        abc: "def",
      };

      class Target {
        public something = "KKona";

        public a(one: string, two: string, three: string): string {
          // test for the "this" reference in this class
          return this.something + one + two + three;
        }
      }

      const target = new Target();

      applyReplacement(
        self,
        target,
        "a",
        function a(
          originalFn,
          one: string,
          two: string,
          three: string
        ): string {
          // test for the "this" reference in the replacement function
          return originalFn(one, two, three) + this.abc;
        }
      );

      assert.strictEqual(target.a("1", "2", "3"), "KKona123def");
    });

    it("should not create a enumerable property on the target object", function () {
      const self = {};
      class Target {
        public a(): string {
          return "a";
        }
      }

      const target = new Target();
      assert.deepStrictEqual(Object.keys(target), []);

      applyReplacement(self, target, "a", function a(originalFn): string {
        return originalFn();
      });

      assert.deepStrictEqual(Object.keys(target), []);
    });
  });

  describe("#applyReplacements()", function () {
    it("should apply all replacements given in functions map", function () {
      const self = {
        abc: "def",
      };

      class Target {
        public a(): string {
          return "a";
        }
        public b(): string {
          return "b";
        }
        public c(): string {
          return "c";
        }
      }

      const target = new Target();

      applyReplacements(self, target, {
        a(originalFn) {
          return originalFn() + "x";
        },
        b(originalFn) {
          return originalFn() + "y";
        },
        c(originalFn) {
          return originalFn() + "z";
        },
      });

      assert.strictEqual(target.a(), "ax");
      assert.strictEqual(target.b(), "by");
      assert.strictEqual(target.c(), "cz");
    });
  });
});
