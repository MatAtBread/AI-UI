import { tag } from '../../../module/esm/ai-ui.js'
tag.augmentGlobalAsyncGenerators();

const { div, span, button } = tag();

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
async function *countdown(start = 10) {
  for (let i=start; i >= 0; i--) {
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


const ColourBlock = div.extended({
  override: {
    style: {
      width: '1.5em',
      height: '1.5em',
      display: 'inline-block'
    }
  },
  iterable:{
    color: ''
  },
  constructed() {
    this.attributes = {
      style:{
        backgroundColor: this.color
      }
    };
    return '\xA0'; 
  }
});

const ColourChooser = span.extended({
  iterable:{
    selectedIndex: 0, // the current selection
    selectedColor: '' // ...as a string
  },
  declare:{
    colors: ['red','orange','yellow','green','blue','indigo','violet'], // The default colour choices
  },
  override:{
    style:{
      lineHeight: '1.5em'
    }
  },
  constructed(){
    this.selectedIndex.consume!(i => {this.selectedColor = this.colors[i]});
    return [
      button({
        disabled: this.selectedIndex.map!(n => n <= 0),
        onclick: () => this.selectedIndex -= 1
      }, 
      '<'),
      ColourBlock({ color: this.selectedColor }),
      button({
        disabled: this.selectedIndex.map!(n => n >= this.colors.length -1),
        onclick: () => this.selectedIndex += 1
      }, 
      '>')
    ]
  }
});

//document.body.append(Secret("read me quick!"), Secret2("read me quick!"));
document.body.append(ColourChooser());

