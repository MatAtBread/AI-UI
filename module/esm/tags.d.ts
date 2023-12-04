import { AsyncExtraIterable } from "./iterators";
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
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
type UntypedEventHandlers = {
    [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) ? null | ((event: E) => R) : GlobalEventHandlers[K];
};
type TypedEventHandlers<T> = {
    [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) ? null | ((this: T, event: E) => R) : GlobalEventHandlers[K];
};
type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers) ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T> : T;
type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;
type BasedOn<P, Base> = Partial<UntypedEventHandlers> & {
    [K in keyof P]: K extends keyof Base ? Partial<Base[K]> | P[K] : P[K];
};
type IterableProperties<IP> = {
    [K in keyof IP]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>;
};
type ExcessKeys<A, B> = keyof A extends (keyof A & keyof B) ? never : Exclude<keyof A, keyof B>;
type ExtendedReturn<BaseCreator extends TagCreator<any, any, any>, P, O, D, IP, Base, CET extends object> = (keyof O & keyof D) extends never ? (keyof IP & keyof O) extends never ? (keyof IP & keyof D) extends never ? (keyof IP & keyof Base) extends never ? (keyof D & keyof Base) extends never ? ExcessKeys<O, Base> extends never ? TagCreator<CET & IterableProperties<IP>, BaseCreator> & StaticMembers<P & O & D, Base> : {
    '`override` has excess properties not in the base tag': ExcessKeys<O, Base>;
} : {
    '`declare` clashes with base properties': (keyof D & keyof Base);
} : {
    '`iterable` clashes with base properties': keyof IP & keyof Base;
} : {
    '`iterable` clashes with `declare`': keyof IP & keyof D;
} : {
    '`iterable` clashes with `override`': keyof IP & keyof O;
} : {
    '`override` clashes with `declare`': keyof O & keyof D;
};
interface ExtendedTag {
    <BaseCreator extends TagCreator<any, any>, P extends BasedOn<P, Base>, O extends BasedOn<O, Base>, D extends object, I extends {
        [id: string]: TagCreator<any, any>;
    }, C extends () => (ChildTags | void | Promise<void>), S extends string | undefined, IP extends object = {}, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = D & O & P & Base & IDS<I>>(this: BaseCreator, _: (instance: any) => {
        /** @deprecated */ prototype?: P;
        override?: O;
        declare?: D;
        iterable?: IP;
        ids?: I;
        constructed?: C;
        styles?: S;
    } & ThisType<IterableProperties<IP> & AsyncGeneratedObject<CET>>): ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
    <BaseCreator extends TagCreator<any, any>, P extends BasedOn<P, Base>, O extends BasedOn<O, Base>, D extends object, I extends {
        [id: string]: TagCreator<any, any>;
    }, C extends () => (ChildTags | void | Promise<void>), S extends string | undefined, IP extends object = {}, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = D & P & Base & IDS<I>>(this: BaseCreator, _: {
        /** @deprecated */ prototype?: P;
        override?: O;
        declare?: D;
        iterable?: IP;
        ids?: I;
        constructed?: C;
        styles?: S;
    } & ThisType<IterableProperties<IP> & AsyncGeneratedObject<CET>>): ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
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
