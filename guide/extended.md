# Extended: Create new tags

You may remember from the definition of a *tag function* from [Your first web page](./your-first-web-page.md#the-general-function-signature-of-a-tag-creation-function-is):

```typescript
TagFunctionName(
  attributes?: AttributesOfThisTag, 
  ...children:(string | number | boolean | Node | Element | NodeList | HTMLCollection 
  /* Or an array of any combination of the former */)[]
): Element
```

`AIUI.tag(...)` returns *base tag functions* that create plain old DOM elements via [document.createElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement). These all accept optional attributes for the DOM element, and an optional list of children (nodes, elements, primitives, collections, promises, async iterables...).

In additional, all tag functions have an `extended` member:

```typescript
TagFunctionName.extended(spec:{
  prototype?: object;
  constructed?: ()=>undefined | ChildTags;
  ids?: { [id: string]: TagCreator; };
  styles?: string;
})
```
> _Note: there is some simplification here, as the type `TagCreator` actually requires type parameters, and `prototype` does some type mapping to ensure `this` is correct within members, but the essential definitions are shown above_

In the following sections, we'll meet each of these in detail:

## [prototype](./prototype.md) 
The `prototype` object allows you to set values for existing attributes and define additional attributes and methods on your new tag.
> _Note: Due to [this limitation in TypeScript](https://github.com/microsoft/TypeScript/issues/47599) you should declare the `prototype` field **before** the `constructed()` member to ensure all the prototype types are captured. This actually depends on the exact nature of your prototypes, such as whether it contains functions that aren't context free._

## [constructed()](./constructed.md) 
The `constructed()` method allows you to create children, or modify any children passed by the tag function call, and carry out specific operations related to your new tag depending on the attributes passed when it is created, before it is placed into the DOM.
## [ids](./ids.md) 
The `ids` object associates child DOM Element IDs within your tag with specific tag types, so that a type-aware IDE such as VSCode can correctly prompt you when referencing the children that make up a tag composed of children.
## [styles](./styles.md) 
The `styles` string will create specific CSS style rules for your tag.

All of these members are optional, so the following code works, but your new tag isn't that special - it will behave just like the base `div` tag function.

```javascript
const MySpecialDiv = div.extended({});
```

There is an additional `extended(...)` signature which provides a _"private"_ object associated with your element (via an internal closure). You can find more details about why this is useful and how to use it in [Private element data, getters & setters](./instance.md). For now, we'll just use the simple, non-functional version of `extended()`.

```typescript
TagFunctionName.extended((privateInstanceData: MyPrivateInstance) => {
  prototype?: object;
  constructed?: ()=>undefined | ChildTags;
  ids?: { [id: string]: TagCreator; };
  styles?: string;
})
```

# Example

In order to explain how these four members interact and support each other, we're going to consider a new a example, web page that gets weather data from a remote source and creates charts for the user.

We're going to do this by creating tags that encapsulate the data source and the chart UI, and show how we can statically layout and style the page, whilst ensuring the page remains dynamically updated according to user input.

You can see the source [here](./examples/ts/weather.ts), or try it [here](https://raw.githack.com/MatAtBread/AI-UI/0.9.11/guide/examples/ts/ts-example.html#weather.ts)

in the following sections, we'll go through the code in more detail, explaining how the four members of an `extended({...})` definition work together, improving the implementation on the way.

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Iterators](./iterators.md) | [Index](./index.md) | [`constructed()`](./constructed.md) |



