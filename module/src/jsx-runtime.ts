import { ChildTags, TagCreator, tag } from "./ai-ui.js"

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
function sterilise<T extends { children?: any}>(attrs:T): Omit<T,'children'> {
   const childless = {...attrs};
   delete childless.children;
   return childless;
}

export const jsx: <K extends keyof HTMLElementTagNameMap | TagCreator<any> | typeof jsx, T extends { children?: ChildNode }>(tagName: K, attrs: T) 
  => (K extends keyof HTMLElementTagNameMap 
    ? HTMLElementTagNameMap[K] 
    : K extends TagCreator<any> 
    ? ReturnType<K> 
    : never
  ) = (tagName, attrs) =>
  tagName === jsx
    ? attrs.children
    : (typeof tagName === 'string' ? (tag()[tagName as keyof HTMLElementTagNameMap]) : (tagName as TagCreator<any>))(sterilise(attrs), attrs.children)

export const jsxs = jsx;
export const Fragment = jsx;

export namespace JSX {
  export interface Element extends HTMLElement { when: Function }
  export type IntrinsicElements = {
    [k in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[k]>
  };

  /*
  export function createElement(
    type: any,
    props?: any,
    ...children: any[]
  ) {
    return jsx(type,{...props,children}) as HTMLElement;
  }
  type Element = HTMLElement;
  */
  // interface Element extends Partial<ReturnType<Tags.TagCreator<HTMLElement>>> {
  // }
}
