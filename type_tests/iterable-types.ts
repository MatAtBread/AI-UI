import { IterableProperties } from "../module/src/iterators";

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

type IP = {
    a: string[],
    b: number,
    o: {
      foo: number,
      bar: boolean
    }
  };

declare var arr: IterableProperties<IP>;
  
  const st = arr.a[0].valueOf()
  const vb = arr.b.valueOf();
  const va = arr.a.valueOf();
  const vo = arr.o.valueOf();
  const vbar = arr.o.bar.valueOf();
  
  type t_st = AssertEqual<typeof st,string>['true'];
  type t_vb = AssertEqual<typeof vb,IP['b']>['true'];
  type t_va = AssertEqual<typeof va,IP['a']>['true'];
  type t_vo = AssertEqual<typeof vo,IP['o']>['true'];
  type t_vbar = AssertEqual<typeof vbar,IP['o']['bar']>['true'];

  arr.a[0] = 'str';
  arr.b = 1;
  // @ts-expect-error: see iterators.ts#IterableProperties
  arr.a = ['a','b'];
  arr.o.foo = 8;
  