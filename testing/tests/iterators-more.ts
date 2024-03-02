import { Iterators } from '../../module/src/ai-ui';

const { iterableHelpers } = Iterators;
const sleep = Test.sleep;

let running = true;
async function* g(label: string, t: number, ret = -1, ex = -1) {
  var i = 0;
  try {
    while(running) {
      i += 1;
      console.log(label, "yield", i);
      const y = [label, i] as [string, number];
      yield y;
      if (i===2)
        yield y;
      await sleep(t);
      if (i === ret)
        return label + " return "+i;
      if (i === ex)
        throw label + " throw "+i;
    }
  }
  catch (ex) {
    console.log(label, "Exception", ex);
  }
  finally {
    console.log(label, "finally");
  }
  return label + " done "+i;
}

async function run(i: AsyncIterable<any>, ex = -1) {
  console.log("run:");
  let count = 0;
  try {
    for await (const v of i) {
      if (++count === ex)
        throw "run Exit "+count;
      console.log("next",v);
    }
  } catch (ex) {
    console.log("run ex",ex);
  } finally {
    console.log("run finally");
  }
}

const m = iterableHelpers(g("multi", 0.1, 5, 3)).waitFor(done => setTimeout(done,234)).multi();
const m1 = run(m.map(v => ['first', ...v]));
await sleep(0.1)
const m2 = run(m.map(v => ['second', ...v]));
await Promise.all([m1,m2]);

const n = iterableHelpers(g("consume", 0.1, 5, 3)).waitFor(done => setTimeout(done,234)).multi();
const c1 = n.consume(v => console.log("consume 1st",v));
await sleep(0.1)
const c2 = n.consume(v => console.log("consume 2nd",v));
await Promise.all([c1,c2]);

await run(iterableHelpers(g("waitFor", 0.1, 5)).waitFor(done => setTimeout(done,234)));

await run(iterableHelpers(g("slow", 0.1, 5)).filter(v => sleep(0.5,true)));
await run(g("gen", 0.1, 5));
await run(iterableHelpers(g("filter", 0.1, 5)).filter(v => Boolean(v[1]&1)));
await run(iterableHelpers(g("unique", 0.1, 5)).unique());
await run(iterableHelpers(g("initially", 0.1, 5)).initially(["InitialValue",0]));
await run(iterableHelpers(g("map", 0.1, 5)).map(v => ["mapped",...v]));

await run(g("genThrow", 0.1, 0, 5));
await run(iterableHelpers(g("mapThrow", 0.1, 0, 5)).map(v => ["mapped",...v]));

await run(g("genThrow", 0.1, 5) ,4);
await run(iterableHelpers(g("mapThrow", 0.1, 5)).map(v => ["mapped",...v]), 4);

await run(iterableHelpers(g("map", 0.1, 0, 5)).map(v => ["mapped",...v]));
await run(iterableHelpers(g("mapperEx", 0.1, 9)).map(v => {
  if (v[1] === 3) {
    throw "MapperEX";
  } 
  return ["mapped",...v]})
).then(
  r => console.log("mapperEx then:", r), 
  r => console.log("mapperEx catch:", r));

running = false;
await sleep(2)