# Link elements dynamically: `when`

The `when` method in AIUI creates async iterators from standard DOM elements and events. It is one of two members (along with ids) added to all DOM elements created by AIUI.

The method signature is:

```typescript
when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
```

In it's simplest form, `when` provides a way to receive and handle DOM events dispatched by an element.

```typescript
// Create an async iterable that yields change events dispatched by the specified element
elt.when('change').consume(event => console.log(event));

// This is essentially equivalent to
elt.addEventListener('change', event => console.log(event));
```
Unlike the basic DOM event model, the iterator can be instantiated multiple times and have multiple consumers, and it self-manages its own termination, for example when it is removed from the DOM or the consumer throws and exception.

`elt.when` accepts a variable argument list, and the events will be merged:
```typescript
// Create an async iterable that yields change events dispatched by the specified element
elt.when('change','input','click').consume(event => console.log(event.type)); // Outputs change, input or click
```
As well as listening for events on the specified element, the arguments can also listen for events on children (and sub-children) of the specified element:
```typescript
// Create an async iterable that yields change events dispatched by the specified children
elt.when('change:#info','click:#done').consume(event => console.log(event.target.id)); // Outputs done or info
```
This is especially useful within [extended](./extended.md) tags you create yourself.

In the following example, the content of the '#searchResults' child div is mapped from the click event on the '#search' button. This example shows how `ids` and `when(...)` work together to allow you to specify the layout statically, whilst managing the events so that the content dynamically represents the require results. Specifically, the type signature for `elt.when(...)` validates that the supplied "event-type:#id" exists and is valid.

```typescript
const SearcPanel = div.extended({
  ids:{
    searchText: input,
    search: button
  },
  constructed() {
    return [
      div(
        input({id: 'searchText'}),
        button({id: 'search'})
      ),
      div({id: 'searchResults'},
        this.when('search:#click').map(async _ => {
          const results = await fetchSearchResults(this.ids.searchText.value);
          return results.map(result => SearchResult(result))
        })
      )
    ]
  }
});
```
The use of ids means that the actual element or DOM layout doesn't affect the logic. The fact that the '#search' is inside a nested div is irrelevent - you could change the DOM layout within the extended tag to reflect a different UI design and the logic still holds, as long there is an element that can accept clicks somewhere within the SearchPanel div.

## Event-selector parameters (the `WhenParameters` type)

The parameters to `when` can be any combination of:
* Any async iterator
* Any DOM Element
* Ant Promise
* A string in the format "*eventType*:*cssSelector*". The *eventType* (and colon separtor) can be absent, in which case the default value is "change". The CSS selectors must begin with #, . or [] (being the CSS prefixes for ID, class and attribute). The CSS selectors are passed to the standard DOM function [querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll). If absent, the event handler is relative to the element itself, not one of it's children.
* A "pseudo" event selector string, beginning with "@".

## `'@ready'` pseudo-event selector.

The `'@ready'` pseudo-event selector tells `when` to fire an empty event `{}` when all the elements referenced in the parameter list have been mounted into the document. This is very useful when you have elements that are created asynchronously or out of order, and you want to do some processing or initialisation when they have all been rendered by the browser.

Perhaps we want to prevent searching if no text was entered. Obviously, we can test that `this.ids.searchText.value` is not falsy before running the search, but this provides no feedback to the user as to why nothing happened.

Let's disable the '#search' button when the '#searchText' is empty:

```typescript
const SearcPanel = div.extended({
  ids:{
    searchText: input,
    search: button
  },
  constructed() {
    return [
      div(
        input({id: 'searchText'}),
        button({
          id: 'search',
          // Set the disabled state of the button when searchText changes, and when it it initially mounted in the DOM
          disabled: this.when('input:#searchText','@ready')(_ => !Boolean(this.ids.searchText.value))
        })
      ),
      div({id: 'searchResults'},
        // When the search button is clicked, fetch the results and display them to the user
        this.when('search:#click').map(async _ => {
          const results = await fetchSearchResults(this.ids.searchText.value);
          return results.map(result => SearchResult(result))
        })
      )
    ]
  }
});
```

The return value of `when` is an async iterator that is the merged result of all the parameters. Helpers are installed on the result, so you can `map`, `filter`, etc. The return value can also capture a function that is used as a mapper, so:

```typescript
  elt.when('change').map(e => e.type)
```
...is identical to:
```typescript
  elt.when('change')(e => e.type)
```
It is very common to actually ignore the event or parameter yielded by `when`, and directly address the elements:
```typescript
  elt.when('change:#searchText')(_ => this.ids.searchText.value).consume(t => console.log("Search for "+t));
```

### Global `when`
There is also a global version exported from ai-ui of the form which can be used to work with elements not created with AI-UI, which therefore don't that the `element.when(...)` method.

```typescript
export function when<S extends WhenParameters>(container: Element, ...sources: S): WhenReturn<S>;

// This...
when(container, 'click:#go', 'mouseover:.ListItem')(...)...
// ...is the same as
container.when('click:#go', 'mouseover:.ListItem')(...)...
// ...but can be used with elements created by something else
when(document.body, 'click:#go', 'mouseover:.ListItem')(...)...
```


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Private element data](./instance.md) | [Index](./index.md) | [Tag API reference](./api-reference.md)  |

