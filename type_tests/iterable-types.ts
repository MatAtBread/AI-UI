import { AsyncExtraIterable, IterableProperties } from "../module/src/iterators";

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

export type AssertExtends<T, Expected> = [Expected] extends [T]
  ? { true: true; }
  : { false: false; };

type IP = {
  a: string[],
  b: number,
  o: {
    foo: number,
    bar: boolean
  }
};

declare var ip: IterableProperties<IP>;

const st = ip.a[0].valueOf()
const vb = ip.b.valueOf();
const va = ip.a.valueOf();
const vo = ip.o.valueOf();
const vbar = ip.o.bar.valueOf();

type t_st = AssertEqual<typeof st, string>['true'];
type t_vb = AssertEqual<typeof vb, IP['b']>['true'];
type t_va = AssertEqual<typeof va, IP['a']>['true'];
type t_vo = AssertEqual<typeof vo, IP['o']>['true'];
type t_vbar = AssertEqual<typeof vbar, IP['o']['bar']>['true'];

ip.a[0] = 'str';
ip.b = 1;
// @ts-expect-error: see iterators.ts#IterableProperties
ip.a = ['a', 'b'];
ip.o.foo = 8;

type JP = {
  n: number
  m: number | '1'
  p: number | null
}

declare var jp: IterableProperties<JP>;
type jp_1 = AssertExtends<typeof jp.n,number>['true'];
type jp_2 = AssertExtends<typeof jp.m,number>['true'];
type jp_3 = AssertExtends<typeof jp.m,'1'>['true'];
type jp_4 = AssertExtends<typeof jp.p,number>['true'];
type jp_5 = AssertExtends<typeof jp.p,number & Partial<AsyncExtraIterable<number | null>>>['true'];
