import { WhenParameters, WhenReturn } from './when.js';
import { ChildTags, TagCreator } from './tags';
export { when } from './when.js';
export { ChildTags, Instance } from './tags';
export * as Iterators from './iterators.js';
type OtherMembers = {};
interface PoElementMethods {
    get ids(): Record<string, Element | undefined>;
    when<S extends WhenParameters>(...what: S): WhenReturn<S>;
}
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
export declare const tag: TagLoader;
export declare let enableOnRemovedFromDOM: () => void;
export declare function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>): Record<string, Element>;
