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
    return [
      div({
        style: {
          display: 'inline-block'
        }
      },
        div(this.childNodes),
        div({
          style: {
            color: '#aaa'
          }
        }, "Started ", new Date().toLocaleTimeString())
      ),
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
    return [
      div({
      style: {
        display: 'inline-block',
        width: "50%"
      }
    },
      input({
        id: 'description',
        placeholder: "Enter a new task...",
        style: {
          width: "100%"
        }
      })
    ),
    button({
      disabled: this.when('input:#description')(_ => !Boolean(this.ids.description.value)).initially(true),
      onclick: (e) => {
        this.item = this.ids.description.value;
        this.ids.description.value = '';
        // Reset the disabled state
        this.ids.description.dispatchEvent(new Event("input"));
      },
      style: {
        display: 'inline-block',
        float: 'right'
      }
    }, "Add")]
  }
});

const App = div.extended({
  ids:{
    todo: div,
  },
  constructed() {
    const add = AddItem();
    return [
      h2("To Do List"),
      add,
      div({id:'todo'},
        add.item.map!(newItem => [
          this.ids.todo.children,
          ToDoItem(newItem)
        ])
      )
    ]
  }
});

const AppInstance = div.extended({
  constructed() {
    let add: ReturnType<typeof AddItem>;
    let todo: ReturnType<typeof div>;

    return [
      h2("To Do List"),
      add = AddItem(),
      todo = div(
        add.item.map!(newItem => [
          todo.childNodes,
          ToDoItem(newItem)
        ])
      )
    ]
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.appendChild(AppInstance());

