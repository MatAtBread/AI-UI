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

type Q = Flatten<Required<typeof payload>>;
type F = Required<Flatten<typeof payload>>;
type A = ReturnType<Q[typeof Symbol.asyncIterator]>;
type B = IntersectionReturnType<Q[typeof Symbol.asyncIterator]>;

const I2 = I1.extended({
  iterable:{
    payload: {} as { two?: 'TWO' }
  },
  async constructed(){
    const ap = this.payload as Required<typeof this.payload>;
    this.payload.consume!(m => { [m.one == 'ONE', m.two == 'TWO'] });
    this.payload!.one!.consume!(m => { m == 'ONE' });
    this.payload!.two!.consume!(m => { m == 'TWO' });
  }
});


const i2 = I2();
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