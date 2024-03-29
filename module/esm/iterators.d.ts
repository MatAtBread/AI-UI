import { IterableProperties } from "./tags.js";
export interface QueueIteratableIterator<T> extends AsyncIterableIterator<T> {
    push(value: T): boolean;
}
export interface PushIterator<T> extends AsyncExtraIterable<T> {
    push(value: T): boolean;
    close(ex?: Error): void;
}
export type BroadcastIterator<T> = PushIterator<T>;
export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {
}
export declare function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T>;
export declare function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T>;
export declare function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T>;
export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
export declare function asyncIterator<T>(o: AsyncProvider<T>): AsyncIterator<T, any, undefined>;
type AsyncIterableHelpers = typeof asyncExtras;
declare const asyncExtras: {
    map: typeof map;
    filter: typeof filter;
    unique: typeof unique;
    waitFor: typeof waitFor;
    multi: typeof multi;
    broadcast: typeof broadcast;
    initially: typeof initially;
    consume: typeof consume;
    merge<T, A extends Partial<AsyncIterable<any>>[]>(this: Partial<AsyncIterable<T>>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T>>, ...A][number]>>;
};
export declare function queueIteratableIterator<T>(stop?: () => void): QueueIteratableIterator<T> & AsyncExtraIterable<T>;
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
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A extends AsyncIterable<infer T> ? A & AsyncExtraIterable<T> : never;
export declare function generatorHelpers<G extends (...args: A) => AsyncGenerator, A extends any[]>(g: G): (...args: Parameters<G>) => ReturnType<G> & (ReturnType<G> extends AsyncGenerator<infer Y> ? AsyncExtraIterable<Y> : never);
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F, And = {}, Or = never> = F extends () => AsyncIterator<infer T> ? T : never;
declare function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void>;
type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => R | PromiseLike<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;
export declare const Ignore: unique symbol;
type PartialIterable = Partial<AsyncIterable<any>>;
export declare function filterMap<U extends PartialIterable, R>(source: U, fn: (o: HelperAsyncIterable<U>, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>, initialValue?: R | typeof Ignore): AsyncExtraIterable<R>;
declare function map<U extends PartialIterable, R>(this: U, mapper: Mapper<HelperAsyncIterable<U>, R>): AsyncExtraIterable<R>;
declare function filter<U extends PartialIterable>(this: U, fn: (o: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function unique<U extends PartialIterable>(this: U, fn?: (next: HelperAsyncIterable<U>, prev: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function initially<U extends PartialIterable, I = HelperAsyncIterable<U>>(this: U, initValue: I): AsyncExtraIterable<HelperAsyncIterable<U> | I>;
declare function waitFor<U extends PartialIterable>(this: U, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function multi<U extends PartialIterable>(this: U): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function broadcast<U extends PartialIterable>(this: U): AsyncIterable<HelperAsyncIterator<Required<U>[typeof Symbol.asyncIterator], {}, never>> & AsyncExtraIterable<HelperAsyncIterator<Required<U>[typeof Symbol.asyncIterator], {}, never>>;
export {};
