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
  _console.log("doneImmediately");
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
  const removedNodes = mutationTracker(thisDoc, "removedNodes", options?.enableOnRemovedFromDOM);
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
          removedNodes.add(g);
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
        const ap = isAsyncIterator(c) ? c : c[Symbol.asyncIterator]();
        const unboxed = c.valueOf();
        const replacement = {
          notYetMounted: true,
          nodes: unboxed === c || notViableTag(c) ? [DomPromiseContainer()] : [...nodes(unboxed)],
          [Symbol.iterator]() {
            return this.nodes ? this.nodes[Symbol.iterator]() : { next() {
              return { done: true, value: void 0 };
            } };
          }
          // get [Symbol.iterator]() { return this.nodes[Symbol.iterator].bind(this.nodes) }
          // get [Symbol.iterator]() {
          //   return () => this.nodes[Symbol.iterator]()
          // }
        };
        if (!replacement.nodes.length) debugger;
        const debugUnmounted = DEBUG ? (() => {
          const createdAt = Date.now() + timeOutWarn;
          const createdBy = new Error("Created by").stack;
          let f = () => {
            if (replacement.notYetMounted && createdAt && createdAt < Date.now()) {
              f = () => {
              };
              _console.warn(`Async element not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.`, createdBy, replacement.nodes.map(logNode));
            }
          };
          return f;
        })() : null;
        (function step() {
          ap.next().then((es) => {
            if (!es.done) {
              const mounted = replacement.nodes.filter((e) => (
                /*e?.parentNode && */
                e.isConnected
              ));
              const n = replacement.notYetMounted ? replacement.nodes : mounted;
              if (replacement.notYetMounted && mounted.length) replacement.notYetMounted = false;
              if (!n.length || replacement.nodes.every((e) => removedNodes.has(e))) {
                const msg = "Element(s) have been removed from the document: " + replacement.nodes.map(logNode).join("\n") + insertionStack;
                replacement.nodes = null;
                ap.return?.(new Error(msg));
                return;
              }
              debugUnmounted?.();
              replacement.nodes = [...nodes(unbox(es.value))];
              n[0].replaceWith(...replacement.nodes);
              n.forEach((e) => !replacement.nodes.includes(e) && e.parentNode?.removeChild(e));
              step();
            }
          }).catch((errorValue) => {
            const n = replacement.nodes.filter((n2) => Boolean(n2?.parentNode));
            if (n.length) {
              n[0].replaceWith(DyamicElementError({ error: errorValue }));
              n.slice(1).forEach((e) => e?.remove());
            } else _console.warn("Can't report error", errorValue, replacement.nodes.map(logNode));
            replacement.nodes = null;
            ap.return?.(errorValue);
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
            _console.warn("Dynamic attribute error", errorValue, k, d, createdBy, logNode(base));
            ap.return?.(errorValue);
            base.appendChild(DyamicElementError({ error: errorValue }));
          };
          const unboxed = value.valueOf();
          if (unboxed !== void 0 && unboxed !== value && !isAsyncIter(unboxed))
            update({ done: false, value: unboxed });
          else
            ap.next().then(update).catch(error);
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
function mutationTracker(root, track, enableOnRemovedFromDOM) {
  const tracked = /* @__PURE__ */ new WeakSet();
  function walk(nodes) {
    for (const node of nodes) {
      if (track === "addedNodes" === node.isConnected) {
        walk(node.childNodes);
        tracked.add(node);
        if (enableOnRemovedFromDOM && "onRemovedFromDOM" in node && typeof node.onRemovedFromDOM === "function") node.onRemovedFromDOM();
      }
    }
  }
  new MutationObserver((mutations) => {
    mutations.forEach(function(m) {
      if (m.type === "childList" && m[track].length) {
        walk(m[track]);
      }
    });
  }).observe(root, { subtree: true, childList: true });
  return tracked;
}
export {
  iterators_exports as Iterators,
  UniqueID,
  tag,
  when
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RlYnVnLnRzIiwgIi4uL3NyYy9kZWZlcnJlZC50cyIsICIuLi9zcmMvaXRlcmF0b3JzLnRzIiwgIi4uL3NyYy93aGVuLnRzIiwgIi4uL3NyYy90YWdzLnRzIiwgIi4uL3NyYy9haS11aS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IEJvb2xlYW4oZ2xvYmFsVGhpcy5ERUJVRz8ubWF0Y2goLyhefFxcVylBSS1VSShcXFd8JCkvKSkgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmluZm8oJyhBSS1VSSkgSU5GTzonLCAuLi5hcmdzKVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5cbi8vIENyZWF0ZSBhIGRlZmVycmVkIFByb21pc2UsIHdoaWNoIGNhbiBiZSBhc3luY2hyb25vdXNseS9leHRlcm5hbGx5IHJlc29sdmVkIG9yIHJlamVjdGVkLlxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2OiBhbnkpPT57fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gVHJ1ZSBpZiBgZXhwciBpbiB4YCBpcyB2YWxpZFxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh4OiBhbnkpOiB4IGlzIEZ1bmN0aW9uIHwge30ge1xuICByZXR1cm4geCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UoeCkgJiYgKCd0aGVuJyBpbiB4KSAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIlxuaW1wb3J0IHsgRGVmZXJyZWRQcm9taXNlLCBkZWZlcnJlZCwgaXNPYmplY3RMaWtlLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlvblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdGUgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgVGhpcyByZWxpZXMgb24gYSBoYWNrIHRvIGB3cmFwQXN5bmNIZWxwZXJgIGluIGl0ZXJhdG9ycy50cyB3aGljaCAqYWNjZXB0cyogYSBQYXJ0aWFsPEFzeW5jSXRlcmF0b3I+XG4gIGJ1dCBjYXN0cyBpdCB0byBhIEFzeW5jSXRlcmF0b3IgYmVmb3JlIHVzZS5cblxuICBUaGUgaXRlcmFiaWxpdHkgb2YgcHJvcGVydHlzIG9mIGFuIG9iamVjdCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBwcmVzZW5jZSBhbmQgdmFsdWUgb2YgdGhlIGBJdGVyYWJpbGl0eWAgc3ltYm9sLlxuICBCeSBkZWZhdWx0LCB0aGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgZGVlcCBtYXBwaW5nLCBzbyBhbiBpdGVyYWJsZSBwcm9wZXJ0eSAnb2JqJyBpcyBpdHNlbGZcbiAgaXRlcmFibGUsIGFzIGFyZSBpdCdzIG1lbWJlcnMuIFRoZSBvbmx5IGRlZmluZWQgdmFsdWUgYXQgcHJlc2VudCBpcyBcInNoYWxsb3dcIiwgaW4gd2hpY2ggY2FzZSAnb2JqJyByZW1haW5zXG4gIGl0ZXJhYmxlLCBidXQgaXQncyBtZW1iZXRycyBhcmUganVzdCBQT0pTIHZhbHVlcy5cbiovXG5cbi8vIEJhc2UgdHlwZXMgdGhhdCBjYW4gYmUgbWFkZSBkZWZpbmVkIGFzIGl0ZXJhYmxlOiBiYXNpY2FsbHkgYW55dGhpbmcsIF9leGNlcHRfIGEgZnVuY3Rpb25cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgPSAoc3RyaW5nIHwgbnVtYmVyIHwgYmlnaW50IHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwpO1xuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfTtcblxuZXhwb3J0IGNvbnN0IEl0ZXJhYmlsaXR5ID0gU3ltYm9sKFwiSXRlcmFiaWxpdHlcIik7XG5leHBvcnQgdHlwZSBJdGVyYWJpbGl0eTxEZXB0aCBleHRlbmRzICdzaGFsbG93JyA9ICdzaGFsbG93Jz4gPSB7IFtJdGVyYWJpbGl0eV06IERlcHRoIH07XG5leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBUICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VD4+O1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIFRoaXMgaXMgcGF0Y2ggdG8gdGhlIHN0ZCBsaWIgZGVmaW5pdGlvbiBvZiBBcnJheTxUPi4gSSBkb24ndCBrbm93IHdoeSBpdCdzIGFic2VudCxcbiAgLy8gYXMgdGhpcyBpcyB0aGUgaW1wbGVtZW50YXRpb24gaW4gYWxsIEphdmFTY3JpcHQgZW5naW5lcy4gSXQgaXMgcHJvYmFibHkgYSByZXN1bHRcbiAgLy8gb2YgaXRzIGFic2VuY2UgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvdmFsdWVzLFxuICAvLyB3aGljaCBpbmhlcml0cyBmcm9tIHRoZSBPYmplY3QucHJvdG90eXBlLCB3aGljaCBtYWtlcyBubyBjbGFpbSBmb3IgdGhlIHJldHVybiB0eXBlXG4gIC8vIHNpbmNlIGl0IGNvdWxkIGJlIG92ZXJyaWRkZW0uIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSwgYSBUUyBkZWZuIHNob3VsZCBhbHNvIG92ZXJyaWRlXG4gIC8vIGl0LCBsaWtlIE51bWJlciwgU3RyaW5nLCBCb29sZWFuIGV0YyBkby5cbiAgaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICB2YWx1ZU9mKCk6IEFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczogVCk6IFQgZXh0ZW5kcyBJdGVyYWJsZVR5cGU8aW5mZXIgWj4gPyBaIDogT2JqZWN0O1xuICB9XG59XG5cbnR5cGUgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzID0ga2V5b2YgQXJyYXk8YW55PiAmIGtleW9mIEFzeW5jSXRlcmFibGVIZWxwZXJzO1xuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCwgdHlwZW9mIEl0ZXJhYmlsaXR5Pl06IEl0ZXJhYmxlVHlwZTxJUFtLXT5cbn0gOiB7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IC8qXG4gICAgICBCZWNhdXNlIFRTIGRvZXNuJ3QgaW1wbGVtZW50IHNlcGFyYXRlIHR5cGVzIGZvciByZWFkL3dyaXRlLCBvciBjb21wdXRlZCBnZXR0ZXIvc2V0dGVyIG5hbWVzICh3aGljaCBETyBhbGxvd1xuICAgICAgZGlmZmVyZW50IHR5cGVzIGZvciBhc3NpZ25tZW50IGFuZCBldmFsdWF0aW9uKSwgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGRlZmluZSB0eXBlIGZvciBhcnJheSBtZW1iZXJzIHRoYXQgcGVybWl0XG4gICAgICBkZXJlZmVyZW5jaW5nIG9mIG5vbi1jbGFzaGluaCBhcnJheSBrZXlzIHN1Y2ggYXMgYGpvaW5gIG9yIGBzb3J0YCBhbmQgQXN5bmNJdGVyYXRvciBtZXRob2RzIHdoaWNoIGFsc28gYWxsb3dzXG4gICAgICBzaW1wbGUgYXNzaWdubWVudCBvZiB0aGUgZm9ybSBgdGhpcy5pdGVyYWJsZUFycmF5TWVtYmVyID0gWy4uLl1gLlxuXG4gICAgICBUaGUgQ09SUkVDVCB0eXBlIGZvciB0aGVzZSBmaWVsZHMgd291bGQgYmUgKGlmIFRTIHBoYXMgc3ludGF4IGZvciBpdCk6XG4gICAgICBnZXQgW0tdICgpOiBPbWl0PEFycmF5PEUgJiBBc3luY0V4dHJhSXRlcmFibGU8RT4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgc2V0IFtLXSAoKTogQXJyYXk8RT4gfCBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgKi9cbiAgICAgIE9taXQ8QXJyYXk8RSAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPEU+Pj4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+PlxuICAgIDogKFxuICAgICAgSVBbS10gZXh0ZW5kcyBvYmplY3RcbiAgICAgID8gSXRlcmFibGVQcm9wZXJ0aWVzPElQW0tdPlxuICAgICAgOiBJUFtLXVxuICAgICkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG4gIClcbn1cblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgcmV0dXJuIGQgYXMgRCAmIFM7XG59XG5cbmNvbnN0IF9wZW5kaW5nID0gU3ltYm9sKCdwZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbX3BlbmRpbmddOiBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsLFxuICAgIFtfaXRlbXNdOiBbXSBhcyBJdGVyYXRvclJlc3VsdDxUPltdIHwgbnVsbCxcblxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcSBhcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD47XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAocVtfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW19pdGVtc10uc2hpZnQoKSEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCB0aGlzIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIHFbX3BlbmRpbmddLnVuc2hpZnQodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4odj86IHVua25vd24pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSByZXR1cm4gLTE7IC8vIFRoZSBxdWV1ZSBoYXMgbm8gY29uc3VtZXJzIGFuZCBoYXMgdGVybWluYXRlZC5cbiAgICAgIHJldHVybiBxW19pdGVtc10ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBwdXNoKHZhbHVlOiBUKSB7XG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuY29uc3QgX2luZmxpZ2h0ID0gU3ltYm9sKCdpbmZsaWdodCcpO1xuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtfaW5mbGlnaHRdOiBTZXQ8VD4gfTtcbiAgcVtfaW5mbGlnaHRdID0gbmV3IFNldDxUPigpO1xuXG4gIHEucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZTogVCkge1xuICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW19pbmZsaWdodF0uaGFzKHZhbHVlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgcVtfaW5mbGlnaHRdLmFkZCh2YWx1ZSk7XG4gICAgICBjb25zdCBwID0gcVtfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbX2luZmxpZ2h0XS5kZWxldGUodmFsdWUpKTtcbiAgICAgIHAucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICB9IGVsc2UgaWYgKCFxW19pdGVtc10uZmluZCh2ID0+IHYudmFsdWUgPT09IHZhbHVlKSkge1xuICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHE7XG59XG5cbi8vIFJlLWV4cG9ydCB0byBoaWRlIHRoZSBpbnRlcm5hbHNcbmV4cG9ydCBjb25zdCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5leHBvcnQgY29uc3QgZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmNvbnN0IF9wcm94aWVkQXN5bmNJdGVyYXRvciA9IFN5bWJvbCgnX3Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTogZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGFzICh0eXBlb2YgYXN5bmNFeHRyYXMpW01dXG4gICAgfVttZXRob2RdO1xuICB9XG5cbiAgdHlwZSBIZWxwZXJEZXNjcmlwdG9yczxUPiA9IHtcbiAgICBbSyBpbiBrZXlvZiBBc3luY0V4dHJhSXRlcmFibGU8VD5dOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxBc3luY0V4dHJhSXRlcmFibGU8VD5bS10+XG4gIH0gJiB7XG4gICAgW0l0ZXJhYmlsaXR5XT86IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPCdzaGFsbG93Jz5cbiAgfTtcblxuICBjb25zdCBleHRyYXMgPSB7IFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IGluaXRJdGVyYXRvciB9IGFzIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiAmIHsgW0l0ZXJhYmlsaXR5XT86ICdzaGFsbG93JyB9O1xuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT4gLy8gQHRzLWlnbm9yZVxuICAgIGV4dHJhc1trXSA9IGxhenlBc3luY01ldGhvZChrKSlcbiAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYgJiYgdltJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSB2W0l0ZXJhYmlsaXR5XTtcbiAgfVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTxWPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWIHwgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHY7XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8obmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LCB5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCwgeyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+ICh2ID09PSBwaXBlZCkgJiYgKHBpcGVkID0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgICAvLyBFYXJseSByZXR1cm4gYXMgd2UncmUgZ29pbmcgdG8gcGlwZSB2YWx1ZXMgaW4gbGF0ZXJcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBpcGVkICYmIERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IHBpcGVkIGZyb20gYW5vdGhlciBpdGVyYXRvciwgYW5kIG1pZ2h0IGJlIG92ZXJyd2l0dGVuIGxhdGVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8Vj4pOiBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+IHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH1cbiAgICAgIH0pLCBwZHMpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QoYSksIE9iamVjdC5hc3NpZ24ocGRzLCB7XG4gICAgICAgICAgdG9KU09OKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfVxuICAgICAgICB9KSk7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAvLyBUaGUgcHJveGllcyBhcmUgcmVjdXJzaXZlLCBzbyB0aGF0IGlmIGFuIG9iamVjdCBjb250YWlucyBvYmplY3RzLCB0aGV5IHRvbyBhcmUgcHJveGllZC4gT2JqZWN0cyBjb250YWluaW5nIHByaW1pdGl2ZXMgcmVtYWluIHByb3hpZWQgdG9cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBnZXQvc2V0L3NlbGV0ZSBpbiBwbGFjZSBvZiB0aGUgdXN1YWwgcHJpbWl0aXZlIGJveGluZyB2aWEgT2JqZWN0KHByaW1pdGl2ZVZhbHVlKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBib3hPYmplY3QoYSwgcGRzKTtcblxuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBvZiB0eXBlIFwiJyArIHR5cGVvZiBhICsgJ1wiJyk7XG4gIH1cblxuICB0eXBlIFdpdGhQYXRoID0geyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhOiBWLCBwYXRoOiBzdHJpbmcgfCBudWxsIH0gfTtcbiAgdHlwZSBQb3NzaWJseVdpdGhQYXRoID0gViB8IFdpdGhQYXRoO1xuICBmdW5jdGlvbiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG86IFBvc3NpYmx5V2l0aFBhdGgpOiBvIGlzIFdpdGhQYXRoIHtcbiAgICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aCAmJiAoKG8gPSBvPy5bZmllbGRzW2ldXSkgIT09IHVuZGVmaW5lZCk7IGkrKyk7XG4gICAgcmV0dXJuIG87XG4gIH1cbiAgZnVuY3Rpb24gYm94T2JqZWN0KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFBvc3NpYmx5V2l0aFBhdGg+KSB7XG4gICAgbGV0IHdpdGhQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICAgIHJldHVybiBuZXcgUHJveHkoYSBhcyBvYmplY3QsIGhhbmRsZXIoKSkgYXMgViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIocGF0aCA9ICcnKTogUHJveHlIYW5kbGVyPG9iamVjdD4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQSBib3hlZCBvYmplY3QgaGFzIGl0cyBvd24ga2V5cywgYW5kIHRoZSBrZXlzIG9mIGFuIEFzeW5jRXh0cmFJdGVyYWJsZVxuICAgICAgICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5ID09PSBfcHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGEga2V5IGlzIHNldCBpbiB0aGUgdGFyZ2V0LCBwdXNoIHRoZSBjaGFuZ2VcbiAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgd2l0aG91dFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXS5hIDogbyk7XG4gICAgICAgICAgICAgIHJldHVybiB3aXRob3V0UGF0aFtrZXkgYXMga2V5b2YgdHlwZW9mIHBkc107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aXRoUGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdIDogeyBhOiBvLCBwYXRoOiBudWxsIH0pO1xuXG4gICAgICAgICAgICAgIGxldCBhaSA9IGZpbHRlck1hcCh3aXRoUGF0aCwgKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gZGVzdHJ1Y3R1cmUoby5hLCBwYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCAhPT0gdiB8fCBvLnBhdGggPT09IG51bGwgfHwgby5wYXRoLnN0YXJ0c1dpdGgocGF0aCkgPyB2IDogSWdub3JlO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoaW50PzogJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQ6ICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8eyBpZHg6IG51bWJlciwgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCkgPT4geyB9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9IH0pKVxuICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHsgaWR4OiBudW1iZXIsIGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT5bXTtcbiAgbGV0IHNpOiBBc3luY0l0ZXJhdG9yPGFueT5bXSA9IFtdO1xuICBsZXQgYWN0aXZlOiBudW1iZXIgPSAwO1xuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSwgaWR4KSA9PiB7XG4gICAgICAgICAgYWN0aXZlICs9IDE7XG4gICAgICAgICAgc2lbaWR4XSA9IHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgICAgcmV0dXJuIHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGlkeCwgaywgaXIgfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIHBjLmZvckVhY2goKHAsIGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICBwYy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnRocm93Py4oZXgpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn1cblxuXG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGU8VD4oaTogYW55KTogaSBpcyBBc3luY0V4dHJhSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgJiYgZXh0cmFLZXlzLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgKGkgYXMgYW55KVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuXG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnM8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4oYWk6IEEpOiBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IHVua25vd24+IHtcbiAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgYXNzaWduSGlkZGVuKGFpLCBhc3luY0V4dHJhcyk7XG4gIH1cbiAgcmV0dXJuIGFpIGFzIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICYgQSA6IG5ldmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzPEcgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFIsIFIgZXh0ZW5kcyBBc3luY0dlbmVyYXRvcj4oZzogRykge1xuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEY+ID1cbiAgRiBleHRlbmRzICgpID0+IEFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVuZGVmaW5lZCB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPiA9IHVuZGVmaW5lZDtcbiAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMgYXMgQXN5bmNJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pikge1xuICAgIGxhc3QgPSBmPy4odSk7XG4gIH1cbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPik7XG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuXG50eXBlIFBhcnRpYWxJdGVyYWJsZTxUID0gYW55PiA9IFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUPj47XG5cbmZ1bmN0aW9uIHJlc29sdmVTeW5jPFosIFI+KHY6IE1heWJlUHJvbWlzZWQ8Wj4sIHRoZW46ICh2OiBaKSA9PiBSLCBleGNlcHQ6ICh4OiBhbnkpID0+IGFueSk6IE1heWJlUHJvbWlzZWQ8Uj4ge1xuICBpZiAoaXNQcm9taXNlTGlrZSh2KSlcbiAgICByZXR1cm4gdi50aGVuKHRoZW4sIGV4Y2VwdCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHRoZW4odilcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXR1cm4gZXhjZXB0KGV4KVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpe1xuICAgIC8vIEB0cy1pZ25vcmUgLSByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IGZhaSA9IG51bGw7XG4gICAgcHJldiA9IElnbm9yZTtcbiAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfVxuICB9XG4gIGxldCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gKHByZXYgPSBJZ25vcmUsIHJlc29sdmUocCkpXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICBhaS50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpLnJldHVybj8uKGV4KSAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pOyAvLyBUZXJtaW5hdGUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgICB9XG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoaXQ/LmRvbmUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgYWkhLm5leHQoKVxuICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pO1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCkge1xuICAgIC8vIEB0cy1pZ25vcmU6IHJlbW92ZSByZWZlcmVuY2VzIGZvciBHQ1xuICAgIGFpID0gbWFpID0gY3VycmVudCA9IG51bGw7XG4gICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH1cbiAgfVxuXG4gIGxldCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKGRvbmUpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4oZG9uZSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWFpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IGl0ZXJhYmxlSGVscGVycywgbWVyZ2UsIEFzeW5jRXh0cmFJdGVyYWJsZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuLypcbiAgYHdoZW4oLi4uLilgIGlzIGJvdGggYW4gQXN5bmNJdGVyYWJsZSBvZiB0aGUgZXZlbnRzIGl0IGNhbiBnZW5lcmF0ZSBieSBvYnNlcnZhdGlvbixcbiAgYW5kIGEgZnVuY3Rpb24gdGhhdCBjYW4gbWFwIHRob3NlIGV2ZW50cyB0byBhIHNwZWNpZmllZCB0eXBlLCBlZzpcblxuICB0aGlzLndoZW4oJ2tleXVwOiNlbGVtZXQnKSA9PiBBc3luY0l0ZXJhYmxlPEtleWJvYXJkRXZlbnQ+XG4gIHRoaXMud2hlbignI2VsZW1ldCcpKGUgPT4gZS50YXJnZXQpID0+IEFzeW5jSXRlcmFibGU8RXZlbnRUYXJnZXQ+XG4qL1xuLy8gVmFyYXJncyB0eXBlIHBhc3NlZCB0byBcIndoZW5cIlxuZXhwb3J0IHR5cGUgV2hlblBhcmFtZXRlcnM8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFJlYWRvbmx5QXJyYXk8XG4gIEFzeW5jSXRlcmFibGU8YW55PlxuICB8IFZhbGlkV2hlblNlbGVjdG9yPElEUz5cbiAgfCBFbGVtZW50IC8qIEltcGxpZXMgXCJjaGFuZ2VcIiBldmVudCAqL1xuICB8IFByb21pc2U8YW55PiAvKiBKdXN0IGdldHMgd3JhcHBlZCBpbiBhIHNpbmdsZSBgeWllbGRgICovXG4+O1xuXG4vLyBUaGUgSXRlcmF0ZWQgdHlwZSBnZW5lcmF0ZWQgYnkgXCJ3aGVuXCIsIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzXG50eXBlIFdoZW5JdGVyYXRlZFR5cGU8UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIChFeHRyYWN0PFNbbnVtYmVyXSwgQXN5bmNJdGVyYWJsZTxhbnk+PiBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgST4gPyB1bmtub3duIGV4dGVuZHMgSSA/IG5ldmVyIDogSSA6IG5ldmVyKVxuICB8IEV4dHJhY3RFdmVudHM8RXh0cmFjdDxTW251bWJlcl0sIHN0cmluZz4+XG4gIHwgKEV4dHJhY3Q8U1tudW1iZXJdLCBFbGVtZW50PiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudClcblxudHlwZSBNYXBwYWJsZUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+ID1cbiAgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gP1xuICAgIEEgJiBBc3luY0V4dHJhSXRlcmFibGU8VD4gJlxuICAgICg8Uj4obWFwcGVyOiAodmFsdWU6IEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyKSA9PiBSKSA9PiAoQXN5bmNFeHRyYUl0ZXJhYmxlPEF3YWl0ZWQ8Uj4+KSlcbiAgOiBuZXZlcjtcblxuLy8gVGhlIGV4dGVuZGVkIGl0ZXJhdG9yIHRoYXQgc3VwcG9ydHMgYXN5bmMgaXRlcmF0b3IgbWFwcGluZywgY2hhaW5pbmcsIGV0Y1xuZXhwb3J0IHR5cGUgV2hlblJldHVybjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgTWFwcGFibGVJdGVyYWJsZTxcbiAgICBBc3luY0V4dHJhSXRlcmFibGU8XG4gICAgICBXaGVuSXRlcmF0ZWRUeXBlPFM+Pj47XG5cbnR5cGUgRW1wdHlPYmplY3QgPSBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBuZXZlcj47XG5cbnR5cGUgU3BlY2lhbFdoZW5FdmVudHMgPSB7XG4gIFwiQHN0YXJ0XCI6IEVtcHR5T2JqZWN0LCAgLy8gQWx3YXlzIGZpcmVzIHdoZW4gcmVmZXJlbmNlZFxuICBcIkByZWFkeVwiOiBFbXB0eU9iamVjdCAgIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufTtcbnR5cGUgV2hlbkV2ZW50cyA9IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCAmIFNwZWNpYWxXaGVuRXZlbnRzO1xudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlcjtcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXI7XG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8IGAjJHtJRFN9PmAgfCBgLiR7c3RyaW5nfWAgfCBgWyR7c3RyaW5nfV1gXG5cbi8qIFZhbGlkV2hlblNlbGVjdG9ycyBhcmU6XG4gICAgQHN0YXJ0XG4gICAgQHJlYWR5XG4gICAgZXZlbnQ6c2VsZWN0b3JcbiAgICBldmVudCAgICAgICAgICAgXCJ0aGlzXCIgZWxlbWVudCwgZXZlbnQgdHlwZT0nZXZlbnQnXG4gICAgc2VsZWN0b3IgICAgICAgIHNwZWNpZmljZWQgc2VsZWN0b3JzLCBpbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnRcbiovXG5cbmV4cG9ydCB0eXBlIFZhbGlkV2hlblNlbGVjdG9yPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgJHtrZXlvZiBTcGVjaWFsV2hlbkV2ZW50c31gXG4gIHwgYCR7RXZlbnRBdHRyaWJ1dGV9OiR7Q1NTSWRlbnRpZmllcjxJRFM+fWBcbiAgfCBFdmVudEF0dHJpYnV0ZVxuICB8IENTU0lkZW50aWZpZXI8SURTPjtcblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+XG4gID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudE5hbWVzPFM+XG4gID0gUyBleHRlbmRzIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzID8gU1xuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBWfToke0NTU0lkZW50aWZpZXJ9YFxuICA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIENTU0lkZW50aWZpZXJcbiAgPyAnY2hhbmdlJ1xuICA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XTtcblxuLyoqIHdoZW4gKiovXG50eXBlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lclJlZjogV2Vha1JlZjxFbGVtZW50PlxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbDtcbiAgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuO1xufTtcbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IFdlYWtNYXA8RG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBNYXA8a2V5b2YgV2hlbkV2ZW50cywgU2V0PEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPj4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBzZXRUaW1lb3V0KCgpID0+IF9kb2NFdmVudEhhbmRsZXIuY2FsbCh0aGlzLCBldiksMSk7XG59XG5cbmZ1bmN0aW9uIF9kb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyh0aGlzKSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQodGhpcywgbmV3IE1hcCgpKTtcblxuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQodGhpcykhLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyUmVmLCBzZWxlY3RvciwgaW5jbHVkZUNoaWxkcmVuIH0gPSBvO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBjb250YWluZXJSZWYuZGVyZWYoKTtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNvbnRhaW5lci5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXI/LmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGluY2x1ZGVDaGlsZHJlbiA/IG4uY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gbikgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGluY2x1ZGVDaGlsZHJlbiA/IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpIDogZXYudGFyZ2V0ID09PSBjb250YWluZXIgKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzOiBzdHJpbmcpOiBzIGlzIENTU0lkZW50aWZpZXIge1xuICByZXR1cm4gQm9vbGVhbihzICYmIChzLnN0YXJ0c1dpdGgoJyMnKSB8fCBzLnN0YXJ0c1dpdGgoJy4nKSB8fCAocy5zdGFydHNXaXRoKCdbJykgJiYgcy5lbmRzV2l0aCgnXScpKSkpO1xufVxuXG5mdW5jdGlvbiBjaGlsZGxlc3M8VCBleHRlbmRzIHN0cmluZyB8IG51bGw+KHNlbDogVCk6IFQgZXh0ZW5kcyBudWxsID8geyBpbmNsdWRlQ2hpbGRyZW46IHRydWUsIHNlbGVjdG9yOiBudWxsIH0gOiB7IGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbiwgc2VsZWN0b3I6IFQgfSB7XG4gIGNvbnN0IGluY2x1ZGVDaGlsZHJlbiA9ICFzZWwgfHwgIXNlbC5lbmRzV2l0aCgnPicpXG4gIHJldHVybiB7IGluY2x1ZGVDaGlsZHJlbiwgc2VsZWN0b3I6IGluY2x1ZGVDaGlsZHJlbiA/IHNlbCA6IHNlbC5zbGljZSgwLC0xKSB9IGFzIGFueTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXaGVuU2VsZWN0b3I8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPih3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pOiB1bmRlZmluZWQgfCBbUmV0dXJuVHlwZTx0eXBlb2YgY2hpbGRsZXNzPiwga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXSB7XG4gIGNvbnN0IHBhcnRzID0gd2hhdC5zcGxpdCgnOicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgcmV0dXJuIFtjaGlsZGxlc3MocGFydHNbMF0pLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbeyBpbmNsdWRlQ2hpbGRyZW46IHRydWUsIHNlbGVjdG9yOiBudWxsIH0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgcmV0dXJuIFtjaGlsZGxlc3MocGFydHNbMV0pLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbeyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yfSwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIrd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChjb250YWluZXIub3duZXJEb2N1bWVudCwgbmV3IE1hcCgpKTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmhhcyhldmVudE5hbWUpKSB7XG4gICAgY29udGFpbmVyLm93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGRvY0V2ZW50SGFuZGxlciwge1xuICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgIGNhcHR1cmU6IHRydWVcbiAgICB9KTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICB9XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuZ2V0KGV2ZW50TmFtZSk7XG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IG9ic2VydmF0aW9ucyEuZGVsZXRlKGRldGFpbHMpKTtcbiAgY29uc3QgZGV0YWlsczogRXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lclJlZjogbmV3IFdlYWtSZWYoY29udGFpbmVyKSxcbiAgICBpbmNsdWRlQ2hpbGRyZW4sXG4gICAgc2VsZWN0b3JcbiAgfTtcblxuICBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgc2VsZWN0b3IgPyBbc2VsZWN0b3JdIDogdW5kZWZpbmVkKVxuICAgIC50aGVuKF8gPT4gb2JzZXJ2YXRpb25zIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIGRvbmVJbW1lZGlhdGVseTxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBjb25zb2xlLmxvZyhcImRvbmVJbW1lZGlhdGVseVwiKTtcbiAgcmV0dXJuIHVuZGVmaW5lZCBhcyBaO1xufVxuXG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbjxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBjb25zb2xlLmxvZyhcIm5ldmVyR29ubmFIYXBwZW5cIik7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGNvbnN0IGlzTWlzc2luZyA9IChzZWw6IENTU0lkZW50aWZpZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIgPT4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMubWFwKHcgPT4gdz8uc2VsZWN0b3IpLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWQ/LltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChkb25lSW1tZWRpYXRlbHk8V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgZnVuY3Rpb24gZWxlbWVudElzSW5ET00oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiBbLi4uci5yZW1vdmVkTm9kZXNdLnNvbWUociA9PiByID09PSBjb250YWluZXIgfHwgci5jb250YWlucyhjb250YWluZXIpKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbW92ZWQgZnJvbSBET01cIikpO1xuICAgICAgICB9XG4gICAgICB9KS5vYnNlcnZlKGNvbnRhaW5lci5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczpgKTtcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBcIlxcblwiICsgY29udGFpbmVyLm91dGVySFRNTCk7XG4gICAgICAgIC8vcmVqZWN0KG5ldyBFcnJvcihcIkVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzXCIpKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuXG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczogYCkgPz8gJz8/JztcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBtaXNzaW5nICsgXCJcXG5cIik7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKCkudGhlbigoKSA9PiBhbGxTZWxlY3RvcnNQcmVzZW50KHNlbGVjdG9ycykpXG4gIHJldHVybiBlbGVtZW50SXNJbkRPTSgpO1xufVxuIiwgIi8qIFR5cGVzIGZvciB0YWcgY3JlYXRpb24sIGltcGxlbWVudGVkIGJ5IGB0YWcoKWAgaW4gYWktdWkudHMuXG4gIE5vIGNvZGUvZGF0YSBpcyBkZWNsYXJlZCBpbiB0aGlzIGZpbGUgKGV4Y2VwdCB0aGUgcmUtZXhwb3J0ZWQgc3ltYm9scyBmcm9tIGl0ZXJhdG9ycy50cykuXG4qL1xuXG5pbXBvcnQgdHlwZSB7IEFzeW5jUHJvdmlkZXIsIElnbm9yZSwgSXRlcmFibGVQcm9wZXJ0aWVzLCBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz47IC8vIEl0ZXJhYmxlIHRoaW5ncyB0aGF0IGhvbGQgdGhlIGFib3ZlLCBsaWtlIEFycmF5cywgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0XG5cbnR5cGUgQXN5bmNBdHRyPFg+ID0gQXN5bmNQcm92aWRlcjxYPiB8IFByb21pc2VMaWtlPEFzeW5jUHJvdmlkZXI8WD4gfCBYPjtcblxuZXhwb3J0IHR5cGUgUG9zc2libHlBc3luYzxYPiA9XG4gIFtYXSBleHRlbmRzIFtvYmplY3RdIC8vIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb25cbiAgPyBYIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFU+XG4gID8gUG9zc2libHlBc3luYzxVPlxuICA6IFggZXh0ZW5kcyBGdW5jdGlvblxuICA/IFggfCBBc3luY0F0dHI8WD5cbiAgOiBBc3luY0F0dHI8UGFydGlhbDxYPj4gfCB7IFtLIGluIGtleW9mIFhdPzogUG9zc2libHlBc3luYzxYW0tdPjsgfVxuICA6IFggfCBBc3luY0F0dHI8WD4gfCB1bmRlZmluZWQ7XG5cbnR5cGUgRGVlcFBhcnRpYWw8WD4gPSBbWF0gZXh0ZW5kcyBbb2JqZWN0XSA/IHsgW0sgaW4ga2V5b2YgWF0/OiBEZWVwUGFydGlhbDxYW0tdPiB9IDogWDtcblxuZXhwb3J0IHR5cGUgSW5zdGFuY2U8VCA9IHt9PiA9IHsgW1VuaXF1ZUlEXTogc3RyaW5nIH0gJiBUO1xuXG4vLyBJbnRlcm5hbCB0eXBlcyBzdXBwb3J0aW5nIFRhZ0NyZWF0b3JcbnR5cGUgQXN5bmNHZW5lcmF0ZWRPYmplY3Q8WCBleHRlbmRzIG9iamVjdD4gPSB7XG4gIFtLIGluIGtleW9mIFhdOiBYW0tdIGV4dGVuZHMgQXN5bmNBdHRyPGluZmVyIFZhbHVlPiA/IFZhbHVlIDogWFtLXVxufVxuXG50eXBlIElEUzxJPiA9IEkgZXh0ZW5kcyB7fSA/IHtcbiAgaWRzOiB7XG4gICAgW0ogaW4ga2V5b2YgSV06IElbSl0gZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiA/IFJldHVyblR5cGU8SVtKXT4gOiBuZXZlcjtcbiAgfVxufSA6IHsgaWRzOiB7fSB9XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+YW55XG4gICAgICA/ICh0aGlzOiBULCBlOiBFKT0+YW55IHwgbnVsbFxuICAgICAgOiBUW0tdXG4gICAgOiBUW0tdXG59XG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IERlZXBQYXJ0aWFsPFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+Pik7XG4gIH0pXG4gIDogKE9taXQ8RSwgJ2F0dHJpYnV0ZXMnPilcblxuZXhwb3J0IHR5cGUgRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBPW0tdXG59XVtudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBEZWVwRmxhdHRlbjxPPiA9IFt7XG4gIFtLIGluIGtleW9mIE9dOiBGbGF0dGVuPE9bS10+XG59XVtudW1iZXJdO1xuXG50eXBlIE5ldmVyRW1wdHk8TyBleHRlbmRzIG9iamVjdD4gPSB7fSBleHRlbmRzIE8gPyBuZXZlciA6IE87XG50eXBlIE9taXRUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IG5ldmVyIDogS106IFRbS10gfV1bbnVtYmVyXVxudHlwZSBQaWNrVHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBLIDogbmV2ZXJdOiBUW0tdIH1dW251bWJlcl1cblxuLy8gRm9yIGluZm9ybWF0aXZlIHB1cnBvc2VzIC0gdW51c2VkIGluIHByYWN0aWNlXG5pbnRlcmZhY2UgX05vdF9EZWNsYXJlZF8geyB9XG5pbnRlcmZhY2UgX05vdF9BcnJheV8geyB9XG50eXBlIEV4Y2Vzc0tleXM8QSwgQj4gPVxuICBBIGV4dGVuZHMgYW55W11cbiAgPyBCIGV4dGVuZHMgYW55W11cbiAgPyBFeGNlc3NLZXlzPEFbbnVtYmVyXSwgQltudW1iZXJdPlxuICA6IF9Ob3RfQXJyYXlfXG4gIDogQiBleHRlbmRzIGFueVtdXG4gID8gX05vdF9BcnJheV9cbiAgOiBOZXZlckVtcHR5PE9taXRUeXBlPHtcbiAgICBbSyBpbiBrZXlvZiBBXTogSyBleHRlbmRzIGtleW9mIEJcbiAgICA/IEFbS10gZXh0ZW5kcyAoQltLXSBleHRlbmRzIEZ1bmN0aW9uID8gQltLXSA6IERlZXBQYXJ0aWFsPEJbS10+KVxuICAgID8gbmV2ZXIgOiBCW0tdXG4gICAgOiBfTm90X0RlY2xhcmVkX1xuICB9LCBuZXZlcj4+XG5cbnR5cGUgT3ZlcmxhcHBpbmdLZXlzPEEsQj4gPSBCIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IEEgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDoga2V5b2YgQSAmIGtleW9mIEI7XG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICBvdmVycmlkZT86IG9iamVjdDtcbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgaXRlcmFibGU/OiB7IFtrOiBzdHJpbmddOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfTtcbiAgaWRzPzogeyBbaWQ6IHN0cmluZ106IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+OyB9O1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBhdHRyaWJ1dGVzIGZyb20gYW4gRXhUYWdDcmVhdG9yXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXR0cmlidXRlczxUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gVCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBCYXNlQXR0cnM+XG4gID8gQmFzZUF0dHJzXG4gIDogbmV2ZXI7XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGl0ZXJhYmxlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgX2FuY2VzdG9yc18gb2YgYW4gRXhUYWdDcmVhdG9yXG50eXBlIEJhc2VJdGVyYWJsZXM8QmFzZT4gPVxuICBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIF9BLCBpbmZlciBCLCBpbmZlciBEIGV4dGVuZHMgT3ZlcnJpZGVzLCBpbmZlciBfRD5cbiAgPyBCYXNlSXRlcmFibGVzPEI+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IERbJ2l0ZXJhYmxlJ10gZXh0ZW5kcyB1bmtub3duXG4gICAgICA/IHt9XG4gICAgICA6IERbJ2l0ZXJhYmxlJ11cbiAgICA6IEJhc2VJdGVyYWJsZXM8Qj4gJiBEWydpdGVyYWJsZSddXG4gIDogbmV2ZXI7XG5cbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9XG4gIHtcbiAgICBpZHM6IDxcbiAgICAgIGNvbnN0IEsgZXh0ZW5kcyBrZXlvZiBFeGNsdWRlPERbJ2lkcyddLCB1bmRlZmluZWQ+LCBcbiAgICAgIGNvbnN0IFRDRiBleHRlbmRzIFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+ID0gRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPltLXVxuICAgID4oXG4gICAgICBhdHRyczp7IGlkOiBLIH0gJiBFeGNsdWRlPFBhcmFtZXRlcnM8VENGPlswXSwgQ2hpbGRUYWdzPixcbiAgICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXVxuICAgICkgPT4gUmV0dXJuVHlwZTxUQ0Y+XG4gIH1cbiAgJiBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+O1xuXG50eXBlIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPSBCYXNlSXRlcmFibGVzPEJhc2U+ICYgRFsnaXRlcmFibGUnXTtcblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvckNhbGxTdGFjayA9IHsgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXSB9O1xuXG5leHBvcnQgdHlwZSBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRyczogVGFnQ3JlYXRpb25PcHRpb25zICYgQ29uc3RydWN0b3JDYWxsU3RhY2sgJiB7XG4gIFtrOiBzdHJpbmddOiB1bmtub3duO1xufSB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBFbGVtZW50XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgc3VwZXI6IFRhZ0NyZWF0b3I8RWxlbWVudD47XG4gIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICBleHRlbmRlZDogKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkgPT4gRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxuaW50ZXJmYWNlIFRhZ0NvbnN0dWN0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4ge1xuICBjb25zdHJ1Y3RvcjogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxudHlwZSBDb21iaW5lZFRoaXNUeXBlPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICBUYWdDb25zdHVjdG9yPEJhc2U+ICZcbiAgUmVhZFdyaXRlQXR0cmlidXRlczxcbiAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgICAmIEFzeW5jR2VuZXJhdGVkT2JqZWN0PENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+LFxuICAgIERbJ2RlY2xhcmUnXVxuICAgICYgRFsnb3ZlcnJpZGUnXVxuICAgICYgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgPjtcblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXM+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbiAgPjtcblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgPSBhbnlcbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogKGluc3Q6VGFnSW5zdGFuY2UpID0+IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucz5cbiAgICAgID5cbiAgICA+XG4gID5cblxuICA8XG4gICAgQmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PixcbiAgICBTdXBwbGllZERlZmluaXRpb25zLFxuICAgIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID0gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgOiB7fVxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG59XG5cbnR5cGUgQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLCBSZXN1bHQ+ID1cblN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiY29uc3RydWN0ZWRgIGRvZXMgbm90IHJldHVybiBDaGlsZFRhZ3NcIjogU3VwcGxpZWREZWZpbml0aW9uc1snY29uc3RydWN0ZWQnXSB9XG4gIDogRXhjZXNzS2V5czxTdXBwbGllZERlZmluaXRpb25zLCBPdmVycmlkZXMgJiBDb25zdHJ1Y3RlZD4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiVGhlIGV4dGVuZGVkIHRhZyBkZWZpbnRpb24gY29udGFpbnMgdW5rbm93biBvciBpbmNvcnJlY3RseSB0eXBlZCBrZXlzXCI6IGtleW9mIEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IH1cblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRpb25PcHRpb25zID0ge1xuICBkZWJ1Z2dlcj86IGJvb2xlYW5cbn07XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBcmdzPEE+ID0gW10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9uc10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9ucywgLi4uQ2hpbGRUYWdzW11dIHwgQ2hpbGRUYWdzW107XG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiBUaGlzVHlwZTxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4+KSA9PiBSZWFkV3JpdGVBdHRyaWJ1dGVzPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+PjtcblxuLyogQSBUYWdDcmVhdG9yIGlzIFRhZ0NyZWF0b3JGdW5jdGlvbiBkZWNvcmF0ZWQgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMuIFRoZSBTdXBlciAmIFN0YXRpY3MgYXJncyBhcmUgb25seVxuZXZlciBzcGVjaWZpZWQgYnkgRXh0ZW5kZWRUYWcgKGludGVybmFsbHkpLCBhbmQgc28gaXMgbm90IGV4cG9ydGVkICovXG50eXBlIEV4VGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0LFxuICBTdXBlciBleHRlbmRzICh1bmtub3duIHwgRXhUYWdDcmVhdG9yPGFueT4pID0gdW5rbm93bixcbiAgU3VwZXJEZWZzIGV4dGVuZHMgT3ZlcnJpZGVzID0ge30sXG4gIFN0YXRpY3MgPSB7fSxcbj4gPSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZT4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiB7IFtVbmlxdWVJRF06IHN0cmluZyB9OyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbiAgW1VuaXF1ZUlEXTogc3RyaW5nO1xufSAmXG4vLyBgU3RhdGljc2AgaGVyZSBpcyB0aGF0IHNhbWUgYXMgU3RhdGljUmVmZXJlbmNlczxTdXBlciwgU3VwZXJEZWZzPiwgYnV0IHRoZSBjaXJjdWxhciByZWZlcmVuY2UgYnJlYWtzIFRTXG4vLyBzbyB3ZSBjb21wdXRlIHRoZSBTdGF0aWNzIG91dHNpZGUgdGhpcyB0eXBlIGRlY2xhcmF0aW9uIGFzIHBhc3MgdGhlbSBhcyBhIHJlc3VsdFxuU3RhdGljcztcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9IEV4VGFnQ3JlYXRvcjxCYXNlLCBuZXZlciwgbmV2ZXIsIHt9PjtcbiIsICJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBJZ25vcmUsIGFzeW5jSXRlcmF0b3IsIGRlZmluZUl0ZXJhYmxlUHJvcGVydHksIGlzQXN5bmNJdGVyLCBpc0FzeW5jSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyBXaGVuUGFyYW1ldGVycywgV2hlblJldHVybiwgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRpb25PcHRpb25zLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24sIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIEV4dGVuZFRhZ0Z1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IGNhbGxTdGFja1N5bWJvbCB9IGZyb20gJy4vdGFncy5qcyc7XG5cbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0IHR5cGUgeyBDaGlsZFRhZ3MsIEluc3RhbmNlLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnXG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuXG5leHBvcnQgY29uc3QgVW5pcXVlSUQgPSBTeW1ib2woXCJVbmlxdWUgSURcIik7XG5cbmNvbnN0IGxvZ05vZGUgPSBERUJVR1xuPyAoKG46IGFueSkgPT4gbiBpbnN0YW5jZW9mIE5vZGVcbiAgPyAnb3V0ZXJIVE1MJyBpbiBuID8gbi5vdXRlckhUTUwgOiBgJHtuLnRleHRDb250ZW50fSAke24ubm9kZU5hbWV9YFxuICA6IFN0cmluZyhuKSlcbjogKG46IE5vZGUpID0+IHVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT4gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnNcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICAvKiogQGRlcHJlY2F0ZWQgLSBsZWdhY3kgc3VwcG9ydCAqL1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NPzogYm9vbGVhblxufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8vIFRoaXMgaXMgYSB2ZXJ5IGluY29tcGxldGUgdHlwZS4gSW4gcHJhY3RpY2UsIHNldChhdHRycykgcmVxdWlyZXMgYSBkZWVwbHkgcGFydGlhbCBzZXQgb2ZcbiAgLy8gYXR0cmlidXRlcywgaW4gZXhhY3RseSB0aGUgc2FtZSB3YXkgYXMgYSBUYWdGdW5jdGlvbidzIGZpcnN0IG9iamVjdCBwYXJhbWV0ZXJcbiAgc2V0IGF0dHJpYnV0ZXMoYXR0cnM6IG9iamVjdCk7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcFxufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYywgJ3JlbW92ZWROb2RlcycsIG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIobGFiZWw/OiBhbnkpIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGxhYmVsPyBsYWJlbC50b1N0cmluZygpIDpERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG4gIGNvbnN0IGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyA9IHRoaXNEb2MuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpO1xuICBhaXVpRXh0ZW5kZWRUYWdTdHlsZXMuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlcy1cIitEYXRlLm5vdygpO1xuICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQoYWl1aUV4dGVuZGVkVGFnU3R5bGVzKTtcblxuICAvKiBQcm9wZXJ0aWVzIGFwcGxpZWQgdG8gZXZlcnkgdGFnIHdoaWNoIGNhbiBiZSBpbXBsZW1lbnRlZCBieSByZWZlcmVuY2UsIHNpbWlsYXIgdG8gcHJvdG90eXBlcyAqL1xuICBjb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdGFnUHJvdG90eXBlczogUG9FbGVtZW50TWV0aG9kcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbCxcbiAgICB7XG4gICAgICB3aGVuOiB7XG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICguLi53aGF0OiBXaGVuUGFyYW1ldGVycykge1xuICAgICAgICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdhdHRyaWJ1dGVzJyksXG4gICAgICAgIHNldCh0aGlzOiBFbGVtZW50LCBhOiBvYmplY3QpIHtcbiAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFpID0gaXNBc3luY0l0ZXJhdG9yKGEpID8gYSA6IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gKCkgPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgICAgICh7IGRvbmUsIHZhbHVlIH0pID0+IHsgYXNzaWduUHJvcHModGhpcywgdmFsdWUpOyBkb25lIHx8IHN0ZXAoKSB9LFxuICAgICAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oZXgpKTtcbiAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlkczoge1xuICAgICAgICAvLyAuaWRzIGlzIGEgZ2V0dGVyIHRoYXQgd2hlbiBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyBsYXppbHkgY3JlYXRlcyBhIFByb3h5IHRoYXQgcHJvdmlkZXMgbGl2ZSBhY2Nlc3MgdG8gY2hpbGRyZW4gYnkgaWRcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgZ2V0KHRoaXM6IEVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBOb3cgd2UndmUgYmVlbiBhY2Nlc3NlZCwgY3JlYXRlIHRoZSBwcm94eVxuICAgICAgICAgIGNvbnN0IGlkUHJveHkgPSBuZXcgUHJveHkoKCgpPT57fSkgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBXZWFrUmVmPEVsZW1lbnQ+Piwge1xuICAgICAgICAgICAgYXBwbHkodGFyZ2V0LCB0aGlzQXJnLCBhcmdzKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNBcmcuY29uc3RydWN0b3IuZGVmaW5pdGlvbi5pZHNbYXJnc1swXS5pZF0oLi4uYXJncylcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDxlbHQ+Lmlkcy4ke2FyZ3M/LlswXT8uaWR9IGlzIG5vdCBhIHRhZy1jcmVhdGluZyBmdW5jdGlvbmAsIHsgY2F1c2U6IGV4IH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uc3RydWN0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVsZXRlUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0UHJvdG90eXBlT2Y6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldFByb3RvdHlwZU9mKCkgeyByZXR1cm4gbnVsbCB9LFxuICAgICAgICAgICAgaXNFeHRlbnNpYmxlKCkgeyByZXR1cm4gZmFsc2UgfSxcbiAgICAgICAgICAgIHByZXZlbnRFeHRlbnNpb25zKCkgeyByZXR1cm4gdHJ1ZSB9LFxuICAgICAgICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5Rm9yKHApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXModGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3duS2V5czogKHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBpZHMgPSBbLi4udGhpcy5xdWVyeVNlbGVjdG9yQWxsKGBbaWRdYCldLm1hcChlID0+IGUuaWQpO1xuICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbLi4ubmV3IFNldChpZHMpXTtcbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIGlkcy5sZW5ndGggIT09IHVuaXF1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudCBpZHNgLCB1bmlxdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gdW5pcXVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcCwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBrID0ga2V5Rm9yKHApO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlJ3ZlIGNhY2hlZCB0aGlzIElEIGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAocGsgaW4gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgZWxlbWVudCBpcyBzdGlsbCBjb250YWluZWQgd2l0aGluIHRoaXMgZWxlbWVudCB3aXRoIHRoZSBzYW1lIElEXG4gICAgICAgICAgICAgICAgICBjb25zdCByZWYgPSB0YXJnZXRbcGtdLmRlcmVmKCk7XG4gICAgICAgICAgICAgICAgICBpZiAocmVmICYmIHJlZi5pZCA9PT0gcCAmJiB0aGlzLmNvbnRhaW5zKHJlZikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWY7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgdGFyZ2V0W3BrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGU6IEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBubCA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnIycgKyBDU1MuZXNjYXBlKHApKTtcbiAgICAgICAgICAgICAgICAgIGlmIChubC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghd2FybmVkLmhhcyhwKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHdhcm5lZC5hZGQocCk7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudHMgd2l0aCBJRCBcIiR7cH1cImAvKixgXFxuXFx0JHtsb2dOb2RlKHRoaXMpfWAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGUgPSBubFswXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZSA9IHRoaXMucXVlcnlTZWxlY3RvcignIycgKyBDU1MuZXNjYXBlKHApKSA/PyB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlKVxuICAgICAgICAgICAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBwaywgbmV3IFdlYWtSZWYoZSksIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLmFuZCByZXBsYWNlIHRoZSBnZXR0ZXIgd2l0aCB0aGUgUHJveHlcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lkcycsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldCgpIHsgcmV0dXJuIGlkUHJveHkgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uLmFuZCByZXR1cm4gdGhhdCBmcm9tIHRoZSBnZXR0ZXIsIHNvIHN1YnNlcXVlbnQgcHJvcGVydHlcbiAgICAgICAgICAvLyBhY2Nlc3NlcyBnbyB2aWEgdGhlIFByb3h5XG4gICAgICAgICAgcmV0dXJuIGlkUHJveHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgLyogQWRkIGFueSB1c2VyIHN1cHBsaWVkIHByb3RvdHlwZXMgKi9cbiAgaWYgKGNvbW1vblByb3BlcnRpZXMpXG4gICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBjb21tb25Qcm9wZXJ0aWVzKTtcblxuICBmdW5jdGlvbiAqbm9kZXMoLi4uY2hpbGRUYWdzOiBDaGlsZFRhZ3NbXSk6IEl0ZXJhYmxlSXRlcmF0b3I8Tm9kZSwgdm9pZCwgdW5rbm93bj4ge1xuICAgIGZ1bmN0aW9uIG5vdFZpYWJsZVRhZyhjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIHJldHVybiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwgfHwgYyA9PT0gSWdub3JlKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYyBvZiBjaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChub3RWaWFibGVUYWcoYykpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICBsZXQgZyA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYy50aGVuKHJlcGxhY2VtZW50ID0+IHtcbiAgICAgICAgICBnLnJlcGxhY2VXaXRoKC4uLm5vZGVzKHJlcGxhY2VtZW50KSk7XG5cbiAgICAgICAgICByZW1vdmVkTm9kZXMuYWRkKGcpO1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICB5aWVsZCBnO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBoYXZlIGFuIGludGVyZXN0aW5nIGNhc2UgaGVyZSB3aGVyZSBhbiBpdGVyYWJsZSBTdHJpbmcgaXMgYW4gb2JqZWN0IHdpdGggYm90aCBTeW1ib2wuaXRlcmF0b3JcbiAgICAgIC8vIChpbmhlcml0ZWQgZnJvbSB0aGUgU3RyaW5nIHByb3RvdHlwZSkgYW5kIFN5bWJvbC5hc3luY0l0ZXJhdG9yIChhcyBpdCdzIGJlZW4gYXVnbWVudGVkIGJ5IGJveGVkKCkpXG4gICAgICAvLyBidXQgd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGNhc2VzIGxpa2UgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0LCBhcnJheSwgZXRjLiwgbm90IHRoZSBmdW5reSBvbmVzXG4gICAgICAvLyBJdCB1c2VkIHRvIGJlIGFmdGVyIHRoZSBpc0FzeW5jSXRlcigpIHRlc3QsIGJ1dCBhIG5vbi1Bc3luY0l0ZXJhdG9yICptYXkqIGFsc28gYmUgYSBzeW5jIGl0ZXJhYmxlXG4gICAgICAvLyBGb3Igbm93LCB3ZSBleGNsdWRlIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSBpbiB0aGlzIGNhc2UuXG4gICAgICBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGMgJiYgIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSAmJiBjW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjKVxuICAgICAgICAgIHlpZWxkICpub2RlcyhjaCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBc3luY0l0ZXI8Q2hpbGRUYWdzPihjKSkge1xuICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHtcbiAgICAgICAgICBub3RZZXRNb3VudGVkOiB0cnVlLFxuICAgICAgICAgIG5vZGVzOiAodW5ib3hlZCA9PT0gYyB8fCBub3RWaWFibGVUYWcoYykpID8gW0RvbVByb21pc2VDb250YWluZXIoKV0gOiBbLi4ubm9kZXModW5ib3hlZCldLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXMgPyB0aGlzLm5vZGVzW1N5bWJvbC5pdGVyYXRvcl0oKVxuICAgICAgICAgICAgICA6IHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxOb2RlPlxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBnZXQgW1N5bWJvbC5pdGVyYXRvcl0oKSB7IHJldHVybiB0aGlzLm5vZGVzW1N5bWJvbC5pdGVyYXRvcl0uYmluZCh0aGlzLm5vZGVzKSB9XG4gICAgICAgICAgLy8gZ2V0IFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgIC8vICAgcmV0dXJuICgpID0+IHRoaXMubm9kZXNbU3ltYm9sLml0ZXJhdG9yXSgpXG4gICAgICAgICAgLy8gfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmxlbmd0aCkgZGVidWdnZXI7IC8vIFNob3VsZG4ndCBiZSBwb3NzaWJsZVxuXG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgY29uc3QgZGVidWdVbm1vdW50ZWQgPSBERUJVR1xuICAgICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG4gICAgICAgICAgICBsZXQgZiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBmID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsIGNyZWF0ZWRCeSwgcmVwbGFjZW1lbnQubm9kZXMubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgfSkoKVxuICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICAoZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgICBhcC5uZXh0KCkudGhlbihlcyA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgLy8gQ2hpbGROb2RlW10sIHNpbmNlIHdlIHRlc3RlZCAucGFyZW50Tm9kZVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gcmVwbGFjZW1lbnQubm9kZXMuZmlsdGVyKGUgPT4gLyplPy5wYXJlbnROb2RlICYmICovZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSByZXBsYWNlbWVudC5ub3RZZXRNb3VudGVkID8gcmVwbGFjZW1lbnQubm9kZXMgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAocmVwbGFjZW1lbnQubm90WWV0TW91bnRlZCAmJiBtb3VudGVkLmxlbmd0aCkgcmVwbGFjZW1lbnQubm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGggfHwgcmVwbGFjZW1lbnQubm9kZXMuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMuaGFzKGUpKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50OiBcIlxuICAgICAgICAgICAgICAgICAgKyByZXBsYWNlbWVudC5ub2Rlcy5tYXAobG9nTm9kZSkuam9pbignXFxuJylcbiAgICAgICAgICAgICAgICAgICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBkZWJ1Z1VubW91bnRlZD8uKCk7XG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gWy4uLm5vZGVzKHVuYm94KGVzLnZhbHVlKSldO1xuICAgICAgICAgICAgICAoblswXSBhcyBDaGlsZE5vZGUpLnJlcGxhY2VXaXRoKC4uLnJlcGxhY2VtZW50Lm5vZGVzKTtcbiAgICAgICAgICAgICAgbi5mb3JFYWNoKGUgPT4gIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbiA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpIGFzIENoaWxkTm9kZVtdO1xuICAgICAgICAgICAgaWYgKG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICBuLnNsaWNlKDEpLmZvckVhY2goZSA9PiBlPy5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybihcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCByZXBsYWNlbWVudC5ub2Rlcy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IG51bGw7XG4gICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm5vZGVzKSB5aWVsZCogcmVwbGFjZW1lbnQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB5aWVsZCB0aGlzRG9jLmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgbm9kZXMsICAgIC8vIEJ1aWxkIERPTSBOb2RlW10gZnJvbSBDaGlsZFRhZ3NcbiAgICAgIFVuaXF1ZUlEXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtkIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoZCkgOiBkfWApO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveDxUPihhOiBUKTogVCB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodiwgdW5ib3gpIDogdikgYXMgVDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IE5vZGUsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZTogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGJlZW4gbW91bnRlZCBiZWZvcmUsIGJpdCBhcmVuJ3Qgbm93LCByZW1vdmUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaGFzKGJhc2UpIHx8ICghbm90WWV0TW91bnRlZCAmJiAhbW91bnRlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgdG86XFxuJHtsb2dOb2RlKGJhc2UpfWApO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdW5ib3hlZCA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICAgICAgICBpZiAodW5ib3hlZCAhPT0gdW5kZWZpbmVkICYmIHVuYm94ZWQgIT09IHZhbHVlICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGFpdWlFeHRlbmRlZFRhZ1N0eWxlcy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgIC8vIGlmICghdGhpc0RvYy5oZWFkLmNvbnRhaW5zKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICAgIC8vICAgdGhpc0RvYy5oZWFkLmFwcGVuZENoaWxkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk7XG4gICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpIH0pKSBhcyBOb2RlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4sIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIC8vIExlZ2FjeSBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgaWYgKGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gJiYgJ29uUmVtb3ZlZEZyb21ET00nIGluIG5vZGUgJiYgdHlwZW9mIG5vZGUub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJykgbm9kZS5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbVt0cmFja10ubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHRyYWNrZWQpO1xuICAgIH0pO1xuICB9KS5vYnNlcnZlKHJvb3QsIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gIHJldHVybiB0cmFja2VkO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUNPLElBQU0sUUFBUSxXQUFXLFNBQVMsT0FBTyxXQUFXLFNBQVMsUUFBUSxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixDQUFDLEtBQUs7QUFFOUgsSUFBTSxjQUFjO0FBRTNCLElBQU0sV0FBVztBQUFBLEVBQ2YsT0FBTyxNQUFXO0FBQ2hCLFFBQUksTUFBTyxTQUFRLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsa0JBQWlCLElBQUksQ0FBQztBQUFBLEVBQ25HO0FBQUEsRUFDQSxRQUFRLE1BQVc7QUFDakIsUUFBSSxNQUFPLFNBQVEsS0FBSyxpQkFBaUIsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsRUFDckc7QUFBQSxFQUNBLFFBQVEsTUFBVztBQUNqQixRQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLElBQUk7QUFBQSxFQUNsRDtBQUNGOzs7QUNOQSxJQUFNLFVBQVUsQ0FBQyxNQUFTO0FBQUM7QUFFcEIsU0FBUyxXQUFrQztBQUNoRCxNQUFJLFVBQStDO0FBQ25ELE1BQUksU0FBK0I7QUFDbkMsUUFBTSxVQUFVLElBQUksUUFBVyxJQUFJLE1BQU0sQ0FBQyxTQUFTLE1BQU0sSUFBSSxDQUFDO0FBQzlELFVBQVEsVUFBVTtBQUNsQixVQUFRLFNBQVM7QUFDakIsTUFBSSxPQUFPO0FBQ1QsVUFBTSxlQUFlLElBQUksTUFBTSxFQUFFO0FBQ2pDLFlBQVEsTUFBTSxRQUFPLGNBQWMsU0FBUyxJQUFJLGlCQUFpQixRQUFTLFNBQVEsSUFBSSxzQkFBc0IsSUFBSSxpQkFBaUIsWUFBWSxJQUFJLE1BQVM7QUFBQSxFQUM1SjtBQUNBLFNBQU87QUFDVDtBQUdPLFNBQVMsYUFBYSxHQUE0QjtBQUN2RCxTQUFPLEtBQUssT0FBTyxNQUFNLFlBQVksT0FBTyxNQUFNO0FBQ3BEO0FBRU8sU0FBUyxjQUFpQixHQUE2QjtBQUM1RCxTQUFPLGFBQWEsQ0FBQyxLQUFNLFVBQVUsS0FBTSxPQUFPLEVBQUUsU0FBUztBQUMvRDs7O0FDL0JBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBb0NPLElBQU0sY0FBYyxPQUFPLGFBQWE7QUF1RHhDLFNBQVMsZ0JBQTZCLEdBQWtEO0FBQzdGLFNBQU8sYUFBYSxDQUFDLEtBQUssVUFBVSxLQUFLLE9BQU8sR0FBRyxTQUFTO0FBQzlEO0FBQ08sU0FBUyxnQkFBNkIsR0FBa0Q7QUFDN0YsU0FBTyxhQUFhLENBQUMsS0FBTSxPQUFPLGlCQUFpQixLQUFNLE9BQU8sRUFBRSxPQUFPLGFBQWEsTUFBTTtBQUM5RjtBQUNPLFNBQVMsWUFBeUIsR0FBd0Y7QUFDL0gsU0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLGdCQUFnQixDQUFDO0FBQ2hEO0FBSU8sU0FBUyxjQUFpQixHQUFxQjtBQUNwRCxNQUFJLGdCQUFnQixDQUFDLEVBQUcsUUFBTztBQUMvQixNQUFJLGdCQUFnQixDQUFDLEVBQUcsUUFBTyxFQUFFLE9BQU8sYUFBYSxFQUFFO0FBQ3ZELFFBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUN6QztBQUdPLElBQU0sY0FBYztBQUFBLEVBQ3pCLFVBQ0UsSUFDQSxlQUFrQyxRQUNsQztBQUNBLFdBQU8sVUFBVSxNQUFNLElBQUksWUFBWTtBQUFBLEVBQ3pDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsU0FBK0UsR0FBTTtBQUNuRixXQUFPLE1BQU0sTUFBTSxHQUFHLENBQUM7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsUUFBaUUsUUFBVztBQUMxRSxXQUFPLFFBQVEsT0FBTyxPQUFPLEVBQUUsU0FBUyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFDekQ7QUFDRjtBQUVBLElBQU0sWUFBWSxDQUFDLEdBQUcsT0FBTyxzQkFBc0IsV0FBVyxHQUFHLEdBQUcsT0FBTyxLQUFLLFdBQVcsQ0FBQztBQUc1RixTQUFTLGFBQXlDLEdBQU0sR0FBTTtBQUM1RCxRQUFNLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUMsR0FBRyxHQUFHLE9BQU8sc0JBQXNCLENBQUMsQ0FBQztBQUNsRixhQUFXLEtBQUssTUFBTTtBQUNwQixXQUFPLGVBQWUsR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLHlCQUF5QixHQUFHLENBQUMsR0FBRyxZQUFZLE1BQU0sQ0FBQztBQUFBLEVBQzdGO0FBQ0EsU0FBTztBQUNUO0FBRUEsSUFBTSxXQUFXLE9BQU8sU0FBUztBQUNqQyxJQUFNLFNBQVMsT0FBTyxPQUFPO0FBQzdCLFNBQVMsZ0NBQW1DLE9BQU8sTUFBTTtBQUFFLEdBQUc7QUFDNUQsUUFBTSxJQUFJO0FBQUEsSUFDUixDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQUEsSUFDYixDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFFWCxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQ3ZCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxPQUFPO0FBQ0wsVUFBSSxFQUFFLE1BQU0sR0FBRyxRQUFRO0FBQ3JCLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtBQUFBLE1BQzNDO0FBRUEsVUFBSSxDQUFDLEVBQUUsUUFBUTtBQUNiLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sT0FBVSxDQUFDO0FBRWxFLFlBQU0sUUFBUSxTQUE0QjtBQUcxQyxZQUFNLE1BQU0sUUFBTTtBQUFBLE1BQUUsQ0FBQztBQUNyQixRQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFDekIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE9BQU8sR0FBYTtBQUNsQixZQUFNLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxPQUFVO0FBQ3RELFVBQUksRUFBRSxRQUFRLEdBQUc7QUFDZixZQUFJO0FBQUUsZUFBSztBQUFBLFFBQUUsU0FBUyxJQUFJO0FBQUEsUUFBRTtBQUM1QixlQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ2pCLFlBQUUsUUFBUSxFQUFFLElBQUksRUFBRyxRQUFRLEtBQUs7QUFDbEMsVUFBRSxNQUFNLElBQUksRUFBRSxRQUFRLElBQUk7QUFBQSxNQUM1QjtBQUNBLGFBQU8sUUFBUSxRQUFRLEtBQUs7QUFBQSxJQUM5QjtBQUFBLElBRUEsU0FBUyxNQUFhO0FBQ3BCLFlBQU0sUUFBUSxFQUFFLE1BQU0sTUFBZSxPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQ3BELFVBQUksRUFBRSxRQUFRLEdBQUc7QUFDZixZQUFJO0FBQUUsZUFBSztBQUFBLFFBQUUsU0FBUyxJQUFJO0FBQUEsUUFBRTtBQUM1QixlQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ2pCLFlBQUUsUUFBUSxFQUFFLElBQUksRUFBRyxPQUFPLEtBQUs7QUFDakMsVUFBRSxNQUFNLElBQUksRUFBRSxRQUFRLElBQUk7QUFBQSxNQUM1QjtBQUNBLGFBQU8sUUFBUSxPQUFPLEtBQUs7QUFBQSxJQUM3QjtBQUFBLElBRUEsSUFBSSxTQUFTO0FBQ1gsVUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFHLFFBQU87QUFDdkIsYUFBTyxFQUFFLE1BQU0sRUFBRTtBQUFBLElBQ25CO0FBQUEsSUFFQSxLQUFLLE9BQVU7QUFDYixVQUFJLENBQUMsRUFBRSxRQUFRO0FBQ2IsZUFBTztBQUVULFVBQUksRUFBRSxRQUFRLEVBQUUsUUFBUTtBQUN0QixVQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUcsUUFBUSxFQUFFLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxNQUNuRCxPQUFPO0FBQ0wsWUFBSSxDQUFDLEVBQUUsTUFBTSxHQUFHO0FBQ2QsbUJBQVEsSUFBSSxpREFBaUQ7QUFBQSxRQUMvRCxPQUFPO0FBQ0wsWUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxRQUN2QztBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixDQUFDO0FBQzFCO0FBRUEsSUFBTSxZQUFZLE9BQU8sVUFBVTtBQUNuQyxTQUFTLHdDQUEyQyxPQUFPLE1BQU07QUFBRSxHQUFHO0FBQ3BFLFFBQU0sSUFBSSxnQ0FBbUMsSUFBSTtBQUNqRCxJQUFFLFNBQVMsSUFBSSxvQkFBSSxJQUFPO0FBRTFCLElBQUUsT0FBTyxTQUFVLE9BQVU7QUFDM0IsUUFBSSxDQUFDLEVBQUUsUUFBUTtBQUNiLGFBQU87QUFHVCxRQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksS0FBSztBQUN4QixhQUFPO0FBRVQsUUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRO0FBQ3RCLFFBQUUsU0FBUyxFQUFFLElBQUksS0FBSztBQUN0QixZQUFNLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSTtBQUMxQixRQUFFLFFBQVEsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUMxQyxRQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsSUFDbEMsT0FBTztBQUNMLFVBQUksQ0FBQyxFQUFFLE1BQU0sR0FBRztBQUNkLGlCQUFRLElBQUksaURBQWlEO0FBQUEsTUFDL0QsV0FBVyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssT0FBSyxFQUFFLFVBQVUsS0FBSyxHQUFHO0FBQ2xELFVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsTUFDdkM7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxTQUFPO0FBQ1Q7QUFHTyxJQUFNLDBCQUFnRjtBQUN0RixJQUFNLGtDQUF3RjtBQWdCckcsSUFBTSx3QkFBd0IsT0FBTyx1QkFBdUI7QUFDckQsU0FBUyx1QkFBdUcsS0FBUSxNQUFTLEdBQStDO0FBSXJMLE1BQUksZUFBZSxNQUFNO0FBQ3ZCLG1CQUFlLE1BQU07QUFDckIsVUFBTSxLQUFLLGdDQUFtQztBQUM5QyxVQUFNLEtBQUssR0FBRyxNQUFNO0FBQ3BCLFVBQU0sSUFBSSxHQUFHLE9BQU8sYUFBYSxFQUFFO0FBQ25DLFdBQU8sT0FBTyxhQUFhLElBQUksR0FBRyxPQUFPLGFBQWE7QUFDdEQsV0FBTyxHQUFHO0FBQ1YsY0FBVSxRQUFRO0FBQUE7QUFBQSxNQUNoQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQW1CO0FBQUEsS0FBQztBQUNwQyxRQUFJLEVBQUUseUJBQXlCO0FBQzdCLG1CQUFhLEdBQUcsTUFBTTtBQUN4QixXQUFPO0FBQUEsRUFDVDtBQUdBLFdBQVMsZ0JBQW9ELFFBQVc7QUFDdEUsV0FBTztBQUFBLE1BQ0wsQ0FBQyxNQUFNLEdBQUcsWUFBNEIsTUFBYTtBQUNqRCxxQkFBYTtBQUViLGVBQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLElBQUk7QUFBQSxNQUNuQztBQUFBLElBQ0YsRUFBRSxNQUFNO0FBQUEsRUFDVjtBQVFBLFFBQU0sU0FBUyxFQUFFLENBQUMsT0FBTyxhQUFhLEdBQUcsYUFBYTtBQUN0RCxZQUFVLFFBQVEsQ0FBQztBQUFBO0FBQUEsSUFDakIsT0FBTyxDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFBQSxHQUFDO0FBQ2hDLE1BQUksT0FBTyxNQUFNLFlBQVksS0FBSyxlQUFlLEtBQUssRUFBRSxXQUFXLE1BQU0sV0FBVztBQUNsRixXQUFPLFdBQVcsSUFBSSxFQUFFLFdBQVc7QUFBQSxFQUNyQztBQUdBLE1BQUksT0FBMkMsQ0FBQ0EsT0FBUztBQUN2RCxpQkFBYTtBQUNiLFdBQU8sS0FBS0EsRUFBQztBQUFBLEVBQ2Y7QUFFQSxNQUFJLElBQUksSUFBSSxHQUFHLE1BQU07QUFDckIsTUFBSSxRQUFzQztBQUUxQyxTQUFPLGVBQWUsS0FBSyxNQUFNO0FBQUEsSUFDL0IsTUFBUztBQUFFLGFBQU87QUFBQSxJQUFFO0FBQUEsSUFDcEIsSUFBSUEsSUFBOEI7QUFDaEMsVUFBSUEsT0FBTSxHQUFHO0FBQ1gsWUFBSSxnQkFBZ0JBLEVBQUMsR0FBRztBQVl0QixjQUFJLFVBQVVBO0FBQ1o7QUFFRixrQkFBUUE7QUFDUixjQUFJLFFBQVEsUUFBUSxJQUFJLE1BQU0sSUFBSTtBQUNsQyxjQUFJO0FBQ0YscUJBQVEsS0FBSyxJQUFJLE1BQU0sYUFBYSxLQUFLLFNBQVMsQ0FBQyw4RUFBOEUsQ0FBQztBQUNwSSxrQkFBUSxLQUFLQSxJQUFHLE9BQUs7QUFDbkIsZ0JBQUlBLE9BQU0sT0FBTztBQUVmLG9CQUFNLElBQUksTUFBTSxtQkFBbUIsS0FBSyxTQUFTLENBQUMsMkNBQTJDLEVBQUUsT0FBTyxNQUFNLENBQUM7QUFBQSxZQUMvRztBQUNBLGlCQUFLLEdBQUcsUUFBUSxDQUFNO0FBQUEsVUFDeEIsQ0FBQyxFQUNFLE1BQU0sUUFBTSxTQUFRLEtBQUssRUFBRSxDQUFDLEVBQzVCLFFBQVEsTUFBT0EsT0FBTSxVQUFXLFFBQVEsT0FBVTtBQUdyRDtBQUFBLFFBQ0YsT0FBTztBQUNMLGNBQUksU0FBUyxPQUFPO0FBQ2xCLHFCQUFRLElBQUksYUFBYSxLQUFLLFNBQVMsQ0FBQywwRUFBMEU7QUFBQSxVQUNwSDtBQUNBLGNBQUksSUFBSUEsSUFBRyxNQUFNO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQ0EsV0FBS0EsSUFBRyxRQUFRLENBQU07QUFBQSxJQUN4QjtBQUFBLElBQ0EsWUFBWTtBQUFBLEVBQ2QsQ0FBQztBQUNELFNBQU87QUFFUCxXQUFTLElBQU9DLElBQU0sS0FBdUQ7QUFDM0UsUUFBSUEsT0FBTSxRQUFRQSxPQUFNLFFBQVc7QUFDakMsYUFBTyxhQUFhLE9BQU8sT0FBTyxNQUFNO0FBQUEsUUFDdEMsU0FBUyxFQUFFLFFBQVE7QUFBRSxpQkFBT0E7QUFBQSxRQUFFLEdBQUcsVUFBVSxNQUFNLGNBQWMsS0FBSztBQUFBLFFBQ3BFLFFBQVEsRUFBRSxRQUFRO0FBQUUsaUJBQU9BO0FBQUEsUUFBRSxHQUFHLFVBQVUsTUFBTSxjQUFjLEtBQUs7QUFBQSxNQUNyRSxDQUFDLEdBQUcsR0FBRztBQUFBLElBQ1Q7QUFDQSxZQUFRLE9BQU9BLElBQUc7QUFBQSxNQUNoQixLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBRUgsZUFBTyxhQUFhLE9BQU9BLEVBQUMsR0FBRyxPQUFPLE9BQU8sS0FBSztBQUFBLFVBQ2hELFNBQVM7QUFBRSxtQkFBT0EsR0FBRSxRQUFRO0FBQUEsVUFBRTtBQUFBLFFBQ2hDLENBQUMsQ0FBQztBQUFBLE1BQ0osS0FBSztBQUtILGVBQU8sVUFBVUEsSUFBRyxHQUFHO0FBQUEsSUFFM0I7QUFDQSxVQUFNLElBQUksVUFBVSw0Q0FBNEMsT0FBT0EsS0FBSSxHQUFHO0FBQUEsRUFDaEY7QUFJQSxXQUFTLHVCQUF1QixHQUFvQztBQUNsRSxXQUFPLGFBQWEsQ0FBQyxLQUFLLHlCQUF5QjtBQUFBLEVBQ3JEO0FBQ0EsV0FBUyxZQUFZLEdBQVEsTUFBYztBQUN6QyxVQUFNLFNBQVMsS0FBSyxNQUFNLEdBQUcsRUFBRSxNQUFNLENBQUM7QUFDdEMsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFdBQVksSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sUUFBWSxJQUFJO0FBQy9FLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxVQUFVQSxJQUFNLEtBQTJDO0FBQ2xFLFFBQUk7QUFDSixRQUFJO0FBQ0osV0FBTyxJQUFJLE1BQU1BLElBQWEsUUFBUSxDQUFDO0FBRXZDLGFBQVMsUUFBUSxPQUFPLElBQTBCO0FBQ2hELGFBQU87QUFBQTtBQUFBLFFBRUwsSUFBSSxRQUFRLEtBQUs7QUFDZixpQkFBTyxRQUFRLHlCQUF5QixRQUFRLE9BQU8sZUFBZSxPQUFPLFVBQVUsT0FBTztBQUFBLFFBQ2hHO0FBQUE7QUFBQSxRQUVBLElBQUksUUFBUSxLQUFLLE9BQU8sVUFBVTtBQUNoQyxjQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsR0FBRztBQUMzQixrQkFBTSxJQUFJLE1BQU0sY0FBYyxLQUFLLFNBQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUM7QUFBQSxVQUN6RztBQUNBLGNBQUksUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRLE1BQU0sT0FBTztBQUNoRCxpQkFBSyxFQUFFLENBQUMscUJBQXFCLEdBQUcsRUFBRSxHQUFBQSxJQUFHLEtBQUssRUFBRSxDQUFRO0FBQUEsVUFDdEQ7QUFDQSxpQkFBTyxRQUFRLElBQUksUUFBUSxLQUFLLE9BQU8sUUFBUTtBQUFBLFFBQ2pEO0FBQUEsUUFDQSxlQUFlLFFBQVEsS0FBSztBQUMxQixjQUFJLFFBQVEsZUFBZSxRQUFRLEdBQUcsR0FBRztBQUN2QyxpQkFBSyxFQUFFLENBQUMscUJBQXFCLEdBQUcsRUFBRSxHQUFBQSxJQUFHLEtBQUssRUFBRSxDQUFRO0FBQ3BELG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBO0FBQUEsUUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVO0FBRXpCLGNBQUksT0FBTyxPQUFPLEtBQUssR0FBRyxHQUFHO0FBQzNCLGdCQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2hCLDRDQUFnQixVQUFVLEtBQUssT0FBSyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDO0FBQzlGLHFCQUFPLFlBQVksR0FBdUI7QUFBQSxZQUM1QyxPQUFPO0FBQ0wsc0NBQWEsVUFBVSxLQUFLLE9BQUssdUJBQXVCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixJQUFJLEVBQUUsR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBRTVHLGtCQUFJLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBRyxNQUFNO0FBQ3JDLHNCQUFNRCxLQUFJLFlBQVksRUFBRSxHQUFHLElBQUk7QUFDL0IsdUJBQU8sTUFBTUEsTUFBSyxFQUFFLFNBQVMsUUFBUSxFQUFFLEtBQUssV0FBVyxJQUFJLElBQUlBLEtBQUk7QUFBQSxjQUNyRSxHQUFHLFFBQVEsWUFBWUMsSUFBRyxJQUFJLENBQUM7QUFDL0IscUJBQU8sR0FBRyxHQUFzQjtBQUFBLFlBQ2xDO0FBQUEsVUFDRjtBQUdBLGNBQUksUUFBUSxVQUFXLFFBQU8sTUFBTSxZQUFZQSxJQUFHLElBQUk7QUFDdkQsY0FBSSxRQUFRLE9BQU8sYUFBYTtBQUU5QixtQkFBTyxTQUFVLE1BQXdDO0FBQ3ZELGtCQUFJLFFBQVEsSUFBSSxRQUFRLEdBQUc7QUFDekIsdUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFDM0Qsa0JBQUksU0FBUyxTQUFVLFFBQU8sT0FBTyxTQUFTO0FBQzlDLGtCQUFJLFNBQVMsU0FBVSxRQUFPLE9BQU8sTUFBTTtBQUMzQyxxQkFBTyxPQUFPLFFBQVE7QUFBQSxZQUN4QjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGlCQUFLLEVBQUUsT0FBTyxXQUFXLE9BQU8sT0FBTyxRQUFRLEdBQUcsTUFBTSxFQUFFLGVBQWUsVUFBVSxPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQ3JILG9CQUFNLFFBQVEsUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRO0FBQy9DLHFCQUFRLE9BQU8sVUFBVSxjQUFlLFlBQVksS0FBSyxJQUNyRCxRQUNBLElBQUksTUFBTSxPQUFPLEtBQUssR0FBRyxRQUFRLE9BQU8sTUFBTSxHQUFHLENBQUM7QUFBQSxZQUN4RDtBQUFBLFVBQ0Y7QUFFQSxpQkFBTyxRQUFRLElBQUksUUFBUSxLQUFLLFFBQVE7QUFBQSxRQUMxQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBS0EsSUFBTSxVQUFVLElBQUksUUFBYSxNQUFNO0FBQUUsQ0FBQztBQVFuQyxJQUFNLFFBQVEsSUFBZ0gsT0FBVTtBQUM3SSxRQUFNLEtBQXlDLElBQUksTUFBTSxHQUFHLE1BQU07QUFDbEUsUUFBTSxXQUFvRSxJQUFJLE1BQU0sR0FBRyxNQUFNO0FBRTdGLE1BQUksT0FBTyxNQUFNO0FBQ2YsV0FBTyxNQUFNO0FBQUEsSUFBRTtBQUNmLGFBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxRQUFRLEtBQUs7QUFDbEMsWUFBTSxJQUFJLEdBQUcsQ0FBQztBQUNkLGVBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLE9BQU8saUJBQWlCLElBQzNDLEVBQUUsT0FBTyxhQUFhLEVBQUUsSUFDeEIsR0FDRCxLQUFLLEVBQ0wsS0FBSyxhQUFXLEVBQUUsS0FBSyxHQUFHLE9BQU8sRUFBRTtBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUVBLFFBQU0sVUFBZ0MsQ0FBQztBQUN2QyxNQUFJLFFBQVEsU0FBUztBQUVyQixRQUFNLFNBQTJDO0FBQUEsSUFDL0MsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUFFLGFBQU87QUFBQSxJQUFPO0FBQUEsSUFDekMsT0FBTztBQUNMLFdBQUs7QUFDTCxhQUFPLFFBQ0gsUUFBUSxLQUFLLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sTUFBTTtBQUNqRCxZQUFJLE9BQU8sTUFBTTtBQUNmO0FBQ0EsbUJBQVMsR0FBRyxJQUFJO0FBQ2hCLGtCQUFRLEdBQUcsSUFBSSxPQUFPO0FBR3RCLGlCQUFPLE9BQU8sS0FBSztBQUFBLFFBQ3JCLE9BQU87QUFFTCxtQkFBUyxHQUFHLElBQUksR0FBRyxHQUFHLElBQ2xCLEdBQUcsR0FBRyxFQUFHLEtBQUssRUFBRSxLQUFLLENBQUFDLGFBQVcsRUFBRSxLQUFLLFFBQUFBLFFBQU8sRUFBRSxFQUFFLE1BQU0sU0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsRUFBRSxFQUFFLElBQzFHLFFBQVEsUUFBUSxFQUFFLEtBQUssUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLE9BQVUsRUFBRSxDQUFDO0FBQ3JFLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0YsQ0FBQyxFQUFFLE1BQU0sUUFBTTtBQUNiLGVBQU8sT0FBTyxRQUFRLEVBQUUsS0FBSyxRQUFRLE9BQU8sRUFBRSxNQUFNLE1BQWUsT0FBTyxJQUFJLE1BQU0sMEJBQTBCLEVBQUUsQ0FBQztBQUFBLE1BQ25ILENBQUMsSUFDQyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxRQUFRLENBQUM7QUFBQSxJQUM3RDtBQUFBLElBQ0EsTUFBTSxPQUFPLEdBQUc7QUFDZCxlQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxLQUFLO0FBQ2xDLFlBQUksU0FBUyxDQUFDLE1BQU0sU0FBUztBQUMzQixtQkFBUyxDQUFDLElBQUk7QUFDZCxrQkFBUSxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxTQUFTLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxPQUFLLEVBQUUsT0FBTyxRQUFNLEVBQUU7QUFBQSxRQUMxRjtBQUFBLE1BQ0Y7QUFDQSxhQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sUUFBUTtBQUFBLElBQ3RDO0FBQUEsSUFDQSxNQUFNLE1BQU0sSUFBUztBQUNuQixlQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxLQUFLO0FBQ2xDLFlBQUksU0FBUyxDQUFDLE1BQU0sU0FBUztBQUMzQixtQkFBUyxDQUFDLElBQUk7QUFDZCxrQkFBUSxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsRUFBRSxLQUFLLE9BQUssRUFBRSxPQUFPLENBQUFDLFFBQU1BLEdBQUU7QUFBQSxRQUNuRTtBQUFBLE1BQ0Y7QUFHQSxhQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sUUFBUTtBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLE1BQXFEO0FBQzlFO0FBY08sSUFBTSxVQUFVLENBQTZCLEtBQVEsT0FBdUIsQ0FBQyxNQUFpQztBQUNuSCxRQUFNLGNBQXVDLENBQUM7QUFDOUMsTUFBSTtBQUNKLE1BQUksS0FBMkIsQ0FBQztBQUNoQyxNQUFJLFNBQWlCO0FBQ3JCLFFBQU0sS0FBSztBQUFBLElBQ1QsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUFFLGFBQU87QUFBQSxJQUFHO0FBQUEsSUFDckMsT0FBeUQ7QUFDdkQsVUFBSSxPQUFPLFFBQVc7QUFDcEIsYUFBSyxPQUFPLFFBQVEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVE7QUFDOUMsb0JBQVU7QUFDVixhQUFHLEdBQUcsSUFBSSxJQUFJLE9BQU8sYUFBYSxFQUFHO0FBQ3JDLGlCQUFPLEdBQUcsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLFNBQU8sRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7QUFBQSxRQUN2RCxDQUFDO0FBQUEsTUFDSDtBQUVBLGFBQVEsU0FBUyxPQUF5RDtBQUN4RSxlQUFPLFFBQVEsS0FBSyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxHQUFHLEdBQUcsTUFBTTtBQUMvQyxjQUFJLEdBQUcsTUFBTTtBQUNYLGVBQUcsR0FBRyxJQUFJO0FBQ1Ysc0JBQVU7QUFDVixnQkFBSSxDQUFDO0FBQ0gscUJBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxPQUFVO0FBQ3hDLG1CQUFPLEtBQUs7QUFBQSxVQUNkLE9BQU87QUFFTCx3QkFBWSxDQUFDLElBQUksR0FBRztBQUNwQixlQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFBQyxTQUFPLEVBQUUsS0FBSyxHQUFHLElBQUFBLElBQUcsRUFBRTtBQUFBLFVBQ3REO0FBQ0EsY0FBSSxLQUFLLGVBQWU7QUFDdEIsZ0JBQUksT0FBTyxLQUFLLFdBQVcsRUFBRSxTQUFTLE9BQU8sS0FBSyxHQUFHLEVBQUU7QUFDckQscUJBQU8sS0FBSztBQUFBLFVBQ2hCO0FBQ0EsaUJBQU8sRUFBRSxNQUFNLE9BQU8sT0FBTyxZQUFZO0FBQUEsUUFDM0MsQ0FBQztBQUFBLE1BQ0gsRUFBRztBQUFBLElBQ0w7QUFBQSxJQUNBLE9BQU8sR0FBUztBQUNkLFNBQUcsUUFBUSxDQUFDLEdBQUcsUUFBUTtBQUNyQixZQUFJLE1BQU0sU0FBUztBQUNqQixhQUFHLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFBQSxRQUNwQjtBQUFBLE1BQ0YsQ0FBQztBQUNELGFBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDO0FBQUEsSUFDakQ7QUFBQSxJQUNBLE1BQU0sSUFBUztBQUNiLFNBQUcsUUFBUSxDQUFDLEdBQUcsUUFBUTtBQUNyQixZQUFJLE1BQU0sU0FBUztBQUNqQixhQUFHLEdBQUcsRUFBRSxRQUFRLEVBQUU7QUFBQSxRQUNwQjtBQUFBLE1BQ0YsQ0FBQztBQUNELGFBQU8sUUFBUSxPQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBQ0EsU0FBTyxnQkFBZ0IsRUFBRTtBQUMzQjtBQUdBLFNBQVMsZ0JBQW1CLEdBQW9DO0FBQzlELFNBQU8sZ0JBQWdCLENBQUMsS0FDbkIsVUFBVSxNQUFNLE9BQU0sS0FBSyxLQUFPLEVBQVUsQ0FBQyxNQUFNLFlBQVksQ0FBQyxDQUFDO0FBQ3hFO0FBR08sU0FBUyxnQkFBOEMsSUFBK0U7QUFDM0ksTUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUc7QUFDeEIsaUJBQWEsSUFBSSxXQUFXO0FBQUEsRUFDOUI7QUFDQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLGlCQUE0RSxHQUFNO0FBQ2hHLFNBQU8sWUFBYSxNQUFvQztBQUN0RCxVQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFDcEIsV0FBTyxnQkFBZ0IsRUFBRTtBQUFBLEVBQzNCO0FBQ0Y7QUFZQSxlQUFlLFFBQXdELEdBQTRFO0FBQ2pKLE1BQUksT0FBNkM7QUFDakQsbUJBQWlCLEtBQUssTUFBK0M7QUFDbkUsV0FBTyxJQUFJLENBQUM7QUFBQSxFQUNkO0FBQ0EsUUFBTTtBQUNSO0FBTU8sSUFBTSxTQUFTLE9BQU8sUUFBUTtBQUlyQyxTQUFTLFlBQWtCLEdBQXFCLE1BQW1CLFFBQTJDO0FBQzVHLE1BQUksY0FBYyxDQUFDO0FBQ2pCLFdBQU8sRUFBRSxLQUFLLE1BQU0sTUFBTTtBQUM1QixNQUFJO0FBQ0YsV0FBTyxLQUFLLENBQUM7QUFBQSxFQUNmLFNBQVMsSUFBSTtBQUNYLFdBQU8sT0FBTyxFQUFFO0FBQUEsRUFDbEI7QUFDRjtBQUVPLFNBQVMsVUFBd0MsUUFDdEQsSUFDQSxlQUFrQyxRQUNsQyxPQUEwQixRQUNIO0FBQ3ZCLE1BQUk7QUFDSixXQUFTLEtBQUssR0FBa0c7QUFFOUcsU0FBSyxNQUFNO0FBQ1gsV0FBTztBQUNQLFdBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLE1BQU07QUFBQSxFQUN2QztBQUNBLE1BQUksTUFBZ0M7QUFBQSxJQUNsQyxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQ3ZCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxRQUFRLE1BQXdCO0FBQzlCLFVBQUksaUJBQWlCLFFBQVE7QUFDM0IsY0FBTSxPQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sT0FBTyxPQUFPLGFBQWEsQ0FBQztBQUNqRSx1QkFBZTtBQUNmLGVBQU87QUFBQSxNQUNUO0FBRUEsYUFBTyxJQUFJLFFBQTJCLFNBQVMsS0FBSyxTQUFTLFFBQVE7QUFDbkUsWUFBSSxDQUFDO0FBQ0gsZUFBSyxPQUFPLE9BQU8sYUFBYSxFQUFHO0FBQ3JDLFdBQUcsS0FBSyxHQUFHLElBQUksRUFBRTtBQUFBLFVBQ2YsT0FBSyxFQUFFLFFBQ0YsT0FBTyxRQUFRLFFBQVEsQ0FBQyxLQUN6QjtBQUFBLFlBQVksR0FBRyxFQUFFLE9BQU8sSUFBSTtBQUFBLFlBQzVCLE9BQUssTUFBTSxTQUNQLEtBQUssU0FBUyxNQUFNLElBQ3BCLFFBQVEsRUFBRSxNQUFNLE9BQU8sT0FBTyxPQUFPLEVBQUUsQ0FBQztBQUFBLFlBQzVDLFFBQU07QUFDSixxQkFBTztBQUVQLGlCQUFHLFFBQVEsR0FBRyxNQUFNLEVBQUUsSUFBSSxHQUFHLFNBQVMsRUFBRTtBQUN4QyxxQkFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLFlBQ2xDO0FBQUEsVUFDRjtBQUFBLFVBQ0YsUUFBTTtBQUVKLG1CQUFPO0FBQ1AsbUJBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxVQUNsQztBQUFBLFFBQ0YsRUFBRSxNQUFNLFFBQU07QUFFWixpQkFBTztBQUNQLGFBQUcsUUFBUSxHQUFHLE1BQU0sRUFBRSxJQUFJLEdBQUcsU0FBUyxFQUFFO0FBQ3hDLGlCQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsUUFDbEMsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUVBLE1BQU0sSUFBUztBQUViLGFBQU8sUUFBUSxRQUFRLElBQUksUUFBUSxHQUFHLE1BQU0sRUFBRSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUMvRTtBQUFBLElBRUEsT0FBTyxHQUFTO0FBRWQsYUFBTyxRQUFRLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQ25EO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLEdBQUc7QUFDNUI7QUFFQSxTQUFTLElBQTJDLFFBQWtFO0FBQ3BILFNBQU8sVUFBVSxNQUFNLE1BQU07QUFDL0I7QUFFQSxTQUFTLE9BQTJDLElBQStHO0FBQ2pLLFNBQU8sVUFBVSxNQUFNLE9BQU0sTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksTUFBTztBQUM5RDtBQUVBLFNBQVMsT0FBMkMsSUFBaUo7QUFDbk0sU0FBTyxLQUNILFVBQVUsTUFBTSxPQUFPLEdBQUcsTUFBTyxNQUFNLFVBQVUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFLLElBQUksTUFBTSxJQUM3RSxVQUFVLE1BQU0sQ0FBQyxHQUFHLE1BQU0sTUFBTSxJQUFJLFNBQVMsQ0FBQztBQUNwRDtBQUVBLFNBQVMsVUFBMEUsV0FBOEQ7QUFDL0ksU0FBTyxVQUFVLE1BQU0sT0FBSyxHQUFHLFNBQVM7QUFDMUM7QUFFQSxTQUFTLFFBQTRDLElBQTJHO0FBQzlKLFNBQU8sVUFBVSxNQUFNLE9BQUssSUFBSSxRQUFnQyxhQUFXO0FBQUUsT0FBRyxNQUFNLFFBQVEsQ0FBQyxDQUFDO0FBQUcsV0FBTztBQUFBLEVBQUUsQ0FBQyxDQUFDO0FBQ2hIO0FBRUEsU0FBUyxRQUFzRjtBQUU3RixRQUFNLFNBQVM7QUFDZixNQUFJLFlBQVk7QUFDaEIsTUFBSTtBQUNKLE1BQUksS0FBbUQ7QUFHdkQsV0FBUyxLQUFLLElBQTZCO0FBQ3pDLFFBQUksR0FBSSxTQUFRLFFBQVEsRUFBRTtBQUMxQixRQUFJLElBQUksTUFBTTtBQUVaLGdCQUFVO0FBQUEsSUFDWixPQUFPO0FBQ0wsZ0JBQVUsU0FBNEI7QUFDdEMsU0FBSSxLQUFLLEVBQ04sS0FBSyxJQUFJLEVBQ1QsTUFBTSxXQUFTO0FBQ2QsZ0JBQVEsT0FBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUUzQyxrQkFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNGO0FBRUEsV0FBUyxLQUFLLEdBQW1HO0FBRS9HLFNBQUssTUFBTSxVQUFVO0FBQ3JCLFdBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLE1BQU07QUFBQSxFQUN2QztBQUVBLE1BQUksTUFBZ0M7QUFBQSxJQUNsQyxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQ3ZCLG1CQUFhO0FBQ2IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE9BQU87QUFDTCxVQUFJLENBQUMsSUFBSTtBQUNQLGFBQUssT0FBTyxPQUFPLGFBQWEsRUFBRztBQUNuQyxhQUFLO0FBQUEsTUFDUDtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxNQUFNLElBQVM7QUFFYixVQUFJLFlBQVk7QUFDZCxjQUFNLElBQUksTUFBTSw4QkFBOEI7QUFDaEQsbUJBQWE7QUFDYixVQUFJO0FBQ0YsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDbEQsYUFBTyxRQUFRLFFBQVEsSUFBSSxRQUFRLEdBQUcsTUFBTSxFQUFFLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQy9FO0FBQUEsSUFFQSxPQUFPLEdBQVM7QUFFZCxVQUFJLFlBQVk7QUFDZCxjQUFNLElBQUksTUFBTSw4QkFBOEI7QUFDaEQsbUJBQWE7QUFDYixVQUFJO0FBQ0YsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFDakQsYUFBTyxRQUFRLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQ25EO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLEdBQUc7QUFDNUI7QUFFTyxTQUFTLCtCQUErQjtBQUM3QyxNQUFJLElBQUssbUJBQW1CO0FBQUEsRUFBRSxFQUFHO0FBQ2pDLFNBQU8sR0FBRztBQUNSLFVBQU0sT0FBTyxPQUFPLHlCQUF5QixHQUFHLE9BQU8sYUFBYTtBQUNwRSxRQUFJLE1BQU07QUFDUixzQkFBZ0IsQ0FBQztBQUNqQjtBQUFBLElBQ0Y7QUFDQSxRQUFJLE9BQU8sZUFBZSxDQUFDO0FBQUEsRUFDN0I7QUFDQSxNQUFJLENBQUMsR0FBRztBQUNOLGFBQVEsS0FBSyw0REFBNEQ7QUFBQSxFQUMzRTtBQUNGOzs7QUNydkJBLElBQU0sb0JBQW9CLG9CQUFJLFFBQXNIO0FBRXBKLFNBQVMsZ0JBQXdHLElBQTRDO0FBQzNKLGFBQVcsTUFBTSxpQkFBaUIsS0FBSyxNQUFNLEVBQUUsR0FBRSxDQUFDO0FBQ3BEO0FBRUEsU0FBUyxpQkFBeUcsSUFBNEM7QUFDNUosTUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUk7QUFDN0Isc0JBQWtCLElBQUksTUFBTSxvQkFBSSxJQUFJLENBQUM7QUFFdkMsUUFBTSxlQUFlLGtCQUFrQixJQUFJLElBQUksRUFBRyxJQUFJLEdBQUcsSUFBeUM7QUFDbEcsTUFBSSxjQUFjO0FBQ2hCLGVBQVcsS0FBSyxjQUFjO0FBQzVCLFVBQUk7QUFDRixjQUFNLEVBQUUsTUFBTSxXQUFXLGNBQWMsVUFBVSxnQkFBZ0IsSUFBSTtBQUNyRSxjQUFNLFlBQVksYUFBYSxNQUFNO0FBQ3JDLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxhQUFhO0FBQ3hDLGdCQUFNLE1BQU0saUJBQWlCLFdBQVcsS0FBSyxPQUFPLFlBQVksTUFBTTtBQUN0RSx1QkFBYSxPQUFPLENBQUM7QUFDckIsb0JBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQzFCLE9BQU87QUFDTCxjQUFJLEdBQUcsa0JBQWtCLE1BQU07QUFDN0IsZ0JBQUksVUFBVTtBQUNaLG9CQUFNLFFBQVEsVUFBVSxpQkFBaUIsUUFBUTtBQUNqRCx5QkFBVyxLQUFLLE9BQU87QUFDckIscUJBQUssa0JBQWtCLEVBQUUsU0FBUyxHQUFHLE1BQU0sSUFBSSxHQUFHLFdBQVcsTUFBTSxVQUFVLFNBQVMsQ0FBQztBQUNyRix1QkFBSyxFQUFFO0FBQUEsY0FDWDtBQUFBLFlBQ0YsT0FBTztBQUNMLGtCQUFJLGtCQUFrQixVQUFVLFNBQVMsR0FBRyxNQUFNLElBQUksR0FBRyxXQUFXO0FBQ2xFLHFCQUFLLEVBQUU7QUFBQSxZQUNYO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFNBQVMsSUFBSTtBQUNYLGlCQUFRLEtBQUssbUJBQW1CLEVBQUU7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTLGNBQWMsR0FBK0I7QUFDcEQsU0FBTyxRQUFRLE1BQU0sRUFBRSxXQUFXLEdBQUcsS0FBSyxFQUFFLFdBQVcsR0FBRyxLQUFNLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxTQUFTLEdBQUcsRUFBRztBQUN4RztBQUVBLFNBQVMsVUFBbUMsS0FBZ0g7QUFDMUosUUFBTSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLEdBQUc7QUFDakQsU0FBTyxFQUFFLGlCQUFpQixVQUFVLGtCQUFrQixNQUFNLElBQUksTUFBTSxHQUFFLEVBQUUsRUFBRTtBQUM5RTtBQUVBLFNBQVMsa0JBQTRDLE1BQXFIO0FBQ3hLLFFBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QixNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN4QixhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFFLFFBQVE7QUFDdEMsV0FBTyxDQUFDLEVBQUUsaUJBQWlCLE1BQU0sVUFBVSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQXNDO0FBQUEsRUFDbEc7QUFDQSxNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN0RCxhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFzQztBQUFBLEVBQzVFO0FBQ0EsU0FBTztBQUNUO0FBRUEsU0FBUyxRQUFRLFNBQXVCO0FBQ3RDLFFBQU0sSUFBSSxNQUFNLE9BQU87QUFDekI7QUFFQSxTQUFTLFVBQW9DLFdBQW9CLE1BQXNDO0FBQ3JHLFFBQU0sQ0FBQyxFQUFFLGlCQUFpQixTQUFRLEdBQUcsU0FBUyxJQUFJLGtCQUFrQixJQUFJLEtBQUssUUFBUSwyQkFBeUIsSUFBSTtBQUVsSCxNQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxhQUFhO0FBQ2hELHNCQUFrQixJQUFJLFVBQVUsZUFBZSxvQkFBSSxJQUFJLENBQUM7QUFFMUQsTUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUyxHQUFHO0FBQ25FLGNBQVUsY0FBYyxpQkFBaUIsV0FBVyxpQkFBaUI7QUFBQSxNQUNuRSxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQ0Qsc0JBQWtCLElBQUksVUFBVSxhQUFhLEVBQUcsSUFBSSxXQUFXLG9CQUFJLElBQUksQ0FBQztBQUFBLEVBQzFFO0FBRUEsUUFBTSxlQUFlLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUztBQUNsRixRQUFNLFFBQVEsd0JBQXdGLE1BQU0sYUFBYyxPQUFPLE9BQU8sQ0FBQztBQUN6SSxRQUFNLFVBQStEO0FBQUEsSUFDbkUsTUFBTSxNQUFNO0FBQUEsSUFDWixVQUFVLElBQVc7QUFBRSxZQUFNLFNBQVMsRUFBRTtBQUFBLElBQUM7QUFBQSxJQUN6QyxjQUFjLElBQUksUUFBUSxTQUFTO0FBQUEsSUFDbkM7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVBLCtCQUE2QixXQUFXLFdBQVcsQ0FBQyxRQUFRLElBQUksTUFBUyxFQUN0RSxLQUFLLE9BQUssYUFBYyxJQUFJLE9BQU8sQ0FBQztBQUV2QyxTQUFPLE1BQU0sTUFBTTtBQUNyQjtBQUVBLGdCQUFnQixrQkFBK0M7QUFDN0QsV0FBUSxJQUFJLGlCQUFpQjtBQUM3QixTQUFPO0FBQ1Q7QUFVQSxTQUFTLFdBQStDLEtBQTZCO0FBQ25GLFdBQVMsc0JBQXNCLFFBQXVDO0FBQ3BFLFdBQU8sSUFBSSxJQUFJLE1BQU07QUFBQSxFQUN2QjtBQUVBLFNBQU8sT0FBTyxPQUFPLGdCQUFnQixxQkFBb0QsR0FBRztBQUFBLElBQzFGLENBQUMsT0FBTyxhQUFhLEdBQUcsTUFBTSxJQUFJLE9BQU8sYUFBYSxFQUFFO0FBQUEsRUFDMUQsQ0FBQztBQUNIO0FBRUEsU0FBUyxvQkFBb0IsTUFBeUQ7QUFDcEYsTUFBSSxDQUFDO0FBQ0gsVUFBTSxJQUFJLE1BQU0sK0NBQStDLEtBQUssVUFBVSxJQUFJLENBQUM7QUFDckYsU0FBTyxPQUFPLFNBQVMsWUFBWSxLQUFLLENBQUMsTUFBTSxPQUFPLFFBQVEsa0JBQWtCLElBQUksQ0FBQztBQUN2RjtBQUVBLGdCQUFnQixLQUFRLEdBQWU7QUFDckMsUUFBTTtBQUNSO0FBRU8sU0FBUyxLQUErQixjQUF1QixTQUEyQjtBQUMvRixNQUFJLENBQUMsV0FBVyxRQUFRLFdBQVcsR0FBRztBQUNwQyxXQUFPLFdBQVcsVUFBVSxXQUFXLFFBQVEsQ0FBQztBQUFBLEVBQ2xEO0FBRUEsUUFBTSxZQUFZLFFBQVEsT0FBTyxVQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLFVBQVEsT0FBTyxTQUFTLFdBQzlHLFVBQVUsV0FBVyxJQUFJLElBQ3pCLGdCQUFnQixVQUNkLFVBQVUsTUFBTSxRQUFRLElBQ3hCLGNBQWMsSUFBSSxJQUNoQixLQUFLLElBQUksSUFDVCxJQUFJO0FBRVosTUFBSSxRQUFRLFNBQVMsUUFBUSxHQUFHO0FBQzlCLFVBQU0sUUFBbUM7QUFBQSxNQUN2QyxDQUFDLE9BQU8sYUFBYSxHQUFHLE1BQU07QUFBQSxNQUM5QixPQUFPO0FBQ0wsY0FBTSxPQUFPLE1BQU0sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVSxDQUFDO0FBQ25FLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxNQUNuRDtBQUFBLElBQ0Y7QUFDQSxjQUFVLEtBQUssS0FBSztBQUFBLEVBQ3RCO0FBRUEsTUFBSSxRQUFRLFNBQVMsUUFBUSxHQUFHO0FBQzlCLFVBQU0saUJBQWlCLFFBQVEsT0FBTyxtQkFBbUIsRUFBRSxJQUFJLFVBQVEsa0JBQWtCLElBQUksSUFBSSxDQUFDLENBQUM7QUFFbkcsVUFBTSxZQUFZLENBQUMsUUFBeUUsUUFBUSxPQUFPLFFBQVEsWUFBWSxDQUFDLFVBQVUsY0FBYyxHQUFHLENBQUM7QUFFNUosVUFBTSxVQUFVLGVBQWUsSUFBSSxPQUFLLEdBQUcsUUFBUSxFQUFFLE9BQU8sU0FBUztBQUVyRSxRQUFJLFNBQXlEO0FBQzdELFVBQU0sS0FBaUM7QUFBQSxNQUNyQyxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQUUsZUFBTztBQUFBLE1BQUc7QUFBQSxNQUNyQyxNQUFNLElBQVM7QUFDYixZQUFJLFFBQVEsTUFBTyxRQUFPLE9BQU8sTUFBTSxFQUFFO0FBQ3pDLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsTUFDbEQ7QUFBQSxNQUNBLE9BQU8sR0FBUztBQUNkLFlBQUksUUFBUSxPQUFRLFFBQU8sT0FBTyxPQUFPLENBQUM7QUFDMUMsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFBQSxNQUNqRDtBQUFBLE1BQ0EsT0FBTztBQUNMLFlBQUksT0FBUSxRQUFPLE9BQU8sS0FBSztBQUUvQixlQUFPLDZCQUE2QixXQUFXLE9BQU8sRUFBRSxLQUFLLE1BQU07QUFDakUsZ0JBQU1DLFVBQVUsVUFBVSxTQUFTLElBQ2pDLE1BQU0sR0FBRyxTQUFTLElBQ2xCLFVBQVUsV0FBVyxJQUNuQixVQUFVLENBQUMsSUFDWDtBQUlKLG1CQUFTQSxVQUFTLE9BQU8sYUFBYSxFQUFFO0FBQ3hDLGNBQUksQ0FBQztBQUNILG1CQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVTtBQUV4QyxpQkFBTyxFQUFFLE1BQU0sT0FBTyxPQUFPLENBQUMsRUFBRTtBQUFBLFFBQ2xDLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUNBLFdBQU8sV0FBVyxnQkFBZ0IsRUFBRSxDQUFDO0FBQUEsRUFDdkM7QUFFQSxRQUFNLFNBQVUsVUFBVSxTQUFTLElBQy9CLE1BQU0sR0FBRyxTQUFTLElBQ2xCLFVBQVUsV0FBVyxJQUNuQixVQUFVLENBQUMsSUFDVixnQkFBcUM7QUFFNUMsU0FBTyxXQUFXLGdCQUFnQixNQUFNLENBQUM7QUFDM0M7QUFFQSxTQUFTLDZCQUE2QixXQUFvQixXQUFzQjtBQUM5RSxXQUFTLGlCQUFnQztBQUN2QyxRQUFJLFVBQVU7QUFDWixhQUFPLFFBQVEsUUFBUTtBQUV6QixVQUFNLFVBQVUsSUFBSSxRQUFjLENBQUMsU0FBUyxXQUFXO0FBQ3JELGFBQU8sSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLGFBQWE7QUFDakQsWUFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLFlBQVksTUFBTSxHQUFHO0FBQzNDLGNBQUksVUFBVSxhQUFhO0FBQ3pCLHFCQUFTLFdBQVc7QUFDcEIsb0JBQVE7QUFBQSxVQUNWO0FBQUEsUUFDRjtBQUNBLFlBQUksUUFBUSxLQUFLLE9BQUssQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQUMsT0FBS0EsT0FBTSxhQUFhQSxHQUFFLFNBQVMsU0FBUyxDQUFDLENBQUMsR0FBRztBQUM5RixtQkFBUyxXQUFXO0FBQ3BCLGlCQUFPLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUFBLFFBQ3RDO0FBQUEsTUFDRixDQUFDLEVBQUUsUUFBUSxVQUFVLGNBQWMsTUFBTTtBQUFBLFFBQ3ZDLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxNQUNiLENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxRQUFJLE9BQU87QUFDVCxZQUFNLFFBQVEsSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLFVBQVUsNkJBQTZCLGNBQWMsR0FBSSxXQUFXO0FBQzdHLFlBQU0sWUFBWSxXQUFXLE1BQU07QUFDakMsaUJBQVEsS0FBSyxRQUFRLE9BQU8sVUFBVSxTQUFTO0FBQUEsTUFFakQsR0FBRyxXQUFXO0FBRWQsY0FBUSxRQUFRLE1BQU0sYUFBYSxTQUFTLENBQUM7QUFBQSxJQUMvQztBQUVBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxvQkFBb0IsU0FBa0M7QUFDN0QsY0FBVSxRQUFRLE9BQU8sU0FBTyxDQUFDLFVBQVUsY0FBYyxHQUFHLENBQUM7QUFDN0QsUUFBSSxDQUFDLFFBQVEsUUFBUTtBQUNuQixhQUFPLFFBQVEsUUFBUTtBQUFBLElBQ3pCO0FBRUEsVUFBTSxVQUFVLElBQUksUUFBYyxhQUFXLElBQUksaUJBQWlCLENBQUMsU0FBUyxhQUFhO0FBQ3ZGLFVBQUksUUFBUSxLQUFLLE9BQUssRUFBRSxZQUFZLE1BQU0sR0FBRztBQUMzQyxZQUFJLFFBQVEsTUFBTSxTQUFPLFVBQVUsY0FBYyxHQUFHLENBQUMsR0FBRztBQUN0RCxtQkFBUyxXQUFXO0FBQ3BCLGtCQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUMsRUFBRSxRQUFRLFdBQVc7QUFBQSxNQUNwQixTQUFTO0FBQUEsTUFDVCxXQUFXO0FBQUEsSUFDYixDQUFDLENBQUM7QUFHRixRQUFJLE9BQU87QUFDVCxZQUFNLFFBQVEsSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLFVBQVUsMkJBQTJCLGNBQWMsR0FBSSxZQUFZLEtBQUs7QUFDakgsWUFBTSxZQUFZLFdBQVcsTUFBTTtBQUNqQyxpQkFBUSxLQUFLLFFBQVEsVUFBVSxJQUFJO0FBQUEsTUFDckMsR0FBRyxXQUFXO0FBRWQsY0FBUSxRQUFRLE1BQU0sYUFBYSxTQUFTLENBQUM7QUFBQSxJQUMvQztBQUVBLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxXQUFXO0FBQ2IsV0FBTyxlQUFlLEVBQUUsS0FBSyxNQUFNLG9CQUFvQixTQUFTLENBQUM7QUFDbkUsU0FBTyxlQUFlO0FBQ3hCOzs7QUN4Tk8sSUFBTSxrQkFBa0IsT0FBTyxXQUFXOzs7QUM1STFDLElBQU0sV0FBVyxPQUFPLFdBQVc7QUFFMUMsSUFBTSxVQUFVLFFBQ2IsQ0FBQyxNQUFXLGFBQWEsT0FDeEIsZUFBZSxJQUFJLEVBQUUsWUFBWSxHQUFHLEVBQUUsV0FBVyxJQUFJLEVBQUUsUUFBUSxLQUMvRCxPQUFPLENBQUMsSUFDVixDQUFDLE1BQVk7QUE4RGYsSUFBSSxVQUFVO0FBQ2QsSUFBTSxlQUFlO0FBQUEsRUFDbkI7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQVc7QUFBQSxFQUFRO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQWM7QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQ3BIO0FBQUEsRUFBVTtBQUFBLEVBQVc7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFZO0FBQUEsRUFBUTtBQUFBLEVBQVk7QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQVc7QUFBQSxFQUFPO0FBQUEsRUFBVTtBQUFBLEVBQ3JIO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUztBQUFBLEVBQVk7QUFBQSxFQUFjO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDckg7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUN4SDtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBWTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBWTtBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBSztBQUFBLEVBQVc7QUFBQSxFQUNwSDtBQUFBLEVBQVk7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQVc7QUFBQSxFQUFVO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFVO0FBQUEsRUFDdEg7QUFBQSxFQUFVO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFB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QUFjO0FBRWhCLG1CQUFXLEdBQUcsYUFBYTtBQUMzQixvQkFBWSxHQUFHLEtBQUs7QUFHcEIsVUFBRSxPQUFPLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM5QixlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFFQSxVQUFNLG9CQUFrRCxPQUFPLE9BQU8sWUFBWTtBQUFBLE1BQ2hGLE9BQU8sTUFBTTtBQUFFLGNBQU0sSUFBSSxNQUFNLG1GQUFtRjtBQUFBLE1BQUU7QUFBQSxNQUNwSDtBQUFBO0FBQUEsTUFDQSxVQUFVO0FBQUUsZUFBTyxnQkFBZ0IsYUFBYSxFQUFFLEdBQUcsWUFBWSxPQUFPLEVBQUUsR0FBRyxDQUFDO0FBQUEsTUFBSTtBQUFBLElBQ3BGLENBQUM7QUFFRCxXQUFPLGVBQWUsWUFBWSxPQUFPLGFBQWE7QUFBQSxNQUNwRCxPQUFPO0FBQUEsTUFDUCxVQUFVO0FBQUEsTUFDVixjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUVELFdBQU8sZUFBZSxZQUFZLFFBQVEsRUFBRSxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7QUFFbEUsV0FBTyxnQkFBZ0IsQ0FBQyxJQUFJO0FBQUEsRUFDOUI7QUFFQSxPQUFLLFFBQVEsU0FBUztBQUd0QixTQUFPO0FBQ1Q7QUFNQSxTQUFTLGdCQUFnQixNQUFZLE9BQW1ELHdCQUFrQztBQUN4SCxRQUFNLFVBQVUsb0JBQUksUUFBYztBQUNsQyxXQUFTLEtBQUssT0FBaUI7QUFDN0IsZUFBVyxRQUFRLE9BQU87QUFFeEIsVUFBSyxVQUFVLGlCQUFrQixLQUFLLGFBQWE7QUFDakQsYUFBSyxLQUFLLFVBQVU7QUFDcEIsZ0JBQVEsSUFBSSxJQUFJO0FBRWhCLFlBQUksMEJBQTBCLHNCQUFzQixRQUFRLE9BQU8sS0FBSyxxQkFBcUIsV0FBWSxNQUFLLGlCQUFpQjtBQUFBLE1BQ2pJO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGlCQUFpQixDQUFDLGNBQWM7QUFDbEMsY0FBVSxRQUFRLFNBQVUsR0FBRztBQUM3QixVQUFJLEVBQUUsU0FBUyxlQUFlLEVBQUUsS0FBSyxFQUFFLFFBQVE7QUFDN0MsYUFBSyxFQUFFLEtBQUssQ0FBQztBQUFBLE1BQ2Y7QUFBQSxJQUVGLENBQUM7QUFBQSxFQUNILENBQUMsRUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLE1BQU0sV0FBVyxLQUFLLENBQUM7QUFFbkQsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ2IiwgImEiLCAicmVzdWx0IiwgImV4IiwgImlyIiwgIm1lcmdlZCIsICJyIiwgInVuaXF1ZSIsICJuIiwgInZhbHVlIiwgImlzQW5jZXN0cmFsIiwgImNoaWxkcmVuIl0KfQo=
