/// <reference path="../test.env.d.ts"/>

import { Iterators } from '../../module/src/ai-ui';
Iterators.augmentGlobalAsyncGenerators();

async function *a(wait: boolean) {
    for (let i=0; i<3; i++) {
        console.log("yield",i,wait)
        yield [i,wait];
        if (wait)
                await Promise.resolve();
    }
}

for await (const x of a(false)) {
    console.log("await",x);
}

for await (const x of a(true)) {
    console.log("await",x);
}

const m = a(false).multi();
m.consume(x => console.log("m-con",x))
for await (const x of m) {
    console.log("multi",x);
}

const n = a(true).multi();
n.consume(x => console.log("m-con",x))
for await (const x of n) {
    console.log("multi",x);
}