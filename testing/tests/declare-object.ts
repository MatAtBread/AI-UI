/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';

const { div, span } = tag();

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
        Test.sleep(.2).then(()=>this.page.n) as Promise<string>
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
await Test.sleep(.3);
console.log(document.body.innerHTML);
await Test.sleep(.1);
