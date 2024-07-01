import { tag, type TagCreator } from '../module/src/ai-ui';
import '../module/src/augment-iterators';

declare var Base: TagCreator<Pick<Element, 'attributes'>>;

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

const I = Base.extended({
  iterable:{
    a: 'A' as const
  },
  declare:{
//    a: 'A' as const,
    constructed(){
      type T = Expand<typeof this>; 
      this.a = 'A';
      this.attributes = { a: 'A' };
      this.attributes = { a: Promise.resolve('A') };
      this.attributes = { a: ai('A') };
    }
  }
});

const t = [
  I().a,
  I({ a: 'A' }).a,
  I({ a: ai('A') }).a,
  I({ a: Promise.resolve('A') }).a,

  // @ts-expect-error
  I({ a: 'B' }).a,
  // @ts-expect-error
  I({ a: ai('B') }).a,
  // @ts-expect-error
  I({ a: Promise.resolve('B') }).a,
];

const i = I();
type TI = Expand<typeof i>;
i.attributes = { a: 'A'};
i.attributes = { a: 'A'};

