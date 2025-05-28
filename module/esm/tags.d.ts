import type { AsyncProvider, Ignore, IterableProperties, IterablePropertyPrimitive, IterablePropertyValue } from "./iterators.js";
import type { UniqueID } from "./ai-ui.js";
export type ChildTags = Node | number | string | boolean | undefined | typeof Ignore | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
type DeepPartial<X> = [X] extends [{}] ? {
    [K in keyof X]?: DeepPartial<X[K]>;
} : X;
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
type CheckPropertyClashes<BaseCreator extends ExTagCreator<any>, D extends Overrides, Result = never> = (OverlappingKeys<D['override'], D['declare']> | OverlappingKeys<D['iterable'], D['declare']> | OverlappingKeys<D['iterable'], D['override']> | OverlappingKeys<D['iterable'], Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>> | OverlappingKeys<D['declare'], TagCreatorAttributes<BaseCreator>>) extends never ? ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> extends never ? Result : {
    '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>>;
} : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D['declare'], TagCreatorAttributes<BaseCreator>>;
    '`iterable` clashes with base properties': OverlappingKeys<D['iterable'], Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>>;
    '`iterable` clashes with `override`': OverlappingKeys<D['iterable'], D['override']>;
    '`iterable` clashes with `declare`': OverlappingKeys<D['iterable'], D['declare']>;
    '`override` clashes with `declare`': OverlappingKeys<D['override'], D['declare']>;
}, never>;
export type Overrides = {
    override?: object;
    declare?: object;
    iterable?: {
        [k: string]: IterablePropertyValue;
    };
    ids?: {
        [id: string]: TagCreatorFunction<any>;
    };
    styles?: string;
};
interface TagCreatorForIDS<I extends NonNullable<Overrides['ids']>> {
    <const K extends keyof I>(attrs: {
        id: K;
    } & Exclude<Parameters<I[K]>[0], ChildTags>, ...children: ChildTags[]): ReturnType<I[K]>;
}
type IDS<I extends Overrides['ids']> = I extends NonNullable<Overrides['ids']> ? {
    ids: {
        [J in keyof I]: ReturnType<I[J]>;
    } & TagCreatorForIDS<I>;
} : {
    ids: {};
};
export type Constructed = {
    constructed: () => (ChildTags | void | PromiseLike<void | ChildTags>);
};
export type TagCreatorAttributes<T extends ExTagCreator<any>> = T extends ExTagCreator<infer BaseAttrs> ? BaseAttrs : never;
type BaseIterables<Base> = Base extends ExTagCreator<infer _Base, infer Super, infer SuperDefs extends Overrides, infer _Statics> ? BaseIterables<Super> extends never ? SuperDefs['iterable'] extends object ? SuperDefs['iterable'] : {} : BaseIterables<Super> & SuperDefs['iterable'] : never;
type CombinedNonIterableProperties<D extends Overrides, Base extends ExTagCreator<any>> = D['declare'] & D['override'] & IDS<D['ids']> & Omit<TagCreatorAttributes<Base>, keyof D['iterable']>;
type CombinedIterableProperties<D extends Overrides, Base extends ExTagCreator<any>> = BaseIterables<Base> & D['iterable'];
export declare const callStackSymbol: unique symbol;
export interface ConstructorCallStack extends TagCreationOptions {
    [callStackSymbol]?: Overrides[];
    [k: string]: unknown;
}
export interface ExtendTagFunction {
    (attrs: ConstructorCallStack | ChildTags, ...children: ChildTags[]): Element;
}
interface InstanceUniqueID {
    [UniqueID]: string;
}
export type Instance<T = InstanceUniqueID> = InstanceUniqueID & T;
export interface ExtendTagFunctionInstance extends ExtendTagFunction {
    super: TagCreator<Element>;
    definition: Overrides;
    valueOf: () => string;
    extended: (this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) => ExtendTagFunctionInstance;
}
interface TagConstuctor {
    constructor: ExtendTagFunctionInstance;
}
type CombinedThisType<D extends Overrides, Base extends ExTagCreator<any>> = TagConstuctor & ReadWriteAttributes<IterableProperties<CombinedIterableProperties<D, Base>> & CombinedNonIterableProperties<D, Base>, D['declare'] & D['override'] & CombinedIterableProperties<D, Base> & Omit<TagCreatorAttributes<Base>, keyof CombinedIterableProperties<D, Base>>>;
type StaticReferences<Definitions extends Overrides, Base extends ExTagCreator<any>> = PickType<Definitions['declare'] & Definitions['override'] & TagCreatorAttributes<Base>, any>;
interface ExtendedTag {
    <BaseCreator extends ExTagCreator<any>, SuppliedDefinitions, Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {}, TagInstance extends InstanceUniqueID = InstanceUniqueID>(this: BaseCreator, _: (inst: TagInstance) => SuppliedDefinitions & ThisType<CombinedThisType<Definitions, BaseCreator>>): CheckConstructedReturn<SuppliedDefinitions, CheckPropertyClashes<BaseCreator, Definitions, ExTagCreator<IterableProperties<CombinedIterableProperties<Definitions, BaseCreator>> & CombinedNonIterableProperties<Definitions, BaseCreator>, BaseCreator, Definitions, StaticReferences<Definitions, BaseCreator>>>>;
    <BaseCreator extends ExTagCreator<any>, SuppliedDefinitions, Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {}>(this: BaseCreator, _: SuppliedDefinitions & ThisType<CombinedThisType<Definitions, BaseCreator>>): CheckConstructedReturn<SuppliedDefinitions, CheckPropertyClashes<BaseCreator, Definitions, ExTagCreator<IterableProperties<CombinedIterableProperties<Definitions, BaseCreator>> & CombinedNonIterableProperties<Definitions, BaseCreator>, BaseCreator, Definitions, StaticReferences<Definitions, BaseCreator>>>>;
}
type CheckIsIterablePropertyValue<T, Prefix extends string = ''> = {
    [K in keyof T]: Exclude<T[K], undefined> extends IterablePropertyPrimitive ? never : Exclude<T[K], undefined> extends Function ? {
        [P in `${Prefix}${K & string}`]: Exclude<T[K], undefined>;
    } : Exclude<T[K], undefined> extends object ? Exclude<T[K], undefined> extends Array<infer Z> ? Z extends IterablePropertyValue ? never : {
        [P in `${Prefix}${K & string}`]: Exclude<Z[], undefined>;
    } : CheckIsIterablePropertyValue<Exclude<T[K], undefined>, `${Prefix}${K & string}.`> : {
        [P in `${Prefix}${K & string}`]: Exclude<T[K], undefined>;
    };
}[keyof T] extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type CheckConstructedReturn<SuppliedDefinitions, Result> = SuppliedDefinitions extends {
    constructed: any;
} ? SuppliedDefinitions extends Constructed ? Result : {
    "constructed` does not return ChildTags": SuppliedDefinitions['constructed'];
} : ExcessKeys<SuppliedDefinitions, Overrides & Constructed> extends never ? Result : SuppliedDefinitions extends {
    iterable: any;
} ? {
    "The extended tag defintion contains non-iterable types": Exclude<CheckIsIterablePropertyValue<SuppliedDefinitions['iterable']>, undefined>;
} : {
    "The extended tag defintion contains unknown or incorrectly typed keys": keyof ExcessKeys<SuppliedDefinitions, Overrides & Constructed>;
};
export interface TagCreationOptions {
    debugger?: boolean;
}
type ReTypedEventHandlers<T> = {
    [K in keyof T]: K extends keyof GlobalEventHandlers ? Exclude<GlobalEventHandlers[K], null> extends (e: infer E) => infer R ? ((e: E) => R) | null : T[K] : T[K];
};
type AsyncAttr<X> = AsyncProvider<X> | PromiseLike<AsyncProvider<X> | X>;
type PossiblyAsync<X> = [X] extends [object] ? X extends AsyncProvider<infer U> ? X extends (AsyncProvider<U> & U) ? U | AsyncAttr<U> : X | PromiseLike<X> : X extends (any[] | Function) ? X | AsyncAttr<X> : {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} | Partial<X> | AsyncAttr<Partial<X>> : X | AsyncAttr<X>;
type ReadWriteAttributes<E, Base = E> = E extends {
    attributes: any;
} ? (Omit<E, 'attributes'> & {
    get attributes(): NamedNodeMap;
    set attributes(v: PossiblyAsync<Omit<Base, 'attributes'>>);
}) : (Omit<E, 'attributes'>);
export type TagCreatorArgs<A> = [] | [A & TagCreationOptions] | [A & TagCreationOptions, ...ChildTags[]] | ChildTags[];
export type TagCreatorFunction<Base extends object> = (...args: TagCreatorArgs<PossiblyAsync<Base> & ThisType<Base>>) => ReadWriteAttributes<Base>;
type ExTagCreator<Base extends object, Super extends (unknown | ExTagCreator<any>) = unknown, SuperDefs extends Overrides = {}, Statics = {}> = TagCreatorFunction<ReTypedEventHandlers<Base>> & {
    extended: ExtendedTag;
    super: Super;
    definition?: Overrides & InstanceUniqueID;
    readonly name: string;
    [Symbol.hasInstance](elt: any): boolean;
} & InstanceUniqueID & Statics;
export type TagCreator<Base extends object> = ExTagCreator<Base, never, never, {}>;
export {};
