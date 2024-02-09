import { AsyncExtraIterable, AsyncProvider } from "./iterators";
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
export type PossiblyAsync<X> = [X] extends [object] ? X extends AsyncProvider<infer U> ? PossiblyAsync<U> : X extends Function ? X | AsyncProvider<X> : AsyncProvider<Partial<X>> | {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} : X | AsyncProvider<X> | undefined;
type DeepPartial<X> = [X] extends [object] ? {
    [K in keyof X]?: DeepPartial<X[K]>;
} : X;
export type Instance<T extends {} = Record<string, unknown>> = T;
type RootObj = object;
type AsyncGeneratedObject<X extends RootObj> = {
    [K in keyof X]: X[K] extends AsyncProvider<infer Value> ? Value : X[K];
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
    set attributes(v: Partial<PossiblyAsync<Base>>);
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
type IterableProperties<IP> = {
    [K in keyof IP]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>;
};
type NeverEmpty<O extends RootObj> = {} extends O ? never : O;
type OmitType<T, V> = [{
    [K in keyof T as T[K] extends V ? never : K]: T[K];
}][number];
interface _Not_Declared_ {
}
interface _Not_Array_ {
}
type ExcessKeys<A, B> = A extends any[] ? B extends any[] ? ExcessKeys<A[number], B[number]> : _Not_Array_ : B extends any[] ? _Not_Array_ : NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B ? A[K] extends (B[K] extends Function ? B[K] : DeepPartial<B[K]>) ? never : B[K] : _Not_Declared_;
}, never>>;
type OverlappingKeys<A, B> = B extends never ? never : A extends never ? never : keyof A & keyof B;
type ExtendedReturn<BaseCreator extends TagCreator<any, any>, P, O extends object, D, IP, CET extends object> = (OverlappingKeys<O, D> | OverlappingKeys<IP, D> | OverlappingKeys<IP, O> | OverlappingKeys<IP, TagCreatorAttributes<BaseCreator>> | OverlappingKeys<D, TagCreatorAttributes<BaseCreator>> | OverlappingKeys<D, P> | OverlappingKeys<O, P> | OverlappingKeys<IP, P>) extends never ? ExcessKeys<O, TagCreatorAttributes<BaseCreator>> extends never ? TagCreator<FlattenOthers<CET & IterableProperties<IP>>, BaseCreator> : {
    '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<O, TagCreatorAttributes<BaseCreator>>;
} : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D, TagCreatorAttributes<BaseCreator>>;
    '`iterable` clashes with base properties': OverlappingKeys<IP, TagCreatorAttributes<BaseCreator>>;
    '`iterable` clashes with `override`': OverlappingKeys<IP, O>;
    '`iterable` clashes with `declare`': OverlappingKeys<IP, D>;
    '`override` clashes with `declare`': OverlappingKeys<O, D>;
    '`prototype` (deprecated) clashes with `declare`': OverlappingKeys<D, P>;
    '`prototype` (deprecated) clashes with `override`': OverlappingKeys<D, P>;
    '`prototype` (deprecated) clashes with `iterable`': OverlappingKeys<IP, P>;
}, never>;
type ExtensionDefinition<P extends RootObj, O extends RootObj, D extends RootObj, IP extends {
    [k: string]: string | number | bigint | boolean | /* object | */ undefined;
}, I extends {
    [idExt: string]: TagCreator<any, any>;
}, C extends () => (ChildTags | void | Promise<void | ChildTags>), S extends string | undefined> = {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
};
export type Overrides = ExtensionDefinition<object, object, object, {
    [k: string]: string | number | bigint | boolean | /* object | */ undefined;
}, {
    [id: string]: TagCreator<any, any>;
}, () => (ChildTags | void | Promise<void | ChildTags>), string>;
export type TagCreatorAttributes<T extends TagCreator<any, any>> = T extends TagCreator<infer B, any> ? B : never;
interface ExtendedTag {
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void | ChildTags>), S extends string | undefined, P extends RootObj = {}, O extends RootObj = {}, D extends RootObj = {}, I extends {
        [idExt: string]: TagCreator<any, any>;
    } = {}, IP extends {
        [k: string]: string | number | bigint | boolean | /* object | */ undefined;
    } = {}, CET extends RootObj = D & O & IDS<I> & MergeBaseTypes<P, TagCreatorAttributes<BaseCreator>>, CTT = ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & MergeBaseTypes<P, TagCreatorAttributes<BaseCreator>>>>(this: BaseCreator, _: (ThisType<CTT> & ExtensionDefinition<P, O, D, IP, I, C, S>) | ((instance: any) => ThisType<CTT> & ExtensionDefinition<P, O, D, IP, I, C, S>)): ExtendedReturn<BaseCreator, P, O, D, IP, CET>;
}
export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
export type TagCreator<Base extends RootObj, Super extends (never | TagCreator<any, any>) = never> = {
    (...args: TagCreatorArgs<PossiblyAsync<ReTypedEventHandlers<Base>> & ThisType<ReTypedEventHandlers<Base>>>): ReTypedEventHandlers<Base>;
    extended: ExtendedTag;
    super: Super;
    overrides?: (<A extends Instance>(a: A) => Overrides);
    readonly name: string;
};
export {};
