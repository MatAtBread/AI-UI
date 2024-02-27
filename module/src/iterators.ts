import { DEBUG } from "./debug.js";
import { DeferredPromise, deferred } from "./deferred.js";

/* Things to suppliement the JS base AsyncIterable */
export type QueueIteratableIterator<T> = AsyncIterableIterator<T> & {
  push(value: T): boolean;
};
export type PushIterator<T> = AsyncExtraIterable<T> & {
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

/* A function that wraps a "prototypical" AsyncIterator helper, that has `this:AsyncIterable<T>` and returns
  something that's derived from AsyncIterable<R>, result in a wrapped function that accepts
  the same arguments returns a AsyncExtraIterable<X>
*/
function wrapAsyncHelper<T, Args extends any[], R, X extends AsyncIterable<R>>(fn: (this: AsyncIterable<T>, ...args: Args) => X) {
  return function (this: Partial<AsyncIterable<T>>, ...args: Args) { return iterableHelpers(fn.call(this as AsyncIterable<T>, ...args)) }
}

type AsyncIterableHelpers = typeof asyncExtras;
export const asyncExtras = {
  // throttle: wrapAsyncHelper(throttle),
  // debounce: wrapAsyncHelper(debounce),
  // count: wrapAsyncHelper(count),
  // retain: wrapAsyncHelper(retain),
  map: wrapAsyncHelper(map),
  filter: wrapAsyncHelper(filter),
  unique: wrapAsyncHelper(unique),
  waitFor: wrapAsyncHelper(waitFor),
  multi: wrapAsyncHelper(multi),
  broadcast: wrapAsyncHelper(broadcast),
  initially: wrapAsyncHelper(initially),
  consume: consume,
  merge<T, A extends Partial<AsyncIterable<any>>[]>(this: Partial<AsyncIterable<T>>, ...m: A) {
    return merge(this, ...m);
  }
};

function queueIteratableIterator<T>(stop = () => { }): QueueIteratableIterator<T> {
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
  return q;
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
export function defineIterableProperty<T extends {}, N extends string | number | symbol, V>(obj: T, name: N, v: V): T & { [n in N]: V & AsyncExtraIterable<V> } {
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
    Object.keys(asyncHelperFunctions).map(k =>
      extras[k as keyof typeof extras] = { value: b[k as keyof typeof b], enumerable: false, writable: false }
    )
    Object.defineProperties(a, extras);
    return b;
  }

  // Create stubs that lazily create the AsyncExtraIterable interface when invoked
  const lazyAsyncMethod = (method: string) => function (this: unknown, ...args: any[]) {
    initIterator();
    return a[method].call(this, ...args);
  }

  const extras: Record<keyof typeof asyncHelperFunctions | typeof Symbol.asyncIterator, PropertyDescriptor> = {
    [Symbol.asyncIterator]: {
      enumerable: false, writable: true,
      value: initIterator
    }
  } as Record<keyof typeof asyncHelperFunctions | typeof Symbol.asyncIterator, PropertyDescriptor>;

  Object.keys(asyncHelperFunctions).map(k =>
    extras[k as keyof typeof extras] = {
      enumerable: false,
      writable: true,
      value: lazyAsyncMethod(k)
    }
  )

  // Lazily initialize `push`
  let push: QueueIteratableIterator<V>['push'] = (v: V) => {
    initIterator(); // Updates `push` to reference the multi-queue
    return push(v);
  }

  let a = box(v, extras);

  Object.defineProperty(obj, name, {
    get(): V { return a },
    set(v: V) {
      a = box(v, extras);
      push(v?.valueOf() as V);
    },
    enumerable: true
  });
  return obj as any;
}

function box(a: unknown, pds: Record<string | symbol, PropertyDescriptor>) {
  if (a === null || a === undefined) {
    return Object.create(null, {
      ...pds,
      valueOf: { value() { return a } },
      toJSON: { value() { return a } }
    });
  }
  switch (typeof a) {
    case 'object':
      /* TODO: This is problematic as the object might have clashing keys.
        The alternatives are:
        - Don't add the pds, then the object remains unmolested, but can't be used with .map, .filter, etc
        - examine the object and decide whether to insert the prototype (breaks built in objects, works with PoJS)
        - don't allow objects as iterable properties, which avoids the `deep tree` problem
        - something else
      */
      if (!(Symbol.asyncIterator in a)) {
        if (DEBUG)
          console.warn('Iterable properties of type "object" will be spread to prevent re-initialisation.', a);
        return Object.defineProperties({ ...a }, pds);
      }
      return a;
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'string':
      // Boxes types, including BigInt
      return Object.defineProperties(Object(a), {
        ...pds,
        toJSON: { value() { return a.valueOf() } }
      });
  }
  throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
}

/* Merge asyncIterables into a single asyncIterable */

/* TS hack to expose the return AsyncGenerator a generator of the union of the merged types */
type CollapseIterableType<T> = T[] extends Partial<AsyncIterable<infer U>>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;

export const merge = <A extends Partial<AsyncIterable<TYield> | AsyncIterator<TYield, TReturn, TNext>>[], TYield, TReturn, TNext>(...ai: A) => {
  const it = (ai as AsyncIterable<any>[]).map(i => Symbol.asyncIterator in i ? i[Symbol.asyncIterator]() : i);
  const promises = it.map((i, idx) => i.next().then(result => ({ idx, result })));
  const results: (TYield | TReturn)[] = [];
  const forever = new Promise<any>(() => { });
  let count = promises.length;
  const merged: AsyncIterableIterator<A[number]> = {
    [Symbol.asyncIterator]() { return merged },
    next() {
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
            promises[idx] = it[idx].next().then(result => ({ idx, result })).catch(ex => ({ idx, result: ex }));
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
          results[i] = await it[i].return?.({ done: true, value: r }).then(v => v.value, ex => ex);
        }
      }
      return { done: true, value: results };
    },
    async throw(ex: any) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          results[i] = await it[i].throw?.(ex).then(v => v.value, ex => ex);
        }
      }
      // Because we've passed the exception on to all the sources, we're now done
      // previously: return Promise.reject(ex);
      return { done: true, value: results };
    }
  };
  return iterableHelpers(merged as unknown as CollapseIterableTypes<A[number]>);
}

/*
  Extensions to the AsyncIterable:
  calling `bind(ai)` adds "standard" methods to the specified AsyncIterable
*/

function isExtraIterable<T>(i: any): i is AsyncExtraIterable<T> {
  return isAsyncIterable(i)
    && Object.keys(asyncExtras)
      .every(k => (k in i) && (i as any)[k] === asyncExtras[k as keyof AsyncIterableHelpers]);
}

// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
export function iterableHelpers<A extends AsyncIterable<any>>(ai: A): A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never) {
  if (!isExtraIterable(ai)) {
    Object.assign(ai, asyncExtras);
  }
  return ai as A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never)
}

export function generatorHelpers<G extends (...args: A) => AsyncGenerator, A extends any[]>(g: G)
  : (...args: Parameters<G>) => ReturnType<G> & (ReturnType<G> extends AsyncGenerator<infer Y> ? AsyncExtraIterable<Y> : never) {
  // @ts-ignore: TS type madness
  return function (...args: A) {
    return iterableHelpers(g(...args))
  }
}

/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */
type Mapper<U, R> = ((o: U) => R | PromiseLike<R>);
type MaybePromised<T> = PromiseLike<T> | T;

/* A general filter & mapper that can handle exceptions & returns */
export const Ignore = Symbol("Ignore");
export function filterMap<U, R>(source: AsyncIterable<U>,
  fn: (o: U, prev: R | typeof Ignore) => MaybePromised<R | typeof Ignore>,
  initialValue: R | typeof Ignore = Ignore
): AsyncIterableIterator<R> {
  const ai = source[Symbol.asyncIterator]();
  let prev: R | typeof Ignore = Ignore;
  return {
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
        ai.next(...args).then(
          p => p.done
            ? resolve(p)
            : Promise.resolve(fn(p.value, prev))/*new Promise<R | typeof Ignore>(pass => pass(fn(p.value, prev)))*/.then(
              f => f === Ignore
                ? step(resolve, reject)
                : resolve({ done: false, value: prev = f }),
              ex => {
                // The filter function failed...
                ai.throw ? ai.throw(ex) : ai.return?.(ex) // ?.then(r => r, ex => ex); // Terminate the source - for now we ignore the result of the termination
                reject({ done: true, value: ex }); // Terminate the consumer
              }
            ),

          ex =>
            // The source threw. Tell the consumer
            reject({ done: true, value: ex })
        )
      })
    },

    throw(ex: any) {
      // The consumer wants us to exit with an exception. Tell the source
      return Promise.resolve(ai.throw ? ai.throw(ex) : ai.return?.(ex)).then(v => ({ done: true, value: v?.value }))
    },

    return(v?: any) {
      // The consumer told us to return, so we need to terminate the source
      return Promise.resolve(ai.return?.(v)).then(v => ({ done: true, value: v?.value }))
    }
  }
}

function map<U, R>(this: AsyncIterable<U>, mapper: Mapper<U, R>) {
  return filterMap(this, mapper);
}

function filter<U>(this: AsyncIterable<U>, fn: (o: U) => boolean | PromiseLike<boolean>) {
  return filterMap(this, async o => (await fn(o) ? o : Ignore));
}

function unique<U>(this: AsyncIterable<U>, fn?: (next: U, prev: U) => boolean | PromiseLike<boolean>): AsyncIterableIterator<U> {
  return fn
    ? filterMap(this, async (o, p) => (p === Ignore || await fn(o, p)) ? o : Ignore)
    : filterMap(this, (o, p) => o === p ? Ignore : o);
}

function initially<U, I = U>(this: AsyncIterable<U>, initValue: I): AsyncIterable<U | I> {
  return filterMap(this as AsyncIterable<U | I>, o => o, initValue);
}

function waitFor<U>(this: AsyncIterable<U>, cb: (done: (value: void | PromiseLike<void>) => void) => void) {
  return filterMap(this, o => new Promise<U>(resolve => { cb(() => resolve(o)); return o }));
}

function multi<T>(this: AsyncIterable<T>): AsyncIterableIterator<T> {
  const source = this;
  let consumers = 0;
  let current = deferred<IteratorResult<T>>();
  let ai: AsyncIterator<T, any, undefined>;

  return {
    [Symbol.asyncIterator]() {
      // Someone wants to start consuming. Start the source if we're the first
      if (!consumers) {
        // The source has produced a new result
        function update(it: IteratorResult<T, any>) {
          current.resolve(it);
          if (!it.done) {
            current = deferred<IteratorResult<T>>();
            ai.next().then(update).catch(error);
          }
        }

        // The source has errored, reject any consumers and reset the iterator
        function error(reason: any) {
          current.reject({ done: true, value: reason });
        }

        ai = source[Symbol.asyncIterator]()
        ai.next().then(update).catch(error);
      }
      consumers += 1;
      return this;
    },

    next() {
      return current;
    },
    throw(ex: any) {
      // The consumer wants us to exit with an exception. Tell the source if we're the final one
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: ex });
      return Promise.resolve(ai.throw ? ai.throw(ex) : ai.return?.(ex)).then(v => ({ done: true, value: v?.value }))
    },

    return(v?: any) {
      // The consumer told us to return, so we need to terminate the source if we're the only one
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: v });
      return Promise.resolve(ai.return?.(v)).then(v => ({ done: true, value: v?.value }))
    }
  };
}

function broadcast<U>(this: AsyncIterable<U>): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  const b = broadcastIterator<U>(() => ai.return?.());
  (function update() {
    ai.next().then(v => {
      if (v.done) {
        // Meh - we throw these away for now.
        // console.log(".broadcast done");
      } else {
        b.push(v.value);
        update();
      }
    }).catch(ex => b.close(ex));
  })();

  return {
    [Symbol.asyncIterator]() {
      return b[Symbol.asyncIterator]();
    }
  }
}

async function consume<U>(this: Partial<AsyncIterable<U>>, f?: (u: U) => void | PromiseLike<void>): Promise<void> {
  let last: unknown = undefined;
  for await (const u of this as AsyncIterable<U>)
    last = f?.(u);
  await last;
}

const asyncHelperFunctions = { map, filter, unique, waitFor, multi, broadcast, initially, consume, merge };
