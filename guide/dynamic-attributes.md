## Dynamic Attributes

In the previous [example]((https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/dynamic-content.html)) we created a tag called App whose content was specified statically, but updated dynamically.

We can also do the same with the attributes when creating an element. For example, following on from the clock example, we can dynamically update the style of an element.

```javascript
/* Specify what base tags you reference in your UI */
const { div } = AIUI.tag();

document.body.append(
  div({
      style:{
        backgroundColor: blink() // An async generator that returns a CSS color
      }
    },
    'Set style.backgroundColor dynamically'),
    div({
      style: style()  // An async generator that returns a partial CSSStyleDeclaratuion
    },
    'Set entire style dynamically'),
);

/* A simple async "sleep" function */
function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

async function *blink(t = 1) {
  while (true) {
    yield '#ccf';
    await sleep(t);
    yield '#cfc';
    await sleep(t);
  }
}

async function *style() {
  for await (const color of blink(1.5)) {
    yield {
      backgroundColor: color,
      fontFamily: 'sans-serif'
    }
  }
}
```

Unlike dynamic content, attributes cannot be specified as a Promise 
```
This design decision was taken as some attributes are actually useful as Promises. Although no standard DOM Node types have any "Promised" attributes, there are numerous examples of third-party components that do.
```
If you really need to specify a Promised attribute, wrap it in an async generator:
```javascript
async function *once(promise) {
  yield promise;
}

document.body.append(div({
  style:{
    color: once(Promise.resolve('red')) /* The Promise is wrapped in an async iterable, and AIUI will set the attribute when it resolves */
  }
},))
```

This, and other ways to manipulate async iterators are discussed in the next section: Iterators

____

| < Prev |                     |  Next > |
|--------|:-------------------:|--------:|
| [Dynamic Content](./dynamic-content.md) | [Index](./index.md) | [Help with async iterators](./iterators.md) |



