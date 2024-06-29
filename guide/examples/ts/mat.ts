import { tag, Iterators } from '../../../module/esm/ai-ui.js';

Iterators.augmentGlobalAsyncGenerators();
const sleep = (ms:number) => new Promise(r => setTimeout(r,ms));

const { div, span } = tag();

const Base = span.extended({
  iterable:{
    n: undefined as number|undefined
  },
  constructed() {
    return ["n is ", this.n]
  }
});

const Mid = div.extended({
  iterable:{
    state:{} as Partial<{ count: number }>
  },
  constructed() {
    return ["Mid ",Base({ n: this.state.count }), " count ", this.state.count, " "]
  }
});

const Pass = div.extended({
  iterable:{
    count: undefined as number|undefined
  },
  constructed() {
    return ["Pass ", Base({ n: this.count }), " count ", this.count, " "]
  }
});

const Nest = div.extended({
  iterable:{
    x: undefined as number|undefined
  },
  constructed() {
    return Pass({ count: this.x })
  }
});

const loop = (async function *() {
  try {
    for (let i = 1; i < 10; i++) {
      yield i;
      await sleep(300)
    }
  } catch (ex) {
    console.log("loop",ex);
  } finally {
    console.log("finally loop")
  }
})().multi();

let [m,p,n] = [Mid(),Pass(),Nest()];
document.body.append(
  Mid({ state: loop.map(v => ({ count: v }))}),
  Pass({ count: loop }),
  Nest({ x: loop }),
  m,p,n
);
n.x = p.count = m.state.count = loop as (typeof loop & number);

document.body.append(
  Mid({ state: loop.map(v => ({ count: v }))}),
  Mid({ state: loop.map(v => ({ count: v }))}),
  Mid({ state: { count: loop } }), 
  Mid({ state: { count: loop } })  
);
