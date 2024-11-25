var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/debug.ts
var DEBUG = globalThis.DEBUG == "*" || globalThis.DEBUG == true || Boolean(globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/)) || false;
var timeOutWarn = 5e3;
var _console = {
  log(...args) {
    if (DEBUG) console.log("(AI-UI) LOG:", ...args, new Error().stack?.replace(/Error\n\s*.*\n/, "\n"));
  },
  warn(...args) {
    if (DEBUG) console.warn("(AI-UI) WARN:", ...args, new Error().stack?.replace(/Error\n\s*.*\n/, "\n"));
  },
  info(...args) {
    if (DEBUG) console.info("(AI-UI) INFO:", ...args);
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
function isObjectLike(x) {
  return x && typeof x === "object" || typeof x === "function";
}
function isPromiseLike(x) {
  return isObjectLike(x) && "then" in x && typeof x.then === "function";
}

// src/iterators.ts
var iterators_exports = {};
__export(iterators_exports, {
  Ignore: () => Ignore,
  Iterability: () => Iterability,
  asyncExtras: () => asyncExtras,
  asyncIterator: () => asyncIterator,
  augmentGlobalAsyncGenerators: () => augmentGlobalAsyncGenerators,
  combine: () => combine,
  debounceQueueIteratableIterator: () => debounceQueueIteratableIterator,
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
  return isObjectLike(o) && "next" in o && typeof o?.next === "function";
}
function isAsyncIterable(o) {
  return isObjectLike(o) && Symbol.asyncIterator in o && typeof o[Symbol.asyncIterator] === "function";
}
function isAsyncIter(o) {
  return isAsyncIterable(o) || isAsyncIterator(o);
}
function asyncIterator(o) {
  if (isAsyncIterator(o)) return o;
  if (isAsyncIterable(o)) return o[Symbol.asyncIterator]();
  throw new Error("Not an async provider");
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
function assignHidden(d, s) {
  const keys = [...Object.getOwnPropertyNames(s), ...Object.getOwnPropertySymbols(s)];
  for (const k of keys) {
    Object.defineProperty(d, k, { ...Object.getOwnPropertyDescriptor(s, k), enumerable: false });
  }
  return d;
}
var _pending = Symbol("pending");
var _items = Symbol("items");
function internalQueueIteratableIterator(stop = () => {
}) {
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
        return Promise.resolve({ done: true, value: void 0 });
      const value = deferred();
      value.catch((ex) => {
      });
      q[_pending].unshift(value);
      return value;
    },
    return(v) {
      const value = { done: true, value: void 0 };
      if (q[_pending]) {
        try {
          stop();
        } catch (ex) {
        }
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
        } catch (ex) {
        }
        while (q[_pending].length)
          q[_pending].pop().reject(value);
        q[_items] = q[_pending] = null;
      }
      return Promise.reject(value);
    },
    get length() {
      if (!q[_items]) return -1;
      return q[_items].length;
    },
    push(value) {
      if (!q[_pending])
        return false;
      if (q[_pending].length) {
        q[_pending].pop().resolve({ done: false, value });
      } else {
        if (!q[_items]) {
          _console.log("Discarding queue push as there are no consumers");
        } else {
          q[_items].push({ done: false, value });
        }
      }
      return true;
    }
  };
  return iterableHelpers(q);
}
var _inflight = Symbol("inflight");
function internalDebounceQueueIteratableIterator(stop = () => {
}) {
  const q = internalQueueIteratableIterator(stop);
  q[_inflight] = /* @__PURE__ */ new Set();
  q.push = function(value) {
    if (!q[_pending])
      return false;
    if (q[_inflight].has(value))
      return true;
    if (q[_pending].length) {
      q[_inflight].add(value);
      const p = q[_pending].pop();
      p.finally(() => q[_inflight].delete(value));
      p.resolve({ done: false, value });
    } else {
      if (!q[_items]) {
        _console.log("Discarding queue push as there are no consumers");
      } else if (!q[_items].find((v) => v.value === value)) {
        q[_items].push({ done: false, value });
      }
    }
    return true;
  };
  return q;
}
var queueIteratableIterator = internalQueueIteratableIterator;
var debounceQueueIteratableIterator = internalDebounceQueueIteratableIterator;
var _proxiedAsyncIterator = Symbol("_proxiedAsyncIterator");
function defineIterableProperty(obj, name, v) {
  let initIterator = () => {
    initIterator = () => b;
    const bi = debounceQueueIteratableIterator();
    const mi = bi.multi();
    const b = mi[Symbol.asyncIterator]();
    extras[Symbol.asyncIterator] = mi[Symbol.asyncIterator];
    push = bi.push;
    extraKeys.forEach((k) => (
      // @ts-ignore
      extras[k] = b[k]
    ));
    if (!(_proxiedAsyncIterator in a))
      assignHidden(a, extras);
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
  const extras = { [Symbol.asyncIterator]: initIterator };
  extraKeys.forEach((k) => (
    // @ts-ignore
    extras[k] = lazyAsyncMethod(k)
  ));
  if (typeof v === "object" && v && Iterability in v && v[Iterability] === "shallow") {
    extras[Iterability] = v[Iterability];
  }
  let push = (v2) => {
    initIterator();
    return push(v2);
  };
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
            _console.info(new Error(`Iterable "${name.toString()}" has been assigned to consume another iterator. Did you mean to declare it?`));
          consume.call(v2, (y) => {
            if (v2 !== piped) {
              throw new Error(`Piped iterable "${name.toString()}" has been replaced by another iterator`, { cause: stack });
            }
            push(y?.valueOf());
          }).catch((ex) => _console.info(ex)).finally(() => v2 === piped && (piped = void 0));
          return;
        } else {
          if (piped && DEBUG) {
            _console.log(`Iterable "${name.toString()}" is already piped from another iterator, and might be overrwitten later`);
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
    if (a2 === null || a2 === void 0) {
      return assignHidden(Object.create(null, {
        valueOf: { value() {
          return a2;
        }, writable: true, configurable: true },
        toJSON: { value() {
          return a2;
        }, writable: true, configurable: true }
      }), pds);
    }
    switch (typeof a2) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
        return assignHidden(Object(a2), Object.assign(pds, {
          toJSON() {
            return a2.valueOf();
          }
        }));
      case "object":
        return boxObject(a2, pds);
    }
    throw new TypeError('Iterable properties cannot be of type "' + typeof a2 + '"');
  }
  function isProxiedAsyncIterator(o) {
    return isObjectLike(o) && _proxiedAsyncIterator in o;
  }
  function destructure(o, path) {
    const fields = path.split(".").slice(1);
    for (let i = 0; i < fields.length && (o = o?.[fields[i]]) !== void 0; i++) ;
    return o;
  }
  function boxObject(a2, pds) {
    let withPath;
    let withoutPath;
    return new Proxy(a2, handler());
    function handler(path = "") {
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
            push({ [_proxiedAsyncIterator]: { a: a2, path } });
          }
          return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
          if (Reflect.deleteProperty(target, key)) {
            push({ [_proxiedAsyncIterator]: { a: a2, path } });
            return true;
          }
          return false;
        },
        // When getting the value of a boxed object member, prefer asyncExtraIterable over target keys
        get(target, key, receiver) {
          if (Object.hasOwn(pds, key)) {
            if (!path.length) {
              withoutPath ?? (withoutPath = filterMap(pds, (o) => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator].a : o));
              return withoutPath[key];
            } else {
              withPath ?? (withPath = filterMap(pds, (o) => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator] : { a: o, path: null }));
              let ai = filterMap(withPath, (o, p) => {
                const v2 = destructure(o.a, path);
                return p !== v2 || o.path === null || o.path.startsWith(path) ? v2 : Ignore;
              }, Ignore, destructure(a2, path));
              return ai[key];
            }
          }
          if (key === "valueOf") return () => destructure(a2, path);
          if (key === Symbol.toPrimitive) {
            return function(hint) {
              if (Reflect.has(target, key))
                return Reflect.get(target, key, target).call(target, hint);
              if (hint === "string") return target.toString();
              if (hint === "number") return Number(target);
              return target.valueOf();
            };
          }
          if (typeof key === "string") {
            if ((!(key in target) || Object.hasOwn(target, key)) && !(Iterability in target && target[Iterability] === "shallow")) {
              const field = Reflect.get(target, key, receiver);
              return typeof field === "function" || isAsyncIter(field) ? field : new Proxy(Object(field), handler(path + "." + key));
            }
          }
          return Reflect.get(target, key, receiver);
        }
      };
    }
  }
}
var forever = new Promise(() => {
});
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
    assignHidden(ai, asyncExtras);
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
function filterMap(source, fn, initialValue = Ignore, prev = Ignore) {
  let ai;
  function done(v) {
    ai = fai = null;
    prev = Ignore;
    return { done: true, value: v?.value };
  }
  let fai = {
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
          (p) => p.done ? (prev = Ignore, resolve(p)) : resolveSync(
            fn(p.value, prev),
            (f) => f === Ignore ? step(resolve, reject) : resolve({ done: false, value: prev = f }),
            (ex) => {
              prev = Ignore;
              ai.throw ? ai.throw(ex) : ai.return?.(ex);
              reject({ done: true, value: ex });
            }
          ),
          (ex) => {
            prev = Ignore;
            reject({ done: true, value: ex });
          }
        ).catch((ex) => {
          prev = Ignore;
          ai.throw ? ai.throw(ex) : ai.return?.(ex);
          reject({ done: true, value: ex });
        });
      });
    },
    throw(ex) {
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(done);
    },
    return(v) {
      return Promise.resolve(ai?.return?.(v)).then(done);
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
    if (it?.done) {
      current = null;
    } else {
      current = deferred();
      ai.next().then(step).catch((error) => {
        current.reject({ done: true, value: error });
        current = null;
      });
    }
  }
  function done(v) {
    ai = mai = current = null;
    return { done: true, value: v?.value };
  }
  let mai = {
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
      return Promise.resolve(ai?.throw ? ai.throw(ex) : ai?.return?.(ex)).then(done);
    },
    return(v) {
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: v });
      return Promise.resolve(ai?.return?.(v)).then(done);
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
var eventObservations = /* @__PURE__ */ new WeakMap();
function docEventHandler(ev) {
  setTimeout(() => _docEventHandler.call(this, ev), 1);
}
function _docEventHandler(ev) {
  if (!eventObservations.has(this))
    eventObservations.set(this, /* @__PURE__ */ new Map());
  const observations = eventObservations.get(this).get(ev.type);
  if (observations) {
    for (const o of observations) {
      try {
        const { push, terminate, containerRef, selector, includeChildren } = o;
        const container = containerRef.deref();
        if (!container || !container.isConnected) {
          const msg = "Container `#" + container?.id + ">" + (selector || "") + "` removed from DOM. Removing subscription";
          observations.delete(o);
          terminate(new Error(msg));
        } else {
          if (ev.target instanceof Node) {
            if (selector) {
              const nodes = container.querySelectorAll(selector);
              for (const n of nodes) {
                if ((includeChildren ? n.contains(ev.target) : ev.target === n) && container.contains(n))
                  push(ev);
              }
            } else {
              if (includeChildren ? container.contains(ev.target) : ev.target === container)
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
function childless(sel) {
  const includeChildren = !sel || !sel.endsWith(">");
  return { includeChildren, selector: includeChildren ? sel : sel.slice(0, -1) };
}
function parseWhenSelector(what) {
  const parts = what.split(":");
  if (parts.length === 1) {
    if (isCSSSelector(parts[0]))
      return [childless(parts[0]), "change"];
    return [{ includeChildren: true, selector: null }, parts[0]];
  }
  if (parts.length === 2) {
    if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
      return [childless(parts[1]), parts[0]];
  }
  return void 0;
}
function doThrow(message) {
  throw new Error(message);
}
function whenEvent(container, what) {
  const [{ includeChildren, selector }, eventName] = parseWhenSelector(what) ?? doThrow("Invalid WhenSelector: " + what);
  if (!eventObservations.has(container.ownerDocument))
    eventObservations.set(container.ownerDocument, /* @__PURE__ */ new Map());
  if (!eventObservations.get(container.ownerDocument).has(eventName)) {
    container.ownerDocument.addEventListener(eventName, docEventHandler, {
      passive: true,
      capture: true
    });
    eventObservations.get(container.ownerDocument).set(eventName, /* @__PURE__ */ new Set());
  }
  const observations = eventObservations.get(container.ownerDocument).get(eventName);
  const queue = queueIteratableIterator(() => observations.delete(details));
  const details = {
    push: queue.push,
    terminate(ex) {
      queue.return?.(ex);
    },
    containerRef: new WeakRef(container),
    includeChildren,
    selector
  };
  containerAndSelectorsMounted(container, selector ? [selector] : void 0).then((_) => observations.add(details));
  return queue.multi();
}
async function* doneImmediately() {
  return void 0;
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
    const watchSelectors = sources.filter(isValidWhenSelector).map((what) => parseWhenSelector(what)?.[0]);
    const isMissing = (sel) => Boolean(typeof sel === "string" && !container.querySelector(sel));
    const missing = watchSelectors.map((w) => w?.selector).filter(isMissing);
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
          const merged2 = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : void 0;
          events = merged2?.[Symbol.asyncIterator]();
          if (!events)
            return { done: true, value: void 0 };
          return { done: false, value: {} };
        });
      }
    };
    return chainAsync(iterableHelpers(ai));
  }
  const merged = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : doneImmediately();
  return chainAsync(iterableHelpers(merged));
}
function containerAndSelectorsMounted(container, selectors) {
  function elementIsInDOM() {
    if (container.isConnected)
      return Promise.resolve();
    const promise = new Promise((resolve, reject) => {
      return new MutationObserver((records, mutation) => {
        if (records.some((r) => r.addedNodes?.length)) {
          if (container.isConnected) {
            mutation.disconnect();
            resolve();
          }
        }
        if (records.some((r) => [...r.removedNodes].some((r2) => r2 === container || r2.contains(container)))) {
          mutation.disconnect();
          reject(new Error("Removed from DOM"));
        }
      }).observe(container.ownerDocument.body, {
        subtree: true,
        childList: true
      });
    });
    if (DEBUG) {
      const stack = new Error().stack?.replace(/^Error/, `Element not mounted after ${timeOutWarn / 1e3} seconds:`);
      const warnTimer = setTimeout(() => {
        _console.warn(stack + "\n" + container.outerHTML);
      }, timeOutWarn);
      promise.finally(() => clearTimeout(warnTimer));
    }
    return promise;
  }
  function allSelectorsPresent(missing) {
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
      const stack = new Error().stack?.replace(/^Error/, `Missing selectors after ${timeOutWarn / 1e3} seconds: `) ?? "??";
      const warnTimer = setTimeout(() => {
        _console.warn(stack + missing + "\n");
      }, timeOutWarn);
      promise.finally(() => clearTimeout(warnTimer));
    }
    return promise;
  }
  if (selectors?.length)
    return elementIsInDOM().then(() => allSelectorsPresent(selectors));
  return elementIsInDOM();
}

// src/tags.ts
var callStackSymbol = Symbol("callStack");

// src/ai-ui.ts
var UniqueID = Symbol("Unique ID");
var logNode = DEBUG ? (n) => n instanceof Node ? "outerHTML" in n ? n.outerHTML : `${n.textContent} ${n.nodeName}` : String(n) : (n) => void 0;
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
function idsInaccessible() {
  throw new Error("<elt>.ids is a read-only map of Elements");
}
var safeFunctionSymbols = [...Object.keys(Object.getOwnPropertyDescriptors(Function.prototype))].reduce((a, b) => {
  a[b] = Symbol(b);
  return a;
}, {});
function keyFor(id) {
  return id in safeFunctionSymbols ? safeFunctionSymbols[id] : id;
}
function isChildTag(x) {
  return typeof x === "string" || typeof x === "number" || typeof x === "boolean" || x instanceof Node || x instanceof NodeList || x instanceof HTMLCollection || x === null || x === void 0 || Array.isArray(x) || isPromiseLike(x) || isAsyncIter(x) || typeof x === "object" && Symbol.iterator in x && typeof x[Symbol.iterator] === "function";
}
var tag = function(_1, _2, _3) {
  const [nameSpace, tags, options] = typeof _1 === "string" || _1 === null ? [_1, _2, _3] : Array.isArray(_1) ? [null, _1, _2] : [null, standandTags, _1];
  const commonProperties = options?.commonProperties;
  const thisDoc = options?.document ?? globalThis.document;
  const removedNodes = mutationTracker(thisDoc, options?.enableOnRemovedFromDOM);
  function DomPromiseContainer(label) {
    return thisDoc.createComment(label ? label.toString() : DEBUG ? new Error("promise").stack?.replace(/^Error: /, "") || "promise" : "promise");
  }
  function DyamicElementError({ error }) {
    return thisDoc.createComment(error instanceof Error ? error.toString() : "Error:\n" + JSON.stringify(error, null, 2));
  }
  const aiuiExtendedTagStyles = thisDoc.createElement("STYLE");
  aiuiExtendedTagStyles.id = "--ai-ui-extended-tag-styles-" + Date.now();
  thisDoc.head.appendChild(aiuiExtendedTagStyles);
  const warned = /* @__PURE__ */ new Set();
  const tagPrototypes = Object.create(
    null,
    {
      when: {
        writable: false,
        configurable: true,
        enumerable: false,
        value: function(...what) {
          return when(this, ...what);
        }
      },
      attributes: {
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
      },
      ids: {
        // .ids is a getter that when invoked for the first time
        // lazily creates a Proxy that provides live access to children by id
        configurable: true,
        enumerable: true,
        set: idsInaccessible,
        get() {
          const idProxy = new Proxy(() => {
          }, {
            apply(target, thisArg, args) {
              try {
                return thisArg.constructor.definition.ids[args[0].id](...args);
              } catch (ex) {
                throw new Error(`<elt>.ids.${args?.[0]?.id} is not a tag-creating function`, { cause: ex });
              }
            },
            construct: idsInaccessible,
            defineProperty: idsInaccessible,
            deleteProperty: idsInaccessible,
            set: idsInaccessible,
            setPrototypeOf: idsInaccessible,
            getPrototypeOf() {
              return null;
            },
            isExtensible() {
              return false;
            },
            preventExtensions() {
              return true;
            },
            getOwnPropertyDescriptor(target, p) {
              if (this.get(target, p, null))
                return Reflect.getOwnPropertyDescriptor(target, keyFor(p));
            },
            has(target, p) {
              const r = this.get(target, p, null);
              return Boolean(r);
            },
            ownKeys: (target) => {
              const ids = [...this.querySelectorAll(`[id]`)].map((e) => e.id);
              const unique2 = [...new Set(ids)];
              if (DEBUG && ids.length !== unique2.length)
                _console.log(`Element contains multiple, shadowed decendant ids`, unique2);
              return unique2;
            },
            get: (target, p, receiver) => {
              if (typeof p === "string") {
                const pk = keyFor(p);
                if (pk in target) {
                  const ref = target[pk].deref();
                  if (ref && ref.id === p && this.contains(ref))
                    return ref;
                  delete target[pk];
                }
                let e;
                if (DEBUG) {
                  const nl = this.querySelectorAll("#" + CSS.escape(p));
                  if (nl.length > 1) {
                    if (!warned.has(p)) {
                      warned.add(p);
                      _console.log(
                        `Element contains multiple, shadowed decendants with ID "${p}"`
                        /*,`\n\t${logNode(this)}`*/
                      );
                    }
                  }
                  e = nl[0];
                } else {
                  e = this.querySelector("#" + CSS.escape(p)) ?? void 0;
                }
                if (e)
                  Reflect.set(target, pk, new WeakRef(e), target);
                return e;
              }
            }
          });
          Object.defineProperty(this, "ids", {
            configurable: true,
            enumerable: true,
            set: idsInaccessible,
            get() {
              return idProxy;
            }
          });
          return idProxy;
        }
      }
    }
  );
  if (commonProperties)
    deepDefine(tagPrototypes, commonProperties);
  function* nodes(...childTags) {
    function notViableTag(c) {
      return c === void 0 || c === null || c === Ignore;
    }
    for (const c of childTags) {
      if (notViableTag(c))
        continue;
      if (isPromiseLike(c)) {
        let g = DomPromiseContainer();
        c.then((replacement) => {
          g.replaceWith(...nodes(replacement));
          g = void 0;
        });
        yield g;
        continue;
      }
      if (c instanceof Node) {
        yield c;
        continue;
      }
      if (c && typeof c === "object" && Symbol.iterator in c && !(Symbol.asyncIterator in c) && c[Symbol.iterator]) {
        for (const ch of c)
          yield* nodes(ch);
        continue;
      }
      if (isAsyncIter(c)) {
        const insertionStack = DEBUG ? "\n" + new Error().stack?.replace(/^Error: /, "Insertion :") : "";
        let ap = isAsyncIterator(c) ? c : c[Symbol.asyncIterator]();
        let notYetMounted = true;
        const terminateSource = (force = false) => {
          if (!ap || !replacement.nodes)
            return true;
          if (force || replacement.nodes.every((e) => removedNodes.has(e))) {
            replacement.nodes?.forEach((e) => removedNodes.add(e));
            const msg = "Element(s) have been removed from the document: " + replacement.nodes.map(logNode).join("\n") + insertionStack;
            replacement.nodes = null;
            ap.return?.(new Error(msg));
            ap = null;
            return true;
          }
          return false;
        };
        const unboxed = c.valueOf();
        const replacement = {
          nodes: unboxed === c || notViableTag(c) ? [DomPromiseContainer()] : [...nodes(unboxed)],
          [Symbol.iterator]() {
            return this.nodes?.[Symbol.iterator]() ?? { next() {
              return { done: true, value: void 0 };
            } };
          }
        };
        removedNodes.onRemoval(replacement.nodes, "nodes", terminateSource);
        const debugUnmounted = DEBUG ? (() => {
          const createdAt = Date.now() + timeOutWarn;
          const createdBy = new Error("Created by").stack;
          let f = () => {
            if (notYetMounted && createdAt && createdAt < Date.now()) {
              f = () => {
              };
              _console.warn(`Async element not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.`, createdBy, replacement.nodes?.map(logNode));
            }
          };
          return f;
        })() : null;
        (function step() {
          ap.next().then((es) => {
            if (!es.done) {
              if (!replacement.nodes) {
                ap?.throw?.(new Error("Already ternimated"));
                return;
              }
              const mounted = replacement.nodes.filter((e) => e.isConnected);
              const n = notYetMounted ? replacement.nodes : mounted;
              if (notYetMounted && mounted.length) notYetMounted = false;
              if (!terminateSource(!n.length)) {
                debugUnmounted?.();
                removedNodes.onRemoval(replacement.nodes, "nodes");
                replacement.nodes = [...nodes(unbox(es.value))];
                removedNodes.onRemoval(replacement.nodes, "nodes", terminateSource);
                for (let i = 0; i < n.length; i++) {
                  if (i === 0)
                    n[0].replaceWith(...replacement.nodes);
                  else if (!replacement.nodes.includes(n[i]))
                    n[i].remove();
                  removedNodes.add(n[i]);
                }
                step();
              }
            }
          }).catch((errorValue) => {
            const n = replacement.nodes?.filter((n2) => Boolean(n2?.parentNode));
            replacement.nodes?.forEach((e) => removedNodes.add(e));
            if (n?.length) {
              n[0].replaceWith(DyamicElementError({ error: errorValue }));
              n.slice(1).forEach((e) => e?.remove());
            } else _console.warn("Can't report error", errorValue, replacement.nodes?.map(logNode));
            if (replacement.nodes) removedNodes.onRemoval(replacement.nodes, "nodes");
            replacement.nodes = null;
            ap.return?.(errorValue);
            ap = null;
          });
        })();
        if (replacement.nodes) yield* replacement;
        continue;
      }
      yield thisDoc.createTextNode(c.toString());
    }
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
                  _console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${d instanceof Node ? logNode(d) : d}`);
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
          sourceEntries.sort((a) => {
            const desc = Object.getOwnPropertyDescriptor(d, a[0]);
            if (desc) {
              if ("value" in desc) return -1;
              if ("set" in desc) return 1;
              if ("get" in desc) return 1;
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
                value.then((v) => {
                  if (v && typeof v === "object") {
                    if (isAsyncIter(v)) {
                      assignIterable(v, k);
                    } else {
                      assignObject(v, k);
                    }
                  } else {
                    if (s[k] !== void 0)
                      d[k] = v;
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
              const mounted = base.isConnected;
              if (removedNodes.has(base) || !notYetMounted && !mounted) {
                _console.info(`Element does not exist in document when setting async attribute '${k}' to:
${logNode(base)}`);
                ap.return?.();
                return;
              }
              if (mounted) notYetMounted = false;
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Element with async attribute '${k}' not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.
Element contains: ${logNode(base)}
${createdBy}`);
              }
              ap.next().then(update).catch(error);
            }
          };
          const error = (errorValue) => {
            ap.return?.(errorValue);
            if (errorValue) {
              _console.warn("Dynamic attribute terminartion", errorValue, k, d, createdBy, logNode(base));
              base.appendChild(DyamicElementError({ error: errorValue }));
            }
          };
          const unboxed = value.valueOf();
          if (unboxed !== void 0 && unboxed !== value && !isAsyncIter(unboxed))
            update({ done: false, value: unboxed });
          else
            ap.next().then(update).catch(error);
          removedNodes.onRemoval([base], "assignIterable", error);
        }
        function assignObject(value, k) {
          if (value instanceof Node) {
            _console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${base instanceof Node ? logNode(base) : base}`);
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
      aiuiExtendedTagStyles.appendChild(thisDoc.createTextNode(staticExtensions.styles + "\n"));
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
      const reAssign = /* @__PURE__ */ new Set();
      tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach((k) => {
        if (k in e) {
          _console.log(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
          reAssign.add(k);
        } else {
          defineIterableProperty(e, k, tagDefinition.iterable[k]);
        }
      });
      if (combinedAttrs[callStackSymbol] === newCallStack) {
        if (!noAttrs)
          assignProps(e, attrs);
        for (const base of newCallStack) {
          const children2 = base?.constructed?.call(e);
          if (isChildTag(children2))
            e.append(...nodes(children2));
        }
        const combinedInitialIterableValues = {};
        let hasInitialValues = false;
        for (const base of newCallStack) {
          if (base.iterable) for (const k of Object.keys(base.iterable)) {
            const attrExists = !noAttrs && k in attrs;
            if (reAssign.has(k) && attrExists || !(attrExists && (!isPromiseLike(attrs[k]) || !isAsyncIter(attrs[k])))) {
              const value = e[k]?.valueOf();
              if (value !== void 0) {
                combinedInitialIterableValues[k] = value;
                hasInitialValues = true;
              }
            }
          }
        }
        if (hasInitialValues)
          Object.assign(e, combinedInitialIterableValues);
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
      if (isChildTag(attrs)) {
        children.unshift(attrs);
        attrs = {};
      }
      if (!isChildTag(attrs)) {
        if (attrs.debugger) {
          debugger;
          delete attrs.debugger;
        }
        const e = nameSpace ? thisDoc.createElementNS(nameSpace, k.toLowerCase()) : thisDoc.createElement(k);
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
function mutationTracker(root, enableOnRemovedFromDOM) {
  const tracked = /* @__PURE__ */ new WeakSet();
  const removals = /* @__PURE__ */ new WeakMap();
  function walk(nodes) {
    for (const node of nodes) {
      if (!node.isConnected) {
        tracked.add(node);
        walk(node.childNodes);
        const removalSet = removals.get(node);
        if (removalSet) {
          removals.delete(node);
          for (const x of removalSet?.values()) x();
        }
        if (enableOnRemovedFromDOM && "onRemovedFromDOM" in node && typeof node.onRemovedFromDOM === "function") node.onRemovedFromDOM();
      }
    }
  }
  new MutationObserver((mutations) => {
    mutations.forEach(function(m) {
      if (m.type === "childList" && m.removedNodes.length)
        walk(m.removedNodes);
    });
  }).observe(root, { subtree: true, childList: true });
  return {
    has(e) {
      return tracked.has(e);
    },
    add(e) {
      return tracked.add(e);
    },
    onRemoval(e, name, handler) {
      if (handler) {
        e.forEach((e2) => {
          const map2 = removals.get(e2) ?? /* @__PURE__ */ new Map();
          removals.set(e2, map2);
          map2.set(name, handler);
        });
      } else {
        e.forEach((e2) => {
          const map2 = removals.get(e2);
          if (map2) {
            map2.delete(name);
            if (!map2.size)
              removals.delete(e2);
          }
        });
      }
    }
  };
}
export {
  iterators_exports as Iterators,
  UniqueID,
  tag,
  when
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RlYnVnLnRzIiwgIi4uL3NyYy9kZWZlcnJlZC50cyIsICIuLi9zcmMvaXRlcmF0b3JzLnRzIiwgIi4uL3NyYy93aGVuLnRzIiwgIi4uL3NyYy90YWdzLnRzIiwgIi4uL3NyYy9haS11aS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IEJvb2xlYW4oZ2xvYmFsVGhpcy5ERUJVRz8ubWF0Y2goLyhefFxcVylBSS1VSShcXFd8JCkvKSkgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmluZm8oJyhBSS1VSSkgSU5GTzonLCAuLi5hcmdzKVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5cbi8vIENyZWF0ZSBhIGRlZmVycmVkIFByb21pc2UsIHdoaWNoIGNhbiBiZSBhc3luY2hyb25vdXNseS9leHRlcm5hbGx5IHJlc29sdmVkIG9yIHJlamVjdGVkLlxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2OiBhbnkpPT57fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gVHJ1ZSBpZiBgZXhwciBpbiB4YCBpcyB2YWxpZFxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh4OiBhbnkpOiB4IGlzIEZ1bmN0aW9uIHwge30ge1xuICByZXR1cm4geCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UoeCkgJiYgKCd0aGVuJyBpbiB4KSAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIlxuaW1wb3J0IHsgRGVmZXJyZWRQcm9taXNlLCBkZWZlcnJlZCwgaXNPYmplY3RMaWtlLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlvblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdGUgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgVGhpcyByZWxpZXMgb24gYSBoYWNrIHRvIGB3cmFwQXN5bmNIZWxwZXJgIGluIGl0ZXJhdG9ycy50cyB3aGljaCAqYWNjZXB0cyogYSBQYXJ0aWFsPEFzeW5jSXRlcmF0b3I+XG4gIGJ1dCBjYXN0cyBpdCB0byBhIEFzeW5jSXRlcmF0b3IgYmVmb3JlIHVzZS5cblxuICBUaGUgaXRlcmFiaWxpdHkgb2YgcHJvcGVydHlzIG9mIGFuIG9iamVjdCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBwcmVzZW5jZSBhbmQgdmFsdWUgb2YgdGhlIGBJdGVyYWJpbGl0eWAgc3ltYm9sLlxuICBCeSBkZWZhdWx0LCB0aGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgZGVlcCBtYXBwaW5nLCBzbyBhbiBpdGVyYWJsZSBwcm9wZXJ0eSAnb2JqJyBpcyBpdHNlbGZcbiAgaXRlcmFibGUsIGFzIGFyZSBpdCdzIG1lbWJlcnMuIFRoZSBvbmx5IGRlZmluZWQgdmFsdWUgYXQgcHJlc2VudCBpcyBcInNoYWxsb3dcIiwgaW4gd2hpY2ggY2FzZSAnb2JqJyByZW1haW5zXG4gIGl0ZXJhYmxlLCBidXQgaXQncyBtZW1iZXRycyBhcmUganVzdCBQT0pTIHZhbHVlcy5cbiovXG5cbi8vIEJhc2UgdHlwZXMgdGhhdCBjYW4gYmUgbWFkZSBkZWZpbmVkIGFzIGl0ZXJhYmxlOiBiYXNpY2FsbHkgYW55dGhpbmcsIF9leGNlcHRfIGEgZnVuY3Rpb25cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgPSAoc3RyaW5nIHwgbnVtYmVyIHwgYmlnaW50IHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwpO1xuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfTtcblxuZXhwb3J0IGNvbnN0IEl0ZXJhYmlsaXR5ID0gU3ltYm9sKFwiSXRlcmFiaWxpdHlcIik7XG5leHBvcnQgdHlwZSBJdGVyYWJpbGl0eTxEZXB0aCBleHRlbmRzICdzaGFsbG93JyA9ICdzaGFsbG93Jz4gPSB7IFtJdGVyYWJpbGl0eV06IERlcHRoIH07XG5leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBUICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VD4+O1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIFRoaXMgaXMgcGF0Y2ggdG8gdGhlIHN0ZCBsaWIgZGVmaW5pdGlvbiBvZiBBcnJheTxUPi4gSSBkb24ndCBrbm93IHdoeSBpdCdzIGFic2VudCxcbiAgLy8gYXMgdGhpcyBpcyB0aGUgaW1wbGVtZW50YXRpb24gaW4gYWxsIEphdmFTY3JpcHQgZW5naW5lcy4gSXQgaXMgcHJvYmFibHkgYSByZXN1bHRcbiAgLy8gb2YgaXRzIGFic2VuY2UgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvdmFsdWVzLFxuICAvLyB3aGljaCBpbmhlcml0cyBmcm9tIHRoZSBPYmplY3QucHJvdG90eXBlLCB3aGljaCBtYWtlcyBubyBjbGFpbSBmb3IgdGhlIHJldHVybiB0eXBlXG4gIC8vIHNpbmNlIGl0IGNvdWxkIGJlIG92ZXJyaWRkZW0uIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSwgYSBUUyBkZWZuIHNob3VsZCBhbHNvIG92ZXJyaWRlXG4gIC8vIGl0LCBsaWtlIE51bWJlciwgU3RyaW5nLCBCb29sZWFuIGV0YyBkby5cbiAgaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICB2YWx1ZU9mKCk6IEFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczogVCk6IFQgZXh0ZW5kcyBJdGVyYWJsZVR5cGU8aW5mZXIgWj4gPyBaIDogT2JqZWN0O1xuICB9XG59XG5cbnR5cGUgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzID0ga2V5b2YgQXJyYXk8YW55PiAmIGtleW9mIEFzeW5jSXRlcmFibGVIZWxwZXJzO1xuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCwgdHlwZW9mIEl0ZXJhYmlsaXR5Pl06IEl0ZXJhYmxlVHlwZTxJUFtLXT5cbn0gOiB7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IC8qXG4gICAgICBCZWNhdXNlIFRTIGRvZXNuJ3QgaW1wbGVtZW50IHNlcGFyYXRlIHR5cGVzIGZvciByZWFkL3dyaXRlLCBvciBjb21wdXRlZCBnZXR0ZXIvc2V0dGVyIG5hbWVzICh3aGljaCBETyBhbGxvd1xuICAgICAgZGlmZmVyZW50IHR5cGVzIGZvciBhc3NpZ25tZW50IGFuZCBldmFsdWF0aW9uKSwgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGRlZmluZSB0eXBlIGZvciBhcnJheSBtZW1iZXJzIHRoYXQgcGVybWl0XG4gICAgICBkZXJlZmVyZW5jaW5nIG9mIG5vbi1jbGFzaGluaCBhcnJheSBrZXlzIHN1Y2ggYXMgYGpvaW5gIG9yIGBzb3J0YCBhbmQgQXN5bmNJdGVyYXRvciBtZXRob2RzIHdoaWNoIGFsc28gYWxsb3dzXG4gICAgICBzaW1wbGUgYXNzaWdubWVudCBvZiB0aGUgZm9ybSBgdGhpcy5pdGVyYWJsZUFycmF5TWVtYmVyID0gWy4uLl1gLlxuXG4gICAgICBUaGUgQ09SUkVDVCB0eXBlIGZvciB0aGVzZSBmaWVsZHMgd291bGQgYmUgKGlmIFRTIHBoYXMgc3ludGF4IGZvciBpdCk6XG4gICAgICBnZXQgW0tdICgpOiBPbWl0PEFycmF5PEUgJiBBc3luY0V4dHJhSXRlcmFibGU8RT4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgc2V0IFtLXSAoKTogQXJyYXk8RT4gfCBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgKi9cbiAgICAgIE9taXQ8QXJyYXk8RSAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPEU+Pj4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+PlxuICAgIDogKFxuICAgICAgSVBbS10gZXh0ZW5kcyBvYmplY3RcbiAgICAgID8gSXRlcmFibGVQcm9wZXJ0aWVzPElQW0tdPlxuICAgICAgOiBJUFtLXVxuICAgICkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG4gIClcbn1cblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgcmV0dXJuIGQgYXMgRCAmIFM7XG59XG5cbmNvbnN0IF9wZW5kaW5nID0gU3ltYm9sKCdwZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbX3BlbmRpbmddOiBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsLFxuICAgIFtfaXRlbXNdOiBbXSBhcyBJdGVyYXRvclJlc3VsdDxUPltdIHwgbnVsbCxcblxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcSBhcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD47XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAocVtfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW19pdGVtc10uc2hpZnQoKSEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCB0aGlzIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIHFbX3BlbmRpbmddLnVuc2hpZnQodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4odj86IHVua25vd24pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSByZXR1cm4gLTE7IC8vIFRoZSBxdWV1ZSBoYXMgbm8gY29uc3VtZXJzIGFuZCBoYXMgdGVybWluYXRlZC5cbiAgICAgIHJldHVybiBxW19pdGVtc10ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBwdXNoKHZhbHVlOiBUKSB7XG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuY29uc3QgX2luZmxpZ2h0ID0gU3ltYm9sKCdpbmZsaWdodCcpO1xuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtfaW5mbGlnaHRdOiBTZXQ8VD4gfTtcbiAgcVtfaW5mbGlnaHRdID0gbmV3IFNldDxUPigpO1xuXG4gIHEucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZTogVCkge1xuICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW19pbmZsaWdodF0uaGFzKHZhbHVlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgcVtfaW5mbGlnaHRdLmFkZCh2YWx1ZSk7XG4gICAgICBjb25zdCBwID0gcVtfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbX2luZmxpZ2h0XS5kZWxldGUodmFsdWUpKTtcbiAgICAgIHAucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICB9IGVsc2UgaWYgKCFxW19pdGVtc10uZmluZCh2ID0+IHYudmFsdWUgPT09IHZhbHVlKSkge1xuICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHE7XG59XG5cbi8vIFJlLWV4cG9ydCB0byBoaWRlIHRoZSBpbnRlcm5hbHNcbmV4cG9ydCBjb25zdCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5leHBvcnQgY29uc3QgZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmNvbnN0IF9wcm94aWVkQXN5bmNJdGVyYXRvciA9IFN5bWJvbCgnX3Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTogZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGFzICh0eXBlb2YgYXN5bmNFeHRyYXMpW01dXG4gICAgfVttZXRob2RdO1xuICB9XG5cbiAgdHlwZSBIZWxwZXJEZXNjcmlwdG9yczxUPiA9IHtcbiAgICBbSyBpbiBrZXlvZiBBc3luY0V4dHJhSXRlcmFibGU8VD5dOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxBc3luY0V4dHJhSXRlcmFibGU8VD5bS10+XG4gIH0gJiB7XG4gICAgW0l0ZXJhYmlsaXR5XT86IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPCdzaGFsbG93Jz5cbiAgfTtcblxuICBjb25zdCBleHRyYXMgPSB7IFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IGluaXRJdGVyYXRvciB9IGFzIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiAmIHsgW0l0ZXJhYmlsaXR5XT86ICdzaGFsbG93JyB9O1xuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT4gLy8gQHRzLWlnbm9yZVxuICAgIGV4dHJhc1trXSA9IGxhenlBc3luY01ldGhvZChrKSlcbiAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYgJiYgdltJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSB2W0l0ZXJhYmlsaXR5XTtcbiAgfVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTxWPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWIHwgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHY7XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8obmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LCB5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCwgeyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCAmJiBERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBwaXBlZCBmcm9tIGFub3RoZXIgaXRlcmF0b3IsIGFuZCBtaWdodCBiZSBvdmVycndpdHRlbiBsYXRlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHB1c2godj8udmFsdWVPZigpIGFzIFYpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIG9iaiBhcyBhbnk7XG5cbiAgZnVuY3Rpb24gYm94PFY+KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgLy8gV2UgYm94IG9iamVjdHMgYnkgY3JlYXRpbmcgYSBQcm94eSBmb3IgdGhlIG9iamVjdCB0aGF0IHB1c2hlcyBvbiBnZXQvc2V0L2RlbGV0ZSwgYW5kIG1hcHMgdGhlIHN1cHBsaWVkIGFzeW5jIGl0ZXJhdG9yIHRvIHB1c2ggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgICAgLy8gVGhlIHByb3hpZXMgYXJlIHJlY3Vyc2l2ZSwgc28gdGhhdCBpZiBhbiBvYmplY3QgY29udGFpbnMgb2JqZWN0cywgdGhleSB0b28gYXJlIHByb3hpZWQuIE9iamVjdHMgY29udGFpbmluZyBwcmltaXRpdmVzIHJlbWFpbiBwcm94aWVkIHRvXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYm94T2JqZWN0KGEsIHBkcyk7XG5cbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG5cbiAgdHlwZSBXaXRoUGF0aCA9IHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYTogViwgcGF0aDogc3RyaW5nIHwgbnVsbCB9IH07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspO1xuICAgIHJldHVybiBvO1xuICB9XG4gIGZ1bmN0aW9uIGJveE9iamVjdChhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxQb3NzaWJseVdpdGhQYXRoPikge1xuICAgIGxldCB3aXRoUGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFdpdGhQYXRoW3R5cGVvZiBfcHJveGllZEFzeW5jSXRlcmF0b3JdPjtcbiAgICBsZXQgd2l0aG91dFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgJHtuYW1lLnRvU3RyaW5nKCl9JHtwYXRofS4ke2tleS50b1N0cmluZygpfSBhcyBpdCBpcyBwYXJ0IG9mIGFzeW5jSXRlcmF0b3JgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIGlmIChSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGdldHRpbmcgdGhlIHZhbHVlIG9mIGEgYm94ZWQgb2JqZWN0IG1lbWJlciwgcHJlZmVyIGFzeW5jRXh0cmFJdGVyYWJsZSBvdmVyIHRhcmdldCBrZXlzXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGFuIGFzeW5jRXh0cmFJdGVyYWJsZSBtZW1iZXIsIGNyZWF0ZSB0aGUgbWFwcGVkIHF1ZXVlIHRvIGdlbmVyYXRlIGl0XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHdpdGhvdXRQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0uYSA6IG8pO1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2l0aFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXSA6IHsgYTogbywgcGF0aDogbnVsbCB9KTtcblxuICAgICAgICAgICAgICBsZXQgYWkgPSBmaWx0ZXJNYXAod2l0aFBhdGgsIChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGRlc3RydWN0dXJlKG8uYSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgIT09IHYgfHwgby5wYXRoID09PSBudWxsIHx8IG8ucGF0aC5zdGFydHNXaXRoKHBhdGgpID8gdiA6IElnbm9yZTtcbiAgICAgICAgICAgICAgfSwgSWdub3JlLCBkZXN0cnVjdHVyZShhLCBwYXRoKSk7XG4gICAgICAgICAgICAgIHJldHVybiBhaVtrZXkgYXMga2V5b2YgdHlwZW9mIGFpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGEgdGFyZ2V0IHByb3BlcnR5LCBjcmVhdGUgdGhlIHByb3h5IHRvIGhhbmRsZSBpdFxuICAgICAgICAgIGlmIChrZXkgPT09ICd2YWx1ZU9mJykgcmV0dXJuICgpID0+IGRlc3RydWN0dXJlKGEsIHBhdGgpO1xuICAgICAgICAgIGlmIChrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlLCBzaW5jZSBTeW1ib2wudG9QcmltaXRpdmUgaXMgaW4gaGEoKSwgd2UgbmVlZCB0byBpbXBsZW1lbnQgaXRcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaGludD86ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHRhcmdldCkuY2FsbCh0YXJnZXQsIGhpbnQpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ3N0cmluZycpIHJldHVybiB0YXJnZXQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdudW1iZXInKSByZXR1cm4gTnVtYmVyKHRhcmdldCk7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudmFsdWVPZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICgoIShrZXkgaW4gdGFyZ2V0KSB8fCBPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSkgJiYgIShJdGVyYWJpbGl0eSBpbiB0YXJnZXQgJiYgdGFyZ2V0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGZpZWxkID09PSAnZnVuY3Rpb24nKSB8fCBpc0FzeW5jSXRlcihmaWVsZClcbiAgICAgICAgICAgICAgICA/IGZpZWxkXG4gICAgICAgICAgICAgICAgOiBuZXcgUHJveHkoT2JqZWN0KGZpZWxkKSwgaGFuZGxlcihwYXRoICsgJy4nICsga2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBzeW1ib2xpYyBlbnRyeSwgb3IgYSBwcm90b3R5cGljYWwgdmFsdWUgKHNpbmNlIGl0J3MgaW4gdGhlIHRhcmdldCwgYnV0IG5vdCBhIHRhcmdldCBwcm9wZXJ0eSlcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cbmNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG5cbi8qIE1lcmdlIGFzeW5jSXRlcmFibGVzIGludG8gYSBzaW5nbGUgYXN5bmNJdGVyYWJsZSAqL1xuXG4vKiBUUyBoYWNrIHRvIGV4cG9zZSB0aGUgcmV0dXJuIEFzeW5jR2VuZXJhdG9yIGEgZ2VuZXJhdG9yIG9mIHRoZSB1bmlvbiBvZiB0aGUgbWVyZ2VkIHR5cGVzICovXG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+ID0gVFtdIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGluZmVyIFU+PltdID8gVSA6IG5ldmVyO1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8VD4gPSBBc3luY0l0ZXJhYmxlPENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+PjtcblxuZXhwb3J0IGNvbnN0IG1lcmdlID0gPEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4+W10sIFRZaWVsZCwgVFJldHVybiwgVE5leHQ+KC4uLmFpOiBBKSA9PiB7XG4gIGNvbnN0IGl0OiAodW5kZWZpbmVkIHwgQXN5bmNJdGVyYXRvcjxhbnk+KVtdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHsgaWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55PiB9PltdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpID0+IHsgfVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+KVxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBbXTtcbiAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gY291bnRcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgID8gaXRbaWR4XSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSB9KSlcbiAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGxldCBwYzogUHJvbWlzZTx7IGlkeDogbnVtYmVyLCBrOiBzdHJpbmcsIGlyOiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTogbnVtYmVyID0gMDtcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssIHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IHNpLCBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoZnVuY3Rpb24gc3RlcCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKHBjKS50aGVuKCh7IGlkeCwgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwY1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgIGFjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICBwY1tpZHhdID0gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdHMuaWdub3JlUGFydGlhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFjY3VtdWxhdGVkKS5sZW5ndGggPCBPYmplY3Qua2V5cyhzcmMpLmxlbmd0aClcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICB9KVxuICAgICAgfSkoKTtcbiAgICB9LFxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICBwYy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnJldHVybj8uKHYpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgcGMuZm9yRWFjaCgocCwgaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGPiA9XG4gIEYgZXh0ZW5kcyAoKSA9PiBBc3luY0l0ZXJhdG9yPGluZmVyIFQ+XG4gID8gVCA6IG5ldmVyO1xuXG5hc3luYyBmdW5jdGlvbiBjb25zdW1lPFUgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+KHRoaXM6IFUsIGY/OiAodTogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBsYXN0OiB1bmRlZmluZWQgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pIHtcbiAgICBsYXN0ID0gZj8uKHUpO1xuICB9XG4gIGF3YWl0IGxhc3Q7XG59XG5cbnR5cGUgTWFwcGVyPFUsIFI+ID0gKChvOiBVLCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4pO1xudHlwZSBNYXliZVByb21pc2VkPFQ+ID0gUHJvbWlzZUxpa2U8VD4gfCBUO1xuXG4vKiBBIGdlbmVyYWwgZmlsdGVyICYgbWFwcGVyIHRoYXQgY2FuIGhhbmRsZSBleGNlcHRpb25zICYgcmV0dXJucyAqL1xuZXhwb3J0IGNvbnN0IElnbm9yZSA9IFN5bWJvbChcIklnbm9yZVwiKTtcblxudHlwZSBQYXJ0aWFsSXRlcmFibGU8VCA9IGFueT4gPSBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VD4+O1xuXG5mdW5jdGlvbiByZXNvbHZlU3luYzxaLCBSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOiAodjogWikgPT4gUiwgZXhjZXB0OiAoeDogYW55KSA9PiBhbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGlzUHJvbWlzZUxpa2UodikpXG4gICAgcmV0dXJuIHYudGhlbih0aGVuLCBleGNlcHQpO1xuICB0cnkge1xuICAgIHJldHVybiB0aGVuKHYpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0dXJuIGV4Y2VwdChleClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHNvdXJjZTogVSxcbiAgZm46IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPixcbiAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZSxcbiAgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PjtcbiAgZnVuY3Rpb24gZG9uZSh2OiBJdGVyYXRvclJlc3VsdDxIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFU+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+LCBhbnk+IHwgdW5kZWZpbmVkKXtcbiAgICAvLyBAdHMtaWdub3JlIC0gcmVtb3ZlIHJlZmVyZW5jZXMgZm9yIEdDXG4gICAgYWkgPSBmYWkgPSBudWxsO1xuICAgIHByZXYgPSBJZ25vcmU7XG4gICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH1cbiAgfVxuICBsZXQgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IChwcmV2ID0gSWdub3JlLCByZXNvbHZlKHApKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4oZG9uZSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4oZG9uZSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZmFpKVxufVxuXG5mdW5jdGlvbiBtYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSwgbWFwcGVyOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG1hcHBlcik7XG59XG5cbmZ1bmN0aW9uIGZpbHRlcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgYXN5bmMgbyA9PiAoYXdhaXQgZm4obykgPyBvIDogSWdub3JlKSk7XG59XG5cbmZ1bmN0aW9uIHVuaXF1ZTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbj86IChuZXh0OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZm5cbiAgICA/IGZpbHRlck1hcCh0aGlzLCBhc3luYyAobywgcCkgPT4gKHAgPT09IElnbm9yZSB8fCBhd2FpdCBmbihvLCBwKSkgPyBvIDogSWdub3JlKVxuICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxseTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBJID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPj4odGhpczogVSwgaW5pdFZhbHVlOiBJKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4gfCBJPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBvLCBpbml0VmFsdWUpO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9yPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGNiOiAoZG9uZTogKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpID0+IHZvaWQpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbmV3IFByb21pc2U8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ocmVzb2x2ZSA9PiB7IGNiKCgpID0+IHJlc29sdmUobykpOyByZXR1cm4gbyB9KSk7XG59XG5cbmZ1bmN0aW9uIG11bHRpPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICB0eXBlIFQgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+O1xuICBjb25zdCBzb3VyY2UgPSB0aGlzO1xuICBsZXQgY29uc3VtZXJzID0gMDtcbiAgbGV0IGN1cnJlbnQ6IERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxULCBhbnk+PjtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPFQsIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgc291cmNlIGhhcyBwcm9kdWNlZCBhIG5ldyByZXN1bHRcbiAgZnVuY3Rpb24gc3RlcChpdD86IEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4pIHtcbiAgICBpZiAoaXQpIGN1cnJlbnQucmVzb2x2ZShpdCk7XG4gICAgaWYgKGl0Py5kb25lKSB7XG4gICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KTtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgICAgIGN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpIHtcbiAgICAvLyBAdHMtaWdub3JlOiByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IG1haSA9IGN1cnJlbnQgPSBudWxsO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cblxuICBsZXQgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgZmluYWwgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKGRvbmUpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiogKCkgeyB9KSgpO1xuICB3aGlsZSAoZykge1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGcsIFN5bWJvbC5hc3luY0l0ZXJhdG9yKTtcbiAgICBpZiAoZGVzYykge1xuICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGcgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZyk7XG4gIH1cbiAgaWYgKCFnKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIEVtcHR5T2JqZWN0ID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgbmV2ZXI+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfCBgIyR7SURTfT5gIHwgYC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtDU1NJZGVudGlmaWVyfWBcbiAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBDU1NJZGVudGlmaWVyXG4gID8gJ2NoYW5nZSdcbiAgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl07XG5cbi8qKiB3aGVuICoqL1xudHlwZSBFdmVudE9ic2VydmF0aW9uPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXJSZWY6IFdlYWtSZWY8RWxlbWVudD5cbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGw7XG4gIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbjtcbn07XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBXZWFrTWFwPERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgc2V0VGltZW91dCgoKSA9PiBfZG9jRXZlbnRIYW5kbGVyLmNhbGwodGhpcywgZXYpLDEpO1xufVxuXG5mdW5jdGlvbiBfZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXModGhpcykpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KHRoaXMpIS5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lclJlZiwgc2VsZWN0b3IsIGluY2x1ZGVDaGlsZHJlbiB9ID0gbztcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gY29udGFpbmVyUmVmLmRlcmVmKCk7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyPy5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChpbmNsdWRlQ2hpbGRyZW4gPyBuLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IG4pICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gPyBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gY29udGFpbmVyIClcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRsZXNzPFQgZXh0ZW5kcyBzdHJpbmcgfCBudWxsPihzZWw6IFQpOiBUIGV4dGVuZHMgbnVsbCA/IHsgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9IDogeyBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIHNlbGVjdG9yOiBUIH0ge1xuICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSAhc2VsIHx8ICFzZWwuZW5kc1dpdGgoJz4nKVxuICByZXR1cm4geyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yOiBpbmNsdWRlQ2hpbGRyZW4gPyBzZWwgOiBzZWwuc2xpY2UoMCwtMSkgfSBhcyBhbnk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW1JldHVyblR5cGU8dHlwZW9mIGNoaWxkbGVzcz4sIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzBdKSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW3sgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9LCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzFdKSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3sgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3Rvcn0sIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGNvbnRhaW5lci5vd25lckRvY3VtZW50KSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQsIG5ldyBNYXAoKSk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5oYXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnRhaW5lci5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmdldChldmVudE5hbWUpO1xuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBvYnNlcnZhdGlvbnMhLmRlbGV0ZShkZXRhaWxzKSk7XG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXJSZWY6IG5ldyBXZWFrUmVmKGNvbnRhaW5lciksXG4gICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgIHNlbGVjdG9yXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IG9ic2VydmF0aW9ucyEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBkb25lSW1tZWRpYXRlbHk8Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgcmV0dXJuIHVuZGVmaW5lZCBhcyBaO1xufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGNvbnN0IGlzTWlzc2luZyA9IChzZWw6IENTU0lkZW50aWZpZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIgPT4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMubWFwKHcgPT4gdz8uc2VsZWN0b3IpLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWQ/LltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChkb25lSW1tZWRpYXRlbHk8V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgZnVuY3Rpb24gZWxlbWVudElzSW5ET00oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiBbLi4uci5yZW1vdmVkTm9kZXNdLnNvbWUociA9PiByID09PSBjb250YWluZXIgfHwgci5jb250YWlucyhjb250YWluZXIpKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbW92ZWQgZnJvbSBET01cIikpO1xuICAgICAgICB9XG4gICAgICB9KS5vYnNlcnZlKGNvbnRhaW5lci5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczpgKTtcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBcIlxcblwiICsgY29udGFpbmVyLm91dGVySFRNTCk7XG4gICAgICAgIC8vcmVqZWN0KG5ldyBFcnJvcihcIkVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzXCIpKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuXG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczogYCkgPz8gJz8/JztcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBtaXNzaW5nICsgXCJcXG5cIik7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKCkudGhlbigoKSA9PiBhbGxTZWxlY3RvcnNQcmVzZW50KHNlbGVjdG9ycykpXG4gIHJldHVybiBlbGVtZW50SXNJbkRPTSgpO1xufVxuIiwgIi8qIFR5cGVzIGZvciB0YWcgY3JlYXRpb24sIGltcGxlbWVudGVkIGJ5IGB0YWcoKWAgaW4gYWktdWkudHMuXG4gIE5vIGNvZGUvZGF0YSBpcyBkZWNsYXJlZCBpbiB0aGlzIGZpbGUgKGV4Y2VwdCB0aGUgcmUtZXhwb3J0ZWQgc3ltYm9scyBmcm9tIGl0ZXJhdG9ycy50cykuXG4qL1xuXG5pbXBvcnQgdHlwZSB7IEFzeW5jUHJvdmlkZXIsIElnbm9yZSwgSXRlcmFibGVQcm9wZXJ0aWVzLCBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz47IC8vIEl0ZXJhYmxlIHRoaW5ncyB0aGF0IGhvbGQgdGhlIGFib3ZlLCBsaWtlIEFycmF5cywgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0XG5cbnR5cGUgQXN5bmNBdHRyPFg+ID0gQXN5bmNQcm92aWRlcjxYPiB8IFByb21pc2VMaWtlPEFzeW5jUHJvdmlkZXI8WD4gfCBYPjtcblxuZXhwb3J0IHR5cGUgUG9zc2libHlBc3luYzxYPiA9XG4gIFtYXSBleHRlbmRzIFtvYmplY3RdIC8vIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb25cbiAgPyBYIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFU+XG4gID8gUG9zc2libHlBc3luYzxVPlxuICA6IFggZXh0ZW5kcyBGdW5jdGlvblxuICA/IFggfCBBc3luY0F0dHI8WD5cbiAgOiBBc3luY0F0dHI8UGFydGlhbDxYPj4gfCB7IFtLIGluIGtleW9mIFhdPzogUG9zc2libHlBc3luYzxYW0tdPjsgfVxuICA6IFggfCBBc3luY0F0dHI8WD4gfCB1bmRlZmluZWQ7XG5cbnR5cGUgRGVlcFBhcnRpYWw8WD4gPSBbWF0gZXh0ZW5kcyBbb2JqZWN0XSA/IHsgW0sgaW4ga2V5b2YgWF0/OiBEZWVwUGFydGlhbDxYW0tdPiB9IDogWDtcblxuZXhwb3J0IHR5cGUgSW5zdGFuY2U8VCA9IHt9PiA9IHsgW1VuaXF1ZUlEXTogc3RyaW5nIH0gJiBUO1xuXG4vLyBJbnRlcm5hbCB0eXBlcyBzdXBwb3J0aW5nIFRhZ0NyZWF0b3JcbnR5cGUgQXN5bmNHZW5lcmF0ZWRPYmplY3Q8WCBleHRlbmRzIG9iamVjdD4gPSB7XG4gIFtLIGluIGtleW9mIFhdOiBYW0tdIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFZhbHVlPiA/IFZhbHVlIDogWFtLXVxufVxuXG50eXBlIElEUzxJPiA9IEkgZXh0ZW5kcyB7fSA/IHtcbiAgaWRzOiB7XG4gICAgW0ogaW4ga2V5b2YgSV06IElbSl0gZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiA/IFJldHVyblR5cGU8SVtKXT4gOiBuZXZlcjtcbiAgfVxufSA6IHsgaWRzOiB7fSB9XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+YW55XG4gICAgICA/ICh0aGlzOiBULCBlOiBFKT0+YW55IHwgbnVsbFxuICAgICAgOiBUW0tdXG4gICAgOiBUW0tdXG59XG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IERlZXBQYXJ0aWFsPFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+Pik7XG4gIH0pXG4gIDogKE9taXQ8RSwgJ2F0dHJpYnV0ZXMnPilcblxuZXhwb3J0IHR5cGUgRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBPW0tdXG59XVtudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBEZWVwRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBGbGF0dGVuPE9bS10+XG59XVtudW1iZXJdO1xuXG50eXBlIE5ldmVyRW1wdHk8TyBleHRlbmRzIG9iamVjdD4gPSB7fSBleHRlbmRzIE8gPyBuZXZlciA6IE87XG50eXBlIE9taXRUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IG5ldmVyIDogS106IFRbS10gfV1bbnVtYmVyXVxudHlwZSBQaWNrVHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBLIDogbmV2ZXJdOiBUW0tdIH1dW251bWJlcl1cblxuLy8gRm9yIGluZm9ybWF0aXZlIHB1cnBvc2VzIC0gdW51c2VkIGluIHByYWN0aWNlXG5pbnRlcmZhY2UgX05vdF9EZWNsYXJlZF8geyB9XG5pbnRlcmZhY2UgX05vdF9BcnJheV8geyB9XG50eXBlIEV4Y2Vzc0tleXM8QSwgQj4gPVxuICBBIGV4dGVuZHMgYW55W11cbiAgPyBCIGV4dGVuZHMgYW55W11cbiAgPyBFeGNlc3NLZXlzPEFbbnVtYmVyXSwgQltudW1iZXJdPlxuICA6IF9Ob3RfQXJyYXlfXG4gIDogQiBleHRlbmRzIGFueVtdXG4gID8gX05vdF9BcnJheV9cbiAgOiBOZXZlckVtcHR5PE9taXRUeXBlPHtcbiAgICBbSyBpbiBrZXlvZiBBXTogSyBleHRlbmRzIGtleW9mIEJcbiAgICA/IEFbS10gZXh0ZW5kcyAoQltLXSBleHRlbmRzIEZ1bmN0aW9uID8gQltLXSA6IERlZXBQYXJ0aWFsPEJbS10+KVxuICAgID8gbmV2ZXIgOiBCW0tdXG4gICAgOiBfTm90X0RlY2xhcmVkX1xuICB9LCBuZXZlcj4+XG5cbnR5cGUgT3ZlcmxhcHBpbmdLZXlzPEEsQj4gPSBCIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IEEgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDoga2V5b2YgQSAmIGtleW9mIEI7XG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICBvdmVycmlkZT86IG9iamVjdDtcbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgaXRlcmFibGU/OiB7IFtrOiBzdHJpbmddOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfTtcbiAgaWRzPzogeyBbaWQ6IHN0cmluZ106IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+OyB9O1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBhdHRyaWJ1dGVzIGZyb20gYW4gRXhUYWdDcmVhdG9yXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXR0cmlidXRlczxUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gVCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBCYXNlQXR0cnM+XG4gID8gQmFzZUF0dHJzXG4gIDogbmV2ZXI7XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGl0ZXJhYmxlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgX2FuY2VzdG9yc18gb2YgYW4gRXhUYWdDcmVhdG9yXG50eXBlIEJhc2VJdGVyYWJsZXM8QmFzZT4gPVxuICBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIF9BLCBpbmZlciBCLCBpbmZlciBEIGV4dGVuZHMgT3ZlcnJpZGVzLCBpbmZlciBfRD5cbiAgPyBCYXNlSXRlcmFibGVzPEI+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IERbJ2l0ZXJhYmxlJ10gZXh0ZW5kcyB1bmtub3duXG4gICAgICA/IHt9XG4gICAgICA6IERbJ2l0ZXJhYmxlJ11cbiAgICA6IEJhc2VJdGVyYWJsZXM8Qj4gJiBEWydpdGVyYWJsZSddXG4gIDogbmV2ZXI7XG5cbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9XG4gIHtcbiAgICBpZHM6IDxcbiAgICAgIGNvbnN0IEsgZXh0ZW5kcyBrZXlvZiBFeGNsdWRlPERbJ2lkcyddLCB1bmRlZmluZWQ+LCBcbiAgICAgIGNvbnN0IFRDRiBleHRlbmRzIFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+ID0gRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPltLXVxuICAgID4oXG4gICAgICBhdHRyczp7IGlkOiBLIH0gJiBFeGNsdWRlPFBhcmFtZXRlcnM8VENGPlswXSwgQ2hpbGRUYWdzPixcbiAgICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXVxuICAgICkgPT4gUmV0dXJuVHlwZTxUQ0Y+XG4gIH1cbiAgJiBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+O1xuXG50eXBlIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPSBCYXNlSXRlcmFibGVzPEJhc2U+ICYgRFsnaXRlcmFibGUnXTtcblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvckNhbGxTdGFjayA9IHsgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXSB9O1xuXG5leHBvcnQgdHlwZSBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRyczogVGFnQ3JlYXRpb25PcHRpb25zICYgQ29uc3RydWN0b3JDYWxsU3RhY2sgJiB7XG4gIFtrOiBzdHJpbmddOiB1bmtub3duO1xufSB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBFbGVtZW50XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgc3VwZXI6IFRhZ0NyZWF0b3I8RWxlbWVudD47XG4gIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICBleHRlbmRlZDogKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkgPT4gRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxuaW50ZXJmYWNlIFRhZ0NvbnN0dWN0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4ge1xuICBjb25zdHJ1Y3RvcjogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxudHlwZSBDb21iaW5lZFRoaXNUeXBlPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICBUYWdDb25zdHVjdG9yPEJhc2U+ICZcbiAgUmVhZFdyaXRlQXR0cmlidXRlczxcbiAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgICAmIEFzeW5jR2VuZXJhdGVkT2JqZWN0PENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+LFxuICAgIERbJ2RlY2xhcmUnXVxuICAgICYgRFsnb3ZlcnJpZGUnXVxuICAgICYgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgPjtcblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXM+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbiAgPjtcblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgPSBhbnlcbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogKGluc3Q6VGFnSW5zdGFuY2UpID0+IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucz5cbiAgICAgID5cbiAgICA+XG4gID5cblxuICA8XG4gICAgQmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PixcbiAgICBTdXBwbGllZERlZmluaXRpb25zLFxuICAgIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID0gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgOiB7fVxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG59XG5cbnR5cGUgQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLCBSZXN1bHQ+ID1cblN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiY29uc3RydWN0ZWRgIGRvZXMgbm90IHJldHVybiBDaGlsZFRhZ3NcIjogU3VwcGxpZWREZWZpbml0aW9uc1snY29uc3RydWN0ZWQnXSB9XG4gIDogRXhjZXNzS2V5czxTdXBwbGllZERlZmluaXRpb25zLCBPdmVycmlkZXMgJiBDb25zdHJ1Y3RlZD4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiVGhlIGV4dGVuZGVkIHRhZyBkZWZpbnRpb24gY29udGFpbnMgdW5rbm93biBvciBpbmNvcnJlY3RseSB0eXBlZCBrZXlzXCI6IGtleW9mIEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IH1cblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRpb25PcHRpb25zID0ge1xuICBkZWJ1Z2dlcj86IGJvb2xlYW5cbn07XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBcmdzPEE+ID0gW10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9uc10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9ucywgLi4uQ2hpbGRUYWdzW11dIHwgQ2hpbGRUYWdzW107XG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiBUaGlzVHlwZTxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4+KSA9PiBSZWFkV3JpdGVBdHRyaWJ1dGVzPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+PjtcblxuLyogQSBUYWdDcmVhdG9yIGlzIFRhZ0NyZWF0b3JGdW5jdGlvbiBkZWNvcmF0ZWQgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMuIFRoZSBTdXBlciAmIFN0YXRpY3MgYXJncyBhcmUgb25seVxuZXZlciBzcGVjaWZpZWQgYnkgRXh0ZW5kZWRUYWcgKGludGVybmFsbHkpLCBhbmQgc28gaXMgbm90IGV4cG9ydGVkICovXG50eXBlIEV4VGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0LFxuICBTdXBlciBleHRlbmRzICh1bmtub3duIHwgRXhUYWdDcmVhdG9yPGFueT4pID0gdW5rbm93bixcbiAgU3VwZXJEZWZzIGV4dGVuZHMgT3ZlcnJpZGVzID0ge30sXG4gIFN0YXRpY3MgPSB7fSxcbj4gPSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZT4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiB7IFtVbmlxdWVJRF06IHN0cmluZyB9OyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbiAgW1VuaXF1ZUlEXTogc3RyaW5nO1xufSAmXG4vLyBgU3RhdGljc2AgaGVyZSBpcyB0aGF0IHNhbWUgYXMgU3RhdGljUmVmZXJlbmNlczxTdXBlciwgU3VwZXJEZWZzPiwgYnV0IHRoZSBjaXJjdWxhciByZWZlcmVuY2UgYnJlYWtzIFRTXG4vLyBzbyB3ZSBjb21wdXRlIHRoZSBTdGF0aWNzIG91dHNpZGUgdGhpcyB0eXBlIGRlY2xhcmF0aW9uIGFzIHBhc3MgdGhlbSBhcyBhIHJlc3VsdFxuU3RhdGljcztcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9IEV4VGFnQ3JlYXRvcjxCYXNlLCBuZXZlciwgbmV2ZXIsIHt9PjtcbiIsICJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBJZ25vcmUsIGFzeW5jSXRlcmF0b3IsIGRlZmluZUl0ZXJhYmxlUHJvcGVydHksIGlzQXN5bmNJdGVyLCBpc0FzeW5jSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyBXaGVuUGFyYW1ldGVycywgV2hlblJldHVybiwgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRpb25PcHRpb25zLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24sIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIEV4dGVuZFRhZ0Z1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IGNhbGxTdGFja1N5bWJvbCB9IGZyb20gJy4vdGFncy5qcyc7XG5cbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0IHR5cGUgeyBDaGlsZFRhZ3MsIEluc3RhbmNlLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnXG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuXG5leHBvcnQgY29uc3QgVW5pcXVlSUQgPSBTeW1ib2woXCJVbmlxdWUgSURcIik7XG5cbmNvbnN0IGxvZ05vZGUgPSBERUJVR1xuPyAoKG46IGFueSkgPT4gbiBpbnN0YW5jZW9mIE5vZGVcbiAgPyAnb3V0ZXJIVE1MJyBpbiBuID8gbi5vdXRlckhUTUwgOiBgJHtuLnRleHRDb250ZW50fSAke24ubm9kZU5hbWV9YFxuICA6IFN0cmluZyhuKSlcbjogKG46IE5vZGUpID0+IHVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT4gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnNcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICAvKiogQGRlcHJlY2F0ZWQgLSBsZWdhY3kgc3VwcG9ydCAqL1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NPzogYm9vbGVhblxufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8vIFRoaXMgaXMgYSB2ZXJ5IGluY29tcGxldGUgdHlwZS4gSW4gcHJhY3RpY2UsIHNldChhdHRycykgcmVxdWlyZXMgYSBkZWVwbHkgcGFydGlhbCBzZXQgb2ZcbiAgLy8gYXR0cmlidXRlcywgaW4gZXhhY3RseSB0aGUgc2FtZSB3YXkgYXMgYSBUYWdGdW5jdGlvbidzIGZpcnN0IG9iamVjdCBwYXJhbWV0ZXJcbiAgc2V0IGF0dHJpYnV0ZXMoYXR0cnM6IG9iamVjdCk7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcFxufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYywgb3B0aW9ucz8uZW5hYmxlT25SZW1vdmVkRnJvbURPTSk7XG5cbiAgZnVuY3Rpb24gRG9tUHJvbWlzZUNvbnRhaW5lcihsYWJlbD86IGFueSkge1xuICAgIHJldHVybiB0aGlzRG9jLmNyZWF0ZUNvbW1lbnQobGFiZWw/IGxhYmVsLnRvU3RyaW5nKCkgOkRFQlVHXG4gICAgICA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiXG4gICAgICA6IFwicHJvbWlzZVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3IgfTogeyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj4gfSkge1xuICAgIHJldHVybiB0aGlzRG9jLmNyZWF0ZUNvbW1lbnQoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnRvU3RyaW5nKCkgOiAnRXJyb3I6XFxuJyArIEpTT04uc3RyaW5naWZ5KGVycm9yLCBudWxsLCAyKSk7XG4gIH1cbiAgY29uc3QgYWl1aUV4dGVuZGVkVGFnU3R5bGVzID0gdGhpc0RvYy5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG4gIGFpdWlFeHRlbmRlZFRhZ1N0eWxlcy5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzLVwiK0RhdGUubm93KCk7XG4gIHRoaXNEb2MuaGVhZC5hcHBlbmRDaGlsZChhaXVpRXh0ZW5kZWRUYWdTdHlsZXMpO1xuXG4gIC8qIFByb3BlcnRpZXMgYXBwbGllZCB0byBldmVyeSB0YWcgd2hpY2ggY2FuIGJlIGltcGxlbWVudGVkIGJ5IHJlZmVyZW5jZSwgc2ltaWxhciB0byBwcm90b3R5cGVzICovXG4gIGNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0YWdQcm90b3R5cGVzOiBQb0VsZW1lbnRNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIHtcbiAgICAgIHdoZW46IHtcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKC4uLndoYXQ6IFdoZW5QYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KHRoaXM6IEVsZW1lbnQsIGE6IG9iamVjdCkge1xuICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgICAgIGV4ID0+IGNvbnNvbGUud2FybihleCkpO1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaWRzOiB7XG4gICAgICAgIC8vIC5pZHMgaXMgYSBnZXR0ZXIgdGhhdCB3aGVuIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vIGxhemlseSBjcmVhdGVzIGEgUHJveHkgdGhhdCBwcm92aWRlcyBsaXZlIGFjY2VzcyB0byBjaGlsZHJlbiBieSBpZFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICBnZXQodGhpczogRWxlbWVudCkge1xuICAgICAgICAgIC8vIE5vdyB3ZSd2ZSBiZWVuIGFjY2Vzc2VkLCBjcmVhdGUgdGhlIHByb3h5XG4gICAgICAgICAgY29uc3QgaWRQcm94eSA9IG5ldyBQcm94eSgoKCk9Pnt9KSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIFdlYWtSZWY8RWxlbWVudD4+LCB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0FyZy5jb25zdHJ1Y3Rvci5kZWZpbml0aW9uLmlkc1thcmdzWzBdLmlkXSguLi5hcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgPGVsdD4uaWRzLiR7YXJncz8uWzBdPy5pZH0gaXMgbm90IGEgdGFnLWNyZWF0aW5nIGZ1bmN0aW9uYCwgeyBjYXVzZTogZXggfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdHJ1Y3Q6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZjogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7IHJldHVybiBudWxsIH0sXG4gICAgICAgICAgICBpc0V4dGVuc2libGUoKSB7IHJldHVybiBmYWxzZSB9LFxuICAgICAgICAgICAgcHJldmVudEV4dGVuc2lvbnMoKSB7IHJldHVybiB0cnVlIH0sXG4gICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXlGb3IocCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhcyh0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpO1xuICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvd25LZXlzOiAodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGlkcyA9IFsuLi50aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYFtpZF1gKV0ubWFwKGUgPT4gZS5pZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IFsuLi5uZXcgU2V0KGlkcyldO1xuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgaWRzLmxlbmd0aCAhPT0gdW5pcXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50IGlkc2AsIHVuaXF1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiB1bmlxdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwLCByZWNlaXZlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGsgPSBrZXlGb3IocCk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UndmUgY2FjaGVkIHRoaXMgSUQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmIChwayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBlbGVtZW50IGlzIHN0aWxsIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBlbGVtZW50IHdpdGggdGhlIHNhbWUgSURcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRhcmdldFtwa10uZGVyZWYoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgcmVmLmlkID09PSBwICYmIHRoaXMuY29udGFpbnMocmVmKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbcGtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZTogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIENTUy5lc2NhcGUocCkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50cyB3aXRoIElEIFwiJHtwfVwiYC8qLGBcXG5cXHQke2xvZ05vZGUodGhpcyl9YCovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZSA9IG5sWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUocCkpID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUpXG4gICAgICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIHBrLCBuZXcgV2Vha1JlZihlKSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uYW5kIHJlcGxhY2UgdGhlIGdldHRlciB3aXRoIHRoZSBQcm94eVxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWRzJywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gaWRQcm94eSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi4uYW5kIHJldHVybiB0aGF0IGZyb20gdGhlIGdldHRlciwgc28gc3Vic2VxdWVudCBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGFjY2Vzc2VzIGdvIHZpYSB0aGUgUHJveHlcbiAgICAgICAgICByZXR1cm4gaWRQcm94eTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKiBBZGQgYW55IHVzZXIgc3VwcGxpZWQgcHJvdG90eXBlcyAqL1xuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uICpub2RlcyguLi5jaGlsZFRhZ3M6IENoaWxkVGFnc1tdKTogSXRlcmFibGVJdGVyYXRvcjxDaGlsZE5vZGUsIHZvaWQsIHVua25vd24+IHtcbiAgICBmdW5jdGlvbiBub3RWaWFibGVUYWcoYzogQ2hpbGRUYWdzKSB7XG4gICAgICByZXR1cm4gKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGMgb2YgY2hpbGRUYWdzKSB7XG4gICAgICBpZiAobm90VmlhYmxlVGFnKGMpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgbGV0IGcgPSBEb21Qcm9taXNlQ29udGFpbmVyKCk7XG4gICAgICAgIGMudGhlbihyZXBsYWNlbWVudCA9PiB7XG4gICAgICAgICAgZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyZXBsYWNlbWVudCkpO1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICB5aWVsZCBnO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHlpZWxkIGMgYXMgQ2hpbGROb2RlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgaGF2ZSBhbiBpbnRlcmVzdGluZyBjYXNlIGhlcmUgd2hlcmUgYW4gaXRlcmFibGUgU3RyaW5nIGlzIGFuIG9iamVjdCB3aXRoIGJvdGggU3ltYm9sLml0ZXJhdG9yXG4gICAgICAvLyAoaW5oZXJpdGVkIGZyb20gdGhlIFN0cmluZyBwcm90b3R5cGUpIGFuZCBTeW1ib2wuYXN5bmNJdGVyYXRvciAoYXMgaXQncyBiZWVuIGF1Z21lbnRlZCBieSBib3hlZCgpKVxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXNlcyBsaWtlIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdCwgYXJyYXksIGV0Yy4sIG5vdCB0aGUgZnVua3kgb25lc1xuICAgICAgLy8gSXQgdXNlZCB0byBiZSBhZnRlciB0aGUgaXNBc3luY0l0ZXIoKSB0ZXN0LCBidXQgYSBub24tQXN5bmNJdGVyYXRvciAqbWF5KiBhbHNvIGJlIGEgc3luYyBpdGVyYWJsZVxuICAgICAgLy8gRm9yIG5vdywgd2UgZXhjbHVkZSAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgaW4gdGhpcyBjYXNlLlxuICAgICAgaWYgKGMgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBjICYmICEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgJiYgY1tTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgYylcbiAgICAgICAgICB5aWVsZCAqbm9kZXMoY2gpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGxldCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgdGVybWluYXRlU291cmNlID0gKGZvcmNlOiBib29sZWFuID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBpZiAoIWFwIHx8ICFyZXBsYWNlbWVudC5ub2RlcylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIGlmIChmb3JjZSB8fCByZXBsYWNlbWVudC5ub2Rlcy5ldmVyeShlID0+IHJlbW92ZWROb2Rlcy5oYXMoZSkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXM/LmZvckVhY2goZSA9PiByZW1vdmVkTm9kZXMuYWRkKGUpKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudDogXCJcbiAgICAgICAgICAgICAgKyByZXBsYWNlbWVudC5ub2Rlcy5tYXAobG9nTm9kZSkuam9pbignXFxuJylcbiAgICAgICAgICAgICAgKyBpbnNlcnRpb25TdGFjaztcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBudWxsO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICBhcCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHtcbiAgICAgICAgICBub2RlczogKCh1bmJveGVkID09PSBjIHx8IG5vdFZpYWJsZVRhZyhjKSkgPyBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXSA6IFsuLi5ub2Rlcyh1bmJveGVkKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcyEsJ25vZGVzJyx0ZXJtaW5hdGVTb3VyY2UpO1xuXG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgY29uc3QgZGVidWdVbm1vdW50ZWQgPSBERUJVR1xuICAgICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG4gICAgICAgICAgICBsZXQgZiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBmID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsIGNyZWF0ZWRCeSwgcmVwbGFjZW1lbnQubm9kZXM/Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgIH0pKClcbiAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgKGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgICAgYXAubmV4dCgpLnRoZW4oZXMgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGlmICghcmVwbGFjZW1lbnQubm9kZXMpIHtcbiAgICAgICAgICAgICAgICBhcD8udGhyb3c/LihuZXcgRXJyb3IoXCJBbHJlYWR5IHRlcm5pbWF0ZWRcIikpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gcmVwbGFjZW1lbnQubm9kZXMuZmlsdGVyKGUgPT4gZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gcmVwbGFjZW1lbnQubm9kZXMgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghdGVybWluYXRlU291cmNlKCFuLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z1VubW91bnRlZD8uKCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcywgJ25vZGVzJyk7XG5cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFsuLi5ub2Rlcyh1bmJveChlcy52YWx1ZSkpXTtcbiAgICAgICAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKHJlcGxhY2VtZW50Lm5vZGVzLCAnbm9kZXMnLHRlcm1pbmF0ZVNvdXJjZSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpPTA7IGk8bi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgaWYgKGk9PT0wKVxuICAgICAgICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKC4uLnJlcGxhY2VtZW50Lm5vZGVzKTtcbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5pbmNsdWRlcyhuW2ldKSlcbiAgICAgICAgICAgICAgICAgICAgbltpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5hZGQobltpXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbiA9IHJlcGxhY2VtZW50Lm5vZGVzPy5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzPy5mb3JFYWNoKGUgPT4gcmVtb3ZlZE5vZGVzLmFkZChlKSk7XG4gICAgICAgICAgICBpZiAobj8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICBuLnNsaWNlKDEpLmZvckVhY2goZSA9PiBlPy5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybihcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCByZXBsYWNlbWVudC5ub2Rlcz8ubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudC5ub2RlcykgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcywgJ25vZGVzJyk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICBhcCA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm5vZGVzKSB5aWVsZCogcmVwbGFjZW1lbnQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB5aWVsZCB0aGlzRG9jLmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgbm9kZXMsICAgIC8vIEJ1aWxkIERPTSBOb2RlW10gZnJvbSBDaGlsZFRhZ3NcbiAgICAgIFVuaXF1ZUlEXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtkIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoZCkgOiBkfWApO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveDxUPihhOiBUKTogVCB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodiwgdW5ib3gpIDogdikgYXMgVDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IE5vZGUsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZTogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGJlZW4gbW91bnRlZCBiZWZvcmUsIGJpdCBhcmVuJ3Qgbm93LCByZW1vdmUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaGFzKGJhc2UpIHx8ICghbm90WWV0TW91bnRlZCAmJiAhbW91bnRlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgdG86XFxuJHtsb2dOb2RlKGJhc2UpfWApO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZT86IGFueSkgPT4ge1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBpZiAoZXJyb3JWYWx1ZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSB0ZXJtaW5hcnRpb25cIiwgZXJyb3JWYWx1ZSwgaywgZCwgY3JlYXRlZEJ5LCBsb2dOb2RlKGJhc2UpKTtcbiAgICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVuYm94ZWQgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSB2YWx1ZSAmJiAhaXNBc3luY0l0ZXIodW5ib3hlZCkpXG4gICAgICAgICAgICB1cGRhdGUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHVuYm94ZWQgfSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChbYmFzZV0sICdhc3NpZ25JdGVyYWJsZScsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGFpdWlFeHRlbmRlZFRhZ1N0eWxlcy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgIC8vIGlmICghdGhpc0RvYy5oZWFkLmNvbnRhaW5zKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICAgIC8vICAgdGhpc0RvYy5oZWFkLmFwcGVuZENoaWxkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk7XG4gICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpIH0pKSBhcyBOb2RlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBjb25zdCByZW1vdmFsczogV2Vha01hcDxOb2RlLCBNYXA8c3RyaW5nLCAoKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCB4IG9mIHJlbW92YWxTZXQ/LnZhbHVlcygpKSB4KClcbiAgICAgICAgfVxuICAgICAgICAvLyBMZWdhY3kgb25SZW1vdmVkRnJvbURPTSBzdXBwb3J0XG4gICAgICAgIGlmIChlbmFibGVPblJlbW92ZWRGcm9tRE9NICYmICdvblJlbW92ZWRGcm9tRE9NJyBpbiBub2RlICYmIHR5cGVvZiBub2RlLm9uUmVtb3ZlZEZyb21ET00gPT09ICdmdW5jdGlvbicpIG5vZGUub25SZW1vdmVkRnJvbURPTSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnICYmIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aClcbiAgICAgICAgd2FsayhtLnJlbW92ZWROb2RlcylcbiAgICB9KTtcbiAgfSkub2JzZXJ2ZShyb290LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICByZXR1cm4ge1xuICAgIGhhcyhlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuaGFzKGUpIH0sXG4gICAgYWRkKGU6Tm9kZSkgeyByZXR1cm4gdHJhY2tlZC5hZGQoZSkgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBzdHJpbmcsIGhhbmRsZXI/OiAoKT0+dm9pZCkge1xuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgZS5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IHJlbW92YWxzLmdldChlKSA/PyBuZXcgTWFwPHN0cmluZywgKCk9PnZvaWQ+KCk7XG4gICAgICAgICAgcmVtb3ZhbHMuc2V0KGUsIG1hcCk7XG4gICAgICAgICAgbWFwLnNldChuYW1lLCBoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZS5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IHJlbW92YWxzLmdldChlKTtcbiAgICAgICAgICBpZiAobWFwKSB7XG4gICAgICAgICAgICBtYXAuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCFtYXAuc2l6ZSlcbiAgICAgICAgICAgICAgcmVtb3ZhbHMuZGVsZXRlKGUpXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFDTyxJQUFNLFFBQVEsV0FBVyxTQUFTLE9BQU8sV0FBVyxTQUFTLFFBQVEsUUFBUSxXQUFXLE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxLQUFLO0FBRTlILElBQU0sY0FBYztBQUUzQixJQUFNLFdBQVc7QUFBQSxFQUNmLE9BQU8sTUFBVztBQUNoQixRQUFJLE1BQU8sU0FBUSxJQUFJLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLGtCQUFpQixJQUFJLENBQUM7QUFBQSxFQUNuRztBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLEtBQUssaUJBQWlCLEdBQUcsTUFBTSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsa0JBQWlCLElBQUksQ0FBQztBQUFBLEVBQ3JHO0FBQUEsRUFDQSxRQUFRLE1BQVc7QUFDakIsUUFBSSxNQUFPLFNBQVEsS0FBSyxpQkFBaUIsR0FBRyxJQUFJO0FBQUEsRUFDbEQ7QUFDRjs7O0FDTkEsSUFBTSxVQUFVLENBQUMsTUFBUztBQUFDO0FBRXBCLFNBQVMsV0FBa0M7QUFDaEQsTUFBSSxVQUErQztBQUNuRCxNQUFJLFNBQStCO0FBQ25DLFFBQU0sVUFBVSxJQUFJLFFBQVcsSUFBSSxNQUFNLENBQUMsU0FBUyxNQUFNLElBQUksQ0FBQztBQUM5RCxVQUFRLFVBQVU7QUFDbEIsVUFBUSxTQUFTO0FBQ2pCLE1BQUksT0FBTztBQUNULFVBQU0sZUFBZSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxZQUFRLE1BQU0sUUFBTyxjQUFjLFNBQVMsSUFBSSxpQkFBaUIsUUFBUyxTQUFRLElBQUksc0JBQXNCLElBQUksaUJBQWlCLFlBQVksSUFBSSxNQUFTO0FBQUEsRUFDNUo7QUFDQSxTQUFPO0FBQ1Q7QUFHTyxTQUFTLGFBQWEsR0FBNEI7QUFDdkQsU0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLE9BQU8sTUFBTTtBQUNwRDtBQUVPLFNBQVMsY0FBaUIsR0FBNkI7QUFDNUQsU0FBTyxhQUFhLENBQUMsS0FBTSxVQUFVLEtBQU0sT0FBTyxFQUFFLFNBQVM7QUFDL0Q7OztBQy9CQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9DTyxJQUFNLGNBQWMsT0FBTyxhQUFhO0FBdUR4QyxTQUFTLGdCQUE2QixHQUFrRDtBQUM3RixTQUFPLGFBQWEsQ0FBQyxLQUFLLFVBQVUsS0FBSyxPQUFPLEdBQUcsU0FBUztBQUM5RDtBQUNPLFNBQVMsZ0JBQTZCLEdBQWtEO0FBQzdGLFNBQU8sYUFBYSxDQUFDLEtBQU0sT0FBTyxpQkFBaUIsS0FBTSxPQUFPLEVBQUUsT0FBTyxhQUFhLE1BQU07QUFDOUY7QUFDTyxTQUFTLFlBQXlCLEdBQXdGO0FBQy9ILFNBQU8sZ0JBQWdCLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQztBQUNoRDtBQUlPLFNBQVMsY0FBaUIsR0FBcUI7QUFDcEQsTUFBSSxnQkFBZ0IsQ0FBQyxFQUFHLFFBQU87QUFDL0IsTUFBSSxnQkFBZ0IsQ0FBQyxFQUFHLFFBQU8sRUFBRSxPQUFPLGFBQWEsRUFBRTtBQUN2RCxRQUFNLElBQUksTUFBTSx1QkFBdUI7QUFDekM7QUFHTyxJQUFNLGNBQWM7QUFBQSxFQUN6QixVQUNFLElBQ0EsZUFBa0MsUUFDbEM7QUFDQSxXQUFPLFVBQVUsTUFBTSxJQUFJLFlBQVk7QUFBQSxFQUN6QztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFNBQStFLEdBQU07QUFDbkYsV0FBTyxNQUFNLE1BQU0sR0FBRyxDQUFDO0FBQUEsRUFDekI7QUFBQSxFQUNBLFFBQWlFLFFBQVc7QUFDMUUsV0FBTyxRQUFRLE9BQU8sT0FBTyxFQUFFLFNBQVMsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUFBLEVBQ3pEO0FBQ0Y7QUFFQSxJQUFNLFlBQVksQ0FBQyxHQUFHLE9BQU8sc0JBQXNCLFdBQVcsR0FBRyxHQUFHLE9BQU8sS0FBSyxXQUFXLENBQUM7QUFHNUYsU0FBUyxhQUF5QyxHQUFNLEdBQU07QUFDNUQsUUFBTSxPQUFPLENBQUMsR0FBRyxPQUFPLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxPQUFPLHNCQUFzQixDQUFDLENBQUM7QUFDbEYsYUFBVyxLQUFLLE1BQU07QUFDcEIsV0FBTyxlQUFlLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyx5QkFBeUIsR0FBRyxDQUFDLEdBQUcsWUFBWSxNQUFNLENBQUM7QUFBQSxFQUM3RjtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU0sV0FBVyxPQUFPLFNBQVM7QUFDakMsSUFBTSxTQUFTLE9BQU8sT0FBTztBQUM3QixTQUFTLGdDQUFtQyxPQUFPLE1BQU07QUFBRSxHQUFHO0FBQzVELFFBQU0sSUFBSTtBQUFBLElBQ1IsQ0FBQyxRQUFRLEdBQUcsQ0FBQztBQUFBLElBQ2IsQ0FBQyxNQUFNLEdBQUcsQ0FBQztBQUFBLElBRVgsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUN2QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsT0FBTztBQUNMLFVBQUksRUFBRSxNQUFNLEdBQUcsUUFBUTtBQUNyQixlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUU7QUFBQSxNQUMzQztBQUVBLFVBQUksQ0FBQyxFQUFFLFFBQVE7QUFDYixlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBZSxPQUFPLE9BQVUsQ0FBQztBQUVsRSxZQUFNLFFBQVEsU0FBNEI7QUFHMUMsWUFBTSxNQUFNLFFBQU07QUFBQSxNQUFFLENBQUM7QUFDckIsUUFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQ3pCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxPQUFPLEdBQWE7QUFDbEIsWUFBTSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sT0FBVTtBQUN0RCxVQUFJLEVBQUUsUUFBUSxHQUFHO0FBQ2YsWUFBSTtBQUFFLGVBQUs7QUFBQSxRQUFFLFNBQVMsSUFBSTtBQUFBLFFBQUU7QUFDNUIsZUFBTyxFQUFFLFFBQVEsRUFBRTtBQUNqQixZQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUcsUUFBUSxLQUFLO0FBQ2xDLFVBQUUsTUFBTSxJQUFJLEVBQUUsUUFBUSxJQUFJO0FBQUEsTUFDNUI7QUFDQSxhQUFPLFFBQVEsUUFBUSxLQUFLO0FBQUEsSUFDOUI7QUFBQSxJQUVBLFNBQVMsTUFBYTtBQUNwQixZQUFNLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNwRCxVQUFJLEVBQUUsUUFBUSxHQUFHO0FBQ2YsWUFBSTtBQUFFLGVBQUs7QUFBQSxRQUFFLFNBQVMsSUFBSTtBQUFBLFFBQUU7QUFDNUIsZUFBTyxFQUFFLFFBQVEsRUFBRTtBQUNqQixZQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUcsT0FBTyxLQUFLO0FBQ2pDLFVBQUUsTUFBTSxJQUFJLEVBQUUsUUFBUSxJQUFJO0FBQUEsTUFDNUI7QUFDQSxhQUFPLFFBQVEsT0FBTyxLQUFLO0FBQUEsSUFDN0I7QUFBQSxJQUVBLElBQUksU0FBUztBQUNYLFVBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRyxRQUFPO0FBQ3ZCLGFBQU8sRUFBRSxNQUFNLEVBQUU7QUFBQSxJQUNuQjtBQUFBLElBRUEsS0FBSyxPQUFVO0FBQ2IsVUFBSSxDQUFDLEVBQUUsUUFBUTtBQUNiLGVBQU87QUFFVCxVQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVE7QUFDdEIsVUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFHLFFBQVEsRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsTUFDbkQsT0FBTztBQUNMLFlBQUksQ0FBQyxFQUFFLE1BQU0sR0FBRztBQUNkLG1CQUFRLElBQUksaURBQWlEO0FBQUEsUUFDL0QsT0FBTztBQUNMLFlBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsUUFDdkM7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsU0FBTyxnQkFBZ0IsQ0FBQztBQUMxQjtBQUVBLElBQU0sWUFBWSxPQUFPLFVBQVU7QUFDbkMsU0FBUyx3Q0FBMkMsT0FBTyxNQUFNO0FBQUUsR0FBRztBQUNwRSxRQUFNLElBQUksZ0NBQW1DLElBQUk7QUFDakQsSUFBRSxTQUFTLElBQUksb0JBQUksSUFBTztBQUUxQixJQUFFLE9BQU8sU0FBVSxPQUFVO0FBQzNCLFFBQUksQ0FBQyxFQUFFLFFBQVE7QUFDYixhQUFPO0FBR1QsUUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUs7QUFDeEIsYUFBTztBQUVULFFBQUksRUFBRSxRQUFRLEVBQUUsUUFBUTtBQUN0QixRQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUs7QUFDdEIsWUFBTSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUk7QUFDMUIsUUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxLQUFLLENBQUM7QUFDMUMsUUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLElBQ2xDLE9BQU87QUFDTCxVQUFJLENBQUMsRUFBRSxNQUFNLEdBQUc7QUFDZCxpQkFBUSxJQUFJLGlEQUFpRDtBQUFBLE1BQy9ELFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLE9BQUssRUFBRSxVQUFVLEtBQUssR0FBRztBQUNsRCxVQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLE1BQ3ZDO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsU0FBTztBQUNUO0FBR08sSUFBTSwwQkFBZ0Y7QUFDdEYsSUFBTSxrQ0FBd0Y7QUFnQnJHLElBQU0sd0JBQXdCLE9BQU8sdUJBQXVCO0FBQ3JELFNBQVMsdUJBQXVHLEtBQVEsTUFBUyxHQUErQztBQUlyTCxNQUFJLGVBQWUsTUFBTTtBQUN2QixtQkFBZSxNQUFNO0FBQ3JCLFVBQU0sS0FBSyxnQ0FBbUM7QUFDOUMsVUFBTSxLQUFLLEdBQUcsTUFBTTtBQUNwQixVQUFNLElBQUksR0FBRyxPQUFPLGFBQWEsRUFBRTtBQUNuQyxXQUFPLE9BQU8sYUFBYSxJQUFJLEdBQUcsT0FBTyxhQUFhO0FBQ3RELFdBQU8sR0FBRztBQUNWLGNBQVUsUUFBUTtBQUFBO0FBQUEsTUFDaEIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFtQjtBQUFBLEtBQUM7QUFDcEMsUUFBSSxFQUFFLHlCQUF5QjtBQUM3QixtQkFBYSxHQUFHLE1BQU07QUFDeEIsV0FBTztBQUFBLEVBQ1Q7QUFHQSxXQUFTLGdCQUFvRCxRQUFXO0FBQ3RFLFdBQU87QUFBQSxNQUNMLENBQUMsTUFBTSxHQUFHLFlBQTRCLE1BQWE7QUFDakQscUJBQWE7QUFFYixlQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxJQUFJO0FBQUEsTUFDbkM7QUFBQSxJQUNGLEVBQUUsTUFBTTtBQUFBLEVBQ1Y7QUFRQSxRQUFNLFNBQVMsRUFBRSxDQUFDLE9BQU8sYUFBYSxHQUFHLGFBQWE7QUFDdEQsWUFBVSxRQUFRLENBQUM7QUFBQTtBQUFBLElBQ2pCLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixDQUFDO0FBQUEsR0FBQztBQUNoQyxNQUFJLE9BQU8sTUFBTSxZQUFZLEtBQUssZUFBZSxLQUFLLEVBQUUsV0FBVyxNQUFNLFdBQVc7QUFDbEYsV0FBTyxXQUFXLElBQUksRUFBRSxXQUFXO0FBQUEsRUFDckM7QUFHQSxNQUFJLE9BQTJDLENBQUNBLE9BQVM7QUFDdkQsaUJBQWE7QUFDYixXQUFPLEtBQUtBLEVBQUM7QUFBQSxFQUNmO0FBRUEsTUFBSSxJQUFJLElBQUksR0FBRyxNQUFNO0FBQ3JCLE1BQUksUUFBc0M7QUFFMUMsU0FBTyxlQUFlLEtBQUssTUFBTTtBQUFBLElBQy9CLE1BQVM7QUFBRSxhQUFPO0FBQUEsSUFBRTtBQUFBLElBQ3BCLElBQUlBLElBQThCO0FBQ2hDLFVBQUlBLE9BQU0sR0FBRztBQUNYLFlBQUksZ0JBQWdCQSxFQUFDLEdBQUc7QUFZdEIsY0FBSSxVQUFVQTtBQUNaO0FBRUYsa0JBQVFBO0FBQ1IsY0FBSSxRQUFRLFFBQVEsSUFBSSxNQUFNLElBQUk7QUFDbEMsY0FBSTtBQUNGLHFCQUFRLEtBQUssSUFBSSxNQUFNLGFBQWEsS0FBSyxTQUFTLENBQUMsOEVBQThFLENBQUM7QUFDcEksa0JBQVEsS0FBS0EsSUFBRyxPQUFLO0FBQ25CLGdCQUFJQSxPQUFNLE9BQU87QUFFZixvQkFBTSxJQUFJLE1BQU0sbUJBQW1CLEtBQUssU0FBUyxDQUFDLDJDQUEyQyxFQUFFLE9BQU8sTUFBTSxDQUFDO0FBQUEsWUFDL0c7QUFDQSxpQkFBSyxHQUFHLFFBQVEsQ0FBTTtBQUFBLFVBQ3hCLENBQUMsRUFBRSxNQUFNLFFBQU0sU0FBUSxLQUFLLEVBQUUsQ0FBQyxFQUM1QixRQUFRLE1BQU9BLE9BQU0sVUFBVyxRQUFRLE9BQVU7QUFHckQ7QUFBQSxRQUNGLE9BQU87QUFDTCxjQUFJLFNBQVMsT0FBTztBQUNsQixxQkFBUSxJQUFJLGFBQWEsS0FBSyxTQUFTLENBQUMsMEVBQTBFO0FBQUEsVUFDcEg7QUFDQSxjQUFJLElBQUlBLElBQUcsTUFBTTtBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUNBLFdBQUtBLElBQUcsUUFBUSxDQUFNO0FBQUEsSUFDeEI7QUFBQSxJQUNBLFlBQVk7QUFBQSxFQUNkLENBQUM7QUFDRCxTQUFPO0FBRVAsV0FBUyxJQUFPQyxJQUFNLEtBQXVEO0FBQzNFLFFBQUlBLE9BQU0sUUFBUUEsT0FBTSxRQUFXO0FBQ2pDLGFBQU8sYUFBYSxPQUFPLE9BQU8sTUFBTTtBQUFBLFFBQ3RDLFNBQVMsRUFBRSxRQUFRO0FBQUUsaUJBQU9BO0FBQUEsUUFBRSxHQUFHLFVBQVUsTUFBTSxjQUFjLEtBQUs7QUFBQSxRQUNwRSxRQUFRLEVBQUUsUUFBUTtBQUFFLGlCQUFPQTtBQUFBLFFBQUUsR0FBRyxVQUFVLE1BQU0sY0FBYyxLQUFLO0FBQUEsTUFDckUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxJQUNUO0FBQ0EsWUFBUSxPQUFPQSxJQUFHO0FBQUEsTUFDaEIsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUVILGVBQU8sYUFBYSxPQUFPQSxFQUFDLEdBQUcsT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNoRCxTQUFTO0FBQUUsbUJBQU9BLEdBQUUsUUFBUTtBQUFBLFVBQUU7QUFBQSxRQUNoQyxDQUFDLENBQUM7QUFBQSxNQUNKLEtBQUs7QUFLSCxlQUFPLFVBQVVBLElBQUcsR0FBRztBQUFBLElBRTNCO0FBQ0EsVUFBTSxJQUFJLFVBQVUsNENBQTRDLE9BQU9BLEtBQUksR0FBRztBQUFBLEVBQ2hGO0FBSUEsV0FBUyx1QkFBdUIsR0FBb0M7QUFDbEUsV0FBTyxhQUFhLENBQUMsS0FBSyx5QkFBeUI7QUFBQSxFQUNyRDtBQUNBLFdBQVMsWUFBWSxHQUFRLE1BQWM7QUFDekMsVUFBTSxTQUFTLEtBQUssTUFBTSxHQUFHLEVBQUUsTUFBTSxDQUFDO0FBQ3RDLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxXQUFZLElBQUksSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLFFBQVksSUFBSTtBQUMvRSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsVUFBVUEsSUFBTSxLQUEyQztBQUNsRSxRQUFJO0FBQ0osUUFBSTtBQUNKLFdBQU8sSUFBSSxNQUFNQSxJQUFhLFFBQVEsQ0FBQztBQUV2QyxhQUFTLFFBQVEsT0FBTyxJQUEwQjtBQUNoRCxhQUFPO0FBQUE7QUFBQSxRQUVMLElBQUksUUFBUSxLQUFLO0FBQ2YsaUJBQU8sUUFBUSx5QkFBeUIsUUFBUSxPQUFPLGVBQWUsT0FBTyxVQUFVLE9BQU87QUFBQSxRQUNoRztBQUFBO0FBQUEsUUFFQSxJQUFJLFFBQVEsS0FBSyxPQUFPLFVBQVU7QUFDaEMsY0FBSSxPQUFPLE9BQU8sS0FBSyxHQUFHLEdBQUc7QUFDM0Isa0JBQU0sSUFBSSxNQUFNLGNBQWMsS0FBSyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxTQUFTLENBQUMsaUNBQWlDO0FBQUEsVUFDekc7QUFDQSxjQUFJLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUSxNQUFNLE9BQU87QUFDaEQsaUJBQUssRUFBRSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsR0FBQUEsSUFBRyxLQUFLLEVBQUUsQ0FBUTtBQUFBLFVBQ3REO0FBQ0EsaUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxPQUFPLFFBQVE7QUFBQSxRQUNqRDtBQUFBLFFBQ0EsZUFBZSxRQUFRLEtBQUs7QUFDMUIsY0FBSSxRQUFRLGVBQWUsUUFBUSxHQUFHLEdBQUc7QUFDdkMsaUJBQUssRUFBRSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsR0FBQUEsSUFBRyxLQUFLLEVBQUUsQ0FBUTtBQUNwRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQTtBQUFBLFFBRUEsSUFBSSxRQUFRLEtBQUssVUFBVTtBQUV6QixjQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsR0FBRztBQUMzQixnQkFBSSxDQUFDLEtBQUssUUFBUTtBQUNoQiw0Q0FBZ0IsVUFBVSxLQUFLLE9BQUssdUJBQXVCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQztBQUM5RixxQkFBTyxZQUFZLEdBQXVCO0FBQUEsWUFDNUMsT0FBTztBQUNMLHNDQUFhLFVBQVUsS0FBSyxPQUFLLHVCQUF1QixDQUFDLElBQUksRUFBRSxxQkFBcUIsSUFBSSxFQUFFLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQztBQUU1RyxrQkFBSSxLQUFLLFVBQVUsVUFBVSxDQUFDLEdBQUcsTUFBTTtBQUNyQyxzQkFBTUQsS0FBSSxZQUFZLEVBQUUsR0FBRyxJQUFJO0FBQy9CLHVCQUFPLE1BQU1BLE1BQUssRUFBRSxTQUFTLFFBQVEsRUFBRSxLQUFLLFdBQVcsSUFBSSxJQUFJQSxLQUFJO0FBQUEsY0FDckUsR0FBRyxRQUFRLFlBQVlDLElBQUcsSUFBSSxDQUFDO0FBQy9CLHFCQUFPLEdBQUcsR0FBc0I7QUFBQSxZQUNsQztBQUFBLFVBQ0Y7QUFHQSxjQUFJLFFBQVEsVUFBVyxRQUFPLE1BQU0sWUFBWUEsSUFBRyxJQUFJO0FBQ3ZELGNBQUksUUFBUSxPQUFPLGFBQWE7QUFFOUIsbUJBQU8sU0FBVSxNQUF3QztBQUN2RCxrQkFBSSxRQUFRLElBQUksUUFBUSxHQUFHO0FBQ3pCLHVCQUFPLFFBQVEsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFLEtBQUssUUFBUSxJQUFJO0FBQzNELGtCQUFJLFNBQVMsU0FBVSxRQUFPLE9BQU8sU0FBUztBQUM5QyxrQkFBSSxTQUFTLFNBQVUsUUFBTyxPQUFPLE1BQU07QUFDM0MscUJBQU8sT0FBTyxRQUFRO0FBQUEsWUFDeEI7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixpQkFBSyxFQUFFLE9BQU8sV0FBVyxPQUFPLE9BQU8sUUFBUSxHQUFHLE1BQU0sRUFBRSxlQUFlLFVBQVUsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUNySCxvQkFBTSxRQUFRLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUTtBQUMvQyxxQkFBUSxPQUFPLFVBQVUsY0FBZSxZQUFZLEtBQUssSUFDckQsUUFDQSxJQUFJLE1BQU0sT0FBTyxLQUFLLEdBQUcsUUFBUSxPQUFPLE1BQU0sR0FBRyxDQUFDO0FBQUEsWUFDeEQ7QUFBQSxVQUNGO0FBRUEsaUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUtBLElBQU0sVUFBVSxJQUFJLFFBQWEsTUFBTTtBQUFFLENBQUM7QUFRbkMsSUFBTSxRQUFRLElBQWdILE9BQVU7QUFDN0ksUUFBTSxLQUF5QyxJQUFJLE1BQU0sR0FBRyxNQUFNO0FBQ2xFLFFBQU0sV0FBb0UsSUFBSSxNQUFNLEdBQUcsTUFBTTtBQUU3RixNQUFJLE9BQU8sTUFBTTtBQUNmLFdBQU8sTUFBTTtBQUFBLElBQUU7QUFDZixhQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxLQUFLO0FBQ2xDLFlBQU0sSUFBSSxHQUFHLENBQUM7QUFDZCxlQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxPQUFPLGlCQUFpQixJQUMzQyxFQUFFLE9BQU8sYUFBYSxFQUFFLElBQ3hCLEdBQ0QsS0FBSyxFQUNMLEtBQUssYUFBVyxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUU7QUFBQSxJQUN4QztBQUFBLEVBQ0Y7QUFFQSxRQUFNLFVBQWdDLENBQUM7QUFDdkMsTUFBSSxRQUFRLFNBQVM7QUFFckIsUUFBTSxTQUEyQztBQUFBLElBQy9DLENBQUMsT0FBTyxhQUFhLElBQUk7QUFBRSxhQUFPO0FBQUEsSUFBTztBQUFBLElBQ3pDLE9BQU87QUFDTCxXQUFLO0FBQ0wsYUFBTyxRQUNILFFBQVEsS0FBSyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLE1BQU07QUFDakQsWUFBSSxPQUFPLE1BQU07QUFDZjtBQUNBLG1CQUFTLEdBQUcsSUFBSTtBQUNoQixrQkFBUSxHQUFHLElBQUksT0FBTztBQUd0QixpQkFBTyxPQUFPLEtBQUs7QUFBQSxRQUNyQixPQUFPO0FBRUwsbUJBQVMsR0FBRyxJQUFJLEdBQUcsR0FBRyxJQUNsQixHQUFHLEdBQUcsRUFBRyxLQUFLLEVBQUUsS0FBSyxDQUFBQyxhQUFXLEVBQUUsS0FBSyxRQUFBQSxRQUFPLEVBQUUsRUFBRSxNQUFNLFNBQU8sRUFBRSxLQUFLLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLEVBQUUsRUFBRSxJQUMxRyxRQUFRLFFBQVEsRUFBRSxLQUFLLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxPQUFVLEVBQUUsQ0FBQztBQUNyRSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGLENBQUMsRUFBRSxNQUFNLFFBQU07QUFDYixlQUFPLE9BQU8sUUFBUSxFQUFFLEtBQUssUUFBUSxPQUFPLEVBQUUsTUFBTSxNQUFlLE9BQU8sSUFBSSxNQUFNLDBCQUEwQixFQUFFLENBQUM7QUFBQSxNQUNuSCxDQUFDLElBQ0MsUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sUUFBUSxDQUFDO0FBQUEsSUFDN0Q7QUFBQSxJQUNBLE1BQU0sT0FBTyxHQUFHO0FBQ2QsZUFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxZQUFJLFNBQVMsQ0FBQyxNQUFNLFNBQVM7QUFDM0IsbUJBQVMsQ0FBQyxJQUFJO0FBQ2Qsa0JBQVEsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssT0FBSyxFQUFFLE9BQU8sUUFBTSxFQUFFO0FBQUEsUUFDMUY7QUFBQSxNQUNGO0FBQ0EsYUFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUN0QztBQUFBLElBQ0EsTUFBTSxNQUFNLElBQVM7QUFDbkIsZUFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxZQUFJLFNBQVMsQ0FBQyxNQUFNLFNBQVM7QUFDM0IsbUJBQVMsQ0FBQyxJQUFJO0FBQ2Qsa0JBQVEsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxFQUFFLEVBQUUsS0FBSyxPQUFLLEVBQUUsT0FBTyxDQUFBQyxRQUFNQSxHQUFFO0FBQUEsUUFDbkU7QUFBQSxNQUNGO0FBR0EsYUFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixNQUFxRDtBQUM5RTtBQWNPLElBQU0sVUFBVSxDQUE2QixLQUFRLE9BQXVCLENBQUMsTUFBaUM7QUFDbkgsUUFBTSxjQUF1QyxDQUFDO0FBQzlDLE1BQUk7QUFDSixNQUFJLEtBQTJCLENBQUM7QUFDaEMsTUFBSSxTQUFpQjtBQUNyQixRQUFNLEtBQUs7QUFBQSxJQUNULENBQUMsT0FBTyxhQUFhLElBQUk7QUFBRSxhQUFPO0FBQUEsSUFBRztBQUFBLElBQ3JDLE9BQXlEO0FBQ3ZELFVBQUksT0FBTyxRQUFXO0FBQ3BCLGFBQUssT0FBTyxRQUFRLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRO0FBQzlDLG9CQUFVO0FBQ1YsYUFBRyxHQUFHLElBQUksSUFBSSxPQUFPLGFBQWEsRUFBRztBQUNyQyxpQkFBTyxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxTQUFPLEVBQUUsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO0FBQUEsUUFDdkQsQ0FBQztBQUFBLE1BQ0g7QUFFQSxhQUFRLFNBQVMsT0FBeUQ7QUFDeEUsZUFBTyxRQUFRLEtBQUssRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLE1BQU07QUFDL0MsY0FBSSxHQUFHLE1BQU07QUFDWCxlQUFHLEdBQUcsSUFBSTtBQUNWLHNCQUFVO0FBQ1YsZ0JBQUksQ0FBQztBQUNILHFCQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVTtBQUN4QyxtQkFBTyxLQUFLO0FBQUEsVUFDZCxPQUFPO0FBRUwsd0JBQVksQ0FBQyxJQUFJLEdBQUc7QUFDcEIsZUFBRyxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQUMsU0FBTyxFQUFFLEtBQUssR0FBRyxJQUFBQSxJQUFHLEVBQUU7QUFBQSxVQUN0RDtBQUNBLGNBQUksS0FBSyxlQUFlO0FBQ3RCLGdCQUFJLE9BQU8sS0FBSyxXQUFXLEVBQUUsU0FBUyxPQUFPLEtBQUssR0FBRyxFQUFFO0FBQ3JELHFCQUFPLEtBQUs7QUFBQSxVQUNoQjtBQUNBLGlCQUFPLEVBQUUsTUFBTSxPQUFPLE9BQU8sWUFBWTtBQUFBLFFBQzNDLENBQUM7QUFBQSxNQUNILEVBQUc7QUFBQSxJQUNMO0FBQUEsSUFDQSxPQUFPLEdBQVM7QUFDZCxTQUFHLFFBQVEsQ0FBQyxHQUFHLFFBQVE7QUFDckIsWUFBSSxNQUFNLFNBQVM7QUFDakIsYUFBRyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQUEsUUFDcEI7QUFBQSxNQUNGLENBQUM7QUFDRCxhQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQztBQUFBLElBQ2pEO0FBQUEsSUFDQSxNQUFNLElBQVM7QUFDYixTQUFHLFFBQVEsQ0FBQyxHQUFHLFFBQVE7QUFDckIsWUFBSSxNQUFNLFNBQVM7QUFDakIsYUFBRyxHQUFHLEVBQUUsUUFBUSxFQUFFO0FBQUEsUUFDcEI7QUFBQSxNQUNGLENBQUM7QUFDRCxhQUFPLFFBQVEsT0FBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLEVBQUU7QUFDM0I7QUFHQSxTQUFTLGdCQUFtQixHQUFvQztBQUM5RCxTQUFPLGdCQUFnQixDQUFDLEtBQ25CLFVBQVUsTUFBTSxPQUFNLEtBQUssS0FBTyxFQUFVLENBQUMsTUFBTSxZQUFZLENBQUMsQ0FBQztBQUN4RTtBQUdPLFNBQVMsZ0JBQThDLElBQStFO0FBQzNJLE1BQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHO0FBQ3hCLGlCQUFhLElBQUksV0FBVztBQUFBLEVBQzlCO0FBQ0EsU0FBTztBQUNUO0FBRU8sU0FBUyxpQkFBNEUsR0FBTTtBQUNoRyxTQUFPLFlBQWEsTUFBb0M7QUFDdEQsVUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQ3BCLFdBQU8sZ0JBQWdCLEVBQUU7QUFBQSxFQUMzQjtBQUNGO0FBWUEsZUFBZSxRQUF3RCxHQUE0RTtBQUNqSixNQUFJLE9BQTZDO0FBQ2pELG1CQUFpQixLQUFLLE1BQStDO0FBQ25FLFdBQU8sSUFBSSxDQUFDO0FBQUEsRUFDZDtBQUNBLFFBQU07QUFDUjtBQU1PLElBQU0sU0FBUyxPQUFPLFFBQVE7QUFJckMsU0FBUyxZQUFrQixHQUFxQixNQUFtQixRQUEyQztBQUM1RyxNQUFJLGNBQWMsQ0FBQztBQUNqQixXQUFPLEVBQUUsS0FBSyxNQUFNLE1BQU07QUFDNUIsTUFBSTtBQUNGLFdBQU8sS0FBSyxDQUFDO0FBQUEsRUFDZixTQUFTLElBQUk7QUFDWCxXQUFPLE9BQU8sRUFBRTtBQUFBLEVBQ2xCO0FBQ0Y7QUFFTyxTQUFTLFVBQXdDLFFBQ3RELElBQ0EsZUFBa0MsUUFDbEMsT0FBMEIsUUFDSDtBQUN2QixNQUFJO0FBQ0osV0FBUyxLQUFLLEdBQWtHO0FBRTlHLFNBQUssTUFBTTtBQUNYLFdBQU87QUFDUCxXQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxNQUFNO0FBQUEsRUFDdkM7QUFDQSxNQUFJLE1BQWdDO0FBQUEsSUFDbEMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUN2QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsUUFBUSxNQUF3QjtBQUM5QixVQUFJLGlCQUFpQixRQUFRO0FBQzNCLGNBQU0sT0FBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE9BQU8sT0FBTyxhQUFhLENBQUM7QUFDakUsdUJBQWU7QUFDZixlQUFPO0FBQUEsTUFDVDtBQUVBLGFBQU8sSUFBSSxRQUEyQixTQUFTLEtBQUssU0FBUyxRQUFRO0FBQ25FLFlBQUksQ0FBQztBQUNILGVBQUssT0FBTyxPQUFPLGFBQWEsRUFBRztBQUNyQyxXQUFHLEtBQUssR0FBRyxJQUFJLEVBQUU7QUFBQSxVQUNmLE9BQUssRUFBRSxRQUNGLE9BQU8sUUFBUSxRQUFRLENBQUMsS0FDekI7QUFBQSxZQUFZLEdBQUcsRUFBRSxPQUFPLElBQUk7QUFBQSxZQUM1QixPQUFLLE1BQU0sU0FDUCxLQUFLLFNBQVMsTUFBTSxJQUNwQixRQUFRLEVBQUUsTUFBTSxPQUFPLE9BQU8sT0FBTyxFQUFFLENBQUM7QUFBQSxZQUM1QyxRQUFNO0FBQ0oscUJBQU87QUFFUCxpQkFBRyxRQUFRLEdBQUcsTUFBTSxFQUFFLElBQUksR0FBRyxTQUFTLEVBQUU7QUFDeEMscUJBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxZQUNsQztBQUFBLFVBQ0Y7QUFBQSxVQUNGLFFBQU07QUFFSixtQkFBTztBQUNQLG1CQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsVUFDbEM7QUFBQSxRQUNGLEVBQUUsTUFBTSxRQUFNO0FBRVosaUJBQU87QUFDUCxhQUFHLFFBQVEsR0FBRyxNQUFNLEVBQUUsSUFBSSxHQUFHLFNBQVMsRUFBRTtBQUN4QyxpQkFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLFFBQ2xDLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNIO0FBQUEsSUFFQSxNQUFNLElBQVM7QUFFYixhQUFPLFFBQVEsUUFBUSxJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJO0FBQUEsSUFDL0U7QUFBQSxJQUVBLE9BQU8sR0FBUztBQUVkLGFBQU8sUUFBUSxRQUFRLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixHQUFHO0FBQzVCO0FBRUEsU0FBUyxJQUEyQyxRQUFrRTtBQUNwSCxTQUFPLFVBQVUsTUFBTSxNQUFNO0FBQy9CO0FBRUEsU0FBUyxPQUEyQyxJQUErRztBQUNqSyxTQUFPLFVBQVUsTUFBTSxPQUFNLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLE1BQU87QUFDOUQ7QUFFQSxTQUFTLE9BQTJDLElBQWlKO0FBQ25NLFNBQU8sS0FDSCxVQUFVLE1BQU0sT0FBTyxHQUFHLE1BQU8sTUFBTSxVQUFVLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSyxJQUFJLE1BQU0sSUFDN0UsVUFBVSxNQUFNLENBQUMsR0FBRyxNQUFNLE1BQU0sSUFBSSxTQUFTLENBQUM7QUFDcEQ7QUFFQSxTQUFTLFVBQTBFLFdBQThEO0FBQy9JLFNBQU8sVUFBVSxNQUFNLE9BQUssR0FBRyxTQUFTO0FBQzFDO0FBRUEsU0FBUyxRQUE0QyxJQUEyRztBQUM5SixTQUFPLFVBQVUsTUFBTSxPQUFLLElBQUksUUFBZ0MsYUFBVztBQUFFLE9BQUcsTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFHLFdBQU87QUFBQSxFQUFFLENBQUMsQ0FBQztBQUNoSDtBQUVBLFNBQVMsUUFBc0Y7QUFFN0YsUUFBTSxTQUFTO0FBQ2YsTUFBSSxZQUFZO0FBQ2hCLE1BQUk7QUFDSixNQUFJLEtBQW1EO0FBR3ZELFdBQVMsS0FBSyxJQUE2QjtBQUN6QyxRQUFJLEdBQUksU0FBUSxRQUFRLEVBQUU7QUFDMUIsUUFBSSxJQUFJLE1BQU07QUFFWixnQkFBVTtBQUFBLElBQ1osT0FBTztBQUNMLGdCQUFVLFNBQTRCO0FBQ3RDLFNBQUksS0FBSyxFQUNOLEtBQUssSUFBSSxFQUNULE1BQU0sV0FBUztBQUNkLGdCQUFRLE9BQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFFM0Msa0JBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUVBLFdBQVMsS0FBSyxHQUFtRztBQUUvRyxTQUFLLE1BQU0sVUFBVTtBQUNyQixXQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxNQUFNO0FBQUEsRUFDdkM7QUFFQSxNQUFJLE1BQWdDO0FBQUEsSUFDbEMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUN2QixtQkFBYTtBQUNiLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxPQUFPO0FBQ0wsVUFBSSxDQUFDLElBQUk7QUFDUCxhQUFLLE9BQU8sT0FBTyxhQUFhLEVBQUc7QUFDbkMsYUFBSztBQUFBLE1BQ1A7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsTUFBTSxJQUFTO0FBRWIsVUFBSSxZQUFZO0FBQ2QsY0FBTSxJQUFJLE1BQU0sOEJBQThCO0FBQ2hELG1CQUFhO0FBQ2IsVUFBSTtBQUNGLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2xELGFBQU8sUUFBUSxRQUFRLElBQUksUUFBUSxHQUFHLE1BQU0sRUFBRSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUMvRTtBQUFBLElBRUEsT0FBTyxHQUFTO0FBRWQsVUFBSSxZQUFZO0FBQ2QsY0FBTSxJQUFJLE1BQU0sOEJBQThCO0FBQ2hELG1CQUFhO0FBQ2IsVUFBSTtBQUNGLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDO0FBQ2pELGFBQU8sUUFBUSxRQUFRLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixHQUFHO0FBQzVCO0FBRU8sU0FBUywrQkFBK0I7QUFDN0MsTUFBSSxJQUFLLG1CQUFtQjtBQUFBLEVBQUUsRUFBRztBQUNqQyxTQUFPLEdBQUc7QUFDUixVQUFNLE9BQU8sT0FBTyx5QkFBeUIsR0FBRyxPQUFPLGFBQWE7QUFDcEUsUUFBSSxNQUFNO0FBQ1Isc0JBQWdCLENBQUM7QUFDakI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxPQUFPLGVBQWUsQ0FBQztBQUFBLEVBQzdCO0FBQ0EsTUFBSSxDQUFDLEdBQUc7QUFDTixhQUFRLEtBQUssNERBQTREO0FBQUEsRUFDM0U7QUFDRjs7O0FDcHZCQSxJQUFNLG9CQUFvQixvQkFBSSxRQUFzSDtBQUVwSixTQUFTLGdCQUF3RyxJQUE0QztBQUMzSixhQUFXLE1BQU0saUJBQWlCLEtBQUssTUFBTSxFQUFFLEdBQUUsQ0FBQztBQUNwRDtBQUVBLFNBQVMsaUJBQXlHLElBQTRDO0FBQzVKLE1BQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJO0FBQzdCLHNCQUFrQixJQUFJLE1BQU0sb0JBQUksSUFBSSxDQUFDO0FBRXZDLFFBQU0sZUFBZSxrQkFBa0IsSUFBSSxJQUFJLEVBQUcsSUFBSSxHQUFHLElBQXlDO0FBQ2xHLE1BQUksY0FBYztBQUNoQixlQUFXLEtBQUssY0FBYztBQUM1QixVQUFJO0FBQ0YsY0FBTSxFQUFFLE1BQU0sV0FBVyxjQUFjLFVBQVUsZ0JBQWdCLElBQUk7QUFDckUsY0FBTSxZQUFZLGFBQWEsTUFBTTtBQUNyQyxZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsYUFBYTtBQUN4QyxnQkFBTSxNQUFNLGlCQUFpQixXQUFXLEtBQUssT0FBTyxZQUFZLE1BQU07QUFDdEUsdUJBQWEsT0FBTyxDQUFDO0FBQ3JCLG9CQUFVLElBQUksTUFBTSxHQUFHLENBQUM7QUFBQSxRQUMxQixPQUFPO0FBQ0wsY0FBSSxHQUFHLGtCQUFrQixNQUFNO0FBQzdCLGdCQUFJLFVBQVU7QUFDWixvQkFBTSxRQUFRLFVBQVUsaUJBQWlCLFFBQVE7QUFDakQseUJBQVcsS0FBSyxPQUFPO0FBQ3JCLHFCQUFLLGtCQUFrQixFQUFFLFNBQVMsR0FBRyxNQUFNLElBQUksR0FBRyxXQUFXLE1BQU0sVUFBVSxTQUFTLENBQUM7QUFDckYsdUJBQUssRUFBRTtBQUFBLGNBQ1g7QUFBQSxZQUNGLE9BQU87QUFDTCxrQkFBSSxrQkFBa0IsVUFBVSxTQUFTLEdBQUcsTUFBTSxJQUFJLEdBQUcsV0FBVztBQUNsRSxxQkFBSyxFQUFFO0FBQUEsWUFDWDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixTQUFTLElBQUk7QUFDWCxpQkFBUSxLQUFLLG1CQUFtQixFQUFFO0FBQUEsTUFDcEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRUEsU0FBUyxjQUFjLEdBQStCO0FBQ3BELFNBQU8sUUFBUSxNQUFNLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxXQUFXLEdBQUcsS0FBTSxFQUFFLFdBQVcsR0FBRyxLQUFLLEVBQUUsU0FBUyxHQUFHLEVBQUc7QUFDeEc7QUFFQSxTQUFTLFVBQW1DLEtBQWdIO0FBQzFKLFFBQU0sa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksU0FBUyxHQUFHO0FBQ2pELFNBQU8sRUFBRSxpQkFBaUIsVUFBVSxrQkFBa0IsTUFBTSxJQUFJLE1BQU0sR0FBRSxFQUFFLEVBQUU7QUFDOUU7QUFFQSxTQUFTLGtCQUE0QyxNQUFxSDtBQUN4SyxRQUFNLFFBQVEsS0FBSyxNQUFNLEdBQUc7QUFDNUIsTUFBSSxNQUFNLFdBQVcsR0FBRztBQUN0QixRQUFJLGNBQWMsTUFBTSxDQUFDLENBQUM7QUFDeEIsYUFBTyxDQUFDLFVBQVUsTUFBTSxDQUFDLENBQUMsR0FBRSxRQUFRO0FBQ3RDLFdBQU8sQ0FBQyxFQUFFLGlCQUFpQixNQUFNLFVBQVUsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFzQztBQUFBLEVBQ2xHO0FBQ0EsTUFBSSxNQUFNLFdBQVcsR0FBRztBQUN0QixRQUFJLGNBQWMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsTUFBTSxDQUFDLENBQUM7QUFDdEQsYUFBTyxDQUFDLFVBQVUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBc0M7QUFBQSxFQUM1RTtBQUNBLFNBQU87QUFDVDtBQUVBLFNBQVMsUUFBUSxTQUF1QjtBQUN0QyxRQUFNLElBQUksTUFBTSxPQUFPO0FBQ3pCO0FBRUEsU0FBUyxVQUFvQyxXQUFvQixNQUFzQztBQUNyRyxRQUFNLENBQUMsRUFBRSxpQkFBaUIsU0FBUSxHQUFHLFNBQVMsSUFBSSxrQkFBa0IsSUFBSSxLQUFLLFFBQVEsMkJBQXlCLElBQUk7QUFFbEgsTUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsYUFBYTtBQUNoRCxzQkFBa0IsSUFBSSxVQUFVLGVBQWUsb0JBQUksSUFBSSxDQUFDO0FBRTFELE1BQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLGFBQWEsRUFBRyxJQUFJLFNBQVMsR0FBRztBQUNuRSxjQUFVLGNBQWMsaUJBQWlCLFdBQVcsaUJBQWlCO0FBQUEsTUFDbkUsU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUNELHNCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksV0FBVyxvQkFBSSxJQUFJLENBQUM7QUFBQSxFQUMxRTtBQUVBLFFBQU0sZUFBZSxrQkFBa0IsSUFBSSxVQUFVLGFBQWEsRUFBRyxJQUFJLFNBQVM7QUFDbEYsUUFBTSxRQUFRLHdCQUF3RixNQUFNLGFBQWMsT0FBTyxPQUFPLENBQUM7QUFDekksUUFBTSxVQUErRDtBQUFBLElBQ25FLE1BQU0sTUFBTTtBQUFBLElBQ1osVUFBVSxJQUFXO0FBQUUsWUFBTSxTQUFTLEVBQUU7QUFBQSxJQUFDO0FBQUEsSUFDekMsY0FBYyxJQUFJLFFBQVEsU0FBUztBQUFBLElBQ25DO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFFQSwrQkFBNkIsV0FBVyxXQUFXLENBQUMsUUFBUSxJQUFJLE1BQVMsRUFDdEUsS0FBSyxPQUFLLGFBQWMsSUFBSSxPQUFPLENBQUM7QUFFdkMsU0FBTyxNQUFNLE1BQU07QUFDckI7QUFFQSxnQkFBZ0Isa0JBQStDO0FBQzdELFNBQU87QUFDVDtBQUlBLFNBQVMsV0FBK0MsS0FBNkI7QUFDbkYsV0FBUyxzQkFBc0IsUUFBdUM7QUFDcEUsV0FBTyxJQUFJLElBQUksTUFBTTtBQUFBLEVBQ3ZCO0FBRUEsU0FBTyxPQUFPLE9BQU8sZ0JBQWdCLHFCQUFvRCxHQUFHO0FBQUEsSUFDMUYsQ0FBQyxPQUFPLGFBQWEsR0FBRyxNQUFNLElBQUksT0FBTyxhQUFhLEVBQUU7QUFBQSxFQUMxRCxDQUFDO0FBQ0g7QUFFQSxTQUFTLG9CQUFvQixNQUF5RDtBQUNwRixNQUFJLENBQUM7QUFDSCxVQUFNLElBQUksTUFBTSwrQ0FBK0MsS0FBSyxVQUFVLElBQUksQ0FBQztBQUNyRixTQUFPLE9BQU8sU0FBUyxZQUFZLEtBQUssQ0FBQyxNQUFNLE9BQU8sUUFBUSxrQkFBa0IsSUFBSSxDQUFDO0FBQ3ZGO0FBRUEsZ0JBQWdCLEtBQVEsR0FBZTtBQUNyQyxRQUFNO0FBQ1I7QUFFTyxTQUFTLEtBQStCLGNBQXVCLFNBQTJCO0FBQy9GLE1BQUksQ0FBQyxXQUFXLFFBQVEsV0FBVyxHQUFHO0FBQ3BDLFdBQU8sV0FBVyxVQUFVLFdBQVcsUUFBUSxDQUFDO0FBQUEsRUFDbEQ7QUFFQSxRQUFNLFlBQVksUUFBUSxPQUFPLFVBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLElBQUksVUFBUSxPQUFPLFNBQVMsV0FDOUcsVUFBVSxXQUFXLElBQUksSUFDekIsZ0JBQWdCLFVBQ2QsVUFBVSxNQUFNLFFBQVEsSUFDeEIsY0FBYyxJQUFJLElBQ2hCLEtBQUssSUFBSSxJQUNULElBQUk7QUFFWixNQUFJLFFBQVEsU0FBUyxRQUFRLEdBQUc7QUFDOUIsVUFBTSxRQUFtQztBQUFBLE1BQ3ZDLENBQUMsT0FBTyxhQUFhLEdBQUcsTUFBTTtBQUFBLE1BQzlCLE9BQU87QUFDTCxjQUFNLE9BQU8sTUFBTSxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxPQUFVLENBQUM7QUFDbkUsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUFBLE1BQ25EO0FBQUEsSUFDRjtBQUNBLGNBQVUsS0FBSyxLQUFLO0FBQUEsRUFDdEI7QUFFQSxNQUFJLFFBQVEsU0FBUyxRQUFRLEdBQUc7QUFDOUIsVUFBTSxpQkFBaUIsUUFBUSxPQUFPLG1CQUFtQixFQUFFLElBQUksVUFBUSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUVuRyxVQUFNLFlBQVksQ0FBQyxRQUF5RSxRQUFRLE9BQU8sUUFBUSxZQUFZLENBQUMsVUFBVSxjQUFjLEdBQUcsQ0FBQztBQUU1SixVQUFNLFVBQVUsZUFBZSxJQUFJLE9BQUssR0FBRyxRQUFRLEVBQUUsT0FBTyxTQUFTO0FBRXJFLFFBQUksU0FBeUQ7QUFDN0QsVUFBTSxLQUFpQztBQUFBLE1BQ3JDLENBQUMsT0FBTyxhQUFhLElBQUk7QUFBRSxlQUFPO0FBQUEsTUFBRztBQUFBLE1BQ3JDLE1BQU0sSUFBUztBQUNiLFlBQUksUUFBUSxNQUFPLFFBQU8sT0FBTyxNQUFNLEVBQUU7QUFDekMsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxNQUNsRDtBQUFBLE1BQ0EsT0FBTyxHQUFTO0FBQ2QsWUFBSSxRQUFRLE9BQVEsUUFBTyxPQUFPLE9BQU8sQ0FBQztBQUMxQyxlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQztBQUFBLE1BQ2pEO0FBQUEsTUFDQSxPQUFPO0FBQ0wsWUFBSSxPQUFRLFFBQU8sT0FBTyxLQUFLO0FBRS9CLGVBQU8sNkJBQTZCLFdBQVcsT0FBTyxFQUFFLEtBQUssTUFBTTtBQUNqRSxnQkFBTUMsVUFBVSxVQUFVLFNBQVMsSUFDakMsTUFBTSxHQUFHLFNBQVMsSUFDbEIsVUFBVSxXQUFXLElBQ25CLFVBQVUsQ0FBQyxJQUNYO0FBSUosbUJBQVNBLFVBQVMsT0FBTyxhQUFhLEVBQUU7QUFDeEMsY0FBSSxDQUFDO0FBQ0gsbUJBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxPQUFVO0FBRXhDLGlCQUFPLEVBQUUsTUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQUEsUUFDbEMsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQ0EsV0FBTyxXQUFXLGdCQUFnQixFQUFFLENBQUM7QUFBQSxFQUN2QztBQUVBLFFBQU0sU0FBVSxVQUFVLFNBQVMsSUFDL0IsTUFBTSxHQUFHLFNBQVMsSUFDbEIsVUFBVSxXQUFXLElBQ25CLFVBQVUsQ0FBQyxJQUNWLGdCQUFxQztBQUU1QyxTQUFPLFdBQVcsZ0JBQWdCLE1BQU0sQ0FBQztBQUMzQztBQUVBLFNBQVMsNkJBQTZCLFdBQW9CLFdBQXNCO0FBQzlFLFdBQVMsaUJBQWdDO0FBQ3ZDLFFBQUksVUFBVTtBQUNaLGFBQU8sUUFBUSxRQUFRO0FBRXpCLFVBQU0sVUFBVSxJQUFJLFFBQWMsQ0FBQyxTQUFTLFdBQVc7QUFDckQsYUFBTyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsYUFBYTtBQUNqRCxZQUFJLFFBQVEsS0FBSyxPQUFLLEVBQUUsWUFBWSxNQUFNLEdBQUc7QUFDM0MsY0FBSSxVQUFVLGFBQWE7QUFDekIscUJBQVMsV0FBVztBQUNwQixvQkFBUTtBQUFBLFVBQ1Y7QUFBQSxRQUNGO0FBQ0EsWUFBSSxRQUFRLEtBQUssT0FBSyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFBQyxPQUFLQSxPQUFNLGFBQWFBLEdBQUUsU0FBUyxTQUFTLENBQUMsQ0FBQyxHQUFHO0FBQzlGLG1CQUFTLFdBQVc7QUFDcEIsaUJBQU8sSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBQUEsUUFDdEM7QUFBQSxNQUNGLENBQUMsRUFBRSxRQUFRLFVBQVUsY0FBYyxNQUFNO0FBQUEsUUFDdkMsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLE1BQ2IsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUVELFFBQUksT0FBTztBQUNULFlBQU0sUUFBUSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsVUFBVSw2QkFBNkIsY0FBYyxHQUFJLFdBQVc7QUFDN0csWUFBTSxZQUFZLFdBQVcsTUFBTTtBQUNqQyxpQkFBUSxLQUFLLFFBQVEsT0FBTyxVQUFVLFNBQVM7QUFBQSxNQUVqRCxHQUFHLFdBQVc7QUFFZCxjQUFRLFFBQVEsTUFBTSxhQUFhLFNBQVMsQ0FBQztBQUFBLElBQy9DO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLG9CQUFvQixTQUFrQztBQUM3RCxjQUFVLFFBQVEsT0FBTyxTQUFPLENBQUMsVUFBVSxjQUFjLEdBQUcsQ0FBQztBQUM3RCxRQUFJLENBQUMsUUFBUSxRQUFRO0FBQ25CLGFBQU8sUUFBUSxRQUFRO0FBQUEsSUFDekI7QUFFQSxVQUFNLFVBQVUsSUFBSSxRQUFjLGFBQVcsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLGFBQWE7QUFDdkYsVUFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLFlBQVksTUFBTSxHQUFHO0FBQzNDLFlBQUksUUFBUSxNQUFNLFNBQU8sVUFBVSxjQUFjLEdBQUcsQ0FBQyxHQUFHO0FBQ3RELG1CQUFTLFdBQVc7QUFDcEIsa0JBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQyxFQUFFLFFBQVEsV0FBVztBQUFBLE1BQ3BCLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxJQUNiLENBQUMsQ0FBQztBQUdGLFFBQUksT0FBTztBQUNULFlBQU0sUUFBUSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsVUFBVSwyQkFBMkIsY0FBYyxHQUFJLFlBQVksS0FBSztBQUNqSCxZQUFNLFlBQVksV0FBVyxNQUFNO0FBQ2pDLGlCQUFRLEtBQUssUUFBUSxVQUFVLElBQUk7QUFBQSxNQUNyQyxHQUFHLFdBQVc7QUFFZCxjQUFRLFFBQVEsTUFBTSxhQUFhLFNBQVMsQ0FBQztBQUFBLElBQy9DO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLFdBQVc7QUFDYixXQUFPLGVBQWUsRUFBRSxLQUFLLE1BQU0sb0JBQW9CLFNBQVMsQ0FBQztBQUNuRSxTQUFPLGVBQWU7QUFDeEI7OztBQ2pOTyxJQUFNLGtCQUFrQixPQUFPLFdBQVc7OztBQzVJMUMsSUFBTSxXQUFXLE9BQU8sV0FBVztBQUUxQyxJQUFNLFVBQVUsUUFDYixDQUFDLE1BQVcsYUFBYSxPQUN4QixlQUFlLElBQUksRUFBRSxZQUFZLEdBQUcsRUFBRSxXQUFXLElBQUksRUFBRSxRQUFRLEtBQy9ELE9BQU8sQ0FBQyxJQUNWLENBQUMsTUFBWTtBQThEZixJQUFJLFVBQVU7QUFDZCxJQUFNLGVBQWU7QUFBQSxFQUNuQjtBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBVztBQUFBLEVBQVE7QUFBQSxFQUFXO0FBQUEsRUFBUztBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBYztBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFDcEg7QUFBQSxFQUFVO0FBQUEsRUFBVztBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBTztBQUFBLEVBQVk7QUFBQSxFQUFRO0FBQUEsRUFBWTtBQUFBLEVBQU07QUFBQSxFQUFPO0FBQUEsRUFBVztBQUFBLEVBQU87QUFBQSxFQUFVO0FBQUEsRUFDckg7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFTO0FBQUEsRUFBWTtBQUFBLEVBQWM7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUNySDtBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFLO0FBQUEsRUFBVTtBQUFBLEVBQU87QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFTO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQ3hIO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFZO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFZO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFLO0FBQUEsRUFBVztBQUFBLEVBQ3BIO0FBQUEsRUFBWTtBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBVztBQUFBLEVBQVU7QUFBQSxFQUFRO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUN0SDtBQUFBLEVBQVU7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQVc7QUFBQSxFQUFPO0FBQUEsRUFBUztBQUFBLEVBQVM7QUFBQSxFQUFNO0FBQUEsRUFBWTtBQUFBLEVBQVk7QUFBQSxFQUFTO0FBQUEsRUFBTTtBQUFBLEVBQVM7QUFBQSxFQUNwSDtBQUFBLEVBQVM7QUFBQSxFQUFNO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFDckQ7QUFFQSxTQUFTLGtCQUF5QjtBQUNoQyxRQUFNLElBQUksTUFBTSwwQ0FBMEM7QUFDNUQ7QUFHQSxJQUFNLHNCQUFzQixDQUFDLEdBQUcsT0FBTyxLQUFLLE9BQU8sMEJBQTBCLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRSxNQUFNO0FBQ2pILElBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQztBQUNmLFNBQU87QUFDVCxHQUFFLENBQUMsQ0FBMkI7QUFDOUIsU0FBUyxPQUFPLElBQXFCO0FBQUUsU0FBTyxNQUFNLHNCQUFzQixvQkFBb0IsRUFBc0MsSUFBSTtBQUFHO0FBRTNJLFNBQVMsV0FBVyxHQUF3QjtBQUMxQyxTQUFPLE9BQU8sTUFBTSxZQUNmLE9BQU8sTUFBTSxZQUNiLE9BQU8sTUFBTSxhQUNiLGFBQWEsUUFDYixhQUFhLFlBQ2IsYUFBYSxrQkFDYixNQUFNLFFBQ04sTUFBTSxVQUVOLE1BQU0sUUFBUSxDQUFDLEtBQ2YsY0FBYyxDQUFDLEtBQ2YsWUFBWSxDQUFDLEtBQ1osT0FBTyxNQUFNLFlBQVksT0FBTyxZQUFZLEtBQUssT0FBTyxFQUFFLE9BQU8sUUFBUSxNQUFNO0FBQ3ZGO0FBSU8sSUFBTSxNQUFpQixTQUs1QixJQUNBLElBQ0EsSUFDeUM7QUFXekMsUUFBTSxDQUFDLFdBQVcsTUFBTSxPQUFPLElBQUssT0FBTyxPQUFPLFlBQWEsT0FBTyxPQUNsRSxDQUFDLElBQUksSUFBYyxFQUEyQixJQUM5QyxNQUFNLFFBQVEsRUFBRSxJQUNkLENBQUMsTUFBTSxJQUFjLEVBQTJCLElBQ2hELENBQUMsTUFBTSxjQUFjLEVBQTJCO0FBRXRELFFBQU0sbUJBQW1CLFNBQVM7QUFDbEMsUUFBTSxVQUFVLFNBQVMsWUFBWSxXQUFXO0FBRWhELFFBQU0sZUFBZSxnQkFBZ0IsU0FBUyxTQUFTLHNCQUFzQjtBQUU3RSxXQUFTLG9CQUFvQixPQUFhO0FBQ3hDLFdBQU8sUUFBUSxjQUFjLFFBQU8sTUFBTSxTQUFTLElBQUcsUUFDbEQsSUFBSSxNQUFNLFNBQVMsRUFBRSxPQUFPLFFBQVEsWUFBWSxFQUFFLEtBQUssWUFDdkQsU0FBUztBQUFBLEVBQ2Y7QUFFQSxXQUFTLG1CQUFtQixFQUFFLE1BQU0sR0FBNkM7QUFDL0UsV0FBTyxRQUFRLGNBQWMsaUJBQWlCLFFBQVEsTUFBTSxTQUFTLElBQUksYUFBYSxLQUFLLFVBQVUsT0FBTyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ3RIO0FBQ0EsUUFBTSx3QkFBd0IsUUFBUSxjQUFjLE9BQU87QUFDM0Qsd0JBQXNCLEtBQUssaUNBQStCLEtBQUssSUFBSTtBQUNuRSxVQUFRLEtBQUssWUFBWSxxQkFBcUI7QUFHOUMsUUFBTSxTQUFTLG9CQUFJLElBQVk7QUFDL0IsUUFBTSxnQkFBa0MsT0FBTztBQUFBLElBQzdDO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLFFBQ0osVUFBVTtBQUFBLFFBQ1YsY0FBYztBQUFBLFFBQ2QsWUFBWTtBQUFBLFFBQ1osT0FBTyxZQUFhLE1BQXNCO0FBQ3hDLGlCQUFPLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMzQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLEdBQUcsT0FBTyx5QkFBeUIsUUFBUSxXQUFXLFlBQVk7QUFBQSxRQUNsRSxJQUFtQixHQUFXO0FBQzVCLGNBQUksWUFBWSxDQUFDLEdBQUc7QUFDbEIsa0JBQU0sS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksRUFBRSxPQUFPLGFBQWEsRUFBRTtBQUM1RCxrQkFBTSxPQUFPLE1BQU0sR0FBRyxLQUFLLEVBQUU7QUFBQSxjQUMzQixDQUFDLEVBQUUsTUFBTSxNQUFNLE1BQU07QUFBRSw0QkFBWSxNQUFNLEtBQUs7QUFBRyx3QkFBUSxLQUFLO0FBQUEsY0FBRTtBQUFBLGNBQ2hFLFFBQU0sU0FBUSxLQUFLLEVBQUU7QUFBQSxZQUFDO0FBQ3hCLGlCQUFLO0FBQUEsVUFDUCxNQUNLLGFBQVksTUFBTSxDQUFDO0FBQUEsUUFDMUI7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLO0FBQUE7QUFBQTtBQUFBLFFBR0gsY0FBYztBQUFBLFFBQ2QsWUFBWTtBQUFBLFFBQ1osS0FBSztBQUFBLFFBQ0wsTUFBbUI7QUFFakIsZ0JBQU0sVUFBVSxJQUFJLE1BQU8sTUFBSTtBQUFBLFVBQUMsR0FBNEQ7QUFBQSxZQUMxRixNQUFNLFFBQVEsU0FBUyxNQUFNO0FBQzNCLGtCQUFJO0FBQ0YsdUJBQU8sUUFBUSxZQUFZLFdBQVcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJO0FBQUEsY0FDL0QsU0FBUyxJQUFJO0FBQ1gsc0JBQU0sSUFBSSxNQUFNLGFBQWEsT0FBTyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsRUFBRSxPQUFPLEdBQUcsQ0FBQztBQUFBLGNBQzVGO0FBQUEsWUFDRjtBQUFBLFlBQ0EsV0FBVztBQUFBLFlBQ1gsZ0JBQWdCO0FBQUEsWUFDaEIsZ0JBQWdCO0FBQUEsWUFDaEIsS0FBSztBQUFBLFlBQ0wsZ0JBQWdCO0FBQUEsWUFDaEIsaUJBQWlCO0FBQUUscUJBQU87QUFBQSxZQUFLO0FBQUEsWUFDL0IsZUFBZTtBQUFFLHFCQUFPO0FBQUEsWUFBTTtBQUFBLFlBQzlCLG9CQUFvQjtBQUFFLHFCQUFPO0FBQUEsWUFBSztBQUFBLFlBQ2xDLHlCQUF5QixRQUFRLEdBQUc7QUFDbEMsa0JBQUksS0FBSyxJQUFLLFFBQVEsR0FBRyxJQUFJO0FBQzNCLHVCQUFPLFFBQVEseUJBQXlCLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFBQSxZQUM3RDtBQUFBLFlBQ0EsSUFBSSxRQUFRLEdBQUc7QUFDYixvQkFBTSxJQUFJLEtBQUssSUFBSyxRQUFRLEdBQUcsSUFBSTtBQUNuQyxxQkFBTyxRQUFRLENBQUM7QUFBQSxZQUNsQjtBQUFBLFlBQ0EsU0FBUyxDQUFDLFdBQVc7QUFDbkIsb0JBQU0sTUFBTSxDQUFDLEdBQUcsS0FBSyxpQkFBaUIsTUFBTSxDQUFDLEVBQUUsSUFBSSxPQUFLLEVBQUUsRUFBRTtBQUM1RCxvQkFBTUMsVUFBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUMvQixrQkFBSSxTQUFTLElBQUksV0FBV0EsUUFBTztBQUNqQyx5QkFBUSxJQUFJLHFEQUFxREEsT0FBTTtBQUN6RSxxQkFBT0E7QUFBQSxZQUNUO0FBQUEsWUFDQSxLQUFLLENBQUMsUUFBUSxHQUFHLGFBQWE7QUFDNUIsa0JBQUksT0FBTyxNQUFNLFVBQVU7QUFDekIsc0JBQU0sS0FBSyxPQUFPLENBQUM7QUFFbkIsb0JBQUksTUFBTSxRQUFRO0FBRWhCLHdCQUFNLE1BQU0sT0FBTyxFQUFFLEVBQUUsTUFBTTtBQUM3QixzQkFBSSxPQUFPLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxHQUFHO0FBQzFDLDJCQUFPO0FBQ1QseUJBQU8sT0FBTyxFQUFFO0FBQUEsZ0JBQ2xCO0FBQ0Esb0JBQUk7QUFDSixvQkFBSSxPQUFPO0FBQ1Qsd0JBQU0sS0FBSyxLQUFLLGlCQUFpQixNQUFNLElBQUksT0FBTyxDQUFDLENBQUM7QUFDcEQsc0JBQUksR0FBRyxTQUFTLEdBQUc7QUFDakIsd0JBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFHO0FBQ2xCLDZCQUFPLElBQUksQ0FBQztBQUNaLCtCQUFRO0FBQUEsd0JBQUksMkRBQTJELENBQUM7QUFBQTtBQUFBLHNCQUE4QjtBQUFBLG9CQUN4RztBQUFBLGtCQUNGO0FBQ0Esc0JBQUksR0FBRyxDQUFDO0FBQUEsZ0JBQ1YsT0FBTztBQUNMLHNCQUFJLEtBQUssY0FBYyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSztBQUFBLGdCQUNqRDtBQUNBLG9CQUFJO0FBQ0YsMEJBQVEsSUFBSSxRQUFRLElBQUksSUFBSSxRQUFRLENBQUMsR0FBRyxNQUFNO0FBQ2hELHVCQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGLENBQUM7QUFFRCxpQkFBTyxlQUFlLE1BQU0sT0FBTztBQUFBLFlBQ2pDLGNBQWM7QUFBQSxZQUNkLFlBQVk7QUFBQSxZQUNaLEtBQUs7QUFBQSxZQUNMLE1BQU07QUFBRSxxQkFBTztBQUFBLFlBQVE7QUFBQSxVQUN6QixDQUFDO0FBR0QsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsTUFBSTtBQUNGLGVBQVcsZUFBZSxnQkFBZ0I7QUFFNUMsWUFBVSxTQUFTLFdBQW9FO0FBQ3JGLGFBQVMsYUFBYSxHQUFjO0FBQ2xDLGFBQVEsTUFBTSxVQUFhLE1BQU0sUUFBUSxNQUFNO0FBQUEsSUFDakQ7QUFFQSxlQUFXLEtBQUssV0FBVztBQUN6QixVQUFJLGFBQWEsQ0FBQztBQUNoQjtBQUVGLFVBQUksY0FBYyxDQUFDLEdBQUc7QUFDcEIsWUFBSSxJQUFJLG9CQUFvQjtBQUM1QixVQUFFLEtBQUssaUJBQWU7QUFDcEIsWUFBRSxZQUFZLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFFbkMsY0FBSTtBQUFBLFFBQ04sQ0FBQztBQUNELGNBQU07QUFDTjtBQUFBLE1BQ0Y7QUFFQSxVQUFJLGFBQWEsTUFBTTtBQUNyQixjQUFNO0FBQ047QUFBQSxNQUNGO0FBT0EsVUFBSSxLQUFLLE9BQU8sTUFBTSxZQUFZLE9BQU8sWUFBWSxLQUFLLEVBQUUsT0FBTyxpQkFBaUIsTUFBTSxFQUFFLE9BQU8sUUFBUSxHQUFHO0FBQzVHLG1CQUFXLE1BQU07QUFDZixpQkFBTyxNQUFNLEVBQUU7QUFDakI7QUFBQSxNQUNGO0FBRUEsVUFBSSxZQUF1QixDQUFDLEdBQUc7QUFDN0IsY0FBTSxpQkFBaUIsUUFBUyxPQUFPLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxZQUFZLGFBQWEsSUFBSztBQUNoRyxZQUFJLEtBQUssZ0JBQWdCLENBQUMsSUFBSSxJQUFJLEVBQUUsT0FBTyxhQUFhLEVBQUU7QUFDMUQsWUFBSSxnQkFBZ0I7QUFFcEIsY0FBTSxrQkFBa0IsQ0FBQyxRQUFpQixVQUFVO0FBQ2xELGNBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtBQUN0QixtQkFBTztBQUNULGNBQUksU0FBUyxZQUFZLE1BQU0sTUFBTSxPQUFLLGFBQWEsSUFBSSxDQUFDLENBQUMsR0FBRztBQUU5RCx3QkFBWSxPQUFPLFFBQVEsT0FBSyxhQUFhLElBQUksQ0FBQyxDQUFDO0FBQ25ELGtCQUFNLE1BQU0scURBQ1IsWUFBWSxNQUFNLElBQUksT0FBTyxFQUFFLEtBQUssSUFBSSxJQUN4QztBQUVKLHdCQUFZLFFBQVE7QUFDcEIsZUFBRyxTQUFTLElBQUksTUFBTSxHQUFHLENBQUM7QUFFMUIsaUJBQUs7QUFDTCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFHQSxjQUFNLFVBQVUsRUFBRSxRQUFRO0FBQzFCLGNBQU0sY0FBYztBQUFBLFVBQ2xCLE9BQVMsWUFBWSxLQUFLLGFBQWEsQ0FBQyxJQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUM7QUFBQSxVQUN6RixDQUFDLE9BQU8sUUFBUSxJQUFJO0FBQ2xCLG1CQUFPLEtBQUssUUFBUSxPQUFPLFFBQVEsRUFBRSxLQUFNLEVBQUUsT0FBTztBQUFFLHFCQUFPLEVBQUUsTUFBTSxNQUFlLE9BQU8sT0FBVTtBQUFBLFlBQUUsRUFBRTtBQUFBLFVBQzNHO0FBQUEsUUFDRjtBQUNBLHFCQUFhLFVBQVUsWUFBWSxPQUFPLFNBQVEsZUFBZTtBQUdqRSxjQUFNLGlCQUFpQixTQUNsQixNQUFNO0FBQ1AsZ0JBQU0sWUFBWSxLQUFLLElBQUksSUFBSTtBQUMvQixnQkFBTSxZQUFZLElBQUksTUFBTSxZQUFZLEVBQUU7QUFDMUMsY0FBSSxJQUFJLE1BQU07QUFDWixnQkFBSSxpQkFBaUIsYUFBYSxZQUFZLEtBQUssSUFBSSxHQUFHO0FBQ3hELGtCQUFJLE1BQU07QUFBQSxjQUFFO0FBQ1osdUJBQVEsS0FBSyxtQ0FBbUMsY0FBYyxHQUFJLG1EQUFtRCxXQUFXLFlBQVksT0FBTyxJQUFJLE9BQU8sQ0FBQztBQUFBLFlBQ2pLO0FBQUEsVUFDRjtBQUNBLGlCQUFPO0FBQUEsUUFDVCxHQUFHLElBQ0Q7QUFFSixTQUFDLFNBQVMsT0FBTztBQUNmLGFBQUcsS0FBSyxFQUFFLEtBQUssUUFBTTtBQUNuQixnQkFBSSxDQUFDLEdBQUcsTUFBTTtBQUNaLGtCQUFJLENBQUMsWUFBWSxPQUFPO0FBQ3RCLG9CQUFJLFFBQVEsSUFBSSxNQUFNLG9CQUFvQixDQUFDO0FBQzNDO0FBQUEsY0FDRjtBQUNBLG9CQUFNLFVBQVUsWUFBWSxNQUFNLE9BQU8sT0FBSyxFQUFFLFdBQVc7QUFDM0Qsb0JBQU0sSUFBSSxnQkFBZ0IsWUFBWSxRQUFRO0FBQzlDLGtCQUFJLGlCQUFpQixRQUFRLE9BQVEsaUJBQWdCO0FBRXJELGtCQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxNQUFNLEdBQUc7QUFDL0IsaUNBQWlCO0FBQ2pCLDZCQUFhLFVBQVUsWUFBWSxPQUFPLE9BQU87QUFFakQsNEJBQVksUUFBUSxDQUFDLEdBQUcsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDOUMsNkJBQWEsVUFBVSxZQUFZLE9BQU8sU0FBUSxlQUFlO0FBRWpFLHlCQUFTLElBQUUsR0FBRyxJQUFFLEVBQUUsUUFBUSxLQUFLO0FBQzdCLHNCQUFJLE1BQUk7QUFDTixzQkFBRSxDQUFDLEVBQUUsWUFBWSxHQUFHLFlBQVksS0FBSztBQUFBLDJCQUM5QixDQUFDLFlBQVksTUFBTSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLHNCQUFFLENBQUMsRUFBRSxPQUFPO0FBQ2QsK0JBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUFBLGdCQUN2QjtBQUVBLHFCQUFLO0FBQUEsY0FDUDtBQUFBLFlBQ0Y7QUFBQSxVQUNGLENBQUMsRUFBRSxNQUFNLENBQUMsZUFBb0I7QUFDNUIsa0JBQU0sSUFBSSxZQUFZLE9BQU8sT0FBTyxDQUFBQyxPQUFLLFFBQVFBLElBQUcsVUFBVSxDQUFDO0FBQy9ELHdCQUFZLE9BQU8sUUFBUSxPQUFLLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFDbkQsZ0JBQUksR0FBRyxRQUFRO0FBQ2IsZ0JBQUUsQ0FBQyxFQUFFLFlBQVksbUJBQW1CLEVBQUUsT0FBTyxXQUFXLENBQUMsQ0FBQztBQUMxRCxnQkFBRSxNQUFNLENBQUMsRUFBRSxRQUFRLE9BQUssR0FBRyxPQUFPLENBQUM7QUFBQSxZQUNyQyxNQUNLLFVBQVEsS0FBSyxzQkFBc0IsWUFBWSxZQUFZLE9BQU8sSUFBSSxPQUFPLENBQUM7QUFDbkYsZ0JBQUksWUFBWSxNQUFPLGNBQWEsVUFBVSxZQUFZLE9BQU8sT0FBTztBQUV4RSx3QkFBWSxRQUFRO0FBQ3BCLGVBQUcsU0FBUyxVQUFVO0FBRXRCLGlCQUFLO0FBQUEsVUFDUCxDQUFDO0FBQUEsUUFDSCxHQUFHO0FBRUgsWUFBSSxZQUFZLE1BQU8sUUFBTztBQUM5QjtBQUFBLE1BQ0Y7QUFFQSxZQUFNLFFBQVEsZUFBZSxFQUFFLFNBQVMsQ0FBQztBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxXQUFXO0FBQ2QsV0FBTyxPQUFPLEtBQUs7QUFBQSxNQUNqQjtBQUFBO0FBQUEsTUFDQTtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFHQSxRQUFNLHVCQUF1QixPQUFPLGVBQWUsQ0FBQyxDQUFDO0FBRXJELFdBQVMsV0FBVyxHQUEwQyxHQUFRLGFBQTBCO0FBQzlGLFFBQUksTUFBTSxRQUFRLE1BQU0sVUFBYSxPQUFPLE1BQU0sWUFBWSxNQUFNO0FBQ2xFO0FBRUYsZUFBVyxDQUFDLEdBQUcsT0FBTyxLQUFLLE9BQU8sUUFBUSxPQUFPLDBCQUEwQixDQUFDLENBQUMsR0FBRztBQUM5RSxVQUFJO0FBQ0YsWUFBSSxXQUFXLFNBQVM7QUFDdEIsZ0JBQU0sUUFBUSxRQUFRO0FBRXRCLGNBQUksU0FBUyxZQUFxQixLQUFLLEdBQUc7QUFDeEMsbUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLFVBQ3JDLE9BQU87QUFHTCxnQkFBSSxTQUFTLE9BQU8sVUFBVSxZQUFZLENBQUMsY0FBYyxLQUFLLEdBQUc7QUFDL0Qsa0JBQUksRUFBRSxLQUFLLElBQUk7QUFNYixvQkFBSSxhQUFhO0FBQ2Ysc0JBQUksT0FBTyxlQUFlLEtBQUssTUFBTSx3QkFBd0IsQ0FBQyxPQUFPLGVBQWUsS0FBSyxHQUFHO0FBRTFGLCtCQUFXLFFBQVEsUUFBUSxDQUFDLEdBQUcsS0FBSztBQUFBLGtCQUN0QyxXQUFXLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFFL0IsK0JBQVcsUUFBUSxRQUFRLENBQUMsR0FBRyxLQUFLO0FBQUEsa0JBQ3RDLE9BQU87QUFFTCw2QkFBUSxLQUFLLHFCQUFxQixDQUFDLDZHQUE2RyxHQUFHLEtBQUs7QUFBQSxrQkFDMUo7QUFBQSxnQkFDRjtBQUNBLHVCQUFPLGVBQWUsR0FBRyxHQUFHLE9BQU87QUFBQSxjQUNyQyxPQUFPO0FBQ0wsb0JBQUksaUJBQWlCLE1BQU07QUFDekIsMkJBQVEsS0FBSyxxTUFBcU0sQ0FBQyxZQUFZLFFBQVEsS0FBSyxDQUFDLGlCQUFpQixhQUFhLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xTLG9CQUFFLENBQUMsSUFBSTtBQUFBLGdCQUNULE9BQU87QUFDTCxzQkFBSSxFQUFFLENBQUMsTUFBTSxPQUFPO0FBSWxCLHdCQUFJLE1BQU0sUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFdBQVcsTUFBTSxRQUFRO0FBQ3ZELDBCQUFJLE1BQU0sZ0JBQWdCLFVBQVUsTUFBTSxnQkFBZ0IsT0FBTztBQUMvRCxtQ0FBVyxFQUFFLENBQUMsSUFBSSxJQUFLLE1BQU0sZUFBYyxLQUFLO0FBQUEsc0JBQ2xELE9BQU87QUFFTCwwQkFBRSxDQUFDLElBQUk7QUFBQSxzQkFDVDtBQUFBLG9CQUNGLE9BQU87QUFFTCxpQ0FBVyxFQUFFLENBQUMsR0FBRyxLQUFLO0FBQUEsb0JBQ3hCO0FBQUEsa0JBQ0Y7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFBQSxZQUNGLE9BQU87QUFFTCxrQkFBSSxFQUFFLENBQUMsTUFBTTtBQUNYLGtCQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFBQSxZQUNkO0FBQUEsVUFDRjtBQUFBLFFBQ0YsT0FBTztBQUVMLGlCQUFPLGVBQWUsR0FBRyxHQUFHLE9BQU87QUFBQSxRQUNyQztBQUFBLE1BQ0YsU0FBUyxJQUFhO0FBQ3BCLGlCQUFRLEtBQUssY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUU7QUFDdEMsY0FBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFdBQVMsTUFBUyxHQUFTO0FBQ3pCLFVBQU0sSUFBSSxHQUFHLFFBQVE7QUFDckIsV0FBUSxNQUFNLFFBQVEsQ0FBQyxJQUFJLE1BQU0sVUFBVSxJQUFJLEtBQUssR0FBRyxLQUFLLElBQUk7QUFBQSxFQUNsRTtBQUVBLFdBQVMsWUFBWSxNQUFZLE9BQTRCO0FBRTNELFFBQUksRUFBRSxtQkFBbUIsUUFBUTtBQUMvQixPQUFDLFNBQVMsT0FBTyxHQUFRLEdBQWM7QUFDckMsWUFBSSxNQUFNLFFBQVEsTUFBTSxVQUFhLE9BQU8sTUFBTTtBQUNoRDtBQUVGLGNBQU0sZ0JBQWdCLE9BQU8sUUFBUSxPQUFPLDBCQUEwQixDQUFDLENBQUM7QUFDeEUsWUFBSSxDQUFDLE1BQU0sUUFBUSxDQUFDLEdBQUc7QUFDckIsd0JBQWMsS0FBSyxPQUFLO0FBQ3RCLGtCQUFNLE9BQU8sT0FBTyx5QkFBeUIsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNwRCxnQkFBSSxNQUFNO0FBQ1Isa0JBQUksV0FBVyxLQUFNLFFBQU87QUFDNUIsa0JBQUksU0FBUyxLQUFNLFFBQU87QUFDMUIsa0JBQUksU0FBUyxLQUFNLFFBQU87QUFBQSxZQUM1QjtBQUNBLG1CQUFPO0FBQUEsVUFDVCxDQUFDO0FBQUEsUUFDSDtBQUNBLG1CQUFXLENBQUMsR0FBRyxPQUFPLEtBQUssZUFBZTtBQUN4QyxjQUFJO0FBQ0YsZ0JBQUksV0FBVyxTQUFTO0FBQ3RCLG9CQUFNLFFBQVEsUUFBUTtBQUN0QixrQkFBSSxZQUFxQixLQUFLLEdBQUc7QUFDL0IsK0JBQWUsT0FBTyxDQUFDO0FBQUEsY0FDekIsV0FBVyxjQUFjLEtBQUssR0FBRztBQUMvQixzQkFBTSxLQUFLLE9BQUs7QUFDZCxzQkFBSSxLQUFLLE9BQU8sTUFBTSxVQUFVO0FBRTlCLHdCQUFJLFlBQXFCLENBQUMsR0FBRztBQUMzQixxQ0FBZSxHQUFHLENBQUM7QUFBQSxvQkFDckIsT0FBTztBQUNMLG1DQUFhLEdBQUcsQ0FBQztBQUFBLG9CQUNuQjtBQUFBLGtCQUNGLE9BQU87QUFDTCx3QkFBSSxFQUFFLENBQUMsTUFBTTtBQUNYLHdCQUFFLENBQUMsSUFBSTtBQUFBLGtCQUNYO0FBQUEsZ0JBQ0YsR0FBRyxXQUFTLFNBQVEsSUFBSSwyQkFBMkIsS0FBSyxDQUFDO0FBQUEsY0FDM0QsV0FBVyxDQUFDLFlBQXFCLEtBQUssR0FBRztBQUV2QyxvQkFBSSxTQUFTLE9BQU8sVUFBVSxZQUFZLENBQUMsY0FBYyxLQUFLO0FBQzVELCtCQUFhLE9BQU8sQ0FBQztBQUFBLHFCQUNsQjtBQUNILHNCQUFJLEVBQUUsQ0FBQyxNQUFNO0FBQ1gsc0JBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUFBLGdCQUNkO0FBQUEsY0FDRjtBQUFBLFlBQ0YsT0FBTztBQUVMLHFCQUFPLGVBQWUsR0FBRyxHQUFHLE9BQU87QUFBQSxZQUNyQztBQUFBLFVBQ0YsU0FBUyxJQUFhO0FBQ3BCLHFCQUFRLEtBQUssZUFBZSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUU7QUFDdkMsa0JBQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUVBLGlCQUFTLGVBQWUsT0FBd0UsR0FBVztBQUN6RyxnQkFBTSxLQUFLLGNBQWMsS0FBSztBQUM5QixjQUFJLGdCQUFnQjtBQUVwQixjQUFJLFlBQVksS0FBSyxJQUFJLElBQUk7QUFDN0IsZ0JBQU0sWUFBWSxTQUFTLElBQUksTUFBTSxZQUFZLEVBQUU7QUFFbkQsZ0JBQU0sU0FBUyxDQUFDLE9BQWdDO0FBQzlDLGdCQUFJLENBQUMsR0FBRyxNQUFNO0FBQ1osb0JBQU1DLFNBQVEsTUFBTSxHQUFHLEtBQUs7QUFDNUIsa0JBQUksT0FBT0EsV0FBVSxZQUFZQSxXQUFVLE1BQU07QUFhL0Msc0JBQU0sV0FBVyxPQUFPLHlCQUF5QixHQUFHLENBQUM7QUFDckQsb0JBQUksTUFBTSxXQUFXLENBQUMsVUFBVTtBQUM5Qix5QkFBTyxFQUFFLENBQUMsR0FBR0EsTUFBSztBQUFBO0FBRWxCLG9CQUFFLENBQUMsSUFBSUE7QUFBQSxjQUNYLE9BQU87QUFFTCxvQkFBSUEsV0FBVTtBQUNaLG9CQUFFLENBQUMsSUFBSUE7QUFBQSxjQUNYO0FBQ0Esb0JBQU0sVUFBVSxLQUFLO0FBRXJCLGtCQUFJLGFBQWEsSUFBSSxJQUFJLEtBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFVO0FBQzFELHlCQUFRLEtBQUssb0VBQW9FLENBQUM7QUFBQSxFQUFVLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDM0csbUJBQUcsU0FBUztBQUNaO0FBQUEsY0FDRjtBQUNBLGtCQUFJLFFBQVMsaUJBQWdCO0FBQzdCLGtCQUFJLGlCQUFpQixhQUFhLFlBQVksS0FBSyxJQUFJLEdBQUc7QUFDeEQsNEJBQVksT0FBTztBQUNuQix5QkFBUSxLQUFLLGlDQUFpQyxDQUFDLHVCQUF1QixjQUFZLEdBQUk7QUFBQSxvQkFBc0UsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUFLLFNBQVMsRUFBRTtBQUFBLGNBQzNMO0FBRUEsaUJBQUcsS0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLE1BQU0sS0FBSztBQUFBLFlBQ3BDO0FBQUEsVUFDRjtBQUNBLGdCQUFNLFFBQVEsQ0FBQyxlQUFxQjtBQUNsQyxlQUFHLFNBQVMsVUFBVTtBQUN0QixnQkFBSSxZQUFZO0FBQ2QsdUJBQVEsS0FBSyxrQ0FBa0MsWUFBWSxHQUFHLEdBQUcsV0FBVyxRQUFRLElBQUksQ0FBQztBQUN6RixtQkFBSyxZQUFZLG1CQUFtQixFQUFFLE9BQU8sV0FBVyxDQUFDLENBQUM7QUFBQSxZQUM1RDtBQUFBLFVBQ0Y7QUFDQSxnQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUM5QixjQUFJLFlBQVksVUFBYSxZQUFZLFNBQVMsQ0FBQyxZQUFZLE9BQU87QUFDcEUsbUJBQU8sRUFBRSxNQUFNLE9BQU8sT0FBTyxRQUFRLENBQUM7QUFBQTtBQUV0QyxlQUFHLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFDcEMsdUJBQWEsVUFBVSxDQUFDLElBQUksR0FBRyxrQkFBa0IsS0FBSztBQUFBLFFBQ3hEO0FBRUEsaUJBQVMsYUFBYSxPQUFZLEdBQVc7QUFDM0MsY0FBSSxpQkFBaUIsTUFBTTtBQUN6QixxQkFBUSxLQUFLLHFNQUFxTSxDQUFDLFlBQVksUUFBUSxLQUFLLENBQUMsaUJBQWlCLGdCQUFnQixPQUFPLFFBQVEsSUFBSSxJQUFJLElBQUksRUFBRTtBQUMzUyxjQUFFLENBQUMsSUFBSTtBQUFBLFVBQ1QsT0FBTztBQUlMLGdCQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUUsQ0FBQyxNQUFNLFNBQVUsTUFBTSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxNQUFNLFFBQVM7QUFDeEYsa0JBQUksTUFBTSxnQkFBZ0IsVUFBVSxNQUFNLGdCQUFnQixPQUFPO0FBQy9ELHNCQUFNLE9BQU8sSUFBSyxNQUFNO0FBQ3hCLHVCQUFPLE1BQU0sS0FBSztBQUNsQixrQkFBRSxDQUFDLElBQUk7QUFBQSxjQUVULE9BQU87QUFFTCxrQkFBRSxDQUFDLElBQUk7QUFBQSxjQUNUO0FBQUEsWUFDRixPQUFPO0FBQ0wsa0JBQUksT0FBTyx5QkFBeUIsR0FBRyxDQUFDLEdBQUc7QUFDekMsa0JBQUUsQ0FBQyxJQUFJO0FBQUE7QUFFUCx1QkFBTyxFQUFFLENBQUMsR0FBRyxLQUFLO0FBQUEsWUFDdEI7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0YsR0FBRyxNQUFNLEtBQUs7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFXQSxXQUFTLGVBQWdELEdBQVE7QUFDL0QsYUFBUyxJQUFJLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxPQUFPO0FBQzFDLFVBQUksTUFBTTtBQUNSLGVBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLFNBQW9DLFlBQThEO0FBQ3pHLFVBQU0scUJBQXNCLE9BQU8sZUFBZSxhQUM5QyxDQUFDLGFBQXVCLE9BQU8sT0FBTyxDQUFDLEdBQUcsWUFBWSxRQUFRLElBQzlEO0FBRUosVUFBTSxjQUFjLEtBQUssSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLFdBQVcsU0FBUyxFQUFFLElBQUksS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDO0FBQzNHLFFBQUksbUJBQThCLG1CQUFtQixFQUFFLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztBQUVoRixRQUFJLGlCQUFpQixRQUFRO0FBQzNCLDRCQUFzQixZQUFZLFFBQVEsZUFBZSxpQkFBaUIsU0FBUyxJQUFJLENBQUM7QUFBQSxJQUkxRjtBQUtBLFVBQU0sY0FBaUMsQ0FBQyxVQUFVLGFBQWE7QUFDN0QsWUFBTSxVQUFVLFdBQVcsS0FBSztBQUNoQyxZQUFNLGVBQTRDLENBQUM7QUFDbkQsWUFBTSxnQkFBZ0IsRUFBRSxDQUFDLGVBQWUsSUFBSSxVQUFVLGVBQWUsTUFBTSxlQUFlLE1BQU0sYUFBYTtBQUM3RyxZQUFNLElBQUksVUFBVSxLQUFLLGVBQWUsT0FBTyxHQUFHLFFBQVEsSUFBSSxLQUFLLGVBQWUsR0FBRyxRQUFRO0FBQzdGLFFBQUUsY0FBYztBQUNoQixZQUFNLGdCQUFnQixtQkFBbUIsRUFBRSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7QUFDcEUsb0JBQWMsZUFBZSxFQUFFLEtBQUssYUFBYTtBQUNqRCxVQUFJLE9BQU87QUFFVCxZQUFTQyxlQUFULFNBQXFCLFNBQThCLEdBQVc7QUFDNUQsbUJBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxFQUFFO0FBQzdCLGdCQUFJLEVBQUUsWUFBWSxXQUFXLEtBQUssRUFBRSxXQUFXLFFBQVMsUUFBTztBQUNqRSxpQkFBTztBQUFBLFFBQ1Q7QUFKUywwQkFBQUE7QUFLVCxZQUFJLGNBQWMsU0FBUztBQUN6QixnQkFBTSxRQUFRLE9BQU8sS0FBSyxjQUFjLE9BQU8sRUFBRSxPQUFPLE9BQU0sS0FBSyxLQUFNQSxhQUFZLE1BQU0sQ0FBQyxDQUFDO0FBQzdGLGNBQUksTUFBTSxRQUFRO0FBQ2hCLHFCQUFRLElBQUksa0JBQWtCLEtBQUssUUFBUSxVQUFVLElBQUksMkJBQTJCLEtBQUssUUFBUSxDQUFDLEdBQUc7QUFBQSxVQUN2RztBQUFBLFFBQ0Y7QUFDQSxZQUFJLGNBQWMsVUFBVTtBQUMxQixnQkFBTSxRQUFRLE9BQU8sS0FBSyxjQUFjLFFBQVEsRUFBRSxPQUFPLE9BQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxvQkFBb0IsS0FBSyxxQkFBcUIsQ0FBQ0EsYUFBWSxNQUFNLENBQUMsQ0FBQztBQUNoSixjQUFJLE1BQU0sUUFBUTtBQUNoQixxQkFBUSxJQUFJLG9CQUFvQixLQUFLLFFBQVEsVUFBVSxJQUFJLDBCQUEwQixLQUFLLFFBQVEsQ0FBQyxHQUFHO0FBQUEsVUFDeEc7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLGlCQUFXLEdBQUcsY0FBYyxTQUFTLElBQUk7QUFDekMsaUJBQVcsR0FBRyxjQUFjLFFBQVE7QUFDcEMsWUFBTSxXQUFXLG9CQUFJLElBQVk7QUFDakMsb0JBQWMsWUFBWSxPQUFPLEtBQUssY0FBYyxRQUFRLEVBQUUsUUFBUSxPQUFLO0FBQ3pFLFlBQUksS0FBSyxHQUFHO0FBQ1YsbUJBQVEsSUFBSSxvREFBb0QsQ0FBQyxzQ0FBc0M7QUFDdkcsbUJBQVMsSUFBSSxDQUFDO0FBQUEsUUFDaEIsT0FBTztBQUNMLGlDQUF1QixHQUFHLEdBQUcsY0FBYyxTQUFVLENBQXdDLENBQUM7QUFBQSxRQUNoRztBQUFBLE1BQ0YsQ0FBQztBQUNELFVBQUksY0FBYyxlQUFlLE1BQU0sY0FBYztBQUNuRCxZQUFJLENBQUM7QUFDSCxzQkFBWSxHQUFHLEtBQUs7QUFDdEIsbUJBQVcsUUFBUSxjQUFjO0FBQy9CLGdCQUFNQyxZQUFXLE1BQU0sYUFBYSxLQUFLLENBQUM7QUFDMUMsY0FBSSxXQUFXQSxTQUFRO0FBQ3JCLGNBQUUsT0FBTyxHQUFHLE1BQU1BLFNBQVEsQ0FBQztBQUFBLFFBQy9CO0FBSUEsY0FBTSxnQ0FBZ0MsQ0FBQztBQUN2QyxZQUFJLG1CQUFtQjtBQUN2QixtQkFBVyxRQUFRLGNBQWM7QUFDL0IsY0FBSSxLQUFLLFNBQVUsWUFBVyxLQUFLLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBRztBQUU3RCxrQkFBTSxhQUFhLENBQUMsV0FBVyxLQUFLO0FBQ3BDLGdCQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssY0FBZSxFQUFFLGVBQWUsQ0FBQyxjQUFjLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLE1BQU0sQ0FBQyxDQUFDLEtBQUs7QUFDNUcsb0JBQU0sUUFBUSxFQUFFLENBQW1CLEdBQUcsUUFBUTtBQUM5QyxrQkFBSSxVQUFVLFFBQVc7QUFFdkIsOENBQThCLENBQUMsSUFBSTtBQUNuQyxtQ0FBbUI7QUFBQSxjQUNyQjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUNBLFlBQUk7QUFDRixpQkFBTyxPQUFPLEdBQUcsNkJBQTZCO0FBQUEsTUFDbEQ7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUVBLFVBQU0sWUFBdUMsT0FBTyxPQUFPLGFBQWE7QUFBQSxNQUN0RSxPQUFPO0FBQUEsTUFDUCxZQUFZLE9BQU8sT0FBTyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7QUFBQSxNQUN2RTtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ2IsY0FBTSxPQUFPLENBQUMsR0FBRyxPQUFPLEtBQUssaUJBQWlCLFdBQVcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEtBQUssaUJBQWlCLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDN0csZUFBTyxHQUFHLFVBQVUsSUFBSSxNQUFNLEtBQUssS0FBSyxJQUFJLENBQUM7QUFBQSxVQUFjLEtBQUssUUFBUSxDQUFDO0FBQUEsTUFDM0U7QUFBQSxJQUNGLENBQUM7QUFDRCxXQUFPLGVBQWUsV0FBVyxPQUFPLGFBQWE7QUFBQSxNQUNuRCxPQUFPO0FBQUEsTUFDUCxVQUFVO0FBQUEsTUFDVixjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUVELFVBQU0sWUFBWSxDQUFDO0FBQ25CLEtBQUMsU0FBUyxVQUFVLFNBQThCO0FBQ2hELFVBQUksU0FBUztBQUNYLGtCQUFVLFFBQVEsS0FBSztBQUV6QixZQUFNLFFBQVEsUUFBUTtBQUN0QixVQUFJLE9BQU87QUFDVCxtQkFBVyxXQUFXLE9BQU8sUUFBUTtBQUNyQyxtQkFBVyxXQUFXLE9BQU8sT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRixHQUFHLElBQUk7QUFDUCxlQUFXLFdBQVcsaUJBQWlCLFFBQVE7QUFDL0MsZUFBVyxXQUFXLGlCQUFpQixPQUFPO0FBQzlDLFdBQU8saUJBQWlCLFdBQVcsT0FBTywwQkFBMEIsU0FBUyxDQUFDO0FBRzlFLFVBQU0sY0FBYyxhQUNmLGVBQWUsYUFDZixPQUFPLFVBQVUsY0FBYyxXQUNoQyxVQUFVLFlBQ1Y7QUFDSixVQUFNLFdBQVcsUUFBUyxJQUFJLE1BQU0sRUFBRSxPQUFPLE1BQU0sSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFNO0FBRXJFLFdBQU8sZUFBZSxXQUFXLFFBQVE7QUFBQSxNQUN2QyxPQUFPLFNBQVMsWUFBWSxRQUFRLFFBQVEsR0FBRyxJQUFJLFdBQVc7QUFBQSxJQUNoRSxDQUFDO0FBRUQsUUFBSSxPQUFPO0FBQ1QsWUFBTSxvQkFBb0IsT0FBTyxLQUFLLGdCQUFnQixFQUFFLE9BQU8sT0FBSyxDQUFDLENBQUMsVUFBVSxPQUFPLGVBQWUsV0FBVyxZQUFZLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNwSixVQUFJLGtCQUFrQixRQUFRO0FBQzVCLGlCQUFRLElBQUksR0FBRyxVQUFVLElBQUksNkJBQTZCLGlCQUFpQixzQkFBc0I7QUFBQSxNQUNuRztBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sa0JBSUY7QUFBQSxJQUNGLGNBQ0UsTUFDQSxVQUNHLFVBQTZCO0FBQ2hDLGFBQVEsU0FBUyxnQkFBZ0IsZ0JBQWdCLE1BQU0sR0FBRyxRQUFRLElBQzlELE9BQU8sU0FBUyxhQUFhLEtBQUssT0FBTyxRQUFRLElBQ2pELE9BQU8sU0FBUyxZQUFZLFFBQVE7QUFBQTtBQUFBLFFBRWxDLGdCQUFnQixJQUFJLEVBQUUsT0FBTyxRQUFRO0FBQUEsVUFDdkMsZ0JBQWdCLE9BQU8sT0FDdkIsbUJBQW1CLEVBQUUsT0FBTyxJQUFJLE1BQU0sbUNBQW1DLElBQUksRUFBRSxDQUFDO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBSUEsV0FBUyxVQUFVLEdBQXFFO0FBQ3RGLFFBQUksZ0JBQWdCLENBQUM7QUFFbkIsYUFBTyxnQkFBZ0IsQ0FBQztBQUUxQixVQUFNLGFBQWEsQ0FBQyxVQUFpRSxhQUEwQjtBQUM3RyxVQUFJLFdBQVcsS0FBSyxHQUFHO0FBQ3JCLGlCQUFTLFFBQVEsS0FBSztBQUN0QixnQkFBUSxDQUFDO0FBQUEsTUFDWDtBQUdBLFVBQUksQ0FBQyxXQUFXLEtBQUssR0FBRztBQUN0QixZQUFJLE1BQU0sVUFBVTtBQUNsQjtBQUNBLGlCQUFPLE1BQU07QUFBQSxRQUNmO0FBR0EsY0FBTSxJQUFJLFlBQ04sUUFBUSxnQkFBZ0IsV0FBcUIsRUFBRSxZQUFZLENBQUMsSUFDNUQsUUFBUSxjQUFjLENBQUM7QUFDM0IsVUFBRSxjQUFjO0FBRWhCLG1CQUFXLEdBQUcsYUFBYTtBQUMzQixvQkFBWSxHQUFHLEtBQUs7QUFHcEIsVUFBRSxPQUFPLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM5QixlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFFQSxVQUFNLG9CQUFrRCxPQUFPLE9BQU8sWUFBWTtBQUFBLE1BQ2hGLE9BQU8sTUFBTTtBQUFFLGNBQU0sSUFBSSxNQUFNLG1GQUFtRjtBQUFBLE1BQUU7QUFBQSxNQUNwSDtBQUFBO0FBQUEsTUFDQSxVQUFVO0FBQUUsZUFBTyxnQkFBZ0IsYUFBYSxFQUFFLEdBQUcsWUFBWSxPQUFPLEVBQUUsR0FBRyxDQUFDO0FBQUEsTUFBSTtBQUFBLElBQ3BGLENBQUM7QUFFRCxXQUFPLGVBQWUsWUFBWSxPQUFPLGFBQWE7QUFBQSxNQUNwRCxPQUFPO0FBQUEsTUFDUCxVQUFVO0FBQUEsTUFDVixjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUVELFdBQU8sZUFBZSxZQUFZLFFBQVEsRUFBRSxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7QUFFbEUsV0FBTyxnQkFBZ0IsQ0FBQyxJQUFJO0FBQUEsRUFDOUI7QUFFQSxPQUFLLFFBQVEsU0FBUztBQUd0QixTQUFPO0FBQ1Q7QUFNQSxTQUFTLGdCQUFnQixNQUFZLHdCQUFrQztBQUNyRSxRQUFNLFVBQVUsb0JBQUksUUFBYztBQUNsQyxRQUFNLFdBQWlELG9CQUFJLFFBQVE7QUFDbkUsV0FBUyxLQUFLLE9BQWlCO0FBQzdCLGVBQVcsUUFBUSxPQUFPO0FBRXhCLFVBQUksQ0FBQyxLQUFLLGFBQWE7QUFDckIsZ0JBQVEsSUFBSSxJQUFJO0FBQ2hCLGFBQUssS0FBSyxVQUFVO0FBRXBCLGNBQU0sYUFBYSxTQUFTLElBQUksSUFBSTtBQUNwQyxZQUFJLFlBQVk7QUFDZCxtQkFBUyxPQUFPLElBQUk7QUFDcEIscUJBQVcsS0FBSyxZQUFZLE9BQU8sRUFBRyxHQUFFO0FBQUEsUUFDMUM7QUFFQSxZQUFJLDBCQUEwQixzQkFBc0IsUUFBUSxPQUFPLEtBQUsscUJBQXFCLFdBQVksTUFBSyxpQkFBaUI7QUFBQSxNQUNqSTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsTUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGNBQVUsUUFBUSxTQUFVLEdBQUc7QUFDN0IsVUFBSSxFQUFFLFNBQVMsZUFBZSxFQUFFLGFBQWE7QUFDM0MsYUFBSyxFQUFFLFlBQVk7QUFBQSxJQUN2QixDQUFDO0FBQUEsRUFDSCxDQUFDLEVBQUUsUUFBUSxNQUFNLEVBQUUsU0FBUyxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBRW5ELFNBQU87QUFBQSxJQUNMLElBQUksR0FBUTtBQUFFLGFBQU8sUUFBUSxJQUFJLENBQUM7QUFBQSxJQUFFO0FBQUEsSUFDcEMsSUFBSSxHQUFRO0FBQUUsYUFBTyxRQUFRLElBQUksQ0FBQztBQUFBLElBQUU7QUFBQSxJQUNwQyxVQUFVLEdBQVcsTUFBYyxTQUFvQjtBQUNyRCxVQUFJLFNBQVM7QUFDWCxVQUFFLFFBQVEsQ0FBQUMsT0FBSztBQUNiLGdCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQyxLQUFLLG9CQUFJLElBQXNCO0FBQ3pELG1CQUFTLElBQUlBLElBQUdDLElBQUc7QUFDbkIsVUFBQUEsS0FBSSxJQUFJLE1BQU0sT0FBTztBQUFBLFFBQ3ZCLENBQUM7QUFBQSxNQUNILE9BQ0s7QUFDSCxVQUFFLFFBQVEsQ0FBQUQsT0FBSztBQUNiLGdCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQztBQUMxQixjQUFJQyxNQUFLO0FBQ1AsWUFBQUEsS0FBSSxPQUFPLElBQUk7QUFDZixnQkFBSSxDQUFDQSxLQUFJO0FBQ1AsdUJBQVMsT0FBT0QsRUFBQztBQUFBLFVBQ3JCO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAibWVyZ2VkIiwgInIiLCAidW5pcXVlIiwgIm4iLCAidmFsdWUiLCAiaXNBbmNlc3RyYWwiLCAiY2hpbGRyZW4iLCAiZSIsICJtYXAiXQp9Cg==
