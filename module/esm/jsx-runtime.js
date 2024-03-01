import { tag } from "./ai-ui.js";
/* Support for React.createElement */
/*
const tagCreators: { [k in keyof HTMLElementTagNameMap]?: TagCreator<HTMLElementTagNameMap[k]> } = {};

type PoJSXFactory =  <
  A extends {},
  T extends (keyof HTMLElementTagNameMap | Function),
  Ch extends ChildTags[]
>(tagName: T, attrs: A, ...children: Ch)
  => T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : T

export const PoJSX: PoJSXFactory = <T extends {}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T,...children: ChildTags[]) =>
tagName === PoJSX
    ? children
    : (typeof tagName === 'string'
      ? (tagName in tagCreators ? tagCreators : Object.assign(tagCreators,tag([tagName])))[tagName]
      : tagName)! (attrs,...children);
*/
/* Support for React 17's _jsx(tag,attrs) */
function sterilise(attrs) {
    const childless = { ...attrs };
    delete childless.children;
    return childless;
}
export const jsx = (tagName, attrs) => tagName === jsx
    ? attrs.children
    : (typeof tagName === 'string' ? (tag()[tagName]) : tagName)(sterilise(attrs), attrs.children);
export const jsxs = jsx;
export const Fragment = jsx;
