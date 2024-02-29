import { ChildTags } from "./ai-ui.js";
type PoJSXFactory = <A extends {}, T extends (keyof HTMLElementTagNameMap | Function), Ch extends ChildTags[]>(tagName: T, attrs: A, ...children: Ch) => T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T;
export declare const PoJSX: PoJSXFactory;
declare global {
    const PoJSX: PoJSXFactory;
}
export {};
