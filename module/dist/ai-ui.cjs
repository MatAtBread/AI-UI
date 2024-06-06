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
  augmentGlobalAsyncGenerators: () => augmentGlobalAsyncGenerators,
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
  let piped = false;
  Object.defineProperty(obj, name, {
    get() {
      return a;
    },
    set(v2) {
      if (v2 !== a) {
        if (piped) {
          throw new Error(`Iterable "${name.toString()}" is already consuming another iterator`);
        }
        if (isAsyncIterable(v2)) {
          piped = true;
          if (DEBUG)
            _console.info(
              "(AI-UI)",
              new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`)
            );
          consume.call(v2, (v3) => {
            push(v3?.valueOf());
          }).finally(() => piped = false);
        } else {
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
              _console.info("(AI-UI)", `The iterable property '${name.toString()}' of type "object" will be spread to prevent re-initialisation.
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
  for await (const u of this)
    last = f?.(u);
  await last;
}
var Ignore = Symbol("Ignore");
function resolveSync(v, then, except) {
  if (except) {
    if (isPromiseLike(v))
      return v.then(then, except);
    try {
      return then(v);
    } catch (ex) {
      throw ex;
    }
  }
  if (isPromiseLike(v))
    return v.then(then);
  return then(v);
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
        _console.warn("(AI-UI)", "docEventHandler", ex);
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
    const ai = {
      [Symbol.asyncIterator]() {
        return ai;
      },
      async next() {
        await containerAndSelectorsMounted(container, missing);
        const merged2 = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : neverGonnaHappen();
        const events = merged2[Symbol.asyncIterator]();
        if (events) {
          ai.next = events.next.bind(events);
          ai.return = events.return?.bind(events);
          ai.throw = events.throw?.bind(events);
          return { done: false, value: {} };
        }
        return { done: true, value: void 0 };
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
      _console.warn("(AI-UI)", stack, missing);
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
    return getElementIdMap(
      this
      /*Object.create(this.defaults) ||*/
    );
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
  return typeof x === "string" || typeof x === "number" || typeof x === "boolean" || typeof x === "function" || x instanceof Node || x instanceof NodeList || x instanceof HTMLCollection || x === null || x === void 0 || Array.isArray(x) || isPromiseLike(x) || isAsyncIter(x) || typeof x[Symbol.iterator] === "function";
}
var callStackSymbol = Symbol("callStack");
var tag = function(_1, _2, _3) {
  const [nameSpace, tags, options] = typeof _1 === "string" || _1 === null ? [_1, _2, _3] : Array.isArray(_1) ? [null, _1, _2] : [null, standandTags, _1];
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
          (ex) => _console.warn("(AI-UI)", ex)
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
        let g = [DomPromiseContainer()];
        appended.push(g[0]);
        c2.then((r) => {
          const n = nodes(r);
          const old = g;
          if (old[0].parentNode) {
            appender(old[0].parentNode, old[0])(n);
            old.forEach((e) => e.parentNode?.removeChild(e));
          }
          g = n;
        }, (x) => {
          _console.warn("(AI-UI)", x, g);
          const errorNode = g[0];
          if (errorNode)
            errorNode.parentNode?.replaceChild(DyamicElementError({ error: x }), errorNode);
        });
        return;
      }
      if (c2 instanceof Node) {
        appended.push(c2);
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
            t = appender(n[0].parentNode, n[0])(DyamicElementError({ error: errorValue }));
            n.forEach((e) => !t.includes(e) && e.parentNode.removeChild(e));
          } else
            _console.warn("(AI-UI)", "Can't report error", errorValue, createdBy, t);
        };
        const update = (es) => {
          if (!es.done) {
            try {
              const mounted = t.filter((e) => e?.parentNode && e.ownerDocument?.body.contains(e));
              const n = notYetMounted ? t : mounted;
              if (mounted.length) notYetMounted = false;
              if (!n.length) {
                const msg = "Element(s) do not exist in document" + insertionStack;
                throw new Error("Element(s) do not exist in document" + insertionStack);
              }
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.log(`Async element not mounted after 5 seconds. If it is never mounted, it will leak.`, createdBy, t);
              }
              const q = nodes(unbox(es.value));
              t = appender(n[0].parentNode, n[0])(q.length ? q : DomPromiseContainer());
              n.forEach((e) => !t.includes(e) && e.parentNode.removeChild(e));
              ap.next().then(update).catch(error);
            } catch (ex) {
              ap.return?.(ex);
            }
          }
        };
        ap.next().then(update).catch(error);
        return;
      }
      if (typeof c2 === "object" && c2?.[Symbol.iterator]) {
        for (const d of c2) children(d);
        return;
      }
      appended.push(document.createTextNode(c2.toString()));
    })(c);
    return appended;
  }
  function appender(container, before) {
    if (before === void 0)
      before = null;
    return function(c) {
      const children = nodes(c);
      if (before) {
        if (before instanceof Element) {
          Element.prototype.before.call(before, ...children);
        } else {
          const parent = before.parentNode;
          if (!parent)
            throw new Error("Parent is null");
          if (parent !== container) {
            _console.warn("(AI-UI)", "Internal error - container mismatch");
          }
          for (let i = 0; i < children.length; i++)
            parent.insertBefore(children[i], before);
        }
      } else {
        Element.prototype.append.call(container, ...children);
      }
      return children;
    };
  }
  if (!nameSpace) {
    Object.assign(tag, {
      appender,
      // Legacy RTA support
      nodes,
      // Preferred interface instead of `appender`
      UniqueID,
      augmentGlobalAsyncGenerators
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
        _console.warn("(AI-UI)", "deepAssign", k, s[k], ex);
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
            _console.warn("(AI-UI)", "assignProps", k, s[k], ex);
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
              if (!notYetMounted && !mounted) {
                const msg = `Element does not exist in document when setting async attribute '${k}'`;
                ap.return?.(new Error(msg));
                return;
              }
              if (mounted) notYetMounted = false;
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.log(`Element with async attribute '${k}' not mounted after 5 seconds. If it is never mounted, it will leak.`, createdBy, base);
              }
              ap.next().then(update).catch(error);
            }
          };
          const error = (errorValue) => {
            ap.return?.(errorValue);
            _console.warn("(AI-UI)", "Dynamic attribute error", errorValue, k, d, createdBy, base);
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
            appender(e)(children2);
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
        appender(e)(children);
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
  ids = ids || {};
  if (node.querySelectorAll) {
    node.querySelectorAll("[id]").forEach(function(elt) {
      if (elt.id) {
        if (!ids[elt.id])
          ids[elt.id] = elt;
        else if (DEBUG) {
          if (!warned.has(elt.id)) {
            warned.add(elt.id);
            _console.info("(AI-UI)", "Shadowed multiple element IDs", elt.id, elt, ids[elt.id]);
          }
        }
      }
    });
  }
  return ids;
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yLCBpdGVyYWJsZUhlbHBlcnMgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyBXaGVuUGFyYW1ldGVycywgV2hlblJldHVybiwgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBDaGlsZFRhZ3MsIENvbnN0cnVjdGVkLCBJbnN0YW5jZSwgT3ZlcnJpZGVzLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5cbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0IHR5cGUgeyBDaGlsZFRhZ3MsIEluc3RhbmNlLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnXG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuXG5leHBvcnQgY29uc3QgVW5pcXVlSUQgPSBTeW1ib2woXCJVbmlxdWUgSURcIik7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG50eXBlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyB7fSA9IHt9PiA9IHtcbiAgY29tbW9uUHJvcGVydGllczogT3RoZXJNZW1iZXJzXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbn1cblxuLy8gU3VwcG9ydCBmb3IgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaHRtIChvciBpbXBvcnQgaHRtIGZyb20gJ2h0dHBzOi8vdW5wa2cuY29tL2h0bS9kaXN0L2h0bS5tb2R1bGUuanMnKVxuLy8gTm90ZTogc2FtZSBzaWduYXR1cmUgYXMgUmVhY3QuY3JlYXRlRWxlbWVudFxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVFbGVtZW50IHtcbiAgLy8gU3VwcG9ydCBmb3IgaHRtLCBKU1gsIGV0Y1xuICBjcmVhdGVFbGVtZW50KFxuICAgIC8vIFwibmFtZVwiIGNhbiBhIEhUTUwgdGFnIHN0cmluZywgYW4gZXhpc3Rpbmcgbm9kZSAoanVzdCByZXR1cm5zIGl0c2VsZiksIG9yIGEgdGFnIGZ1bmN0aW9uXG4gICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAvLyBUaGUgYXR0cmlidXRlcyB1c2VkIHRvIGluaXRpYWxpc2UgdGhlIG5vZGUgKGlmIGEgc3RyaW5nIG9yIGZ1bmN0aW9uIC0gaWdub3JlIGlmIGl0J3MgYWxyZWFkeSBhIG5vZGUpXG4gICAgYXR0cnM6IGFueSxcbiAgICAvLyBUaGUgY2hpbGRyZW5cbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlO1xufVxuXG4vKiBUaGUgaW50ZXJmYWNlIHRoYXQgY3JlYXRlcyBhIHNldCBvZiBUYWdDcmVhdG9ycyBmb3IgdGhlIHNwZWNpZmllZCBET00gdGFncyAqL1xuaW50ZXJmYWNlIFRhZ0xvYWRlciB7XG4gIC8qKiBAZGVwcmVjYXRlZCAtIExlZ2FjeSBmdW5jdGlvbiBzaW1pbGFyIHRvIEVsZW1lbnQuYXBwZW5kL2JlZm9yZS9hZnRlciAqL1xuICBhcHBlbmRlcihjb250YWluZXI6IE5vZGUsIGJlZm9yZT86IE5vZGUpOiAoYzogQ2hpbGRUYWdzKSA9PiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBub2RlcyguLi5jOiBDaGlsZFRhZ3NbXSk6IChOb2RlIHwgKC8qUCAmKi8gKEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzKSkpW107XG4gIFVuaXF1ZUlEOiB0eXBlb2YgVW5pcXVlSUQ7XG4gIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKTogdm9pZDtcblxuICAvKlxuICAgU2lnbmF0dXJlcyBmb3IgdGhlIHRhZyBsb2FkZXIuIEFsbCBwYXJhbXMgYXJlIG9wdGlvbmFsIGluIGFueSBjb21iaW5hdGlvbixcbiAgIGJ1dCBtdXN0IGJlIGluIG9yZGVyOlxuICAgICAgdGFnKFxuICAgICAgICAgID9uYW1lU3BhY2U/OiBzdHJpbmcsICAvLyBhYnNlbnQgbmFtZVNwYWNlIGltcGxpZXMgSFRNTFxuICAgICAgICAgID90YWdzPzogc3RyaW5nW10sICAgICAvLyBhYnNlbnQgdGFncyBkZWZhdWx0cyB0byBhbGwgY29tbW9uIEhUTUwgdGFnc1xuICAgICAgICAgID9jb21tb25Qcm9wZXJ0aWVzPzogQ29tbW9uUHJvcGVydGllc0NvbnN0cmFpbnQgLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyB7fT4odGFnczogVGFnc1tdLCBvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLFwiYWJiclwiLFwiYWRkcmVzc1wiLFwiYXJlYVwiLFwiYXJ0aWNsZVwiLFwiYXNpZGVcIixcImF1ZGlvXCIsXCJiXCIsXCJiYXNlXCIsXCJiZGlcIixcImJkb1wiLFwiYmxvY2txdW90ZVwiLFwiYm9keVwiLFwiYnJcIixcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFwiY2FwdGlvblwiLFwiY2l0ZVwiLFwiY29kZVwiLFwiY29sXCIsXCJjb2xncm91cFwiLFwiZGF0YVwiLFwiZGF0YWxpc3RcIixcImRkXCIsXCJkZWxcIixcImRldGFpbHNcIixcImRmblwiLFwiZGlhbG9nXCIsXCJkaXZcIixcbiAgXCJkbFwiLFwiZHRcIixcImVtXCIsXCJlbWJlZFwiLFwiZmllbGRzZXRcIixcImZpZ2NhcHRpb25cIixcImZpZ3VyZVwiLFwiZm9vdGVyXCIsXCJmb3JtXCIsXCJoMVwiLFwiaDJcIixcImgzXCIsXCJoNFwiLFwiaDVcIixcImg2XCIsXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXCJoZ3JvdXBcIixcImhyXCIsXCJodG1sXCIsXCJpXCIsXCJpZnJhbWVcIixcImltZ1wiLFwiaW5wdXRcIixcImluc1wiLFwia2JkXCIsXCJsYWJlbFwiLFwibGVnZW5kXCIsXCJsaVwiLFwibGlua1wiLFwibWFpblwiLFwibWFwXCIsXG4gIFwibWFya1wiLFwibWVudVwiLFwibWV0YVwiLFwibWV0ZXJcIixcIm5hdlwiLFwibm9zY3JpcHRcIixcIm9iamVjdFwiLFwib2xcIixcIm9wdGdyb3VwXCIsXCJvcHRpb25cIixcIm91dHB1dFwiLFwicFwiLFwicGljdHVyZVwiLFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcInFcIixcInJwXCIsXCJydFwiLFwicnVieVwiLFwic1wiLFwic2FtcFwiLFwic2NyaXB0XCIsXCJzZWFyY2hcIixcInNlY3Rpb25cIixcInNlbGVjdFwiLFwic2xvdFwiLFwic21hbGxcIixcInNvdXJjZVwiLFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFwic3R5bGVcIixcInN1YlwiLFwic3VtbWFyeVwiLFwic3VwXCIsXCJ0YWJsZVwiLFwidGJvZHlcIixcInRkXCIsXCJ0ZW1wbGF0ZVwiLFwidGV4dGFyZWFcIixcInRmb290XCIsXCJ0aFwiLFwidGhlYWRcIixcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFwidHJcIixcInRyYWNrXCIsXCJ1XCIsXCJ1bFwiLFwidmFyXCIsXCJ2aWRlb1wiLFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IGVsZW1lbnRQcm90eXBlOiBQb0VsZW1lbnRNZXRob2RzICYgVGhpc1R5cGU8RWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+ID0ge1xuICBnZXQgaWRzKCkge1xuICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcywgLypPYmplY3QuY3JlYXRlKHRoaXMuZGVmYXVsdHMpIHx8Ki8pO1xuICB9LFxuICBzZXQgaWRzKHY6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBpZHMgb24gJyArIHRoaXMudmFsdWVPZigpKTtcbiAgfSxcbiAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICB9XG59XG5cbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXMtXCI7XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZUxpc3RcbiAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICB8fCB4ID09PSBudWxsXG4gICAgfHwgeCA9PT0gdW5kZWZpbmVkXG4gICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgIHx8IGlzUHJvbWlzZUxpa2UoeClcbiAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgIHx8IHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qIHRhZyAqL1xuY29uc3QgY2FsbFN0YWNrU3ltYm9sID0gU3ltYm9sKCdjYWxsU3RhY2snKTtcblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyB7fVxuPihcbiAgXzE6IFQxLFxuICBfMjogVDIsXG4gIF8zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+XG4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBFbGVtZW50Pj4ge1xuICB0eXBlIE5hbWVzcGFjZWRFbGVtZW50QmFzZSA9IFQxIGV4dGVuZHMgc3RyaW5nID8gVDEgZXh0ZW5kcyAnJyA/IEhUTUxFbGVtZW50IDogRWxlbWVudCA6IEhUTUxFbGVtZW50O1xuXG4gIC8qIFdvcmsgb3V0IHdoaWNoIHBhcmFtZXRlciBpcyB3aGljaC4gVGhlcmUgYXJlIDYgdmFyaWF0aW9uczpcbiAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgIHRhZyhjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdXVxuICAgIHRhZyh0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10pICAgICAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW10sIG9iamVjdF1cbiAgKi9cbiAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgb3B0aW9uc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICA/IFtfMSwgXzIgYXMgVGFnc1tdLCBfMyBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgPyBbbnVsbCwgXzEgYXMgVGFnc1tdLCBfMiBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl07XG5cbiAgY29uc3QgY29tbW9uUHJvcGVydGllcyA9IG9wdGlvbnM/LmNvbW1vblByb3BlcnRpZXM7XG5cbiAgLyogTm90ZTogd2UgdXNlIHByb3BlcnR5IGRlZmludGlvbiAoYW5kIG5vdCBvYmplY3Qgc3ByZWFkKSBzbyBnZXR0ZXJzIChsaWtlIGBpZHNgKVxuICAgIGFyZSBub3QgZXZhbHVhdGVkIHVudGlsIGNhbGxlZCAqL1xuICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGVsZW1lbnRQcm90eXBlKSwgLy8gV2Uga25vdyBpdCdzIG5vdCBuZXN0ZWRcbiAgKTtcblxuICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsJ2F0dHJpYnV0ZXMnKSxcbiAgICBzZXQoYTogb2JqZWN0KSB7XG4gICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9ICgpPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKFwiKEFJLVVJKVwiLGV4KSk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGxldCBnOiBOb2RlW10gPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnWzBdKTtcbiAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgIGNvbnN0IG4gPSBub2RlcyhyKTtcbiAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudE5vZGUsIG9sZFswXSkobik7XG4gICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBnID0gbjtcbiAgICAgICAgfSwgKHg6YW55KSA9PiB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJyx4LGcpO1xuICAgICAgICAgIGNvbnN0IGVycm9yTm9kZSA9IGdbMF07XG4gICAgICAgICAgaWYgKGVycm9yTm9kZSlcbiAgICAgICAgICAgIGVycm9yTm9kZS5wYXJlbnROb2RlPy5yZXBsYWNlQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogeH0pLCBlcnJvck5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG4gICAgICAgIGFwcGVuZGVkLnB1c2goLi4uZHBtKTtcblxuICAgICAgICBsZXQgdDogUmV0dXJuVHlwZTxSZXR1cm5UeXBlPHR5cGVvZiBhcHBlbmRlcj4+ID0gZHBtO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUhLCBuWzBdKShEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiBlcnJvclZhbHVlfSkpO1xuICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCBjcmVhdGVkQnksIHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDxDaGlsZFRhZ3M+KSA9PiB7XG4gICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gdC5maWx0ZXIoZSA9PiBlPy5wYXJlbnROb2RlICYmIGUub3duZXJEb2N1bWVudD8uYm9keS5jb250YWlucyhlKSk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gdCA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBkbyBub3QgZXhpc3QgaW4gZG9jdW1lbnRcIiArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQocykgZG8gbm90IGV4aXN0IGluIGRvY3VtZW50XCIgKyBpbnNlcnRpb25TdGFjayk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBc3luYyBlbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsY3JlYXRlZEJ5LCB0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBxID0gbm9kZXModW5ib3goZXMudmFsdWUpIGFzIENoaWxkVGFncyk7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRlZCBleHByZXNzaW9uIHlpZWxkcyBubyBub2Rlcywgc3R1ZmYgaW4gYSBEb21Qcm9taXNlQ29udGFpbmVyIGZvciB0aGUgbmV4dCBpdGVyYXRpb25cbiAgICAgICAgICAgICAgdCA9IGFwcGVuZGVyKG5bMF0ucGFyZW50Tm9kZSEsIG5bMF0pKHEubGVuZ3RoID8gcSA6IERvbVByb21pc2VDb250YWluZXIoKSk7XG4gICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nLiBUZXJtaW5hdGUgdGhlIGl0ZXJhdG9yIHNvdXJjZVxuICAgICAgICAgICAgICBhcC5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGMgPT09ICdvYmplY3QnICYmIGM/LltTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBjKSBjaGlsZHJlbihkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICB9KShjKTtcbiAgICByZXR1cm4gYXBwZW5kZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRlcihjb250YWluZXI6IE5vZGUsIGJlZm9yZT86IE5vZGUgfCBudWxsKSB7XG4gICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGM6IENoaWxkVGFncykge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlcyhjKTtcbiAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgLy8gXCJiZWZvcmVcIiwgYmVpbmcgYSBub2RlLCBjb3VsZCBiZSAjdGV4dCBub2RlXG4gICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYmVmb3JlLmNhbGwoYmVmb3JlLCAuLi5jaGlsZHJlbilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXZSdyZSBhIHRleHQgbm9kZSAtIHdvcmsgYmFja3dhcmRzIGFuZCBpbnNlcnQgKmFmdGVyKiB0aGUgcHJlY2VlZGluZyBFbGVtZW50XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gYmVmb3JlLnBhcmVudE5vZGU7XG4gICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcblxuICAgICAgICAgIGlmIChwYXJlbnQgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJyxcIkludGVybmFsIGVycm9yIC0gY29udGFpbmVyIG1pc21hdGNoXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZHJlbltpXSwgYmVmb3JlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYXBwZW5kLmNhbGwoY29udGFpbmVyLCAuLi5jaGlsZHJlbilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLHtcbiAgICAgIGFwcGVuZGVyLCAvLyBMZWdhY3kgUlRBIHN1cHBvcnRcbiAgICAgIG5vZGVzLCAgICAvLyBQcmVmZXJyZWQgaW50ZXJmYWNlIGluc3RlYWQgb2YgYGFwcGVuZGVyYFxuICAgICAgVW5pcXVlSUQsXG4gICAgICBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveChhOiB1bmtub3duKTogdW5rbm93biB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBFbGVtZW50LCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KChhLGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLm93bmVyRG9jdW1lbnQuY29udGFpbnMoYmFzZSk7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKCFub3RZZXRNb3VudGVkICYmICFtb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfSdgO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1vdW50ZWQpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuYCwgY3JlYXRlZEJ5LCBiYXNlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBjcmVhdGVkQnksIGJhc2UpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlOiBhbnksIGs6IHN0cmluZykge1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZFtrXSA9IGNvcHk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspPy5zZXQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6e1xuICAgIGRlYnVnZ2VyPzogdW5rbm93bjtcbiAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gICAgW2s6IHN0cmluZ106IHVua25vd247XG4gIH0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG4gIGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICAgIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICAgIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gICAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG4gIH1cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LF9vdmVycmlkZXMsaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikrKGlkQ291bnQrKykudG9TdHJpbmcoMzYpK01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGxldCBzdGF0aWNFeHRlbnNpb25zOiBPdmVycmlkZXMgPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAvKiBcIlN0YXRpY2FsbHlcIiBjcmVhdGUgYW55IHN0eWxlcyByZXF1aXJlZCBieSB0aGlzIHdpZGdldCAqL1xuICAgIGlmIChzdGF0aWNFeHRlbnNpb25zLnN0eWxlcykge1xuICAgICAgcG9TdHlsZUVsdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChwb1N0eWxlRWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKSA7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrICB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGZ1bmN0aW9uIGlzQW5jZXN0cmFsKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGQ6IHN0cmluZykge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYgZCBpbiBmLmRlZmluaXRpb24uZGVjbGFyZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLmRlY2xhcmUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkuZmlsdGVyKGQgPT4gKGQgaW4gZSkgfHwgaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLGQpKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIHRhZ0RlZmluaXRpb24uaXRlcmFibGUgJiYgT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5pdGVyYWJsZSkuZm9yRWFjaChrID0+IHtcbiAgICAgICAgaWYgKGsgaW4gZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBJZ25vcmluZyBhdHRlbXB0IHRvIHJlLWRlZmluZSBpdGVyYWJsZSBwcm9wZXJ0eSBcIiR7a31cIiBhcyBpdCBjb3VsZCBhbHJlYWR5IGhhdmUgY29uc3VtZXJzYCk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSFbayBhcyBrZXlvZiB0eXBlb2YgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZV0pXG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHRoZSBmdWxsIHRyZWUgb2YgYXVnbWVudGVkIERPTSBlbGVtZW50cyBoYXMgYmVlbiBjb25zdHJ1Y3RlZCwgZmlyZSBhbGwgdGhlIGl0ZXJhYmxlIHByb3BlZXJ0aWVzXG4gICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGUsIHVubGVzcyB0aGV5IGhhdmUgYmVlbiBhc3NpZ25lZFxuICAgICAgICAvLyBieSBhc3NpZ25Qcm9wcyBmcm9tIGEgZnV0dXJlXG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICBpZiAoYmFzZS5pdGVyYWJsZSkgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGJhc2UuaXRlcmFibGUpKSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBzZWxmLWFzc2lnbiBpdGVyYWJsZXMgdGhhdCBoYXZlIHRoZW1zZWx2ZXMgYmVlbiBhc3NpZ25lZCB3aXRoIGZ1dHVyZXNcbiAgICAgICAgICAgIGlmICghKCFub0F0dHJzICYmIGsgaW4gYXR0cnMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdO1xuICAgICAgICAgICAgICBpZiAodmFsdWU/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgZVtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICBjb25zdCBleHRlbmRUYWc6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICBzdXBlcjogdGhpcyxcbiAgICAgIGRlZmluaXRpb246IE9iamVjdC5hc3NpZ24oc3RhdGljRXh0ZW5zaW9ucywgeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KSxcbiAgICAgIGV4dGVuZGVkLFxuICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSB8fCB7fSksIC4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuaXRlcmFibGUgfHwge30pXTtcbiAgICAgICAgcmV0dXJuIGAke2V4dGVuZFRhZy5uYW1lfTogeyR7a2V5cy5qb2luKCcsICcpfX1cXG4gXFx1MjFBQSAke3RoaXMudmFsdWVPZigpfWBcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIGNvbnN0IGZ1bGxQcm90byA9IHt9O1xuICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50Pikge1xuICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICB3YWxrUHJvdG8oY3JlYXRvci5zdXBlcik7XG5cbiAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5kZWZpbml0aW9uO1xuICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgfVxuICAgIH0pKHRoaXMpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHRlbmRUYWcsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGZ1bGxQcm90bykpO1xuXG4gICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICBjb25zdCBjcmVhdG9yTmFtZSA9IGZ1bGxQcm90b1xuICAgICAgJiYgJ2NsYXNzTmFtZScgaW4gZnVsbFByb3RvXG4gICAgICAmJiB0eXBlb2YgZnVsbFByb3RvLmNsYXNzTmFtZSA9PT0gJ3N0cmluZydcbiAgICAgID8gZnVsbFByb3RvLmNsYXNzTmFtZVxuICAgICAgOiB1bmlxdWVUYWdJRDtcbiAgICBjb25zdCBjYWxsU2l0ZSA9IERFQlVHID8gKG5ldyBFcnJvcigpLnN0YWNrPy5zcGxpdCgnXFxuJylbMl0gPz8gJycpIDogJyc7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCctJykgKyBjYWxsU2l0ZStcIj5cIlxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBleHRyYVVua25vd25Qcm9wcyA9IE9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMpLmZpbHRlcihrID0+ICFbJ3N0eWxlcycsICdpZHMnLCAnY29uc3RydWN0ZWQnLCAnZGVjbGFyZScsICdvdmVycmlkZScsICdpdGVyYWJsZSddLmluY2x1ZGVzKGspKTtcbiAgICAgIGlmIChleHRyYVVua25vd25Qcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXh0ZW5kVGFnLm5hbWV9IGRlZmluZXMgZXh0cmFuZW91cyBrZXlzICcke2V4dHJhVW5rbm93blByb3BzfScsIHdoaWNoIGFyZSB1bmtub3duYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBleHRlbmRUYWc7XG4gIH1cblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudChcbiAgICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgICBhdHRyczogYW55LFxuICAgICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZSB7XG4gICAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nID8gbmFtZShhdHRycywgY2hpbGRyZW4pXG4gICAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgbmFtZSBpbiBiYXNlVGFnQ3JlYXRvcnMgP1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgYmFzZVRhZ0NyZWF0b3JzW25hbWVdKGF0dHJzLCBjaGlsZHJlbilcbiAgICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICAgIDogRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSl9KSkgYXMgTm9kZVxuICAgICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFBhcnRpYWw8e1xuICAgICAgZGVidWdnZXI/OiBhbnk7XG4gICAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIH0+IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IHtcbiAgICAgIGxldCBkb2MgPSBkb2N1bWVudDtcbiAgICAgIGlmIChpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgYXR0cnMgPSB7fSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgaWYgKGF0dHJzLmRlYnVnZ2VyKSB7XG4gICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRycy5kb2N1bWVudCkge1xuICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlIGFzIHN0cmluZywgay50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgIGUuY29uc3RydWN0b3IgPSB0YWdDcmVhdG9yO1xuXG4gICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnUHJvdG90eXBlcyk7XG4gICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcblxuICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKT0+eyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBpbnZva2UgbmF0aXZlIGVsZW1lbmV0IGNvbnN0cnVjdG9ycyBkaXJlY3RseS4gVXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cIikgfSxcbiAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICB9XG5cbiAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufVxuXG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gKCkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChERUJVRyA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiIDogXCJwcm9taXNlXCIpXG59XG5cbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9ICh7IGVycm9yIH06eyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj59KSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicrSlNPTi5zdHJpbmdpZnkoZXJyb3IsbnVsbCwyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiAqKCl7fSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge30gLy8gT25seSBjcmVhdGUgdGhlIG9ic2VydmVyIG9uY2VcbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKFxuICAgICAgICAgIHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgWy4uLnJlbW92ZWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLCByZW1vdmVkXS5maWx0ZXIoZWx0ID0+ICFlbHQub3duZXJEb2N1bWVudC5jb250YWlucyhlbHQpKS5mb3JFYWNoKFxuICAgICAgICAgICAgICBlbHQgPT4ge1xuICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59XG5cbmNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRJZE1hcChub2RlPzogRWxlbWVudCB8IERvY3VtZW50LCBpZHM/OiBSZWNvcmQ8c3RyaW5nLCBFbGVtZW50Pikge1xuICBub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbiAgaWRzID0gaWRzIHx8IHt9XG4gIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWRdXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsdCkge1xuICAgICAgaWYgKGVsdC5pZCkge1xuICAgICAgICBpZiAoIWlkcyFbZWx0LmlkXSlcbiAgICAgICAgICBpZHMhW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgIGVsc2UgaWYgKERFQlVHKSB7XG4gICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKGVsdC5pZCkpIHtcbiAgICAgICAgICAgIHdhcm5lZC5hZGQoZWx0LmlkKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQsIGVsdCwgaWRzIVtlbHQuaWRdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaWRzO1xufVxuIiwgIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pIHx8IGZhbHNlO1xuZXhwb3J0IHsgX2NvbnNvbGUgYXMgY29uc29sZSB9O1xuZXhwb3J0IGNvbnN0IHRpbWVPdXRXYXJuID0gNTAwMDtcblxuY29uc3QgX2NvbnNvbGUgPSB7XG4gIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCcoQUktVUkpIExPRzonLCAuLi5hcmdzKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncylcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuZGVidWcoJyhBSS1VSSkgSU5GTzonLCAuLi5hcmdzKVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5cbi8vIENyZWF0ZSBhIGRlZmVycmVkIFByb21pc2UsIHdoaWNoIGNhbiBiZSBhc3luY2hyb25vdXNseS9leHRlcm5hbGx5IHJlc29sdmVkIG9yIHJlamVjdGVkLlxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2OiBhbnkpPT57fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiAoJ3RoZW4nIGluIHgpICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiXG5pbXBvcnQgeyBEZWZlcnJlZFByb21pc2UsIGRlZmVycmVkLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlpblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdCB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoZW4gKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnRseSBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgb25lLWxldmVsIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLHR5cGVvZiBJdGVyYWJpbGl0eT5dOiBJdGVyYWJsZVR5cGU8SVBbS10+XG59IDoge1xuICBbSyBpbiBrZXlvZiBJUF06IChJUFtLXSBleHRlbmRzIG9iamVjdCA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT4gOiBJUFtLXSkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG59XG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gbyAmJiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5jb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgbGV0IF9wZW5kaW5nID0gW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbDtcbiAgbGV0IF9pdGVtczogVFtdIHwgbnVsbCA9IFtdO1xuXG4gIGNvbnN0IHE6IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChfaXRlbXM/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBfaXRlbXMuc2hpZnQoKSEgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgcSBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBfcGVuZGluZyEucHVzaCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybigpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAoX3BlbmRpbmcpIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKF9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChfcGVuZGluZykge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAoX3BlbmRpbmcubGVuZ3RoKVxuICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgIF9pdGVtcyA9IF9wZW5kaW5nID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghX3BlbmRpbmcpIHtcbiAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoX3BlbmRpbmcubGVuZ3RoKSB7XG4gICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIV9pdGVtcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9pdGVtcy5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFY+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8UmVjb3JkPE4sIFY+PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7XG4gICAgICB2YWx1ZTogbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9O1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT5cbiAgICAgIGV4dHJhc1trXSA9IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICB2YWx1ZTogYltrIGFzIGtleW9mIHR5cGVvZiBiXSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgIH1cbiAgfSBhcyBIZWxwZXJEZXNjcmlwdG9yczxWPjtcblxuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT5cbiAgICBleHRyYXNba10gPSB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH1cbiAgKVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2KSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodiwgSXRlcmFiaWxpdHkpITtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZCA9IGZhbHNlO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYpIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IGNvbnN1bWluZyBhbm90aGVyIGl0ZXJhdG9yYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gTmVlZCB0byBtYWtlIHRoaXMgbGF6eSByZWFsbHkgLSBkaWZmaWN1bHQgc2luY2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyBrbm93IGlmIGFueW9uZSBoYXMgYWxyZWFkeSBzdGFydGVkIGNvbnN1bWluZyBpdC4gU2luY2UgYXNzaWduaW5nXG4gICAgICAgICAgLy8gbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGEgYmFkIGlkZWFcbiAgICAgICAgICAvLyAoc2luY2Ugd2hhdCBkbyB3ZSBkbzogbWVyZ2U/IHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/KSxcbiAgICAgICAgICAvLyB0aGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgb25seSB0byBhbGxvdyBPTkUgbGF6eVxuICAgICAgICAgIC8vIGFzc2lnbm1lbnQgaWYgYW5kIG9ubHkgaWYgdGhpcyBpdGVyYWJsZSBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gJ2dldCcgeWV0LlxuICAgICAgICAgIC8vIEhvd2V2ZXIsIHRoaXMgd291bGQgYXQgcHJlc2VudCBwb3NzaWJseSBicmVhayB0aGUgaW5pdGlhbGlzYXRpb24gb2YgaXRlcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzIGFzIHRoZSBhcmUgaW5pdGlhbGl6ZWQgYnkgYXV0by1hc3NpZ25tZW50LCBpZiBpdCB3ZXJlIGluaXRpYWxpemVkXG4gICAgICAgICAgLy8gdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICBwaXBlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJyxcbiAgICAgICAgICAgICAgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LHYgPT4geyBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKSB9KS5maW5hbGx5KCgpID0+IHBpcGVkID0gZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBIZWxwZXJEZXNjcmlwdG9yczxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGxldCBib3hlZE9iamVjdCA9IElnbm9yZSBhcyB1bmtub3duIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgUGFydGlhbDxJdGVyYWJpbGl0eT4pO1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAuLi5wZHMsXG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8qIFRPRE86IFRoaXMgaXMgcHJvYmxlbWF0aWMgYXMgdGhlIG9iamVjdCBtaWdodCBoYXZlIGNsYXNoaW5nIGtleXMgYW5kIG5lc3RlZCBtZW1iZXJzLlxuICAgICAgICAgIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICogU3ByZWFkcyBpdGVyYWJsZSBvYmplY3RzIGluIHRvIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvYmplY3QsIGFuZCBvdmVycml0ZXMgY2xhc2hpbmcgbWVtYmVycyBsaWtlIGBtYXBgXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iai5tYXAobyA9PiBvLmZpZWxkKTtcbiAgICAgICAgICAqIFRoZSBpdGVyYXRvciB3aWxsIHlpZWxkIG9uXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iaiA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgKiBNZW1iZXJzIGFjY2VzcyBpcyBwcm94aWVkLCBzbyB0aGF0OlxuICAgICAgICAgICogICAgIChzZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGQgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgdW5kZXJseWluZyBvYmplY3QgdG8geWllbGQgYnkgcmUtYXNzaWdubWVudCAodGhlcmVmb3JlIGNhbGxpbmcgdGhlIHNldHRlcilcbiAgICAgICAgICAqIFNpbWlsYXJseTpcbiAgICAgICAgICAqICAgICAoZ2V0KSB0aGlzLml0ZXJhYmxlT2JqLmZpZWxkXG4gICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIGl0ZXJhdG9yIGZvciB0aGUgYmFzZSBvYmplY3QgdG8gYmUgbWFwcGVkLCBsaWtlXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iamVjdC5tYXAobyA9PiBvW2ZpZWxkXSlcbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSWdub3JlIGlzIHRoZSBJTklUSUFMIHZhbHVlXG4gICAgICAgICAgaWYgKGJveGVkT2JqZWN0ID09PSBJZ25vcmUpIHtcbiAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgYFRoZSBpdGVyYWJsZSBwcm9wZXJ0eSAnJHtuYW1lLnRvU3RyaW5nKCl9JyBvZiB0eXBlIFwib2JqZWN0XCIgd2lsbCBiZSBzcHJlYWQgdG8gcHJldmVudCByZS1pbml0aWFsaXNhdGlvbi5cXG4ke25ldyBFcnJvcigpLnN0YWNrPy5zbGljZSg2KX1gKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGEpKVxuICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFsuLi5hXSBhcyBWLCBwZHMpO1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIC8vIGJveGVkT2JqZWN0ID0gWy4uLmFdIGFzIFY7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGJveGVkT2JqZWN0ID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoeyAuLi4oYSBhcyBWKSB9LCBwZHMpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAvLyBib3hlZE9iamVjdCA9IHsgLi4uKGEgYXMgVikgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihib3hlZE9iamVjdCwgYSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChib3hlZE9iamVjdFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhib3hlZE9iamVjdCwgcGRzKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBCUk9LRU46IGZhaWxzIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYm94ZWRPYmplY3QsICd2YWx1ZU9mJywge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3RcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBib3hlZE9iamVjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBwcm94eSB0aGUgcmVzdWx0IHNvIHdlIGNhbiB0cmFjayBtZW1iZXJzIG9mIHRoZSBpdGVyYWJsZSBvYmplY3RcblxuICAgICAgICAgIGNvbnN0IGV4dHJhQm94ZWQ6IHR5cGVvZiBib3hlZE9iamVjdCA9IG5ldyBQcm94eShib3hlZE9iamVjdCwge1xuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGZpcmVzIHRoZSBpdGVyYXRvciBieSByZS1hc3NpZ25pbmcgdGhlIGl0ZXJhYmxlIHZpYSBpdCdzIHNldHRlclxuICAgICAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHB1c2gob2JqW25hbWVdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IHJldHVybnMgYSBtYXBwZWQgaXRlcmF0b3IgZm9yIHRoZSBzcGVjaWZpZWQgZmllbGRcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKVxuICAgICAgICAgICAgICAgIHJldHVybiAoKT0+Ym94ZWRPYmplY3Q7XG5cbi8vIEB0cy1pZ25vcmVcbi8vY29uc3QgdGFyZ2V0VmFsdWUgPSBrZXkgaW4gdGFyZ2V0ID8gKHRhcmdldFtrZXldIGFzIHVua25vd24pIDogSWdub3JlO1xuLy8gQHRzLWlnbm9yZVxuLy8gd2luZG93LmNvbnNvbGUubG9nKFwiKioqXCIsa2V5LHRhcmdldFZhbHVlLHBkc1trZXldKTtcbi8vICAgICAgICAgICAgICAgaWYgKHRhcmdldFZhbHVlICE9PSBJZ25vcmUpXG4vLyAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0VmFsdWU7XG4vLyAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcGRzKVxuLy8gICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gcGRzW2tleV0udmFsdWU7XG5cbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCxrZXkpO1xuICAgICAgICAgICAgICAvLyBXZSBpbmNsdWRlIGB0YXJnZXRQcm9wID09PSB1bmRlZmluZWRgIHNvIHdlIGNhbiBtb25pdG9yIG5lc3RlZCBwcm9wZXJ0aWVzIHRoYXQgYXJlbid0IGFjdHVhbGx5IGRlZmluZWQgKHlldClcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBvbmx5IGFwcGxpZXMgdG8gb2JqZWN0IGl0ZXJhYmxlcyAoc2luY2UgdGhlIHJvb3Qgb25lcyBhcmVuJ3QgcHJveGllZCksIGJ1dCBpdCBkb2VzIGFsbG93IHVzIHRvIGhhdmVcbiAgICAgICAgICAgICAgLy8gZGVmaW50aW9ucyBsaWtlOlxuICAgICAgICAgICAgICAvLyAgIGl0ZXJhYmxlOiB7IHN0dWZmOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgLi4uIH1cbiAgICAgICAgICAgICAgaWYgKHRhcmdldFByb3AgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRQcm9wLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhbFZhbHVlID0gUmVmbGVjdC5nZXQoYm94ZWRPYmplY3QgYXMgRXhjbHVkZTx0eXBlb2YgYm94ZWRPYmplY3QsIHR5cGVvZiBJZ25vcmU+LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKFxuICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdC5tYXAoKG8scCkgPT4ge1xuLy8gICAgICAgICAgICAgICAgICBleHRyYUJveGVkLm1hcCgobyxwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG92ID0gbz8uW2tleSBhcyBrZXlvZiB0eXBlb2Ygb10/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHYgPSBwPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3YgPT09IHR5cGVvZiBwdiAmJiBvdiA9PSBwdilcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWdub3JlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3YvL28/LltrZXkgYXMga2V5b2YgdHlwZW9mIG9dXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgKFJlZmxlY3Qub3duS2V5cyhwcm9wcykgYXMgKGtleW9mIHR5cGVvZiBwcm9wcylbXSkuZm9yRWFjaChrID0+IHByb3BzW2tdLmVudW1lcmFibGUgPSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHJldHVybiBib3gocmVhbFZhbHVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBleHRyYUJveGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0KGEpLCB7XG4gICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEudmFsdWVPZigpIH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQ6ICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8e2lkeDogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpPT57fVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+KVxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBbXTtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcbiAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gY291bnRcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgID8gaXRbaWR4XSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfX0pKVxuICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZH0gfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGxldCBwYzogUHJvbWlzZTx7aWR4OiBudW1iZXIsIGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdO1xuICBsZXQgc2k6IEFzeW5jSXRlcmF0b3I8YW55PltdID0gW107XG4gIGxldCBhY3RpdmU6bnVtYmVyID0gMDtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4ge30pO1xuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbayxzaXRdLCBpZHgpID0+IHtcbiAgICAgICAgICBhY3RpdmUgKz0gMTtcbiAgICAgICAgICBzaVtpZHhdID0gc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgICByZXR1cm4gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoe3NpLGlkeCxrLGlyfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpe1xuICAgICAgcGMuZm9yRWFjaCgocCxpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnJldHVybj8uKHYpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0udGhyb3c/LihleClcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhaSxcbiAgICAgIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYXN5bmNFeHRyYXMpKS5tYXAoKFtrLHZdKSA9PiBbayx7Li4udiwgZW51bWVyYWJsZTogZmFsc2V9XVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczpQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGLCBBbmQgPSB7fSwgT3IgPSBuZXZlcj4gPVxuICBGIGV4dGVuZHMgKCk9PkFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVua25vd24gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pXG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPik7XG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuXG50eXBlIFBhcnRpYWxJdGVyYWJsZTxUID0gYW55PiA9IFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUPj47XG5cbmZ1bmN0aW9uIHJlc29sdmVTeW5jPFosUj4odjogTWF5YmVQcm9taXNlZDxaPiwgdGhlbjoodjpaKT0+UiwgZXhjZXB0PzooeDphbnkpPT5hbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGV4Y2VwdCkge1xuICAgIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgICAgcmV0dXJuIHYudGhlbih0aGVuLGV4Y2VwdCk7XG4gICAgdHJ5IHsgcmV0dXJuIHRoZW4odikgfSBjYXRjaCAoZXgpIHsgdGhyb3cgZXggfVxuICB9XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbik7XG4gIHJldHVybiB0aGVuKHYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHNvdXJjZTogVSxcbiAgZm46IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPixcbiAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBsZXQgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmU7XG4gIGNvbnN0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyByZXNvbHZlKHApXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuXG4gICAgICAgICAgZXggPT5cbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmICghaXQ/LmRvbmUpIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50Ly8udGhlbih6YWxnbyA9PiB6YWxnbyk7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiB7IFtrOiBzdHJpbmddOiB1bmRlZmluZWQgfSwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0gIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufTtcbnR5cGUgV2hlbkV2ZW50cyA9IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCAmIFNwZWNpYWxXaGVuRXZlbnRzO1xudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlcjtcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXI7XG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8YC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/ICdjaGFuZ2UnXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dO1xuXG4vKiogd2hlbiAqKi9cbnR5cGUgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICBwdXNoOiAoZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKT0+dm9pZDtcbiAgdGVybWluYXRlOiAoZXg6IEVycm9yKT0+dm9pZDtcbiAgY29udGFpbmVyOiBFbGVtZW50XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsXG59O1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBjb250YWluZXIgfHwgY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkpKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCAnZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW0NTU0lkZW50aWZpZXIgfCBudWxsLCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW3BhcnRzWzBdLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbbnVsbCwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW3BhcnRzWzFdLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcblxuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gLypFdmVudE9ic2VydmF0aW9uPEV4Y2x1ZGU8RXh0cmFjdEV2ZW50TmFtZXM8RXZlbnROYW1lPiwga2V5b2YgU3BlY2lhbFdoZW5FdmVudHM+PiovID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lcixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKSEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBuZXZlckdvbm5hSGFwcGVuPFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWw6IENTU0lkZW50aWZpZXIgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgYXN5bmMgbmV4dCgpIHtcbiAgICAgICAgYXdhaXQgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpO1xuXG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvclxuICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgYWkucmV0dXJuID0gZXZlbnRzLnJldHVybj8uYmluZChldmVudHMpO1xuICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbjxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdDogRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lciwgc2VsZWN0b3JzKSxcbiAgICAgIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcilcbiAgICBdKTtcbiAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyOiBFbGVtZW50LCBtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xuXG4gIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQ08sSUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixLQUFLO0FBRXJILElBQU0sY0FBYztBQUUzQixJQUFNLFdBQVc7QUFBQSxFQUNmLE9BQU8sTUFBVztBQUNoQixRQUFJLE1BQU8sU0FBUSxJQUFJLGdCQUFn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QUEsRUFBVTtBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBTTtBQUFBLEVBQVc7QUFBQSxFQUFPO0FBQUEsRUFBVztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFTO0FBQUEsRUFDeEc7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBVztBQUFBLEVBQWE7QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUN0RztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBSztBQUFBLEVBQU87QUFBQSxFQUFJO0FBQUEsRUFBUztBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQ3pHO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFXO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFXO0FBQUEsRUFBUztBQUFBLEVBQVM7QUFBQSxFQUFJO0FBQUEsRUFBVTtBQUFBLEVBQ3ZHO0FBQUEsRUFBVztBQUFBLEVBQUk7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQU87QUFBQSxFQUFJO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBVTtBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUN4RztBQUFBLEVBQVM7QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFLO0FBQUEsRUFBVztBQUFBLEVBQVc7QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUN2RztBQUFBLEVBQVE7QUFBQSxF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RUEsSUFBTSxTQUFTLG9CQUFJLElBQVk7QUFDeEIsU0FBUyxnQkFBZ0IsTUFBMkIsS0FBK0I7QUFDeEYsU0FBTyxRQUFRO0FBQ2YsUUFBTSxPQUFPLENBQUM7QUFDZCxNQUFJLEtBQUssa0JBQWtCO0FBQ3pCLFNBQUssaUJBQWlCLE1BQU0sRUFBRSxRQUFRLFNBQVUsS0FBSztBQUNuRCxVQUFJLElBQUksSUFBSTtBQUNWLFlBQUksQ0FBQyxJQUFLLElBQUksRUFBRTtBQUNkLGNBQUssSUFBSSxFQUFFLElBQUk7QUFBQSxpQkFDUixPQUFPO0FBQ2QsY0FBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRztBQUN2QixtQkFBTyxJQUFJLElBQUksRUFBRTtBQUNqQixxQkFBUSxLQUFLLFdBQVcsaUNBQWlDLElBQUksSUFBSSxLQUFLLElBQUssSUFBSSxFQUFFLENBQUM7QUFBQSxVQUNwRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJpc01pc3NpbmciLCAibWVyZ2VkIiwgImMiLCAibiIsICJ2YWx1ZSIsICJpc0FuY2VzdHJhbCIsICJjaGlsZHJlbiJdCn0K
