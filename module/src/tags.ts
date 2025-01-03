/* Types for tag creation, implemented by `tag()` in ai-ui.ts.
  No code/data is declared in this file (except the re-exported symbols from iterators.ts).
*/

import type { AsyncProvider, Ignore, IterableProperties, IterablePropertyValue } from "./iterators.js";
import type { UniqueID } from "./ai-ui.js";

export type ChildTags = Node // Things that are DOM nodes (including elements)
  | number | string | boolean // Things that can be converted to text nodes via toString
  | undefined // A value that won't generate an element
  | typeof Ignore // A value that won't generate an element
  // NB: we can't check the contained type at runtime, so we have to be liberal
  // and wait for the de-containment to fail if it turns out to not be a `ChildTags`
  | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> // Things that will resolve to any of the above
  | Array<ChildTags>
  | Iterable<ChildTags> // Iterable things that hold the above, like Arrays, HTMLCollection, NodeList

/* Types used to validate an extended tag declaration */

type DeepPartial<X> = [X] extends [{}] ? { [K in keyof X]?: DeepPartial<X[K]> } : X
type NeverEmpty<O extends object> = {} extends O ? never : O
type OmitType<T, V> = [{ [K in keyof T as T[K] extends V ? never : K]: T[K] }][number]
type PickType<T, V> = [{ [K in keyof T as T[K] extends V ? K : never]: T[K] }][number]

// For informative purposes - unused in practice
interface _Not_Declared_ { }
interface _Not_Array_ { }
type ExcessKeys<A, B> =
  A extends any[]
  ? B extends any[]
  ? ExcessKeys<A[number], B[number]>
  : _Not_Array_
  : B extends any[]
  ? _Not_Array_
  : NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B
    ? A[K] extends (B[K] extends Function ? B[K] : DeepPartial<B[K]>)
    ? never : B[K]
    : _Not_Declared_
  }, never>>

type OverlappingKeys<A,B> = B extends never ? never
  : A extends never ? never
  : keyof A & keyof B

type CheckPropertyClashes<BaseCreator extends ExTagCreator<any>, D extends Overrides, Result = never>
  = (OverlappingKeys<D['override'],D['declare']>
    | OverlappingKeys<D['iterable'],D['declare']>
    | OverlappingKeys<D['iterable'],D['override']>
    | OverlappingKeys<D['iterable'],Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>>
    | OverlappingKeys<D['declare'],TagCreatorAttributes<BaseCreator>>
  ) extends never
  ? ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> extends never
    ? Result
    : { '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> }
  : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D['declare'],TagCreatorAttributes<BaseCreator>>,
    '`iterable` clashes with base properties': OverlappingKeys<D['iterable'],Omit<TagCreatorAttributes<BaseCreator>, keyof BaseIterables<BaseCreator>>>,
    '`iterable` clashes with `override`': OverlappingKeys<D['iterable'],D['override']>,
    '`iterable` clashes with `declare`': OverlappingKeys<D['iterable'],D['declare']>,
    '`override` clashes with `declare`': OverlappingKeys<D['override'],D['declare']>
  }, never>

/* Types that form the description of an extended tag */

export type Overrides = {
  /* Values for properties that already exist in any base a tag is extended from */
  override?: object;
  /* Declaration and default values for new properties in this tag definition. */
  declare?: object;
  /* Declaration and default valuees for now properties that are boxed by defineIterableProperties */
  iterable?: { [k: string]: IterablePropertyValue };
  /* Specification of the types of elements by ID that are contained by this tag */
  ids?: { [id: string]: TagCreatorFunction<any>; };
  /* Static CSS referenced by this tag */
  styles?: string;
}

interface TagCreatorForIDS<I extends NonNullable<Overrides['ids']>> {
  <const K extends keyof I>(
    attrs:{ id: K } & Exclude<Parameters<I[K]>[0], ChildTags>,
    ...children: ChildTags[]
  ): ReturnType<I[K]>
}

type IDS<I extends Overrides['ids']> = I extends NonNullable<Overrides['ids']> ? {
  ids: {
    [J in keyof I]: ReturnType<I[J]>;
  } & TagCreatorForIDS<I>
} : { ids: {} }

export type Constructed = {
  constructed: () => (ChildTags | void | PromiseLike<void | ChildTags>);
}

// Infer the effective set of attributes from an ExTagCreator
export type TagCreatorAttributes<T extends ExTagCreator<any>> = T extends ExTagCreator<infer BaseAttrs>
  ? BaseAttrs
  : never

// Infer the effective set of iterable attributes from the _ancestors_ of an ExTagCreator
type BaseIterables<Base> =
  Base extends ExTagCreator<infer _Base, infer Super, infer SuperDefs extends Overrides, infer _Statics>
  ? BaseIterables<Super> extends never
    ? SuperDefs['iterable'] extends object
      ? SuperDefs['iterable']
      : {}
    : BaseIterables<Super> & SuperDefs['iterable']
  : never

// Work out the types of all the non-iterable properties of an ExTagCreator
type CombinedNonIterableProperties<D extends Overrides, Base extends ExTagCreator<any>> =
  D['declare']
  & D['override']
  & IDS<D['ids']>
  & Omit<TagCreatorAttributes<Base>, keyof D['iterable']>

type CombinedIterableProperties<D extends Overrides, Base extends ExTagCreator<any>> = BaseIterables<Base> & D['iterable']

export const callStackSymbol = Symbol('callStack');
export interface ConstructorCallStack extends TagCreationOptions {
  [callStackSymbol]?: Overrides[];
  [k: string]: unknown
}

export interface ExtendTagFunction { (attrs: ConstructorCallStack | ChildTags, ...children: ChildTags[]): Element }

interface InstanceUniqueID { [UniqueID]: string }
export type Instance<T = InstanceUniqueID> = InstanceUniqueID & T

export interface ExtendTagFunctionInstance extends ExtendTagFunction {
  super: TagCreator<Element>;
  definition: Overrides;
  valueOf: () => string;
  extended: (this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) => ExtendTagFunctionInstance;
}

interface TagConstuctor {
  constructor: ExtendTagFunctionInstance;
}

type CombinedThisType<D extends Overrides, Base extends ExTagCreator<any>> =
  TagConstuctor &
  ReadWriteAttributes<
    IterableProperties<CombinedIterableProperties<D, Base>>
    & CombinedNonIterableProperties<D, Base>,
    D['declare']
    & D['override']
    & CombinedIterableProperties<D, Base>
    & Omit<TagCreatorAttributes<Base>, keyof CombinedIterableProperties<D, Base>>
  >

type StaticReferences<Definitions extends Overrides, Base extends ExTagCreator<any>> = PickType<
  Definitions['declare']
  & Definitions['override']
  & TagCreatorAttributes<Base>,
  any
>

// `this` in this.extended(...) is BaseCreator
interface ExtendedTag {
  <
    BaseCreator extends ExTagCreator<any>,
    SuppliedDefinitions,
    Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {},
    TagInstance extends InstanceUniqueID = InstanceUniqueID
  >(this: BaseCreator, _: (inst:TagInstance) => SuppliedDefinitions & ThisType<CombinedThisType<Definitions, BaseCreator>>)
  : CheckConstructedReturn<SuppliedDefinitions,
      CheckPropertyClashes<BaseCreator, Definitions,
      ExTagCreator<
        IterableProperties<CombinedIterableProperties<Definitions, BaseCreator>>
        & CombinedNonIterableProperties<Definitions, BaseCreator>,
        BaseCreator,
        Definitions,
        StaticReferences<Definitions, BaseCreator>
      >
    >
  >

  <
    BaseCreator extends ExTagCreator<any>,
    SuppliedDefinitions,
    Definitions extends Overrides = SuppliedDefinitions extends Overrides ? SuppliedDefinitions : {}
  >(this: BaseCreator, _: SuppliedDefinitions & ThisType<CombinedThisType<Definitions, BaseCreator>>)
  : CheckConstructedReturn<SuppliedDefinitions,
      CheckPropertyClashes<BaseCreator, Definitions,
      ExTagCreator<
        IterableProperties<CombinedIterableProperties<Definitions, BaseCreator>>
        & CombinedNonIterableProperties<Definitions, BaseCreator>,
        BaseCreator,
        Definitions,
        StaticReferences<Definitions, BaseCreator>
      >
    >
  >
}

type CheckConstructedReturn<SuppliedDefinitions, Result> =
  SuppliedDefinitions extends { constructed: any }
  ? SuppliedDefinitions extends Constructed
    ? Result
    : { "constructed` does not return ChildTags": SuppliedDefinitions['constructed'] }
  : ExcessKeys<SuppliedDefinitions, Overrides & Constructed> extends never
    ? Result
    : { "The extended tag defintion contains unknown or incorrectly typed keys": keyof ExcessKeys<SuppliedDefinitions, Overrides & Constructed> }

export interface TagCreationOptions {
  debugger?: boolean
}

type ReTypedEventHandlers<T> = {
  [K in keyof T]: K extends keyof GlobalEventHandlers
    ? Exclude<GlobalEventHandlers[K], null> extends (e: infer E)=>infer R
      ? ((e: E)=>R) | null
      : T[K]
    : T[K]
}

type AsyncAttr<X> = AsyncProvider<X> | PromiseLike<AsyncProvider<X> | X>
type PossiblyAsync<X> = [X] extends [object] /* Not "naked" to prevent union distribution */
  ? X extends AsyncProvider<infer U>
    ? X extends (AsyncProvider<U> & U)
      ? U | AsyncAttr<U> // iterable property
      : X | PromiseLike<X> // some other AsyncProvider
    : X extends (any[] | Function)
      ? X | AsyncAttr<X>  // Array or Function, which can be provided async
      : { [K in keyof X]?: PossiblyAsync<X[K]> } | Partial<X> | AsyncAttr<Partial<X>> // Other object - partially, possible async
  : X | AsyncAttr<X> // Something else (number, etc), which can be provided async

type ReadWriteAttributes<E, Base = E> = E extends { attributes: any }
  ? (Omit<E, 'attributes'> & {
    get attributes(): NamedNodeMap;
    set attributes(v: PossiblyAsync<Omit<Base,'attributes'>>);
  })
  : (Omit<E, 'attributes'>)

export type TagCreatorArgs<A> = [] | [A & TagCreationOptions] | [A & TagCreationOptions, ...ChildTags[]] | ChildTags[]
/* A TagCreator is a function that optionally takes attributes & children, and creates the tags.
  The attributes are PossiblyAsync. The return has `constructor` set to this function (since it instantiated it)
*/
export type TagCreatorFunction<Base extends object> = (...args: TagCreatorArgs<PossiblyAsync<Base> & ThisType<Base>>) => ReadWriteAttributes<Base>

/* A TagCreator is TagCreatorFunction decorated with some extra methods. The Super & Statics args are only
ever specified by ExtendedTag (internally), and so is not exported */
type ExTagCreator<Base extends object,
  Super extends (unknown | ExTagCreator<any>) = unknown,
  SuperDefs extends Overrides = {},
  Statics = {},
> = TagCreatorFunction<ReTypedEventHandlers<Base>> & {
  /* It can also be extended */
  extended: ExtendedTag
  /* It is based on a "super" TagCreator */
  super: Super
  /* It has a function that exposes the differences between the tags it creates and its super */
  definition?: Overrides & InstanceUniqueID; /* Contains the definitions & UniqueID for an extended tag. undefined for base tags */
  /* It has a name (set to a class or definition location), which is helpful when debugging */
  readonly name: string;
  /* Can test if an element was created by this function or a base tag function */
  [Symbol.hasInstance](elt: any): boolean;
} & InstanceUniqueID &
// `Statics` here is that same as StaticReferences<Super, SuperDefs>, but the circular reference breaks TS
// so we compute the Statics outside this type declaration as pass them as a result
Statics

export type TagCreator<Base extends object> = ExTagCreator<Base, never, never, {}>
