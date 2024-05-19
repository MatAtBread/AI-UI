import { WhenParameters, WhenReturn } from './when.js';
import { ChildTags, TagCreator, UniqueID } from './tags.js';
export { when } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags.js';
export * as Iterators from './iterators.js';
type TagFunctionOptions<OtherMembers extends {} = {}> = {
    commonProperties: OtherMembers;
};
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
        [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap>(tags: Tags[]): {
        [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(tags: Tags[], options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    };
    <Tags extends string, Q extends {}>(nameSpace: null | undefined | '', tags: Tags[], options?: TagFunctionOptions<Q>): {
        [k in Tags]: TagCreator<Q & PoElementMethods & HTMLElement>;
    };
    <Tags extends string, Q extends {}>(nameSpace: string, tags: Tags[], options?: TagFunctionOptions<Q>): Record<string, TagCreator<Q & PoElementMethods & Element>>;
}
export declare const tag: TagLoader;
export declare function augmentGlobalAsyncGenerators(): void;
export declare let enableOnRemovedFromDOM: () => void;
export declare function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>): Record<string, Element>;
