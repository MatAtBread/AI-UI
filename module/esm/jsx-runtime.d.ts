import { TagCreator } from "./ai-ui.js";
export declare const jsx: <K extends keyof HTMLElementTagNameMap | TagCreator<any> | typeof jsx, T extends {
    children?: ChildNode;
}>(tagName: K, attrs: T) => (K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : K extends TagCreator<any> ? ReturnType<K> : never);
export declare const jsxs: <K extends keyof HTMLElementTagNameMap | TagCreator<any> | any, T extends {
    children?: ChildNode | undefined;
}>(tagName: K, attrs: T) => K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : K extends TagCreator<any> ? ReturnType<K> : never;
export declare const Fragment: <K extends keyof HTMLElementTagNameMap | TagCreator<any> | any, T extends {
    children?: ChildNode | undefined;
}>(tagName: K, attrs: T) => K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : K extends TagCreator<any> ? ReturnType<K> : never;
export declare namespace JSX {
    interface Element extends HTMLElement {
        when: Function;
    }
    type IntrinsicElements = {
        [k in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[k]>;
    };
}
