/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';
const { div } = tag();

async function *count(limit: number) {
  for (let n=1; n<=limit; n++) {
    await Test.sleep(.01);
    yield String(n);
  }
};

const App = div.extended({
  declare: {
    repl: undefined as any
  },
  iterable:{
    label: '' as string
  },
  constructed() {
    return [JSON.stringify(this.repl),": ",this.label.map!(l => l == '2' ? this.repl : l)]
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.append(
  App({ label: count(3), repl: '' }),
  App({ label: count(3), repl: undefined }),
  App({ label: count(3), repl: null }),
  App({ label: count(3), repl: [] })
);

await Test.sleep(.1);
console.log(document.body.innerHTML);