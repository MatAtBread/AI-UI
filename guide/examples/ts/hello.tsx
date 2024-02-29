import '../../../module/esm/jsx-runtime.js';
import { tag } from '../../../module/esm/ai-ui.js'
import type * as Tags from '../../../module/esm/tags.js'

const { div } = tag();//{} as React.JSX.Element);

declare var React: unknown;
declare namespace React {
  namespace JSX {
    /*type IntrinsicElements = {
      foo: { thing?: number }
    } & {
      [k in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[k]>
    };*/
    // interface Element extends Partial<ReturnType<Tags.TagCreator<HTMLElement>>> {
    // }
  }
};

//declare var React;

const Div = div.extended({
  iterable: {
    thing: 0
  },
  constructed() {
    this.attributes = this.thing.map!(n => {
      return {
        style: {
          opacity: n / 10
        }
      }
    })
  }
});

//const p = <foo>Hello</foo>;
//const q = <div>Hello</div>;
async function* count() { for (let i = 0; i < 10; i++) { yield i; await new Promise(r => setTimeout(r, 500)) } }

const r = <div>
  <Div thing={count()} id="MyThing" onclick={e => console.log(e)}>
    The count is: {count()}
  </Div>
</div>;

document.body.append(r);
