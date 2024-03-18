import { tag } from "./ai-ui.js";
/* Support for React.createElement */
const tagCreators = {};
export const PoJSX = (tagName, attrs, ...children) => tagName === PoJSX
    ? children
    : (typeof tagName === 'string'
        ? (tagName in tagCreators ? tagCreators : Object.assign(tagCreators, tag([tagName])))[tagName]
        : tagName)(attrs, ...children);
/* Support for React 17's _jsx(tag,attrs) */
function sterilise(attrs) {
    const childless = { ...attrs };
    delete childless.children;
    return childless;
}
export const jsx = (tagName, attrs) => tagName === jsx
    ? attrs.children
    : (typeof tagName === 'string' ? tag([tagName])[tagName] : tagName)(sterilise(attrs), attrs.children);
export const jsxs = jsx;
export const Fragment = jsx;
export default {
    PoJSX
};
