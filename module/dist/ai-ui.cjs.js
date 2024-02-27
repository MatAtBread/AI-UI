/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/debug.ts":
/*!**********************!*\
  !*** ./src/debug.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG: () => (/* binding */ DEBUG)
/* harmony export */ });
// @ts-ignore
const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;


/***/ }),

/***/ "./src/deferred.ts":
/*!*************************!*\
  !*** ./src/deferred.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deferred: () => (/* binding */ deferred),
/* harmony export */   isPromiseLike: () => (/* binding */ isPromiseLike)
/* harmony export */ });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");

// Used to suppress TS error about use before initialisation
const nothing = (v) => { };
function deferred() {
    let resolve = nothing;
    let reject = nothing;
    const promise = new Promise((...r) => [resolve, reject] = r);
    promise.resolve = resolve;
    promise.reject = reject;
    if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG) {
        const initLocation = new Error().stack;
        promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? console.log("Deferred", ex, initLocation) : undefined);
    }
    return promise;
}
function isPromiseLike(x) {
    return x !== null && x !== undefined && typeof x.then === 'function';
}


/***/ }),

/***/ "./src/iterators.ts":
/*!**************************!*\
  !*** ./src/iterators.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   asyncExtras: () => (/* binding */ asyncExtras),
/* harmony export */   asyncIterator: () => (/* binding */ asyncIterator),
/* harmony export */   broadcastIterator: () => (/* binding */ broadcastIterator),
/* harmony export */   defineIterableProperty: () => (/* binding */ defineIterableProperty),
/* harmony export */   generatorHelpers: () => (/* binding */ generatorHelpers),
/* harmony export */   isAsyncIter: () => (/* binding */ isAsyncIter),
/* harmony export */   isAsyncIterable: () => (/* binding */ isAsyncIterable),
/* harmony export */   isAsyncIterator: () => (/* binding */ isAsyncIterator),
/* harmony export */   iterableHelpers: () => (/* binding */ iterableHelpers),
/* harmony export */   merge: () => (/* binding */ merge),
/* harmony export */   pushIterator: () => (/* binding */ pushIterator)
/* harmony export */ });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");


function isAsyncIterator(o) {
    return typeof o?.next === 'function';
}
function isAsyncIterable(o) {
    return o && o[Symbol.asyncIterator] && typeof o[Symbol.asyncIterator] === 'function';
}
function isAsyncIter(o) {
    return isAsyncIterable(o) || isAsyncIterator(o);
}
function asyncIterator(o) {
    if (isAsyncIterable(o))
        return o[Symbol.asyncIterator]();
    if (isAsyncIterator(o))
        return o;
    throw new Error("Not as async provider");
}
/* A function that wraps a "prototypical" AsyncIterator helper, that has `this:AsyncIterable<T>` and returns
  something that's derived from AsyncIterable<R>, result in a wrapped function that accepts
  the same arguments returns a AsyncExtraIterable<X>
*/
function wrapAsyncHelper(fn) {
    return function (...args) { return iterableHelpers(fn.call(this, ...args)); };
}
const asyncExtras = {
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
    merge(...m) {
        return merge(this, ...m);
    }
};
function queueIteratableIterator(stop = () => { }) {
    let _pending = [];
    let _items = [];
    const q = {
        [Symbol.asyncIterator]() {
            return q;
        },
        next() {
            if (_items.length) {
                return Promise.resolve({ done: false, value: _items.shift() });
            }
            const value = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
            // We install a catch handler as the promise might be legitimately reject before anything waits for it,
            // and q suppresses the uncaught exception warning.
            value.catch(ex => { });
            _pending.push(value);
            return value;
        },
        return() {
            const value = { done: true, value: undefined };
            if (_pending) {
                try {
                    stop();
                }
                catch (ex) { }
                while (_pending.length)
                    _pending.shift().resolve(value);
                _items = _pending = null;
            }
            return Promise.resolve(value);
        },
        throw(...args) {
            const value = { done: true, value: args[0] };
            if (_pending) {
                try {
                    stop();
                }
                catch (ex) { }
                while (_pending.length)
                    _pending.shift().reject(value);
                _items = _pending = null;
            }
            return Promise.reject(value);
        },
        push(value) {
            if (!_pending) {
                //throw new Error("queueIterator has stopped");
                return false;
            }
            if (_pending.length) {
                _pending.shift().resolve({ done: false, value });
            }
            else {
                _items.push(value);
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
function pushIterator(stop = () => { }, bufferWhenNoConsumers = false) {
    let consumers = 0;
    let ai = queueIteratableIterator(() => {
        consumers -= 1;
        if (consumers === 0 && !bufferWhenNoConsumers) {
            try {
                stop();
            }
            catch (ex) { }
            // This should never be referenced again, but if it is, it will throw
            ai = null;
        }
    });
    return Object.assign(Object.create(asyncExtras), {
        [Symbol.asyncIterator]() {
            consumers += 1;
            return ai;
        },
        push(value) {
            if (!bufferWhenNoConsumers && consumers === 0) {
                // No one ready to read the results
                return false;
            }
            return ai.push(value);
        },
        close(ex) {
            ex ? ai.throw?.(ex) : ai.return?.();
            // This should never be referenced again, but if it is, it will throw
            ai = null;
        }
    });
}
/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  a copy of the values from the queue (ie: the queue is BROADCAST not shared).

  The iterators stops running when the number of consumers decreases to zero
*/
function broadcastIterator(stop = () => { }) {
    let ai = new Set();
    const b = Object.assign(Object.create(asyncExtras), {
        [Symbol.asyncIterator]() {
            const added = queueIteratableIterator(() => {
                ai.delete(added);
                if (ai.size === 0) {
                    try {
                        stop();
                    }
                    catch (ex) { }
                    // This should never be referenced again, but if it is, it will throw
                    ai = null;
                }
            });
            ai.add(added);
            return iterableHelpers(added);
        },
        push(value) {
            if (!ai?.size)
                return false;
            for (const q of ai.values()) {
                q.push(value);
            }
            return true;
        },
        close(ex) {
            for (const q of ai.values()) {
                ex ? q.throw?.(ex) : q.return?.();
            }
            // This should never be referenced again, but if it is, it will throw
            ai = null;
        }
    });
    return b;
}
/* Define a "iterable property" on `obj`.
   This is a property that holds a boxed (within an Object() call) value, and is also an AsyncIterableIterator. which
   yields when the property is set.
   This routine creates the getter/setter for the specified property, and manages the aassociated async iterator.
*/
function defineIterableProperty(obj, name, v) {
    // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
    // access the iterator methods to prevent leaks where an iterable is created, but
    // never referenced, and therefore cannot be consumed and ultimately closed
    let initIterator = () => {
        initIterator = () => b;
        // This *should* work (along with the multi call below, but is defeated by the lazy initialization? &/| unbound methods?)
        //const bi = pushIterator<V>();
        //const b = bi.multi()[Symbol.asyncIterator]();
        const bi = broadcastIterator();
        const b = bi[Symbol.asyncIterator]();
        extras[Symbol.asyncIterator] = { value: bi[Symbol.asyncIterator], enumerable: false, writable: false };
        push = bi.push;
        Object.keys(asyncHelperFunctions).map(k => extras[k] = { value: b[k], enumerable: false, writable: false });
        Object.defineProperties(a, extras);
        return b;
    };
    // Create stubs that lazily create the AsyncExtraIterable interface when invoked
    const lazyAsyncMethod = (method) => function (...args) {
        initIterator();
        return a[method].call(this, ...args);
    };
    const extras = {
        [Symbol.asyncIterator]: {
            enumerable: false, writable: true,
            value: initIterator
        }
    };
    Object.keys(asyncHelperFunctions).map(k => extras[k] = {
        enumerable: false,
        writable: true,
        value: lazyAsyncMethod(k)
    });
    // Lazily initialize `push`
    let push = (v) => {
        initIterator(); // Updates `push` to reference the multi-queue
        return push(v);
    };
    let a = box(v, extras);
    Object.defineProperty(obj, name, {
        get() { return a; },
        set(v) {
            a = box(v, extras);
            push(v?.valueOf());
        },
        enumerable: true
    });
    return obj;
}
function box(a, pds) {
    if (a === null || a === undefined) {
        return Object.create(null, {
            ...pds,
            valueOf: { value() { return a; } },
            toJSON: { value() { return a; } }
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
                if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG)
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
                toJSON: { value() { return a.valueOf(); } }
            });
    }
    throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
}
const merge = (...ai) => {
    const it = ai.map(i => Symbol.asyncIterator in i ? i[Symbol.asyncIterator]() : i);
    const promises = it.map((i, idx) => i.next().then(result => ({ idx, result })));
    const results = [];
    const forever = new Promise(() => { });
    let count = promises.length;
    const merged = {
        [Symbol.asyncIterator]() { return merged; },
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
                    }
                    else {
                        // `ex` is the underlying async iteration exception
                        promises[idx] = it[idx].next().then(result => ({ idx, result })).catch(ex => ({ idx, result: ex }));
                        return result;
                    }
                }).catch(ex => {
                    return merged.throw?.(ex) ?? Promise.reject({ done: true, value: new Error("Iterator merge exception") });
                })
                : Promise.resolve({ done: true, value: results });
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
        async throw(ex) {
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
    return iterableHelpers(merged);
};
/*
  Extensions to the AsyncIterable:
  calling `bind(ai)` adds "standard" methods to the specified AsyncIterable
*/
function isExtraIterable(i) {
    return isAsyncIterable(i)
        && Object.keys(asyncExtras)
            .every(k => (k in i) && i[k] === asyncExtras[k]);
}
// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
function iterableHelpers(ai) {
    if (!isExtraIterable(ai)) {
        Object.assign(ai, asyncExtras);
    }
    return ai;
}
function generatorHelpers(g) {
    // @ts-ignore: TS type madness
    return function (...args) {
        return iterableHelpers(g(...args));
    };
}
const Ignore = Symbol("Ignore");
function filterMap(source, fn, initialValue = Ignore) {
    const ai = source[Symbol.asyncIterator]();
    let prev = Ignore;
    return {
        [Symbol.asyncIterator]() {
            return this;
        },
        next(...args) {
            if (initialValue !== Ignore) {
                const init = Promise.resolve(initialValue).then(value => ({ done: false, value }));
                initialValue = Ignore;
                return init;
            }
            return new Promise(function step(resolve, reject) {
                ai.next(...args).then(p => p.done
                    ? resolve(p)
                    : Promise.resolve(fn(p.value, prev)) /*new Promise<R | typeof Ignore>(pass => pass(fn(p.value, prev)))*/.then(f => f === Ignore
                        ? step(resolve, reject)
                        : resolve({ done: false, value: prev = f }), ex => {
                        // The filter function failed...
                        ai.throw ? ai.throw(ex) : ai.return?.(ex); // ?.then(r => r, ex => ex); // Terminate the source - for now we ignore the result of the termination
                        reject({ done: true, value: ex }); // Terminate the consumer
                    }), ex => 
                // The source threw. Tell the consumer
                reject({ done: true, value: ex }));
            });
        },
        throw(ex) {
            // The consumer wants us to exit with an exception. Tell the source
            return Promise.resolve(ai.throw ? ai.throw(ex) : ai.return?.(ex)).then(v => ({ done: true, value: v?.value }));
        },
        return(v) {
            // The consumer told us to return, so we need to terminate the source
            return Promise.resolve(ai.return?.(v)).then(v => ({ done: true, value: v?.value }));
        }
    };
}
function map(mapper) {
    return filterMap(this, mapper);
}
function filter(fn) {
    return filterMap(this, async (o) => (await fn(o) ? o : Ignore));
}
function unique(fn) {
    return fn
        ? filterMap(this, async (o, p) => (p === Ignore || await fn(o, p)) ? o : Ignore)
        : filterMap(this, (o, p) => o === p ? Ignore : o);
}
function initially(initValue) {
    return filterMap(this, o => o, initValue);
}
function waitFor(cb) {
    return filterMap(this, o => new Promise(resolve => { cb(() => resolve(o)); return o; }));
}
/*
async function* map<U, R>(this: AsyncIterable<U>, ...mapper: Mapper<U, R>[]): AsyncIterable<Awaited<R>> {
  const ai = this[Symbol.asyncIterator]();
  try {
    while (true) {
      let p: IteratorResult<U, any>;
      try {
        p = await ai.next();
      } catch (ex) {
        // The source threw, so we tell the consumer
        throw { done: true, value: ex }
      }

      let v: U | R = p.value;
      try {
        for (const m of mapper)
          v = await m(v as U);
      } catch (ex) {
        // The mapper threw, we need to terminate the source and throw the error
        ai.throw ? ai.throw(ex) : ai.return?.();
        throw { done: true, value: ex }
      }
      if (p.done)
        return v;
      try {
        yield v as R;
      } catch (ex) {
        // The consumer told us to throw, so we need to terminate the source
        ai.throw?.(ex);
        break;
      }
    }
  } finally {
    // The consumer told us to return, so we need to terminate the source
    ai.return?.()
  }
}

async function* filter<U>(this: AsyncIterable<U>, fn: (o: U) => boolean | PromiseLike<boolean>): AsyncIterable<U> {
    const ai = this[Symbol.asyncIterator]();
    try {
      while (true) {
        let p: IteratorResult<U, any>;
        try {
          p = await ai.next();
        } catch (ex) {
          // The source threw, so we tell the consumer
          throw { done: true, value: ex }
        }

        if (p.done)
          return p.value;

        let f: boolean;
        try {
            f = await fn(p.value);
        } catch (ex) {
          // The filter threw, we need to terminate the source and throw the error
          ai.throw ? ai.throw(ex) : ai.return?.();
          throw { done: true, value: ex }
        }
        if (f) {
          try {
            yield p.value;
          } catch (ex) {
            // The consumer told us to throw, so we need to terminate the source
            ai.throw?.(ex);
            break;
          }
        }
      }
    } finally {
      // The consumer told us to return, so we need to terminate the source
      ai.return?.()
    }
  }
const noUniqueValue = Symbol('noUniqueValue');
async function* unique<U>(this: AsyncIterable<U>, fn?: (next: U, prev: U) => boolean | PromiseLike<boolean>): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let exit = () => ai.return?.();
  let prev: U | typeof noUniqueValue = noUniqueValue;
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(p.value);
      }
      if (fn && prev !== noUniqueValue ? await fn(p.value, prev) : p.value != prev) {
        yield p.value;
      }
      prev = p.value;
    }
  } catch (ex) {
    exit = () => ai.throw ? ai.throw(ex) : ai.return?.();
  }
  finally { exit() }
}

async function* initially<U, I = U>(this: AsyncIterable<U>, initValue: I): AsyncIterable<U | I> {
  yield initValue;
  for await (const u of this)
    yield u;
}

async function* throttle<U>(this: AsyncIterable<U>, milliseconds: number): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let exit = () => ai.return?.();
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
    exit = () => ai.throw ? ai.throw(ex) : ai.return?.();
  }
  finally { exit() }
}

const forever = new Promise<any>(() => { });

// NB: DEBOUNCE IS CURRENTLY BROKEN
async function* debounce<U>(this: AsyncIterable<U>, milliseconds: number): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let exit = () => ai.return?.();
  let timer: Promise<{ debounced: number, value: U }> = forever;
  let last: any = -1;
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
    exit = () => ai.throw ? ai.throw(ex) : ai.return?.();
  }
  finally { exit() }
}

async function* waitFor<U>(this: AsyncIterable<U>, cb: (done: (value: void | PromiseLike<void>) => void) => void): AsyncIterable<U> {
  const ai = this[Symbol.asyncIterator]();
  let exit = () => ai.return?.();
  try {
    while (true) {
      const p = await ai.next();
      if (p.done) {
        return ai.return?.(p.value);
      }
      await new Promise<void>(resolve => cb(resolve));
      yield p.value;
    }
  } catch (ex) {
    exit = () => ai.throw ? ai.throw(ex) : ai.return?.();
  }
  finally { exit() }
}

async function* count<U extends {}, K extends string>(this: AsyncIterable<U>, field: K) {
  const ai = this[Symbol.asyncIterator]();
  let exit = () => ai.return?.();
  let count = 0;
  try {
    for await (const value of this) {
      const counted = {
        ...value,
        [field]: count++
      }
      yield counted;
    }
    ai.return?.();
  } catch (ex) {
    exit = () => ai.throw ? ai.throw(ex) : ai.return?.();
  }
  finally { exit() }
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
      return ai.return?.(value) ?? Promise.resolve({ done: true as const, value });
    },
    throw(...args: any[]) {
      return ai.throw?.(args) ?? Promise.resolve({ done: true as const, value: args[0] })
    },
    get value() {
      return prev.value;
    },
    get done() {
      return Boolean(prev.done);
    }
  }
}
*/
function multi() {
    const source = this;
    let consumers = 0;
    let current = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
    let ai;
    return {
        [Symbol.asyncIterator]() {
            // Someone wants to start consuming. Start the source if we're the first
            if (!consumers) {
                // The source has produced a new result
                function update(it) {
                    current.resolve(it);
                    if (!it.done) {
                        current = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
                        ai.next().then(update).catch(error);
                    }
                }
                // The source has errored, reject any consumers and reset the iterator
                function error(reason) {
                    current.reject({ done: true, value: reason });
                }
                ai = source[Symbol.asyncIterator]();
                ai.next().then(update).catch(error);
            }
            consumers += 1;
            return this;
        },
        next() {
            return current;
        },
        throw(ex) {
            // The consumer wants us to exit with an exception. Tell the source if we're the final one
            consumers -= 1;
            if (consumers)
                return Promise.resolve({ done: true, value: ex });
            return Promise.resolve(ai.throw ? ai.throw(ex) : ai.return?.(ex)).then(v => ({ done: true, value: v?.value }));
        },
        return(v) {
            // The consumer told us to return, so we need to terminate the source if we're the only one
            consumers -= 1;
            if (consumers)
                return Promise.resolve({ done: true, value: v });
            return Promise.resolve(ai.return?.(v)).then(v => ({ done: true, value: v?.value }));
        }
    };
}
function broadcast() {
    const ai = this[Symbol.asyncIterator]();
    const b = broadcastIterator(() => ai.return?.());
    (function update() {
        ai.next().then(v => {
            if (v.done) {
                // Meh - we throw these away for now.
                // console.log(".broadcast done");
            }
            else {
                b.push(v.value);
                update();
            }
        }).catch(ex => b.close(ex));
    })();
    return {
        [Symbol.asyncIterator]() {
            return b[Symbol.asyncIterator]();
        }
    };
}
async function consume(f) {
    let last = undefined;
    for await (const u of this)
        last = f?.(u);
    await last;
}
const asyncHelperFunctions = { map, filter, unique, waitFor, multi, broadcast, initially, consume, merge /*, throttle, debounce, count, retain */ };


/***/ }),

/***/ "./src/when.ts":
/*!*********************!*\
  !*** ./src/when.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   when: () => (/* binding */ when)
/* harmony export */ });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");
/* harmony import */ var _iterators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./iterators.js */ "./src/iterators.ts");



const eventObservations = new Map();
function docEventHandler(ev) {
    const observations = eventObservations.get(ev.type);
    if (observations) {
        for (const o of observations) {
            try {
                const { push, container, selector } = o;
                if (!document.body.contains(container)) {
                    const msg = "Container `#" + container.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
                    observations.delete(o);
                    push[Symbol.asyncIterator]().return?.(new Error(msg));
                }
                else {
                    if (ev.target instanceof Node) {
                        if (selector) {
                            const nodes = container.querySelectorAll(selector);
                            for (const n of nodes) {
                                if ((ev.target === n || n.contains(ev.target)) && container.contains(n))
                                    push.push(ev);
                            }
                        }
                        else {
                            if ((ev.target === container || container.contains(ev.target)))
                                push.push(ev);
                        }
                    }
                }
            }
            catch (ex) {
                console.warn('docEventHandler', ex);
            }
        }
    }
}
function isCSSSelector(s) {
    return Boolean(s && (s.startsWith('#') || s.startsWith('.') || (s.startsWith('[') && s.endsWith(']'))));
}
function parseWhenSelector(what) {
    const parts = what.split(':');
    if (parts.length === 1) {
        if (isCSSSelector(parts[0]))
            return [parts[0], "change"];
        return [null, parts[0]];
    }
    if (parts.length === 2) {
        if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
            return [parts[1], parts[0]];
    }
    return undefined;
}
function doThrow(message) {
    throw new Error(message);
}
function whenEvent(container, what) {
    const [selector, eventName] = parseWhenSelector(what) ?? doThrow("Invalid WhenSelector: " + what);
    if (!eventObservations.has(eventName)) {
        document.addEventListener(eventName, docEventHandler, {
            passive: true,
            capture: true
        });
        eventObservations.set(eventName, new Set());
    }
    const push = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.pushIterator)(() => eventObservations.get(eventName)?.delete(details));
    const details = {
        push,
        container,
        selector: selector || null
    };
    eventObservations.get(eventName).add(details);
    return push;
}
async function* neverGonnaHappen() {
    await new Promise(() => { });
    yield undefined; // Never should be executed
}
/* Syntactic sugar: chainAsync decorates the specified iterator so it can be mapped by
  a following function, or used directly as an iterable */
function chainAsync(src) {
    function mappableAsyncIterable(mapper) {
        return _iterators_js__WEBPACK_IMPORTED_MODULE_2__.asyncExtras.map.call(src, mapper);
    }
    return Object.assign((0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.iterableHelpers)(mappableAsyncIterable), {
        [Symbol.asyncIterator]: () => src[Symbol.asyncIterator]()
    });
}
function isValidWhenSelector(what) {
    if (!what)
        throw new Error('Falsy async source will never be ready\n\n' + JSON.stringify(what));
    return typeof what === 'string' && what[0] !== '@' && Boolean(parseWhenSelector(what));
}
async function* once(p) {
    yield p;
}
function when(container, ...sources) {
    if (!sources || sources.length === 0) {
        return chainAsync(whenEvent(container, "change"));
    }
    const iterators = sources.filter(what => typeof what !== 'string' || what[0] !== '@').map(what => typeof what === 'string'
        ? whenEvent(container, what)
        : what instanceof Element
            ? whenEvent(what, "change")
            : (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.isPromiseLike)(what)
                ? once(what)
                : what);
    if (sources.includes('@start')) {
        const start = {
            [Symbol.asyncIterator]: () => start,
            next() {
                return new Promise(resolve => requestAnimationFrame(() => {
                    // terminate on the next call to `next()`
                    start.next = () => Promise.resolve({ done: true, value: undefined });
                    // Yield a "start" event
                    resolve({ done: false, value: {} });
                }));
            }
        };
        iterators.push(start);
    }
    if (sources.includes('@ready')) {
        const watchSelectors = sources.filter(isValidWhenSelector).map(what => parseWhenSelector(what)?.[0]);
        function isMissing(sel) {
            return Boolean(typeof sel === 'string' && !container.querySelector(sel));
        }
        const missing = watchSelectors.filter(isMissing);
        const ai = {
            [Symbol.asyncIterator]() { return ai; },
            async next() {
                await Promise.all([
                    allSelectorsPresent(container, missing),
                    elementIsInDOM(container)
                ]);
                const merged = (iterators.length > 1)
                    ? (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.merge)(...iterators)
                    : iterators.length === 1
                        ? iterators[0]
                        : (neverGonnaHappen());
                // Now everything is ready, we simply defer all async ops to the underlying
                // merged asyncIterator
                const events = merged[Symbol.asyncIterator]();
                ai.next = events.next.bind(events); //() => events.next();
                ai.return = events.return?.bind(events);
                ai.throw = events.throw?.bind(events);
                return { done: false, value: {} };
            }
        };
        return chainAsync(ai);
    }
    const merged = (iterators.length > 1)
        ? (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.merge)(...iterators)
        : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen());
    return chainAsync(merged);
}
function elementIsInDOM(elt) {
    if (document.body.contains(elt))
        return Promise.resolve();
    return new Promise(resolve => new MutationObserver((records, mutation) => {
        for (const record of records) {
            if (record.addedNodes?.length) {
                if (document.body.contains(elt)) {
                    mutation.disconnect();
                    resolve();
                    return;
                }
            }
        }
    }).observe(document.body, {
        subtree: true,
        childList: true
    }));
}
function allSelectorsPresent(container, missing) {
    if (!missing.length) {
        return Promise.resolve();
    }
    const promise = new Promise(resolve => new MutationObserver((records, mutation) => {
        for (const record of records) {
            if (record.addedNodes?.length) {
                missing = missing.filter(sel => !container.querySelector(sel));
                if (!missing.length) {
                    mutation.disconnect();
                    resolve();
                    return;
                }
            }
        }
    }).observe(container, {
        subtree: true,
        childList: true
    }));
    /* debugging help: warn if waiting a long time for a selectors to be ready */
    if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG) {
        const stack = new Error().stack?.replace(/^Error/, "Missing selectors after 5 seconds:");
        const warn = setTimeout(() => {
            console.warn(stack, missing);
        }, 5000);
        promise.finally(() => clearTimeout(warn));
    }
    return promise;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/ai-ui.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Iterators: () => (/* reexport module object */ _iterators_js__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   enableOnRemovedFromDOM: () => (/* binding */ enableOnRemovedFromDOM),
/* harmony export */   getElementIdMap: () => (/* binding */ getElementIdMap),
/* harmony export */   tag: () => (/* binding */ tag),
/* harmony export */   when: () => (/* reexport safe */ _when_js__WEBPACK_IMPORTED_MODULE_2__.when)
/* harmony export */ });
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");
/* harmony import */ var _iterators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterators.js */ "./src/iterators.ts");
/* harmony import */ var _when_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./when.js */ "./src/when.ts");
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");




/* Export useful stuff for users of the bundled code */


const standandTags = [
    "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button",
    "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div",
    "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head",
    "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map",
    "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre",
    "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "search", "section", "select", "slot", "small", "source", "span",
    "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time",
    "title", "tr", "track", "u", "ul", "var", "video", "wbr"
];
const elementProtype = {
    get ids() {
        return getElementIdMap(this);
    },
    set ids(v) {
        throw new Error('Cannot set ids on ' + this.valueOf());
    },
    when: function (...what) {
        return (0,_when_js__WEBPACK_IMPORTED_MODULE_2__.when)(this, ...what);
    }
};
const poStyleElt = document.createElement("STYLE");
poStyleElt.id = "--ai-ui-extended-tag-styles";
function isChildTag(x) {
    return typeof x === 'string'
        || typeof x === 'number'
        || typeof x === 'function'
        || x instanceof Node
        || x instanceof NodeList
        || x instanceof HTMLCollection
        || x === null
        || x === undefined
        // Can't actually test for the contained type, so we assume it's a ChildTag and let it fail at runtime
        || Array.isArray(x)
        || (0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(x)
        || (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(x)
        || typeof x[Symbol.iterator] === 'function';
}
/* tag */
const callStackSymbol = Symbol('callStack');
const tag = function (_1, _2, _3) {
    /* Work out which parameter is which. There are 6 variations:
      tag()                                       []
      tag(prototypes)                             [object]
      tag(tags[])                                 [string[]]
      tag(tags[], prototypes)                     [string[], object]
      tag(namespace | null, tags[])               [string | null, string[]]
      tag(namespace | null, tags[], prototypes)   [string | null, string[], object]
    */
    const [nameSpace, tags, prototypes] = (typeof _1 === 'string') || _1 === null
        ? [_1, _2, _3]
        : Array.isArray(_1)
            ? [null, _1, _2]
            : [null, standandTags, _1];
    /* Note: we use property defintion (and not object spread) so getters (like `ids`)
      are not evaluated until called */
    const tagPrototypes = Object.create(null, Object.getOwnPropertyDescriptors(elementProtype));
    // We do this here and not in elementProtype as there's no syntax
    // to copy a getter/setter pair from another object
    Object.defineProperty(tagPrototypes, 'attributes', {
        ...Object.getOwnPropertyDescriptor(Element.prototype, 'attributes'),
        set(a) {
            assignProps(this, a);
        }
    });
    if (prototypes)
        deepDefine(tagPrototypes, prototypes);
    function nodes(...c) {
        const appended = [];
        (function children(c) {
            if (c === undefined || c === null)
                return;
            if ((0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(c)) {
                let g = [DomPromiseContainer()];
                appended.push(g[0]);
                c.then(r => {
                    const n = nodes(r);
                    const old = g;
                    if (old[0].parentElement) {
                        appender(old[0].parentElement, old[0])(n);
                        old.forEach(e => e.parentElement?.removeChild(e));
                    }
                    g = n;
                }, x => {
                    console.warn(x);
                    appender(g[0])(DyamicElementError({ error: x }));
                });
                return;
            }
            if (c instanceof Node) {
                appended.push(c);
                return;
            }
            if ((0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(c)) {
                const insertionStack = _debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG ? ('\n' + new Error().stack?.replace(/^Error: /, "Insertion :")) : '';
                const ap = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIterable)(c) ? c[Symbol.asyncIterator]() : c;
                const dpm = DomPromiseContainer();
                appended.push(dpm);
                let t = [dpm];
                const error = (errorValue) => {
                    ap.return?.(errorValue);
                    const n = (Array.isArray(t) ? t : [t]).filter(n => Boolean(n));
                    if (n[0].parentNode) {
                        t = appender(n[0].parentNode, n[0])(DyamicElementError({ error: errorValue }));
                        n.forEach(e => e.parentNode?.removeChild(e));
                    }
                    else
                        console.warn("Can't report error", errorValue, t);
                };
                const update = (es) => {
                    if (!es.done) {
                        const n = (Array.isArray(t) ? t : [t]).filter(e => e.ownerDocument?.body.contains(e));
                        if (!n.length || !n[0].parentNode) {
                            // We're done - terminate the source quietly (ie this is not an exception as it's expected, but we're done)
                            error(new Error("Element(s) no longer exist in document" + insertionStack));
                            return;
                        }
                        t = appender(n[0].parentNode, n[0])(unbox(es.value) ?? DomPromiseContainer());
                        n.forEach(e => e.parentNode?.removeChild(e));
                        ap.next().then(update).catch(error);
                    }
                };
                ap.next().then(update).catch(error);
                return;
            }
            if (typeof c === 'object' && c?.[Symbol.iterator]) {
                for (const d of c)
                    children(d);
                return;
            }
            appended.push(document.createTextNode(c.toString()));
        })(c);
        return appended;
    }
    function appender(container, before) {
        if (before === undefined)
            before = null;
        return function (c) {
            const children = nodes(c);
            if (before) {
                // "before", being a node, could be #text node
                if (before instanceof Element) {
                    Element.prototype.before.call(before, ...children);
                }
                else {
                    // We're a text node - work backwards and insert *after* the preceeding Element
                    const parent = before.parentElement;
                    if (!parent)
                        throw new Error("Parent is null");
                    if (parent !== container) {
                        console.warn("Container mismatch??");
                    }
                    for (let i = 0; i < children.length; i++)
                        parent.insertBefore(children[i], before);
                }
            }
            else {
                Element.prototype.append.call(container, ...children);
            }
            return children;
        };
    }
    if (!nameSpace) {
        tag.appender = appender; // Legacy RTA support
        tag.nodes = nodes; // Preferred interface
    }
    /** Routine to *define* properties on a dest object from a src object **/
    function deepDefine(d, s) {
        if (s === null || s === undefined || typeof s !== 'object' || s === d)
            return;
        for (const [k, srcDesc] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
            try {
                if ('value' in srcDesc) {
                    const value = srcDesc.value;
                    if (value && (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                        Object.defineProperty(d, k, srcDesc);
                    }
                    else {
                        // This has a real value, which might be an object, so we'll deepDefine it unless it's a
                        // Promise or a function, in which case we just assign it
                        if (value && typeof value === 'object' && !(0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value)) {
                            if (!(k in d)) {
                                // If this is a new value in the destination, just define it to be the same property as the source
                                Object.defineProperty(d, k, srcDesc);
                            }
                            else {
                                if (value instanceof Node) {
                                    if (_debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG)
                                        console.log("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
                                    d[k] = value;
                                }
                                else {
                                    if (d[k] !== value) {
                                        // Note - if we're copying to an array of different length
                                        // we're decoupling common object references, so we need a clean object to
                                        // assign into
                                        if (Array.isArray(d[k]) && d[k].length !== value.length) {
                                            if (value.constructor === Object || value.constructor === Array) {
                                                deepDefine(d[k] = new (value.constructor), value);
                                            }
                                            else {
                                                // This is some sort of constructed object, which we can't clone, so we have to copy by reference
                                                d[k] = value;
                                            }
                                        }
                                        else {
                                            // This is just a regular object, so we deepDefine recursively
                                            deepDefine(d[k], value);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            // This is just a primitive value, or a Promise
                            if (s[k] !== undefined)
                                d[k] = s[k];
                        }
                    }
                }
                else {
                    // Copy the definition of the getter/setter
                    Object.defineProperty(d, k, srcDesc);
                }
            }
            catch (ex) {
                console.warn("deepAssign", k, s[k], ex);
                throw ex;
            }
        }
    }
    function unbox(a) {
        const v = a?.valueOf();
        return Array.isArray(v) ? v.map(unbox) : v;
    }
    function assignProps(base, props) {
        // Copy prop hierarchy onto the element via the asssignment operator in order to run setters
        if (!(callStackSymbol in props)) {
            (function assign(d, s) {
                if (s === null || s === undefined || typeof s !== 'object')
                    return;
                // static props before getters/setters
                const sourceEntries = Object.entries(Object.getOwnPropertyDescriptors(s));
                sourceEntries.sort((a, b) => {
                    const desc = Object.getOwnPropertyDescriptor(d, a[0]);
                    if (desc) {
                        if ('value' in desc)
                            return -1;
                        if ('set' in desc)
                            return 1;
                        if ('get' in desc)
                            return 0.5;
                    }
                    return 0;
                });
                for (const [k, srcDesc] of sourceEntries) {
                    try {
                        if ('value' in srcDesc) {
                            const value = srcDesc.value;
                            if ((0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                                const ap = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.asyncIterator)(value);
                                const update = (es) => {
                                    if (!base.ownerDocument.contains(base)) {
                                        /* This element has been removed from the doc. Tell the source ap
                                          to stop sending us stuff */
                                        //throw new Error("Element no longer exists in document (update " + k + ")");
                                        ap.return?.(new Error("Element no longer exists in document (update " + k + ")"));
                                        return;
                                    }
                                    if (!es.done) {
                                        const value = unbox(es.value);
                                        if (typeof value === 'object' && value !== null) {
                                            /*
                                            THIS IS JUST A HACK: `style` has to be set member by member, eg:
                                              e.style.color = 'blue'        --- works
                                              e.style = { color: 'blue' }   --- doesn't work
                                            whereas in general when assigning to property we let the receiver
                                            do any work necessary to parse the object. This might be better handled
                                            by having a setter for `style` in the PoElementMethods that is sensitive
                                            to the type (string|object) being passed so we can just do a straight
                                            assignment all the time, or making the decsion based on the location of the
                                            property in the prototype chain and assuming anything below "PO" must be
                                            a primitive
                                            */
                                            const destDesc = Object.getOwnPropertyDescriptor(d, k);
                                            if (k === 'style' || !destDesc?.set)
                                                assign(d[k], value);
                                            else
                                                d[k] = value;
                                        }
                                        else {
                                            // Src is not an object (or is null) - just assign it, unless it's undefined
                                            if (value !== undefined)
                                                d[k] = value;
                                        }
                                        ap.next().then(update).catch(error);
                                    }
                                };
                                const error = (errorValue) => {
                                    ap.return?.(errorValue);
                                    console.warn("Dynamic attribute error", errorValue, k, d, base);
                                    appender(base)(DyamicElementError({ error: errorValue }));
                                };
                                ap.next().then(update).catch(error);
                            }
                            if (!(0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                                // This has a real value, which might be an object
                                if (value && typeof value === 'object' && !(0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value)) {
                                    if (value instanceof Node) {
                                        if (_debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG)
                                            console.log("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
                                        d[k] = value;
                                    }
                                    else {
                                        // Note - if we're copying to ourself (or an array of different length),
                                        // we're decoupling common object references, so we need a clean object to
                                        // assign into
                                        if (!(k in d) || d[k] === value || (Array.isArray(d[k]) && d[k].length !== value.length)) {
                                            if (value.constructor === Object || value.constructor === Array) {
                                                d[k] = new (value.constructor);
                                                assign(d[k], value);
                                            }
                                            else {
                                                // This is some sort of constructed object, which we can't clone, so we have to copy by reference
                                                d[k] = value;
                                            }
                                        }
                                        else {
                                            if (Object.getOwnPropertyDescriptor(d, k)?.set)
                                                d[k] = value;
                                            else
                                                assign(d[k], value);
                                        }
                                    }
                                }
                                else {
                                    if (s[k] !== undefined)
                                        d[k] = s[k];
                                }
                            }
                        }
                        else {
                            // Copy the definition of the getter/setter
                            Object.defineProperty(d, k, srcDesc);
                        }
                    }
                    catch (ex) {
                        console.warn("assignProps", k, s[k], ex);
                        throw ex;
                    }
                }
            })(base, props);
        }
    }
    /*
    Extend a component class with create a new component class factory:
        const NewDiv = Div.extended({ overrides })
            ...or...
        const NewDic = Div.extended((instance:{ arbitrary-type }) => ({ overrides }))
           ...later...
        const eltNewDiv = NewDiv({attrs},...children)
    */
    function extended(_overrides) {
        const overrides = (typeof _overrides !== 'function')
            ? (instance) => _overrides
            : _overrides;
        const staticInstance = {};
        let staticExtensions = overrides(staticInstance);
        /* "Statically" create any styles required by this widget */
        if (staticExtensions.styles) {
            poStyleElt.appendChild(document.createTextNode(staticExtensions.styles + '\n'));
            if (!document.head.contains(poStyleElt)) {
                document.head.appendChild(poStyleElt);
            }
        }
        const extendTagFn = (attrs, ...children) => {
            const noAttrs = isChildTag(attrs);
            const newCallStack = [];
            const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack };
            const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
            e.constructor = extendTag;
            const ped = {};
            const tagDefinition = overrides(ped);
            combinedAttrs[callStackSymbol].push(tagDefinition);
            deepDefine(e, tagDefinition.prototype);
            deepDefine(e, tagDefinition.override);
            deepDefine(e, tagDefinition.declare);
            tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach(k => {
                (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.defineIterableProperty)(e, k, tagDefinition.iterable[k]);
            });
            if (combinedAttrs[callStackSymbol] === newCallStack) {
                if (!noAttrs)
                    assignProps(e, attrs);
                for (const base of newCallStack) {
                    const children = base?.constructed?.call(e);
                    if (isChildTag(children)) // technically not necessary, since "void" is going to be undefined in 99.9% of cases.
                        appender(e)(children);
                }
                // Once the full tree of augmented DOM elements has been constructed, fire all the iterable propeerties
                // so the full hierarchy gets to consume the initial state
                for (const base of newCallStack) {
                    base.iterable && Object.keys(base.iterable).forEach(
                    // @ts-ignore
                    k => e[k] = e[k].valueOf());
                }
            }
            return e;
        };
        const extendTag = Object.assign(extendTagFn, {
            super: this,
            overrides,
            extended,
            valueOf: () => {
                const keys = [...Object.keys(staticExtensions.declare || {}) /*, ...Object.keys(staticExtensions.prototype || {})*/];
                return `${extendTag.name}: {${keys.join(', ')}}\n \u21AA ${this.valueOf()}`;
            }
        });
        const fullProto = {};
        (function walkProto(creator) {
            if (creator?.super)
                walkProto(creator.super);
            const proto = creator.overrides?.(staticInstance);
            if (proto) {
                deepDefine(fullProto, proto?.prototype);
                deepDefine(fullProto, proto?.override);
                deepDefine(fullProto, proto?.declare);
            }
        })(this);
        deepDefine(fullProto, staticExtensions.prototype);
        deepDefine(fullProto, staticExtensions.override);
        deepDefine(fullProto, staticExtensions.declare);
        Object.defineProperties(extendTag, Object.getOwnPropertyDescriptors(fullProto));
        // Attempt to make up a meaningfu;l name for this extended tag
        const creatorName = fullProto
            && 'className' in fullProto
            && typeof fullProto.className === 'string'
            ? fullProto.className
            : '?';
        const callSite = _debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG ? ' @' + (new Error().stack?.split('\n')[2]?.match(/\((.*)\)/)?.[1] ?? '?') : '';
        Object.defineProperty(extendTag, "name", {
            value: "<ai-" + creatorName.replace(/\s+/g, '-') + callSite + ">"
        });
        return extendTag;
    }
    const baseTagCreators = {};
    function createTag(k) {
        if (baseTagCreators[k])
            // @ts-ignore
            return baseTagCreators[k];
        const tagCreator = (attrs, ...children) => {
            let doc = document;
            if (isChildTag(attrs)) {
                children.unshift(attrs);
                attrs = { prototype: {} };
            }
            // This test is always true, but narrows the type of attrs to avoid further errors
            if (!isChildTag(attrs)) {
                if (attrs.debugger) {
                    debugger;
                    delete attrs.debugger;
                }
                if (attrs.document) {
                    doc = attrs.document;
                    delete attrs.document;
                }
                // Create element
                const e = nameSpace
                    ? doc.createElementNS(nameSpace, k.toLowerCase())
                    : doc.createElement(k);
                e.constructor = tagCreator;
                deepDefine(e, tagPrototypes);
                assignProps(e, attrs);
                // Append any children
                appender(e)(children);
                return e;
            }
        };
        const includingExtender = Object.assign(tagCreator, {
            super: () => { throw new Error("Can't invoke native elemenet constructors directly. Use document.createElement()."); },
            extended, // How to extend this (base) tag
            valueOf() { return `TagCreator: <${nameSpace || ''}${nameSpace ? '::' : ''}${k}>`; }
        });
        Object.defineProperty(tagCreator, "name", { value: '<' + k + '>' });
        // @ts-ignore
        return baseTagCreators[k] = includingExtender;
    }
    tags.forEach(createTag);
    // @ts-ignore
    return baseTagCreators;
};
const { "ai-ui-container": AsyncDOMContainer } = tag('', ["ai-ui-container"]);
const DomPromiseContainer = AsyncDOMContainer.extended({
    styles: `
  ai-ui-container.promise {
    display: ${_debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG ? 'inline' : 'none'};
    color: #888;
    font-size: 0.75em;
  }
  ai-ui-container.promise:after {
    content: "⋯";
  }`,
    override: {
        className: 'promise'
    },
    constructed() {
        return AsyncDOMContainer({ style: { display: 'none' } }, _debug_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG
            ? new Error("Constructed").stack?.replace(/^Error: /, '')
            : undefined);
    }
});
const DyamicElementError = AsyncDOMContainer.extended({
    styles: `
  ai-ui-container.error {
    display: block;
    color: #b33;
    white-space: pre;
  }`,
    override: {
        className: 'error'
    },
    declare: {
        error: undefined
    },
    constructed() {
        if (!this.error)
            return "Error";
        if (this.error instanceof Error)
            return this.error.stack;
        if ('value' in this.error && this.error.value instanceof Error)
            return this.error.value.stack;
        return this.error.toString();
    }
});
let enableOnRemovedFromDOM = function () {
    enableOnRemovedFromDOM = function () { }; // Only create the observer once
    new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.type === 'childList') {
                m.removedNodes.forEach(removed => removed && removed instanceof Element &&
                    [...removed.getElementsByTagName("*"), removed].filter(elt => !elt.ownerDocument.contains(elt)).forEach(elt => {
                        'onRemovedFromDOM' in elt && typeof elt.onRemovedFromDOM === 'function' && elt.onRemovedFromDOM();
                    }));
            }
        });
    }).observe(document.body, { subtree: true, childList: true });
};
function getElementIdMap(node, ids) {
    node = node || document;
    ids = ids || {};
    if (node.querySelectorAll) {
        node.querySelectorAll("[id]").forEach(function (elt) {
            if (elt.id) {
                if (!ids[elt.id])
                    ids[elt.id] = elt;
                //else if (DEBUG)
                //  console.info("Shadowed multiple element IDs", elt.id/*, elt, ids![elt.id]*/)
            }
        });
    }
    return ids;
}

})();

exports.Iterators = __webpack_exports__.Iterators;
exports.enableOnRemovedFromDOM = __webpack_exports__.enableOnRemovedFromDOM;
exports.getElementIdMap = __webpack_exports__.getElementIdMap;
exports.tag = __webpack_exports__.tag;
exports.when = __webpack_exports__.when;
Object.defineProperty(exports, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLHVHQUF1RztBQUNsSTtBQUNBLHdCQUF3Qix1QkFBdUIsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsRUFBRTtBQUMzRixTQUFTO0FBQ1Qsb0RBQW9ELHNCQUFzQjtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUNBQXVDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNENBQUs7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsbUNBQW1DLFNBQVMsbUJBQW1CLEVBQUUsNENBQUs7QUFDdEU7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1AsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLFNBQVM7QUFDVCxLQUFLLDJCQUEyQixnQ0FBZ0M7QUFDaEU7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2RlYnVnLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2RlZmVycmVkLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2l0ZXJhdG9ycy50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS8uL3NyYy93aGVuLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvYWktdWkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodikgPT4geyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkKCkge1xuICAgIGxldCByZXNvbHZlID0gbm90aGluZztcbiAgICBsZXQgcmVqZWN0ID0gbm90aGluZztcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcik7XG4gICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZFwiLCBleCwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoeCkge1xuICAgIHJldHVybiB4ICE9PSBudWxsICYmIHggIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuaW1wb3J0IHsgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcihvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZShvKSB7XG4gICAgcmV0dXJuIG8gJiYgb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyKG8pIHtcbiAgICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yKG8pIHtcbiAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKVxuICAgICAgICByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKVxuICAgICAgICByZXR1cm4gbztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG4vKiBBIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYSBcInByb3RvdHlwaWNhbFwiIEFzeW5jSXRlcmF0b3IgaGVscGVyLCB0aGF0IGhhcyBgdGhpczpBc3luY0l0ZXJhYmxlPFQ+YCBhbmQgcmV0dXJuc1xuICBzb21ldGhpbmcgdGhhdCdzIGRlcml2ZWQgZnJvbSBBc3luY0l0ZXJhYmxlPFI+LCByZXN1bHQgaW4gYSB3cmFwcGVkIGZ1bmN0aW9uIHRoYXQgYWNjZXB0c1xuICB0aGUgc2FtZSBhcmd1bWVudHMgcmV0dXJucyBhIEFzeW5jRXh0cmFJdGVyYWJsZTxYPlxuKi9cbmZ1bmN0aW9uIHdyYXBBc3luY0hlbHBlcihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykgeyByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZuLmNhbGwodGhpcywgLi4uYXJncykpOyB9O1xufVxuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICAgIC8vIHRocm90dGxlOiB3cmFwQXN5bmNIZWxwZXIodGhyb3R0bGUpLFxuICAgIC8vIGRlYm91bmNlOiB3cmFwQXN5bmNIZWxwZXIoZGVib3VuY2UpLFxuICAgIC8vIGNvdW50OiB3cmFwQXN5bmNIZWxwZXIoY291bnQpLFxuICAgIC8vIHJldGFpbjogd3JhcEFzeW5jSGVscGVyKHJldGFpbiksXG4gICAgbWFwOiB3cmFwQXN5bmNIZWxwZXIobWFwKSxcbiAgICBmaWx0ZXI6IHdyYXBBc3luY0hlbHBlcihmaWx0ZXIpLFxuICAgIHVuaXF1ZTogd3JhcEFzeW5jSGVscGVyKHVuaXF1ZSksXG4gICAgd2FpdEZvcjogd3JhcEFzeW5jSGVscGVyKHdhaXRGb3IpLFxuICAgIG11bHRpOiB3cmFwQXN5bmNIZWxwZXIobXVsdGkpLFxuICAgIGJyb2FkY2FzdDogd3JhcEFzeW5jSGVscGVyKGJyb2FkY2FzdCksXG4gICAgaW5pdGlhbGx5OiB3cmFwQXN5bmNIZWxwZXIoaW5pdGlhbGx5KSxcbiAgICBjb25zdW1lOiBjb25zdW1lLFxuICAgIG1lcmdlKC4uLm0pIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICAgIH1cbn07XG5mdW5jdGlvbiBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcihzdG9wID0gKCkgPT4geyB9KSB7XG4gICAgbGV0IF9wZW5kaW5nID0gW107XG4gICAgbGV0IF9pdGVtcyA9IFtdO1xuICAgIGNvbnN0IHEgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gcTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGlmIChfaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogX2l0ZW1zLnNoaWZ0KCkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAgICAgICAvLyBhbmQgcSBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgICAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICAgICAgICBfcGVuZGluZy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIGlmIChfcGVuZGluZykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoX3BlbmRpbmcubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpLnJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgIF9pdGVtcyA9IF9wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvdyguLi5hcmdzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgICAgICAgIGlmIChfcGVuZGluZykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoX3BlbmRpbmcubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHVzaCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFfcGVuZGluZykge1xuICAgICAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwicXVldWVJdGVyYXRvciBoYXMgc3RvcHBlZFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX3BlbmRpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgX3BlbmRpbmcuc2hpZnQoKS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgX2l0ZW1zLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBxO1xufVxuLyogQW4gQXN5bmNJdGVyYWJsZSB3aGljaCB0eXBlZCBvYmplY3RzIGNhbiBiZSBwdWJsaXNoZWQgdG8uXG4gIFRoZSBxdWV1ZSBjYW4gYmUgcmVhZCBieSBtdWx0aXBsZSBjb25zdW1lcnMsIHdobyB3aWxsIGVhY2ggcmVjZWl2ZVxuICB1bmlxdWUgdmFsdWVzIGZyb20gdGhlIHF1ZXVlIChpZTogdGhlIHF1ZXVlIGlzIFNIQVJFRCBub3QgZHVwbGljYXRlZClcbiovXG5leHBvcnQgZnVuY3Rpb24gcHVzaEl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0sIGJ1ZmZlcldoZW5Ob0NvbnN1bWVycyA9IGZhbHNlKSB7XG4gICAgbGV0IGNvbnN1bWVycyA9IDA7XG4gICAgbGV0IGFpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKCkgPT4ge1xuICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgaWYgKGNvbnN1bWVycyA9PT0gMCAmJiAhYnVmZmVyV2hlbk5vQ29uc3VtZXJzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoYXN5bmNFeHRyYXMpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgICAgICAgIHJldHVybiBhaTtcbiAgICAgICAgfSxcbiAgICAgICAgcHVzaCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFidWZmZXJXaGVuTm9Db25zdW1lcnMgJiYgY29uc3VtZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gb25lIHJlYWR5IHRvIHJlYWQgdGhlIHJlc3VsdHNcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWkucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlKGV4KSB7XG4gICAgICAgICAgICBleCA/IGFpLnRocm93Py4oZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vKiBBbiBBc3luY0l0ZXJhYmxlIHdoaWNoIHR5cGVkIG9iamVjdHMgY2FuIGJlIHB1Ymxpc2hlZCB0by5cbiAgVGhlIHF1ZXVlIGNhbiBiZSByZWFkIGJ5IG11bHRpcGxlIGNvbnN1bWVycywgd2hvIHdpbGwgZWFjaCByZWNlaXZlXG4gIGEgY29weSBvZiB0aGUgdmFsdWVzIGZyb20gdGhlIHF1ZXVlIChpZTogdGhlIHF1ZXVlIGlzIEJST0FEQ0FTVCBub3Qgc2hhcmVkKS5cblxuICBUaGUgaXRlcmF0b3JzIHN0b3BzIHJ1bm5pbmcgd2hlbiB0aGUgbnVtYmVyIG9mIGNvbnN1bWVycyBkZWNyZWFzZXMgdG8gemVyb1xuKi9cbmV4cG9ydCBmdW5jdGlvbiBicm9hZGNhc3RJdGVyYXRvcihzdG9wID0gKCkgPT4geyB9KSB7XG4gICAgbGV0IGFpID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGIgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoYXN5bmNFeHRyYXMpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBhaS5kZWxldGUoYWRkZWQpO1xuICAgICAgICAgICAgICAgIGlmIChhaS5zaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFpLmFkZChhZGRlZCk7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFkZGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHVzaCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFhaT8uc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHEgb2YgYWkudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBxLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlKGV4KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHEgb2YgYWkudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBleCA/IHEudGhyb3c/LihleCkgOiBxLnJldHVybj8uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBiO1xufVxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShvYmosIG5hbWUsIHYpIHtcbiAgICAvLyBNYWtlIGBhYCBhbiBBc3luY0V4dHJhSXRlcmFibGUuIFdlIGRvbid0IGRvIHRoaXMgdW50aWwgYSBjb25zdW1lciBhY3R1YWxseSB0cmllcyB0b1xuICAgIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAgIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICAgIGxldCBpbml0SXRlcmF0b3IgPSAoKSA9PiB7XG4gICAgICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgICAgIC8vIFRoaXMgKnNob3VsZCogd29yayAoYWxvbmcgd2l0aCB0aGUgbXVsdGkgY2FsbCBiZWxvdywgYnV0IGlzIGRlZmVhdGVkIGJ5IHRoZSBsYXp5IGluaXRpYWxpemF0aW9uPyAmL3wgdW5ib3VuZCBtZXRob2RzPylcbiAgICAgICAgLy9jb25zdCBiaSA9IHB1c2hJdGVyYXRvcjxWPigpO1xuICAgICAgICAvL2NvbnN0IGIgPSBiaS5tdWx0aSgpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBjb25zdCBiaSA9IGJyb2FkY2FzdEl0ZXJhdG9yKCk7XG4gICAgICAgIGNvbnN0IGIgPSBiaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IHsgdmFsdWU6IGJpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiBmYWxzZSB9O1xuICAgICAgICBwdXNoID0gYmkucHVzaDtcbiAgICAgICAgT2JqZWN0LmtleXMoYXN5bmNIZWxwZXJGdW5jdGlvbnMpLm1hcChrID0+IGV4dHJhc1trXSA9IHsgdmFsdWU6IGJba10sIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGEsIGV4dHJhcyk7XG4gICAgICAgIHJldHVybiBiO1xuICAgIH07XG4gICAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgICBjb25zdCBsYXp5QXN5bmNNZXRob2QgPSAobWV0aG9kKSA9PiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG4gICAgY29uc3QgZXh0cmFzID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogaW5pdEl0ZXJhdG9yXG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKGFzeW5jSGVscGVyRnVuY3Rpb25zKS5tYXAoayA9PiBleHRyYXNba10gPSB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH0pO1xuICAgIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICAgIGxldCBwdXNoID0gKHYpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICAgICAgcmV0dXJuIHB1c2godik7XG4gICAgfTtcbiAgICBsZXQgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gYTsgfSxcbiAgICAgICAgc2V0KHYpIHtcbiAgICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgICAgIHB1c2godj8udmFsdWVPZigpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBib3goYSwgcGRzKSB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIC4uLnBkcyxcbiAgICAgICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhOyB9IH0sXG4gICAgICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhOyB9IH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgIC8qIFRPRE86IFRoaXMgaXMgcHJvYmxlbWF0aWMgYXMgdGhlIG9iamVjdCBtaWdodCBoYXZlIGNsYXNoaW5nIGtleXMuXG4gICAgICAgICAgICAgIFRoZSBhbHRlcm5hdGl2ZXMgYXJlOlxuICAgICAgICAgICAgICAtIERvbid0IGFkZCB0aGUgcGRzLCB0aGVuIHRoZSBvYmplY3QgcmVtYWlucyB1bm1vbGVzdGVkLCBidXQgY2FuJ3QgYmUgdXNlZCB3aXRoIC5tYXAsIC5maWx0ZXIsIGV0Y1xuICAgICAgICAgICAgICAtIGV4YW1pbmUgdGhlIG9iamVjdCBhbmQgZGVjaWRlIHdoZXRoZXIgdG8gaW5zZXJ0IHRoZSBwcm90b3R5cGUgKGJyZWFrcyBidWlsdCBpbiBvYmplY3RzLCB3b3JrcyB3aXRoIFBvSlMpXG4gICAgICAgICAgICAgIC0gZG9uJ3QgYWxsb3cgb2JqZWN0cyBhcyBpdGVyYWJsZSBwcm9wZXJ0aWVzLCB3aGljaCBhdm9pZHMgdGhlIGBkZWVwIHRyZWVgIHByb2JsZW1cbiAgICAgICAgICAgICAgLSBzb21ldGhpbmcgZWxzZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICghKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGEpKSB7XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0l0ZXJhYmxlIHByb3BlcnRpZXMgb2YgdHlwZSBcIm9iamVjdFwiIHdpbGwgYmUgc3ByZWFkIHRvIHByZXZlbnQgcmUtaW5pdGlhbGlzYXRpb24uJywgYSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHsgLi4uYSB9LCBwZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPYmplY3QoYSksIHtcbiAgICAgICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYS52YWx1ZU9mKCk7IH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbn1cbmV4cG9ydCBjb25zdCBtZXJnZSA9ICguLi5haSkgPT4ge1xuICAgIGNvbnN0IGl0ID0gYWkubWFwKGkgPT4gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gaSA/IGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgOiBpKTtcbiAgICBjb25zdCBwcm9taXNlcyA9IGl0Lm1hcCgoaSwgaWR4KSA9PiBpLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbiAgICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG4gICAgY29uc3QgbWVyZ2VkID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkOyB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgICAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHlpZWxkIGludGVybWVkaWF0ZSByZXR1cm4gdmFsdWVzLCB3ZSBqdXN0IGtlZXAgdGhlbSBpbiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4geyBkb25lOiBjb3VudCA9PT0gMCwgdmFsdWU6IHJlc3VsdC52YWx1ZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF0ubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogZXggfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXS5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgICAgICAgIC8vIHByZXZpb3VzbHk6IHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCk7XG59O1xuLypcbiAgRXh0ZW5zaW9ucyB0byB0aGUgQXN5bmNJdGVyYWJsZTpcbiAgY2FsbGluZyBgYmluZChhaSlgIGFkZHMgXCJzdGFuZGFyZFwiIG1ldGhvZHMgdG8gdGhlIHNwZWNpZmllZCBBc3luY0l0ZXJhYmxlXG4qL1xuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlKGkpIHtcbiAgICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgICAgICYmIE9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKVxuICAgICAgICAgICAgLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgaVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzKGFpKSB7XG4gICAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oYWksIGFzeW5jRXh0cmFzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnMoZykge1xuICAgIC8vIEB0cy1pZ25vcmU6IFRTIHR5cGUgbWFkbmVzc1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGcoLi4uYXJncykpO1xuICAgIH07XG59XG5jb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5mdW5jdGlvbiBmaWx0ZXJNYXAoc291cmNlLCBmbiwgaW5pdGlhbFZhbHVlID0gSWdub3JlKSB7XG4gICAgY29uc3QgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgbGV0IHByZXYgPSBJZ25vcmU7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoaW5pdGlhbFZhbHVlKS50aGVuKHZhbHVlID0+ICh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbml0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKHAgPT4gcC5kb25lXG4gICAgICAgICAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZShmbihwLnZhbHVlLCBwcmV2KSkgLypuZXcgUHJvbWlzZTxSIHwgdHlwZW9mIElnbm9yZT4ocGFzcyA9PiBwYXNzKGZuKHAudmFsdWUsIHByZXYpKSkqLy50aGVuKGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSwgZXggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyA/LnRoZW4ociA9PiByLCBleCA9PiBleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICAgICAgICB9KSwgZXggPT4gXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaS5yZXR1cm4/Lih2KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gbWFwKG1hcHBlcikge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cbmZ1bmN0aW9uIGZpbHRlcihmbikge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8pID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cbmZ1bmN0aW9uIHVuaXF1ZShmbikge1xuICAgIHJldHVybiBmblxuICAgICAgICA/IGZpbHRlck1hcCh0aGlzLCBhc3luYyAobywgcCkgPT4gKHAgPT09IElnbm9yZSB8fCBhd2FpdCBmbihvLCBwKSkgPyBvIDogSWdub3JlKVxuICAgICAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuZnVuY3Rpb24gaW5pdGlhbGx5KGluaXRWYWx1ZSkge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBvLCBpbml0VmFsdWUpO1xufVxuZnVuY3Rpb24gd2FpdEZvcihjYikge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvOyB9KSk7XG59XG4vKlxuYXN5bmMgZnVuY3Rpb24qIG1hcDxVLCBSPih0aGlzOiBBc3luY0l0ZXJhYmxlPFU+LCAuLi5tYXBwZXI6IE1hcHBlcjxVLCBSPltdKTogQXN5bmNJdGVyYWJsZTxBd2FpdGVkPFI+PiB7XG4gIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgdHJ5IHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHA6IEl0ZXJhdG9yUmVzdWx0PFUsIGFueT47XG4gICAgICB0cnkge1xuICAgICAgICBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldywgc28gd2UgdGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgdGhyb3cgeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfVxuICAgICAgfVxuXG4gICAgICBsZXQgdjogVSB8IFIgPSBwLnZhbHVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIG1hcHBlcilcbiAgICAgICAgICB2ID0gYXdhaXQgbSh2IGFzIFUpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgLy8gVGhlIG1hcHBlciB0aHJldywgd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBhbmQgdGhyb3cgdGhlIGVycm9yXG4gICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICAgICAgdGhyb3cgeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfVxuICAgICAgfVxuICAgICAgaWYgKHAuZG9uZSlcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgICB0cnkge1xuICAgICAgICB5aWVsZCB2IGFzIFI7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byB0aHJvdywgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgICBhaS50aHJvdz8uKGV4KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgIGFpLnJldHVybj8uKClcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiogZmlsdGVyPFU+KHRoaXM6IEFzeW5jSXRlcmFibGU8VT4sIGZuOiAobzogVSkgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNJdGVyYWJsZTxVPiB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBsZXQgcDogSXRlcmF0b3JSZXN1bHQ8VSwgYW55PjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcsIHNvIHdlIHRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgdGhyb3cgeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHAuZG9uZSlcbiAgICAgICAgICByZXR1cm4gcC52YWx1ZTtcblxuICAgICAgICBsZXQgZjogYm9vbGVhbjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGYgPSBhd2FpdCBmbihwLnZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAvLyBUaGUgZmlsdGVyIHRocmV3LCB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGFuZCB0aHJvdyB0aGUgZXJyb3JcbiAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gICAgICAgICAgdGhyb3cgeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHRocm93LCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICAgICAgICBhaS50aHJvdz8uKGV4KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIGFpLnJldHVybj8uKClcbiAgICB9XG4gIH1cbmNvbnN0IG5vVW5pcXVlVmFsdWUgPSBTeW1ib2woJ25vVW5pcXVlVmFsdWUnKTtcbmFzeW5jIGZ1bmN0aW9uKiB1bmlxdWU8VT4odGhpczogQXN5bmNJdGVyYWJsZTxVPiwgZm4/OiAobmV4dDogVSwgcHJldjogVSkgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNJdGVyYWJsZTxVPiB7XG4gIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgbGV0IGV4aXQgPSAoKSA9PiBhaS5yZXR1cm4/LigpO1xuICBsZXQgcHJldjogVSB8IHR5cGVvZiBub1VuaXF1ZVZhbHVlID0gbm9VbmlxdWVWYWx1ZTtcbiAgdHJ5IHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgcCA9IGF3YWl0IGFpLm5leHQoKTtcbiAgICAgIGlmIChwLmRvbmUpIHtcbiAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKGZuICYmIHByZXYgIT09IG5vVW5pcXVlVmFsdWUgPyBhd2FpdCBmbihwLnZhbHVlLCBwcmV2KSA6IHAudmFsdWUgIT0gcHJldikge1xuICAgICAgICB5aWVsZCBwLnZhbHVlO1xuICAgICAgfVxuICAgICAgcHJldiA9IHAudmFsdWU7XG4gICAgfVxuICB9IGNhdGNoIChleCkge1xuICAgIGV4aXQgPSAoKSA9PiBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gIH1cbiAgZmluYWxseSB7IGV4aXQoKSB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBpbml0aWFsbHk8VSwgSSA9IFU+KHRoaXM6IEFzeW5jSXRlcmFibGU8VT4sIGluaXRWYWx1ZTogSSk6IEFzeW5jSXRlcmFibGU8VSB8IEk+IHtcbiAgeWllbGQgaW5pdFZhbHVlO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcylcbiAgICB5aWVsZCB1O1xufVxuXG5hc3luYyBmdW5jdGlvbiogdGhyb3R0bGU8VT4odGhpczogQXN5bmNJdGVyYWJsZTxVPiwgbWlsbGlzZWNvbmRzOiBudW1iZXIpOiBBc3luY0l0ZXJhYmxlPFU+IHtcbiAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICBsZXQgZXhpdCA9ICgpID0+IGFpLnJldHVybj8uKCk7XG4gIGxldCBwYXVzZWQgPSAwO1xuICB0cnkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICByZXR1cm4gYWkucmV0dXJuPy4ocC52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgaWYgKHBhdXNlZCA8IG5vdykge1xuICAgICAgICBwYXVzZWQgPSBub3cgKyBtaWxsaXNlY29uZHM7XG4gICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChleCkge1xuICAgIGV4aXQgPSAoKSA9PiBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gIH1cbiAgZmluYWxseSB7IGV4aXQoKSB9XG59XG5cbmNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG5cbi8vIE5COiBERUJPVU5DRSBJUyBDVVJSRU5UTFkgQlJPS0VOXG5hc3luYyBmdW5jdGlvbiogZGVib3VuY2U8VT4odGhpczogQXN5bmNJdGVyYWJsZTxVPiwgbWlsbGlzZWNvbmRzOiBudW1iZXIpOiBBc3luY0l0ZXJhYmxlPFU+IHtcbiAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICBsZXQgZXhpdCA9ICgpID0+IGFpLnJldHVybj8uKCk7XG4gIGxldCB0aW1lcjogUHJvbWlzZTx7IGRlYm91bmNlZDogbnVtYmVyLCB2YWx1ZTogVSB9PiA9IGZvcmV2ZXI7XG4gIGxldCBsYXN0OiBhbnkgPSAtMTtcbiAgdHJ5IHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgcCA9IGF3YWl0IFByb21pc2UucmFjZShbYWkubmV4dCgpLCB0aW1lcl0pO1xuICAgICAgaWYgKCdkb25lJyBpbiBwICYmIHAuZG9uZSlcbiAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgaWYgKCdkZWJvdW5jZWQnIGluIHAgJiYgcC5kZWJvdW5jZWQpIHtcbiAgICAgICAgaWYgKHAuZGVib3VuY2VkID09PSBsYXN0KVxuICAgICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBoYXZlIGEgbmV3IHZhbHVlIGZyb20gdGhlIHNyY1xuICAgICAgICBjbGVhclRpbWVvdXQobGFzdCk7XG4gICAgICAgIHRpbWVyID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgbGFzdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh7IGRlYm91bmNlZDogbGFzdCwgdmFsdWU6IHAudmFsdWUgfSlcbiAgICAgICAgICB9LCBtaWxsaXNlY29uZHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgZXhpdCA9ICgpID0+IGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgfVxuICBmaW5hbGx5IHsgZXhpdCgpIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24qIHdhaXRGb3I8VT4odGhpczogQXN5bmNJdGVyYWJsZTxVPiwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jSXRlcmFibGU8VT4ge1xuICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGxldCBleGl0ID0gKCkgPT4gYWkucmV0dXJuPy4oKTtcbiAgdHJ5IHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgcCA9IGF3YWl0IGFpLm5leHQoKTtcbiAgICAgIGlmIChwLmRvbmUpIHtcbiAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBjYihyZXNvbHZlKSk7XG4gICAgICB5aWVsZCBwLnZhbHVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXgpIHtcbiAgICBleGl0ID0gKCkgPT4gYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LigpO1xuICB9XG4gIGZpbmFsbHkgeyBleGl0KCkgfVxufVxuXG5hc3luYyBmdW5jdGlvbiogY291bnQ8VSBleHRlbmRzIHt9LCBLIGV4dGVuZHMgc3RyaW5nPih0aGlzOiBBc3luY0l0ZXJhYmxlPFU+LCBmaWVsZDogSykge1xuICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGxldCBleGl0ID0gKCkgPT4gYWkucmV0dXJuPy4oKTtcbiAgbGV0IGNvdW50ID0gMDtcbiAgdHJ5IHtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHZhbHVlIG9mIHRoaXMpIHtcbiAgICAgIGNvbnN0IGNvdW50ZWQgPSB7XG4gICAgICAgIC4uLnZhbHVlLFxuICAgICAgICBbZmllbGRdOiBjb3VudCsrXG4gICAgICB9XG4gICAgICB5aWVsZCBjb3VudGVkO1xuICAgIH1cbiAgICBhaS5yZXR1cm4/LigpO1xuICB9IGNhdGNoIChleCkge1xuICAgIGV4aXQgPSAoKSA9PiBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gIH1cbiAgZmluYWxseSB7IGV4aXQoKSB9XG59XG5cbmZ1bmN0aW9uIHJldGFpbjxVIGV4dGVuZHMge30+KHRoaXM6IEFzeW5jSXRlcmFibGU8VT4pOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VT4gJiB7IHZhbHVlOiBVLCBkb25lOiBib29sZWFuIH0ge1xuICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGxldCBwcmV2OiBJdGVyYXRvclJlc3VsdDxVLCBhbnk+O1xuICByZXR1cm4ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiB0aGlzIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGNvbnN0IG4gPSBhaS5uZXh0KCk7XG4gICAgICBuLnRoZW4ocCA9PiBwcmV2ID0gcCk7XG4gICAgICByZXR1cm4gbjtcbiAgICB9LFxuICAgIHJldHVybih2YWx1ZT86IGFueSkge1xuICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHZhbHVlKSA/PyBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZSB9KTtcbiAgICB9LFxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICByZXR1cm4gYWkudGhyb3c/LihhcmdzKSA/PyBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9KVxuICAgIH0sXG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgcmV0dXJuIHByZXYudmFsdWU7XG4gICAgfSxcbiAgICBnZXQgZG9uZSgpIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHByZXYuZG9uZSk7XG4gICAgfVxuICB9XG59XG4qL1xuZnVuY3Rpb24gbXVsdGkoKSB7XG4gICAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgICBsZXQgY29uc3VtZXJzID0gMDtcbiAgICBsZXQgY3VycmVudCA9IGRlZmVycmVkKCk7XG4gICAgbGV0IGFpO1xuICAgIHJldHVybiB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICAvLyBTb21lb25lIHdhbnRzIHRvIHN0YXJ0IGNvbnN1bWluZy4gU3RhcnQgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgZmlyc3RcbiAgICAgICAgICAgIGlmICghY29uc3VtZXJzKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlKGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQucmVzb2x2ZShpdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhaS5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUaGUgc291cmNlIGhhcyBlcnJvcmVkLCByZWplY3QgYW55IGNvbnN1bWVycyBhbmQgcmVzZXQgdGhlIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3IocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlYXNvbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgYWkubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgICAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybih2KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaS5yZXR1cm4/Lih2KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gYnJvYWRjYXN0KCkge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBjb25zdCBiID0gYnJvYWRjYXN0SXRlcmF0b3IoKCkgPT4gYWkucmV0dXJuPy4oKSk7XG4gICAgKGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgYWkubmV4dCgpLnRoZW4odiA9PiB7XG4gICAgICAgICAgICBpZiAodi5kb25lKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVoIC0gd2UgdGhyb3cgdGhlc2UgYXdheSBmb3Igbm93LlxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLmJyb2FkY2FzdCBkb25lXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYi5wdXNoKHYudmFsdWUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiBiLmNsb3NlKGV4KSk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIGJbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZShmKSB7XG4gICAgbGV0IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMpXG4gICAgICAgIGxhc3QgPSBmPy4odSk7XG4gICAgYXdhaXQgbGFzdDtcbn1cbmNvbnN0IGFzeW5jSGVscGVyRnVuY3Rpb25zID0geyBtYXAsIGZpbHRlciwgdW5pcXVlLCB3YWl0Rm9yLCBtdWx0aSwgYnJvYWRjYXN0LCBpbml0aWFsbHksIGNvbnN1bWUsIG1lcmdlIC8qLCB0aHJvdHRsZSwgZGVib3VuY2UsIGNvdW50LCByZXRhaW4gKi8gfTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBwdXNoSXRlcmF0b3IsIGl0ZXJhYmxlSGVscGVycywgYXN5bmNFeHRyYXMsIG1lcmdlIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcihldikge1xuICAgIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlKTtcbiAgICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBwdXNoLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2gucHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2gucHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Iocykge1xuICAgIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICAgICAgICByZXR1cm4gW3BhcnRzWzBdLCBcImNoYW5nZVwiXTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXV07XG4gICAgfVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmZ1bmN0aW9uIHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpIHtcbiAgICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiICsgd2hhdCk7XG4gICAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgY29uc3QgcHVzaCA9IHB1c2hJdGVyYXRvcigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcbiAgICBjb25zdCBkZXRhaWxzID0ge1xuICAgICAgICBwdXNoLFxuICAgICAgICBjb250YWluZXIsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gICAgfTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKS5hZGQoZGV0YWlscyk7XG4gICAgcmV0dXJuIHB1c2g7XG59XG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbigpIHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIHlpZWxkIHVuZGVmaW5lZDsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYyhzcmMpIHtcbiAgICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBhc3luY0V4dHJhcy5tYXAuY2FsbChzcmMsIG1hcHBlcik7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgaWYgKCF3aGF0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlKHApIHtcbiAgICB5aWVsZCBwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW4oY29udGFpbmVyLCAuLi5zb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKTtcbiAgICB9XG4gICAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgICAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICAgICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgICAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgICAgICAgICAgOiB3aGF0KTtcbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGVybWluYXRlIG9uIHRoZSBuZXh0IGNhbGwgdG8gYG5leHQoKWBcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFlpZWxkIGEgXCJzdGFydFwiIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICAgIH1cbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcbiAgICAgICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbCkge1xuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcbiAgICAgICAgY29uc3QgYWkgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWk7IH0sXG4gICAgICAgICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIG1pc3NpbmcpLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50SXNJbkRPTShjb250YWluZXIpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICAgICAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgICAgICAgICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbigpKTtcbiAgICAgICAgICAgICAgICAvLyBOb3cgZXZlcnl0aGluZyBpcyByZWFkeSwgd2Ugc2ltcGx5IGRlZmVyIGFsbCBhc3luYyBvcHMgdG8gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgYWkucmV0dXJuID0gZXZlbnRzLnJldHVybj8uYmluZChldmVudHMpO1xuICAgICAgICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2hhaW5Bc3luYyhhaSk7XG4gICAgfVxuICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW4oKSk7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMobWVyZ2VkKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdCkge1xuICAgIGlmIChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsdCkpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xuICAgICAgICAgICAgaWYgKHJlY29yZC5hZGRlZE5vZGVzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcbn1cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSB7XG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZWNvcmRzKSB7XG4gICAgICAgICAgICBpZiAocmVjb3JkLmFkZGVkTm9kZXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgICAgICAgICAgICAgIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KSk7XG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgICAgICBjb25zdCB3YXJuID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oc3RhY2ssIG1pc3NpbmcpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuKSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhYmxlIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gICAgXCJjYW52YXNcIiwgXCJjYXB0aW9uXCIsIFwiY2l0ZVwiLCBcImNvZGVcIiwgXCJjb2xcIiwgXCJjb2xncm91cFwiLCBcImRhdGFcIiwgXCJkYXRhbGlzdFwiLCBcImRkXCIsIFwiZGVsXCIsIFwiZGV0YWlsc1wiLCBcImRmblwiLCBcImRpYWxvZ1wiLCBcImRpdlwiLFxuICAgIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICAgIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gICAgXCJtYXJrXCIsIFwibWVudVwiLCBcIm1ldGFcIiwgXCJtZXRlclwiLCBcIm5hdlwiLCBcIm5vc2NyaXB0XCIsIFwib2JqZWN0XCIsIFwib2xcIiwgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsXG4gICAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gICAgXCJ0aXRsZVwiLCBcInRyXCIsIFwidHJhY2tcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJcIiwgXCJ2aWRlb1wiLCBcIndiclwiXG5dO1xuY29uc3QgZWxlbWVudFByb3R5cGUgPSB7XG4gICAgZ2V0IGlkcygpIHtcbiAgICAgICAgcmV0dXJuIGdldEVsZW1lbnRJZE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIHNldCBpZHModikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgaWRzIG9uICcgKyB0aGlzLnZhbHVlT2YoKSk7XG4gICAgfSxcbiAgICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KTtcbiAgICB9XG59O1xuY29uc3QgcG9TdHlsZUVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbnBvU3R5bGVFbHQuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuZnVuY3Rpb24gaXNDaGlsZFRhZyh4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcidcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgICAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICAgICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgICAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgICAgIHx8IHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG4vKiB0YWcgKi9cbmNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgY29uc3QgdGFnID0gZnVuY3Rpb24gKF8xLCBfMiwgXzMpIHtcbiAgICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgICB0YWcocHJvdG90eXBlcykgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICAgIHRhZyh0YWdzW10sIHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIHByb3RvdHlwZXMpICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICAgKi9cbiAgICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBwcm90b3R5cGVzXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgICAgICA/IFtfMSwgXzIsIF8zXVxuICAgICAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICAgICAgICA/IFtudWxsLCBfMSwgXzJdXG4gICAgICAgICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xXTtcbiAgICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgICBhcmUgbm90IGV2YWx1YXRlZCB1bnRpbCBjYWxsZWQgKi9cbiAgICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShudWxsLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhlbGVtZW50UHJvdHlwZSkpO1xuICAgIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gICAgLy8gdG8gY29weSBhIGdldHRlci9zZXR0ZXIgcGFpciBmcm9tIGFub3RoZXIgb2JqZWN0XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQoYSkge1xuICAgICAgICAgICAgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAocHJvdG90eXBlcylcbiAgICAgICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBwcm90b3R5cGVzKTtcbiAgICBmdW5jdGlvbiBub2RlcyguLi5jKSB7XG4gICAgICAgIGNvbnN0IGFwcGVuZGVkID0gW107XG4gICAgICAgIChmdW5jdGlvbiBjaGlsZHJlbihjKSB7XG4gICAgICAgICAgICBpZiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZ1swXSk7XG4gICAgICAgICAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbm9kZXMocik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudEVsZW1lbnQsIG9sZFswXSkobik7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGcgPSBuO1xuICAgICAgICAgICAgICAgIH0sIHggPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oeCk7XG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGdbMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiB4IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihjKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhYmxlKGMpID8gY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGM7XG4gICAgICAgICAgICAgICAgY29uc3QgZHBtID0gRG9tUHJvbWlzZUNvbnRhaW5lcigpO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZHBtKTtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IFtkcG1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSAoQXJyYXkuaXNBcnJheSh0KSA/IHQgOiBbdF0pLmZpbHRlcihuID0+IEJvb2xlYW4obikpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoblswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuLmZvckVhY2goZSA9PiBlLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gKEFycmF5LmlzQXJyYXkodCkgPyB0IDogW3RdKS5maWx0ZXIoZSA9PiBlLm93bmVyRG9jdW1lbnQ/LmJvZHkuY29udGFpbnMoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCB8fCAhblswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihuZXcgRXJyb3IoXCJFbGVtZW50KHMpIG5vIGxvbmdlciBleGlzdCBpbiBkb2N1bWVudFwiICsgaW5zZXJ0aW9uU3RhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKSh1bmJveChlcy52YWx1ZSkgPz8gRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+IGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgYz8uW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4oZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgfSkoYyk7XG4gICAgICAgIHJldHVybiBhcHBlbmRlZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXBwZW5kZXIoY29udGFpbmVyLCBiZWZvcmUpIHtcbiAgICAgICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzKGMpO1xuICAgICAgICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICAgICAgICAgIC8vIFwiYmVmb3JlXCIsIGJlaW5nIGEgbm9kZSwgY291bGQgYmUgI3RleHQgbm9kZVxuICAgICAgICAgICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmJlZm9yZS5jYWxsKGJlZm9yZSwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgYSB0ZXh0IG5vZGUgLSB3b3JrIGJhY2t3YXJkcyBhbmQgaW5zZXJ0ICphZnRlciogdGhlIHByZWNlZWRpbmcgRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBiZWZvcmUucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDb250YWluZXIgbWlzbWF0Y2g/P1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZHJlbltpXSwgYmVmb3JlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmQuY2FsbChjb250YWluZXIsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICAgICAgdGFnLmFwcGVuZGVyID0gYXBwZW5kZXI7IC8vIExlZ2FjeSBSVEEgc3VwcG9ydFxuICAgICAgICB0YWcubm9kZXMgPSBub2RlczsgLy8gUHJlZmVycmVkIGludGVyZmFjZVxuICAgIH1cbiAgICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gICAgZnVuY3Rpb24gZGVlcERlZmluZShkLCBzKSB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHByb3BlcnR5IGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVuYm94KGEpIHtcbiAgICAgICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2Lm1hcCh1bmJveCkgOiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlLCBwcm9wcykge1xuICAgICAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgICAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gYXNzaWduKGQsIHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmFzZS5vd25lckRvY3VtZW50LmNvbnRhaW5zKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jLiBUZWxsIHRoZSBzb3VyY2UgYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHN0b3Agc2VuZGluZyB1cyBzdHVmZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBubyBsb25nZXIgZXhpc3RzIGluIGRvY3VtZW50ICh1cGRhdGUgXCIgKyBrICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihcIkVsZW1lbnQgbm8gbG9uZ2VyIGV4aXN0cyBpbiBkb2N1bWVudCAodXBkYXRlIFwiICsgayArIFwiKVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNyYyBpcyBub3QgYW4gb2JqZWN0IChvciBpcyBudWxsKSAtIGp1c3QgYXNzaWduIGl0LCB1bmxlc3MgaXQncyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoYmFzZSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLypcbiAgICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgICAgLi4ub3IuLi5cbiAgICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICAgKi9cbiAgICBmdW5jdGlvbiBleHRlbmRlZChfb3ZlcnJpZGVzKSB7XG4gICAgICAgIGNvbnN0IG92ZXJyaWRlcyA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgID8gKGluc3RhbmNlKSA9PiBfb3ZlcnJpZGVzXG4gICAgICAgICAgICA6IF9vdmVycmlkZXM7XG4gICAgICAgIGNvbnN0IHN0YXRpY0luc3RhbmNlID0ge307XG4gICAgICAgIGxldCBzdGF0aWNFeHRlbnNpb25zID0gb3ZlcnJpZGVzKHN0YXRpY0luc3RhbmNlKTtcbiAgICAgICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICAgICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICAgICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ZW5kVGFnRm4gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICAgICAgICBjb25zdCBuZXdDYWxsU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9O1xuICAgICAgICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICAgICAgICBjb25zdCBwZWQgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBvdmVycmlkZXMocGVkKTtcbiAgICAgICAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLnByb3RvdHlwZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUpO1xuICAgICAgICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZVtrXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgIGlmICghbm9BdHRycylcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihlKShjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKGJhc2UuaXRlcmFibGUpLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgayA9PiBlW2tdID0gZVtrXS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBleHRlbmRUYWcgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICAgICAgICBzdXBlcjogdGhpcyxcbiAgICAgICAgICAgIG92ZXJyaWRlcyxcbiAgICAgICAgICAgIGV4dGVuZGVkLFxuICAgICAgICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSAvKiwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5wcm90b3R5cGUgfHwge30pKi9dO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcikge1xuICAgICAgICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICAgICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5vdmVycmlkZXM/LihzdGF0aWNJbnN0YW5jZSk7XG4gICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkodGhpcyk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLnByb3RvdHlwZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG4gICAgICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAgICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICAgICAgICA6ICc/JztcbiAgICAgICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/ICcgQCcgKyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXT8ubWF0Y2goL1xcKCguKilcXCkvKT8uWzFdID8/ICc/JykgOiAnJztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleHRlbmRUYWc7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VUYWdDcmVhdG9ycyA9IHt9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrKSB7XG4gICAgICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuICAgICAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgICAgICAgICAgYXR0cnMgPSB7IHByb3RvdHlwZToge30gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgICAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgICAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSBPYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgICAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKTsgfSxcbiAgICAgICAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICAgIH1cbiAgICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn07XG5jb25zdCB7IFwiYWktdWktY29udGFpbmVyXCI6IEFzeW5jRE9NQ29udGFpbmVyIH0gPSB0YWcoJycsIFtcImFpLXVpLWNvbnRhaW5lclwiXSk7XG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIucHJvbWlzZSB7XG4gICAgZGlzcGxheTogJHtERUJVRyA/ICdpbmxpbmUnIDogJ25vbmUnfTtcbiAgICBjb2xvcjogIzg4ODtcbiAgICBmb250LXNpemU6IDAuNzVlbTtcbiAgfVxuICBhaS11aS1jb250YWluZXIucHJvbWlzZTphZnRlciB7XG4gICAgY29udGVudDogXCLii69cIjtcbiAgfWAsXG4gICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgY2xhc3NOYW1lOiAncHJvbWlzZSdcbiAgICB9LFxuICAgIGNvbnN0cnVjdGVkKCkge1xuICAgICAgICByZXR1cm4gQXN5bmNET01Db250YWluZXIoeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSB9LCBERUJVR1xuICAgICAgICAgICAgPyBuZXcgRXJyb3IoXCJDb25zdHJ1Y3RlZFwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKTtcbiAgICB9XG59KTtcbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9IEFzeW5jRE9NQ29udGFpbmVyLmV4dGVuZGVkKHtcbiAgICBzdHlsZXM6IGBcbiAgYWktdWktY29udGFpbmVyLmVycm9yIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBjb2xvcjogI2IzMztcbiAgICB3aGl0ZS1zcGFjZTogcHJlO1xuICB9YCxcbiAgICBvdmVycmlkZToge1xuICAgICAgICBjbGFzc05hbWU6ICdlcnJvcidcbiAgICB9LFxuICAgIGRlY2xhcmU6IHtcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgY29uc3RydWN0ZWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lcnJvcilcbiAgICAgICAgICAgIHJldHVybiBcIkVycm9yXCI7XG4gICAgICAgIGlmICh0aGlzLmVycm9yIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci5zdGFjaztcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gdGhpcy5lcnJvciAmJiB0aGlzLmVycm9yLnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci52YWx1ZS5zdGFjaztcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IudG9TdHJpbmcoKTtcbiAgICB9XG59KTtcbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkgeyB9OyAvLyBPbmx5IGNyZWF0ZSB0aGUgb2JzZXJ2ZXIgb25jZVxuICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgICAgICAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChyZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgWy4uLnJlbW92ZWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLCByZW1vdmVkXS5maWx0ZXIoZWx0ID0+ICFlbHQub3duZXJEb2N1bWVudC5jb250YWlucyhlbHQpKS5mb3JFYWNoKGVsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnb25SZW1vdmVkRnJvbURPTScgaW4gZWx0ICYmIHR5cGVvZiBlbHQub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJyAmJiBlbHQub25SZW1vdmVkRnJvbURPTSgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRJZE1hcChub2RlLCBpZHMpIHtcbiAgICBub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbiAgICBpZHMgPSBpZHMgfHwge307XG4gICAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWRdXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsdCkge1xuICAgICAgICAgICAgaWYgKGVsdC5pZCkge1xuICAgICAgICAgICAgICAgIGlmICghaWRzW2VsdC5pZF0pXG4gICAgICAgICAgICAgICAgICAgIGlkc1tlbHQuaWRdID0gZWx0O1xuICAgICAgICAgICAgICAgIC8vZWxzZSBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgLy8gIGNvbnNvbGUuaW5mbyhcIlNoYWRvd2VkIG11bHRpcGxlIGVsZW1lbnQgSURzXCIsIGVsdC5pZC8qLCBlbHQsIGlkcyFbZWx0LmlkXSovKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==