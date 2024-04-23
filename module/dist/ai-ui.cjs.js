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
/* harmony export */   DEBUG: () => (/* binding */ DEBUG),
/* harmony export */   log: () => (/* binding */ log)
/* harmony export */ });
// @ts-ignore
const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
function log(...args) {
    if (DEBUG)
        console.log('(AI-UI)', ...args);
}


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
        promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? (0,_debug_js__WEBPACK_IMPORTED_MODULE_0__.log)("Deferred", ex, initLocation) : undefined);
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
/* harmony export */   Ignore: () => (/* binding */ Ignore),
/* harmony export */   Iterability: () => (/* binding */ Iterability),
/* harmony export */   asyncIterator: () => (/* binding */ asyncIterator),
/* harmony export */   broadcastIterator: () => (/* binding */ broadcastIterator),
/* harmony export */   combine: () => (/* binding */ combine),
/* harmony export */   defineIterableProperty: () => (/* binding */ defineIterableProperty),
/* harmony export */   filterMap: () => (/* binding */ filterMap),
/* harmony export */   generatorHelpers: () => (/* binding */ generatorHelpers),
/* harmony export */   isAsyncIter: () => (/* binding */ isAsyncIter),
/* harmony export */   isAsyncIterable: () => (/* binding */ isAsyncIterable),
/* harmony export */   isAsyncIterator: () => (/* binding */ isAsyncIterator),
/* harmony export */   iterableHelpers: () => (/* binding */ iterableHelpers),
/* harmony export */   merge: () => (/* binding */ merge),
/* harmony export */   pushIterator: () => (/* binding */ pushIterator),
/* harmony export */   queueIteratableIterator: () => (/* binding */ queueIteratableIterator)
/* harmony export */ });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");


;
;
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
const asyncExtras = {
    map,
    filter,
    unique,
    waitFor,
    multi,
    broadcast,
    initially,
    consume,
    merge(...m) {
        return merge(this, ...m);
    },
    combine(others) {
        return combine(Object.assign({ '_this': this }, others));
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
            if (_items?.length) {
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
                if (!_items) {
                    (0,_debug_js__WEBPACK_IMPORTED_MODULE_0__.log)('Discarding queue push as there are no consumers');
                }
                else {
                    _items.push(value);
                }
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
const Iterability = Symbol("Iterability");
function defineIterableProperty(obj, name, v) {
    // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
    // access the iterator methods to prevent leaks where an iterable is created, but
    // never referenced, and therefore cannot be consumed and ultimately closed
    let initIterator = () => {
        initIterator = () => b;
        const bi = queueIteratableIterator();
        const mi = bi.multi();
        const b = mi[Symbol.asyncIterator]();
        extras[Symbol.asyncIterator] = {
            value: mi[Symbol.asyncIterator],
            enumerable: false,
            writable: false
        };
        push = bi.push;
        Object.keys(asyncExtras).forEach(k => extras[k] = {
            // @ts-ignore - Fix
            value: b[k],
            enumerable: false,
            writable: false
        });
        Object.defineProperties(a, extras);
        return b;
    };
    // Create stubs that lazily create the AsyncExtraIterable interface when invoked
    function lazyAsyncMethod(method) {
        return function (...args) {
            initIterator();
            // @ts-ignore - Fix
            return a[method].call(this, ...args);
        };
    }
    const extras = {
        [Symbol.asyncIterator]: {
            enumerable: false,
            writable: true,
            value: initIterator
        }
    };
    Object.keys(asyncExtras).forEach((k) => extras[k] = {
        enumerable: false,
        writable: true,
        // @ts-ignore - Fix
        value: lazyAsyncMethod(k)
    });
    // Lazily initialize `push`
    let push = (v) => {
        initIterator(); // Updates `push` to reference the multi-queue
        return push(v);
    };
    if (typeof v === 'object' && v && Iterability in v) {
        extras[Iterability] = Object.getOwnPropertyDescriptor(v, Iterability);
    }
    let a = box(v, extras);
    let piped = false;
    Object.defineProperty(obj, name, {
        get() { return a; },
        set(v) {
            if (v !== a) {
                if (piped) {
                    throw new Error(`Iterable "${name.toString()}" is already consuming another iterator`);
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
                    if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG)
                        console.info('(AI-UI)', new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`));
                    consume.call(v, v => { push(v?.valueOf()); }).finally(() => piped = false);
                }
                else {
                    a = box(v, extras);
                }
            }
            push(v?.valueOf());
        },
        enumerable: true
    });
    return obj;
    function box(a, pds) {
        let boxedObject = Ignore;
        if (a === null || a === undefined) {
            return Object.create(null, {
                ...pds,
                valueOf: { value() { return a; }, writable: true },
                toJSON: { value() { return a; }, writable: true }
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
                        if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG)
                            console.info('(AI-UI)', `The iterable property '${name.toString()}' of type "object" will be spread to prevent re-initialisation.\n${new Error().stack?.slice(6)}`);
                        if (Array.isArray(a))
                            boxedObject = Object.defineProperties([...a], pds);
                        else
                            boxedObject = Object.defineProperties({ ...a }, pds);
                    }
                    else {
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
                            if (key === 'valueOf')
                                return () => boxedObject;
                            const targetProp = Reflect.getOwnPropertyDescriptor(target, key);
                            // We include `targetProp === undefined` so we can nested monitor properties that are actually defined (yet)
                            // Note: this only applies to object iterables (since the root ones aren't proxied), but it does allow us to have
                            // defintions like:
                            //   iterable: { stuff: as Record<string, string | number ... }
                            if (targetProp === undefined || targetProp.enumerable) {
                                if (targetProp === undefined) {
                                    // @ts-ignore - Fix
                                    target[key] = undefined;
                                }
                                const realValue = Reflect.get(boxedObject, key, receiver);
                                const props = Object.getOwnPropertyDescriptors(boxedObject.map((o, p) => {
                                    const ov = o?.[key]?.valueOf();
                                    const pv = p?.valueOf();
                                    if (typeof ov === typeof pv && ov == pv)
                                        return Ignore;
                                    return ov; //o?.[key as keyof typeof o]
                                }));
                                Reflect.ownKeys(props).forEach(k => props[k].enumerable = false);
                                // @ts-ignore - Fix
                                return box(realValue, props);
                            }
                            return Reflect.get(target, key, receiver);
                        },
                    });
                }
                return a;
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
                // Boxes types, including BigInt
                return Object.defineProperties(Object(a), {
                    ...pds,
                    toJSON: { value() { return a.valueOf(); }, writable: true }
                });
        }
        throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
    }
}
const merge = (...ai) => {
    const it = new Array(ai.length);
    const promises = new Array(ai.length);
    let init = () => {
        init = () => { };
        for (let n = 0; n < ai.length; n++) {
            const a = ai[n];
            promises[n] = (it[n] = Symbol.asyncIterator in a
                ? a[Symbol.asyncIterator]()
                : a)
                .next()
                .then(result => ({ idx: n, result }));
        }
    };
    const results = [];
    const forever = new Promise(() => { });
    let count = promises.length;
    const merged = {
        [Symbol.asyncIterator]() { return merged; },
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
                    }
                    else {
                        // `ex` is the underlying async iteration exception
                        promises[idx] = it[idx]
                            ? it[idx].next().then(result => ({ idx, result })).catch(ex => ({ idx, result: { done: true, value: ex } }))
                            : Promise.resolve({ idx, result: { done: true, value: undefined } });
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
                    results[i] = await it[i]?.return?.({ done: true, value: r }).then(v => v.value, ex => ex);
                }
            }
            return { done: true, value: results };
        },
        async throw(ex) {
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
    return iterableHelpers(merged);
};
const combine = (src, opts = {}) => {
    const accumulated = {};
    let pc;
    let si = [];
    let active = 0;
    const forever = new Promise(() => { });
    const ci = {
        [Symbol.asyncIterator]() { return ci; },
        next() {
            if (pc === undefined) {
                pc = Object.entries(src).map(([k, sit], idx) => {
                    active += 1;
                    si[idx] = sit[Symbol.asyncIterator]();
                    return si[idx].next().then(ir => ({ si, idx, k, ir }));
                });
            }
            return (function step() {
                return Promise.race(pc).then(({ idx, k, ir }) => {
                    if (ir.done) {
                        pc[idx] = forever;
                        active -= 1;
                        if (!active)
                            return { done: true, value: undefined };
                        return step();
                    }
                    else {
                        // @ts-ignore
                        accumulated[k] = ir.value;
                        pc[idx] = si[idx].next().then(ir => ({ idx, k, ir }));
                    }
                    if (opts.ignorePartial) {
                        if (Object.keys(accumulated).length < Object.keys(src).length)
                            return step();
                    }
                    return { done: false, value: accumulated };
                });
            })();
        },
        return(v) {
            pc.forEach((p, idx) => {
                if (p !== forever) {
                    si[idx].return?.(v);
                }
            });
            return Promise.resolve({ done: true, value: v });
        },
        throw(ex) {
            pc.forEach((p, idx) => {
                if (p !== forever) {
                    si[idx].throw?.(ex);
                }
            });
            return Promise.reject({ done: true, value: ex });
        }
    };
    return iterableHelpers(ci);
};
function isExtraIterable(i) {
    return isAsyncIterable(i)
        && Object.keys(asyncExtras)
            .every(k => (k in i) && i[k] === asyncExtras[k]);
}
// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
function iterableHelpers(ai) {
    if (!isExtraIterable(ai)) {
        Object.defineProperties(ai, Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(asyncExtras)).map(([k, v]) => [k, { ...v, enumerable: false }])));
        //Object.assign(ai, asyncExtras);
    }
    return ai;
}
function generatorHelpers(g) {
    return function (...args) {
        const ai = g(...args);
        return iterableHelpers(ai);
    };
}
async function consume(f) {
    let last = undefined;
    for await (const u of this)
        last = f?.(u);
    await last;
}
/* A general filter & mapper that can handle exceptions & returns */
const Ignore = Symbol("Ignore");
function filterMap(source, fn, initialValue = Ignore) {
    let ai;
    let prev = Ignore;
    const fai = {
        [Symbol.asyncIterator]() {
            return fai;
        },
        next(...args) {
            if (initialValue !== Ignore) {
                const init = Promise.resolve(initialValue).then(value => ({ done: false, value }));
                initialValue = Ignore;
                return init;
            }
            return new Promise(function step(resolve, reject) {
                if (!ai)
                    ai = source[Symbol.asyncIterator]();
                ai.next(...args).then(p => p.done
                    ? resolve(p)
                    : Promise.resolve(fn(p.value, prev)).then(f => f === Ignore
                        ? step(resolve, reject)
                        : resolve({ done: false, value: prev = f }), ex => {
                        // The filter function failed...
                        ai.throw ? ai.throw(ex) : ai.return?.(ex); // Terminate the source - for now we ignore the result of the termination
                        reject({ done: true, value: ex }); // Terminate the consumer
                    }), ex => 
                // The source threw. Tell the consumer
                reject({ done: true, value: ex })).catch(ex => {
                    // The callback threw
                    ai.throw ? ai.throw(ex) : ai.return?.(ex); // Terminate the source - for now we ignore the result of the termination
                    reject({ done: true, value: ex });
                });
            });
        },
        throw(ex) {
            // The consumer wants us to exit with an exception. Tell the source
            return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(v => ({ done: true, value: v?.value }));
        },
        return(v) {
            // The consumer told us to return, so we need to terminate the source
            return Promise.resolve(ai?.return?.(v)).then(v => ({ done: true, value: v?.value }));
        }
    };
    return iterableHelpers(fai);
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
function multi() {
    const source = this;
    let consumers = 0;
    let current;
    let ai = undefined;
    // The source has produced a new result
    function step(it) {
        if (it)
            current.resolve(it);
        if (!it?.done) {
            current = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
            ai.next()
                .then(step)
                .catch(error => current.reject({ done: true, value: error }));
        }
    }
    const mai = {
        [Symbol.asyncIterator]() {
            consumers += 1;
            return mai;
        },
        next() {
            if (!ai) {
                ai = source[Symbol.asyncIterator]();
                step();
            }
            return current;
        },
        throw(ex) {
            // The consumer wants us to exit with an exception. Tell the source if we're the final one
            if (consumers < 1)
                throw new Error("AsyncIterator protocol error");
            consumers -= 1;
            if (consumers)
                return Promise.resolve({ done: true, value: ex });
            return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(v => ({ done: true, value: v?.value }));
        },
        return(v) {
            // The consumer told us to return, so we need to terminate the source if we're the only one
            if (consumers < 1)
                throw new Error("AsyncIterator protocol error");
            consumers -= 1;
            if (consumers)
                return Promise.resolve({ done: true, value: v });
            return Promise.resolve(ai?.return?.(v)).then(v => ({ done: true, value: v?.value }));
        }
    };
    return iterableHelpers(mai);
}
function broadcast() {
    const ai = this[Symbol.asyncIterator]();
    const b = broadcastIterator(() => ai.return?.());
    (function step() {
        ai.next().then(v => {
            if (v.done) {
                // Meh - we throw these away for now.
                // console.log(".broadcast done");
            }
            else {
                b.push(v.value);
                step();
            }
        }).catch(ex => b.close(ex));
    })();
    const bai = {
        [Symbol.asyncIterator]() {
            return b[Symbol.asyncIterator]();
        }
    };
    return iterableHelpers(bai);
}


/***/ }),

/***/ "./src/tags.ts":
/*!*********************!*\
  !*** ./src/tags.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UniqueID: () => (/* binding */ UniqueID)
/* harmony export */ });
/* Types for tag creation, implemented by `tag()` in ai-ui.ts.
  No code/data is declared in this file (except the re-exported symbols from iterators.ts).
*/
const UniqueID = Symbol("Unique ID");


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
                const { push, terminate, container, selector } = o;
                if (!document.body.contains(container)) {
                    const msg = "Container `#" + container.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
                    observations.delete(o);
                    terminate(new Error(msg));
                }
                else {
                    if (ev.target instanceof Node) {
                        if (selector) {
                            const nodes = container.querySelectorAll(selector);
                            for (const n of nodes) {
                                if ((ev.target === n || n.contains(ev.target)) && container.contains(n))
                                    push(ev);
                            }
                        }
                        else {
                            if ((ev.target === container || container.contains(ev.target)))
                                push(ev);
                        }
                    }
                }
            }
            catch (ex) {
                console.warn('(AI-UI)', 'docEventHandler', ex);
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
    const queue = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.queueIteratableIterator)(() => eventObservations.get(eventName)?.delete(details));
    const details /*EventObservation<Exclude<ExtractEventNames<EventName>, keyof SpecialWhenEvents>>*/ = {
        push: queue.push,
        terminate(ex) { queue.return?.(ex); },
        container,
        selector: selector || null
    };
    containerAndSelectorsMounted(container, selector ? [selector] : undefined)
        .then(_ => eventObservations.get(eventName).add(details));
    return queue.multi();
}
async function* neverGonnaHappen() {
    await new Promise(() => { });
    yield undefined; // Never should be executed
}
/* Syntactic sugar: chainAsync decorates the specified iterator so it can be mapped by
  a following function, or used directly as an iterable */
function chainAsync(src) {
    function mappableAsyncIterable(mapper) {
        return src.map(mapper);
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
                start.next = () => Promise.resolve({ done: true, value: undefined });
                return Promise.resolve({ done: false, value: {} });
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
                await containerAndSelectorsMounted(container, missing);
                const merged = (iterators.length > 1)
                    ? (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.merge)(...iterators)
                    : iterators.length === 1
                        ? iterators[0]
                        : (neverGonnaHappen());
                // Now everything is ready, we simply defer all async ops to the underlying
                // merged asyncIterator
                const events = merged[Symbol.asyncIterator]();
                if (events) {
                    ai.next = events.next.bind(events); //() => events.next();
                    ai.return = events.return?.bind(events);
                    ai.throw = events.throw?.bind(events);
                    return { done: false, value: {} };
                }
                return { done: true, value: undefined };
            }
        };
        return chainAsync((0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.iterableHelpers)(ai));
    }
    const merged = (iterators.length > 1)
        ? (0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.merge)(...iterators)
        : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen());
    return chainAsync((0,_iterators_js__WEBPACK_IMPORTED_MODULE_2__.iterableHelpers)(merged));
}
function elementIsInDOM(elt) {
    if (document.body.contains(elt))
        return Promise.resolve();
    return new Promise(resolve => new MutationObserver((records, mutation) => {
        if (records.some(r => r.addedNodes?.length)) {
            if (document.body.contains(elt)) {
                mutation.disconnect();
                resolve();
            }
        }
    }).observe(document.body, {
        subtree: true,
        childList: true
    }));
}
function containerAndSelectorsMounted(container, selectors) {
    if (selectors?.length)
        return Promise.all([
            allSelectorsPresent(container, selectors),
            elementIsInDOM(container)
        ]);
    return elementIsInDOM(container);
}
function allSelectorsPresent(container, missing) {
    missing = missing.filter(sel => !container.querySelector(sel));
    if (!missing.length) {
        return Promise.resolve(); // Nothing is missing
    }
    const promise = new Promise(resolve => new MutationObserver((records, mutation) => {
        if (records.some(r => r.addedNodes?.length)) {
            if (missing.every(sel => container.querySelector(sel))) {
                mutation.disconnect();
                resolve();
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
            console.warn('(AI-UI)', stack, missing);
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
/* harmony export */   augmentGlobalAsyncGenerators: () => (/* binding */ augmentGlobalAsyncGenerators),
/* harmony export */   enableOnRemovedFromDOM: () => (/* binding */ enableOnRemovedFromDOM),
/* harmony export */   getElementIdMap: () => (/* binding */ getElementIdMap),
/* harmony export */   tag: () => (/* binding */ tag),
/* harmony export */   when: () => (/* reexport safe */ _when_js__WEBPACK_IMPORTED_MODULE_2__.when)
/* harmony export */ });
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");
/* harmony import */ var _iterators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterators.js */ "./src/iterators.ts");
/* harmony import */ var _when_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./when.js */ "./src/when.ts");
/* harmony import */ var _tags_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tags.js */ "./src/tags.ts");
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./debug.js */ "./src/debug.ts");





/* Export useful stuff for users of the bundled code */


let idCount = 0;
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
            if ((0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(a)) {
                const ai = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIterator)(a) ? a : a[Symbol.asyncIterator]();
                const step = () => ai.next().then(({ done, value }) => { assignProps(this, value); done || step(); }, ex => console.warn("(AI-UI)", ex));
                step();
            }
            else
                assignProps(this, a);
        }
    });
    if (prototypes)
        deepDefine(tagPrototypes, prototypes);
    function nodes(...c) {
        const appended = [];
        (function children(c) {
            if (c === undefined || c === null || c === _iterators_js__WEBPACK_IMPORTED_MODULE_1__.Ignore)
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
                }, (x) => {
                    console.warn('(AI-UI)', x);
                    appender(g[0])(DyamicElementError({ error: x }));
                });
                return;
            }
            if (c instanceof Node) {
                appended.push(c);
                return;
            }
            if ((0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(c)) {
                const insertionStack = _debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG ? ('\n' + new Error().stack?.replace(/^Error: /, "Insertion :")) : '';
                const ap = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIterable)(c) ? c[Symbol.asyncIterator]() : c;
                // It's possible that this async iterator is a boxed object that also holds a value
                const unboxed = c.valueOf();
                const dpm = (unboxed === undefined || unboxed === c) ? [DomPromiseContainer()] : nodes(unboxed);
                appended.push(...dpm);
                let t = dpm;
                const error = (errorValue) => {
                    const n = t.filter(n => Boolean(n?.parentNode));
                    if (n.length) {
                        t = appender(n[0].parentNode, n[0])(DyamicElementError({ error: errorValue }));
                        n.forEach(e => !t.includes(e) && e.parentNode.removeChild(e));
                    }
                    else
                        console.warn('(AI-UI)', "Can't report error", errorValue, t);
                };
                const update = (es) => {
                    if (!es.done) {
                        try {
                            const n = t.filter(e => e?.parentNode && e.ownerDocument?.body.contains(e));
                            if (!n.length) {
                                // We're done - terminate the source quietly (ie this is not an exception as it's expected, but we're done)
                                throw new Error("Element(s) no longer exist in document" + insertionStack);
                            }
                            t = appender(n[0].parentNode, n[0])(unbox(es.value) ?? DomPromiseContainer());
                            n.forEach(e => !t.includes(e) && e.parentNode.removeChild(e));
                            ap.next().then(update).catch(error);
                        }
                        catch (ex) {
                            // Something went wrong. Terminate the iterator source
                            ap.return?.(ex);
                        }
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
                        console.warn('(AI-UI)', "Internal error - container mismatch");
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
        Object.assign(tag, {
            appender, // Legacy RTA support
            nodes, // Preferred interface instead of `appender`
            UniqueID: _tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID,
            augmentGlobalAsyncGenerators
        });
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
                                    (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
                console.warn('(AI-UI)', "deepAssign", k, s[k], ex);
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
                                assignIterable(value, k);
                            }
                            else if ((0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value)) {
                                value.then(value => {
                                    if (value && typeof value === 'object') {
                                        // Special case: this promise resolved to an async iterator
                                        if ((0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                                            assignIterable(value, k);
                                        }
                                        else {
                                            assignObject(value, k);
                                        }
                                    }
                                    else {
                                        if (s[k] !== undefined)
                                            d[k] = s[k];
                                    }
                                }, error => (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)("Failed to set attribute", error));
                            }
                            else if (!(0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                                // This has a real value, which might be an object
                                if (value && typeof value === 'object' && !(0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value))
                                    assignObject(value, k);
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
                        console.warn('(AI-UI)', "assignProps", k, s[k], ex);
                        throw ex;
                    }
                }
                function assignIterable(value, k) {
                    const ap = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.asyncIterator)(value);
                    const update = (es) => {
                        if (!base.ownerDocument.contains(base)) {
                            /* This element has been removed from the doc. Tell the source ap
                              to stop sending us stuff */
                            ap.return?.(new Error("Element no longer exists in document (update " + k.toString() + ")"));
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
                        console.warn('(AI-UI)', "Dynamic attribute error", errorValue, k, d, base);
                        appender(base)(DyamicElementError({ error: errorValue }));
                    };
                    ap.next().then(update).catch(error);
                }
                function assignObject(value, k) {
                    if (value instanceof Node) {
                        (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
            })(base, props);
        }
    }
    ;
    function tagHasInstance(e) {
        for (let c = e.constructor; c; c = c.super) {
            if (c === this)
                return true;
        }
        return false;
    }
    function extended(_overrides) {
        const instanceDefinition = (typeof _overrides !== 'function')
            ? (instance) => Object.assign({}, _overrides, instance)
            : _overrides;
        const uniqueTagID = Date.now().toString(36) + (idCount++).toString(36) + Math.random().toString(36).slice(2);
        let staticExtensions = instanceDefinition({ [_tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID]: uniqueTagID });
        /* "Statically" create any styles required by this widget */
        if (staticExtensions.styles) {
            poStyleElt.appendChild(document.createTextNode(staticExtensions.styles + '\n'));
            if (!document.head.contains(poStyleElt)) {
                document.head.appendChild(poStyleElt);
            }
        }
        // "this" is the tag we're being extended from, as it's always called as: `(this).extended`
        // Here's where we actually create the tag, by accumulating all the base attributes and
        // (finally) assigning those specified by the instantiation
        const extendTagFn = (attrs, ...children) => {
            const noAttrs = isChildTag(attrs);
            const newCallStack = [];
            const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack };
            const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
            e.constructor = extendTag;
            const tagDefinition = instanceDefinition({ [_tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID]: uniqueTagID });
            combinedAttrs[callStackSymbol].push(tagDefinition);
            deepDefine(e, tagDefinition.prototype);
            deepDefine(e, tagDefinition.override);
            deepDefine(e, tagDefinition.declare);
            tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach(k => {
                if (k in e) {
                    (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
                }
                else
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
                    // @ts-ignore - some props of e (HTMLElement) are read-only, and we don't know if
                    // k is one of them.
                    k => e[k] = e[k]);
                }
            }
            return e;
        };
        const extendTag = Object.assign(extendTagFn, {
            super: this,
            definition: Object.assign(staticExtensions, { [_tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID]: uniqueTagID }),
            extended,
            valueOf: () => {
                const keys = [...Object.keys(staticExtensions.declare || {}), ...Object.keys(staticExtensions.iterable || {})];
                return `${extendTag.name}: {${keys.join(', ')}}\n \u21AA ${this.valueOf()}`;
            }
        });
        Object.defineProperty(extendTag, Symbol.hasInstance, {
            value: tagHasInstance,
            writable: true,
            configurable: true
        });
        const fullProto = {};
        (function walkProto(creator) {
            if (creator?.super)
                walkProto(creator.super);
            const proto = creator.definition;
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
            : uniqueTagID;
        const callSite = _debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG ? (new Error().stack?.split('\n')[2] ?? '') : '';
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
        Object.defineProperty(tagCreator, Symbol.hasInstance, {
            value: tagHasInstance,
            writable: true,
            configurable: true
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
    display: ${_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG ? 'inline' : 'none'};
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
        return AsyncDOMContainer({ style: { display: 'none' } }, _debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG
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
function augmentGlobalAsyncGenerators() {
    let g = (async function* () { })();
    while (g) {
        const desc = Object.getOwnPropertyDescriptor(g, Symbol.asyncIterator);
        if (desc) {
            (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.iterableHelpers)(g);
            break;
        }
        g = Object.getPrototypeOf(g);
    }
    if (!g) {
        (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)("Failed to augment the prototype of `(async function*())()`");
    }
}
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
const warned = new Set();
function getElementIdMap(node, ids) {
    node = node || document;
    ids = ids || {};
    if (node.querySelectorAll) {
        node.querySelectorAll("[id]").forEach(function (elt) {
            if (elt.id) {
                if (!ids[elt.id])
                    ids[elt.id] = elt;
                else if (_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG) {
                    if (!warned.has(elt.id)) {
                        warned.add(elt.id);
                        console.info('(AI-UI)', "Shadowed multiple element IDs", elt.id, elt, ids[elt.id]);
                    }
                }
            }
        });
    }
    return ids;
}

})();

exports.Iterators = __webpack_exports__.Iterators;
exports.augmentGlobalAsyncGenerators = __webpack_exports__.augmentGlobalAsyncGenerators;
exports.enableOnRemovedFromDOM = __webpack_exports__.enableOnRemovedFromDOM;
exports.getElementIdMap = __webpack_exports__.getElementIdMap;
exports.tag = __webpack_exports__.tag;
exports.when = __webpack_exports__.when;
Object.defineProperty(exports, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBLGVBQWUsNENBQUs7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsbUNBQW1DLFNBQVMsbUJBQW1CLEVBQUUsNENBQUs7QUFDdEU7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1AsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLFlBQVksOERBQWU7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQUc7QUFDWDtBQUNBO0FBQ087QUFDUCw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsU0FBUztBQUNULEtBQUssMkJBQTJCLGdDQUFnQztBQUNoRTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qiw0Q0FBSztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvZGVidWcudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvZGVmZXJyZWQudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvaXRlcmF0b3JzLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL3RhZ3MudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvd2hlbi50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2FpLXVpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pIHx8IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi5hcmdzKSB7XG4gICAgaWYgKERFQlVHKVxuICAgICAgICBjb25zb2xlLmxvZygnKEFJLVVJKScsIC4uLmFyZ3MpO1xufVxuIiwiaW1wb3J0IHsgREVCVUcsIGxvZyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodikgPT4geyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkKCkge1xuICAgIGxldCByZXNvbHZlID0gbm90aGluZztcbiAgICBsZXQgcmVqZWN0ID0gbm90aGluZztcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcik7XG4gICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gbG9nKFwiRGVmZXJyZWRcIiwgZXgsIGluaXRMb2NhdGlvbikgOiB1bmRlZmluZWQpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlKHgpIHtcbiAgICByZXR1cm4geCAhPT0gbnVsbCAmJiB4ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsImltcG9ydCB7IERFQlVHLCBsb2cgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuaW1wb3J0IHsgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiO1xuO1xuO1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcihvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZShvKSB7XG4gICAgcmV0dXJuIG8gJiYgb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyKG8pIHtcbiAgICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yKG8pIHtcbiAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKVxuICAgICAgICByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKVxuICAgICAgICByZXR1cm4gbztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG5jb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgICBtYXAsXG4gICAgZmlsdGVyLFxuICAgIHVuaXF1ZSxcbiAgICB3YWl0Rm9yLFxuICAgIG11bHRpLFxuICAgIGJyb2FkY2FzdCxcbiAgICBpbml0aWFsbHksXG4gICAgY29uc3VtZSxcbiAgICBtZXJnZSguLi5tKSB7XG4gICAgICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgICB9LFxuICAgIGNvbWJpbmUob3RoZXJzKSB7XG4gICAgICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICAgIH1cbn07XG5leHBvcnQgZnVuY3Rpb24gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSkge1xuICAgIGxldCBfcGVuZGluZyA9IFtdO1xuICAgIGxldCBfaXRlbXMgPSBbXTtcbiAgICBjb25zdCBxID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHE7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoX2l0ZW1zPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBfaXRlbXMuc2hpZnQoKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQoKTtcbiAgICAgICAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgICAgICAgIC8vIGFuZCBxIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgICAgICAgIF9wZW5kaW5nLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICByZXR1cm4oKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIV9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfcGVuZGluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIV9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG4vKiBBbiBBc3luY0l0ZXJhYmxlIHdoaWNoIHR5cGVkIG9iamVjdHMgY2FuIGJlIHB1Ymxpc2hlZCB0by5cbiAgVGhlIHF1ZXVlIGNhbiBiZSByZWFkIGJ5IG11bHRpcGxlIGNvbnN1bWVycywgd2hvIHdpbGwgZWFjaCByZWNlaXZlXG4gIHVuaXF1ZSB2YWx1ZXMgZnJvbSB0aGUgcXVldWUgKGllOiB0aGUgcXVldWUgaXMgU0hBUkVEIG5vdCBkdXBsaWNhdGVkKVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwdXNoSXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSwgYnVmZmVyV2hlbk5vQ29uc3VtZXJzID0gZmFsc2UpIHtcbiAgICBsZXQgY29uc3VtZXJzID0gMDtcbiAgICBsZXQgYWkgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiB7XG4gICAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgICBpZiAoY29uc3VtZXJzID09PSAwICYmICFidWZmZXJXaGVuTm9Db25zdW1lcnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShhc3luY0V4dHJhcyksIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgICAgICAgcmV0dXJuIGFpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWJ1ZmZlcldoZW5Ob0NvbnN1bWVycyAmJiBjb25zdW1lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBObyBvbmUgcmVhZHkgdG8gcmVhZCB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhaS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoZXgpIHtcbiAgICAgICAgICAgIGV4ID8gYWkudGhyb3c/LihleCkgOiBhaS5yZXR1cm4/LigpO1xuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qIEFuIEFzeW5jSXRlcmFibGUgd2hpY2ggdHlwZWQgb2JqZWN0cyBjYW4gYmUgcHVibGlzaGVkIHRvLlxuICBUaGUgcXVldWUgY2FuIGJlIHJlYWQgYnkgbXVsdGlwbGUgY29uc3VtZXJzLCB3aG8gd2lsbCBlYWNoIHJlY2VpdmVcbiAgYSBjb3B5IG9mIHRoZSB2YWx1ZXMgZnJvbSB0aGUgcXVldWUgKGllOiB0aGUgcXVldWUgaXMgQlJPQURDQVNUIG5vdCBzaGFyZWQpLlxuXG4gIFRoZSBpdGVyYXRvcnMgc3RvcHMgcnVubmluZyB3aGVuIHRoZSBudW1iZXIgb2YgY29uc3VtZXJzIGRlY3JlYXNlcyB0byB6ZXJvXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJyb2FkY2FzdEl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgICBsZXQgYWkgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgYiA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShhc3luY0V4dHJhcyksIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFpLmRlbGV0ZShhZGRlZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFpLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWkuYWRkKGFkZGVkKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWRkZWQpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWFpPy5zaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIHEucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoZXgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIGV4ID8gcS50aHJvdz8uKGV4KSA6IHEucmV0dXJuPy4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGI7XG59XG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KG9iaiwgbmFtZSwgdikge1xuICAgIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gICAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gICAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gICAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICAgICAgY29uc3QgYmkgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigpO1xuICAgICAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwdXNoID0gYmkucHVzaDtcbiAgICAgICAgT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpLmZvckVhY2goayA9PiBleHRyYXNba10gPSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICB2YWx1ZTogYltrXSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgICAgICByZXR1cm4gYjtcbiAgICB9O1xuICAgIC8vIENyZWF0ZSBzdHVicyB0aGF0IGxhemlseSBjcmVhdGUgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZSBpbnRlcmZhY2Ugd2hlbiBpbnZva2VkXG4gICAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBleHRyYXMgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogaW5pdEl0ZXJhdG9yXG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKS5mb3JFYWNoKChrKSA9PiBleHRyYXNba10gPSB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICB2YWx1ZTogbGF6eUFzeW5jTWV0aG9kKGspXG4gICAgfSk7XG4gICAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gICAgbGV0IHB1c2ggPSAodikgPT4ge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgICAgICByZXR1cm4gcHVzaCh2KTtcbiAgICB9O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2KSB7XG4gICAgICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHYsIEl0ZXJhYmlsaXR5KTtcbiAgICB9XG4gICAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgICBsZXQgcGlwZWQgPSBmYWxzZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIGE7IH0sXG4gICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICAgICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBjb25zdW1pbmcgYW5vdGhlciBpdGVyYXRvcmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gbWFrZSB0aGlzIGxhenkgcmVhbGx5IC0gZGlmZmljdWx0IHNpbmNlIHdlIGRvbid0XG4gICAgICAgICAgICAgICAgICAgIC8vIGtub3cgaWYgYW55b25lIGhhcyBhbHJlYWR5IHN0YXJ0ZWQgY29uc3VtaW5nIGl0LiBTaW5jZSBhc3NpZ25pbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGEgYmFkIGlkZWFcbiAgICAgICAgICAgICAgICAgICAgLy8gKHNpbmNlIHdoYXQgZG8gd2UgZG86IG1lcmdlPyB0ZXJtaW5hdGUgdGhlIGZpcnN0IHRoZW4gY29uc3VtZSB0aGUgc2Vjb25kPyksXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzb2x1dGlvbiBoZXJlIChvbmUgb2YgbWFueSBwb3NzaWJpbGl0aWVzKSBpcyBvbmx5IHRvIGFsbG93IE9ORSBsYXp5XG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbm1lbnQgaWYgYW5kIG9ubHkgaWYgdGhpcyBpdGVyYWJsZSBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gJ2dldCcgeWV0LlxuICAgICAgICAgICAgICAgICAgICAvLyBIb3dldmVyLCB0aGlzIHdvdWxkIGF0IHByZXNlbnQgcG9zc2libHkgYnJlYWsgdGhlIGluaXRpYWxpc2F0aW9uIG9mIGl0ZXJhYmxlXG4gICAgICAgICAgICAgICAgICAgIC8vIHByb3BlcnRpZXMgYXMgdGhlIGFyZSBpbml0aWFsaXplZCBieSBhdXRvLWFzc2lnbm1lbnQsIGlmIGl0IHdlcmUgaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgcGlwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJyhBSS1VSSknLCBuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LCB2ID0+IHsgcHVzaCh2Py52YWx1ZU9mKCkpOyB9KS5maW5hbGx5KCgpID0+IHBpcGVkID0gZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB1c2godj8udmFsdWVPZigpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gICAgZnVuY3Rpb24gYm94KGEsIHBkcykge1xuICAgICAgICBsZXQgYm94ZWRPYmplY3QgPSBJZ25vcmU7XG4gICAgICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgICAgIC4uLnBkcyxcbiAgICAgICAgICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYTsgfSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhOyB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIC8qIFRPRE86IFRoaXMgaXMgcHJvYmxlbWF0aWMgYXMgdGhlIG9iamVjdCBtaWdodCBoYXZlIGNsYXNoaW5nIGtleXMgYW5kIG5lc3RlZCBtZW1iZXJzLlxuICAgICAgICAgICAgICAgICAgVGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb246XG4gICAgICAgICAgICAgICAgICAqIFNwcmVhZHMgaXRlcmFibGUgb2JqZWN0cyBpbiB0byBhIHNoYWxsb3cgY29weSBvZiB0aGUgb3JpZ2luYWwgb2JqZWN0LCBhbmQgb3ZlcnJpdGVzIGNsYXNoaW5nIG1lbWJlcnMgbGlrZSBgbWFwYFxuICAgICAgICAgICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iai5tYXAobyA9PiBvLmZpZWxkKTtcbiAgICAgICAgICAgICAgICAgICogVGhlIGl0ZXJhdG9yIHdpbGwgeWllbGQgb25cbiAgICAgICAgICAgICAgICAgICogICAgIHRoaXMuaXRlcmFibGVPYmogPSBuZXdWYWx1ZTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAqIE1lbWJlcnMgYWNjZXNzIGlzIHByb3hpZWQsIHNvIHRoYXQ6XG4gICAgICAgICAgICAgICAgICAqICAgICAoc2V0KSB0aGlzLml0ZXJhYmxlT2JqLmZpZWxkID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgdW5kZXJseWluZyBvYmplY3QgdG8geWllbGQgYnkgcmUtYXNzaWdubWVudCAodGhlcmVmb3JlIGNhbGxpbmcgdGhlIHNldHRlcilcbiAgICAgICAgICAgICAgICAgICogU2ltaWxhcmx5OlxuICAgICAgICAgICAgICAgICAgKiAgICAgKGdldCkgdGhpcy5pdGVyYWJsZU9iai5maWVsZFxuICAgICAgICAgICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIGl0ZXJhdG9yIGZvciB0aGUgYmFzZSBvYmplY3QgdG8gYmUgbWFwcGVkLCBsaWtlXG4gICAgICAgICAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqZWN0Lm1hcChvID0+IG9bZmllbGRdKVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKCEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIElnbm9yZSBpcyB0aGUgSU5JVElBTCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoYm94ZWRPYmplY3QgPT09IElnbm9yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnKEFJLVVJKScsIGBUaGUgaXRlcmFibGUgcHJvcGVydHkgJyR7bmFtZS50b1N0cmluZygpfScgb2YgdHlwZSBcIm9iamVjdFwiIHdpbGwgYmUgc3ByZWFkIHRvIHByZXZlbnQgcmUtaW5pdGlhbGlzYXRpb24uXFxuJHtuZXcgRXJyb3IoKS5zdGFjaz8uc2xpY2UoNil9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFsuLi5hXSwgcGRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHsgLi4uYSB9LCBwZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihib3hlZE9iamVjdCwgYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJveGVkT2JqZWN0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgQlJPS0VOOiBmYWlscyBuZXN0ZWQgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJveGVkT2JqZWN0LCAndmFsdWVPZicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJveGVkT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBwcm94eSB0aGUgcmVzdWx0IHNvIHdlIGNhbiB0cmFjayBtZW1iZXJzIG9mIHRoZSBpdGVyYWJsZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm94eShib3hlZE9iamVjdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGZpcmVzIHRoZSBpdGVyYXRvciBieSByZS1hc3NpZ25pbmcgdGhlIGl0ZXJhYmxlIHZpYSBpdCdzIHNldHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoKG9ialtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IHJldHVybnMgYSBtYXBwZWQgaXRlcmF0b3IgZm9yIHRoZSBzcGVjaWZpZWQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAndmFsdWVPZicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiBib3hlZE9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQcm9wID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGluY2x1ZGUgYHRhcmdldFByb3AgPT09IHVuZGVmaW5lZGAgc28gd2UgY2FuIG5lc3RlZCBtb25pdG9yIHByb3BlcnRpZXMgdGhhdCBhcmUgYWN0dWFsbHkgZGVmaW5lZCAoeWV0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHRoaXMgb25seSBhcHBsaWVzIHRvIG9iamVjdCBpdGVyYWJsZXMgKHNpbmNlIHRoZSByb290IG9uZXMgYXJlbid0IHByb3hpZWQpLCBidXQgaXQgZG9lcyBhbGxvdyB1cyB0byBoYXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGVmaW50aW9ucyBsaWtlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgaXRlcmFibGU6IHsgc3R1ZmY6IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlciAuLi4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRQcm9wID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0UHJvcC5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRQcm9wID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KGJveGVkT2JqZWN0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhib3hlZE9iamVjdC5tYXAoKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG92ID0gbz8uW2tleV0/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB2ID0gcD8udmFsdWVPZigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvdiA9PT0gdHlwZW9mIHB2ICYmIG92ID09IHB2KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJZ25vcmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3Y7IC8vbz8uW2tleSBhcyBrZXlvZiB0eXBlb2Ygb11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWZsZWN0Lm93bktleXMocHJvcHMpLmZvckVhY2goayA9PiBwcm9wc1trXS5lbnVtZXJhYmxlID0gZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBib3gocmVhbFZhbHVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0KGEpLCB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnBkcyxcbiAgICAgICAgICAgICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYS52YWx1ZU9mKCk7IH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBvZiB0eXBlIFwiJyArIHR5cGVvZiBhICsgJ1wiJyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IG1lcmdlID0gKC4uLmFpKSA9PiB7XG4gICAgY29uc3QgaXQgPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgICBjb25zdCBwcm9taXNlcyA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICAgIGxldCBpbml0ID0gKCkgPT4ge1xuICAgICAgICBpbml0ID0gKCkgPT4geyB9O1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IGFpLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gYWlbbl07XG4gICAgICAgICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgICAgICAgICA/IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICAgICAgICAgICAgICA6IGEpXG4gICAgICAgICAgICAgICAgLm5leHQoKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbiAgICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG4gICAgY29uc3QgbWVyZ2VkID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkOyB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgICAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHlpZWxkIGludGVybWVkaWF0ZSByZXR1cm4gdmFsdWVzLCB3ZSBqdXN0IGtlZXAgdGhlbSBpbiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4geyBkb25lOiBjb3VudCA9PT0gMCwgdmFsdWU6IHJlc3VsdC52YWx1ZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGl0W2lkeF0ubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZWQudGhyb3c/LihleCkgPz8gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgZXhjZXB0aW9uXCIpIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgcmV0dXJuKHIpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyB0aHJvdyhleCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgICAgICAgIC8vIHByZXZpb3VzbHk6IHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCk7XG59O1xuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSAoc3JjLCBvcHRzID0ge30pID0+IHtcbiAgICBjb25zdCBhY2N1bXVsYXRlZCA9IHt9O1xuICAgIGxldCBwYztcbiAgICBsZXQgc2kgPSBbXTtcbiAgICBsZXQgYWN0aXZlID0gMDtcbiAgICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbiAgICBjb25zdCBjaSA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpOyB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBzaVtpZHhdID0gc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBzaSwgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9LFxuICAgICAgICByZXR1cm4odikge1xuICAgICAgICAgICAgcGMuZm9yRWFjaCgocCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lbaWR4XS5yZXR1cm4/Lih2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIHBjLmZvckVhY2goKHAsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpW2lkeF0udGhyb3c/LihleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufTtcbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZShpKSB7XG4gICAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICAgICAmJiBPYmplY3Qua2V5cyhhc3luY0V4dHJhcylcbiAgICAgICAgICAgIC5ldmVyeShrID0+IChrIGluIGkpICYmIGlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVycyhhaSkge1xuICAgIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhaSwgT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGFzeW5jRXh0cmFzKSkubWFwKChbaywgdl0pID0+IFtrLCB7IC4uLnYsIGVudW1lcmFibGU6IGZhbHNlIH1dKSkpO1xuICAgICAgICAvL09iamVjdC5hc3NpZ24oYWksIGFzeW5jRXh0cmFzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnMoZykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpO1xuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBjb25zdW1lKGYpIHtcbiAgICBsZXQgbGFzdCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcylcbiAgICAgICAgbGFzdCA9IGY/Lih1KTtcbiAgICBhd2FpdCBsYXN0O1xufVxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwKHNvdXJjZSwgZm4sIGluaXRpYWxWYWx1ZSA9IElnbm9yZSkge1xuICAgIGxldCBhaTtcbiAgICBsZXQgcHJldiA9IElnbm9yZTtcbiAgICBjb25zdCBmYWkgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoaW5pdGlhbFZhbHVlKS50aGVuKHZhbHVlID0+ICh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbml0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICAgICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKHAgPT4gcC5kb25lXG4gICAgICAgICAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZShmbihwLnZhbHVlLCBwcmV2KSkudGhlbihmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBzdGVwKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksIGV4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pOyAvLyBUZXJtaW5hdGUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgICAgICAgIH0pLCBleCA9PiBcbiAgICAgICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpO1xuICAgICAgICB9LFxuICAgICAgICByZXR1cm4odikge1xuICAgICAgICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZmFpKTtcbn1cbmZ1bmN0aW9uIG1hcChtYXBwZXIpIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG1hcHBlcik7XG59XG5mdW5jdGlvbiBmaWx0ZXIoZm4pIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvKSA9PiAoYXdhaXQgZm4obykgPyBvIDogSWdub3JlKSk7XG59XG5mdW5jdGlvbiB1bmlxdWUoZm4pIHtcbiAgICByZXR1cm4gZm5cbiAgICAgICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICAgICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cbmZ1bmN0aW9uIGluaXRpYWxseShpbml0VmFsdWUpIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cbmZ1bmN0aW9uIHdhaXRGb3IoY2IpIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IGNiKCgpID0+IHJlc29sdmUobykpOyByZXR1cm4gbzsgfSkpO1xufVxuZnVuY3Rpb24gbXVsdGkoKSB7XG4gICAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgICBsZXQgY29uc3VtZXJzID0gMDtcbiAgICBsZXQgY3VycmVudDtcbiAgICBsZXQgYWkgPSB1bmRlZmluZWQ7XG4gICAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gICAgZnVuY3Rpb24gc3RlcChpdCkge1xuICAgICAgICBpZiAoaXQpXG4gICAgICAgICAgICBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgICAgICBpZiAoIWl0Py5kb25lKSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gZGVmZXJyZWQoKTtcbiAgICAgICAgICAgIGFpLm5leHQoKVxuICAgICAgICAgICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBtYWkgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgICAgICAgIHJldHVybiBtYWk7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoIWFpKSB7XG4gICAgICAgICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybih2KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICAgICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICAgICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuZnVuY3Rpb24gYnJvYWRjYXN0KCkge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBjb25zdCBiID0gYnJvYWRjYXN0SXRlcmF0b3IoKCkgPT4gYWkucmV0dXJuPy4oKSk7XG4gICAgKGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIGFpLm5leHQoKS50aGVuKHYgPT4ge1xuICAgICAgICAgICAgaWYgKHYuZG9uZSkge1xuICAgICAgICAgICAgICAgIC8vIE1laCAtIHdlIHRocm93IHRoZXNlIGF3YXkgZm9yIG5vdy5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi5icm9hZGNhc3QgZG9uZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGIucHVzaCh2LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IGIuY2xvc2UoZXgpKTtcbiAgICB9KSgpO1xuICAgIGNvbnN0IGJhaSA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIHJldHVybiBiW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGJhaSk7XG59XG4iLCIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXIoZXYpIHtcbiAgICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSk7XG4gICAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBuIHx8IG4uY29udGFpbnMoZXYudGFyZ2V0KSkgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2goZXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Iocykge1xuICAgIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICAgICAgICByZXR1cm4gW3BhcnRzWzBdLCBcImNoYW5nZVwiXTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXV07XG4gICAgfVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmZ1bmN0aW9uIHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpIHtcbiAgICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiICsgd2hhdCk7XG4gICAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcbiAgICBjb25zdCBkZXRhaWxzIC8qRXZlbnRPYnNlcnZhdGlvbjxFeGNsdWRlPEV4dHJhY3RFdmVudE5hbWVzPEV2ZW50TmFtZT4sIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzPj4qLyA9IHtcbiAgICAgICAgcHVzaDogcXVldWUucHVzaCxcbiAgICAgICAgdGVybWluYXRlKGV4KSB7IHF1ZXVlLnJldHVybj8uKGV4KTsgfSxcbiAgICAgICAgY29udGFpbmVyLFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICAgIH07XG4gICAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAgICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKS5hZGQoZGV0YWlscykpO1xuICAgIHJldHVybiBxdWV1ZS5tdWx0aSgpO1xufVxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW4oKSB7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbiAgICB5aWVsZCB1bmRlZmluZWQ7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmMoc3JjKSB7XG4gICAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdCkge1xuICAgIGlmICghd2hhdClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gICAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5hc3luYyBmdW5jdGlvbiogb25jZShwKSB7XG4gICAgeWllbGQgcDtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuKGNvbnRhaW5lciwgLi4uc291cmNlcykge1xuICAgIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSk7XG4gICAgfVxuICAgIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICAgICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgICAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICAgICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICAgICAgICAgIDogd2hhdCk7XG4gICAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0ge1xuICAgICAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgICAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuICAgICAgICBmdW5jdGlvbiBpc01pc3Npbmcoc2VsKSB7XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuICAgICAgICBjb25zdCBhaSA9IHtcbiAgICAgICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaTsgfSxcbiAgICAgICAgICAgIGFzeW5jIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW4oKSk7XG4gICAgICAgICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWZlciBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3JcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGFpLnJldHVybiA9IGV2ZW50cy5yZXR1cm4/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgYWkudGhyb3cgPSBldmVudHMudGhyb3c/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhhaSkpO1xuICAgIH1cbiAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdCkge1xuICAgIGlmIChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsdCkpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSkge1xuICAgICAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xufVxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9ycykge1xuICAgIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgICAgICBdKTtcbiAgICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSB7XG4gICAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICAgIH1cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcbiAgICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICAgIGlmIChERUJVRykge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBcIk1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyIDUgc2Vjb25kczpcIik7XG4gICAgICAgIGNvbnN0IHdhcm4gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FybikpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhYmxlLCBpc0FzeW5jSXRlcmF0b3IsIGl0ZXJhYmxlSGVscGVycyB9IGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmltcG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgVW5pcXVlSUQgfSBmcm9tICcuL3RhZ3MuanMnO1xuaW1wb3J0IHsgREVCVUcsIGxvZyB9IGZyb20gJy4vZGVidWcuanMnO1xuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gICAgXCJjYW52YXNcIiwgXCJjYXB0aW9uXCIsIFwiY2l0ZVwiLCBcImNvZGVcIiwgXCJjb2xcIiwgXCJjb2xncm91cFwiLCBcImRhdGFcIiwgXCJkYXRhbGlzdFwiLCBcImRkXCIsIFwiZGVsXCIsIFwiZGV0YWlsc1wiLCBcImRmblwiLCBcImRpYWxvZ1wiLCBcImRpdlwiLFxuICAgIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICAgIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gICAgXCJtYXJrXCIsIFwibWVudVwiLCBcIm1ldGFcIiwgXCJtZXRlclwiLCBcIm5hdlwiLCBcIm5vc2NyaXB0XCIsIFwib2JqZWN0XCIsIFwib2xcIiwgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsXG4gICAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gICAgXCJ0aXRsZVwiLCBcInRyXCIsIFwidHJhY2tcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJcIiwgXCJ2aWRlb1wiLCBcIndiclwiXG5dO1xuY29uc3QgZWxlbWVudFByb3R5cGUgPSB7XG4gICAgZ2V0IGlkcygpIHtcbiAgICAgICAgcmV0dXJuIGdldEVsZW1lbnRJZE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIHNldCBpZHModikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgaWRzIG9uICcgKyB0aGlzLnZhbHVlT2YoKSk7XG4gICAgfSxcbiAgICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KTtcbiAgICB9XG59O1xuY29uc3QgcG9TdHlsZUVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbnBvU3R5bGVFbHQuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuZnVuY3Rpb24gaXNDaGlsZFRhZyh4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcidcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgICAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICAgICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgICAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgICAgIHx8IHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG4vKiB0YWcgKi9cbmNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgY29uc3QgdGFnID0gZnVuY3Rpb24gKF8xLCBfMiwgXzMpIHtcbiAgICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgICB0YWcocHJvdG90eXBlcykgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICAgIHRhZyh0YWdzW10sIHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIHByb3RvdHlwZXMpICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICAgKi9cbiAgICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBwcm90b3R5cGVzXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgICAgICA/IFtfMSwgXzIsIF8zXVxuICAgICAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICAgICAgICA/IFtudWxsLCBfMSwgXzJdXG4gICAgICAgICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xXTtcbiAgICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgICBhcmUgbm90IGV2YWx1YXRlZCB1bnRpbCBjYWxsZWQgKi9cbiAgICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShudWxsLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhlbGVtZW50UHJvdHlwZSkpO1xuICAgIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gICAgLy8gdG8gY29weSBhIGdldHRlci9zZXR0ZXIgcGFpciBmcm9tIGFub3RoZXIgb2JqZWN0XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQoYSkge1xuICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGEpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGVwID0gKCkgPT4gYWkubmV4dCgpLnRoZW4oKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpOyB9LCBleCA9PiBjb25zb2xlLndhcm4oXCIoQUktVUkpXCIsIGV4KSk7XG4gICAgICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHByb3RvdHlwZXMpXG4gICAgICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgcHJvdG90eXBlcyk7XG4gICAgZnVuY3Rpb24gbm9kZXMoLi4uYykge1xuICAgICAgICBjb25zdCBhcHBlbmRlZCA9IFtdO1xuICAgICAgICAoZnVuY3Rpb24gY2hpbGRyZW4oYykge1xuICAgICAgICAgICAgaWYgKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICAgICAgICAgIGxldCBnID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChnWzBdKTtcbiAgICAgICAgICAgICAgICBjLnRoZW4ociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBub2RlcyhyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkID0gZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFswXS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihvbGRbMF0ucGFyZW50RWxlbWVudCwgb2xkWzBdKShuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZC5mb3JFYWNoKGUgPT4gZS5wYXJlbnRFbGVtZW50Py5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZyA9IG47XG4gICAgICAgICAgICAgICAgfSwgKHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgeCk7XG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGdbMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiB4IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihjKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhYmxlKGMpID8gY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGM7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgICAgICAgICBjb25zdCB1bmJveGVkID0gYy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCk7XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaCguLi5kcG0pO1xuICAgICAgICAgICAgICAgIGxldCB0ID0gZHBtO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHQuZmlsdGVyKG4gPT4gQm9vbGVhbihuPy5wYXJlbnROb2RlKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdCA9IGFwcGVuZGVyKG5bMF0ucGFyZW50Tm9kZSwgblswXSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCB0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHQuZmlsdGVyKGUgPT4gZT8ucGFyZW50Tm9kZSAmJiBlLm93bmVyRG9jdW1lbnQ/LmJvZHkuY29udGFpbnMoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudChzKSBubyBsb25nZXIgZXhpc3QgaW4gZG9jdW1lbnRcIiArIGluc2VydGlvblN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdCA9IGFwcGVuZGVyKG5bMF0ucGFyZW50Tm9kZSwgblswXSkodW5ib3goZXMudmFsdWUpID8/IERvbVByb21pc2VDb250YWluZXIoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nLiBUZXJtaW5hdGUgdGhlIGl0ZXJhdG9yIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBjPy5bU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZCBvZiBjKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbihkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgICAgICB9KShjKTtcbiAgICAgICAgcmV0dXJuIGFwcGVuZGVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcHBlbmRlcihjb250YWluZXIsIGJlZm9yZSkge1xuICAgICAgICBpZiAoYmVmb3JlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBiZWZvcmUgPSBudWxsO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZXMoYyk7XG4gICAgICAgICAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgLy8gXCJiZWZvcmVcIiwgYmVpbmcgYSBub2RlLCBjb3VsZCBiZSAjdGV4dCBub2RlXG4gICAgICAgICAgICAgICAgaWYgKGJlZm9yZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYmVmb3JlLmNhbGwoYmVmb3JlLCAuLi5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSdyZSBhIHRleHQgbm9kZSAtIHdvcmsgYmFja3dhcmRzIGFuZCBpbnNlcnQgKmFmdGVyKiB0aGUgcHJlY2VlZGluZyBFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGJlZm9yZS5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50ICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiSW50ZXJuYWwgZXJyb3IgLSBjb250YWluZXIgbWlzbWF0Y2hcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGRyZW5baV0sIGJlZm9yZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYXBwZW5kLmNhbGwoY29udGFpbmVyLCAuLi5jaGlsZHJlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICghbmFtZVNwYWNlKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGFnLCB7XG4gICAgICAgICAgICBhcHBlbmRlciwgLy8gTGVnYWN5IFJUQSBzdXBwb3J0XG4gICAgICAgICAgICBub2RlcywgLy8gUHJlZmVycmVkIGludGVyZmFjZSBpbnN0ZWFkIG9mIGBhcHBlbmRlcmBcbiAgICAgICAgICAgIFVuaXF1ZUlELFxuICAgICAgICAgICAgYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9yc1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICAgIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZCwgcykge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSBwcm9wZXJ0eSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVuYm94KGEpIHtcbiAgICAgICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2Lm1hcCh1bmJveCkgOiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlLCBwcm9wcykge1xuICAgICAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgICAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gYXNzaWduKGQsIHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gbG9nKFwiRmFpbGVkIHRvIHNldCBhdHRyaWJ1dGVcIiwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmFzZS5vd25lckRvY3VtZW50LmNvbnRhaW5zKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jLiBUZWxsIHRoZSBzb3VyY2UgYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHN0b3Agc2VuZGluZyB1cyBzdHVmZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihcIkVsZW1lbnQgbm8gbG9uZ2VyIGV4aXN0cyBpbiBkb2N1bWVudCAodXBkYXRlIFwiICsgay50b1N0cmluZygpICsgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGJhc2UpKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZSwgaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2coXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICA7XG4gICAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UoZSkge1xuICAgICAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgICAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kZWQoX292ZXJyaWRlcykge1xuICAgICAgICBjb25zdCBpbnN0YW5jZURlZmluaXRpb24gPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICA/IChpbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICAgICAgICA6IF9vdmVycmlkZXM7XG4gICAgICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICAgICAgbGV0IHN0YXRpY0V4dGVuc2lvbnMgPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICAgICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICAgICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgICAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgICAgICBjb25zdCBleHRlbmRUYWdGbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NhbGxTdGFjayA9IFtdO1xuICAgICAgICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH07XG4gICAgICAgICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgICAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgICAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLnByb3RvdHlwZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUpO1xuICAgICAgICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKGBJZ25vcmluZyBhdHRlbXB0IHRvIHJlLWRlZmluZSBpdGVyYWJsZSBwcm9wZXJ0eSBcIiR7a31cIiBhcyBpdCBjb3VsZCBhbHJlYWR5IGhhdmUgY29uc3VtZXJzYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlW2tdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXSA9PT0gbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGJhc2U/LmNvbnN0cnVjdGVkPy5jYWxsKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAgICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGVcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuaXRlcmFibGUgJiYgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmXG4gICAgICAgICAgICAgICAgICAgIC8vIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgICAgIGsgPT4gZVtrXSA9IGVba10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBleHRlbmRUYWcgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICAgICAgICBzdXBlcjogdGhpcyxcbiAgICAgICAgICAgIGRlZmluaXRpb246IE9iamVjdC5hc3NpZ24oc3RhdGljRXh0ZW5zaW9ucywgeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KSxcbiAgICAgICAgICAgIGV4dGVuZGVkLFxuICAgICAgICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcikge1xuICAgICAgICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICAgICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5kZWZpbml0aW9uO1xuICAgICAgICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5wcm90b3R5cGUpO1xuICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ub3ZlcnJpZGUpO1xuICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKHRoaXMpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5wcm90b3R5cGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHRlbmRUYWcsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGZ1bGxQcm90bykpO1xuICAgICAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgICAgICBjb25zdCBjcmVhdG9yTmFtZSA9IGZ1bGxQcm90b1xuICAgICAgICAgICAgJiYgJ2NsYXNzTmFtZScgaW4gZnVsbFByb3RvXG4gICAgICAgICAgICAmJiB0eXBlb2YgZnVsbFByb3RvLmNsYXNzTmFtZSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gZnVsbFByb3RvLmNsYXNzTmFtZVxuICAgICAgICAgICAgOiB1bmlxdWVUYWdJRDtcbiAgICAgICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/IChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdID8/ICcnKSA6ICcnO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCAnLScpICsgY2FsbFNpdGUgKyBcIj5cIlxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgICB9XG4gICAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzID0ge307XG4gICAgZnVuY3Rpb24gY3JlYXRlVGFnKGspIHtcbiAgICAgICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG4gICAgICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQ7XG4gICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgICAgICAgICBhdHRycyA9IHsgcHJvdG90eXBlOiB7fSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICAgICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gbmFtZVNwYWNlXG4gICAgICAgICAgICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgYXBwZW5kZXIoZSkoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmNsdWRpbmdFeHRlbmRlciA9IE9iamVjdC5hc3NpZ24odGFnQ3JlYXRvciwge1xuICAgICAgICAgICAgc3VwZXI6ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpOyB9LFxuICAgICAgICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICAgICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmA7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgICAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICAgIH1cbiAgICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn07XG5jb25zdCB7IFwiYWktdWktY29udGFpbmVyXCI6IEFzeW5jRE9NQ29udGFpbmVyIH0gPSB0YWcoJycsIFtcImFpLXVpLWNvbnRhaW5lclwiXSk7XG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIucHJvbWlzZSB7XG4gICAgZGlzcGxheTogJHtERUJVRyA/ICdpbmxpbmUnIDogJ25vbmUnfTtcbiAgICBjb2xvcjogIzg4ODtcbiAgICBmb250LXNpemU6IDAuNzVlbTtcbiAgfVxuICBhaS11aS1jb250YWluZXIucHJvbWlzZTphZnRlciB7XG4gICAgY29udGVudDogXCLii69cIjtcbiAgfWAsXG4gICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgY2xhc3NOYW1lOiAncHJvbWlzZSdcbiAgICB9LFxuICAgIGNvbnN0cnVjdGVkKCkge1xuICAgICAgICByZXR1cm4gQXN5bmNET01Db250YWluZXIoeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSB9LCBERUJVR1xuICAgICAgICAgICAgPyBuZXcgRXJyb3IoXCJDb25zdHJ1Y3RlZFwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKTtcbiAgICB9XG59KTtcbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9IEFzeW5jRE9NQ29udGFpbmVyLmV4dGVuZGVkKHtcbiAgICBzdHlsZXM6IGBcbiAgYWktdWktY29udGFpbmVyLmVycm9yIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBjb2xvcjogI2IzMztcbiAgICB3aGl0ZS1zcGFjZTogcHJlO1xuICB9YCxcbiAgICBvdmVycmlkZToge1xuICAgICAgICBjbGFzc05hbWU6ICdlcnJvcidcbiAgICB9LFxuICAgIGRlY2xhcmU6IHtcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgY29uc3RydWN0ZWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lcnJvcilcbiAgICAgICAgICAgIHJldHVybiBcIkVycm9yXCI7XG4gICAgICAgIGlmICh0aGlzLmVycm9yIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci5zdGFjaztcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gdGhpcy5lcnJvciAmJiB0aGlzLmVycm9yLnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci52YWx1ZS5zdGFjaztcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IudG9TdHJpbmcoKTtcbiAgICB9XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICAgIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gICAgd2hpbGUgKGcpIHtcbiAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgICB9XG4gICAgaWYgKCFnKSB7XG4gICAgICAgIGxvZyhcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gICAgfVxufVxuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICAgIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7IH07IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICBbLi4ucmVtb3ZlZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIiksIHJlbW92ZWRdLmZpbHRlcihlbHQgPT4gIWVsdC5vd25lckRvY3VtZW50LmNvbnRhaW5zKGVsdCkpLmZvckVhY2goZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbn07XG5jb25zdCB3YXJuZWQgPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkTWFwKG5vZGUsIGlkcykge1xuICAgIG5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuICAgIGlkcyA9IGlkcyB8fCB7fTtcbiAgICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIikuZm9yRWFjaChmdW5jdGlvbiAoZWx0KSB7XG4gICAgICAgICAgICBpZiAoZWx0LmlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZHNbZWx0LmlkXSlcbiAgICAgICAgICAgICAgICAgICAgaWRzW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKGVsdC5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm5lZC5hZGQoZWx0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnKEFJLVVJKScsIFwiU2hhZG93ZWQgbXVsdGlwbGUgZWxlbWVudCBJRHNcIiwgZWx0LmlkLCBlbHQsIGlkc1tlbHQuaWRdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpZHM7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=