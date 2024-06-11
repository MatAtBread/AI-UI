import { tag } from '../../../module/esm/ai-ui.js'

const { div, span, button } = tag();

const Thing = div.extended({
  iterable: {
    item: 'start'
  },
  constructed() {
    return span("Item is: ", this.item);
  }
});

const t = Thing({
  item: seq("A")
});

document.body.append(t,
  // button({
  //   onclick: () => t.item = seq("B")
  // }, "change B"),
  // button({
  //   onclick: () => t.item = seq("C")
  // }, "change C")
);

let sw = "B3";
t.item.consume!(v => {
  console.log("Consumed",v)
  if (v === "A2")
    t.item = seq("B");
  if (v === sw)
    t.item = seq("C");
  if (v === "C2") {
    sw = '';
    t.item = seq("B");
  }
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function* seq(a: string) {
  try {
    for (let i = 0; i < 5; i++) {
      await sleep(100);
      console.log("yield", a, i);
      yield a + i;
    }
  }
  catch (ex) {
    console.log("ex seq", a, ex);
  }
  finally {
    console.log("finally seq", a);
  }
}
