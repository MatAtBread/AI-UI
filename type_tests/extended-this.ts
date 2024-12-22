import type { TagCreator } from '../module/src/ai-ui.js';
import type { AsyncExtraIterable, IterableType } from '../module/src/iterators.js';

type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

declare const elt: TagCreator<Element>;
const uninitialised = undefined as unknown;
async function* gen<T>(a: T) { yield a }

/* Tests to ensure that `this` is correct inside members of extended tags */

const Base = elt.extended({
  declare: {
    nd: 0,
    ad: uninitialised as AsyncExtraIterable<number>,
    fn() {
      const t = this;
      type T = [
        AssertEqual<typeof t.nd, number>['true'],
        AssertEqual<typeof t.nd, AsyncExtraIterable<number>>['false'],
        AssertEqual<typeof t.ad, number>['false'],
        AssertEqual<typeof t.ad, AsyncExtraIterable<number>>['true'],
        AssertEqual<typeof t.ni, number>['true'],
        AssertEqual<typeof t.ni, number & Partial<AsyncExtraIterable<number>>>['true']
      ]
    }
  },
  iterable: {
    ni: 0,
    f: false
  },
  constructed() {
    const t = this;
    type T = [
      AssertEqual<typeof t.nd, number>['true'],
      AssertEqual<typeof t.nd, AsyncExtraIterable<number>>['false'],
      AssertEqual<typeof t.ad, number>['false'],
      AssertEqual<typeof t.ad, AsyncExtraIterable<number>>['true'],
      AssertEqual<typeof t.ni, number>['true'],
      AssertEqual<typeof t.ni, number & Partial<AsyncExtraIterable<number>>>['true']
    ]
  t.fn();
  }
});

/* Tests to ensure that memebrs of extended tags can be _specified_ as values & futures */

const dn = [
  Base({ nd: 1 }),
  Base({ nd: Promise.resolve(1) }),
  Base({ nd: gen(1) }),
  Base({ nd: gen(Promise.resolve(1)) }),
  Base({ nd: Promise.resolve(gen(1)) }),
];

const adn = [
  // @ts-expect-error
  Base({ ad: 1 }),
  // @ts-expect-error
  Base({ ad: Promise.resolve(1) }),
  Base({ ad: gen(1) }),
  Base({ ad: gen(Promise.resolve(1)) }),
  Base({ ad: Promise.resolve(gen(1)) }),
];

const ni = [
  Base({ ni: 1 }),
  Base({ ni: Promise.resolve(1) }),
  Base({ ni: gen(1) }),
  Base({ ni: gen(Promise.resolve(1)) }),
  Base({ ni: Promise.resolve(gen(1)) }),
];

/* Tests to ensure that memebrs of extended tags can be _accessed_ as their defined types */

type N = Pick<(typeof ni)[number], 'nd' | 'ad' | 'fn' | 'ni'>;
type verifyN = AssertEqual<N, {
  ni: number & Partial<AsyncExtraIterable<number>>;
  nd: number;
  ad: AsyncExtraIterable<number>;
  fn: () => void;
}>['true'];

const Ext = Base.extended({
  iterable:{
    ab: uninitialised as boolean
  }
});

const x = [
  Ext({ ni: 1 }),
  Ext({ ni: Promise.resolve(1) }),
  Ext({ ni: gen(1) }),
  Ext({ ni: gen(Promise.resolve(1)) }),
  Ext({ ni: Promise.resolve(gen(1)) }),
];

type verifyXAB = [
  AssertEqual<(typeof x)[number]['ab'], IterableType<boolean>>['true'],
  AssertEqual<(typeof x)[number]['nd'], number>['true'],
  AssertEqual<(typeof x)[number]['ad'], AsyncExtraIterable<number>>['true'],
  AssertEqual<(typeof x)[number]['ni'], IterableType<number>>['true'],
];