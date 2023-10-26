## Dynamic Attributes

In the previous [example]((https://raw.githack.com/MatAtBread/AI-UI/main/guide/examples/dynamic-content.html)) we created a tag called App whose content was specified statically, but updated dynamically.

We can also do the same with the attributes when creating an element. For example, following on from the clock example, we can dynamically update the style of an element.

```javascript
/* Specify what base tags you reference in your UI */
const { div } = AIUI.tag();

document.body.append(
  div({
      style:{
        backgroundColor: blink()
      }
    },
    'Set style.backgroundColor dynamically'),
    div({
      style: style()
    },
    'Set entire style dynamically'),
);

/* A simple async "sleep" function */
function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

async function *blink(t = 1) {
  while (true) {
    yield '#ccf';
    await sleep(t);
    yield '#cfc';
    await sleep(t);
  }
}

async function *style() {
  for await (const color of blink(1.5)) {
    yield {
      backgroundColor: color,
      fontFamily: 'sans-serif'
    }
  }
}
```



