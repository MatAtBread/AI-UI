import { tag } from "./ai-ui.js";
/* Support for React.createElement(type, props, ...children) */
const baseTags = tag();
const AIUIJSX = (tagName, attrs, ...children) => {
    return tagName === AIUIJSX ? children
        : tagName instanceof Function
            // @ts-ignore
            ? tagName(attrs, ...children)
            // @ts-ignore
            : baseTags[tagName](attrs, ...children);
};
/* Support for React 17's _jsx(tag,attrs) */
function sterilise(attrs) {
    const childless = { ...attrs };
    delete childless.children;
    return childless;
}
export const jsx = (tagName, attrs) => AIUIJSX(tagName, sterilise(attrs), attrs.children);
export const jsxs = jsx;
export const Fragment = AIUIJSX;
export default {
    AIUIJSX
};
