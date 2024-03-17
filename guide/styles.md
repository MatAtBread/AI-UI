# Styling extended elements

You can quickly and easily declare styles (CSS rtules) for your extended tags:

```javascript
const BorderBox = div.extended({
  styles:`.BorderBox {
    border: 1px solid black;
  }`,
  override:{
    className: 'BorderBox'
  }
});
```

The styles are automatically created and inserted into your document. The main advantage is that is makes it quick and easy to define styles for pseudo-selectors like `:hover` or `::content`. It's also easy to declare styles for any children created by your new tag:

```javascript
const BorderBox = div.extended({
  styles:`.BorderBox {
    border: 1px solid black;
  }
  .BorderBox #title {
    font-size: 120%;
  }
  .BorderBox #title:hover {
    color: blue;
  }
  `,
  override:{
    className: 'BorderBox'
  },
  constructed() {
    return [
      div({id:title}, this.title),
      div(this.childNodes)
    ]
  }
});
```

If your extended tags are intended to be used by 3rd parties, or as part of a library, you'll want to ensure the class names don't clash with anything else. All AIUI extended tags are created with a  unique ID that you can use to ensure the names are unique:

```javascript
const MyDiv = div.extended(instance => ({
  // instance[tag.UniqueID] is a string that is unique to this invokation of div.extended(...)
  styles: `MyDiv-.${instance[tag.UniqueID]} {
    margin: 4px;
  }
  .MyDiv-${instance[tag.UniqueID]}:hover {
    background-color: white;
  }`,
  override:{
    className: `MyDiv=${instance[tag.UniqueID]}`
  },
  constructed() {
    return "styled"
  }
}));
```

The format above, where rather than `extended` accepting an object, but instead accepts a function that returns the definition is explained in the next section, [Private element data, getters & setters](./instance.md), however in the context of the `styles` member, the key is that AIUI passes an object that contains an ID that is uniquely associated with the call to `extended`.

____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Type safe elements](./ids.md) | [Index](./index.md) | [Private element data](./instance.md) |

