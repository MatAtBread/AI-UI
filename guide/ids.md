# Type safe elements using `ids`

> _Although this feature talks about TypeScript a lot, even vanilla JS developers should look at the final section on [maintaining references](#maintaining-references), which explains how AIUI features help you manage children in extended tags_

One of the irritations in writing DOM code in TypeScript is that there is no clear relationship between the DOM APIs and the types of the underlying elements.

A call to `document.getElementById("thing")` will return `null | HTMLElement`. You can use generics on some functions where you're _telling_ TypeScript what the type should be, but you'll still have to litter your code with these type parameters.

AI-UI allows you to codify the types of children in extended tags in a way that avoids you having to repeat yourself everywhere.

Below we have an example of a extended tag that represents an arbitrary type "ProductInfo". We want to expose a method "updateStockLevel" that changes the check status on the checkbox.

```typescript
const InfoBlock = div.extended({
  declare: {
    // some data type this extended tag should represent
    product: undefined as ProductInfo,
    updateStockLevel(){
      // ????
    }
  },
  override: {
    className: 'InfoBlock',
  },
  constructed(){
    return [
      div("SKU", this.product.sku),
      div(
        span("Units", this.product.units),
        span("Sales", this.product.sales)
      ),
      input({ type: 'checkbox', checked: this.product.stock > 0 })
    ];
  }
})

```

The problems is how to refer to the checkbox from inside the `declare: updateStockLevel`. There are a few solutions to this. The first we have seen previously is to use `iterables` for the stock level and simply assign a value to it rather than call `elt.updateStockLevel()`, but let's assume for whatever reason this is undesirable in this case, and we just want a method to call.

1. Use local a variable
```diff
const InfoBlock = div.extended({
  declare: {
    // some data type this extended tag should represent
    product: undefined as ProductInfo,
+   updateStockLevel():void {}
-   updateStockLevel(){
-     // ????
-   }
  },
  override: {
    className: 'InfoBlock',
  },
  constructed(){
+   const stockCheck = input({ type: 'checkbox', checked: this.product.stock > 0 });
+   this.updateStockLevel = ()=> stockCheck.checked = this.product.stock > 0;
    return [
      div("SKU", this.product.sku),
      div(
        span("Units", this.product.units),
        span("Sales", this.product.sales)
      ),
-     input({ type: 'checkbox', checked: this.product.stock > 0 })
+     stockCheck
    ];
  }
})
```
Ok, so this works, but it has some nastiness:
* Because the variable `stockCheck` is local to the `constructed()` function, you need to declare and implement `updateStockLevel` in two different places
* It kind of breaks the flow of the layout returned by `constructed()`. You can kind of address this with:
```diff
  constructed(){
-   const stockCheck = input({ type: 'checkbox', checked: this.product.stock > 0 });
+   let stockCheck: ReturnType<typeof input>;
+   this.updateStockLevel = ()=> stockCheck.checked = this.product.stock > 0;
    return [
      div("SKU", this.product.sku),
      div(
        span("Units", this.product.units),
        span("Sales", this.product.sales)
      ),
+     stockCheck = input({ type: 'checkbox', checked: this.product.stock > 0 })
-     stockCheck
    ];
  }
```
...but you quickly get into a mess if you have dependancies between your local variables, for example if some of the elements are created conditionally, or forward reference local variables created later in the DOM tree that haven't been initialised.

Basically, this technique works well for simple layouts when you just need to grab a reference, but isn't scalable and doesn't solve the problem of forward references or needing to assign an implementation to a stub method.

2. Use `Instance` variables.

These are discussed [here](./instance.md). Whilst this will solve the issue of having to assign an implementation to a stub method, it only helps a little in the forward reference case.

3. Use DOM methods to find and traverse the tree locally

Let's go back to our original code and add the calls.

```typescript
    updateStockLevel(){
      this.querySelector('[type=checkbox]').checked = this.product.stock > 0;
    }
```
Ok, but TypeScript will complain about the `.checked` member, since it's not really able to work out that this string really refers to an DOM HTMLInputElement, so we're back to type casts and generic parameters.

AIUI allows extended tags to define a set of types and ids, like this:

```typescript
const InfoBlock = div.extended({
  ids:{
    stockLevel: input // Any child with an id of 'stockLevel' should be an input
  },
  declare: {
    // some data type this extended tag should represent
    product: undefined as ProductInfo,
    updateStockLevel(){
      // this.ids.stockLevel is an input, so it must have a checked property
      this.ids.stockLevel.checked = this.product.stock > 0;
    }
  },
  override: {
    className: 'InfoBlock',
  },
  constructed(){
    return [
      div("SKU", this.product.sku),
      div(
        span("Units", this.product.units),
        span("Sales", this.product.sales)
      ),
      // create the input with one of the decalred ids
      input({ id: 'stockLevel', type: 'checkbox', checked: this.product.stock > 0 })
    ];
  }
})
```

The key features here are the `ids: { .... }` block which relates the ids to the tag functions that create them, and the use of `this.ids.stockLevel`. All elements created by AIUI have an `ids` property that essentially works like "element.getElementById(...)" (which doesn't actually exist), but does so in a type-safe manner by referring to the `ids` block.

### Maintaining references

You can declare as many `ids` as you need, and they will be resolved at run-time. If the element `xxx.ids.yyy` refers to is destoyed and recreated or updated by an async operation (or anything else), it will continue to be referenced for example by "updateStockLevel" in our example. Local variables (or instance variables) can't do this - they hold a reference to a _specific_ DOM element, not a reference to a position within a DOM tree.

> Important! Avoiding leaks

If your input was itself dynamic (for example if defined you `product` as `iterable`, and updated the `product` after the `InfoBlock` was constructed), AI-UI could destroy and re-create it, and now your local variable holds a reference to an un-mounted element, which will leak, and more importantly, won't work: if you update the `stockLevel.checked`, you're now updating the un-mounted DOM element, and nothing will change in the UI.

Use `this.ids...` and it will always refer to the mounted child with than ID, if it exists.
____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Composition with `constructed()`](./constructed.md) | [Index](./index.md) | [Styling extended elements](./styles.md) |

