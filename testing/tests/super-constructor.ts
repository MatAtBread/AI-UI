/// <reference path="../test.env.d.ts"/>

import { tag, Iterators } from '../../module/src/ai-ui';
const { iterableHelpers } = Iterators;

const sleep = Test.sleep;
let running = true;

const { div, h2, input, span, pre, button } = tag();

const Lazy = h2.extended((instance: { myAttr: number }) => ({
  styles: `
  .Lazy {
    backgroud-color: white;
  }
  `,
  ids: {
    test: span
  },
  declare: {
    Lazy: true,
    myAttr: 57,
    get thing() { return String(instance.myAttr) },
    set thing(v: string) {
      instance.myAttr = Number(v);
      this.dispatchEvent(new Event('change'))
    },
    myMethod(n: number) { instance.myAttr = n },
  },
  override: {
    className: 'Lazy',
    onclick() { this.thing = String(Number(this.thing) - 1) },
    style: {
      borderBottom: '2px solid black'
    }
  },
  async constructed() {
    this.thing = String(this.myAttr);
    await sleep(1);
    return [" Zzz (promise) ", span(this.when('change')(_ => instance.myAttr).initially(instance.myAttr))];
  }
}));

const Lazier = Lazy.extended({
  override: {
    className: `Lazier Lazy`,
    style: {
      borderRight: '2px solid black'
    },
  },
  declare: {
    Lazier: true
  },
  styles: `
    .Lazier {
      font-family: sans-serif;
    }
  `
});

const Laziest = Lazier.extended({
  override: {
    className: `Laziest ${Lazier.className}`,
    onclick() { this.thing = String(Number(this.thing) + 1) },
    style: {
      borderLeft: '2px solid black'
    },
  },
  declare: {
    Laziest: true
  },
  constructed() {
    this.thing = "100";
  },
  styles: `
    .Laziest:hover {
      background-color: #AA0;
    }
  `
});

const App = div.extended({
  styles: `
  .App {
    background-color: #ddd;
    padding: 0.3em;
    position: absolute;
    top: 4px;
    left: 4px;
    bottom: 4px;
    right: 4px;
  }
  `,
  ids: {
    text: input,
    lazy: Laziest
  },
  override: {
    className: 'App'
  },
  constructed() {
    return [
      input({ id: 'text' }),
      this.when('keyup:#text').initially({ start: "Enter some text" }).map(e => ('type' in e) ? div({
        style: {
          color: blinky(this.ids.text!.value)
        }
      }, this.ids.text?.value || e.type) : e.start),
      interval(.25, 10, n => div(n), 'error'),
      interval(.333, 10, n => div(10 - n), 'complete'),
      div({
        style: {
          color: this.when('keyup:#text', blinky('blink'))(e => typeof e === 'string' ? e : this.ids.text!.value)
        },
        onclick() { this.remove() }
      }, 'blink'),
      div({
        style: this.when(blinky('mapped'))(async b => ({ color: b })),
        onclick() { this.remove() }
      }, 'mapped'),
      this.when(blinky('div'))(
        s => div({
          onclick() { this.remove() },
          style: { color: s }
        }, "div")
      ),
      div({ style: { color: 'red' } }, "literal ", 123),
      div({ style: { color: self('red') } }, "generator ", iterableHelpers(self(123)).map(x => " mapped:" + x)),
      div({ style: { color: 'green' } }, "promise ", sleep(1.234, 123)),
      div({ style: { color: this.when(sleep(1, 'red')) } }, "iter/promise ", this.when(sleep(1, 123))),

      div(this.when('#lazy', '@ready')(() => this.ids.lazy!.thing)),

      Laziest({ id: 'lazy' }, 'Lovely!'), pre(Laziest.valueOf()),
      Laziest.super('Super!'), pre(Laziest.super.valueOf()),
      Laziest.super.super('Super duper!'), pre(Laziest.super.super.valueOf()),
      Laziest.super.super.super('Super duper 2'), pre(Laziest.super.super.super.valueOf()),

      this.when('#lazy', '@ready')(() => pre(this.ids.lazy!.constructor.name))
    ]
  }
});

document.body.append(
  App({ style: { border: '1px solid black' } })
);

async function* interval<T>(t: number, limit: number, fn: (n: number) => T, terminate: 'complete' | 'error' = 'complete') {
  for (let i = 0; i < limit; i++) {
    await sleep(t);
    yield fn(i);
  }
  if (terminate === 'error')
    throw new Error("Interval ended");
}

async function* blinky(blinkID: string) {
  console.log("start Blinky", blinkID);
  try {
    while (running) {
      await sleep(.75);
      yield '#808';
      await sleep(.75);
      yield '#088';
    }
  } catch (ex) {
    console.log("Blinky", ex);
  } finally {
    console.log("finally Blinky", blinkID);
  }
  console.log("stop Blinky", blinkID);
}

async function* self<T>(x: T) {
  yield x
}

console.log(document.body.innerHTML);
await sleep(4);
console.log(document.body.innerHTML);
running = false;
await sleep(2);
