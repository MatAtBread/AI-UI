import { defineIterableProperty } from '../../../module/esm/iterators.js'

const sleep = (ms) => new Promise(r => setTimeout(r,ms));

const x = {};
globalThis.x = x;
defineIterableProperty(x,'n',456);
x.n.consume(x => console.log("n is",x));

defineIterableProperty(x,'o',{ s: 'foo', p: { q: 123, r: 'abc' } });

// x.o.consume(x => console.log("o is",x));
// x.o.s.consume(x => console.log("o.s is",x));
// x.o.p.consume(x => console.log("o.p is",x));
// x.o.p.q.consume(x => console.log("o.p.q is",x));
x.o.p.r.consume(x => console.log("o.p.r is",x)).then(x => console.log('o.p.r then',x)).catch(x => console.log('o.p.r catch',x));

// x.o.p.q = 123;
// await sleep(500)
// x.o.p.q = 888;
// await sleep(500)
// x.o.p.q = 456;
// console.log("xopq",-x.o.p.q);


x.o.p.r = 99;
await sleep(100);
x.o.p.r;
await sleep(100);
delete x.o.p.r;
await sleep(100);

await sleep(1000000);

while (1) {
  await sleep(1000);
  console.log(process.memoryUsage());
  gc();
}