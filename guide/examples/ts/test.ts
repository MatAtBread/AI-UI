import { UniqueID, tag } from '../../../module/esm/ai-ui.js';
import { iterableHelpers, queueIteratableIterator } from '../../../module/esm/iterators.js'

const { div, h2, input, span, pre, button } = tag();

const sleep = function <T>(millis: number, r?: T) {
  return new Promise<T | undefined>(function (resolve) {
    setTimeout(()=>resolve(r), millis || 0);
  });
};

function mousemove(e: MouseEvent) {
  if (!mousePosPush.push({x: e.clientX, y: e.clientY})) {
    console.log("mousPos closed!!");
  }
}
const mousePosPush = queueIteratableIterator<{x: number, y: number}>(()=>{
  console.log("stop mousePos")
  window.removeEventListener('mousemove', mousemove);
});
const mousePos = mousePosPush.multi();
window.addEventListener('mousemove', mousemove);

const Lazy = h2.extended((instance:{ myAttr: number }) => ({
  styles:`
  .Lazy {
    backgroud-color: white;
  }
  `,
  ids: {
    test: span
  },
  declare:{
    Lazy: true,
    myAttr: 57,
    get thing() { return String(instance.myAttr) },
    set thing(v:string) {
      instance.myAttr = Number(v);
      this.dispatchEvent(new Event('change'))
    },
    myMethod(n: number) { instance.myAttr = n },
  },
  override:{
    className: 'Lazy',
    onclick() { this.thing = String(Number(this.thing)-1) },
    style:{
      borderBottom: '2px solid black'
    }
  },
  async constructed(){
    this.thing = String(this.myAttr);
    await sleep(1000);
    return [" Zzz (promise) ", span(this.when('change')(_ => instance.myAttr).initially(instance.myAttr))];
  }
}));

const Lazier = Lazy.extended(inst => ({
  override:{
    className: `${inst[UniqueID]}-Lazier Lazy`,
    style:{
      borderRight: '2px solid black'
    },
  },
  declare:{
    Lazier: true
  },
  styles:`
    .${inst[UniqueID]}-Lazier {
      font-family: sans-serif;
    }
  `
}));

const Laziest = Lazier.extended({
  override:{
    className: `Laziest ${Lazier.className}`,
    onclick() { this.thing = String(Number(this.thing)+1) },
    style:{
      borderLeft: '2px solid black'
    },
  },
  declare:{
    Laziest: true
  },
  constructed(){
    this.thing = "100";
  },
  styles:`
    .Laziest:hover {
      background-color: #AA0;
    }
  `
});

const App = div.extended({
  styles:`
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
  ids:{
    text: input,
    lazy: Laziest
  },
  override:{
    className: 'App'
  },
  constructed(){
    return [
      input({id:'text'}),
      this.when('keyup:#text').initially({start: "Enter some text"}).map(e => ('type' in e) ? div({
        style:{
          color: blinky(this.ids.text!.value)
        }
      },this.ids.text?.value || e.type) : e.start),
      interval(250,10,n=>div(n),'error'),
      interval(333,10,n=>div(10-n),'complete'),
      div({
        style:{
          color: this.when('keyup:#text',blinky('blink'))(e => typeof e === 'string' ? e : this.ids.text!.value)
        },
        onclick() { this.remove() }
      },'blink'),
      div({
        style: this.when(blinky('mapped'))(async b => ({color:b})),
        onclick() { this.remove() }
      },'mapped'),
      this.when(blinky('div'))(
        s => div({
          onclick() { this.remove() },
          style:{ color: s }
        },"div")
      ),
      div({ style: { color: 'red' }},"literal ",123),
      div({ style: { color: self('red') }},"generator ", iterableHelpers(self(123)).map(x => " mapped:"+x)),
      div({ style: { color: 'green' }},"promise ",sleep(1234,123)),
      div({ style: { color: this.when(sleep(1000,'red')) }},"iter/promise ",this.when(sleep(1000,123))),

      mousePos.map(p => div({
        onclick() { this.remove() },
      },
        "New div", JSON.stringify(p))
      ),

      div({
        onclick() { this.remove() },
      },
        mousePos.map(p => ["Same div, new content", JSON.stringify(p)]).initially("...Move the mouse...")
      ),
      div({
        onclick() { this.remove() },
        textContent: mousePos.map(p => 'Div.textContent ' + JSON.stringify(p))
      }),

      div(this.when('#lazy','@ready')(()=> this.ids.lazy!.thing)),

      Laziest({ id: 'lazy'}, 'Lovely!'), pre(Laziest.valueOf()),
      Laziest.super('Super!'), pre(Laziest.super.valueOf()),
      Laziest.super.super('Super duper!'), pre(Laziest.super.super.valueOf()),
      Laziest.super.super.super('Super duper 2'), pre(Laziest.super.super.super.valueOf()),

      this.when('#lazy','@ready')(() => pre(this.ids.lazy!.constructor.name))
    ]
  }
});

const Block = div.extended({
  styles: `.RedBlock {
    border-radius: 10px;
    position: absolute;
    z-index: 99;
    width: 20px;
    height: 20px;
    background-color: red;
  }`,
  override:{
    className:'RedBlock',
    style: {
      backgroundColor: 'magenta'
    }
  }
});

const xy = mousePos.waitFor(done => requestAnimationFrame(time => done())).map(({x,y}) => ({
  left: `${x + 20}px`,
  top: `${y + 20}px`
}));


let app: ReturnType<typeof App>;
document.body.append(
  app = App({ style: { border: '1px solid black' }}),
  Block({
    style: xy,
    onclick() { this.remove(); }
  })
);

async function *interval<T>(t: number, limit: number, fn:(n:number)=>T, terminate: 'complete' | 'error' = 'complete') {
  for (let i=0; i<limit; i++) {
    await sleep(t);
    yield fn(i);
  }
  if (terminate === 'error')
    throw new Error("Interval ended");
}

async function *blinky(blinkID: string) {
  console.log("start Blinky",blinkID);
  try {
    while (true) {
      await sleep(750);
      yield '#808';
      await sleep(750);
      yield '#088';
    }
  } catch (ex) {
    console.log("Blinky",ex);
  } finally {
    console.log("finally Blinky",blinkID);
  }
  console.log("stop Blinky",blinkID);
}

async function *self<T>(x: T) {
  yield x
}

(async ()=>{
for await (const x of app.when('#lazy','@ready').waitFor(done => setTimeout(done,500)).map(x => app.ids.lazy!.thing)) {
  console.log("waitFor,map",x);
}
})();

(async ()=>{
  for await (const x of app.when('#lazy','@ready')(x => app.ids.lazy!.thing).filter(x => Boolean(Number(x)&1))) {
    console.log("(map),filter",x);
  }
})();
