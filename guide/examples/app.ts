import { tag } from '../../module/esm/ai-ui.js'

const { h2, div, button, span } = tag();

/* These "base" tag functions create standard HTML elements. The call signature is:
    
  tagFunction(child1, child2, child3....)

or

  tagFunction({ attributes }, child1, child2, child3....)
  
A "child" can be another element, primitives (number, boolean, string). This is very similar to the DOM 
API Element.append (https://developer.mozilla.org/en-US/docs/Web/API/Element/append).

*/



/* Define a new tag type, called `App`, that is composed of some elements. It will generate markup like:

<div>
    <h2>Hello World</h2>
    <button style="display: block;">What time is it?</button>
    <div>Dunno</div>
</div>

The value returned from "extended(...)" is a function with exactly the same signature - it accepts optional
attributes and a variable number of children as parameters, and returns a DOM element, in this case a "div"
since that's the tag we've extended.

*/
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
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function *clock() {
  while (1) {
    await sleep(1000);
    yield new Date();
  }
}
