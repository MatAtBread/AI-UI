import { WhenParameters, WhenReturn } from './when.js';
import { ChildTags, TagCreator, UniqueID } from './tags.js';
export { when } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags';
export * as Iterators from './iterators.js';
type OtherMembers = {};
interface PoElementMethods {
    get ids(): {};
    when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
}
interface TagLoader {
    /** @deprecated - Legacy function similar to Element.append/before/after */
    appender(container: Node, before?: Node): (c: ChildTags) => (Node | ((Element & PoElementMethods)))[];
    nodes(...c: ChildTags[]): (Node | ((Element & PoElementMethods)))[];
    UniqueID: typeof UniqueID;
    augmentGlobalAsyncGenerators(): void;
    <Tags extends keyof HTMLElementTagNameMap>(): {
        [k in Lowercase<Tags>]: TagCreator<OtherMembers & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap>(tags: Tags[]): {
        [k in Lowercase<Tags>]: TagCreator<OtherMembers & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(commonProperties: P): {
        [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(tags: Tags[], commonProperties: P): {
        [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends string, P extends (Partial<HTMLElement> & OtherMembers)>(nameSpace: null | undefined | '', tags: Tags[], commonProperties?: P): {
        [k in Tags]: TagCreator<P & PoElementMethods & HTMLUnknownElement>;
    };
    <Tags extends string, P extends (Partial<Element> & OtherMembers)>(nameSpace: string, tags: Tags[], commonProperties?: P): Record<string, TagCreator<P & PoElementMethods & Element>>;
}
export declare const tag: TagLoader;
export declare function augmentGlobalAsyncGenerators(): void;
export declare let enableOnRemovedFromDOM: () => void;
export declare function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>): Record<string, Element>;
