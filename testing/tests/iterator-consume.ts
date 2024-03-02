/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';

const count = Iterators.generatorHelpers(Test.count);

await count().filter(n => Boolean(n&1)).initially(100).map(n => n * 10).initially(-1).consume(n => console.log(n));
