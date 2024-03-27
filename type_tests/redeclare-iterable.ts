import type { TagCreator } from '../module/src/ai-ui';
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
    this.payload;
    this.payload?.one;
    // @ts-expect-error - two is not declared by I1
    this.payload?.two;
  }
});

type IntersectionReturnType<A> = 
  A extends (()=>infer R) 
  ? A extends (()=>R) & infer B 
    ? R & IntersectionReturnType<B>
    : R
  : A;

const I2 = I1.extended({
  iterable:{
    payload: {} as { two?: 'TWO' }
  },
  constructed(){
    const pa = this.payload[Symbol.asyncIterator]!;
    const ta = pa();
    type PR = IntersectionReturnType<typeof pa>;
    type TR = ReturnType<typeof pa>;

    this.payload;
    this.payload?.one;
    this.payload?.two;
  }
});


const i1 = I1();
const i2 = I2();

i1.payload?.one;
// @ts-expect-error - two is not declared by I1
i1.payload?.two;

i2.payload?.one;
i2.payload?.two;

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