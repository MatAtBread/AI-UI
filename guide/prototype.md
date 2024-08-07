# Adding methods & attributes with `declare`, `override` & `iterable`

## override

Remeber how you can create a DOM element?

```javascript
const d = div({ id: 'foo' }); // Create a div element, with the specified ID
const e = input({ type: 'password', style: { color: 'green' }}); // Create a password input field with green text
```
Note how at each level, every field is optional: you don't have to supply all attributes, or all members of a structured attribute like `style`. You are specifying which values within the attributes should be _overridden_. All other attributes will have their default value, unless they are further overriden by the call to the extended tag function that actually creates the element, or by another call via `extended(...)`.

As well as doing this when an element is created, you can specify your own extended tags that have different defaults:

```javascript
const RedBox = div.extended({
  override:{
    style:{
      backgroundColor: 'red'
    }
  }
});
....
// creates a div with id='foo', and large text "Bar" on a red background
const r = RedBox({ id: 'foo', style: { fontSize: '150%' }}, "Bar");
```
Overrides can themselves be overriden when the element is actually created (by specifying the attribute in the first parameter), or in a further extension:
```javascript
const ClickAndKill = RedBox.extended({
  override:{
    // Override the default click event handler
    onclick() { this.remove() }
  }
});

// Create an element (with a red background), the destroys itself when you click it and append it to the document body.
document.body.append(ClickAndKill("click me"));
// Create an element (with a **blue** background), the destroys itself when you click it and append it to the document body.
document.body.append(ClickAndKill({
  style:{
      backgroundColor: 'blue' // Overrides the value in RedBox
  }
},"click me"));

```

`overrides` must be of the correct type. TypeScript will generate a warning if you try to assign, for example, a number to string attribute. Note that most DOM attributes are strings, even if they are numeric in nature, for example `style.opacity` is a string. In these cases, use the standard JavaScript literals/expressions like `${num}`, or casts like `String(0.5)` or `num.toString()`.

> AI-UI `element.attributes`
>
> The standard read-only property of an Element `readonly attributes: NamedNodeMap;` is automagically extended by AI-UI to be read-write. The writeable value is also a deep partial like `override`, or the optional attributes object when a tag function is called. This means that you can also assign attributes with a statement like:
>
>```javascript
>  const i = img();
>  i.attributes = {
>    src: "pic.jpg",
>    style:{
>      width: "50%"
>    }
>  };
>```
>
> In common will all AI-UI property assigments, the values can be *async iterators* which will update the specified attributes when they yield a new value.


## declare

`declare` is just like override, except it's for defining new properties that don't exist in the base tag you're extending. You'll get a TypeScript error if you try to declate an attribute that already exists in the base tag.

```typescript
const NamedBox = div.extended({
  declare:{
    getCenter(): { x: number, y: number } {
      const r = this.getBoundingClientRect();
      return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2}
    },
    // If you need to specify a wider type than the default value, you can do it here
    friendlyName: null as string | null
  }
});

const n = NamedBox("The quick brown fox...");
document.body.append(n);
console.log(n.getCenter());
```

You can declare any type of attribute - getters, setters, functions, objects, primitives can all declared and will be set on the element when it's created (unless overridden by the initial optional attributes passed to the tag function).

## iterable

Iterable properties are like the declarations above, but have the additional feature of being `async iterables`. They are very useful and very powerful, and can be used to make your extended tags behave like standard DOM tags with almost no effort.

```javascript
const BetterButton = button.extended({
  iterable:{
    inactive: true
  },
  override:{
    onclick() { this.inactive = true },
    onmouseout() { this.inactive = false }
  },
  constructed() {
    // Set the attributes of this element "declaritively"
    this.attributes = {
      style:{
        color: this.inactive.map!(f => f ? 'grey' : 'red')
      },
      disabled: this.inactive.map!(f => f)
    };
    // The above is actually the same as - the code style is a matter of personal preference.
    // Set the attributes "procedurally"
    this.inactive.consume!(f => {
      this.style.color = f ? 'grey' : 'red';
      this.disabled = f;
    });
  }
});
```

Iterable properties are both normal properties that you can assign and read (eg `console.log(elt.inactive)` and `elt.inactive = x > 10` are valid statements), **AND** async iterators that can be mapped, filtered, merged, etc. They are also, like all attributes, accessible from outside the tag definition:

```typescript
document.body.append(BetterButton({id: 'bar'}, "Foo"));
....
const myButton: ReturnType<typeof BetterButton> = document.getElementById('bar');
myButton.inactive.consume(f => console.log("Button inactive",f));
document.body.append(div("Activity status", myButton.inactive));
....
myButton.inactive = true; // Logs "Button inactive", updates the text after "Activity status" and sets the button text color and disabled status
```

### Caveats
Iterable properties are implemented by wrapping primitives in their respective "boxed" objects - the same as you'd get from `new Number(123)` or `new Boolean(true)`. This means that while you can do simple things like: `console.log(elt.numIter + 3, elt.numIter > 10); elt.numIter += 10;`, you need to be cautious with falsy/truthy expressions and equality tests **which are not coerced by JavaScript**.

In Javascript, objects are _always_ truthy (except for `null`), so
```javascript
new Number(123) === 123   // ❌ false, the Object representing 123 isn't strictly equal to 123
new Number(123) == 123    // ✅ true, the Object representing 123 will be converted to a number and is then equal to 123
```
This also means that:
```javascript
if (elt.numIter == 0)       // ✅ True if the iterable actually holds zero, since weak equality coerces its operands to the same type
if (elt.numIter + 0)        // ✅ Binary arithmetic operator coerces numIter to a primitive
if (+elt.numIter)           // ✅ Unary arithmetic operator coerces numIter to a primitive
if (elt.numIter === 0)      // ❌ Never true, an object is never 0
if (elt.numIter)            // ❌ Always true - objects are always true. Use `!= 0`
if (!elt.numIter)           // ❌ Never true - objects are always true, and !true is falsy. Use `== 0`

if (elt.boolIter == true)   // ✅ Equality operator coerces boolIter to a primitive
if (elt.boolIter)           // ❌ Always true - objects are always true. Use `== true` or `!= false`
if (!elt.boolIter)          // ❌ Always false - objects are always true, and !true is falsy
if (elt.boolIter.valueOf()) // ✅ Explicitly retrieves the primitive value of the iterable

// Type coercion only occurs if one of the operands is itself a primitive
if (elt1.boolIter == elt2.boolIter)                       // ❌ Always false - the objects are different, even if they hold the same value. NOTE: this will be true if elt1 and elt2 represent the same element!
if (elt1.boolIter === elt2.boolIter)                      // ❌ Always false - same as above
if (elt1.boolIter.valueOf() == elt2.boolIter)             // ✅ Works - LHS is a primitive
if (elt1.boolIter == elt2.boolIter.valueOf())             // ✅ Works - RHS is a primitive
if (elt1.boolIter.valueOf() === elt2.boolIter.valueOf())  // ✅ Works - Both are primitive, no coercion required
```

The way iterables are implemented, you can always call `.valueOf()` to get the underlying primitive value the iterable represents, as in the example above. You might find the MDN article on [Type coercion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#type_coercion) helpful in understanding how JavaScript coerces types.

### iterable `object` properties

If the `iterable` declares an object rather than a primtive (string, number, bigint, ...), it is Proxied into an async iterable. This means changes to the source do not cause the iterable to yield updates - you have to update the property on the element, not what it was assigned from.

This means that:
```javascript
const p = { x: 10, y: 20 };
elt.center = p; // `centre` is an iterable property that is an object

if (elt.center === p)           // ❌ Never true: p has been proxied into elt.center, not referenced.
if (elt.center.valueOf() === p) // ✅ True - the value of the proxy is the same as the original object

p.x = 20;                       // ❌ No change - the source object `p` was proxied into elt.center & is a standalone object
elt.center.x = 30;              // ✅ Works - elt.center is iterable and will yield 30 to any consumers
p.x === 30;                     // ✅ Works - the underlying object was modified by the proxied assignment
```

### Iterable `object` yield hierarchy

Consider that you have an `iterable` property that is a nested object, eg:
```javascript
iterable: {
  obj: {
    n: 123,
    nest: {
      s: 'abc',
      flags: {
        b: false
      }
    }
  }
}
```

When you assigned to a value, such as `elt.obj.nest.s = 'def';`, not only does `elt.obj.nest.s` yield, but all it's ancestors (`elt.obj.nest`, `elt.obj`), since they have changed as well. Similarly, when you assign an object value, all children that you are consuming that have changed (even if created or removed) will also yield, since changing an object changes all of it's members.

> Note: Prior to v0.14.x, the follwing semantic differences also existed
> - iterable object properties must be declared
> - iterables can't be arrays
> - hierarchical yielding was inconsistent

### iterable `array` properties

As of v0.14.x, iterables can be arrays, however some caution is needed because `map` and `filter` properties clash with those of helped async iterators. To access the `Array` methods, `call` the Array prototype functions:

```typescript
const Chart = div.extended({
  iterable:{
    data: [] as number[]  // WRONG: doesn't work as intended
  },
  declare:{
    myFunc() {
      // ✅ Works - `slice` is member of data.values
      return this.data.slice(0,-1);
    },
    myOtherFunc() {
      // We want to map members of the array held in this.data, NOT map the async iterator this.data

      // ❌ `map` is the async helper function `map`. This fails as "n" represent the whole array when it changes
      return this.data.map(n => -n); // This will yield asynchronously when this.data changes!

      // ✅ Works - call Array#map on the array value
      return Array.prototype.map.call(this.data, n => -n);

      // ✅ Works - alternative syntax is a bit easier to read, but slightly less efficient
      return [].map.call(this.data, n => -n);
    }
  }
});

const ch = Chart();
ch.data = { values: [10,4,7,2] }; // Causes the chart to redraw since it's consuming this.data

const ch2 = Chart({ data: { values: [9.11.4.7] }}); // Creates a chart with default data for the iterable
```

Note, you get proxied Array members like `length` for free:

```typescript
  ch.data.length.consume(n => console.log("Data length", n));
  ch.data.push(12); // Causes the above to to yield and output "Data length: 3"
```

#### iterable 'async helpers' need a tweak to pass TypeScript type-checking
Finally, due to a limitation of TypeScript, although iterable properties are _always_ created with [helpers](./iterators.md), so you can `map`, `filter` and `merge` (they are built `multi`, so you never need to do this), they appear in the type declarations as optional. Without this, TypeScript will conplain that expressions like `elt.numIter = 10` aren't valid, as `elt.numIter` would require a defintion of `map`, `[Symbol.asyncIterator]`, etc.

To avoid this issue in TypeScript, follow the helper with a [`!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-) to tell TypeScript that the helper really is present, since it always is:
```typescript
this.numIter.map!(n => -n).consume(n => console.log(n))
// Here.........↑
```


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Extended: Create new tags](./extended.md) | [Index](./index.md) | [`constructed()`](./constructed.md) |


