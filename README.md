### AI-UI

AI-UI ("Async Iterator User Interface") is a tiny, genuinely functional, UI framework for building dynamic HTML pages

It has 4 main features:

* A simple mechanism for defining and using standard DOM elements, encouraging both _composition_ and _inheritance_
* A super-cool syntax (`when`) for inter-component communication using standard DOM events 
* Dynamic DOM attributes and contents via standard JS async constructs - set your styles & contents with Promises and async iterables.
* A set of extensions to the standard browser/JS async iterables & generators, like map, filter, throttle, broadcast...

Design goals for AI-UI are:

* Full use and compatability with standard DOM elements, events and JS async constructs like Promises, generators & iteratots - no Proxy voodoo, special compilation steps or additional syntax to learn.
* Tiny footprint
* Purely client-side, but of course being standard JS & DOM Elements, can be generated by your favourite dev tools.

It provides first-class support for Typescript (it is written in Typescript), prompting you with a rich set interfaces for your newly defined tags, and supports `tsx` if you're a fan.

Think of it as a spreadsheet in your browser - you define the elements, styles and contents by referencing other elements and data sources, and you can encapsulate you dynamic tags for instant re-use.

## Use in a browser

* ES6 import
```
  import * as AIUI from '../module/esm/ai-ui.min.js'; // You can, of course, just import the members you need
```

* <script> tag
```
  <script src="../module/lib/ai-ui.js"></script> <!-- defines global AIUI -->
```

Get started with simple, easy to maintain web pages that work seamlessly with user-input, remote data sources and other dynamic sources of data. No hooks, contexts, lifecycles, new events models to learn or unnecessary complexity.

Check out the [guide](./guide/index.md}, or jump straight to the tutorial with [your first web page](./guide/your-first-web-page.md).

Interested in contributing? Please check out the [developers](./guide/developers.md) page.
