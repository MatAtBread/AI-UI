export type DeferredPromise<T> = Promise<T> & {
    resolve?: (value: T | PromiseLike<T>) => void;
    reject?: (value: any) => void;
};
export declare function deferred<T>(): DeferredPromise<T>;
