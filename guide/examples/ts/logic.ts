import { tag, Iterators, ChildTags } from '../../../module/esm/ai-ui.js'

const { div, button } = tag();
const { svg, text, path, use, defs } = tag("http://www.w3.org/2000/svg", ["svg", "text", "path", "use", "defs"], {
  commonProperties: {} as SVGElement & {
    x?: string,
    y?: string,
    d?: string,
    href?: string,
    transform?: string,
    viewBox?: string,
    get style(): any
    set style(v: string | CSSStyleDeclaration);
  }
});

let ID = 1;
const Gate2In = div.extended(({
  styles: `.gate2in {
      width: fit-content;
      height: fit-content;
      border: 2px dotted transparent;
      width: 200px;
  }`,
  declare: {
    out: undefined as unknown as Iterators.AsyncExtraIterable<boolean>,
    logic(): boolean { return false },
    contents(): Iterable<ChildTags> { return []; },
    get canDrag(): HTMLElement {
      this.style.position = 'absolute';
      // this.when('click:#in1', 'click:#in2').consume(e => {
      //   if (e.target && 'id' in e.target && typeof e.target.id === 'string' && e.target.id in this) {
      //     // @ts-ignore
      //     this[e.target.id] = !this[e.target.id].valueOf();
      //   }
      // });

      let drag = false;
      this.when('click:#in1','click:#in2','click:#out').consume(e => {
        this.dispatchEvent(new MouseEvent('click', { relatedTarget: e.target }));
      });
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
      return this;
    }

  },
  override: {
    className: 'gate2in'
  },
  iterable: {
    in1: false,
    in2: false
  },
  ids: {
    in1: text,
    in2: text,
    out: text
  },
  constructed() {
    this.id = "gate" + String(ID++);
    this.out = Iterators.merge(this.in1, this.in2).map(() => this.logic());
    return svg({
      style: {
        width: '100%',
        height: '100%'
      },
      viewBox: '0 0 320 180'
    }, this.contents());
  }
}));

const Nand = Gate2In.extended({
  override: {
    logic() { return !(this.in1.valueOf() && this.in2.valueOf()) },
    contents() {
      return [
        defs(
          path({ id: "terminal", d: "M 0,0 L 12,12 M 12,0 L 0,12", style: "fill:none;stroke-width:5;" }),
          path({ id: "wire", d: "M 0,0 L 180,0", style: "stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:miterstroke-miterlimit:4" })
        ),
        text({ x: "0", y: "40" }, this.in1),
        text({ x: "0", y: "120" }, this.in2),
        text({ x: "270", y: "80" }, this.out.unique()),
        use({ x: "5", y: "51", href: "#wire" }),
        use({ x: "5", y: "132", href: "#wire" }),
        use({ x: "130", y: "89", href: "#wire" }),
        path({
          style: "fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dashoffset:0;stroke-opacity:1",
          d: "M 207,171 L 135,171 L 135,12.5 L 207,12.5 C 246.3576,12.5 278.3,48 278.3,91.749974 C 278.3,135.5 246.3576,171 207,171",
          transform: "translate(-70,0)"
        }),
        path({
          transform: "translate(-57,0)",
          d: "M 305.47014 89.843887 A 20.152544 20.152544 0 1 1  265.16505,89.843887 A 20.152544 20.152544 0 1 1  305.47014 89.843887 z",
          style: "opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
        }),
        use({ id: "in1", href: "#terminal", x: "0", y: "45", style: "stroke:blue" }),
        use({ id: "in2", href: "#terminal", x: "0", y: "127", style: "stroke:blue" }),
        use({ id: "out", href: "#terminal", x: "303", y: "83", style: "stroke:green" })
      ]
    }
  }
});

const Nor = Gate2In.extended({
  override: {
    logic() { return !(this.in1.valueOf() || this.in2.valueOf()) },
    contents() {
      return [
        defs(
          path({ id: "terminal", d: "M 0,0 L 12,12 M 12,0 L 0,12", style: "fill:none;stroke-width:5;" }),
          path({ id: "wire", d: "M 0,0 L 180,0", style: "stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:miterstroke-miterlimit:4" })
        ),
        text({ x: "0", y: "40" }, this.in1),
        text({ x: "0", y: "120" }, this.in2),
        text({ x: "270", y: "80" }, this.out.unique()),
        use({ x: "5", y: "51", href: "#wire" }),
        use({ x: "5", y: "132", href: "#wire" }),
        use({ x: "130", y: "89", href: "#wire" }),
        path({
          style: "fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dashoffset:0;stroke-opacity:1",
          d: "M 207,171 L 135,171 C 160,89 160,89 135,12.5 L 207,12.5 C 246.3576,12.5 278.3,48 278.3,91.749974 C 278.3,135.5 246.3576,171 207,171",
          transform: "translate(-70,0)"
        }),
        path({
          transform: "translate(-57,0)",
          d: "M 305.47014 89.843887 A 20.152544 20.152544 0 1 1  265.16505,89.843887 A 20.152544 20.152544 0 1 1  305.47014 89.843887 z",
          style: "opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
        }),
        use({ id: "in1", href: "#terminal", x: "0", y: "45", style: "stroke:blue" }),
        use({ id: "in2", href: "#terminal", x: "0", y: "127", style: "stroke:blue" }),
        use({ id: "out", href: "#terminal", x: "303", y: "83", style: "stroke:green" })
      ]
    }
  }
});

const CreateComponent = button.extended({
  styles:`.createComponent { border-radius: 1em; margin-right: 1em; }`,
  override: {
    className: 'createComponent'
  },
  constructed() {
    (this.firstChild as HTMLElement).style.pointerEvents = 'none'
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
    circuit: div,
    in1: use,
    in2: use,
    out: use
  },
  constructed() {
    this.when('click:.createComponent').consume(e => {
      this.ids.circuit.append((e.target as HTMLElement).firstChild!.constructor().canDrag)
    });
    let clickedGate: ReturnType<typeof Gate2In> | undefined = undefined;
    let clickedIn: 'in1' | 'in2' | 'out';
    this.when('click:.gate2in>').consume(e => {
      if (clickedGate) {
        clickedGate.ids[clickedIn].style = clickedIn === 'out' ? 'stroke:green' : 'stroke:blue';
        clickedGate = undefined;
      } else if (e.target && e.relatedTarget) {
        clickedGate = e.target as ReturnType<typeof Gate2In>;
        clickedIn = (e.relatedTarget as Element).id as typeof clickedIn;
        clickedGate.ids[clickedIn].style = 'stroke:red';
      }
    });
    return [
      div({ className: 'menu' },
        CreateComponent(Nand({ style: { width: '100px' } })),
        CreateComponent(Nor({ style: { width: '100px' } }))
      ),
      div({ id: 'circuit' })
    ]
  }
});

document.body.append(App());