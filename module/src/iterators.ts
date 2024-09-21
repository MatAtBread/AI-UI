import { DEBUG, console } from "./debug.js"
import { DeferredPromise, deferred, isObjectLike, isPromiseLike } from "./deferred.js"

/* IterableProperties can't be correctly typed in TS right now, either the declaration
  works for retrieval (the getter), or it works for assignments (the setter), but there's
  no TS syntax that permits correct type-checking at present.

  Ideally, it would be:

  type IterableProperties<IP> = {
    get [K in keyof IP](): AsyncExtraIterable<IP[K]> & IP[K]
    set [K in keyof IP](v: IP[K])
  }
  See https://github.com/microsoft/TypeScript/issues/43826

  We choose the following type description to avoid the issues above. Because the AsyncExtraIterable
  is Partial it can be omitted from assignments:
    this.prop = value;  // Valid, as long as valus has the same type as the prop
  ...and when retrieved it will be the value type, and optionally the async iterator:
    Div(this.prop) ; // the value
    this.prop.map!(....)  // the iterator (note the trailing '!' to assert non-null value)

  This relies on a hack to `wrapAsyncHelper` in iterators.ts which *accepts* a Partial<AsyncIterator>
  but casts it to a AsyncIterator before use.

  The iterability of propertys of an object is determined by the presence and value of the `Iterability` symbol.
  By default, the current implementation does a deep mapping, so an iterable property 'obj' is itself
  iterable, as are it's members. The only defined value at present is "shallow", in which case 'obj' remains
  iterable, but it's membetrs are just POJS values.
*/

// Base types that can be made defined as iterable: basically anything, _except_ a function
export type IterablePropertyPrimitive = (string | number | bigint | boolean | undefined | null);
// We should exclude AsyncIterable from the types that can be assigned to iterables (and therefore passed to defineIterableProperty)
export type IterablePropertyValue = IterablePropertyPrimitive | IterablePropertyValue[] | { [k: string | symbol | number]: IterablePropertyValue };

export const Iterability = Symbol("Iterability");
export type Iterability<Depth extends 'shallow' = 'shallow'> = { [Iterability]: Depth };
export type IterableType<T> = T & Partial<AsyncExtraIterable<T>>;

declare global {
  // This is patch to the std lib definition of Array<T>. I don't know why it's absent,
  // as this is the implementation in all JavaScript engines. It is probably a result
  // of its absence in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values,
  // which inherits from the Object.prototype, which makes no claim for the return type
  // since it could be overriddem. However, in that case, a TS defn should also override
  // it, like Number, String, Boolean etc do.
  interface Array<T> {
    valueOf(): Array<T>;
  }
  // As above, the return type could be T rather than Object, since this is the default impl,
  // but it's not, for some reason.
  interface Object {
    valueOf<T>(this: T): T extends IterableType<infer Z> ? Z : Object;
  }
}

type NonAccessibleIterableArrayKeys = keyof Array<any> & keyof AsyncIterableHelpers;
export type IterableProperties<IP> = IP extends Iterability<'shallow'> ? {
  [K in keyof Omit<IP, typeof Iterability>]: IterableType<IP[K]>
} : {
  [K in keyof IP]: (
    IP[K] extends Array<infer E>
    ? /*
      Because TS doesn't implement separate types for read/write, or computed getter/setter names (which DO allow
      different types for assignment and evaluation), it is not possible to define type for array members that permit
      dereferencing of non-clashinh array keys such as `join` or `sort` and AsyncIterator methods which also allows
      simple assignment of the form `this.iterableArrayMember = [...]`. 

      The CORRECT type for these fields would be (if TS phas syntax for it):
      get [K] (): Omit<Array<E & AsyncExtraIterable<E>, NonAccessibleIterableArrayKeys> & AsyncExtraIterable<E[]>
      set [K] (): Array<E> | AsyncExtraIterable<E[]>
      */
      Omit<Array<E & Partial<AsyncExtraIterable<E>>>, NonAccessibleIterableArrayKeys> & Partial<AsyncExtraIterable<E[]>>
    : (
      IP[K] extends object
      ? IterableProperties<IP[K]>
      : IP[K]
    ) & IterableType<IP[K]>
  )
}

/* Things to suppliement the JS base AsyncIterable */
export interface QueueIteratableIterator<T> extends AsyncIterableIterator<T>, AsyncIterableHelpers {
  push(value: T): boolean;
  readonly length: number;
}

export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers { }

// NB: This also (incorrectly) passes sync iterators, as the protocol names are the same
export function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T> {
  return isObjectLike(o) && 'next' in o && typeof o?.next === 'function'
}
export function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T> {
  return isObjectLike(o) && (Symbol.asyncIterator in o) && typeof o[Symbol.asyncIterator] === 'function'
}
export function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T> {
  return isAsyncIterable(o) || isAsyncIterator(o)
}

export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>

export function asyncIterator<T>(o: AsyncProvider<T>) {
  if (isAsyncIterator(o)) return o;
  if (isAsyncIterable(o)) return o[Symbol.asyncIterator]();
  throw new Error("Not an async provider");
}

type AsyncIterableHelpers = typeof asyncExtras;
export const asyncExtras = {
  filterMap<U extends PartialIterable, R>(this: U,
    fn: (o: HelperAsyncIterable<U>, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>,
    initialValue: R | typeof Ignore = Ignore
  ) {
    return filterMap(this, fn, initialValue)
  },
  map,
  filter,
  unique,
  waitFor,
  multi,
  initially,
  consume,
  merge<T, A extends Partial<AsyncIterable<any>>[]>(this: PartialIterable<T>, ...m: A) {
    return merge(this, ...m);
  },
  combine<T, S extends CombinedIterable>(this: PartialIterable<T>, others: S) {
    return combine(Object.assign({ '_this': this }, others));
  }
};

const extraKeys = [...Object.getOwnPropertySymbols(asyncExtras), ...Object.keys(asyncExtras)] as (keyof typeof asyncExtras)[];

// Like Object.assign, but the assigned properties are not enumerable
function assignHidden<D extends {}, S extends {}>(d: D, s: S) {
  const keys = [...Object.getOwnPropertyNames(s), ...Object.getOwnPropertySymbols(s)];
  for (const k of keys) {
    Object.defineProperty(d, k, { ...Object.getOwnPropertyDescriptor(s, k), enumerable: false });
  }
  return d as D & S;
}

const _pending = Symbol('pending');
const _items = Symbol('items');
function internalQueueIteratableIterator<T>(stop = () => { }) {
  const q = {
    [_pending]: [] as DeferredPromise<IteratorResult<T>>[] | null,
    [_items]: [] as IteratorResult<T>[] | null,

    [Symbol.asyncIterator]() {
      return q as AsyncIterableIterator<T>;
    },

    next() {
      if (q[_items]?.length) {
        return Promise.resolve(q[_items].shift()!);
      }

      if (!q[_pending])
        return Promise.resolve({ done: true as const, value: undefined });

      const value = deferred<IteratorResult<T>>();
      // We install a catch handler as the promise might be legitimately reject before anything waits for it,
      // and this suppresses the uncaught exception warning.
      value.catch(ex => { });
      q[_pending].unshift(value);
      return value;
    },

    return(v?: unknown) {
      const value = { done: true as const, value: undefined };
      if (q[_pending]) {
        try { stop() } catch (ex) { }
        while (q[_pending].length)
          q[_pending].pop()!.resolve(value);
        q[_items] = q[_pending] = null;
      }
      return Promise.resolve(value);
    },

    throw(...args: any[]) {
      const value = { done: true as const, value: args[0] };
      if (q[_pending]) {
        try { stop() } catch (ex) { }
        while (q[_pending].length)
          q[_pending].pop()!.reject(value);
        q[_items] = q[_pending] = null;
      }
      return Promise.reject(value);
    },

    get length() {
      if (!q[_items]) return -1; // The queue has no consumers and has terminated.
      return q[_items].length;
    },

    push(value: T) {
      if (!q[_pending])
        return false;

      if (q[_pending].length) {
        q[_pending].pop()!.resolve({ done: false, value });
      } else {
        if (!q[_items]) {
          console.log('Discarding queue push as there are no consumers');
        } else {
          q[_items].push({ done: false, value })
        }
      }
      return true;
    }
  };
  return iterableHelpers(q);
}

const _inflight = Symbol('inflight');
function internalDebounceQueueIteratableIterator<T>(stop = () => { }) {
  const q = internalQueueIteratableIterator<T>(stop) as ReturnType<typeof internalQueueIteratableIterator<T>> & { [_inflight]: Set<T> };
  q[_inflight] = new Set<T>();

  q.push = function (value: T) {
    if (!q[_pending])
      return false;

    // Debounce
    if (q[_inflight].has(value))
      return true;

    if (q[_pending].length) {
      q[_inflight].add(value);
      const p = q[_pending].pop()!;
      p.finally(() => q[_inflight].delete(value));
      p.resolve({ done: false, value });
    } else {
      if (!q[_items]) {
        console.log('Discarding queue push as there are no consumers');
      } else if (!q[_items].find(v => v.value === value)) {
        q[_items].push({ done: false, value });
      }
    }
    return true;
  }
  return q;
}

// Re-export to hide the internals
export const queueIteratableIterator: <T>(stop?: () => void) => QueueIteratableIterator<T> = internalQueueIteratableIterator;
export const debounceQueueIteratableIterator: <T>(stop?: () => void) => QueueIteratableIterator<T> = internalDebounceQueueIteratableIterator;

declare global {
  interface ObjectConstructor {
    defineProperties<T, M extends { [K: string | symbol]: TypedPropertyDescriptor<any> }>(o: T, properties: M & ThisType<any>): T & {
      [K in keyof M]: M[K] extends TypedPropertyDescriptor<infer T> ? T : never
    };
  }
}

/* Define a "iterable property" on `obj`.
   This is a property that holds a boxed (within an Object() call) value, and is also an AsyncIterableIterator. which
   yields when the property is set.
   This routine creates the getter/setter for the specified property, and manages the aassociated async iterator.
*/

const _proxiedAsyncIterator = Symbol('_proxiedAsyncIterator');
export function defineIterableProperty<T extends {}, const N extends string | symbol, V extends IterablePropertyValue>(obj: T, name: N, v: V): T & IterableProperties<{ [k in N]: V }> {
  // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
  // access the iterator methods to prevent leaks where an iterable is created, but
  // never referenced, and therefore cannot be consumed and ultimately closed
  let initIterator = () => {
    initIterator = () => b;
    const bi = debounceQueueIteratableIterator<V>();
    const mi = bi.multi();
    const b = mi[Symbol.asyncIterator]();
    extras[Symbol.asyncIterator] = mi[Symbol.asyncIterator];
    push = bi.push;
    extraKeys.forEach(k => // @ts-ignore
      extras[k] = b[k as keyof typeof b]);
    if (!(_proxiedAsyncIterator in a))
      assignHidden(a, extras);
    return b;
  }

  // Create stubs that lazily create the AsyncExtraIterable interface when invoked
  function lazyAsyncMethod<M extends keyof typeof asyncExtras>(method: M) {
    return {
      [method]: function (this: unknown, ...args: any[]) {
        initIterator();
        // @ts-ignore - Fix
        return a[method].apply(this, args);
      } as (typeof asyncExtras)[M]
    }[method];
  }

  type HelperDescriptors<T> = {
    [K in keyof AsyncExtraIterable<T>]: TypedPropertyDescriptor<AsyncExtraIterable<T>[K]>
  } & {
    [Iterability]?: TypedPropertyDescriptor<'shallow'>
  };

  const extras = { [Symbol.asyncIterator]: initIterator } as AsyncExtraIterable<V> & { [Iterability]?: 'shallow' };
  extraKeys.forEach((k) => // @ts-ignore
    extras[k] = lazyAsyncMethod(k))
  if (typeof v === 'object' && v && Iterability in v && v[Iterability] === 'shallow') {
    extras[Iterability] = v[Iterability];
  }

  // Lazily initialize `push`
  let push: QueueIteratableIterator<V>['push'] = (v: V) => {
    initIterator(); // Updates `push` to reference the multi-queue
    return push(v);
  }

  let a = box(v, extras);
  let piped: AsyncIterable<V> | undefined = undefined;

  Object.defineProperty(obj, name, {
    get(): V { return a },
    set(v: V | AsyncExtraIterable<V>) {
      if (v !== a) {
        if (isAsyncIterable(v)) {
          // Assigning multiple async iterators to a single iterable is probably a
          // bad idea from a reasoning point of view, and multiple implementations
          // are possible:
          //  * merge?
          //  * ignore subsequent assignments?
          //  * terminate the first then consume the second?
          // The solution here (one of many possibilities) is the letter: only to allow
          // most recent assignment to work, terminating any preceeding iterator when it next
          // yields and finds this consumer has been re-assigned.

          // If the iterator has been reassigned with no change, just ignore it, as we're already consuming it
          if (piped === v)
            return;

          piped = v;
          let stack = DEBUG ? new Error() : undefined;
          if (DEBUG)
            console.info(new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`));
          consume.call(v, y => {
            if (v !== piped) {
              // We're being piped from something else. We want to stop that one and get piped from this one
              throw new Error(`Piped iterable "${name.toString()}" has been replaced by another iterator`, { cause: stack });
            }
            push(y?.valueOf() as V)
          })
            .catch(ex => console.info(ex))
            .finally(() => (v === piped) && (piped = undefined));

          // Early return as we're going to pipe values in later
          return;
        } else {
          if (piped && DEBUG) {
            console.log(`Iterable "${name.toString()}" is already piped from another iterator, and might be overrwitten later`);
          }
          a = box(v, extras);
        }
      }
      push(v?.valueOf() as V);
    },
    enumerable: true
  });
  return obj as any;

  function box<V>(a: V, pds: AsyncExtraIterable<V>): V & AsyncExtraIterable<V> {
    if (a === null || a === undefined) {
      return assignHidden(Object.create(null, {
        valueOf: { value() { return a }, writable: true, configurable: true },
        toJSON: { value() { return a }, writable: true, configurable: true }
      }), pds);
    }
    switch (typeof a) {
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
        // Boxes types, including BigInt
        return assignHidden(Object(a), Object.assign(pds, {
          toJSON() { return a.valueOf() }
        }));
      case 'object':
        // We box objects by creating a Proxy for the object that pushes on get/set/delete, and maps the supplied async iterator to push the specified key
        // The proxies are recursive, so that if an object contains objects, they too are proxied. Objects containing primitives remain proxied to
        // handle the get/set/selete in place of the usual primitive boxing via Object(primitiveValue)
        // @ts-ignore
        return boxObject(a, pds);

    }
    throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
  }

  type WithPath = { [_proxiedAsyncIterator]: { a: V, path: string | null } };
  type PossiblyWithPath = V | WithPath;
  function isProxiedAsyncIterator(o: PossiblyWithPath): o is WithPath {
    return isObjectLike(o) && _proxiedAsyncIterator in o;
  }
  function destructure(o: any, path: string) {
    const fields = path.split('.').slice(1);
    for (let i = 0; i < fields.length && ((o = o?.[fields[i]]) !== undefined); i++);
    return o;
  }
  function boxObject(a: V, pds: AsyncExtraIterable<PossiblyWithPath>) {
    let withPath: AsyncExtraIterable<WithPath[typeof _proxiedAsyncIterator]>;
    let withoutPath: AsyncExtraIterable<V>;
    return new Proxy(a as object, handler()) as V & AsyncExtraIterable<V>;

    function handler(path = ''): ProxyHandler<object> {
      return {
        // A boxed object has its own keys, and the keys of an AsyncExtraIterable
        has(target, key) {
          return key === _proxiedAsyncIterator || key === Symbol.toPrimitive || key in target || key in pds;
        },
        // When a key is set in the target, push the change
        set(target, key, value, receiver) {
          if (Object.hasOwn(pds, key)) {
            throw new Error(`Cannot set ${name.toString()}${path}.${key.toString()} as it is part of asyncIterator`);
          }
          if (Reflect.get(target, key, receiver) !== value) {
            push({ [_proxiedAsyncIterator]: { a, path } } as any);
          }
          return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
          if (Reflect.deleteProperty(target, key)) {
            push({ [_proxiedAsyncIterator]: { a, path } } as any);
            return true;
          }
          return false;
        },
        // When getting the value of a boxed object member, prefer asyncExtraIterable over target keys
        get(target, key, receiver) {
          // If the key is an asyncExtraIterable member, create the mapped queue to generate it
          if (Object.hasOwn(pds, key)) {
            if (!path.length) {
              withoutPath ??= filterMap(pds, o => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator].a : o);
              return withoutPath[key as keyof typeof pds];
            } else {
              withPath ??= filterMap(pds, o => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator] : { a: o, path: null });

              let ai = filterMap(withPath, (o, p) => {
                const v = destructure(o.a, path);
                return p !== v || o.path === null || o.path.startsWith(path) ? v : Ignore;
              }, Ignore, destructure(a, path));
              return ai[key as keyof typeof ai];
            }
          }

          // If the key is a target property, create the proxy to handle it
          if (key === 'valueOf') return () => destructure(a, path);
          if (key === Symbol.toPrimitive) {
            // Special case, since Symbol.toPrimitive is in ha(), we need to implement it
            return function (hint?: 'string' | 'number' | 'default') {
              if (Reflect.has(target, key))
                return Reflect.get(target, key, target).call(target, hint);
              if (hint === 'string') return target.toString();
              if (hint === 'number') return Number(target);
              return target.valueOf();
            }
          }
          if (typeof key === 'string') {
            if ((!(key in target) || Object.hasOwn(target, key)) && !(Iterability in target && target[Iterability] === 'shallow')) {
              const field = Reflect.get(target, key, receiver);
              return (typeof field === 'function') || isAsyncIter(field)
                ? field
                : new Proxy(Object(field), handler(path + '.' + key));
            }
          }
          // This is a symbolic entry, or a prototypical value (since it's in the target, but not a target property)
          return Reflect.get(target, key, receiver);
        }
      }
    }
  }
}

/*
  Extensions to the AsyncIterable:
*/
const forever = new Promise<any>(() => { });

/* Merge asyncIterables into a single asyncIterable */

/* TS hack to expose the return AsyncGenerator a generator of the union of the merged types */
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;

export const merge = <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => {
  const it: (undefined | AsyncIterator<any>)[] = new Array(ai.length);
  const promises: Promise<{ idx: number, result: IteratorResult<any> }>[] = new Array(ai.length);

  let init = () => {
    init = () => { }
    for (let n = 0; n < ai.length; n++) {
      const a = ai[n] as AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>;
      promises[n] = (it[n] = Symbol.asyncIterator in a
        ? a[Symbol.asyncIterator]()
        : a as AsyncIterator<any>)
        .next()
        .then(result => ({ idx: n, result }));
    }
  }

  const results: (TYield | TReturn)[] = [];
  let count = promises.length;

  const merged: AsyncIterableIterator<A[number]> = {
    [Symbol.asyncIterator]() { return merged },
    next() {
      init();
      return count
        ? Promise.race(promises).then(({ idx, result }) => {
          if (result.done) {
            count--;
            promises[idx] = forever;
            results[idx] = result.value;
            // We don't yield intermediate return values, we just keep them in results
            // return { done: count === 0, value: result.value }
            return merged.next();
          } else {
            // `ex` is the underlying async iteration exception
            promises[idx] = it[idx]
              ? it[idx]!.next().then(result => ({ idx, result })).catch(ex => ({ idx, result: { done: true, value: ex } }))
              : Promise.resolve({ idx, result: { done: true, value: undefined } })
            return result;
          }
        }).catch(ex => {
          return merged.throw?.(ex) ?? Promise.reject({ done: true as const, value: new Error("Iterator merge exception") });
        })
        : Promise.resolve({ done: true as const, value: results });
    },
    async return(r) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          results[i] = await it[i]?.return?.({ done: true, value: r }).then(v => v.value, ex => ex);
        }
      }
      return { done: true, value: results };
    },
    async throw(ex: any) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          results[i] = await it[i]?.throw?.(ex).then(v => v.value, ex => ex);
        }
      }
      // Because we've passed the exception on to all the sources, we're now done
      // previously: return Promise.reject(ex);
      return { done: true, value: results };
    }
  };
  return iterableHelpers(merged as unknown as CollapseIterableTypes<A[number]>);
}

type CombinedIterable = { [k: string | number | symbol]: PartialIterable };
type CombinedIterableType<S extends CombinedIterable> = {
  [K in keyof S]?: S[K] extends PartialIterable<infer T> ? T : never
};
type CombinedIterableResult<S extends CombinedIterable> = AsyncExtraIterable<{
  [K in keyof S]?: S[K] extends PartialIterable<infer T> ? T : never
}>;

export interface CombineOptions {
  ignorePartial?: boolean; // Set to avoid yielding if some sources are absent
}

export const combine = <S extends CombinedIterable>(src: S, opts: CombineOptions = {}): CombinedIterableResult<S> => {
  const accumulated: CombinedIterableType<S> = {};
  let pc: Promise<{ idx: number, k: string, ir: IteratorResult<any> }>[];
  let si: AsyncIterator<any>[] = [];
  let active: number = 0;
  const ci = {
    [Symbol.asyncIterator]() { return ci },
    next(): Promise<IteratorResult<CombinedIterableType<S>>> {
      if (pc === undefined) {
        pc = Object.entries(src).map(([k, sit], idx) => {
          active += 1;
          si[idx] = sit[Symbol.asyncIterator]!();
          return si[idx].next().then(ir => ({ si, idx, k, ir }));
        });
      }

      return (function step(): Promise<IteratorResult<CombinedIterableType<S>>> {
        return Promise.race(pc).then(({ idx, k, ir }) => {
          if (ir.done) {
            pc[idx] = forever;
            active -= 1;
            if (!active)
              return { done: true, value: undefined };
            return step();
          } else {
            // @ts-ignore
            accumulated[k] = ir.value;
            pc[idx] = si[idx].next().then(ir => ({ idx, k, ir }));
          }
          if (opts.ignorePartial) {
            if (Object.keys(accumulated).length < Object.keys(src).length)
              return step();
          }
          return { done: false, value: accumulated };
        })
      })();
    },
    return(v?: any) {
      pc.forEach((p, idx) => {
        if (p !== forever) {
          si[idx].return?.(v)
        }
      });
      return Promise.resolve({ done: true, value: v });
    },
    throw(ex: any) {
      pc.forEach((p, idx) => {
        if (p !== forever) {
          si[idx].throw?.(ex)
        }
      });
      return Promise.reject({ done: true, value: ex });
    }
  }
  return iterableHelpers(ci);
}


function isExtraIterable<T>(i: any): i is AsyncExtraIterable<T> {
  return isAsyncIterable(i)
    && extraKeys.every(k => (k in i) && (i as any)[k] === asyncExtras[k]);
}

// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
export function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & AsyncExtraIterable<A extends AsyncIterable<infer T> ? T : unknown> {
  if (!isExtraIterable(ai)) {
    assignHidden(ai, asyncExtras);
  }
  return ai as A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> & A : never
}

export function generatorHelpers<G extends (...args: any[]) => R, R extends AsyncGenerator>(g: G) {
  return function (...args: Parameters<G>): ReturnType<G> {
    const ai = g(...args);
    return iterableHelpers(ai) as ReturnType<G>;
  } as (...args: Parameters<G>) => ReturnType<G> & AsyncExtraIterable<ReturnType<G> extends AsyncGenerator<infer T> ? T : unknown>
}

/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */

/* types that accept Partials as potentiallu async iterators, since we permit this IN TYPING so
  iterable properties don't complain on every access as they are declared as V & Partial<AsyncIterable<V>>
  due to the setters and getters having different types, but undeclarable in TS due to syntax limitations */
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F> =
  F extends () => AsyncIterator<infer T>
  ? T : never;

async function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void> {
  let last: undefined | void | PromiseLike<void> = undefined;
  for await (const u of this as AsyncIterable<HelperAsyncIterable<U>>) {
    last = f?.(u);
  }
  await last;
}

type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;

/* A general filter & mapper that can handle exceptions & returns */
export const Ignore = Symbol("Ignore");

type PartialIterable<T = any> = Partial<AsyncIterable<T>>;

function resolveSync<Z, R>(v: MaybePromised<Z>, then: (v: Z) => R, except: (x: any) => any): MaybePromised<R> {
  if (isPromiseLike(v))
    return v.then(then, except);
  try { return then(v) } catch (ex) { return except(ex) }
}

export function filterMap<U extends PartialIterable, R>(source: U,
  fn: Mapper<HelperAsyncIterable<U>, R>,
  initialValue: R | typeof Ignore = Ignore,
  prev: R | typeof Ignore = Ignore
): AsyncExtraIterable<R> {
  let ai: AsyncIterator<HelperAsyncIterable<U>>;
  const fai: AsyncIterableIterator<R> = {
    [Symbol.asyncIterator]() {
      return fai;
    },

    next(...args: [] | [undefined]) {
      if (initialValue !== Ignore) {
        const init = Promise.resolve({ done: false, value: initialValue });
        initialValue = Ignore;
        return init;
      }

      return new Promise<IteratorResult<R>>(function step(resolve, reject) {
        if (!ai)
          ai = source[Symbol.asyncIterator]!();
        ai.next(...args).then(
          p => p.done
            ? resolve(p)
            : resolveSync(fn(p.value, prev),
              f => f === Ignore
                ? step(resolve, reject)
                : resolve({ done: false, value: prev = f }),
              ex => {
                // The filter function failed...
                ai.throw ? ai.throw(ex) : ai.return?.(ex) // Terminate the source - for now we ignore the result of the termination
                reject({ done: true, value: ex }); // Terminate the consumer
              }
            ),

          ex =>
            // The source threw. Tell the consumer
            reject({ done: true, value: ex })
        ).catch(ex => {
          // The callback threw
          ai.throw ? ai.throw(ex) : ai.return?.(ex); // Terminate the source - for now we ignore the result of the termination
          reject({ done: true, value: ex })
        })
      })
    },

    throw(ex: any) {
      // The consumer wants us to exit with an exception. Tell the source
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(v => ({ done: true, value: v?.value }))
    },

    return(v?: any) {
      // The consumer told us to return, so we need to terminate the source
      return Promise.resolve(ai?.return?.(v)).then(v => ({ done: true, value: v?.value }))
    }
  };
  return iterableHelpers(fai)
}

function map<U extends PartialIterable, R>(this: U, mapper: Mapper<HelperAsyncIterable<U>, R>): AsyncExtraIterable<R> {
  return filterMap(this, mapper);
}

function filter<U extends PartialIterable>(this: U, fn: (o: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>> {
  return filterMap(this, async o => (await fn(o) ? o : Ignore));
}

function unique<U extends PartialIterable>(this: U, fn?: (next: HelperAsyncIterable<U>, prev: HelperAsyncIterable<U>) => boolean | PromiseLike<boolean>): AsyncExtraIterable<HelperAsyncIterable<U>> {
  return fn
    ? filterMap(this, async (o, p) => (p === Ignore || await fn(o, p)) ? o : Ignore)
    : filterMap(this, (o, p) => o === p ? Ignore : o);
}

function initially<U extends PartialIterable, I = HelperAsyncIterable<U>>(this: U, initValue: I): AsyncExtraIterable<HelperAsyncIterable<U> | I> {
  return filterMap(this, o => o, initValue);
}

function waitFor<U extends PartialIterable>(this: U, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncExtraIterable<HelperAsyncIterable<U>> {
  return filterMap(this, o => new Promise<HelperAsyncIterable<U>>(resolve => { cb(() => resolve(o)); return o }));
}

function multi<U extends PartialIterable>(this: U): AsyncExtraIterable<HelperAsyncIterable<U>> {
  type T = HelperAsyncIterable<U>;
  const source = this;
  let consumers = 0;
  let current: DeferredPromise<IteratorResult<T, any>>;
  let ai: AsyncIterator<T, any, undefined> | undefined = undefined;

  // The source has produced a new result
  function step(it?: IteratorResult<T, any>) {
    if (it) current.resolve(it);
    if (!it?.done) {
      current = deferred<IteratorResult<T>>();
      ai!.next()
        .then(step)
        .catch(error => current.reject({ done: true, value: error }));
    }
  }

  const mai: AsyncIterableIterator<T> = {
    [Symbol.asyncIterator]() {
      consumers += 1;
      return mai;
    },

    next() {
      if (!ai) {
        ai = source[Symbol.asyncIterator]!();
        step();
      }
      return current//.then(zalgo => zalgo);
    },

    throw(ex: any) {
      // The consumer wants us to exit with an exception. Tell the source if we're the final one
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: ex });
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(v => ({ done: true, value: v?.value }))
    },

    return(v?: any) {
      // The consumer told us to return, so we need to terminate the source if we're the only one
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: v });
      return Promise.resolve(ai?.return?.(v)).then(v => ({ done: true, value: v?.value }))
    }
  };
  return iterableHelpers(mai);
}

export function augmentGlobalAsyncGenerators() {
  let g = (async function* () { })();
  while (g) {
    const desc = Object.getOwnPropertyDescriptor(g, Symbol.asyncIterator);
    if (desc) {
      iterableHelpers(g);
      break;
    }
    g = Object.getPrototypeOf(g);
  }
  if (!g) {
    console.warn("Failed to augment the prototype of `(async function*())()`");
  }
}

