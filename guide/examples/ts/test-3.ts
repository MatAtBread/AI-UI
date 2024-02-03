//import { tag } from '../../../module/esm/ai-ui.js';
import { tag } from '../../../module/src/ai-ui';

/* Specify what base tags you reference in your UI */
const { div, select, option } = tag(['div','select','option']);

type Thing = {
  n: number
  s?: string
}

const A = div.extended({
  declare:{
    thing: undefined as unknown as Thing,
    things: [] as Thing[]
  }
});

const B = A.extended({
  override: {
    thing: { n: 2, x: false },
    things: [{ n: 123, d: true }]//, { n: 1 }, { s: '', n: 2 }]
  }
});

B().things;
B().thing;

type ZZ =  {
  n: number;
}[] & Thing[];

const z = B().things[0];