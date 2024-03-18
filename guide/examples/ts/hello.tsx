import { tag } from '../../../module/esm/ai-ui.js'
import React from '../../../module/esm/jsx-runtime.js';

const { div } = tag();

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

const d0 = <div>123</div>;
const q0 = <><Div>Hello</Div><div>xyz</div></>;
const [a0,b0] = q0;

const q1 = React.AIUIJSX(React.AIUIJSX, null, React.AIUIJSX(Div, null, "Hello"), React.AIUIJSX("div", null, "xyz"));
const [a1,b1] = q1;

async function* count() { for (let i = 0; i < 10; i++) { yield i; await new Promise(r => setTimeout(r, 500)) } }

const r =
  <Div thing={count()} id="MyThing" onclick={e => console.log("onclick",e)}>
    The count is: {count()}
  </Div>;

r.when('click')(e => console.log("when",e)).consume();
document.body.append(r);
