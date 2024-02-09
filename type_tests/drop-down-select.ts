import type { TagCreator } from '../module/src/ai-ui';

export async function* ai<T>(t: T) { yield t }

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

/* Declare a tag type & function */
declare var Select: TagCreator<HTMLSelectElement>;
declare var Option: TagCreator<HTMLOptionElement & { originalData: unknown }>;

Select.extended(({
  declare: {
    indexOfText(v: string): number {
      this;
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].originalData && this.options[i].originalData?.toString() == v) {
          return i;
        }
        if (this.options[i].textContent == v) {
          return i;
        }
      }
      return -1;
    },
    indexOfValue(v: unknown): number {
      return -1;// [].slice.call(this.options).findIndex(item => item.originalData === v);
    },
    get selectedValue(): unknown {
      return this.selectedIndex < 0 ? undefined : this.selectedOptions[0].originalData;
    },
    set selectedValue(v) {
      this.selectedIndex = (this.indexOfValue(v));
    },
    get selectedText(): string | null {
      return this.selectedOptions[0] && this.selectedOptions[0].textContent;
    }
  },
  override:{
    options: undefined as unknown as HTMLCollectionOf<ReturnType<typeof Option>>,
    selectedOptions: undefined as unknown as HTMLCollectionOf<ReturnType<typeof Option>>,
  }
}));