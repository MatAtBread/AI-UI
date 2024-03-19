
# Composition with `constructed()`

As we saw in earlier, we can extend a tag by adding new attributes and methods.

```javascript
const RedBox = div.extended({
  override:{
    style:{
      backgroundColor: 'red'
    }
  }
});

document.body.append(RedBox("My background is red"));
```

When the tag function "RedBox" is run, it creates an HTML `<div>` element and sets some defaults (in this case the background colour).

But what if we want to create some children ourselves? Or modify the supplied children?

You can do this with the `constructed()` method.

```javascript
const RedBlue = RedBox.extended({
  constructed() {
    return div("I'm red!")
  }
});

const x = RedBlue("Make me blue");
/* Returns the DOM tree:
<div style="background-color: red;">
  Make me blue!
  <div>I'm red</div>
</div>
*/
```
Note that the children specified in the call to RedBlue() appear _before_ those specified in the `constructed()` function. This is because they are appended before the function is called, allowing you to modify or move them within the `constructed()` call:
```javascript
const RedBlue2 = RedBox.extended({
  constructed() {
    return div(
      div({ style: { backgroundColor: 'blue'}},
        this.childNodes // ...the children in the call to RedBlue2
      ),
      div("I'm red!")
    )
  }
});

const x2 = RedBlue2("Make me blue");
/* Returns the DOM tree:
<div style="background-color: red;">
  <div>
    <div style="background-color: blue;">Make me blue</div>
    <div>I'm red!</div>
  </div>
</div>
*/
```
Although not a feature of `constructed()` per se (it's a feature of all `ChildTag` patrameters), you can return more than one tag without wrapping in another tag using array notation:

```javascript
// Same as the above, but avoids the surrounding <div> since we're already a <div> inherited from RedBox, and uses arrow notation to show how concise it can be
const RedBlue2 = RedBox.extended({
  constructed: () => [
      div({ style: { backgroundColor: 'blue'}},
        this.childNodes // ..the children in the call to RedBlue2
      ),
      div("I'm red!")
  ]
});
/* Returns the DOM tree:
<div style="background-color: red;">
  <div style="background-color: blue;">Make me blue</div>
  <div>I'm red!</div>
</div>
*/
```

Of course, like most things in AI-UI, the return value can contain async iterables or Promises, or itself be async, so if your new tag depends on some remote data, you can declare it's layout and attributes, and when the Promise resolves (or the async iterator updates), the DOM will be modified in situ to reflect the results.

Note: You don't have to return elements from `constructed()`. If you return `undefined`, no children will be added to your new element.

So now we know how to create extended elements with new attributes, methods and children. What else works well in constructors? Obviously, any simple computation or statements can be put in the function, but adding behaviours async iterables is very common:
```javascript
const sleep = () => new Promise(res => setTimeout(res,333));
async function *countdown() {
  for (let i=10; i >= 0; i--) {
    yield i;
    await sleep();
  }
}

const Secret = div.extended({
  constructed() {
    // Get a "multi" async iterable (because we want to consume the values in more than one place)
    const counter = countdown().multi();

    // Add the behaviour that when the counter <= 0, hide the whole Secret DOM tree
    counter.filter(n => n <= 0).consume(n => { this.style.display = 'none' });

    // Return the specified children, preceded by the countdown
    return [counter, ' ... ', this.childNodes];
  }
})
document.body.append(Secret("read me quick!"),);
```
If you prefer a more declarative coding style, you can do exactly the same thing with:
```diff
const Secret = div.extended({
  constructed() {
    // Get a "multi" async iterable (because we want to consume the values in more than one place)
    const counter = countdown().multi();

-   // Add the behaviour that when the counter <= 0, hide the whole Secret DOM tree
-   counter.filter(n => n <= 0).consume(n => { this.style.display = 'none' });
+   // Specify which attributes should updated by the counter
+   this.attributes = {
+     style:{
+       display: counter.map(n => n <= 0 ? 'none':'').unique()
+     }
+   }

    // Return the specified children, preceded by the countdown
    return [counter, ' ... ', this.childNodes];
  }
});
```

Creating behaviours for iterable properties is also a very powerful technique. The following tag is an image based chart that on construction is set up to consume a "data" member and draw a chart of the supplied data. You can see it in operation [here](https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/ts/ts-example.html?weather.ts)

```typescript
const Chart = img.extended({
  override: {
    style: {
      transition: 'opacity 0.5s',
      opacity: '0.2'
    },
    onload() {
      this.style.opacity = '1';
    }
  },
  iterable: {
    data: { x:[], y: [] } as { x: (string | number)[], y: number[] }
  },
  declare: {
    label: ''
  },
  constructed() {
    this.data.consume!(data => {
      this.style.opacity = '0.2';
      this.src = `https://quickchart.io/chart?width=${this.width}&height=${this.height}&chart=`
        + encodeURIComponent(JSON.stringify({
          type: 'line',
          data: {
            labels: data.x,
            datasets: [{
              label: this.label,
              data: data.y
            }]
          }
        }))
    })
  }
});
...
const chart = Chart({ label: "Weekly sales" });
document.body.append(chart);
...
// Draw the chart from the weekly data. The `chart.data` could itself come from am async iterator
chart.data = {
  x:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  y:[32,91,45,73,16,29.51]
}
```


____

| < Prev | ^ |  Next > |
|:-------|:-:|--------:|
| [Adding methods & attributes with `declare`, `override` & `iterable`](./prototype.md) | [Index](./index.md) | [Type safe elements](./ids.md) |

