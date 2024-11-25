import { tag, Iterators } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();
const { div, button, span } = tag();

function sleep(ms, v) {
  return new Promise(resolve => setTimeout(() => resolve(v), ms));
}

async function* count() {
  try {
    for (let n = 0; n < 15; n++) {
      //console.log("yield", n)
      yield n;
      //console.log("yielded", n-1)
      await sleep(200);
    }
  } catch (ex) {
    debugger;
  } finally {
    console.log("Stop count()")
  }
}

let n = 0;
function next() { return n++ }
const DblClickButton = button.extended({
  override:{
    async onclick() {
      //await sleep(300);
      this.dispatchEvent(new Event("click2"))
    },
    style: {
      display: 'block'
    }
  }
});

const App = div.extended({
  constructed() {
    let btn1 = DblClickButton('click2 > click');
    let btn2 = DblClickButton('click > click2');
    return [
      div("A ",count()),
      sleep(1000, div("B ",count())),
      sleep(1000).then(() => div("C ",count())),
      btn1,
      btn1.when("click2").map(next).map(f => div("1T" + f,
        btn1.when("click").map(next).map(e => span(" 1N" + e))
      )),
      btn2,
      btn2.when("click").map(next).map(f => div("2T" + f,
        btn2.when("click2").map(next).map(e => span(" 2N" + e))
      ))
    ]
  }
});

document.body.append(App());
//document.body.append(await sleep(2000,App()));


// const c = count().multi();
// for await (const x of c) {
//   console.log('outer',x);
//   for await (const y of c) {
//     console.log('inner',y,x);
//     break;
//   }
// }