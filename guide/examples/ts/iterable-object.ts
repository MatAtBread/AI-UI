import { tag, Iterators } from '../../../module/esm/ai-ui.js'

const { div, span } = tag();

const Thing = div.extended({
  iterable: {
    thing: { n: "?" }
  },
  constructed() {
    return span(this.thing.n?.map!(v => ["Thing is ", JSON.stringify(v)]));
  }
});

const count = Iterators.generatorHelpers(async function* () { for (let i = 0; i < 10; i++) { yield i; await new Promise(r => setTimeout(r, 1500)) } });
const thing = (async function* () { for (let i = 0; i < 1000; i++) { yield {n: String(i)}; await new Promise(r => setTimeout(r, 5000)) } })();
//const thing = count().map(n => ({ n: String(n) }));

document.body.append(
  Thing({
    thing: {
      n: count().map(String)
    }
  }), 
  Thing({
    thing: thing
  })
);

