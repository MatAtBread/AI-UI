import { AsyncExtraIterable } from "./iterators.js";
type WhenParameter<IDS extends string = string> = ValidWhenSelector<IDS> | Element | Promise<any> | AsyncIterable<any>;
export type WhenParameters<IDS extends string = string> = ReadonlyArray<WhenParameter<IDS>>;
type WhenIteratedType<S extends WhenParameters> = (Extract<S[number], AsyncIterable<any>> extends AsyncIterable<infer I> ? unknown extends I ? never : I : never) | ExtractEvents<Extract<S[number], string>> | (Extract<S[number], Element> extends never ? never : Event);
type MappableIterable<A extends AsyncIterable<any>> = A extends AsyncIterable<infer T> ? A & AsyncExtraIterable<T> & (<R>(mapper: (value: A extends AsyncIterable<infer T> ? T : never) => R) => (AsyncExtraIterable<Awaited<R>>)) : never;
export type WhenReturn<S extends WhenParameters> = MappableIterable<AsyncExtraIterable<WhenIteratedType<S>>>;
type EmptyObject = Record<string | symbol | number, never>;
interface SpecialWhenEvents {
    "@start": EmptyObject;
    "@ready": EmptyObject;
}
interface WhenEvents extends GlobalEventHandlersEventMap, SpecialWhenEvents {
}
type EventNameList<T extends string> = T extends keyof WhenEvents ? T : T extends `${infer S extends keyof WhenEvents},${infer R}` ? EventNameList<R> extends never ? never : `${S},${EventNameList<R>}` : never;
type EventNameUnion<T extends string> = T extends keyof WhenEvents ? T : T extends `${infer S extends keyof WhenEvents},${infer R}` ? EventNameList<R> extends never ? never : S | EventNameList<R> : never;
type EventAttribute = `${keyof GlobalEventHandlersEventMap}`;
type CSSIdentifier<IDS extends string = string> = `#${IDS}` | `#${IDS}>` | `.${string}` | `[${string}]`;
export type ValidWhenSelector<IDS extends string = string> = `${keyof SpecialWhenEvents}` | `${EventAttribute}:${CSSIdentifier<IDS>}` | EventAttribute | CSSIdentifier<IDS>;
type ExtractEventNames<S> = S extends keyof SpecialWhenEvents ? S : S extends `${infer V}:${CSSIdentifier}` ? EventNameUnion<V> extends never ? never : EventNameUnion<V> : S extends keyof WhenEvents ? EventNameUnion<S> extends never ? never : EventNameUnion<S> : S extends CSSIdentifier ? 'change' : never;
type ExtractEvents<S> = WhenEvents[ExtractEventNames<S>];
export declare function when<S extends WhenParameters>(container: Element, ...sources: S): WhenReturn<S>;
export {};
