# Iterator Helpers in Action

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
...or avoid this necessity altogether with `import 'ai-ui/augment-iterators.js';`

Try the above code [example (right click and open in new tab)](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/iterators.html)


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Iterators](./iterators.md) | [Index](./index.md) | [Create new tags](./extended.md) |



