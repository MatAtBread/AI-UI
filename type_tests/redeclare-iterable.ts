import type { TagCreator } from '../module/src/ai-ui';

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

const I2 = I1.extended({
  iterable:{
    payload: {} as { two?: 'TWO' }
  },
  async constructed(){
    this.payload.consume!(m => { [m.one == 'ONE', m.two == 'TWO'] });
    this.payload.one!.consume!(m => { m == 'ONE' });
    this.payload.two!.consume!(m => { m == 'TWO' });
  }
});

const i2 = I2();
i2.payload.consume!(m => { [m.one == 'ONE', m.two == 'TWO'] });
i2.payload.one!.consume!(m => { m == 'ONE' });
i2.payload.two!.consume!(m => { m == 'TWO' });

const BaseDevice = Base.extended({
  iterable: {
    payload: {} as {
      basic?: boolean
    }
  }
});

const ZigbeeDevice = BaseDevice.extended({
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
    
    for await (const y of this.payload as Required<typeof this.payload>) {
      console.log(y);
    } 
    
    z.consume!(m => { [m.basic, m.linkquality] });
    this.payload.consume!(m => { [m.basic, m.linkquality] });
  }
});
