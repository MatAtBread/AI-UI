import { ChildTags, TagCreator } from "./ai-ui.js";
import { ReTypedEventHandlers } from "./tags.js";
type JSXTagIdentier = TagCreator<any, any> | keyof HTMLElementTagNameMap | PoJSXFactory | JSXFactory;
type PoJSXFactory = <A extends {}, T extends JSXTagIdentier, Ch extends ChildTags[]>(tagName: T, attrs: A | null, ...children: Ch) => T extends keyof HTMLElementTagNameMap ? ReTypedEventHandlers<HTMLElementTagNameMap[T]> : T extends TagCreator<any, any> ? ReturnType<T> : Ch;
export declare const PoJSX: PoJSXFactory;
type JSXFactory = <K extends JSXTagIdentier, T extends {
    children?: Ch;
}, Ch extends ChildNode[]>(tagName: K, attrs: T) => T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T extends TagCreator<any, any> ? T : Ch;
export declare const jsx: JSXFactory;
export declare const jsxs: JSXFactory;
export declare const Fragment: JSXFactory;
declare global {
    export namespace JSX {
        type Element = ReturnType<TagCreator<any, any>>;
        type IntrinsicElements = {
            [k in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[k]>;
        };
    }
}
export {};
