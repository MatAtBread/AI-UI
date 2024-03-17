# Private element data, getters & setters

Exposing properties via `declare` and `iterable` allows you expand the interface for an extended tag. Similarly `override` and `constructed` allows you to assign values and create behaviours to implement more specific tags.

However, it is a common requirement to need to keep state private; to keep intermediate calculated values (or async iterators) that are not accessible outside the definition of an extended tag. This is especially useful with getters and setters where the interface looks like a data value, but internally the value is maintained or manipulated by some other entity.

AIUI implements private data via an internal closure associated every extended element created. The object contains a single member referenced via the symbol `tag.UniqueID` which holds a unqiue string associated with the invocation of `extended` that can be used to do things like name private [styles](./styles.md).

You can, however, store arbitrary values in the object. In order to gain access to it, you simple need to pass `extended` a function that returns the extended tag specificationm, rather than the specification itself:

```typescript
const MyDiv = div((inst: Instance) => ({
  ...
}));

document.body.append(MyDiv("Content"));
```
The `inst` can be declared with arbitrary fields, which are available with the extended tag specifcation:

```typescript
// A div that contains an image, whose content is determined by the `.icon` property
const MyDiv = div((inst: Instance<{icon: RerturnType<typeof img>}>) => ({
  declare:{
    set icon(s: string) {
      inst.icon.src = '/icons/' + src + '.png';
    },
    get icon():string {
      return inst.icon.src.replace(/^\/icons\//,'').replace(/\.png$/,'');
    }
  },
  constructed(){
    return inst.icon = img()
  }
}));

const elt = MyDiv("Content")l
elt.icon = 'next'; // Updates the img.src within the div elt
```
The private instance data is only available to the extended defintion. You can store nodes, async interators or any other values inside it, allowing you to, for example, create mapped iterables that are available to the implementations of your public methods.

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Styling extended elements](./styles.md) | [Index](./index.md) | [Link elements dynamically: `when`](./when.md)  |

