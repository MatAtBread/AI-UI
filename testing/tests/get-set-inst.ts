/// <reference path="../test.env.d.ts"/>

import { Instance, tag } from '../../module/src/ai-ui';

const { div } = tag();

const A = div.extended((inst: Instance<{num: number}>) => ({
  declare:{
    get fn() { return inst.num * 10 },
    set fn(n: number ) { inst.num = n - 1}
  },
  constructed() {
    if (!('num' in inst))
      this.fn = 5;
  }
}));

/* Create and add an "App" element to the document so the user can see it! */
const a = A();
console.log(a.fn);
a.fn = 7;
console.log(a.fn);

const b = A({ fn: 9 });
console.log(b.fn);
b.fn = 11;
console.log(b.fn);
