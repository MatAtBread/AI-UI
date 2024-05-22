/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';
export { };

let o = Iterators.defineIterableProperty({ o: 'obj' }, 'it', { n: 1, s: 'a' });
o.it.consume!(x => console.log("o", x));
o.it.n.consume!(x => console.log("n", x));
o.it.s.consume!(x => console.log("s", x));
o.it.n = 2;
await Test.sleep(0.1);
o.it.n = 3;
await Test.sleep(0.1);
o.it = { n: 4, s: 'b' };
await Test.sleep(0.1);
o.it = { n: 5, s: 'c' };
await Test.sleep(0.1);
o.it.n = 6;
await Test.sleep(0.1);
o.it.n = 7;
await Test.sleep(0.1);
o.it = { n: 8, s: 'd' };
await Test.sleep(1);
