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
