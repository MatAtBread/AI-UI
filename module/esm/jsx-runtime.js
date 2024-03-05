import { tag } from "./ai-ui.js";
const stdTags = tag();
function isFragment(t) {
    return t === jsx || t === PoJSX;
}
function isTagName(t) {
    return typeof t === 'string';
}
function isTagCreator(t) {
    return typeof t === 'function' && !isFragment(t);
}
export const PoJSX = (tagName, attrs, ...children) => {
    if (isFragment(tagName))
        return children;
    if (isTagName(tagName)) {
        const tagFn = stdTags[tagName];
        // @ts-ignore
        return tagFn(attrs, children);
    }
    if (isTagCreator(tagName))
        return tagName(attrs, children);
    throw new Error("Illegal tagName in PoJSX");
};
/* Support for React 17's _jsx(tag,attrs) */
function sterilise(attrs) {
    const childless = { ...attrs };
    delete childless.children;
    return childless;
}
export const jsx = (tagName, attrs) => {
    if (isFragment(tagName))
        return attrs.children;
    if (isTagName(tagName)) {
        const tagFn = stdTags[tagName];
        // @ts-ignore
        return tagFn(sterilise(attrs), attrs.children);
    }
    if (isTagCreator(tagName))
        return tagName(sterilise(attrs), attrs.children);
    throw new Error("Illegal tagName in PoJSX");
};
export const jsxs = jsx;
export const Fragment = jsx;
/*
export function createElement(
  type: any,
  props?: any,
  ...children: any[]
) {
  return jsx(type,{...props,children}) as HTMLElement;
}
type Element = HTMLElement;
* /
// interface Element extends Partial<ReturnType<Tags.TagCreator<HTMLElement>>> {
// }
}
*/
