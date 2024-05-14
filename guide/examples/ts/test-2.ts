import { TagCreator, tag } from '../../../module/esm/ai-ui.js';
import { PossiblyAsync, TagCreatorArgs } from '../../../module/esm/tags.js';

/* Specify what base tags you reference in your UI */
const { div, select, option } = tag(['div','select','option']);

const X = div.extended({
  override:{
    dir: "1"
  },
  declare: {
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

const GenericSelect = <G = never>(...a: TagCreatorArgs<PossiblyAsync<ReturnType<typeof select>> & ThisType<ReturnType<typeof select>>>) => select.extended({
  override:{
    selectedOptions: undefined as unknown as HTMLCollectionOf<HTMLOptionElement & { originalData: G }>
  }
})(...a as any[]);

const g = GenericSelect<number>({ style: { color: 'blue' } },option("Matt"));
const go = g.selectedOptions[0].originalData;
g.id

const NumberSelect = GenericSelect<number>;

const ns = NumberSelect({ style: { color: 'blue' } },'abc');

const nn = ns.selectedOptions[0].originalData
ns.id

