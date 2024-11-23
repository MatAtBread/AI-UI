import { tag, Iterators } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();
const { div, button, span } = tag();

function sleep(ms, v) {
  return new Promise(resolve => setTimeout(() => resolve(v), ms));
}

async function* count() {
  try {
    await sleep(2000);
    for (let n=0; n<15; n++) {
      //console.log("yield", n)
      yield n;
      //console.log("yielded", n-1)
      await sleep(2000);
    }
  } catch (ex) {
    debugger;
  } finally {
    console.log("Stop count()")
  }
}

let n = 0;
function next() { return n++ }

const App = div.extended({
  constructed() {
    let btn = button({ id: 'btn', onclick() { this.dispatchEvent(new Event("click2")) } }, 'btn');
    return [
      btn,
      btn.when("click2").map(next).map(f => {
        const top = div("T"+f,
          ' [ ', next(), 
          btn.when("click").map(next).map(e => {
            console.log('nested', e);
            return [' [ ',"N"+e, ' ] '];
          }),
          ' ] ');
        console.log('top', f);
        return top;
      }
      )
    ]
  }
});

document.body.append(App());
// const c = count().multi();
// for await (const x of c) {
//   console.log('outer',x);
//   for await (const y of c) {
//     console.log('inner',y,x);
//     break;
//   }
// }