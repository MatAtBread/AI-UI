import { tag } from '../../module/src/ai-ui'

const { unk } = tag(null,['unk'],{
  commonProperties: {
    debug(x?:any) { console.log(this,x)}
  }
});

const e1 = unk({
  onclick(e) {
    this.debug()
  },
},'e1');
console.log(e1.textContent);

const E2 = unk.extended({});
const e2 = E2({
  onclick(e) {
    this.debug()
  },
},'e2');
console.log(e2.textContent);

const E3 = E2.extended({
  declare:{
    d3: undefined as unknown as number
  }
});
const e3 = E3({
  onclick(e) {
    this.debug(this.d3)
  },
});
console.log(e3.d3)

const E4 = E3.extended({
  iterable:{
    i4: undefined as unknown as number
  },
  constructed(){
    this.i4.consume!(x => console.log('consume',x));
  }
});
const e4 = E4({
  onclick(e) {
    this.debug(this.i4.valueOf())
  },
  d3: 3,
  i4: 10
});
console.log(e4.d3,e4.i4)

// Check GlobalEventHandlers
const q = e4.onclick!;
e4.onclick = function() {
  e4 === this;
}
