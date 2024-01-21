import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { div, select } = tag(['div','select']);

const X = div.extended({
  prototype: {
    dir: 1,
    xxx: true
  }
});

let {dir,xxx} = X();
//dir = true;
//xxx = [];

const v = select.extended({
  declare:{
    get valueAsNumber() {
      return Number(this.value)
    }
  }
})().valueAsNumber;
