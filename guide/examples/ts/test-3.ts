import { tag } from '../../../module/esm/ai-ui.js';

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
    things: [{ n: 123 }]
  }
});

document.body.append(B({
  thing: {n: 3},
  things:[{ n: 1 }, { s: '', n: 2 }]
}));
