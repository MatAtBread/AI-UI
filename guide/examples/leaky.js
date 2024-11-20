import { tag, Iterators, when } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();
const { div, button, span } = tag();

// async function* count(delay) {
//   for (let n=1; n<Number.MAX_SAFE_INTEGER; n++) {
//     await sleep(delay);
//     yield n;
//   }
// }

// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms, v) {
  return new Promise(resolve => setTimeout(() => resolve(v), ms));
}
/*
const AutoClickButton = button.extended({
  iterable:{
    n: 0
  },
  override: {
    onclick() {
      this.n += 1;
      console.log("self-click",this.n);
    }
  },
  constructed(){
    for (let i=0; i<9; i++) {
      this.click();
      this.click();
      sleep(1).then(() => this.click()).then(() => sleep(1)).then(() => this.click());
    }
    return 'click'
  }
});

const ClickCount = div.extended({
  ids:{
    btn: AutoClickButton,
    counter: span
  },
  constructed() {
    let n = 0;
    return [
      AutoClickButton({ id: 'buttn'}),
      this.when('click:#buttn').map(e => console.log(e))
    ]
  }
});

document.body.append(...tag.nodes(
  ClickCount()
  // AutoClickButton({ id: 'buttn'}),
  // when(document.body,'click:#buttn').map(e => console.log(e))
));

// window.div = div;
// document.body.append(...tag.nodes(
//   div("Hello"),
//   sleep(3000,div("there")),
//   sleep(2000).then(() => div("...bye")),
//   sleep(1000,div("bye")),
// ));
*/
/**/
async function* rainbow() {
  try {
    while (true) {
      for (let i=0; i<360; i+=20) {
        yield {
          color: `hsl(${i} 100% 20%)`
        };
        await sleep(100);
      }
      break;
    }
  } finally {
    console.log("End of the rainbow");
  }
}

async function* divs(label) {
  try {
    for (let n = 0; n < 2; n++) {
      // This leaks because it creates two divs, but only one is ever mounted
      // The async rainbow attrs for the non-mounted one will never be
      // terminated as the off-screen div will never stop consuming, as it
      // will only do so once mounted and removed.
      yield [
        div({ style: rainbow() }, `Mounted ${n} ${label}`),
        div({ style: rainbow() }, `Detached ${n} ${label}`)
      ];
    }
  } finally {
    console.log("No more divs");
  }
}

let n = 0;

const Boxed = div.extended((instance) =>({
  declare:{
    render() {
      this.append(span({ style: "border: 1px solid black"},instance.nodes))
    }
  },
  async constructed() {
    instance.nodes = [...this.childNodes];
    this.replaceChildren();
    await sleep(1000);
    this.render();
  }
}))

const nodes = tag.nodes(
//  Boxed(span({ id:'styled',style: rainbow() }, "Style" )),

//  rainbow().map(s => div({ id: n, style: s }, "Mapped Mounted "+n++)),
  rainbow().map(s => [
    div({ id: n, style: s }, "Mapped Mounted "+n++),
    //(div({ style: s }, "Mapped Detached"),null)
  ]),
//  div({ id:'styled',style: rainbow() }, "Style"),
  // divs('A'),

  // divs('B').map(d => d[0]),
  // div({ style: { color: sleep(250,'red')}},"Dismount before promise attr"),
  // sleep(500,div({ style: rainbow()},"Dismount before async attr"))
);
//await sleep(1000);
document.body.append(...nodes);

/**/