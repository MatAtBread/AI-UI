"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ai-ui.ts
var ai_ui_exports = {};
__export(ai_ui_exports, {
  Iterators: () => iterators_exports,
  UniqueID: () => UniqueID,
  enableOnRemovedFromDOM: () => enableOnRemovedFromDOM,
  getElementIdMap: () => getElementIdMap,
  tag: () => tag,
  when: () => when
});
module.exports = __toCommonJS(ai_ui_exports);

// src/debug.ts
var DEBUG = globalThis.DEBUG == "*" || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
var timeOutWarn = 5e3;
var _console = {
  log(...args) {
    if (DEBUG) console.log("(AI-UI) LOG:", ...args);
  },
  warn(...args) {
    if (DEBUG) console.warn("(AI-UI) WARN:", ...args);
  },
  info(...args) {
    if (DEBUG) console.debug("(AI-UI) INFO:", ...args);
  }
};

// src/deferred.ts
var nothing = (v) => {
};
function deferred() {
  let resolve = nothing;
  let reject = nothing;
  const promise = new Promise((...r) => [resolve, reject] = r);
  promise.resolve = resolve;
  promise.reject = reject;
  if (DEBUG) {
    const initLocation = new Error().stack;
    promise.catch((ex) => ex instanceof Error || ex?.value instanceof Error ? _console.log("Deferred rejection", ex, "allocated at ", initLocation) : void 0);
  }
  return promise;
}
function isPromiseLike(x) {
  return x && typeof x === "object" && "then" in x && typeof x.then === "function";
}

// src/iterators.ts
var iterators_exports = {};
__export(iterators_exports, {
  Ignore: () => Ignore,
  Iterability: () => Iterability,
  asyncIterator: () => asyncIterator,
  augmentGlobalAsyncGenerators: () => augmentGlobalAsyncGenerators,
  combine: () => combine,
  defineIterableProperty: () => defineIterableProperty,
  filterMap: () => filterMap,
  generatorHelpers: () => generatorHelpers,
  isAsyncIter: () => isAsyncIter,
  isAsyncIterable: () => isAsyncIterable,
  isAsyncIterator: () => isAsyncIterator,
  iterableHelpers: () => iterableHelpers,
  merge: () => merge,
  queueIteratableIterator: () => queueIteratableIterator
});
var Iterability = Symbol("Iterability");
function isAsyncIterator(o) {
  return typeof o?.next === "function";
}
function isAsyncIterable(o) {
  return o && o[Symbol.asyncIterator] && typeof o[Symbol.asyncIterator] === "function";
}
function isAsyncIter(o) {
  return isAsyncIterable(o) || isAsyncIterator(o);
}
function asyncIterator(o) {
  if (isAsyncIterable(o)) return o[Symbol.asyncIterator]();
  if (isAsyncIterator(o)) return o;
  throw new Error("Not as async provider");
}
var asyncExtras = {
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
    return combine(Object.assign({ "_this": this }, others));
  }
};
var extraKeys = [...Object.getOwnPropertySymbols(asyncExtras), ...Object.keys(asyncExtras)];
function queueIteratableIterator(stop = () => {
}) {
  let _pending = [];
  let _items = [];
  const q = {
    [Symbol.asyncIterator]() {
      return q;
    },
    next() {
      if (_items?.length) {
        return Promise.resolve({ done: false, value: _items.shift() });
      }
      const value = deferred();
      value.catch((ex) => {
      });
      _pending.push(value);
      return value;
    },
    return() {
      const value = { done: true, value: void 0 };
      if (_pending) {
        try {
          stop();
        } catch (ex) {
        }
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
        } catch (ex) {
        }
        while (_pending.length)
          _pending.shift().reject(value);
        _items = _pending = null;
      }
      return Promise.reject(value);
    },
    get length() {
      if (!_items) return -1;
      return _items.length;
    },
    push(value) {
      if (!_pending) {
        return false;
      }
      if (_pending.length) {
        _pending.shift().resolve({ done: false, value });
      } else {
        if (!_items) {
          _console.log("Discarding queue push as there are no consumers");
        } else {
          _items.push(value);
        }
      }
      return true;
    }
  };
  return iterableHelpers(q);
}
function defineIterableProperty(obj, name, v) {
  let initIterator = () => {
    initIterator = () => b;
    const bi = queueIteratableIterator();
    const mi = bi.multi();
    const b = mi[Symbol.asyncIterator]();
    extras[Symbol.asyncIterator] = {
      value: mi[Symbol.asyncIterator],
      enumerable: false,
      writable: false
    };
    push = bi.push;
    extraKeys.forEach(
      (k) => extras[k] = {
        // @ts-ignore - Fix
        value: b[k],
        enumerable: false,
        writable: false
      }
    );
    Object.defineProperties(a, extras);
    return b;
  };
  function lazyAsyncMethod(method) {
    return {
      [method]: function(...args) {
        initIterator();
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
  extraKeys.forEach(
    (k) => extras[k] = {
      enumerable: false,
      writable: true,
      // @ts-ignore - Fix
      value: lazyAsyncMethod(k)
    }
  );
  let push = (v2) => {
    initIterator();
    return push(v2);
  };
  if (typeof v === "object" && v && Iterability in v) {
    extras[Iterability] = Object.getOwnPropertyDescriptor(v, Iterability);
  }
  let a = box(v, extras);
  let piped = void 0;
  Object.defineProperty(obj, name, {
    get() {
      return a;
    },
    set(v2) {
      if (v2 !== a) {
        if (isAsyncIterable(v2)) {
          if (piped === v2)
            return;
          piped = v2;
          let stack = DEBUG ? new Error() : void 0;
          if (DEBUG)
            _console.info(
              new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`)
            );
          consume.call(v2, (y) => {
            if (v2 !== piped) {
              throw new Error(`Piped iterable "${name.toString()}" has been replaced by another iterator`, { cause: stack });
            }
            push(y?.valueOf());
          }).catch((ex) => _console.info(ex)).finally(() => v2 === piped && (piped = void 0));
          return;
        } else {
          if (piped) {
            throw new Error(`Iterable "${name.toString()}" is already piped from another iterator`);
          }
          a = box(v2, extras);
        }
      }
      push(v2?.valueOf());
    },
    enumerable: true
  });
  return obj;
  function box(a2, pds) {
    let boxedObject = Ignore;
    if (a2 === null || a2 === void 0) {
      return Object.create(null, {
        ...pds,
        valueOf: { value() {
          return a2;
        }, writable: true },
        toJSON: { value() {
          return a2;
        }, writable: true }
      });
    }
    switch (typeof a2) {
      case "object":
        if (!(Symbol.asyncIterator in a2)) {
          if (boxedObject === Ignore) {
            if (DEBUG)
              _console.info(`The iterable property '${name.toString()}' of type "object" will be spread to prevent re-initialisation.
${new Error().stack?.slice(6)}`);
            if (Array.isArray(a2))
              boxedObject = Object.defineProperties([...a2], pds);
            else
              boxedObject = Object.defineProperties({ ...a2 }, pds);
          } else {
            Object.assign(boxedObject, a2);
          }
          if (boxedObject[Iterability] === "shallow") {
            boxedObject = Object.defineProperties(boxedObject, pds);
            return boxedObject;
          }
          const extraBoxed = new Proxy(boxedObject, {
            // Implement the logic that fires the iterator by re-assigning the iterable via it's setter
            set(target, key, value, receiver) {
              if (Reflect.set(target, key, value, receiver)) {
                push(obj[name]);
                return true;
              }
              return false;
            },
            // Implement the logic that returns a mapped iterator for the specified field
            get(target, key, receiver) {
              if (key === "valueOf")
                return () => boxedObject;
              const targetProp = Reflect.getOwnPropertyDescriptor(target, key);
              if (targetProp === void 0 || targetProp.enumerable) {
                if (targetProp === void 0) {
                  target[key] = void 0;
                }
                const realValue = Reflect.get(boxedObject, key, receiver);
                const props = Object.getOwnPropertyDescriptors(
                  boxedObject.map((o, p) => {
                    const ov = o?.[key]?.valueOf();
                    const pv = p?.valueOf();
                    if (typeof ov === typeof pv && ov == pv)
                      return Ignore;
                    return ov;
                  })
                );
                Reflect.ownKeys(props).forEach((k) => props[k].enumerable = false);
                return box(realValue, props);
              }
              return Reflect.get(target, key, receiver);
            }
          });
          return extraBoxed;
        }
        return a2;
      case "bigint":
      case "boolean":
      case "number":
      case "string":
        return Object.defineProperties(Object(a2), {
          ...pds,
          toJSON: { value() {
            return a2.valueOf();
          }, writable: true }
        });
    }
    throw new TypeError('Iterable properties cannot be of type "' + typeof a2 + '"');
  }
}
var merge = (...ai) => {
  const it = new Array(ai.length);
  const promises = new Array(ai.length);
  let init = () => {
    init = () => {
    };
    for (let n = 0; n < ai.length; n++) {
      const a = ai[n];
      promises[n] = (it[n] = Symbol.asyncIterator in a ? a[Symbol.asyncIterator]() : a).next().then((result) => ({ idx: n, result }));
    }
  };
  const results = [];
  const forever = new Promise(() => {
  });
  let count = promises.length;
  const merged = {
    [Symbol.asyncIterator]() {
      return merged;
    },
    next() {
      init();
      return count ? Promise.race(promises).then(({ idx, result }) => {
        if (result.done) {
          count--;
          promises[idx] = forever;
          results[idx] = result.value;
          return merged.next();
        } else {
          promises[idx] = it[idx] ? it[idx].next().then((result2) => ({ idx, result: result2 })).catch((ex) => ({ idx, result: { done: true, value: ex } })) : Promise.resolve({ idx, result: { done: true, value: void 0 } });
          return result;
        }
      }).catch((ex) => {
        return merged.throw?.(ex) ?? Promise.reject({ done: true, value: new Error("Iterator merge exception") });
      }) : Promise.resolve({ done: true, value: results });
    },
    async return(r) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          results[i] = await it[i]?.return?.({ done: true, value: r }).then((v) => v.value, (ex) => ex);
        }
      }
      return { done: true, value: results };
    },
    async throw(ex) {
      for (let i = 0; i < it.length; i++) {
        if (promises[i] !== forever) {
          promises[i] = forever;
          results[i] = await it[i]?.throw?.(ex).then((v) => v.value, (ex2) => ex2);
        }
      }
      return { done: true, value: results };
    }
  };
  return iterableHelpers(merged);
};
var combine = (src, opts = {}) => {
  const accumulated = {};
  let pc;
  let si = [];
  let active = 0;
  const forever = new Promise(() => {
  });
  const ci = {
    [Symbol.asyncIterator]() {
      return ci;
    },
    next() {
      if (pc === void 0) {
        pc = Object.entries(src).map(([k, sit], idx) => {
          active += 1;
          si[idx] = sit[Symbol.asyncIterator]();
          return si[idx].next().then((ir) => ({ si, idx, k, ir }));
        });
      }
      return function step() {
        return Promise.race(pc).then(({ idx, k, ir }) => {
          if (ir.done) {
            pc[idx] = forever;
            active -= 1;
            if (!active)
              return { done: true, value: void 0 };
            return step();
          } else {
            accumulated[k] = ir.value;
            pc[idx] = si[idx].next().then((ir2) => ({ idx, k, ir: ir2 }));
          }
          if (opts.ignorePartial) {
            if (Object.keys(accumulated).length < Object.keys(src).length)
              return step();
          }
          return { done: false, value: accumulated };
        });
      }();
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
  return isAsyncIterable(i) && extraKeys.every((k) => k in i && i[k] === asyncExtras[k]);
}
function iterableHelpers(ai) {
  if (!isExtraIterable(ai)) {
    Object.defineProperties(
      ai,
      Object.fromEntries(
        Object.entries(Object.getOwnPropertyDescriptors(asyncExtras)).map(
          ([k, v]) => [k, { ...v, enumerable: false }]
        )
      )
    );
  }
  return ai;
}
function generatorHelpers(g) {
  return function(...args) {
    const ai = g(...args);
    return iterableHelpers(ai);
  };
}
async function consume(f) {
  let last = void 0;
  for await (const u of this) {
    last = f?.(u);
  }
  await last;
}
var Ignore = Symbol("Ignore");
function resolveSync(v, then, except) {
  if (isPromiseLike(v))
    return v.then(then, except);
  try {
    return then(v);
  } catch (ex) {
    return except(ex);
  }
}
function filterMap(source, fn, initialValue = Ignore) {
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
        ai.next(...args).then(
          (p) => p.done ? resolve(p) : resolveSync(
            fn(p.value, prev),
            (f) => f === Ignore ? step(resolve, reject) : resolve({ done: false, value: prev = f }),
            (ex) => {
              ai.throw ? ai.throw(ex) : ai.return?.(ex);
              reject({ done: true, value: ex });
            }
          ),
          (ex) => (
            // The source threw. Tell the consumer
            reject({ done: true, value: ex })
          )
        ).catch((ex) => {
          ai.throw ? ai.throw(ex) : ai.return?.(ex);
          reject({ done: true, value: ex });
        });
      });
    },
    throw(ex) {
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then((v) => ({ done: true, value: v?.value }));
    },
    return(v) {
      return Promise.resolve(ai?.return?.(v)).then((v2) => ({ done: true, value: v2?.value }));
    }
  };
  return iterableHelpers(fai);
}
function map(mapper) {
  return filterMap(this, mapper);
}
function filter(fn) {
  return filterMap(this, async (o) => await fn(o) ? o : Ignore);
}
function unique(fn) {
  return fn ? filterMap(this, async (o, p) => p === Ignore || await fn(o, p) ? o : Ignore) : filterMap(this, (o, p) => o === p ? Ignore : o);
}
function initially(initValue) {
  return filterMap(this, (o) => o, initValue);
}
function waitFor(cb) {
  return filterMap(this, (o) => new Promise((resolve) => {
    cb(() => resolve(o));
    return o;
  }));
}
function multi() {
  const source = this;
  let consumers = 0;
  let current;
  let ai = void 0;
  function step(it) {
    if (it) current.resolve(it);
    if (!it?.done) {
      current = deferred();
      ai.next().then(step).catch((error) => current.reject({ done: true, value: error }));
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
      return current;
    },
    throw(ex) {
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: ex });
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then((v) => ({ done: true, value: v?.value }));
    },
    return(v) {
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: v });
      return Promise.resolve(ai?.return?.(v)).then((v2) => ({ done: true, value: v2?.value }));
    }
  };
  return iterableHelpers(mai);
}
function augmentGlobalAsyncGenerators() {
  let g = async function* () {
  }();
  while (g) {
    const desc = Object.getOwnPropertyDescriptor(g, Symbol.asyncIterator);
    if (desc) {
      iterableHelpers(g);
      break;
    }
    g = Object.getPrototypeOf(g);
  }
  if (!g) {
    _console.warn("Failed to augment the prototype of `(async function*())()`");
  }
}

// src/when.ts
var eventObservations = /* @__PURE__ */ new Map();
function docEventHandler(ev) {
  const observations = eventObservations.get(ev.type);
  if (observations) {
    for (const o of observations) {
      try {
        const { push, terminate, container, selector } = o;
        if (!document.body.contains(container)) {
          const msg = "Container `#" + container.id + ">" + (selector || "") + "` removed from DOM. Removing subscription";
          observations.delete(o);
          terminate(new Error(msg));
        } else {
          if (ev.target instanceof Node) {
            if (selector) {
              const nodes = container.querySelectorAll(selector);
              for (const n of nodes) {
                if ((ev.target === n || n.contains(ev.target)) && container.contains(n))
                  push(ev);
              }
            } else {
              if (ev.target === container || container.contains(ev.target))
                push(ev);
            }
          }
        }
      } catch (ex) {
        _console.warn("docEventHandler", ex);
      }
    }
  }
}
function isCSSSelector(s) {
  return Boolean(s && (s.startsWith("#") || s.startsWith(".") || s.startsWith("[") && s.endsWith("]")));
}
function parseWhenSelector(what) {
  const parts = what.split(":");
  if (parts.length === 1) {
    if (isCSSSelector(parts[0]))
      return [parts[0], "change"];
    return [null, parts[0]];
  }
  if (parts.length === 2) {
    if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
      return [parts[1], parts[0]];
  }
  return void 0;
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
    eventObservations.set(eventName, /* @__PURE__ */ new Set());
  }
  const queue = queueIteratableIterator(() => eventObservations.get(eventName)?.delete(details));
  const details = {
    push: queue.push,
    terminate(ex) {
      queue.return?.(ex);
    },
    container,
    selector: selector || null
  };
  containerAndSelectorsMounted(container, selector ? [selector] : void 0).then((_) => eventObservations.get(eventName).add(details));
  return queue.multi();
}
async function* neverGonnaHappen() {
  await new Promise(() => {
  });
  yield void 0;
}
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
    throw new Error("Falsy async source will never be ready\n\n" + JSON.stringify(what));
  return typeof what === "string" && what[0] !== "@" && Boolean(parseWhenSelector(what));
}
async function* once(p) {
  yield p;
}
function when(container, ...sources) {
  if (!sources || sources.length === 0) {
    return chainAsync(whenEvent(container, "change"));
  }
  const iterators = sources.filter((what) => typeof what !== "string" || what[0] !== "@").map((what) => typeof what === "string" ? whenEvent(container, what) : what instanceof Element ? whenEvent(what, "change") : isPromiseLike(what) ? once(what) : what);
  if (sources.includes("@start")) {
    const start = {
      [Symbol.asyncIterator]: () => start,
      next() {
        start.next = () => Promise.resolve({ done: true, value: void 0 });
        return Promise.resolve({ done: false, value: {} });
      }
    };
    iterators.push(start);
  }
  if (sources.includes("@ready")) {
    let isMissing2 = function(sel) {
      return Boolean(typeof sel === "string" && !container.querySelector(sel));
    };
    var isMissing = isMissing2;
    const watchSelectors = sources.filter(isValidWhenSelector).map((what) => parseWhenSelector(what)?.[0]);
    const missing = watchSelectors.filter(isMissing2);
    let events = void 0;
    const ai = {
      [Symbol.asyncIterator]() {
        return ai;
      },
      throw(ex) {
        if (events?.throw) return events.throw(ex);
        return Promise.resolve({ done: true, value: ex });
      },
      return(v) {
        if (events?.return) return events.return(v);
        return Promise.resolve({ done: true, value: v });
      },
      next() {
        if (events) return events.next();
        return containerAndSelectorsMounted(container, missing).then(() => {
          const merged2 = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : neverGonnaHappen();
          events = merged2[Symbol.asyncIterator]();
          if (!events)
            return { done: true, value: void 0 };
          return { done: false, value: {} };
        });
      }
    };
    return chainAsync(iterableHelpers(ai));
  }
  const merged = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : neverGonnaHappen();
  return chainAsync(iterableHelpers(merged));
}
function elementIsInDOM(elt) {
  if (document.body.contains(elt))
    return Promise.resolve();
  return new Promise((resolve) => new MutationObserver((records, mutation) => {
    if (records.some((r) => r.addedNodes?.length)) {
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
  missing = missing.filter((sel) => !container.querySelector(sel));
  if (!missing.length) {
    return Promise.resolve();
  }
  const promise = new Promise((resolve) => new MutationObserver((records, mutation) => {
    if (records.some((r) => r.addedNodes?.length)) {
      if (missing.every((sel) => container.querySelector(sel))) {
        mutation.disconnect();
        resolve();
      }
    }
  }).observe(container, {
    subtree: true,
    childList: true
  }));
  if (DEBUG) {
    const stack = new Error().stack?.replace(/^Error/, "Missing selectors after 5 seconds:");
    const warnTimer = setTimeout(() => {
      _console.warn(stack, missing);
    }, timeOutWarn);
    promise.finally(() => clearTimeout(warnTimer));
  }
  return promise;
}

// src/ai-ui.ts
var UniqueID = Symbol("Unique ID");
var idCount = 0;
var standandTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];
var elementProtype = {
  get ids() {
    return getElementIdMap(this);
  },
  set ids(v) {
    throw new Error("Cannot set ids on " + this.valueOf());
  },
  when: function(...what) {
    return when(this, ...what);
  }
};
var poStyleElt = document.createElement("STYLE");
poStyleElt.id = "--ai-ui-extended-tag-styles-";
function isChildTag(x) {
  return typeof x === "string" || typeof x === "number" || typeof x === "boolean" || x instanceof Node || x instanceof NodeList || x instanceof HTMLCollection || x === null || x === void 0 || Array.isArray(x) || isPromiseLike(x) || isAsyncIter(x) || typeof x === "object" && Symbol.iterator in x && typeof x[Symbol.iterator] === "function";
}
var callStackSymbol = Symbol("callStack");
var tag = function(_1, _2, _3) {
  const [nameSpace, tags, options] = typeof _1 === "string" || _1 === null ? [_1, _2, _3] : Array.isArray(_1) ? [null, _1, _2] : [null, standandTags, _1];
  function mutationTracker(track) {
    const tracked = /* @__PURE__ */ new WeakSet();
    function walk(nodes2) {
      for (const node of nodes2) {
        if (track === "addedNodes" === node.isConnected) {
          walk(node.childNodes);
          tracked.add(node);
        }
      }
    }
    new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === "childList" && m.removedNodes.length) {
          walk(m[track]);
        }
      });
    }).observe(document.body, { subtree: true, childList: true });
    return function(node) {
      return tracked.has(node);
    };
  }
  const removedNodes = mutationTracker("removedNodes");
  const commonProperties = options?.commonProperties;
  const tagPrototypes = Object.create(
    null,
    Object.getOwnPropertyDescriptors(elementProtype)
    // We know it's not nested
  );
  Object.defineProperty(tagPrototypes, "attributes", {
    ...Object.getOwnPropertyDescriptor(Element.prototype, "attributes"),
    set(a) {
      if (isAsyncIter(a)) {
        const ai = isAsyncIterator(a) ? a : a[Symbol.asyncIterator]();
        const step = () => ai.next().then(
          ({ done, value }) => {
            assignProps(this, value);
            done || step();
          },
          (ex) => _console.warn(ex)
        );
        step();
      } else assignProps(this, a);
    }
  });
  if (commonProperties)
    deepDefine(tagPrototypes, commonProperties);
  function nodes(...c) {
    const appended = [];
    (function children(c2) {
      if (c2 === void 0 || c2 === null || c2 === Ignore)
        return;
      if (isPromiseLike(c2)) {
        const g = DomPromiseContainer();
        appended.push(g);
        c2.then(
          (r) => g.replaceWith(...nodes(r)),
          (x) => {
            _console.warn(x, g);
            g.replaceWith(DyamicElementError({ error: x }));
          }
        );
        return;
      }
      if (c2 instanceof Node) {
        appended.push(c2);
        return;
      }
      if (c2 && typeof c2 === "object" && Symbol.iterator in c2 && !(Symbol.asyncIterator in c2) && c2[Symbol.iterator]) {
        for (const d of c2) children(d);
        return;
      }
      if (isAsyncIter(c2)) {
        const insertionStack = DEBUG ? "\n" + new Error().stack?.replace(/^Error: /, "Insertion :") : "";
        const ap = isAsyncIterator(c2) ? c2 : c2[Symbol.asyncIterator]();
        const unboxed = c2.valueOf();
        const dpm = unboxed === void 0 || unboxed === c2 ? [DomPromiseContainer()] : nodes(unboxed);
        appended.push(...dpm);
        let t = dpm;
        let notYetMounted = true;
        let createdAt = Date.now() + timeOutWarn;
        const createdBy = DEBUG && new Error("Created by").stack;
        const error = (errorValue) => {
          const n = t.filter((n2) => Boolean(n2?.parentNode));
          if (n.length) {
            t = [DyamicElementError({ error: errorValue })];
            n[0].replaceWith(...t);
            n.slice(1).forEach((e) => e?.parentNode.removeChild(e));
          } else _console.warn("Can't report error", errorValue, createdBy, t);
        };
        const update = (es) => {
          if (!es.done) {
            try {
              const mounted = t.filter((e) => e?.parentNode && e.ownerDocument?.body.contains(e));
              const n = notYetMounted ? t : mounted;
              if (mounted.length) notYetMounted = false;
              if (!n.length || t.every((e) => removedNodes(e))) {
                const msg = "Element(s) have been removed from the document: " + insertionStack;
                ap.return?.(new Error(msg));
              }
              if (DEBUG && notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Async element not mounted after 5 seconds. If it is never mounted, it will leak.`, createdBy, t);
              }
              t = nodes(unbox(es.value));
              if (!t.length) t.push(DomPromiseContainer());
              n[0].replaceWith(...t);
              n.slice(1).forEach((e) => !t.includes(e) && e.parentNode?.removeChild(e));
              ap.next().then(update).catch(error);
            } catch (ex) {
              ap.return?.(ex);
            }
          }
        };
        ap.next().then(update).catch(error);
        return;
      }
      appended.push(document.createTextNode(c2.toString()));
    })(c);
    return appended;
  }
  if (!nameSpace) {
    Object.assign(tag, {
      nodes,
      // Build DOM Node[] from ChildTags
      UniqueID
    });
  }
  const plainObjectPrototype = Object.getPrototypeOf({});
  function deepDefine(d, s, declaration) {
    if (s === null || s === void 0 || typeof s !== "object" || s === d)
      return;
    for (const [k, srcDesc] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
      try {
        if ("value" in srcDesc) {
          const value = srcDesc.value;
          if (value && isAsyncIter(value)) {
            Object.defineProperty(d, k, srcDesc);
          } else {
            if (value && typeof value === "object" && !isPromiseLike(value)) {
              if (!(k in d)) {
                if (declaration) {
                  if (Object.getPrototypeOf(value) === plainObjectPrototype || !Object.getPrototypeOf(value)) {
                    deepDefine(srcDesc.value = {}, value);
                  } else if (Array.isArray(value)) {
                    deepDefine(srcDesc.value = [], value);
                  } else {
                    _console.warn(`Declared propety '${k}' is not a plain object and must be assigned by reference, possibly polluting other instances of this tag`, d, value);
                  }
                }
                Object.defineProperty(d, k, srcDesc);
              } else {
                if (value instanceof Node) {
                  _console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
                  d[k] = value;
                } else {
                  if (d[k] !== value) {
                    if (Array.isArray(d[k]) && d[k].length !== value.length) {
                      if (value.constructor === Object || value.constructor === Array) {
                        deepDefine(d[k] = new value.constructor(), value);
                      } else {
                        d[k] = value;
                      }
                    } else {
                      deepDefine(d[k], value);
                    }
                  }
                }
              }
            } else {
              if (s[k] !== void 0)
                d[k] = s[k];
            }
          }
        } else {
          Object.defineProperty(d, k, srcDesc);
        }
      } catch (ex) {
        _console.warn("deepAssign", k, s[k], ex);
        throw ex;
      }
    }
  }
  function unbox(a) {
    const v = a?.valueOf();
    return Array.isArray(v) ? Array.prototype.map.call(v, unbox) : v;
  }
  function assignProps(base, props) {
    if (!(callStackSymbol in props)) {
      (function assign(d, s) {
        if (s === null || s === void 0 || typeof s !== "object")
          return;
        const sourceEntries = Object.entries(Object.getOwnPropertyDescriptors(s));
        if (!Array.isArray(s)) {
          sourceEntries.sort((a, b) => {
            const desc = Object.getOwnPropertyDescriptor(d, a[0]);
            if (desc) {
              if ("value" in desc) return -1;
              if ("set" in desc) return 1;
              if ("get" in desc) return 0.5;
            }
            return 0;
          });
        }
        for (const [k, srcDesc] of sourceEntries) {
          try {
            if ("value" in srcDesc) {
              const value = srcDesc.value;
              if (isAsyncIter(value)) {
                assignIterable(value, k);
              } else if (isPromiseLike(value)) {
                value.then((value2) => {
                  if (value2 && typeof value2 === "object") {
                    if (isAsyncIter(value2)) {
                      assignIterable(value2, k);
                    } else {
                      assignObject(value2, k);
                    }
                  } else {
                    if (s[k] !== void 0)
                      d[k] = s[k];
                  }
                }, (error) => _console.log("Failed to set attribute", error));
              } else if (!isAsyncIter(value)) {
                if (value && typeof value === "object" && !isPromiseLike(value))
                  assignObject(value, k);
                else {
                  if (s[k] !== void 0)
                    d[k] = s[k];
                }
              }
            } else {
              Object.defineProperty(d, k, srcDesc);
            }
          } catch (ex) {
            _console.warn("assignProps", k, s[k], ex);
            throw ex;
          }
        }
        function assignIterable(value, k) {
          const ap = asyncIterator(value);
          let notYetMounted = true;
          let createdAt = Date.now() + timeOutWarn;
          const createdBy = DEBUG && new Error("Created by").stack;
          const update = (es) => {
            if (!es.done) {
              const value2 = unbox(es.value);
              if (typeof value2 === "object" && value2 !== null) {
                const destDesc = Object.getOwnPropertyDescriptor(d, k);
                if (k === "style" || !destDesc?.set)
                  assign(d[k], value2);
                else
                  d[k] = value2;
              } else {
                if (value2 !== void 0)
                  d[k] = value2;
              }
              const mounted = base.ownerDocument.contains(base);
              if (removedNodes(base) || !notYetMounted && !mounted) {
                const msg = `Element does not exist in document when setting async attribute '${k}'`;
                _console.info(msg, base);
                ap.return?.(new Error(msg));
                return;
              }
              if (mounted) notYetMounted = false;
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Element with async attribute '${k}' not mounted after 5 seconds. If it is never mounted, it will leak.`, createdBy, base);
              }
              ap.next().then(update).catch(error);
            }
          };
          const error = (errorValue) => {
            ap.return?.(errorValue);
            _console.warn("Dynamic attribute error", errorValue, k, d, createdBy, base);
            base.appendChild(DyamicElementError({ error: errorValue }));
          };
          ap.next().then(update).catch(error);
        }
        function assignObject(value, k) {
          if (value instanceof Node) {
            _console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes", k, value);
            d[k] = value;
          } else {
            if (!(k in d) || d[k] === value || Array.isArray(d[k]) && d[k].length !== value.length) {
              if (value.constructor === Object || value.constructor === Array) {
                const copy = new value.constructor();
                assign(copy, value);
                d[k] = copy;
              } else {
                d[k] = value;
              }
            } else {
              if (Object.getOwnPropertyDescriptor(d, k)?.set)
                d[k] = value;
              else
                assign(d[k], value);
            }
          }
        }
      })(base, props);
    }
  }
  function tagHasInstance(e) {
    for (let c = e.constructor; c; c = c.super) {
      if (c === this)
        return true;
    }
    return false;
  }
  function extended(_overrides) {
    const instanceDefinition = typeof _overrides !== "function" ? (instance) => Object.assign({}, _overrides, instance) : _overrides;
    const uniqueTagID = Date.now().toString(36) + (idCount++).toString(36) + Math.random().toString(36).slice(2);
    let staticExtensions = instanceDefinition({ [UniqueID]: uniqueTagID });
    if (staticExtensions.styles) {
      poStyleElt.appendChild(document.createTextNode(staticExtensions.styles + "\n"));
      if (!document.head.contains(poStyleElt)) {
        document.head.appendChild(poStyleElt);
      }
    }
    const extendTagFn = (attrs, ...children) => {
      const noAttrs = isChildTag(attrs);
      const newCallStack = [];
      const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack };
      const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
      e.constructor = extendTag;
      const tagDefinition = instanceDefinition({ [UniqueID]: uniqueTagID });
      combinedAttrs[callStackSymbol].push(tagDefinition);
      if (DEBUG) {
        let isAncestral2 = function(creator, d) {
          for (let f = creator; f; f = f.super)
            if (f.definition?.declare && d in f.definition.declare) return true;
          return false;
        };
        var isAncestral = isAncestral2;
        if (tagDefinition.declare) {
          const clash = Object.keys(tagDefinition.declare).filter((d) => d in e || isAncestral2(this, d));
          if (clash.length) {
            _console.log(`Declared keys '${clash}' in ${extendTag.name} already exist in base '${this.valueOf()}'`);
          }
        }
        if (tagDefinition.override) {
          const clash = Object.keys(tagDefinition.override).filter((d) => !(d in e) && !(commonProperties && d in commonProperties) && !isAncestral2(this, d));
          if (clash.length) {
            _console.log(`Overridden keys '${clash}' in ${extendTag.name} do not exist in base '${this.valueOf()}'`);
          }
        }
      }
      deepDefine(e, tagDefinition.declare, true);
      deepDefine(e, tagDefinition.override);
      tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach((k) => {
        if (k in e) {
          _console.log(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
        } else
          defineIterableProperty(e, k, tagDefinition.iterable[k]);
      });
      if (combinedAttrs[callStackSymbol] === newCallStack) {
        if (!noAttrs)
          assignProps(e, attrs);
        for (const base of newCallStack) {
          const children2 = base?.constructed?.call(e);
          if (isChildTag(children2))
            e.append(...nodes(children2));
        }
        for (const base of newCallStack) {
          if (base.iterable) for (const k of Object.keys(base.iterable)) {
            if (!(!noAttrs && k in attrs && (!isPromiseLike(attrs[k]) || !isAsyncIter(attrs[k])))) {
              const value = e[k];
              if (value?.valueOf() !== void 0) {
                e[k] = value;
              }
            }
          }
        }
      }
      return e;
    };
    const extendTag = Object.assign(extendTagFn, {
      super: this,
      definition: Object.assign(staticExtensions, { [UniqueID]: uniqueTagID }),
      extended,
      valueOf: () => {
        const keys = [...Object.keys(staticExtensions.declare || {}), ...Object.keys(staticExtensions.iterable || {})];
        return `${extendTag.name}: {${keys.join(", ")}}
 \u21AA ${this.valueOf()}`;
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
        deepDefine(fullProto, proto?.override);
        deepDefine(fullProto, proto?.declare);
      }
    })(this);
    deepDefine(fullProto, staticExtensions.override);
    deepDefine(fullProto, staticExtensions.declare);
    Object.defineProperties(extendTag, Object.getOwnPropertyDescriptors(fullProto));
    const creatorName = fullProto && "className" in fullProto && typeof fullProto.className === "string" ? fullProto.className : uniqueTagID;
    const callSite = DEBUG ? new Error().stack?.split("\n")[2] ?? "" : "";
    Object.defineProperty(extendTag, "name", {
      value: "<ai-" + creatorName.replace(/\s+/g, "-") + callSite + ">"
    });
    if (DEBUG) {
      const extraUnknownProps = Object.keys(staticExtensions).filter((k) => !["styles", "ids", "constructed", "declare", "override", "iterable"].includes(k));
      if (extraUnknownProps.length) {
        _console.log(`${extendTag.name} defines extraneous keys '${extraUnknownProps}', which are unknown`);
      }
    }
    return extendTag;
  }
  const baseTagCreators = {
    createElement(name, attrs, ...children) {
      return name === baseTagCreators.createElement ? nodes(...children) : typeof name === "function" ? name(attrs, children) : typeof name === "string" && name in baseTagCreators ? (
        // @ts-ignore: Expression produces a union type that is too complex to represent.ts(2590)
        baseTagCreators[name](attrs, children)
      ) : name instanceof Node ? name : DyamicElementError({ error: new Error("Illegal type in createElement:" + name) });
    }
  };
  function createTag(k) {
    if (baseTagCreators[k])
      return baseTagCreators[k];
    const tagCreator = (attrs, ...children) => {
      let doc = document;
      if (isChildTag(attrs)) {
        children.unshift(attrs);
        attrs = {};
      }
      if (!isChildTag(attrs)) {
        if (attrs.debugger) {
          debugger;
          delete attrs.debugger;
        }
        if (attrs.document) {
          doc = attrs.document;
          delete attrs.document;
        }
        const e = nameSpace ? doc.createElementNS(nameSpace, k.toLowerCase()) : doc.createElement(k);
        e.constructor = tagCreator;
        deepDefine(e, tagPrototypes);
        assignProps(e, attrs);
        e.append(...nodes(...children));
        return e;
      }
    };
    const includingExtender = Object.assign(tagCreator, {
      super: () => {
        throw new Error("Can't invoke native elemenet constructors directly. Use document.createElement().");
      },
      extended,
      // How to extend this (base) tag
      valueOf() {
        return `TagCreator: <${nameSpace || ""}${nameSpace ? "::" : ""}${k}>`;
      }
    });
    Object.defineProperty(tagCreator, Symbol.hasInstance, {
      value: tagHasInstance,
      writable: true,
      configurable: true
    });
    Object.defineProperty(tagCreator, "name", { value: "<" + k + ">" });
    return baseTagCreators[k] = includingExtender;
  }
  tags.forEach(createTag);
  return baseTagCreators;
};
var DomPromiseContainer = () => {
  return document.createComment(DEBUG ? new Error("promise").stack?.replace(/^Error: /, "") || "promise" : "promise");
};
var DyamicElementError = ({ error }) => {
  return document.createComment(error instanceof Error ? error.toString() : "Error:\n" + JSON.stringify(error, null, 2));
};
var enableOnRemovedFromDOM = function() {
  enableOnRemovedFromDOM = function() {
  };
  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === "childList") {
        m.removedNodes.forEach(
          (removed) => removed && removed instanceof Element && [...removed.getElementsByTagName("*"), removed].filter((elt) => !elt.ownerDocument.contains(elt)).forEach(
            (elt) => {
              "onRemovedFromDOM" in elt && typeof elt.onRemovedFromDOM === "function" && elt.onRemovedFromDOM();
            }
          )
        );
      }
    });
  }).observe(document.body, { subtree: true, childList: true });
};
var warned = /* @__PURE__ */ new Set();
function getElementIdMap(node, ids) {
  node = node || document;
  ids = ids || /* @__PURE__ */ Object.create(null);
  if (node.querySelectorAll) {
    node.querySelectorAll("[id]").forEach(function(elt) {
      if (elt.id) {
        if (!ids[elt.id])
          ids[elt.id] = elt;
        else if (DEBUG) {
          if (!warned.has(elt.id)) {
            warned.add(elt.id);
            _console.info("Shadowed multiple element IDs", elt.id, elt, ids[elt.id]);
          }
        }
      }
    });
  }
  return ids;
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG4vKiBBIGhvbGRlciBmb3IgY29tbW9uUHJvcGVydGllcyBzcGVjaWZpZWQgd2hlbiBgdGFnKC4uLnApYCBpcyBpbnZva2VkLCB3aGljaCBhcmUgYWx3YXlzXG4gIGFwcGxpZWQgKG1peGVkIGluKSB3aGVuIGFuIGVsZW1lbnQgaXMgY3JlYXRlZCAqL1xudHlwZSBUYWdGdW5jdGlvbk9wdGlvbnM8T3RoZXJNZW1iZXJzIGV4dGVuZHMge30gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM6IE90aGVyTWVtYmVyc1xufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG59XG5cbi8vIFN1cHBvcnQgZm9yIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2h0bSAob3IgaW1wb3J0IGh0bSBmcm9tICdodHRwczovL3VucGtnLmNvbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmludGVyZmFjZSBUYWdMb2FkZXIge1xuICBub2RlcyguLi5jOiBDaGlsZFRhZ3NbXSk6IChOb2RlIHwgKC8qUCAmKi8gKEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzKSkpW107XG4gIFVuaXF1ZUlEOiB0eXBlb2YgVW5pcXVlSURcblxuICAvKlxuICAgU2lnbmF0dXJlcyBmb3IgdGhlIHRhZyBsb2FkZXIuIEFsbCBwYXJhbXMgYXJlIG9wdGlvbmFsIGluIGFueSBjb21iaW5hdGlvbixcbiAgIGJ1dCBtdXN0IGJlIGluIG9yZGVyOlxuICAgICAgdGFnKFxuICAgICAgICAgID9uYW1lU3BhY2U/OiBzdHJpbmcsICAvLyBhYnNlbnQgbmFtZVNwYWNlIGltcGxpZXMgSFRNTFxuICAgICAgICAgID90YWdzPzogc3RyaW5nW10sICAgICAvLyBhYnNlbnQgdGFncyBkZWZhdWx0cyB0byBhbGwgY29tbW9uIEhUTUwgdGFnc1xuICAgICAgICAgID9jb21tb25Qcm9wZXJ0aWVzPzogQ29tbW9uUHJvcGVydGllc0NvbnN0cmFpbnQgLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyB7fT4odGFnczogVGFnc1tdLCBvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLFwiYWJiclwiLFwiYWRkcmVzc1wiLFwiYXJlYVwiLFwiYXJ0aWNsZVwiLFwiYXNpZGVcIixcImF1ZGlvXCIsXCJiXCIsXCJiYXNlXCIsXCJiZGlcIixcImJkb1wiLFwiYmxvY2txdW90ZVwiLFwiYm9keVwiLFwiYnJcIixcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFwiY2FwdGlvblwiLFwiY2l0ZVwiLFwiY29kZVwiLFwiY29sXCIsXCJjb2xncm91cFwiLFwiZGF0YVwiLFwiZGF0YWxpc3RcIixcImRkXCIsXCJkZWxcIixcImRldGFpbHNcIixcImRmblwiLFwiZGlhbG9nXCIsXCJkaXZcIixcbiAgXCJkbFwiLFwiZHRcIixcImVtXCIsXCJlbWJlZFwiLFwiZmllbGRzZXRcIixcImZpZ2NhcHRpb25cIixcImZpZ3VyZVwiLFwiZm9vdGVyXCIsXCJmb3JtXCIsXCJoMVwiLFwiaDJcIixcImgzXCIsXCJoNFwiLFwiaDVcIixcImg2XCIsXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXCJoZ3JvdXBcIixcImhyXCIsXCJodG1sXCIsXCJpXCIsXCJpZnJhbWVcIixcImltZ1wiLFwiaW5wdXRcIixcImluc1wiLFwia2JkXCIsXCJsYWJlbFwiLFwibGVnZW5kXCIsXCJsaVwiLFwibGlua1wiLFwibWFpblwiLFwibWFwXCIsXG4gIFwibWFya1wiLFwibWVudVwiLFwibWV0YVwiLFwibWV0ZXJcIixcIm5hdlwiLFwibm9zY3JpcHRcIixcIm9iamVjdFwiLFwib2xcIixcIm9wdGdyb3VwXCIsXCJvcHRpb25cIixcIm91dHB1dFwiLFwicFwiLFwicGljdHVyZVwiLFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcInFcIixcInJwXCIsXCJydFwiLFwicnVieVwiLFwic1wiLFwic2FtcFwiLFwic2NyaXB0XCIsXCJzZWFyY2hcIixcInNlY3Rpb25cIixcInNlbGVjdFwiLFwic2xvdFwiLFwic21hbGxcIixcInNvdXJjZVwiLFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFwic3R5bGVcIixcInN1YlwiLFwic3VtbWFyeVwiLFwic3VwXCIsXCJ0YWJsZVwiLFwidGJvZHlcIixcInRkXCIsXCJ0ZW1wbGF0ZVwiLFwidGV4dGFyZWFcIixcInRmb290XCIsXCJ0aFwiLFwidGhlYWRcIixcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFwidHJcIixcInRyYWNrXCIsXCJ1XCIsXCJ1bFwiLFwidmFyXCIsXCJ2aWRlb1wiLFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IGVsZW1lbnRQcm90eXBlOiBQb0VsZW1lbnRNZXRob2RzICYgVGhpc1R5cGU8RWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+ID0ge1xuICBnZXQgaWRzKCkge1xuICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gIH0sXG4gIHNldCBpZHModjogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICB9LFxuICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gIH1cbn1cblxuY29uc3QgcG9TdHlsZUVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbnBvU3R5bGVFbHQuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlcy1cIjtcblxuZnVuY3Rpb24gaXNDaGlsZFRhZyh4OiBhbnkpOiB4IGlzIENoaWxkVGFncyB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZydcbiAgICB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcidcbiAgICB8fCB0eXBlb2YgeCA9PT0gJ2Jvb2xlYW4nXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZUxpc3RcbiAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICB8fCB4ID09PSBudWxsXG4gICAgfHwgeCA9PT0gdW5kZWZpbmVkXG4gICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgIHx8IGlzUHJvbWlzZUxpa2UoeClcbiAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIHggJiYgdHlwZW9mIHhbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qIHRhZyAqL1xuY29uc3QgY2FsbFN0YWNrU3ltYm9sID0gU3ltYm9sKCdjYWxsU3RhY2snKTtcblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyB7fVxuPihcbiAgXzE6IFQxLFxuICBfMjogVDIsXG4gIF8zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+XG4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBFbGVtZW50Pj4ge1xuICB0eXBlIE5hbWVzcGFjZWRFbGVtZW50QmFzZSA9IFQxIGV4dGVuZHMgc3RyaW5nID8gVDEgZXh0ZW5kcyAnJyA/IEhUTUxFbGVtZW50IDogRWxlbWVudCA6IEhUTUxFbGVtZW50O1xuXG4gIC8qIFdvcmsgb3V0IHdoaWNoIHBhcmFtZXRlciBpcyB3aGljaC4gVGhlcmUgYXJlIDYgdmFyaWF0aW9uczpcbiAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgIHRhZyhjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdXVxuICAgIHRhZyh0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10pICAgICAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW10sIG9iamVjdF1cbiAgKi9cbiAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgb3B0aW9uc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICA/IFtfMSwgXzIgYXMgVGFnc1tdLCBfMyBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgPyBbbnVsbCwgXzEgYXMgVGFnc1tdLCBfMiBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl07XG5cbiAgLyogRE9NIG5vZGUgcmVtb3ZhbCBsb2dpYyAqL1xuICB0eXBlIFBpY2tCeVR5cGU8VCwgVmFsdWU+ID0ge1xuICAgIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxuICB9XG4gIGZ1bmN0aW9uIG11dGF0aW9uVHJhY2tlcih0cmFjazoga2V5b2YgUGlja0J5VHlwZTxNdXRhdGlvblJlY29yZCwgTm9kZUxpc3Q+KXtcbiAgICBjb25zdCB0cmFja2VkID0gbmV3IFdlYWtTZXQ8Tm9kZT4oKTtcbiAgICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCl7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICAgIGlmICgodHJhY2sgPT09ICdhZGRlZE5vZGVzJykgPT09IG5vZGUuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbS5yZW1vdmVkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgd2FsayhtW3RyYWNrXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICAgIHJldHVybiBmdW5jdGlvbihub2RlOiBOb2RlKSB7XG4gICAgICByZXR1cm4gdHJhY2tlZC5oYXMobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlZE5vZGVzID0gbXV0YXRpb25UcmFja2VyKCdyZW1vdmVkTm9kZXMnKTtcbiAgLy9jb25zdCBhZGRpdGlvbnMgPSBtdXRhdGlvblRyYWNrZXIoJ2FkZGVkTm9kZXMnKTtcblxuICBjb25zdCBjb21tb25Qcm9wZXJ0aWVzID0gb3B0aW9ucz8uY29tbW9uUHJvcGVydGllcztcbiAgLyogTm90ZTogd2UgdXNlIHByb3BlcnR5IGRlZmludGlvbiAoYW5kIG5vdCBvYmplY3Qgc3ByZWFkKSBzbyBnZXR0ZXJzIChsaWtlIGBpZHNgKVxuICAgIGFyZSBub3QgZXZhbHVhdGVkIHVudGlsIGNhbGxlZCAqL1xuICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGVsZW1lbnRQcm90eXBlKSwgLy8gV2Uga25vdyBpdCdzIG5vdCBuZXN0ZWRcbiAgKTtcblxuICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsJ2F0dHJpYnV0ZXMnKSxcbiAgICBzZXQoYTogb2JqZWN0KSB7XG4gICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9ICgpPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4gZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyKSksXG4gICAgICAgICAgKHg6YW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oeCxnKTtcbiAgICAgICAgICAgIGcucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogeH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1a255IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYykgY2hpbGRyZW4oZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG4gICAgICAgIGFwcGVuZGVkLnB1c2goLi4uZHBtKTtcblxuICAgICAgICBsZXQgdCA9IGRwbTtcbiAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IERFQlVHICYmIG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgbiA9IHQuZmlsdGVyKG4gPT4gQm9vbGVhbihuPy5wYXJlbnROb2RlKSkgYXMgQ2hpbGROb2RlW107XG4gICAgICAgICAgaWYgKG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0ID0gW0R5YW1pY0VsZW1lbnRFcnJvcih7ZXJyb3I6IGVycm9yVmFsdWV9KV07XG4gICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKC4uLnQpOyAvL2FwcGVuZEJlZm9yZShuWzBdLCAuLi50KTtcbiAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oIFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIGNyZWF0ZWRCeSwgdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PENoaWxkVGFncz4pID0+IHtcbiAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIENoaWxkTm9kZVtdLCBzaW5jZSB3ZSB0ZXN0ZWQgLnBhcmVudE5vZGVcbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHQuZmlsdGVyKGUgPT4gZT8ucGFyZW50Tm9kZSAmJiBlLm93bmVyRG9jdW1lbnQ/LmJvZHkuY29udGFpbnMoZSkpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHQgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAobW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoIHx8IHQuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMoZSkpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuYCxjcmVhdGVkQnksIHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICBpZiAoIXQubGVuZ3RoKSB0LnB1c2goRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgKG5bMF0gYXMgQ2hpbGROb2RlKS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIGFwLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwcGVuZGVkLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKSk7XG4gICAgfSkoYyk7XG4gICAgcmV0dXJuIGFwcGVuZGVkO1xuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZyx7XG4gICAgICBub2RlcywgICAgLy8gQnVpbGQgRE9NIE5vZGVbXSBmcm9tIENoaWxkVGFnc1xuICAgICAgVW5pcXVlSURcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgY29uc3QgcGxhaW5PYmplY3RQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pO1xuICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZDogUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgYW55PiwgczogYW55LCBkZWNsYXJhdGlvbj86IHRydWUpOiB2b2lkIHtcbiAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzb3VyY2UgdmFsdWUgaXMgYW4gb2JqZWN0LCBhbmQgd2UncmUgZGVjbGFyaW5nIGl0ICh0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGEgbmV3IG9uZSksIHRha2VcbiAgICAgICAgICAgICAgICAvLyBhIGNvcHkgc28gYXMgdG8gbm90IHJlLXVzZSB0aGUgcmVmZXJlbmNlIGFuZCBwb2xsdXRlIHRoZSBkZWNsYXJhdGlvbi4gTm90ZTogdGhpcyBpcyBwcm9iYWJseVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuJ3QgYmUgY29waWVkXG4gICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSA9PT0gcGxhaW5PYmplY3RQcm90b3R5cGUgfHwgIU9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwbGFpbiBvYmplY3QgY2FuIGJlIGRlZXAtY29waWVkIGJ5IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIGFycmF5IGNhbiBiZSBkZWVwIGNvcGllZCBieSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSBbXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgb2JqZWN0IGxpa2UgdGhpbmdzIChyZWdleHBzLCBkYXRlcywgY2xhc3NlcywgZXRjKSBjYW4ndCBiZSBkZWVwLWNvcGllZCByZWxpYWJseVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERlY2xhcmVkIHByb3BldHkgJyR7a30nIGlzIG5vdCBhIHBsYWluIG9iamVjdCBhbmQgbXVzdCBiZSBhc3NpZ25lZCBieSByZWZlcmVuY2UsIHBvc3NpYmx5IHBvbGx1dGluZyBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyB0YWdgLCBkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybiggXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5ib3goYTogdW5rbm93bik6IHVua25vd24ge1xuICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodix1bmJveCkgOiB2O1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZTogRWxlbWVudCwgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgIGlmICghKGNhbGxTdGFja1N5bWJvbCBpbiBwcm9wcykpIHtcbiAgICAgIChmdW5jdGlvbiBhc3NpZ24oZDogYW55LCBzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wcyBiZWZvcmUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgIGNvbnN0IHNvdXJjZUVudHJpZXMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSk7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzKSkge1xuICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSxiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLGFbMF0pO1xuICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYykgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICBpZiAoJ3NldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKSByZXR1cm4gMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHNldCBhdHRyaWJ1dGVcIiwgZXJyb3IpKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2Uub3duZXJEb2N1bWVudC5jb250YWlucyhiYXNlKTtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBiZWVuIG1vdW50ZWQgYmVmb3JlLCBiaXQgYXJlbid0IG5vdywgcmVtb3ZlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICBpZiAocmVtb3ZlZE5vZGVzKGJhc2UpIHx8ICghbm90WWV0TW91bnRlZCAmJiAhbW91bnRlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgRWxlbWVudCBkb2VzIG5vdCBleGlzdCBpbiBkb2N1bWVudCB3aGVuIHNldHRpbmcgYXN5bmMgYXR0cmlidXRlICcke2t9J2A7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKG1zZyxiYXNlKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIGJhc2UpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oIFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgY3JlYXRlZEJ5LCBiYXNlKTtcbiAgICAgICAgICAgIGJhc2UuYXBwZW5kQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlc1wiLCBrLCB2YWx1ZSk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICB0eXBlIEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzOntcbiAgICBkZWJ1Z2dlcj86IHVua25vd247XG4gICAgZG9jdW1lbnQ/OiBEb2N1bWVudDtcbiAgICBbY2FsbFN0YWNrU3ltYm9sXT86IE92ZXJyaWRlc1tdO1xuICAgIFtrOiBzdHJpbmddOiB1bmtub3duO1xuICB9IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IEVsZW1lbnRcblxuICBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgICBzdXBlcjogVGFnQ3JlYXRvcjxFbGVtZW50PjtcbiAgICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gICAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICAgIGV4dGVuZGVkOiAodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSA9PiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSxfb3ZlcnJpZGVzLGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpKyhpZENvdW50KyspLnRvU3RyaW5nKDM2KStNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgICAgaWYgKCFkb2N1bWVudC5oZWFkLmNvbnRhaW5zKHBvU3R5bGVFbHQpKSB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycykgO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayAgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBmdW5jdGlvbiBpc0FuY2VzdHJhbChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBkOiBzdHJpbmcpIHtcbiAgICAgICAgICBmb3IgKGxldCBmID0gY3JlYXRvcjsgZjsgZiA9IGYuc3VwZXIpXG4gICAgICAgICAgICBpZiAoZi5kZWZpbml0aW9uPy5kZWNsYXJlICYmIGQgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihkID0+IChkIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsZCkpO1xuICAgICAgICAgIGlmIChjbGFzaC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBEZWNsYXJlZCBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gYWxyZWFkeSBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpLmZpbHRlcihkID0+ICEoZCBpbiBlKSAmJiAhKGNvbW1vblByb3BlcnRpZXMgJiYgZCBpbiBjb21tb25Qcm9wZXJ0aWVzKSAmJiAhaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGUhW2sgYXMga2V5b2YgdHlwZW9mIHRhZ0RlZmluaXRpb24uaXRlcmFibGVdKVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgaWYgKCEoIW5vQXR0cnMgJiYgayBpbiBhdHRycyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV07XG4gICAgICAgICAgICAgIGlmICh2YWx1ZT8udmFsdWVPZigpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBlW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csJy0nKSArIGNhbGxTaXRlK1wiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgICAgcmV0dXJuIChuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IG5vZGVzKC4uLmNoaWxkcmVuKVxuICAgICAgICAgIDogdHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicgPyBuYW1lKGF0dHJzLCBjaGlsZHJlbilcbiAgICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICAgIDogbmFtZSBpbnN0YW5jZW9mIE5vZGUgPyBuYW1lXG4gICAgICAgICAgOiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogbmV3IEVycm9yKFwiSWxsZWdhbCB0eXBlIGluIGNyZWF0ZUVsZW1lbnQ6XCIgKyBuYW1lKX0pKSBhcyBOb2RlXG4gICAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oazogSyk6IFRhZ0NyZWF0b3I8USAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWc8RSBleHRlbmRzIEVsZW1lbnQ+KGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIEUgJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnKGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIE5hbWVzcGFjZWRFbGVtZW50QmFzZSAmIFBvRWxlbWVudE1ldGhvZHM+IHtcbiAgICBpZiAoYmFzZVRhZ0NyZWF0b3JzW2tdKVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXTtcblxuICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnM6IFEgJiBQb0VsZW1lbnRNZXRob2RzICYgUGFydGlhbDx7XG4gICAgICBkZWJ1Z2dlcj86IGFueTtcbiAgICAgIGRvY3VtZW50PzogRG9jdW1lbnQ7XG4gICAgfT4gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4ge1xuICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQoYXR0cnMpO1xuICAgICAgICBhdHRycyA9IHt9IGFzIGFueTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICBkZWxldGUgYXR0cnMuZGVidWdnZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UgYXMgc3RyaW5nLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKT0+eyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBpbnZva2UgbmF0aXZlIGVsZW1lbmV0IGNvbnN0cnVjdG9ycyBkaXJlY3RseS4gVXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cIikgfSxcbiAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICB9XG5cbiAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufVxuXG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gKCkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChERUJVRyA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiIDogXCJwcm9taXNlXCIpXG59XG5cbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9ICh7IGVycm9yIH06eyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj59KSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicrSlNPTi5zdHJpbmdpZnkoZXJyb3IsbnVsbCwyKSk7XG59XG5cbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHt9IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChcbiAgICAgICAgICByZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0Lm93bmVyRG9jdW1lbnQuY29udGFpbnMoZWx0KSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAnb25SZW1vdmVkRnJvbURPTScgaW4gZWx0ICYmIHR5cGVvZiBlbHQub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJyAmJiBlbHQub25SZW1vdmVkRnJvbURPTSgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG5jb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50SWRNYXAobm9kZT86IEVsZW1lbnQgfCBEb2N1bWVudCwgaWRzPzogUmVjb3JkPHN0cmluZywgRWxlbWVudD4pIHtcbiAgbm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG4gIGlkcyA9IGlkcyB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbHQpIHtcbiAgICAgIGlmIChlbHQuaWQpIHtcbiAgICAgICAgaWYgKCFpZHMhW2VsdC5pZF0pXG4gICAgICAgICAgaWRzIVtlbHQuaWRdID0gZWx0O1xuICAgICAgICBlbHNlIGlmIChERUJVRykge1xuICAgICAgICAgIGlmICghd2FybmVkLmhhcyhlbHQuaWQpKSB7XG4gICAgICAgICAgICB3YXJuZWQuYWRkKGVsdC5pZClcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyggXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQsIGVsdCwgaWRzIVtlbHQuaWRdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaWRzO1xufVxuIiwgIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pIHx8IGZhbHNlO1xuZXhwb3J0IHsgX2NvbnNvbGUgYXMgY29uc29sZSB9O1xuZXhwb3J0IGNvbnN0IHRpbWVPdXRXYXJuID0gNTAwMDtcblxuY29uc3QgX2NvbnNvbGUgPSB7XG4gIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCcoQUktVUkpIExPRzonLCAuLi5hcmdzKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncylcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuZGVidWcoJyhBSS1VSSkgSU5GTzonLCAuLi5hcmdzKVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5cbi8vIENyZWF0ZSBhIGRlZmVycmVkIFByb21pc2UsIHdoaWNoIGNhbiBiZSBhc3luY2hyb25vdXNseS9leHRlcm5hbGx5IHJlc29sdmVkIG9yIHJlamVjdGVkLlxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2OiBhbnkpPT57fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiAoJ3RoZW4nIGluIHgpICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiXG5pbXBvcnQgeyBEZWZlcnJlZFByb21pc2UsIGRlZmVycmVkLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlpblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdCB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoZW4gKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnRseSBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgb25lLWxldmVsIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLHR5cGVvZiBJdGVyYWJpbGl0eT5dOiBJdGVyYWJsZVR5cGU8SVBbS10+XG59IDoge1xuICBbSyBpbiBrZXlvZiBJUF06IChJUFtLXSBleHRlbmRzIG9iamVjdCA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT4gOiBJUFtLXSkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG59XG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIG8gJiYgb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXI8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pXG59XG5cbmV4cG9ydCB0eXBlIEFzeW5jUHJvdmlkZXI8VD4gPSBBc3luY0l0ZXJhdG9yPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPlxuXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNJdGVyYXRvcjxUPihvOiBBc3luY1Byb3ZpZGVyPFQ+KSB7XG4gIGlmIChpc0FzeW5jSXRlcmFibGUobykpIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFzIGFzeW5jIHByb3ZpZGVyXCIpO1xufVxuXG50eXBlIEFzeW5jSXRlcmFibGVIZWxwZXJzID0gdHlwZW9mIGFzeW5jRXh0cmFzO1xuY29uc3QgYXN5bmNFeHRyYXMgPSB7XG4gIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLFxuICAgIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICAgIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbiAgKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlKVxuICB9LFxuICBtYXAsXG4gIGZpbHRlcixcbiAgdW5pcXVlLFxuICB3YWl0Rm9yLFxuICBtdWx0aSxcbiAgaW5pdGlhbGx5LFxuICBjb25zdW1lLFxuICBtZXJnZTxULCBBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+W10+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgLi4ubTogQSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgfSxcbiAgY29tYmluZTxULCBTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCBvdGhlcnM6IFMpIHtcbiAgICByZXR1cm4gY29tYmluZShPYmplY3QuYXNzaWduKHsgJ190aGlzJzogdGhpcyB9LCBvdGhlcnMpKTtcbiAgfVxufTtcblxuY29uc3QgZXh0cmFLZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYXN5bmNFeHRyYXMpLCAuLi5PYmplY3Qua2V5cyhhc3luY0V4dHJhcyldIGFzIChrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXMpW107XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGxldCBfcGVuZGluZyA9IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGw7XG4gIGxldCBfaXRlbXM6IFRbXSB8IG51bGwgPSBbXTtcblxuICBjb25zdCBxOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHE7XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAoX2l0ZW1zPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogX2l0ZW1zLnNoaWZ0KCkhIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHEgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgX3BlbmRpbmchLnB1c2godmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4oKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgX3BlbmRpbmcuc2hpZnQoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIF9pdGVtcyA9IF9wZW5kaW5nID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAoX3BlbmRpbmcpIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKF9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpIS5yZWplY3QodmFsdWUpO1xuICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFfaXRlbXMpIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIF9pdGVtcy5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghX3BlbmRpbmcpIHtcbiAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoX3BlbmRpbmcubGVuZ3RoKSB7XG4gICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIV9pdGVtcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9pdGVtcy5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFY+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8UmVjb3JkPE4sIFY+PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7XG4gICAgICB2YWx1ZTogbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9O1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT5cbiAgICAgIGV4dHJhc1trXSA9IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICB2YWx1ZTogYltrIGFzIGtleW9mIHR5cGVvZiBiXSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgIH1cbiAgfSBhcyBIZWxwZXJEZXNjcmlwdG9yczxWPjtcblxuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT5cbiAgICBleHRyYXNba10gPSB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH1cbiAgKVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2KSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodiwgSXRlcmFiaWxpdHkpITtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWKSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHY7XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiBhc3NpZ25lZCB0byBjb25zdW1lIGFub3RoZXIgaXRlcmF0b3IuIERpZCB5b3UgbWVhbiB0byBkZWNsYXJlIGl0P2ApKTtcbiAgICAgICAgICBjb25zdW1lLmNhbGwodix5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCx7IGNhdXNlOiBzdGFjayB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB1c2goeT8udmFsdWVPZigpIGFzIFYpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yYClcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEhlbHBlckRlc2NyaXB0b3JzPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgbGV0IGJveGVkT2JqZWN0ID0gSWdub3JlIGFzIHVua25vd24gYXMgKFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4gJiBQYXJ0aWFsPEl0ZXJhYmlsaXR5Pik7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgIC4uLnBkcyxcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgLyogVE9ETzogVGhpcyBpcyBwcm9ibGVtYXRpYyBhcyB0aGUgb2JqZWN0IG1pZ2h0IGhhdmUgY2xhc2hpbmcga2V5cyBhbmQgbmVzdGVkIG1lbWJlcnMuXG4gICAgICAgICAgVGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb246XG4gICAgICAgICAgKiBTcHJlYWRzIGl0ZXJhYmxlIG9iamVjdHMgaW4gdG8gYSBzaGFsbG93IGNvcHkgb2YgdGhlIG9yaWdpbmFsIG9iamVjdCwgYW5kIG92ZXJyaXRlcyBjbGFzaGluZyBtZW1iZXJzIGxpa2UgYG1hcGBcbiAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqLm1hcChvID0+IG8uZmllbGQpO1xuICAgICAgICAgICogVGhlIGl0ZXJhdG9yIHdpbGwgeWllbGQgb25cbiAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqID0gbmV3VmFsdWU7XG5cbiAgICAgICAgICAqIE1lbWJlcnMgYWNjZXNzIGlzIHByb3hpZWQsIHNvIHRoYXQ6XG4gICAgICAgICAgKiAgICAgKHNldCkgdGhpcy5pdGVyYWJsZU9iai5maWVsZCA9IG5ld1ZhbHVlO1xuICAgICAgICAgICogLi4uY2F1c2VzIHRoZSB1bmRlcmx5aW5nIG9iamVjdCB0byB5aWVsZCBieSByZS1hc3NpZ25tZW50ICh0aGVyZWZvcmUgY2FsbGluZyB0aGUgc2V0dGVyKVxuICAgICAgICAgICogU2ltaWxhcmx5OlxuICAgICAgICAgICogICAgIChnZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGRcbiAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgaXRlcmF0b3IgZm9yIHRoZSBiYXNlIG9iamVjdCB0byBiZSBtYXBwZWQsIGxpa2VcbiAgICAgICAgICAqICAgICB0aGlzLml0ZXJhYmxlT2JqZWN0Lm1hcChvID0+IG9bZmllbGRdKVxuICAgICAgICAqL1xuICAgICAgICBpZiAoIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhKSkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBJZ25vcmUgaXMgdGhlIElOSVRJQUwgdmFsdWVcbiAgICAgICAgICBpZiAoYm94ZWRPYmplY3QgPT09IElnbm9yZSkge1xuICAgICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oIGBUaGUgaXRlcmFibGUgcHJvcGVydHkgJyR7bmFtZS50b1N0cmluZygpfScgb2YgdHlwZSBcIm9iamVjdFwiIHdpbGwgYmUgc3ByZWFkIHRvIHByZXZlbnQgcmUtaW5pdGlhbGlzYXRpb24uXFxuJHtuZXcgRXJyb3IoKS5zdGFjaz8uc2xpY2UoNil9YCk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhKSlcbiAgICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhbLi4uYV0gYXMgViwgcGRzKTtcbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAvLyBib3hlZE9iamVjdCA9IFsuLi5hXSBhcyBWO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHsgLi4uKGEgYXMgVikgfSwgcGRzKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgLy8gYm94ZWRPYmplY3QgPSB7IC4uLihhIGFzIFYpIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYm94ZWRPYmplY3QsIGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYm94ZWRPYmplY3RbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpIHtcbiAgICAgICAgICAgIGJveGVkT2JqZWN0ID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYm94ZWRPYmplY3QsIHBkcyk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgQlJPS0VOOiBmYWlscyBuZXN0ZWQgcHJvcGVydGllc1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJveGVkT2JqZWN0LCAndmFsdWVPZicsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJveGVkT2JqZWN0XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGVsc2UgcHJveHkgdGhlIHJlc3VsdCBzbyB3ZSBjYW4gdHJhY2sgbWVtYmVycyBvZiB0aGUgaXRlcmFibGUgb2JqZWN0XG5cbiAgICAgICAgICBjb25zdCBleHRyYUJveGVkOiB0eXBlb2YgYm94ZWRPYmplY3QgPSBuZXcgUHJveHkoYm94ZWRPYmplY3QsIHtcbiAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCBmaXJlcyB0aGUgaXRlcmF0b3IgYnkgcmUtYXNzaWduaW5nIHRoZSBpdGVyYWJsZSB2aWEgaXQncyBzZXR0ZXJcbiAgICAgICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgIGlmIChSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgICAgICAgICBwdXNoKG9ialtuYW1lXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIEltcGxlbWVudCB0aGUgbG9naWMgdGhhdCByZXR1cm5zIGEgbWFwcGVkIGl0ZXJhdG9yIGZvciB0aGUgc3BlY2lmaWVkIGZpZWxkXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgIGlmIChrZXkgPT09ICd2YWx1ZU9mJylcbiAgICAgICAgICAgICAgICByZXR1cm4gKCk9PmJveGVkT2JqZWN0O1xuXG4gICAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3AgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsa2V5KTtcbiAgICAgICAgICAgICAgLy8gV2UgaW5jbHVkZSBgdGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkYCBzbyB3ZSBjYW4gbW9uaXRvciBuZXN0ZWQgcHJvcGVydGllcyB0aGF0IGFyZW4ndCBhY3R1YWxseSBkZWZpbmVkICh5ZXQpXG4gICAgICAgICAgICAgIC8vIE5vdGU6IHRoaXMgb25seSBhcHBsaWVzIHRvIG9iamVjdCBpdGVyYWJsZXMgKHNpbmNlIHRoZSByb290IG9uZXMgYXJlbid0IHByb3hpZWQpLCBidXQgaXQgZG9lcyBhbGxvdyB1cyB0byBoYXZlXG4gICAgICAgICAgICAgIC8vIGRlZmludGlvbnMgbGlrZTpcbiAgICAgICAgICAgICAgLy8gICBpdGVyYWJsZTogeyBzdHVmZjoge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyIC4uLiB9XG4gICAgICAgICAgICAgIGlmICh0YXJnZXRQcm9wID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0UHJvcC5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFByb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KGJveGVkT2JqZWN0IGFzIEV4Y2x1ZGU8dHlwZW9mIGJveGVkT2JqZWN0LCB0eXBlb2YgSWdub3JlPiwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhcbiAgICAgICAgICAgICAgICAgICAgYm94ZWRPYmplY3QubWFwKChvLHApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3YgPSBvPy5ba2V5IGFzIGtleW9mIHR5cGVvZiBvXT8udmFsdWVPZigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwdiA9IHA/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvdiA9PT0gdHlwZW9mIHB2ICYmIG92ID09IHB2KVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJZ25vcmU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdi8vbz8uW2tleSBhcyBrZXlvZiB0eXBlb2Ygb11cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAoUmVmbGVjdC5vd25LZXlzKHByb3BzKSBhcyAoa2V5b2YgdHlwZW9mIHByb3BzKVtdKS5mb3JFYWNoKGsgPT4gcHJvcHNba10uZW51bWVyYWJsZSA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJveChyZWFsVmFsdWUsIHByb3BzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGV4dHJhQm94ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGEgYXMgKFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4pO1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPYmplY3QoYSksIHtcbiAgICAgICAgICAuLi5wZHMsXG4gICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdDogKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55PilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx7aWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCk9Pnt9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9fSkpXG4gICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHtkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHtpZHg6IG51bWJlciwgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTpudW1iZXIgPSAwO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7fSk7XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7c2ksaWR4LGssaXJ9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICBhY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGNbaWR4XSA9IHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KXtcbiAgICAgIHBjLmZvckVhY2goKHAsaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGFpLFxuICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhhc3luY0V4dHJhcykpLm1hcCgoW2ssdl0pID0+IFtrLHsuLi52LCBlbnVtZXJhYmxlOiBmYWxzZX1dXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8VD4gOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOlBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEYsIEFuZCA9IHt9LCBPciA9IG5ldmVyPiA9XG4gIEYgZXh0ZW5kcyAoKT0+QXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WixSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOih2OlopPT5SLCBleGNlcHQ6KHg6YW55KT0+YW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbixleGNlcHQpO1xuICB0cnkgeyByZXR1cm4gdGhlbih2KSB9IGNhdGNoIChleCkgeyByZXR1cm4gZXhjZXB0KGV4KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGxldCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZTtcbiAgY29uc3QgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IHJlc29sdmUocClcbiAgICAgICAgICAgIDogcmVzb2x2ZVN5bmMoZm4ocC52YWx1ZSwgcHJldiksXG4gICAgICAgICAgICAgIGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgPyBzdGVwKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLFxuICAgICAgICAgICAgICBleCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KSAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pOyAvLyBUZXJtaW5hdGUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG5cbiAgICAgICAgICBleCA9PlxuICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KTsgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZmFpKVxufVxuXG5mdW5jdGlvbiBtYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSwgbWFwcGVyOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG1hcHBlcik7XG59XG5cbmZ1bmN0aW9uIGZpbHRlcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgYXN5bmMgbyA9PiAoYXdhaXQgZm4obykgPyBvIDogSWdub3JlKSk7XG59XG5cbmZ1bmN0aW9uIHVuaXF1ZTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbj86IChuZXh0OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZm5cbiAgICA/IGZpbHRlck1hcCh0aGlzLCBhc3luYyAobywgcCkgPT4gKHAgPT09IElnbm9yZSB8fCBhd2FpdCBmbihvLCBwKSkgPyBvIDogSWdub3JlKVxuICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxseTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBJID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPj4odGhpczogVSwgaW5pdFZhbHVlOiBJKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4gfCBJPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBvLCBpbml0VmFsdWUpO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9yPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGNiOiAoZG9uZTogKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpID0+IHZvaWQpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbmV3IFByb21pc2U8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ocmVzb2x2ZSA9PiB7IGNiKCgpID0+IHJlc29sdmUobykpOyByZXR1cm4gbyB9KSk7XG59XG5cbmZ1bmN0aW9uIG11bHRpPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICB0eXBlIFQgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+O1xuICBjb25zdCBzb3VyY2UgPSB0aGlzO1xuICBsZXQgY29uc3VtZXJzID0gMDtcbiAgbGV0IGN1cnJlbnQ6IERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxULCBhbnk+PjtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPFQsIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgc291cmNlIGhhcyBwcm9kdWNlZCBhIG5ldyByZXN1bHRcbiAgZnVuY3Rpb24gc3RlcChpdD86IEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4pIHtcbiAgICBpZiAoaXQpIGN1cnJlbnQucmVzb2x2ZShpdCk7XG4gICAgaWYgKCFpdD8uZG9uZSkge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgYWkhLm5leHQoKVxuICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4gY3VycmVudC5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXJyb3IgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1haTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgIHJldHVybiBtYWk7XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAoIWFpKSB7XG4gICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cnJlbnQvLy50aGVuKHphbGdvID0+IHphbGdvKTtcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgZmluYWwgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWFpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IGl0ZXJhYmxlSGVscGVycywgbWVyZ2UsIEFzeW5jRXh0cmFJdGVyYWJsZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuLypcbiAgYHdoZW4oLi4uLilgIGlzIGJvdGggYW4gQXN5bmNJdGVyYWJsZSBvZiB0aGUgZXZlbnRzIGl0IGNhbiBnZW5lcmF0ZSBieSBvYnNlcnZhdGlvbixcbiAgYW5kIGEgZnVuY3Rpb24gdGhhdCBjYW4gbWFwIHRob3NlIGV2ZW50cyB0byBhIHNwZWNpZmllZCB0eXBlLCBlZzpcblxuICB0aGlzLndoZW4oJ2tleXVwOiNlbGVtZXQnKSA9PiBBc3luY0l0ZXJhYmxlPEtleWJvYXJkRXZlbnQ+XG4gIHRoaXMud2hlbignI2VsZW1ldCcpKGUgPT4gZS50YXJnZXQpID0+IEFzeW5jSXRlcmFibGU8RXZlbnRUYXJnZXQ+XG4qL1xuLy8gVmFyYXJncyB0eXBlIHBhc3NlZCB0byBcIndoZW5cIlxuZXhwb3J0IHR5cGUgV2hlblBhcmFtZXRlcnM8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFJlYWRvbmx5QXJyYXk8XG4gIEFzeW5jSXRlcmFibGU8YW55PlxuICB8IFZhbGlkV2hlblNlbGVjdG9yPElEUz5cbiAgfCBFbGVtZW50IC8qIEltcGxpZXMgXCJjaGFuZ2VcIiBldmVudCAqL1xuICB8IFByb21pc2U8YW55PiAvKiBKdXN0IGdldHMgd3JhcHBlZCBpbiBhIHNpbmdsZSBgeWllbGRgICovXG4+O1xuXG4vLyBUaGUgSXRlcmF0ZWQgdHlwZSBnZW5lcmF0ZWQgYnkgXCJ3aGVuXCIsIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzXG50eXBlIFdoZW5JdGVyYXRlZFR5cGU8UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIChFeHRyYWN0PFNbbnVtYmVyXSwgQXN5bmNJdGVyYWJsZTxhbnk+PiBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgST4gPyB1bmtub3duIGV4dGVuZHMgSSA/IG5ldmVyIDogSSA6IG5ldmVyKVxuICB8IEV4dHJhY3RFdmVudHM8RXh0cmFjdDxTW251bWJlcl0sIHN0cmluZz4+XG4gIHwgKEV4dHJhY3Q8U1tudW1iZXJdLCBFbGVtZW50PiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudClcblxudHlwZSBNYXBwYWJsZUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+ID1cbiAgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gP1xuICAgIEEgJiBBc3luY0V4dHJhSXRlcmFibGU8VD4gJlxuICAgICg8Uj4obWFwcGVyOiAodmFsdWU6IEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyKSA9PiBSKSA9PiAoQXN5bmNFeHRyYUl0ZXJhYmxlPEF3YWl0ZWQ8Uj4+KSlcbiAgOiBuZXZlcjtcblxuLy8gVGhlIGV4dGVuZGVkIGl0ZXJhdG9yIHRoYXQgc3VwcG9ydHMgYXN5bmMgaXRlcmF0b3IgbWFwcGluZywgY2hhaW5pbmcsIGV0Y1xuZXhwb3J0IHR5cGUgV2hlblJldHVybjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgTWFwcGFibGVJdGVyYWJsZTxcbiAgICBBc3luY0V4dHJhSXRlcmFibGU8XG4gICAgICBXaGVuSXRlcmF0ZWRUeXBlPFM+Pj47XG5cbnR5cGUgU3BlY2lhbFdoZW5FdmVudHMgPSB7XG4gIFwiQHN0YXJ0XCI6IHsgW2s6IHN0cmluZ106IHVuZGVmaW5lZCB9LCAgLy8gQWx3YXlzIGZpcmVzIHdoZW4gcmVmZXJlbmNlZFxuICBcIkByZWFkeVwiOiB7IFtrOiBzdHJpbmddOiB1bmRlZmluZWQgfSAgLy8gRmlyZXMgd2hlbiBhbGwgRWxlbWVudCBzcGVjaWZpZWQgc291cmNlcyBhcmUgbW91bnRlZCBpbiB0aGUgRE9NXG59O1xudHlwZSBXaGVuRXZlbnRzID0gR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwICYgU3BlY2lhbFdoZW5FdmVudHM7XG50eXBlIEV2ZW50TmFtZUxpc3Q8VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBgJHtTfSwke0V2ZW50TmFtZUxpc3Q8Uj59YFxuICA6IG5ldmVyO1xuXG50eXBlIEV2ZW50TmFtZVVuaW9uPFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogUyB8IEV2ZW50TmFtZUxpc3Q8Uj5cbiAgOiBuZXZlcjtcblxuXG50eXBlIEV2ZW50QXR0cmlidXRlID0gYCR7a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwfWBcbnR5cGUgQ1NTSWRlbnRpZmllcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCMke0lEU31gIHxgLiR7c3RyaW5nfWAgfCBgWyR7c3RyaW5nfV1gXG5cbi8qIFZhbGlkV2hlblNlbGVjdG9ycyBhcmU6XG4gICAgQHN0YXJ0XG4gICAgQHJlYWR5XG4gICAgZXZlbnQ6c2VsZWN0b3JcbiAgICBldmVudCAgICAgICAgICAgXCJ0aGlzXCIgZWxlbWVudCwgZXZlbnQgdHlwZT0nZXZlbnQnXG4gICAgc2VsZWN0b3IgICAgICAgIHNwZWNpZmljZWQgc2VsZWN0b3JzLCBpbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnRcbiovXG5cbmV4cG9ydCB0eXBlIFZhbGlkV2hlblNlbGVjdG9yPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgJHtrZXlvZiBTcGVjaWFsV2hlbkV2ZW50c31gXG4gIHwgYCR7RXZlbnRBdHRyaWJ1dGV9OiR7Q1NTSWRlbnRpZmllcjxJRFM+fWBcbiAgfCBFdmVudEF0dHJpYnV0ZVxuICB8IENTU0lkZW50aWZpZXI8SURTPjtcblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+XG4gID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudE5hbWVzPFM+XG4gID0gUyBleHRlbmRzIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzID8gU1xuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBWfToke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gJ2NoYW5nZSdcbiAgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl07XG5cbi8qKiB3aGVuICoqL1xudHlwZSBFdmVudE9ic2VydmF0aW9uPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXI6IEVsZW1lbnRcbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGxcbn07XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBNYXA8a2V5b2YgV2hlbkV2ZW50cywgU2V0PEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPj4+KCk7XG5cbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+KHRoaXM6IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2LnR5cGUgYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwKTtcbiAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoY29udGFpbmVyKSkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICB0ZXJtaW5hdGUobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBuIHx8IG4uY29udGFpbnMoZXYudGFyZ2V0KSkgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUud2FybiggJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzOiBzdHJpbmcpOiBzIGlzIENTU0lkZW50aWZpZXIge1xuICByZXR1cm4gQm9vbGVhbihzICYmIChzLnN0YXJ0c1dpdGgoJyMnKSB8fCBzLnN0YXJ0c1dpdGgoJy4nKSB8fCAocy5zdGFydHNXaXRoKCdbJykgJiYgcy5lbmRzV2l0aCgnXScpKSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtDU1NJZGVudGlmaWVyIHwgbnVsbCwga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXSB7XG4gIGNvbnN0IHBhcnRzID0gd2hhdC5zcGxpdCgnOicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgcmV0dXJuIFtwYXJ0c1swXSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3NlbGVjdG9yLCBldmVudE5hbWVdID0gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkgPz8gZG9UaHJvdyhcIkludmFsaWQgV2hlblNlbGVjdG9yOiBcIit3aGF0KTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhldmVudE5hbWUpKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGRvY0V2ZW50SGFuZGxlciwge1xuICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgIGNhcHR1cmU6IHRydWVcbiAgICB9KTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICB9XG5cbiAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBba2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXT4oKCkgPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSk/LmRlbGV0ZShkZXRhaWxzKSk7XG5cbiAgY29uc3QgZGV0YWlsczogRXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+IC8qRXZlbnRPYnNlcnZhdGlvbjxFeGNsdWRlPEV4dHJhY3RFdmVudE5hbWVzPEV2ZW50TmFtZT4sIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzPj4qLyA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXIsXG4gICAgc2VsZWN0b3I6IHNlbGVjdG9yIHx8IG51bGxcbiAgfTtcblxuICBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgc2VsZWN0b3IgPyBbc2VsZWN0b3JdIDogdW5kZWZpbmVkKVxuICAgIC50aGVuKF8gPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSkhLmFkZChkZXRhaWxzKSk7XG5cbiAgcmV0dXJuIHF1ZXVlLm11bHRpKCkgO1xufVxuXG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbjxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7fSk7XG4gIHlpZWxkIHVuZGVmaW5lZCBhcyBaOyAvLyBOZXZlciBzaG91bGQgYmUgZXhlY3V0ZWRcbn1cblxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmM8QSBleHRlbmRzIEFzeW5jRXh0cmFJdGVyYWJsZTxYPiwgWD4oc3JjOiBBKTogTWFwcGFibGVJdGVyYWJsZTxBPiB7XG4gIGZ1bmN0aW9uIG1hcHBhYmxlQXN5bmNJdGVyYWJsZShtYXBwZXI6IFBhcmFtZXRlcnM8dHlwZW9mIHNyYy5tYXA+WzBdKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAobWFwcGVyKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUgYXMgdW5rbm93biBhcyBBc3luY0l0ZXJhYmxlPEE+KSwge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICB9KSBhcyBNYXBwYWJsZUl0ZXJhYmxlPEE+O1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkV2hlblNlbGVjdG9yKHdoYXQ6IFdoZW5QYXJhbWV0ZXJzW251bWJlcl0pOiB3aGF0IGlzIFZhbGlkV2hlblNlbGVjdG9yIHtcbiAgaWYgKCF3aGF0KVxuICAgIHRocm93IG5ldyBFcnJvcignRmFsc3kgYXN5bmMgc291cmNlIHdpbGwgbmV2ZXIgYmUgcmVhZHlcXG5cXG4nICsgSlNPTi5zdHJpbmdpZnkod2hhdCkpO1xuICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG9uY2U8VD4ocDogUHJvbWlzZTxUPikge1xuICB5aWVsZCBwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hlbjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+KGNvbnRhaW5lcjogRWxlbWVudCwgLi4uc291cmNlczogUyk6IFdoZW5SZXR1cm48Uz4ge1xuICBpZiAoIXNvdXJjZXMgfHwgc291cmNlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSkgYXMgdW5rbm93biBhcyBXaGVuUmV0dXJuPFM+O1xuICB9XG5cbiAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICA/IHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpXG4gICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICA/IG9uY2Uod2hhdClcbiAgICAgICAgOiB3aGF0KTtcblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICBjb25zdCBzdGFydDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHt9PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHN0YXJ0LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfSlcbiAgICAgIH1cbiAgICB9O1xuICAgIGl0ZXJhdG9ycy5wdXNoKHN0YXJ0KTtcbiAgfVxuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgIGNvbnN0IHdhdGNoU2VsZWN0b3JzID0gc291cmNlcy5maWx0ZXIoaXNWYWxpZFdoZW5TZWxlY3RvcikubWFwKHdoYXQgPT4gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCk/LlswXSk7XG5cbiAgICBmdW5jdGlvbiBpc01pc3Npbmcoc2VsOiBDU1NJZGVudGlmaWVyIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHNlbCBpcyBDU1NJZGVudGlmaWVyIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHR5cGVvZiBzZWwgPT09ICdzdHJpbmcnICYmICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcbiAgICB9XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMuZmlsdGVyKGlzTWlzc2luZyk7XG5cbiAgICBsZXQgZXZlbnRzOiBBc3luY0l0ZXJhdG9yPGFueSwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy50aHJvdykgcmV0dXJuIGV2ZW50cy50aHJvdyhleCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICB9LFxuICAgICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8ucmV0dXJuKSByZXR1cm4gZXZlbnRzLnJldHVybih2KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgfSxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGlmIChldmVudHMpIHJldHVybiBldmVudHMubmV4dCgpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgbWlzc2luZykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW48V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgICAgICAgICAvLyBOb3cgZXZlcnl0aGluZyBpcyByZWFkeSwgd2Ugc2ltcGx5IGRlbGVnYXRlIGFsbCBhc3luYyBvcHMgdG8gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvciBcImV2ZW50c1wiXG4gICAgICAgICAgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhhaSkpO1xuICB9XG5cbiAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgIDogKG5ldmVyR29ubmFIYXBwZW48V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50SXNJbkRPTShlbHQ6IEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSlcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKGRvY3VtZW50LmJvZHkuY29udGFpbnMoZWx0KSkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIHNlbGVjdG9ycyksXG4gICAgICBlbGVtZW50SXNJbkRPTShjb250YWluZXIpXG4gICAgXSk7XG4gIHJldHVybiBlbGVtZW50SXNJbkRPTShjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lcjogRWxlbWVudCwgbWlzc2luZzogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSlcbiAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90aGluZyBpcyBtaXNzaW5nXG4gIH1cblxuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAobWlzc2luZy5ldmVyeShzZWwgPT4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSkpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlXG4gIH0pKTtcblxuICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBcIk1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyIDUgc2Vjb25kczpcIik7XG4gICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oIHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NPLElBQU0sUUFBUSxXQUFXLFNBQVMsT0FBTyxXQUFXLFNBQVMsUUFBUSxXQUFXLE9BQU8sTUFBTSxtQkFBbUIsS0FBSztBQUVySCxJQUFNLGNBQWM7QUFFM0IsSUFBTSxXQUFXO0FBQUEsRUFDZixPQUFPLE1BQVc7QUFDaEIsUUFBSSxNQUFPLFNBQVEsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJO0FBQUEsRUFDaEQ7QUFBQSxFQUNBLFFBQVEsTUFBVztBQUNqQixRQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLElBQUk7QUFBQSxFQUNsRDtBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLE1BQU0saUJBQWlCLEdBQUcsSUFBSTtBQUFBLEVBQ25EO0FBQ0Y7OztBQ05BLElBQU0sVUFBVSxDQUFDLE1BQVM7QUFBQztB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QUMsRUFBRSxRQUFRLFNBQVMsTUFBTSxFQUFFLFNBQVMsTUFBTSxXQUFXLEtBQUssQ0FBQztBQUM5RDtBQUVBLElBQU0sU0FBUyxvQkFBSSxJQUFZO0FBQ3hCLFNBQVMsZ0JBQWdCLE1BQTJCLEtBQStCO0FBQ3hGLFNBQU8sUUFBUTtBQUNmLFFBQU0sT0FBTyx1QkFBTyxPQUFPLElBQUk7QUFDL0IsTUFBSSxLQUFLLGtCQUFrQjtBQUN6QixTQUFLLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxTQUFVLEtBQUs7QUFDbkQsVUFBSSxJQUFJLElBQUk7QUFDVixZQUFJLENBQUMsSUFBSyxJQUFJLEVBQUU7QUFDZCxjQUFLLElBQUksRUFBRSxJQUFJO0FBQUEsaUJBQ1IsT0FBTztBQUNkLGNBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDdkIsbUJBQU8sSUFBSSxJQUFJLEVBQUU7QUFDakIscUJBQVEsS0FBTSxpQ0FBaUMsSUFBSSxJQUFJLEtBQUssSUFBSyxJQUFJLEVBQUUsQ0FBQztBQUFBLFVBQzFFO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0EsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ2IiwgImEiLCAicmVzdWx0IiwgImV4IiwgImlyIiwgImlzTWlzc2luZyIsICJtZXJnZWQiLCAibm9kZXMiLCAiYyIsICJuIiwgInZhbHVlIiwgImlzQW5jZXN0cmFsIiwgImNoaWxkcmVuIl0KfQo=
