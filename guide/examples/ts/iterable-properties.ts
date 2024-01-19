import { tag } from '../../../module/esm/ai-ui.js';
import { merge } from '../../../module/esm/iterators.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input } = tag(['h2', 'div', 'button', 'input']);
const App = div.extended({
  declare:{
    lastNum: 0,
    reset() {
      this.num = 0;
    }
  },
  iterable: {
    num: 100,
    rounded: false as boolean
  },
  override: {
    /* generates error (key a base key) fnarr: 0, */
    /* generates error (wrong type for key) align: 0, */
    dir: ''
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
      div(typeof this.num), // NOT 'number' as it's boxed
      div(this.num, ' ', this.num.waitFor!(done => setTimeout(done, 500))),
      div(-this.num), // NOT dynamic, as it evaluates to a number
      // @ts-ignore
      div(merge(this.rounded!, this.num).map!(_ => this.num * (this.rounded == true ? 1 : -1))), // Dynamic - we map the value
    ]
  }
});

/* Add add it to the document so the user can see it! */
const app = App({
  style: {
    color: 'blue'
  }
},'Iterable properies');
document.body.append(app);

//type WhenIteratedType<S extends WhenParameters> = (Extract<S[number], AsyncIterable<any>> extends AsyncIterable<infer I> ? unknown extends I ? never : I : never) | ExtractEvents<Extract<S[number], string>> | (Extract<S[number], Element> extends never ? never : Event);
// type X = WhenReturn<["change"]>;
//const X = app.when('change') ;//.consume(e => console.log(e));
