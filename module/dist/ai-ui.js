var AIUI;
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
/* harmony export */   combine: () => (/* binding */ combine),
/* harmony export */   defineIterableProperty: () => (/* binding */ defineIterableProperty),
/* harmony export */   filterMap: () => (/* binding */ filterMap),
/* harmony export */   generatorHelpers: () => (/* binding */ generatorHelpers),
/* harmony export */   isAsyncIter: () => (/* binding */ isAsyncIter),
/* harmony export */   isAsyncIterable: () => (/* binding */ isAsyncIterable),
/* harmony export */   isAsyncIterator: () => (/* binding */ isAsyncIterator),
/* harmony export */   iterableHelpers: () => (/* binding */ iterableHelpers),
/* harmony export */   merge: () => (/* binding */ merge),
/* harmony export */   queueIteratableIterator: () => (/* binding */ queueIteratableIterator)
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
const asyncExtras = {
    filterMap, // Made available since it DOESM'T clash with proposed async iterator helpers
    map,
    filter,
    unique,
    waitFor,
    multi,
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
/* Define a "iterable property" on `obj`.
   This is a property that holds a boxed (within an Object() call) value, and is also an AsyncIterableIterator. which
   yields when the property is set.
   This routine creates the getter/setter for the specified property, and manages the aassociated async iterator.
*/
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
                            // We include `targetProp === undefined` so we can monitor nested properties that aren't actually defined (yet)
                            // Note: this only applies to object iterables (since the root ones aren't proxied), but it does allow us to have
                            // defintions like:
                            //   iterable: { stuff: {} as Record<string, string | number ... }
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
            return current; //.then(zalgo => zalgo);
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
                const ap = (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIterator)(c) ? c : c[Symbol.asyncIterator]();
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
    /** Just deep copy an object */
    const plainObjectPrototype = Object.getPrototypeOf({});
    /** Routine to *define* properties on a dest object from a src object **/
    function deepDefine(d, s, declaration) {
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
                                // If this is a new value in the destination, just define it to be the same value as the source
                                // If the source value is an object, and we're declaring it (therefore it should be a new one), take
                                // a copy so as to not re-use the reference and pollute the declaration. Note: this is probably
                                // a better default for any "objects" in a declaration that are plain and not some class type
                                // which can't be copied
                                if (declaration) {
                                    if (Object.getPrototypeOf(value) === plainObjectPrototype || !Object.getPrototypeOf(value)) {
                                        deepDefine(srcDesc.value = {}, value);
                                    }
                                    else {
                                        (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)(`Declared propety ${k} is not a plain object and must be assigned by reference`);
                                    }
                                }
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
            deepDefine(e, tagDefinition.declare, true);
            deepDefine(e, tagDefinition.override);
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
                // so the full hierarchy gets to consume the initial state, unless they have been assigned
                // by assignProps from a future
                for (const base of newCallStack) {
                    if (base.iterable)
                        for (const k of Object.keys(base.iterable)) {
                            // We don't self-assign iterables that have themselves been assigned with futures
                            if (!(!noAttrs && k in attrs && (!(0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(attrs[k]) || !(0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(attrs[k])))) {
                                const value = e[k];
                                if (value?.valueOf() !== undefined) {
                                    // @ts-ignore - some props of e (HTMLElement) are read-only, and we don't know if k is one of them.
                                    e[k] = value;
                                }
                            }
                        }
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
const DomPromiseContainer = (c) => {
    return document.createComment(_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG ? new Error("Constructed").stack?.replace(/^Error: /, '') || "error" : "promise");
};
const DyamicElementError = (c) => {
    return document.createComment(c?.error?.stack || c?.error?.toString() || "error");
};
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
                        (0,_debug_js__WEBPACK_IMPORTED_MODULE_4__.log)('(AI-UI)', "Shadowed multiple element IDs", elt.id, elt, ids[elt.id]);
                    }
                }
            }
        });
    }
    return ids;
}

})();

AIUI = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cmNlcyI6WyJ3ZWJwYWNrOi8vQUlVSS8uL3NyYy9kZWJ1Zy50cyIsIndlYnBhY2s6Ly9BSVVJLy4vc3JjL2RlZmVycmVkLnRzIiwid2VicGFjazovL0FJVUkvLi9zcmMvaXRlcmF0b3JzLnRzIiwid2VicGFjazovL0FJVUkvLi9zcmMvdGFncy50cyIsIndlYnBhY2s6Ly9BSVVJLy4vc3JjL3doZW4udHMiLCJ3ZWJwYWNrOi8vQUlVSS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9BSVVJL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9BSVVJL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vQUlVSS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0FJVUkvLi9zcmMvYWktdWkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gbG9nKC4uLmFyZ3MpIHtcbiAgICBpZiAoREVCVUcpXG4gICAgICAgIGNvbnNvbGUubG9nKCcoQUktVUkpJywgLi4uYXJncyk7XG59XG4iLCJpbXBvcnQgeyBERUJVRywgbG9nIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2KSA9PiB7IH07XG5leHBvcnQgZnVuY3Rpb24gZGVmZXJyZWQoKSB7XG4gICAgbGV0IHJlc29sdmUgPSBub3RoaW5nO1xuICAgIGxldCByZWplY3QgPSBub3RoaW5nO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKTtcbiAgICBwcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuICAgIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICAgIGlmIChERUJVRykge1xuICAgICAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgcHJvbWlzZS5jYXRjaChleCA9PiAoZXggaW5zdGFuY2VvZiBFcnJvciB8fCBleD8udmFsdWUgaW5zdGFuY2VvZiBFcnJvcikgPyBsb2coXCJEZWZlcnJlZFwiLCBleCwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoeCkge1xuICAgIHJldHVybiB4ICE9PSBudWxsICYmIHggIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwiaW1wb3J0IHsgREVCVUcsIGxvZyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5pbXBvcnQgeyBkZWZlcnJlZCB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCI7XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yKG8pIHtcbiAgICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlKG8pIHtcbiAgICByZXR1cm4gbyAmJiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXIobykge1xuICAgIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3Iobykge1xuICAgIGlmIChpc0FzeW5jSXRlcmFibGUobykpXG4gICAgICAgIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGlmIChpc0FzeW5jSXRlcmF0b3IobykpXG4gICAgICAgIHJldHVybiBvO1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBhcyBhc3luYyBwcm92aWRlclwiKTtcbn1cbmNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICAgIGZpbHRlck1hcCwgLy8gTWFkZSBhdmFpbGFibGUgc2luY2UgaXQgRE9FU00nVCBjbGFzaCB3aXRoIHByb3Bvc2VkIGFzeW5jIGl0ZXJhdG9yIGhlbHBlcnNcbiAgICBtYXAsXG4gICAgZmlsdGVyLFxuICAgIHVuaXF1ZSxcbiAgICB3YWl0Rm9yLFxuICAgIG11bHRpLFxuICAgIGluaXRpYWxseSxcbiAgICBjb25zdW1lLFxuICAgIG1lcmdlKC4uLm0pIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICAgIH0sXG4gICAgY29tYmluZShvdGhlcnMpIHtcbiAgICAgICAgcmV0dXJuIGNvbWJpbmUoT2JqZWN0LmFzc2lnbih7ICdfdGhpcyc6IHRoaXMgfSwgb3RoZXJzKSk7XG4gICAgfVxufTtcbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcihzdG9wID0gKCkgPT4geyB9KSB7XG4gICAgbGV0IF9wZW5kaW5nID0gW107XG4gICAgbGV0IF9pdGVtcyA9IFtdO1xuICAgIGNvbnN0IHEgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gcTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGlmIChfaXRlbXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IF9pdGVtcy5zaGlmdCgpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZCgpO1xuICAgICAgICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgICAgICAgLy8gYW5kIHEgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICAgICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgICAgICAgX3BlbmRpbmcucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybigpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICBpZiAoX3BlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKF9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgX3BlbmRpbmcuc2hpZnQoKS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coLi4uYXJncykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICAgICAgICBpZiAoX3BlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKF9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgX3BlbmRpbmcuc2hpZnQoKS5yZWplY3QodmFsdWUpO1xuICAgICAgICAgICAgICAgIF9pdGVtcyA9IF9wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghX3BlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcInF1ZXVlSXRlcmF0b3IgaGFzIHN0b3BwZWRcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF9wZW5kaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghX2l0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuZXhwb3J0IGNvbnN0IEl0ZXJhYmlsaXR5ID0gU3ltYm9sKFwiSXRlcmFiaWxpdHlcIik7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShvYmosIG5hbWUsIHYpIHtcbiAgICAvLyBNYWtlIGBhYCBhbiBBc3luY0V4dHJhSXRlcmFibGUuIFdlIGRvbid0IGRvIHRoaXMgdW50aWwgYSBjb25zdW1lciBhY3R1YWxseSB0cmllcyB0b1xuICAgIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAgIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICAgIGxldCBpbml0SXRlcmF0b3IgPSAoKSA9PiB7XG4gICAgICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgICAgIGNvbnN0IGJpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKTtcbiAgICAgICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgICAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgICAgIE9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKS5mb3JFYWNoKGsgPT4gZXh0cmFzW2tdID0ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgdmFsdWU6IGJba10sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYSwgZXh0cmFzKTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgfTtcbiAgICAvLyBDcmVhdGUgc3R1YnMgdGhhdCBsYXppbHkgY3JlYXRlIHRoZSBBc3luY0V4dHJhSXRlcmFibGUgaW50ZXJmYWNlIHdoZW4gaW52b2tlZFxuICAgIGZ1bmN0aW9uIGxhenlBc3luY01ldGhvZChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgIHJldHVybiBhW21ldGhvZF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZXh0cmFzID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgICAgICB9XG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhhc3luY0V4dHJhcykuZm9yRWFjaCgoaykgPT4gZXh0cmFzW2tdID0ge1xuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH0pO1xuICAgIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICAgIGxldCBwdXNoID0gKHYpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICAgICAgcmV0dXJuIHB1c2godik7XG4gICAgfTtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdikge1xuICAgICAgICBleHRyYXNbSXRlcmFiaWxpdHldID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2LCBJdGVyYWJpbGl0eSk7XG4gICAgfVxuICAgIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgbGV0IHBpcGVkID0gZmFsc2U7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiBhOyB9LFxuICAgICAgICBzZXQodikge1xuICAgICAgICAgICAgaWYgKHYgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBpZiAocGlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgY29uc3VtaW5nIGFub3RoZXIgaXRlcmF0b3JgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIG1ha2UgdGhpcyBsYXp5IHJlYWxseSAtIGRpZmZpY3VsdCBzaW5jZSB3ZSBkb24ndFxuICAgICAgICAgICAgICAgICAgICAvLyBrbm93IGlmIGFueW9uZSBoYXMgYWxyZWFkeSBzdGFydGVkIGNvbnN1bWluZyBpdC4gU2luY2UgYXNzaWduaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhIGJhZCBpZGVhXG4gICAgICAgICAgICAgICAgICAgIC8vIChzaW5jZSB3aGF0IGRvIHdlIGRvOiBtZXJnZT8gdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD8pLFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgb25seSB0byBhbGxvdyBPTkUgbGF6eVxuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ25tZW50IGlmIGFuZCBvbmx5IGlmIHRoaXMgaXRlcmFibGUgcHJvcGVydHkgaGFzIG5vdCBiZWVuICdnZXQnIHlldC5cbiAgICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgdGhpcyB3b3VsZCBhdCBwcmVzZW50IHBvc3NpYmx5IGJyZWFrIHRoZSBpbml0aWFsaXNhdGlvbiBvZiBpdGVyYWJsZVxuICAgICAgICAgICAgICAgICAgICAvLyBwcm9wZXJ0aWVzIGFzIHRoZSBhcmUgaW5pdGlhbGl6ZWQgYnkgYXV0by1hc3NpZ25tZW50LCBpZiBpdCB3ZXJlIGluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIHBpcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdW1lLmNhbGwodiwgdiA9PiB7IHB1c2godj8udmFsdWVPZigpKTsgfSkuZmluYWxseSgoKSA9PiBwaXBlZCA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHY/LnZhbHVlT2YoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICAgIGZ1bmN0aW9uIGJveChhLCBwZHMpIHtcbiAgICAgICAgbGV0IGJveGVkT2JqZWN0ID0gSWdub3JlO1xuICAgICAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGE7IH0sIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYTsgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAvKiBUT0RPOiBUaGlzIGlzIHByb2JsZW1hdGljIGFzIHRoZSBvYmplY3QgbWlnaHQgaGF2ZSBjbGFzaGluZyBrZXlzIGFuZCBuZXN0ZWQgbWVtYmVycy5cbiAgICAgICAgICAgICAgICAgIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICAgICAgICAgKiBTcHJlYWRzIGl0ZXJhYmxlIG9iamVjdHMgaW4gdG8gYSBzaGFsbG93IGNvcHkgb2YgdGhlIG9yaWdpbmFsIG9iamVjdCwgYW5kIG92ZXJyaXRlcyBjbGFzaGluZyBtZW1iZXJzIGxpa2UgYG1hcGBcbiAgICAgICAgICAgICAgICAgICogICAgIHRoaXMuaXRlcmFibGVPYmoubWFwKG8gPT4gby5maWVsZCk7XG4gICAgICAgICAgICAgICAgICAqIFRoZSBpdGVyYXRvciB3aWxsIHlpZWxkIG9uXG4gICAgICAgICAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqID0gbmV3VmFsdWU7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgKiBNZW1iZXJzIGFjY2VzcyBpcyBwcm94aWVkLCBzbyB0aGF0OlxuICAgICAgICAgICAgICAgICAgKiAgICAgKHNldCkgdGhpcy5pdGVyYWJsZU9iai5maWVsZCA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIHVuZGVybHlpbmcgb2JqZWN0IHRvIHlpZWxkIGJ5IHJlLWFzc2lnbm1lbnQgKHRoZXJlZm9yZSBjYWxsaW5nIHRoZSBzZXR0ZXIpXG4gICAgICAgICAgICAgICAgICAqIFNpbWlsYXJseTpcbiAgICAgICAgICAgICAgICAgICogICAgIChnZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGRcbiAgICAgICAgICAgICAgICAgICogLi4uY2F1c2VzIHRoZSBpdGVyYXRvciBmb3IgdGhlIGJhc2Ugb2JqZWN0IHRvIGJlIG1hcHBlZCwgbGlrZVxuICAgICAgICAgICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iamVjdC5tYXAobyA9PiBvW2ZpZWxkXSlcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICghKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBJZ25vcmUgaXMgdGhlIElOSVRJQUwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJveGVkT2JqZWN0ID09PSBJZ25vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJyhBSS1VSSknLCBgVGhlIGl0ZXJhYmxlIHByb3BlcnR5ICcke25hbWUudG9TdHJpbmcoKX0nIG9mIHR5cGUgXCJvYmplY3RcIiB3aWxsIGJlIHNwcmVhZCB0byBwcmV2ZW50IHJlLWluaXRpYWxpc2F0aW9uLlxcbiR7bmV3IEVycm9yKCkuc3RhY2s/LnNsaWNlKDYpfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhbLi4uYV0sIHBkcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh7IC4uLmEgfSwgcGRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYm94ZWRPYmplY3QsIGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChib3hlZE9iamVjdFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEJST0tFTjogZmFpbHMgbmVzdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShib3hlZE9iamVjdCwgJ3ZhbHVlT2YnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBib3hlZE9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJveGVkT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgcHJveHkgdGhlIHJlc3VsdCBzbyB3ZSBjYW4gdHJhY2sgbWVtYmVycyBvZiB0aGUgaXRlcmFibGUgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJveHkoYm94ZWRPYmplY3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCBmaXJlcyB0aGUgaXRlcmF0b3IgYnkgcmUtYXNzaWduaW5nIHRoZSBpdGVyYWJsZSB2aWEgaXQncyBzZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChvYmpbbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCByZXR1cm5zIGEgbWFwcGVkIGl0ZXJhdG9yIGZvciB0aGUgc3BlY2lmaWVkIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gYm94ZWRPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBpbmNsdWRlIGB0YXJnZXRQcm9wID09PSB1bmRlZmluZWRgIHNvIHdlIGNhbiBtb25pdG9yIG5lc3RlZCBwcm9wZXJ0aWVzIHRoYXQgYXJlbid0IGFjdHVhbGx5IGRlZmluZWQgKHlldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiB0aGlzIG9ubHkgYXBwbGllcyB0byBvYmplY3QgaXRlcmFibGVzIChzaW5jZSB0aGUgcm9vdCBvbmVzIGFyZW4ndCBwcm94aWVkKSwgYnV0IGl0IGRvZXMgYWxsb3cgdXMgdG8gaGF2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlZmludGlvbnMgbGlrZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGl0ZXJhYmxlOiB7IHN0dWZmOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgLi4uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFByb3AuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFsVmFsdWUgPSBSZWZsZWN0LmdldChib3hlZE9iamVjdCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYm94ZWRPYmplY3QubWFwKChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvdiA9IG8/LltrZXldPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwdiA9IHA/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3YgPT09IHR5cGVvZiBwdiAmJiBvdiA9PSBwdilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWdub3JlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG92OyAvL28/LltrZXkgYXMga2V5b2YgdHlwZW9mIG9dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmbGVjdC5vd25LZXlzKHByb3BzKS5mb3JFYWNoKGsgPT4gcHJvcHNba10uZW51bWVyYWJsZSA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm94KHJlYWxWYWx1ZSwgcHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE9iamVjdChhKSwge1xuICAgICAgICAgICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEudmFsdWVPZigpOyB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBtZXJnZSA9ICguLi5haSkgPT4ge1xuICAgIGNvbnN0IGl0ID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICAgICAgaW5pdCA9ICgpID0+IHsgfTtcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgY29uc3QgYSA9IGFpW25dO1xuICAgICAgICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgICAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgICAgICAgICAgOiBhKVxuICAgICAgICAgICAgICAgIC5uZXh0KClcbiAgICAgICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gKHsgaWR4OiBuLCByZXN1bHQgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlKCgpID0+IHsgfSk7XG4gICAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuICAgIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZDsgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICAgICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzKS50aGVuKCh7IGlkeCwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBpdFtpZHhdLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0gfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAgICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpO1xufTtcbmV4cG9ydCBjb25zdCBjb21iaW5lID0gKHNyYywgb3B0cyA9IHt9KSA9PiB7XG4gICAgY29uc3QgYWNjdW11bGF0ZWQgPSB7fTtcbiAgICBsZXQgcGM7XG4gICAgbGV0IHNpID0gW107XG4gICAgbGV0IGFjdGl2ZSA9IDA7XG4gICAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlKCgpID0+IHsgfSk7XG4gICAgY29uc3QgY2kgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaTsgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGMgPSBPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssIHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgc2lbaWR4XSA9IHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwY1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwY1tpZHhdID0gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIHBjLmZvckVhY2goKHAsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICBwYy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBzaVtpZHhdLnRocm93Py4oZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn07XG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGUoaSkge1xuICAgIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAgICAgJiYgT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXG4gICAgICAgICAgICAuZXZlcnkoayA9PiAoayBpbiBpKSAmJiBpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnMoYWkpIHtcbiAgICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYWksIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhhc3luY0V4dHJhcykpLm1hcCgoW2ssIHZdKSA9PiBbaywgeyAuLi52LCBlbnVtZXJhYmxlOiBmYWxzZSB9XSkpKTtcbiAgICAgICAgLy9PYmplY3QuYXNzaWduKGFpLCBhc3luY0V4dHJhcyk7XG4gICAgfVxuICAgIHJldHVybiBhaTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzKGcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFpKTtcbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZShmKSB7XG4gICAgbGV0IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMpXG4gICAgICAgIGxhc3QgPSBmPy4odSk7XG4gICAgYXdhaXQgbGFzdDtcbn1cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcChzb3VyY2UsIGZuLCBpbml0aWFsVmFsdWUgPSBJZ25vcmUpIHtcbiAgICBsZXQgYWk7XG4gICAgbGV0IHByZXYgPSBJZ25vcmU7XG4gICAgY29uc3QgZmFpID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhaTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKGluaXRpYWxWYWx1ZSkudGhlbih2YWx1ZSA9PiAoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGlmICghYWkpXG4gICAgICAgICAgICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihwID0+IHAuZG9uZVxuICAgICAgICAgICAgICAgICAgICA/IHJlc29sdmUocClcbiAgICAgICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoZm4ocC52YWx1ZSwgcHJldikpLnRoZW4oZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLCBleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICAgICAgICB9KSwgZXggPT4gXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSkpLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvdyhleCkge1xuICAgICAgICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSk7XG59XG5mdW5jdGlvbiBtYXAobWFwcGVyKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuZnVuY3Rpb24gZmlsdGVyKGZuKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyAobykgPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuZnVuY3Rpb24gdW5pcXVlKGZuKSB7XG4gICAgcmV0dXJuIGZuXG4gICAgICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5mdW5jdGlvbiBpbml0aWFsbHkoaW5pdFZhbHVlKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5mdW5jdGlvbiB3YWl0Rm9yKGNiKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG87IH0pKTtcbn1cbmZ1bmN0aW9uIG11bHRpKCkge1xuICAgIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gICAgbGV0IGNvbnN1bWVycyA9IDA7XG4gICAgbGV0IGN1cnJlbnQ7XG4gICAgbGV0IGFpID0gdW5kZWZpbmVkO1xuICAgIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICAgIGZ1bmN0aW9uIHN0ZXAoaXQpIHtcbiAgICAgICAgaWYgKGl0KVxuICAgICAgICAgICAgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICAgICAgaWYgKCFpdD8uZG9uZSkge1xuICAgICAgICAgICAgY3VycmVudCA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICBhaS5uZXh0KClcbiAgICAgICAgICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbWFpID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gbWFpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaWYgKCFhaSkge1xuICAgICAgICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50OyAvLy50aGVuKHphbGdvID0+IHphbGdvKTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgICAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG4iLCIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXIoZXYpIHtcbiAgICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSk7XG4gICAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBuIHx8IG4uY29udGFpbnMoZXYudGFyZ2V0KSkgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2goZXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Iocykge1xuICAgIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICAgICAgICByZXR1cm4gW3BhcnRzWzBdLCBcImNoYW5nZVwiXTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXV07XG4gICAgfVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmZ1bmN0aW9uIHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpIHtcbiAgICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiICsgd2hhdCk7XG4gICAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcbiAgICBjb25zdCBkZXRhaWxzIC8qRXZlbnRPYnNlcnZhdGlvbjxFeGNsdWRlPEV4dHJhY3RFdmVudE5hbWVzPEV2ZW50TmFtZT4sIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzPj4qLyA9IHtcbiAgICAgICAgcHVzaDogcXVldWUucHVzaCxcbiAgICAgICAgdGVybWluYXRlKGV4KSB7IHF1ZXVlLnJldHVybj8uKGV4KTsgfSxcbiAgICAgICAgY29udGFpbmVyLFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICAgIH07XG4gICAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAgICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKS5hZGQoZGV0YWlscykpO1xuICAgIHJldHVybiBxdWV1ZS5tdWx0aSgpO1xufVxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW4oKSB7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbiAgICB5aWVsZCB1bmRlZmluZWQ7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmMoc3JjKSB7XG4gICAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdCkge1xuICAgIGlmICghd2hhdClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gICAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5hc3luYyBmdW5jdGlvbiogb25jZShwKSB7XG4gICAgeWllbGQgcDtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuKGNvbnRhaW5lciwgLi4uc291cmNlcykge1xuICAgIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSk7XG4gICAgfVxuICAgIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICAgICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgICAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICAgICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICAgICAgICAgIDogd2hhdCk7XG4gICAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0ge1xuICAgICAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgICAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuICAgICAgICBmdW5jdGlvbiBpc01pc3Npbmcoc2VsKSB7XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuICAgICAgICBjb25zdCBhaSA9IHtcbiAgICAgICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaTsgfSxcbiAgICAgICAgICAgIGFzeW5jIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW4oKSk7XG4gICAgICAgICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWZlciBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3JcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGFpLnJldHVybiA9IGV2ZW50cy5yZXR1cm4/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgYWkudGhyb3cgPSBldmVudHMudGhyb3c/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhhaSkpO1xuICAgIH1cbiAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdCkge1xuICAgIGlmIChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsdCkpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSkge1xuICAgICAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xufVxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9ycykge1xuICAgIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgICAgICBdKTtcbiAgICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSB7XG4gICAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICAgIH1cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcbiAgICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICAgIGlmIChERUJVRykge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBcIk1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyIDUgc2Vjb25kczpcIik7XG4gICAgICAgIGNvbnN0IHdhcm4gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FybikpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yLCBpdGVyYWJsZUhlbHBlcnMgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmltcG9ydCB7IFVuaXF1ZUlEIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IERFQlVHLCBsb2cgfSBmcm9tICcuL2RlYnVnLmpzJztcbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmxldCBpZENvdW50ID0gMDtcbmNvbnN0IHN0YW5kYW5kVGFncyA9IFtcbiAgICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICAgIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgICBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImVtYmVkXCIsIFwiZmllbGRzZXRcIiwgXCJmaWdjYXB0aW9uXCIsIFwiZmlndXJlXCIsIFwiZm9vdGVyXCIsIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIixcbiAgICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICAgIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICAgIFwicHJvZ3Jlc3NcIiwgXCJxXCIsIFwicnBcIiwgXCJydFwiLCBcInJ1YnlcIiwgXCJzXCIsIFwic2FtcFwiLCBcInNjcmlwdFwiLCBcInNlYXJjaFwiLCBcInNlY3Rpb25cIiwgXCJzZWxlY3RcIiwgXCJzbG90XCIsIFwic21hbGxcIiwgXCJzb3VyY2VcIiwgXCJzcGFuXCIsXG4gICAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICAgIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXTtcbmNvbnN0IGVsZW1lbnRQcm90eXBlID0ge1xuICAgIGdldCBpZHMoKSB7XG4gICAgICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gICAgfSxcbiAgICBzZXQgaWRzKHYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICAgIH0sXG4gICAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdCk7XG4gICAgfVxufTtcbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgICAgIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgICAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAgICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICAgICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgICAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgICAgICB8fCB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IGNvbnN0IHRhZyA9IGZ1bmN0aW9uIChfMSwgXzIsIF8zKSB7XG4gICAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgICAgdGFnKHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgICB0YWcodGFnc1tdLCBwcm90b3R5cGVzKSAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLCBwcm90b3R5cGVzKSAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAgICovXG4gICAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgcHJvdG90eXBlc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICAgICAgPyBbXzEsIF8yLCBfM11cbiAgICAgICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgICAgICAgPyBbbnVsbCwgXzEsIF8yXVxuICAgICAgICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMV07XG4gICAgLyogTm90ZTogd2UgdXNlIHByb3BlcnR5IGRlZmludGlvbiAoYW5kIG5vdCBvYmplY3Qgc3ByZWFkKSBzbyBnZXR0ZXJzIChsaWtlIGBpZHNgKVxuICAgICAgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgY2FsbGVkICovXG4gICAgY29uc3QgdGFnUHJvdG90eXBlcyA9IE9iamVjdC5jcmVhdGUobnVsbCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZWxlbWVudFByb3R5cGUpKTtcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAgIC8vIHRvIGNvcHkgYSBnZXR0ZXIvc2V0dGVyIHBhaXIgZnJvbSBhbm90aGVyIG9iamVjdFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdQcm90b3R5cGVzLCAnYXR0cmlidXRlcycsIHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KGEpIHtcbiAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFpID0gaXNBc3luY0l0ZXJhdG9yKGEpID8gYSA6IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICgpID0+IGFpLm5leHQoKS50aGVuKCh7IGRvbmUsIHZhbHVlIH0pID0+IHsgYXNzaWduUHJvcHModGhpcywgdmFsdWUpOyBkb25lIHx8IHN0ZXAoKTsgfSwgZXggPT4gY29uc29sZS53YXJuKFwiKEFJLVVJKVwiLCBleCkpO1xuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChwcm90b3R5cGVzKVxuICAgICAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIHByb3RvdHlwZXMpO1xuICAgIGZ1bmN0aW9uIG5vZGVzKC4uLmMpIHtcbiAgICAgICAgY29uc3QgYXBwZW5kZWQgPSBbXTtcbiAgICAgICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGMpIHtcbiAgICAgICAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZ1swXSk7XG4gICAgICAgICAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbm9kZXMocik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudEVsZW1lbnQsIG9sZFswXSkobik7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGcgPSBuO1xuICAgICAgICAgICAgICAgIH0sICh4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHgpO1xuICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihnWzBdKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogeCB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChjKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgICAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRwbSA9ICh1bmJveGVkID09PSB1bmRlZmluZWQgfHwgdW5ib3hlZCA9PT0gYykgPyBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXSA6IG5vZGVzKHVuYm94ZWQpO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goLi4uZHBtKTtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IGRwbTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5vd25lckRvY3VtZW50Py5ib2R5LmNvbnRhaW5zKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQocykgbm8gbG9uZ2VyIGV4aXN0IGluIGRvY3VtZW50XCIgKyBpbnNlcnRpb25TdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKHVuYm94KGVzLnZhbHVlKSA/PyBEb21Qcm9taXNlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgd2VudCB3cm9uZy4gVGVybWluYXRlIHRoZSBpdGVyYXRvciBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgYz8uW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4oZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgfSkoYyk7XG4gICAgICAgIHJldHVybiBhcHBlbmRlZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXBwZW5kZXIoY29udGFpbmVyLCBiZWZvcmUpIHtcbiAgICAgICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzKGMpO1xuICAgICAgICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICAgICAgICAgIC8vIFwiYmVmb3JlXCIsIGJlaW5nIGEgbm9kZSwgY291bGQgYmUgI3RleHQgbm9kZVxuICAgICAgICAgICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmJlZm9yZS5jYWxsKGJlZm9yZSwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgYSB0ZXh0IG5vZGUgLSB3b3JrIGJhY2t3YXJkcyBhbmQgaW5zZXJ0ICphZnRlciogdGhlIHByZWNlZWRpbmcgRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBiZWZvcmUucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkludGVybmFsIGVycm9yIC0gY29udGFpbmVyIG1pc21hdGNoXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkcmVuW2ldLCBiZWZvcmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZC5jYWxsKGNvbnRhaW5lciwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoIW5hbWVTcGFjZSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgICAgICAgYXBwZW5kZXIsIC8vIExlZ2FjeSBSVEEgc3VwcG9ydFxuICAgICAgICAgICAgbm9kZXMsIC8vIFByZWZlcnJlZCBpbnRlcmZhY2UgaW5zdGVhZCBvZiBgYXBwZW5kZXJgXG4gICAgICAgICAgICBVbmlxdWVJRCxcbiAgICAgICAgICAgIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gICAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICAgIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZCwgcywgZGVjbGFyYXRpb24pIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2coYERlY2xhcmVkIHByb3BldHkgJHtrfSBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdW5ib3goYSkge1xuICAgICAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IHYubWFwKHVuYm94KSA6IHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2UsIHByb3BzKSB7XG4gICAgICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgICAgIGlmICghKGNhbGxTdGFja1N5bWJvbCBpbiBwcm9wcykpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiBhc3NpZ24oZCwgcykge1xuICAgICAgICAgICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUVudHJpZXMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSk7XG4gICAgICAgICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGFbMF0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ3NldCcgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwLjU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhpcyBwcm9taXNlIHJlc29sdmVkIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBsb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcImFzc2lnblByb3BzXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFwID0gYXN5bmNJdGVyYXRvcih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiYXNlLm93bmVyRG9jdW1lbnQuY29udGFpbnMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGVsZW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2MuIFRlbGwgdGhlIHNvdXJjZSBhcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gc3RvcCBzZW5kaW5nIHVzIHN0dWZmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKFwiRWxlbWVudCBubyBsb25nZXIgZXhpc3RzIGluIGRvY3VtZW50ICh1cGRhdGUgXCIgKyBrLnRvU3RyaW5nKCkgKyBcIilcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3REZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoYmFzZSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlLCBrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKGUpIHtcbiAgICAgICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICAgICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dGVuZGVkKF9vdmVycmlkZXMpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgPyAoaW5zdGFuY2UpID0+IE9iamVjdC5hc3NpZ24oe30sIF9vdmVycmlkZXMsIGluc3RhbmNlKVxuICAgICAgICAgICAgOiBfb3ZlcnJpZGVzO1xuICAgICAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgKGlkQ291bnQrKykudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG4gICAgICAgIGxldCBzdGF0aWNFeHRlbnNpb25zID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICAgIC8qIFwiU3RhdGljYWxseVwiIGNyZWF0ZSBhbnkgc3R5bGVzIHJlcXVpcmVkIGJ5IHRoaXMgd2lkZ2V0ICovXG4gICAgICAgIGlmIChzdGF0aWNFeHRlbnNpb25zLnN0eWxlcykge1xuICAgICAgICAgICAgcG9TdHlsZUVsdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHBvU3R5bGVFbHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgICAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAgICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICAgICAgY29uc3QgZXh0ZW5kVGFnRm4gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICAgICAgICBjb25zdCBuZXdDYWxsU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9O1xuICAgICAgICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICAgICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICAgICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5wcm90b3R5cGUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgICAgICAgIHRhZ0RlZmluaXRpb24uaXRlcmFibGUgJiYgT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5pdGVyYWJsZSkuZm9yRWFjaChrID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZVtrXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgIGlmICghbm9BdHRycylcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihlKShjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlLCB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgICAgICAgICAgICAvLyBieSBhc3NpZ25Qcm9wcyBmcm9tIGEgZnV0dXJlXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5pdGVyYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhiYXNlLml0ZXJhYmxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKCFub0F0dHJzICYmIGsgaW4gYXR0cnMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXh0ZW5kVGFnID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICAgICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICAgICAgICBleHRlbmRlZCxcbiAgICAgICAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSB8fCB7fSksIC4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuaXRlcmFibGUgfHwge30pXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGZ1bGxQcm90byA9IHt9O1xuICAgICAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3IpIHtcbiAgICAgICAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgICAgICAgICB3YWxrUHJvdG8oY3JlYXRvci5zdXBlcik7XG4gICAgICAgICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSh0aGlzKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMucHJvdG90eXBlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICAgICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgICAgICAgIDogdW5pcXVlVGFnSUQ7XG4gICAgICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleHRlbmRUYWc7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VUYWdDcmVhdG9ycyA9IHt9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrKSB7XG4gICAgICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuICAgICAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgICAgICAgICAgYXR0cnMgPSB7IHByb3RvdHlwZToge30gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgICAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgICAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSBPYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgICAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKTsgfSxcbiAgICAgICAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba10gPSBpbmNsdWRpbmdFeHRlbmRlcjtcbiAgICB9XG4gICAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59O1xuY29uc3QgRG9tUHJvbWlzZUNvbnRhaW5lciA9IChjKSA9PiB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoREVCVUcgPyBuZXcgRXJyb3IoXCJDb25zdHJ1Y3RlZFwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJykgfHwgXCJlcnJvclwiIDogXCJwcm9taXNlXCIpO1xufTtcbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9IChjKSA9PiB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoYz8uZXJyb3I/LnN0YWNrIHx8IGM/LmVycm9yPy50b1N0cmluZygpIHx8IFwiZXJyb3JcIik7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gICAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgICB3aGlsZSAoZykge1xuICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICAgIH1cbiAgICBpZiAoIWcpIHtcbiAgICAgICAgbG9nKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgICB9XG59XG5leHBvcnQgbGV0IGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7XG4gICAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHsgfTsgLy8gT25seSBjcmVhdGUgdGhlIG9ic2VydmVyIG9uY2VcbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICAgICAgICAgIG0ucmVtb3ZlZE5vZGVzLmZvckVhY2gocmVtb3ZlZCA9PiByZW1vdmVkICYmIHJlbW92ZWQgaW5zdGFuY2VvZiBFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0Lm93bmVyRG9jdW1lbnQuY29udGFpbnMoZWx0KSkuZm9yRWFjaChlbHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ29uUmVtb3ZlZEZyb21ET00nIGluIGVsdCAmJiB0eXBlb2YgZWx0Lm9uUmVtb3ZlZEZyb21ET00gPT09ICdmdW5jdGlvbicgJiYgZWx0Lm9uUmVtb3ZlZEZyb21ET00oKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xufTtcbmNvbnN0IHdhcm5lZCA9IG5ldyBTZXQoKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50SWRNYXAobm9kZSwgaWRzKSB7XG4gICAgbm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG4gICAgaWRzID0gaWRzIHx8IHt9O1xuICAgIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbHQpIHtcbiAgICAgICAgICAgIGlmIChlbHQuaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkc1tlbHQuaWRdKVxuICAgICAgICAgICAgICAgICAgICBpZHNbZWx0LmlkXSA9IGVsdDtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMoZWx0LmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChlbHQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nKCcoQUktVUkpJywgXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQsIGVsdCwgaWRzW2VsdC5pZF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==