/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';

const { div, span } = tag();

function sleep(ms:number) {
  return new Promise<void>(resolve => setTimeout(resolve,ms));
}

const Thing = div.extended({
  declare:{
    page: {
      n: 0,
      s: '?'
    }
  },
  ids:{
    more: div
  },
  constructed() {
    return [
      span(this.page.n),
      " : ",
      span({id:'more'},
        sleep(200).then(()=>this.page.n) as Promise<string>
      )
    ]
  }
});

const App = div.extended({
  constructed(){
    return [
      Thing({page: { n: 1 }}),
      Thing({page: { n: 2 }}),
      Thing({page: { n: 3 }})
    ]
  }
})

document.body.append(App());
console.log(document.body.innerHTML);
await sleep(400);
console.log(document.body.innerHTML);
await sleep(50);
