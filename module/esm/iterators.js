import { DEBUG } from "./debug.js";
import { deferred } from "./deferred.js";
export function isAsyncIterator(o) {
    return typeof o?.next === 'function';
}
export function isAsyncIterable(o) {
    return o && o[Symbol.asyncIterator] && typeof o[Symbol.asyncIterator] === 'function';
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
/* A function that wraps a "prototypical" AsyncIterator helper, that has `this:AsyncIterable<T>` and returns
  something that's derived from AsyncIterable<R>, result in a wrapped function that accepts
  the same arguments returns a AsyncExtraIterable<X>
*/
function wrapAsyncHelper(fn) {
    return function (...args) { return iterableHelpers(fn.call(this, ...args)); };
}
export const asyncExtras = {
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
export function queueIteratableIterator(stop = () => { }) {
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
            const value = deferred();
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
export function pushIterator(stop = () => { }, bufferWhenNoConsumers = false) {
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
export function broadcastIterator(stop = () => { }) {
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
export const Iterability = Symbol("Iterability");
export function defineIterableProperty(obj, name, v) {
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
                            console.info('(AI-UI)', 'Iterable properties of type "object" will be spread to prevent re-initialisation.', a);
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
                                obj[name] = obj[name].valueOf();
                                return true;
                            }
                            return false;
                        },
                        // Implement the logic that returns a mapped iterator for the specified field
                        get(target, key, receiver) {
                            /* BROKEN: fails nested properties *
                            if (key === 'valueOf') return function() {
                              return target
                            }
                            **/
                            if (Reflect.getOwnPropertyDescriptor(target, key)?.enumerable) {
                                const realValue = Reflect.get(boxedObject, key, receiver);
                                const props = Object.getOwnPropertyDescriptors(boxedObject.map((o, p) => {
                                    // @ts-ignore
                                    const ov = o[key].valueOf();
                                    // @ts-ignore
                                    const pv = p.valueOf();
                                    if (typeof ov === typeof pv && ov == pv)
                                        return Ignore;
                                    return o[key];
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
function isExtraIterable(i) {
    return isAsyncIterable(i)
        && Object.keys(asyncExtras)
            .every(k => (k in i) && i[k] === asyncExtras[k]);
}
// Attach the pre-defined helpers onto an AsyncIterable and return the modified object correctly typed
export function iterableHelpers(ai) {
    if (!isExtraIterable(ai)) {
        Object.assign(ai, asyncExtras);
    }
    return ai;
}
export function generatorHelpers(g) {
    // @ts-ignore: TS type madness
    return function (...args) {
        return iterableHelpers(g(...args));
    };
}
/* A general filter & mapper that can handle exceptions & returns */
export const Ignore = Symbol("Ignore");
export function filterMap(source, fn, initialValue = Ignore) {
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
            current = deferred();
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
export const asyncHelperFunctions = { map, filter, unique, waitFor, multi, broadcast, initially, consume, merge };
