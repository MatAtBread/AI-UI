import { Iterators, ChildTags } from '../module/src/ai-ui';
type IterableProperties<T> = Iterators.IterableProperties<T>;
type IsIterableProperty<Q, R = never> = Iterators.IsIterableProperty<Q,R>

type Test<T, U = IterableProperties<T>, V = IsIterableProperty<U>> =
    T extends V ? V extends T ? { true: [T,V] } : never : never;

type TA = Test<number>['true']
type TB = Test<number | null>['true']
type TC = Test<number | string>['true']
type TD = Test<{ n: number | string }>['true']
type TE = Test<number[]>['true']
type TF = Test<(number | null)[]>['true']
type TG = Test<{ n: number[] }>['true']
type TH = Test<number[] | null[]>['true']
type TI = Test<ChildTags>['true']


