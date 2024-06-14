import { tag, Iterators } from '../../../module/esm/ai-ui.js'
Iterators.augmentGlobalAsyncGenerators();
const { div, button } = tag();

async function* rainbow() {
  try {
    while (true) {
      for (const c of ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta']) {
        yield { color: c, display: 'block' };
        await sleep(200);
      }
    }
  } finally {
    console.log("End of the rainbow")
  }
}


// A simple async function that pauses for the specified number of milliseocnds
function sleep<V>(ms: number, v?: V): Promise<V> {
  return new Promise(resolve => setTimeout(() => resolve(v as V), ms));
}

async function *divs() {
  try {
    for (let n=0; n < 4; n++) {
      // This leaks because it creates two divs, but only one is ever mounted
      // The async rainbow attrs for the non-mounted one will never be
      // terminated as the off-screen div will never stop consuming, as it
      // will only do so once mounted and removed.
      yield [div({ style: rainbow() }, "Mounted ", n),div({ style: rainbow() }, "Detached ", n)];
      await sleep(200);
    }
  } finally {
    console.log("No more divs");
  }
}

const n = tag.nodes(
  divs().map!(d => d[0]),
  div({ style: { color: sleep(250,'red')}},"Dismount before promise attr"),
  sleep(500,div({ style: rainbow()},"Dismount before async attr"))
);
document.body.append(...n);
document.body.removeChild(n[1]);
document.body.removeChild(n[2]);
