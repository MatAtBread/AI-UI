import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input, span, template, style } = tag();

const App2 = div.extended({
  constructed() {
    return template({
      style: { display:'block' }, 
    },div({id:'xxx'},"start"),"ABC",div("end"));
  }
});

const Shadowed = div.extended({
  declare:{
    shadowStyles: null as string | null
  },
  constructed() {
    const ch = this.childNodes;
    const shadow = this.attachShadow({ mode: 'closed' });
    shadow.append(...tag.nodes(ch));
    if (this.shadowStyles)
      shadow.append(style({textContent: this.shadowStyles }));
    this.append = function(...args:any) { return shadow.append(...tag.nodes(...args)) }
  }
});

const App = Shadowed.extended({
  override:{
    shadowStyles:`#xxx { color: red; }`
  },
  constructed() {
    return [div({className:'X', id: 'xxx'},"start")," >>> ",div("end")];
  }
})


/* Add add it to the document so the user can see it! */
const app = App({
  style: {
    color: 'blue'
  }
},'Iterable properies');
document.body.append("ABC",/*app*/ App2("App2"),"DEF");

//type WhenIteratedType<S extends WhenParameters> = (Extract<S[number], AsyncIterable<any>> extends AsyncIterable<infer I> ? unknown extends I ? never : I : never) | ExtractEvents<Extract<S[number], string>> | (Extract<S[number], Element> extends never ? never : Event);
// type X = WhenReturn<["change"]>;
//const X = app.when('change') ;//.consume(e => console.log(e));
