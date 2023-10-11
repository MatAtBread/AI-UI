import { tag } from '../../module/esm/ai-ui.js';
import { broadcastIterator, withHelpers } from '../../module/esm/iterators.js'

const { div, h2, input, span, pre, button } = tag();

const sleep = function <T>(millis: number, r?: T) {
  return new Promise<T | undefined>(function (resolve) {
    setTimeout(()=>resolve(r), millis || 0);
  });
};

function mousemove(e) {
  if (!mousePos.push({x: e.clientX, y: e.clientY})) {
    console.log("mousPos closed!!");
  }
}
const mousePos = broadcastIterator<{x: number, y: number}>(()=>{
  console.log("stop mousePos")
  window.removeEventListener('mousemove', mousemove);
});
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
  prototype:{
    Lazy: true,
    className: 'Lazy',
    myAttr: 57,
    myMethod(n: number) { instance.myAttr = n },
    onclick() { this.thing = String(Number(this.thing)-1) },
    get thing() { return String(instance.myAttr) },
    set thing(v:string) { 
      instance.myAttr = Number(v);
      this.dispatchEvent(new Event('change'))
    },
    style:{
      borderBottom: '2px solid black'
    }
  },
  async constructed(){
    this.thing = String(this.myAttr);
    await sleep(1000);
    return [" Zzz (promise) ", span(this.when('@start','(change)')(_ => instance.myAttr))];
  }
}));

const Lazier = Lazy.extended({
  prototype:{
    Lazier: true,
    className: `Lazier Lazy`,
    style:{
      borderRight: '2px solid black'
    },
  },
  styles:`
    .Lazier {
      font-family: sans-serif;
    }
  `
});

const Laziest = Lazier.extended({
  constructed(){
    this.thing = "100";
  },
  prototype:{
    Laziest: true,
    className: `Laziest ${Lazier.className}`,
    onclick() { this.thing = String(Number(this.thing)+1) },
    style:{
      borderLeft: '2px solid black'
    },
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
  prototype:{
    className: 'App'
  },
  constructed(){
    return [
      input({id:'text'}),
      this.when('@start','#text(keyup)')(e => ('type' in e) ? div({
        style:{
          color: blinky(this.ids.text?.value)
        }        
      },this.ids.text?.value || e.type) : '@start'),
      interval(250,10,n=>div(n),'error'),
      interval(333,10,n=>div(10-n),'complete'),
      div({
        style:{
          color: this.when('#text(keyup)',blinky('blink'))(e => typeof e === 'string' ? e : this.ids.text.value)
        },
        onclick(this: ReturnType<typeof div>) { this.remove() }
      },'blink'),
      div({
        style: this.when(blinky('mapped'))(async b => ({color:b})),
        onclick(this: ReturnType<typeof div>) { this.remove() }
      },'mapped'),
      this.when(blinky('div'))(
        s => div({
          onclick(this: ReturnType<typeof div>) { this.remove() }, 
          style:{ color: s }
        },"div")
      ),
      div({ style: { color: 'red' }},"literal ",123),
      div({ style: { color: self('red') }},"generator ", withHelpers(self(123)).map(x => " mapped:"+x)),
      div({ style: { color: 'green' }},"promise ",sleep(1234,123)),
      div({ style: { color: this.when(sleep(1000,'red')) }},"iter/promise ",this.when(sleep(1000,123))),

      mousePos.map(p => div({
        onclick(this: ReturnType<typeof div>) { this.remove() }, 
      },
        "New div", JSON.stringify(p))
      ),

      div({
        onclick(this: ReturnType<typeof div>) { this.remove() }, 
      },
        mousePos.map(p => ["Same div, new content", JSON.stringify(p)]).initially("...Move the mouse...")
      ),
      div({
        onclick(this: ReturnType<typeof div>) { this.remove() }, 
        textContent: mousePos.map(p => 'Div.textContent ' + JSON.stringify(p))
      }),

      div(this.when('#lazy','@ready')(()=> this.ids.lazy.thing)),

      Laziest({ id: 'lazy'}, 'Lovely!'), pre(Laziest.valueOf()),
      Laziest.super('Super!'), pre(Laziest.super.valueOf()),
      Laziest.super.super('Super duper!'), pre(Laziest.super.super.valueOf()),
      Laziest.super.super.super('Super duper 2'), pre(Laziest.super.super.super.valueOf())
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
  prototype:{
    className:'RedBlock',
    style: {
      backgroundColor: 'magenta'
    }
  }
});

const xy = mousePos.waitFor(done => setTimeout(done, 40)).map(({x,y}) => ({
  left: `${x + 20}px`,
  top: `${y + 20}px`
}));


let app: ReturnType<typeof App>;
document.body.append(
  app = App({ style: { border: '1px solid black' }}),
  Block({
    style: xy,
    onclick(this: ReturnType<typeof span>) { 
      this.remove();
    }
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
  