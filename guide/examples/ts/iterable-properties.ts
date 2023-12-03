import { tag } from '../../../module/esm/ai-ui.js';
import { AsyncExtraIterable } from '../../../module/esm/iterators.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input } = tag(['h2', 'div', 'button', 'input']);

const App = div.extended({
  iterable: {
    num: 100,
    rounded: false as boolean
  },
  prototype:{
    reset() {
      this.num = 0;
    }
  },
  styles:`button { margin: 0.5em; }`,
  constructed() {
    /* When constructed, this "div" tag contains some other tags: */
    const borderRadius = (this.rounded as unknown as AsyncExtraIterable<boolean>).map(f => f ? '1em': '').broadcast(x => x);
    return [
      h2("Hello World"),
      input({ type: 'checkbox', id: 'rounded', onclick:(e)=>{ this.rounded = this.ids.rounded.checked }}),
      button({ 
        style: { borderRadius },
        onclick: () => this.num = this.num + 1 
      }, '+'),
      button({ 
        style: { borderRadius },
        onclick: () => this.num -= 1
      }, '-'),
      div(this.num), // NOT dynamic, as it evaluates to a number
      div(this.num), // NOT dynamic, as it evaluates to a number
      div(this.num, ' ', (this.num as unknown as AsyncExtraIterable<number>).waitFor(done => setTimeout(done, 500))),
      div(-this.num), // NOT dynamic, as it evaluates to a number
      div((this.num as unknown as AsyncExtraIterable<number>).map(n => "It's: "+n)), // Dynamic - we map the value
    ]
  }
});

/* Add add it to the document so the user can see it! */
document.body.append(App({
  style: {
    color: 'blue'
  }
},
  'Iterable properies'));