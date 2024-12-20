import { WhenParameters, WhenReturn } from './when.js';
import type { ChildTags, TagCreator, TagCreatorFunction } from './tags.js';
export { when } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags.js';
export * as Iterators from './iterators.js';
export declare const UniqueID: unique symbol;
export interface TagFunctionOptions<OtherMembers extends Record<string | symbol, any> = {}> {
    commonProperties?: OtherMembers | undefined;
    document?: Document;
    ErrorTag?: TagCreatorFunction<Element & {
        error: any;
    }>;
    /** @deprecated - legacy support */
    enableOnRemovedFromDOM?: boolean;
}
interface PoElementMethods {
    get ids(): {} & (undefined | ((attrs: object, ...children: ChildTags[]) => ReturnType<TagCreatorFunction<any>>));
    when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
    set attributes(attrs: object);
    get attributes(): NamedNodeMap;
}
type CreateElementNodeType = TagCreatorFunction<any> | Node | keyof HTMLElementTagNameMap;
type CreateElementFragment = CreateElement['createElement'];
export interface CreateElement {
    createElement<N extends (CreateElementNodeType | CreateElementFragment)>(name: N, attrs: any, ...children: ChildTags[]): N extends CreateElementFragment ? Node[] : Node;
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
    <Tags extends keyof HTMLElementTagNameMap, Q extends object>(options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends keyof HTMLElementTagNameMap, Q extends object>(tags: Tags[], options: TagFunctionOptions<Q>): {
        [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]>;
    } & CreateElement;
    <Tags extends string, Q extends object>(nameSpace: null | undefined | '', tags: Tags[], options?: TagFunctionOptions<Q>): {
        [k in Tags]: TagCreator<Q & PoElementMethods & HTMLElement>;
    } & CreateElement;
    <Tags extends string, Q extends object>(nameSpace: string, tags: Tags[], options?: TagFunctionOptions<Q>): Record<string, TagCreator<Q & PoElementMethods & Element>> & CreateElement;
}
export declare const tag: TagLoader;
