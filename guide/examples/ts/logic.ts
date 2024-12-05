import { tag, Iterators } from '../../../module/esm/ai-ui.js'
import { WhenReturn } from '../../../module/esm/when.js';

const { h2, div, button } = tag();
const { svg, text, path, use } = tag("http://www.w3.org/2000/svg", ["svg", "text", "path", "use"], { commonProperties: {} as SVGElement });

let ID = 1;
const Nand = div.extended(({
  styles: `.nand {
      width: fit-content;
      height: fit-content;
      border: 2px dotted transparent;
  }`,
  override: {
    className: 'nand'
  },
  iterable: {
    in1: false,
    in2: false
  },
  declare: {
    out: undefined as unknown as Iterators.AsyncExtraIterable<boolean>
  },
  ids: {
    in1: text,
    in2: text
  },
  constructed() {
    const inputs = Iterators.merge(this.in1, this.in2);
    this.id = "nand" + String(ID++);
    this.out = inputs.map(() => !(this.in1.valueOf() && this.in2.valueOf())) as any;
    const s = svg({
      style: {
        width: '100%',
        height: '100%'
      },
      innerHTML: Iterators.combine({ in1: this.in1, in2: this.in2, out: this.out as any }).map(v => `
      <defs>
      <path id="terminal" d="M 0,0 L 12,12 M 12,0 L 0,12" style="fill:none;stroke-width:5;"/>
      <path id="wire" d="M 0,0 L 180,0" style="stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:miterstroke-miterlimit:4"/>
      </defs>
      <text x="0" y="40">${v.in1}</text>
      <text x="0" y="120">${v.in2}</text>
      <text x="270" y="80">${v.out}</text>
      <use x="5" y="51" xlink:href="#wire"/>
      <use x="5" y="132" xlink:href="#wire"/>
      <use x="130" y="89" xlink:href="#wire"/>
      <path style="fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dashoffset:0;stroke-opacity:1"
        d="M 207,171 L 135,171 L 135,12.5 L 207,12.5 C 246.3576,12.5 278.3,48 278.3,91.749974 C 278.3,135.5 246.3576,171 207,171"
        transform="translate(-70,0)"
      />
      <path transform="translate(-57,0)" d="M 305.47014 89.843887 A 20.152544 20.152544 0 1 1  265.16505,89.843887 A 20.152544 20.152544 0 1 1  305.47014 89.843887 z" id="path2247" style="opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"/>
      <use id="in1" xlink:href="#terminal" x="0" y="45" style="stroke:blue"/>
      <use id="in2" xlink:href="#terminal" x="0" y="127" style="stroke:blue"/>
      <use id="out" xlink:href="#terminal" x="303" y="83" style="stroke:green"/>
     `)
    });
    s.setAttribute('viewBox', '0 0 320 180');
    return s;
  }
}));

const DragNand = Nand.extended({
  override: {
    style: {
      position: 'absolute'
    }
  },
  constructed() {
    this.when('click:#in1', 'click:#in2').consume(e => {
      if (e.target && 'id' in e.target && typeof e.target.id === 'string' && e.target.id in this) {
        // @ts-ignore
        this[e.target.id] = !this[e.target.id].valueOf()
      }
    });

    let drag = false;
    this.when('dblclick').consume(e => { this.remove() });
    this.when('mousedown').consume((e) => {
      if (!drag && e.target && 'id' in e.target && !e.target.id) {
        drag = true;
        this.classList.add('selected');
        this.parentElement?.append(this);
      }
    });
    this.when('mouseup', 'mouseout').consume((e) => {
      if (drag && (e.type === 'mouseup' || (e.type === 'mouseout' && e.target === this))) {
        drag = false;
        this.classList.remove('selected');
      }
    });
    this.when('mousemove').consume((e) => {
      if (drag) {
        let x = parseInt(this.style.left);
        let y = parseInt(this.style.top);
        if (!x || !y) {
          const r = this.getBoundingClientRect();
          x = x || r.left;
          y = y || r.top;
        }
        this.style.left = Math.max(0, (x + e.movementX)) + 'px';
        this.style.top = Math.max(0, (y + e.movementY)) + 'px';
      }
    });
  }
});

const App = div.extended({
  styles: `
  body {
    margin: 0;
    font-family: sans-serif;
  }
  .selected {
    border-color: red;
  }
  .menu {
    background-color: #333;
    padding: 1em;
  }`,
  ids: {
    circuit: div
  },
  constructed() {
    return [
      div({
        className: 'menu'
      }, button({
        style: {
          borderRadius: '1em'
        },
        onclick: () => this.ids.circuit.append(DragNand())
      }, Nand({
        style: {
          position: 'static',
          width: '160px'
        }
      }))),
      div({ id: 'circuit' })
    ]
  }
});

document.body.append(App());