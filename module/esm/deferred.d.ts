export type DeferredPromise<T> = Promise<T> & {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (value: any) => void;
};
export declare function deferred<T>(): DeferredPromise<T>;
export declare function isObjectLike(x: any): x is Function | {};
export declare function isPromiseLike<T>(x: any): x is PromiseLike<T>;
