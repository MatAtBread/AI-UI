import { IterableProperties, defineIterableProperty } from '../../../module/esm/iterators.js'
import { tag } from '../../../module/esm/ai-ui.js';

const sleep = (ms:number) => new Promise(r => setTimeout(r,ms));

const { div } = tag();

const x = {} as IterableProperties<{
  n: number,
  o: {
    s: string,
    p: {
      q: number,
      r: string | number
    }
  }
}>;
(window as any).x = x;
defineIterableProperty(x,'n',456);
x.n.consume!(x => console.log("n is",x));

defineIterableProperty(x,'o',{ s: 'foo', p: { q: 123, r: 'abc' } });

const ok = (e:any) => console.log('consumed ok:',e);
const err = (e:any) => console.log('consumed ex:',e);

x.o.consume!(x => console.log("o is",x)).then(ok,err);
x.o.s.consume!(x => console.log("o.s is",x)).then(ok,err);
x.o.p.consume!(x => console.log("o.p is",x)).then(ok,err);
x.o.p.q.consume!(x => console.log("o.p.q is",x)).then(ok,err);
x.o.p.r.consume!(x => { console.log("o.p.r is",x); if (typeof x === 'number' && x < 0) throw new Error("-ve") }).then(ok,err);

x.o.p.q = 123;
await sleep(500)
x.o.p.q = 888;
await sleep(500)
x.o.p.q = 456;
console.log("xopq",-x.o.p.q);

await sleep(500)
x.o.p.r = 3;
await sleep(500)
x.o.p.r = -3;
await sleep(500)
x.o.p.r = 3;
await sleep(500)
