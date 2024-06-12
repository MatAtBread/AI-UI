import { Iterators, tag } from '../../../module/esm/ai-ui.js';
import { queueIteratableIterator } from '../../../module/esm/augment-iterators.js'

const { div, button } = tag();

// A simple async sleep function
const sleep = (millis: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), millis || 0));

// A generator that yields 10 times a second (which we use to make the sheep wander)
async function* gameTick() {
  console.log('Start wandering');
  try {
    while (1) {
      await sleep(100);
      yield;
    }
  } finally {
    console.log('Stopped wandering');
  }
}

// We capture mousemoves into am async iterator queue (unless it's already big) and yield the result to move the dog
function mousemove(e: MouseEvent) {
  if (mousePos.length < 100 && !mousePos.push({ x: e.clientX, y: e.clientY })) {
    console.log('mousPos closed!!');
  }
}
const mousePos = queueIteratableIterator<{ x: number, y: number }>(() => {
  window.removeEventListener('mousemove', mousemove);
});

window.addEventListener('mousemove', mousemove);

// A sync iterator that yields the result of a function.
// We use it to generate a specific number of sheep.
function* repeat<T>(count: number, what: () => T) {
  while (count--) yield what();
}

type Point = { x: number, y: number };

// A "Sprite" is a div with exposed accessors & methods to manipulate the position, and check for intersection
const Sprite = div.extended({
  override: {
    className: 'Sprite', // unused, but helps with debugging
    style: {
      fontSize: '150%',
      position: 'absolute'
    }
  },
  declare: {
    // Numerical wrappers for the Sprites position
    get x() { return parseFloat(this.style.left) || 0 },
    get y() { return parseFloat(this.style.top) || 0 },
    set x(n: number) { this.style.left = String(Math.min(Math.max(n, 0), 500)) + 'px' },
    set y(n: number) { this.style.top = String(Math.min(Math.max(n, 0), 500)) + 'px' },

    // Useful sprite methods
    distance({ x, y }: Point) {
      return ((x - this.x) ** 2 + (y - this.y) ** 2) ** 0.5;
    },
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
      );
    }
  }
});

// A "Dog" is a Sprite that tracks the mouse, delayed a little since
// dogs take a little time to follow their master's instrcutions
const Dog = Sprite.extended({
  override:{
    className: 'Dog'  // unused, but helps with debugging
  },
  constructed() {
    mousePos.waitFor(done => setTimeout(done,15)).consume(e => {
      this.x = e.x - 10;
      this.y = e.y - 10;
    });
    return '🐕'
  }
});

// A "Sheep" is Sprite that wanders around, trying
// to avoid the dog, unless it is contained in a pen
const Sheep = Sprite.extended({
  // The sheep has iterable boolean properties that can be consumed and set to reflect the state of the sheep
  iterable: {
    dead: false,
    penned: false
  },
  override:{
    className: 'Sheep'  // unused, but helps with debugging
  },
  declare: {
    wander(dog: Point, penArea: DOMRect) {
      let x = Math.random() * 2 - 1;
      let y = Math.random() * 2 - 1;
      // Becuase this.penned is iterable, it is actually a boxed Boolean(), so
      // we can't test for "falseness" directly, and have to use valueOf().
      if (this.penned.valueOf()) {
        const r = this.getBoundingClientRect();
        if (r.left <= penArea.left) x = -1;
        if (r.right >= penArea.right) x = 1;
        if (r.top <= penArea.top) y -= 1;
        if (r.bottom >= penArea.bottom) y = 1;
        this.x -= x;
        this.y -= y;
      } else {
        const distance = this.distance(dog);
        x += Math.sign(dog.x - this.x) * 200 / distance;
        y += Math.sign(dog.y - this.y) * 200 / distance;
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
        this.x -= x;
        this.y -= y;
      }
    }
  },
  constructed() {
    this.x = 100 + Math.random() * 300;
    this.y = 100 + Math.random() * 300;
    this.attributes = {
      style: {
        // The opacity of the sheep Sprite depends on whether it is penned.
        opacity: this.penned.map!(p => p ? '0.3' : '1')
      }
    };
    // The contents of the sheep Sprite depends on whether it is dead.
    return this.dead.map!(p => p ? '🦴' : '🐑')
  }
});

// The pen - just a div with some styling
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

// Here's the game logic - a field (green, of course), conatining a pen, a dog and some sheep
// We use AI-UI features to declaritively layout the game
const SheepGame = div.extended({
  styles: `.SheepGame {
    position: absolute;
    cursor: crosshair;
    width: 520px;
    height: 520px;
    background: #182;
  }

  .SheepGame #info {
    text-align: center;
    font-family: cursive;
    color: white;
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
  }

  .SheepGame #info .GameOver {
    background-color: rgba(255, 255, 255, 0.4);
    font-size: 2em;
    color: red;
  }

  .SheepGame #info .GameOver button {
    display: block;
    margin: 0 42%;
  }
  `,
  // The exposed property "flockSize" is iterable as we listen to it
  // to re-start the game if the number of sheep changes
  iterable: {
    flockSize: 1
  },
  override: {
    className: 'SheepGame'
  },
  ids: {
    dog: Dog,
    pen: SheepPen,
    info: div
  },
  constructed() {
    // The layout....
    return [
      // ...a sheep pen
      SheepPen({ id: 'pen' }),
      // ...a dog
      Dog({ id: 'dog' }),
      // ...we need to wait until the dog & pen are mounted into the DOM, as we
      // use the positions when playing the game
      this.when('#pen', '#dog', '@ready').map(() => this.flockSize.map!(() => {
        // Once they are mounted, we can get references to the pen's area, and the dog
        // Note: we could do this when the first "when" has fired, since we
        // know the elements are mounted, but there's no need - we may as well
        // wait until we know the number of sheep as well
        const penArea = this.ids.pen.getBoundingClientRect();
        const dog = this.ids.dog;

        // When this.sheep is set, create the game

        // Create the required number of sheep
        const sheep = [...repeat(this.flockSize, Sheep)];
        // We use async iterators to indicate a change in the game's progress.
        // One to track the number of penned sheep...
        const home = Iterators.merge(...sheep.map(s => s.penned)).map(() => sheep.reduce((a, s) => a + (s.penned.valueOf() ? 1 : 0), 0));
        // ...one to count the number of sheep that have been savaged by the dog
        const dead = Iterators.merge(...sheep.map(s => s.dead)).map(() => sheep.reduce((a, s) => a + (s.dead.valueOf() ? 1 : 0), 0));
        // ...and one that yields when the game is over (all the sheep are either home or dead)
        const gameOver = Iterators.combine({ home, dead }, { ignorePartial: true })
          .map(() => sheep.reduce((a, s) => a + (s.dead.valueOf() || s.penned.valueOf() ? 1 : 0),0) >= sheep.length ? 'gameover' : Iterators.Ignore);

        // For all the created sheep, every time the game frame yields,
        // check to see if the sheep has been killed by the dog (in which case we
        // exit the frame loop in a panic by throwing an exception), and if not
        // make the sheep wander
        for (const s of sheep) {
          gameTick().consume(() => {
            const distance = s.distance(dog);
            if (distance < 15) {
              s.dead = true;
              // This will stop ganeTick generator, as we've
              // told it (by throwing) that we're done
              throw new Error('dead sheep');
            }
            s.wander(dog, penArea);
          })
          // We don't actually care about the exception, we just needed it to terminate the wandering sheep ticker
          .catch(ex => null)
        }

        // Here's the layout:
        return [
          // The sheep
          sheep,
          // Some info about the game's progress
          div({ id: 'info' },
            // This node is mapped from the "gameOver" iterator. When it fires, we create a panel
            // that has a button to start the next round
            gameOver.map(g => div({ className: 'GameOver' },
              'Game Over!',
              button({
                // If the user clicks the button, remove the info, and
                // update the nunber of sheep, which will fire the `when` above
                // and re-create the game
                onclick: () => {
                  this.ids.info.remove();
                  this.flockSize += 1;
                }
              },
              'More sheep'
              )
            )),
            // When the iterators "home" and "dead" update, the DOM contents will update to show the change
            div('Home ', home), // "home" is the async iterator which yields the number of penned sheep
            div('Dead ', dead)  // "dead" is the async iterator which yields the number of dead sheep
          )
        ];
      }))
    ]
  }
})

// Create a SheepGame element and append it to the document
document.body.append(SheepGame({ flockSize: 2 }));
