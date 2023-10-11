import { isAsyncIterable } from "./ai-ui.js";
import { deferred } from "./deferred.js";
/* A function that wraps a "prototypical" AsyncIterator helper, that has `this:AsyncIterable<T>` and returns
  something that's derived from AsyncIterable<R>, result in a wrapped function that accepts
  the same arguments returns a AsyncExtraIterable<X>
*/
function wrapAsyncHelper(fn) {
    return function (...args) { return withHelpers(fn.call(this, ...args)); };
}
export const asyncExtras = {
    map: wrapAsyncHelper(map),
    filter: wrapAsyncHelper(filter),
    throttle: wrapAsyncHelper(throttle),
    debounce: wrapAsyncHelper(debounce),
    waitFor: wrapAsyncHelper(waitFor),
    count: wrapAsyncHelper(count),
    retain: wrapAsyncHelper(retain),
    broadcast: wrapAsyncHelper(broadcast),
    initially: wrapAsyncHelper(initially),
    consume
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
        const value = deferred();
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
            this._items.splice(0, this._items.length);
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
            this._items.splice(0, this._items.length);
        }
        return Promise.resolve(value);
    }
    push(value) {
        if (!this._pending) {
            //throw new Error("pushIterator has stopped");
            return true;
        }
        if (this._pending.length) {
            this._pending.shift().resolve({ done: false, value });
        }
        else {
            this._items.push(value);
        }
        return false;
    }
}
/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  unique values from the queue (ie: the queue is SHARED not duplicated)
*/
export function pushIterator(stop = () => { }, bufferWhenNoConsumers = false) {
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
            var _a, _b;
            ex ? (_a = ai.throw) === null || _a === void 0 ? void 0 : _a.call(ai, ex) : (_b = ai.return) === null || _b === void 0 ? void 0 : _b.call(ai);
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
    return Object.assign(Object.create(asyncExtras), {
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
            return withHelpers(added);
        },
        push(value) {
            if (!(ai === null || ai === void 0 ? void 0 : ai.size))
                return false;
            for (const q of ai.values()) {
                q.push(value);
            }
        },
        close(ex) {
            var _a, _b;
            for (const q of ai.values()) {
                ex ? (_a = q.throw) === null || _a === void 0 ? void 0 : _a.call(q, ex) : (_b = q.return) === null || _b === void 0 ? void 0 : _b.call(q);
            }
            // This should never be referenced again, but if it is, it will throw
            ai = null;
        }
    });
}
export const merge = (...ai) => {
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
                        promises[idx] = it[idx].next().then(result => ({ idx, result }));
                        return result;
                    }
                }).catch(ex => {
                    var _a, _b;
                    return (_b = (_a = this.throw) === null || _a === void 0 ? void 0 : _a.call(this, ex)) !== null && _b !== void 0 ? _b : Promise.reject({ done: true, value: new Error("Iterator merge exception") });
                })
                : Promise.reject({ done: true, value: new Error("Iterator merge complete") });
        },
        return() {
            var _a, _b;
            const ex = new Error("Merge terminated");
            for (let i = 0; i < it.length; i++) {
                if (promises[i] !== forever) {
                    promises[i] = forever;
                    (_b = (_a = it[i]).return) === null || _b === void 0 ? void 0 : _b.call(_a, { done: true, value: ex }); // Terminate the sources with the appropriate cause
                }
            }
            return Promise.resolve({ done: true, value: ex });
        },
        throw(ex) {
            var _a, _b;
            for (let i = 0; i < it.length; i++) {
                if (promises[i] !== forever) {
                    promises[i] = forever;
                    (_b = (_a = it[i]).throw) === null || _b === void 0 ? void 0 : _b.call(_a, ex); // Terminate the sources with the appropriate cause
                }
            }
            return Promise.reject(ex);
        }
    };
    return withHelpers(merged);
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
export function withHelpers(ai) {
    if (!isExtraIterable(ai)) {
        Object.assign(ai, asyncExtras);
    }
    return ai;
}
/* AsyncIterable helpers, which can be attached to an AsyncIterator with `withHelpers(ai)`, and invoked directly for foreign asyncIterators */
async function* map(mapper) {
    var _a, _b;
    const ai = this[Symbol.asyncIterator]();
    try {
        while (true) {
            const p = await ai.next();
            if (p.done) {
                return (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, mapper(p.value));
            }
            yield mapper(p.value);
        }
    }
    catch (ex) {
        (_b = ai.throw) === null || _b === void 0 ? void 0 : _b.call(ai, ex);
    }
}
async function* filter(fn) {
    var _a, _b;
    const ai = this[Symbol.asyncIterator]();
    try {
        while (true) {
            const p = await ai.next();
            if (p.done) {
                return (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, p.value);
            }
            if (await fn(p.value)) {
                yield p.value;
            }
        }
    }
    catch (ex) {
        (_b = ai.throw) === null || _b === void 0 ? void 0 : _b.call(ai, ex);
    }
}
async function* initially(initValue) {
    yield initValue;
    for await (const u of this)
        yield u;
}
async function* throttle(milliseconds) {
    var _a, _b;
    const ai = this[Symbol.asyncIterator]();
    let paused = 0;
    try {
        while (true) {
            const p = await ai.next();
            if (p.done) {
                return (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, p.value);
            }
            const now = Date.now();
            if (paused < now) {
                paused = now + milliseconds;
                yield p.value;
            }
        }
    }
    catch (ex) {
        (_b = ai.throw) === null || _b === void 0 ? void 0 : _b.call(ai, ex);
    }
}
const forever = new Promise(() => { });
// NB: DEBOUNCE IS CURRENTLY BROKEN
async function* debounce(milliseconds) {
    var _a, _b;
    const ai = this[Symbol.asyncIterator]();
    let timer = forever;
    let last = -1;
    try {
        while (true) {
            const p = await Promise.race([ai.next(), timer]);
            if ('done' in p && p.done)
                return (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, p.value);
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
        (_b = ai.throw) === null || _b === void 0 ? void 0 : _b.call(ai, ex);
    }
}
async function* waitFor(cb) {
    var _a, _b;
    const ai = this[Symbol.asyncIterator]();
    try {
        while (true) {
            const p = await ai.next();
            if (p.done) {
                return (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, p.value);
            }
            await new Promise(resolve => cb(resolve));
            yield p.value;
        }
    }
    catch (ex) {
        (_b = ai.throw) === null || _b === void 0 ? void 0 : _b.call(ai, ex);
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
        throw ex;
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
            var _a, _b;
            return (_b = (_a = ai.return) === null || _a === void 0 ? void 0 : _a.call(ai, value)) !== null && _b !== void 0 ? _b : Promise.resolve({ done: true, value });
        },
        throw(...args) {
            var _a, _b;
            return (_b = (_a = ai.throw) === null || _a === void 0 ? void 0 : _a.call(ai, args)) !== null && _b !== void 0 ? _b : Promise.resolve({ done: true, value: args[0] });
        },
        get value() {
            return prev.value;
        },
        get done() {
            return Boolean(prev.done);
        }
    };
}
function broadcast(pipe = (x => x)) {
    const ai = this[Symbol.asyncIterator]();
    const b = broadcastIterator( /*() => console.log("..stooped")*/);
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
            const dest = pipe(b);
            return dest[Symbol.asyncIterator]();
        }
    };
}
async function consume(f) {
    for await (const u of this)
        f(u);
}
