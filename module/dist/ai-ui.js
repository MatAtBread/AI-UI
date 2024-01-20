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
/* harmony export */   DEBUG: () => (/* binding */ DEBUG)
/* harmony export */ });
// @ts-ignore
const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.includes?.('AI-UI') || false;


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
        promise.catch(ex => console.log("Deferred", ex, initLocation));
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
/* harmony import */ var _deferred_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./deferred.js */ "./src/deferred.ts");

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
    map: wrapAsyncHelper(map),
    filter: wrapAsyncHelper(filter),
    throttle: wrapAsyncHelper(throttle),
    debounce: wrapAsyncHelper(debounce),
    waitFor: wrapAsyncHelper(waitFor),
    count: wrapAsyncHelper(count),
    retain: wrapAsyncHelper(retain),
    broadcast: wrapAsyncHelper(broadcast),
    initially: wrapAsyncHelper(initially),
    consume: consume,
    merge(...m) {
        return merge(this, ...m);
    }
};
class QueueIteratableIterator {
    constructor(stop = () => { }) {
        this.stop = stop;
        this._pending = [];
        this._items = [];
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    next() {
        if (this._items.length) {
            return Promise.resolve({ done: false, value: this._items.shift() });
        }
        const value = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.deferred)();
        this._pending.push(value);
        return value;
    }
    return() {
        const value = { done: true, value: undefined };
        if (this._pending) {
            try {
                this.stop();
            }
            catch (ex) { }
            while (this._pending.length)
                this._pending.shift().reject(value);
            this._items = this._pending = null;
        }
        return Promise.resolve(value);
    }
    throw(...args) {
        const value = { done: true, value: args[0] };
        if (this._pending) {
            try {
                this.stop();
            }
            catch (ex) { }
            while (this._pending.length)
                this._pending.shift().reject(value);
            this._items = this._pending = null;
        }
        return Promise.resolve(value);
    }
    push(value) {
        if (!this._pending) {
            //throw new Error("pushIterator has stopped");
            return false;
        }
        if (this._pending.length) {
            this._pending.shift().resolve({ done: false, value });
        }
        else {
            this._items.push(value);
        }
        return true;
    }
}
/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  unique values from the queue (ie: the queue is SHARED not duplicated)
*/
function pushIterator(stop = () => { }, bufferWhenNoConsumers = false) {
    let consumers = 0;
    let ai = new QueueIteratableIterator(() => {
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
            const added = new QueueIteratableIterator(() => {
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
function defineIterableProperty(o, name, v) {
    // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
    // access the iterator methods to prevent leaks where an iterable is created, but
    // never referenced, and therefore cannot be consumed and ultimately closed
    let initIterator = () => {
        initIterator = () => b;
        const bi = broadcastIterator();
        extras[Symbol.asyncIterator] = { value: bi[Symbol.asyncIterator], enumerable: false, writable: false };
        push = bi.push;
        const b = bi[Symbol.asyncIterator]();
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
        initIterator(); // Updates `push` to reference the broadvaster
        return push(v);
    };
    let a = box(v, extras);
    let vi;
    Object.defineProperty(o, name, {
        get() { return a; },
        set(v) {
            /*
            Potential code to allow setting of an iterable property from another iterator
            ** It doesn't work as it is asynchronously recursive **
            if (isAsyncIter(v)) {
              if (vi) {
                vi.return?.();
              }
              vi = asyncIterator(v) as AsyncIterator<V>;
              const update = () => vi!.next().then(es => {
                if (es.done) {
                  vi = undefined;
                } else {
                  a = box(es.value, extras);
                  push(es.value?.valueOf() as V);
                  update();
                }
              }).catch(ex => {
                console.log(ex);
                //vi!.throw?.(ex);
                vi = undefined;
              });
              update();
            } else
            */ {
                a = box(v, extras);
                push(v?.valueOf());
            }
        },
        enumerable: true
    });
    return o;
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
                console.warn('Iterable properties of type "object" will be modified. Spread the object if necessary.');
                return Object.defineProperties(a, pds);
            }
            return a;
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
            // Boxes types, including BigInt
            return Object.defineProperties(Object.assign(a), {
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
        [Symbol.asyncIterator]() { return this; },
        next() {
            return count
                ? Promise.race(promises).then(({ idx, result }) => {
                    if (result.done) {
                        count--;
                        promises[idx] = forever;
                        results[idx] = result.value;
                        return { done: count === 0, value: result.value };
                    }
                    else {
                        // `ex` is the underlying async iteration exception
                        promises[idx] = it[idx].next().then(result => ({ idx, result })).catch(ex => ({ idx, result: ex }));
                        return result;
                    }
                }).catch(ex => {
                    return this.throw?.(ex) ?? Promise.reject({ done: true, value: new Error("Iterator merge exception") });
                })
                : Promise.reject({ done: true, value: new Error("Iterator merge complete") });
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
        throw(ex) {
            for (let i = 0; i < it.length; i++) {
                if (promises[i] !== forever) {
                    promises[i] = forever;
                    it[i].throw?.(ex); // Terminate the sources with the appropriate cause
                }
            }
            return Promise.reject(ex);
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
        // @ts-ignore: TS type madness
        return iterableHelpers(g(...args));
    };
}
/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */
async function* map(...mapper) {
    const ai = this[Symbol.asyncIterator]();
    try {
        while (true) {
            const p = await ai.next();
            if (p.done) {
                return ai.return?.(p.value);
            }
            for (const m of mapper)
                yield m(p.value);
        }
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
async function* filter(fn) {
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
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
async function* initially(initValue) {
    yield initValue;
    for await (const u of this)
        yield u;
}
async function* throttle(milliseconds) {
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
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
const forever = new Promise(() => { });
// NB: DEBOUNCE IS CURRENTLY BROKEN
async function* debounce(milliseconds) {
    const ai = this[Symbol.asyncIterator]();
    let timer = forever;
    let last = -1;
    try {
        while (true) {
            const p = await Promise.race([ai.next(), timer]);
            if ('done' in p && p.done)
                return ai.return?.(p.value);
            if ('debounced' in p && p.debounced) {
                if (p.debounced === last)
                    yield p.value;
            }
            else {
                // We have a new value from the src
                clearTimeout(last);
                timer = new Promise(resolve => {
                    last = setTimeout(() => {
                        resolve({ debounced: last, value: p.value });
                    }, milliseconds);
                });
            }
        }
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
async function* waitFor(cb) {
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
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
async function* count(field) {
    const ai = this[Symbol.asyncIterator]();
    let count = 0;
    try {
        for await (const value of this) {
            const counted = {
                ...value,
                [field]: count++
            };
            yield counted;
        }
    }
    catch (ex) {
        ai.throw?.(ex);
    }
    finally {
        ai.return?.();
    }
}
function retain() {
    const ai = this[Symbol.asyncIterator]();
    let prev;
    return {
        [Symbol.asyncIterator]() { return this; },
        next() {
            const n = ai.next();
            n.then(p => prev = p);
            return n;
        },
        return(value) {
            return ai.return?.(value) ?? Promise.resolve({ done: true, value });
        },
        throw(...args) {
            return ai.throw?.(args) ?? Promise.resolve({ done: true, value: args[0] });
        },
        get value() {
            return prev.value;
        },
        get done() {
            return Boolean(prev.done);
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
const asyncHelperFunctions = { map, filter, throttle, debounce, waitFor, count, retain, broadcast, initially, consume, merge };


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
                    push[Symbol.asyncIterator]().throw?.(new Error(msg));
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
    try {
        await new Promise(() => { });
        yield undefined; // Never should be executed
    }
    catch (ex) {
        console.warn('neverGonnaHappen', ex);
    }
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
                const d = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
                requestAnimationFrame(() => d.resolve({ done: true, value: {} }));
                return d;
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
    const d = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
    new MutationObserver((records, mutation) => {
        for (const record of records) {
            if (record.addedNodes?.length) {
                if (document.body.contains(elt)) {
                    mutation.disconnect();
                    d.resolve();
                    return;
                }
            }
        }
    }).observe(document.body, {
        subtree: true,
        childList: true
    });
    return d;
}
function allSelectorsPresent(container, missing) {
    if (!missing.length) {
        return Promise.resolve();
    }
    const d = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
    /* debugging help: warn if waiting a long time for a selectors to be ready */
    if (_debug_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG) {
        const stack = new Error().stack?.replace(/^Error/, "Missing selectors after 5 seconds:");
        const warn = setTimeout(() => {
            console.warn(stack, missing);
        }, 5000);
        d.finally(() => clearTimeout(warn));
    }
    new MutationObserver((records, mutation) => {
        for (const record of records) {
            if (record.addedNodes?.length) {
                missing = missing.filter(sel => !container.querySelector(sel));
                if (!missing.length) {
                    mutation.disconnect();
                    d.resolve();
                    return;
                }
            }
        }
    }).observe(container, {
        subtree: true,
        childList: true
    });
    return d;
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
    },
    /* EXPERIMENTAL: Allow a partial style object to be assigned to `style`
    set style(s: any) {
      const pd = getProtoPropertyDescriptor(this,'style');
      if (typeof s === 'object') {
        deepAssign(pd?.get.call(this),s);
      } else {
        pd?.set.call(this,s);
      }
    },
    get style() {
      const pd = getProtoPropertyDescriptor(this,'style');
      return pd?.get.call(this);
    },*/
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
    /* Work out which parameter is which. There are 4 variations:
      tag()                                       []
      tag(prototypes)                             [object]
      tag(tags[])                                 [string[]]
      tag(tags[], prototypes)                     [string[], object]
      tag(namespace | null, tags[])               [string | null, string[]]
      tag(namespace | null, tags[],prototypes)    [string | null, string[], object]
    */
    const [nameSpace, tags, prototypes] = (typeof _1 === 'string') || _1 === null
        ? [_1, _2, _3]
        : Array.isArray(_1)
            ? [null, _1, _2]
            : [null, standandTags, _1];
    /* Note: we use deepAssign (and not object spread) so getters (like `ids`)
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
                        if (!n.length || !n[0].parentNode)
                            throw new Error("Element(s) no longer exist in document" + insertionStack);
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
                                    console.warn("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
                for (const [k, srcDesc] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
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
                                        console.warn("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
            poStyleElt.appendChild(document.createTextNode(staticExtensions.styles));
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
            const ped = {};
            const tagDefinition = overrides(ped);
            combinedAttrs[callStackSymbol].push(tagDefinition);
            deepDefine(e, tagDefinition.prototype);
            deepDefine(e, tagDefinition.override);
            deepDefine(e, tagDefinition.declare);
            const iterableKeys = tagDefinition.iterable && Object.keys(tagDefinition.iterable);
            iterableKeys?.forEach(k => {
                (0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.defineIterableProperty)(e, k, tagDefinition.iterable[k]);
            });
            if (combinedAttrs[callStackSymbol] === newCallStack) {
                if (!noAttrs)
                    assignProps(e, attrs);
                while (newCallStack.length) {
                    const base = newCallStack.shift();
                    const children = base?.constructed?.call(e);
                    if (isChildTag(children)) // technically not necessary, since "void" is going to be undefined in 99.9% of cases.
                        appender(e)(children);
                }
                // @ts-ignore
                iterableKeys?.forEach(k => e[k] = e[k].valueOf());
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
  }`,
    override: {
        className: 'error'
    },
    declare: {
        error: undefined
    },
    constructed() {
        return (typeof this.error === 'object')
            ? this.error instanceof Error
                ? this.error.message
                : JSON.stringify(this.error)
            : String(this.error);
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
                //else console.warn("Shadowed element ID",elt.id,elt,ids[elt.id])
            }
        });
    }
    return ids;
}

})();

AIUI = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c0I7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVDQUF1QztBQUMvQztBQUNBO0FBQ0E7QUFDQSxlQUFlLDRDQUFLO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLG1DQUFtQyxTQUFTLG1CQUFtQixFQUFFLDRDQUFLO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDTTtBQUNQLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxTQUFTO0FBQ1QsS0FBSywyQkFBMkIsZ0NBQWdDO0FBQ2hFO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQUlVSS8uL3NyYy9kZWJ1Zy50cyIsIndlYnBhY2s6Ly9BSVVJLy4vc3JjL2RlZmVycmVkLnRzIiwid2VicGFjazovL0FJVUkvLi9zcmMvaXRlcmF0b3JzLnRzIiwid2VicGFjazovL0FJVUkvLi9zcmMvd2hlbi50cyIsIndlYnBhY2s6Ly9BSVVJL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0FJVUkvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0FJVUkvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9BSVVJL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQUlVSS8uL3NyYy9haS11aS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgZ2xvYmFsVGhpcy5ERUJVRz8uaW5jbHVkZXM/LignQUktVUknKSB8fCBmYWxzZTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2KSA9PiB7IH07XG5leHBvcnQgZnVuY3Rpb24gZGVmZXJyZWQoKSB7XG4gICAgbGV0IHJlc29sdmUgPSBub3RoaW5nO1xuICAgIGxldCByZWplY3QgPSBub3RoaW5nO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKTtcbiAgICBwcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuICAgIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICAgIGlmIChERUJVRykge1xuICAgICAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgcHJvbWlzZS5jYXRjaChleCA9PiBjb25zb2xlLmxvZyhcIkRlZmVycmVkXCIsIGV4LCBpbml0TG9jYXRpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlTGlrZSh4KSB7XG4gICAgcmV0dXJuIHggIT09IG51bGwgJiYgeCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCJpbXBvcnQgeyBkZWZlcnJlZCB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCI7XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yKG8pIHtcbiAgICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlKG8pIHtcbiAgICByZXR1cm4gbyAmJiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXIobykge1xuICAgIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3Iobykge1xuICAgIGlmIChpc0FzeW5jSXRlcmFibGUobykpXG4gICAgICAgIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGlmIChpc0FzeW5jSXRlcmF0b3IobykpXG4gICAgICAgIHJldHVybiBvO1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBhcyBhc3luYyBwcm92aWRlclwiKTtcbn1cbi8qIEEgZnVuY3Rpb24gdGhhdCB3cmFwcyBhIFwicHJvdG90eXBpY2FsXCIgQXN5bmNJdGVyYXRvciBoZWxwZXIsIHRoYXQgaGFzIGB0aGlzOkFzeW5jSXRlcmFibGU8VD5gIGFuZCByZXR1cm5zXG4gIHNvbWV0aGluZyB0aGF0J3MgZGVyaXZlZCBmcm9tIEFzeW5jSXRlcmFibGU8Uj4sIHJlc3VsdCBpbiBhIHdyYXBwZWQgZnVuY3Rpb24gdGhhdCBhY2NlcHRzXG4gIHRoZSBzYW1lIGFyZ3VtZW50cyByZXR1cm5zIGEgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+XG4qL1xuZnVuY3Rpb24gd3JhcEFzeW5jSGVscGVyKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZm4uY2FsbCh0aGlzLCAuLi5hcmdzKSk7IH07XG59XG5leHBvcnQgY29uc3QgYXN5bmNFeHRyYXMgPSB7XG4gICAgbWFwOiB3cmFwQXN5bmNIZWxwZXIobWFwKSxcbiAgICBmaWx0ZXI6IHdyYXBBc3luY0hlbHBlcihmaWx0ZXIpLFxuICAgIHRocm90dGxlOiB3cmFwQXN5bmNIZWxwZXIodGhyb3R0bGUpLFxuICAgIGRlYm91bmNlOiB3cmFwQXN5bmNIZWxwZXIoZGVib3VuY2UpLFxuICAgIHdhaXRGb3I6IHdyYXBBc3luY0hlbHBlcih3YWl0Rm9yKSxcbiAgICBjb3VudDogd3JhcEFzeW5jSGVscGVyKGNvdW50KSxcbiAgICByZXRhaW46IHdyYXBBc3luY0hlbHBlcihyZXRhaW4pLFxuICAgIGJyb2FkY2FzdDogd3JhcEFzeW5jSGVscGVyKGJyb2FkY2FzdCksXG4gICAgaW5pdGlhbGx5OiB3cmFwQXN5bmNIZWxwZXIoaW5pdGlhbGx5KSxcbiAgICBjb25zdW1lOiBjb25zdW1lLFxuICAgIG1lcmdlKC4uLm0pIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICAgIH1cbn07XG5jbGFzcyBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB7XG4gICAgY29uc3RydWN0b3Ioc3RvcCA9ICgpID0+IHsgfSkge1xuICAgICAgICB0aGlzLnN0b3AgPSBzdG9wO1xuICAgICAgICB0aGlzLl9wZW5kaW5nID0gW107XG4gICAgICAgIHRoaXMuX2l0ZW1zID0gW107XG4gICAgfVxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBuZXh0KCkge1xuICAgICAgICBpZiAodGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB0aGlzLl9pdGVtcy5zaGlmdCgpIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQoKTtcbiAgICAgICAgdGhpcy5fcGVuZGluZy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4oKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5fcGVuZGluZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHRocm93KC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5fcGVuZGluZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wZW5kaW5nKSB7XG4gICAgICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcInB1c2hJdGVyYXRvciBoYXMgc3RvcHBlZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcGVuZGluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmcuc2hpZnQoKS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuLyogQW4gQXN5bmNJdGVyYWJsZSB3aGljaCB0eXBlZCBvYmplY3RzIGNhbiBiZSBwdWJsaXNoZWQgdG8uXG4gIFRoZSBxdWV1ZSBjYW4gYmUgcmVhZCBieSBtdWx0aXBsZSBjb25zdW1lcnMsIHdobyB3aWxsIGVhY2ggcmVjZWl2ZVxuICB1bmlxdWUgdmFsdWVzIGZyb20gdGhlIHF1ZXVlIChpZTogdGhlIHF1ZXVlIGlzIFNIQVJFRCBub3QgZHVwbGljYXRlZClcbiovXG5leHBvcnQgZnVuY3Rpb24gcHVzaEl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0sIGJ1ZmZlcldoZW5Ob0NvbnN1bWVycyA9IGZhbHNlKSB7XG4gICAgbGV0IGNvbnN1bWVycyA9IDA7XG4gICAgbGV0IGFpID0gbmV3IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKCgpID0+IHtcbiAgICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICAgIGlmIChjb25zdW1lcnMgPT09IDAgJiYgIWJ1ZmZlcldoZW5Ob0NvbnN1bWVycykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGFzeW5jRXh0cmFzKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gYWk7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghYnVmZmVyV2hlbk5vQ29uc3VtZXJzICYmIGNvbnN1bWVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIG9uZSByZWFkeSB0byByZWFkIHRoZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFpLnB1c2godmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZShleCkge1xuICAgICAgICAgICAgZXggPyBhaS50aHJvdz8uKGV4KSA6IGFpLnJldHVybj8uKCk7XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyogQW4gQXN5bmNJdGVyYWJsZSB3aGljaCB0eXBlZCBvYmplY3RzIGNhbiBiZSBwdWJsaXNoZWQgdG8uXG4gIFRoZSBxdWV1ZSBjYW4gYmUgcmVhZCBieSBtdWx0aXBsZSBjb25zdW1lcnMsIHdobyB3aWxsIGVhY2ggcmVjZWl2ZVxuICBhIGNvcHkgb2YgdGhlIHZhbHVlcyBmcm9tIHRoZSBxdWV1ZSAoaWU6IHRoZSBxdWV1ZSBpcyBCUk9BRENBU1Qgbm90IHNoYXJlZCkuXG5cbiAgVGhlIGl0ZXJhdG9ycyBzdG9wcyBydW5uaW5nIHdoZW4gdGhlIG51bWJlciBvZiBjb25zdW1lcnMgZGVjcmVhc2VzIHRvIHplcm9cbiovXG5leHBvcnQgZnVuY3Rpb24gYnJvYWRjYXN0SXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSkge1xuICAgIGxldCBhaSA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBiID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGFzeW5jRXh0cmFzKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3QgYWRkZWQgPSBuZXcgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFpLmRlbGV0ZShhZGRlZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFpLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWkuYWRkKGFkZGVkKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWRkZWQpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWFpPy5zaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIHEucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoZXgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIGV4ID8gcS50aHJvdz8uKGV4KSA6IHEucmV0dXJuPy4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGI7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShvLCBuYW1lLCB2KSB7XG4gICAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgICAvLyBhY2Nlc3MgdGhlIGl0ZXJhdG9yIG1ldGhvZHMgdG8gcHJldmVudCBsZWFrcyB3aGVyZSBhbiBpdGVyYWJsZSBpcyBjcmVhdGVkLCBidXRcbiAgICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgICAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgICAgICBjb25zdCBiaSA9IGJyb2FkY2FzdEl0ZXJhdG9yKCk7XG4gICAgICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7IHZhbHVlOiBiaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogZmFsc2UgfTtcbiAgICAgICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgICAgIGNvbnN0IGIgPSBiaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgT2JqZWN0LmtleXMoYXN5bmNIZWxwZXJGdW5jdGlvbnMpLm1hcChrID0+IGV4dHJhc1trXSA9IHsgdmFsdWU6IGJba10sIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGEsIGV4dHJhcyk7XG4gICAgICAgIHJldHVybiBiO1xuICAgIH07XG4gICAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgICBjb25zdCBsYXp5QXN5bmNNZXRob2QgPSAobWV0aG9kKSA9PiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG4gICAgY29uc3QgZXh0cmFzID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogaW5pdEl0ZXJhdG9yXG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKGFzeW5jSGVscGVyRnVuY3Rpb25zKS5tYXAoayA9PiBleHRyYXNba10gPSB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH0pO1xuICAgIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICAgIGxldCBwdXNoID0gKHYpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgYnJvYWR2YXN0ZXJcbiAgICAgICAgcmV0dXJuIHB1c2godik7XG4gICAgfTtcbiAgICBsZXQgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgIGxldCB2aTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiBhOyB9LFxuICAgICAgICBzZXQodikge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIFBvdGVudGlhbCBjb2RlIHRvIGFsbG93IHNldHRpbmcgb2YgYW4gaXRlcmFibGUgcHJvcGVydHkgZnJvbSBhbm90aGVyIGl0ZXJhdG9yXG4gICAgICAgICAgICAqKiBJdCBkb2Vzbid0IHdvcmsgYXMgaXQgaXMgYXN5bmNocm9ub3VzbHkgcmVjdXJzaXZlICoqXG4gICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIodikpIHtcbiAgICAgICAgICAgICAgaWYgKHZpKSB7XG4gICAgICAgICAgICAgICAgdmkucmV0dXJuPy4oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2aSA9IGFzeW5jSXRlcmF0b3IodikgYXMgQXN5bmNJdGVyYXRvcjxWPjtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gKCkgPT4gdmkhLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXMuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgdmkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGEgPSBib3goZXMudmFsdWUsIGV4dHJhcyk7XG4gICAgICAgICAgICAgICAgICBwdXNoKGVzLnZhbHVlPy52YWx1ZU9mKCkgYXMgVik7XG4gICAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhleCk7XG4gICAgICAgICAgICAgICAgLy92aSEudGhyb3c/LihleCk7XG4gICAgICAgICAgICAgICAgdmkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgKi8ge1xuICAgICAgICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgICAgICAgICBwdXNoKHY/LnZhbHVlT2YoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gbztcbn1cbmZ1bmN0aW9uIGJveChhLCBwZHMpIHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGE7IH0gfSxcbiAgICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGE7IH0gfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgLyogVE9ETzogVGhpcyBpcyBwcm9ibGVtYXRpYyBhcyB0aGUgb2JqZWN0IG1pZ2h0IGhhdmUgY2xhc2hpbmcga2V5cy5cbiAgICAgICAgICAgICAgVGhlIGFsdGVybmF0aXZlcyBhcmU6XG4gICAgICAgICAgICAgIC0gRG9uJ3QgYWRkIHRoZSBwZHMsIHRoZW4gdGhlIG9iamVjdCByZW1haW5zIHVubW9sZXN0ZWQsIGJ1dCBjYW4ndCBiZSB1c2VkIHdpdGggLm1hcCwgLmZpbHRlciwgZXRjXG4gICAgICAgICAgICAgIC0gZXhhbWluZSB0aGUgb2JqZWN0IGFuZCBkZWNpZGUgd2hldGhlciB0byBpbnNlcnQgdGhlIHByb3RvdHlwZSAoYnJlYWtzIGJ1aWx0IGluIG9iamVjdHMsIHdvcmtzIHdpdGggUG9KUylcbiAgICAgICAgICAgICAgLSBkb24ndCBhbGxvdyBvYmplY3RzIGFzIGl0ZXJhYmxlIHByb3BlcnRpZXMsIHdoaWNoIGF2b2lkcyB0aGUgYGRlZXAgdHJlZWAgcHJvYmxlbVxuICAgICAgICAgICAgICAtIHNvbWV0aGluZyBlbHNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0l0ZXJhYmxlIHByb3BlcnRpZXMgb2YgdHlwZSBcIm9iamVjdFwiIHdpbGwgYmUgbW9kaWZpZWQuIFNwcmVhZCB0aGUgb2JqZWN0IGlmIG5lY2Vzc2FyeS4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYSwgcGRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0LmFzc2lnbihhKSwge1xuICAgICAgICAgICAgICAgIC4uLnBkcyxcbiAgICAgICAgICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhLnZhbHVlT2YoKTsgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xufVxuZXhwb3J0IGNvbnN0IG1lcmdlID0gKC4uLmFpKSA9PiB7XG4gICAgY29uc3QgaXQgPSBhaS5tYXAoaSA9PiBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBpID8gaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGkpO1xuICAgIGNvbnN0IHByb21pc2VzID0gaXQubWFwKChpLCBpZHgpID0+IGkubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIGxldCBjb3VudCA9IHByb21pc2VzLmxlbmd0aDtcbiAgICBjb25zdCBtZXJnZWQgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiB0aGlzOyB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgICAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IGV4IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgY29tcGxldGVcIikgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybigpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4ID0gbmV3IEVycm9yKFwiTWVyZ2UgdGVybWluYXRlZFwiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICBpdFtpXS5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2VzIHdpdGggdGhlIGFwcHJvcHJpYXRlIGNhdXNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICBpdFtpXS50aHJvdz8uKGV4KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2VzIHdpdGggdGhlIGFwcHJvcHJpYXRlIGNhdXNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpO1xufTtcbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4gIGNhbGxpbmcgYGJpbmQoYWkpYCBhZGRzIFwic3RhbmRhcmRcIiBtZXRob2RzIHRvIHRoZSBzcGVjaWZpZWQgQXN5bmNJdGVyYWJsZVxuKi9cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZShpKSB7XG4gICAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICAgICAmJiBPYmplY3Qua2V5cyhhc3luY0V4dHJhcylcbiAgICAgICAgICAgIC5ldmVyeShrID0+IChrIGluIGkpICYmIGlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVycyhhaSkge1xuICAgIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGFpLCBhc3luY0V4dHJhcyk7XG4gICAgfVxuICAgIHJldHVybiBhaTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzKGcpIHtcbiAgICAvLyBAdHMtaWdub3JlOiBUUyB0eXBlIG1hZG5lc3NcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZTogVFMgdHlwZSBtYWRuZXNzXG4gICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZyguLi5hcmdzKSk7XG4gICAgfTtcbn1cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cbmFzeW5jIGZ1bmN0aW9uKiBtYXAoLi4ubWFwcGVyKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhaS5yZXR1cm4/LihwLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgbSBvZiBtYXBwZXIpXG4gICAgICAgICAgICAgICAgeWllbGQgbShwLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgYWkudGhyb3c/LihleCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiBmaWx0ZXIoZm4pIHtcbiAgICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBhd2FpdCBhaS5uZXh0KCk7XG4gICAgICAgICAgICBpZiAocC5kb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF3YWl0IGZuKHAudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQgcC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgYWkudGhyb3c/LihleCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiBpbml0aWFsbHkoaW5pdFZhbHVlKSB7XG4gICAgeWllbGQgaW5pdFZhbHVlO1xuICAgIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzKVxuICAgICAgICB5aWVsZCB1O1xufVxuYXN5bmMgZnVuY3Rpb24qIHRocm90dGxlKG1pbGxpc2Vjb25kcykge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBsZXQgcGF1c2VkID0gMDtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgcCA9IGF3YWl0IGFpLm5leHQoKTtcbiAgICAgICAgICAgIGlmIChwLmRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWkucmV0dXJuPy4ocC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgaWYgKHBhdXNlZCA8IG5vdykge1xuICAgICAgICAgICAgICAgIHBhdXNlZCA9IG5vdyArIG1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgICAgICB5aWVsZCBwLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChleCkge1xuICAgICAgICBhaS50aHJvdz8uKGV4KTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGFpLnJldHVybj8uKCk7XG4gICAgfVxufVxuY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlKCgpID0+IHsgfSk7XG4vLyBOQjogREVCT1VOQ0UgSVMgQ1VSUkVOVExZIEJST0tFTlxuYXN5bmMgZnVuY3Rpb24qIGRlYm91bmNlKG1pbGxpc2Vjb25kcykge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBsZXQgdGltZXIgPSBmb3JldmVyO1xuICAgIGxldCBsYXN0ID0gLTE7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBhd2FpdCBQcm9taXNlLnJhY2UoW2FpLm5leHQoKSwgdGltZXJdKTtcbiAgICAgICAgICAgIGlmICgnZG9uZScgaW4gcCAmJiBwLmRvbmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgICAgICAgaWYgKCdkZWJvdW5jZWQnIGluIHAgJiYgcC5kZWJvdW5jZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAocC5kZWJvdW5jZWQgPT09IGxhc3QpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgbmV3IHZhbHVlIGZyb20gdGhlIHNyY1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChsYXN0KTtcbiAgICAgICAgICAgICAgICB0aW1lciA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgZGVib3VuY2VkOiBsYXN0LCB2YWx1ZTogcC52YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgbWlsbGlzZWNvbmRzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgYWkudGhyb3c/LihleCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiB3YWl0Rm9yKGNiKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhaS5yZXR1cm4/LihwLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gY2IocmVzb2x2ZSkpO1xuICAgICAgICAgICAgeWllbGQgcC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgYWkudGhyb3c/LihleCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiBjb3VudChmaWVsZCkge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIHRyeSB7XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgdmFsdWUgb2YgdGhpcykge1xuICAgICAgICAgICAgY29uc3QgY291bnRlZCA9IHtcbiAgICAgICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgICAgICAgICBbZmllbGRdOiBjb3VudCsrXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeWllbGQgY291bnRlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgYWkudGhyb3c/LihleCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJldGFpbigpIHtcbiAgICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgbGV0IHByZXY7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIHRoaXM7IH0sXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gYWkubmV4dCgpO1xuICAgICAgICAgICAgbi50aGVuKHAgPT4gcHJldiA9IHApO1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHZhbHVlKSA/PyBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZSB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGFpLnRocm93Py4oYXJncykgPz8gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGFyZ3NbMF0gfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmV2LnZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgZG9uZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHByZXYuZG9uZSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gYnJvYWRjYXN0KCkge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBjb25zdCBiID0gYnJvYWRjYXN0SXRlcmF0b3IoKCkgPT4gYWkucmV0dXJuPy4oKSk7XG4gICAgKGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgYWkubmV4dCgpLnRoZW4odiA9PiB7XG4gICAgICAgICAgICBpZiAodi5kb25lKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVoIC0gd2UgdGhyb3cgdGhlc2UgYXdheSBmb3Igbm93LlxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLmJyb2FkY2FzdCBkb25lXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYi5wdXNoKHYudmFsdWUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiBiLmNsb3NlKGV4KSk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIGJbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZShmKSB7XG4gICAgbGV0IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMpXG4gICAgICAgIGxhc3QgPSBmPy4odSk7XG4gICAgYXdhaXQgbGFzdDtcbn1cbmNvbnN0IGFzeW5jSGVscGVyRnVuY3Rpb25zID0geyBtYXAsIGZpbHRlciwgdGhyb3R0bGUsIGRlYm91bmNlLCB3YWl0Rm9yLCBjb3VudCwgcmV0YWluLCBicm9hZGNhc3QsIGluaXRpYWxseSwgY29uc3VtZSwgbWVyZ2UgfTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBkZWZlcnJlZCB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCI7XG5pbXBvcnQgeyBwdXNoSXRlcmF0b3IsIGl0ZXJhYmxlSGVscGVycywgYXN5bmNFeHRyYXMsIG1lcmdlIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcihldikge1xuICAgIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlKTtcbiAgICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBwdXNoLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkudGhyb3c/LihuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBuIHx8IG4uY29udGFpbnMoZXYudGFyZ2V0KSkgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaC5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaC5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMF0sIFwiY2hhbmdlXCJdO1xuICAgICAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF1dO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuZnVuY3Rpb24gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdCkge1xuICAgIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIgKyB3aGF0KTtcbiAgICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhldmVudE5hbWUpKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICAgIH1cbiAgICBjb25zdCBwdXNoID0gcHVzaEl0ZXJhdG9yKCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuICAgIGNvbnN0IGRldGFpbHMgPSB7XG4gICAgICAgIHB1c2gsXG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yIHx8IG51bGxcbiAgICB9O1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpLmFkZChkZXRhaWxzKTtcbiAgICByZXR1cm4gcHVzaDtcbn1cbmFzeW5jIGZ1bmN0aW9uKiBuZXZlckdvbm5hSGFwcGVuKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHsgfSk7XG4gICAgICAgIHlpZWxkIHVuZGVmaW5lZDsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG4gICAgfVxuICAgIGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ25ldmVyR29ubmFIYXBwZW4nLCBleCk7XG4gICAgfVxufVxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmMoc3JjKSB7XG4gICAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gYXN5bmNFeHRyYXMubWFwLmNhbGwoc3JjLCBtYXBwZXIpO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdCkge1xuICAgIGlmICghd2hhdClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gICAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5hc3luYyBmdW5jdGlvbiogb25jZShwKSB7XG4gICAgeWllbGQgcDtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuKGNvbnRhaW5lciwgLi4uc291cmNlcykge1xuICAgIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSk7XG4gICAgfVxuICAgIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICAgICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgICAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICAgICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICAgICAgICAgIDogd2hhdCk7XG4gICAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0ge1xuICAgICAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBkZWZlcnJlZCgpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBkLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZToge30gfSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgICAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuICAgICAgICBmdW5jdGlvbiBpc01pc3Npbmcoc2VsKSB7XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuICAgICAgICBjb25zdCBhaSA9IHtcbiAgICAgICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaTsgfSxcbiAgICAgICAgICAgIGFzeW5jIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lciwgbWlzc2luZyksXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcilcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgICAgICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGFpLm5leHQgPSBldmVudHMubmV4dC5iaW5kKGV2ZW50cyk7IC8vKCkgPT4gZXZlbnRzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBhaS5yZXR1cm4gPSBldmVudHMucmV0dXJuPy5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPSBldmVudHMudGhyb3c/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKGFpKTtcbiAgICB9XG4gICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbigpKTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhtZXJnZWQpO1xufVxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0KSB7XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGNvbnN0IGQgPSBkZWZlcnJlZCgpO1xuICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZWNvcmRzKSB7XG4gICAgICAgICAgICBpZiAocmVjb3JkLmFkZGVkTm9kZXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gZDtcbn1cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSB7XG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGNvbnN0IGQgPSBkZWZlcnJlZCgpO1xuICAgIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICAgICAgY29uc3Qgd2FybiA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKHN0YWNrLCBtaXNzaW5nKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIGQuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FybikpO1xuICAgIH1cbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xuICAgICAgICAgICAgaWYgKHJlY29yZC5hZGRlZE5vZGVzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gZDtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgYXN5bmNJdGVyYXRvciwgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSwgaXNBc3luY0l0ZXIsIGlzQXN5bmNJdGVyYWJsZSB9IGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmltcG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2RlYnVnLmpzJztcbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmNvbnN0IHN0YW5kYW5kVGFncyA9IFtcbiAgICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICAgIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgICBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImVtYmVkXCIsIFwiZmllbGRzZXRcIiwgXCJmaWdjYXB0aW9uXCIsIFwiZmlndXJlXCIsIFwiZm9vdGVyXCIsIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIixcbiAgICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICAgIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICAgIFwicHJvZ3Jlc3NcIiwgXCJxXCIsIFwicnBcIiwgXCJydFwiLCBcInJ1YnlcIiwgXCJzXCIsIFwic2FtcFwiLCBcInNjcmlwdFwiLCBcInNlYXJjaFwiLCBcInNlY3Rpb25cIiwgXCJzZWxlY3RcIiwgXCJzbG90XCIsIFwic21hbGxcIiwgXCJzb3VyY2VcIiwgXCJzcGFuXCIsXG4gICAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICAgIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXTtcbmNvbnN0IGVsZW1lbnRQcm90eXBlID0ge1xuICAgIGdldCBpZHMoKSB7XG4gICAgICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gICAgfSxcbiAgICBzZXQgaWRzKHYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICAgIH0sXG4gICAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdCk7XG4gICAgfSxcbiAgICAvKiBFWFBFUklNRU5UQUw6IEFsbG93IGEgcGFydGlhbCBzdHlsZSBvYmplY3QgdG8gYmUgYXNzaWduZWQgdG8gYHN0eWxlYFxuICAgIHNldCBzdHlsZShzOiBhbnkpIHtcbiAgICAgIGNvbnN0IHBkID0gZ2V0UHJvdG9Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcywnc3R5bGUnKTtcbiAgICAgIGlmICh0eXBlb2YgcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZGVlcEFzc2lnbihwZD8uZ2V0LmNhbGwodGhpcykscyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZD8uc2V0LmNhbGwodGhpcyxzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldCBzdHlsZSgpIHtcbiAgICAgIGNvbnN0IHBkID0gZ2V0UHJvdG9Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcywnc3R5bGUnKTtcbiAgICAgIHJldHVybiBwZD8uZ2V0LmNhbGwodGhpcyk7XG4gICAgfSwqL1xufTtcbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgICAgIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgICAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAgICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICAgICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgICAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgICAgICB8fCB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IGNvbnN0IHRhZyA9IGZ1bmN0aW9uIChfMSwgXzIsIF8zKSB7XG4gICAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNCB2YXJpYXRpb25zOlxuICAgICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgICAgdGFnKHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgICB0YWcodGFnc1tdLCBwcm90b3R5cGVzKSAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLHByb3RvdHlwZXMpICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAgICovXG4gICAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgcHJvdG90eXBlc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICAgICAgPyBbXzEsIF8yLCBfM11cbiAgICAgICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgICAgICAgPyBbbnVsbCwgXzEsIF8yXVxuICAgICAgICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMV07XG4gICAgLyogTm90ZTogd2UgdXNlIGRlZXBBc3NpZ24gKGFuZCBub3Qgb2JqZWN0IHNwcmVhZCkgc28gZ2V0dGVycyAobGlrZSBgaWRzYClcbiAgICAgIGFyZSBub3QgZXZhbHVhdGVkIHVudGlsIGNhbGxlZCAqL1xuICAgIGNvbnN0IHRhZ1Byb3RvdHlwZXMgPSBPYmplY3QuY3JlYXRlKG51bGwsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGVsZW1lbnRQcm90eXBlKSk7XG4gICAgLy8gV2UgZG8gdGhpcyBoZXJlIGFuZCBub3QgaW4gZWxlbWVudFByb3R5cGUgYXMgdGhlcmUncyBubyBzeW50YXhcbiAgICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywgJ2F0dHJpYnV0ZXMnLCB7XG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdhdHRyaWJ1dGVzJyksXG4gICAgICAgIHNldChhKSB7XG4gICAgICAgICAgICBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChwcm90b3R5cGVzKVxuICAgICAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIHByb3RvdHlwZXMpO1xuICAgIGZ1bmN0aW9uIG5vZGVzKC4uLmMpIHtcbiAgICAgICAgY29uc3QgYXBwZW5kZWQgPSBbXTtcbiAgICAgICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGMpIHtcbiAgICAgICAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICAgICAgICAgIGxldCBnID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChnWzBdKTtcbiAgICAgICAgICAgICAgICBjLnRoZW4ociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBub2RlcyhyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkID0gZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFswXS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihvbGRbMF0ucGFyZW50RWxlbWVudCwgb2xkWzBdKShuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZC5mb3JFYWNoKGUgPT4gZS5wYXJlbnRFbGVtZW50Py5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZyA9IG47XG4gICAgICAgICAgICAgICAgfSwgeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih4KTtcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoZ1swXSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IHggfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmFibGUoYykgPyBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIDogYztcbiAgICAgICAgICAgICAgICBjb25zdCBkcG0gPSBEb21Qcm9taXNlQ29udGFpbmVyKCk7XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkcG0pO1xuICAgICAgICAgICAgICAgIGxldCB0ID0gW2RwbV07XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IChBcnJheS5pc0FycmF5KHQpID8gdCA6IFt0XSkuZmlsdGVyKG4gPT4gQm9vbGVhbihuKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuWzBdLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+IGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCB0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSAoQXJyYXkuaXNBcnJheSh0KSA/IHQgOiBbdF0pLmZpbHRlcihlID0+IGUub3duZXJEb2N1bWVudD8uYm9keS5jb250YWlucyhlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoIHx8ICFuWzBdLnBhcmVudE5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudChzKSBubyBsb25nZXIgZXhpc3QgaW4gZG9jdW1lbnRcIiArIGluc2VydGlvblN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKHVuYm94KGVzLnZhbHVlKSA/PyBEb21Qcm9taXNlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBjPy5bU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZCBvZiBjKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbihkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgICAgICB9KShjKTtcbiAgICAgICAgcmV0dXJuIGFwcGVuZGVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcHBlbmRlcihjb250YWluZXIsIGJlZm9yZSkge1xuICAgICAgICBpZiAoYmVmb3JlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBiZWZvcmUgPSBudWxsO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZXMoYyk7XG4gICAgICAgICAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgLy8gXCJiZWZvcmVcIiwgYmVpbmcgYSBub2RlLCBjb3VsZCBiZSAjdGV4dCBub2RlXG4gICAgICAgICAgICAgICAgaWYgKGJlZm9yZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYmVmb3JlLmNhbGwoYmVmb3JlLCAuLi5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSdyZSBhIHRleHQgbm9kZSAtIHdvcmsgYmFja3dhcmRzIGFuZCBpbnNlcnQgKmFmdGVyKiB0aGUgcHJlY2VlZGluZyBFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGJlZm9yZS5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50ICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNvbnRhaW5lciBtaXNtYXRjaD8/XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkcmVuW2ldLCBiZWZvcmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZC5jYWxsKGNvbnRhaW5lciwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoIW5hbWVTcGFjZSkge1xuICAgICAgICB0YWcuYXBwZW5kZXIgPSBhcHBlbmRlcjsgLy8gTGVnYWN5IFJUQSBzdXBwb3J0XG4gICAgICAgIHRhZy5ub2RlcyA9IG5vZGVzOyAvLyBQcmVmZXJyZWQgaW50ZXJmYWNlXG4gICAgfVxuICAgIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQsIHMpIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgcHJvcGVydHkgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0byBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1bmJveChhKSB7XG4gICAgICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdi5tYXAodW5ib3gpIDogdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZSwgcHJvcHMpIHtcbiAgICAgICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICAgICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkLCBzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFwID0gYXN5bmNJdGVyYXRvcih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiYXNlLm93bmVyRG9jdW1lbnQuY29udGFpbnMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGVsZW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2MuIFRlbGwgdGhlIHNvdXJjZSBhcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gc3RvcCBzZW5kaW5nIHVzIHN0dWZmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IG5vIGxvbmdlciBleGlzdHMgaW4gZG9jdW1lbnQgKHVwZGF0ZSBcIiArIGsgKyBcIilcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKFwiRWxlbWVudCBubyBsb25nZXIgZXhpc3RzIGluIGRvY3VtZW50ICh1cGRhdGUgXCIgKyBrICsgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihiYXNlKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0byBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLypcbiAgICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgICAgLi4ub3IuLi5cbiAgICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICAgKi9cbiAgICBmdW5jdGlvbiBleHRlbmRlZChfb3ZlcnJpZGVzKSB7XG4gICAgICAgIGNvbnN0IG92ZXJyaWRlcyA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgID8gKGluc3RhbmNlKSA9PiBfb3ZlcnJpZGVzXG4gICAgICAgICAgICA6IF9vdmVycmlkZXM7XG4gICAgICAgIGNvbnN0IHN0YXRpY0luc3RhbmNlID0ge307XG4gICAgICAgIGxldCBzdGF0aWNFeHRlbnNpb25zID0gb3ZlcnJpZGVzKHN0YXRpY0luc3RhbmNlKTtcbiAgICAgICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICAgICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICAgICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSk7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHBvU3R5bGVFbHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgICAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAgICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICAgICAgY29uc3QgZXh0ZW5kVGFnRm4gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICAgICAgICBjb25zdCBuZXdDYWxsU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9O1xuICAgICAgICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICAgICAgICBjb25zdCBwZWQgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBvdmVycmlkZXMocGVkKTtcbiAgICAgICAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLnByb3RvdHlwZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUpO1xuICAgICAgICAgICAgY29uc3QgaXRlcmFibGVLZXlzID0gdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKTtcbiAgICAgICAgICAgIGl0ZXJhYmxlS2V5cz8uZm9yRWFjaChrID0+IHtcbiAgICAgICAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGVba10pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3Q2FsbFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gbmV3Q2FsbFN0YWNrLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NoaWxkVGFnKGNoaWxkcmVuKSkgLy8gdGVjaG5pY2FsbHkgbm90IG5lY2Vzc2FyeSwgc2luY2UgXCJ2b2lkXCIgaXMgZ29pbmcgdG8gYmUgdW5kZWZpbmVkIGluIDk5LjklIG9mIGNhc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoZSkoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgaXRlcmFibGVLZXlzPy5mb3JFYWNoKGsgPT4gZVtrXSA9IGVba10udmFsdWVPZigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBleHRlbmRUYWcgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICAgICAgICBzdXBlcjogdGhpcyxcbiAgICAgICAgICAgIG92ZXJyaWRlcyxcbiAgICAgICAgICAgIGV4dGVuZGVkLFxuICAgICAgICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSAvKiwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5wcm90b3R5cGUgfHwge30pKi9dO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcikge1xuICAgICAgICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICAgICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5vdmVycmlkZXM/LihzdGF0aWNJbnN0YW5jZSk7XG4gICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkodGhpcyk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLnByb3RvdHlwZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG4gICAgICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAgICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICAgICAgICA6ICc/JztcbiAgICAgICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/ICcgQCcgKyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXT8ubWF0Y2goL1xcKCguKilcXCkvKT8uWzFdID8/ICc/JykgOiAnJztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleHRlbmRUYWc7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VUYWdDcmVhdG9ycyA9IHt9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrKSB7XG4gICAgICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuICAgICAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgICAgICAgICAgYXR0cnMgPSB7IHByb3RvdHlwZToge30gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgICAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgICAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSBPYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgICAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKTsgfSxcbiAgICAgICAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICAgIH1cbiAgICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn07XG5jb25zdCB7IFwiYWktdWktY29udGFpbmVyXCI6IEFzeW5jRE9NQ29udGFpbmVyIH0gPSB0YWcoJycsIFtcImFpLXVpLWNvbnRhaW5lclwiXSk7XG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIucHJvbWlzZSB7XG4gICAgZGlzcGxheTogJHtERUJVRyA/ICdpbmxpbmUnIDogJ25vbmUnfTtcbiAgICBjb2xvcjogIzg4ODtcbiAgICBmb250LXNpemU6IDAuNzVlbTtcbiAgfVxuICBhaS11aS1jb250YWluZXIucHJvbWlzZTphZnRlciB7XG4gICAgY29udGVudDogXCLii69cIjtcbiAgfWAsXG4gICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgY2xhc3NOYW1lOiAncHJvbWlzZSdcbiAgICB9LFxuICAgIGNvbnN0cnVjdGVkKCkge1xuICAgICAgICByZXR1cm4gQXN5bmNET01Db250YWluZXIoeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSB9LCBERUJVR1xuICAgICAgICAgICAgPyBuZXcgRXJyb3IoXCJDb25zdHJ1Y3RlZFwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKTtcbiAgICB9XG59KTtcbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9IEFzeW5jRE9NQ29udGFpbmVyLmV4dGVuZGVkKHtcbiAgICBzdHlsZXM6IGBcbiAgYWktdWktY29udGFpbmVyLmVycm9yIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBjb2xvcjogI2IzMztcbiAgfWAsXG4gICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgY2xhc3NOYW1lOiAnZXJyb3InXG4gICAgfSxcbiAgICBkZWNsYXJlOiB7XG4gICAgICAgIGVycm9yOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGNvbnN0cnVjdGVkKCkge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiB0aGlzLmVycm9yID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgID8gdGhpcy5lcnJvciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgPyB0aGlzLmVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHRoaXMuZXJyb3IpXG4gICAgICAgICAgICA6IFN0cmluZyh0aGlzLmVycm9yKTtcbiAgICB9XG59KTtcbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkgeyB9OyAvLyBPbmx5IGNyZWF0ZSB0aGUgb2JzZXJ2ZXIgb25jZVxuICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgICAgICAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChyZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgWy4uLnJlbW92ZWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLCByZW1vdmVkXS5maWx0ZXIoZWx0ID0+ICFlbHQub3duZXJEb2N1bWVudC5jb250YWlucyhlbHQpKS5mb3JFYWNoKGVsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnb25SZW1vdmVkRnJvbURPTScgaW4gZWx0ICYmIHR5cGVvZiBlbHQub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJyAmJiBlbHQub25SZW1vdmVkRnJvbURPTSgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRJZE1hcChub2RlLCBpZHMpIHtcbiAgICBub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbiAgICBpZHMgPSBpZHMgfHwge307XG4gICAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWRdXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsdCkge1xuICAgICAgICAgICAgaWYgKGVsdC5pZCkge1xuICAgICAgICAgICAgICAgIGlmICghaWRzW2VsdC5pZF0pXG4gICAgICAgICAgICAgICAgICAgIGlkc1tlbHQuaWRdID0gZWx0O1xuICAgICAgICAgICAgICAgIC8vZWxzZSBjb25zb2xlLndhcm4oXCJTaGFkb3dlZCBlbGVtZW50IElEXCIsZWx0LmlkLGVsdCxpZHNbZWx0LmlkXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpZHM7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=