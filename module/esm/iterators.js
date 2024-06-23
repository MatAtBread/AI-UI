import { DEBUG, console } from "./debug.js";
import { deferred, isObjectLike, isPromiseLike } from "./deferred.js";
export const Iterability = Symbol("Iterability");
// NB: This also (incorrectly) passes sync iterators, as the protocol names are the same
export function isAsyncIterator(o) {
    return typeof o?.next === 'function';
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
const asyncExtras = {
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
function assignHidden(d, ...srcs) {
    for (const s of srcs) {
        for (const [k, pd] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
            Object.defineProperty(d, k, { ...pd, enumerable: false });
        }
    }
    return d;
}
const queue_pending = Symbol('pending');
const queue_items = Symbol('items');
function internalQueueIteratableIterator(stop = () => { }) {
    const q = {
        [queue_pending]: [],
        [queue_items]: [],
        [Symbol.asyncIterator]() {
            return q;
        },
        next() {
            if (q[queue_items]?.length) {
                return Promise.resolve({ done: false, value: q[queue_items].shift() });
            }
            const value = deferred();
            // We install a catch handler as the promise might be legitimately reject before anything waits for it,
            // and this suppresses the uncaught exception warning.
            value.catch(ex => { });
            q[queue_pending].unshift(value);
            return value;
        },
        return(v) {
            const value = { done: true, value: undefined };
            if (q[queue_pending]) {
                try {
                    stop();
                }
                catch (ex) { }
                while (q[queue_pending].length)
                    q[queue_pending].pop().resolve(value);
                q[queue_items] = q[queue_pending] = null;
            }
            return Promise.resolve(value);
        },
        throw(...args) {
            const value = { done: true, value: args[0] };
            if (q[queue_pending]) {
                try {
                    stop();
                }
                catch (ex) { }
                while (q[queue_pending].length)
                    q[queue_pending].pop().reject(value);
                q[queue_items] = q[queue_pending] = null;
            }
            return Promise.reject(value);
        },
        get length() {
            if (!q[queue_items])
                return -1; // The queue has no consumers and has terminated.
            return q[queue_items].length;
        },
        push(value) {
            if (!q[queue_pending])
                return false;
            if (q[queue_pending].length) {
                q[queue_pending].pop().resolve({ done: false, value });
            }
            else {
                if (!q[queue_items]) {
                    console.log('Discarding queue push as there are no consumers');
                }
                else if (!q[queue_items].find(v => v === value)) {
                    q[queue_items].push(value);
                }
            }
            return true;
        }
    };
    return iterableHelpers(q);
}
const queue_inflight = Symbol('inflight');
function internalDebounceQueueIteratableIterator(stop = () => { }) {
    const q = internalQueueIteratableIterator(stop);
    q[queue_inflight] = new Set();
    q.push = function (value) {
        if (!q[queue_pending])
            return false;
        // Debounce
        if (q[queue_inflight].has(value))
            return true;
        q[queue_inflight].add(value);
        if (q[queue_pending].length) {
            const p = q[queue_pending].pop();
            p.finally(() => q[queue_inflight].delete(value));
            p.resolve({ done: false, value });
        }
        else {
            if (!q[queue_items]) {
                console.log('Discarding queue push as there are no consumers');
            }
            else {
                q[queue_items].push(value);
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
export function defineIterableProperty(obj, name, v) {
    // Make `a` an AsyncExtraIterable. We don't do this until a consumer actually tries to
    // access the iterator methods to prevent leaks where an iterable is created, but
    // never referenced, and therefore cannot be consumed and ultimately closed
    let initIterator = () => {
        initIterator = () => b;
        const bi = debounceQueueIteratableIterator();
        const mi = bi.multi();
        const b = mi[Symbol.asyncIterator]();
        extras[Symbol.asyncIterator] = {
            value: mi[Symbol.asyncIterator],
            enumerable: false,
            writable: false
        };
        push = bi.push;
        extraKeys.forEach(k => extras[k] = {
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
        return {
            [method]: function (...args) {
                initIterator();
                // @ts-ignore - Fix
                return a[method].apply(this, args);
            }
        }[method];
    }
    const extras = {
        [Symbol.asyncIterator]: {
            enumerable: false,
            writable: true,
            value: initIterator
        }
    };
    extraKeys.forEach((k) => extras[k] = {
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
                    if (piped) {
                        throw new Error(`Iterable "${name.toString()}" is already piped from another iterator`);
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
                        if (DEBUG)
                            console.info(`The iterable property '${name.toString()}' of type "object" will be spread to prevent re-initialisation.\n${new Error().stack?.slice(6)}`);
                        if (Array.isArray(a))
                            boxedObject = Object.defineProperties([...a], pds);
                        else
                            boxedObject = Object.defineProperties({ ...a }, pds);
                    }
                    else {
                        Object.assign(boxedObject, a);
                    }
                    if (boxedObject[Iterability] === 'shallow') {
                        boxedObject = Object.defineProperties(boxedObject, pds);
                        return boxedObject;
                    }
                    // Proxy the result so we can track members of the iterable object
                    const extraBoxed = new Proxy(boxedObject, {
                        deleteProperty(target, key) {
                            if (Reflect.deleteProperty(target, key)) {
                                // @ts-ignore - Fix
                                push(obj[name]);
                                return true;
                            }
                            return false;
                        },
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
                            if ((targetProp === undefined && !(key in target)) || targetProp?.enumerable) {
                                if (targetProp === undefined) {
                                    // @ts-ignore - Fix: this "redefines" V as having an optional member called `key`
                                    target[key] = undefined;
                                }
                                const realValue = Reflect.get(boxedObject, key, receiver);
                                const props = Object.getOwnPropertyDescriptors(boxedObject.map((o, p) => {
                                    const ov = o?.[key]?.valueOf();
                                    const pv = p?.valueOf();
                                    if (typeof ov === typeof pv && ov == pv)
                                        return Ignore;
                                    return ov;
                                }));
                                Reflect.ownKeys(props).forEach(k => props[k].enumerable = false);
                                const aib = box(realValue, props);
                                Reflect.set(target, key, aib);
                                return aib;
                            }
                            return Reflect.get(target, key, receiver);
                        },
                    });
                    return extraBoxed;
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
        // Object.defineProperties(ai,
        //   Object.fromEntries(
        //     Object.entries(Object.getOwnPropertyDescriptors(asyncExtras)).map(([k,v]) => [k,{...v, enumerable: false}]
        //     )
        //   )
        // );
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
export function filterMap(source, fn, initialValue = Ignore) {
    let ai;
    let prev = Ignore;
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
