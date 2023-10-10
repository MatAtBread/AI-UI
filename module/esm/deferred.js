export function deferred() {
    let resolve;
    let reject;
    let promise = new Promise((...r) => { [resolve, reject] = r; });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}
