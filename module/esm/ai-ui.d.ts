import { WhenParameters, WhenReturn } from './when.js';
export { when } from './when.js';
type VSCodeEvaluateType<X> = [{
    [K in keyof X]: X[K];
}][0];
export type ChildTags = Node | number | string | boolean | undefined | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> | Array<ChildTags> | Iterable<ChildTags>;
export type Instance<T extends {}> = T;
type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;
export declare function isPromiseLike<T>(x: any): x is PromiseLike<T>;
type Overrides = {
    constructed?: () => (ChildTags | void | Promise<void>);
    ids?: {
        [id: string]: TagCreator<Element>;
    };
    prototype?: object;
    styles?: string;
};
type IDS<I> = VSCodeEvaluateType<{
    ids: {
        [J in keyof I]?: I[J] extends (...a: any[]) => infer R ? R : never;
    };
}>;
type DeepPartial<T extends object> = {
    [K in keyof T]?: T[K] extends object ? T[K] extends Function ? T[K] & DeepPartial<T[K]> : DeepPartial<T[K]> | null : T[K] | null;
};
type PossiblyAsync<X> = {
    [K in keyof X]: X[K] extends AsyncProvider<X[K]> ? X[K] | AsyncGeneratedValue<X[K]> : X[K] | AsyncProvider<X[K]> | (X[K] extends object ? PossiblyAsync<X[K]> : X[K]);
};
type AsyncGeneratedValue<X> = X extends AsyncProvider<infer Value> ? Value : X;
type AsyncGeneratedObject<X extends object> = {
    [K in keyof X]: AsyncGeneratedValue<X[K]>;
};
type CommonKeys<A, B> = keyof A & keyof B;
type OverrideMembers<Override, Base> = Override extends Array<any> ? Override : Omit<Override & Base, CommonKeys<Override, Base>> & {
    [K in CommonKeys<Override, Base>]: Override[K] extends object ? Override[K] extends Function ? Override[K] : Base[K] extends object ? OverrideMembers<Override[K], Base[K]> : Override[K] : Override[K];
};
interface ExtendedTag<Base extends Element, Super> {
    <C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<Element>;
    }, P extends {}, S extends string | undefined, X extends Instance<V>, V, CET extends Element = VSCodeEvaluateType<OverrideMembers<P, Base> & IDS<I>>>(_: ((i: Instance<V>) => {
        constructed?: C;
        ids?: I;
        prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>)): TagCreator<CET, Super> & P;
    <C extends () => (ChildTags | void | Promise<void>), I extends {
        [id: string]: TagCreator<Element>;
    }, P extends {}, S extends string | undefined, CET extends Element = VSCodeEvaluateType<OverrideMembers<P, Base> & IDS<I>>>(_: {
        constructed?: C;
        ids?: I;
        prototype?: P;
        styles?: S;
    } & ThisType<AsyncGeneratedObject<CET>>): TagCreator<CET, Super> & P;
}
export interface TagCreator<Base extends Element, Super = never, CAT = PossiblyAsync<DeepPartial<Base>> & ThisType<Base>> {
    (attrs: CAT): Base & ImplicitElementMethods;
    (attrs: CAT, ...children: ChildTags[]): Base & ImplicitElementMethods;
    (...children: ChildTags[]): Base & ImplicitElementMethods;
    extended: ExtendedTag<Base, TagCreator<Base, Super>>;
    super: TagCreator<Base>;
    overrides: <A extends Instance<unknown>>(a: A) => Overrides | null;
    readonly name: string;
}
type OtherMembers = {};
interface TagLoader {
    /** @deprecated */
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
