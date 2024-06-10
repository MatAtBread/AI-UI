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
  try {
    while (1) {
      await sleep(100);
      yield;
    }
  } finally {
    console.log("Stopped wandering");
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

type Point = {x: number, y: number};
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
  declare:{
    set moveBy({x,y}: Point) {
      this.x -= x;
      this.y -= y;
    },
    distance({x,y}: Point) {
      return ((x - this.x) ** 2 + (y - this.y) ** 2) ** 0.5;
    },
    wander(dog: Point, penArea: DOMRect) {
      if (this.penned.valueOf()) {
        return { x:0, y: 0 }
      } else {
        const distance = this.distance(dog);
        let x = Math.random() * 2 - 1 + Math.sign(dog.x - this.x) * 200 / distance;
        let y = Math.random() * 2 - 1 + Math.sign(dog.y - this.y) * 200 / distance;
        if (this.containedBy(penArea)) {
          this.penned = true;
          x = 0;
          y = 0;
        }
        if (this.intersects(penArea)) {
          if (x > 0) {
            x = 0;
          }
          y = 0;
        }
        return {x,y}
      }
    }
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
    mousePos/*.waitFor(done => setTimeout(done, 15))*/.consume(e => {
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
    this.when('#pen', '#dog', '@ready').consume(() => {
      const penArea = this.ids.pen.getBoundingClientRect();
      const dog = this.ids.dog;

      const sheep = [...repeat(this.sheep, Sheep)];
      this.append(...sheep);

      for (const s of sheep) {
        wander().consume(() => {
          const distance = s.distance(dog);
          if (distance < 15) {
            s.dead = true;
            throw new Error("dead sheep");
          }
          s.moveBy = s.wander(dog, penArea);
        })
      };
    });
    return [SheepPen({ id: 'pen' }), Dog({ id: 'dog' })]
  }
})

document.body.append(SheepGame({ sheep: 2 }));
