# Iterators

As you can tell, AIUI makes a lot of use of Async Iterators (hence the name: "AI-UI"!).

Later, we'll make a lot of use of async iterators created by AI-UI from standard DOM elements and events (see [Link elements dynamically](./when.md)), but before we do, you should familiarise yourself with a few general helpers provided by AI-UI for working with async iterables.

First, some clarity on terminology.
* An **async iterator** is an object that resolves multiple times in the future. It has optional methods that allow the _consumer_ of these values to terminate the thing that is _generating_ them. Unlike Observables which "push" values to a subscriber, an **async iterator** is a "pull" mechanism - nothing is generated until there is a consumer for the values, and both the _consumer_ and _generator_ of the values can terminate the iteration.
* An **async iterable** is an object that can be iterated over asynchronously. 
* An **async generator** is a function that returns an **async iterable** when it is invoked, using the `yield` and `await` Javascript keywords.

At present, none of these types have standardised prototypes, as they are not Javascript classes, but simply objects that have a standard set of interfaces, as indicated by the presence of a various well-known Symbols on objects and corresponding methods. You can find out more about the details [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols). There are proposals to expose some of the prototypes so that they can be expanded in the future, for example the [TC39 proposal](https://github.com/tc39/proposal-async-iterator-helpers).

Meanwhile, AI-UI has a set of helpers you can use with async iterators.

To use these with third-party async iterators, or the return of a standard async generator, use the `iterableHelpers` or `generatorHelpers` function, depdending on if you want to add helpers to a generator (that returns iterables), or an iterable itself.

Of these, `map` and `filter` are the most useful with AI-UI, as you can see in the example following the defintions of the helpers. 

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

These functions manipulate an async iterable or generator, adding helper functions.

For example, consider an async generator that counts from 0 to a specified limit:

```javascript
async function *count(limit) {
  for (let i=0; i<limit; i++)
    yield i;
}
```

We can either add functionality to the generator with `generatorHelpers`, or to the result of calling the generator (the async iterable it returns) with `iterableHelpers`. 

```javascript
// Create a version of "count" whose returned iterators have helpers attached
const helpedCount1 = generatorHelpers(count);
const counter1 = helpedCount(10);

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
..but will now have the following additional propertied:

## map
```typescript
function map<U, R>(this: AsyncIterable<U>, mapper: (o: U) => R | PromiseLike<R>): AsyncIterable<Awaited<R>>
```

Maps the results of an async iterable. The mapper function can itself be asynchronous.

```javascript
for await (const x of counter3.map(num => num * num)) {
  console.log(x); // Integers 0,1,4...81
}
```

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

## throttle
```typescript
function throttle<U>(this: AsyncIterable<U>, milliseconds: number): AsyncIterable<U>
```

Filters out yielded values which occur within `milliseconds` or the previously yielded value

## waitFor
```typescript
function waitFor<U>(this: AsyncIterable<U>, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncIterable<U>
```

Waits for a callback before yielding values as they arrive. For example, to yield on the next animation frame:
```javascript
for await (const x of counter3.waitFor(done => window.requestAnimationFrame(done))) {
  // We've been scheduled to run during an animation frame period
}
```

## consume
```typescript
function consume<U>(this: AsyncIterable<U>, f?: ((u: U) => void | PromiseLike<void>) | undefined): Promise<void>
```

Passes each yielded value to the specified function and returns on when the final iteration has been processed by the callback. The specified function can itself be synchronous, async (returning a Promise), `null` or `undefined`.

```javascript
// Outputs all the values 0..9 and then continues
await counter3.consume(n => console.log(n));
```

## broadcast
```typescript
function broadcast<U, X>(this: AsyncIterable<U>, pipe?: (dest: AsyncIterable<U>) => AsyncIterable<X>): AsyncIterable<X>
```

Queues the incoming yielded values so they can be replayed to multiple consumers. The queue for each consumer commences when the consumer first calls the async iterator `next()` function, and the whole broadcast iterator terminates when either the producer or all consumers terminate.

```javascript
const b = counter3.broadcast();

// Outputs A0,B0,A1,B1.... note: the synchronisation and order between A and B may differ depending on the timing of functions. The order within "A" or "B" will be maintained.

b.consume(n => console.log("A",n));
b.consume(n => console.log("B",n));

```

Note that all the helpers (except consume) themselves return "helped" async iterables, so you can chain them together:
```javascript
for await (const n of counter3.filter(n => n % 2 === 1).map(n => n * n).initially(-1).waitFor(requestAnimationFrame)) {
  console.log(n); // -1,1,9,25,49,81, all output during an animation frame
}
```


In the following example, we use the same techniques as we did in [Dynamic content](./dynamic-content.md), but rather than making the generator return DOM Nodes, we map the raw "data" yielded by the generator into the required UI _within_ the static UI declaration. This helps us with "separation of concerns", where the async iterables generate data, and the UI specifies how it should be presented to the user.

Back to Chuck Norris.

Here's our existing version:

```javascript
const App = div.extended({
  constructed() {
    /* When constructed, this "div" tag contains some other tags: */
    return [
      h2("Hello World"),
      div(chuckJoke())
    ]
  }
});

/* Add add it to the document so the user can see it! */
document.body.appendChild(App({
  style:{
    color: 'blue'
  }
},
'Your first web page'));

/* A simple async "sleep" function */
function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

async function *chuckJoke() {
  while (true) {
    /* In this example, we use Promises, rather than await, just to illustrate the alternative
    JavaScript syntax */
    yield fetch('https://api.chucknorris.io/jokes/random')
      .then(response => response.json())
      .then(fromJson => fromJson.value);
    await sleep(5);
  }
}
```
What if we wanted the joke in a bigger font? We could just change `chuckJoke` to yield a whole `div`, complete with it's own style, but this blurs the boundary between what is "data" as what is "presentation".

An alternative is to map the joke (text data) to UI elements in the `App`:

```javascript
const App = div.extended({
  constructed() {
    /* When constructed, this "div" tag contains some other tags: */
    return [
      h2("Hello World"),
      chuckJoke().map(joke => div({ style: { fontSize: '133%' }},joke))
    ]
  }
});

```
Of course, to do this, we need to add the helpers to `chuckJoke`. We could do it where it's referenced, like:
```javascript
      iterableHelpers(chuckJoke()).map(joke => div({ style: { fontSize: '133%' }},joke))
```
...but since it's a generator, it's cleaner to do it where it's defined:
```javascript
const chuckJoke = generatorHelpers(async function *() {
  while (true) {
    /* In this example, we use Promises, rather than await, just to illustrate the alternative
    JavaScript syntax */
    yield fetch('https://api.chucknorris.io/jokes/random')
      .then(response => response.json())
      .then(fromJson => fromJson.value);
    await sleep(5);
  }
});

```

Try the above code [example (right click and open in new tab)](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/iterators.html)


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Dynamic Content](./dynamic-attributes.md) | [Index](./index.md) | [Create new tags](./extended.md) |



