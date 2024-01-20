import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { div } = tag(['div']);

const X = div.extended({
  prototype: {
    dir: 1,
    xxx: true
  }
});

let {dir,xxx} = X();
dir = true;
xxx = [];
