import { tag } from '../../../module/esm/ai-ui.js'

const { div, button, input } = tag();

type Type = { n: number, s: string, nest: { f: boolean }, g?: number };

const T = div.extended({
  iterable: {
    num: 0,
    foo: {
      //[Iterators.Iterability]: 'shallow',
      n: 0,
      s: 'z',
      nest: {
        f: false
      }
    } as Type
  },
  ids:{
    slider: input
  },
  constructed() {
    this.foo.g?.consume!(g => console.log("g=",g));
    this.foo.nest.f.consume!(f => { this.style.backgroundColor = f == true ? '#ffc' : '#cff' });
    this.foo.nest.consume!(nest => { this.ids.slider.style.float = nest?.f == true ? 'right' : 'left' });
    return [
      div({ style: { lineHeight: '1.5em' }},
        input({ id: 'slider', type: 'range', value: this.num.map!(n => String(100-n)) }),
        "num is: ", this.num, " "
      ),
      div("n is: ", this.foo.n),
      div("s is: ", this.foo.s),
      div("s is: ", this.foo.s),
      div("foo.n is: ", this.foo.map!(o => o.n)),
      div("foo.s is: ", this.foo.map!(o => o.s)),
      div("foo.s is: ", this.foo.map!(o => o.s))
    ]
  }
});

const t = T("Test");

const State = div.extended({
  declare:{
    f: undefined as 'n'|'s'|undefined,
    d: undefined as any
  },
  constructed() {
    return [
      button({
        onclick: ()=> this.f ?
        // @ts-ignore
        t.foo[this.f]
        = this.d : t.foo = this.d,
      }, 'foo', '.', this.f, ' = ', JSON.stringify(this.d))
    ]
  }
})
document.body.append(t,
  State({ d: { s: 'abc', n: 123 }}),
  State({ f: 's', d: 'xxx' }),
  State({ f: 'n', d: 777 }),

  State({ f: 's', d: 'yyy' }),
  State({ d: { s: 'def', n: 456 }}),
  State({ f: 'n', d: 888 }),
  input({ type: 'range', oninput() { t.num = Number(this.value) } }),
  input({ type: 'checkbox', onchange() { t.foo.nest = { f: this.checked }} }),
  div(t.foo.map!(v => JSON.stringify(v))),
  div(t.foo.map!(() => JSON.stringify(t.foo.valueOf())))
);
(window as any).t = t;

