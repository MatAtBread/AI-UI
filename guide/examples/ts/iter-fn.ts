import { tag } from '../../../module/esm/ai-ui.js'

const { h2, div, button } = tag();

const App = div.extended({
  iterable:{
    f() { return "abc" as string }
  },
  constructed() {
    // When we're constructed, create a few children within the element by default */
    return [
      h2("Hello World f()=", this.f.map!(x => x())),
      button({
        onclick:()=>this.f = ()=>"def"
      },'click')
    ]
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.appendChild(App());

// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
