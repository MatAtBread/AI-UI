import { DEBUG, console } from "./debug.js";
import { deferred, isObjectLike, isPromiseLike } from "./deferred.js";
export const Iterability = Symbol("Iterability");
// NB: This also (incorrectly) passes sync iterators, as the protocol names are the same
export function isAsyncIterator(o) {
    return isObjectLike(o) && 'next' in o && typeof o?.next === 'function';
}
export function isAsyncIterable(o) {
    return isObjectLike(o) && (Symbol.asyncIterator in o) && typeof o[Symbol.asyncIterator] === 'function';
}
export function isAsyncIter(o) {
    return isAsyncIterable(o) || isAsyncIterator(o);
}
export function asyncIterator(o) {
    if (isAsyncIterable(o))
        return o[Symbol.asyncIterator]();
    if (isAsyncIterator(o))
        return o;
    throw new Error("Not as async provider");
}
export const asyncExtras = {
    filterMap(fn, initialValue = Ignore) {
        return filterMap(this, fn, initialValue);
    },
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
const extraKeys = [...Object.getOwnPropertySymbols(asyncExtras), ...Object.keys(asyncExtras)];
// Like Object.assign, but the assigned properties are not enumerable
function assignHidden(d, s) {
    const keys = [...Object.getOwnPropertyNames(s), ...Object.getOwnPropertySymbols(s)];
    for (const k of keys) {
        Object.defineProperty(d, k, { ...Object.getOwnPropertyDescriptor(s, k), enumerable: false });
    }
    return d;
}
const _pending = Symbol('_pending');
const _items = Symbol('_items');
function internalQueueIteratableIterator(stop = () => { }) {
    const q = {
        [_pending]: [],
        [_items]: [],
        [Symbol.asyncIterator]() {
            return q;
        },
        next() {
            if (q[_items]?.length) {
                return Promise.resolve(q[_items].shift());
            }
            if (!q[_pending])
                return Promise.resolve({ done: true, value: undefined });
            const value = deferred();
            // We install a catch handler as the promise might be legitimately reject before anything waits for it,
            // and this suppresses the uncaught exception warning.
            value.catch(ex => { });
            q[_pending].unshift(value);
            return value;
        },
        return(v) {
            const value = { done: true, value: undefined };
            if (q[_pending]) {
                try {
                    stop();
                }
                catch (ex) { }
                while (q[_pending].length)
                    q[_pending].pop().resolve(value);
                q[_items] = q[_pending] = null;
            }
            return Promise.resolve(value);
        },
        throw(...args) {
            const value = { done: true, value: args[0] };
            if (q[_pending]) {
                try {
                    stop();
                }
                catch (ex) { }
                while (q[_pending].length)
                    q[_pending].pop().reject(value);
                q[_items] = q[_pending] = null;
            }
            return Promise.reject(value);
        },
        get length() {
            if (!q[_items])
                return -1; // The queue has no consumers and has terminated.
            return q[_items].length;
        },
        push(value) {
            if (!q[_pending])
                return false;
            if (q[_pending].length) {
                q[_pending].pop().resolve({ done: false, value });
            }
            else {
                if (!q[_items]) {
                    console.log('Discarding queue push as there are no consumers');
                }
                else {
                    q[_items].push({ done: false, value });
                }
            }
            return true;
        }
    };
    return iterableHelpers(q);
}
const _inflight = Symbol('inflight');
function internalDebounceQueueIteratableIterator(stop = () => { }) {
    const q = internalQueueIteratableIterator(stop);
    q[_inflight] = new Set();
    q.push = function (value) {
        if (!q[_pending])
            return false;
        // Debounce
        if (q[_inflight].has(value))
            return true;
        if (q[_pending].length) {
            q[_inflight].add(value);
            const p = q[_pending].pop();
            p.finally(() => q[_inflight].delete(value));
            p.resolve({ done: false, value });
        }
        else {
            if (!q[_items]) {
                console.log('Discarding queue push as there are no consumers');
            }
            else if (!q[_items].find(v => v === value)) {
                q[_items].push({ done: false, value });
            }
        }
        return true;
    };
    return q;
}
// Re-export to hide the internals
export const queueIteratableIterator = internalQueueIteratableIterator;
export const debounceQueueIteratableIterator = internalDebounceQueueIteratableIterator;
/* Define a "iterable property" on `obj`.
   This is a property that holds a boxed (within an Object() call) value, and is also an AsyncIterableIterator. which
   yields when the property is set.
   This routine creates the getter/setter for the specified property, and manages the aassociated async iterator.
*/
const _proxiedAsyncIterator = Symbol('_proxiedAsyncIterator');
export function defineIterableProperty(obj, name, v) {
    // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
    // access the iterator methods to prevent leaks where an iterable is created, but
    // never referenced, and therefore cannot be consumed and ultimately closed
    let initIterator = () => {
        initIterator = () => b;
        const bi = debounceQueueIteratableIterator();
        const mi = bi.multi();
        const b = mi[Symbol.asyncIterator]();
        extras[Symbol.asyncIterator] = mi[Symbol.asyncIterator];
        push = bi.push;
        extraKeys.forEach(k => // @ts-ignore
         extras[k] = b[k]);
        if (!(_proxiedAsyncIterator in a))
            assignHidden(a, extras);
        return b;
    };
    // Create stubs that lazily create the AsyncExtraIterable interface when invoked
    function lazyAsyncMethod(method) {
        return {
            [method]: function (...args) {
                initIterator();
                // @ts-ignore - Fix
                return a[method].apply(this, args);
            }
        }[method];
    }
    const extras = { [Symbol.asyncIterator]: initIterator };
    extraKeys.forEach((k) => // @ts-ignore
     extras[k] = lazyAsyncMethod(k));
    if (typeof v === 'object' && v && Iterability in v && v[Iterability] === 'shallow') {
        extras[Iterability] = v[Iterability];
    }
    // Lazily initialize `push`
    let push = (v) => {
        initIterator(); // Updates `push` to reference the multi-queue
        return push(v);
    };
    let a = box(v, extras);
    let piped = undefined;
    Object.defineProperty(obj, name, {
        get() { return a; },
        set(v) {
            if (v !== a) {
                if (isAsyncIterable(v)) {
                    // Assigning multiple async iterators to a single iterable is probably a
                    // bad idea from a reasoning point of view, and multiple implementations
                    // are possible:
                    //  * merge?
                    //  * ignore subsequent assignments?
                    //  * terminate the first then consume the second?
                    // The solution here (one of many possibilities) is the letter: only to allow
                    // most recent assignment to work, terminating any preceeding iterator when it next
                    // yields and finds this consumer has been re-assigned.
                    // If the iterator has been reassigned with no change, just ignore it, as we're already consuming it
                    if (piped === v)
                        return;
                    piped = v;
                    let stack = DEBUG ? new Error() : undefined;
                    if (DEBUG)
                        console.info(new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`));
                    consume.call(v, y => {
                        if (v !== piped) {
                            // We're being piped from something else. We want to stop that one and get piped from this one
                            throw new Error(`Piped iterable "${name.toString()}" has been replaced by another iterator`, { cause: stack });
                        }
                        push(y?.valueOf());
                    })
                        .catch(ex => console.info(ex))
                        .finally(() => (v === piped) && (piped = undefined));
                    // Early return as we're going to pipe values in later
                    return;
                }
                else {
                    if (piped && DEBUG) {
                        console.log(`Iterable "${name.toString()}" is already piped from another iterator, and might be overrwitten later`);
                    }
                    a = box(v, extras);
                }
            }
            push(v?.valueOf());
        },
        enumerable: true
    });
    return obj;
    function box(a, pds) {
        if (a === null || a === undefined) {
            return assignHidden(Object.create(null, {
                valueOf: { value() { return a; }, writable: true },
                toJSON: { value() { return a; }, writable: true }
            }), pds);
        }
        switch (typeof a) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
                // Boxes types, including BigInt
                return assignHidden(Object(a), Object.assign(pds, {
                    toJSON() { return a.valueOf(); }
                }));
            case 'object':
                // We box objects by creating a Proxy for the object that pushes on get/set/delete, and maps the supplied async iterator to push the specified key
                // The proxies are recursive, so that if an object contains objects, they too are proxied. Objects containing primitives remain proxied to
                // handle the get/set/selete in place of the usual primitive boxing via Object(primitiveValue)
                // @ts-ignore
                return boxObject(a, pds);
        }
        throw new TypeError('Iterable properties cannot be of type "' + typeof a + '"');
    }
    function isProxiedAsyncIterator(o) {
        return isObjectLike(o) && _proxiedAsyncIterator in o;
    }
    function destructure(o, path) {
        const fields = path.split('.').slice(1);
        for (let i = 0; i < fields.length && ((o = o?.[fields[i]]) !== undefined); i++)
            ;
        return o;
    }
    function boxObject(a, pds) {
        let withPath;
        let withoutPath;
        return new Proxy(a, handler());
        function handler(path = '') {
            return {
                // A boxed object has its own keys, and the keys of an AsyncExtraIterable
                has(target, key) {
                    return key === _proxiedAsyncIterator || key === Symbol.toPrimitive || key in target || key in pds;
                },
                // When a key is set in the target, push the change
                set(target, key, value, receiver) {
                    if (Object.hasOwn(pds, key)) {
                        throw new Error(`Cannot set ${name.toString()}${path}.${key.toString()} as it is part of asyncIterator`);
                    }
                    if (Reflect.get(target, key, receiver) !== value) {
                        push({ [_proxiedAsyncIterator]: { a, path } });
                    }
                    return Reflect.set(target, key, value, receiver);
                },
                deleteProperty(target, key) {
                    if (Reflect.deleteProperty(target, key)) {
                        push({ [_proxiedAsyncIterator]: { a, path } });
                        return true;
                    }
                    return false;
                },
                // When getting the value of a boxed object member, prefer asyncExtraIterable over target keys
                get(target, key, receiver) {
                    // If the key is an asyncExtraIterable member, create the mapped queue to generate it
                    if (Object.hasOwn(pds, key)) {
                        if (!path.length) {
                            withoutPath ?? (withoutPath = filterMap(pds, o => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator].a : o));
                            return withoutPath[key];
                        }
                        else {
                            withPath ?? (withPath = filterMap(pds, o => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator] : { a: o, path: '' }));
                            let ai = filterMap(withPath, (o, p) => {
                                const v = destructure(o.a, path);
                                return p !== v || o.path.startsWith(path) ? v : Ignore;
                            }, Ignore, destructure(a, path));
                            return ai[key];
                        }
                    }
                    // If the key is a target property, create the proxy to handle it
                    if (key === 'valueOf')
                        return () => destructure(a, path);
                    if (key === Symbol.toPrimitive) {
                        // Special case, since Symbol.toPrimitive is in ha(), we need to implement it
                        return function (hint) {
                            if (Reflect.has(target, key))
                                return Reflect.get(target, key, target).call(target, hint);
                            if (hint === 'string')
                                return target.toString();
                            if (hint === 'number')
                                return Number(target);
                            return target.valueOf();
                        };
                    }
                    if (typeof key === 'string') {
                        if ((!(key in target) || Object.hasOwn(target, key)) && !(Iterability in target && target[Iterability] === 'shallow')) {
                            const field = Reflect.get(target, key, receiver);
                            return (typeof field === 'function') || isAsyncIter(field)
                                ? field
                                : new Proxy(Object(field), handler(path + '.' + key));
                        }
                    }
                    // This is a symbolic entry, or a prototypical value (since it's in the target, but not a target property)
                    return Reflect.get(target, key, receiver);
                }
            };
        }
    }
}
export const merge = (...ai) => {
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
export const combine = (src, opts = {}) => {
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
        && extraKeys.every(k => (k in i) && i[k] === asyncExtras[k]);
}
// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
export function iterableHelpers(ai) {
    if (!isExtraIterable(ai)) {
        assignHidden(ai, asyncExtras);
    }
    return ai;
}
export function generatorHelpers(g) {
    return function (...args) {
        const ai = g(...args);
        return iterableHelpers(ai);
    };
}
async function consume(f) {
    let last = undefined;
    for await (const u of this) {
        last = f?.(u);
    }
    await last;
}
/* A general filter & mapper that can handle exceptions & returns */
export const Ignore = Symbol("Ignore");
function resolveSync(v, then, except) {
    if (isPromiseLike(v))
        return v.then(then, except);
    try {
        return then(v);
    }
    catch (ex) {
        return except(ex);
    }
}
export function filterMap(source, fn, initialValue = Ignore, prev = Ignore) {
    let ai;
    const fai = {
        [Symbol.asyncIterator]() {
            return fai;
        },
        next(...args) {
            if (initialValue !== Ignore) {
                const init = Promise.resolve({ done: false, value: initialValue });
                initialValue = Ignore;
                return init;
            }
            return new Promise(function step(resolve, reject) {
                if (!ai)
                    ai = source[Symbol.asyncIterator]();
                ai.next(...args).then(p => p.done
                    ? resolve(p)
                    : resolveSync(fn(p.value, prev), f => f === Ignore
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
            current = deferred();
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
export function augmentGlobalAsyncGenerators() {
    let g = (async function* () { })();
    while (g) {
        const desc = Object.getOwnPropertyDescriptor(g, Symbol.asyncIterator);
        if (desc) {
            iterableHelpers(g);
            break;
        }
        g = Object.getPrototypeOf(g);
    }
    if (!g) {
        console.warn("Failed to augment the prototype of `(async function*())()`");
    }
}
