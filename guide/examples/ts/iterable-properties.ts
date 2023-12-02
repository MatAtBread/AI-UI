import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input } = tag(['h2', 'div', 'button', 'input']);

const App = div.extended({
  iterable: {
    num: 100,
    rounded: false,
    /*obj: {
      abc: 123
    }*/
  },
  styles:`button { margin: 0.5em; }`,
  constructed() {
    /* When constructed, this "div" tag contains some other tags: */
    return [
      h2("Hello World"),
      input({ type: 'checkbox', id: 'rounded', onclick:(e)=>{ this.rounded = this.ids.rounded.checked }}),
      // Assignments need a cast
      button({ 
        style: { borderRadius: this.rounded.map(f => f ? '1em': '') },
        onclick: () => (this.num as number) = this.num + 1 
      }, '+'),
      button({ 
        style: { borderRadius: this.rounded.map(f => f ? '1em': '') },
        onclick: () => (this.num as number) = this.num - 1 
      }, '-'),
      div(this.num, ' ', this.num.waitFor(done => setTimeout(done, 500))),
      div(-this.num), // NOT dynamic, as it evaluates to a number
      div(this.num.map(n => -n)), // Dynamic - we map the value
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