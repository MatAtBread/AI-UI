import { tag } from '../../../module/esm/ai-ui.js'
import React from '../../../module/esm/jsx-runtime.js';

const { div: _div } = tag();

const Div = _div.extended({
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

const q = [<Div>Hello</Div>,<div>xyz</div>];

console.log(q);
async function* count() { for (let i = 0; i < 10; i++) { yield i; await new Promise(r => setTimeout(r, 500)) } }

const r =
  <Div thing={count()} id="MyThing" onclick={e => console.log("onclick",e)}>
    The count is: {count()}
  </Div>;

r.when('click')(e => console.log("when",e)).consume();
document.body.append(r);
