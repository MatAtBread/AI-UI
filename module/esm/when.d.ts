import { AsyncExtraIterable } from "./iterators.js";
export type WhenParameters<IDS extends string = string> = ReadonlyArray<AsyncIterable<any> | ValidWhenSelector<IDS> | Element | Promise<any>>;
type WhenIteratedType<S extends WhenParameters> = (Extract<S[number], AsyncIterable<any>> extends AsyncIterable<infer I> ? unknown extends I ? never : I : never) | ExtractEvents<Extract<S[number], string>> | (Extract<S[number], Element> extends never ? never : Event);
type MappableIterable<A extends AsyncIterable<any>> = A extends AsyncIterable<infer T> ? A & AsyncExtraIterable<T> & (<R>(mapper: (value: A extends AsyncIterable<infer T> ? T : never) => R) => (AsyncExtraIterable<Awaited<R>>)) : never;
export type WhenReturn<S extends WhenParameters> = MappableIterable<AsyncExtraIterable<WhenIteratedType<S>>>;
type SpecialWhenEvents = {
    "@start": {};
    "@ready": {};
};
type WhenEvents = GlobalEventHandlersEventMap & SpecialWhenEvents;
type EventNameList<T extends string> = T extends keyof WhenEvents ? T : T extends `${infer S extends keyof WhenEvents},${infer R}` ? EventNameList<R> extends never ? never : `${S},${EventNameList<R>}` : never;
type EventNameUnion<T extends string> = T extends keyof WhenEvents ? T : T extends `${infer S extends keyof WhenEvents},${infer R}` ? EventNameList<R> extends never ? never : S | EventNameList<R> : never;
type EventAttribute = `${keyof GlobalEventHandlersEventMap}`;
type CSSIdentifier<IDS extends string = string> = `#${IDS}` | `.${string}` | `[${string}]`;
export type ValidWhenSelector<IDS extends string = string> = `${keyof SpecialWhenEvents}` | `${EventAttribute}:${CSSIdentifier<IDS>}` | EventAttribute | CSSIdentifier<IDS>;
type ExtractEventNames<S> = S extends keyof SpecialWhenEvents ? S : S extends `${infer V}:${infer L extends CSSIdentifier}` ? EventNameUnion<V> extends never ? never : EventNameUnion<V> : S extends `${infer L extends CSSIdentifier}` ? 'change' : never;
type ExtractEvents<S> = WhenEvents[ExtractEventNames<S>];
export declare function when<S extends WhenParameters>(container: Element, ...sources: S): WhenReturn<S>;
export {};
