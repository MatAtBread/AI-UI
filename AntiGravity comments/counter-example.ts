import { tag } from './module/src/ai-ui.js';

const { div, button, span } = tag();

// Define the Counter component
const Counter = div.extended({
    // 1. Declare iterable properties (state)
    iterable: {
        count: 0
    },

    // 2. Define methods
    declare: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        }
    },

    // 3. Scoped Styles
    styles: `
    .counter-box {
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 8px;
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
      font-family: sans-serif;
    }
    .count-display {
      font-weight: bold;
      min-width: 2rem;
      text-align: center;
    }
  `,

    // 4. Construction logic (render function)
    constructed() {
        // 'this' is the instance of the element
        return [
            button({
                onclick: () => this.decrement()
            }, "-"),

            span({
                className: 'count-display'
            }, this.count), // Bind directly to the iterable 'count' property

            button({
                onclick: () => this.increment()
            }, "+")
        ];
    }
});

// Usage
const myCounter = Counter({ className: 'counter-box' });
document.body.append(myCounter);
