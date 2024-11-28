import { DEBUG, console } from "./debug.js";
// Create a deferred Promise, which can be asynchronously/externally resolved or rejected.
const debugId = Symbol("deferredPromiseID");
// Used to suppress TS error about use before initialisation
const nothing = (v) => { };
let id = 1;
export function deferred() {
    let resolve = nothing;
    let reject = nothing;
    const promise = new Promise((...r) => [resolve, reject] = r);
    promise.resolve = resolve;
    promise.reject = reject;
    promise[debugId] = id++;
    if (DEBUG) {
        const initLocation = new Error().stack;
        promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? console.log("Deferred rejection", ex, "allocated at ", initLocation) : undefined);
    }
    return promise;
}
// True if `expr in x` is valid
export function isObjectLike(x) {
    return x && typeof x === 'object' || typeof x === 'function';
}
export function isPromiseLike(x) {
    return isObjectLike(x) && ('then' in x) && typeof x.then === 'function';
}
