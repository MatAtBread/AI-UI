import { iterableHelpers } from '../../../module/esm/iterators.js';

// Async Iteratots tests
function sleep<T>(d: number):Promise<void>;
function sleep<T>(d: number, ret: T): Promise<T>;
function sleep<T>(d: number, ret?: T) {
  return new Promise<T | undefined>(resolve => setTimeout(() => resolve(ret), d * 50))
}

async function* g(label: string, t: number, ret = -1, ex = -1) {
  var i = 0;
  try {
    while(1) {
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
    console.warn(label, "Exception", ex);
  }
  finally {
    console.log(label, "finally");
  }
  return label + " done "+i;
}

async function run(i: AsyncIterable<any>, ex = -1) {
  console.log("\nrun:");
  let count = 0;
  try {
    for await (const v of i) {
      if (++count === ex)
        throw "run Exit "+count;
      console.log("next",v);
    }
  } catch (ex) {
    console.warn("run ex",ex);
  } finally {
    console.log("run finally");
  }
}



(async function(){
  const m = iterableHelpers(g("multi", 0.3, 5, 3)).waitFor(done => setTimeout(done,1000)).multi();
  run(m.map(v => ['first', ...v]));
  await sleep(70)
  run(m.map(v => ['second', ...v]));
/*
  const n = iterableHelpers(g("consume", 0.3, 5, 3)).waitFor(done => setTimeout(done,1000)).multi();
  n.consume(v => console.log("consume 1st",v));
  await sleep(70)
  n.consume(v => console.log("consume 2nd",v));
/*  await run(iterableHelpers(g("waitFor", 0.3, 5)).waitFor(done => setTimeout(done,500)));

   await run(iterableHelpers(g("slow", 0.3, 5)).filter(v => sleep(5,true)));
  await run(g("gen", 0.3, 5));
  await run(iterableHelpers(g("filter", 0.3, 5)).filter(v => Boolean(v[1]&1)));
  await run(iterableHelpers(g("unique", 0.3, 5)).unique());
  await run(iterableHelpers(g("initially", 0.3, 5)).initially(["InitialValue",0]));
  await run(iterableHelpers(g("map", 0.3, 5)).map(v => ["mapped",...v]));

  await run(g("genThrow", 0.3, 0, 5));
  await run(iterableHelpers(g("mapThrow", 0.3, 0, 5)).map(v => ["mapped",...v]));

  await run(g("genThrow", 0.3, 5) ,4);
  await run(iterableHelpers(g("mapThrow", 0.3, 5)).map(v => ["mapped",...v]), 4);

  await run(iterableHelpers(g("map", 0.3, 0, 5)).map(v => ["mapped",...v]));
  await run(iterableHelpers(g("mapperEx", 0.3, 9)).map(v => {if (v[1] === 3) throw "MapperEX"; return ["mapped",...v]}));
 */})();
