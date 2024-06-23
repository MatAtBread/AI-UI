import { DeferredPromise } from "./deferred.js";
export type IterablePropertyPrimitive = (string | number | bigint | boolean | undefined | null);
export type IterablePropertyValue = IterablePropertyPrimitive | IterablePropertyValue[] | {
    [k: string | symbol | number]: IterablePropertyValue;
};
export declare const Iterability: unique symbol;
export type Iterability<Depth extends 'shallow' = 'shallow'> = {
    [Iterability]: Depth;
};
export type IterableType<T> = T & Partial<AsyncExtraIterable<T>>;
export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
    [K in keyof Omit<IP, typeof Iterability>]: IterableType<IP[K]>;
} : {
    [K in keyof IP]: (IP[K] extends object ? IterableProperties<IP[K]> : IP[K]) & IterableType<IP[K]>;
};
export interface QueueIteratableIterator<T> extends AsyncIterableIterator<T> {
    push(value: T): boolean;
    readonly length: number;
}
export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {
}
export declare function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T>;
export declare function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T>;
export declare function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T>;
export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
export declare function asyncIterator<T>(o: AsyncProvider<T>): AsyncIterator<T, any, undefined>;
type AsyncIterableHelpers = typeof asyncExtras;
declare const asyncExtras: {
    filterMap<U extends Partial<AsyncIterable<any>>, R>(this: U, fn: (o: HelperAsyncIterable<U>, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>, initialValue?: R | typeof Ignore): AsyncExtraIterable<R>;
    map: typeof map;
    filter: typeof filter;
    unique: typeof unique;
    waitFor: typeof waitFor;
    multi: typeof multi;
    initially: typeof initially;
    consume: typeof consume;
    merge<T, A extends Partial<AsyncIterable<any>>[]>(this: PartialIterable<T>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T>>, ...A][number]>>;
    combine<T_1, S extends CombinedIterable>(this: Partial<AsyncIterable<T_1>>, others: S): CombinedIterableResult<{
        _this: Partial<AsyncIterable<T_1>>;
    } & S>;
};
export declare function queueIteratableIterator<T>(stop?: () => void): {
    _pending: DeferredPromise<IteratorResult<T, any>>[] | null;
    _items: T[] | null;
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(): DeferredPromise<IteratorResult<T, any>> | Promise<{
        done: boolean;
        value: NonNullable<T>;
    }>;
    return(v?: unknown): Promise<{
        done: true;
        value: undefined;
    }>;
    throw(...args: any[]): Promise<never>;
    readonly length: number;
    push(value: T): boolean;
} & AsyncExtraIterable<T>;
export declare function debounceQueueIteratableIterator<T>(stop?: () => void): {
    _pending: DeferredPromise<IteratorResult<T, any>>[] | null;
    _items: T[] | null;
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(): DeferredPromise<IteratorResult<T, any>> | Promise<{
        done: boolean;
        value: NonNullable<T>;
    }>;
    return(v?: unknown): Promise<{
        done: true;
        value: undefined;
    }>;
    throw(...args: any[]): Promise<never>;
    readonly length: number;
    push(value: T): boolean;
} & AsyncExtraIterable<T>;
declare global {
    interface ObjectConstructor {
        defineProperties<T, M extends {
            [K: string | symbol]: TypedPropertyDescriptor<any>;
        }>(o: T, properties: M & ThisType<any>): T & {
            [K in keyof M]: M[K] extends TypedPropertyDescriptor<infer T> ? T : never;
        };
    }
}
export declare function defineIterableProperty<T extends {}, N extends string | symbol, V extends IterablePropertyValue>(obj: T, name: N, v: V): T & IterableProperties<Record<N, V>>;
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;
export declare const merge: <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
type CombinedIterable = {
    [k: string | number | symbol]: PartialIterable;
};
type CombinedIterableResult<S extends CombinedIterable> = AsyncExtraIterable<{
    [K in keyof S]?: S[K] extends PartialIterable<infer T> ? T : never;
}>;
export interface CombineOptions {
    ignorePartial?: boolean;
}
export declare const combine: <S extends CombinedIterable>(src: S, opts?: CombineOptions) => CombinedIterableResult<S>;
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & AsyncExtraIterable<A extends AsyncIterable<infer T> ? T : unknown>;
export declare function generatorHelpers<G extends (...args: any[]) => R, R extends AsyncGenerator>(g: G): (...args: Parameters<G>) => ReturnType<G> & AsyncExtraIterable<ReturnType<G> extends AsyncGenerator<infer T, any, unknown> ? T : unknown>;
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F, And = {}, Or = never> = F extends () => AsyncIterator<infer T> ? T : never;
declare function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void>;
type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;
export declare const Ignore: unique symbol;
type PartialIterable<T = any> = Partial<AsyncIterable<T>>;
export declare function filterMap<U extends PartialIterable, R>(source: U, fn: Mapper<HelperAsyncIterable<U>, R>, initialValue?: R | typeof Ignore): AsyncExtraIterable<R>;
declare function map<U extends PartialIterable, R>(this: U, mapper: Mapper<HelperAsyncIterable<U>, R>): AsyncExtraIterable<R>;
declare function filter<U extends PartialIterable>(this: U, fn: (o: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function unique<U extends PartialIterable>(this: U, fn?: (next: HelperAsyncIterable<U>, prev: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function initially<U extends PartialIterable, I = HelperAsyncIterable<U>>(this: U, initValue: I): AsyncExtraIterable<HelperAsyncIterable<U> | I>;
declare function waitFor<U extends PartialIterable>(this: U, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function multi<U extends PartialIterable>(this: U): AsyncExtraIterable<HelperAsyncIterable<U>>;
export declare function augmentGlobalAsyncGenerators(): void;
export {};
