import { DEBUG, console } from "./debug.js";
// Used to suppress TS error about use before initialisation
const nothing = (v) => { };
export function deferred() {
    let resolve = nothing;
    let reject = nothing;
    const promise = new Promise((...r) => [resolve, reject] = r);
    promise.resolve = resolve;
    promise.reject = reject;
    if (DEBUG) {
        const initLocation = new Error().stack;
        promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? console.log("Deferred rejection", ex, "allocated at ", initLocation) : undefined);
    }
    return promise;
}
export function isPromiseLike(x) {
    return x !== null && x !== undefined && typeof x.then === 'function';
}
