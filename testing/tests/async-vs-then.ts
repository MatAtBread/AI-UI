/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';
tag.augmentGlobalAsyncGenerators();

function sleep<T>(n: number, t: T) {
  return new Promise<T>(resolve => setTimeout(() => resolve(t), n * 100));
}

const { div } = tag();

const start = Date.now();
function delay(s: string) {
  return s + ' ' + (Date.now() - start);
}

const A = div.extended({
  constructed() {
    return sleep(1,"A").then(delay);
  }
});
const B = div.extended({
  async constructed() {
    return sleep(1,"B").then(delay);
  }
});
const C = div.extended({
  async constructed() {
    return await sleep(1,"C").then(delay);
  }
});

const App = div.extended({
  constructed(){
    return [A(),B(),C()];
  }
});
document.body.append(A(), B(), C(), App());
await sleep(2);
console.log(document.body.lastElementChild?.innerHTML);

