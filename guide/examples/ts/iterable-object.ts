import { tag, Iterators } from '../../../module/esm/ai-ui.js'

const { div, span } = tag();

const Thing = div.extended({
  iterable: {
    thing: { n: "?" }
  },
  constructed() {
    return span("Thing is ",this.thing.n);
  }
});

const count = Iterators.generatorHelpers(async function* () {
  for (let i = 0; i < 10; i++) {
    yield i;
    await new Promise(r => setTimeout(r, 500))
  }
});
const thing_n = count().map(String);
const thing_m = count().map(String).multi();
const thing = (async function* () {
  for (let i = 0; i < 10; i++) {
    yield {n: i.toString()};
    await new Promise(r => setTimeout(r, 500))
  }
})();
const thing2 = count().map(n => ({ n: String(n) }));
const thing3 = thing_m.map(n => ({ n }));

document.body.append(
  Thing({
    thing: {
      n: thing_n
    }
  }),
  Thing({
    thing: {
      n: thing_m
    }
  }),
  Thing({
    thing: {
      n: thing_m
    }
  }),
  Thing({
    thing: thing
  }),
  Thing({
    thing: thing2
  }),
  Thing({
    thing: thing3
  }),
  Thing({
    thing: thing3
  })
);

