import { tag } from '../../../module/esm/ai-ui.js';
import * as Iterators from '../../../module/esm/augment-iterators.js';

const { div, span } = tag();

async function*count() {
  for (let i = 0; i < 10; i++) { 
    yield i; 
    await new Promise(r => setTimeout(r, 500)) 
  } 
}

document.body.append("div -> ",div("count -> ", count().map(x => span("span -> ", x*10))));

Iterators.Ignore;