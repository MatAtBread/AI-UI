import type { AsyncExtraIterable } from './iterators.js';
export * from './iterators.js';
export {};
declare global {
    interface AsyncGenerator<T = unknown, TReturn = any, TNext = any> extends AsyncIteratorObject<T, TReturn, TNext>, AsyncExtraIterable<T> {
    }
}
