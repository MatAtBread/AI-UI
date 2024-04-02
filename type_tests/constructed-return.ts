import type { Instance, TagCreator } from '../module/src/ai-ui';
import { UniqueID } from '../module/src/tags';

export type AssertEqual<T, Expected> = [T] extends [Expected]
    ? [Expected] extends [T]
    ? { true: true; }
    : { false: false; }
    : { false: false; };

declare const div: TagCreator<HTMLDivElement>;
const I = div.extended((inst: Instance) => ({
    styles: `${inst[UniqueID]} {}`,
    iterable: {
        i: 0
    },
    constructed() {
        const x = this.i.map!(i => i + 1);
        return Symbol('x');
    }
}));
const J = div.extended((inst: Instance) => ({
    styles: `${inst[UniqueID]} {}`,
    iterable: {
        i: 0
    },
    constructed() {
        const x = this.i.map!(i => i + 1);
        return x;
    }
}));
const K = div.extended((inst: Instance) => ({
    styles: `${inst[UniqueID]} {}`,
    iterable: {
        i: 0
    },
    constructed() {
        const x = this.i.map!(i => i + 1);
    }
}));
const L = div.extended((inst: Instance) => ({
    styles: `${inst[UniqueID]} {}`,
    iterable: {
        i: 0
    }
}));

// @ts-expect-error
I()
J()
K()
L();

({} as AssertEqual<typeof I, {
    "constructed` does not return ChildTags": () => symbol;
}>).true;