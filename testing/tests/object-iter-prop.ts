import { Iterators } from "../../module/src/ai-ui";

const obj = {} as {
    n: number & Partial<Iterators.AsyncExtraIterable<number>>,
    s: string & Partial<Iterators.AsyncExtraIterable<string>>
};
Iterators.defineIterableProperty(obj,'n',0);
Iterators.defineIterableProperty(obj,'s','zero');
console.log(obj);
obj.s.consume!(s => console.log('s is',s));
obj.n.consume!(n => console.log('s is',n));
Iterators.merge(obj.s,obj.n).consume(_ => console.log('both are',obj.s+' and '+obj.n));
obj.s = "Hello";
obj.n = 123;
Object.assign(obj,{s: "bye", n: 456});
