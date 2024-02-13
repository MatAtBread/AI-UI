import { tag } from '../../../module/esm/ai-ui.js';
import { generatorHelpers } from '../../../module/esm/iterators.js';

/* Specify what base tags you reference in your UI */
const { h2, div, button, input } = tag(['h2', 'div', 'button', 'input']);

const App = div.extended({
  iterable: {
    //thing: 'declaration' as string,
    things: { s: ['x'] },
  },
  constructed() {
    return [
      //div("thing is: ",this.thing),
      div("things are: ", this.things.map!(a => a.s))
    ]
  }
});

/* Add add it to the document so the user can see it! */
const app = App({
  //thing: count(),
  things: count2() as any
}, 'Iterable properies 2');
document.body.append(app);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function* count2() {
  for (let i = 200; i <= 300; i += 20) {
    await sleep(500);
    yield { s: ['<', String(i), '> '] };
  }
}

async function* _count(p: number) {
  for (let i = 200; i <= 300; i += 20) {
    await sleep(p * 10);
    yield i
  }
  return 1000;
}

const count = generatorHelpers(_count);

async function toArray<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = []
  for await(const x of gen) {
      out.push(x)
  }
  return out
}

(async function () {
  try {
    console.log(await toArray(_count(1)));
    console.log(await toArray(count(1)));
    console.log(await toArray(count(1).map(n => -n)));
    console.log(await toArray(count(4).merge(count(1))));
    console.log(await toArray(count(1).merge(count(4))));
  } catch (ex) {
    console.log(ex);
  } finally {
    console.log('finally')
  }
  console.log('exit')
})();