import { tag } from '../../../module/esm/ai-ui.js';
import { AsyncExtraIterable } from '../../../module/esm/iterators.js';

/* Specify what base tags you reference in your UI */
const { div } = tag();

function sum(a:number, b:number) {
  return a + b;
}

const App = div.extended(({
  override: {
    onclick() {
      this.data.unshift(this.data[0] + this.data[1])
      // @ts-expect-error: see iterators.ts#IterableProperties
      this.data = [1,2]
    }
  },
  iterable: {
    data: [3,2,1] as number[]
  },
  constructed() {
    const t = this.data;
    const w = t[0]
    return [
      div('Array access',
        div('join: ',t.join(', ')),
        div('reduce: ',t.reduce(sum,0)),
        div('map: ', Array.prototype.map.call(t, n => String(n)+' ') as string[])
      ),

      div('AsyncIterator array access',
        div('join: ', t.map!(d => d.join(', '))),
        div('reduce: ', t.map!(d => d.reduce(sum,0))),
        div('map: ', t.map!(d => d.map( n => String(n)+' ')))
      ),

      div('AsyncIterator array item access',
        div('[0]: ', t[0]),
        div('map: ', t[0].map!(d => d))
      )
    ]
  }
}));

/* Add add it to the document so the user can see it! */
document.body.append(App());

