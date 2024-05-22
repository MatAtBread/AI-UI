var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
export {
  iterators_exports as Iterators,
  augmentGlobalAsyncGenerators,
  enableOnRemovedFromDOM,
  getElementIdMap,
  tag,
  when
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RlYnVnLnRzIiwgIi4uL3NyYy9kZWZlcnJlZC50cyIsICIuLi9zcmMvaXRlcmF0b3JzLnRzIiwgIi4uL3NyYy93aGVuLnRzIiwgIi4uL3NyYy90YWdzLnRzIiwgIi4uL3NyYy9haS11aS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzKVxuICB9LFxuICBpbmZvKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5kZWJ1ZygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5leHBvcnQgdHlwZSBEZWZlcnJlZFByb21pc2U8VD4gPSBQcm9taXNlPFQ+ICYge1xuICByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZDtcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmZXJyZWQ8VD4oKTogRGVmZXJyZWRQcm9taXNlPFQ+IHtcbiAgbGV0IHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkID0gbm90aGluZztcbiAgbGV0IHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSBub3RoaW5nO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcikgYXMgRGVmZXJyZWRQcm9taXNlPFQ+O1xuICBwcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgcHJvbWlzZS5jYXRjaChleCA9PiAoZXggaW5zdGFuY2VvZiBFcnJvciB8fCBleD8udmFsdWUgaW5zdGFuY2VvZiBFcnJvcikgPyBjb25zb2xlLmxvZyhcIkRlZmVycmVkIHJlamVjdGlvblwiLCBleCwgXCJhbGxvY2F0ZWQgYXQgXCIsIGluaXRMb2NhdGlvbikgOiB1bmRlZmluZWQpO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlTGlrZTxUPih4OiBhbnkpOiB4IGlzIFByb21pc2VMaWtlPFQ+IHtcbiAgcmV0dXJuIHggIT09IG51bGwgJiYgeCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiXG5pbXBvcnQgeyBEZWZlcnJlZFByb21pc2UsIGRlZmVycmVkIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlpblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdCB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoZW4gKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnRseSBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgb25lLWxldmVsIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLHR5cGVvZiBJdGVyYWJpbGl0eT5dOiBJdGVyYWJsZVR5cGU8SVBbS10+XG59IDoge1xuICBbSyBpbiBrZXlvZiBJUF06IChJUFtLXSBleHRlbmRzIG9iamVjdCA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT4gOiBJUFtLXSkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG59XG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gbyAmJiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5jb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgbGV0IF9wZW5kaW5nID0gW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbDtcbiAgbGV0IF9pdGVtczogVFtdIHwgbnVsbCA9IFtdO1xuXG4gIGNvbnN0IHE6IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChfaXRlbXM/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBfaXRlbXMuc2hpZnQoKSEgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgcSBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBfcGVuZGluZyEucHVzaCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybigpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAoX3BlbmRpbmcpIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKF9wZW5kaW5nLmxlbmd0aClcbiAgICAgICAgICBfcGVuZGluZy5zaGlmdCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgX2l0ZW1zID0gX3BlbmRpbmcgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChfcGVuZGluZykge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAoX3BlbmRpbmcubGVuZ3RoKVxuICAgICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgIF9pdGVtcyA9IF9wZW5kaW5nID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghX3BlbmRpbmcpIHtcbiAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJxdWV1ZUl0ZXJhdG9yIGhhcyBzdG9wcGVkXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoX3BlbmRpbmcubGVuZ3RoKSB7XG4gICAgICAgIF9wZW5kaW5nLnNoaWZ0KCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIV9pdGVtcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9pdGVtcy5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFY+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8UmVjb3JkPE4sIFY+PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSB7XG4gICAgICB2YWx1ZTogbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9O1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT5cbiAgICAgIGV4dHJhc1trXSA9IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICB2YWx1ZTogYltrIGFzIGtleW9mIHR5cGVvZiBiXSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGluaXRJdGVyYXRvclxuICAgIH1cbiAgfSBhcyBIZWxwZXJEZXNjcmlwdG9yczxWPjtcblxuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT5cbiAgICBleHRyYXNba10gPSB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgdmFsdWU6IGxhenlBc3luY01ldGhvZChrKVxuICAgIH1cbiAgKVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2KSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodiwgSXRlcmFiaWxpdHkpITtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZCA9IGZhbHNlO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYpIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IGNvbnN1bWluZyBhbm90aGVyIGl0ZXJhdG9yYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gTmVlZCB0byBtYWtlIHRoaXMgbGF6eSByZWFsbHkgLSBkaWZmaWN1bHQgc2luY2Ugd2UgZG9uJ3RcbiAgICAgICAgICAvLyBrbm93IGlmIGFueW9uZSBoYXMgYWxyZWFkeSBzdGFydGVkIGNvbnN1bWluZyBpdC4gU2luY2UgYXNzaWduaW5nXG4gICAgICAgICAgLy8gbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGEgYmFkIGlkZWFcbiAgICAgICAgICAvLyAoc2luY2Ugd2hhdCBkbyB3ZSBkbzogbWVyZ2U/IHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/KSxcbiAgICAgICAgICAvLyB0aGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgb25seSB0byBhbGxvdyBPTkUgbGF6eVxuICAgICAgICAgIC8vIGFzc2lnbm1lbnQgaWYgYW5kIG9ubHkgaWYgdGhpcyBpdGVyYWJsZSBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gJ2dldCcgeWV0LlxuICAgICAgICAgIC8vIEhvd2V2ZXIsIHRoaXMgd291bGQgYXQgcHJlc2VudCBwb3NzaWJseSBicmVhayB0aGUgaW5pdGlhbGlzYXRpb24gb2YgaXRlcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzIGFzIHRoZSBhcmUgaW5pdGlhbGl6ZWQgYnkgYXV0by1hc3NpZ25tZW50LCBpZiBpdCB3ZXJlIGluaXRpYWxpemVkXG4gICAgICAgICAgLy8gdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICBwaXBlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJyxcbiAgICAgICAgICAgICAgbmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LHYgPT4geyBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKSB9KS5maW5hbGx5KCgpID0+IHBpcGVkID0gZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBIZWxwZXJEZXNjcmlwdG9yczxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGxldCBib3hlZE9iamVjdCA9IElnbm9yZSBhcyB1bmtub3duIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgUGFydGlhbDxJdGVyYWJpbGl0eT4pO1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAuLi5wZHMsXG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8qIFRPRE86IFRoaXMgaXMgcHJvYmxlbWF0aWMgYXMgdGhlIG9iamVjdCBtaWdodCBoYXZlIGNsYXNoaW5nIGtleXMgYW5kIG5lc3RlZCBtZW1iZXJzLlxuICAgICAgICAgIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICogU3ByZWFkcyBpdGVyYWJsZSBvYmplY3RzIGluIHRvIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvYmplY3QsIGFuZCBvdmVycml0ZXMgY2xhc2hpbmcgbWVtYmVycyBsaWtlIGBtYXBgXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iai5tYXAobyA9PiBvLmZpZWxkKTtcbiAgICAgICAgICAqIFRoZSBpdGVyYXRvciB3aWxsIHlpZWxkIG9uXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iaiA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgKiBNZW1iZXJzIGFjY2VzcyBpcyBwcm94aWVkLCBzbyB0aGF0OlxuICAgICAgICAgICogICAgIChzZXQpIHRoaXMuaXRlcmFibGVPYmouZmllbGQgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAqIC4uLmNhdXNlcyB0aGUgdW5kZXJseWluZyBvYmplY3QgdG8geWllbGQgYnkgcmUtYXNzaWdubWVudCAodGhlcmVmb3JlIGNhbGxpbmcgdGhlIHNldHRlcilcbiAgICAgICAgICAqIFNpbWlsYXJseTpcbiAgICAgICAgICAqICAgICAoZ2V0KSB0aGlzLml0ZXJhYmxlT2JqLmZpZWxkXG4gICAgICAgICAgKiAuLi5jYXVzZXMgdGhlIGl0ZXJhdG9yIGZvciB0aGUgYmFzZSBvYmplY3QgdG8gYmUgbWFwcGVkLCBsaWtlXG4gICAgICAgICAgKiAgICAgdGhpcy5pdGVyYWJsZU9iamVjdC5tYXAobyA9PiBvW2ZpZWxkXSlcbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSkpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSWdub3JlIGlzIHRoZSBJTklUSUFMIHZhbHVlXG4gICAgICAgICAgaWYgKGJveGVkT2JqZWN0ID09PSBJZ25vcmUpIHtcbiAgICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCcoQUktVUkpJywgYFRoZSBpdGVyYWJsZSBwcm9wZXJ0eSAnJHtuYW1lLnRvU3RyaW5nKCl9JyBvZiB0eXBlIFwib2JqZWN0XCIgd2lsbCBiZSBzcHJlYWQgdG8gcHJldmVudCByZS1pbml0aWFsaXNhdGlvbi5cXG4ke25ldyBFcnJvcigpLnN0YWNrPy5zbGljZSg2KX1gKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGEpKVxuICAgICAgICAgICAgICBib3hlZE9iamVjdCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFsuLi5hXSBhcyBWLCBwZHMpO1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIC8vIGJveGVkT2JqZWN0ID0gWy4uLmFdIGFzIFY7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGJveGVkT2JqZWN0ID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoeyAuLi4oYSBhcyBWKSB9LCBwZHMpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAvLyBib3hlZE9iamVjdCA9IHsgLi4uKGEgYXMgVikgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihib3hlZE9iamVjdCwgYSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChib3hlZE9iamVjdFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgICAgICAgICAgYm94ZWRPYmplY3QgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhib3hlZE9iamVjdCwgcGRzKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBCUk9LRU46IGZhaWxzIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYm94ZWRPYmplY3QsICd2YWx1ZU9mJywge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm94ZWRPYmplY3RcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBib3hlZE9iamVjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBwcm94eSB0aGUgcmVzdWx0IHNvIHdlIGNhbiB0cmFjayBtZW1iZXJzIG9mIHRoZSBpdGVyYWJsZSBvYmplY3RcblxuICAgICAgICAgIGNvbnN0IGV4dHJhQm94ZWQ6IHR5cGVvZiBib3hlZE9iamVjdCA9IG5ldyBQcm94eShib3hlZE9iamVjdCwge1xuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGZpcmVzIHRoZSBpdGVyYXRvciBieSByZS1hc3NpZ25pbmcgdGhlIGl0ZXJhYmxlIHZpYSBpdCdzIHNldHRlclxuICAgICAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHB1c2gob2JqW25hbWVdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gSW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IHJldHVybnMgYSBtYXBwZWQgaXRlcmF0b3IgZm9yIHRoZSBzcGVjaWZpZWQgZmllbGRcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKVxuICAgICAgICAgICAgICAgIHJldHVybiAoKT0+Ym94ZWRPYmplY3Q7XG5cbi8vIEB0cy1pZ25vcmVcbi8vY29uc3QgdGFyZ2V0VmFsdWUgPSBrZXkgaW4gdGFyZ2V0ID8gKHRhcmdldFtrZXldIGFzIHVua25vd24pIDogSWdub3JlO1xuLy8gQHRzLWlnbm9yZVxuLy8gd2luZG93LmNvbnNvbGUubG9nKFwiKioqXCIsa2V5LHRhcmdldFZhbHVlLHBkc1trZXldKTtcbi8vICAgICAgICAgICAgICAgaWYgKHRhcmdldFZhbHVlICE9PSBJZ25vcmUpXG4vLyAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0VmFsdWU7XG4vLyAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcGRzKVxuLy8gICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gcGRzW2tleV0udmFsdWU7XG5cbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcCA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCxrZXkpO1xuICAgICAgICAgICAgICAvLyBXZSBpbmNsdWRlIGB0YXJnZXRQcm9wID09PSB1bmRlZmluZWRgIHNvIHdlIGNhbiBtb25pdG9yIG5lc3RlZCBwcm9wZXJ0aWVzIHRoYXQgYXJlbid0IGFjdHVhbGx5IGRlZmluZWQgKHlldClcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBvbmx5IGFwcGxpZXMgdG8gb2JqZWN0IGl0ZXJhYmxlcyAoc2luY2UgdGhlIHJvb3Qgb25lcyBhcmVuJ3QgcHJveGllZCksIGJ1dCBpdCBkb2VzIGFsbG93IHVzIHRvIGhhdmVcbiAgICAgICAgICAgICAgLy8gZGVmaW50aW9ucyBsaWtlOlxuICAgICAgICAgICAgICAvLyAgIGl0ZXJhYmxlOiB7IHN0dWZmOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgLi4uIH1cbiAgICAgICAgICAgICAgaWYgKHRhcmdldFByb3AgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRQcm9wLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhbFZhbHVlID0gUmVmbGVjdC5nZXQoYm94ZWRPYmplY3QgYXMgRXhjbHVkZTx0eXBlb2YgYm94ZWRPYmplY3QsIHR5cGVvZiBJZ25vcmU+LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKFxuICAgICAgICAgICAgICAgICAgICBib3hlZE9iamVjdC5tYXAoKG8scCkgPT4ge1xuLy8gICAgICAgICAgICAgICAgICBleHRyYUJveGVkLm1hcCgobyxwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG92ID0gbz8uW2tleSBhcyBrZXlvZiB0eXBlb2Ygb10/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHYgPSBwPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3YgPT09IHR5cGVvZiBwdiAmJiBvdiA9PSBwdilcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWdub3JlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3YvL28/LltrZXkgYXMga2V5b2YgdHlwZW9mIG9dXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgKFJlZmxlY3Qub3duS2V5cyhwcm9wcykgYXMgKGtleW9mIHR5cGVvZiBwcm9wcylbXSkuZm9yRWFjaChrID0+IHByb3BzW2tdLmVudW1lcmFibGUgPSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICAgICAgICAgIHJldHVybiBib3gocmVhbFZhbHVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBleHRyYUJveGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhIGFzIChWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0KGEpLCB7XG4gICAgICAgICAgLi4ucGRzLFxuICAgICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEudmFsdWVPZigpIH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQ6ICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8e2lkeDogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpPT57fVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+KVxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBbXTtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcbiAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gY291bnRcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgID8gaXRbaWR4XSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfX0pKVxuICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZH0gfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGxldCBwYzogUHJvbWlzZTx7aWR4OiBudW1iZXIsIGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT59PltdO1xuICBsZXQgc2k6IEFzeW5jSXRlcmF0b3I8YW55PltdID0gW107XG4gIGxldCBhY3RpdmU6bnVtYmVyID0gMDtcbiAgY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4ge30pO1xuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbayxzaXRdLCBpZHgpID0+IHtcbiAgICAgICAgICBhY3RpdmUgKz0gMTtcbiAgICAgICAgICBzaVtpZHhdID0gc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgICByZXR1cm4gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoe3NpLGlkeCxrLGlyfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpe1xuICAgICAgcGMuZm9yRWFjaCgocCxpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnJldHVybj8uKHYpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0udGhyb3c/LihleClcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhaSxcbiAgICAgIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoYXN5bmNFeHRyYXMpKS5tYXAoKFtrLHZdKSA9PiBbayx7Li4udiwgZW51bWVyYWJsZTogZmFsc2V9XVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczpQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGLCBBbmQgPSB7fSwgT3IgPSBuZXZlcj4gPVxuICBGIGV4dGVuZHMgKCk9PkFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVua25vd24gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pXG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBSIHwgUHJvbWlzZUxpa2U8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGxldCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZTtcbiAgY29uc3QgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IHJlc29sdmUocClcbiAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKGZuKHAudmFsdWUsIHByZXYpKS50aGVuKFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuXG4gICAgICAgICAgZXggPT5cbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmICghaXQ/LmRvbmUpIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50Ly8udGhlbih6YWxnbyA9PiB6YWxnbyk7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiB7IFtrOiBzdHJpbmddOiB1bmRlZmluZWQgfSwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0gIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufTtcbnR5cGUgV2hlbkV2ZW50cyA9IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCAmIFNwZWNpYWxXaGVuRXZlbnRzO1xudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlcjtcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXI7XG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8YC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/ICdjaGFuZ2UnXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dO1xuXG4vKiogd2hlbiAqKi9cbnR5cGUgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICBwdXNoOiAoZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKT0+dm9pZDtcbiAgdGVybWluYXRlOiAoZXg6IEVycm9yKT0+dm9pZDtcbiAgY29udGFpbmVyOiBFbGVtZW50XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsXG59O1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBjb250YWluZXIgfHwgY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkpKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCAnZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW0NTU0lkZW50aWZpZXIgfCBudWxsLCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW3BhcnRzWzBdLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbbnVsbCwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW3BhcnRzWzFdLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcblxuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gLypFdmVudE9ic2VydmF0aW9uPEV4Y2x1ZGU8RXh0cmFjdEV2ZW50TmFtZXM8RXZlbnROYW1lPiwga2V5b2YgU3BlY2lhbFdoZW5FdmVudHM+PiovID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lcixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoZXZlbnROYW1lKSEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBuZXZlckdvbm5hSGFwcGVuPFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWw6IENTU0lkZW50aWZpZXIgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgYXN5bmMgbmV4dCgpIHtcbiAgICAgICAgYXdhaXQgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpO1xuXG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVmZXIgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvclxuICAgICAgICBjb25zdCBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICBhaS5uZXh0ID0gZXZlbnRzLm5leHQuYmluZChldmVudHMpOyAvLygpID0+IGV2ZW50cy5uZXh0KCk7XG4gICAgICAgICAgYWkucmV0dXJuID0gZXZlbnRzLnJldHVybj8uYmluZChldmVudHMpO1xuICAgICAgICAgIGFpLnRocm93ID0gZXZlbnRzLnRocm93Py5iaW5kKGV2ZW50cyk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbjxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdDogRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbHQpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lciwgc2VsZWN0b3JzKSxcbiAgICAgIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcilcbiAgICBdKTtcbiAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyOiBFbGVtZW50LCBtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xuXG4gIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcyB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz47IC8vIEl0ZXJhYmxlIHRoaW5ncyB0aGF0IGhvbGQgdGhlIGFib3ZlLCBsaWtlIEFycmF5cywgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0XG5cbnR5cGUgQXN5bmNBdHRyPFg+ID0gQXN5bmNQcm92aWRlcjxYPiB8IFByb21pc2VMaWtlPEFzeW5jUHJvdmlkZXI8WD4gfCBYPjtcblxuZXhwb3J0IHR5cGUgUG9zc2libHlBc3luYzxYPiA9XG4gIFtYXSBleHRlbmRzIFtvYmplY3RdIC8vIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb25cbiAgPyBYIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFU+XG4gID8gUG9zc2libHlBc3luYzxVPlxuICA6IFggZXh0ZW5kcyBGdW5jdGlvblxuICA/IFggfCBBc3luY0F0dHI8WD5cbiAgOiBBc3luY0F0dHI8UGFydGlhbDxYPj4gfCB7IFtLIGluIGtleW9mIFhdPzogUG9zc2libHlBc3luYzxYW0tdPjsgfVxuICA6IFggfCBBc3luY0F0dHI8WD4gfCB1bmRlZmluZWQ7XG5cbnR5cGUgRGVlcFBhcnRpYWw8WD4gPSBbWF0gZXh0ZW5kcyBbb2JqZWN0XSA/IHsgW0sgaW4ga2V5b2YgWF0/OiBEZWVwUGFydGlhbDxYW0tdPiB9IDogWDtcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuZXhwb3J0IHR5cGUgSW5zdGFuY2U8VCA9IHt9PiA9IHsgW1VuaXF1ZUlEXTogc3RyaW5nIH0gJiBUO1xuXG4vLyBJbnRlcm5hbCB0eXBlcyBzdXBwb3J0aW5nIFRhZ0NyZWF0b3JcbnR5cGUgQXN5bmNHZW5lcmF0ZWRPYmplY3Q8WCBleHRlbmRzIG9iamVjdD4gPSB7XG4gIFtLIGluIGtleW9mIFhdOiBYW0tdIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFZhbHVlPiA/IFZhbHVlIDogWFtLXVxufVxuXG50eXBlIElEUzxJPiA9IHtcbiAgaWRzOiB7XG4gICAgW0ogaW4ga2V5b2YgSV06IElbSl0gZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiA/IFJldHVyblR5cGU8SVtKXT4gOiBuZXZlcjtcbiAgfVxufVxuXG50eXBlIFJlVHlwZWRFdmVudEhhbmRsZXJzPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogSyBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNcbiAgICA/IEV4Y2x1ZGU8R2xvYmFsRXZlbnRIYW5kbGVyc1tLXSwgbnVsbD4gZXh0ZW5kcyAoZTogaW5mZXIgRSk9PmFueVxuICAgICAgPyAodGhpczogVCwgZTogRSk9PmFueSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIFJlYWRXcml0ZUF0dHJpYnV0ZXM8RSwgQmFzZT4gPSBPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcDtcbiAgc2V0IGF0dHJpYnV0ZXModjogRGVlcFBhcnRpYWw8UG9zc2libHlBc3luYzxCYXNlPj4pO1xufVxuXG5leHBvcnQgdHlwZSBGbGF0dGVuPE8+ID0gW3tcbiAgW0sgaW4ga2V5b2YgT106IE9bS11cbn1dW251bWJlcl07XG5cbmV4cG9ydCB0eXBlIERlZXBGbGF0dGVuPE8+ID0gW3tcbiAgW0sgaW4ga2V5b2YgT106IEZsYXR0ZW48T1tLXT5cbn1dW251bWJlcl07XG5cbi8vIEJhc2ljYWxseSBhbnl0aGluZywgX2V4Y2VwdF8gYW4gYXJyYXksIGFzIHRoZXkgY2xhc2ggd2l0aCBtYXAsIGZpbHRlclxudHlwZSBPcHRpb25hbEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCAob2JqZWN0ICYgeyBzcGxpY2U/OiBuZXZlciB9KTtcblxudHlwZSBOZXZlckVtcHR5PE8gZXh0ZW5kcyBvYmplY3Q+ID0ge30gZXh0ZW5kcyBPID8gbmV2ZXIgOiBPO1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCO1xuXG50eXBlIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXMsIFJlc3VsdCA9IG5ldmVyPlxuICA9IChPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PlxuICApIGV4dGVuZHMgbmV2ZXJcbiAgPyBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7ICdgb3ZlcnJpZGVgIGhhcyBwcm9wZXJ0aWVzIG5vdCBpbiB0aGUgYmFzZSB0YWcgb3Igb2YgdGhlIHdyb25nIHR5cGUsIGFuZCBzaG91bGQgbWF0Y2gnOiBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gfVxuICA6IE9taXRUeXBlPHtcbiAgICAnYGRlY2xhcmVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgb3ZlcnJpZGVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT4sXG4gICAgJ2BvdmVycmlkZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgfSwgbmV2ZXI+XG5cbmV4cG9ydCB0eXBlIE92ZXJyaWRlcyA9IHtcbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIGRlY2xhcmU/OiBvYmplY3Q7XG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogT3B0aW9uYWxJdGVyYWJsZVByb3BlcnR5VmFsdWUgfTtcbiAgaWRzPzogeyBbaWQ6IHN0cmluZ106IEV4VGFnQ3JlYXRvcjxhbnk+OyB9O1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBhdHRyaWJ1dGVzIGZyb20gYW4gRXhUYWdDcmVhdG9yXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXR0cmlidXRlczxUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gVCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBCYXNlQXR0cnM+XG4gID8gQmFzZUF0dHJzXG4gIDogbmV2ZXI7XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGl0ZXJhYmxlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgX2FuY2VzdG9yc18gb2YgYW4gRXhUYWdDcmVhdG9yXG50eXBlIEJhc2VJdGVyYWJsZXM8QmFzZT4gPVxuICBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIF9BLCBpbmZlciBCLCBpbmZlciBEIGV4dGVuZHMgT3ZlcnJpZGVzLCBpbmZlciBfRD5cbiAgPyBCYXNlSXRlcmFibGVzPEI+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IERbJ2l0ZXJhYmxlJ10gZXh0ZW5kcyB1bmtub3duXG4gICAgICA/IHt9XG4gICAgICA6IERbJ2l0ZXJhYmxlJ11cbiAgICA6IEJhc2VJdGVyYWJsZXM8Qj4gJiBEWydpdGVyYWJsZSddXG4gIDogbmV2ZXI7XG5cbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9XG4gIERbJ2RlY2xhcmUnXVxuICAmIERbJ292ZXJyaWRlJ11cbiAgJiBJRFM8RFsnaWRzJ10+XG4gICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgRFsnaXRlcmFibGUnXT47XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9IEJhc2VJdGVyYWJsZXM8QmFzZT4gJiBEWydpdGVyYWJsZSddO1xuXG50eXBlIENvbWJpbmVkVGhpc1R5cGU8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9XG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gICAgJiBBc3luY0dlbmVyYXRlZE9iamVjdDxDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlLEQ+PixcbiAgICBEWydkZWNsYXJlJ11cbiAgICAmIERbJ292ZXJyaWRlJ11cbiAgICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+XG4gID47XG5cbnR5cGUgU3RhdGljUmVmZXJlbmNlczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzPiA9IFBpY2tUeXBlPFxuICBEZWZpbml0aW9uc1snZGVjbGFyZSddXG4gICYgRGVmaW5pdGlvbnNbJ292ZXJyaWRlJ11cbiAgJiBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPixcbiAgYW55XG4gID47XG5cbi8vIGB0aGlzYCBpbiB0aGlzLmV4dGVuZGVkKC4uLikgaXMgQmFzZUNyZWF0b3JcbmludGVyZmFjZSBFeHRlbmRlZFRhZyB7XG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9LFxuICAgIFRhZ0luc3RhbmNlID0gYW55XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IChpbnN0OlRhZ0luc3RhbmNlKSA9PiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG5cbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge31cbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zPlxuICAgICAgPlxuICAgID5cbiAgPlxufVxuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG5TdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBjb25zdHJ1Y3RlZDogYW55IH1cbj8gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIENvbnN0cnVjdGVkXG4gID8gUmVzdWx0XG4gIDogeyBcImNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuOiBSZXN1bHRcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckFyZ3M8QT4gPSBbXSB8IFtBXSB8IFtBLCAuLi5DaGlsZFRhZ3NbXV0gfCBDaGlsZFRhZ3NbXTtcbi8qIEEgVGFnQ3JlYXRvciBpcyBhIGZ1bmN0aW9uIHRoYXQgb3B0aW9uYWxseSB0YWtlcyBhdHRyaWJ1dGVzICYgY2hpbGRyZW4sIGFuZCBjcmVhdGVzIHRoZSB0YWdzLlxuICBUaGUgYXR0cmlidXRlcyBhcmUgUG9zc2libHlBc3luYy4gVGhlIHJldHVybiBoYXMgYGNvbnN0cnVjdG9yYCBzZXQgdG8gdGhpcyBmdW5jdGlvbiAoc2luY2UgaXQgaW5zdGFudGlhdGVkIGl0KVxuKi9cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JGdW5jdGlvbjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9ICguLi5hcmdzOiBUYWdDcmVhdG9yQXJnczxQb3NzaWJseUFzeW5jPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+PiAmIFRoaXNUeXBlPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+Pj4pID0+IFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+O1xuXG4vKiBBIFRhZ0NyZWF0b3IgaXMgVGFnQ3JlYXRvckZ1bmN0aW9uIGRlY29yYXRlZCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcy4gVGhlIFN1cGVyICYgU3RhdGljcyBhcmdzIGFyZSBvbmx5XG5ldmVyIHNwZWNpZmllZCBieSBFeHRlbmRlZFRhZyAoaW50ZXJuYWxseSksIGFuZCBzbyBpcyBub3QgZXhwb3J0ZWQgKi9cbnR5cGUgRXhUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3QsXG4gIFN1cGVyIGV4dGVuZHMgKHVua25vd24gfCBFeFRhZ0NyZWF0b3I8YW55PikgPSB1bmtub3duLFxuICBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMgPSB7fSxcbiAgU3RhdGljcyA9IHt9LFxuPiA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxCYXNlPiAmIHtcbiAgLyogSXQgY2FuIGFsc28gYmUgZXh0ZW5kZWQgKi9cbiAgZXh0ZW5kZWQ6IEV4dGVuZGVkVGFnXG4gIC8qIEl0IGlzIGJhc2VkIG9uIGEgXCJzdXBlclwiIFRhZ0NyZWF0b3IgKi9cbiAgc3VwZXI6IFN1cGVyXG4gIC8qIEl0IGhhcyBhIGZ1bmN0aW9uIHRoYXQgZXhwb3NlcyB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgdGFncyBpdCBjcmVhdGVzIGFuZCBpdHMgc3VwZXIgKi9cbiAgZGVmaW5pdGlvbj86IE92ZXJyaWRlcyAmIHsgW1VuaXF1ZUlEXTogc3RyaW5nIH07IC8qIENvbnRhaW5zIHRoZSBkZWZpbml0aW9ucyAmIFVuaXF1ZUlEIGZvciBhbiBleHRlbmRlZCB0YWcuIHVuZGVmaW5lZCBmb3IgYmFzZSB0YWdzICovXG4gIC8qIEl0IGhhcyBhIG5hbWUgKHNldCB0byBhIGNsYXNzIG9yIGRlZmluaXRpb24gbG9jYXRpb24pLCB3aGljaCBpcyBoZWxwZnVsIHdoZW4gZGVidWdnaW5nICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgLyogQ2FuIHRlc3QgaWYgYW4gZWxlbWVudCB3YXMgY3JlYXRlZCBieSB0aGlzIGZ1bmN0aW9uIG9yIGEgYmFzZSB0YWcgZnVuY3Rpb24gKi9cbiAgW1N5bWJvbC5oYXNJbnN0YW5jZV0oZWx0OiBhbnkpOiBib29sZWFuO1xuICBbVW5pcXVlSURdOiBzdHJpbmc7XG59ICZcbi8vIGBTdGF0aWNzYCBoZXJlIGlzIHRoYXQgc2FtZSBhcyBTdGF0aWNSZWZlcmVuY2VzPFN1cGVyLCBTdXBlckRlZnM+LCBidXQgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBicmVha3MgVFNcbi8vIHNvIHdlIGNvbXB1dGUgdGhlIFN0YXRpY3Mgb3V0c2lkZSB0aGlzIHR5cGUgZGVjbGFyYXRpb24gYXMgcGFzcyB0aGVtIGFzIGEgcmVzdWx0XG5TdGF0aWNzO1xuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3Q+ID0gRXhUYWdDcmVhdG9yPEJhc2UsIG5ldmVyLCBuZXZlciwge30+O1xuIiwgImltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IElnbm9yZSwgYXN5bmNJdGVyYXRvciwgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSwgaXNBc3luY0l0ZXIsIGlzQXN5bmNJdGVyYXRvciwgaXRlcmFibGVIZWxwZXJzIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRvciwgVW5pcXVlSUQgfSBmcm9tICcuL3RhZ3MuanMnXG5pbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcblxuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgdHlwZSB7IENoaWxkVGFncywgSW5zdGFuY2UsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcydcbmV4cG9ydCAqIGFzIEl0ZXJhdG9ycyBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG50eXBlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyB7fSA9IHt9PiA9IHsgXG4gIGNvbW1vblByb3BlcnRpZXM6IE90aGVyTWVtYmVyc1xufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG59XG5cbi8qIFRoZSBpbnRlcmZhY2UgdGhhdCBjcmVhdGVzIGEgc2V0IG9mIFRhZ0NyZWF0b3JzIGZvciB0aGUgc3BlY2lmaWVkIERPTSB0YWdzICovXG5pbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgLyoqIEBkZXByZWNhdGVkIC0gTGVnYWN5IGZ1bmN0aW9uIHNpbWlsYXIgdG8gRWxlbWVudC5hcHBlbmQvYmVmb3JlL2FmdGVyICovXG4gIGFwcGVuZGVyKGNvbnRhaW5lcjogTm9kZSwgYmVmb3JlPzogTm9kZSk6IChjOiBDaGlsZFRhZ3MpID0+IChOb2RlIHwgKC8qUCAmKi8gKEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzKSkpW107XG4gIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKTogKE5vZGUgfCAoLypQICYqLyAoRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMpKSlbXTtcbiAgVW5pcXVlSUQ6IHR5cGVvZiBVbmlxdWVJRDtcbiAgYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpOiB2b2lkO1xuXG4gIC8qXG4gICBTaWduYXR1cmVzIGZvciB0aGUgdGFnIGxvYWRlci4gQWxsIHBhcmFtcyBhcmUgb3B0aW9uYWwgaW4gYW55IGNvbWJpbmF0aW9uLFxuICAgYnV0IG11c3QgYmUgaW4gb3JkZXI6XG4gICAgICB0YWcoXG4gICAgICAgICAgP25hbWVTcGFjZT86IHN0cmluZywgIC8vIGFic2VudCBuYW1lU3BhY2UgaW1wbGllcyBIVE1MXG4gICAgICAgICAgP3RhZ3M/OiBzdHJpbmdbXSwgICAgIC8vIGFic2VudCB0YWdzIGRlZmF1bHRzIHRvIGFsbCBjb21tb24gSFRNTCB0YWdzXG4gICAgICAgICAgP2NvbW1vblByb3BlcnRpZXM/OiBDb21tb25Qcm9wZXJ0aWVzQ29uc3RyYWludCAvLyBhYnNlbnQgaW1wbGllcyBub25lIGFyZSBkZWZpbmVkXG4gICAgICApXG5cbiAgICAgIGVnOlxuICAgICAgICB0YWdzKCkgIC8vIHJldHVybnMgVGFnQ3JlYXRvcnMgZm9yIGFsbCBIVE1MIHRhZ3NcbiAgICAgICAgdGFncyhbJ2RpdicsJ2J1dHRvbiddLCB7IG15VGhpbmcoKSB7fSB9KVxuICAgICAgICB0YWdzKCdodHRwOi8vbmFtZXNwYWNlJyxbJ0ZvcmVpZ24nXSwgeyBpc0ZvcmVpZ246IHRydWUgfSlcbiAgKi9cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPih0YWdzOiBUYWdzW10pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfVxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH1cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyB7fT4odGFnczogVGFnc1tdLCBvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH1cbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyB7fT4obmFtZVNwYWNlOiBudWxsIHwgdW5kZWZpbmVkIHwgJycsIHRhZ3M6IFRhZ3NbXSwgb3B0aW9ucz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gVGFnc106IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudD4gfVxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PlxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLFwiYWJiclwiLFwiYWRkcmVzc1wiLFwiYXJlYVwiLFwiYXJ0aWNsZVwiLFwiYXNpZGVcIixcImF1ZGlvXCIsXCJiXCIsXCJiYXNlXCIsXCJiZGlcIixcImJkb1wiLFwiYmxvY2txdW90ZVwiLFwiYm9keVwiLFwiYnJcIixcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFwiY2FwdGlvblwiLFwiY2l0ZVwiLFwiY29kZVwiLFwiY29sXCIsXCJjb2xncm91cFwiLFwiZGF0YVwiLFwiZGF0YWxpc3RcIixcImRkXCIsXCJkZWxcIixcImRldGFpbHNcIixcImRmblwiLFwiZGlhbG9nXCIsXCJkaXZcIixcbiAgXCJkbFwiLFwiZHRcIixcImVtXCIsXCJlbWJlZFwiLFwiZmllbGRzZXRcIixcImZpZ2NhcHRpb25cIixcImZpZ3VyZVwiLFwiZm9vdGVyXCIsXCJmb3JtXCIsXCJoMVwiLFwiaDJcIixcImgzXCIsXCJoNFwiLFwiaDVcIixcImg2XCIsXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXCJoZ3JvdXBcIixcImhyXCIsXCJodG1sXCIsXCJpXCIsXCJpZnJhbWVcIixcImltZ1wiLFwiaW5wdXRcIixcImluc1wiLFwia2JkXCIsXCJsYWJlbFwiLFwibGVnZW5kXCIsXCJsaVwiLFwibGlua1wiLFwibWFpblwiLFwibWFwXCIsXG4gIFwibWFya1wiLFwibWVudVwiLFwibWV0YVwiLFwibWV0ZXJcIixcIm5hdlwiLFwibm9zY3JpcHRcIixcIm9iamVjdFwiLFwib2xcIixcIm9wdGdyb3VwXCIsXCJvcHRpb25cIixcIm91dHB1dFwiLFwicFwiLFwicGljdHVyZVwiLFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcInFcIixcInJwXCIsXCJydFwiLFwicnVieVwiLFwic1wiLFwic2FtcFwiLFwic2NyaXB0XCIsXCJzZWFyY2hcIixcInNlY3Rpb25cIixcInNlbGVjdFwiLFwic2xvdFwiLFwic21hbGxcIixcInNvdXJjZVwiLFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFwic3R5bGVcIixcInN1YlwiLFwic3VtbWFyeVwiLFwic3VwXCIsXCJ0YWJsZVwiLFwidGJvZHlcIixcInRkXCIsXCJ0ZW1wbGF0ZVwiLFwidGV4dGFyZWFcIixcInRmb290XCIsXCJ0aFwiLFwidGhlYWRcIixcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFwidHJcIixcInRyYWNrXCIsXCJ1XCIsXCJ1bFwiLFwidmFyXCIsXCJ2aWRlb1wiLFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IGVsZW1lbnRQcm90eXBlOiBQb0VsZW1lbnRNZXRob2RzICYgVGhpc1R5cGU8RWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+ID0ge1xuICBnZXQgaWRzKCkge1xuICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcywgLypPYmplY3QuY3JlYXRlKHRoaXMuZGVmYXVsdHMpIHx8Ki8pO1xuICB9LFxuICBzZXQgaWRzKHY6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBpZHMgb24gJyArIHRoaXMudmFsdWVPZigpKTtcbiAgfSxcbiAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICB9XG59XG5cbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXMtXCI7XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZUxpc3RcbiAgICB8fCB4IGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb25cbiAgICB8fCB4ID09PSBudWxsXG4gICAgfHwgeCA9PT0gdW5kZWZpbmVkXG4gICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBmb3IgdGhlIGNvbnRhaW5lZCB0eXBlLCBzbyB3ZSBhc3N1bWUgaXQncyBhIENoaWxkVGFnIGFuZCBsZXQgaXQgZmFpbCBhdCBydW50aW1lXG4gICAgfHwgQXJyYXkuaXNBcnJheSh4KVxuICAgIHx8IGlzUHJvbWlzZUxpa2UoeClcbiAgICB8fCBpc0FzeW5jSXRlcih4KVxuICAgIHx8IHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qIHRhZyAqL1xuY29uc3QgY2FsbFN0YWNrU3ltYm9sID0gU3ltYm9sKCdjYWxsU3RhY2snKTtcblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyB7fVxuPihcbiAgXzE6IFQxLFxuICBfMjogVDIsXG4gIF8zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+XG4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBFbGVtZW50Pj4ge1xuICB0eXBlIE5hbWVzcGFjZWRFbGVtZW50QmFzZSA9IFQxIGV4dGVuZHMgc3RyaW5nID8gVDEgZXh0ZW5kcyAnJyA/IEhUTUxFbGVtZW50IDogRWxlbWVudCA6IEhUTUxFbGVtZW50O1xuXG4gIC8qIFdvcmsgb3V0IHdoaWNoIHBhcmFtZXRlciBpcyB3aGljaC4gVGhlcmUgYXJlIDYgdmFyaWF0aW9uczpcbiAgICB0YWcoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXVxuICAgIHRhZyhjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvYmplY3RdXG4gICAgdGFnKHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdXVxuICAgIHRhZyh0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXSwgb2JqZWN0XVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10pICAgICAgICAgICAgICAgICAgIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXV1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW10sIG9iamVjdF1cbiAgKi9cbiAgY29uc3QgW25hbWVTcGFjZSwgdGFncywgb3B0aW9uc10gPSAodHlwZW9mIF8xID09PSAnc3RyaW5nJykgfHwgXzEgPT09IG51bGxcbiAgICA/IFtfMSwgXzIgYXMgVGFnc1tdLCBfMyBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgOiBBcnJheS5pc0FycmF5KF8xKVxuICAgICAgPyBbbnVsbCwgXzEgYXMgVGFnc1tdLCBfMiBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dXG4gICAgICA6IFtudWxsLCBzdGFuZGFuZFRhZ3MsIF8xIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl07XG5cbiAgY29uc3QgY29tbW9uUHJvcGVydGllcyA9IG9wdGlvbnM/LmNvbW1vblByb3BlcnRpZXM7XG5cbiAgLyogTm90ZTogd2UgdXNlIHByb3BlcnR5IGRlZmludGlvbiAoYW5kIG5vdCBvYmplY3Qgc3ByZWFkKSBzbyBnZXR0ZXJzIChsaWtlIGBpZHNgKVxuICAgIGFyZSBub3QgZXZhbHVhdGVkIHVudGlsIGNhbGxlZCAqL1xuICBjb25zdCB0YWdQcm90b3R5cGVzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGVsZW1lbnRQcm90eXBlKSwgLy8gV2Uga25vdyBpdCdzIG5vdCBuZXN0ZWRcbiAgKTtcblxuICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsJ2F0dHJpYnV0ZXMnKSxcbiAgICBzZXQoYTogb2JqZWN0KSB7XG4gICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9ICgpPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKFwiKEFJLVVJKVwiLGV4KSk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGxldCBnOiBOb2RlW10gPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnWzBdKTtcbiAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgIGNvbnN0IG4gPSBub2RlcyhyKTtcbiAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgIGlmIChvbGRbMF0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgYXBwZW5kZXIob2xkWzBdLnBhcmVudE5vZGUsIG9sZFswXSkobik7XG4gICAgICAgICAgICBvbGQuZm9yRWFjaChlID0+IGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBnID0gbjtcbiAgICAgICAgfSwgKHg6YW55KSA9PiB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJyx4LGcpO1xuICAgICAgICAgIGNvbnN0IGVycm9yTm9kZSA9IGdbMF07XG4gICAgICAgICAgaWYgKGVycm9yTm9kZSlcbiAgICAgICAgICAgIGVycm9yTm9kZS5wYXJlbnROb2RlPy5yZXBsYWNlQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogeH0pLCBlcnJvck5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG4gICAgICAgIGFwcGVuZGVkLnB1c2goLi4uZHBtKTtcblxuICAgICAgICBsZXQgdDogUmV0dXJuVHlwZTxSZXR1cm5UeXBlPHR5cGVvZiBhcHBlbmRlcj4+ID0gZHBtO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHQgPSBhcHBlbmRlcihuWzBdLnBhcmVudE5vZGUhLCBuWzBdKShEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiBlcnJvclZhbHVlfSkpO1xuICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCBjcmVhdGVkQnksIHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDxDaGlsZFRhZ3M+KSA9PiB7XG4gICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gdC5maWx0ZXIoZSA9PiBlPy5wYXJlbnROb2RlICYmIGUub3duZXJEb2N1bWVudD8uYm9keS5jb250YWlucyhlKSk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gdCA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBkbyBub3QgZXhpc3QgaW4gZG9jdW1lbnRcIiArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQocykgZG8gbm90IGV4aXN0IGluIGRvY3VtZW50XCIgKyBpbnNlcnRpb25TdGFjayk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBc3luYyBlbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsY3JlYXRlZEJ5LCB0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBxID0gbm9kZXModW5ib3goZXMudmFsdWUpIGFzIENoaWxkVGFncyk7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRlZCBleHByZXNzaW9uIHlpZWxkcyBubyBub2Rlcywgc3R1ZmYgaW4gYSBEb21Qcm9taXNlQ29udGFpbmVyIGZvciB0aGUgbmV4dCBpdGVyYXRpb25cbiAgICAgICAgICAgICAgdCA9IGFwcGVuZGVyKG5bMF0ucGFyZW50Tm9kZSEsIG5bMF0pKHEubGVuZ3RoID8gcSA6IERvbVByb21pc2VDb250YWluZXIoKSk7XG4gICAgICAgICAgICAgIG4uZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nLiBUZXJtaW5hdGUgdGhlIGl0ZXJhdG9yIHNvdXJjZVxuICAgICAgICAgICAgICBhcC5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGMgPT09ICdvYmplY3QnICYmIGM/LltTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBjKSBjaGlsZHJlbihkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICB9KShjKTtcbiAgICByZXR1cm4gYXBwZW5kZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRlcihjb250YWluZXI6IE5vZGUsIGJlZm9yZT86IE5vZGUgfCBudWxsKSB7XG4gICAgaWYgKGJlZm9yZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgYmVmb3JlID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGM6IENoaWxkVGFncykge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlcyhjKTtcbiAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgLy8gXCJiZWZvcmVcIiwgYmVpbmcgYSBub2RlLCBjb3VsZCBiZSAjdGV4dCBub2RlXG4gICAgICAgIGlmIChiZWZvcmUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYmVmb3JlLmNhbGwoYmVmb3JlLCAuLi5jaGlsZHJlbilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXZSdyZSBhIHRleHQgbm9kZSAtIHdvcmsgYmFja3dhcmRzIGFuZCBpbnNlcnQgKmFmdGVyKiB0aGUgcHJlY2VlZGluZyBFbGVtZW50XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gYmVmb3JlLnBhcmVudE5vZGU7XG4gICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgaXMgbnVsbFwiKTtcblxuICAgICAgICAgIGlmIChwYXJlbnQgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJyxcIkludGVybmFsIGVycm9yIC0gY29udGFpbmVyIG1pc21hdGNoXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZHJlbltpXSwgYmVmb3JlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYXBwZW5kLmNhbGwoY29udGFpbmVyLCAuLi5jaGlsZHJlbilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLHtcbiAgICAgIGFwcGVuZGVyLCAvLyBMZWdhY3kgUlRBIHN1cHBvcnRcbiAgICAgIG5vZGVzLCAgICAvLyBQcmVmZXJyZWQgaW50ZXJmYWNlIGluc3RlYWQgb2YgYGFwcGVuZGVyYFxuICAgICAgVW5pcXVlSUQsXG4gICAgICBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oJyhBSS1VSSknLCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveChhOiB1bmtub3duKTogdW5rbm93biB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBFbGVtZW50LCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KChhLGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignKEFJLVVJKScsIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLm93bmVyRG9jdW1lbnQuY29udGFpbnMoYmFzZSk7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKCFub3RZZXRNb3VudGVkICYmICFtb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfSdgO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1vdW50ZWQpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuYCwgY3JlYXRlZEJ5LCBiYXNlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCcoQUktVUkpJywgXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBjcmVhdGVkQnksIGJhc2UpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlOiBhbnksIGs6IHN0cmluZykge1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzXCIsIGssIHZhbHVlKTtcbiAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZFtrXSA9IGNvcHk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspPy5zZXQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6e1xuICAgIGRlYnVnZ2VyPzogdW5rbm93bjtcbiAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gICAgW2s6IHN0cmluZ106IHVua25vd247XG4gIH0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG4gIGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICAgIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICAgIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gICAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG4gIH1cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LF9vdmVycmlkZXMsaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikrKGlkQ291bnQrKykudG9TdHJpbmcoMzYpK01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGxldCBzdGF0aWNFeHRlbnNpb25zOiBPdmVycmlkZXMgPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAvKiBcIlN0YXRpY2FsbHlcIiBjcmVhdGUgYW55IHN0eWxlcyByZXF1aXJlZCBieSB0aGlzIHdpZGdldCAqL1xuICAgIGlmIChzdGF0aWNFeHRlbnNpb25zLnN0eWxlcykge1xuICAgICAgcG9TdHlsZUVsdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChwb1N0eWxlRWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKSA7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrICB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGZ1bmN0aW9uIGlzQW5jZXN0cmFsKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGQ6IHN0cmluZykge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYgZCBpbiBmLmRlZmluaXRpb24uZGVjbGFyZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLmRlY2xhcmUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkuZmlsdGVyKGQgPT4gKGQgaW4gZSkgfHwgaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLGQpKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIHRhZ0RlZmluaXRpb24uaXRlcmFibGUgJiYgT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5pdGVyYWJsZSkuZm9yRWFjaChrID0+IHtcbiAgICAgICAgaWYgKGsgaW4gZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBJZ25vcmluZyBhdHRlbXB0IHRvIHJlLWRlZmluZSBpdGVyYWJsZSBwcm9wZXJ0eSBcIiR7a31cIiBhcyBpdCBjb3VsZCBhbHJlYWR5IGhhdmUgY29uc3VtZXJzYCk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSFbayBhcyBrZXlvZiB0eXBlb2YgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZV0pXG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGFwcGVuZGVyKGUpKGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHRoZSBmdWxsIHRyZWUgb2YgYXVnbWVudGVkIERPTSBlbGVtZW50cyBoYXMgYmVlbiBjb25zdHJ1Y3RlZCwgZmlyZSBhbGwgdGhlIGl0ZXJhYmxlIHByb3BlZXJ0aWVzXG4gICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGUsIHVubGVzcyB0aGV5IGhhdmUgYmVlbiBhc3NpZ25lZFxuICAgICAgICAvLyBieSBhc3NpZ25Qcm9wcyBmcm9tIGEgZnV0dXJlXG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICBpZiAoYmFzZS5pdGVyYWJsZSkgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGJhc2UuaXRlcmFibGUpKSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBzZWxmLWFzc2lnbiBpdGVyYWJsZXMgdGhhdCBoYXZlIHRoZW1zZWx2ZXMgYmVlbiBhc3NpZ25lZCB3aXRoIGZ1dHVyZXNcbiAgICAgICAgICAgIGlmICghKCFub0F0dHJzICYmIGsgaW4gYXR0cnMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdO1xuICAgICAgICAgICAgICBpZiAodmFsdWU/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgZVtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICBjb25zdCBleHRlbmRUYWc6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICBzdXBlcjogdGhpcyxcbiAgICAgIGRlZmluaXRpb246IE9iamVjdC5hc3NpZ24oc3RhdGljRXh0ZW5zaW9ucywgeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KSxcbiAgICAgIGV4dGVuZGVkLFxuICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSB8fCB7fSksIC4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuaXRlcmFibGUgfHwge30pXTtcbiAgICAgICAgcmV0dXJuIGAke2V4dGVuZFRhZy5uYW1lfTogeyR7a2V5cy5qb2luKCcsICcpfX1cXG4gXFx1MjFBQSAke3RoaXMudmFsdWVPZigpfWBcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIGNvbnN0IGZ1bGxQcm90byA9IHt9O1xuICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50Pikge1xuICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICB3YWxrUHJvdG8oY3JlYXRvci5zdXBlcik7XG5cbiAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5kZWZpbml0aW9uO1xuICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgfVxuICAgIH0pKHRoaXMpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHRlbmRUYWcsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGZ1bGxQcm90bykpO1xuXG4gICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICBjb25zdCBjcmVhdG9yTmFtZSA9IGZ1bGxQcm90b1xuICAgICAgJiYgJ2NsYXNzTmFtZScgaW4gZnVsbFByb3RvXG4gICAgICAmJiB0eXBlb2YgZnVsbFByb3RvLmNsYXNzTmFtZSA9PT0gJ3N0cmluZydcbiAgICAgID8gZnVsbFByb3RvLmNsYXNzTmFtZVxuICAgICAgOiB1bmlxdWVUYWdJRDtcbiAgICBjb25zdCBjYWxsU2l0ZSA9IERFQlVHID8gKG5ldyBFcnJvcigpLnN0YWNrPy5zcGxpdCgnXFxuJylbMl0gPz8gJycpIDogJyc7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCctJykgKyBjYWxsU2l0ZStcIj5cIlxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBleHRyYVVua25vd25Qcm9wcyA9IE9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMpLmZpbHRlcihrID0+ICFbJ3N0eWxlcycsICdpZHMnLCAnY29uc3RydWN0ZWQnLCAnZGVjbGFyZScsICdvdmVycmlkZScsICdpdGVyYWJsZSddLmluY2x1ZGVzKGspKTtcbiAgICAgIGlmIChleHRyYVVua25vd25Qcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXh0ZW5kVGFnLm5hbWV9IGRlZmluZXMgZXh0cmFuZW91cyBrZXlzICcke2V4dHJhVW5rbm93blByb3BzfScsIHdoaWNoIGFyZSB1bmtub3duYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBleHRlbmRUYWc7XG4gIH1cblxuICBjb25zdCBiYXNlVGFnQ3JlYXRvcnM6IHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7fVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZzxLIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPihrOiBLKTogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZzxFIGV4dGVuZHMgRWxlbWVudD4oazogc3RyaW5nKTogVGFnQ3JlYXRvcjxRICYgRSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWcoazogc3RyaW5nKTogVGFnQ3JlYXRvcjxRICYgTmFtZXNwYWNlZEVsZW1lbnRCYXNlICYgUG9FbGVtZW50TWV0aG9kcz4ge1xuICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuXG4gICAgY29uc3QgdGFnQ3JlYXRvciA9IChhdHRyczogUSAmIFBvRWxlbWVudE1ldGhvZHMgJiBQYXJ0aWFsPHtcbiAgICAgIGRlYnVnZ2VyPzogYW55O1xuICAgICAgZG9jdW1lbnQ/OiBEb2N1bWVudDtcbiAgICB9PiB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBsZXQgZG9jID0gZG9jdW1lbnQ7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cnMuZG9jdW1lbnQpIHtcbiAgICAgICAgICBkb2MgPSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgZWxlbWVudFxuICAgICAgICBjb25zdCBlID0gbmFtZVNwYWNlXG4gICAgICAgICAgPyBkb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IGRvYy5jcmVhdGVFbGVtZW50KGspO1xuICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcblxuICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICBhcHBlbmRlcihlKShjaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGluY2x1ZGluZ0V4dGVuZGVyID0gPFRhZ0NyZWF0b3I8RWxlbWVudD4+PHVua25vd24+T2JqZWN0LmFzc2lnbih0YWdDcmVhdG9yLCB7XG4gICAgICBzdXBlcjogKCk9PnsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpIH0sXG4gICAgICBleHRlbmRlZCwgLy8gSG93IHRvIGV4dGVuZCB0aGlzIChiYXNlKSB0YWdcbiAgICAgIHZhbHVlT2YoKSB7IHJldHVybiBgVGFnQ3JlYXRvcjogPCR7bmFtZVNwYWNlIHx8ICcnfSR7bmFtZVNwYWNlID8gJzo6JyA6ICcnfSR7a30+YCB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba10gPSBpbmNsdWRpbmdFeHRlbmRlcjtcbiAgfVxuXG4gIHRhZ3MuZm9yRWFjaChjcmVhdGVUYWcpO1xuXG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn1cblxuY29uc3QgRG9tUHJvbWlzZUNvbnRhaW5lciA9ICgpID0+IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoREVCVUcgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIiA6IFwicHJvbWlzZVwiKVxufVxuXG5jb25zdCBEeWFtaWNFbGVtZW50RXJyb3IgPSAoeyBlcnJvciB9OnsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+fSkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IudG9TdHJpbmcoKSA6ICdFcnJvcjpcXG4nK0pTT04uc3RyaW5naWZ5KGVycm9yLG51bGwsMikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24gKigpe30pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHt9IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChcbiAgICAgICAgICByZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0Lm93bmVyRG9jdW1lbnQuY29udGFpbnMoZWx0KSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAnb25SZW1vdmVkRnJvbURPTScgaW4gZWx0ICYmIHR5cGVvZiBlbHQub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJyAmJiBlbHQub25SZW1vdmVkRnJvbURPTSgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG5jb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50SWRNYXAobm9kZT86IEVsZW1lbnQgfCBEb2N1bWVudCwgaWRzPzogUmVjb3JkPHN0cmluZywgRWxlbWVudD4pIHtcbiAgbm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG4gIGlkcyA9IGlkcyB8fCB7fVxuICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbHQpIHtcbiAgICAgIGlmIChlbHQuaWQpIHtcbiAgICAgICAgaWYgKCFpZHMhW2VsdC5pZF0pXG4gICAgICAgICAgaWRzIVtlbHQuaWRdID0gZWx0O1xuICAgICAgICBlbHNlIGlmIChERUJVRykge1xuICAgICAgICAgIGlmICghd2FybmVkLmhhcyhlbHQuaWQpKSB7XG4gICAgICAgICAgICB3YXJuZWQuYWRkKGVsdC5pZClcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnKEFJLVVJKScsIFwiU2hhZG93ZWQgbXVsdGlwbGUgZWxlbWVudCBJRHNcIiwgZWx0LmlkLCBlbHQsIGlkcyFbZWx0LmlkXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGlkcztcbn1cblxuXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQ08sSUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixLQUFLO0FBRXJILElBQU0sY0FBYztBQUUzQixJQUFNLFdBQVc7QUFBQSxFQUNmLE9BQU8sTUFBVztBQUNoQixRQUFJLE1BQU8sU0FBUSxJ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
