/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';

const { div } = tag(['div']);
console.log(div().outerHTML);
console.log(div({ id: 'test-id' }, div("text", 123)).outerHTML);
