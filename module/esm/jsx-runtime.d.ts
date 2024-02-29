import { ChildTags } from "./ai-ui.js";
type PoJSXFactory = <A extends {}, T extends (keyof HTMLElementTagNameMap | Function), Ch extends ChildTags[]>(tagName: T, attrs: A, ...children: Ch) => T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Ch;
export declare const PoJSX: PoJSXFactory;
export declare const jsx: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
export declare const jsxs: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
export declare const Fragment: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
declare global {
    const PoJSX: PoJSXFactory;
    var React: PoJSXFactory;
}
export {};
