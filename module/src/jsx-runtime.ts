import { ChildTags, TagCreator, tag } from "./ai-ui.js"
import { ReTypedEventHandlers } from "./tags.js";

type JSXTagIdentier = TagCreator<any,any> | keyof HTMLElementTagNameMap | PoJSXFactory | JSXFactory /* for fragments */;

/* Support for React.createElement */
type PoJSXFactory =  <
  A extends {},
  T extends JSXTagIdentier,
  Ch extends ChildTags[]
>(tagName: T, attrs: A | null, ...children: Ch)
  => T extends keyof HTMLElementTagNameMap
    ? ReTypedEventHandlers<HTMLElementTagNameMap[T]> // & PoExtraMethods
    : T extends TagCreator<any,any>
      ? ReturnType<T>
      : Ch;

const stdTags = tag();

function isFragment(t: JSXTagIdentier): t is (PoJSXFactory | JSXFactory) {
  return t === jsx || t === PoJSX;
}
function isTagName(t: JSXTagIdentier): t is keyof HTMLElementTagNameMap {
  return typeof t === 'string';
}
function isTagCreator(t: JSXTagIdentier): t is TagCreator<any,any> {
  return typeof t === 'function' && !isFragment(t);
}

export const PoJSX: PoJSXFactory = (tagName, attrs, ...children) => {
  if (isFragment(tagName)) return children;
  if (isTagName(tagName)) {
    const tagFn = stdTags[tagName];
    // @ts-ignore
    return tagFn(attrs, children);
  }
  if (isTagCreator(tagName))
    return tagName(attrs, children);
  throw new Error("Illegal tagName in PoJSX");
}

/* Support for React 17's _jsx(tag,attrs) */
function sterilise<T extends { children?: any}>(attrs:T): Omit<T,'children'> {
   const childless = {...attrs};
   delete childless.children;
   return childless;
}

type JSXFactory = <K extends JSXTagIdentier, T extends { children?: Ch }, Ch extends ChildNode[]>(tagName: K, attrs: T) =>
  T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : T extends TagCreator<any,any>
      ? T
      : Ch;

export const jsx: JSXFactory = (tagName, attrs) => {
  if (isFragment(tagName)) return attrs.children;
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

declare global {
  export namespace JSX {
    export type Element = ReturnType<TagCreator<any, any>>;
    export type IntrinsicElements = {
      [k in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[k]>
    };
  }
}
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
