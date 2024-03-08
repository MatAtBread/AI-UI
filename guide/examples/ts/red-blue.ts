import { tag } from '../../../module/esm/ai-ui.js'
tag.augmentGlobalAsyncGenerators();

const { div } = tag();

const RedBox = div.extended({
  override:{
    style:{
      backgroundColor: 'red'
    }
  }
});

const RedBlue = RedBox.extended({
  constructed() {
    return div("I'm red!")
  }
});

const x = RedBlue("Make me blue");
// Returns the DOM elements:
// <div style="background-color: red;">I'm red<div>Make me blue!</div></div>

const RedBlue2 = RedBox.extended({
  constructed() {
    return div(div({ style: { backgroundColor: 'blue'}}, this.childNodes),div("I'm red!"))
  }
});

const x2 = RedBlue2("Make me blue");

const sleep = () => new Promise(res => setTimeout(res,333));
async function *countdown() {
  for (let i=10; i >= 0; i--) {
    yield i;
    await sleep();
  }
}

const Secret = div.extended({
  constructed() {
    const counter = countdown().multi();
    counter.filter(n => n <= 0).consume(n => { this.style.display = 'none' });
    return [counter, ' ... ', this.childNodes];
  }
});

const Secret2 = div.extended({
  constructed() {
    const counter = countdown().multi();
    this.attributes = {
      style:{
        display: counter.map(n => n <= 0 ? 'none':'').unique()
      }
    }
    return [counter, ' ... ', this.childNodes];
  }
});

document.body.append(Secret("read me quick!"), Secret2("read me quick!"));

