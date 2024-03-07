import { DEBUG } from './debug.js';
import { iterableHelpers } from './iterators.js';
export * from './iterators.js';
// Find the prototype that holds the [Symbol.asyncIterator] for an async generator function, and add the helpers to it.
export function augmentGlobalAsyncGenerators() {
    let g = (async function* () { })();
    while (g) {
        const desc = Object.getOwnPropertyDescriptor(g, Symbol.asyncIterator);
        if (desc) {
            iterableHelpers(g);
            break;
        }
        g = Object.getPrototypeOf(g);
    }
    if (DEBUG && !g) {
        console.log("Failed to augment the prototype of `(async function*())()`");
    }
}
augmentGlobalAsyncGenerators();
