import type { AsyncExtraIterable, AsyncProvider, Ignore, Iterability } from "./iterators.js";
export type ChildTags = Node | number | string | boolean | undefined | typeof Ignore | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
type AsyncAttr<X> = AsyncProvider<X> | Promise<X>;
export type PossiblyAsync<X> = [
    X
] extends [object] ? X extends AsyncAttr<infer U> ? PossiblyAsync<U> : X extends Function ? X | AsyncAttr<X> : AsyncAttr<Partial<X>> | {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} : X | AsyncAttr<X> | undefined;
type DeepPartial<X> = [X] extends [object] ? {
    [K in keyof X]?: DeepPartial<X[K]>;
} : X;
export declare const UniqueID: unique symbol;
export type Instance<T extends Record<string, unknown> = {}> = {
    [UniqueID]: string;
} & T;
type RootObj = object;
type AsyncGeneratedObject<X extends RootObj> = {
    [K in keyof X]: X[K] extends AsyncAttr<infer Value> ? Value : X[K];
};
type IDS<I> = {
    ids: {
        [J in keyof I]: I[J] extends TagCreator<any, any> ? ReturnType<I[J]> : never;
    };
};
type TypedEventHandlers<T> = {
    [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) ? null | ((this: T, event: E) => R) : GlobalEventHandlers[K];
};
type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers) ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T> : T;
type ReadWriteAttributes<E, Base> = Omit<E, 'attributes'> & {
    get attributes(): NamedNodeMap;
    set attributes(v: DeepPartial<PossiblyAsync<Base>>);
};
export type Flatten<O> = [
    {
        [K in keyof O]: O[K];
    }
][number];
type FlattenOthers<Src, Others = HTMLElement> = Src extends Partial<Others> ? Flatten<Omit<Src, keyof Partial<Others>>> & Pick<Src, keyof Partial<Others>> : Flatten<Src>;
type Extends<A, B> = A extends any[] ? B extends any[] ? Extends<A[number], B[number]>[] : never : B extends any[] ? never : B extends A ? B : A extends B ? B & Flatten<Omit<A, keyof B>> : never;
type MergeBaseTypes<T, Base> = {
    [K in keyof Base | keyof T]: K extends (keyof T & keyof Base) ? Extends<T[K], Base[K]> : K extends keyof T ? T[K] : K extends keyof Base ? Base[K] : never;
};
export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
    [K in keyof Omit<IP, typeof Iterability>]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>;
} : {
    [K in keyof IP]: (IP[K] extends object ? IterableProperties<IP[K]> : IP[K]) & Partial<AsyncExtraIterable<IP[K]>>;
};
type IterablePropertyValue = (string | number | bigint | boolean | object | undefined) & {
    splice?: never;
};
type OptionalIterablePropertyValue = IterablePropertyValue | undefined | null;
type NeverEmpty<O extends RootObj> = {} extends O ? never : O;
type OmitType<T, V> = [{
    [K in keyof T as T[K] extends V ? never : K]: T[K];
}][number];
type PickType<T, V> = [{
    [K in keyof T as T[K] extends V ? K : never]: T[K];
}][number];
interface _Not_Declared_ {
}
interface _Not_Array_ {
}
type ExcessKeys<A, B> = A extends any[] ? B extends any[] ? ExcessKeys<A[number], B[number]> : _Not_Array_ : B extends any[] ? _Not_Array_ : NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B ? A[K] extends (B[K] extends Function ? B[K] : DeepPartial<B[K]>) ? never : B[K] : _Not_Declared_;
}, never>>;
type OverlappingKeys<A, B> = B extends never ? never : A extends never ? never : keyof A & keyof B;
type CheckPropertyClashes<BaseCreator extends TagCreator<any, any>, D extends Overrides, Result = never> = (OverlappingKeys<D['override'], D['declare']> | OverlappingKeys<D['iterable'], D['declare']> | OverlappingKeys<D['iterable'], D['override']> | OverlappingKeys<D['declare'], TagCreatorAttributes<BaseCreator>> | OverlappingKeys<D['declare'], D['prototype']> | OverlappingKeys<D['override'], D['prototype']> | OverlappingKeys<D['iterable'], D['prototype']>) extends never ? ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> extends never ? Result : {
    '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>>;
} : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D, TagCreatorAttributes<BaseCreator>>;
    '`iterable` clashes with `override`': OverlappingKeys<D['iterable'], D['override']>;
    '`iterable` clashes with `declare`': OverlappingKeys<D['iterable'], D['declare']>;
    '`override` clashes with `declare`': OverlappingKeys<D['override'], D['declare']>;
    '`prototype` (deprecated) clashes with `declare`': OverlappingKeys<D['declare'], D['prototype']>;
    '`prototype` (deprecated) clashes with `override`': OverlappingKeys<D['declare'], D['prototype']>;
    '`prototype` (deprecated) clashes with `iterable`': OverlappingKeys<D['iterable'], D['prototype']>;
}, never>;
export type Overrides = {
    /** @deprecated */ prototype?: object;
    override?: object;
    declare?: object;
    iterable?: {
        [k: string]: OptionalIterablePropertyValue;
    };
    ids?: {
        [id: string]: TagCreator<any, any>;
    };
    constructed?: () => (ChildTags | void | Promise<void | ChildTags>);
    styles?: string;
};
export type TagCreatorAttributes<T extends TagCreator<any, any>> = T extends TagCreator<infer B, any> ? B : never;
type UnwrapIterables<IP> = {
    [K in keyof IP]: Exclude<IP[K], AsyncExtraIterable<any>>;
};
type CombinedEffectiveType<Base extends TagCreator<any, any>, D extends Overrides> = D['declare'] & D['override'] & IDS<D['ids']> & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>;
type CombinedIterableProperties<Base extends TagCreator<any, any>, D extends Overrides> = D['iterable'] & UnwrapIterables<Pick<TagCreatorAttributes<Base>, keyof D['iterable']>>;
type CombinedThisType<Base extends TagCreator<any, any>, D extends Overrides> = ReadWriteAttributes<IterableProperties<CombinedIterableProperties<Base, D>> & AsyncGeneratedObject<CombinedEffectiveType<Base, D>>, D['declare'] & D['override'] & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>>;
interface ExtendedTag {
    <BaseCreator extends TagCreator<any, any>, Definitions extends Overrides = {}>(this: BaseCreator, _: (instance: any) => ThisType<CombinedThisType<NoInfer<BaseCreator>, NoInfer<Definitions>>> & Definitions): CheckPropertyClashes<BaseCreator, Definitions, TagCreator<FlattenOthers<CombinedEffectiveType<BaseCreator, Definitions> & IterableProperties<CombinedIterableProperties<BaseCreator, Definitions>>>, BaseCreator, PickType<Definitions['declare'] & Definitions['override'] & Definitions['prototype'] & TagCreatorAttributes<BaseCreator>, any>>>;
    <BaseCreator extends TagCreator<any, any>, Definitions extends Overrides = {}>(this: BaseCreator, _: ThisType<CombinedThisType<NoInfer<BaseCreator>, NoInfer<Definitions>>> & Definitions): CheckPropertyClashes<BaseCreator, Definitions, TagCreator<FlattenOthers<CombinedEffectiveType<BaseCreator, Definitions> & IterableProperties<CombinedIterableProperties<BaseCreator, Definitions>>>, BaseCreator, PickType<Definitions['declare'] & Definitions['override'] & Definitions['prototype'] & TagCreatorAttributes<BaseCreator>, any>>>;
}
export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
export type TagCreatorFunction<Base extends RootObj> = (...args: TagCreatorArgs<PossiblyAsync<ReTypedEventHandlers<Base>> & ThisType<ReTypedEventHandlers<Base>>>) => ReTypedEventHandlers<Base>;
export type TagCreator<Base extends RootObj, Super extends (never | TagCreator<any, any>) = never, Statics = {}> = TagCreatorFunction<Base> & {
    extended: ExtendedTag;
    super: Super;
    definition?: Overrides;
    readonly name: string;
    [Symbol.hasInstance](elt: any): boolean;
} & Statics;
export {};
