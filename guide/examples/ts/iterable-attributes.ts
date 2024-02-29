import { tag, Iterators } from '../../../module/esm/ai-ui.js'

const { div } = tag();

const Div = div.extended({
  iterable: {
    thing: 0
  },
  constructed() {
    // Works OK
    // this.attributes = this.thing.map!(n => ({
    //     style: {
    //       opacity: (n / 10).toString()
    //     }
    //   }
    // ));

    // Works OK
    // this.attributes = {
    //   style: this.thing.map!(n => ({
    //     opacity: (n / 10).toString(),
    //     fontSize: (n / 10 + 0.5) + "em"
    //   }))

    // };

    // Works OK
    this.attributes = {
      style: {
        opacity: this.thing.map!(n => (n / 10).toString()),
        fontSize: this.thing.map!(n => (n / 10 + 0.5) + "em")
      }
    };

    // Works OK
    // this.attributes = {
    //     style: {
    //       opacity: this.thing.map!(n => (n / 10).toString())
    //     }
    //   };

    // Works OK
    // this.thing.consume!(n => { this.style.opacity = (n / 10).toString() });
  }
});

const count = Iterators.generatorHelpers(async function*() { for (let i = 0; i < 10; i++) { yield i; await new Promise(r => setTimeout(r, 500)) } });

const r = Div({ 
  thing: count().map(n => n+1), 
  id:"MyThing", 
//  onclick:e => console.log(e)
},
  "The count is: ",count()
);
r.when('click')(n => console.log("Click is",n));

document.body.append(r);

//r.thing.consume!(n => console.log("thing is",n));

(async ()=>{
//   // Necessary to suppress TS error for boxed iterables
//   if (Iterators.isAsyncIterable<number>(r.thing)) {
//     for await (const x of r.thing) {
//       console.log("Also ",x);
//     }
//   }
  for await (const e of r.when('click')) {
    console.log("for click",e)
  }
})();
