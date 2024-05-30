import { ChildTags } from "./ai-ui.js";
declare const AIUIJSX: (name: Node | keyof HTMLElementTagNameMap | import("./tags.js").TagCreatorFunction<Element>, attrs: any, ...children: ChildTags[]) => Node;
export declare const jsx: <T extends {
    children?: ChildTags[] | undefined;
}>(tagName: Parameters<typeof AIUIJSX>[0], attrs: T) => Node;
export declare const jsxs: <T extends {
    children?: ChildTags[] | undefined;
}>(tagName: Parameters<typeof AIUIJSX>[0], attrs: T) => Node;
export declare const Fragment: (name: Node | keyof HTMLElementTagNameMap | import("./tags.js").TagCreatorFunction<Element>, attrs: any, ...children: ChildTags[]) => Node;
declare global {
    var React: unknown;
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>;
        };
    }
}
declare const _default: {
    AIUIJSX: (name: Node | keyof HTMLElementTagNameMap | import("./tags.js").TagCreatorFunction<Element>, attrs: any, ...children: ChildTags[]) => Node;
};
export default _default;
