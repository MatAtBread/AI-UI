import { tag } from '../../../module/esm/ai-ui.js'
import { IterablePropertyValue } from '../../../module/esm/iterators.js';

const { div, input, button, table, tr, td } = tag();

const Results = table.extended({
  iterable: {
    data: [] as IterablePropertyValue[]
  },
  constructed() {
    let line = 0;
    return this.data.map((t) => [
      tr(td(line++), td(JSON.stringify(t))),
      this.childNodes
    ])
  }
});

const App = div.extended({
  iterable: {
    thing: ['abc', 'def', 'ghi']
  },
  ids: {
    text: input,
    results: table
  },
  constructed() {
    return [
      div("Expression ",
        input({ id: 'text', value: 'this.thing' }),
        button({
          onclick: () => new Function("return (" + this.ids.text.value + ")").call(this)
        }, "eval")
      ),
      div("Updates: ",
        Results({ data: this.thing })
      )
    ]
  }
});

document.body.appendChild((window as any).app = App());
