import { tag } from "./ai-ui.js";
/* Support for React.createElement */
const tagCreators = tag();
function AIUIJSX(tagName, attrs, ...children) {
    return (tagName === AIUIJSX ? children
        : typeof tagName === 'string'
            ? tagCreators[tagName]?.(attrs, ...children)
            : tagName(attrs, ...children));
}
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
