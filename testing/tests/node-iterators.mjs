/* Ensure Iterators can be used from node */
import * as Iterators from '../../module/esm/iterators.js';

export const result = [];
const src = {};
const obj = Iterators.defineIterableProperty(src,'it',123);
obj.it.consume(v => result.push('it is',v));
obj.it = 456;
obj.it = 789;
