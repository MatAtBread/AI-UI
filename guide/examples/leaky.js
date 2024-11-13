import { tag, Iterators } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();
const { div, button } = tag();
async function* rainbow() {
  try {
    while (true) {
      for (const c of ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta']) {
        yield {
          color: c
        };
        await sleep(200);
      }
    }
  } finally {
    console.log("End of the rainbow");
  }
}
// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms, v) {
  return new Promise(resolve => setTimeout(() => resolve(v), ms));
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
const nodes = tag.nodes(
  div({ style: rainbow() }, "Style"),
  rainbow().map(s => [
    div({ id: n, style: s }, "Mapped Mounted "+n++),
    (div({ style: s }, "Mapped Detached"),null)
  ]),
  divs('A'),

  // divs('B').map(d => d[0]),
  // div({ style: { color: sleep(250,'red')}},"Dismount before promise attr"),
  // sleep(500,div({ style: rainbow()},"Dismount before async attr"))
);
await sleep(1000);
document.body.append(...nodes);

