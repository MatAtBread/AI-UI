
# Tag API reference

The following sections list the full `tag` export API, tag functions (base and extended) and the elements they create. Most of these functions are detailed elsewhere in the guide a few are documented here for completeness, but are used only in specialised or unusual contexts. Some of the functions that are members of the `tag` function are also exported directly for simplicity of use within environments supporting JavaScript imports and Typescript, but the functions are the same in all cases.

Note, these are function/data exports. Type definitions & declarations can be found clicking on the links.

### const tag: [TagLoader](https://github.com/MatAtBread/AI-UI/blob/main/module/esm/ai-ui.d.ts#L11);
See below

### function when&lt;S extends [WhenParameters](https://github.com/MatAtBread/AI-UI/blob/main/module/esm/when.d.ts#L2)&gt;(container: Element, ...sources: S): [WhenReturn](https://github.com/MatAtBread/AI-UI/blob/main/module/esm/when.d.ts#L5)&lt;S&gt;
See [when](./when.md)

## tag
```typescript
function tag&lt;Tags extends string, P extends (Partial&lt;Element&gt; & OtherMembers)&gt;(nameSpace: string, tags: Tags[], prototypes?: P): Record&lt;string, TagCreator&lt;P & PoElementMethods & Element&gt;&gt;;
```
All the parameters are optional, but must be supplied in order. The default namespace is HTML. The default set of tags is the set of HTML node names. The default prototype object (additional functions applied to all created tags) is empty.

The return value is an object containing named tag creator functions that create and return the required tags. The type definitions attempt to validate the parameters where possible (ie. it is a type error to create an HTML tag function for an unknown node name, or reference the returned tag function if it was not specified by the 'tags' parameter).

### tag.nodes
```typescript
function tag.nodes(...c: ChildTags[]): (Node | ((Element & PoElementMethods)))[];
```
The is the core of the routine that returns DOM nodes for a set of [ChildTags](https://github.com/MatAtBread/AI-UI/blob/main/module/esm/tags.d.ts#L2). It is called when a tag function contains children, or when a `constructed()` function has a non-undefined return value.

It is provided so you can create tags on demand without wrapping them in a tag function and then pass them to standard DOM functions, if required.

### tag.UniqueID
The symbol that identifies the extended tag unique ID within the `Instance` passed to the [`extended`](./instance.md) function.

### tag.augmentGlobalAsyncGenerators()
The function that attaches async iterators helper functions to all JavaScript async generator results. See [Iterators](./iterators.md) for more details.

## tagFn
Tag functions are returned by the `tag` function above, and by calls to `tagFn.extended(...)`
```typescript
function tagFn(attributes?: object, ...c?: ChildTags[]): Element;
```
Note that the initial attributes are type-checked, rather than a plain "object". The return value is always a single DOM Element. The attribute members and children can be supplied directly. omitted, supplied via a Promise or an async iterators.

### tagFn.extended
```typescript
function tagFn.extended({
  declare?: object;
  iterable?: object;
  override?: object;
  constructed():ChildTag | void | undefined;
}): TagCreator;
```
Creates a new tag creating function. See [extended](./extended.md).
The created function has the following additional members.

### tagFn.overrides
The definition object used to create the extended tags

### tagFn.super
The tag function that this tag function extends. For base tags, this will throw an exception.

### tagFn.valueOf()
The string description of this tag function. This includes its hierarchy, and which properties are declared by each member of the hierarchry, as far as the base tag for example:

`console.log(h2.valueOf())`
> TagCreator: &lt;h2&gt;

From the [WaetherForecast](https://github.com/MatAtBread/AI-UI/blob/main/guide/examples/ts/weather-10.ts) example:

`console.log(WeatherForecast.valueOf())`
> &lt;ai-WeatherForecast&gt;: {geo}  
>   ↪ &lt;ai-Chart&gt;: {label, data}  
>   ↪ TagCreator: &lt;img&gt;  

### tagFn.name
The name of the tag function

`console.log(h2.name)`
> &lt;h2&gt;

`console.log(WeatherForecast.name)`
> &lt;ai-WeatherForecast&gt;

### tagFn[keyof (BaseTagFunction.override | BaseTagFunction.declare)]
The defined overrides and declares are also referenced by the tag creating function, so you call directly call or reference them. This is most applicable when you wish to call a super function:
```typescript
const VanillaDiv = div.extended({
  declare:{
    info() { ... }
  }
});
const MyDiv = VanillaDiv.extended({
  override:{
    info() {
      // Call the super implementation of click.
      return VanillaDiv.info.call(this);
    }
  }
})
```

## elt
Elements created by tag creating functions (base or extended tag functions) are standard DOM elements, and inherit all their properties and methods. The following are also added:

### elt.when
Creates an async iterator that yields event from the element, or it's children. See [when](./when.md)

### elt.ids
Provides type-safe access to children of an element. For extended tag defintions with an `ids` member, Typescript types will be provided for the child. See [ids](./ids.md)

### elt.constructor
References the tag creating function that create the element.

```javascript
div().constructor === div; // True

// Create an element using the tag constructor function MyDiv
const e = MyDiv();
// Create an element using the same function that created "e"
const f = e.constructor("child","child");
// Create an element using the same function that "e" was extended from
const g = e.constructor.super("child");
```

### elt.attributes
Assigns a deep partial property object, possibly containing Promises and async iterators to the attributes of this element:
```javascript
elt.attributes = {
  id: "me",
  class: "MyClass"
};
```
This is the same operation that is executed when a tag creating function is run with the first parameter being an attribute object.

Note that the standard DOM [Element attributes](https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) is a read-only NamedNodeMap and is unaffacted by this augmentation.

### elt[keyof (TagFunction.override | TagFunction.declare | TagFunction.BaseTagFunction)]
Elements created by tag creating function have all methods and properties defined by that function, and all the tag creating functions it is extended from.


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Link elements dynamically: `when`](./when.md) | [Index](./index.md) | [Advanced tag creation](./tag-creation.md) |
