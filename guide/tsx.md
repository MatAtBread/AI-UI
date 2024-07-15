# JSX & HTM

AIUI can be used with JSX & HTM. Specifically, it has been tested with TypeScript's JSX transpiler, and [htm v3](https://www.npmjs.com/package/htm).

These are *syntactic* helpers. They don't extend or restrict the functionality of AI-UI. You can still use async iterators and have minimal updates irrespective of the syntax you use to layout your markup.

JSX source files should end with the file extension ".tsx".

## What are the differences in syntax?
```javascript
/* If `name` were an async iterator (eg an `iterable`, or generator), all the DOM fragments below would contain a live text node and be minimally updated.*/
const name = "Mat";

// AI-UI uses normal functions to create fully typed elements
const elt = div("Hello ", span({style: 'color: green'}, " there ", name)); // elt is derived from HTMLDivElement

// HTM uses tagged template strings to create one or more Nodes
const elt = html`<div>Hello <span style="color: green"> there ${name}</span></div>`;  // elt is a Node or Node[]

// JSX uses a transpiler to change the markup into function calls that return an unknown type
const elt = <div>Hello <span style="color: green"> there {name}</span></div>;  // elt is any

```


## Should I use HTM?

HTM is a fabulously small library, however becuase the return of the HTML tagged template can be one or more HTMLElements (or AI-UI extended tags. or Nodes) of various types, it's not very type-safe. You can't dereference the result meaningfully, and if you specify incorrect properties you won't get any warning, unlike the AI-UI function syntax. Because it parses the HTML string, there is a small time penalty compared to the JS function calls AI-UI exposes by default.

To use HTM, check out the [README](https://www.npmjs.com/package/htm), and use the following code to initialise it with AI-UI:

```javascript
import htm from 'https://cdn.jsdelivr.net/npm/htm/mini/index.mjs';
import { tag } from 'https://cdn.jsdelivr.net/npm/@matatbread/ai-ui/esm/ai-ui.js';
const { div, createElement } = tag() ; // You can of course also destructure any AI-UI base tag functions at the same time
const html = htm.bind(createElement); // Bind tag().createElement to `htm` as per the README

...

// Create some HTML elements & stuff them in the document
const elts = html`<h1>Hello!</h1><div></div>`;
document.body.append(...elts);

...

// Example of AI-UI component using HTM and async iterators
const Increment = div.extended({
  iterable: {
    num: 1
  },
  constructed() {
    return html`
      <span>The specified number is: ${this.num.map(n => n+1)}</span>
      <button onclick=${()=>this.num = 0}>Clear</button>
    `;
  }
});

document.body.append(html`
  <${Increment} id="inc" num=100/>
  <span onclick=${()=>document.getElementById("inc").num = 123}>
    Click me!
  </span>
`);

```
You can see this example here: [source](./examples/ts/htm.ts), [Live demo](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/ts/ts-example.html?htm.ts)

## Should I use JSX?

TypeScript (by design, at the time of writing) does not expose the types of the elements being created, as mentioned [here](https://www.typescriptlang.org/docs/handbook/jsx.html#the-jsx-result-type).

This means that you lose much of the safety provided by the strong-typing built into AI-UI. Properties like `when`, `ids` all the standard HTMLElement properties & methods, as well as those declared by your extended tags are now "any", and therefore it's very easy to make mistakes.

There is an active (long-running) of this design decision and it's history [here](https://github.com/microsoft/TypeScript/issues/14729)

Consequently, whilst JSX might be aesthetically pleasing to some developers, it severely hampers the development of anything except the most trivial components.

## React &lt;= v16
This mechanism requires that you import an identifier into your code:

```typescript
import React from '@matatbread/AI-UI/esm/jsx-runtime.js';
```

You should set the following fields in the `compilerOptions` of your [tsconfig.json](https://www.typescriptlang.org/tsconfig#jsxFactory)
```json
{
    "jsxFactory": "React.AIUIJSX",
    "jsxFragmentFactory": "React.AIUIJSX",
    "jsx": "react"
}
```

You can if you wish use a name other than "React" for the factory names and your identified import.

## React &gt;= v17
With these settings, TypeScript automatically generates an import to reference the jsx functions.

You should set the following fields in the `compilerOptions` of your [tsconfig.json](https://www.typescriptlang.org/tsconfig#jsxFactory)
```json
{
    "jsxImportSource": "@matatbread/AI-UI/esm",
    "jsx": "react-jsx"
}
```

## Using JSX

If you wish to extend tags, you will still need to import the `tag()` function as per the previous examples.

However, instead of calling:

```typescript
const elt = div({ title: 'test' }, "foo");
```
...you can now use:
```typescript
const elt = <div title="test">foo</div>;
```

JSX is essentially a different syntax for calling a function. As you can see, the above calls have a one-to-one correspondence with each other in terms of parameters and values.

It works equally well with extended components:
```typescript
const { div } = tag();
const BlueThing = div.extended({
  override: {
    style:{
      color: 'blue'
    }
  },
  constructed() {
    // The JSX "fragment" <>....</> delineates an array of elements
    return <>
      <div>Heading</div>
      <div>{this.childNodes}</div>
    </>
  }
});

document.body.append(
  <BlueThing>
    <span>Thing 1</span>
    <span>Thing 2</span>
  </Bluething>
);
```

# Comparative example

The weather example is available in all 3 versions, so you can compare

|             |                                       |           |
|:------------|:-------------------------------------:|----------:|
| AI-UI functions | [source](./examples/ts/weather.ts)    | [Live demo](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/ts/ts-example.html?weather.ts) |
| HTM | [source](./examples/ts/weather.htm.ts)   | [Live demo](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/ts/ts-example.html?weather.htm.ts)
| JSX | [source](./examples/ts/weather.tsx)   | [Live demo](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/ts/ts-example.html?weather.tsx)