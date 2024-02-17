export type QueueIteratableIterator<T> = AsyncIterableIterator<T> & {
    push(value: T): boolean;
};
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
export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
export declare function asyncIterator<T>(o: AsyncProvider<T>): AsyncIterator<T, any, undefined>;
type AsyncIterableHelpers = typeof asyncExtras;
export declare const asyncExtras: {
    map: <U, R>(this: Partial<AsyncIterable<U>>, ...args: ((o: U) => R | PromiseLike<R>)[]) => AsyncIterable<Awaited<R>> & AsyncExtraIterable<Awaited<R>>;
    filter: <U_1>(this: Partial<AsyncIterable<U_1>>, fn: (o: U_1) => boolean | PromiseLike<boolean>) => AsyncIterable<U_1> & AsyncExtraIterable<U_1>;
    unique: <U_2>(this: Partial<AsyncIterable<U_2>>, fn?: ((next: U_2, prev: U_2) => boolean | PromiseLike<boolean>) | undefined) => AsyncIterable<U_2> & AsyncExtraIterable<U_2>;
    throttle: <U_3>(this: Partial<AsyncIterable<U_3>>, milliseconds: number) => AsyncIterable<U_3> & AsyncExtraIterable<U_3>;
    debounce: <U_4>(this: Partial<AsyncIterable<U_4>>, milliseconds: number) => AsyncIterable<U_4> & AsyncExtraIterable<U_4>;
    waitFor: <U_5>(this: Partial<AsyncIterable<U_5>>, cb: (done: (value: void | PromiseLike<void>) => void) => void) => AsyncIterable<U_5> & AsyncExtraIterable<U_5>;
    count: <U_6 extends {}, K extends string>(this: Partial<AsyncIterable<U_6>>, field: K) => AsyncGenerator<Awaited<U_6> & {
        [x: string]: number;
    }, IteratorResult<U_6, any> | undefined, unknown> & AsyncExtraIterable<Awaited<U_6> & {
        [x: string]: number;
    }>;
    retain: <U_7 extends {}>(this: Partial<AsyncIterable<U_7>>) => AsyncIterableIterator<U_7> & {
        value: U_7;
        done: boolean;
    } & AsyncExtraIterable<U_7>;
    multi: <T>(this: Partial<AsyncIterable<T>>) => AsyncIterableIterator<T> & AsyncExtraIterable<T>;
    broadcast: <U_8>(this: Partial<AsyncIterable<U_8>>) => AsyncIterable<U_8> & AsyncExtraIterable<U_8>;
    initially: <U_9, I = U_9>(this: Partial<AsyncIterable<U_9>>, initValue: I) => AsyncIterable<U_9 | I> & AsyncExtraIterable<U_9 | I>;
    consume: typeof consume;
    merge<T_1, A extends Partial<AsyncIterable<any>>[]>(this: Partial<AsyncIterable<T_1>>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T_1>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T_1>>, ...A][number]>>;
};
export declare function pushIterator<T>(stop?: () => void, bufferWhenNoConsumers?: boolean): PushIterator<T>;
export declare function broadcastIterator<T>(stop?: () => void): BroadcastIterator<T>;
export declare function defineIterableProperty<T extends {}, N extends string | number | symbol, V>(obj: T, name: N, v: V): T & {
    [n in N]: V & AsyncExtraIterable<V>;
};
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;
export declare const merge: <A extends Partial<AsyncIterable<any>>[]>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never);
export declare function generatorHelpers<G extends (...args: A) => AsyncGenerator, A extends any[]>(g: G): (...args: Parameters<G>) => ReturnType<G> & (ReturnType<G> extends AsyncGenerator<infer Y> ? AsyncExtraIterable<Y> : never);
declare function consume<U>(this: Partial<AsyncIterable<U>>, f?: (u: U) => void | PromiseLike<void>): Promise<void>;
export {};
