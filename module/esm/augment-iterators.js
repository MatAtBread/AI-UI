import { augmentGlobalAsyncGenerators } from './ai-ui.js';
export * from './iterators.js';
// Find the prototype that holds the [Symbol.asyncIterator] for an async generator function, and add the helpers to it.
augmentGlobalAsyncGenerators();
