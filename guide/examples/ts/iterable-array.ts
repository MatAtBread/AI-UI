import { tag } from '../../../module/src/ai-ui.js'

const { div, span, button } = tag();
async function *I<T>(t:T){ yield t }
/*
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

(window as any).t = t;
*/
const Arr = div.extended({
  iterable:{
    a: [] as string[],
    b: 0,
    o: {
      foo: 0,
      bar: false
    }
  },
  declare: {
    z: 0
  },
  constructed(){
    this.attributes = {
      z: I(8),
      className: I('0')
    };
    this.attributes = {
      z: 8,
      className: 'c'
    };
    return this.a
  }
});
const arr = Arr();
