import { A } from "ts-toolbelt";

// modified O.SelectKeys type from ts-toolbelt that uses keyof O
// instead of Keys<O>
export declare type SelectKeys<O extends object, M extends any> = {
  [K in keyof O]: {
    1: K;
    0: never;
  }[A.Is<O[K], M>];
}[keyof O];

export type FunctionKeysOf<T extends object> = SelectKeys<
  T,
  (...args: any) => any
>;

export type FunctionAt<T extends object, K extends FunctionKeysOf<T>> = (
  ...args: Parameters<T[K]>
) => ReturnType<T[K]>;

export type OverrideFunction<
  S,
  T extends object,
  K extends FunctionKeysOf<T>
> = (
  this: S,
  oldFn: FunctionAt<T, K>,
  ...args: Parameters<T[K]>
) => ReturnType<T[K]>;

export function applyReplacement<
  S,
  T extends object,
  K extends FunctionKeysOf<T>
>(self: S, target: T, key: K, newFn: OverrideFunction<S, T, K>): void {
  const oldFn: FunctionAt<T, K> = Reflect.get(target, key);

  // build a new replacement function that is called instead of
  // the original function
  // it then purely delegates to "newFn", except the first parameter
  // is additionally the old function.
  function replacementFn(
    this: T,
    ...args: Parameters<typeof oldFn>
  ): ReturnType<typeof oldFn> {
    // @ts-ignore complains that `args` does not have a '[Symbol.iterator]()' method that returns an iterator
    return newFn.call(self, oldFn.bind(this), ...args);
  }

  // define the new fn as not enumerable
  Object.defineProperty(target, key, {
    value: replacementFn,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export type OverrideFunctions<S, T extends object> = {
  [K in FunctionKeysOf<T>]?: OverrideFunction<S, T, K>;
};

export function applyReplacements<S, T extends object>(
  self: S,
  target: T,
  replacements: OverrideFunctions<S, T>
): void {
  for (const [key, newFn] of Object.entries(replacements)) {
    applyReplacement(self, target, key as any, newFn as any);
  }
}
