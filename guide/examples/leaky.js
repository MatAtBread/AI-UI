import { tag, Iterators } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();
const { div, button, span } = tag();

function sleep(ms, v) {
  return new Promise(resolve => setTimeout(() => resolve(v), ms));
}

async function* count(t = 1000) {
  try {
    let n = 0;
    while (1) { //for (let n = 0; n < 20; n++) {
      //console.log("yield", n)
      yield n++;
      //console.log("yielded", n-1)
      await sleep(t);
    }
  } catch (ex) {
    debugger;
  } finally {
    console.log("Stop count()")
  }
}

const dv = div.extended({
  constructed() {
    console.log("dv", this.id, this.textContent);
  }
});

const App = div.extended({
  constructed() {
    return [
      count(1000).map(i =>
        dv({
          id: count(137).map(j => i + "-" + j),
          style: {
            fontSize: count(159).map(n => n + 18 + 'px')
          }
        }, "X"+i)
      )
    ]
  }
});

const a = App();
await sleep(1500);
document.body.append(a);
//document.body.append(await sleep(2000,App()));


// const c = count().multi();
// for await (const x of c) {
//   console.log('outer',x);
//   for await (const y of c) {
//     console.log('inner',y,x);
//     break;
//   }
// }