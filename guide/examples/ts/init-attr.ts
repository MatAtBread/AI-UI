import { tag, augmentGlobalAsyncGenerators } from '../../../module/esm/ai-ui.js'
augmentGlobalAsyncGenerators();
const { div } = tag();

async function *count() {
  let n = 1;
  while (1) {
    await sleep(1000);
    yield String(n++);
  }
}

const counter = count().multi();

const App = div.extended({
  constructed() {
    function onclick(this: HTMLElement) { this.remove() };

    const v = div({ onclick, textContent: counter.initially("PING") });
    const w = div({ onclick, textContent: counter.initially("PONG") });

    const y = div({ onclick },"<",counter.initially("PING"),">");
    const z = div({ onclick },"<",counter.initially("PONG"),">");
    return [
      Promise.resolve(v),w,
      Promise.resolve(y),z
    ];
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.append(App());

// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
