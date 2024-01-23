import { TagCreator, tag } from '../../../module/esm/ai-ui.js';
import { TagCreatorArgs } from '../../../module/esm/tags.js';

/* Specify what base tags you reference in your UI */
const { div, select, option } = tag(['div','select','option']);

const X = div.extended({
  prototype: {
    dir: 1,
    xxx: true
  }
});

let {dir,xxx} = X();
//dir = true;
//xxx = [];

/*
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
*/

const GenericSelect = <G = never>(...a: TagCreatorArgs<ReturnType<typeof select>>) => select.extended({
  override:{} as {
    selectedOptions: HTMLCollectionOf<HTMLOptionElement & { originalData: G }>
  }
})(...a);

const g = GenericSelect<number>(option("Matt"));
const go = g.selectedOptions[0];


