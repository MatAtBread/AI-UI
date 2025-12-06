export type IterablePropertyPrimitive = (string | number | bigint | boolean | undefined | null | object | Function | symbol);
export type IterablePropertyValue = IterablePropertyPrimitive;
export declare const Iterability: unique symbol;
export interface Iterability<Depth extends 'shallow' = 'shallow'> {
    [Iterability]: Depth;
}
declare global {
    interface Array<T> {
        valueOf(): Array<T>;
    }
    interface Object {
        valueOf<T>(this: T): IsIterableProperty<T, Object>;
    }
}
type NonAccessibleIterableArrayKeys = keyof Array<any> & keyof AsyncIterableHelpers;
export type IterableType<T> = [T] extends [infer U] ? U & Partial<AsyncExtraIterable<U>> : never;
export type IterableProperties<T> = [T] extends [infer IP] ? [
    IP
] extends [Partial<AsyncExtraIterable<unknown>>] | [Iterability<'shallow'>] ? IP : [IP] extends [object] ? IP extends Array<infer E> ? Omit<IterableProperties<E>[], NonAccessibleIterableArrayKeys> & Partial<AsyncExtraIterable<E[]>> : {
    [K in keyof IP]: IterableProperties<IP[K]> & IterableType<IP[K]>;
} : IterableType<IP> : never;
export type IsIterableProperty<Q, R = never> = [Q] extends [Partial<AsyncExtraIterable<infer V>>] ? V : R;
export interface QueueIteratableIterator<T> extends AsyncIterableIterator<T>, AsyncIterableHelpers {
    push(value: T): boolean;
    readonly length: number;
}
export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {
}
export declare function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T>;
export declare function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T>;
export declare function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T>;
export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
export declare function asyncIterator<T>(o: AsyncProvider<T>): AsyncIterator<T, any, any>;
type AsyncIterableHelpers = typeof asyncExtras;
export declare const asyncExtras: {
    filterMap<U extends PartialIterable, R>(this: U, fn: Mapper<HelperAsyncIterable<U>, R>, initialValue?: NoInfer<R> | typeof Ignore): AsyncExtraIterable<R>;
    map: typeof map;
    filter: typeof filter;
    unique: typeof unique;
    waitFor: typeof waitFor;
    multi: typeof multi;
    initially: typeof initially;
    consume: typeof consume;
    merge<T, A extends Partial<AsyncIterable<any>>[]>(this: PartialIterable<T>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T>>, ...A][number]>>;
    combine<T extends Partial<AsyncIterable<T>>, S extends CombinedIterable, O extends CombineOptions<S & {
        _this: T;
    }>>(this: PartialIterable<T>, others: S, opts?: O): CombinedIterableResult<{
        _this: Partial<AsyncIterable<T>>;
    } & S, O>;
};
export declare const queueIteratableIterator: <T>(stop?: () => void) => QueueIteratableIterator<T>;
export declare const debounceQueueIteratableIterator: <T>(stop?: () => void) => QueueIteratableIterator<T>;
declare global {
    interface ObjectConstructor {
        defineProperties<T, M extends {
            [K: string | symbol]: TypedPropertyDescriptor<any>;
        }>(o: T, properties: M & ThisType<any>): T & {
            [K in keyof M]: M[K] extends TypedPropertyDescriptor<infer T> ? T : never;
        };
    }
}
export declare function defineIterableProperty<T extends object, const N extends string | symbol, V extends IterablePropertyValue>(obj: T, name: N, v: V): T & IterableProperties<{
    [k in N]: V;
}>;
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;
export declare const merge: <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => CollapseIterableTypes<A[number]> & AsyncExtraIterable<CollapseIterableType<A[number]>>;
type CombinedIterable = {
    [k: string | number | symbol]: PartialIterable;
};
type CombinedIterableType<S extends CombinedIterable> = {
    [K in keyof S]?: S[K] extends PartialIterable<infer T> ? T : never;
};
type RequiredCombinedIterableResult<S extends CombinedIterable> = AsyncExtraIterable<{
    [K in keyof S]: S[K] extends PartialIterable<infer T> ? T : never;
}>;
type PartialCombinedIterableResult<S extends CombinedIterable> = AsyncExtraIterable<{
    [K in keyof S]?: S[K] extends PartialIterable<infer T> ? T : never;
}>;
export interface CombineOptions<S extends CombinedIterable> {
    ignorePartial?: boolean;
    initially?: CombinedIterableType<S>;
}
type CombinedIterableResult<S extends CombinedIterable, O extends CombineOptions<S>> = true extends O['ignorePartial'] ? RequiredCombinedIterableResult<S> : PartialCombinedIterableResult<S>;
export declare const combine: <S extends CombinedIterable, O extends CombineOptions<S>>(src: S, opts?: O) => CombinedIterableResult<S, O>;
export declare function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & AsyncExtraIterable<A extends AsyncIterable<infer T> ? T : unknown>;
export declare function generatorHelpers<G extends (...args: any[]) => R, R extends AsyncGenerator>(g: G): (...args: Parameters<G>) => ReturnType<G> & AsyncExtraIterable<ReturnType<G> extends AsyncGenerator<infer T> ? T : unknown>;
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F> = F extends () => AsyncIterator<infer T> ? T : never;
declare function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void>;
export declare const Ignore: unique symbol;
export type Mapper<U, R> = (o: U, prev: NoInfer<R> | typeof Ignore) => PromiseLike<R | typeof Ignore> | R | typeof Ignore;
export declare function once<T>(v: T): AsyncGenerator<Awaited<T>, void, unknown>;
type PartialIterable<T = any> = Partial<AsyncIterable<T>>;
export declare function filterMap<U extends PartialIterable, R>(source: U, fn: Mapper<HelperAsyncIterable<U>, R>, initialValue?: NoInfer<R> | Promise<NoInfer<R>> | typeof Ignore, prev?: NoInfer<R> | typeof Ignore): AsyncExtraIterable<R>;
declare function map<U extends PartialIterable, R>(this: U, mapper: Mapper<HelperAsyncIterable<U>, R>): AsyncExtraIterable<R>;
declare function filter<U extends PartialIterable>(this: U, fn: (o: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function unique<U extends PartialIterable>(this: U, fn?: (next: HelperAsyncIterable<U>, prev: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function initially<U extends PartialIterable, I extends HelperAsyncIterable<U> = HelperAsyncIterable<U>>(this: U, initValue: I): AsyncExtraIterable<HelperAsyncIterable<U> | I>;
declare function waitFor<U extends PartialIterable>(this: U, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function multi<U extends PartialIterable>(this: U): AsyncExtraIterable<HelperAsyncIterable<U>>;
export declare function augmentGlobalAsyncGenerators(): void;
export {};
