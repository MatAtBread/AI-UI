import { iterableHelpers } from '../../../module/esm/iterators.js';

// Async Iteratots tests
function sleep<T>(d: number, ret?: T | undefined): Promise<T | undefined> {
  return new Promise(resolve => setTimeout(() => resolve(ret), d * 50))
}

async function* g(label: string, t: number, ret = -1, ex = -1) {
  var i = 0;
  try {
    while(1) {
      i += 1;
//      console.log(label, "yield", i);
      yield [label, i] as [string, number];
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
      // console.log("next",v);
    }
  } catch (ex) {
    console.warn("run ex",ex);
  } finally {
    console.log("run finally");
  }
}

(async function(){

  await run(g("gen", 0.3, 5));
  await run(iterableHelpers(g("map", 0.3, 5)).map(v => ["mapped",...v]));

  await run(g("genThrow", 0.3, 0, 5));
  await run(iterableHelpers(g("mapThrow", 0.3, 0, 5)).map(v => ["mapped",...v]));

  await run(g("genThrow", 0.3, 5) ,4);
  await run(iterableHelpers(g("mapThrow", 0.3, 5)).map(v => ["mapped",...v]), 4);

  await run(iterableHelpers(g("map", 0.3, 0, 5)).map(v => ["mapped",...v]));
  await run(iterableHelpers(g("mapperEx", 0.3, 9)).map(v => {if (v[1] === 3) throw "MapperEX"; return ["mapped",...v]}));
})();
