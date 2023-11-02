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
    constructed?: () => (ChildTags | void | Promise<void>);
    ids?: {
        [id: string]: TagCreator<any, any>;
    };
    prototype?: object;
    override?: object;
    define?: object;
    styles?: string;
};
type TypedEventHandlers<T> = {
    [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) ? (this: T, event: Omit<E, 'currentTarget'> & {
        currentTarget: T;
    }) => R : never;
};
type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers) ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T> : T;
type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;
type UntypedGlobalEventHandlers = {
    [K in keyof GlobalEventHandlers]: (e: Parameters<Exclude<GlobalEventHandlers[K], null | undefined>>[0]) => void;
};
type DeepPartial<O> = {
    [K in keyof O]?: O[K] extends object ? O[K] | DeepPartial<O[K]> : O[K];
};
type BasedOn<P, Base> = Partial<UntypedGlobalEventHandlers> & {
    [K in keyof P]: K extends keyof Base ? Partial<Base[K]> : P[K];
};
/** @deprecated */ interface LegacyExtendedTag {
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<any, any>;
    }, P extends BasedOn<P, Base>, S extends string | undefined, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = P & Base & IDS<I>>(this: BaseCreator, _: (instance: any) => {
        constructed?: C;
        ids?: I;
        /** @deprecated */ prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, BaseCreator> & StaticMembers<P, Base>;
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<any, any>;
    }, P extends BasedOn<P, Base>, S extends string | undefined, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = P & Base & IDS<I>>(this: BaseCreator, _: {
        constructed?: C;
        ids?: I;
        /** @deprecated */ prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, BaseCreator> & StaticMembers<P, Base>;
}
interface ExtendedTag extends LegacyExtendedTag {
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<any, any>;
    }, O extends Partial<UntypedGlobalEventHandlers> & Omit<DeepPartial<Base>, keyof GlobalEventHandlers>, D extends {
        [K in keyof D]: K extends keyof Base ? never : D[K];
    }, S extends string | undefined, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = D & Base & IDS<I>>(this: BaseCreator, _: (instance: any) => {
        constructed?: C;
        ids?: I;
        override?: O;
        define?: D;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, BaseCreator> & StaticMembers<D, Base>;
    <BaseCreator extends TagCreator<any, any>, C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<any, any>;
    }, O extends Partial<UntypedGlobalEventHandlers> & Omit<DeepPartial<Base>, keyof GlobalEventHandlers>, D extends {
        [K in keyof D]: K extends keyof Base ? never : D[K];
    }, S extends string | undefined, Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, CET extends object = D & Base & IDS<I>>(this: BaseCreator, _: {
        constructed?: C;
        ids?: I;
        override?: O;
        define?: D;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, BaseCreator> & StaticMembers<D, Base>;
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
