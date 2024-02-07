import type { TagCreator } from '../module/src/ai-ui';

/* Test helpers */
export async function *ai<T>(t: T) { yield t }
export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
    ? {true:true}
    : {false:false}
  : {false:false};


/* Declare a tag type & function */
declare var Base: TagCreator<{ Attr: 'base', N: 0 | 1 | 2, fn():void, gen: unknown }>;
/* Instaniate with valid child nodes */
const good = [123,
  'abc',
  document.createTextNode(''),
  undefined,
  [123, 'abc']] as const;
Base(...good);
Base(...good.map(e => ai(e)));
Base(...good.map(e => Promise.resolve(e)));
// @ts-expect-error: {} is not a ChildNode
Base(123, {});

/* Instatiate the base with literal properties */
const baseElt1 = Base({
  Attr: 'base',
  // @ts-expect-error: attribute doesn't exist
  other: 1
});
/* Instatiate the base with async properties */
const baseElt2 = Base({
  Attr: ai('base'),
  N: 2
});
/* Instatiate the base with wrong type */
// @ts-expect-error: N is wrong type
const baseElt3 = Base({
  Attr: ai('base'),
  N: 3
});

/* Access the properties */
baseElt1.Attr === 'base';
baseElt2.Attr === 'base';
baseElt2.fn();
declare const genUnknown: AssertEqual<typeof baseElt3.gen, unknown>;
genUnknown.true;

// @ts-expect-error: check proeprty type
baseElt1.Attr === 'xxx';
// @ts-expect-error: check property exists
baseElt1.other === 'xxx';
// @ts-expect-error: check property exists
baseElt1.textContent === 'xxx';
//  check property is a function, not booleam
typeof baseElt2.fn === 'function'

// Extend the tag
const Same = Base.extended({});
// Check it behaves just like the Base
const sameElt1 = Same();
const sameElt2 = Same({ Attr: 'base' });

/* Access the properties */
sameElt1.Attr === 'base';
sameElt2.Attr === 'base';
typeof baseElt2.fn === 'function'

// @ts-expect-error: check proeprty type
sameElt1.Attr === 'xxx';
// @ts-expect-error: check property exists
sameElt1.other === 'xxx';
// @ts-expect-error: check property exists
sameElt1.textContent === 'xxx';

// Extend the tag again, with ids
const WithID = Same.extended({
  ids:{
    q: Base
  }
});
WithID().ids.q.Attr === 'base';

declare const neverSameIDs: AssertEqual<keyof ReturnType<typeof Same>['ids'], never>;
neverSameIDs.true;
// @ts-expect-error: NoIDS is true
neverSameIDs.false;

declare const neverWithIDs: AssertEqual<keyof ReturnType<typeof WithID>['ids'], never>;
// @ts-expect-error: NoIDS is true
neverWithIDs.true;
neverWithIDs.false;

// Declare new attributes & test `this`
const Decl = Base.extended({
  declare:{
    x: false,
    fn2() {
      return this.x ? 'a' : 'b';
    }
  },
  constructed() {
    // Confirm `this.x` is boolean
    (<AssertEqual<typeof this.x, boolean>>{}).true
  }
});

Decl().x === true;
// @ts-expect-error: x is not a number
Decl().x === 1;

const t = Decl().fn2();
(<AssertEqual<typeof t, 'a' | 'b'>>{}).true;

const Over = Base.extended({
  override:{
    N: 1 as const
  },
  constructed(){
    (<AssertEqual<typeof this.N,1>>{}).true
  }
})

const OverN = Over().N;
(<AssertEqual<typeof OverN,1>>{}).true

/* Check super linkage */
Over.super === Base;

const Combi = Decl.extended({
  declare:{
    more: ''
  }
});

Combi()