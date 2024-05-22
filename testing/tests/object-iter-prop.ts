import { Iterators } from "../../module/src/ai-ui";

export type AssertEqual<T, Expected> = [T] extends [Expected]
    ? [Expected] extends [T]
    ? { true: true; }
    : { false: false; }
    : { false: false; };

const src: {
    extra?: boolean;
} = {};

type ExpectedType = typeof src & {
    n: number & Partial<Iterators.AsyncExtraIterable<number>>,
    s: string & Partial<Iterators.AsyncExtraIterable<string>>
};

const obj = Iterators.defineIterableProperty(Iterators.defineIterableProperty(src, 'n', 0), 's', '?');
console.log(obj);
obj.s.consume!(s => console.log('s is', s, obj));
obj.n.consume!(n => console.log('n is', n, obj));
Iterators.merge(obj.s, obj.n).consume(_ => console.log('both are', obj.s + ' and ' + obj.n));
await Test.sleep(0.1);
obj.s = "Hello";
await Test.sleep(0.1);
obj.n = 123;
await Test.sleep(0.1);
Object.assign(obj, { s: "bye", n: 456 });
await Test.sleep(0.1);
console.log("await", obj);
await Test.sleep(1);
console.log("done", obj);

let t: AssertEqual<typeof obj, ExpectedType>['true'];