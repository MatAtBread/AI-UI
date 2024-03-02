/// <reference path="./test.env.d.ts"/>

import { Iterators } from '../module';

const count = Iterators.generatorHelpers(Test.count)
for await (const x of count().map(n => n*2)) {
    console.log("Mapped",x)
}
