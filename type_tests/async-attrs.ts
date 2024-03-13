import type { TagCreator } from '../module/src/ai-ui';

export async function* ai<T>(t: T) { yield t }

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

/* Declare a tag type & function */
declare var Base: TagCreator<{ Attr: 'base', N: 0 | 1 | 2, obj: { n: number, s: string } }>;
declare var F: TagCreator<{ fn(a: number, b: string):{ res: string } }>;

const b1 = Base({
  Attr: 'base',
  N: 2,
  obj:{
    s: '123'
  }
});

const b2 = Base({
  Attr: ai('base'),
  N: 2,
  obj:ai({
    s: '123'
  })
});

const b3 = Base({
  Attr: ai('base'),
  N: 2,
  obj:{
    s: ai('123')
  }
});

const b4 = Base({
  Attr: Promise.resolve('base'),
  N: 2,
  obj: Promise.resolve({
    s: '123'
  })
});

const b5 = Base({
  Attr: Promise.resolve('base'),
  N: 2,
  obj:{
    s: Promise.resolve('123')
  }
});

const f1 = F({
  fn(a, b) {
    return { res: a+b };
  },
});

// Test to check on the co- and contravariance of `fn` declarations