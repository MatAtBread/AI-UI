import { IterableProperties, defineIterableProperty } from '../../../module/esm/iterators.js'
import { tag } from '../../../module/esm/ai-ui.js';
const { div } = tag();

const x = {} as IterableProperties<{
  n: number,
  o: {
    s: string,
    p: any
  }
}>;
(window as any).x = x;
defineIterableProperty(x,'n',456);
x.n.consume!(x => console.log("n is",x));

defineIterableProperty(x,'o',{ s: 'foo', p: { q: 123 } });

x.o.consume!(x => console.log("o is",x));
x.o.s.consume!(x => console.log("o.s is",x));
x.o.p.consume!(x => console.log("o.p is",x));
