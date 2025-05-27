import { tag } from '../module/src/ai-ui';

const { div } = tag();

const I = div.extended({
  iterable: {
    i1: 0
  },
  declare:{
    d1: 0
  }
}).extended({
  iterable: {
    i2: 0
  },
  declare:{
    d2: 0
  }
});

const i = I();
// @ts-expect-error
i.filter

i.i1 + 0
i.i2 + 0
i.i1.consume
i.i2.consume

i.d1 + 0
i.d2 + 0
// @ts-expect-error
i.d1.consume
// @ts-expect-error
i.d2.consume

const J1 = div.extended({
  iterable: {
    ok: '',
  }
});

J1().ok = 'abc';

const J2 = div.extended({
  iterable: {
    ok: { s: '' },
  }
});

J2().ok.s = 'abc';

const J3 = div.extended({
  iterable: {
    ok: [2,4,7,'str'],
  }
});

J3().ok[1] = 'abc';
J3().ok[1] = 123;
// @ts-expect-error - maybe this should actually work?
J3().ok = [123,'abc'];


const J4 = div.extended({
  iterable: {
    err: [()=>{},()=>{},()=>{}],
  }
});

// @ts-expect-error - members cannot be functions
J4();

const J5 = div.extended({
  iterable: {
    f(){},
  }
});

// @ts-expect-error - members cannot be functions
J5();

const J6 = div.extended({
  iterable: {
    err: {} as { t: number, u:()=>{} , v: { x?: number }, w:()=>true }
  }
});

// @ts-expect-error - members cannot be functions
J6();

const J7 = div.extended({
  iterable: {
    okPrimitive: '',
    okObject: { s: '' },
    okArray: [2,4,7,'str'],
    errFn(){},
    errArray: [()=>{},()=>{},()=>{}],
    errObject: {} as { t: number, u:()=>{} , v: { x?: number }, w:()=>true }
  }
});

// @ts-expect-error - members cannot be functions
J7();

