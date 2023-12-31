export type PushIterator<T> = AsyncExtraIterable<T> & {
    push(value: T): boolean;
    close(ex?: Error): void;
};
export type BroadcastIterator<T> = PushIterator<T>;
export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {
}
export declare function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T>;
export declare function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T>;
export declare function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T>;
type AsyncIterableHelpers = typeof asyncExtras;
export declare const asyncExtras: {
    map: <U, R>(this: AsyncIterable<U>, mapper: (o: U) => R | PromiseLike<R>) => AsyncIterable<Awaited<R>> & AsyncExtraIterable<Awaited<R>>;
    filter: <U_1>(this: AsyncIterable<U_1>, fn: (o: U_1) => boolean | PromiseLike<boolean>) => AsyncIterable<U_1> & AsyncExtraIterable<U_1>;
    throttle: <U_2>(this: AsyncIterable<U_2>, milliseconds: number) => AsyncIterable<U_2> & AsyncExtraIterable<U_2>;
    debounce: <U_3>(this: AsyncIterable<U_3>, milliseconds: number) => AsyncIterable<U_3> & AsyncExtraIterable<U_3>;
    waitFor: <U_4>(this: AsyncIterable<U_4>, cb: (done: (value: void | PromiseLike<void>) => void) => void) => AsyncIterable<U_4> & AsyncExtraIterable<U_4>;
    count: <U_5 extends {}, K extends string>(this: AsyncIterable<U_5>, field: K) => AsyncGenerator<Awaited<U_5> & {
        [x: string]: number;
    }, void, unknown> & AsyncExtraIterable<Awaited<U_5> & {
        [x: string]: number;
    }>;
    retain: <U_6 extends {}>(this: AsyncIterable<U_6>) => AsyncIterableIterator<U_6> & {
        value: U_6;
        done: boolean;
    } & AsyncExtraIterable<U_6>;
    broadcast: <U_7, X>(this: AsyncIterable<U_7>, pipe?: ((dest: AsyncIterable<U_7>) => AsyncIterable<X>) | undefined) => AsyncIterable<X> & AsyncExtraIterable<X>;
    initially: <U_8, I = U_8>(this: AsyncIterable<U_8>, initValue: I) => AsyncIterable<U_8 | I> & AsyncExtraIterable<U_8 | I>;
    consume: typeof consume;
};
export declare function pushIterator<T>(stop?: () => void, bufferWhenNoConsumers?: boolean): PushIterator<T>;
export declare function broadcastIterator<T>(stop?: () => void): BroadcastIterator<T>;
type CollapseIterableType<T> = T[] extends AsyncIterable<infer U>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;
export declare const merge: <A extends AsyncIterable<any>[]>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never);
export declare function generatorHelpers<G extends (...args: A) => AsyncGenerator<G1, G2, G3>, A extends any[], G1, G2, G3>(g: G): (...args: A) => AsyncGenerator<G1, G2, G3> & AsyncExtraIterable<G1>;
declare function consume<U>(this: AsyncIterable<U>, f?: (u: U) => void | PromiseLike<void>): Promise<void>;
export {};
