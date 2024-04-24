import { tag } from '../../../module/esm/ai-ui.js'

const { div } = tag();

const App1 = div.extended(inst => ({
  styles: `.${inst[tag.UniqueID]}-App {
    border: 1px solid green;
    background-color: grey;
    margin: 4px;
  }
  .${inst[tag.UniqueID]}-App:hover {
    background-color: white;
  }`,
  override:{
    className: `${inst[tag.UniqueID]}-App`
  },
  constructed() {
    return "styled"
  }
}));

const App2 = App1.extended(inst =>({
  override: {
    className: `${App1.className}`
  }
}));

const App3 = App1.extended({
  override: {
    className: `${App1.definition![tag.UniqueID]}-App`
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.append(App1(),App2(),App3());
