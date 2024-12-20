import { WhenParameters, WhenReturn } from './when.js';
import type { ChildTags, TagCreator, TagCreatorFunction } from './tags.js';
export { when } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags.js';
export * as Iterators from './iterators.js';
export declare const UniqueID: unique symbol;
type TagFunctionOptions<OtherMembers extends Record<string | symbol, any> = {}> = {
    commonProperties?: OtherMembers;
    document?: Document;
    ErrorTag?: TagCreatorFunction<Element & {
        error: any;
    }>;
    /** @deprecated - legacy support */
    enableOnRemovedFromDOM?: boolean;
};
interface PoElementMethods {
    get ids(): {};
    when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
    set attributes(attrs: object);
    get attributes(): NamedNodeMap;
}
export interface CreateElement {
    createElement(name: TagCreatorFunction<Element> | Node | keyof HTMLElementTagNameMap, attrs: any, ...children: ChildTags[]): Node;
}
export interface TagLoader {
    nodes(...c: ChildTags[]): (Node | ((Element & PoElementMethods)))[];
    UniqueID: typeof UniqueID;
    <Tags extends keyof HTMLElementTagNameMap>(): {
        [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends keyof HTMLElementTagNameMap>(tags: Tags[]): {
        [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(tags: Tags[], options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends string, Q extends {}>(nameSpace: null | undefined | '', tags: Tags[], options?: TagFunctionOptions<Q>): {
        [k in Tags]: TagCreator<Q & PoElementMethods & HTMLElement>;
    } & CreateElement;
    <Tags extends string, Q extends {}>(nameSpace: string, tags: Tags[], options?: TagFunctionOptions<Q>): Record<string, TagCreator<Q & PoElementMethods & Element>> & CreateElement;
}
export declare const tag: TagLoader;
