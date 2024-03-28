import type { TagCreator } from '../module/src/ai-ui';
import { AsyncExtraIterable } from '../module/src/iterators';
import { Flatten } from '../module/src/tags';

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

/* Declare a tag type & function */
declare var Base: TagCreator<{ Attr: 'base' }>;

const I1 = Base.extended({
  iterable:{
    payload: {} as { one?: 'ONE' }
  },
  constructed(){
    this.payload.consume!(m => { [m.one == 'ONE'] });
    this.payload!.one!.consume!(m => { m == 'ONE' });
  }
});

const i1 = I1();
i1.payload.consume!(m => { [m.one == 'ONE'] });
i1.payload!.one!.consume!(m => { m == 'ONE' });

type IntersectionReturnType<A> = 
  A extends (()=>infer R) 
  ? A extends (()=>R) & infer B 
    ? R & IntersectionReturnType<B>
    : R
  : unknown;

var payload: 
  { two?: ("TWO" & Partial<AsyncExtraIterable<"TWO" | undefined>>) | undefined; } 
& Partial<AsyncExtraIterable<{ two?: "TWO" | undefined }>> 
& { one?: ("ONE" & Partial<AsyncExtraIterable<"ONE" | undefined>>) | undefined; } 
& Partial<AsyncExtraIterable<{ one?: "ONE" | undefined; }>>;

// type Q = Flatten<Required<typeof payload>>;
// type F = Required<Flatten<typeof payload>>;
// type A = ReturnType<Q[typeof Symbol.asyncIterator]>;
// type B = IntersectionReturnType<Q[typeof Symbol.asyncIterator]>;

const I2 = I1.extended({
  iterable:{
    payload: {} as { two?: 'TWO' }
  },
  async constructed(){
    const q = f(this.payload);
    const ap = this.payload as Required<typeof this.payload>;
    this.payload.consume!(m => { [m.one == 'ONE', m.two == 'TWO'] });
    this.payload!.one!.consume!(m => { m == 'ONE' });
    this.payload!.two!.consume!(m => { m == 'TWO' });
  }
});

//const Missing = Symbol("Missing");
/*type Combine<A,B> = A|B/*A extends object 
  ? B extends object
    ? {
      [K in keyof A | keyof B]:
      Exclude<
        Combine<
          K extends keyof A ? A[K] : typeof Missing,
          K extends keyof B ? B[K] : typeof Missing
        >, 
        typeof Missing
      >
    }
    : A | B
  : A | B;*/

/*type IntersectAsyncIterable<A extends AsyncIterable<any>> = 
  A extends AsyncIterable<infer R> 
  ? A extends AsyncIterable<R> & infer B extends AsyncIterable<any>
    ? Combine<R, IntersectAsyncIterable<B>>
    : R
  : never;*

  type IntersectAsyncIterable<A extends AsyncIterable<any>, Acc = never> = 
  A extends AsyncIterable<infer R> 
  ? A extends AsyncIterable<R> & infer B 
    ? IntersectAsyncIterable<B, Combine<R, Acc>>
    : Combine<R, Acc>
  : Acc;
*/

type IntersectAsyncIterable<Q extends Partial<AsyncIterable<any>>> = IntersectAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type IntersectAsyncIterator<F, And = {}, Or = never> =
  F extends ()=>AsyncIterator<infer T>
  ? F extends (()=>AsyncIterator<T>) & infer B
  ? IntersectAsyncIterator<B, T extends object ? And & T : And, T extends object ? Or : Or | T>
  : T extends object ? And & T : Or | T
  : Exclude<Flatten<Partial<And>> | Or, Record<string,never>>;   

type Q = Partial<AsyncIterable<number>> & Partial<AsyncIterable<string>> & { other: boolean };
type P = Partial<AsyncIterable<{n:number}>> & Partial<AsyncIterable<{n:string}>> & { other: boolean };
type R = Partial<AsyncIterable<number>> & Partial<AsyncIterable<{n:string}>> & { other: boolean };
type S = Partial<AsyncIterable<{n:boolean}>> & Partial<AsyncIterable<{s:string}>> & { other: boolean };
type QI = IntersectAsyncIterable<Q>;
type PI = IntersectAsyncIterable<P>;
type RI = IntersectAsyncIterable<R>;
type SI = IntersectAsyncIterable<S>;

declare var py: {
  one?: ("ONE" & Partial<AsyncExtraIterable<"ONE" | undefined>>) | undefined;
} & Partial<AsyncExtraIterable<{
  one?: "ONE" | undefined;
}>> & {
  two?: ("TWO" & Partial<AsyncExtraIterable<"TWO" | undefined>>) | undefined;
} & Partial<AsyncExtraIterable<{
  two?: "TWO" | undefined;
}>>;

const r = f(py.one!);

function f<T extends Partial<AsyncIterable<any>>>(ai: T): IntersectAsyncIterable<T>  {
  (ai as unknown as AsyncExtraIterable<any>).consume(v => console.log(v));
  return {} as any;
}

const i2 = I2();
const f2 = f(i2.payload);
const g2 = f(i2.payload.one!);
const h2 = f(i2.payload.two!);

i2.payload.consume!(m => { [m.one == 'ONE', m.two == 'TWO'] });
i2.payload!.one!.consume!(m => { m == 'ONE' });
i2.payload!.two!.consume!(m => { m == 'TWO' });


/*
export const BaseDevice = Base.extended({
  iterable: {
    payload: {} as {
      basic?: boolean
    }
  }
});

export const ZigbeeDevice = BaseDevice.extended({
  iterable: {
    payload: {} as {
      battery_low?: boolean
      linkquality?: number | typeof NaN
    }
  },
  async constructed() {
    this.payload.linkquality!.map!(m => m);
    this.payload.battery_low!.map!(m => m);
    this.payload.basic!.map!(m => m);

    const z = this.payload as Required<typeof this.payload>;
    type T = typeof z;
    
    for await (const y of z) {
      console.log(y);
    } 
    
    for await (const y of this.payload as Required<typeof this.payload>) {
      console.log(y);
    } 
    
    z.consume!(m => { [m.basic, m.linkquality] });
    this.payload.consume!(m => { [m.basic, m.linkquality] });
  }
});
*/