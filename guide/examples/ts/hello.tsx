// <reference path="../../../module/src/ai-ui.ts"/>
import '../../../module/esm/jsx-runtime.js';
// export interface JSXElement extends Node {
//     type: "JSXElement";
//     children: Array<JSXElement>;
// }

//declare namespace JSX {
    interface IntrinsicElements {
      div: HTMLDivElement// React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  //}
const q = <div></div>;

export function hello() {
    return <><div>Hello</div><div>World</div></>;
}

document.body.append(...hello());
