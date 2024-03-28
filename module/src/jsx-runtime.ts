import { ChildTags, TagCreatorFunction, tag } from "./ai-ui.js"

/* Support for React.createElement(type, props, ...children) */
const baseTags = tag();

type AIUIJSXTag = any;//(keyof HTMLElementTagNameMap | TagCreatorFunction<Element> | AIUIJSX);

type AIUIJSXElement<
  N extends AIUIJSXTag,
  C extends ChildTags[]
> = any
//  N extends TagCreatorFunction<Element> ? ReturnType<N>
//   : N extends keyof HTMLElementTagNameMap ? ReturnType<TagCreatorFunction<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>>
//   : N extends AIUIJSX ? C
//   : never;

type AIUIJSX = <
  T extends {},
  N extends AIUIJSXTag,
  C extends ChildTags[]
>(tagName: N, attrs: T | null, ...children: C) => AIUIJSXElement<N, C>;

const AIUIJSX: AIUIJSX = (tagName, attrs, ...children) => {
  return tagName === AIUIJSX ? children
    : tagName instanceof Function
    // @ts-ignore
    ? tagName(attrs, ...children)
    // @ts-ignore
    : baseTags[tagName](attrs, ...children)
}

/* Support for React 17's _jsx(tag,attrs) */
function sterilise<T extends { children?: any }>(attrs: T): Omit<T, 'children'> {
  const childless = { ...attrs };
  delete childless.children;
  return childless;
}

export const jsx = <T extends { children?: ChildTags[] }>(tagName: AIUIJSXTag, attrs: T) =>
  AIUIJSX(tagName, sterilise(attrs), attrs.children);

export const jsxs = jsx;
export const Fragment = AIUIJSX;

declare global {
  var React: unknown; // Stops VSC moaning when using React >=v17 API
  namespace JSX {
    // NB: Element doesn't work. Because the TS JSX transformer doesn't capture the type of the tag or it's children
    // we have to union all the possibilities, which degrades to `any`
    type Element = AIUIJSXElement<keyof HTMLElementTagNameMap | TagCreatorFunction<any>/* Tag name/function */, ChildTags[]>;
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>
    }
  }
}

export default {
  AIUIJSX
};
