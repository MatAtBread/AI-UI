//import { tag } from '../../../module/esm/ai-ui.js';
import { tag } from '../module/src/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { div, span, select, option } = tag();

type Thing = {
  n: number
  s?: string
};

const A = div.extended({
  declare:{
    thing: undefined as unknown as Thing,
    things: [] as Thing[],
    gen: undefined as unknown // can be narrowed in an extended tag
  }
});

const B = A.extended({
  override: {
    thing: { n: 2 },
    things: [{ n: 123 }], //, { n: 1 }, { s: '', n: 2 }]
    gen: 0 // Narrow gen from `unknown` to number
  }
});

const C = A.extended({
  override: {
    thing: { n: 2, d: true },
    things: [{ n: 123, e: false },{ n: 123, f: 99 }], //, { n: 1 }, { s: '', n: 2 }]
    gen: '0' // Narrow gen from `unknown` to string
  }
});

A().thing;
B().thing;
C().thing;

A().gen;
B().gen;
C().gen;

A().things;
B().things;
C().things;

const az = A().things[0];
const bz = B().things[0];

const X = div.extended({
  ids:{
    a: A,
    b: B,
    gabor: C
  },
  constructed(){
    let q: keyof typeof this.ids;
    this.ids.b
    this.when('#a','cut:#gabor','.class');
  }
})

const x = X({});