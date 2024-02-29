import { tag } from "./ai-ui.js";
/* Support for React.createElement */
const tagCreators = {};
export const PoJSX = (tagName, attrs, ...children) => tagName === PoJSX
    ? children
    : (typeof tagName === 'string'
        ? (tagName in tagCreators ? tagCreators : Object.assign(tagCreators, tag([tagName])))[tagName]
        : tagName)(attrs, ...children);
globalThis.PoJSX = PoJSX;
