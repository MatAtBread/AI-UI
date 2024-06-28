import { tag } from '../../../module/esm/ai-ui.js'

const { div, input, button, table, tr, td, span } = tag();

const Results = div.extended({
  declare: {
    label: ''
  },
  iterable: {
    data: undefined as any
  },
  ids:{
    rows: table
  },
  styles:`
  #rows {
    margin-left:1em;
    font-family: monospace;
  }`,
  constructed() {
    let line = 0;
    this.data.consume((t:unknown) => this.ids.rows.prepend(...tag.nodes(tr(td(line++), td(JSON.stringify(t))))));
    return [
      span({ style: 'font-weight: bold' }, this.label),
      table({id: 'rows'})
    ]
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
      div(input(), button({
        onclick:e => {
          const field = (e.target as HTMLElement).previousSibling as HTMLInputElement; 
          if (field.value) {
            this.append(Results({ label: field.value, data: this.thing[field.value]}))
          }
        }
      },"consume")),
      Results({ data: this.thing, label: "this.thing" })
    ]
  }
});

document.body.appendChild((window as any).app = App());
