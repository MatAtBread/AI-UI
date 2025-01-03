import type { TagCreator, Iterators } from '../module/src/ai-ui';

export async function* ai<T>(t: T) { yield t }

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

declare var div: TagCreator<HTMLDivElement>;

const o = { s:'1', n: 1, b: Boolean(1) };
const d = {
  list: ['1', 'b', '3', 'D'],
  o,
  more: {
    f: true,
    nums: [1, 2, 3, 5],
    objs: [o,o]
  }
}

type D = typeof d;

const T = div.extended({
  declare: {
    data: d
  }
});

const t = [
  T({ data: d }).data,
  T({ data: Promise.resolve(d) }).data,
  T({ data: ai(d) }).data,
  T().data,
  T("text").data
];

type TX = AssertEqual<typeof t, Array<D>>['true']

/* Directly declared
const U = div.extended({
  declare: d
});

const u = [
  U(d).more
];

type UX = AssertEqual<typeof u, Array<D['more']>>['true']
*/

const V = div.extended({
  iterable: {
    data: d
  },
  constructed() {
    // this.data = d;
    // this.data.more = d.more;
    this.data.o = d.o;
    // @ts-expect-error: TS cannot represent assignment of an array to an array iterable
    this.data.list = d.list;
    this.data.list = <typeof this.data.list>d.list;
  }
});

const v = [
  // V({ data: d }).data,
  // V({ data: Promise.resolve(d) }).data,
  V({ data: ai(d) }).data,
  V().data,
  V("text").data
];

type IID = Iterators.IterableProperties<D>;
type VX = AssertEqual<typeof v, Array<IID>>['true']

v[0].more.map!(x => { type T = AssertEqual<typeof x, D['more']>['true'] })