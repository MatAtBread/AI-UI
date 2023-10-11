import { isAsyncIterable } from "./ai-ui.js";
import { DeferredPromise, deferred } from "./deferred.js";

/* Things to suppliement the JS base AsyncIterable */

export type PushIterator<T> = AsyncExtraIterable<T> & {
  push(value: T): boolean;  // Push a new value to consumers
  close(ex?: Error): void;  // Tell the consumer we're done, with an optional error
};
export type BroadcastIterator<T> = PushIterator<T>;

export interface AsyncExtraIterable<T> extends AsyncIterable<T>, AsyncIterableHelpers {}

/* A function that wraps a "prototypical" AsyncIterator helper, that has `this:AsyncIterable<T>` and returns
  something that's derived from AsyncIterable<R>, result in a wrapped function that accepts
  the same arguments returns a AsyncExtraIterable<X>
*/
function wrapAsyncHelper<T, Args extends any[], R, X extends AsyncIterable<R>>(fn: (this: AsyncIterable<T>, ...args: Args) => X) {
  return function(this: AsyncIterable<T>, ...args:Args) { return withHelpers(fn.call(this, ...args)) }
}

type AsyncIterableHelpers = typeof asyncExtras;
export const asyncExtras = {
  map: wrapAsyncHelper(map),
  filter: wrapAsyncHelper(filter),
  throttle: wrapAsyncHelper(throttle),
  debounce: wrapAsyncHelper(debounce),
  waitFor: wrapAsyncHelper(waitFor),
  count: wrapAsyncHelper(count),
  retain: wrapAsyncHelper(retain),
  broadcast: wrapAsyncHelper(broadcast),
  initially: wrapAsyncHelper(initially),
  consume
};

class QueueIteratableIterator<T> implements AsyncIterableIterator<T> {
  private _pending = [] as DeferredPromise<IteratorYieldResult<T>>[];
  private _items = [] as T[];

  constructor(private readonly stop = () => { }) {
  }

  [Symbol.asyncIterator](this: AsyncIterableIterator<T>) {
    return this;
  }

  next() {
    if (this._items.length) {
      return Promise.resolve({ done: false, value: this._items.shift()! });
    } 
    
    const value = deferred<IteratorYieldResult<T>>();
    this._pending.push(value);
    return value;
  }

  return() {
    const value = { done: true as const, value: undefined };
    if (this._pending) {
      try { this.stop() } catch (ex) { }
      while(this._pending.length)
        this._pending.shift()!.reject(value);
      this._items.splice(0, this._items.length);
    }
    return Promise.resolve(value);
  }

  throw(...args: any[]) {
    const value = { done: true as const, value: args[0] };
    if (this._pending) {
      try { this.stop() } catch (ex) { }
      while(this._pending.length)
        this._pending.shift()!.reject(value);
      this._items.splice(0, this._items.length);
    }
    return Promise.resolve(value);
  }

  push(value: T) {
    if (!this._pending) {
      //throw new Error("pushIterator has stopped");
      return true;
    }
    if (this._pending.length) {
      this._pending.shift()!.resolve({ done: false, value });
    } else {
      this._items.push(value);
    }
    return false;
  }
}

/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  unique values from the queue (ie: the queue is SHARED not duplicated)
*/
export function pushIterator<T>(stop = () => { }, bufferWhenNoConsumers = false): PushIterator<T> {
  let consumers = 0;
  let ai: QueueIteratableIterator<T> = new QueueIteratableIterator<T>(() => {
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

  return <BroadcastIterator<T>>Object.assign(Object.create(asyncExtras) as AsyncExtraIterable<T>, {
    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
      const added = new QueueIteratableIterator<T>(() => {
        ai.delete(added);
        if (ai.size === 0) {
          try { stop() } catch (ex) { }
          // This should never be referenced again, but if it is, it will throw
          (ai as any) = null;
        }
      });
      ai.add(added);
      return withHelpers(added);
    },
    push(value: T) {
      if (!ai?.size)
        return false;

      for (const q of ai.values()) {
        q.push(value);
      }
    },
    close(ex?: Error) {
      for (const q of ai.values()) {
        ex ? q.throw?.(ex) : q.return?.();
      }
      // This should never be referenced again, but if it is, it will throw
      (ai as any) = null;
    }
  });
}

/* Merge asyncIterables into a single asyncIterable */

/* TS hack to expose the return AsyncGenerator a generator of the union of the merged types */
type CollapseIterableType<T> = T[] extends AsyncIterable<infer U>[] ? U : never;
type CollapseIterableTypes<T> = AsyncIterable<CollapseIterableType<T>>;

export const merge = <A extends AsyncIterable<any>[]>(...ai: A) => {
  const it = ai.map(i => Symbol.asyncIterator in i ? i[Symbol.asyncIterator]() : i);
  const promises = it.map((i, idx) => i.next().then(result => ({ idx, result })));
  const results: CollapseIterableType<A[number]>[] = [];
  const forever = new Promise<any>(() => { });
  let count = promises.length;
  const merged: AsyncIterableIterator<A[number]> = {
    [Symbol.asyncIterator]() { return this },
    next() {
      return count 
        ? Promise.race(promises).then(({ idx, result }) => {
          if (result.done) {
            count--;
            promises[idx] = forever;
            results[idx] = result.value;
            return { done: count === 0, value: result.value }
          } else {
            promises[idx] = it[idx].next().then(result => ({ idx, result }));
            return result;
          }
        }).catch(ex => {
          return this.throw?.(ex) ?? Promise.reject({ done: true as const, value: new Error("Iterator merge exception") });
        })
      : Promise.reject({ done: true as const, value: new Error("Iterator merge complete") });
    },
    return() {
      const ex = new Error("Merge terminated");
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          it[i].return?.({ done: true, value: ex }); // Terminate the sources with the appropriate cause
        }
      }
      return Promise.resolve({ done: true, value: ex });
    },
    throw(ex: any) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          it[i].throw?.(ex); // Terminate the sources with the appropriate cause
        }
      }
      return Promise.reject(ex);
    }
  };
  return withHelpers(merged as unknown as CollapseIterableTypes<A[number]>);
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
export function withHelpers<A extends AsyncIterable<any>>(ai: A) {
  if (!isExtraIterable(ai)) {
    Object.assign(ai, asyncExtras);
  }
  return ai as A & (A extends AsyncIterable<infer T> ? AsyncExtraIterable<T> : never)
}

/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */
async function* map<U, R>(this: AsyncIterable<U>, mapper: (o: U) => R | PromiseLike<R>): AsyncIterable<Awaited<R>> {
  const ai = this[Symbol.asyncIterator]();
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(mapper(p.value));
      }
      yield mapper(p.value);
    }
  } catch (ex) {
    ai.throw?.(ex);
  }
}

async function* filter<U>(this: AsyncIterable<U>, fn: (o: U) => boolean | PromiseLike<boolean>): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(p.value);
      }
      if (await fn(p.value)) {
        yield p.value;
      }
    }
  } catch (ex) {
    ai.throw?.(ex);
  }
}

async function *initially<U, I>(this: AsyncIterable<U>, initValue: I): AsyncIterable<U | I> {
  yield initValue;
  for await (const u of this)
    yield u;
}


async function* throttle<U>(this: AsyncIterable<U>, milliseconds: number): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let paused = 0;
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(p.value);
      }
      const now = Date.now();
      if (paused < now) {
        paused = now + milliseconds;
        yield p.value;
      }
    }
  } catch (ex) {
    ai.throw?.(ex);
  }
}

const forever = new Promise<any>(() => { });

// NB: DEBOUNCE IS CURRENTLY BROKEN
async function* debounce<U>(this: AsyncIterable<U>, milliseconds: number): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let timer: Promise<{ debounced: number, value: U }> = forever;
  let last = -1;
  try {
    while (true) {
      const p = await Promise.race([ai.next(), timer]);
      if ('done' in p && p.done)
        return ai.return?.(p.value);
      if ('debounced' in p && p.debounced) {
        if (p.debounced === last)
          yield p.value;
      } else {
        // We have a new value from the src
        clearTimeout(last);
        timer = new Promise(resolve => {
          last = setTimeout(() => {
            resolve({ debounced: last, value: p.value })
          }, milliseconds);
        });
      }
    }
  } catch (ex) {
    ai.throw?.(ex);
  }
}

async function* waitFor<U>(this: AsyncIterable<U>, cb: (done: (...a: unknown[]) => void) => void): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(p.value);
      }
      await new Promise(resolve => cb(resolve));
      yield p.value;
    }
  } catch (ex) {
    ai.throw?.(ex);
  }
}

async function* count<U extends {}, K extends string>(this: AsyncIterable<U>, field: K) {
  const ai = this[Symbol.asyncIterator]();
  let count = 0;
  try {
    for await (const value of this) {
      const counted = {
        ...value,
        [field]: count++
      }
      yield counted;
    }
  } catch (ex) {
    throw ex;
  }
}

function retain<U extends {}>(this: AsyncIterable<U>): AsyncIterableIterator<U> & { value: U, done: boolean } {
  const ai = this[Symbol.asyncIterator]();
  let prev: IteratorResult<U, any>;
  return {
    [Symbol.asyncIterator]() { return this },
    next() {
      const n = ai.next();
      n.then(p => prev = p);
      return n;
    },
    return(value?: any) {
      return ai.return?.(value) ?? Promise.resolve({done: true as const, value });
    },
    throw(...args: any[]) {
      return ai.throw?.(args) ?? Promise.resolve({done: true as const, value: args[0] })
    },
    get value() {
      return prev.value;
    },
    get done() {
      return Boolean(prev.done);
    }
  }
}

function broadcast<U, X>(this: AsyncIterable<U>, pipe: ((dest: AsyncIterable<U>) => AsyncIterable<X>) = (x => x as unknown as AsyncIterable<X>)): AsyncIterable<X> {
  const ai = this[Symbol.asyncIterator]();
  const b = broadcastIterator<U>(/*() => console.log("..stooped")*/);
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
      const dest = pipe(b);
      return dest[Symbol.asyncIterator]();
    }
  }
}

async function consume<U>(this: AsyncIterable<U>, f: (u: U) => void): Promise<void> {
  for await (const u of this)
    f(u);
}

