import { AsyncExtraIterable, filterMap, generatorHelpers, Ignore, merge } from "../module/src/iterators";

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

export type AssertExtends<T, Expected> = [Expected] extends [T]
  ? { true: true; }
  : { false: false; };

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

declare var x: AsyncExtraIterable<string>;
{
  const a = x.valueOf();
  const b = x.filterMap(y => Number(y)).valueOf();

  type _1 = AssertEqual<typeof a, string>['true'];
  type _2 = AssertEqual<typeof b, number>['true'];
}

declare var y: AsyncExtraIterable<string | null>;
{
  const a = y.valueOf();
  const b = y.filterMap(y => y ? Number(y) : Ignore);

  type _1 = AssertEqual<typeof a, string | null>['true'];
  type _2 = AssertEqual<typeof b, AsyncExtraIterable<number>>['true'];
}

{
  async function* once() { yield null };
  const more = generatorHelpers(once)();


  const a1 = merge(x);
  const a2 = merge(x, more);
  const a3 = merge(x, once());

  type t1 = AssertExtends<typeof a1, AsyncExtraIterable<string>>['true'];
  type t1x = AssertExtends<typeof a1, AsyncExtraIterable<string | null>>['false'];
  type t2 = AssertExtends<typeof a2, AsyncExtraIterable<string | null>>['true'];
  type t2x = AssertExtends<typeof a2, AsyncExtraIterable<string>>['true'];
  type t3 = AssertExtends<typeof a3, AsyncExtraIterable<string | null>>['true'];
  type t3x = AssertExtends<typeof a3, AsyncExtraIterable<string>>['true'];

  const b1 = filterMap(a2, () => { return 12 as const; });
  const b2 = filterMap(a2, (v) => { return v ? 34 as const : Ignore; });
  const b3 = filterMap(a2, (v) => { return v ? 56 as const : Ignore; }, Ignore);
  const b4 = filterMap(a2, (v) => { return v ? 78 as const : Ignore; }, 78);
  // @ts-expect-error : initialValue does not match return type of the mapper
  const b5 = filterMap(a2, (v) => { return v ? 90 as const : Ignore; }, 12);

  const b6 = filterMap(a2, (v, prev: 'x' | typeof Ignore) => { return 'x' as const });
  type tb6 = AssertEqual<typeof b6, AsyncExtraIterable<'x'>>['true'];
  const b7 = filterMap(a2, (v, prev) => { return 'x' as const });
  // @ts-expect-error : TS cannot infer the type of prev from the return type of the mapper
  type tb7 = AssertEqual<typeof b7, AsyncExtraIterable<'x'>>['true'];

  type tb1 = AssertEqual<typeof b1, AsyncExtraIterable<12>>['true'];
  type tb2 = AssertEqual<typeof b2, AsyncExtraIterable<34>>['true'];
  type tb3 = AssertEqual<typeof b3, AsyncExtraIterable<56>>['true'];
  type tb4 = AssertEqual<typeof b4, AsyncExtraIterable<78>>['true'];

  const c1 = a2.filterMap(() => { return 12 as const; });
  const c2 = a2.filterMap((v) => { return v ? 34 as const : Ignore; });
  const c3 = a2.filterMap((v) => { return v ? 56 as const : Ignore; }, Ignore);
  const c4 = a2.filterMap((v) => { return v ? 78 as const : Ignore; }, 78);
  // @ts-expect-error : initialValue does not match return type of the mapper
  const c5 = a2.filterMap((v) => { return v ? 90 as const : Ignore; }, 12);

  type tc1 = AssertEqual<typeof c1, AsyncExtraIterable<12>>['true'];
  type tc2 = AssertEqual<typeof c2, AsyncExtraIterable<34>>['true'];
  type tc3 = AssertEqual<typeof c3, AsyncExtraIterable<56>>['true'];
  type tc4 = AssertEqual<typeof c4, AsyncExtraIterable<78>>['true'];

}