import { Iterators } from "../../module/src/ai-ui";

const obj = {} as {
    n: number & Partial<Iterators.AsyncExtraIterable<number>>,
    s: string & Partial<Iterators.AsyncExtraIterable<string>>
};
Iterators.defineIterableProperty(obj,'n',0);
Iterators.defineIterableProperty(obj,'s','?');
console.log(obj);
obj.s.consume!(s => console.log('s is',s, obj));
obj.n.consume!(n => console.log('n is',n, obj));
Iterators.merge(obj.s,obj.n).consume(_ => console.log('both are',obj.s+' and '+obj.n));
await Test.sleep(0.1);
obj.s = "Hello";
await Test.sleep(0.1);
obj.n = 123;
await Test.sleep(0.1);
Object.assign(obj,{s: "bye", n: 456});
await Test.sleep(0.1);
console.log("await",obj);
await Test.sleep(1);
console.log("done",obj);
