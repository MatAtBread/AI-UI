import { tag } from '../../../module/esm/ai-ui.js'
//import { tag } from 'https://unpkg.com/@matatbread/ai-ui/esm/ai-ui.js'

const { h2, div, button, select, option } = tag();


const App = div.extended({
  constructed() {
    // When we're constructed, create a few children within the element by default */
    return [
      h2("Hello World"),
      button({
        style: {
          display: 'block'
        }
      },
        "What time is it?"
      ),
      div(clock())
    ]
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.appendChild(App());

// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function *clock() {
  while (1) {
    await sleep(1000);
    yield new Date();
  }
}
