/* Types for tag creation, implemented by `tag()` in ai-ui.ts */

import type { AsyncExtraIterable, AsyncProvider, Ignore, Iterability } from "./iterators.js";

export type ChildTags = Node // Things that are DOM nodes (including elements)
  | number | string | boolean // Things that can be converted to text nodes via toString
  | undefined // A value that won't generate an element
  | typeof Ignore // A value that won't generate an element
  // NB: we can't check the contained type at runtime, so we have to be liberal
  // and wait for the de-containment to fail if it turns out to not be a `ChildTags`
  | AsyncIterable<ChildTags> | AsyncIterator<ChildTags> | PromiseLike<ChildTags> // Things that will resolve to any of the above
  | Array<ChildTags>
  | Iterable<ChildTags>; // Iterable things that hold the above, like Arrays, HTMLCollection, NodeList

type AsyncAttr<X> = AsyncProvider<X> | Promise<X>;

export type PossiblyAsync<X> =
  [X] extends [object] // Not "naked" to prevent union distribution
  ? X extends AsyncAttr<infer U>
  ? PossiblyAsync<U>
  : X extends Function
  ? X | AsyncAttr<X>
  : AsyncAttr<Partial<X>> | { [K in keyof X]?: PossiblyAsync<X[K]>; }
  : X | AsyncAttr<X> | undefined;

type DeepPartial<X> = [X] extends [object] ? { [K in keyof X]?: DeepPartial<X[K]> } : X;

export const UniqueID = Symbol("Unique ID");
export type Instance<T extends Record<string, unknown> = {}> = { [UniqueID]: string } & T;

// Internal types supporting TagCreator
type AsyncGeneratedObject<X extends object> = {
  [K in keyof X]: X[K] extends AsyncAttr<infer Value> ? Value : X[K]
}

type IDS<I> = {
  ids: {
    [J in keyof I]: I[J] extends ExTagCreator<any> ? ReturnType<I[J]> : never;
  }
}

type ReTypedEventHandlers<T> = {
  [K in keyof T]: K extends keyof GlobalEventHandlers 
    ? Exclude<GlobalEventHandlers[K], null> extends (e: infer E)=>any 
      ? (this: T, e: E)=>any | null
      : T[K]
    : T[K]
}

type ReadWriteAttributes<E, Base> = Omit<E, 'attributes'> & {
  get attributes(): NamedNodeMap;
  set attributes(v: DeepPartial<PossiblyAsync<Base>>);
}

export type Flatten<O> = [{
  [K in keyof O]: O[K]
}][number];

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

  /* We choose the following type description to avoid the issues above. Because the AsyncExtraIterable
    is Partial it can be omitted from assignments:
      this.prop = value;  // Valid, as long as valus has the same type as the prop
    ...and when retrieved it will be the value type, and optionally the async iterator:
      Div(this.prop) ; // the value
      this.prop.map!(....)  // the iterator (not the trailing '!' to assert non-null value)

    This relies on a hack to `wrapAsyncHelper` in iterators.ts when *accepts* a Partial<AsyncIterator>
    but casts it to a AsyncIterator before use.

    The iterability of propertys of an object is determined by the presence and value of the `Iterability` symbol.
    By default, the currently implementation does a one-level deep mapping, so an iterable property 'obj' is itself
    iterable, as are it's members. The only defined value at present is "shallow", in which case 'obj' remains
    iterable, but it's membetrs are just POJS values.
  */

export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
  [K in keyof Omit<IP,typeof Iterability>]: IP[K] & Partial<AsyncExtraIterable<IP[K]>>
} : {
  [K in keyof IP]: (IP[K] extends object ? IterableProperties<IP[K]> : IP[K]) & Partial<AsyncExtraIterable<IP[K]>>
}

// Basically anything, _except_ an array, as they clash with map, filter
type IterablePropertyValue = (string | number | bigint | boolean | object | undefined) & { splice?: never };
type OptionalIterablePropertyValue = IterablePropertyValue | undefined | null;

type NeverEmpty<O extends object> = {} extends O ? never : O;
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
  : keyof A & keyof B;

type CheckPropertyClashes<BaseCreator extends ExTagCreator<any>, D extends Overrides, Result = never>
  = (OverlappingKeys<D['override'],D['declare']>
    | OverlappingKeys<D['iterable'],D['declare']>
    | OverlappingKeys<D['iterable'],D['override']>
//    | OverlappingKeys<IP,TagCreatorAttributes<BaseCreator>>
    | OverlappingKeys<D['declare'],TagCreatorAttributes<BaseCreator>>
    | OverlappingKeys<D['declare'],D['prototype']>
    | OverlappingKeys<D['override'],D['prototype']>
    | OverlappingKeys<D['iterable'],D['prototype']>
  ) extends never
  ? ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> extends never
    ? Result
    : { '`override` has properties not in the base tag or of the wrong type, and should match': ExcessKeys<D['override'], TagCreatorAttributes<BaseCreator>> }
  : OmitType<{
    '`declare` clashes with base properties': OverlappingKeys<D,TagCreatorAttributes<BaseCreator>>,
//    '`iterable` clashes with base properties': OverlappingKeys<IP,TagCreatorAttributes<BaseCreator>>,
    '`iterable` clashes with `override`': OverlappingKeys<D['iterable'],D['override']>,
    '`iterable` clashes with `declare`': OverlappingKeys<D['iterable'],D['declare']>,
    '`override` clashes with `declare`': OverlappingKeys<D['override'],D['declare']>,
    '`prototype` (deprecated) clashes with `declare`': OverlappingKeys<D['declare'],D['prototype']>,
    '`prototype` (deprecated) clashes with `override`': OverlappingKeys<D['declare'],D['prototype']>,
    '`prototype` (deprecated) clashes with `iterable`': OverlappingKeys<D['iterable'],D['prototype']>
  }, never>

export type Overrides = {
  /** @deprecated */ prototype?: object;
  override?: object;
  declare?: object;
  iterable?: { [k: string]: OptionalIterablePropertyValue };
  ids?: { [id: string]: ExTagCreator<any>; };
  constructed?: () => (ChildTags | void | Promise<void | ChildTags>);
  styles?: string;
}

export type TagCreatorAttributes<T extends ExTagCreator<any>> = T extends ExTagCreator<infer B,any> ? B:never;

type UnwrapIterables<IP> = {
  [K in keyof IP]: Exclude<IP[K], AsyncExtraIterable<any>>
}

type CombinedEffectiveType<Base extends ExTagCreator<any>, D extends Overrides> = 
  D['declare'] & D['override'] & IDS<D['ids']> & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>;

type CombinedIterableProperties<Base extends ExTagCreator<any>, D extends Overrides> = 
   D['iterable'] & UnwrapIterables<Pick<TagCreatorAttributes<Base>, keyof D['iterable']>>;
;
type CombinedThisType<Base extends ExTagCreator<any>, D extends Overrides> = 
  ReadWriteAttributes<
    IterableProperties<CombinedIterableProperties<Base,D>> & 
    AsyncGeneratedObject<CombinedEffectiveType<Base,D>>, D['declare'] & D['override'] & MergeBaseTypes<D['prototype'], Omit<TagCreatorAttributes<Base>, keyof D['iterable']>>>;

// `this` in this.extended(...) is BaseCreator
interface ExtendedTag {
  <
    BaseCreator extends ExTagCreator<any>,
    Definitions extends Overrides = {}
  >(this: BaseCreator, _: (instance: any) => ThisType<CombinedThisType<BaseCreator,Definitions>> & Definitions)
  : CheckPropertyClashes<BaseCreator, Definitions,
    ExTagCreator<
      CombinedEffectiveType<BaseCreator,Definitions> & IterableProperties<CombinedIterableProperties<BaseCreator,Definitions>>,
      BaseCreator,
        // Static members attached to the tag creator
        PickType<
          Definitions['declare']
          & Definitions['override'] 
          & Definitions['prototype'] 
          & TagCreatorAttributes<BaseCreator>,
          any
        >
      >
  >;

  <
    BaseCreator extends ExTagCreator<any>,
    Definitions extends Overrides = {}
  >(this: BaseCreator, _: ThisType<CombinedThisType<BaseCreator,Definitions>> & Definitions)
  : CheckPropertyClashes<BaseCreator, Definitions,
    ExTagCreator<
      CombinedEffectiveType<BaseCreator,Definitions> & IterableProperties<CombinedIterableProperties<BaseCreator,Definitions>>,
      BaseCreator,
      // Static members attached to the tag creator
      PickType<
        Definitions['declare']
        & Definitions['override'] 
        & Definitions['prototype'] 
        & TagCreatorAttributes<BaseCreator>,
        any
      >
    >
  >;
}

export type TagCreatorArgs<A> = [] | [A] | [A, ...ChildTags[]] | ChildTags[];
/* A TagCreator is a function that optionally takes attributes & children, and creates the tags.
  The attributes are PossiblyAsync. The return has `constructor` set to this function (since it instantiated it)
*/
export type TagCreatorFunction<Base extends object> = (...args: TagCreatorArgs<PossiblyAsync<ReTypedEventHandlers<Base>> & ThisType<ReTypedEventHandlers<Base>>>) => ReTypedEventHandlers<Base>;

/* A TagCreator is TagCreatorFunction decorated with some extra methods. The Super & Statics args are only
ever specified by ExtendedTag (internally), and so is not exported */
type ExTagCreator<Base extends object,
  Super extends (unknown | ExTagCreator<any>) = unknown,
  Statics = {}
> = TagCreatorFunction<Base> & {
  /* It can also be extended */
  extended: ExtendedTag
  /* It is based on a "super" TagCreator */
  super: Super
  /* It has a function that exposes the differences between the tags it creates and its super */
  definition?: Overrides; /* Contains the definitions & UniqueID for an extended tag. undefined for base tags */
  /* It has a name (set to a class or definition location), which is helpful when debugging */
  readonly name: string;
  /* Can test if an element was created by this function or a base tag function */
  [Symbol.hasInstance](elt: any): boolean;
} & Statics;

export type TagCreator<Base extends object> = ExTagCreator<Base, never, {}>;

// declare var Base: TagCreator<HTMLElement>;
// var b = Base();
// b.outerText;
// b.oninput = function(e) {
//   this === e.target
// };

// const Same = Base.extended({});
// Same().tagName

// const Ex = Base.extended({
//   override:{
//     onclick(e: MouseEvent) { this === e.target }
//   },
//   declare:{
//     attr: 0,
//   },
//   iterable:{
//     it: 0
//   }
// });b.oninput = function(e) {
//   this === e.target
// };

// var y = Ex();
// y.oninput = function(e) {
//   this === e.target
// };
// y.textContent;
// y.attr;
// y.it!.consume!(n=>{});