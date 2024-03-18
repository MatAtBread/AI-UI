import { ChildTags, TagCreator } from "./ai-ui.js";
type AIUIJSXElement<N extends (keyof HTMLElementTagNameMap | typeof AIUIJSX | TagCreator<any, any>), C extends ChildTags[]> = N extends typeof AIUIJSX ? C : N extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[N] : N extends TagCreator<any, any> ? ReturnType<N> : never;
declare function AIUIJSX<T extends {}, N extends (keyof HTMLElementTagNameMap | typeof AIUIJSX | TagCreator<any, any>), C extends ChildTags[]>(tagName: N, attrs: T | null, ...children: C): AIUIJSXElement<N, C>;
declare global {
    namespace JSX {
        type Element = AIUIJSXElement<keyof HTMLElementTagNameMap | TagCreator<any>, ChildTags[]>;
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>;
        };
    }
}
declare const _default: {
    AIUIJSX: typeof AIUIJSX;
};
export default _default;
