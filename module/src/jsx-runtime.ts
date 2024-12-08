import { ChildTags, tag, TagCreatorFunction, CreateElement } from "./ai-ui.js"

/* Support for React.createElement(type, props, ...children) */
const baseTags = tag();

const AIUIJSX = baseTags.createElement;

/* Support for React 17's _jsx(tag,attrs) */
function sterilise<T extends { children?: any }>(attrs: T): Omit<T, 'children'> {
  const childless = { ...attrs };
  delete childless.children;
  return childless;
}

export const jsx = <T extends { children?: ChildTags[] }>(tagName: Parameters<typeof AIUIJSX>[0], attrs: T) =>
  AIUIJSX(tagName, sterilise(attrs), attrs.children);

export const jsxs = jsx;
export const Fragment = AIUIJSX;

declare global {
  var React: unknown; // Stops VSC moaning when using React >=v17 API
  namespace JSX {
    // NB: Element doesn't work. Because the TS JSX transformer doesn't capture the type of the tag or it's children
    // we have to union all the possibilities, which degrades to `any`
    //type Element = AIUIJSXElement<keyof HTMLElementTagNameMap | TagCreatorFunction<any>/* Tag name/function */, ChildTags[]>;
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>
    }
  }
}

export default {
  AIUIJSX
};
