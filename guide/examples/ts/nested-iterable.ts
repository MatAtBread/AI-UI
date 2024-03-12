import { tag, Iterators } from '../../../module/esm/ai-ui.js'

const { div, button, input } = tag();

type Type = { n: number, s: string };

const T = div.extended({
  iterable: {
    num: 0,
    foo: {
      //[Iterators.Iterability]: 'shallow',
      n: 0,
      s: 'z'
    } as Type
  },
  constructed() {
    return [
      div("num is: ", this.num, " ", input({ type: 'range', value: this.num.map!(n => String(100-n)) })),
      div("n is: ", this.foo.n),
      div("s is: ", this.foo.s),
      div("s is: ", this.foo.s),
      div("foo.n is: ", this.foo.map!(o => o.n)),
      div("foo.s is: ", this.foo.map!(o => o.s)),
      div("foo.s is: ", this.foo.map!(o => o.s)),
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
  input({ type: 'range', oninput() { t.num = Number(this.value) } })
  );
(window as any).t = t;

