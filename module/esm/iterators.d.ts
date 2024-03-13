import { IterableProperties } from "./tags.js";
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
    map: <U, R>(this: Partial<AsyncIterable<U>>, mapper: Mapper<U, R>) => AsyncIterableIterator<R> & AsyncExtraIterable<R>;
    filter: <U_1>(this: Partial<AsyncIterable<U_1>>, fn: (o: U_1) => boolean | PromiseLike<boolean>) => AsyncIterableIterator<U_1> & AsyncExtraIterable<U_1>;
    unique: <U_2>(this: Partial<AsyncIterable<U_2>>, fn?: ((next: U_2, prev: U_2) => boolean | PromiseLike<boolean>) | undefined) => AsyncIterableIterator<U_2> & AsyncExtraIterable<U_2>;
    waitFor: <U_3>(this: Partial<AsyncIterable<U_3>>, cb: (done: (value: void | PromiseLike<void>) => void) => void) => AsyncIterableIterator<U_3> & AsyncExtraIterable<U_3>;
    multi: <T>(this: Partial<AsyncIterable<T>>) => AsyncIterableIterator<T> & AsyncExtraIterable<T>;
    broadcast: <U_4>(this: Partial<AsyncIterable<U_4>>) => AsyncIterable<U_4> & AsyncExtraIterable<U_4>;
    initially: <U_5, I = U_5>(this: Partial<AsyncIterable<U_5>>, initValue: I) => AsyncIterable<U_5 | I> & AsyncExtraIterable<U_5 | I>;
    consume: typeof consume;
    merge<T_1, A extends Partial<AsyncIterable<any>>[]>(this: Partial<AsyncIterable<T_1>>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T_1>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T_1>>, ...A][number]>>;
};
export declare function queueIteratableIterator<T>(stop?: () => void): QueueIteratableIterator<T>;
export declare function pushIterator<T>(stop?: () => void, bufferWhenNoConsumers?: boolean): PushIterator<T>;
export declare function broadcastIterator<T>(stop?: () => void): BroadcastIterator<T>;
declare global {
    interface ObjectConstructor {
        defineProperties<T, M extends {
            [K: string | symbol]: TypedPropertyDescriptor<any>;
        }>(o: T, properties: M & ThisType<any>): T & {
            [K in keyof M]: M[K] extends TypedPropertyDescriptor<infer T> ? T : never;
        };
    }
}
export declare const Iterability: unique symbol;
export type Iterability<Depth extends 'shallow' = 'shallow'> = {
    [Iterability]: Depth;
};
export declare function defineIterableProperty<T extends {}, N extends string | symbol, V>(obj: T, name: N, v: V): T & IterableProperties<Record<N, V>>;
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;
export declare const merge: <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never);
export declare function generatorHelpers<G extends (...args: A) => AsyncGenerator, A extends any[]>(g: G): (...args: Parameters<G>) => ReturnType<G> & (ReturnType<G> extends AsyncGenerator<infer Y> ? AsyncExtraIterable<Y> : never);
type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => R | PromiseLike<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;
export declare const Ignore: unique symbol;
export declare function filterMap<U, R>(source: AsyncIterable<U>, fn: (o: U, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>, initialValue?: R | typeof Ignore): AsyncIterableIterator<R>;
declare function map<U, R>(this: AsyncIterable<U>, mapper: Mapper<U, R>): AsyncIterableIterator<R>;
declare function filter<U>(this: AsyncIterable<U>, fn: (o: U) => boolean | PromiseLike<boolean>): AsyncIterableIterator<U>;
declare function unique<U>(this: AsyncIterable<U>, fn?: (next: U, prev: U) => boolean | PromiseLike<boolean>): AsyncIterableIterator<U>;
declare function initially<U, I = U>(this: AsyncIterable<U>, initValue: I): AsyncIterable<U | I>;
declare function waitFor<U>(this: AsyncIterable<U>, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncIterableIterator<U>;
declare function multi<T>(this: AsyncIterable<T>): AsyncIterableIterator<T>;
declare function broadcast<U>(this: AsyncIterable<U>): AsyncIterable<U>;
declare function consume<U>(this: Partial<AsyncIterable<U>>, f?: (u: U) => void | PromiseLike<void>): Promise<void>;
export declare const asyncHelperFunctions: {
    map: typeof map;
    filter: typeof filter;
    unique: typeof unique;
    waitFor: typeof waitFor;
    multi: typeof multi;
    broadcast: typeof broadcast;
    initially: typeof initially;
    consume: typeof consume;
    merge: <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
};
export {};
