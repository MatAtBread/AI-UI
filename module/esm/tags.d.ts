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
export type Instance<T = {}> = {
    [UniqueID]: string;
} & T;
type AsyncGeneratedObject<X extends object> = {
    [K in keyof X]: X[K] extends AsyncAttr<infer Value> ? Value : X[K];
};
type IDS<I> = {
    ids: {
        [J in keyof I]: I[J] extends ExTagCreator<any> ? ReturnType<I[J]> : never;
    };
};
type ReTypedEventHandlers<T> = {
    [K in keyof T]: K extends keyof GlobalEventHandlers ? Exclude<GlobalEventHandlers[K], null> extends (e: infer E) => any ? (this: T, e: E) => any | null : T[K] : T[K];
};
type ReadWriteAttributes<E, Base> = Omit<E, 'attributes'> & {
    get attributes(): NamedNodeMap;
    set attributes(v: DeepPartial<PossiblyAsync<Base>>);
};
export type Flatten<O> = [
    {
        [K in keyof O]: O[K];
    }
][number];
export type DeepFlatten<O> = [
    {
        [K in keyof O]: Flatten<O[K]>;
    }
][number];
type Extends<A, B> = A extends any[] ? B extends any[] ? Extends<A[number], B[number]>[] : never : B extends any[] ? never : B extends A ? B : A extends B ? B & Flatten<Omit<A, keyof B>> : never;
type MergeBaseTypes<T, Base> = {
    [K in keyof Base | keyof T]: K extends (keyof T & keyof Base) ? Extends<T[K], Base[K]> : K extends keyof T ? T[K] : K extends keyof Base ? Base[K] : never;
};
export type IterableType<T> = T & Partial<AsyncExtraIterable<T>>;
export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
    [K in keyof Omit<IP, typeof Iterability>]: IterableType<IP[K]>;
} : {
    [K in keyof IP]: (IP[K] extends object ? IterableProperties<IP[K]> : IP[K]) & IterableType<IP[K]>;
};
type OptionalIterablePropertyValue = (string | number | bigint | boolean | undefined | null) | (object & {
    splice?: never;
});
type NeverEmpty<O extends object> = {} extends O ? never : O;
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
type CheckPropertyClashes<BaseCreator extends ExTagCreator<any>, D extends Overrides, Result = never> = (OverlappingKeys<D['override'], D['declare']> | OverlappingKeys<D['iterable'], D['declare']> | OverlappingKeys<D['iterable'], D['override']> | OverlappingKeys<D['iterable'], Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>> | OverlappingKeys<D['declare'], TagCreatorAttributes<BaseCreator>> | OverlappingKeys<D['declare'], D['prototype']> | OverlappingKeys<D['override'], D['prototype']> | OverlappingKeys<D['iterable'], D['prototype']>) extends never ? ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> extends never ? Result : {
    '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>>;
} : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D['declare'], TagCreatorAttributes<BaseCreator>>;
    '`iterable` clashes with base properties': OverlappingKeys<D['iterable'], Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>>;
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
        [id: string]: ExTagCreator<any>;
    };
    styles?: string;
};
export type Constructed = {
    constructed: () => (ChildTags | void | Promise<void | ChildTags>);
};
export type TagCreatorAttributes<T extends ExTagCreator<any>> = T extends ExTagCreator<infer BaseAttrs> ? BaseAttrs : never;
type BaseIterables<Base> = Base extends ExTagCreator<infer _A, infer B, infer D extends Overrides, infer _D> ? BaseIterables<B> extends never ? D['iterable'] extends unknown ? {} : D['iterable'] : BaseIterables<B> & D['iterable'] : never;
type CombinedNonIterableProperties<Base extends ExTagCreator<any>, D extends Overrides> = D['declare'] & D['override'] & IDS<D['ids']> & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>;
type CombinedIterableProperties<Base extends ExTagCreator<any>, D extends Overrides> = BaseIterables<Base> & D['iterable'];
type CombinedThisType<Base extends ExTagCreator<any>, D extends Overrides> = ReadWriteAttributes<IterableProperties<CombinedIterableProperties<Base, D>> & AsyncGeneratedObject<CombinedNonIterableProperties<Base, D>>, D['declare'] & D['override'] & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>>;
type StaticReferences<Base extends ExTagCreator<any>, Definitions extends Overrides> = PickType<Definitions['declare'] & Definitions['override'] & Definitions['prototype'] & TagCreatorAttributes<Base>, any>;
interface ExtendedTag {
    <BaseCreator extends ExTagCreator<any>, SuppliedDefinitions, Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {}, TagInstance = any>(this: BaseCreator, _: (inst: TagInstance) => SuppliedDefinitions & ThisType<CombinedThisType<BaseCreator, Definitions>>): CheckConstructedReturn<SuppliedDefinitions, CheckPropertyClashes<BaseCreator, Definitions, ExTagCreator<IterableProperties<CombinedIterableProperties<BaseCreator, Definitions>> & CombinedNonIterableProperties<BaseCreator, Definitions>, BaseCreator, Definitions, StaticReferences<BaseCreator, Definitions>>>>;
    <BaseCreator extends ExTagCreator<any>, SuppliedDefinitions, Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {}>(this: BaseCreator, _: SuppliedDefinitions & ThisType<CombinedThisType<BaseCreator, Definitions>>): CheckConstructedReturn<SuppliedDefinitions, CheckPropertyClashes<BaseCreator, Definitions, ExTagCreator<IterableProperties<CombinedIterableProperties<BaseCreator, Definitions>> & CombinedNonIterableProperties<BaseCreator, Definitions>, BaseCreator, Definitions, StaticReferences<BaseCreator, Definitions>>>>;
}
type CheckConstructedReturn<SuppliedDefinitions, Result> = SuppliedDefinitions extends {
    constructed: any;
} ? SuppliedDefinitions extends Constructed ? Result : {
    "constructed` does not return ChildTags": SuppliedDefinitions['constructed'];
} : Result;
export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
export type TagCreatorFunction<Base extends object> = (...args: TagCreatorArgs<PossiblyAsync<ReTypedEventHandlers<Base>> & ThisType<ReTypedEventHandlers<Base>>>) => ReTypedEventHandlers<Base>;
type ExTagCreator<Base extends object, Super extends (unknown | ExTagCreator<any>) = unknown, SuperDefs extends Overrides = {}, Statics = {}> = TagCreatorFunction<Base> & {
    extended: ExtendedTag;
    super: Super;
    definition?: Overrides;
    readonly name: string;
    [Symbol.hasInstance](elt: any): boolean;
    [UniqueID]: string;
} & Statics;
export type TagCreator<Base extends object> = ExTagCreator<Base, never, never, {}>;
export {};
