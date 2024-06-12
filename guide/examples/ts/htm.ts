//import htm from 'https://unpkg.com/htm@3.1.1/src/index.mjs';
import htm from 'https://unpkg.com/htm/mini/index.mjs';
import { tag, Iterators } from '../../../module/esm/ai-ui.js';
Iterators.augmentGlobalAsyncGenerators();

const { div, h3: heading, createElement } = tag() ;
const html = htm.bind(createElement);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function* count() {
  let i = 0;
  while (true) {
    await sleep(500);
    yield i++;
  }
}

async function* colour() {
  while (true) {
    yield "blue";
    await sleep(1600);
    yield "red";
    await sleep(300);
  }
}

const Increment = div.extended({
  iterable: {
    num: 1
  },
  override:{
    style: {
      border: '1px solid magenta'
    }
  },
  constructed() {
    return html`
      <span>The specified number is: ${this.num.map!(n => Number(n)+1)}</span>
      <button onclick=${()=>this.num = 0}>Clear</button>
    `;
  }
});

const footing = "h4";
document.body.append(...html`
<${heading}>Let's go...</${heading}>
<div style=${colour().map(c => "color:"+c)}>
    I am: ${count()}
</div>
<${Increment} id="inc" num=100/>
<${footing}>...thank you and goodnight</${footing}>
`);
