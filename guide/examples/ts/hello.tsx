import '../../../module/esm/jsx-runtime.js';
import { tag } from '../../../module/esm/ai-ui.js'

const { div: Div } = tag();
const div = Div;
declare const React: {};

declare namespace JSX {
  interface IntrinsicElements {
    foo: { thing?: number }
  }
}

const DivX = div.extended({
  declare:{
    thing: 0
  }
});

const p = <foo>Hello</foo>;

const q = <div>Hello</div>;
const r = <DivX>Hello</DivX>;

document.body.append(q);

/*export function hello() {
  //return [<Div>Hello</Div>];
  return <><Div>Hello</Div><div>World</div></>;
}

document.body.append(...hello());
*/