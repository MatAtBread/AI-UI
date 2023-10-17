/* Types for tag creation, implemented by `tag()` in ai-ui.ts */

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

export type Instance<T extends {} = Record<string, unknown>> = T;

// Internal types supporting TagCreator
type AsyncGeneratedObject<X extends object> = {
  [K in keyof X]: X[K] extends AsyncProvider<infer Value> ? Value : X[K]
};
type CommonKeys<A, B> = keyof A & keyof B;
// Like an intersection, where common keys are in a union
type OverrideMembers<Override extends object, Base extends object> = {
  [K in CommonKeys<Override, Base>]: Override[K] | Base[K];
  } &
  Omit<Override & Base, CommonKeys<Override, Base>>;

type IDS<I> = {
  ids: {
    [J in keyof I]?: I[J] extends (...a: any[]) => infer R ? R : never;
  };
};

export type Overrides = {
  constructed?: () => (ChildTags | void | Promise<void>);
  ids?: { [id: string]: TagCreator<any, any>; };
  prototype?: object;
  styles?: string;
};

// Like GlobalEventHandlers, but with `this` and `event.currentTarget` specified
type TypedEventHandlers<T> = {
  [K in keyof GlobalEventHandlers]: GlobalEventHandlers[K] extends (null | ((event: infer E) => infer R)) 
    ? (this: T, event: Omit<E, 'currentTarget'> & {
      currentTarget: T;
    }) => R 
    : never;
};

type ReTypedEventHandlers<T> = T extends (GlobalEventHandlers)
  ? Omit<T, keyof GlobalEventHandlers> & TypedEventHandlers<T> 
  : T;

type StaticMembers<P, Base> = P & Omit<Base, keyof HTMLElement>;

interface ExtendedTag {
  // Functional, with a private Instance
  <
    BaseCreator extends TagCreator<any, any>,
    C extends () => (ChildTags | void | Promise<void>),
    I extends { [id: string]: TagCreator<any, any>; },
    P extends {
      [K in keyof P]:
      K extends keyof GlobalEventHandlers
      //        ? (e: { currentTarget: "XXX" } & Omit<Parameters<Exclude<GlobalEventHandlers[K],null | undefined>>[0],'currentTarget'>)=>any
      ? (e: Parameters<Exclude<GlobalEventHandlers[K], null | undefined>>[0]) => any
      : unknown
    },
    S extends string | undefined,
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never,
    CET extends object = OverrideMembers<P, Base> & IDS<I>
  >(this: BaseCreator, _: (instance: any) => {
    constructed?: C;
    ids?: I;
    prototype?: P;
    styles?: S;
  } & ThisType<AsyncGeneratedObject<CET> & GlobalEventHandlers>): TagCreator<CET, BaseCreator> & StaticMembers<P, Base>

  // Declarative, with no state instance
  <
    BaseCreator extends TagCreator<any, any>,
    C extends () => (ChildTags | void | Promise<void>),
    I extends { [id: string]: TagCreator<any, any>; },
    P extends {
      [K in keyof P]:
      K extends keyof GlobalEventHandlers
      //        ? (e: { currentTarget: "XXX" } & Omit<Parameters<Exclude<GlobalEventHandlers[K],null | undefined>>[0],'currentTarget'>)=>any
      ? (e: Parameters<Exclude<GlobalEventHandlers[K], null | undefined>>[0]) => any
      : unknown
    },
    S extends string | undefined,
    Base extends object = BaseCreator extends TagCreator<infer B, any> ? B : never,
    CET extends object = OverrideMembers<P, Base> & IDS<I>
  >(this: BaseCreator, _: {
    constructed?: C;
    ids?: I;
    prototype?: P;
    styles?: S;
  } & ThisType<AsyncGeneratedObject<CET> & GlobalEventHandlers>): TagCreator<CET, BaseCreator> & StaticMembers<P, Base>
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

/* Some random tests/examples
declare var div: TagCreator<HTMLDivElement, never>;

const ee = div.extended({
  constructed() {
    this.foo;
  },
  ids:{
    kid1: div
  },
  prototype: {
    EE: 'EE' as const,
    foo: 0
  }
});
const ff = ee.extended({
  constructed() {
    this.foo = 123;
    this.FF;
    this.EE;
  },
  ids:{
    kid2: ee
  },
  prototype:{
    FF: 'BB' as const,
    f() { return this.FF },
    onclick(e) { this.FF; this.ids.kid2!.foo ; this.EE ; e.currentTarget!.FF },
  }
});

ee().constructor({
  EE: 'EE',
})

ff.super.super()
ff.super.super.super

ff().FF
ff.super().EE
ff.super.super().tagName
ff.super.super.super

const f2 = ff()
f2.onclick = function(e) { this.FF === e.currentTarget.FF }

const I = ff;

I().onclick = function(e) { this.FF === e.currentTarget.FF }
I({
  onabort(e) { this; e.currentTarget.FF }
})
//*/