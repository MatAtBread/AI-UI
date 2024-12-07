import { ChildTags } from "./ai-ui.js";
declare const AIUIJSX: <N extends (import("./tags.js").TagCreatorFunction<any> | Node | keyof HTMLElementTagNameMap | import("./ai-ui.js").CreateElement["createElement"])>(name: N, attrs: any, ...children: ChildTags[]) => N extends import("./ai-ui.js").CreateElement["createElement"] ? Node[] : Node;
export declare const jsx: <T extends {
    children?: ChildTags[];
}>(tagName: Parameters<typeof AIUIJSX>[0], attrs: T) => Node | Node[];
export declare const jsxs: <T extends {
    children?: ChildTags[];
}>(tagName: Parameters<typeof AIUIJSX>[0], attrs: T) => Node | Node[];
export declare const Fragment: <N extends (import("./tags.js").TagCreatorFunction<any> | Node | keyof HTMLElementTagNameMap | import("./ai-ui.js").CreateElement["createElement"])>(name: N, attrs: any, ...children: ChildTags[]) => N extends import("./ai-ui.js").CreateElement["createElement"] ? Node[] : Node;
declare global {
    var React: unknown;
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>;
        };
    }
}
declare const _default: {
    AIUIJSX: <N extends (import("./tags.js").TagCreatorFunction<any> | Node | keyof HTMLElementTagNameMap | import("./ai-ui.js").CreateElement["createElement"])>(name: N, attrs: any, ...children: ChildTags[]) => N extends import("./ai-ui.js").CreateElement["createElement"] ? Node[] : Node;
};
export default _default;
