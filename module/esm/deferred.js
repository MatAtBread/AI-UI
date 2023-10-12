// Used to suppress TS error about use before initialisation
const nothing = (v) => { };
export function deferred() {
    let resolve = nothing;
    let reject = nothing;
    const promise = new Promise((...r) => [resolve, reject] = r);
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}
export function isPromiseLike(x) {
    return x !== null && x !== undefined && typeof x.then === 'function';
}
