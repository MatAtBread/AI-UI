/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';
export { };

let obj = Iterators.defineIterableProperty(
  Iterators.defineIterableProperty(
  Iterators.defineIterableProperty({},
  'deep', { a: { b: '' } }),
  'both', { a: { [Iterators.Iterability]: 'shallow' as const, b: '' } }),
  'shallow', { [Iterators.Iterability]: 'shallow' as const, a: { b: '' } })

console.log("deep",obj.deep.consume?.name);
console.log("deep",obj.deep.a.consume?.name);
console.log("deep",obj.deep.a.b.consume?.name);

console.log("both",obj.both.consume?.name);
console.log("both",obj.both.a.consume?.name);
// REQUIRES TYPE FIX TO IterableProperties
// @ ts-expect-error: consume shouldn't exist on .a.b
console.log("both",obj.both.a.b.consume?.name);

console.log("shallow",obj.shallow.consume?.name);
// REQUIRES TYPE FIX TO IterableProperties
// @ ts-expect-error: consume shouldn't exist on .a
console.log("shallow",obj.shallow.a.consume?.name);
// @ts-expect-error: consume shouldn't exist on .a.b
console.log("shallow",obj.shallow.a.b.consume?.name);
