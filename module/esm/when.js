import { DEBUG, console, timeOutWarn } from './debug.js';
import { isPromiseLike } from './deferred.js';
import { iterableHelpers, merge, queueIteratableIterator } from "./iterators.js";
const eventObservations = new WeakMap();
function docEventHandler(ev) {
    if (!eventObservations.has(this))
        eventObservations.set(this, new Map());
    const observations = eventObservations.get(this).get(ev.type);
    if (observations) {
        for (const o of observations) {
            try {
                const { push, terminate, containerRef, selector, includeChildren } = o;
                const container = containerRef.deref();
                if (!container || !container.isConnected) {
                    const msg = "Container `#" + container?.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
                    observations.delete(o);
                    terminate(new Error(msg));
                }
                else {
                    if (ev.target instanceof Node) {
                        if (selector) {
                            const nodes = container.querySelectorAll(selector);
                            for (const n of nodes) {
                                if ((includeChildren ? n.contains(ev.target) : ev.target === n) && container.contains(n))
                                    push(ev);
                            }
                        }
                        else {
                            if (includeChildren ? container.contains(ev.target) : ev.target === container)
                                push(ev);
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
function childless(sel) {
    const includeChildren = !sel || !sel.endsWith('>');
    return { includeChildren, selector: includeChildren ? sel : sel.slice(0, -1) };
}
function parseWhenSelector(what) {
    const parts = what.split(':');
    if (parts.length === 1) {
        if (isCSSSelector(parts[0]))
            return [childless(parts[0]), "change"];
        return [{ includeChildren: true, selector: null }, parts[0]];
    }
    if (parts.length === 2) {
        if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
            return [childless(parts[1]), parts[0]];
    }
    return undefined;
}
function doThrow(message) {
    throw new Error(message);
}
function whenEvent(container, what) {
    const [{ includeChildren, selector }, eventName] = parseWhenSelector(what) ?? doThrow("Invalid WhenSelector: " + what);
    if (!eventObservations.has(container.ownerDocument))
        eventObservations.set(container.ownerDocument, new Map());
    if (!eventObservations.get(container.ownerDocument).has(eventName)) {
        container.ownerDocument.addEventListener(eventName, docEventHandler, {
            passive: true,
            capture: true
        });
        eventObservations.get(container.ownerDocument).set(eventName, new Set());
    }
    const queue = queueIteratableIterator(() => eventObservations.get(container.ownerDocument)?.get(eventName)?.delete(details));
    const details = {
        push: queue.push,
        terminate(ex) { queue.return?.(ex); },
        containerRef: new WeakRef(container),
        includeChildren,
        selector
    };
    containerAndSelectorsMounted(container, selector ? [selector] : undefined)
        .then(_ => eventObservations.get(container.ownerDocument)?.get(eventName).add(details));
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
    return Object.assign(iterableHelpers(mappableAsyncIterable), {
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
export function when(container, ...sources) {
    if (!sources || sources.length === 0) {
        return chainAsync(whenEvent(container, "change"));
    }
    const iterators = sources.filter(what => typeof what !== 'string' || what[0] !== '@').map(what => typeof what === 'string'
        ? whenEvent(container, what)
        : what instanceof Element
            ? whenEvent(what, "change")
            : isPromiseLike(what)
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
        const missing = watchSelectors.map(w => w?.selector).filter(isMissing);
        let events = undefined;
        const ai = {
            [Symbol.asyncIterator]() { return ai; },
            throw(ex) {
                if (events?.throw)
                    return events.throw(ex);
                return Promise.resolve({ done: true, value: ex });
            },
            return(v) {
                if (events?.return)
                    return events.return(v);
                return Promise.resolve({ done: true, value: v });
            },
            next() {
                if (events)
                    return events.next();
                return containerAndSelectorsMounted(container, missing).then(() => {
                    const merged = (iterators.length > 1)
                        ? merge(...iterators)
                        : iterators.length === 1
                            ? iterators[0]
                            : (neverGonnaHappen());
                    // Now everything is ready, we simply delegate all async ops to the underlying
                    // merged asyncIterator "events"
                    events = merged[Symbol.asyncIterator]();
                    if (!events)
                        return { done: true, value: undefined };
                    return { done: false, value: {} };
                });
            }
        };
        return chainAsync(iterableHelpers(ai));
    }
    const merged = (iterators.length > 1)
        ? merge(...iterators)
        : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen());
    return chainAsync(iterableHelpers(merged));
}
function elementIsInDOM(elt) {
    if (elt.isConnected)
        return Promise.resolve();
    return new Promise(resolve => new MutationObserver((records, mutation) => {
        if (records.some(r => r.addedNodes?.length)) {
            if (elt.isConnected) {
                mutation.disconnect();
                resolve();
            }
        }
    }).observe(elt.ownerDocument.body, {
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
    if (DEBUG) {
        const stack = new Error().stack?.replace(/^Error/, "Missing selectors after 5 seconds:");
        const warnTimer = setTimeout(() => {
            console.warn(stack, missing);
        }, timeOutWarn);
        promise.finally(() => clearTimeout(warnTimer));
    }
    return promise;
}
