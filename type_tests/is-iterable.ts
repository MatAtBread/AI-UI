import { TagCreator, Iterators, ChildTags } from '../module/src/ai-ui';
type IterableProperties<T> = Iterators.IterableProperties<T>;
type IterableType<T> = Iterators.IterableType<T>;

type IsIterableProperty<Q, R = never> = Iterators.IsIterableProperty<Q,R>

type A = IterableProperties<number>;
type RA = IsIterableProperty<A>;
type B = IterableProperties<number | null>;
type RB = IsIterableProperty<B>;
type C = IterableProperties<number | string>;
type RC = IsIterableProperty<C>;
type D = IterableProperties<{ n: number | string }>;
type RD = IsIterableProperty<D>;

type E = IterableProperties<number[]>;
type RE = IsIterableProperty<E>; // 2

type F = IterableProperties<(number| null)[]>;
type RF = IsIterableProperty<F>; // 2

type G = IterableProperties<{ n: number[] }>;
type RG = IsIterableProperty<G>; // 3

type H = IterableProperties<number[] | null[]>;
type RH = IsIterableProperty<F>; // 2

type I = IterableType<ChildTags>;
type RI = IsIterableProperty<I>
type J = IterableProperties<ChildTags>;
type RJ = IsIterableProperty<J>