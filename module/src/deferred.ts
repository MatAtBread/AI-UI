import { DEBUG, console } from "./debug.js";

// Create a deferred Promise, which can be asynchronously/externally resolved or rejected.
export type DeferredPromise<T> = Promise<T> & {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (value: any) => void;
}

// Used to suppress TS error about use before initialisation
const nothing = (v: any)=>{};

export function deferred<T>(): DeferredPromise<T> {
  let resolve: (value: T | PromiseLike<T>) => void = nothing;
  let reject: (value: any) => void = nothing;
  const promise = new Promise<T>((...r) => [resolve, reject] = r) as DeferredPromise<T>;
  promise.resolve = resolve;
  promise.reject = reject;
  if (DEBUG) {
    const initLocation = new Error().stack;
    promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? console.log("Deferred rejection", ex, "allocated at ", initLocation) : undefined);
  }
  return promise;
}

// True if `expr in x` is valid
export function isObjectLike(x: any): x is Function | {} {
  return x && typeof x === 'object' || typeof x === 'function'
}

export function isPromiseLike<T>(x: any): x is PromiseLike<T> {
  return isObjectLike(x) && ('then' in x) && typeof x.then === 'function';
}
