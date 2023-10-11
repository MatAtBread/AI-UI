import { isPromiseLike } from "./ai-ui.js";
import { deferred } from "./deferred.js";
import { pushIterator, withHelpers, asyncExtras, merge } from "./iterators.js";
const eventObservations = new Map();
function docEventHandler(ev) {
    var _a, _b;
    const observations = eventObservations.get(ev.type);
    if (observations) {
        for (const o of observations) {
            try {
                const { push, container, selector } = o;
                if (!document.body.contains(container)) {
                    const msg = "Container `#" + container.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
                    observations.delete(o);
                    (_b = (_a = push[Symbol.asyncIterator]()).throw) === null || _b === void 0 ? void 0 : _b.call(_a, new Error(msg));
                }
                else {
                    if (selector) {
                        const nodes = container.querySelectorAll(selector);
                        for (const n of nodes) {
                            //if (ev.target === n && container.contains(n))
                            if ((ev.target === n || n.contains(ev.target)) && container.contains(n))
                                push.push(ev);
                        }
                    }
                    else {
                        if (ev.target === container)
                            push.push(ev);
                    }
                }
            }
            catch (ex) {
                console.warn('docEventHandler', ex);
            }
        }
    }
}
function whenEvent(container, what) {
    var _a;
    const parts = ((_a = what.match(/(.*)?\((.+)\)$/)) === null || _a === void 0 ? void 0 : _a.slice(1, 3)) || [what, 'change'];
    const [selector, eventName] = parts;
    if (!eventObservations.has(eventName)) {
        document.addEventListener(eventName, docEventHandler, {
            passive: true,
            capture: true
        });
        eventObservations.set(eventName, new Set());
    }
    const push = pushIterator(() => { var _a; return (_a = eventObservations.get(eventName)) === null || _a === void 0 ? void 0 : _a.delete(details); });
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
/* Syntactic sugar: chainAsync decorates the specified so it can be mapped by a following function, or
  used directly as an iterable */
function chainAsync(src) {
    function mappableAsyncIterable(mapper) {
        return asyncExtras.map.call(src, mapper);
    }
    return Object.assign(withHelpers(mappableAsyncIterable), {
        [Symbol.asyncIterator]: () => src[Symbol.asyncIterator]()
    });
}
function isValidWhenSelector(what) {
    if (!what)
        throw new Error('Falsy async source will never be ready\n\n' + JSON.stringify(what));
    return typeof what === 'string' && what[0] !== '@';
}
async function* once(p) {
    yield p;
}
export function when(container, ...sources) {
    if (!sources || sources.length === 0) {
        return chainAsync(whenEvent(container, "(change)"));
    }
    const iterators = sources.filter(what => typeof what !== 'string' || what[0] !== '@').map(what => typeof what === 'string'
        ? whenEvent(container, what)
        : what instanceof Element
            ? whenEvent(what, "(change)")
            : isPromiseLike(what)
                ? once(what)
                : what);
    const start = {
        [Symbol.asyncIterator]: () => start,
        next() {
            const d = deferred();
            requestAnimationFrame(() => d.resolve({ done: true, value: {} }));
            return d;
        }
    };
    if (sources.includes('@start'))
        iterators.push(start);
    if (sources.includes('@ready')) {
        const watchSelectors = sources.filter(isValidWhenSelector).map(what => what.split('(')[0]);
        const missing = watchSelectors.filter(sel => !container.querySelector(sel));
        const ai = {
            [Symbol.asyncIterator]() { return ai; },
            async next() {
                await Promise.all([
                    allSelectorsPresent(container, missing),
                    elementIsInDOM(container)
                ]);
                const merged = (iterators.length > 1)
                    ? merge(...iterators)
                    : iterators.length === 1
                        ? iterators[0]
                        : (neverGonnaHappen());
                const events = merged[Symbol.asyncIterator]();
                ai.next = () => events.next();
                ai.return = (value) => { var _a, _b; return (_b = (_a = events.return) === null || _a === void 0 ? void 0 : _a.call(events, value)) !== null && _b !== void 0 ? _b : Promise.resolve({ done: true, value }); };
                ai.throw = (...args) => { var _a, _b; return (_b = (_a = events.throw) === null || _a === void 0 ? void 0 : _a.call(events, args)) !== null && _b !== void 0 ? _b : Promise.reject({ done: true, value: args[0] }); };
                return { done: false, value: {} };
            }
        };
        return chainAsync(ai);
    }
    const merged = (iterators.length > 1)
        ? merge(...iterators)
        : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen());
    return chainAsync(merged);
}
function elementIsInDOM(elt) {
    if (document.body.contains(elt))
        return Promise.resolve();
    const d = deferred();
    new MutationObserver((records, mutation) => {
        var _a;
        for (const record of records) {
            if ((_a = record.addedNodes) === null || _a === void 0 ? void 0 : _a.length) {
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
    const d = deferred();
    /* debugging help: warn if waiting a long time for a selectors to be ready *
      const stack = new Error().stack.replace(/^Error/, "Missing selectors after 5 seconds:");
      const warn = setTimeout(() => {
        console.warn(stack, missing);
      }, 5000);
  
      d.finally(() => clearTimeout(warn))
    }
    /*** */
    new MutationObserver((records, mutation) => {
        var _a;
        for (const record of records) {
            if ((_a = record.addedNodes) === null || _a === void 0 ? void 0 : _a.length) {
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
