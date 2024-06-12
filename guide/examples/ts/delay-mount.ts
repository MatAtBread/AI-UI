import { tag } from '../../../module/esm/ai-ui.js'

const { div } = tag();

const Cmp = div.extended({
  styles: `.cmp {
    display: inline-block;
    border: 2px solid blue;
    padding: 0.5em;
    margin: 0.5em;
  }
  .cmp > div {
  }
  .cmp > div > div {
    margin-left: 1em;
  }`,
  override: {
    className: 'cmp'
  }
});

const ADelayed = div.extended({
  declare: {
    delay: 200,
    label: ''
  },
  async constructed() {
    return await delay(this.delay, [this.label,' ',this.delay, this.childNodes]);
  }
});

const PDelayed = div.extended({
  declare: {
    delay: 200,
    label: ''
  },
  constructed() {
    if (this.delay) return delay(this.delay, [this.label,' ',this.delay, this.childNodes])
    return [this.label,' ',this.delay, this.childNodes];
  }
});

document.body.append(
  Cmp(
    ADelayed({ delay: 300, label: 'a' }),
    ADelayed({ delay: 500, label: 'b' }, ADelayed({ delay: 300, label: 'bb' })),
    ADelayed({ delay: 300, label: 'c' }, ADelayed({ delay: 500, label: 'cc' }))
  ),

  Cmp(
    PDelayed({ delay: 300, label: 'a' }),
    PDelayed({ delay: 500, label: 'b' }, PDelayed({ delay: 300, label: 'bb' })),
    PDelayed({ delay: 300, label: 'c' }, PDelayed({ delay: 500, label: 'cc' }))
  ),

  Cmp(
    ADelayed({ delay: 1300, label: 'a' }, delay(100, [" ","100"])),
    ADelayed({ delay: 1300, label: 'a' }, delay(2500, [" ","2500"]))
  ),

  Cmp(
    delay(100,ADelayed({ delay: 1300, label: 'a' }, delay(100, [" ","100"]))),
    delay(3300,ADelayed({ delay: 1300, label: 'a' }, delay(2500, [" ","2500"])))
  )
);

const e = Cmp(ADelayed({ delay: 2500, label: 'a' }, delay(500, [" ","500"])), "later1");
document.body.append(e);
const f = Cmp(ADelayed({ delay: 2500, label: 'a' }, delay(500, [" ","500"])), "later2");
delay(5000).then(() => document.body.append(f));

function delay<Z>(ms: number, z?: Z): Promise<Z> {
  return new Promise(resolve => setTimeout(() => resolve(z as Z), ms));
}
