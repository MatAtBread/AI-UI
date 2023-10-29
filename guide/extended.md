# Extended: Create new tags

You may remember from the definition of a *tag function* from [Your first web page](./your-first-web-page.md#the-general-function-signature-of-a-tag-creation-function-is):

```typescript
TagFunctionName(attributes?: AttributesOfThisTag, 
  ...children:(string | number | boolean | Node | Element | NodeList | HTMLCollection 
  /* Or an array of any combination of the former */)[]
  ): Element
```

`AIUI.tag(...)` returns *base tag functions* that create plain old DOM elements via [document.createElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement). These all accept optional attributes for the DOM element, and an optional list of children (nodes, elements, primitives, collections, promises, async iterables...).

In additional, all tag functions have an `extended` member:

```typescript
TagFunctionName.extended(spec:{
    constructed?: ()=>undefined | ChildTags;
    prototype?: object;
    ids?: { [id: string]: TagCreator; };
    styles?: string;
})
```

> _Note: there some simplification here, as the type `TagCreator` actually requires type parameters, and `prototype` does some type mapping to ensure `this` is correct within members, but the essential definitions are shown above_

In the following sections, we'll meet each of these in detail:

## [constructed()](./constructed.md) 
The `constructed()` method allows you to specify children, or modify any children passed by the tag function call, and carry out specific operations related to your new tag depending on the attributes passed.
## [prototype](./prototype.md) 
The `prototype` object allows you to default and define additional attributes and methods on your new tag.
## [ids](./ids.md) 
The `ids` object associates DOM Element IDs with specific tag types, so that a type-aware IDE such as VSCode can correctly  prompt you when referencing the children that make up a tag composed of children.
## [styles](./styles.md) 
The `styles` string will create specific CSS style rules for your tag.

All of these members are optional, so the code:

```javascript
const MySpecialDiv = div.extended({});
```
...works, but your new tag isn't that special - it will behave just like the base `div` tag function.

There is an additional `extended(...)` signature which provides a _"private"_ object associated with your element (via an internal closure):

...you can find more details about why this is useful and how to use it in [Private element data, getters & setters](./instance.md)

# Example

In order to explain how these four members interact and support each other, we're going to consider a new a example, web page that gets weather data from a remote source, creates charts for the user, and a QR codes that represent the chart that can be shared.

We're going to do this by creating tags that encapsulate the data source, the chart UI and the QR cods, and show how we can statically layout and style the page, whilst ensuring the page remains dynamically updated according to user input.
____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Iterators](./iterators.md) | [Index](./index.md) | [`constructed()`](./constructed.md) |



