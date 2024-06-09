import { tag } from '../../../module/esm/ai-ui.js';
import { queueIteratableIterator } from '../../../module/esm/iterators.js'

const { div } = tag();

tag.augmentGlobalAsyncGenerators();

const sleep = function <T>(millis: number, r?: T) {
  return new Promise<T | undefined>(function (resolve) {
    setTimeout(() => resolve(r), millis || 0);
  });
};

async function* wander() {
  while (1) {
    await sleep(100);
    yield;
  }
}

function mousemove(e: MouseEvent) {
  if (!mousePos.push({ x: e.clientX, y: e.clientY })) {
    console.log("mousPos closed!!");
  }
}
const mousePos = queueIteratableIterator<{ x: number, y: number }>(() => {
  window.removeEventListener('mousemove', mousemove);
});

window.addEventListener('mousemove', mousemove);

function* repeat<T>(count: number, what: () => T) {
  while (count--) yield what();
}

const COLLIDE_TOP = 8;
const COLLIDE_BOTTOM = 4;
const COLLIDE_LEFT = 2;
const COLLIDE_RIGHT = 1;

const Sprite = div.extended({
  override:{
    style: {
      fontSize: '150%'
    }
  },
  declare: {
    get x() { return parseFloat(this.style.left) || 0 },
    get y() { return parseFloat(this.style.top) || 0 },
    set x(n: number) { this.style.left = String(Math.min(Math.max(n, 0), 500)) },
    set y(n: number) { this.style.top = String(Math.min(Math.max(n, 0), 500)) },
    containedBy(pen: DOMRect) {
      const r = this.getBoundingClientRect();
      return (pen.left <= r.left && pen.right >= r.right && pen.top <= r.top && pen.bottom >= r.bottom);
    },
    intersects(rect2: DOMRect) {
      const rect1 = this.getBoundingClientRect();
      return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );      }
  },
  constructed() {
    this.style.position = 'absolute';
  }
});

const Sheep = Sprite.extended({
  iterable: {
    dead: false,
    penned: false
  },
  constructed() {
    this.x = 100 + Math.random() * 300;
    this.y = 100 + Math.random() * 300;
    this.attributes = { style: { opacity: this.penned.map!(p => p ? '0.2' : '1') } };
    return this.dead.map!(p => p ? '🦴' : '🐑')
  }
});

const Dog = Sprite.extended({
  constructed() {
    mousePos.waitFor(done => setTimeout(done, 15)).consume(e => {
      this.x = e.x - 10;
      this.y = e.y - 10;
    });
    return '🐕'
  }
});

const SheepPen = div.extended({
  styles: `.Pen {
    background-color: #333;
    border: 8px solid #880;
    border-left: 0px;
    position: absolute;
    top: 200px;
    bottom: 200px;
    left: 400px;
    width: 50px;
  }`,
  override: {
    className: 'Pen'
  }
});

const SheepGame = div.extended({
  styles: `.SheepGame {
    position: absolute;
    cursor: crosshair;
    width: 520px;
    height: 520px;
    background: #182;
  }`,
  override: {
    className: 'SheepGame'
  },
  ids: {
    dog: Dog,
    pen: SheepPen
  },
  declare: {
    sheep: 1
  },
  constructed() {
    const sheep = [...repeat(this.sheep, Sheep)];
    this.when('#pen', '@ready')(() => {
      const penArea = this.ids.pen.getBoundingClientRect();
      wander().consume(() => {
        for (const s of sheep) if (!s.dead.valueOf()) {
          const distance = ((this.ids.dog.x - s.x)**2 + (this.ids.dog.y - s.y)**2)**0.5;
          if (distance < 15)
            s.dead = true;
          else if (!s.penned.valueOf()) {
            const dx = Math.random() * 2 - 1 + Math.sign(this.ids.dog.x - s.x) * 200 / distance;
            const dy = Math.random() * 2 - 1 + Math.sign(this.ids.dog.y - s.y) * 200 / distance;
            s.x -= dx;
            s.y -= dy;
            if (s.containedBy(penArea)) {
              s.penned = true;
            }
            if (s.intersects(penArea)) {
              if (dx > 0)
                s.x += dx;
              s.y += dy;
            }
          }
        }
      });
    }).consume();
    return [SheepPen({ id: 'pen' }), Dog({ id: 'dog' }), sheep]
  }
})

document.body.append(SheepGame({ sheep: 3 }));
