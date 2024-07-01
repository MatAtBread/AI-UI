import { tag, type TagCreator } from '../module/src/ai-ui';
import '../module/src/augment-iterators';

declare var Base: TagCreator<Pick<HTMLElement, 'attributes' | 'onclick'>>;

const { div } = tag();
export async function* ai<const T>(t: T) { yield t }

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

const I = div.extended({
  iterable:{
    a: 1 as const
  },
  declare:{
    b: 2 as const,
    constructed(){
//      type T = Expand<typeof this>;
      this.a = 1;
      this.attributes = { a: 1 };
      this.attributes = { a: Promise.resolve(1) };
      this.attributes = { a: ai(1) };
//      this.attributes = ai({ a: 1 });

      this.b = 2;
      this.attributes = { b: 2 };
      this.attributes = { b: Promise.resolve(2) };
      this.attributes = { b: ai(2) };
//      this.attributes = ai({ b: 2 });
    }
  }
});

const aa = [
  I().a,
  I({ a: 1 }).a,
  I({ a: ai(1) }).a,
  I({ a: Promise.resolve(1) }).a,

  // @ts-expect-error
  I({ a: '!A' }).a,
  // @ts-expect-error
  I({ a: ai('!A') }).a,
  // @ts-expect-error
  I({ a: Promise.resolve('!A') }).a,
];

const bb = [
  I().b,
  I({ b: 2 }).b,
  I({ b: ai(2) }).b,
  I({ b: Promise.resolve(2) }).b,

  // @ts-expect-error
  I({ b: '!B' }).b,
  // @ts-expect-error
  I({ b: ai('!B') }).b,
  // @ts-expect-error
  I({ b: Promise.resolve('!B') }).b,
];

const i = I();
type TI = Expand<typeof i>;
i.attributes = { a: 1 };
i.attributes = { a: ai(1) };
i.attributes = { a: Promise.resolve(1) };
i.attributes = { b: 2 };
i.attributes = { b: ai(2) };
i.attributes = { b: Promise.resolve(2) };

// @ts-expect-error
i.attributes = { b: 1 };
// @ts-expect-error
i.attributes = { b: ai(1) };
// @ts-expect-error
i.attributes = { b: Promise.resolve(1) };
