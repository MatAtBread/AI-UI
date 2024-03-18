import { ChildTags } from "./ai-ui.js";
export declare const PoJSX: <T extends {}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T, ...children: ChildTags[]) => any;
export declare const jsx: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
export declare const jsxs: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
export declare const Fragment: <T extends {
    children?: any;
}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) => any;
declare const _default: {
    PoJSX: <T extends {}>(tagName: Function | keyof HTMLElementTagNameMap, attrs: T, ...children: ChildTags[]) => any;
};
export default _default;
