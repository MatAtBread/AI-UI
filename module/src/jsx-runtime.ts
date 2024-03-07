import { ChildTags, TagCreator, tag } from "./ai-ui.js"

/* Support for React.createElement */
const tagCreators: { [k in keyof HTMLElementTagNameMap]?: TagCreator<HTMLElementTagNameMap[k]> } = {};

export const PoJSX = <T extends {}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T,...children: ChildTags[]) =>
tagName === PoJSX
    ? children
    : (typeof tagName === 'string'
      ? (tagName in tagCreators ? tagCreators : Object.assign(tagCreators,tag([tagName])))[tagName]
      : tagName)! (attrs,...children);

/* Support for React 17's _jsx(tag,attrs) */
function sterilise<T extends { children?: any}>(attrs:T): Omit<T,'children'> {
   const childless = {...attrs};
   delete childless.children;
   return childless;
}

export const jsx = <T extends { children?: any}>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) =>
  tagName === jsx
    ? attrs.children
    : (typeof tagName === 'string' ? tag([tagName])[tagName] : tagName)(sterilise(attrs), attrs.children)

export const jsxs = jsx;
export const Fragment = jsx;

/*declare global {
  const PoJSX;
  var React; // Doesn't really exist, just declated to suppress a VSCode/tsc warning
}
(globalThis as any).PoJSX = PoJSX;
*/