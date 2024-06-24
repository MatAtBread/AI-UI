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
      r: string
    }
  }
}>;
(window as any).x = x;
defineIterableProperty(x,'n',456);
x.n.consume!(x => console.log("n is",x));

defineIterableProperty(x,'o',{ s: 'foo', p: { q: 123, r: 'abc' } });

x.o.consume!(x => console.log("o is",x));
x.o.s.consume!(x => console.log("o.s is",x));
x.o.p.consume!(x => console.log("o.p is",x));
x.o.p.q.consume!(x => console.log("o.p.q is",x));
x.o.p.r.consume!(x => console.log("o.p.r is",x));

x.o.p.q = 123;
await sleep(500)
x.o.p.q = 888;
await sleep(500)
x.o.p.q = 456;
console.log("xopq",-x.o.p.q);

