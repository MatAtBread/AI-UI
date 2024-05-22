import { tag, augmentGlobalAsyncGenerators } from '../../../module/esm/ai-ui.js'
augmentGlobalAsyncGenerators();
const { div, span } = tag();

const App = div.extended({
iterable:{
    v: {
        data:{}
    }
},
  constructed() {
    return [
        this.v.map!(v => JSON.stringify(v))," ",
        this.v.data.map!(v => JSON.stringify(v))," "
    ];
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.append(window.x = App());

// A simple async function that pauses for the specified number of milliseocnds
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
