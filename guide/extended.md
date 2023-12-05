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
  override?: object;
  declare?: object;
  iterable?: object;
  constructed?: ()=> undefined | ChildTags;
  ids?: { [id: string]: TagCreator; };
  styles?: string;
})
```
> _Note: there is some simplification here, as the type `TagCreator` actually requires type parameters, and does some type mapping to ensure `this` is correct within members, but the essential definitions are shown above_

In the following sections, we'll meet each of these in detail:

## [override](./prototype.md) 
The `override` object allows you to set values for existing attributes in the base tag from which the current is being extended. It's a simple way to say that "I want a new tag like an existing tag, but with some properties (style, src, onclick, etc...) set to a different default value".

## [declare](./prototype.md) 
The `declare` object allows you to declare new attributes and methods on your new tag. The AI-UI type won't let you re-declare a property, If you want to give an existing property a new value, you should `override` it instead.

## [iterable](./prototype.md) 
The `iterable` object allows you to *iterable attributes* on your new tag. These are both primitive attributes _and_ async iterators that automatically yield values when they are assigned to, so (for example) the snippet `div("Hello ", this.userName)` will automatically update the DOM when something executes `myElement.userName = "Joe";`. Iterable attributes can primitives or objects, but not functions or symbols, and there some JavaScript caveats around their usage.

We'll give some examples of using `iterable` later.

## [constructed()](./constructed.md) 
The `constructed()` method allows you to create children, or modify any children passed by the tag function call, and carry out specific operations related to your new tag depending on the attributes passed when it is created, before it is placed into the DOM.

> _Note: Due to [this limitation in TypeScript](https://github.com/microsoft/TypeScript/issues/47599) you should declare the `constructed()` method **after** the others to ensure all the prototypical member types are captured. This actually depends on the exact nature of your prototypes, such as whether they contains functions that aren't context free._

## [ids](./ids.md) 
The `ids` object associates child DOM Element IDs within your tag with specific tag types, so that a type-aware IDE such as VSCode can correctly prompt you when referencing the children that make up a tag composed of children. It's not used at run-time, but simply provides type information to the IDE.

## [styles](./styles.md) 
The `styles` string will create specific CSS style rules for your tag. This is especiallu useful when your styles are hierarchical or rqeuire pseudo selectors which can't be easily specified in a normal CSSStyleDeclaration.

All of these members are optional, so the following code works, but your new tag isn't that special - it will behave just like the base `div` tag function.

```javascript
const MySpecialDiv = div.extended({});
```

There is an additional `extended(...)` signature which provides a _"private"_ object associated with your element (via an internal closure). You can find more details about why this is useful and how to use it in [Private element data, getters & setters](./instance.md).

```typescript
TagFunctionName.extended((privateInstanceData: MyPrivateInstance) => {
  prototype?: object;
  constructed?: ()=>undefined | ChildTags;
  ids?: { [id: string]: TagCreator; };
  styles?: string;
})
```
For now, we'll just use the simple, non-functional version of `extended()`.

# Example

In order to explain how these members interact and support each other, we're going to consider a new a example, web page that gets weather data from a remote source and creates charts for the user.

We're going to do this by creating tags that encapsulate the data source and the chart UI, and show how we can statically layout and style the page, whilst ensuring the page remains dynamically updated according to user input.

You can see the source [here](./examples/ts/weather.ts), or try it [here](https://raw.githack.com/MatAtBread/AI-UI/0.9.11/guide/examples/ts/ts-example.html?weather.ts)

in the following sections, we'll go through the code in more detail, explaining how the members of an `extended({...})` definition work together, improving the implementation on the way.

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Iterators](./iterators.md) | [Index](./index.md) | [`constructed()`](./constructed.md) |



