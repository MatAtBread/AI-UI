# AI-UI

AI-UI ("Async Iterator User Interface") is a tiny, genuinely functional, UI framework for building dynamic HTML pages

### It has 4 main features:

* A simple mechanism for defining and using standard DOM elements, encouraging both composition _and_ inheritance
* A super-cool syntax (`when`) for inter-component communication using standard DOM events, avoiding the spaghetti of event listeners and state management
* Dynamic DOM attributes and contents via _standard_ JS async constructs - set your styles & content with Promises and async iterables.
* A set of extensions to the standard browser/JS async iterables & generators, like map, filter, throttle, broadcast...

### Design goals for AI-UI are:

* Specify dynamic content in a _static_ DOM layout
* Full use and compatability with standard DOM elements, events and JS async constructs like Promises, generators & iterators - no special compilation steps, additional syntax, virtual DOM or complex API to learn. Freely mix and match with _any_ existing UI toolkit which renders HTML or generates DOM nodes.
* Tiny footprint (6Kb minified), zero dependencies
* Purely client-side, but of course being bullt with standard JS & DOM Elements, can be generated by your favourite dev tools.
* First-class support for Typescript (it is written in Typescript), prompting you with a rich set interfaces for your newly defined tags, and it supports `tsx` if you're a fan.

Think of it as a spreadsheet in your browser - you define the elements, styles and contents by referencing other elements and data sources, and you can encapsulate you dynamic tags for instant re-use.

_Spreadsheet? How does that work?_

Consider the static DOM layout, using a functional JS snippet:
```javascript
  function now() {
    return new Date().toString();
  }

  div(
    "The time is:", now()
  )
```
What if the expression for the time could be **truly dynamic**, without and external rendering, diffing or "reaction"? If you could just enter the expression once, and the framework did the DOM updates, event handling and everything else?

That's what AI-UI does. Child elements and attributes can be living, changing expressions through the use of JavaScripts async iterators:
```javascript
  const sleep = (t) => new Promise(resolve => setTimeout(resolve, t));

  async function *ticktock() {
    while (true) {
      yield new Date().toString();
      await sleep(1000);
    }
  }

  ...

  div(
    "The time is:", ticktock()
  )
```
That's it! A working clock, just by changing the second child in the `<div>` to an async iterator! [See for yourself](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/readme.html)

AI-UI comes with a core set of functions & methods to turn DOM events into async iterators, so your content can be derived from other elements, and a toolkit for mapping, filtering and processing async iterators in a natural way so your data flows throughout you system, filtered down to do the most minimal, performant DOM updates possible.


## Use in a browser

### ES6 import
```
  import * as AIUI from 'https://www.unpkg.com/@matatbread/ai-ui/esm/ai-ui.js';
  // You can, of course, just import the members you need...
  import { tag } from 'https://www.unpkg.com/@matatbread/ai-ui/esm/ai-ui.js';
```

### HTML `<script>` tag
```
  <script src="https://www.unpkg.com/@matatbread/ai-ui/dist/ai-ui.min.js"></script>
  <!-- defines global AIUI -->
```

### CommonJS (for bundling or other environments)

Bundle source: `npm i @matatbread/ai-ui`
```
  const { tag } = require('@matatbread/ai-ui');
```

Get started with simple, easy to maintain web pages that work seamlessly with user-input, remote data sources and other dynamic sources of data and interaction without the complexity of a bespoke build or execution framework.

* Check out the [guide](https://github.com/MatAtBread/AI-UI/tree/main#readme) on GitHub
* Jump straight to the tutorial with [your first web page](https://github.com/MatAtBread/AI-UI/blob/main/guide/your-first-web-page.md)
* See all the docs in the [index](https://github.com/MatAtBread/AI-UI/blob/main/guide/index.md)

Interested in contributing? Please check out the [developers](https://github.com/MatAtBread/AI-UI/blob/main/guide/developers.md) page.

AI-UI and it's closed-source precursors have been used in used a variety production contexts for years by thousands of end users:
* Home Automation UI
* Advanced analytics UI
* Embedded Webcam UI
* Internet dating Single Page Applications for mobile & desktop
