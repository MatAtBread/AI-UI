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

type PossiblyAsync<X> = [X] extends [object] // Not "naked" to prevent union distribution
  ? X extends AsyncProvider<infer U> 
    ? PossiblyAsync<U> 
    : X extends Function 
      ? X | AsyncProvider<X> 
      : AsyncProvider<Partial<X>> | { [K in keyof X]?: PossiblyAsync<X[K]>; } 
  : X | AsyncProvider<X> | undefined;

type DeepPartial<X> = [X] extends [object] ? { [K in keyof X]?: DeepPartial<X[K]> } : X;

export type Instance<T extends {} = Record<string, unknown>> = T;

// Internal types supporting TagCreator
type AsyncGeneratedObject<X extends object> = {
  [K in keyof X]: X[K] extends AsyncProvider<infer Value> ? Value : X[K]
};

type IDS<I> = {
  ids: {
    [J in keyof I]?: I[J] extends (...a: any[]) => infer R ? R : never;
  };
};

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

type ReadWriteAttributes<E,Base> = Omit<E,'attributes'> & {
  get attributes(): NamedNodeMap;
  set attributes(v: Partial<PossiblyAsync<Base>>);
}

type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;

type MergeBaseTypes<T,U> = {
  [K in keyof U | keyof T]
      : K extends (keyof T & keyof U) ? U[K] | T[K]
      : K extends keyof T ? T[K]
      : K extends keyof U ? U[K]
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

type NeverEmpty<O extends object> = {} extends O ? never : O;
type ExcessKeys<A extends object,B extends object> = NeverEmpty<OmitType<{
      [K in keyof A]: K extends keyof B 
        ? A[K] extends Partial<B[K]>
          ? never : B[K]
        : undefined
    }, never>>;

type OmitType<T, V> = [{ [K in keyof T as T[K] extends V ? never : K]: T[K] }][number];

type ExtendedReturn<BaseCreator extends TagCreator<any, any, any>, P, O extends object, D, IP, Base extends object, CET extends object>
  = ((keyof O & keyof D) 
  | (keyof IP & keyof D) 
  | (keyof IP & keyof O)
  | (keyof IP & keyof Base) 
  | (keyof D & keyof Base)
  | (keyof D & keyof P)
  | (keyof O & keyof P)
  | (keyof IP & keyof P)
  ) extends never ?
  ExcessKeys<O, Base> extends never ?
  TagCreator<CET & IterableProperties<IP>, BaseCreator> & StaticMembers<P & O & D, Base>
  : { '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<O, Base> }
  : OmitType<{
    '`declare` clashes with base properties': keyof D & keyof Base,
    '`iterable` clashes with base properties': keyof IP & keyof Base,
    '`iterable` clashes with `override`': keyof IP & keyof O,
    '`iterable` clashes with `declare`': keyof IP & keyof D,
    '`override` clashes with `declare`': keyof O & keyof D,
    '`prototype` (deprecated) clashes with `declare`': keyof D & keyof P,
    '`prototype` (deprecated) clashes with `override`': keyof O & keyof P,
    '`prototype` (deprecated) clashes with `iterable`': keyof IP & keyof P
  }, never>

interface ExtendedTag {
  // Functional, with a private Instance
  <
    BaseCreator extends TagCreator<any, any>,
    P extends object,                     // prototype (deprecated, but can be used to extend a single property type in a union)
    O extends object,                                     // overrides - same types as Base, or omitted
    D extends object,                                     // declare - any types
    I extends { [id: string]: TagCreator<any, any>; },    // ids - tagCreators
    C extends () => (ChildTags | void | Promise<void>),   // constructed()
    S extends string | undefined,                         // styles (string)
    IP extends { [k: string]: string | number | bigint | boolean | /* object | */ undefined } = {}, // iterable - primitives (will be boxed)
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, // Base
    CET extends object = D & O & P & Base & IDS<I>        // Combined Effective Type of this extended tag
  >(this: BaseCreator, _: (instance: any) => {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
  } & ThisType<ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & P & Base>>)
  : ExtendedReturn<BaseCreator,P,O,D,IP,Base,CET>;

  // Declarative, with no state instance
  <
    BaseCreator extends TagCreator<any, any>,
    P extends object,                                     // prototype (deprecated, but can be used to extend a single property type in a union)
    O extends object,                                     // overrides - same types as Base, or omitted
    D extends object,                                     // declare - any types
    I extends { [id: string]: TagCreator<any, any>; },    // ids - tagCreators
    C extends () => (ChildTags | void | Promise<void>),   // constructed()
    S extends string | undefined,                         // styles (string)
    IP extends { [k: string]: string | number | bigint | boolean | /* object | */ undefined } = {}, // iterable - primitives (will be boxed)
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never, // Base
    CET extends object = D & O & MergeBaseTypes<P, Base> & IDS<I>        // Combined Effective Type of this extended tag
  >(this: BaseCreator, _: {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
  } & ThisType<ReadWriteAttributes<IterableProperties<IP> & AsyncGeneratedObject<CET>, D & O & MergeBaseTypes<P, Base>>>)
  : ExtendedReturn<BaseCreator,P,O,D,IP,Base,CET>;
}

type TagCreatorArgs<A> = [] | ChildTags[] | [A] | [A, ...ChildTags[]];
export interface TagCreator<Base extends object, 
  Super extends (never | TagCreator<any,any>) = never,
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

