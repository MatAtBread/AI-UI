# Iterators

As you can tell, AIUI makes a lot of use of Async Iterators (hence the name: "AI-UI"!).

Later, we'll make a lot of use of async iterators created by AI-UI from standard DOM elements and events (see [Link elements dynamically](./when.md)), but before we do, you should familiarise yourself with a few general helpers provided by AI-UI for working with async iterables.

First, some clarity on terminology.
* An **AsyncIterator** is an object that resolves multiple times in the future. It has optional methods that allow the _consumer_ of these values to terminate the thing that is _generating_ them. Unlike Observables which "push" values to a subscriber, in JavaScript **iterators** are a "pull" mechanism - nothing is generated until there is a consumer for the values (it is **"lazy"**), and both the _consumer_ and _generator_ of the values can terminate the iteration.
* An **AsyncIterable** is an object that can be iterated over asynchronously, via its `[Symbol.asyncIterator]` method, which returns an AsyncIterator. An object can be both an **AsyncIterator** and **AsyncIterable** at the same time (ie. some objects can generate values from themselves), and are sometimes called an "AsyncIterableIterator".
* An **AsyncGenerator** is a function that returns an **AsyncIterable** when it is invoked, using the `yield` and `await` Javascript keywords. It's a specialised, syntactically concise way of writing AsyncIterables.

As of March 2024, none of these types have standardised prototypes, as they are not Javascript classes, but simply objects that have a standard set of interfaces, as indicated by the presence of a various well-known Symbols on objects and corresponding methods. You can find out more about the details [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols). There are proposals to expose some of the prototypes so that they can be expanded in the future, for example the [TC39 proposal](https://github.com/tc39/proposal-async-iterator-helpers).

AI-UI has a set of helpers you can use with async iterators - obvious things like map & filter.

To use these with third-party async iterators, or the return of a standard async generator, you have a choice of three mechanisms:
* Augment the global `async function *` prototype, which is considered bad practice by some. This will make all the iterables returned by async generators have the additional functions below.
* Use the `iterableHelpers` to add the helpers to an AsyncIterator, or
* Use `generatorHelpers` function, if you want to add helpers to a generator (that returns iterables).

The first is easiest to use. If you use this method, you only need to do so once in your code and it will augment all async generators anywhere in your codebase.

```typescript
// Augments the global prototype and declares global types
import 'https://www.unpkg.com/@matatbread/ai-ui/esm/augment-iterators.js';

async function *count(limit) {
  for (let i=0; i<limit; i++)
    yield i;
}

for await (const x of count(4)) console.log(x); // Logs 0,1,2,3
for await (const x of count(4).map(n => n * 2)) console.log(x); // Logs 0,2,4,6
```
From JavaScript, you can explicitly call the function, since there are no types to modify:
```javascript
// tag from however you load it: import, require, or as the global AIUI in a script.
tag.augmentGlobalAsyncGenerators();
```

The final two require that you import the functions that add the helpers:

```javascript
/* ES6 Import */
import { Iterators } from 'https://www.unpkg.com/@matatbread/ai-ui/esm/ai-ui.js';
const { iterableHelpers, generatorHelpers } = Iterators;
```

```javascript
/* CommonJS */
const { Iterators } = require('@matatbread/ai-ui');
const { iterableHelpers, generatorHelpers } = Iterators;
```


```html
<script src="https://www.unpkg.com/@matatbread/ai-ui/dist/ai-ui.min.js"></script>
<script>
  /* Static script */
  const { iterableHelpers, generatorHelpers } = AIUI.Iterators;
</script>
```

We can either add functionality to the generator with `generatorHelpers`, or to the result of calling the generator (the async iterable it returns) with `iterableHelpers`. `iterableHelpers` can of course be used with any async iterable, for example from a third party library.

```javascript
// Create a version of "count" whose returned iterators have helpers attached
const helpedCount1 = generatorHelpers(count);
// Now create an async iterable that has the helpers available.
const counter1 = helpedCount1(10);

// or just:
const helpedCount2 = generatorHelpers(async function *(limit) {
  for (let i=0; i<limit; i++)
    yield i;
});
const counter2 = helpedCount2(10);

// or call the intrinsic `count` and add helpers to the result:
const counter3 = iterableHelpers(count(10));
```
In each case, the resulting async iterable will function just as a standard async interable:

```javascript
for await (const x of counter3 /* or counter1, or counter2 */) {
  console.log(x); // Integers 0,1,2...9
}
```
...but will now have the following additional methods.

In addition to the _Helper Functions_ that are added to AsyncIterables, two of the functions are available as exports on the Iterators interface, `merge` and `combine` can be used directly:

## merge
```typescript
function merge<A extends (AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>)[]>(...ai: A): AsyncExtraIterable<CollapseIterableType<A[number]>>;
```
Merges all the specified iterables (or iterators) into one. Every `yield` for any source is yielded to the consumer. `merge` can also be called on a helped AsyncExtraIterator:
```typescript
// Merge this.iter with the output of two generators
this.iter.merge(anotherIter1(), anotherIter2()).consume()
```

## combine
```typescript
type CombinedIterable = {
    [k: string | number | symbol]: AsyncIterable<any>;
};
type CombinedIterableResult<S extends CombinedIterable> = AsyncExtraIterable<{
    [K in keyof S]?: S[K] extends AsyncIterable<infer T> ? T : never;
}>;
export interface CombineOptions {
    ignorePartial?: boolean;
}

function combine<S extends CombinedIterable>(src: S, opts?: CombineOptions): CombinedIterableResult<S>;
```
The `combine` function is similar to the `merge` function, but allows you to accumulate a number of sources into specified fields of a named object:

```typescript
combine({ 
  pos: mousePosition(),
  user: fetchUserAccount()
},{
  ignorePartial: true
}).consume(({pos,user}) => console.log(pos, user));
```
The optional flag `ignorePartial` (default: false) will only yield only complete objects where every source has yielded at least once. `combine` can also be called on a helped iterator. In this case the original iterator result can be derefrenced as `_this`;
```typescript
this.mouse.combine({ user: fetchUserAccount() }).consume(({
  _this, user
}) => console.log(_this, user));
```

Check [here](./iterators-usage.md) to see how these helpers are used in action.

# Helper Functions

## map
```typescript
function map<U, R>(this: AsyncIterable<U>, mapper: (o: U, prev: R | typeof Ignore) => R | PromiseLike<R | typeof Ignore>): AsyncIterable<Awaited<R>>
```

Maps the results of an async iterable. The mapper function can itself be asynchronous.

```javascript
for await (const x of counter3.map(num => num * num)) {
  console.log(x); // Integers 0,1,4...81
}
```

Note that the map function can return the special symbol `Ignore` (which is exported by Iterators) that causes the iteration step to be "swallowed" by the function and not yield to the consumer:

```javascript
for await (const x of counter3.map(num => num & 1 ? num : Iterators.Ignore)) {
  console.log(x); // Integers 1,3,5,7,9
}
```

This makes it possible to both filter (by returning `Ignore`) and map in a single call. The map function can optionally also receive the _previous_ value yielded, making it possible to filter or map
based on the last value. For example to remove duplicates:
```javascript
const unique = counter3.map((num, prev) => num == prev ? Iterators.Ignore : num);
```

The `filter` and `unique` functions below do exactly this, but are more explicitly named making it a bit more obvious as to what they are doing.

## filter
```typescript
function filter<U>(this: AsyncIterable<U>, fn: (o: U) => boolean | PromiseLike<boolean>): AsyncIterable<U>
```

Filter the results of an async iterable. Only those vales returning `true` from the predicate are yielded to the consumer. The predicate can be asynchronous.
```javascript
for await (const x of counter3.filter(num => num % 2 === 0)) {
  console.log(x); // Integers 0,2,4,6,8
}

```
## unique
```typescript
function unique<U>(this: AsyncIterable<U>, fn?: (next: U, prev: U) => boolean | PromiseLike<boolean>): AsyncIterable<U>
```

Filter the results of an async iterable to remove duplicate values. The optional specifed function can be used to test for equality. By default, the test is the JavaScript strict equality operator "===". To compare objects, arrays or other compound objects, you can provide your own comparison function

```javascript
for await (const x of counter3.map(n => Math.floor(n / 2)).unique()) {
  console.log(x); // 0,1,2,3,4
}
```


## initially
```typescript
function initially<U, I = U>(this: AsyncIterable<U>, initValue: I): AsyncIterable<U | I>
```
Prepends a single value to a yieded sequence
```javascript
for await (const x of counter3.initially('hello')) {
  console.log(x); // 'hello',0,1,2,3,4,5,6,7,8,9
}
```

## waitFor
```typescript
function waitFor<U>(this: AsyncIterable<U>, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncIterable<U>
```

Waits for a callback before yielding values as they arrive. For example, to yield on the next animation frame:
```javascript
for await (const x of counter3.waitFor(done => window.requestAnimationFrame(done))) {
  // We've been scheduled to run during an animation frame period
  console.log(x); // 0,1,2,3,4,5,6,7,8,9 each one logged during an animation frame
}
```

## consume
```typescript
function consume<U>(this: AsyncIterable<U>, f?: ((u: U) => void | PromiseLike<void>) | undefined): Promise<void>
```

Passes each yielded value to the specified function and returns on when the final iteration has been processed by the callback. The specified function can itself be synchronous or async (returning a Promise). The result, if used, resolves when the final callback has completed.

> _IMPORTANT: async iterators are *lazy*. No values will be generated until a consumer requests a value. `consume` is one such function_. If you were to try:
>
>```javascript
>counter3.map(n => console.log(n));
>```
>...no values will be printed, as `map` (along with almost every other helper function) is also *lazy*. To cause values to be generated (and logged), you need a consumer:
>```javascript
>counter3.map(n => console.log(n)).consume();
>// or just
>counter3.consume(n => console.log(n));
>```
>
>If you are passing your async iterators to AI-UI, or a `for await` loop, you typically don't need `consume`, as these will ask for values from the iterator when they need them. `consume` is most useful where you have a standalone statement where the return value of `map`, `filter`, etc. (ie the async iterable), would otherwise be un-referenced and garbage collected.


## multi
```typescript
function multi<U>(this: AsyncIterable<U>): AsyncIterable<U>
```

Accept the source iterator, yielding a common value to all current consumers. There is no buffering or queueing - if a consumer takes a long time to handle a value, it might miss some consumed by any other consumers, but will resume receiving values as soon as it calls next(). It is very similar to `broadcast`, except that `broadcast` queues any intermediate values. `multi` is significantly more efficient and is suitable for providing things like mousemove and scroll events, where a slow, asynchronous consumer does not want to process every value in turn, but simply wants to keep up to date when the value changes.

Note: by default, AsyncIterators, if given more than one consumer, will yield sequential values to each consumer*. Use `multi` or `broadcast` if you need all consumers to receive a value.
> (* actually, this is entirely dependent on how the async iterator is implemented. It is the default behaviour of an `async function*`, but an iterator is free to produce results in whatever manner it pleases to multiple consumers).

```javascript
const b = counter3.multi();

// Outputs A0,B0,A1,B1.... note: if the functions in `consume` were asynchronous and slow, not every value will go to the slowest consumer under certain circumstances, but all values will be consumed by at least one of the consumers.

b.consume(n => console.log("A",n));
b.consume(n => console.log("B",n));

// For comparison, with the `.multi()`
const c = counter3;
c.consume(n => console.log("A",n)); // A0, A2, A4, A6, A8
c.consume(n => console.log("B",n)); // A1, A3, A5, A7, A9
// These are evenly distributed by an `async function *` becuase the consumers are synchronous and complete at the same speed

```

## broadcast
```typescript
function broadcast<U>(this: AsyncIterable<U>): AsyncIterable<U>
```

Queues the incoming yielded values so they can be replayed to multiple consumers. The queue for each consumer commences when the consumer first calls the async iterator `next()` function, and the whole broadcast iterator terminates when either the producer or all consumers terminate.

```javascript
const b = counter3.broadcast();

// Outputs A0,B0,A1,B1.... note: the synchronisation and order between A and B may differ depending on the timing of functions. The order within "A" or "B" will be maintained.

b.consume(n => console.log("A",n));
b.consume(n => console.log("B",n));

```

# Chaining iterables and helpers

All the helpers (except consume) themselves return "helped" async iterables, so you can chain them together:
```javascript
for await (const n of counter3.filter(n => n % 2 === 1).map(n => n * n).initially(-1).waitFor(requestAnimationFrame)) {
  console.log(n); // -1,1,9,25,49,81, all output during an animation frame
}
```

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Dynamic Content](./dynamic-attributes.md) | [Index](./index.md) | [Iterator Helpers in Action](./iterators-usage.md) |



