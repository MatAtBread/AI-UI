import { tag } from '../../../module/esm/ai-ui.js'

const { div, span, button } = tag();

const Thing = div.extended({
  iterable: {
    thing: {} as {
      a?: string[]
      b?: string
    }
  },
  constructed() {
    return span("Thing is ",this.thing.a,this.thing.b);
  }
});

const t = Thing();
const z = t.thing.a
document.body.append(t,
  button({ onclick:()=> t.thing = { a:['xyz','uvw'] }},"set thing{a}"),
  button({ onclick:()=> t.thing.a = ['pqr','stu'] },"set thing.a"),

  button({ onclick:()=> t.thing = { b:'mmm' }},"set thing{b}"),
  button({ onclick:()=> t.thing.b = 'nnn' },"set thing.b")
);
// @ts-ignore
window.t = t;
