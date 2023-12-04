/* Types for tag creation, implemented by `tag()` in ai-ui.ts */

import { AsyncExtraIterable } from "./iterators";

export type ChildTags = Node // Things that are DOM nodes (including elements)
  | number | string | boolean // Things that can be converted to text nodes via toString
  | undefined // A value that won't generate an element
  // NB: we can't check the contained type at runtime, so we have to be liberal
  // and wait for the de-containment to fail if it turns out to not be a `ChildTags`
  | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> // Things that will resolve to any of the above
  | Array<ChildTags> 
  | Iterable<ChildTags>; // Iterable things that hold the above, like Arrays, HTMLCollection, NodeList

export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;

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

type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;

type BasedOn<P,Base> = Partial<UntypedEventHandlers> & {
  [K in keyof P]: K extends keyof Base 
      ? Partial<Base[K]> | P[K]
      : P[K];
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

    This relies on a hack to `wrapAsyncHelper` in iterators.ts when *acceots* a Partial<AsyncIterator> 
    but casts it to a AsyncIterator before use.
  */
  [K in keyof IP]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>
}

type ExcessKeys<A,B> = keyof A extends (keyof A & keyof B)  ? never : Exclude<keyof A, keyof B>;

type ExtendedReturn<BaseCreator extends TagCreator<any, any, any>, P, O, D, IP, Base, CET extends object>
  = (keyof O & keyof D) extends never
  ? (keyof IP & keyof O) extends never
  ? (keyof IP & keyof D) extends never

  ? (keyof IP & keyof Base) extends never
  ? (keyof D & keyof Base) extends never

  ? ExcessKeys<O, Base> extends never
  ? TagCreator<CET & IterableProperties<IP>, BaseCreator> & StaticMembers<P & O & D, Base>
  : { '`override` has excess properties not in the base tag': ExcessKeys<O, Base> }

  : { '`declare` clashes with base properties': (keyof D & keyof Base) }
  : { '`iterable` clashes with base properties': keyof IP & keyof Base }

  : { '`iterable` clashes with `declare`': keyof IP & keyof D }
  : { '`iterable` clashes with `override`': keyof IP & keyof O }
  : { '`override` clashes with `declare`': keyof O & keyof D }

interface ExtendedTag {
  // Functional, with a private Instance
  <
    BaseCreator extends TagCreator<any, any>,
    P extends BasedOn<P,Base>,
    O extends BasedOn<O,Base>,
    D extends object,
    I extends { [id: string]: TagCreator<any, any>; },
    C extends () => (ChildTags | void | Promise<void>),
    S extends string | undefined,
    IP extends object /*{ [k: string]: string | symbol | number | bigint | boolean | undefined }*/ = {},
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never,
    CET extends object = D & O & P & Base & IDS<I>
  >(this: BaseCreator, _: (instance: any) => {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
  } & ThisType<IterableProperties<IP> & AsyncGeneratedObject<CET>>)
  : ExtendedReturn<BaseCreator,P,O,D,IP,Base,CET>;

  // Declarative, with no state instance
  <
    BaseCreator extends TagCreator<any, any>,
    P extends BasedOn<P,Base>,
    O extends BasedOn<O,Base>,
    D extends object,
    I extends { [id: string]: TagCreator<any, any>; },
    C extends () => (ChildTags | void | Promise<void>),
    S extends string | undefined,
    IP extends object /*{ [k: string]: string | symbol | number | bigint | boolean | undefined }*/ = {},
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never,
    CET extends object = D & P & Base & IDS<I>,
  >(this: BaseCreator, _: {
    /** @deprecated */ prototype?: P;
    override?: O;
    declare?: D;
    iterable?: IP;
    ids?: I;
    constructed?: C;
    styles?: S;
  } & ThisType<IterableProperties<IP> & AsyncGeneratedObject<CET>>)
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

