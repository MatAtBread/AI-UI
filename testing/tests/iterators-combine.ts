import { Iterators } from '../../module/src/ai-ui';

const { generatorHelpers,combine } = Iterators;
const sleep = Test.sleep;

const loop = generatorHelpers(async function *(t:number) {
  try {
    for (let n=1; n<5; n++) {
      await sleep(t);
      yield n;
    }
  } finally {
    console.log("finally");
  }
});

console.log("combine n,s");
const c = combine({
  n: loop(0.23),
  s: loop(0.13).map(n => "S"+n)
});

await c.consume(v => {
  console.log(v)
});

await sleep(1);

console.log("combine n,s, !partial");
const f = combine({
  n: loop(0.23),
  s: loop(0.13).map(n => "S"+n)
}, { ignorePartial: true });

await f.consume(v => {
  console.log(v)
});

await sleep(1);

console.log("combine this-d, e");
const d = loop(0.23).map(n => "this:"+n);
try {
  await d.combine({
    e: loop(0.13)
  }).consume(({e,_this}) => {
    if (e === 3) {
      throw "e is 3";
    }
    console.log(e,_this)
  })
} catch (ex) {
  console.log(ex);
}

await sleep(1);