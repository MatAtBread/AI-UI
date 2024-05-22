import type { TagCreator } from '../module/src/ai-ui';
import { IterableType } from '../module/src/iterators';

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
  ? { true: true; }
  : { false: false; }
  : { false: false; };

declare const div: TagCreator<HTMLDivElement>;
const A = div.extended({
  iterable: {
    a: 0
  }
});

// We can override an iterable's VALUE, but it should remain iterable
const B = A.extended({
  override: {
    a: 1
  }
});
const ba = B().a;
(<AssertEqual<typeof ba, IterableType<number>>>{}).true;

// An overridden iterable remains iterable
const C = B.extended({});
const ca = C().a;
(<AssertEqual<typeof ca, IterableType<number>>>{}).true;

// We can't re-declare an existing iterable
const D = A.extended({
  declare: {
    a: 1
  }
});
(<AssertEqual<typeof D, {
  '`declare` clashes with base properties': "a";
}>>{}).true;

// We can't override a non-iterable property by re-declaring an iterable
const E = A.extended({
  iterable:{
    textContent: ''
  }
});
(<AssertEqual<typeof E, {
  '`iterable` clashes with base properties': "textContent";
}>>{}).true;
