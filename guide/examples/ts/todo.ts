import { tag } from '../../../module/esm/ai-ui.js'

const { h2, div, button, input } = tag();

const ToDoItem = div.extended({
  override: {
    style: {
      paddingTop: '0.5em',
      borderTop: '1px solid #aaa'
    }
  },
  constructed() {
    return [div({
      style: {
        display: 'inline-block'
      }
    }, this.children),
    button({
      style: {
        display: 'inline-block',
        float: 'right'
      },
      onclick: () => this.remove()
    }, "Done!")]
  }
});

const AddItem = div.extended({
  override: {
    style: {
      lineHeight: '1.5em'
    }
  },
  iterable: {
    item: undefined as undefined | string
  },
  ids: {
    description: input
  },
  constructed() {
    return [div({
      style: {
        display: 'inline-block'
      }
    }, input({ id: 'description', placeholder: "Enter a new task..." })),
    button({
      onclick: () => {
        this.item = this.ids.description.value;
        this.ids.description.value = '';
      },
      style: {
        display: 'inline-block',
        float: 'right'
      }
    }, "Add")]
  }
});

const App = div.extended({
  constructed() {
    const add = AddItem();
    return [
      h2("To Do List"),
      add,
      add.item.filter!(item => Boolean(item)).map(newItem => [
        [...this.children].filter(e => e instanceof ToDoItem),
        ToDoItem(
          div(newItem),
          div({
            style: {
              color: '#aaa'
            }
          }, "Started ", new Date().toLocaleTimeString())
        )
      ])
    ]
  }
})

/* Create and add an "App" element to the document so the user can see it! */
document.body.appendChild(App());

