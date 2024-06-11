import { tag, Iterators } from '../../module/src/ai-ui';
import type { AsyncExtraIterable } from '../../module/src/iterators';

Iterators.augmentGlobalAsyncGenerators();
declare global {
  interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown> extends AsyncIterator<T, TReturn, TNext>, AsyncExtraIterable<T> {
  }
}

function sleep<T>(secs: number, result: T) {
  return new Promise<T>(res => setTimeout(() => res(result), secs * 100))
}

async function* ai(label: string) {
  for (let i = 0; i < 4; i++) {
    await sleep(1, undefined);
    yield label + " " + i
  }
}

/* Specify what base tags you reference in your UI */
const { div } = tag();

const SC = div.extended({
  iterable: {
    i: 'i'
  },
  constructed() {
    return this.i//.map!(x => ['S', x].toString())
  }
});

const AC = div.extended({
  iterable: {
    i: 'i'
  },
  async constructed() {
    return this.i//.map!(x => ['A', x].toString())
  }
});

const App = div.extended({
  constructed() {
    return [
      AC({ i: Promise.resolve(ai('pac').map(s => s + " *")) }),
      AC({ i: ai('ac').map(s => s + " *") }),
      AC(),
      SC({ i: Promise.resolve(ai('psc').map(s => s + " #")) }),
      SC({ i: ai('sc').map(s => s + " #") }),
      SC()
    ]
  }
});

const a = App();
document.body.append(a);
console.log(a.innerHTML);
Test.response = sleep(5,null).then(_ => console.log(a.innerHTML));

