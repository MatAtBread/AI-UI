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
  return x !== null && x !== void 0 && typeof x.then === "function";
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
var Iterability = Symbol("Iterability");
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
    return function(...args) {
      initIterator();
      return a[method].apply(this, args);
    };
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
          (p) => p.done ? resolve(p) : Promise.resolve(fn(p.value, prev)).then(
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

// src/tags.ts
var UniqueID = Symbol("Unique ID");

// src/ai-ui.ts
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
  const baseTagCreators = {};
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yLCBpdGVyYWJsZUhlbHBlcnMgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyBXaGVuUGFyYW1ldGVycywgV2hlblJldHVybiwgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBDaGlsZFRhZ3MsIENvbnN0cnVjdGVkLCBJbnN0YW5jZSwgT3ZlcnJpZGVzLCBUYWdDcmVhdG9yLCBVbmlxdWVJRCB9IGZyb20gJy4vdGFncy5qcydcbmltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIHt9ID0ge30+ID0geyBcbiAgY29tbW9uUHJvcGVydGllczogT3RoZXJNZW1iZXJzXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmludGVyZmFjZSBUYWdMb2FkZXIge1xuICAvKiogQGRlcHJlY2F0ZWQgLSBMZWdhY3kgZnVuY3Rpb24gc2ltaWxhciB0byBFbGVtZW50LmFwcGVuZC9iZWZvcmUvYWZ0ZXIgKi9cbiAgYXBwZW5kZXIoY29udGFpbmVyOiBOb2RlLCBiZWZvcmU/OiBOb2RlKTogKGM6IENoaWxkVGFncykgPT4gKE5vZGUgfCAoLypQICYqLyAoRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMpKSlbXTtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEO1xuICBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCk6IHZvaWQ7XG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH1cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfVxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9Pih0YWdzOiBUYWdzW10sIG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfVxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+XG59XG5cbmxldCBpZENvdW50ID0gMDtcbmNvbnN0IHN0YW5kYW5kVGFncyA9IFtcbiAgXCJhXCIsXCJhYmJyXCIsXCJhZGRyZXNzXCIsXCJhcmVhXCIsXCJhcnRpY2xlXCIsXCJhc2lkZVwiLFwiYXVkaW9cIixcImJcIixcImJhc2VcIixcImJkaVwiLFwiYmRvXCIsXCJibG9ja3F1b3RlXCIsXCJib2R5XCIsXCJiclwiLFwiYnV0dG9uXCIsXG4gIFwiY2FudmFzXCIsXCJjYXB0aW9uXCIsXCJjaXRlXCIsXCJjb2RlXCIsXCJjb2xcIixcImNvbGdyb3VwXCIsXCJkYXRhXCIsXCJkYXRhbGlzdFwiLFwiZGRcIixcImRlbFwiLFwiZGV0YWlsc1wiLFwiZGZuXCIsXCJkaWFsb2dcIixcImRpdlwiLFxuICBcImRsXCIsXCJkdFwiLFwiZW1cIixcImVtYmVkXCIsXCJmaWVsZHNldFwiLFwiZmlnY2FwdGlvblwiLFwiZmlndXJlXCIsXCJmb290ZXJcIixcImZvcm1cIixcImgxXCIsXCJoMlwiLFwiaDNcIixcImg0XCIsXCJoNVwiLFwiaDZcIixcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcImhncm91cFwiLFwiaHJcIixcImh0bWxcIixcImlcIixcImlmcmFtZVwiLFwiaW1nXCIsXCJpbnB1dFwiLFwiaW5zXCIsXCJrYmRcIixcImxhYmVsXCIsXCJsZWdlbmRcIixcImxpXCIsXCJsaW5rXCIsXCJtYWluXCIsXCJtYXBcIixcbiAgXCJtYXJrXCIsXCJtZW51XCIsXCJtZXRhXCIsXCJtZXRlclwiLFwibmF2XCIsXCJub3NjcmlwdFwiLFwib2JqZWN0XCIsXCJvbFwiLFwib3B0Z3JvdXBcIixcIm9wdGlvblwiLFwib3V0cHV0XCIsXCJwXCIsXCJwaWN0dXJlXCIsXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLFwicVwiLFwicnBcIixcInJ0XCIsXCJydWJ5XCIsXCJzXCIsXCJzYW1wXCIsXCJzY3JpcHRcIixcInNlYXJjaFwiLFwic2VjdGlvblwiLFwic2VsZWN0XCIsXCJzbG90XCIsXCJzbWFsbFwiLFwic291cmNlXCIsXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXCJzdHlsZVwiLFwic3ViXCIsXCJzdW1tYXJ5XCIsXCJzdXBcIixcInRhYmxlXCIsXCJ0Ym9keVwiLFwidGRcIixcInRlbXBsYXRlXCIsXCJ0ZXh0YXJlYVwiLFwidGZvb3RcIixcInRoXCIsXCJ0aGVhZFwiLFwidGltZVwiLFxuICBcInRpdGxlXCIsXCJ0clwiLFwidHJhY2tcIixcInVcIixcInVsXCIsXCJ2YXJcIixcInZpZGVvXCIsXCJ3YnJcIlxuXSBhcyBjb25zdDtcblxuY29uc3QgZWxlbWVudFByb3R5cGU6IFBvRWxlbWVudE1ldGhvZHMgJiBUaGlzVHlwZTxFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz4gPSB7XG4gIGdldCBpZHMoKSB7XG4gICAgcmV0dXJuIGdldEVsZW1lbnRJZE1hcCh0aGlzLCAvKk9iamVjdC5jcmVhdGUodGhpcy5kZWZhdWx0cykgfHwqLyk7XG4gIH0sXG4gIHNldCBpZHModjogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICB9LFxuICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gIH1cbn1cblxuY29uc3QgcG9TdHlsZUVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbnBvU3R5bGVFbHQuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlcy1cIjtcblxuZnVuY3Rpb24gaXNDaGlsZFRhZyh4OiBhbnkpOiB4IGlzIENoaWxkVGFncyB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZydcbiAgICB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcidcbiAgICB8fCB0eXBlb2YgeCA9PT0gJ2Jvb2xlYW4nXG4gICAgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgdHlwZW9mIHhbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuXG5leHBvcnQgY29uc3QgdGFnID0gPFRhZ0xvYWRlcj5mdW5jdGlvbiA8VGFncyBleHRlbmRzIHN0cmluZyxcbiAgVDEgZXh0ZW5kcyAoc3RyaW5nIHwgVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgVDIgZXh0ZW5kcyAoVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgUSBleHRlbmRzIHt9XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XTtcblxuICBjb25zdCBjb21tb25Qcm9wZXJ0aWVzID0gb3B0aW9ucz8uY29tbW9uUHJvcGVydGllcztcblxuICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgY2FsbGVkICovXG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZWxlbWVudFByb3R5cGUpLCAvLyBXZSBrbm93IGl0J3Mgbm90IG5lc3RlZFxuICApO1xuXG4gIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gIC8vIHRvIGNvcHkgYSBnZXR0ZXIvc2V0dGVyIHBhaXIgZnJvbSBhbm90aGVyIG9iamVjdFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywgJ2F0dHJpYnV0ZXMnLCB7XG4gICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwnYXR0cmlidXRlcycpLFxuICAgIHNldChhOiBvYmplY3QpIHtcbiAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBjb25zdCBzdGVwID0gKCk9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oXCIoQUktVUkpXCIsZXgpKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pIHtcbiAgICBjb25zdCBhcHBlbmRlZDogTm9kZVtdID0gW107XG4gICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGM6IENoaWxkVGFncykge1xuICAgICAgaWYgKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgbGV0IGc6IE5vZGVbXSA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGdbMF0pO1xuICAgICAgICBjLnRoZW4ociA9PiB7XG4gICAgICAgICAgY29uc3QgbiA9IG5vZGVzKHIpO1xuICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgaWYgKG9sZFswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBhcHBlbmRlcihvbGRbMF0ucGFyZW50Tm9kZSwgb2xkWzBdKShuKTtcbiAgICAgICAgICAgIG9sZC5mb3JFYWNoKGUgPT4gZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGcgPSBuO1xuICAgICAgICB9LCAoeDphbnkpID0+IHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLHgsZyk7XG4gICAgICAgICAgY29uc3QgZXJyb3JOb2RlID0gZ1swXTtcbiAgICAgICAgICBpZiAoZXJyb3JOb2RlKVxuICAgICAgICAgICAgZXJyb3JOb2RlLnBhcmVudE5vZGU/LnJlcGxhY2VDaGlsZChEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiB4fSksIGVycm9yTm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgYXBwZW5kZWQucHVzaChjKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBc3luY0l0ZXI8Q2hpbGRUYWdzPihjKSkge1xuICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCBkcG0gPSAodW5ib3hlZCA9PT0gdW5kZWZpbmVkIHx8IHVuYm94ZWQgPT09IGMpID8gW0RvbVByb21pc2VDb250YWluZXIoKV0gOiBub2Rlcyh1bmJveGVkIGFzIENoaWxkVGFncylcbiAgICAgICAgYXBwZW5kZWQucHVzaCguLi5kcG0pO1xuXG4gICAgICAgIGxldCB0OiBSZXR1cm5UeXBlPFJldHVyblR5cGU8dHlwZW9mIGFwcGVuZGVyPj4gPSBkcG07XG4gICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgIGlmIChuLmxlbmd0aCkge1xuICAgICAgICAgICAgdCA9IGFwcGVuZGVyKG5bMF0ucGFyZW50Tm9kZSEsIG5bMF0pKER5YW1pY0VsZW1lbnRFcnJvcih7ZXJyb3I6IGVycm9yVmFsdWV9KSk7XG4gICAgICAgICAgICBuLmZvckVhY2goZSA9PiAhdC5pbmNsdWRlcyhlKSAmJiBlLnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIGNyZWF0ZWRCeSwgdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PENoaWxkVGFncz4pID0+IHtcbiAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5vd25lckRvY3VtZW50Py5ib2R5LmNvbnRhaW5zKGUpKTtcbiAgICAgICAgICAgICAgY29uc3QgbiA9IG5vdFlldE1vdW50ZWQgPyB0IDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG1vdW50ZWQubGVuZ3RoKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGRvIG5vdCBleGlzdCBpbiBkb2N1bWVudFwiICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudChzKSBkbyBub3QgZXhpc3QgaW4gZG9jdW1lbnRcIiArIGluc2VydGlvblN0YWNrKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuYCxjcmVhdGVkQnksIHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHEgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICB0ID0gYXBwZW5kZXIoblswXS5wYXJlbnROb2RlISwgblswXSkocS5sZW5ndGggPyBxIDogRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIGFwLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgYz8uW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGMpIGNoaWxkcmVuKGQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcHBlbmRlZC5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgIH0pKGMpO1xuICAgIHJldHVybiBhcHBlbmRlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZGVyKGNvbnRhaW5lcjogTm9kZSwgYmVmb3JlPzogTm9kZSB8IG51bGwpIHtcbiAgICBpZiAoYmVmb3JlID09PSB1bmRlZmluZWQpXG4gICAgICBiZWZvcmUgPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbiAoYzogQ2hpbGRUYWdzKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzKGMpO1xuICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICAvLyBcImJlZm9yZVwiLCBiZWluZyBhIG5vZGUsIGNvdWxkIGJlICN0ZXh0IG5vZGVcbiAgICAgICAgaWYgKGJlZm9yZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5iZWZvcmUuY2FsbChiZWZvcmUsIC4uLmNoaWxkcmVuKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFdlJ3JlIGEgdGV4dCBub2RlIC0gd29yayBiYWNrd2FyZHMgYW5kIGluc2VydCAqYWZ0ZXIqIHRoZSBwcmVjZWVkaW5nIEVsZW1lbnRcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSBiZWZvcmUucGFyZW50Tm9kZTtcbiAgICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBpcyBudWxsXCIpO1xuXG4gICAgICAgICAgaWYgKHBhcmVudCAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLFwiSW50ZXJuYWwgZXJyb3IgLSBjb250YWluZXIgbWlzbWF0Y2hcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkcmVuW2ldLCBiZWZvcmUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmQuY2FsbChjb250YWluZXIsIC4uLmNoaWxkcmVuKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuICB9XG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcse1xuICAgICAgYXBwZW5kZXIsIC8vIExlZ2FjeSBSVEEgc3VwcG9ydFxuICAgICAgbm9kZXMsICAgIC8vIFByZWZlcnJlZCBpbnRlcmZhY2UgaW5zdGVhZCBvZiBgYXBwZW5kZXJgXG4gICAgICBVbmlxdWVJRCxcbiAgICAgIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgY29uc3QgcGxhaW5PYmplY3RQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pO1xuICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZDogUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgYW55PiwgczogYW55LCBkZWNsYXJhdGlvbj86IHRydWUpOiB2b2lkIHtcbiAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzb3VyY2UgdmFsdWUgaXMgYW4gb2JqZWN0LCBhbmQgd2UncmUgZGVjbGFyaW5nIGl0ICh0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGEgbmV3IG9uZSksIHRha2VcbiAgICAgICAgICAgICAgICAvLyBhIGNvcHkgc28gYXMgdG8gbm90IHJlLXVzZSB0aGUgcmVmZXJlbmNlIGFuZCBwb2xsdXRlIHRoZSBkZWNsYXJhdGlvbi4gTm90ZTogdGhpcyBpcyBwcm9iYWJseVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuJ3QgYmUgY29waWVkXG4gICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSA9PT0gcGxhaW5PYmplY3RQcm90b3R5cGUgfHwgIU9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwbGFpbiBvYmplY3QgY2FuIGJlIGRlZXAtY29waWVkIGJ5IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIGFycmF5IGNhbiBiZSBkZWVwIGNvcGllZCBieSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSBbXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgb2JqZWN0IGxpa2UgdGhpbmdzIChyZWdleHBzLCBkYXRlcywgY2xhc3NlcywgZXRjKSBjYW4ndCBiZSBkZWVwLWNvcGllZCByZWxpYWJseVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERlY2xhcmVkIHByb3BldHkgJyR7a30nIGlzIG5vdCBhIHBsYWluIG9iamVjdCBhbmQgbXVzdCBiZSBhc3NpZ25lZCBieSByZWZlcmVuY2UsIHBvc3NpYmx5IHBvbGx1dGluZyBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyB0YWdgLCBkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94KGE6IHVua25vd24pOiB1bmtub3duIHtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsdW5ib3gpIDogdjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IEVsZW1lbnQsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoKGEsYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCxhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhpcyBwcm9taXNlIHJlc29sdmVkIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBzZXQgYXR0cmlidXRlXCIsIGVycm9yKSlcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZTogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlczogSXRlcmF0b3JSZXN1bHQ8dW5rbm93bj4pID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2Uub3duZXJEb2N1bWVudC5jb250YWlucyhiYXNlKTtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBiZWVuIG1vdW50ZWQgYmVmb3JlLCBiaXQgYXJlbid0IG5vdywgcmVtb3ZlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICBpZiAoIW5vdFlldE1vdW50ZWQgJiYgIW1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgRWxlbWVudCBkb2VzIG5vdCBleGlzdCBpbiBkb2N1bWVudCB3aGVuIHNldHRpbmcgYXN5bmMgYXR0cmlidXRlICcke2t9J2A7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW91bnRlZCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIGJhc2UpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGNyZWF0ZWRCeSwgYmFzZSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXNcIiwgaywgdmFsdWUpO1xuICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBkW2tdID0gY29weTtcbiAgICAgICAgICAgICAgICAvL2Fzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgdHlwZSBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRyczp7XG4gICAgZGVidWdnZXI/OiB1bmtub3duO1xuICAgIGRvY3VtZW50PzogRG9jdW1lbnQ7XG4gICAgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXTtcbiAgICBbazogc3RyaW5nXTogdW5rbm93bjtcbiAgfSB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBFbGVtZW50XG5cbiAgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gICAgc3VwZXI6IFRhZ0NyZWF0b3I8RWxlbWVudD47XG4gICAgZGVmaW5pdGlvbjogT3ZlcnJpZGVzO1xuICAgIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgICBleHRlbmRlZDogKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkgPT4gRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKHRoaXM6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIGU6IGFueSkge1xuICAgIGZvciAobGV0IGMgPSBlLmNvbnN0cnVjdG9yOyBjOyBjID0gYy5zdXBlcikge1xuICAgICAgaWYgKGMgPT09IHRoaXMpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmRlZCh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpIHtcbiAgICBjb25zdCBpbnN0YW5jZURlZmluaXRpb24gPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICA/IChpbnN0YW5jZTogSW5zdGFuY2UpID0+IE9iamVjdC5hc3NpZ24oe30sX292ZXJyaWRlcyxpbnN0YW5jZSlcbiAgICAgIDogX292ZXJyaWRlc1xuXG4gICAgY29uc3QgdW5pcXVlVGFnSUQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSsoaWRDb3VudCsrKS50b1N0cmluZygzNikrTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG4gICAgbGV0IHN0YXRpY0V4dGVuc2lvbnM6IE92ZXJyaWRlcyA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgIC8qIFwiU3RhdGljYWxseVwiIGNyZWF0ZSBhbnkgc3R5bGVzIHJlcXVpcmVkIGJ5IHRoaXMgd2lkZ2V0ICovXG4gICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICBwb1N0eWxlRWx0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgIGlmICghZG9jdW1lbnQuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHBvU3R5bGVFbHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgIC8vIChmaW5hbGx5KSBhc3NpZ25pbmcgdGhvc2Ugc3BlY2lmaWVkIGJ5IHRoZSBpbnN0YW50aWF0aW9uXG4gICAgY29uc3QgZXh0ZW5kVGFnRm46IEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgY29uc3Qgbm9BdHRycyA9IGlzQ2hpbGRUYWcoYXR0cnMpIDtcbiAgICAgIGNvbnN0IG5ld0NhbGxTdGFjazogKENvbnN0cnVjdGVkICYgT3ZlcnJpZGVzKVtdID0gW107XG4gICAgICBjb25zdCBjb21iaW5lZEF0dHJzID0geyBbY2FsbFN0YWNrU3ltYm9sXTogKG5vQXR0cnMgPyBuZXdDYWxsU3RhY2sgOiBhdHRyc1tjYWxsU3RhY2tTeW1ib2xdKSA/PyBuZXdDYWxsU3RhY2sgIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLGQpKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVjbGFyZWQga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGFscmVhZHkgZXhpc3QgaW4gYmFzZSAnJHt0aGlzLnZhbHVlT2YoKX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKS5maWx0ZXIoZCA9PiAhKGQgaW4gZSkgJiYgIShjb21tb25Qcm9wZXJ0aWVzICYmIGQgaW4gY29tbW9uUHJvcGVydGllcykgJiYgIWlzQW5jZXN0cmFsKHRoaXMsZCkpO1xuICAgICAgICAgIGlmIChjbGFzaC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPdmVycmlkZGVuIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBkbyBub3QgZXhpc3QgaW4gYmFzZSAnJHt0aGlzLnZhbHVlT2YoKX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24uZGVjbGFyZSwgdHJ1ZSk7XG4gICAgICBkZWVwRGVmaW5lKGUsIHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgIH0pO1xuICAgICAgaWYgKGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXSA9PT0gbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgIGlmICghbm9BdHRycylcbiAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGJhc2U/LmNvbnN0cnVjdGVkPy5jYWxsKGUpO1xuICAgICAgICAgIGlmIChpc0NoaWxkVGFnKGNoaWxkcmVuKSkgLy8gdGVjaG5pY2FsbHkgbm90IG5lY2Vzc2FyeSwgc2luY2UgXCJ2b2lkXCIgaXMgZ29pbmcgdG8gYmUgdW5kZWZpbmVkIGluIDk5LjklIG9mIGNhc2VzLlxuICAgICAgICAgICAgYXBwZW5kZXIoZSkoY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgaWYgKCEoIW5vQXR0cnMgJiYgayBpbiBhdHRycyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV07XG4gICAgICAgICAgICAgIGlmICh2YWx1ZT8udmFsdWVPZigpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBlW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csJy0nKSArIGNhbGxTaXRlK1wiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczoge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHt9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFBhcnRpYWw8e1xuICAgICAgZGVidWdnZXI/OiBhbnk7XG4gICAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIH0+IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IHtcbiAgICAgIGxldCBkb2MgPSBkb2N1bWVudDtcbiAgICAgIGlmIChpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgYXR0cnMgPSB7fSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgaWYgKGF0dHJzLmRlYnVnZ2VyKSB7XG4gICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRycy5kb2N1bWVudCkge1xuICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlIGFzIHN0cmluZywgay50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgIGUuY29uc3RydWN0b3IgPSB0YWdDcmVhdG9yO1xuXG4gICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnUHJvdG90eXBlcyk7XG4gICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcblxuICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKT0+eyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBpbnZva2UgbmF0aXZlIGVsZW1lbmV0IGNvbnN0cnVjdG9ycyBkaXJlY3RseS4gVXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cIikgfSxcbiAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICB9XG5cbiAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufVxuXG5jb25zdCBEb21Qcm9taXNlQ29udGFpbmVyID0gKCkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChERUJVRyA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiIDogXCJwcm9taXNlXCIpXG59XG5cbmNvbnN0IER5YW1pY0VsZW1lbnRFcnJvciA9ICh7IGVycm9yIH06eyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj59KSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicrSlNPTi5zdHJpbmdpZnkoZXJyb3IsbnVsbCwyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiAqKCl7fSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge30gLy8gT25seSBjcmVhdGUgdGhlIG9ic2VydmVyIG9uY2VcbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKFxuICAgICAgICAgIHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgWy4uLnJlbW92ZWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLCByZW1vdmVkXS5maWx0ZXIoZWx0ID0+ICFlbHQub3duZXJEb2N1bWVudC5jb250YWlucyhlbHQpKS5mb3JFYWNoKFxuICAgICAgICAgICAgICBlbHQgPT4ge1xuICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59XG5cbmNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRJZE1hcChub2RlPzogRWxlbWVudCB8IERvY3VtZW50LCBpZHM/OiBSZWNvcmQ8c3RyaW5nLCBFbGVtZW50Pikge1xuICBub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbiAgaWRzID0gaWRzIHx8IHt9XG4gIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWRdXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsdCkge1xuICAgICAgaWYgKGVsdC5pZCkge1xuICAgICAgICBpZiAoIWlkcyFbZWx0LmlkXSlcbiAgICAgICAgICBpZHMhW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgIGVsc2UgaWYgKERFQlVHKSB7XG4gICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKGVsdC5pZCkpIHtcbiAgICAgICAgICAgIHdhcm5lZC5hZGQoZWx0LmlkKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQsIGVsdCwgaWRzIVtlbHQuaWRdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaWRzO1xufVxuXG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgZ2xvYmFsVGhpcy5ERUJVRz8ubWF0Y2goLyhefFxcVylBSS1VSShcXFd8JCkvKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncylcbiAgfSxcbiAgd2FybiguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUud2FybignKEFJLVVJKSBXQVJOOicsIC4uLmFyZ3MpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmRlYnVnKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4geCAhPT0gbnVsbCAmJiB4ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiXG5pbXBvcnQgeyBJdGVyYWJsZVByb3BlcnRpZXMgfSBmcm9tIFwiLi90YWdzLmpzXCJcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuICBwdXNoKHZhbHVlOiBUKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3luY0V4dHJhSXRlcmFibGU8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBvICYmIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKSByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgaWYgKGlzQXN5bmNJdGVyYXRvcihvKSkgcmV0dXJuIG87XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhcyBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSxcbiAgICBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPixcbiAgICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4gICkge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgZm4sIGluaXRpYWxWYWx1ZSlcbiAgfSxcbiAgbWFwLFxuICBmaWx0ZXIsXG4gIHVuaXF1ZSxcbiAgd2FpdEZvcixcbiAgbXVsdGksXG4gIGluaXRpYWxseSxcbiAgY29uc3VtZSxcbiAgbWVyZ2U8VCwgQSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+PltdPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIC4uLm06IEEpIHtcbiAgICByZXR1cm4gbWVyZ2UodGhpcywgLi4ubSk7XG4gIH0sXG4gIGNvbWJpbmU8VCwgUyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgb3RoZXJzOiBTKSB7XG4gICAgcmV0dXJuIGNvbWJpbmUoT2JqZWN0LmFzc2lnbih7ICdfdGhpcyc6IHRoaXMgfSwgb3RoZXJzKSk7XG4gIH1cbn07XG5cbmNvbnN0IGV4dHJhS2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGFzeW5jRXh0cmFzKSwgLi4uT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXSBhcyAoa2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzKVtdO1xuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBsZXQgX3BlbmRpbmcgPSBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsO1xuICBsZXQgX2l0ZW1zOiBUW10gfCBudWxsID0gW107XG5cbiAgY29uc3QgcTogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKF9pdGVtcz8ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IF9pdGVtcy5zaGlmdCgpISB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCBxIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIF9wZW5kaW5nIS5wdXNoKHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChfcGVuZGluZykge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAoX3BlbmRpbmcubGVuZ3RoKVxuICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBfaXRlbXMgPSBfcGVuZGluZyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgdGhyb3coLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgaWYgKF9wZW5kaW5nKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChfcGVuZGluZy5sZW5ndGgpXG4gICAgICAgICAgX3BlbmRpbmcuc2hpZnQoKSEucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFfcGVuZGluZykge1xuICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcInF1ZXVlSXRlcmF0b3IgaGFzIHN0b3BwZWRcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChfcGVuZGluZy5sZW5ndGgpIHtcbiAgICAgICAgX3BlbmRpbmcuc2hpZnQoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghX2l0ZW1zKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2l0ZW1zLnB1c2godmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IHR5cGUgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+ID0geyBbSXRlcmFiaWxpdHldOiBEZXB0aCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFY+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8UmVjb3JkPE4sIFY+PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7XG4gICAgICB2YWx1ZTogbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9O1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT5cbiAgICAgIGV4dHJhc1trXSA9IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICB2YWx1ZTogYltrIGFzIGtleW9mIHR5cGVvZiBiXSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiBmdW5jdGlvbih0aGlzOiB1bmtub3duLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICByZXR1cm4gYVttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgIH1cbiAgfSBhcyBIZWxwZXJEZXNjcmlwdG9yczxWPjtcblxuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT5cbiAgICBleHRyYXNba10gPSB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH1cbiAgKVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2KSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodiwgSXRlcmFiaWxpdHkpITtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZCA9IGZhbHNlO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYpIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IGNvbnN1bWluZyBhbm90aGVyIGl0ZXJhdG9yYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gTmVlZCB0byBtYWtlIHRoaXMgbGF6eSByZWFsbHkgLSBkaWZmaWN1bHQgc2luY2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyBrbm93IGlmIGFueW9uZSBoYXMgYWxyZWFkeSBzdGFydGVkIGNvbnN1bWluZyBpdC4gU2luY2UgYXNzaWduaW5nXG4gICAgICAgICAgLy8gbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGEgYmFkIGlkZWFcbiAgICAgICAgICAvLyAoc2luY2Ugd2hhdCBkbyB3ZSBkbzogbWVyZ2U/IHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/KSxcbiAgICAgICAgICAvLyB0aGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgb25seSB0byBhbGxvdyBPTkUgbGF6eVxuICAgICAgICAgIC8vIGFzc2lnbm1lbnQgaWYgYW5kIG9ubHkgaWYgdGhpcyBpdGVyYWJsZSBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gJ2dldCcgeWV0LlxuICAgICAgICAgIC8vIEhvd2V2ZXIsIHRoaXMgd291bGQgYXQgcHJlc2VudCBwb3NzaWJseSBicmVhayB0aGUgaW5pdGlhbGlzYXRpb24gb2YgaXRlcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzIGFzIHRoZSBhcmUgaW5pdGlhbGl6ZWQgYnkgYXV0by1hc3NpZ25tZW50LCBpZiBpdCB3ZXJlIGluaXRpYWxpemVkXG4gICAgICAgICAgLy8gdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICBwaXBlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJyxcbiAgICAgICAgICAgICAgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LHYgPT4geyBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKSB9KS5maW5hbGx5KCgpID0+IHBpcGVkID0gZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBIZWxwZXJEZXNjcmlwdG9yczxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGxldCBib3hlZE9iamVjdCA9IElnbm9yZSBhcyB1bmtub3duIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgUGFydGlhbDxJdGVyYWJpbGl0eT4pO1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAuLi5wZHMsXG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8qIFRPRE86IFRoaXMgaXMgcHJvYmxlbWF0aWMgYXMgdGhlIG9iamVjdCBtaWdodCBoYXZlIGNsYXNoaW5nIGtleXMgYW5kIG5lc3RlZCBtZW1iZXJzLlxuICAgICAgICAgIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICogU3ByZWFkcyBpdGVyYWJsZSBvYmplY3RzIGluIHRvIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvYmplY3QsIGFuZCBvdmVycml0ZXMgY2xhc2hpbmcgbWVtYmVycyBsaWtlIGBtYXBgXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iai5tYXAobyA9PiBvLmZpZWxkKTtcbiAgICAgICAgICAqIFRoZSBpdGVyYXRvciB3aWxsIHlpZWxkIG9uXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iaiA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgKiBNZW1iZXJzIGFjY2VzcyBpcyBwcm94aWVkLCBzbyB0aGF0OlxuICAgICAgICAgICogICAgIChzZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGQgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgdW5kZXJseWluZyBvYmplY3QgdG8geWllbGQgYnkgcmUtYXNzaWdubWVudCAodGhlcmVmb3JlIGNhbGxpbmcgdGhlIHNldHRlcilcbiAgICAgICAgICAqIFNpbWlsYXJseTpcbiAgICAgICAgICAqICAgICAoZ2V0KSB0aGlzLml0ZXJhYmxlT2JqLmZpZWxkXG4gICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIGl0ZXJhdG9yIGZvciB0aGUgYmFzZSBvYmplY3QgdG8gYmUgbWFwcGVkLCBsaWtlXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iamVjdC5tYXAobyA9PiBvW2ZpZWxkXSlcbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSWdub3JlIGlzIHRoZSBJTklUSUFMIHZhbHVlXG4gICAgICAgICAgaWYgKGJveGVkT2JqZWN0ID09PSBJZ25vcmUpIHtcbiAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgYFRoZSBpdGVyYWJsZSBwcm9wZXJ0eSAnJHtuYW1lLnRvU3RyaW5nKCl9JyBvZiB0eXBlIFwib2JqZWN0XCIgd2lsbCBiZSBzcHJlYWQgdG8gcHJldmVudCByZS1pbml0aWFsaXNhdGlvbi5cXG4ke25ldyBFcnJvcigpLnN0YWNrPy5zbGljZSg2KX1gKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGEpKVxuICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFsuLi5hXSBhcyBWLCBwZHMpO1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIC8vIGJveGVkT2JqZWN0ID0gWy4uLmFdIGFzIFY7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGJveGVkT2JqZWN0ID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoeyAuLi4oYSBhcyBWKSB9LCBwZHMpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAvLyBib3hlZE9iamVjdCA9IHsgLi4uKGEgYXMgVikgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihib3hlZE9iamVjdCwgYSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChib3hlZE9iamVjdFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhib3hlZE9iamVjdCwgcGRzKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBCUk9LRU46IGZhaWxzIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYm94ZWRPYmplY3QsICd2YWx1ZU9mJywge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3RcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBib3hlZE9iamVjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBwcm94eSB0aGUgcmVzdWx0IHNvIHdlIGNhbiB0cmFjayBtZW1iZXJzIG9mIHRoZSBpdGVyYWJsZSBvYmplY3RcblxuICAgICAgICAgIGNvbnN0IGV4dHJhQm94ZWQ6IHR5cGVvZiBib3hlZE9iamVjdCA9IG5ldyBQcm94eShib3hlZE9iamVjdCwge1xuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGZpcmVzIHRoZSBpdGVyYXRvciBieSByZS1hc3NpZ25pbmcgdGhlIGl0ZXJhYmxlIHZpYSBpdCdzIHNldHRlclxuICAgICAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHB1c2gob2JqW25hbWVdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IHJldHVybnMgYSBtYXBwZWQgaXRlcmF0b3IgZm9yIHRoZSBzcGVjaWZpZWQgZmllbGRcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKVxuICAgICAgICAgICAgICAgIHJldHVybiAoKT0+Ym94ZWRPYmplY3Q7XG5cbi8vIEB0cy1pZ25vcmVcbi8vY29uc3QgdGFyZ2V0VmFsdWUgPSBrZXkgaW4gdGFyZ2V0ID8gKHRhcmdldFtrZXldIGFzIHVua25vd24pIDogSWdub3JlO1xuLy8gQHRzLWlnbm9yZVxuLy8gd2luZG93LmNvbnNvbGUubG9nKFwiKioqXCIsa2V5LHRhcmdldFZhbHVlLHBkc1trZXldKTtcbi8vICAgICAgICAgICAgICAgaWYgKHRhcmdldFZhbHVlICE9PSBJZ25vcmUpXG4vLyAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0VmFsdWU7XG4vLyAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcGRzKVxuLy8gICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gcGRzW2tleV0udmFsdWU7XG5cbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCxrZXkpO1xuICAgICAgICAgICAgICAvLyBXZSBpbmNsdWRlIGB0YXJnZXRQcm9wID09PSB1bmRlZmluZWRgIHNvIHdlIGNhbiBtb25pdG9yIG5lc3RlZCBwcm9wZXJ0aWVzIHRoYXQgYXJlbid0IGFjdHVhbGx5IGRlZmluZWQgKHlldClcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBvbmx5IGFwcGxpZXMgdG8gb2JqZWN0IGl0ZXJhYmxlcyAoc2luY2UgdGhlIHJvb3Qgb25lcyBhcmVuJ3QgcHJveGllZCksIGJ1dCBpdCBkb2VzIGFsbG93IHVzIHRvIGhhdmVcbiAgICAgICAgICAgICAgLy8gZGVmaW50aW9ucyBsaWtlOlxuICAgICAgICAgICAgICAvLyAgIGl0ZXJhYmxlOiB7IHN0dWZmOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgLi4uIH1cbiAgICAgICAgICAgICAgaWYgKHRhcmdldFByb3AgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRQcm9wLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhbFZhbHVlID0gUmVmbGVjdC5nZXQoYm94ZWRPYmplY3QgYXMgRXhjbHVkZTx0eXBlb2YgYm94ZWRPYmplY3QsIHR5cGVvZiBJZ25vcmU+LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKFxuICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdC5tYXAoKG8scCkgPT4ge1xuLy8gICAgICAgICAgICAgICAgICBleHRyYUJveGVkLm1hcCgobyxwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG92ID0gbz8uW2tleSBhcyBrZXlvZiB0eXBlb2Ygb10/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHYgPSBwPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3YgPT09IHR5cGVvZiBwdiAmJiBvdiA9PSBwdilcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWdub3JlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3YvL28/LltrZXkgYXMga2V5b2YgdHlwZW9mIG9dXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgKFJlZmxlY3Qub3duS2V5cyhwcm9wcykgYXMgKGtleW9mIHR5cGVvZiBwcm9wcylbXSkuZm9yRWFjaChrID0+IHByb3BzW2tdLmVudW1lcmFibGUgPSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHJldHVybiBib3gocmVhbFZhbHVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBleHRyYUJveGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0KGEpLCB7XG4gICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEudmFsdWVPZigpIH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQ6ICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8e2lkeDogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpPT57fVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+KVxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBbXTtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcbiAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gY291bnRcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgID8gaXRbaWR4XSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfX0pKVxuICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZH0gfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGxldCBwYzogUHJvbWlzZTx7aWR4OiBudW1iZXIsIGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdO1xuICBsZXQgc2k6IEFzeW5jSXRlcmF0b3I8YW55PltdID0gW107XG4gIGxldCBhY3RpdmU6bnVtYmVyID0gMDtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4ge30pO1xuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbayxzaXRdLCBpZHgpID0+IHtcbiAgICAgICAgICBhY3RpdmUgKz0gMTtcbiAgICAgICAgICBzaVtpZHhdID0gc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgICByZXR1cm4gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoe3NpLGlkeCxrLGlyfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpe1xuICAgICAgcGMuZm9yRWFjaCgocCxpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnJldHVybj8uKHYpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0udGhyb3c/LihleClcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhaSxcbiAgICAgIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYXN5bmNFeHRyYXMpKS5tYXAoKFtrLHZdKSA9PiBbayx7Li4udiwgZW51bWVyYWJsZTogZmFsc2V9XVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczpQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGLCBBbmQgPSB7fSwgT3IgPSBuZXZlcj4gPVxuICBGIGV4dGVuZHMgKCk9PkFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVua25vd24gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pXG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBSIHwgUHJvbWlzZUxpa2U8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGxldCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZTtcbiAgY29uc3QgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IHJlc29sdmUocClcbiAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKGZuKHAudmFsdWUsIHByZXYpKS50aGVuKFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuXG4gICAgICAgICAgZXggPT5cbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmICghaXQ/LmRvbmUpIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50Ly8udGhlbih6YWxnbyA9PiB6YWxnbyk7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiB7IFtrOiBzdHJpbmddOiB1bmRlZmluZWQgfSwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0gIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufTtcbnR5cGUgV2hlbkV2ZW50cyA9IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCAmIFNwZWNpYWxXaGVuRXZlbnRzO1xudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlcjtcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXI7XG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8YC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/ICdjaGFuZ2UnXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dO1xuXG4vKiogd2hlbiAqKi9cbnR5cGUgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICBwdXNoOiAoZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKT0+dm9pZDtcbiAgdGVybWluYXRlOiAoZXg6IEVycm9yKT0+dm9pZDtcbiAgY29udGFpbmVyOiBFbGVtZW50XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsXG59O1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBjb250YWluZXIgfHwgY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkpKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCAnZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW0NTU0lkZW50aWZpZXIgfCBudWxsLCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW3BhcnRzWzBdLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbbnVsbCwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW3BhcnRzWzFdLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcblxuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gLypFdmVudE9ic2VydmF0aW9uPEV4Y2x1ZGU8RXh0cmFjdEV2ZW50TmFtZXM8RXZlbnROYW1lPiwga2V5b2YgU3BlY2lhbFdoZW5FdmVudHM+PiovID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lcixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKSEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBuZXZlckdvbm5hSGFwcGVuPFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWw6IENTU0lkZW50aWZpZXIgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgYXN5bmMgbmV4dCgpIHtcbiAgICAgICAgYXdhaXQgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpO1xuXG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvclxuICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgYWkucmV0dXJuID0gZXZlbnRzLnJldHVybj8uYmluZChldmVudHMpO1xuICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbjxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdDogRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lciwgc2VsZWN0b3JzKSxcbiAgICAgIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcilcbiAgICBdKTtcbiAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyOiBFbGVtZW50LCBtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xuXG4gIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY0V4dHJhSXRlcmFibGUsIEFzeW5jUHJvdmlkZXIsIElnbm9yZSwgSXRlcmFiaWxpdHkgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuZXhwb3J0IHR5cGUgQ2hpbGRUYWdzID0gTm9kZSAvLyBUaGluZ3MgdGhhdCBhcmUgRE9NIG5vZGVzIChpbmNsdWRpbmcgZWxlbWVudHMpXG4gIHwgbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiAvLyBUaGluZ3MgdGhhdCBjYW4gYmUgY29udmVydGVkIHRvIHRleHQgbm9kZXMgdmlhIHRvU3RyaW5nXG4gIHwgdW5kZWZpbmVkIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIHwgdHlwZW9mIElnbm9yZSAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICAvLyBOQjogd2UgY2FuJ3QgY2hlY2sgdGhlIGNvbnRhaW5lZCB0eXBlIGF0IHJ1bnRpbWUsIHNvIHdlIGhhdmUgdG8gYmUgbGliZXJhbFxuICAvLyBhbmQgd2FpdCBmb3IgdGhlIGRlLWNvbnRhaW5tZW50IHRvIGZhaWwgaWYgaXQgdHVybnMgb3V0IHRvIG5vdCBiZSBhIGBDaGlsZFRhZ3NgXG4gIHwgQXN5bmNJdGVyYWJsZTxDaGlsZFRhZ3M+IHwgQXN5bmNJdGVyYXRvcjxDaGlsZFRhZ3M+IHwgUHJvbWlzZUxpa2U8Q2hpbGRUYWdzPiAvLyBUaGluZ3MgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW55IG9mIHRoZSBhYm92ZVxuICB8IEFycmF5PENoaWxkVGFncz5cbiAgfCBJdGVyYWJsZTxDaGlsZFRhZ3M+OyAvLyBJdGVyYWJsZSB0aGluZ3MgdGhhdCBob2xkIHRoZSBhYm92ZSwgbGlrZSBBcnJheXMsIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdFxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD47XG5cbmV4cG9ydCB0eXBlIFBvc3NpYmx5QXN5bmM8WD4gPVxuICBbWF0gZXh0ZW5kcyBbb2JqZWN0XSAvLyBOb3QgXCJuYWtlZFwiIHRvIHByZXZlbnQgdW5pb24gZGlzdHJpYnV0aW9uXG4gID8gWCBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBVPlxuICA/IFBvc3NpYmx5QXN5bmM8VT5cbiAgOiBYIGV4dGVuZHMgRnVuY3Rpb25cbiAgPyBYIHwgQXN5bmNBdHRyPFg+XG4gIDogQXN5bmNBdHRyPFBhcnRpYWw8WD4+IHwgeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT47IH1cbiAgOiBYIHwgQXN5bmNBdHRyPFg+IHwgdW5kZWZpbmVkO1xuXG50eXBlIERlZXBQYXJ0aWFsPFg+ID0gW1hdIGV4dGVuZHMgW29iamVjdF0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFg7XG5cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbmV4cG9ydCB0eXBlIEluc3RhbmNlPFQgPSB7fT4gPSB7IFtVbmlxdWVJRF06IHN0cmluZyB9ICYgVDtcblxuLy8gSW50ZXJuYWwgdHlwZXMgc3VwcG9ydGluZyBUYWdDcmVhdG9yXG50eXBlIEFzeW5jR2VuZXJhdGVkT2JqZWN0PFggZXh0ZW5kcyBvYmplY3Q+ID0ge1xuICBbSyBpbiBrZXlvZiBYXTogWFtLXSBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBWYWx1ZT4gPyBWYWx1ZSA6IFhbS11cbn1cblxudHlwZSBJRFM8ST4gPSB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBJW0pdIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4gPyBSZXR1cm5UeXBlPElbSl0+IDogbmV2ZXI7XG4gIH1cbn1cblxudHlwZSBSZVR5cGVkRXZlbnRIYW5kbGVyczxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEsgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzXG4gICAgPyBFeGNsdWRlPEdsb2JhbEV2ZW50SGFuZGxlcnNbS10sIG51bGw+IGV4dGVuZHMgKGU6IGluZmVyIEUpPT5hbnlcbiAgICAgID8gKHRoaXM6IFQsIGU6IEUpPT5hbnkgfCBudWxsXG4gICAgICA6IFRbS11cbiAgICA6IFRbS11cbn1cblxudHlwZSBSZWFkV3JpdGVBdHRyaWJ1dGVzPEUsIEJhc2U+ID0gT21pdDxFLCAnYXR0cmlidXRlcyc+ICYge1xuICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXA7XG4gIHNldCBhdHRyaWJ1dGVzKHY6IERlZXBQYXJ0aWFsPFBvc3NpYmx5QXN5bmM8QmFzZT4+KTtcbn1cblxuZXhwb3J0IHR5cGUgRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBPW0tdXG59XVtudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBEZWVwRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBGbGF0dGVuPE9bS10+XG59XVtudW1iZXJdO1xuXG5cbi8qIEl0ZXJhYmxlUHJvcGVydGllcyBjYW4ndCBiZSBjb3JyZWN0bHkgdHlwZWQgaW4gVFMgcmlnaHQgbm93LCBlaXRoZXIgdGhlIGRlY2xhcmF0aWluXG4gIHdvcmtzIGZvciByZXRyaWV2YWwgKHRoZSBnZXR0ZXIpLCBvciBpdCB3b3JrcyBmb3IgYXNzaWdubWVudHMgKHRoZSBzZXR0ZXIpLCBidXQgdGhlcmUnc1xuICBubyBUUyBzeW50YXggdGhhdCBwZXJtaXRzIGNvcnJlY3QgdHlwZS1jaGVja2luZyBhdCBwcmVzZW50LlxuXG4gIElkZWFsbHksIGl0IHdvdWxkIGJlOlxuXG4gIHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IHtcbiAgICBnZXQgW0sgaW4ga2V5b2YgSVBdKCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxJUFtLXT4gJiBJUFtLXVxuICAgIHNldCBbSyBpbiBrZXlvZiBJUF0odjogSVBbS10pXG4gIH1cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM4MjZcbiovXG5cbiAgLyogV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgICBpcyBQYXJ0aWFsIGl0IGNhbiBiZSBvbWl0dGVkIGZyb20gYXNzaWdubWVudHM6XG4gICAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gICAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICAgIERpdih0aGlzLnByb3ApIDsgLy8gdGhlIHZhbHVlXG4gICAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3QgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoZW4gKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICAgIGJ1dCBjYXN0cyBpdCB0byBhIEFzeW5jSXRlcmF0b3IgYmVmb3JlIHVzZS5cblxuICAgIFRoZSBpdGVyYWJpbGl0eSBvZiBwcm9wZXJ0eXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gICAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnRseSBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgb25lLWxldmVsIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gICAgaXRlcmFibGUsIGFzIGFyZSBpdCdzIG1lbWJlcnMuIFRoZSBvbmx5IGRlZmluZWQgdmFsdWUgYXQgcHJlc2VudCBpcyBcInNoYWxsb3dcIiwgaW4gd2hpY2ggY2FzZSAnb2JqJyByZW1haW5zXG4gICAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuICAqL1xuXG5leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBUICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VD4+O1xuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCx0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6IHtcbiAgW0sgaW4ga2V5b2YgSVBdOiAoSVBbS10gZXh0ZW5kcyBvYmplY3QgPyBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+IDogSVBbS10pICYgSXRlcmFibGVUeXBlPElQW0tdPlxufVxuXG4vLyBCYXNpY2FsbHkgYW55dGhpbmcsIF9leGNlcHRfIGFuIGFycmF5LCBhcyB0aGV5IGNsYXNoIHdpdGggbWFwLCBmaWx0ZXJcbnR5cGUgT3B0aW9uYWxJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSAoc3RyaW5nIHwgbnVtYmVyIHwgYmlnaW50IHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwpIHwgKG9iamVjdCAmIHsgc3BsaWNlPzogbmV2ZXIgfSk7XG5cbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogTztcbnR5cGUgT21pdFR5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gbmV2ZXIgOiBLXTogVFtLXSB9XVtudW1iZXJdXG50eXBlIFBpY2tUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IEsgOiBuZXZlcl06IFRbS10gfV1bbnVtYmVyXVxuXG4vLyBGb3IgaW5mb3JtYXRpdmUgcHVycG9zZXMgLSB1bnVzZWQgaW4gcHJhY3RpY2VcbmludGVyZmFjZSBfTm90X0RlY2xhcmVkXyB7IH1cbmludGVyZmFjZSBfTm90X0FycmF5XyB7IH1cbnR5cGUgRXhjZXNzS2V5czxBLCBCPiA9XG4gIEEgZXh0ZW5kcyBhbnlbXVxuICA/IEIgZXh0ZW5kcyBhbnlbXVxuICA/IEV4Y2Vzc0tleXM8QVtudW1iZXJdLCBCW251bWJlcl0+XG4gIDogX05vdF9BcnJheV9cbiAgOiBCIGV4dGVuZHMgYW55W11cbiAgPyBfTm90X0FycmF5X1xuICA6IE5ldmVyRW1wdHk8T21pdFR5cGU8e1xuICAgIFtLIGluIGtleW9mIEFdOiBLIGV4dGVuZHMga2V5b2YgQlxuICAgID8gQVtLXSBleHRlbmRzIChCW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBCW0tdIDogRGVlcFBhcnRpYWw8QltLXT4pXG4gICAgPyBuZXZlciA6IEJbS11cbiAgICA6IF9Ob3RfRGVjbGFyZWRfXG4gIH0sIG5ldmVyPj5cblxudHlwZSBPdmVybGFwcGluZ0tleXM8QSxCPiA9IEIgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDogQSBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBrZXlvZiBBICYga2V5b2YgQjtcblxudHlwZSBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzLCBSZXN1bHQgPSBuZXZlcj5cbiAgPSAoT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj5cbiAgKSBleHRlbmRzIG5ldmVyXG4gID8gRXhjZXNzS2V5czxEWydvdmVycmlkZSddLCBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyAnYG92ZXJyaWRlYCBoYXMgcHJvcGVydGllcyBub3QgaW4gdGhlIGJhc2UgdGFnIG9yIG9mIHRoZSB3cm9uZyB0eXBlLCBhbmQgc2hvdWxkIG1hdGNoJzogRXhjZXNzS2V5czxEWydvdmVycmlkZSddLCBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+IH1cbiAgOiBPbWl0VHlwZTx7XG4gICAgJ2BkZWNsYXJlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYG92ZXJyaWRlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgZGVjbGFyZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+LFxuICAgICdgb3ZlcnJpZGVgIGNsYXNoZXMgd2l0aCBgZGVjbGFyZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gIH0sIG5ldmVyPlxuXG5leHBvcnQgdHlwZSBPdmVycmlkZXMgPSB7XG4gIG92ZXJyaWRlPzogb2JqZWN0O1xuICBkZWNsYXJlPzogb2JqZWN0O1xuICBpdGVyYWJsZT86IHsgW2s6IHN0cmluZ106IE9wdGlvbmFsSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIGlkcz86IHsgW2lkOiBzdHJpbmddOiBFeFRhZ0NyZWF0b3I8YW55PjsgfTtcbiAgc3R5bGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RlZCA9IHtcbiAgY29uc3RydWN0ZWQ6ICgpID0+IChDaGlsZFRhZ3MgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZCB8IENoaWxkVGFncz4pO1xufVxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgYXR0cmlidXRlcyBmcm9tIGFuIEV4VGFnQ3JlYXRvclxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8VCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9IFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgQmFzZUF0dHJzPlxuICA/IEJhc2VBdHRyc1xuICA6IG5ldmVyO1xuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQSwgaW5mZXIgQiwgaW5mZXIgRCBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX0Q+XG4gID8gQmFzZUl0ZXJhYmxlczxCPiBleHRlbmRzIG5ldmVyXG4gICAgPyBEWydpdGVyYWJsZSddIGV4dGVuZHMgdW5rbm93blxuICAgICAgPyB7fVxuICAgICAgOiBEWydpdGVyYWJsZSddXG4gICAgOiBCYXNlSXRlcmFibGVzPEI+ICYgRFsnaXRlcmFibGUnXVxuICA6IG5ldmVyO1xuXG50eXBlIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+O1xuXG50eXBlIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPSBCYXNlSXRlcmFibGVzPEJhc2U+ICYgRFsnaXRlcmFibGUnXTtcblxudHlwZSBDb21iaW5lZFRoaXNUeXBlPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICBSZWFkV3JpdGVBdHRyaWJ1dGVzPFxuICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlLEQ+PlxuICAgICYgQXN5bmNHZW5lcmF0ZWRPYmplY3Q8Q29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj4sXG4gICAgRFsnZGVjbGFyZSddXG4gICAgJiBEWydvdmVycmlkZSddXG4gICAgJiBPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LCBrZXlvZiBEWydpdGVyYWJsZSddPlxuICA+O1xuXG50eXBlIFN0YXRpY1JlZmVyZW5jZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcz4gPSBQaWNrVHlwZTxcbiAgRGVmaW5pdGlvbnNbJ2RlY2xhcmUnXVxuICAmIERlZmluaXRpb25zWydvdmVycmlkZSddXG4gICYgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sXG4gIGFueVxuICA+O1xuXG4vLyBgdGhpc2AgaW4gdGhpcy5leHRlbmRlZCguLi4pIGlzIEJhc2VDcmVhdG9yXG5pbnRlcmZhY2UgRXh0ZW5kZWRUYWcge1xuICA8XG4gICAgQmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PixcbiAgICBTdXBwbGllZERlZmluaXRpb25zLFxuICAgIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID0gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgOiB7fSxcbiAgICBUYWdJbnN0YW5jZSA9IGFueVxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucz5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsIFJlc3VsdD4gPVxuU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIHsgY29uc3RydWN0ZWQ6IGFueSB9XG4/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICA/IFJlc3VsdFxuICA6IHsgXCJjb25zdHJ1Y3RlZGAgZG9lcyBub3QgcmV0dXJuIENoaWxkVGFnc1wiOiBTdXBwbGllZERlZmluaXRpb25zWydjb25zdHJ1Y3RlZCddIH1cbjogUmVzdWx0XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBcmdzPEE+ID0gW10gfCBbQV0gfCBbQSwgLi4uQ2hpbGRUYWdzW11dIHwgQ2hpbGRUYWdzW107XG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiBUaGlzVHlwZTxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4+KSA9PiBSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPjtcblxuLyogQSBUYWdDcmVhdG9yIGlzIFRhZ0NyZWF0b3JGdW5jdGlvbiBkZWNvcmF0ZWQgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMuIFRoZSBTdXBlciAmIFN0YXRpY3MgYXJncyBhcmUgb25seVxuZXZlciBzcGVjaWZpZWQgYnkgRXh0ZW5kZWRUYWcgKGludGVybmFsbHkpLCBhbmQgc28gaXMgbm90IGV4cG9ydGVkICovXG50eXBlIEV4VGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0LFxuICBTdXBlciBleHRlbmRzICh1bmtub3duIHwgRXhUYWdDcmVhdG9yPGFueT4pID0gdW5rbm93bixcbiAgU3VwZXJEZWZzIGV4dGVuZHMgT3ZlcnJpZGVzID0ge30sXG4gIFN0YXRpY3MgPSB7fSxcbj4gPSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZT4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiB7IFtVbmlxdWVJRF06IHN0cmluZyB9OyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbiAgW1VuaXF1ZUlEXTogc3RyaW5nO1xufSAmXG4vLyBgU3RhdGljc2AgaGVyZSBpcyB0aGF0IHNhbWUgYXMgU3RhdGljUmVmZXJlbmNlczxTdXBlciwgU3VwZXJEZWZzPiwgYnV0IHRoZSBjaXJjdWxhciByZWZlcmVuY2UgYnJlYWtzIFRTXG4vLyBzbyB3ZSBjb21wdXRlIHRoZSBTdGF0aWNzIG91dHNpZGUgdGhpcyB0eXBlIGRlY2xhcmF0aW9uIGFzIHBhc3MgdGhlbSBhcyBhIHJlc3VsdFxuU3RhdGljcztcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9IEV4VGFnQ3JlYXRvcjxCYXNlLCBuZXZlciwgbmV2ZXIsIHt9PjtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NPLElBQU0sUUFBUSxXQUFX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
