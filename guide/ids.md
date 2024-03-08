# Type safe elements using `ids`

> _This is a Typescript-orientated feature, if you don't use Typescript, this feature provides no functionaliiy_

One of the irritations in writing DOM code in Typescript is that there is no clear relationship between the DOM APIs and the types of the underlying elements.

A call to `document.getElementById("thing")` will return `null | HTMLElement`. You can use generics on some functions where you're _telling_ Typescript what the type should be, but you'll still have to litter your code with these type parameters.

AI-UI allows you to codify the types of children in extended tags in a way that avoids you having to repeat yourself everywhere.

Consider the an app which contains two of the charts defined in the [previous page](./constructed.md). How can we tell them apart, and safely address them individually?
```typescript
const Charts = div.extended({
  constructed() {
    return [
      Chart({ label: 'This Week' }),
      Chart({ label: 'Last Week' })
    ]
  }
});

```


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [# Composition with `constructed()`](./constructed.md) | [Index](./index.md) | [Type safe elements](./ids.md) |

