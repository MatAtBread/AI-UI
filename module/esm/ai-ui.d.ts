import { WhenParameters, WhenReturn } from './when.js';
export { when } from './when.js';
export * as Iterators from './iterators.js';
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
export type Instance<T extends {} = Record<string, unknown>> = T;
type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
type PossiblyAsync<X> = [X] extends [object] ? X extends AsyncProvider<infer U> ? PossiblyAsync<U> : AsyncProvider<Partial<X>> | {
    [K in keyof X]?: PossiblyAsync<X[K]>;
} : X | AsyncProvider<X> | undefined;
type AsyncGeneratedValue<X> = X extends AsyncProvider<infer Value> ? Value : X;
type AsyncGeneratedObject<X extends object> = {
    [K in keyof X]: AsyncGeneratedValue<X[K]>;
};
type Overrides = {
    constructed?: () => (ChildTags | void | Promise<void>);
    ids?: {
        [id: string]: TagCreator<Element>;
    };
    prototype?: object;
    styles?: string;
};
type IDS<I> = {
    ids: {
        [J in keyof I]?: I[J] extends (...a: any[]) => infer R ? R : never;
    };
};
type CommonKeys<A, B> = keyof A & keyof B;
type OverrideMembers<Override extends object, Base extends object> = Omit<Override & Base, CommonKeys<Override, Base>> & {
    [K in CommonKeys<Override, Base>]: Override[K] | Base[K];
};
type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;
type ExtendedTag<Base extends object, Super> = {
    <C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<Element>;
    }, P extends {}, S extends string | undefined, X extends Instance<V>, V extends {}, CET extends object = VSCodeEvaluateType<OverrideMembers<P, Base> & IDS<I>>>(_: ((i: Instance<V>) => {
        constructed?: C;
        ids?: I;
        prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>)): TagCreator<CET, Super> & StaticMembers<P, Base>;
    <C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<Element>;
    }, P extends {}, S extends string | undefined, CET extends object = VSCodeEvaluateType<OverrideMembers<P, Base> & IDS<I>>>(_: {
        constructed?: C;
        ids?: I;
        prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, Super> & StaticMembers<P, Base>;
};
type TagCreatorArgs<A> = [] | ChildTags[] | [A] | [A, ...ChildTags[]];
export type TagCreator<Base extends object, Super = never, CAT = PossiblyAsync<Base> & ThisType<Base>> = {
    (...args: TagCreatorArgs<CAT>): VSCodeEvaluateType<Base & ImplicitElementMethods>;
    extended: ExtendedTag<Base, TagCreator<Base, Super>>;
    super: TagCreator<Base>;
    overrides?: (<A extends Instance>(a: A) => Overrides);
    readonly name: string;
};
type VSCodeEvaluateType<X> = X extends Function ? X : [{
    [K in keyof X]: X[K];
}][0];
type OtherMembers = {};
interface TagLoader {
    /** @deprecated - Legacy function similar to Element.append/before/after */
    appender(container: Node, before?: Node): (c: ChildTags) => (Node | ((Element & PoElementMethods)))[];
    nodes(...c: ChildTags[]): (Node | ((Element & PoElementMethods)))[];
    <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(prototypes?: P): {
        [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(tags: Tags[], prototypes?: P): {
        [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends string, P extends (Partial<HTMLElement> & OtherMembers)>(nameSpace: null | undefined | '', tags: Tags[], prototypes?: P): {
        [k in Tags]: TagCreator<P & PoElementMethods & HTMLUnknownElement>;
    };
    <Tags extends string, P extends (Partial<Element> & OtherMembers)>(nameSpace: string, tags: Tags[], prototypes?: P): Record<string, TagCreator<P & PoElementMethods & Element>>;
}
interface PoElementMethods {
    get ids(): Record<string, Element | undefined>;
    when<S extends WhenParameters>(...what: S): WhenReturn<S>;
}
interface ImplicitElementMethods {
    constructor: TagCreator<Element>;
}
export declare const tag: TagLoader;
export declare let enableOnRemovedFromDOM: () => void;
export declare function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>): Record<string, Element>;
