# JSX

AIUI can be used with JSX. Specifically, it has been tested with Typescript's JSX transpiler.

Your source files should end with the file extension ".tsx".

Typescript provides 2 methods to integrate JSX into your code. Which are detailed after the following section.

## Should I use JSX?

Typescript (by design, at the time of writing) does not expose the types of the elements being created, as mentioned [here](https://www.typescriptlang.org/docs/handbook/jsx.html#the-jsx-result-type).

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
With these settings, Typescript automatically generates an import to reference the jsx functions.

You should set the following fields in the `compilerOptions` of your [tsconfig.json](https://www.typescriptlang.org/tsconfig#jsxFactory)
```json
{
    "jsxImportSource": "@matatbread/AI-UI/esm",
    "jsx": "react-jsx"
}
```

# Using JSX

If you wish to extend tags, you will still need to import the `tag()` function as per the previous examples.

However, instead of calling:

```typescript
const elt = div({ title: 'test' }, "foo");
```
...you can now use:
```typescript
const elt = <div title="test">123</div>;
```

JSX is essentially a different syntax for calling a function. As you can see, the above calls have a one-to-one correspondence with each other interms of parameters and values.

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
