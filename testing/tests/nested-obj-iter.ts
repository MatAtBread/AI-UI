/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';
import { IterableType } from '../../module/src/iterators';
const { defineIterableProperty } = Iterators;
type O = {
  i: {
    s: IterableType<string>;
    n: IterableType<string>;
  }
}

const res = Promise.resolve();

async function up(l: string, x: O, async: number | false | Promise<any> = false) {
  console.log(l, x.i.valueOf());
  x.i.s = '=s';
  if (async) await (async instanceof Promise ? async : Test.sleep(async));

  console.log(l, x.i.valueOf());
  x.i = { s: '=obj2', n: '=n2' }
  if (async) await (async instanceof Promise ? async : Test.sleep(async));

  console.log(l, x.i.valueOf());
  x.i.s = '=s2';
  if (async) await (async instanceof Promise ? async : Test.sleep(async));

  console.log(l, x.i.valueOf());
  x.i = { s: '=obj3', n: '=n3' }
  if (async) await (async instanceof Promise ? async : Test.sleep(async));

  console.log(l, 'done', x.i.valueOf());
}

const o = defineIterableProperty({}, 'i', { s: 's', n: 'n' });
await up('o', o);

const ao = defineIterableProperty({}, 'i', { s: 's', n: 'n' });
await up('ao', ao, res);

const p = defineIterableProperty({}, 'i', { s: 's', n: 'n' });
p.i.consume!(j => console.log('p.i', j));
p.i.s.consume!(j => console.log('p.i.s', j));
p.i.n.consume!(j => console.log('p.i.n', j));
await up('p.consumed', p);

const ap = defineIterableProperty({}, 'i', { s: 's', n: 'n' });
ap.i.consume!(j => console.log('ap.i', j));
ap.i.s.consume!(j => console.log('ap.i.s', j));
ap.i.n.consume!(j => console.log('ap.i.n', j));
await up('ap.consumed', ap, res);

await Test.sleep(2);

const m = defineIterableProperty({},'i', { s: 's', n: 'n' });
m.i.map!(x => x).consume(x => console.log('m1',x));
m.i.map!(x => x).consume(x => console.log('m2',x));
await up('mA', m, res);
await Test.sleep(2);
await up('mB', m, res);
await Test.sleep(2);
