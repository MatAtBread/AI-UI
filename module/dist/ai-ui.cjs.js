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
        promise.catch(ex => (ex instanceof Error || ex?.value instanceof Error) ? console.log('(AI-UI)', "Deferred", ex, initLocation) : undefined);
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
/* harmony export */   asyncExtras: () => (/* binding */ asyncExtras),
/* harmony export */   asyncHelperFunctions: () => (/* binding */ asyncHelperFunctions),
/* harmony export */   asyncIterator: () => (/* binding */ asyncIterator),
/* harmony export */   broadcastIterator: () => (/* binding */ broadcastIterator),
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
const Iterability = Symbol("Iterability");
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
        Object.keys(asyncHelperFunctions).forEach(k => extras[k] = {
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
    Object.keys(asyncHelperFunctions).forEach((k) => extras[k] = {
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
    let boxedObject = Ignore;
    let a = box(v, extras);
    Object.defineProperty(obj, name, {
        get() { return a; },
        set(v) {
            if (v !== a)
                a = box(v, extras);
            push(v?.valueOf());
        },
        enumerable: true
    });
    return obj;
    function box(a, pds) {
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
                            console.info('(AI-UI)', 'Iterable properties of type "object" will be spread to prevent re-initialisation.', a);
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
                        set(target, p, value, receiver) {
                            if (Reflect.set(target, p, value, receiver)) {
                                // @ts-ignore - Fix
                                obj[name] = obj[name].valueOf();
                                return true;
                            }
                            return false;
                        },
                        // Implement the logic that returns a mapped iterator for the specified field
                        get(target, p, receiver) {
                            // BROKEN: if (p === 'valueOf') return function() { return /*a / breaks nested properties */boxedObject };
                            if (Reflect.getOwnPropertyDescriptor(target, p)?.enumerable) {
                                const realValue = Reflect.get(boxedObject, p, receiver);
                                const props = Object.getOwnPropertyDescriptors(boxedObject.map(o => o[p]));
                                Reflect.ownKeys(props).forEach(k => props[k].enumerable = false);
                                // @ts-ignore - Fix
                                return box(realValue, props);
                            }
                            return Reflect.get(target, p, receiver);
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
/* A general filter & mapper that can handle exceptions & returns */
const Ignore = Symbol("Ignore");
function filterMap(source, fn, initialValue = Ignore) {
    let ai;
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
    return {
        [Symbol.asyncIterator]() {
            consumers += 1;
            return this;
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
const asyncHelperFunctions = { map, filter, unique, waitFor, multi, broadcast, initially, consume, merge };


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
/* Types for tag creation, implemented by `tag()` in ai-ui.ts */
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
    const multi = _iterators_js__WEBPACK_IMPORTED_MODULE_2__.asyncHelperFunctions.multi.call(queue);
    const details /*EventObservation<Exclude<ExtractEventNames<EventName>, keyof SpecialWhenEvents>>*/ = {
        push: queue.push,
        terminate(ex) { multi.return?.(ex); },
        container,
        selector: selector || null
    };
    containerAndSelectorsMounted(container, selector ? [selector] : undefined)
        .then(_ => eventObservations.get(eventName).add(details));
    return multi;
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
                const dpm = DomPromiseContainer();
                appended.push(dpm);
                let t = [dpm];
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
                                    if (_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG)
                                        console.log('(AI-UI)', "Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
                            if (!(0,_iterators_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncIter)(value)) {
                                // This has a real value, which might be an object
                                if (value && typeof value === 'object' && !(0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value)) {
                                    if (value instanceof Node) {
                                        if (_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG)
                                            console.log('(AI-UI)', "Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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
                        console.warn('(AI-UI)', "assignProps", k, s[k], ex);
                        throw ex;
                    }
                }
            })(base, props);
        }
    }
    function tagHasInstance(e) {
        for (let etf = this; etf; etf = etf.super) {
            if (e.constructor === etf)
                return true;
        }
        return false;
    }
    function extended(_overrides) {
        const overrides = (typeof _overrides !== 'function')
            ? (instance) => _overrides
            : _overrides;
        const uniqueTagID = 'ai-ui-' + Date.now().toString(36) + (idCount++).toString(36) + Math.random().toString(36).slice(2);
        const staticInstance = { [_tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID]: uniqueTagID };
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
            const ped = { [_tags_js__WEBPACK_IMPORTED_MODULE_3__.UniqueID]: uniqueTagID };
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
        Object.defineProperty(extendTag, Symbol.hasInstance, {
            value: tagHasInstance,
            writable: true,
            configurable: true
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
        const callSite = _debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG ? ' @' + (new Error().stack?.split('\n')[2]?.match(/\((.*)\)/)?.[1] ?? '?') : '';
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
    if (_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG && !g) {
        console.log("Failed to augment the prototype of `(async function*())()`");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1AsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLFlBQVksOERBQWU7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDRDQUFLO0FBQ2I7QUFDQTtBQUNBO0FBQ087QUFDUCw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsU0FBUztBQUNULEtBQUssMkJBQTJCLGdDQUFnQztBQUNoRTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qiw0Q0FBSztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvZGVidWcudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvZGVmZXJyZWQudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvaXRlcmF0b3JzLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL3RhZ3MudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvd2hlbi50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpLy4vc3JjL2FpLXVpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pIHx8IGZhbHNlO1xuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHYpID0+IHsgfTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZCgpIHtcbiAgICBsZXQgcmVzb2x2ZSA9IG5vdGhpbmc7XG4gICAgbGV0IHJlamVjdCA9IG5vdGhpbmc7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpO1xuICAgIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgICAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKCcoQUktVUkpJywgXCJEZWZlcnJlZFwiLCBleCwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoeCkge1xuICAgIHJldHVybiB4ICE9PSBudWxsICYmIHggIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuaW1wb3J0IHsgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcihvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZShvKSB7XG4gICAgcmV0dXJuIG8gJiYgb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyKG8pIHtcbiAgICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yKG8pIHtcbiAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKVxuICAgICAgICByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKVxuICAgICAgICByZXR1cm4gbztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG4vKiBBIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYSBcInByb3RvdHlwaWNhbFwiIEFzeW5jSXRlcmF0b3IgaGVscGVyLCB0aGF0IGhhcyBgdGhpczpBc3luY0l0ZXJhYmxlPFQ+YCBhbmQgcmV0dXJuc1xuICBzb21ldGhpbmcgdGhhdCdzIGRlcml2ZWQgZnJvbSBBc3luY0l0ZXJhYmxlPFI+LCByZXN1bHQgaW4gYSB3cmFwcGVkIGZ1bmN0aW9uIHRoYXQgYWNjZXB0c1xuICB0aGUgc2FtZSBhcmd1bWVudHMgcmV0dXJucyBhIEFzeW5jRXh0cmFJdGVyYWJsZTxYPlxuKi9cbmZ1bmN0aW9uIHdyYXBBc3luY0hlbHBlcihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykgeyByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZuLmNhbGwodGhpcywgLi4uYXJncykpOyB9O1xufVxuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICAgIG1hcDogd3JhcEFzeW5jSGVscGVyKG1hcCksXG4gICAgZmlsdGVyOiB3cmFwQXN5bmNIZWxwZXIoZmlsdGVyKSxcbiAgICB1bmlxdWU6IHdyYXBBc3luY0hlbHBlcih1bmlxdWUpLFxuICAgIHdhaXRGb3I6IHdyYXBBc3luY0hlbHBlcih3YWl0Rm9yKSxcbiAgICBtdWx0aTogd3JhcEFzeW5jSGVscGVyKG11bHRpKSxcbiAgICBicm9hZGNhc3Q6IHdyYXBBc3luY0hlbHBlcihicm9hZGNhc3QpLFxuICAgIGluaXRpYWxseTogd3JhcEFzeW5jSGVscGVyKGluaXRpYWxseSksXG4gICAgY29uc3VtZTogY29uc3VtZSxcbiAgICBtZXJnZSguLi5tKSB7XG4gICAgICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgICB9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgICBsZXQgX3BlbmRpbmcgPSBbXTtcbiAgICBsZXQgX2l0ZW1zID0gW107XG4gICAgY29uc3QgcSA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIHJldHVybiBxO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaWYgKF9pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBfaXRlbXMuc2hpZnQoKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQoKTtcbiAgICAgICAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgICAgICAgIC8vIGFuZCBxIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgICAgICAgIF9wZW5kaW5nLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICByZXR1cm4oKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIV9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfcGVuZGluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBfaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHE7XG59XG4vKiBBbiBBc3luY0l0ZXJhYmxlIHdoaWNoIHR5cGVkIG9iamVjdHMgY2FuIGJlIHB1Ymxpc2hlZCB0by5cbiAgVGhlIHF1ZXVlIGNhbiBiZSByZWFkIGJ5IG11bHRpcGxlIGNvbnN1bWVycywgd2hvIHdpbGwgZWFjaCByZWNlaXZlXG4gIHVuaXF1ZSB2YWx1ZXMgZnJvbSB0aGUgcXVldWUgKGllOiB0aGUgcXVldWUgaXMgU0hBUkVEIG5vdCBkdXBsaWNhdGVkKVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwdXNoSXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSwgYnVmZmVyV2hlbk5vQ29uc3VtZXJzID0gZmFsc2UpIHtcbiAgICBsZXQgY29uc3VtZXJzID0gMDtcbiAgICBsZXQgYWkgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiB7XG4gICAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgICBpZiAoY29uc3VtZXJzID09PSAwICYmICFidWZmZXJXaGVuTm9Db25zdW1lcnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShhc3luY0V4dHJhcyksIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgICAgICAgcmV0dXJuIGFpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWJ1ZmZlcldoZW5Ob0NvbnN1bWVycyAmJiBjb25zdW1lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBObyBvbmUgcmVhZHkgdG8gcmVhZCB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhaS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoZXgpIHtcbiAgICAgICAgICAgIGV4ID8gYWkudGhyb3c/LihleCkgOiBhaS5yZXR1cm4/LigpO1xuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qIEFuIEFzeW5jSXRlcmFibGUgd2hpY2ggdHlwZWQgb2JqZWN0cyBjYW4gYmUgcHVibGlzaGVkIHRvLlxuICBUaGUgcXVldWUgY2FuIGJlIHJlYWQgYnkgbXVsdGlwbGUgY29uc3VtZXJzLCB3aG8gd2lsbCBlYWNoIHJlY2VpdmVcbiAgYSBjb3B5IG9mIHRoZSB2YWx1ZXMgZnJvbSB0aGUgcXVldWUgKGllOiB0aGUgcXVldWUgaXMgQlJPQURDQVNUIG5vdCBzaGFyZWQpLlxuXG4gIFRoZSBpdGVyYXRvcnMgc3RvcHMgcnVubmluZyB3aGVuIHRoZSBudW1iZXIgb2YgY29uc3VtZXJzIGRlY3JlYXNlcyB0byB6ZXJvXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJyb2FkY2FzdEl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgICBsZXQgYWkgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgYiA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShhc3luY0V4dHJhcyksIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFpLmRlbGV0ZShhZGRlZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFpLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWkuYWRkKGFkZGVkKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWRkZWQpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWFpPy5zaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIHEucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoZXgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcSBvZiBhaS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIGV4ID8gcS50aHJvdz8uKGV4KSA6IHEucmV0dXJuPy4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgYWkgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGI7XG59XG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KG9iaiwgbmFtZSwgdikge1xuICAgIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gICAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gICAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gICAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICAgICAgLy8gVGhpcyAqc2hvdWxkKiB3b3JrIChhbG9uZyB3aXRoIHRoZSBtdWx0aSBjYWxsIGJlbG93LCBidXQgaXMgZGVmZWF0ZWQgYnkgdGhlIGxhenkgaW5pdGlhbGl6YXRpb24/ICYvfCB1bmJvdW5kIG1ldGhvZHM/KVxuICAgICAgICAvL2NvbnN0IGJpID0gcHVzaEl0ZXJhdG9yPFY+KCk7XG4gICAgICAgIC8vY29uc3QgYiA9IGJpLm11bHRpKClbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGNvbnN0IGJpID0gYnJvYWRjYXN0SXRlcmF0b3IoKTtcbiAgICAgICAgY29uc3QgYiA9IGJpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0geyB2YWx1ZTogYmlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IGZhbHNlIH07XG4gICAgICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgICAgICBPYmplY3Qua2V5cyhhc3luY0hlbHBlckZ1bmN0aW9ucykuZm9yRWFjaChrID0+IGV4dHJhc1trXSA9IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgIHZhbHVlOiBiW2tdLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGEsIGV4dHJhcyk7XG4gICAgICAgIHJldHVybiBiO1xuICAgIH07XG4gICAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgICBmdW5jdGlvbiBsYXp5QXN5bmNNZXRob2QobWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICByZXR1cm4gYVttZXRob2RdLmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGV4dHJhcyA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBpbml0SXRlcmF0b3JcbiAgICAgICAgfVxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoYXN5bmNIZWxwZXJGdW5jdGlvbnMpLmZvckVhY2goKGspID0+IGV4dHJhc1trXSA9IHtcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHZhbHVlOiBsYXp5QXN5bmNNZXRob2QoaylcbiAgICB9KTtcbiAgICAvLyBMYXppbHkgaW5pdGlhbGl6ZSBgcHVzaGBcbiAgICBsZXQgcHVzaCA9ICh2KSA9PiB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpOyAvLyBVcGRhdGVzIGBwdXNoYCB0byByZWZlcmVuY2UgdGhlIG11bHRpLXF1ZXVlXG4gICAgICAgIHJldHVybiBwdXNoKHYpO1xuICAgIH07XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYpIHtcbiAgICAgICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodiwgSXRlcmFiaWxpdHkpO1xuICAgIH1cbiAgICBsZXQgYm94ZWRPYmplY3QgPSBJZ25vcmU7XG4gICAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIGE7IH0sXG4gICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgICBpZiAodiAhPT0gYSlcbiAgICAgICAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgICAgICBwdXNoKHY/LnZhbHVlT2YoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICAgIGZ1bmN0aW9uIGJveChhLCBwZHMpIHtcbiAgICAgICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhOyB9LCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGE7IH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgLyogVE9ETzogVGhpcyBpcyBwcm9ibGVtYXRpYyBhcyB0aGUgb2JqZWN0IG1pZ2h0IGhhdmUgY2xhc2hpbmcga2V5cyBhbmQgbmVzdGVkIG1lbWJlcnMuXG4gICAgICAgICAgICAgICAgICBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbjpcbiAgICAgICAgICAgICAgICAgICogU3ByZWFkcyBpdGVyYWJsZSBvYmplY3RzIGluIHRvIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvYmplY3QsIGFuZCBvdmVycml0ZXMgY2xhc2hpbmcgbWVtYmVycyBsaWtlIGBtYXBgXG4gICAgICAgICAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqLm1hcChvID0+IG8uZmllbGQpO1xuICAgICAgICAgICAgICAgICAgKiBUaGUgaXRlcmF0b3Igd2lsbCB5aWVsZCBvblxuICAgICAgICAgICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iaiA9IG5ld1ZhbHVlO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICogTWVtYmVycyBhY2Nlc3MgaXMgcHJveGllZCwgc28gdGhhdDpcbiAgICAgICAgICAgICAgICAgICogICAgIChzZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGQgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICogLi4uY2F1c2VzIHRoZSB1bmRlcmx5aW5nIG9iamVjdCB0byB5aWVsZCBieSByZS1hc3NpZ25tZW50ICh0aGVyZWZvcmUgY2FsbGluZyB0aGUgc2V0dGVyKVxuICAgICAgICAgICAgICAgICAgKiBTaW1pbGFybHk6XG4gICAgICAgICAgICAgICAgICAqICAgICAoZ2V0KSB0aGlzLml0ZXJhYmxlT2JqLmZpZWxkXG4gICAgICAgICAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgaXRlcmF0b3IgZm9yIHRoZSBiYXNlIG9iamVjdCB0byBiZSBtYXBwZWQsIGxpa2VcbiAgICAgICAgICAgICAgICAgICogICAgIHRoaXMuaXRlcmFibGVPYmplY3QubWFwKG8gPT4gb1tmaWVsZF0pXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSWdub3JlIGlzIHRoZSBJTklUSUFMIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlmIChib3hlZE9iamVjdCA9PT0gSWdub3JlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgJ0l0ZXJhYmxlIHByb3BlcnRpZXMgb2YgdHlwZSBcIm9iamVjdFwiIHdpbGwgYmUgc3ByZWFkIHRvIHByZXZlbnQgcmUtaW5pdGlhbGlzYXRpb24uJywgYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHsgLi4uYSB9LCBwZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihib3hlZE9iamVjdCwgYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJveGVkT2JqZWN0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgQlJPS0VOOiBmYWlscyBuZXN0ZWQgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJveGVkT2JqZWN0LCAndmFsdWVPZicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJveGVkT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBwcm94eSB0aGUgcmVzdWx0IHNvIHdlIGNhbiB0cmFjayBtZW1iZXJzIG9mIHRoZSBpdGVyYWJsZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm94eShib3hlZE9iamVjdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGZpcmVzIHRoZSBpdGVyYXRvciBieSByZS1hc3NpZ25pbmcgdGhlIGl0ZXJhYmxlIHZpYSBpdCdzIHNldHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0KHRhcmdldCwgcCwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwgcCwgdmFsdWUsIHJlY2VpdmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialtuYW1lXSA9IG9ialtuYW1lXS52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IHJldHVybnMgYSBtYXBwZWQgaXRlcmF0b3IgZm9yIHRoZSBzcGVjaWZpZWQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQlJPS0VOOiBpZiAocCA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiAvKmEgLyBicmVha3MgbmVzdGVkIHByb3BlcnRpZXMgKi9ib3hlZE9iamVjdCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHApPy5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KGJveGVkT2JqZWN0LCBwLCByZWNlaXZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYm94ZWRPYmplY3QubWFwKG8gPT4gb1twXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWZsZWN0Lm93bktleXMocHJvcHMpLmZvckVhY2goayA9PiBwcm9wc1trXS5lbnVtZXJhYmxlID0gZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBib3gocmVhbFZhbHVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE9iamVjdChhKSwge1xuICAgICAgICAgICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEudmFsdWVPZigpOyB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBtZXJnZSA9ICguLi5haSkgPT4ge1xuICAgIGNvbnN0IGl0ID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICAgICAgaW5pdCA9ICgpID0+IHsgfTtcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgY29uc3QgYSA9IGFpW25dO1xuICAgICAgICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgICAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgICAgICAgICAgOiBhKVxuICAgICAgICAgICAgICAgIC5uZXh0KClcbiAgICAgICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gKHsgaWR4OiBuLCByZXN1bHQgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlKCgpID0+IHsgfSk7XG4gICAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuICAgIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZDsgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICAgICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzKS50aGVuKCh7IGlkeCwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBpdFtpZHhdLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0gfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAgICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpO1xufTtcbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZShpKSB7XG4gICAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICAgICAmJiBPYmplY3Qua2V5cyhhc3luY0V4dHJhcylcbiAgICAgICAgICAgIC5ldmVyeShrID0+IChrIGluIGkpICYmIGlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVycyhhaSkge1xuICAgIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGFpLCBhc3luY0V4dHJhcyk7XG4gICAgfVxuICAgIHJldHVybiBhaTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzKGcpIHtcbiAgICAvLyBAdHMtaWdub3JlOiBUUyB0eXBlIG1hZG5lc3NcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhnKC4uLmFyZ3MpKTtcbiAgICB9O1xufVxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwKHNvdXJjZSwgZm4sIGluaXRpYWxWYWx1ZSA9IElnbm9yZSkge1xuICAgIGxldCBhaTtcbiAgICBsZXQgcHJldiA9IElnbm9yZTtcbiAgICByZXR1cm4ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZShpbml0aWFsVmFsdWUpLnRoZW4odmFsdWUgPT4gKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgICAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4ocCA9PiBwLmRvbmVcbiAgICAgICAgICAgICAgICAgICAgPyByZXNvbHZlKHApXG4gICAgICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKGZuKHAudmFsdWUsIHByZXYpKS50aGVuKGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSwgZXggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7IC8vIFRlcm1pbmF0ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgICAgICAgfSksIGV4ID0+IFxuICAgICAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgICAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybih2KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBtYXAobWFwcGVyKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuZnVuY3Rpb24gZmlsdGVyKGZuKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyAobykgPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuZnVuY3Rpb24gdW5pcXVlKGZuKSB7XG4gICAgcmV0dXJuIGZuXG4gICAgICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5mdW5jdGlvbiBpbml0aWFsbHkoaW5pdFZhbHVlKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5mdW5jdGlvbiB3YWl0Rm9yKGNiKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG87IH0pKTtcbn1cbmZ1bmN0aW9uIG11bHRpKCkge1xuICAgIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gICAgbGV0IGNvbnN1bWVycyA9IDA7XG4gICAgbGV0IGN1cnJlbnQ7XG4gICAgbGV0IGFpID0gdW5kZWZpbmVkO1xuICAgIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICAgIGZ1bmN0aW9uIHN0ZXAoaXQpIHtcbiAgICAgICAgaWYgKGl0KVxuICAgICAgICAgICAgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICAgICAgaWYgKCFpdD8uZG9uZSkge1xuICAgICAgICAgICAgY3VycmVudCA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICBhaS5uZXh0KClcbiAgICAgICAgICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoIWFpKSB7XG4gICAgICAgICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KGV4KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJldHVybih2KSB7XG4gICAgICAgICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICAgICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICAgICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBicm9hZGNhc3QoKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGNvbnN0IGIgPSBicm9hZGNhc3RJdGVyYXRvcigoKSA9PiBhaS5yZXR1cm4/LigpKTtcbiAgICAoZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgYWkubmV4dCgpLnRoZW4odiA9PiB7XG4gICAgICAgICAgICBpZiAodi5kb25lKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVoIC0gd2UgdGhyb3cgdGhlc2UgYXdheSBmb3Igbm93LlxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLmJyb2FkY2FzdCBkb25lXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYi5wdXNoKHYudmFsdWUpO1xuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4gYi5jbG9zZShleCkpO1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIHJldHVybiBiW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWUoZikge1xuICAgIGxldCBsYXN0ID0gdW5kZWZpbmVkO1xuICAgIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzKVxuICAgICAgICBsYXN0ID0gZj8uKHUpO1xuICAgIGF3YWl0IGxhc3Q7XG59XG5leHBvcnQgY29uc3QgYXN5bmNIZWxwZXJGdW5jdGlvbnMgPSB7IG1hcCwgZmlsdGVyLCB1bmlxdWUsIHdhaXRGb3IsIG11bHRpLCBicm9hZGNhc3QsIGluaXRpYWxseSwgY29uc3VtZSwgbWVyZ2UgfTtcbiIsIi8qIFR5cGVzIGZvciB0YWcgY3JlYXRpb24sIGltcGxlbWVudGVkIGJ5IGB0YWcoKWAgaW4gYWktdWkudHMgKi9cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIGFzeW5jRXh0cmFzLCBtZXJnZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IsIGFzeW5jSGVscGVyRnVuY3Rpb25zIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcihldikge1xuICAgIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlKTtcbiAgICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lciwgc2VsZWN0b3IgfSA9IG87XG4gICAgICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lci5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IG4gfHwgbi5jb250YWlucyhldi50YXJnZXQpKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCAnZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMF0sIFwiY2hhbmdlXCJdO1xuICAgICAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF1dO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuZnVuY3Rpb24gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdCkge1xuICAgIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIgKyB3aGF0KTtcbiAgICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhldmVudE5hbWUpKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICAgIH1cbiAgICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuICAgIGNvbnN0IG11bHRpID0gYXN5bmNIZWxwZXJGdW5jdGlvbnMubXVsdGkuY2FsbChxdWV1ZSk7XG4gICAgY29uc3QgZGV0YWlscyAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgICAgIHRlcm1pbmF0ZShleCkgeyBtdWx0aS5yZXR1cm4/LihleCk7IH0sXG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yIHx8IG51bGxcbiAgICB9O1xuICAgIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgICAgIC50aGVuKF8gPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSkuYWRkKGRldGFpbHMpKTtcbiAgICByZXR1cm4gbXVsdGk7XG59XG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbigpIHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIHlpZWxkIHVuZGVmaW5lZDsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYyhzcmMpIHtcbiAgICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBhc3luY0V4dHJhcy5tYXAuY2FsbChzcmMsIG1hcHBlcik7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgaWYgKCF3aGF0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlKHApIHtcbiAgICB5aWVsZCBwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW4oY29udGFpbmVyLCAuLi5zb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKTtcbiAgICB9XG4gICAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgICAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICAgICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgICAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgICAgICAgICAgOiB3aGF0KTtcbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGVybWluYXRlIG9uIHRoZSBuZXh0IGNhbGwgdG8gYG5leHQoKWBcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFlpZWxkIGEgXCJzdGFydFwiIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICAgIH1cbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcbiAgICAgICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbCkge1xuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcbiAgICAgICAgY29uc3QgYWkgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWk7IH0sXG4gICAgICAgICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBtaXNzaW5nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgICAgICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYWkubmV4dCA9IGV2ZW50cy5uZXh0LmJpbmQoZXZlbnRzKTsgLy8oKSA9PiBldmVudHMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBhaS5yZXR1cm4gPSBldmVudHMucmV0dXJuPy5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2hhaW5Bc3luYyhhaSk7XG4gICAgfVxuICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW4oKSk7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMobWVyZ2VkKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdCkge1xuICAgIGlmIChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGVsdCkpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSkge1xuICAgICAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xufVxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9ycykge1xuICAgIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgICAgICBdKTtcbiAgICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBtaXNzaW5nKSB7XG4gICAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICAgIH1cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcbiAgICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICAgIGlmIChERUJVRykge1xuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBcIk1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyIDUgc2Vjb25kczpcIik7XG4gICAgICAgIGNvbnN0IHdhcm4gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FybikpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhYmxlLCBpc0FzeW5jSXRlcmF0b3IsIGl0ZXJhYmxlSGVscGVycyB9IGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmltcG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgVW5pcXVlSUQgfSBmcm9tICcuL3RhZ3MuanMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2RlYnVnLmpzJztcbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmxldCBpZENvdW50ID0gMDtcbmNvbnN0IHN0YW5kYW5kVGFncyA9IFtcbiAgICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICAgIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgICBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImVtYmVkXCIsIFwiZmllbGRzZXRcIiwgXCJmaWdjYXB0aW9uXCIsIFwiZmlndXJlXCIsIFwiZm9vdGVyXCIsIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIixcbiAgICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICAgIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICAgIFwicHJvZ3Jlc3NcIiwgXCJxXCIsIFwicnBcIiwgXCJydFwiLCBcInJ1YnlcIiwgXCJzXCIsIFwic2FtcFwiLCBcInNjcmlwdFwiLCBcInNlYXJjaFwiLCBcInNlY3Rpb25cIiwgXCJzZWxlY3RcIiwgXCJzbG90XCIsIFwic21hbGxcIiwgXCJzb3VyY2VcIiwgXCJzcGFuXCIsXG4gICAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICAgIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXTtcbmNvbnN0IGVsZW1lbnRQcm90eXBlID0ge1xuICAgIGdldCBpZHMoKSB7XG4gICAgICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gICAgfSxcbiAgICBzZXQgaWRzKHYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICAgIH0sXG4gICAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdCk7XG4gICAgfVxufTtcbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgICAgIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgICAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAgICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICAgICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgICAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgICAgICB8fCB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IGNvbnN0IHRhZyA9IGZ1bmN0aW9uIChfMSwgXzIsIF8zKSB7XG4gICAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgICAgdGFnKHByb3RvdHlwZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgICB0YWcodGFnc1tdLCBwcm90b3R5cGVzKSAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLCBwcm90b3R5cGVzKSAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAgICovXG4gICAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgcHJvdG90eXBlc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICAgICAgPyBbXzEsIF8yLCBfM11cbiAgICAgICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgICAgICAgPyBbbnVsbCwgXzEsIF8yXVxuICAgICAgICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMV07XG4gICAgLyogTm90ZTogd2UgdXNlIHByb3BlcnR5IGRlZmludGlvbiAoYW5kIG5vdCBvYmplY3Qgc3ByZWFkKSBzbyBnZXR0ZXJzIChsaWtlIGBpZHNgKVxuICAgICAgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgY2FsbGVkICovXG4gICAgY29uc3QgdGFnUHJvdG90eXBlcyA9IE9iamVjdC5jcmVhdGUobnVsbCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZWxlbWVudFByb3R5cGUpKTtcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAgIC8vIHRvIGNvcHkgYSBnZXR0ZXIvc2V0dGVyIHBhaXIgZnJvbSBhbm90aGVyIG9iamVjdFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdQcm90b3R5cGVzLCAnYXR0cmlidXRlcycsIHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KGEpIHtcbiAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFpID0gaXNBc3luY0l0ZXJhdG9yKGEpID8gYSA6IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICgpID0+IGFpLm5leHQoKS50aGVuKCh7IGRvbmUsIHZhbHVlIH0pID0+IHsgYXNzaWduUHJvcHModGhpcywgdmFsdWUpOyBkb25lIHx8IHN0ZXAoKTsgfSwgZXggPT4gY29uc29sZS53YXJuKFwiKEFJLVVJKVwiLCBleCkpO1xuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChwcm90b3R5cGVzKVxuICAgICAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIHByb3RvdHlwZXMpO1xuICAgIGZ1bmN0aW9uIG5vZGVzKC4uLmMpIHtcbiAgICAgICAgY29uc3QgYXBwZW5kZWQgPSBbXTtcbiAgICAgICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGMpIHtcbiAgICAgICAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZ1swXSk7XG4gICAgICAgICAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gbm9kZXMocik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudEVsZW1lbnQsIG9sZFswXSkobik7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGcgPSBuO1xuICAgICAgICAgICAgICAgIH0sICh4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHgpO1xuICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihnWzBdKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogeCB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChjKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGlzQXN5bmNJdGVyYWJsZShjKSA/IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgOiBjO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRwbSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGRwbSk7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBbZHBtXTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5vd25lckRvY3VtZW50Py5ib2R5LmNvbnRhaW5zKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQocykgbm8gbG9uZ2VyIGV4aXN0IGluIGRvY3VtZW50XCIgKyBpbnNlcnRpb25TdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUsIG5bMF0pKHVuYm94KGVzLnZhbHVlKSA/PyBEb21Qcm9taXNlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgd2VudCB3cm9uZy4gVGVybWluYXRlIHRoZSBpdGVyYXRvciBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgYz8uW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4oZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgfSkoYyk7XG4gICAgICAgIHJldHVybiBhcHBlbmRlZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXBwZW5kZXIoY29udGFpbmVyLCBiZWZvcmUpIHtcbiAgICAgICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzKGMpO1xuICAgICAgICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICAgICAgICAgIC8vIFwiYmVmb3JlXCIsIGJlaW5nIGEgbm9kZSwgY291bGQgYmUgI3RleHQgbm9kZVxuICAgICAgICAgICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmJlZm9yZS5jYWxsKGJlZm9yZSwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgYSB0ZXh0IG5vZGUgLSB3b3JrIGJhY2t3YXJkcyBhbmQgaW5zZXJ0ICphZnRlciogdGhlIHByZWNlZWRpbmcgRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBiZWZvcmUucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkludGVybmFsIGVycm9yIC0gY29udGFpbmVyIG1pc21hdGNoXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkcmVuW2ldLCBiZWZvcmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZC5jYWxsKGNvbnRhaW5lciwgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoIW5hbWVTcGFjZSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgICAgICAgYXBwZW5kZXIsIC8vIExlZ2FjeSBSVEEgc3VwcG9ydFxuICAgICAgICAgICAgbm9kZXMsIC8vIFByZWZlcnJlZCBpbnRlcmZhY2UgaW5zdGVhZCBvZiBgYXBwZW5kZXJgXG4gICAgICAgICAgICBVbmlxdWVJRCxcbiAgICAgICAgICAgIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQsIHMpIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgcHJvcGVydHkgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyhBSS1VSSknLCBcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVuYm94KGEpIHtcbiAgICAgICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2Lm1hcCh1bmJveCkgOiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlLCBwcm9wcykge1xuICAgICAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgICAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gYXNzaWduKGQsIHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmFzZS5vd25lckRvY3VtZW50LmNvbnRhaW5zKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jLiBUZWxsIHRoZSBzb3VyY2UgYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHN0b3Agc2VuZGluZyB1cyBzdHVmZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihcIkVsZW1lbnQgbm8gbG9uZ2VyIGV4aXN0cyBpbiBkb2N1bWVudCAodXBkYXRlIFwiICsgay50b1N0cmluZygpICsgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGJhc2UpKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyhBSS1VSSknLCBcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZShlKSB7XG4gICAgICAgIGZvciAobGV0IGV0ZiA9IHRoaXM7IGV0ZjsgZXRmID0gZXRmLnN1cGVyKSB7XG4gICAgICAgICAgICBpZiAoZS5jb25zdHJ1Y3RvciA9PT0gZXRmKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kZWQoX292ZXJyaWRlcykge1xuICAgICAgICBjb25zdCBvdmVycmlkZXMgPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICA/IChpbnN0YW5jZSkgPT4gX292ZXJyaWRlc1xuICAgICAgICAgICAgOiBfb3ZlcnJpZGVzO1xuICAgICAgICBjb25zdCB1bmlxdWVUYWdJRCA9ICdhaS11aS0nICsgRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICAgICAgY29uc3Qgc3RhdGljSW5zdGFuY2UgPSB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH07XG4gICAgICAgIGxldCBzdGF0aWNFeHRlbnNpb25zID0gb3ZlcnJpZGVzKHN0YXRpY0luc3RhbmNlKTtcbiAgICAgICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICAgICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICAgICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgICAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgICAgICBjb25zdCBleHRlbmRUYWdGbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NhbGxTdGFjayA9IFtdO1xuICAgICAgICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH07XG4gICAgICAgICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgICAgICAgIGNvbnN0IHBlZCA9IHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfTtcbiAgICAgICAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBvdmVycmlkZXMocGVkKTtcbiAgICAgICAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLnByb3RvdHlwZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpO1xuICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUpO1xuICAgICAgICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZVtrXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgIGlmICghbm9BdHRycylcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihlKShjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKGJhc2UuaXRlcmFibGUpLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgayA9PiBlW2tdID0gZVtrXS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBleHRlbmRUYWcgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICAgICAgICBzdXBlcjogdGhpcyxcbiAgICAgICAgICAgIG92ZXJyaWRlcyxcbiAgICAgICAgICAgIGV4dGVuZGVkLFxuICAgICAgICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSAvKiwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5wcm90b3R5cGUgfHwge30pKi9dO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcikge1xuICAgICAgICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICAgICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5vdmVycmlkZXM/LihzdGF0aWNJbnN0YW5jZSk7XG4gICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkodGhpcyk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLnByb3RvdHlwZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG4gICAgICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAgICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICAgICAgICA6ICc/JztcbiAgICAgICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/ICcgQCcgKyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXT8ubWF0Y2goL1xcKCguKilcXCkvKT8uWzFdID8/ICc/JykgOiAnJztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleHRlbmRUYWc7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VUYWdDcmVhdG9ycyA9IHt9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrKSB7XG4gICAgICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuICAgICAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgICAgICAgICAgYXR0cnMgPSB7IHByb3RvdHlwZToge30gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgICAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgICAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgICAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG4gICAgICAgICAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSBPYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgICAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKTsgfSxcbiAgICAgICAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICAgIH1cbiAgICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn07XG5jb25zdCB7IFwiYWktdWktY29udGFpbmVyXCI6IEFzeW5jRE9NQ29udGFpbmVyIH0gPSB0YWcoJycsIFtcImFpLXVpLWNvbnRhaW5lclwiXSk7XG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIucHJvbWlzZSB7XG4gICAgZGlzcGxheTogJHtERUJVRyA/ICdpbmxpbmUnIDogJ25vbmUnfTtcbiAgICBjb2xvcjogIzg4ODtcbiAgICBmb250LXNpemU6IDAuNzVlbTtcbiAgfVxuICBhaS11aS1jb250YWluZXIucHJvbWlzZTphZnRlciB7XG4gICAgY29udGVudDogXCLii69cIjtcbiAgfWAsXG4gICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgY2xhc3NOYW1lOiAncHJvbWlzZSdcbiAgICB9LFxuICAgIGNvbnN0cnVjdGVkKCkge1xuICAgICAgICByZXR1cm4gQXN5bmNET01Db250YWluZXIoeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSB9LCBERUJVR1xuICAgICAgICAgICAgPyBuZXcgRXJyb3IoXCJDb25zdHJ1Y3RlZFwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKTtcbiAgICB9XG59KTtcbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9IEFzeW5jRE9NQ29udGFpbmVyLmV4dGVuZGVkKHtcbiAgICBzdHlsZXM6IGBcbiAgYWktdWktY29udGFpbmVyLmVycm9yIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBjb2xvcjogI2IzMztcbiAgICB3aGl0ZS1zcGFjZTogcHJlO1xuICB9YCxcbiAgICBvdmVycmlkZToge1xuICAgICAgICBjbGFzc05hbWU6ICdlcnJvcidcbiAgICB9LFxuICAgIGRlY2xhcmU6IHtcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgY29uc3RydWN0ZWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5lcnJvcilcbiAgICAgICAgICAgIHJldHVybiBcIkVycm9yXCI7XG4gICAgICAgIGlmICh0aGlzLmVycm9yIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci5zdGFjaztcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gdGhpcy5lcnJvciAmJiB0aGlzLmVycm9yLnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvci52YWx1ZS5zdGFjaztcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IudG9TdHJpbmcoKTtcbiAgICB9XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICAgIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gICAgd2hpbGUgKGcpIHtcbiAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgICB9XG4gICAgaWYgKERFQlVHICYmICFnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgICB9XG59XG5leHBvcnQgbGV0IGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7XG4gICAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHsgfTsgLy8gT25seSBjcmVhdGUgdGhlIG9ic2VydmVyIG9uY2VcbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICAgICAgICAgIG0ucmVtb3ZlZE5vZGVzLmZvckVhY2gocmVtb3ZlZCA9PiByZW1vdmVkICYmIHJlbW92ZWQgaW5zdGFuY2VvZiBFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0Lm93bmVyRG9jdW1lbnQuY29udGFpbnMoZWx0KSkuZm9yRWFjaChlbHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ29uUmVtb3ZlZEZyb21ET00nIGluIGVsdCAmJiB0eXBlb2YgZWx0Lm9uUmVtb3ZlZEZyb21ET00gPT09ICdmdW5jdGlvbicgJiYgZWx0Lm9uUmVtb3ZlZEZyb21ET00oKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xufTtcbmNvbnN0IHdhcm5lZCA9IG5ldyBTZXQoKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50SWRNYXAobm9kZSwgaWRzKSB7XG4gICAgbm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG4gICAgaWRzID0gaWRzIHx8IHt9O1xuICAgIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbHQpIHtcbiAgICAgICAgICAgIGlmIChlbHQuaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkc1tlbHQuaWRdKVxuICAgICAgICAgICAgICAgICAgICBpZHNbZWx0LmlkXSA9IGVsdDtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMoZWx0LmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChlbHQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQsIGVsdCwgaWRzW2VsdC5pZF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==