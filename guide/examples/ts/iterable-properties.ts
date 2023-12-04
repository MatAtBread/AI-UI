import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input } = tag(['h2', 'div', 'button', 'input']);

const App = div.extended({
  declare:{
    reset() {
      this.num = 0;
    }
  },
  iterable: {
    num: 100,
    rounded: false as boolean
  },
  override: {
    id: 'mat',
  },
  ids:{
    rounded: input
  },
  styles:`button { margin: 0.5em; }`,
  constructed() {
    /* When constructed, this "div" tag contains some other tags: */
    const borderRadius = this.rounded.map!(f => f ? '1em': '').broadcast();
    return [
      h2("Hello World"),
      input({ type: 'checkbox', id: 'rounded', onclick:(e)=>{ this.rounded = this.ids.rounded!.checked }}),
      button({ 
        style: { borderRadius },
        onclick: () => this.num = this.num + 1 
      }, '+'),
      button({ 
        style: { borderRadius },
        onclick: () => this.num -= 1
      }, '-'),
      this.rounded.map!(f => f ? div("ABC") : div("def")),
      div(this.num), 
      div(this.num.map!(n => JSON.stringify({n}))), 
      div(typeof this.num), // NOT 'number' as it's boxed
      div(this.num, ' ', this.num.waitFor!(done => setTimeout(done, 500))),
      div(-this.num), // NOT dynamic, as it evaluates to a number
      div(this.num.map!(n => "-ve: "+(-n))), // Dynamic - we map the value
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