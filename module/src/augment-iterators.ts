import { augmentGlobalAsyncGenerators } from './iterators.js';
import type { AsyncExtraIterable } from './iterators.js';
export * from './iterators.js';

// Find the prototype that holds the [Symbol.asyncIterator] for an async generator function, and add the helpers to it.
augmentGlobalAsyncGenerators();

export {};

declare global {
  interface AsyncGenerator<T = unknown, TReturn = any, TNext = any> extends AsyncIteratorObject<T, TReturn, TNext>, AsyncExtraIterable<T> {
  }
}