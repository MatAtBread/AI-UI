/// <reference path="../test.env.d.ts"/>

import { tag } from '../../module/src/ai-ui';

const { div } = tag();

async function *ai<T>(x: T) {
    yield x;
}

const attrs = { className: 'x' };

const a = [
    div(),
    div(undefined),
    div("a"),
    div(123),
    div(true),
    div(div()),

    div(Promise.resolve()),
    div(Promise.resolve(undefined)),
    div(Promise.resolve("a")),
    div(Promise.resolve(123)),
    div(Promise.resolve(true)),
    div(Promise.resolve(div())),

    div(ai(undefined as void)),
    div(ai(undefined)),
    div(ai("a")),
    div(ai(123)),
    div(ai(true)),
    div(ai(div())),

    div(attrs),
    div(attrs,undefined),
    div(attrs,"a"),
    div(attrs,123),
    div(attrs,true),
    div(attrs,div(attrs,)),

    div(attrs,Promise.resolve()),
    div(attrs,Promise.resolve(undefined)),
    div(attrs,Promise.resolve("a")),
    div(attrs,Promise.resolve(123)),
    div(attrs,Promise.resolve(true)),
    div(attrs,Promise.resolve(div(attrs,))),

    div(attrs,ai(undefined as void)),
    div(attrs,ai(undefined)),
    div(attrs,ai("a")),
    div(attrs,ai(123)),
    div(attrs,ai(true)),
    div(attrs,ai(div()))
];

const d = div(a);
await Test.sleep(1);
console.log(d.innerHTML);
