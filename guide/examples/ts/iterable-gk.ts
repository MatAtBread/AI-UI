import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { h2, div } = tag();

const App = div.extended({
  iterable: {
    hot: false as boolean,
    num: 99
  },
  constructed() {
    const colorTemp = this.hot.map!(v => v ? 'red' : 'green').multi();

    return [
      h2({
        style:{
          color: colorTemp
        }
      },"Hello World"),

      div({
        style:{
          color: colorTemp
        }
      },"Is it hot?")
    ]
  }
});

/* Add add it to the document so the user can see it! */
const app = App({
  style: {
    color: 'blue'
  }
},'Iterable properies');
document.body.append(app);
