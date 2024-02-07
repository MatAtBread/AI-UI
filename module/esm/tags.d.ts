import { AsyncExtraIterable, AsyncProvider } from "./iterators";
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
export type PossiblyAsync<X> = [X] extends [object] ? X extends AsyncProvider<infer U> ? PossiblyAsync<U> : X extends Function ? X | AsyncProvider<X> : AsyncProvider<Partial<X>> | {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} : X | AsyncProvider<X> | undefined;
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
type Flatten<O> = [
    {
        [K in keyof O]: O[K];
    }
][number];
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
type ExcessKeys<A extends RootObj, B extends RootObj> = A extends any[] ? B extends any[] ? ExcessKeys<A[number], B[number]> : _Not_Array_ : B extends any[] ? _Not_Array_ : NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B ? A[K] extends Partial<B[K]> ? never : B[K] : _Not_Declared_;
}, never>>;
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
type ExtensionDefinition<// Combined Effective Type of this extended tag
CTT, // styles (string)
P extends RootObj, // prototype (deprecated, but can be used to extend a single property type in a union)
O extends RootObj, // overrides - same types as Base, or omitted
D extends RootObj, // ids - tagCreators
IP extends {
    [k: string]: string | number | bigint | boolean | /* object | */ undefined;
}, // declare - any types
I extends {
    [idExt: string]: TagCreator<any, any>;
}, C extends () => (ChildTags | void | Promise<void | ChildTags>), // constructed()
S extends string | undefined> = ThisType<CTT> & {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
};
interface ExtendedTag {
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void | ChildTags>), S extends string | undefined, P extends RootObj = {}, O extends RootObj = {}, D extends RootObj = {}, I extends {
        [idExt: string]: TagCreator<any, any>;
    } = {}, IP extends {
        [k: string]: string | number | bigint | boolean | /* object | */ undefined;
    } = {}, Base extends RootObj = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends RootObj = Flatten<D & O & IDS<I>> & MergeBaseTypes<P & O, Base>, CTT = ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & MergeBaseTypes<P, Base>>>(this: BaseCreator, _: ExtensionDefinition<CTT, P, O, D, IP, I, C, S> | ((instance: any) => ExtensionDefinition<CTT, P, O, D, IP, I, C, S>)): ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
}
export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
export interface TagCreator<Base extends RootObj, Super extends (never | TagCreator<any, any>) = never, TypedBase = ReTypedEventHandlers<Base>> {
    (...args: TagCreatorArgs<PossiblyAsync<TypedBase> & ThisType<TypedBase>>): TypedBase;
    extended: ExtendedTag;
    super: Super;
    overrides?: (<A extends Instance>(a: A) => Overrides);
    readonly name: string;
}
export {};
