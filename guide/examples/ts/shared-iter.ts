import { UniqueID, tag } from '../../../module/esm/ai-ui.js';
import { iterableHelpers, queueIteratableIterator } from '../../../module/esm/iterators.js'

const { div, h2, input, span, pre, button } = tag();

const sleep = function <T>(millis: number, r?: T) {
  return new Promise<T | undefined>(function (resolve) {
    setTimeout(() => resolve(r), millis || 0);
  });
};

const Outer = div.extended({
  iterable: {
    num: 0
  },
  override: {
    onclick(e: MouseEvent) {
      e.stopPropagation();
      this.remove();
    },
    style: {
      backgroundColor: '#ccf'
    }
  },
  declare: {
    SubBox: div.extended({
      iterable: {
        sub: undefined as unknown as number
      },
      override: {
        onclick(e: MouseEvent) {
          e.stopPropagation();
          this.remove();
        },
        style: {
          backgroundColor: '#cfc'
        }
      },
      constructed() {
        return this.sub;
      }
    })
  },
  constructed() {
    setInterval(() => this.num += 1, 1000);
    return [
      this.num,
      button({
        style: { float: 'right' },
        onclick: (e) => {
          e.stopPropagation();
          this.append(this.SubBox({ sub: this.num }))
        }
      }, "more")
    ]
  }
});

document.body.append(Outer());