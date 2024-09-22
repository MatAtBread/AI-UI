export type IterablePropertyPrimitive = (string | number | bigint | boolean | undefined | null);
export type IterablePropertyValue = IterablePropertyPrimitive | IterablePropertyValue[] | {
    [k: string | symbol | number]: IterablePropertyValue;
};
export declare const Iterability: unique symbol;
export type Iterability<Depth extends 'shallow' = 'shallow'> = {
    [Iterability]: Depth;
};
export type IterableType<T> = T & Partial<AsyncExtraIterable<T>>;
declare global {
    interface Array<T> {
        valueOf(): Array<T>;
    }
    interface Object {
        valueOf<T>(this: T): T extends IterableType<infer Z> ? Z : Object;
    }
}
type NonAccessibleIterableArrayKeys = keyof Array<any> & keyof AsyncIterableHelpers;
export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
    [K in keyof Omit<IP, typeof Iterability>]: IterableType<IP[K]>;
} : {
    [K in keyof IP]: (IP[K] extends Array<infer E> ? /*
      Because TS doesn't implement separate types for read/write, or computed getter/setter names (which DO allow
      different types for assignment and evaluation), it is not possible to define type for array members that permit
      dereferencing of non-clashinh array keys such as `join` or `sort` and AsyncIterator methods which also allows
      simple assignment of the form `this.iterableArrayMember = [...]`.

      The CORRECT type for these fields would be (if TS phas syntax for it):
      get [K] (): Omit<Array<E & AsyncExtraIterable<E>, NonAccessibleIterableArrayKeys> & AsyncExtraIterable<E[]>
      set [K] (): Array<E> | AsyncExtraIterable<E[]>
      */ Omit<Array<E & Partial<AsyncExtraIterable<E>>>, NonAccessibleIterableArrayKeys> & Partial<AsyncExtraIterable<E[]>> : (IP[K] extends object ? IterableProperties<IP[K]> : IP[K]) & IterableType<IP[K]>);
};
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
    filterMap<U extends PartialIterable, R>(this: U, fn: (o: HelperAsyncIterable<U>, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>, initialValue?: R | typeof Ignore): AsyncExtraIterable<R>;
    map: typeof map;
    filter: typeof filter;
    unique: typeof unique;
    waitFor: typeof waitFor;
    multi: typeof multi;
    initially: typeof initially;
    consume: typeof consume;
    merge<T, A extends Partial<AsyncIterable<any>>[]>(this: PartialIterable<T>, ...m: A): CollapseIterableTypes<[Partial<AsyncIterable<T>>, ...A][number]> & AsyncExtraIterable<CollapseIterableType<[Partial<AsyncIterable<T>>, ...A][number]>>;
    combine<T, S extends CombinedIterable>(this: PartialIterable<T>, others: S): CombinedIterableResult<{
        _this: Partial<AsyncIterable<T>>;
    } & S>;
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
export declare function defineIterableProperty<T extends {}, const N extends string | symbol, V extends IterablePropertyValue>(obj: T, name: N, v: V): T & IterableProperties<{
    [k in N]: V;
}>;
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
export declare function generatorHelpers<G extends (...args: any[]) => R, R extends AsyncGenerator>(g: G): (...args: Parameters<G>) => ReturnType<G> & AsyncExtraIterable<ReturnType<G> extends AsyncGenerator<infer T> ? T : unknown>;
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F> = F extends () => AsyncIterator<infer T> ? T : never;
declare function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void>;
type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;
export declare const Ignore: unique symbol;
type PartialIterable<T = any> = Partial<AsyncIterable<T>>;
export declare function filterMap<U extends PartialIterable, R>(source: U, fn: Mapper<HelperAsyncIterable<U>, R>, initialValue?: R | typeof Ignore, prev?: R | typeof Ignore): AsyncExtraIterable<R>;
declare function map<U extends PartialIterable, R>(this: U, mapper: Mapper<HelperAsyncIterable<U>, R>): AsyncExtraIterable<R>;
declare function filter<U extends PartialIterable>(this: U, fn: (o: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function unique<U extends PartialIterable>(this: U, fn?: (next: HelperAsyncIterable<U>, prev: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function initially<U extends PartialIterable, I = HelperAsyncIterable<U>>(this: U, initValue: I): AsyncExtraIterable<HelperAsyncIterable<U> | I>;
declare function waitFor<U extends PartialIterable>(this: U, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncExtraIterable<HelperAsyncIterable<U>>;
declare function multi<U extends PartialIterable>(this: U): AsyncExtraIterable<HelperAsyncIterable<U>>;
export declare function augmentGlobalAsyncGenerators(): void;
export {};
