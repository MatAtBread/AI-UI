export type PushIterator<T> = AsyncExtraIterable<T> & {
    push(value: T): boolean;
    close(ex?: Error): void;
};
export type BroadcastIterator<T> = PushIterator<T>;
export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {
}
type AsyncIterableHelpers = typeof asyncExtras;
export declare const asyncExtras: {
    map: <U, R>(this: AsyncIterable<U>, mapper: (o: U) => R | PromiseLike<R>) => AsyncExtraIterable<Awaited<R>> & Awaited<R>;
    filter: <U_1>(this: AsyncIterable<U_1>, fn: (o: U_1) => boolean | PromiseLike<boolean>) => AsyncExtraIterable<U_1> & U_1;
    throttle: <U_2>(this: AsyncIterable<U_2>, milliseconds: number) => AsyncExtraIterable<U_2> & U_2;
    debounce: <U_3>(this: AsyncIterable<U_3>, milliseconds: number) => AsyncExtraIterable<U_3> & U_3;
    waitFor: <U_4>(this: AsyncIterable<U_4>, cb: (done: (...a: unknown[]) => void) => void) => AsyncExtraIterable<U_4> & U_4;
    count: <U_5 extends {}, K extends string>(this: AsyncIterable<U_5>, field: K) => AsyncExtraIterable<Awaited<U_5> & {
        [x: string]: number;
    }> & Awaited<U_5> & {
        [x: string]: number;
    };
    retain: <U_6 extends {}>(this: AsyncIterable<U_6>) => AsyncExtraIterable<U_6> & U_6;
    broadcast: <U_7, X>(this: AsyncIterable<U_7>, pipe?: (dest: AsyncIterable<U_7>) => AsyncIterable<X>) => AsyncExtraIterable<X> & X;
    initially: <U_8, I>(this: AsyncIterable<U_8>, initValue: I) => AsyncExtraIterable<U_8 | I> & (U_8 | I);
    consume: typeof consume;
};
export declare function pushIterator<T>(stop?: () => void, bufferWhenNoConsumers?: boolean): PushIterator<T>;
export declare function broadcastIterator<T>(stop?: () => void): BroadcastIterator<T>;
export declare const merge: <A extends AsyncIterable<any>[]>(...ai: A) => AsyncExtraIterable<unknown>;
export declare function withHelpers<T>(ai: AsyncIterable<T>): AsyncExtraIterable<T> & T;
declare function consume<U>(this: AsyncIterable<U>, f: (u: U) => void): Promise<void>;
export {};
