import { ChildTags, TagCreatorFunction } from "./ai-ui.js";
type AIUIJSXTag = any;
type AIUIJSXElement<N extends AIUIJSXTag, C extends ChildTags[]> = any;
type AIUIJSX = <T extends {}, N extends AIUIJSXTag, C extends ChildTags[]>(tagName: N, attrs: T | null, ...children: C) => AIUIJSXElement<N, C>;
declare const AIUIJSX: AIUIJSX;
export declare const jsx: <T extends {
    children?: ChildTags[] | undefined;
}>(tagName: AIUIJSXTag, attrs: T) => any;
export declare const jsxs: <T extends {
    children?: ChildTags[] | undefined;
}>(tagName: AIUIJSXTag, attrs: T) => any;
export declare const Fragment: AIUIJSX;
declare global {
    var React: unknown;
    namespace JSX {
        type Element = AIUIJSXElement<keyof HTMLElementTagNameMap | TagCreatorFunction<any>, ChildTags[]>;
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>;
        };
    }
}
declare const _default: {
    AIUIJSX: AIUIJSX;
};
export default _default;
