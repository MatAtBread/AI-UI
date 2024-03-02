/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';

const count = Iterators.generatorHelpers(Test.count);
const now = Date.now();
await count()
    .filter(n => Boolean(n&1))
    .initially(100)
    .map(n => n * 10)
    .waitFor(done => setTimeout(done,500))
    .initially(-1)
    .consume(n => console.log(Date.now() - now, n));
