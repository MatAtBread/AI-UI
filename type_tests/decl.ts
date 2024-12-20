import type { TagCreator } from '../module/src/ai-ui';
import type { TagCreatorAttributes } from '../module/src/tags';
import { ai } from './basic';

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

/* Declare a tag type & function */
export declare var Base: TagCreator<{
  Attr: 'base',
  N: 0 | 1 | 2, fn(): void,
  gen: unknown
} /*& Pick<Element, 'attributes'>*/>;

const e0 = Base({
  fn() {
    (<AssertEqual<typeof this.Attr, "base">>{}).true;
    (<AssertEqual<typeof this.N, 0 | 1 | 2>>{}).true;
  }
});
(<AssertEqual<typeof e0.Attr, "base">>{}).true;
(<AssertEqual<typeof e0.N, 0 | 1 | 2>>{}).true;

/* Extend by declaring a new boolean */
const Ext1 = Base.extended({
  declare: {
    x: true
  }
});
const e1 = Ext1({
  fn() {
    (<AssertEqual<typeof this.Attr, "base">>{}).true;
    (<AssertEqual<typeof this.N, 0 | 1 | 2>>{}).true;
    (<AssertEqual<typeof this.x, boolean>>{}).true;
  }
});
(<AssertEqual<typeof e1.Attr, "base">>{}).true;
(<AssertEqual<typeof e1.N, 0 | 1 | 2>>{}).true;
(<AssertEqual<typeof e1.x, boolean>>{}).true;

(<AssertEqual<typeof e1, {
  x: boolean;
  // This test is too loose - fix
  ids: {};
  Attr: "base";
  N: 0 | 1 | 2;
  fn: () => void;
  gen: unknown;
}>>{}).true;

type B0 = TagCreatorAttributes<typeof Base>;
type B1 = TagCreatorAttributes<typeof Ext1>;
type B2 = TagCreatorAttributes<typeof Ext2>;

const Ext2 = Ext1.extended({
  declare: {
    y: true
  }
});
const e2 = Ext2({
  fn() {
    (<AssertEqual<typeof this.Attr, "base">>{}).true;
    (<AssertEqual<typeof this.N, 0 | 1 | 2>>{}).true;
    (<AssertEqual<typeof this.x, boolean>>{}).true;
    (<AssertEqual<typeof this.y, boolean>>{}).true;
  }
});
(<AssertEqual<typeof e2.Attr, "base">>{}).true;
(<AssertEqual<typeof e2.N, 0 | 1 | 2>>{}).true;
(<AssertEqual<typeof e2.x, boolean>>{}).true;
(<AssertEqual<typeof e2.y, boolean>>{}).true;

type Q = typeof e2.ids;
(<AssertEqual<typeof e2, {
  x: boolean;
  y: boolean;
  // This test is too loose - fix
  ids: {};
  Attr: "base";
  N: 0 | 1 | 2;
  fn: () => void;
  gen: unknown;
}>>{}).true;

export const Ids3 = Ext2.extended({
  ids:{
    base: Base,
    ext1: Ext1
  },
  constructed(){
    (<AssertEqual<typeof this.ids.base.Attr, "base">>{}).true;
    (<AssertEqual<typeof this.ids.ext1.Attr, "base">>{}).true;
    (<AssertEqual<typeof this.ids.base, ReturnType<typeof Base>>>{}).true;
    (<AssertEqual<typeof this.ids.ext1.x, boolean>>{}).true;
  }
});
const i3 = Ids3({
  x: ai(false),
});
(<AssertEqual<typeof i3.ids.base.Attr, "base">>{}).true;
(<AssertEqual<typeof i3.ids.ext1.Attr, "base">>{}).true;
(<AssertEqual<typeof i3.ids.base, ReturnType<typeof Base>>>{}).true;
(<AssertEqual<typeof i3.ids.ext1.x, boolean>>{}).true;
