// Create a deferred Promise, which can be asynchronously/externally resolved or rejected.
export type DeferredPromise<T> = Promise<T> & { 
  resolve?: (value: T | PromiseLike<T>) => void; 
  reject?: (value: any) => void; 
}

export function deferred<T>(): DeferredPromise<T> {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (value: any) => void;
  let promise = new Promise<T>((...r) => { [resolve, reject] = r; }) as (Promise<T> & {
    resolve?: (value: T | PromiseLike<T>) => void;
    reject?: (value: any) => void;
  });
  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}
