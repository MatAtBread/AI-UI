import { DEBUG } from "./debug.js";
import { DeferredPromise, deferred } from "./deferred.js";
import { IterableProperties } from "./tags.js";

/* Things to suppliement the JS base AsyncIterable */
export interface QueueIteratableIterator<T> extends AsyncIterableIterator<T> {
  push(value: T): boolean;
};
export interface PushIterator<T> extends AsyncExtraIterable<T> {
  push(value: T): boolean;
  close(ex?: Error): void;  // Tell the consumer(s) we're done, with an optional error
};
export type BroadcastIterator<T> = PushIterator<T>;

export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers { }

export function isAsyncIterator<T = unknown>(o: any | AsyncIterator<T>): o is AsyncIterator<T> {
  return typeof o?.next === 'function';
}
export function isAsyncIterable<T = unknown>(o: any | AsyncIterable<T>): o is AsyncIterable<T> {
  return o && o[Symbol.asyncIterator] && typeof o[Symbol.asyncIterator] === 'function';
}
export function isAsyncIter<T = unknown>(o: any | AsyncIterable<T> | AsyncIterator<T>): o is AsyncIterable<T> | AsyncIterator<T> {
  return isAsyncIterable(o) || isAsyncIterator(o);
}

export type AsyncProvider<T> = AsyncIterator<T> | AsyncIterable<T>;

export function asyncIterator<T>(o: AsyncProvider<T>) {
  if (isAsyncIterable(o)) return o[Symbol.asyncIterator]();
  if (isAsyncIterator(o)) return o;
  throw new Error("Not as async provider");
}

type AsyncIterableHelpers = typeof asyncExtras;
const asyncExtras = {
  map,
  filter,
  unique,
  waitFor,
  multi,
  broadcast,
  initially,
  consume,
  merge<T, A extends Partial<AsyncIterable<any>>[]>(this: Partial<AsyncIterable<T>>, ...m: A) {
    return merge(this, ...m);
  }
};

export function queueIteratableIterator<T>(stop = () => { }) {
  let _pending = [] as DeferredPromise<IteratorResult<T>>[] | null;
  let _items = [] as T[] | null;

  const q: QueueIteratableIterator<T> = {
    [Symbol.asyncIterator]() {
      return q;
    },

    next() {
      if (_items!.length) {
        return Promise.resolve({ done: false, value: _items!.shift()! });
      }

      const value = deferred<IteratorResult<T>>();
      // We install a catch handler as the promise might be legitimately reject before anything waits for it,
      // and q suppresses the uncaught exception warning.
      value.catch(ex => { });
      _pending!.push(value);
      return value;
    },

    return() {
      const value = { done: true as const, value: undefined };
      if (_pending) {
        try { stop() } catch (ex) { }
        while (_pending.length)
          _pending.shift()!.resolve(value);
        _items = _pending = null;
      }
      return Promise.resolve(value);
    },

    throw(...args: any[]) {
      const value = { done: true as const, value: args[0] };
      if (_pending) {
        try { stop() } catch (ex) { }
        while (_pending.length)
          _pending.shift()!.reject(value);
        _items = _pending = null;
      }
      return Promise.reject(value);
    },

    push(value: T) {
      if (!_pending) {
        //throw new Error("queueIterator has stopped");
        return false;
      }
      if (_pending.length) {
        _pending.shift()!.resolve({ done: false, value });
      } else {
        _items!.push(value);
      }
      return true;
    }
  };
  return iterableHelpers(q);
}

/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  unique values from the queue (ie: the queue is SHARED not duplicated)
*/
export function pushIterator<T>(stop = () => { }, bufferWhenNoConsumers = false): PushIterator<T> {
  let consumers = 0;
  let ai: QueueIteratableIterator<T> = queueIteratableIterator<T>(() => {
    consumers -= 1;
    if (consumers === 0 && !bufferWhenNoConsumers) {
      try { stop() } catch (ex) { }
      // This should never be referenced again, but if it is, it will throw
      (ai as any) = null;
    }
  });

  return Object.assign(Object.create(asyncExtras) as AsyncExtraIterable<T>, {
    [Symbol.asyncIterator]() {
      consumers += 1;
      return ai;
    },
    push(value: T) {
      if (!bufferWhenNoConsumers && consumers === 0) {
        // No one ready to read the results
        return false;
      }
      return ai.push(value);
    },
    close(ex?: Error) {
      ex ? ai.throw?.(ex) : ai.return?.();
      // This should never be referenced again, but if it is, it will throw
      (ai as any) = null;
    }
  });
}

/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  a copy of the values from the queue (ie: the queue is BROADCAST not shared).

  The iterators stops running when the number of consumers decreases to zero
*/
export function broadcastIterator<T>(stop = () => { }): BroadcastIterator<T> {
  let ai = new Set<QueueIteratableIterator<T>>();

  const b = <BroadcastIterator<T>>Object.assign(Object.create(asyncExtras) as AsyncExtraIterable<T>, {
    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
      const added = queueIteratableIterator<T>(() => {
        ai.delete(added);
        if (ai.size === 0) {
          try { stop() } catch (ex) { }
          // This should never be referenced again, but if it is, it will throw
          (ai as any) = null;
        }
      });
      ai.add(added);
      return iterableHelpers(added);
    },
    push(value: T) {
      if (!ai?.size)
        return false;

      for (const q of ai.values()) {
        q.push(value);
      }
      return true;
    },
    close(ex?: Error) {
      for (const q of ai.values()) {
        ex ? q.throw?.(ex) : q.return?.();
      }
      // This should never be referenced again, but if it is, it will throw
      (ai as any) = null;
    }
  });
  return b;
}

/* Define a "iterable property" on `obj`.
   This is a property that holds a boxed (within an Object() call) value, and is also an AsyncIterableIterator. which
   yields when the property is set.
   This routine creates the getter/setter for the specified property, and manages the aassociated async iterator.
*/

declare global {
  interface ObjectConstructor {
    defineProperties<T, M extends { [K: string | symbol]: TypedPropertyDescriptor<any> }>(o: T, properties: M & ThisType<any>): T & {
      [K in keyof M]: M[K] extends TypedPropertyDescriptor<infer T> ? T : never
    };
  }
}

export const Iterability = Symbol("Iterability");
export type Iterability<Depth extends 'shallow' = 'shallow'> = { [Iterability]: Depth };

export function defineIterableProperty<T extends {}, N extends string | symbol, V>(obj: T, name: N, v: V): T & IterableProperties<Record<N, V>> {
  // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
  // access the iterator methods to prevent leaks where an iterable is created, but
  // never referenced, and therefore cannot be consumed and ultimately closed
  let initIterator = () => {
    initIterator = () => b;
    // This *should* work (along with the multi call below, but is defeated by the lazy initialization? &/| unbound methods?)
    //const bi = pushIterator<V>();
    //const b = bi.multi()[Symbol.asyncIterator]();
    const bi = broadcastIterator<V>();
    const b = bi[Symbol.asyncIterator]();
    extras[Symbol.asyncIterator] = { value: bi[Symbol.asyncIterator], enumerable: false, writable: false };
    push = bi.push;
    Object.keys(asyncExtras).forEach(k =>
      extras[k as keyof typeof extras] = {
        // @ts-ignore - Fix
        value: b[k as keyof typeof b],
        enumerable: false,
        writable: false
      }
    )
    Object.defineProperties(a, extras);
    return b;
  }

  // Create stubs that lazily create the AsyncExtraIterable interface when invoked
  function lazyAsyncMethod<M extends keyof typeof asyncExtras>(method: M) {
    return function(this: unknown, ...args: any[]) {
      initIterator();
      // @ts-ignore - Fix
      return a[method].call(this, ...args);
    } as (typeof asyncExtras)[M];
  }

  type HelperDescriptors<T> = {
    [K in keyof AsyncExtraIterable<T>]: TypedPropertyDescriptor<AsyncExtraIterable<T>[K]>
  } & {
    [Iterability]?: TypedPropertyDescriptor<'shallow'>
  };

  const extras = {
    [Symbol.asyncIterator]: {
      enumerable: false,
      writable: true,
      value: initIterator
    }
  } as HelperDescriptors<V>;

  (Object.keys(asyncExtras) as (keyof typeof asyncExtras)[]).forEach((k) =>
    extras[k] = {
      enumerable: false,
      writable: true,
      // @ts-ignore - Fix
      value: lazyAsyncMethod(k)
    }
  )

  // Lazily initialize `push`
  let push: QueueIteratableIterator<V>['push'] = (v: V) => {
    initIterator(); // Updates `push` to reference the multi-queue
    return push(v);
  }

  if (typeof v === 'object' && v && Iterability in v) {
    extras[Iterability] = Object.getOwnPropertyDescriptor(v, Iterability)!;
  }

  let a = box(v, extras);
  let piped = false;

  Object.defineProperty(obj, name, {
    get(): V { return a },
    set(v: V) {
      if (v !== a) {
        if (piped) {
          throw new Error(`Iterable "${name.toString()}" is already consuming another iterator`)
        }
        if (isAsyncIterable(v)) {
          // Need to make this lazy really - difficult since we don't
          // know if anyone has already started consuming it. Since assigning
          // multiple async iterators to a single iterable is probably a bad idea
          // (since what do we do: merge? terminate the first then consume the second?),
          // the solution here (one of many possibilities) is only to allow ONE lazy
          // assignment if and only if this iterable property has not been 'get' yet.
          // However, this would at present possibly break the initialisation of iterable
          // properties as the are initialized by auto-assignment, if it were initialized
          // to an async iterator
          piped = true;
          if (DEBUG)
            console.info('(AI-UI)',
              new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`));
          consume.call(v,v => { push(v?.valueOf() as V) }).finally(() => piped = false);
        } else {
          a = box(v, extras);
        }
      }
      push(v?.valueOf() as V);
    },
    enumerable: true
  });
  return obj as any;

  function box<V>(a: V, pds: HelperDescriptors<V>): V & AsyncExtraIterable<V> {
    let boxedObject = Ignore as unknown as (V & AsyncExtraIterable<V> & Partial<Iterability>);
    if (a === null || a === undefined) {
      return Object.create(null, {
        ...pds,
        valueOf: { value() { return a }, writable: true },
        toJSON: { value() { return a }, writable: true }
      });
    }
    switch (typeof a) {
      case 'object':
        /* TODO: This is problematic as the object might have clashing keys and nested members.
          The current implementation:
          * Spreads iterable objects in to a shallow copy of the original object, and overrites clashing members like `map`
          *     this.iterableObj.map(o => o.field);
          * The iterator will yield on
          *     this.iterableObj = newValue;

          * Members access is proxied, so that:
          *     (set) this.iterableObj.field = newValue;
          * ...causes the underlying object to yield by re-assignment (therefore calling the setter)
          * Similarly:
          *     (get) this.iterableObj.field
          * ...causes the iterator for the base object to be mapped, like
          *     this.iterableObject.map(o => o[field])
        */
        if (!(Symbol.asyncIterator in a)) {
          // @ts-expect-error - Ignore is the INITIAL value
          if (boxedObject === Ignore) {
            if (DEBUG)
              console.info('(AI-UI)', `The iterable property '${name.toString()}' of type "object" will be spread to prevent re-initialisation.\n${new Error().stack?.slice(6)}`);
            if (Array.isArray(a))
              boxedObject = Object.defineProperties([...a] as V, pds);
            else
              boxedObject = Object.defineProperties({ ...(a as V) }, pds);
          } else {
            Object.assign(boxedObject, a);
          }
          if (boxedObject[Iterability] === 'shallow') {
            /*
            BROKEN: fails nested properties
            Object.defineProperty(boxedObject, 'valueOf', {
              value() {
                return boxedObject
              },
              writable: true
            });
            */
            return boxedObject;
          }
          // else proxy the result so we can track members of the iterable object

          return new Proxy(boxedObject, {
            // Implement the logic that fires the iterator by re-assigning the iterable via it's setter
            set(target, key, value, receiver) {
              if (Reflect.set(target, key, value, receiver)) {
                // @ts-ignore - Fix
                push(obj[name]);
                return true;
              }
              return false;
            },
            // Implement the logic that returns a mapped iterator for the specified field
            get(target, key, receiver) {
              // Only used to determine if this value is a Proxy or not
              if (key === Symbol.unscopables)
                return target;
              if (key === 'valueOf')
                return ()=>boxedObject;
              const targetProp = Reflect.getOwnPropertyDescriptor(target,key);
              // We include `targetProp === undefined` so we can nested monitor properties that are actually defined (yet)
              // Note: this only applies to object iterables (since the root ones aren't proxied), but it does allow us to have
              // defintions like:
              //   iterable: { stuff: as Record<string, string | number ... }
              if (targetProp === undefined || targetProp.enumerable) {
                if (targetProp === undefined) {
                  // @ts-ignore - Fix
                  target[key] = undefined;
                }
                const realValue = Reflect.get(boxedObject as Exclude<typeof boxedObject, typeof Ignore>, key, receiver);
                const props = Object.getOwnPropertyDescriptors(boxedObject.map((o,p) => {
                  const ov = o?.[key as keyof typeof o]?.valueOf();
                  const pv = p?.valueOf();
                  if (typeof ov === typeof pv && ov == pv)
                    return Ignore;
                  return o?.[key as keyof typeof o]
                }));
                (Reflect.ownKeys(props) as (keyof typeof props)[]).forEach(k => props[k].enumerable = false);
                // @ts-ignore - Fix
                return box(realValue, props);
              }
              return Reflect.get(target, key, receiver);
            },
          });
        }
        return a as (V & AsyncExtraIterable<V>);
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
        // Boxes types, including BigInt
        return Object.defineProperties(Object(a), {
          ...pds,
          toJSON: { value() { return a.valueOf() }, writable: true }
        });
    }
    throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
  }
}

/*
  Extensions to the AsyncIterable:
*/

/* Merge asyncIterables into a single asyncIterable */

/* TS hack to expose the return AsyncGenerator a generator of the union of the merged types */
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;

export const merge = <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => {
  const it: (undefined | AsyncIterator<any>)[] = new Array(ai.length);
  const promises: Promise<{idx: number, result: IteratorResult<any>}>[] = new Array(ai.length);

  let init = () => {
    init = ()=>{}
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
  const forever = new Promise<any>(() => { });
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
              ? it[idx]!.next().then(result => ({ idx, result })).catch(ex => ({ idx, result: { done: true, value: ex }}))
              : Promise.resolve({ idx, result: {done: true, value: undefined} })
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

function isExtraIterable<T>(i: any): i is AsyncExtraIterable<T> {
  return isAsyncIterable(i)
    && Object.keys(asyncExtras)
      .every(k => (k in i) && (i as any)[k] === asyncExtras[k as keyof AsyncIterableHelpers]);
}

// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
export function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & AsyncExtraIterable<A extends AsyncIterable<infer T> ? T : unknown> {
  if (!isExtraIterable(ai)) {
    Object.defineProperties(ai, 
      Object.fromEntries(
        Object.entries(Object.getOwnPropertyDescriptors(asyncExtras)).map(([k,v]) => [k,{...v, enumerable: false}]
        )
      )
    );
    //Object.assign(ai, asyncExtras);
  }
  return ai as A extends AsyncIterable<infer T> ? A & AsyncExtraIterable<T> : never
}

export function generatorHelpers<G extends (...args: any[]) => R, R extends AsyncGenerator>(g: G) {
  return function (...args:Parameters<G>): ReturnType<G> {
    const ai = g(...args);
    return iterableHelpers(ai) as ReturnType<G>;
  } as ReturnType<G> & AsyncExtraIterable<ReturnType<G> extends AsyncGenerator<infer T> ? T : unknown>
}

/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */

/* types that accept Partials as potentiallu async iterators, since we permit this IN TYPING so
  iterable properties don't complain on every access as they are declared as V & Partial<AsyncIterable<V>>
  due to the setters and getters having different types, but undeclarable in TS due to syntax limitations */
type HelperAsyncIterable<Q extends Partial<AsyncIterable<any>>> = HelperAsyncIterator<Required<Q>[typeof Symbol.asyncIterator]>;
type HelperAsyncIterator<F, And = {}, Or = never> =
  F extends ()=>AsyncIterator<infer T>
  ? T : never;

async function consume<U extends Partial<AsyncIterable<any>>>(this: U, f?: (u: HelperAsyncIterable<U>) => void | PromiseLike<void>): Promise<void> {
  let last: unknown = undefined;
  for await (const u of this as AsyncIterable<HelperAsyncIterable<U>>)
    last = f?.(u);
  await last;
}

type Mapper<U, R> = ((o: U, prev: R | typeof Ignore) => R | PromiseLike<R | typeof Ignore>);
type MaybePromised<T> = PromiseLike<T> | T;

/* A general filter & mapper that can handle exceptions & returns */
export const Ignore = Symbol("Ignore");

type PartialIterable = Partial<AsyncIterable<any>>;

export function filterMap<U extends PartialIterable, R>(source: U,
  fn: (o: HelperAsyncIterable<U>, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>,
  initialValue: R | typeof Ignore = Ignore
): AsyncExtraIterable<R> {
  let ai: AsyncIterator<HelperAsyncIterable<U>>;
  let prev: R | typeof Ignore = Ignore;
  const fai: AsyncIterableIterator<R> = {
    [Symbol.asyncIterator]() {
      return this;
    },

    next(...args: [] | [undefined]) {
      if (initialValue !== Ignore) {
        const init = Promise.resolve(initialValue).then(value => ({ done: false, value }));
        initialValue = Ignore;
        return init;
      }

      return new Promise<IteratorResult<R>>(function step(resolve, reject) {
        if (!ai)
          ai = source[Symbol.asyncIterator]!();
        ai.next(...args).then(
          p => p.done
            ? resolve(p)
            : Promise.resolve(fn(p.value, prev)).then(
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
      return this;
    },

    next() {
      if (!ai) {
        ai = source[Symbol.asyncIterator]!();
        step();
      }
      return current;
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

function broadcast<U extends PartialIterable>(this: U) {
  type T = HelperAsyncIterable<U>;
  const ai = this[Symbol.asyncIterator]!();
  const b = broadcastIterator<T>(() => ai.return?.());
  (function step() {
    ai.next().then(v => {
      if (v.done) {
        // Meh - we throw these away for now.
        // console.log(".broadcast done");
      } else {
        b.push(v.value);
        step();
      }
    }).catch(ex => b.close(ex));
  })();

  const bai: AsyncIterable<T> = {
    [Symbol.asyncIterator]() {
      return b[Symbol.asyncIterator]();
    }
  };
  return iterableHelpers(bai)
}

//export const asyncHelperFunctions = { map, filter, unique, waitFor, multi, broadcast, initially, consume, merge };
