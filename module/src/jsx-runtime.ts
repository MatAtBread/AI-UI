import { ChildTags, TagCreator, tag } from "./ai-ui.js"

/* Support for React.createElement */
const tagCreators = tag();

type AIUIJSXElement<
  N extends (keyof HTMLElementTagNameMap | typeof AIUIJSX | TagCreator<any,any>),
  C extends ChildTags[]
> = N extends typeof AIUIJSX ? C
: N extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[N]
: N extends TagCreator<any,any> ? ReturnType<N>
: never;

function AIUIJSX<
  T extends {},
  N extends (keyof HTMLElementTagNameMap | typeof AIUIJSX | TagCreator<any,any>),
  C extends ChildTags[]
>(tagName: N, attrs: T | null, ...children: C): AIUIJSXElement<N,C> {
  return (tagName === AIUIJSX ? children
    : typeof tagName === 'string'
      ? (tagCreators[tagName as keyof HTMLElementTagNameMap] as any)?.(attrs, ...children)
      : (tagName as TagCreator<any,any>)(attrs, ...children))
}

/* Support for React 17's _jsx(tag,attrs) *
function sterilise<T extends { children?: any }>(attrs: T): Omit<T, 'children'> {
  const childless = { ...attrs };
  delete childless.children;
  return childless;
}

export const jsx = <T extends { children?: any }>(tagName: keyof HTMLElementTagNameMap | Function, attrs: T) =>
  tagName === jsx
    ? attrs.children
    : (typeof tagName === 'string' ? tag([tagName])[tagName] : tagName)(sterilise(attrs), attrs.children)

export const jsxs = jsx;
export const Fragment = jsx;
*/

declare global {
  namespace JSX {
    type Element = AIUIJSXElement<any,any>;
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>
    }
  }
}

export default {
  AIUIJSX
};
