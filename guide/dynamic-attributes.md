# Dynamic Attributes

In the previous [example](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/dynamic-content.html) we created a tag called App whose content was specified statically, but updated dynamically.

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
function sleep<T>(seconds, o?: T) {
  return new Promise<T>(resolve => setTimeout(() => resolve(o), seconds * 1000))
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
Try the above code [example (right click and open in new tab)](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/dynamic-attributes.html)

As with specifying children an call to a TagFunction, you can also provide attributes from a Promise, and therefore an async function:

```javascript
document.body.append(
  div({
      style:{
        backgroundColor: sleep(2,"blue")
      }
    },
    'Set style.backgroundColor after 2 seconds')
);
```
JavaScript `async function *(...){}` generators are not the only way to create async iterators. The AIUI [when(...)](./when.md) function create async iterators from DOM elements and events, and AIUI provides a number of other ways to manipulate async iterators which are discussed in the next section, [iterators](./iterators.md). Setting attributes dynamically works really well with [`iterables`](./prototype.md), allowing you to create your own elements that behave very similarly to native DOM elements.

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Dynamic Content](./dynamic-content.md) | [Index](./index.md) | [Help with async iterators](./iterators.md) |



