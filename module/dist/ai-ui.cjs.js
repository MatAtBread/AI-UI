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
                                    // @ts-ignore
                                    target[key] = undefined;
                                }
                                const realValue = Reflect.get(boxedObject, key, receiver);
                                const props = Object.getOwnPropertyDescriptors(boxedObject.map((o, p) => {
                                    const ov = o?.[key]?.valueOf();
                                    const pv = p?.valueOf();
                                    if (typeof ov === typeof pv && ov == pv)
                                        return Ignore;
                                    return o?.[key];
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
    return iterableHelpers({
        [Symbol.asyncIterator]() {
            return b[Symbol.asyncIterator]();
        }
    });
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
    // @ts-ignore
    const multi = queue.multi();
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
        // @ts-ignore
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
        // @ts-ignore
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
                            if ((0,_deferred_js__WEBPACK_IMPORTED_MODULE_0__.isPromiseLike)(value)) {
                                value.then(value => {
                                    if (value && typeof value === 'object') {
                                        assignObject(value, k);
                                    }
                                    else {
                                        if (s[k] !== undefined)
                                            d[k] = s[k];
                                    }
                                }, error => console.log('(AI-UI)', "Failed to set attribute", error));
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
                function assignObject(value, k) {
                    {
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
                }
            })(base, props);
        }
    }
    ;
    function tagHasInstance(e) {
        for (let etf = this; etf; etf = etf.super) {
            if (e.constructor === etf)
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
                    if (_debug_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG)
                        console.log('(AI-UI)', `Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
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
                    // @ts-ignore
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
        console.log('(AI-UI)', "Failed to augment the prototype of `(async function*())()`");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YXRicmVhZC9haS11aS8uL3NyYy9kZWJ1Zy50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS8uL3NyYy9kZWZlcnJlZC50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS8uL3NyYy9pdGVyYXRvcnMudHMiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvdGFncy50cyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS8uL3NyYy93aGVuLnRzIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AbWF0YXRicmVhZC9haS11aS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BtYXRhdGJyZWFkL2FpLXVpL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQG1hdGF0YnJlYWQvYWktdWkvLi9zcmMvYWktdWkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodikgPT4geyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkKCkge1xuICAgIGxldCByZXNvbHZlID0gbm90aGluZztcbiAgICBsZXQgcmVqZWN0ID0gbm90aGluZztcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcik7XG4gICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coJyhBSS1VSSknLCBcIkRlZmVycmVkXCIsIGV4LCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlTGlrZSh4KSB7XG4gICAgcmV0dXJuIHggIT09IG51bGwgJiYgeCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5pbXBvcnQgeyBkZWZlcnJlZCB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCI7XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yKG8pIHtcbiAgICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlKG8pIHtcbiAgICByZXR1cm4gbyAmJiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXIobykge1xuICAgIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3Iobykge1xuICAgIGlmIChpc0FzeW5jSXRlcmFibGUobykpXG4gICAgICAgIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGlmIChpc0FzeW5jSXRlcmF0b3IobykpXG4gICAgICAgIHJldHVybiBvO1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBhcyBhc3luYyBwcm92aWRlclwiKTtcbn1cbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgICBtYXAsXG4gICAgZmlsdGVyLFxuICAgIHVuaXF1ZSxcbiAgICB3YWl0Rm9yLFxuICAgIG11bHRpLFxuICAgIGJyb2FkY2FzdCxcbiAgICBpbml0aWFsbHksXG4gICAgY29uc3VtZSxcbiAgICBtZXJnZSguLi5tKSB7XG4gICAgICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgICB9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgICBsZXQgX3BlbmRpbmcgPSBbXTtcbiAgICBsZXQgX2l0ZW1zID0gW107XG4gICAgY29uc3QgcSA9IHtcbiAgICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgIHJldHVybiBxO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaWYgKF9pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBfaXRlbXMuc2hpZnQoKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQoKTtcbiAgICAgICAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgICAgICAgIC8vIGFuZCBxIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgICAgICAgIF9wZW5kaW5nLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICByZXR1cm4oKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlLCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIV9wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfcGVuZGluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBfaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cbi8qIEFuIEFzeW5jSXRlcmFibGUgd2hpY2ggdHlwZWQgb2JqZWN0cyBjYW4gYmUgcHVibGlzaGVkIHRvLlxuICBUaGUgcXVldWUgY2FuIGJlIHJlYWQgYnkgbXVsdGlwbGUgY29uc3VtZXJzLCB3aG8gd2lsbCBlYWNoIHJlY2VpdmVcbiAgdW5pcXVlIHZhbHVlcyBmcm9tIHRoZSBxdWV1ZSAoaWU6IHRoZSBxdWV1ZSBpcyBTSEFSRUQgbm90IGR1cGxpY2F0ZWQpXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHB1c2hJdGVyYXRvcihzdG9wID0gKCkgPT4geyB9LCBidWZmZXJXaGVuTm9Db25zdW1lcnMgPSBmYWxzZSkge1xuICAgIGxldCBjb25zdW1lcnMgPSAwO1xuICAgIGxldCBhaSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKCgpID0+IHtcbiAgICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICAgIGlmIChjb25zdW1lcnMgPT09IDAgJiYgIWJ1ZmZlcldoZW5Ob0NvbnN1bWVycykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHsgfVxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGFzeW5jRXh0cmFzKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gYWk7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghYnVmZmVyV2hlbk5vQ29uc3VtZXJzICYmIGNvbnN1bWVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIG9uZSByZWFkeSB0byByZWFkIHRoZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFpLnB1c2godmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZShleCkge1xuICAgICAgICAgICAgZXggPyBhaS50aHJvdz8uKGV4KSA6IGFpLnJldHVybj8uKCk7XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSByZWZlcmVuY2VkIGFnYWluLCBidXQgaWYgaXQgaXMsIGl0IHdpbGwgdGhyb3dcbiAgICAgICAgICAgIGFpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyogQW4gQXN5bmNJdGVyYWJsZSB3aGljaCB0eXBlZCBvYmplY3RzIGNhbiBiZSBwdWJsaXNoZWQgdG8uXG4gIFRoZSBxdWV1ZSBjYW4gYmUgcmVhZCBieSBtdWx0aXBsZSBjb25zdW1lcnMsIHdobyB3aWxsIGVhY2ggcmVjZWl2ZVxuICBhIGNvcHkgb2YgdGhlIHZhbHVlcyBmcm9tIHRoZSBxdWV1ZSAoaWU6IHRoZSBxdWV1ZSBpcyBCUk9BRENBU1Qgbm90IHNoYXJlZCkuXG5cbiAgVGhlIGl0ZXJhdG9ycyBzdG9wcyBydW5uaW5nIHdoZW4gdGhlIG51bWJlciBvZiBjb25zdW1lcnMgZGVjcmVhc2VzIHRvIHplcm9cbiovXG5leHBvcnQgZnVuY3Rpb24gYnJvYWRjYXN0SXRlcmF0b3Ioc3RvcCA9ICgpID0+IHsgfSkge1xuICAgIGxldCBhaSA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBiID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGFzeW5jRXh0cmFzKSwge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3QgYWRkZWQgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWkuZGVsZXRlKGFkZGVkKTtcbiAgICAgICAgICAgICAgICBpZiAoYWkuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIHJlZmVyZW5jZWQgYWdhaW4sIGJ1dCBpZiBpdCBpcywgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhaS5hZGQoYWRkZWQpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhZGRlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2godmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghYWk/LnNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBxIG9mIGFpLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgcS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZShleCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBxIG9mIGFpLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgZXggPyBxLnRocm93Py4oZXgpIDogcS5yZXR1cm4/LigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgYmUgcmVmZXJlbmNlZCBhZ2FpbiwgYnV0IGlmIGl0IGlzLCBpdCB3aWxsIHRocm93XG4gICAgICAgICAgICBhaSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYjtcbn1cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkob2JqLCBuYW1lLCB2KSB7XG4gICAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgICAvLyBhY2Nlc3MgdGhlIGl0ZXJhdG9yIG1ldGhvZHMgdG8gcHJldmVudCBsZWFrcyB3aGVyZSBhbiBpdGVyYWJsZSBpcyBjcmVhdGVkLCBidXRcbiAgICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgICAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgICAgICAvLyBUaGlzICpzaG91bGQqIHdvcmsgKGFsb25nIHdpdGggdGhlIG11bHRpIGNhbGwgYmVsb3csIGJ1dCBpcyBkZWZlYXRlZCBieSB0aGUgbGF6eSBpbml0aWFsaXphdGlvbj8gJi98IHVuYm91bmQgbWV0aG9kcz8pXG4gICAgICAgIC8vY29uc3QgYmkgPSBwdXNoSXRlcmF0b3I8Vj4oKTtcbiAgICAgICAgLy9jb25zdCBiID0gYmkubXVsdGkoKVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3QgYmkgPSBicm9hZGNhc3RJdGVyYXRvcigpO1xuICAgICAgICBjb25zdCBiID0gYmlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7IHZhbHVlOiBiaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogZmFsc2UgfTtcbiAgICAgICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgICAgIE9iamVjdC5rZXlzKGFzeW5jSGVscGVyRnVuY3Rpb25zKS5mb3JFYWNoKGsgPT4gZXh0cmFzW2tdID0ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgdmFsdWU6IGJba10sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYSwgZXh0cmFzKTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgfTtcbiAgICAvLyBDcmVhdGUgc3R1YnMgdGhhdCBsYXppbHkgY3JlYXRlIHRoZSBBc3luY0V4dHJhSXRlcmFibGUgaW50ZXJmYWNlIHdoZW4gaW52b2tlZFxuICAgIGZ1bmN0aW9uIGxhenlBc3luY01ldGhvZChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgIHJldHVybiBhW21ldGhvZF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZXh0cmFzID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgICAgICB9XG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhhc3luY0hlbHBlckZ1bmN0aW9ucykuZm9yRWFjaCgoaykgPT4gZXh0cmFzW2tdID0ge1xuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH0pO1xuICAgIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICAgIGxldCBwdXNoID0gKHYpID0+IHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICAgICAgcmV0dXJuIHB1c2godik7XG4gICAgfTtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdikge1xuICAgICAgICBleHRyYXNbSXRlcmFiaWxpdHldID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2LCBJdGVyYWJpbGl0eSk7XG4gICAgfVxuICAgIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgbGV0IHBpcGVkID0gZmFsc2U7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiBhOyB9LFxuICAgICAgICBzZXQodikge1xuICAgICAgICAgICAgaWYgKHYgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBpZiAocGlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgY29uc3VtaW5nIGFub3RoZXIgaXRlcmF0b3JgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIG1ha2UgdGhpcyBsYXp5IHJlYWxseSAtIGRpZmZpY3VsdCBzaW5jZSB3ZSBkb24ndFxuICAgICAgICAgICAgICAgICAgICAvLyBrbm93IGlmIGFueW9uZSBoYXMgYWxyZWFkeSBzdGFydGVkIGNvbnN1bWluZyBpdC4gU2luY2UgYXNzaWduaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhIGJhZCBpZGVhXG4gICAgICAgICAgICAgICAgICAgIC8vIChzaW5jZSB3aGF0IGRvIHdlIGRvOiBtZXJnZT8gdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD8pLFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgb25seSB0byBhbGxvdyBPTkUgbGF6eVxuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ25tZW50IGlmIGFuZCBvbmx5IGlmIHRoaXMgaXRlcmFibGUgcHJvcGVydHkgaGFzIG5vdCBiZWVuICdnZXQnIHlldC5cbiAgICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgdGhpcyB3b3VsZCBhdCBwcmVzZW50IHBvc3NpYmx5IGJyZWFrIHRoZSBpbml0aWFsaXNhdGlvbiBvZiBpdGVyYWJsZVxuICAgICAgICAgICAgICAgICAgICAvLyBwcm9wZXJ0aWVzIGFzIHRoZSBhcmUgaW5pdGlhbGl6ZWQgYnkgYXV0by1hc3NpZ25tZW50LCBpZiBpdCB3ZXJlIGluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIHBpcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdW1lLmNhbGwodiwgdiA9PiB7IHB1c2godj8udmFsdWVPZigpKTsgfSkuZmluYWxseSgoKSA9PiBwaXBlZCA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHY/LnZhbHVlT2YoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICAgIGZ1bmN0aW9uIGJveChhLCBwZHMpIHtcbiAgICAgICAgbGV0IGJveGVkT2JqZWN0ID0gSWdub3JlO1xuICAgICAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGE7IH0sIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYTsgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAvKiBUT0RPOiBUaGlzIGlzIHByb2JsZW1hdGljIGFzIHRoZSBvYmplY3QgbWlnaHQgaGF2ZSBjbGFzaGluZyBrZXlzIGFuZCBuZXN0ZWQgbWVtYmVycy5cbiAgICAgICAgICAgICAgICAgIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICAgICAgICAgKiBTcHJlYWRzIGl0ZXJhYmxlIG9iamVjdHMgaW4gdG8gYSBzaGFsbG93IGNvcHkgb2YgdGhlIG9yaWdpbmFsIG9iamVjdCwgYW5kIG92ZXJyaXRlcyBjbGFzaGluZyBtZW1iZXJzIGxpa2UgYG1hcGBcbiAgICAgICAgICAgICAgICAgICogICAgIHRoaXMuaXRlcmFibGVPYmoubWFwKG8gPT4gby5maWVsZCk7XG4gICAgICAgICAgICAgICAgICAqIFRoZSBpdGVyYXRvciB3aWxsIHlpZWxkIG9uXG4gICAgICAgICAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqID0gbmV3VmFsdWU7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgKiBNZW1iZXJzIGFjY2VzcyBpcyBwcm94aWVkLCBzbyB0aGF0OlxuICAgICAgICAgICAgICAgICAgKiAgICAgKHNldCkgdGhpcy5pdGVyYWJsZU9iai5maWVsZCA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIHVuZGVybHlpbmcgb2JqZWN0IHRvIHlpZWxkIGJ5IHJlLWFzc2lnbm1lbnQgKHRoZXJlZm9yZSBjYWxsaW5nIHRoZSBzZXR0ZXIpXG4gICAgICAgICAgICAgICAgICAqIFNpbWlsYXJseTpcbiAgICAgICAgICAgICAgICAgICogICAgIChnZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGRcbiAgICAgICAgICAgICAgICAgICogLi4uY2F1c2VzIHRoZSBpdGVyYXRvciBmb3IgdGhlIGJhc2Ugb2JqZWN0IHRvIGJlIG1hcHBlZCwgbGlrZVxuICAgICAgICAgICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iamVjdC5tYXAobyA9PiBvW2ZpZWxkXSlcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICghKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBJZ25vcmUgaXMgdGhlIElOSVRJQUwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJveGVkT2JqZWN0ID09PSBJZ25vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJyhBSS1VSSknLCBgVGhlIGl0ZXJhYmxlIHByb3BlcnR5ICcke25hbWUudG9TdHJpbmcoKX0nIG9mIHR5cGUgXCJvYmplY3RcIiB3aWxsIGJlIHNwcmVhZCB0byBwcmV2ZW50IHJlLWluaXRpYWxpc2F0aW9uLlxcbiR7bmV3IEVycm9yKCkuc3RhY2s/LnNsaWNlKDYpfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhbLi4uYV0sIHBkcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh7IC4uLmEgfSwgcGRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYm94ZWRPYmplY3QsIGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChib3hlZE9iamVjdFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEJST0tFTjogZmFpbHMgbmVzdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShib3hlZE9iamVjdCwgJ3ZhbHVlT2YnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBib3hlZE9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJveGVkT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgcHJveHkgdGhlIHJlc3VsdCBzbyB3ZSBjYW4gdHJhY2sgbWVtYmVycyBvZiB0aGUgaXRlcmFibGUgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJveHkoYm94ZWRPYmplY3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCBmaXJlcyB0aGUgaXRlcmF0b3IgYnkgcmUtYXNzaWduaW5nIHRoZSBpdGVyYWJsZSB2aWEgaXQncyBzZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChvYmpbbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCByZXR1cm5zIGEgbWFwcGVkIGl0ZXJhdG9yIGZvciB0aGUgc3BlY2lmaWVkIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gYm94ZWRPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBpbmNsdWRlIGB0YXJnZXRQcm9wID09PSB1bmRlZmluZWRgIHNvIHdlIGNhbiBuZXN0ZWQgbW9uaXRvciBwcm9wZXJ0aWVzIHRoYXQgYXJlIGFjdHVhbGx5IGRlZmluZWQgKHlldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiB0aGlzIG9ubHkgYXBwbGllcyB0byBvYmplY3QgaXRlcmFibGVzIChzaW5jZSB0aGUgcm9vdCBvbmVzIGFyZW4ndCBwcm94aWVkKSwgYnV0IGl0IGRvZXMgYWxsb3cgdXMgdG8gaGF2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlZmludGlvbnMgbGlrZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGl0ZXJhYmxlOiB7IHN0dWZmOiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgLi4uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFByb3AuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFsVmFsdWUgPSBSZWZsZWN0LmdldChib3hlZE9iamVjdCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYm94ZWRPYmplY3QubWFwKChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvdiA9IG8/LltrZXldPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwdiA9IHA/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3YgPT09IHR5cGVvZiBwdiAmJiBvdiA9PSBwdilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWdub3JlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8/LltrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlZmxlY3Qub3duS2V5cyhwcm9wcykuZm9yRWFjaChrID0+IHByb3BzW2tdLmVudW1lcmFibGUgPSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJveChyZWFsVmFsdWUsIHByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPYmplY3QoYSksIHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgICAgICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhLnZhbHVlT2YoKTsgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbWVyZ2UgPSAoLi4uYWkpID0+IHtcbiAgICBjb25zdCBpdCA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICAgIGNvbnN0IHByb21pc2VzID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gICAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgICAgIGluaXQgPSAoKSA9PiB7IH07XG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBhaVtuXTtcbiAgICAgICAgICAgIHByb21pc2VzW25dID0gKGl0W25dID0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYVxuICAgICAgICAgICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICAgICAgICAgIDogYSlcbiAgICAgICAgICAgICAgICAubmV4dCgpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIGxldCBjb3VudCA9IHByb21pc2VzLmxlbmd0aDtcbiAgICBjb25zdCBtZXJnZWQgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBtZXJnZWQ7IH0sXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICByZXR1cm4gY291bnRcbiAgICAgICAgICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYGV4YCBpcyB0aGUgdW5kZXJseWluZyBhc3luYyBpdGVyYXRpb24gZXhjZXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gaXRbaWR4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gaXRbaWR4XS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9IH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8ucmV0dXJuPy4oeyBkb25lOiB0cnVlLCB2YWx1ZTogciB9KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIHRocm93KGV4KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy50aHJvdz8uKGV4KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKTtcbn07XG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGUoaSkge1xuICAgIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAgICAgJiYgT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXG4gICAgICAgICAgICAuZXZlcnkoayA9PiAoayBpbiBpKSAmJiBpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnMoYWkpIHtcbiAgICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihhaSwgYXN5bmNFeHRyYXMpO1xuICAgIH1cbiAgICByZXR1cm4gYWk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVycyhnKSB7XG4gICAgLy8gQHRzLWlnbm9yZTogVFMgdHlwZSBtYWRuZXNzXG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IFRTIHR5cGUgbWFkbmVzc1xuICAgICAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGcoLi4uYXJncykpO1xuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBjb25zdW1lKGYpIHtcbiAgICBsZXQgbGFzdCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcylcbiAgICAgICAgbGFzdCA9IGY/Lih1KTtcbiAgICBhd2FpdCBsYXN0O1xufVxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwKHNvdXJjZSwgZm4sIGluaXRpYWxWYWx1ZSA9IElnbm9yZSkge1xuICAgIGxldCBhaTtcbiAgICBsZXQgcHJldiA9IElnbm9yZTtcbiAgICBjb25zdCBmYWkgPSB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKGluaXRpYWxWYWx1ZSkudGhlbih2YWx1ZSA9PiAoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGlmICghYWkpXG4gICAgICAgICAgICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihwID0+IHAuZG9uZVxuICAgICAgICAgICAgICAgICAgICA/IHJlc29sdmUocClcbiAgICAgICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoZm4ocC52YWx1ZSwgcHJldikpLnRoZW4oZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLCBleCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICAgICAgICB9KSwgZXggPT4gXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSkpLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvdyhleCkge1xuICAgICAgICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSk7XG59XG5mdW5jdGlvbiBtYXAobWFwcGVyKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuZnVuY3Rpb24gZmlsdGVyKGZuKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyAobykgPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuZnVuY3Rpb24gdW5pcXVlKGZuKSB7XG4gICAgcmV0dXJuIGZuXG4gICAgICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5mdW5jdGlvbiBpbml0aWFsbHkoaW5pdFZhbHVlKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5mdW5jdGlvbiB3YWl0Rm9yKGNiKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG87IH0pKTtcbn1cbmZ1bmN0aW9uIG11bHRpKCkge1xuICAgIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gICAgbGV0IGNvbnN1bWVycyA9IDA7XG4gICAgbGV0IGN1cnJlbnQ7XG4gICAgbGV0IGFpID0gdW5kZWZpbmVkO1xuICAgIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICAgIGZ1bmN0aW9uIHN0ZXAoaXQpIHtcbiAgICAgICAgaWYgKGl0KVxuICAgICAgICAgICAgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICAgICAgaWYgKCFpdD8uZG9uZSkge1xuICAgICAgICAgICAgY3VycmVudCA9IGRlZmVycmVkKCk7XG4gICAgICAgICAgICBhaS5uZXh0KClcbiAgICAgICAgICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbWFpID0ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGlmICghYWkpIHtcbiAgICAgICAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3coZXgpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgICAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHYpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgICAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5mdW5jdGlvbiBicm9hZGNhc3QoKSB7XG4gICAgY29uc3QgYWkgPSB0aGlzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGNvbnN0IGIgPSBicm9hZGNhc3RJdGVyYXRvcigoKSA9PiBhaS5yZXR1cm4/LigpKTtcbiAgICAoZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgYWkubmV4dCgpLnRoZW4odiA9PiB7XG4gICAgICAgICAgICBpZiAodi5kb25lKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVoIC0gd2UgdGhyb3cgdGhlc2UgYXdheSBmb3Igbm93LlxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLmJyb2FkY2FzdCBkb25lXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYi5wdXNoKHYudmFsdWUpO1xuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4gYi5jbG9zZShleCkpO1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyh7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gYltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IGFzeW5jSGVscGVyRnVuY3Rpb25zID0geyBtYXAsIGZpbHRlciwgdW5pcXVlLCB3YWl0Rm9yLCBtdWx0aSwgYnJvYWRjYXN0LCBpbml0aWFsbHksIGNvbnN1bWUsIG1lcmdlIH07XG4iLCIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzICovXG5leHBvcnQgY29uc3QgVW5pcXVlSUQgPSBTeW1ib2woXCJVbmlxdWUgSURcIik7XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBhc3luY0V4dHJhcywgbWVyZ2UsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcihldikge1xuICAgIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlKTtcbiAgICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lciwgc2VsZWN0b3IgfSA9IG87XG4gICAgICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lci5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IG4gfHwgbi5jb250YWlucyhldi50YXJnZXQpKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaChldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCAnZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMF0sIFwiY2hhbmdlXCJdO1xuICAgICAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdXTtcbiAgICB9XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF1dO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuZnVuY3Rpb24gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdCkge1xuICAgIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIgKyB3aGF0KTtcbiAgICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhldmVudE5hbWUpKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICAgIH1cbiAgICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yKCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBtdWx0aSA9IHF1ZXVlLm11bHRpKCk7XG4gICAgY29uc3QgZGV0YWlscyAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgICAgIHRlcm1pbmF0ZShleCkgeyBtdWx0aS5yZXR1cm4/LihleCk7IH0sXG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yIHx8IG51bGxcbiAgICB9O1xuICAgIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgICAgIC50aGVuKF8gPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSkuYWRkKGRldGFpbHMpKTtcbiAgICByZXR1cm4gbXVsdGk7XG59XG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbigpIHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7IH0pO1xuICAgIHlpZWxkIHVuZGVmaW5lZDsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYyhzcmMpIHtcbiAgICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBhc3luY0V4dHJhcy5tYXAuY2FsbChzcmMsIG1hcHBlcik7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUpLCB7XG4gICAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0KSB7XG4gICAgaWYgKCF3aGF0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlKHApIHtcbiAgICB5aWVsZCBwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW4oY29udGFpbmVyLCAuLi5zb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKTtcbiAgICB9XG4gICAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgICAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICAgICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgICAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgICAgICAgICAgOiB3aGF0KTtcbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGVybWluYXRlIG9uIHRoZSBuZXh0IGNhbGwgdG8gYG5leHQoKWBcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFlpZWxkIGEgXCJzdGFydFwiIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICAgIH1cbiAgICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcbiAgICAgICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbCkge1xuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcbiAgICAgICAgY29uc3QgYWkgPSB7XG4gICAgICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWk7IH0sXG4gICAgICAgICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBtaXNzaW5nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuKCkpO1xuICAgICAgICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYWkubmV4dCA9IGV2ZW50cy5uZXh0LmJpbmQoZXZlbnRzKTsgLy8oKSA9PiBldmVudHMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBhaS5yZXR1cm4gPSBldmVudHMucmV0dXJuPy5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjaGFpbkFzeW5jKGFpKTtcbiAgICB9XG4gICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbigpKTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhtZXJnZWQpO1xufVxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0KSB7XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKSB7XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KSk7XG59XG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgc2VsZWN0b3JzKSB7XG4gICAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIHNlbGVjdG9ycyksXG4gICAgICAgICAgICBlbGVtZW50SXNJbkRPTShjb250YWluZXIpXG4gICAgICAgIF0pO1xuICAgIHJldHVybiBlbGVtZW50SXNJbkRPTShjb250YWluZXIpO1xufVxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIG1pc3NpbmcpIHtcbiAgICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcbiAgICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90aGluZyBpcyBtaXNzaW5nXG4gICAgfVxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpZiAobWlzc2luZy5ldmVyeShzZWwgPT4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSkpIHtcbiAgICAgICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuICAgIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICAgICAgY29uc3Qgd2FybiA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgc3RhY2ssIG1pc3NpbmcpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuKSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBJZ25vcmUsIGFzeW5jSXRlcmF0b3IsIGRlZmluZUl0ZXJhYmxlUHJvcGVydHksIGlzQXN5bmNJdGVyLCBpc0FzeW5jSXRlcmFibGUsIGlzQXN5bmNJdGVyYXRvciwgaXRlcmFibGVIZWxwZXJzIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBVbmlxdWVJRCB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gICAgXCJjYW52YXNcIiwgXCJjYXB0aW9uXCIsIFwiY2l0ZVwiLCBcImNvZGVcIiwgXCJjb2xcIiwgXCJjb2xncm91cFwiLCBcImRhdGFcIiwgXCJkYXRhbGlzdFwiLCBcImRkXCIsIFwiZGVsXCIsIFwiZGV0YWlsc1wiLCBcImRmblwiLCBcImRpYWxvZ1wiLCBcImRpdlwiLFxuICAgIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICAgIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gICAgXCJtYXJrXCIsIFwibWVudVwiLCBcIm1ldGFcIiwgXCJtZXRlclwiLCBcIm5hdlwiLCBcIm5vc2NyaXB0XCIsIFwib2JqZWN0XCIsIFwib2xcIiwgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsXG4gICAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gICAgXCJ0aXRsZVwiLCBcInRyXCIsIFwidHJhY2tcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJcIiwgXCJ2aWRlb1wiLCBcIndiclwiXG5dO1xuY29uc3QgZWxlbWVudFByb3R5cGUgPSB7XG4gICAgZ2V0IGlkcygpIHtcbiAgICAgICAgcmV0dXJuIGdldEVsZW1lbnRJZE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIHNldCBpZHModikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgaWRzIG9uICcgKyB0aGlzLnZhbHVlT2YoKSk7XG4gICAgfSxcbiAgICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpO1xuICAgIH1cbn07XG5jb25zdCBwb1N0eWxlRWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpO1xucG9TdHlsZUVsdC5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzXCI7XG5mdW5jdGlvbiBpc0NoaWxkVGFnKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgICAgICB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgICAgICB8fCB4IGluc3RhbmNlb2YgTm9kZUxpc3RcbiAgICAgICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgICAgIHx8IHggPT09IG51bGxcbiAgICAgICAgfHwgeCA9PT0gdW5kZWZpbmVkXG4gICAgICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgICAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgICAgIHx8IGlzUHJvbWlzZUxpa2UoeClcbiAgICAgICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICAgICAgfHwgdHlwZW9mIHhbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcbn1cbi8qIHRhZyAqL1xuY29uc3QgY2FsbFN0YWNrU3ltYm9sID0gU3ltYm9sKCdjYWxsU3RhY2snKTtcbmV4cG9ydCBjb25zdCB0YWcgPSBmdW5jdGlvbiAoXzEsIF8yLCBfMykge1xuICAgIC8qIFdvcmsgb3V0IHdoaWNoIHBhcmFtZXRlciBpcyB3aGljaC4gVGhlcmUgYXJlIDYgdmFyaWF0aW9uczpcbiAgICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICAgIHRhZyhwcm90b3R5cGVzKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdXVxuICAgICAgdGFnKHRhZ3NbXSwgcHJvdG90eXBlcykgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10pICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgcHJvdG90eXBlcykgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW10sIG9iamVjdF1cbiAgICAqL1xuICAgIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIHByb3RvdHlwZXNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgICAgID8gW18xLCBfMiwgXzNdXG4gICAgICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgICAgICAgID8gW251bGwsIF8xLCBfMl1cbiAgICAgICAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzFdO1xuICAgIC8qIE5vdGU6IHdlIHVzZSBwcm9wZXJ0eSBkZWZpbnRpb24gKGFuZCBub3Qgb2JqZWN0IHNwcmVhZCkgc28gZ2V0dGVycyAobGlrZSBgaWRzYClcbiAgICAgIGFyZSBub3QgZXZhbHVhdGVkIHVudGlsIGNhbGxlZCAqL1xuICAgIGNvbnN0IHRhZ1Byb3RvdHlwZXMgPSBPYmplY3QuY3JlYXRlKG51bGwsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGVsZW1lbnRQcm90eXBlKSk7XG4gICAgLy8gV2UgZG8gdGhpcyBoZXJlIGFuZCBub3QgaW4gZWxlbWVudFByb3R5cGUgYXMgdGhlcmUncyBubyBzeW50YXhcbiAgICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywgJ2F0dHJpYnV0ZXMnLCB7XG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdhdHRyaWJ1dGVzJyksXG4gICAgICAgIHNldChhKSB7XG4gICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbigoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCk7IH0sIGV4ID0+IGNvbnNvbGUud2FybihcIihBSS1VSSlcIiwgZXgpKTtcbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAocHJvdG90eXBlcylcbiAgICAgICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBwcm90b3R5cGVzKTtcbiAgICBmdW5jdGlvbiBub2RlcyguLi5jKSB7XG4gICAgICAgIGNvbnN0IGFwcGVuZGVkID0gW107XG4gICAgICAgIChmdW5jdGlvbiBjaGlsZHJlbihjKSB7XG4gICAgICAgICAgICBpZiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwgfHwgYyA9PT0gSWdub3JlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGcgPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgICAgICAgICBhcHBlbmRlZC5wdXNoKGdbMF0pO1xuICAgICAgICAgICAgICAgIGMudGhlbihyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IG5vZGVzKHIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2xkWzBdLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKG9sZFswXS5wYXJlbnRFbGVtZW50LCBvbGRbMF0pKG4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkLmZvckVhY2goZSA9PiBlLnBhcmVudEVsZW1lbnQ/LnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBnID0gbjtcbiAgICAgICAgICAgICAgICB9LCAoeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCB4KTtcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kZXIoZ1swXSkoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IHggfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmFibGUoYykgPyBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIDogYztcbiAgICAgICAgICAgICAgICBjb25zdCBkcG0gPSBEb21Qcm9taXNlQ29udGFpbmVyKCk7XG4gICAgICAgICAgICAgICAgYXBwZW5kZWQucHVzaChkcG0pO1xuICAgICAgICAgICAgICAgIGxldCB0ID0gW2RwbV07XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuLmZvckVhY2goZSA9PiAhdC5pbmNsdWRlcyhlKSAmJiBlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIHQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIoZSA9PiBlPy5wYXJlbnROb2RlICYmIGUub3duZXJEb2N1bWVudD8uYm9keS5jb250YWlucyhlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50KHMpIG5vIGxvbmdlciBleGlzdCBpbiBkb2N1bWVudFwiICsgaW5zZXJ0aW9uU3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlLCBuWzBdKSh1bmJveChlcy52YWx1ZSkgPz8gRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuLmZvckVhY2goZSA9PiAhdC5pbmNsdWRlcyhlKSAmJiBlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGMgPT09ICdvYmplY3QnICYmIGM/LltTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkIG9mIGMpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuKGQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFwcGVuZGVkLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKSk7XG4gICAgICAgIH0pKGMpO1xuICAgICAgICByZXR1cm4gYXBwZW5kZWQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFwcGVuZGVyKGNvbnRhaW5lciwgYmVmb3JlKSB7XG4gICAgICAgIGlmIChiZWZvcmUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIGJlZm9yZSA9IG51bGw7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlcyhjKTtcbiAgICAgICAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgICAgICAgICAvLyBcImJlZm9yZVwiLCBiZWluZyBhIG5vZGUsIGNvdWxkIGJlICN0ZXh0IG5vZGVcbiAgICAgICAgICAgICAgICBpZiAoYmVmb3JlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5iZWZvcmUuY2FsbChiZWZvcmUsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGEgdGV4dCBub2RlIC0gd29yayBiYWNrd2FyZHMgYW5kIGluc2VydCAqYWZ0ZXIqIHRoZSBwcmVjZWVkaW5nIEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gYmVmb3JlLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGlzIG51bGxcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJJbnRlcm5hbCBlcnJvciAtIGNvbnRhaW5lciBtaXNtYXRjaFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZHJlbltpXSwgYmVmb3JlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmQuY2FsbChjb250YWluZXIsIC4uLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgICAgICAgIGFwcGVuZGVyLCAvLyBMZWdhY3kgUlRBIHN1cHBvcnRcbiAgICAgICAgICAgIG5vZGVzLCAvLyBQcmVmZXJyZWQgaW50ZXJmYWNlIGluc3RlYWQgb2YgYGFwcGVuZGVyYFxuICAgICAgICAgICAgVW5pcXVlSUQsXG4gICAgICAgICAgICBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gICAgZnVuY3Rpb24gZGVlcERlZmluZShkLCBzKSB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXIodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHByb3BlcnR5IGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcoQUktVUkpJywgXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1bmJveChhKSB7XG4gICAgICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdi5tYXAodW5ib3gpIDogdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZSwgcHJvcHMpIHtcbiAgICAgICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICAgICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkLCBzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vIHN0YXRpYyBwcm9wcyBiZWZvcmUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDAuNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJhc2Uub3duZXJEb2N1bWVudC5jb250YWlucyhiYXNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZWxlbWVudCBoYXMgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvYy4gVGVsbCB0aGUgc291cmNlIGFwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBzdG9wIHNlbmRpbmcgdXMgc3R1ZmYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihuZXcgRXJyb3IoXCJFbGVtZW50IG5vIGxvbmdlciBleGlzdHMgaW4gZG9jdW1lbnQgKHVwZGF0ZSBcIiArIGsudG9TdHJpbmcoKSArIFwiKVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNyYyBpcyBub3QgYW4gb2JqZWN0IChvciBpcyBudWxsKSAtIGp1c3QgYXNzaWduIGl0LCB1bmxlc3MgaXQncyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlcihiYXNlKShEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coJyhBSS1VSSknLCBcIkZhaWxlZCB0byBzZXQgYXR0cmlidXRlXCIsIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFpc0FzeW5jSXRlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlLCBrKSB7XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcoQUktVUkpJywgXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKGUpIHtcbiAgICAgICAgZm9yIChsZXQgZXRmID0gdGhpczsgZXRmOyBldGYgPSBldGYuc3VwZXIpIHtcbiAgICAgICAgICAgIGlmIChlLmNvbnN0cnVjdG9yID09PSBldGYpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleHRlbmRlZChfb3ZlcnJpZGVzKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgID8gKGluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LCBfb3ZlcnJpZGVzLCBpbnN0YW5jZSlcbiAgICAgICAgICAgIDogX292ZXJyaWRlcztcbiAgICAgICAgY29uc3QgdW5pcXVlVGFnSUQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIChpZENvdW50KyspLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgICAgICBsZXQgc3RhdGljRXh0ZW5zaW9ucyA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgICAvKiBcIlN0YXRpY2FsbHlcIiBjcmVhdGUgYW55IHN0eWxlcyByZXF1aXJlZCBieSB0aGlzIHdpZGdldCAqL1xuICAgICAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgICAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5oZWFkLmNvbnRhaW5zKHBvU3R5bGVFbHQpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChwb1N0eWxlRWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAgICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgICAgIC8vIChmaW5hbGx5KSBhc3NpZ25pbmcgdGhvc2Ugc3BlY2lmaWVkIGJ5IHRoZSBpbnN0YW50aWF0aW9uXG4gICAgICAgIGNvbnN0IGV4dGVuZFRhZ0ZuID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9BdHRycyA9IGlzQ2hpbGRUYWcoYXR0cnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrID0gW107XG4gICAgICAgICAgICBjb25zdCBjb21iaW5lZEF0dHJzID0geyBbY2FsbFN0YWNrU3ltYm9sXTogKG5vQXR0cnMgPyBuZXdDYWxsU3RhY2sgOiBhdHRyc1tjYWxsU3RhY2tTeW1ib2xdKSA/PyBuZXdDYWxsU3RhY2sgfTtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICAgICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ucHJvdG90eXBlKTtcbiAgICAgICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24uZGVjbGFyZSk7XG4gICAgICAgICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGsgaW4gZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnKEFJLVVJKScsIGBJZ25vcmluZyBhdHRlbXB0IHRvIHJlLWRlZmluZSBpdGVyYWJsZSBwcm9wZXJ0eSBcIiR7a31cIiBhcyBpdCBjb3VsZCBhbHJlYWR5IGhhdmUgY29uc3VtZXJzYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlW2tdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXSA9PT0gbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgICAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGJhc2U/LmNvbnN0cnVjdGVkPy5jYWxsKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAgICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGVcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuaXRlcmFibGUgJiYgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBrID0+IGVba10gPSBlW2tdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXh0ZW5kVGFnID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICAgICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICAgICAgICBleHRlbmRlZCxcbiAgICAgICAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSB8fCB7fSksIC4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuaXRlcmFibGUgfHwge30pXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGZ1bGxQcm90byA9IHt9O1xuICAgICAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3IpIHtcbiAgICAgICAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgICAgICAgICB3YWxrUHJvdG8oY3JlYXRvci5zdXBlcik7XG4gICAgICAgICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSh0aGlzKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMucHJvdG90eXBlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICAgICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgICAgICAgIDogJz8nO1xuICAgICAgICBjb25zdCBjYWxsU2l0ZSA9IERFQlVHID8gJyBAJyArIChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdPy5tYXRjaCgvXFwoKC4qKVxcKS8pPy5bMV0gPz8gJz8nKSA6ICcnO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCAnLScpICsgY2FsbFNpdGUgKyBcIj5cIlxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgICB9XG4gICAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzID0ge307XG4gICAgZnVuY3Rpb24gY3JlYXRlVGFnKGspIHtcbiAgICAgICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG4gICAgICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQ7XG4gICAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgICAgICAgICBhdHRycyA9IHsgcHJvdG90eXBlOiB7fSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICAgICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gbmFtZVNwYWNlXG4gICAgICAgICAgICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcbiAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgYXBwZW5kZXIoZSkoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmNsdWRpbmdFeHRlbmRlciA9IE9iamVjdC5hc3NpZ24odGFnQ3JlYXRvciwge1xuICAgICAgICAgICAgc3VwZXI6ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpOyB9LFxuICAgICAgICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICAgICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmA7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gICAgfVxuICAgIHRhZ3MuZm9yRWFjaChjcmVhdGVUYWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufTtcbmNvbnN0IHsgXCJhaS11aS1jb250YWluZXJcIjogQXN5bmNET01Db250YWluZXIgfSA9IHRhZygnJywgW1wiYWktdWktY29udGFpbmVyXCJdKTtcbmNvbnN0IERvbVByb21pc2VDb250YWluZXIgPSBBc3luY0RPTUNvbnRhaW5lci5leHRlbmRlZCh7XG4gICAgc3R5bGVzOiBgXG4gIGFpLXVpLWNvbnRhaW5lci5wcm9taXNlIHtcbiAgICBkaXNwbGF5OiAke0RFQlVHID8gJ2lubGluZScgOiAnbm9uZSd9O1xuICAgIGNvbG9yOiAjODg4O1xuICAgIGZvbnQtc2l6ZTogMC43NWVtO1xuICB9XG4gIGFpLXVpLWNvbnRhaW5lci5wcm9taXNlOmFmdGVyIHtcbiAgICBjb250ZW50OiBcIuKLr1wiO1xuICB9YCxcbiAgICBvdmVycmlkZToge1xuICAgICAgICBjbGFzc05hbWU6ICdwcm9taXNlJ1xuICAgIH0sXG4gICAgY29uc3RydWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiBBc3luY0RPTUNvbnRhaW5lcih7IHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9IH0sIERFQlVHXG4gICAgICAgICAgICA/IG5ldyBFcnJvcihcIkNvbnN0cnVjdGVkXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQpO1xuICAgIH1cbn0pO1xuY29uc3QgRHlhbWljRWxlbWVudEVycm9yID0gQXN5bmNET01Db250YWluZXIuZXh0ZW5kZWQoe1xuICAgIHN0eWxlczogYFxuICBhaS11aS1jb250YWluZXIuZXJyb3Ige1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIGNvbG9yOiAjYjMzO1xuICAgIHdoaXRlLXNwYWNlOiBwcmU7XG4gIH1gLFxuICAgIG92ZXJyaWRlOiB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2Vycm9yJ1xuICAgIH0sXG4gICAgZGVjbGFyZToge1xuICAgICAgICBlcnJvcjogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBjb25zdHJ1Y3RlZCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVycm9yKVxuICAgICAgICAgICAgcmV0dXJuIFwiRXJyb3JcIjtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3IgaW5zdGFuY2VvZiBFcnJvcilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVycm9yLnN0YWNrO1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiB0aGlzLmVycm9yICYmIHRoaXMuZXJyb3IudmFsdWUgaW5zdGFuY2VvZiBFcnJvcilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVycm9yLnZhbHVlLnN0YWNrO1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvci50b1N0cmluZygpO1xuICAgIH1cbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gICAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgICB3aGlsZSAoZykge1xuICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICAgIH1cbiAgICBpZiAoREVCVUcgJiYgIWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyhBSS1VSSknLCBcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gICAgfVxufVxuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICAgIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7IH07IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICBbLi4ucmVtb3ZlZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIiksIHJlbW92ZWRdLmZpbHRlcihlbHQgPT4gIWVsdC5vd25lckRvY3VtZW50LmNvbnRhaW5zKGVsdCkpLmZvckVhY2goZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbn07XG5jb25zdCB3YXJuZWQgPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkTWFwKG5vZGUsIGlkcykge1xuICAgIG5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuICAgIGlkcyA9IGlkcyB8fCB7fTtcbiAgICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIikuZm9yRWFjaChmdW5jdGlvbiAoZWx0KSB7XG4gICAgICAgICAgICBpZiAoZWx0LmlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZHNbZWx0LmlkXSlcbiAgICAgICAgICAgICAgICAgICAgaWRzW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKGVsdC5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm5lZC5hZGQoZWx0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnKEFJLVVJKScsIFwiU2hhZG93ZWQgbXVsdGlwbGUgZWxlbWVudCBJRHNcIiwgZWx0LmlkLCBlbHQsIGlkc1tlbHQuaWRdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpZHM7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=