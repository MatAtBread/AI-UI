/* Types for tag creation, implemented by `tag()` in ai-ui.ts */

import { AsyncExtraIterable, AsyncProvider } from "./iterators";

export type ChildTags = Node // Things that are DOM nodes (including elements)
  | number | string | boolean // Things that can be converted to text nodes via toString
  | undefined // A value that won't generate an element
  // NB: we can't check the contained type at runtime, so we have to be liberal
  // and wait for the de-containment to fail if it turns out to not be a `ChildTags`
  | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> // Things that will resolve to any of the above
  | Array<ChildTags>
  | Iterable<ChildTags>; // Iterable things that hold the above, like Arrays, HTMLCollection, NodeList

export type PossiblyAsync<X> = [X] extends [object] // Not "naked" to prevent union distribution
  ? X extends AsyncProvider<infer U>
  ? PossiblyAsync<U>
  : X extends Function
  ? X | AsyncProvider<X>
  : AsyncProvider<Partial<X>> | { [K in keyof X]?: PossiblyAsync<X[K]>; }
  : X | AsyncProvider<X> | undefined;

type DeepPartial<X> = [X] extends [object] ? { [K in keyof X]?: DeepPartial<X[K]> } : X;

export type Instance<T extends {} = Record<string, unknown>> = T;

type RootObj = object;

// Internal types supporting TagCreator
type AsyncGeneratedObject<X extends RootObj> = {
  [K in keyof X]: X[K] extends AsyncProvider<infer Value> ? Value : X[K]
};

type IDS<I> = {
  ids: {
    [J in keyof I]: I[J] extends TagCreator<any, any> ? ReturnType<I[J]> : never;
  }
}

export type Overrides = {
  /** @deprecated */ prototype?: object; // Defaults for exitsting properties
  override?: object;
  iterable?: object;  // New 'hot' properties
  declare?: object;   // New properties
  ids?: { [id: string]: TagCreator<any, any>; };  // Descendant element types
  styles?: string;
  constructed?: () => (ChildTags | void | Promise<void>);
};

// Like GlobalEventHandlers, but with `this` removed
// Commented section was fixed add/removeEventListener, but causes issues elsewmhere
type UntypedEventHandlers = {
  [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R))
  ? null | ((event: E) => R)
  /*: GlobalEventHandlers[K] extends (event:infer E, listener:infer L, ...more:infer M) => infer R
    ? L extends (this: any, ev: infer V) => any
      ? (event: E, listener:(ev: V) => any, ...more: M) => R
      : (event: E, listener:L, ...more: M) => R */
  : GlobalEventHandlers[K];
}

// Like GlobalEventHandlers, but with `this` specified
// Commented section was fixed add/removeEventListener, but causes issues elsewmhere
type TypedEventHandlers<T> = {
  [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R))
  ? null | ((this: T, event: E) => R)
  /*: GlobalEventHandlers[K] extends (event:infer E, listener: infer L, ...more:infer M) => infer R
    ? L extends (this: any, ev: infer V) => any
      ? (event: E, listener:(this: T, ev: V) => any, ...more: M) => R
      : (event: E, listener:L, ...more: M) => R */
  : GlobalEventHandlers[K];
};

type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers)
  ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T>
  : T;

type ReadWriteAttributes<E, Base> = Omit<E, 'attributes'> & {
  get attributes(): NamedNodeMap;
  set attributes(v: Partial<PossiblyAsync<Base>>);
}

type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;

type Flatten<O> = [{
  [K in keyof O]: O[K]
}][number];

type PrettyFlatten<Src extends Others, Others = HTMLElement> = Flatten<Omit<Src, keyof Others>> & Pick<Src, keyof Others>;

type Extends<A, B> =
  A extends any[]
  ? B extends any[]
  ? Extends<A[number], B[number]>[]
  : never
  : B extends any[]
  ? never
  : B extends A ? B // Overrides don't narrow base
  : A extends B ? B & Flatten<Omit<A, keyof B>> // Overrides extend base
  : never;


type MergeBaseTypes<T, Base> = {
  [K in keyof Base | keyof T]
  : K extends (keyof T & keyof Base) ? Extends<T[K], Base[K]>
  : K extends keyof T ? T[K]
  : K extends keyof Base ? Base[K]
  : never;
};

/* IterableProperties can't be correctly typed in TS right now, either the declaratiin
  works for retrieval (the getter), or it works for assignments (the setter), but there's
  no TS syntax that permits correct type-checking at present.

  Ideally, it would be:

  type IterableProperties<IP> = {
    get [K in keyof IP](): AsyncExtraIterable<IP[K]> & IP[K]
    set [K in keyof IP](v: IP[K])
  }
  See https://github.com/microsoft/TypeScript/issues/43826
*/

type IterableProperties<IP> = {
  /* We choose the following type description to avoid the issues above. Because the AsyncExtraIterable
    is Partial it can be omitted from assignments:
      this.prop = value;  // Valid, as long as valus has the same type as the prop
    ...and when retrieved it will be the value type, and optionally the async iterator:
      Div(this.prop) ; // the value
      this.prop.map!(....)  // the iterator (not the trailing '!' to assert non-null value)

    This relies on a hack to `wrapAsyncHelper` in iterators.ts when *accepts* a Partial<AsyncIterator>
    but casts it to a AsyncIterator before use.
  */
  [K in keyof IP]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>
}

type NeverEmpty<O extends RootObj> = {} extends O ? never : O;
type OmitType<T, V> = [{ [K in keyof T as T[K] extends V ? never : K]: T[K] }][number]
// For informative purposes - unused in practice
interface _Not_Declared_ { }
interface _Not_Array_ { }
type ExcessKeys<A extends RootObj, B extends RootObj> =
  A extends any[]
  ? B extends any[]
  ? ExcessKeys<A[number], B[number]>
  : _Not_Array_
  : B extends any[]
  ? _Not_Array_
  : NeverEmpty<OmitType<{
    [K in keyof A]: K extends keyof B
    ? A[K] extends Partial<B[K]>
    ? never : B[K]
    : _Not_Declared_
  }, never>>

type OverlappingKeys<A,B> = B extends never ? never
  : A extends never ? never
  : keyof A & keyof B;

type ExtendedReturn<BaseCreator extends TagCreator<any, any, any>, P, O extends object, D, IP, Base extends object, CET extends object>
  = (OverlappingKeys<O,D>
    | OverlappingKeys<IP,D>
    | OverlappingKeys<IP,O>
    | OverlappingKeys<IP,Base>
    | OverlappingKeys<D,Base>
    | OverlappingKeys<D,P>
    | OverlappingKeys<O,P>
    | OverlappingKeys<IP,P>
  ) extends never ?
  ExcessKeys<O, Base> extends never ?
  TagCreator<CET & IterableProperties<IP>, BaseCreator> & StaticMembers<P & O & D, Base>
  : { '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<O, Base> }
  : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D,Base>,
    '`iterable` clashes with base properties': OverlappingKeys<IP,Base>,
    '`iterable` clashes with `override`': OverlappingKeys<IP,O>,
    '`iterable` clashes with `declare`': OverlappingKeys<IP,D>,
    '`override` clashes with `declare`': OverlappingKeys<O,D>,
    '`prototype` (deprecated) clashes with `declare`': OverlappingKeys<D,P>,
    '`prototype` (deprecated) clashes with `override`': OverlappingKeys<D,P>,
    '`prototype` (deprecated) clashes with `iterable`': OverlappingKeys<IP,P>
  }, never>

type ExtensionDefinition<// Combined Effective Type of this extended tag
  CTT, // styles (string)
  P extends RootObj, // prototype (deprecated, but can be used to extend a single property type in a union)
  O extends RootObj, // overrides - same types as Base, or omitted
  D extends RootObj, // ids - tagCreators
  IP extends {
    [k: string]: string | number | bigint | boolean | /* object | */ undefined;
  }, // declare - any types
  I extends {
    [idExt: string]: TagCreator<any, any>;
  }, C extends () => (ChildTags | void | Promise<void | ChildTags>), // constructed()
  S extends string | undefined> = ThisType<CTT> & {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
  };

interface ExtendedTag {
  <
    // `this` in this.extended(...)
    BaseCreator extends TagCreator<any, any>,
    // constructed()
    C extends () => (ChildTags | void | Promise<void | ChildTags>),
    // styles (string)
    S extends string | undefined,
    // prototype (deprecated, but can be used to extend a single property type in a union)
    P extends RootObj = {},
    // overrides - same types as Base, or omitted
    O extends RootObj = {},
    // declare - any types
    D extends RootObj = {},
    // ids - tagCreators
    I extends { [idExt: string]: TagCreator<any, any> } = {},
    // iterable properties - primitives (will be boxed)
    IP extends { [k: string]: string | number | bigint | boolean | /* object | */ undefined } = {},
    // Base inferred from this<baseTagCreator>.extended
    Base extends RootObj = BaseCreator extends TagCreator<infer B, any> ? B : never,
    // Combined Effective Type of this extended tag
    CET extends RootObj = D & O & IDS<I> & MergeBaseTypes<P & O, Base>,
    // Combined ThisType
    CTT = ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & MergeBaseTypes<P, Base>>
  >(this: BaseCreator, _: ExtensionDefinition<CTT, P, O, D, IP, I, C, S> | ((instance: any) => ExtensionDefinition<CTT, P, O, D, IP, I, C, S>))
    : ExtendedReturn<BaseCreator, P, O, D, IP, Base, CET>;
}

export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
export interface TagCreator<Base extends RootObj,
  Super extends (never | TagCreator<any, any>) = never,
  TypedBase = ReTypedEventHandlers<Base>
> {
  /* A TagCreator is a function that optionally takes attributes & children, and creates the tags.
    The attributes are PossiblyAsync. The return has `constructor` set to this function (since it instantiated it)
  */
  (...args: TagCreatorArgs<PossiblyAsync<TypedBase> & ThisType<TypedBase>>): TypedBase //& { constructor: TagCreator<Base,Super,TypedBase> }

  /* It can also be extended */
  extended: ExtendedTag;
  /* It is based on a "super" TagCreator */
  super: Super
  /* It has a function that exposes the differences between the tags it creates and its super */
  overrides?: (<A extends Instance>(a: A) => Overrides); /* null for base tags */

  /* It has a name (set to a class or definition location), which is helpful when debugging */
  readonly name: string;
};

