import { AsyncExtraIterable, AsyncProvider } from "./iterators";
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
type PossiblyAsync<X> = [X] extends [object] ? X extends AsyncProvider<infer U> ? PossiblyAsync<U> : X extends Function ? X | AsyncProvider<X> : AsyncProvider<Partial<X>> | {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} : X | AsyncProvider<X> | undefined;
export type Instance<T extends {} = Record<string, unknown>> = T;
type AsyncGeneratedObject<X extends object> = {
    [K in keyof X]: X[K] extends AsyncProvider<infer Value> ? Value : X[K];
};
type IDS<I> = {
    ids: {
        [J in keyof I]?: I[J] extends (...a: any[]) => infer R ? R : never;
    };
};
export type Overrides = {
    /** @deprecated */ prototype?: object;
    override?: object;
    iterable?: object;
    declare?: object;
    ids?: {
        [id: string]: TagCreator<any, any>;
    };
    styles?: string;
    constructed?: () => (ChildTags | void | Promise<void>);
};
type TypedEventHandlers<T> = {
    [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) ? null | ((this: T, event: E) => R) : GlobalEventHandlers[K];
};
type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers) ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T> : T;
type ReadWriteAttributes<E, Base> = Omit<E, 'attributes'> & {
    get attributes(): NamedNodeMap;
    set attributes(v: Partial<PossiblyAsync<Base>>);
};
type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;
type MergeBaseTypes<P, Base> = {
    [K in keyof P]: K extends keyof Base ? Partial<Base[K]> | P[K] : P[K];
};
type IterableProperties<IP> = {
    [K in keyof IP]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>;
};
type NeverEmpty<O extends object> = {} extends O ? never : O;
type ExcessKeys<A extends object, B extends object> = NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B ? A[K] extends Partial<B[K]> ? never : B[K] : undefined;
}, never>>;
type OmitType<T, V> = [{
    [K in keyof T as T[K] extends V ? never : K]: T[K];
}][number];
type ExtendedReturn<BaseCreator extends TagCreator<any, any, any>, P, O extends object, D, IP, Base extends object, CET extends object> = ((keyof O & keyof D) | (keyof IP & keyof D) | (keyof IP & keyof O) | (keyof IP & keyof Base) | (keyof D & keyof Base) | (keyof D & keyof P) | (keyof O & keyof P) | (keyof IP & keyof P)) extends never ? ExcessKeys<O, Base> extends never ? TagCreator<CET & IterableProperties<IP>, BaseCreator> & StaticMembers<P & O & D, Base> : {
    '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<O, Base>;
} : OmitType<{
    '`declare` clashes with base properties': keyof D & keyof Base;
    '`iterable` clashes with base properties': keyof IP & keyof Base;
    '`iterable` clashes with `override`': keyof IP & keyof O;
    '`iterable` clashes with `declare`': keyof IP & keyof D;
    '`override` clashes with `declare`': keyof O & keyof D;
    '`prototype` (deprecated) clashes with `declare`': keyof D & keyof P;
    '`prototype` (deprecated) clashes with `override`': keyof O & keyof P;
    '`prototype` (deprecated) clashes with `iterable`': keyof IP & keyof P;
}, never>;
interface ExtendedTag {
    <BaseCreator extends TagCreator<any, any>, P extends MergeBaseTypes<P, Base>, // prototype (deprecated, but can be used to extend a single property type in a union)
    O extends object, // overrides - same types as Base, or omitted
    D extends object, // declare - any types
    I extends {
        [id: string]: TagCreator<any, any>;
    }, // ids - tagCreators
    C extends () => (ChildTags | void | Promise<void>), // constructed()
    S extends string | undefined, // styles (string)
    IP extends {
        [k: string]: string | number | bigint | boolean | /* object | */ undefined;
    } = {}, // iterable - primitives (will be boxed)
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, // Base
    CET extends object = D & O & P & Base & IDS<I>>(this: BaseCreator, _: (instance: any) => {
        /** @deprecated */ prototype?: P;
        override?: O;
        declare?: D;
        iterable?: IP;
        ids?: I;
        constructed?: C;
        styles?: S;
    } & ThisType<ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & P & Base>>): ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
    <BaseCreator extends TagCreator<any, any>, P extends MergeBaseTypes<P, Base>, // prototype (deprecated, but can be used to extend a single property type in a union)
    O extends object, // overrides - same types as Base, or omitted
    D extends object, // declare - any types
    I extends {
        [id: string]: TagCreator<any, any>;
    }, // ids - tagCreators
    C extends () => (ChildTags | void | Promise<void>), // constructed()
    S extends string | undefined, // styles (string)
    IP extends {
        [k: string]: string | number | bigint | boolean | /* object | */ undefined;
    } = {}, // iterable - primitives (will be boxed)
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, // Base
    CET extends object = D & O & P & Base & IDS<I>>(this: BaseCreator, _: {
        /** @deprecated */ prototype?: P;
        override?: O;
        declare?: D;
        iterable?: IP;
        ids?: I;
        constructed?: C;
        styles?: S;
    } & ThisType<ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & P & Base>>): ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
}
type TagCreatorArgs<A> = [] | ChildTags[] | [A] | [A, ...ChildTags[]];
export interface TagCreator<Base extends object, Super extends (never | TagCreator<any, any>) = never, TypedBase = ReTypedEventHandlers<Base>> {
    (...args: TagCreatorArgs<PossiblyAsync<TypedBase> & ThisType<TypedBase>>): TypedBase;
    extended: ExtendedTag;
    super: Super;
    overrides?: (<A extends Instance>(a: A) => Overrides);
    readonly name: string;
}
export {};
