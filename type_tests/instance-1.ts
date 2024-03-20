import type { Instance, TagCreator } from '../module/src/ai-ui';

export async function* ai<T>(t: T) { yield t }

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

/* Declare a tag type & function */
declare var Base: TagCreator<{base: 'base'}>;
const Dec = Base.extended({});
const Inst = Base.extended(inst => ({}));

Dec();
Inst();
/*
const Ext = Div.extended({
  prototype:{
    x: 0
  },
  constructed(){
    return Div('x')
  }
});

const Ctn = Div.extended({
  constructed(){
    return [Ext('x')]
  }
})
*/

declare var Div: TagCreator<HTMLDivElement>;
const Icon = Div.extended((instance: Instance<{ icon: string }>) => ({
  declare: {
    icon: ''
  },
  constructed() {
    this.classList.add('Icon');
    this.classList.add('fa');
    this.classList.add('fa-' + this.icon);
    instance.icon = this.icon;

    // (hopefully) temporary workaround until #109 is fixed
    Object.defineProperty(
      this,
      'icon',
      {
        get(): string {
          return instance.icon || 'question';
        },
        set(value: string) {
          this.removeClass('fa-' + this.icon);
          instance.icon = value;
          this.classList.add('fa-' + this.icon);
        },
        configurable: true,
        enumerable: true
      }
    );
  }
}));

Icon();