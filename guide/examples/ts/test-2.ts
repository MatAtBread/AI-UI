import { TagCreator, tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { div, select } = tag(['div','select']);

const X = div.extended({
  prototype: {
    dir: 1,
    xxx: true
  }
});

let {dir,xxx} = X();
dir = true;
xxx = [];

const GenericSelect = <G = never>() => select.extended({
  override:{} as {
    selectedOptions: HTMLCollectionOf<HTMLOptionElement & { originalData: G }>
  }
});

const g = GenericSelect<{ info?: number }>()({
  style:{
    color: 'magenta'
  }
}).selectedOptions[0];

const NumberSelect = (GenericSelect<{ info?: number }>()).extended({
  declare:{
    label: ''
  }
});

const g2 = NumberSelect()
