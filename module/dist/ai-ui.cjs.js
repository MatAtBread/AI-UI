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
    map: wrapAsyncHelper(map),
    filter: wrapAsyncHelper(filter),
    unique: wrapAsyncHelper(unique),
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
        const value = (0,_deferred_js__WEBPACK_IMPORTED_MODULE_1__.deferred)();
        // We install a catch handler as the promise might be legitimately reject before anything waits for it,
        // and this suppresses the uncaught exception warning.
        value.catch(ex => { });
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
        return Promise.reject(value);
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
function defineIterableProperty(obj, name, v) {
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
        initIterator(); // Updates `push` to reference the broadcaster
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
            // Because we've passed the exception on to all the sources, we're now done
            // previously: return Promise.reject(ex);
            return Promise.resolve({ done: true, value: ex });
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
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
        return ai.throw ? ai.throw(ex) : ai.return?.();
    }
}
const noUniqueValue = Symbol('noUniqueValue');
async function* unique(fn) {
    const ai = this[Symbol.asyncIterator]();
    let prev = noUniqueValue;
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
    }
    catch (ex) {
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
        ai.return?.();
    }
    catch (ex) {
        return ai.throw ? ai.throw(ex) : ai.return?.();
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
const asyncHelperFunctions = { map, filter, unique, throttle, debounce, waitFor, count, retain, broadcast, initially, consume, merge };


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
                //else console.warn("Shadowed element ID",elt.id,elt,ids[elt.id])
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1Q0FBdUM7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsZUFBZSw0Q0FBSztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxtQ0FBbUMsU0FBUyxtQkFBbUIsRUFBRSw0Q0FBSztBQUN0RTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ007QUFDUCw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsU0FBUztBQUNULEtBQUssMkJBQTJCLGdDQUFnQztBQUNoRTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2RlYnVnLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2RlZmVycmVkLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2l0ZXJhdG9ycy50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS8uL3NyYy93aGVuLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvYWktdWkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/LmluY2x1ZGVzPy4oJ0FJLVVJJykgfHwgZmFsc2U7XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodikgPT4geyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkKCkge1xuICAgIGxldCByZXNvbHZlID0gbm90aGluZztcbiAgICBsZXQgcmVqZWN0ID0gbm90aGluZztcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcik7XG4gICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZFwiLCBleCwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoeCkge1xuICAgIHJldHVybiB4ICE9PSBudWxsICYmIHggIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuaW1wb3J0IHsgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcihvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZShvKSB7XG4gICAgcmV0dXJuIG8gJiYgb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyKG8pIHtcbiAgICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yKG8pIHtcbiAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKVxuICAgICAgICByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKVxuICAgICAgICByZXR1cm4gbztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG4vKiBBIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYSBcInByb3RvdHlwaWNhbFwiIEFzeW5jSXRlcmF0b3IgaGVscGVyLCB0aGF0IGhhcyBgdGhpczpBc3luY0l0ZXJhYmxlPFQ+YCBhbmQgcmV0dXJuc1xuICBzb21ldGhpbmcgdGhhdCdzIGRlcml2ZWQgZnJvbSBBc3luY0l0ZXJhYmxlPFI+LCByZXN1bHQgaW4gYSB3cmFwcGVkIGZ1bmN0aW9uIHRoYXQgYWNjZXB0c1xuICB0aGUgc2FtZSBhcmd1bWVudHMgcmV0dXJucyBhIEFzeW5jRXh0cmFJdGVyYWJsZTxYPlxuKi9cbmZ1bmN0aW9uIHdyYXBBc3luY0hlbHBlcihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykgeyByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZuLmNhbGwodGhpcywgLi4uYXJncykpOyB9O1xufVxuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICAgIG1hcDogd3JhcEFzeW5jSGVscGVyKG1hcCksXG4gICAgZmlsdGVyOiB3cmFwQXN5bmNIZWxwZXIoZmlsdGVyKSxcbiAgICB1bmlxdWU6IHdyYXBBc3luY0hlbHBlcih1bmlxdWUpLFxuICAgIHRocm90dGxlOiB3cmFwQXN5bmNIZWxwZXIodGhyb3R0bGUpLFxuICAgIGRlYm91bmNlOiB3cmFwQXN5bmNIZWxwZXIoZGVib3VuY2UpLFxuICAgIHdhaXRGb3I6IHdyYXBBc3luY0hlbHBlcih3YWl0Rm9yKSxcbiAgICBjb3VudDogd3JhcEFzeW5jSGVscGVyKGNvdW50KSxcbiAgICByZXRhaW46IHdyYXBBc3luY0hlbHBlcihyZXRhaW4pLFxuICAgIGJyb2FkY2FzdDogd3JhcEFzeW5jSGVscGVyKGJyb2FkY2FzdCksXG4gICAgaW5pdGlhbGx5OiB3cmFwQXN5bmNIZWxwZXIoaW5pdGlhbGx5KSxcbiAgICBjb25zdW1lOiBjb25zdW1lLFxuICAgIG1lcmdlKC4uLm0pIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICAgIH1cbn07XG5jbGFzcyBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB7XG4gICAgY29uc3RydWN0b3Ioc3RvcCA9ICgpID0+IHsgfSkge1xuICAgICAgICB0aGlzLnN0b3AgPSBzdG9wO1xuICAgICAgICB0aGlzLl9wZW5kaW5nID0gW107XG4gICAgICAgIHRoaXMuX2l0ZW1zID0gW107XG4gICAgfVxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBuZXh0KCkge1xuICAgICAgICBpZiAodGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB0aGlzLl9pdGVtcy5zaGlmdCgpIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQoKTtcbiAgICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgICAgdGhpcy5fcGVuZGluZy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4oKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5fcGVuZGluZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHRocm93KC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zID0gdGhpcy5fcGVuZGluZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9XG4gICAgcHVzaCh2YWx1ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX3BlbmRpbmcpIHtcbiAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwicHVzaEl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZy5zaGlmdCgpLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4vKiBBbiBBc3luY0l0ZXJhYmxlIHdoaWNoIHR5cGVkIG9iamVjdHMgY2FuIGJlIHB1Ymxpc2hlZCB0by5cbiAgVGhlIHF1ZXVlIGNhbiBiZSByZWFkIGJ5IG11bHRpcGxlIGNvbnN1bWVycywgd2hvIHdpbGwgZWFjaCByZWNlaXZlXG4gIHVuaXF1ZSB2YWx1ZXMgZnJvbSB0aGUgcXVldWUgKGllOiB0aGUgcXVldWUgaXMgU0hBUkVEIG5vdCBkdXBsaWNhdGVkKVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwdXNoSXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSwgYnVmZmVyV2hlbk5vQ29uc3VtZXJzID0gZmFsc2UpIHtcbiAgICBsZXQgY29uc3VtZXJzID0gMDtcbiAgICBsZXQgYWkgPSBuZXcgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKCkgPT4ge1xuICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgaWYgKGNvbnN1bWVycyA9PT0gMCAmJiAhYnVmZmVyV2hlbk5vQ29uc3VtZXJzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoYXN5bmNFeHRyYXMpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgICAgICAgIHJldHVybiBhaTtcbiAgICAgICAgfSxcbiAgICAgICAgcHVzaCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFidWZmZXJXaGVuTm9Db25zdW1lcnMgJiYgY29uc3VtZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gb25lIHJlYWR5IHRvIHJlYWQgdGhlIHJlc3VsdHNcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWkucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlKGV4KSB7XG4gICAgICAgICAgICBleCA/IGFpLnRocm93Py4oZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vKiBBbiBBc3luY0l0ZXJhYmxlIHdoaWNoIHR5cGVkIG9iamVjdHMgY2FuIGJlIHB1Ymxpc2hlZCB0by5cbiAgVGhlIHF1ZXVlIGNhbiBiZSByZWFkIGJ5IG11bHRpcGxlIGNvbnN1bWVycywgd2hvIHdpbGwgZWFjaCByZWNlaXZlXG4gIGEgY29weSBvZiB0aGUgdmFsdWVzIGZyb20gdGhlIHF1ZXVlIChpZTogdGhlIHF1ZXVlIGlzIEJST0FEQ0FTVCBub3Qgc2hhcmVkKS5cblxuICBUaGUgaXRlcmF0b3JzIHN0b3BzIHJ1bm5pbmcgd2hlbiB0aGUgbnVtYmVyIG9mIGNvbnN1bWVycyBkZWNyZWFzZXMgdG8gemVyb1xuKi9cbmV4cG9ydCBmdW5jdGlvbiBicm9hZGNhc3RJdGVyYXRvcihzdG9wID0gKCkgPT4geyB9KSB7XG4gICAgbGV0IGFpID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGIgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoYXN5bmNFeHRyYXMpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9IG5ldyBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWkuZGVsZXRlKGFkZGVkKTtcbiAgICAgICAgICAgICAgICBpZiAoYWkuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhaS5hZGQoYWRkZWQpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhZGRlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghYWk/LnNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBxIG9mIGFpLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgcS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZShleCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBxIG9mIGFpLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgZXggPyBxLnRocm93Py4oZXgpIDogcS5yZXR1cm4/LigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KG9iaiwgbmFtZSwgdikge1xuICAgIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gICAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gICAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gICAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICAgICAgY29uc3QgYmkgPSBicm9hZGNhc3RJdGVyYXRvcigpO1xuICAgICAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0geyB2YWx1ZTogYmlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlIH07XG4gICAgICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgICAgICBjb25zdCBiID0gYmlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIE9iamVjdC5rZXlzKGFzeW5jSGVscGVyRnVuY3Rpb25zKS5tYXAoayA9PiBleHRyYXNba10gPSB7IHZhbHVlOiBiW2tdLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgICAgICByZXR1cm4gYjtcbiAgICB9O1xuICAgIC8vIENyZWF0ZSBzdHVicyB0aGF0IGxhemlseSBjcmVhdGUgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZSBpbnRlcmZhY2Ugd2hlbiBpbnZva2VkXG4gICAgY29uc3QgbGF6eUFzeW5jTWV0aG9kID0gKG1ldGhvZCkgPT4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICB9O1xuICAgIGNvbnN0IGV4dHJhcyA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgICAgICB9XG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhhc3luY0hlbHBlckZ1bmN0aW9ucykubWFwKGsgPT4gZXh0cmFzW2tdID0ge1xuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBsYXp5QXN5bmNNZXRob2QoaylcbiAgICB9KTtcbiAgICAvLyBMYXppbHkgaW5pdGlhbGl6ZSBgcHVzaGBcbiAgICBsZXQgcHVzaCA9ICh2KSA9PiB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpOyAvLyBVcGRhdGVzIGBwdXNoYCB0byByZWZlcmVuY2UgdGhlIGJyb2FkY2FzdGVyXG4gICAgICAgIHJldHVybiBwdXNoKHYpO1xuICAgIH07XG4gICAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIGE7IH0sXG4gICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgICAgICBwdXNoKHY/LnZhbHVlT2YoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gYm94KGEsIHBkcykge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYTsgfSB9LFxuICAgICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYTsgfSB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAvKiBUT0RPOiBUaGlzIGlzIHByb2JsZW1hdGljIGFzIHRoZSBvYmplY3QgbWlnaHQgaGF2ZSBjbGFzaGluZyBrZXlzLlxuICAgICAgICAgICAgICBUaGUgYWx0ZXJuYXRpdmVzIGFyZTpcbiAgICAgICAgICAgICAgLSBEb24ndCBhZGQgdGhlIHBkcywgdGhlbiB0aGUgb2JqZWN0IHJlbWFpbnMgdW5tb2xlc3RlZCwgYnV0IGNhbid0IGJlIHVzZWQgd2l0aCAubWFwLCAuZmlsdGVyLCBldGNcbiAgICAgICAgICAgICAgLSBleGFtaW5lIHRoZSBvYmplY3QgYW5kIGRlY2lkZSB3aGV0aGVyIHRvIGluc2VydCB0aGUgcHJvdG90eXBlIChicmVha3MgYnVpbHQgaW4gb2JqZWN0cywgd29ya3Mgd2l0aCBQb0pTKVxuICAgICAgICAgICAgICAtIGRvbid0IGFsbG93IG9iamVjdHMgYXMgaXRlcmFibGUgcHJvcGVydGllcywgd2hpY2ggYXZvaWRzIHRoZSBgZGVlcCB0cmVlYCBwcm9ibGVtXG4gICAgICAgICAgICAgIC0gc29tZXRoaW5nIGVsc2VcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhKSkge1xuICAgICAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIG9mIHR5cGUgXCJvYmplY3RcIiB3aWxsIGJlIHNwcmVhZCB0byBwcmV2ZW50IHJlLWluaXRpYWxpc2F0aW9uLicsIGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh7IC4uLmEgfSwgcGRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0LmFzc2lnbihhKSwge1xuICAgICAgICAgICAgICAgIC4uLnBkcyxcbiAgICAgICAgICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhLnZhbHVlT2YoKTsgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xufVxuZXhwb3J0IGNvbnN0IG1lcmdlID0gKC4uLmFpKSA9PiB7XG4gICAgY29uc3QgaXQgPSBhaS5tYXAoaSA9PiBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBpID8gaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGkpO1xuICAgIGNvbnN0IHByb21pc2VzID0gaXQubWFwKChpLCBpZHgpID0+IGkubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIGxldCBjb3VudCA9IHByb21pc2VzLmxlbmd0aDtcbiAgICBjb25zdCBtZXJnZWQgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiB0aGlzOyB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgICAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IGV4IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgY29tcGxldGVcIikgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybigpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4ID0gbmV3IEVycm9yKFwiTWVyZ2UgdGVybWluYXRlZFwiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICBpdFtpXS5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2VzIHdpdGggdGhlIGFwcHJvcHJpYXRlIGNhdXNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICBpdFtpXS50aHJvdz8uKGV4KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2VzIHdpdGggdGhlIGFwcHJvcHJpYXRlIGNhdXNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAgICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpO1xufTtcbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4gIGNhbGxpbmcgYGJpbmQoYWkpYCBhZGRzIFwic3RhbmRhcmRcIiBtZXRob2RzIHRvIHRoZSBzcGVjaWZpZWQgQXN5bmNJdGVyYWJsZVxuKi9cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZShpKSB7XG4gICAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICAgICAmJiBPYmplY3Qua2V5cyhhc3luY0V4dHJhcylcbiAgICAgICAgICAgIC5ldmVyeShrID0+IChrIGluIGkpICYmIGlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVycyhhaSkge1xuICAgIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGFpLCBhc3luY0V4dHJhcyk7XG4gICAgfVxuICAgIHJldHVybiBhaTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzKGcpIHtcbiAgICAvLyBAdHMtaWdub3JlOiBUUyB0eXBlIG1hZG5lc3NcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZTogVFMgdHlwZSBtYWRuZXNzXG4gICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZyguLi5hcmdzKSk7XG4gICAgfTtcbn1cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cbmFzeW5jIGZ1bmN0aW9uKiBtYXAoLi4ubWFwcGVyKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhaS5yZXR1cm4/LihwLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgbSBvZiBtYXBwZXIpXG4gICAgICAgICAgICAgICAgeWllbGQgbShwLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmV0dXJuIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiogZmlsdGVyKGZuKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhaS5yZXR1cm4/LihwLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhd2FpdCBmbihwLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJldHVybiBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gICAgfVxufVxuY29uc3Qgbm9VbmlxdWVWYWx1ZSA9IFN5bWJvbCgnbm9VbmlxdWVWYWx1ZScpO1xuYXN5bmMgZnVuY3Rpb24qIHVuaXF1ZShmbikge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBsZXQgcHJldiA9IG5vVW5pcXVlVmFsdWU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBhd2FpdCBhaS5uZXh0KCk7XG4gICAgICAgICAgICBpZiAocC5kb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZuICYmIHByZXYgIT09IG5vVW5pcXVlVmFsdWUgPyBhd2FpdCBmbihwLnZhbHVlLCBwcmV2KSA6IHAudmFsdWUgIT0gcHJldikge1xuICAgICAgICAgICAgICAgIHlpZWxkIHAudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2ID0gcC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmV0dXJuIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiogaW5pdGlhbGx5KGluaXRWYWx1ZSkge1xuICAgIHlpZWxkIGluaXRWYWx1ZTtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcylcbiAgICAgICAgeWllbGQgdTtcbn1cbmFzeW5jIGZ1bmN0aW9uKiB0aHJvdHRsZShtaWxsaXNlY29uZHMpIHtcbiAgICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgbGV0IHBhdXNlZCA9IDA7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBhd2FpdCBhaS5uZXh0KCk7XG4gICAgICAgICAgICBpZiAocC5kb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFpLnJldHVybj8uKHAudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGlmIChwYXVzZWQgPCBub3cpIHtcbiAgICAgICAgICAgICAgICBwYXVzZWQgPSBub3cgKyBtaWxsaXNlY29uZHM7XG4gICAgICAgICAgICAgICAgeWllbGQgcC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmV0dXJuIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICB9XG59XG5jb25zdCBmb3JldmVyID0gbmV3IFByb21pc2UoKCkgPT4geyB9KTtcbi8vIE5COiBERUJPVU5DRSBJUyBDVVJSRU5UTFkgQlJPS0VOXG5hc3luYyBmdW5jdGlvbiogZGVib3VuY2UobWlsbGlzZWNvbmRzKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGxldCB0aW1lciA9IGZvcmV2ZXI7XG4gICAgbGV0IGxhc3QgPSAtMTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgcCA9IGF3YWl0IFByb21pc2UucmFjZShbYWkubmV4dCgpLCB0aW1lcl0pO1xuICAgICAgICAgICAgaWYgKCdkb25lJyBpbiBwICYmIHAuZG9uZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYWkucmV0dXJuPy4ocC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoJ2RlYm91bmNlZCcgaW4gcCAmJiBwLmRlYm91bmNlZCkge1xuICAgICAgICAgICAgICAgIGlmIChwLmRlYm91bmNlZCA9PT0gbGFzdClcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgcC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBuZXcgdmFsdWUgZnJvbSB0aGUgc3JjXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGxhc3QpO1xuICAgICAgICAgICAgICAgIHRpbWVyID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBkZWJvdW5jZWQ6IGxhc3QsIHZhbHVlOiBwLnZhbHVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBtaWxsaXNlY29uZHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChleCkge1xuICAgICAgICByZXR1cm4gYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiB3YWl0Rm9yKGNiKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gYXdhaXQgYWkubmV4dCgpO1xuICAgICAgICAgICAgaWYgKHAuZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhaS5yZXR1cm4/LihwLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gY2IocmVzb2x2ZSkpO1xuICAgICAgICAgICAgeWllbGQgcC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmV0dXJuIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiogY291bnQoZmllbGQpIHtcbiAgICBjb25zdCBhaSA9IHRoaXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICB0cnkge1xuICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IHZhbHVlIG9mIHRoaXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ZWQgPSB7XG4gICAgICAgICAgICAgICAgLi4udmFsdWUsXG4gICAgICAgICAgICAgICAgW2ZpZWxkXTogY291bnQrK1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHlpZWxkIGNvdW50ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgYWkucmV0dXJuPy4oKTtcbiAgICB9XG4gICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJldHVybiBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gcmV0YWluKCkge1xuICAgIGNvbnN0IGFpID0gdGhpc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBsZXQgcHJldjtcbiAgICByZXR1cm4ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gdGhpczsgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBhaS5uZXh0KCk7XG4gICAgICAgICAgICBuLnRoZW4ocCA9PiBwcmV2ID0gcCk7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gYWkucmV0dXJuPy4odmFsdWUpID8/IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlIH0pO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvdyguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gYWkudGhyb3c/LihhcmdzKSA/PyBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogYXJnc1swXSB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXYudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCBkb25lKCkge1xuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocHJldi5kb25lKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBicm9hZGNhc3QoKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGNvbnN0IGIgPSBicm9hZGNhc3RJdGVyYXRvcigoKSA9PiBhaS5yZXR1cm4/LigpKTtcbiAgICAoZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICBhaS5uZXh0KCkudGhlbih2ID0+IHtcbiAgICAgICAgICAgIGlmICh2LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAvLyBNZWggLSB3ZSB0aHJvdyB0aGVzZSBhd2F5IGZvciBub3cuXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIuYnJvYWRjYXN0IGRvbmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBiLnB1c2godi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IGIuY2xvc2UoZXgpKTtcbiAgICB9KSgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gYltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBjb25zdW1lKGYpIHtcbiAgICBsZXQgbGFzdCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcylcbiAgICAgICAgbGFzdCA9IGY/Lih1KTtcbiAgICBhd2FpdCBsYXN0O1xufVxuY29uc3QgYXN5bmNIZWxwZXJGdW5jdGlvbnMgPSB7IG1hcCwgZmlsdGVyLCB1bmlxdWUsIHRocm90dGxlLCBkZWJvdW5jZSwgd2FpdEZvciwgY291bnQsIHJldGFpbiwgYnJvYWRjYXN0LCBpbml0aWFsbHksIGNvbnN1bWUsIG1lcmdlIH07XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiO1xuaW1wb3J0IHsgcHVzaEl0ZXJhdG9yLCBpdGVyYWJsZUhlbHBlcnMsIGFzeW5jRXh0cmFzLCBtZXJnZSB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXIoZXYpIHtcbiAgICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSk7XG4gICAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcHVzaCwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoY29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgICAgICAgICAgICBwdXNoW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpLnRocm93Py4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2gucHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2gucHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Iocykge1xuICAgIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICAgICAgICByZXR1cm4gW3BhcnRzWzBdLCBcImNoYW5nZVwiXTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXV07XG4gICAgfVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmZ1bmN0aW9uIHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpIHtcbiAgICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiICsgd2hhdCk7XG4gICAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgY29uc3QgcHVzaCA9IHB1c2hJdGVyYXRvcigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcbiAgICBjb25zdCBkZXRhaWxzID0ge1xuICAgICAgICBwdXNoLFxuICAgICAgICBjb250YWluZXIsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gICAgfTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKS5hZGQoZGV0YWlscyk7XG4gICAgcmV0dXJuIHB1c2g7XG59XG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbigpIHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIHlpZWxkIHVuZGVmaW5lZDsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYyhzcmMpIHtcbiAgICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBhc3luY0V4dHJhcy5tYXAuY2FsbChzcmMsIG1hcHBlcik7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgaWYgKCF3aGF0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlKHApIHtcbiAgICB5aWVsZCBwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW4oY29udGFpbmVyLCAuLi5zb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKTtcbiAgICB9XG4gICAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgICAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICAgICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgICAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgICAgICAgICAgOiB3aGF0KTtcbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGQucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB7fSB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGl0ZXJhdG9ycy5wdXNoKHN0YXJ0KTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgICAgIGNvbnN0IHdhdGNoU2VsZWN0b3JzID0gc291cmNlcy5maWx0ZXIoaXNWYWxpZFdoZW5TZWxlY3RvcikubWFwKHdoYXQgPT4gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCk/LlswXSk7XG4gICAgICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHR5cGVvZiBzZWwgPT09ICdzdHJpbmcnICYmICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMuZmlsdGVyKGlzTWlzc2luZyk7XG4gICAgICAgIGNvbnN0IGFpID0ge1xuICAgICAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGFpOyB9LFxuICAgICAgICAgICAgYXN5bmMgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW4oKSk7XG4gICAgICAgICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWZlciBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3JcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgYWkubmV4dCA9IGV2ZW50cy5uZXh0LmJpbmQoZXZlbnRzKTsgLy8oKSA9PiBldmVudHMubmV4dCgpO1xuICAgICAgICAgICAgICAgIGFpLnJldHVybiA9IGV2ZW50cy5yZXR1cm4/LmJpbmQoZXZlbnRzKTtcbiAgICAgICAgICAgICAgICBhaS50aHJvdyA9IGV2ZW50cy50aHJvdz8uYmluZChldmVudHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNoYWluQXN5bmMoYWkpO1xuICAgIH1cbiAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgIHJldHVybiBjaGFpbkFzeW5jKG1lcmdlZCk7XG59XG5mdW5jdGlvbiBlbGVtZW50SXNJbkRPTShlbHQpIHtcbiAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgY29uc3QgZCA9IGRlZmVycmVkKCk7XG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVjb3JkIG9mIHJlY29yZHMpIHtcbiAgICAgICAgICAgIGlmIChyZWNvcmQuYWRkZWROb2Rlcz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSkge1xuICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBkO1xufVxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIG1pc3NpbmcpIHtcbiAgICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3QgZCA9IGRlZmVycmVkKCk7XG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgICAgICBjb25zdCB3YXJuID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oc3RhY2ssIG1pc3NpbmcpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgZC5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuKSk7XG4gICAgfVxuICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZWNvcmRzKSB7XG4gICAgICAgICAgICBpZiAocmVjb3JkLmFkZGVkTm9kZXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgICAgICAgICAgICAgIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBkO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhYmxlIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gICAgXCJjYW52YXNcIiwgXCJjYXB0aW9uXCIsIFwiY2l0ZVwiLCBcImNvZGVcIiwgXCJjb2xcIiwgXCJjb2xncm91cFwiLCBcImRhdGFcIiwgXCJkYXRhbGlzdFwiLCBcImRkXCIsIFwiZGVsXCIsIFwiZGV0YWlsc1wiLCBcImRmblwiLCBcImRpYWxvZ1wiLCBcImRpdlwiLFxuICAgIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICAgIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gICAgXCJtYXJrXCIsIFwibWVudVwiLCBcIm1ldGFcIiwgXCJtZXRlclwiLCBcIm5hdlwiLCBcIm5vc2NyaXB0XCIsIFwib2JqZWN0XCIsIFwib2xcIiwgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsXG4gICAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gICAgXCJ0aXRsZVwiLCBcInRyXCIsIFwidHJhY2tcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJcIiwgXCJ2aWRlb1wiLCBcIndiclwiXG5dO1xuY29uc3QgZWxlbWVudFByb3R5cGUgPSB7XG4gICAgZ2V0IGlkcygpIHtcbiAgICAgICAgcmV0dXJuIGdldEVsZW1lbnRJZE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIHNldCBpZHModikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgaWRzIG9uICcgKyB0aGlzLnZhbHVlT2YoKSk7XG4gICAgfSxcbiAgICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KTtcbiAgICB9XG59O1xuY29uc3QgcG9TdHlsZUVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbnBvU3R5bGVFbHQuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuZnVuY3Rpb24gaXNDaGlsZFRhZyh4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcidcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgICAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICAgICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgICAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgICAgIHx8IHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG4vKiB0YWcgKi9cbmNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgY29uc3QgdGFnID0gZnVuY3Rpb24gKF8xLCBfMiwgXzMpIHtcbiAgICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgICB0YWcocHJvdG90eXBlcykgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICAgIHRhZyh0YWdzW10sIHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIHByb3RvdHlwZXMpICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICAgKi9cbiAgICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBwcm90b3R5cGVzXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgICAgICA/IFtfMSwgXzIsIF8zXVxuICAgICAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICAgICAgICA/IFtudWxsLCBfMSwgXzJdXG4gICAgICAgICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xXTtcbiAgICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgICBhcmUgbm90IGV2YWx1YXRlZCB1bnRpbCBjYWxsZWQgKi9cbiAgICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShudWxsLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhlbGVtZW50UHJvdHlwZSkpO1xuICAgIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gICAgLy8gdG8gY29weSBhIGdldHRlci9zZXR0ZXIgcGFpciBmcm9tIGFub3RoZXIgb2JqZWN0XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQoYSkge1xuICAgICAgICAgICAgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAocHJvdG90eXBlcylcbiAgICAgICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBwcm90b3R5cGVzKTtcbiAgICBmdW5jdGlvbiBub2RlcyguLi5jKSB7XG4gICAgICAgIGNvbnN0IGFwcGVuZGVkID0gW107XG4gICAgICAgIChmdW5jdGlvbiBjaGlsZHJlbihjKSB7XG4gICAgICAgICAgICBpZiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZ1swXSk7XG4gICAgICAgICAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbm9kZXMocik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudEVsZW1lbnQsIG9sZFswXSkobik7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGcgPSBuO1xuICAgICAgICAgICAgICAgIH0sIHggPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oeCk7XG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGdbMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiB4IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihjKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhYmxlKGMpID8gY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGM7XG4gICAgICAgICAgICAgICAgY29uc3QgZHBtID0gRG9tUHJvbWlzZUNvbnRhaW5lcigpO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZHBtKTtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IFtkcG1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSAoQXJyYXkuaXNBcnJheSh0KSA/IHQgOiBbdF0pLmZpbHRlcihuID0+IEJvb2xlYW4obikpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoblswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuLmZvckVhY2goZSA9PiBlLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gKEFycmF5LmlzQXJyYXkodCkgPyB0IDogW3RdKS5maWx0ZXIoZSA9PiBlLm93bmVyRG9jdW1lbnQ/LmJvZHkuY29udGFpbnMoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCB8fCAhblswXS5wYXJlbnROb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQocykgbm8gbG9uZ2VyIGV4aXN0IGluIGRvY3VtZW50XCIgKyBpbnNlcnRpb25TdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKSh1bmJveChlcy52YWx1ZSkgPz8gRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+IGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgYz8uW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4oZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgfSkoYyk7XG4gICAgICAgIHJldHVybiBhcHBlbmRlZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXBwZW5kZXIoY29udGFpbmVyLCBiZWZvcmUpIHtcbiAgICAgICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzKGMpO1xuICAgICAgICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICAgICAgICAgIC8vIFwiYmVmb3JlXCIsIGJlaW5nIGEgbm9kZSwgY291bGQgYmUgI3RleHQgbm9kZVxuICAgICAgICAgICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmJlZm9yZS5jYWxsKGJlZm9yZSwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgYSB0ZXh0IG5vZGUgLSB3b3JrIGJhY2t3YXJkcyBhbmQgaW5zZXJ0ICphZnRlciogdGhlIHByZWNlZWRpbmcgRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBiZWZvcmUucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDb250YWluZXIgbWlzbWF0Y2g/P1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZHJlbltpXSwgYmVmb3JlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmQuY2FsbChjb250YWluZXIsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICAgICAgdGFnLmFwcGVuZGVyID0gYXBwZW5kZXI7IC8vIExlZ2FjeSBSVEEgc3VwcG9ydFxuICAgICAgICB0YWcubm9kZXMgPSBub2RlczsgLy8gUHJlZmVycmVkIGludGVyZmFjZVxuICAgIH1cbiAgICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gICAgZnVuY3Rpb24gZGVlcERlZmluZShkLCBzKSB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHByb3BlcnR5IGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVuYm94KGEpIHtcbiAgICAgICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2Lm1hcCh1bmJveCkgOiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlLCBwcm9wcykge1xuICAgICAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgICAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gYXNzaWduKGQsIHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmFzZS5vd25lckRvY3VtZW50LmNvbnRhaW5zKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jLiBUZWxsIHRoZSBzb3VyY2UgYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHN0b3Agc2VuZGluZyB1cyBzdHVmZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBubyBsb25nZXIgZXhpc3RzIGluIGRvY3VtZW50ICh1cGRhdGUgXCIgKyBrICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihcIkVsZW1lbnQgbm8gbG9uZ2VyIGV4aXN0cyBpbiBkb2N1bWVudCAodXBkYXRlIFwiICsgayArIFwiKVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNyYyBpcyBub3QgYW4gb2JqZWN0IChvciBpcyBudWxsKSAtIGp1c3QgYXNzaWduIGl0LCB1bmxlc3MgaXQncyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoYmFzZSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLypcbiAgICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgICAgLi4ub3IuLi5cbiAgICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICAgKi9cbiAgICBmdW5jdGlvbiBleHRlbmRlZChfb3ZlcnJpZGVzKSB7XG4gICAgICAgIGNvbnN0IG92ZXJyaWRlcyA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgID8gKGluc3RhbmNlKSA9PiBfb3ZlcnJpZGVzXG4gICAgICAgICAgICA6IF9vdmVycmlkZXM7XG4gICAgICAgIGNvbnN0IHN0YXRpY0luc3RhbmNlID0ge307XG4gICAgICAgIGxldCBzdGF0aWNFeHRlbnNpb25zID0gb3ZlcnJpZGVzKHN0YXRpY0luc3RhbmNlKTtcbiAgICAgICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICAgICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICAgICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgICAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgICAgICBjb25zdCBleHRlbmRUYWdGbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NhbGxTdGFjayA9IFtdO1xuICAgICAgICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH07XG4gICAgICAgICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgICAgICAgIGNvbnN0IHBlZCA9IHt9O1xuICAgICAgICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IG92ZXJyaWRlcyhwZWQpO1xuICAgICAgICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ucHJvdG90eXBlKTtcbiAgICAgICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24uZGVjbGFyZSk7XG4gICAgICAgICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlW2tdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXSA9PT0gbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGJhc2U/LmNvbnN0cnVjdGVkPy5jYWxsKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAgICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGVcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuaXRlcmFibGUgJiYgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBrID0+IGVba10gPSBlW2tdLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV4dGVuZFRhZyA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgICAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgICAgICAgb3ZlcnJpZGVzLFxuICAgICAgICAgICAgZXh0ZW5kZWQsXG4gICAgICAgICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUgfHwge30pIC8qLCAuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLnByb3RvdHlwZSB8fCB7fSkqL107XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2V4dGVuZFRhZy5uYW1lfTogeyR7a2V5cy5qb2luKCcsICcpfX1cXG4gXFx1MjFBQSAke3RoaXMudmFsdWVPZigpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBmdWxsUHJvdG8gPSB7fTtcbiAgICAgICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yKSB7XG4gICAgICAgICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgICAgICAgICAgd2Fsa1Byb3RvKGNyZWF0b3Iuc3VwZXIpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLm92ZXJyaWRlcz8uKHN0YXRpY0luc3RhbmNlKTtcbiAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSh0aGlzKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMucHJvdG90eXBlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICAgICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgICAgICAgIDogJz8nO1xuICAgICAgICBjb25zdCBjYWxsU2l0ZSA9IERFQlVHID8gJyBAJyArIChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdPy5tYXRjaCgvXFwoKC4qKVxcKS8pPy5bMV0gPz8gJz8nKSA6ICcnO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCAnLScpICsgY2FsbFNpdGUgKyBcIj5cIlxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgICB9XG4gICAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzID0ge307XG4gICAgZnVuY3Rpb24gY3JlYXRlVGFnKGspIHtcbiAgICAgICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG4gICAgICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQ7XG4gICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgICAgICAgICBhdHRycyA9IHsgcHJvdG90eXBlOiB7fSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICAgICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gbmFtZVNwYWNlXG4gICAgICAgICAgICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgYXBwZW5kZXIoZSkoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmNsdWRpbmdFeHRlbmRlciA9IE9iamVjdC5hc3NpZ24odGFnQ3JlYXRvciwge1xuICAgICAgICAgICAgc3VwZXI6ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpOyB9LFxuICAgICAgICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICAgICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmA7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gICAgfVxuICAgIHRhZ3MuZm9yRWFjaChjcmVhdGVUYWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufTtcbmNvbnN0IHsgXCJhaS11aS1jb250YWluZXJcIjogQXN5bmNET01Db250YWluZXIgfSA9IHRhZygnJywgW1wiYWktdWktY29udGFpbmVyXCJdKTtcbmNvbnN0IERvbVByb21pc2VDb250YWluZXIgPSBBc3luY0RPTUNvbnRhaW5lci5leHRlbmRlZCh7XG4gICAgc3R5bGVzOiBgXG4gIGFpLXVpLWNvbnRhaW5lci5wcm9taXNlIHtcbiAgICBkaXNwbGF5OiAke0RFQlVHID8gJ2lubGluZScgOiAnbm9uZSd9O1xuICAgIGNvbG9yOiAjODg4O1xuICAgIGZvbnQtc2l6ZTogMC43NWVtO1xuICB9XG4gIGFpLXVpLWNvbnRhaW5lci5wcm9taXNlOmFmdGVyIHtcbiAgICBjb250ZW50OiBcIuKLr1wiO1xuICB9YCxcbiAgICBvdmVycmlkZToge1xuICAgICAgICBjbGFzc05hbWU6ICdwcm9taXNlJ1xuICAgIH0sXG4gICAgY29uc3RydWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiBBc3luY0RPTUNvbnRhaW5lcih7IHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9IH0sIERFQlVHXG4gICAgICAgICAgICA/IG5ldyBFcnJvcihcIkNvbnN0cnVjdGVkXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQpO1xuICAgIH1cbn0pO1xuY29uc3QgRHlhbWljRWxlbWVudEVycm9yID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIuZXJyb3Ige1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIGNvbG9yOiAjYjMzO1xuICAgIHdoaXRlLXNwYWNlOiBwcmU7XG4gIH1gLFxuICAgIG92ZXJyaWRlOiB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2Vycm9yJ1xuICAgIH0sXG4gICAgZGVjbGFyZToge1xuICAgICAgICBlcnJvcjogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBjb25zdHJ1Y3RlZCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVycm9yKVxuICAgICAgICAgICAgcmV0dXJuIFwiRXJyb3JcIjtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3IgaW5zdGFuY2VvZiBFcnJvcilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVycm9yLnN0YWNrO1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiB0aGlzLmVycm9yICYmIHRoaXMuZXJyb3IudmFsdWUgaW5zdGFuY2VvZiBFcnJvcilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVycm9yLnZhbHVlLnN0YWNrO1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvci50b1N0cmluZygpO1xuICAgIH1cbn0pO1xuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICAgIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7IH07IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICBbLi4ucmVtb3ZlZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIiksIHJlbW92ZWRdLmZpbHRlcihlbHQgPT4gIWVsdC5vd25lckRvY3VtZW50LmNvbnRhaW5zKGVsdCkpLmZvckVhY2goZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbn07XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkTWFwKG5vZGUsIGlkcykge1xuICAgIG5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuICAgIGlkcyA9IGlkcyB8fCB7fTtcbiAgICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIikuZm9yRWFjaChmdW5jdGlvbiAoZWx0KSB7XG4gICAgICAgICAgICBpZiAoZWx0LmlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZHNbZWx0LmlkXSlcbiAgICAgICAgICAgICAgICAgICAgaWRzW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgICAgICAgICAgLy9lbHNlIGNvbnNvbGUud2FybihcIlNoYWRvd2VkIGVsZW1lbnQgSURcIixlbHQuaWQsZWx0LGlkc1tlbHQuaWRdKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==