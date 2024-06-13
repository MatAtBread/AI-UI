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

async function* g() {
  let n = 0;
  while (1) {
    yield [n++, div({ style: rainbow() }, n)] as [number, ReturnType<typeof div>];
    await sleep(6666);
  }
}

let n = 0;
function selfDestruct() {
  return button({
    style: rainbow(),
    onclick(e) {
      (e.target as ChildNode).parentNode?.append(...tag.nodes(sleep(1000,selfDestruct()));
      (e.target as ChildNode).remove();
    }
  }, n++)

}

const App = div.extended({
  constructed() {
    return [
      sleep(500, div("abc")),
      div("def"),
      selfDestruct(),
      g().map(([n,d]) => n & 1 ? d : '?')
    ];
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.append(App());

// A simple async function that pauses for the specified number of milliseocnds
function sleep<V>(ms: number, v?: V): Promise<V> {
  return new Promise(resolve => setTimeout(() => resolve(v as V), ms));
}
