//import { JSX } from '../../../module/esm/jsx-runtime.ts';
import { PoJSX } from '../../../module/esm/jsx-runtime.js'
import { tag } from '../../../module/esm/ai-ui.js'

declare const React;
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
    });
    return <span>***</span>
  }
});

const q1 = PoJSX("div", null, "xyz");
const q2 = <div>xyz</div>;
const q3 = PoJSX(Div, null, "xyz");
const q4 = <Div>xyz</Div>;

console.log(q1,q2,q3,q4);
async function* count() {
  for (let i = 0; i < 10; i++) {
    yield i;
    await new Promise(r => setTimeout(r, 500));
  }
}

const r =
  <Div thing={count()} id="MyThing" onclick={e => console.log("onclick",e)}>
    The count is: {count()}
  </Div>;

r.when('click')(e => console.log("when",e)).consume();
document.body.append(r);
