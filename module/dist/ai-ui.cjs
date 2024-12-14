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
  tag: () => tag,
  when: () => when
});
module.exports = __toCommonJS(ai_ui_exports);

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
var debugId = Symbol("deferredPromiseID");
var nothing = (v) => {
};
var id = 1;
function deferred() {
  let resolve = nothing;
  let reject = nothing;
  const promise = new Promise((...r) => [resolve, reject] = r);
  promise.resolve = resolve;
  promise.reject = reject;
  if (DEBUG) {
    promise[debugId] = id++;
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
var iteratorCallSite = Symbol("IteratorCallSite");
function assignHidden(d, s) {
  const keys = [...Object.getOwnPropertyNames(s), ...Object.getOwnPropertySymbols(s)];
  for (const k of keys) {
    Object.defineProperty(d, k, { ...Object.getOwnPropertyDescriptor(s, k), enumerable: false });
  }
  if (DEBUG) {
    if (!(iteratorCallSite in d)) Object.defineProperty(d, iteratorCallSite, { value: new Error().stack });
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
          q[_pending].pop().reject(value.value);
        q[_items] = q[_pending] = null;
      }
      return Promise.resolve(value);
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
var merge = (...ai) => {
  const it = /* @__PURE__ */ new Map();
  const promises = /* @__PURE__ */ new Map();
  let init = () => {
    init = () => {
    };
    for (let n = 0; n < ai.length; n++) {
      const a = ai[n];
      const iter = Symbol.asyncIterator in a ? a[Symbol.asyncIterator]() : a;
      it.set(n, iter);
      promises.set(n, iter.next().then((result) => ({ key: n, result })));
    }
  };
  const results = new Array(ai.length);
  const merged = {
    [Symbol.asyncIterator]() {
      return merged;
    },
    next() {
      init();
      return promises.size ? Promise.race(promises.values()).then(({ key, result }) => {
        if (result.done) {
          promises.delete(key);
          it.delete(key);
          results[key] = result.value;
          return merged.next();
        } else {
          promises.set(
            key,
            it.has(key) ? it.get(key).next().then((result2) => ({ key, result: result2 })).catch((ex) => ({ key, result: { done: true, value: ex } })) : Promise.resolve({ key, result: { done: true, value: void 0 } })
          );
          return result;
        }
      }).catch((ex) => {
        return merged.throw(ex);
      }) : Promise.resolve({ done: true, value: results });
    },
    async return(r) {
      for (const key of it.keys()) {
        if (promises.has(key)) {
          promises.delete(key);
          results[key] = await it.get(key)?.return?.({ done: true, value: r }).then((v) => v.value, (ex) => ex);
        }
      }
      return { done: true, value: results };
    },
    async throw(ex) {
      for (const key of it.keys()) {
        if (promises.has(key)) {
          promises.delete(key);
          results[key] = await it.get(key)?.throw?.(ex).then((v) => v.value, (ex2) => ex2);
        }
      }
      return { done: true, value: results };
    }
  };
  return iterableHelpers(merged);
};
var combine = (src, opts = {}) => {
  const accumulated = {};
  const si = /* @__PURE__ */ new Map();
  let pc;
  const ci = {
    [Symbol.asyncIterator]() {
      return ci;
    },
    next() {
      if (pc === void 0) {
        pc = new Map(Object.entries(src).map(([k, sit]) => {
          si.set(k, sit[Symbol.asyncIterator]());
          return [k, si.get(k).next().then((ir) => ({ si, k, ir }))];
        }));
      }
      return function step() {
        return Promise.race(pc.values()).then(({ k, ir }) => {
          if (ir.done) {
            pc.delete(k);
            si.delete(k);
            if (!pc.size)
              return { done: true, value: void 0 };
            return step();
          } else {
            accumulated[k] = ir.value;
            pc.set(k, si.get(k).next().then((ir2) => ({ k, ir: ir2 })));
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
      for (const ai of si.values()) {
        ai.return?.(v);
      }
      ;
      return Promise.resolve({ done: true, value: v });
    },
    throw(ex) {
      for (const ai of si.values())
        ai.throw?.(ex);
      return Promise.resolve({ done: true, value: ex });
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
              const sourceResponse = ai.throw?.(ex) ?? ai.return?.(ex);
              if (isPromiseLike(sourceResponse)) sourceResponse.then(reject, reject);
              else reject({ done: true, value: ex });
            }
          ),
          (ex) => {
            prev = Ignore;
            reject({ done: true, value: ex });
          }
        ).catch((ex) => {
          prev = Ignore;
          const sourceResponse = ai.throw?.(ex) ?? ai.return?.(ex);
          if (isPromiseLike(sourceResponse)) sourceResponse.then(reject, reject);
          else reject({ done: true, value: sourceResponse });
        });
      });
    },
    throw(ex) {
      return Promise.resolve(ai?.throw?.(ex) ?? ai?.return?.(ex)).then(done, done);
    },
    return(v) {
      return Promise.resolve(ai?.return?.(v)).then(done, done);
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
        current?.reject({ done: true, value: error });
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
      return Promise.resolve(ai?.throw?.(ex) ?? ai?.return?.(ex)).then(done, done);
    },
    return(v) {
      if (consumers < 1)
        throw new Error("AsyncIterator protocol error");
      consumers -= 1;
      if (consumers)
        return Promise.resolve({ done: true, value: v });
      return Promise.resolve(ai?.return?.(v)).then(done, done);
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
          const merged2 = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : doneImmediately();
          events = merged2[Symbol.asyncIterator]();
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
  function containerIsInDOM() {
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
    return containerIsInDOM().then(() => allSelectorsPresent(selectors));
  return containerIsInDOM();
}

// src/tags.ts
var callStackSymbol = Symbol("callStack");

// src/ai-ui.ts
var UniqueID = Symbol("Unique ID");
var trackNodes = Symbol("trackNodes");
var trackLegacy = Symbol("onRemovalFromDOM");
var aiuiExtendedTagStyles = "--ai-ui-extended-tag-styles";
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
function keyFor(id2) {
  return id2 in safeFunctionSymbols ? safeFunctionSymbols[id2] : id2;
}
function isChildTag(x) {
  return typeof x === "string" || typeof x === "number" || typeof x === "boolean" || x instanceof Node || x instanceof NodeList || x instanceof HTMLCollection || x === null || x === void 0 || Array.isArray(x) || isPromiseLike(x) || isAsyncIter(x) || typeof x === "object" && Symbol.iterator in x && typeof x[Symbol.iterator] === "function";
}
var tag = function(_1, _2, _3) {
  const [nameSpace, tags, options] = typeof _1 === "string" || _1 === null ? [_1, _2, _3] : Array.isArray(_1) ? [null, _1, _2] : [null, standandTags, _1];
  const commonProperties = options?.commonProperties;
  const thisDoc = options?.document ?? globalThis.document;
  const isTestEnv = thisDoc.documentURI === "about:testing";
  const DyamicElementError = options?.ErrorTag || function DyamicElementError2({ error }) {
    return thisDoc.createComment(error instanceof Error ? error.toString() : "Error:\n" + JSON.stringify(error, null, 2));
  };
  const removedNodes = mutationTracker(thisDoc);
  function DomPromiseContainer(label) {
    return thisDoc.createComment(label ? label.toString() : DEBUG ? new Error("promise").stack?.replace(/^Error: /, "") || "promise" : "promise");
  }
  if (!document.getElementById(aiuiExtendedTagStyles)) {
    thisDoc.head.appendChild(Object.assign(thisDoc.createElement("STYLE"), { id: aiuiExtendedTagStyles }));
  }
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
  if (options?.enableOnRemovedFromDOM) {
    Object.defineProperty(tagPrototypes, "onRemovedFromDOM", {
      configurable: true,
      enumerable: false,
      set: function(fn) {
        removedNodes.onRemoval([this], trackLegacy, fn);
      },
      get: function() {
        removedNodes.getRemovalHandler(this, trackLegacy);
      }
    });
  }
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
        let g = [DomPromiseContainer()];
        c.then((replacement) => {
          const old = g;
          if (old) {
            g = [...nodes(replacement)];
            removedNodes.onRemoval(g, trackNodes, () => {
              g = void 0;
            });
            for (let i = 0; i < old.length; i++) {
              if (i === 0)
                old[i].replaceWith(...g);
              else
                old[i].remove();
            }
          }
        });
        if (g) yield* g;
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
          nodes: unboxed === c ? [] : [...nodes(unboxed)],
          [Symbol.iterator]() {
            return this.nodes?.[Symbol.iterator]() ?? { next() {
              return { done: true, value: void 0 };
            } };
          }
        };
        if (!replacement.nodes.length)
          replacement.nodes = [DomPromiseContainer()];
        removedNodes.onRemoval(replacement.nodes, trackNodes, terminateSource);
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
                removedNodes.onRemoval(replacement.nodes, trackNodes);
                replacement.nodes = [...nodes(unbox(es.value))];
                if (!replacement.nodes.length)
                  replacement.nodes = [DomPromiseContainer()];
                removedNodes.onRemoval(replacement.nodes, trackNodes, terminateSource);
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
            if (n?.length) {
              n[0].replaceWith(DyamicElementError({ error: errorValue?.value ?? errorValue }));
              n.slice(1).forEach((e) => e?.remove());
            } else _console.warn("Can't report error", errorValue, replacement.nodes?.map(logNode));
            replacement.nodes = null;
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
        const set = isTestEnv || !(d instanceof Element) || d instanceof HTMLElement ? (k, v) => {
          d[k] = v;
        } : (k, v) => {
          if ((v === null || typeof v === "number" || typeof v === "boolean" || typeof v === "string") && (!(k in d) || typeof d[k] !== "string"))
            d.setAttribute(k === "className" ? "class" : k, String(v));
          else
            d[k] = v;
        };
        for (const [k, srcDesc] of sourceEntries) {
          try {
            if ("value" in srcDesc) {
              const value = srcDesc.value;
              if (isAsyncIter(value)) {
                assignIterable(value, k);
              } else if (isPromiseLike(value)) {
                value.then((v) => {
                  if (!removedNodes.has(base)) {
                    if (v && typeof v === "object") {
                      if (isAsyncIter(v)) {
                        assignIterable(v, k);
                      } else {
                        assignObject(v, k);
                      }
                    } else {
                      if (s[k] !== void 0)
                        set(k, v);
                    }
                  }
                }, (error) => _console.log(`Exception in promised attribute '${k}'`, error, logNode(d)));
              } else if (!isAsyncIter(value)) {
                if (value && typeof value === "object" && !isPromiseLike(value))
                  assignObject(value, k);
                else {
                  if (s[k] !== void 0)
                    set(k, s[k]);
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
        function assignIterable(iter, k) {
          const ap = asyncIterator(iter);
          let createdAt = Date.now() + timeOutWarn;
          const createdBy = DEBUG && new Error("Created by").stack;
          let mounted = false;
          const update = (es) => {
            if (!es.done) {
              mounted = mounted || base.isConnected;
              if (removedNodes.has(base)) {
                error("(node removed)");
                ap.return?.();
                return;
              }
              const value = unbox(es.value);
              if (typeof value === "object" && value !== null) {
                const destDesc = Object.getOwnPropertyDescriptor(d, k);
                if (k === "style" || !destDesc?.set)
                  assign(d[k], value);
                else
                  set(k, value);
              } else {
                if (value !== void 0)
                  set(k, value);
              }
              if (DEBUG && !mounted && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Element with async attribute '${k}' not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.
Element contains: ${logNode(base)}
${createdBy}`);
              }
              ap.next().then(update).catch(error);
            }
          };
          const error = (errorValue) => {
            if (errorValue) {
              _console.warn("Dynamic attribute termination", errorValue, k, logNode(d), createdBy, logNode(base));
              base.appendChild(DyamicElementError({ error: errorValue }));
            }
          };
          const unboxed = iter.valueOf();
          if (unboxed !== void 0 && unboxed !== iter && !isAsyncIter(unboxed))
            update({ done: false, value: unboxed });
          else
            ap.next().then(update).catch(error);
          removedNodes.onRemoval([base], k, () => ap.return?.());
        }
        function assignObject(value, k) {
          if (value instanceof Node) {
            _console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${base instanceof Node ? logNode(base) : base}`);
            set(k, value);
          } else {
            if (!(k in d) || d[k] === value || Array.isArray(d[k]) && d[k].length !== value.length) {
              if (value.constructor === Object || value.constructor === Array) {
                const copy = new value.constructor();
                assign(copy, value);
                set(k, copy);
              } else {
                set(k, value);
              }
            } else {
              if (Object.getOwnPropertyDescriptor(d, k)?.set)
                set(k, value);
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
    const staticExtensions = instanceDefinition({ [UniqueID]: uniqueTagID });
    if (staticExtensions.styles) {
      document.getElementById(aiuiExtendedTagStyles)?.appendChild(thisDoc.createTextNode(staticExtensions.styles + "\n"));
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
        const isAncestral = (creator, key) => {
          for (let f = creator; f; f = f.super)
            if (f.definition?.declare && key in f.definition.declare) return true;
          return false;
        };
        if (tagDefinition.declare) {
          const clash = Object.keys(tagDefinition.declare).filter((k) => k in e || isAncestral(this, k));
          if (clash.length) {
            _console.log(`Declared keys '${clash}' in ${extendTag.name} already exist in base '${this.valueOf()}'`);
          }
        }
        if (tagDefinition.override) {
          const clash = Object.keys(tagDefinition.override).filter((k) => !(k in e) && !(commonProperties && k in commonProperties) && !isAncestral(this, k));
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
  const createElement = (name, attrs, ...children) => (
    // @ts-ignore: Expression produces a union type that is too complex to represent.ts(2590)
    name instanceof Node ? name : typeof name === "string" && name in baseTagCreators ? baseTagCreators[name](attrs, children) : name === baseTagCreators.createElement ? [...nodes(...children)] : typeof name === "function" ? name(attrs, children) : DyamicElementError({ error: new Error("Illegal type in createElement:" + name) })
  );
  const baseTagCreators = {
    createElement
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
function mutationTracker(root) {
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
          for (const [name, x] of removalSet?.entries()) try {
            x.call(node);
          } catch (ex) {
            _console.info("Ignored exception handling node removal", name, x, logNode(node));
          }
        }
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
    getRemovalHandler(e, name) {
      return removals.get(e)?.get(name);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuY29uc3QgdHJhY2tOb2RlcyA9IFN5bWJvbChcInRyYWNrTm9kZXNcIik7XG5jb25zdCB0cmFja0xlZ2FjeSA9IFN5bWJvbChcIm9uUmVtb3ZhbEZyb21ET01cIik7XG5jb25zdCBhaXVpRXh0ZW5kZWRUYWdTdHlsZXMgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUdcbj8gKChuOiBhbnkpID0+IG4gaW5zdGFuY2VvZiBOb2RlXG4gID8gJ291dGVySFRNTCcgaW4gbiA/IG4ub3V0ZXJIVE1MIDogYCR7bi50ZXh0Q29udGVudH0gJHtuLm5vZGVOYW1lfWBcbiAgOiBTdHJpbmcobikpXG46IChuOiBOb2RlKSA9PiB1bmRlZmluZWQ7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBhbnk+ID0ge30+IHtcbiAgY29tbW9uUHJvcGVydGllcz86IE90aGVyTWVtYmVycyB8IHVuZGVmaW5lZFxuICBkb2N1bWVudD86IERvY3VtZW50XG4gIEVycm9yVGFnPzogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQgJiB7IGVycm9yOiBhbnkgfT5cbiAgLyoqIEBkZXByZWNhdGVkIC0gbGVnYWN5IHN1cHBvcnQgKi9cbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTT86IGJvb2xlYW5cbn1cblxuLyogTWVtYmVycyBhcHBsaWVkIHRvIEVWRVJZIHRhZyBjcmVhdGVkLCBldmVuIGJhc2UgdGFncyAqL1xuaW50ZXJmYWNlIFBvRWxlbWVudE1ldGhvZHMge1xuICBnZXQgaWRzKCk6IHt9XG4gIHdoZW48VCBleHRlbmRzIEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzLCBTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM8RXhjbHVkZTxrZXlvZiBUWydpZHMnXSwgbnVtYmVyIHwgc3ltYm9sPj4+KHRoaXM6IFQsIC4uLndoYXQ6IFMpOiBXaGVuUmV0dXJuPFM+O1xuICAvLyBUaGlzIGlzIGEgdmVyeSBpbmNvbXBsZXRlIHR5cGUuIEluIHByYWN0aWNlLCBzZXQoaywgYXR0cnMpIHJlcXVpcmVzIGEgZGVlcGx5IHBhcnRpYWwgc2V0IG9mXG4gIC8vIGF0dHJpYnV0ZXMsIGluIGV4YWN0bHkgdGhlIHNhbWUgd2F5IGFzIGEgVGFnRnVuY3Rpb24ncyBmaXJzdCBvYmplY3QgcGFyYW1ldGVyXG4gIHNldCBhdHRyaWJ1dGVzKGF0dHJzOiBvYmplY3QpO1xuICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXBcbn1cblxuLy8gU3VwcG9ydCBmb3IgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaHRtIChvciBpbXBvcnQgaHRtIGZyb20gJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vaHRtL2Rpc3QvaHRtLm1vZHVsZS5qcycpXG4vLyBOb3RlOiBzYW1lIHNpZ25hdHVyZSBhcyBSZWFjdC5jcmVhdGVFbGVtZW50XG50eXBlIENyZWF0ZUVsZW1lbnROb2RlVHlwZSA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcFxudHlwZSBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPSBDcmVhdGVFbGVtZW50WydjcmVhdGVFbGVtZW50J107XG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUVsZW1lbnQge1xuICAvLyBTdXBwb3J0IGZvciBodG0sIEpTWCwgZXRjXG4gIGNyZWF0ZUVsZW1lbnQ8TiBleHRlbmRzIChDcmVhdGVFbGVtZW50Tm9kZVR5cGUgfCBDcmVhdGVFbGVtZW50RnJhZ21lbnQpPihcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IE4sXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTiBleHRlbmRzIENyZWF0ZUVsZW1lbnRGcmFnbWVudCA/IE5vZGVbXSA6IE5vZGU7XG4gIH1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiAvLyBhYnNlbnQgaW1wbGllcyBub25lIGFyZSBkZWZpbmVkXG4gICAgICApXG5cbiAgICAgIGVnOlxuICAgICAgICB0YWdzKCkgIC8vIHJldHVybnMgVGFnQ3JlYXRvcnMgZm9yIGFsbCBIVE1MIHRhZ3NcbiAgICAgICAgdGFncyhbJ2RpdicsJ2J1dHRvbiddLCB7IG15VGhpbmcoKSB7fSB9KVxuICAgICAgICB0YWdzKCdodHRwOi8vbmFtZXNwYWNlJyxbJ0ZvcmVpZ24nXSwgeyBpc0ZvcmVpZ246IHRydWUgfSlcbiAgKi9cblxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPih0YWdzOiBUYWdzW10pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIG9iamVjdD4obmFtZVNwYWNlOiBudWxsIHwgdW5kZWZpbmVkIHwgJycsIHRhZ3M6IFRhZ3NbXSwgb3B0aW9ucz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gVGFnc106IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudD4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgXCJkbFwiLCBcImR0XCIsIFwiZW1cIiwgXCJlbWJlZFwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLCBcImZvcm1cIiwgXCJoMVwiLCBcImgyXCIsIFwiaDNcIiwgXCJoNFwiLCBcImg1XCIsIFwiaDZcIiwgXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICBcInByb2dyZXNzXCIsIFwicVwiLCBcInJwXCIsIFwicnRcIiwgXCJydWJ5XCIsIFwic1wiLCBcInNhbXBcIiwgXCJzY3JpcHRcIiwgXCJzZWFyY2hcIiwgXCJzZWN0aW9uXCIsIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic291cmNlXCIsIFwic3BhblwiLFxuICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gaWRzSW5hY2Nlc3NpYmxlKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiPGVsdD4uaWRzIGlzIGEgcmVhZC1vbmx5IG1hcCBvZiBFbGVtZW50c1wiKVxufVxuXG4vKiBTeW1ib2xzIHVzZWQgdG8gaG9sZCBJRHMgdGhhdCBjbGFzaCB3aXRoIGZ1bmN0aW9uIHByb3RvdHlwZSBuYW1lcywgc28gdGhhdCB0aGUgUHJveHkgZm9yIGlkcyBjYW4gYmUgbWFkZSBjYWxsYWJsZSAqL1xuY29uc3Qgc2FmZUZ1bmN0aW9uU3ltYm9scyA9IFsuLi5PYmplY3Qua2V5cyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhGdW5jdGlvbi5wcm90b3R5cGUpKV0ucmVkdWNlKChhLGIpID0+IHtcbiAgYVtiXSA9IFN5bWJvbChiKTtcbiAgcmV0dXJuIGE7XG59LHt9IGFzIFJlY29yZDxzdHJpbmcsIHN5bWJvbD4pO1xuZnVuY3Rpb24ga2V5Rm9yKGlkOiBzdHJpbmcgfCBzeW1ib2wpIHsgcmV0dXJuIGlkIGluIHNhZmVGdW5jdGlvblN5bWJvbHMgPyBzYWZlRnVuY3Rpb25TeW1ib2xzW2lkIGFzIGtleW9mIHR5cGVvZiBzYWZlRnVuY3Rpb25TeW1ib2xzXSA6IGlkIH07XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgfHwgeCA9PT0gbnVsbFxuICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiB4ICYmIHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG4vKiB0YWcgKi9cblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyBvYmplY3Rcbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gfCB1bmRlZmluZWRdO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcbiAgY29uc3QgaXNUZXN0RW52ID0gdGhpc0RvYy5kb2N1bWVudFVSSSA9PT0gJ2Fib3V0OnRlc3RpbmcnO1xuICBjb25zdCBEeWFtaWNFbGVtZW50RXJyb3IgPSBvcHRpb25zPy5FcnJvclRhZyB8fCBmdW5jdGlvbiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvciB9OiB7IGVycm9yOiBFcnJvciB8IEl0ZXJhdG9yUmVzdWx0PEVycm9yPiB9KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IudG9TdHJpbmcoKSA6ICdFcnJvcjpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZWROb2RlcyA9IG11dGF0aW9uVHJhY2tlcih0aGlzRG9jKTtcblxuICBmdW5jdGlvbiBEb21Qcm9taXNlQ29udGFpbmVyKGxhYmVsPzogYW55KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChsYWJlbD8gbGFiZWwudG9TdHJpbmcoKSA6REVCVUdcbiAgICAgID8gbmV3IEVycm9yKFwicHJvbWlzZVwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJykgfHwgXCJwcm9taXNlXCJcbiAgICAgIDogXCJwcm9taXNlXCIpXG4gIH1cblxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQoT2JqZWN0LmFzc2lnbih0aGlzRG9jLmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKSwge2lkOiBhaXVpRXh0ZW5kZWRUYWdTdHlsZXN9ICkpO1xuICB9XG5cbiAgLyogUHJvcGVydGllcyBhcHBsaWVkIHRvIGV2ZXJ5IHRhZyB3aGljaCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgcmVmZXJlbmNlLCBzaW1pbGFyIHRvIHByb3RvdHlwZXMgKi9cbiAgY29uc3Qgd2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXM6IFBvRWxlbWVudE1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAge1xuICAgICAgd2hlbjoge1xuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoLi4ud2hhdDogV2hlblBhcmFtZXRlcnMpIHtcbiAgICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQodGhpczogRWxlbWVudCwgYTogb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGEpKSB7XG4gICAgICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICgpID0+IGFpLm5leHQoKS50aGVuKFxuICAgICAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpZHM6IHtcbiAgICAgICAgLy8gLmlkcyBpcyBhIGdldHRlciB0aGF0IHdoZW4gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gbGF6aWx5IGNyZWF0ZXMgYSBQcm94eSB0aGF0IHByb3ZpZGVzIGxpdmUgYWNjZXNzIHRvIGNoaWxkcmVuIGJ5IGlkXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgIGdldCh0aGlzOiBFbGVtZW50KSB7XG4gICAgICAgICAgLy8gTm93IHdlJ3ZlIGJlZW4gYWNjZXNzZWQsIGNyZWF0ZSB0aGUgcHJveHlcbiAgICAgICAgICBjb25zdCBpZFByb3h5ID0gbmV3IFByb3h5KCgoKT0+e30pIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgV2Vha1JlZjxFbGVtZW50Pj4sIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldCwgdGhpc0FyZywgYXJncykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQXJnLmNvbnN0cnVjdG9yLmRlZmluaXRpb24uaWRzW2FyZ3NbMF0uaWRdKC4uLmFyZ3MpXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8ZWx0Pi5pZHMuJHthcmdzPy5bMF0/LmlkfSBpcyBub3QgYSB0YWctY3JlYXRpbmcgZnVuY3Rpb25gLCB7IGNhdXNlOiBleCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnN0cnVjdDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlbGV0ZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldFByb3RvdHlwZU9mOiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXRQcm90b3R5cGVPZigpIHsgcmV0dXJuIG51bGwgfSxcbiAgICAgICAgICAgIGlzRXh0ZW5zaWJsZSgpIHsgcmV0dXJuIGZhbHNlIH0sXG4gICAgICAgICAgICBwcmV2ZW50RXh0ZW5zaW9ucygpIHsgcmV0dXJuIHRydWUgfSxcbiAgICAgICAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleUZvcihwKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFzKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG93bktleXM6ICh0YXJnZXQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaWRzID0gWy4uLnRoaXMucXVlcnlTZWxlY3RvckFsbChgW2lkXWApXS5tYXAoZSA9PiBlLmlkKTtcbiAgICAgICAgICAgICAgY29uc3QgdW5pcXVlID0gWy4uLm5ldyBTZXQoaWRzKV07XG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBpZHMubGVuZ3RoICE9PSB1bmlxdWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnQgaWRzYCwgdW5pcXVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuaXF1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHAsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwayA9IGtleUZvcihwKTtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSd2ZSBjYWNoZWQgdGhpcyBJRCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgaWYgKHBrIGluIHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGVsZW1lbnQgaXMgc3RpbGwgY29udGFpbmVkIHdpdGhpbiB0aGlzIGVsZW1lbnQgd2l0aCB0aGUgc2FtZSBJRFxuICAgICAgICAgICAgICAgICAgY29uc3QgcmVmID0gdGFyZ2V0W3BrXS5kZXJlZigpO1xuICAgICAgICAgICAgICAgICAgaWYgKHJlZiAmJiByZWYuaWQgPT09IHAgJiYgdGhpcy5jb250YWlucyhyZWYpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVmO1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIHRhcmdldFtwa107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBlOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJyMnICsgQ1NTLmVzY2FwZShwKSk7XG4gICAgICAgICAgICAgICAgICBpZiAobmwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMocCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICB3YXJuZWQuYWRkKHApO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnRzIHdpdGggSUQgXCIke3B9XCJgLyosYFxcblxcdCR7bG9nTm9kZSh0aGlzKX1gKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlID0gbmxbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJyMnICsgQ1NTLmVzY2FwZShwKSkgPz8gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZSlcbiAgICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwgcGssIG5ldyBXZWFrUmVmKGUpLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi5hbmQgcmVwbGFjZSB0aGUgZ2V0dGVyIHdpdGggdGhlIFByb3h5XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZHMnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXQoKSB7IHJldHVybiBpZFByb3h5IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLi5hbmQgcmV0dXJuIHRoYXQgZnJvbSB0aGUgZ2V0dGVyLCBzbyBzdWJzZXF1ZW50IHByb3BlcnR5XG4gICAgICAgICAgLy8gYWNjZXNzZXMgZ28gdmlhIHRoZSBQcm94eVxuICAgICAgICAgIHJldHVybiBpZFByb3h5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIGlmIChvcHRpb25zPy5lbmFibGVPblJlbW92ZWRGcm9tRE9NKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsJ29uUmVtb3ZlZEZyb21ET00nLHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgc2V0OiBmdW5jdGlvbihmbj86ICgpPT52b2lkKXtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChbdGhpc10sIHRyYWNrTGVnYWN5LCBmbik7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZW1vdmVkTm9kZXMuZ2V0UmVtb3ZhbEhhbmRsZXIodGhpcywgdHJhY2tMZWdhY3kpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qIEFkZCBhbnkgdXNlciBzdXBwbGllZCBwcm90b3R5cGVzICovXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gKm5vZGVzKC4uLmNoaWxkVGFnczogQ2hpbGRUYWdzW10pOiBJdGVyYWJsZUl0ZXJhdG9yPENoaWxkTm9kZSwgdm9pZCwgdW5rbm93bj4ge1xuICAgIGZ1bmN0aW9uIG5vdFZpYWJsZVRhZyhjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIHJldHVybiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwgfHwgYyA9PT0gSWdub3JlKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYyBvZiBjaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChub3RWaWFibGVUYWcoYykpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICBsZXQgZzogQ2hpbGROb2RlW10gfCB1bmRlZmluZWQgPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYy50aGVuKHJlcGxhY2VtZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICAgIGcgPSBbLi4ubm9kZXMocmVwbGFjZW1lbnQpXTtcbiAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoZywgdHJhY2tOb2RlcywgKCk9PiB7IGcgPSB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGkgPT09IDApXG4gICAgICAgICAgICAgICAgb2xkW2ldLnJlcGxhY2VXaXRoKC4uLmcpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIG9sZFtpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChnKSB5aWVsZCAqZztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB5aWVsZCBjIGFzIENoaWxkTm9kZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1bmt5IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGMpXG4gICAgICAgICAgeWllbGQgKm5vZGVzKGNoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FzeW5jSXRlcjxDaGlsZFRhZ3M+KGMpKSB7XG4gICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICBsZXQgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHRlcm1pbmF0ZVNvdXJjZSA9IChmb3JjZTogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgaWYgKCFhcCB8fCAhcmVwbGFjZW1lbnQubm9kZXMpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBpZiAoZm9yY2UgfHwgcmVwbGFjZW1lbnQubm9kZXMuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMuaGFzKGUpKSkge1xuICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzPy5mb3JFYWNoKGUgPT4gcmVtb3ZlZE5vZGVzLmFkZChlKSk7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiXG4gICAgICAgICAgICAgICsgcmVwbGFjZW1lbnQubm9kZXMubWFwKGxvZ05vZGUpLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICAgICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSB7XG4gICAgICAgICAgbm9kZXM6ICgodW5ib3hlZCA9PT0gYykgPyBbXSA6IFsuLi5ub2Rlcyh1bmJveGVkKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2RlcyEubGVuZ3RoKVxuICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMhLHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGNvbnN0IGRlYnVnVW5tb3VudGVkID0gREVCVUdcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgICAgbGV0IGYgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgZiA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgIGFwLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgYXA/LnRocm93Py4obmV3IEVycm9yKFwiQWxyZWFkeSB0ZXJuaW1hdGVkXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihlID0+IGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHJlcGxhY2VtZW50Lm5vZGVzIDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgbW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIXRlcm1pbmF0ZVNvdXJjZSghbi5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWdVbm1vdW50ZWQ/LigpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbLi4ubm9kZXModW5ib3goZXMudmFsdWUpKV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaTxuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaT09PTApXG4gICAgICAgICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQubm9kZXMpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKG5baV0pKVxuICAgICAgICAgICAgICAgICAgICBuW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChuW2ldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnQubm9kZXM/LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgaWYgKG4/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlPy52YWx1ZSA/PyBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgcmVwbGFjZW1lbnQubm9kZXM/Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KSgpO1xuXG4gICAgICAgIGlmIChyZXBsYWNlbWVudC5ub2RlcykgeWllbGQqIHJlcGxhY2VtZW50O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgeWllbGQgdGhpc0RvYy5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXMuIFByb3BldHk6ICcke2t9JyB2YWx1ZTogJHtsb2dOb2RlKHZhbHVlKX0gZGVzdGluYXRpb246ICR7ZCBpbnN0YW5jZW9mIE5vZGUgPyBsb2dOb2RlKGQpIDogZH1gKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5ib3g8VD4oYTogVCk6IFQge1xuICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIChBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsIHVuYm94KSA6IHYpIGFzIFQ7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KGEgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXQgPSBpc1Rlc3RFbnYgfHwgIShkIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgKGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgICA/IChrOiBzdHJpbmcsIHY6IGFueSkgPT4geyBkW2tdID0gdiB9XG4gICAgICAgICAgOiAoazogc3RyaW5nLCB2OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmICgodiA9PT0gbnVsbCB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICYmICghKGsgaW4gZCkgfHwgdHlwZW9mIGRbayBhcyBrZXlvZiB0eXBlb2YgZF0gIT09ICdzdHJpbmcnKSlcbiAgICAgICAgICAgICAgZC5zZXRBdHRyaWJ1dGUoayA9PT0gJ2NsYXNzTmFtZScgPyAnY2xhc3MnIDogaywgU3RyaW5nKHYpKTtcbiAgICAgICAgICAgIGVsc2UgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBkW2tdID0gdjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHYsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQoaywgdik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBjb25zb2xlLmxvZyhgRXhjZXB0aW9uIGluIHByb21pc2VkIGF0dHJpYnV0ZSAnJHtrfSdgLCBlcnJvciwgbG9nTm9kZShkKSkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzZXQoaywgc1trXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUoaXRlcjogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IoaXRlcik7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICAgIGxldCBtb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIG1vdW50ZWQgPSBtb3VudGVkIHx8IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYnV0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIihub2RlIHJlbW92ZWQpXCIpO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiAhbW91bnRlZCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyb3JWYWx1ZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSB0ZXJtaW5hdGlvblwiLCBlcnJvclZhbHVlLCBrLCBsb2dOb2RlKGQpLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1bmJveGVkID0gaXRlci52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSBpdGVyICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFtiYXNlXSwgaywgKCkgPT4gYXAucmV0dXJuPy4oKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtiYXNlIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoYmFzZSkgOiBiYXNlfWApO1xuICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2V0KGssIGNvcHkpO1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LCBfb3ZlcnJpZGVzLCBpbnN0YW5jZSlcbiAgICAgIDogX292ZXJyaWRlc1xuXG4gICAgY29uc3QgdW5pcXVlVGFnSUQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIChpZENvdW50KyspLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGNvbnN0IHN0YXRpY0V4dGVuc2lvbnM6IE92ZXJyaWRlcyA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgIC8qIFwiU3RhdGljYWxseVwiIGNyZWF0ZSBhbnkgc3R5bGVzIHJlcXVpcmVkIGJ5IHRoaXMgd2lkZ2V0ICovXG4gICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhaXVpRXh0ZW5kZWRUYWdTdHlsZXMpPy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgIGNvbnN0IG5ld0NhbGxTdGFjazogKENvbnN0cnVjdGVkICYgT3ZlcnJpZGVzKVtdID0gW107XG4gICAgICBjb25zdCBjb21iaW5lZEF0dHJzID0geyBbY2FsbFN0YWNrU3ltYm9sXTogKG5vQXR0cnMgPyBuZXdDYWxsU3RhY2sgOiBhdHRyc1tjYWxsU3RhY2tTeW1ib2xdKSA/PyBuZXdDYWxsU3RhY2sgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBjb25zdCBpc0FuY2VzdHJhbCA9IChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYga2V5IGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoayA9PiAoayBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGsgPT4gIShrIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBrIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZUVsZW1lbnQ6IENyZWF0ZUVsZW1lbnRbJ2NyZWF0ZUVsZW1lbnQnXSA9IChuYW1lLCBhdHRycywgLi4uY2hpbGRyZW4pID0+XG4gICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICBuYW1lIGluc3RhbmNlb2YgTm9kZSA/IG5hbWVcbiAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/IGJhc2VUYWdDcmVhdG9yc1tuYW1lXShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IFsuLi5ub2RlcyguLi5jaGlsZHJlbildXG4gICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgIDogRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSkgfSlcblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUpIHtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGNvbnN0IHJlbW92YWxzOiBXZWFrTWFwPE5vZGUsIE1hcDxTeW1ib2wgfCBzdHJpbmcsICh0aGlzOiBOb2RlKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgeF0gb2YgcmVtb3ZhbFNldD8uZW50cmllcygpKSB0cnkgeyB4LmNhbGwobm9kZSkgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIklnbm9yZWQgZXhjZXB0aW9uIGhhbmRsaW5nIG5vZGUgcmVtb3ZhbFwiLCBuYW1lLCB4LCBsb2dOb2RlKG5vZGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgIHdhbGsobS5yZW1vdmVkTm9kZXMpXG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXMoZTpOb2RlKSB7IHJldHVybiB0cmFja2VkLmhhcyhlKSB9LFxuICAgIGFkZChlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuYWRkKGUpIH0sXG4gICAgZ2V0UmVtb3ZhbEhhbmRsZXIoZTogTm9kZSwgbmFtZTogU3ltYm9sKSB7XG4gICAgICByZXR1cm4gcmVtb3ZhbHMuZ2V0KGUpPy5nZXQobmFtZSk7XG4gICAgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBTeW1ib2wgfCBzdHJpbmcsIGhhbmRsZXI/OiAodGhpczogTm9kZSk9PnZvaWQpIHtcbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSkgPz8gbmV3IE1hcDxTeW1ib2wgfCBzdHJpbmcsICgpPT52b2lkPigpO1xuICAgICAgICAgIHJlbW92YWxzLnNldChlLCBtYXApO1xuICAgICAgICAgIG1hcC5zZXQobmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSk7XG4gICAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWFwLnNpemUpXG4gICAgICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgQm9vbGVhbihnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuaW5mbygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5jb25zdCBkZWJ1Z0lkID0gU3ltYm9sKFwiZGVmZXJyZWRQcm9taXNlSURcIik7XG5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xuICBbZGVidWdJZF0/OiBudW1iZXJcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xubGV0IGlkID0gMTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBwcm9taXNlW2RlYnVnSWRdID0gaWQrKztcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gZG9lcyBhIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nLCBfZXhjZXB0XyBhIGZ1bmN0aW9uXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKVxuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfVxuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfVxuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gVCAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+PlxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIFRoaXMgaXMgcGF0Y2ggdG8gdGhlIHN0ZCBsaWIgZGVmaW5pdGlvbiBvZiBBcnJheTxUPi4gSSBkb24ndCBrbm93IHdoeSBpdCdzIGFic2VudCxcbiAgLy8gYXMgdGhpcyBpcyB0aGUgaW1wbGVtZW50YXRpb24gaW4gYWxsIEphdmFTY3JpcHQgZW5naW5lcy4gSXQgaXMgcHJvYmFibHkgYSByZXN1bHRcbiAgLy8gb2YgaXRzIGFic2VuY2UgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvdmFsdWVzLFxuICAvLyB3aGljaCBpbmhlcml0cyBmcm9tIHRoZSBPYmplY3QucHJvdG90eXBlLCB3aGljaCBtYWtlcyBubyBjbGFpbSBmb3IgdGhlIHJldHVybiB0eXBlXG4gIC8vIHNpbmNlIGl0IGNvdWxkIGJlIG92ZXJyaWRkZW0uIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSwgYSBUUyBkZWZuIHNob3VsZCBhbHNvIG92ZXJyaWRlXG4gIC8vIGl0LCBsaWtlIE51bWJlciwgU3RyaW5nLCBCb29sZWFuIGV0YyBkby5cbiAgaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICB2YWx1ZU9mKCk6IEFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczogVCk6IFQgZXh0ZW5kcyBJdGVyYWJsZVR5cGU8aW5mZXIgWj4gPyBaIDogT2JqZWN0O1xuICB9XG59XG5cbnR5cGUgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzID0ga2V5b2YgQXJyYXk8YW55PiAmIGtleW9mIEFzeW5jSXRlcmFibGVIZWxwZXJzXG5cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSBJUCBleHRlbmRzIEl0ZXJhYmlsaXR5PCdzaGFsbG93Jz4gPyB7XG4gIFtLIGluIGtleW9mIE9taXQ8SVAsIHR5cGVvZiBJdGVyYWJpbGl0eT5dOiBJdGVyYWJsZVR5cGU8SVBbS10+XG59IDoge1xuICBbSyBpbiBrZXlvZiBJUF06IChcbiAgICBJUFtLXSBleHRlbmRzIEFycmF5PGluZmVyIEU+XG4gICAgPyAvKlxuICAgICAgQmVjYXVzZSBUUyBkb2Vzbid0IGltcGxlbWVudCBzZXBhcmF0ZSB0eXBlcyBmb3IgcmVhZC93cml0ZSwgb3IgY29tcHV0ZWQgZ2V0dGVyL3NldHRlciBuYW1lcyAod2hpY2ggRE8gYWxsb3dcbiAgICAgIGRpZmZlcmVudCB0eXBlcyBmb3IgYXNzaWdubWVudCBhbmQgZXZhbHVhdGlvbiksIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBkZWZpbmUgdHlwZSBmb3IgYXJyYXkgbWVtYmVycyB0aGF0IHBlcm1pdFxuICAgICAgZGVyZWZlcmVuY2luZyBvZiBub24tY2xhc2hpbmggYXJyYXkga2V5cyBzdWNoIGFzIGBqb2luYCBvciBgc29ydGAgYW5kIEFzeW5jSXRlcmF0b3IgbWV0aG9kcyB3aGljaCBhbHNvIGFsbG93c1xuICAgICAgc2ltcGxlIGFzc2lnbm1lbnQgb2YgdGhlIGZvcm0gYHRoaXMuaXRlcmFibGVBcnJheU1lbWJlciA9IFsuLi5dYC5cblxuICAgICAgVGhlIENPUlJFQ1QgdHlwZSBmb3IgdGhlc2UgZmllbGRzIHdvdWxkIGJlIChpZiBUUyBoYWQgc3ludGF4IGZvciBpdCk6XG4gICAgICBnZXQgW0tdICgpOiBPbWl0PEFycmF5PEUgJiBBc3luY0V4dHJhSXRlcmFibGU8RT4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgc2V0IFtLXSAoKTogQXJyYXk8RT4gfCBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgKi9cbiAgICAgIE9taXQ8QXJyYXk8SXRlcmFibGVUeXBlPEU+PiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPEVbXT4+XG4gICAgOiAoXG4gICAgICBJUFtLXSBleHRlbmRzIG9iamVjdFxuICAgICAgPyBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+XG4gICAgICA6IElQW0tdXG4gICAgKSAmIEl0ZXJhYmxlVHlwZTxJUFtLXT5cbiAgKVxufVxuXG4vKiBUaGluZ3MgdG8gc3VwcGxpZW1lbnQgdGhlIEpTIGJhc2UgQXN5bmNJdGVyYWJsZSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMge1xuICBwdXNoKHZhbHVlOiBUKTogYm9vbGVhbjtcbiAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbi8vIE5COiBUaGlzIGFsc28gKGluY29ycmVjdGx5KSBwYXNzZXMgc3luYyBpdGVyYXRvcnMsIGFzIHRoZSBwcm90b2NvbCBuYW1lcyBhcmUgdGhlIHNhbWVcbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmICduZXh0JyBpbiBvICYmIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gbykgJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXI8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pXG59XG5cbmV4cG9ydCB0eXBlIEFzeW5jUHJvdmlkZXI8VD4gPSBBc3luY0l0ZXJhdG9yPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPlxuXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNJdGVyYXRvcjxUPihvOiBBc3luY1Byb3ZpZGVyPFQ+KSB7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKSByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFuIGFzeW5jIHByb3ZpZGVyXCIpO1xufVxuXG50eXBlIEFzeW5jSXRlcmFibGVIZWxwZXJzID0gdHlwZW9mIGFzeW5jRXh0cmFzO1xuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSxcbiAgICBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPixcbiAgICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4gICkge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgZm4sIGluaXRpYWxWYWx1ZSlcbiAgfSxcbiAgbWFwLFxuICBmaWx0ZXIsXG4gIHVuaXF1ZSxcbiAgd2FpdEZvcixcbiAgbXVsdGksXG4gIGluaXRpYWxseSxcbiAgY29uc3VtZSxcbiAgbWVyZ2U8VCwgQSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+PltdPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIC4uLm06IEEpIHtcbiAgICByZXR1cm4gbWVyZ2UodGhpcywgLi4ubSk7XG4gIH0sXG4gIGNvbWJpbmU8VCwgUyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgb3RoZXJzOiBTKSB7XG4gICAgcmV0dXJuIGNvbWJpbmUoT2JqZWN0LmFzc2lnbih7ICdfdGhpcyc6IHRoaXMgfSwgb3RoZXJzKSk7XG4gIH1cbn07XG5cbmNvbnN0IGV4dHJhS2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGFzeW5jRXh0cmFzKSwgLi4uT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXSBhcyAoa2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzKVtdO1xuXG4vLyBMaWtlIE9iamVjdC5hc3NpZ24sIGJ1dCB0aGUgYXNzaWduZWQgcHJvcGVydGllcyBhcmUgbm90IGVudW1lcmFibGVcbmNvbnN0IGl0ZXJhdG9yQ2FsbFNpdGUgPSBTeW1ib2woXCJJdGVyYXRvckNhbGxTaXRlXCIpO1xuZnVuY3Rpb24gYXNzaWduSGlkZGVuPEQgZXh0ZW5kcyBvYmplY3QsIFMgZXh0ZW5kcyBvYmplY3Q+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgaWYgKERFQlVHKSB7XG4gICAgaWYgKCEoaXRlcmF0b3JDYWxsU2l0ZSBpbiBkKSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGl0ZXJhdG9yQ2FsbFNpdGUsIHsgdmFsdWU6IG5ldyBFcnJvcigpLnN0YWNrIH0pXG4gIH1cbiAgcmV0dXJuIGQgYXMgRCAmIFM7XG59XG5cbmNvbnN0IF9wZW5kaW5nID0gU3ltYm9sKCdwZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbX3BlbmRpbmddOiBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsLFxuICAgIFtfaXRlbXNdOiBbXSBhcyBJdGVyYXRvclJlc3VsdDxUPltdIHwgbnVsbCxcblxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcSBhcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD47XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAocVtfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW19pdGVtc10uc2hpZnQoKSEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCB0aGlzIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIHFbX3BlbmRpbmddLnVuc2hpZnQodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4odj86IHVua25vd24pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVqZWN0KHZhbHVlLnZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkgcmV0dXJuIC0xOyAvLyBUaGUgcXVldWUgaGFzIG5vIGNvbnN1bWVycyBhbmQgaGFzIHRlcm1pbmF0ZWQuXG4gICAgICByZXR1cm4gcVtfaXRlbXNdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmNvbnN0IF9pbmZsaWdodCA9IFN5bWJvbCgnaW5mbGlnaHQnKTtcbmZ1bmN0aW9uIGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3ApIGFzIFJldHVyblR5cGU8dHlwZW9mIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4+ICYgeyBbX2luZmxpZ2h0XTogU2V0PFQ+IH07XG4gIHFbX2luZmxpZ2h0XSA9IG5ldyBTZXQ8VD4oKTtcblxuICBxLnB1c2ggPSBmdW5jdGlvbiAodmFsdWU6IFQpIHtcbiAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRGVib3VuY2VcbiAgICBpZiAocVtfaW5mbGlnaHRdLmhhcyh2YWx1ZSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgIHFbX2luZmxpZ2h0XS5hZGQodmFsdWUpO1xuICAgICAgY29uc3QgcCA9IHFbX3BlbmRpbmddLnBvcCgpITtcbiAgICAgIHAuZmluYWxseSgoKSA9PiBxW19pbmZsaWdodF0uZGVsZXRlKHZhbHVlKSk7XG4gICAgICBwLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgfSBlbHNlIGlmICghcVtfaXRlbXNdLmZpbmQodiA9PiB2LnZhbHVlID09PSB2YWx1ZSkpIHtcbiAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBxO1xufVxuXG4vLyBSZS1leHBvcnQgdG8gaGlkZSB0aGUgaW50ZXJuYWxzXG5leHBvcnQgY29uc3QgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuZXhwb3J0IGNvbnN0IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5jb25zdCBfcHJveGllZEFzeW5jSXRlcmF0b3IgPSBTeW1ib2woJ19wcm94aWVkQXN5bmNJdGVyYXRvcicpO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUl0ZXJhYmxlUHJvcGVydHk8VCBleHRlbmRzIG9iamVjdCwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgZXh0cmFzW2tdID0gYltrIGFzIGtleW9mIHR5cGVvZiBiXSk7XG4gICAgaWYgKCEoX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIGEpKVxuICAgICAgYXNzaWduSGlkZGVuKGEsIGV4dHJhcyk7XG4gICAgcmV0dXJuIGI7XG4gIH1cblxuICAvLyBDcmVhdGUgc3R1YnMgdGhhdCBsYXppbHkgY3JlYXRlIHRoZSBBc3luY0V4dHJhSXRlcmFibGUgaW50ZXJmYWNlIHdoZW4gaW52b2tlZFxuICBmdW5jdGlvbiBsYXp5QXN5bmNNZXRob2Q8TSBleHRlbmRzIGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcz4obWV0aG9kOiBNKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFttZXRob2RdOiBmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICBjb25zdCBleHRyYXMgPSB7IFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IGluaXRJdGVyYXRvciB9IGFzIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiAmIHsgW0l0ZXJhYmlsaXR5XT86ICdzaGFsbG93JyB9O1xuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT4gLy8gQHRzLWlnbm9yZVxuICAgIGV4dHJhc1trXSA9IGxhenlBc3luY01ldGhvZChrKSlcbiAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYgJiYgdltJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSB2W0l0ZXJhYmlsaXR5XTtcbiAgfVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTxWPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWIHwgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHY7XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8obmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LCB5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCwgeyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCAmJiBERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBwaXBlZCBmcm9tIGFub3RoZXIgaXRlcmF0b3IsIGFuZCBtaWdodCBiZSBvdmVycndpdHRlbiBsYXRlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHB1c2godj8udmFsdWVPZigpIGFzIFYpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIG9iaiBhcyBhbnk7XG5cbiAgZnVuY3Rpb24gYm94PFY+KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgLy8gV2UgYm94IG9iamVjdHMgYnkgY3JlYXRpbmcgYSBQcm94eSBmb3IgdGhlIG9iamVjdCB0aGF0IHB1c2hlcyBvbiBnZXQvc2V0L2RlbGV0ZSwgYW5kIG1hcHMgdGhlIHN1cHBsaWVkIGFzeW5jIGl0ZXJhdG9yIHRvIHB1c2ggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgICAgLy8gVGhlIHByb3hpZXMgYXJlIHJlY3Vyc2l2ZSwgc28gdGhhdCBpZiBhbiBvYmplY3QgY29udGFpbnMgb2JqZWN0cywgdGhleSB0b28gYXJlIHByb3hpZWQuIE9iamVjdHMgY29udGFpbmluZyBwcmltaXRpdmVzIHJlbWFpbiBwcm94aWVkIHRvXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYm94T2JqZWN0KGEsIHBkcyk7XG5cbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG5cbiAgdHlwZSBXaXRoUGF0aCA9IHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYTogViwgcGF0aDogc3RyaW5nIHwgbnVsbCB9IH07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspO1xuICAgIHJldHVybiBvO1xuICB9XG4gIGZ1bmN0aW9uIGJveE9iamVjdChhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxQb3NzaWJseVdpdGhQYXRoPikge1xuICAgIGxldCB3aXRoUGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFdpdGhQYXRoW3R5cGVvZiBfcHJveGllZEFzeW5jSXRlcmF0b3JdPjtcbiAgICBsZXQgd2l0aG91dFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgJHtuYW1lLnRvU3RyaW5nKCl9JHtwYXRofS4ke2tleS50b1N0cmluZygpfSBhcyBpdCBpcyBwYXJ0IG9mIGFzeW5jSXRlcmF0b3JgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIGlmIChSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGdldHRpbmcgdGhlIHZhbHVlIG9mIGEgYm94ZWQgb2JqZWN0IG1lbWJlciwgcHJlZmVyIGFzeW5jRXh0cmFJdGVyYWJsZSBvdmVyIHRhcmdldCBrZXlzXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGFuIGFzeW5jRXh0cmFJdGVyYWJsZSBtZW1iZXIsIGNyZWF0ZSB0aGUgbWFwcGVkIHF1ZXVlIHRvIGdlbmVyYXRlIGl0XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHdpdGhvdXRQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0uYSA6IG8pO1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2l0aFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXSA6IHsgYTogbywgcGF0aDogbnVsbCB9KTtcblxuICAgICAgICAgICAgICBsZXQgYWkgPSBmaWx0ZXJNYXAod2l0aFBhdGgsIChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGRlc3RydWN0dXJlKG8uYSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgIT09IHYgfHwgby5wYXRoID09PSBudWxsIHx8IG8ucGF0aC5zdGFydHNXaXRoKHBhdGgpID8gdiA6IElnbm9yZTtcbiAgICAgICAgICAgICAgfSwgSWdub3JlLCBkZXN0cnVjdHVyZShhLCBwYXRoKSk7XG4gICAgICAgICAgICAgIHJldHVybiBhaVtrZXkgYXMga2V5b2YgdHlwZW9mIGFpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGEgdGFyZ2V0IHByb3BlcnR5LCBjcmVhdGUgdGhlIHByb3h5IHRvIGhhbmRsZSBpdFxuICAgICAgICAgIGlmIChrZXkgPT09ICd2YWx1ZU9mJykgcmV0dXJuICgpID0+IGRlc3RydWN0dXJlKGEsIHBhdGgpO1xuICAgICAgICAgIGlmIChrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlLCBzaW5jZSBTeW1ib2wudG9QcmltaXRpdmUgaXMgaW4gaGEoKSwgd2UgbmVlZCB0byBpbXBsZW1lbnQgaXRcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaGludD86ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHRhcmdldCkuY2FsbCh0YXJnZXQsIGhpbnQpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ3N0cmluZycpIHJldHVybiB0YXJnZXQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdudW1iZXInKSByZXR1cm4gTnVtYmVyKHRhcmdldCk7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudmFsdWVPZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICgoIShrZXkgaW4gdGFyZ2V0KSB8fCBPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSkgJiYgIShJdGVyYWJpbGl0eSBpbiB0YXJnZXQgJiYgdGFyZ2V0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGZpZWxkID09PSAnZnVuY3Rpb24nKSB8fCBpc0FzeW5jSXRlcihmaWVsZClcbiAgICAgICAgICAgICAgICA/IGZpZWxkXG4gICAgICAgICAgICAgICAgOiBuZXcgUHJveHkoT2JqZWN0KGZpZWxkKSwgaGFuZGxlcihwYXRoICsgJy4nICsga2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBzeW1ib2xpYyBlbnRyeSwgb3IgYSBwcm90b3R5cGljYWwgdmFsdWUgKHNpbmNlIGl0J3MgaW4gdGhlIHRhcmdldCwgYnV0IG5vdCBhIHRhcmdldCBwcm9wZXJ0eSlcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cbi8vY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQgPSBuZXcgTWFwPG51bWJlciwgKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55Pik+KCk7XG4gIGNvbnN0IHByb21pc2VzID0gbmV3IE1hcDxudW1iZXIsUHJvbWlzZTx7IGtleTogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT4+KCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpID0+IHsgfVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgY29uc3QgaXRlciA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGEgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT47XG4gICAgICBpdC5zZXQobiwgaXRlcik7XG4gICAgICBwcm9taXNlcy5zZXQobiwgaXRlci5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsga2V5OiBuLCByZXN1bHQgfSkpKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gcHJvbWlzZXMuc2l6ZVxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcy52YWx1ZXMoKSkudGhlbigoeyBrZXksIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGl0LmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2VzLnNldChrZXksXG4gICAgICAgICAgICAgIGl0LmhhcyhrZXkpXG4gICAgICAgICAgICAgICAgPyBpdC5nZXQoa2V5KSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGtleSwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBrZXksIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSB9KSlcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGtleSwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSB9KSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQudGhyb3chKGV4KSAvLyA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgaXQua2V5cygpKSB7XG4gICAgICAgIGlmIChwcm9taXNlcy5oYXMoa2V5KSkge1xuICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGF3YWl0IGl0LmdldChrZXkpPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBpdC5rZXlzKCkpIHtcbiAgICAgICAgaWYgKHByb21pc2VzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgcmVzdWx0c1trZXldID0gYXdhaXQgaXQuZ2V0KGtleSk/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgY29uc3Qgc2kgPSBuZXcgTWFwPHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgQXN5bmNJdGVyYXRvcjxhbnk+PigpO1xuICBsZXQgcGM6IE1hcDxzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIFByb21pc2U8eyBrOiBzdHJpbmcsIGlyOiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+PjsgLy8gSW5pdGlhbGl6ZWQgbGF6aWx5XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gbmV3IE1hcChPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssIHNpdF0pID0+IHtcbiAgICAgICAgICBzaS5zZXQoaywgc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKSk7XG4gICAgICAgICAgcmV0dXJuIFtrLCBzaS5nZXQoaykhLm5leHQoKS50aGVuKGlyID0+ICh7IHNpLCBrLCBpciB9KSldO1xuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoZnVuY3Rpb24gc3RlcCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKHBjLnZhbHVlcygpKS50aGVuKCh7IGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGMuZGVsZXRlKGspO1xuICAgICAgICAgICAgc2kuZGVsZXRlKGspO1xuICAgICAgICAgICAgaWYgKCFwYy5zaXplKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGMuc2V0KGssIHNpLmdldChrKSEubmV4dCgpLnRoZW4oaXIgPT4gKHsgaywgaXIgfSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdHMuaWdub3JlUGFydGlhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFjY3VtdWxhdGVkKS5sZW5ndGggPCBPYmplY3Qua2V5cyhzcmMpLmxlbmd0aClcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICB9KVxuICAgICAgfSkoKTtcbiAgICB9LFxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGFpIG9mIHNpLnZhbHVlcygpKSB7XG4gICAgICAgICAgYWkucmV0dXJuPy4odilcbiAgICAgIH07XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGFpIG9mIHNpLnZhbHVlcygpKVxuICAgICAgICBhaS50aHJvdz8uKGV4KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGPiA9XG4gIEYgZXh0ZW5kcyAoKSA9PiBBc3luY0l0ZXJhdG9yPGluZmVyIFQ+XG4gID8gVCA6IG5ldmVyO1xuXG5hc3luYyBmdW5jdGlvbiBjb25zdW1lPFUgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+KHRoaXM6IFUsIGY/OiAodTogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBsYXN0OiB1bmRlZmluZWQgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pIHtcbiAgICBsYXN0ID0gZj8uKHUpO1xuICB9XG4gIGF3YWl0IGxhc3Q7XG59XG5cbnR5cGUgTWFwcGVyPFUsIFI+ID0gKChvOiBVLCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4pO1xudHlwZSBNYXliZVByb21pc2VkPFQ+ID0gUHJvbWlzZUxpa2U8VD4gfCBUO1xuXG4vKiBBIGdlbmVyYWwgZmlsdGVyICYgbWFwcGVyIHRoYXQgY2FuIGhhbmRsZSBleGNlcHRpb25zICYgcmV0dXJucyAqL1xuZXhwb3J0IGNvbnN0IElnbm9yZSA9IFN5bWJvbChcIklnbm9yZVwiKTtcblxudHlwZSBQYXJ0aWFsSXRlcmFibGU8VCA9IGFueT4gPSBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VD4+O1xuXG5mdW5jdGlvbiByZXNvbHZlU3luYzxaLCBSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOiAodjogWikgPT4gUiwgZXhjZXB0OiAoeDogYW55KSA9PiBhbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGlzUHJvbWlzZUxpa2UodikpXG4gICAgcmV0dXJuIHYudGhlbih0aGVuLCBleGNlcHQpO1xuICB0cnkge1xuICAgIHJldHVybiB0aGVuKHYpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0dXJuIGV4Y2VwdChleClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHNvdXJjZTogVSxcbiAgZm46IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPixcbiAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZSxcbiAgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PjtcbiAgZnVuY3Rpb24gZG9uZSh2OiBJdGVyYXRvclJlc3VsdDxIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFU+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+LCBhbnk+IHwgdW5kZWZpbmVkKXtcbiAgICAvLyBAdHMtaWdub3JlIC0gcmVtb3ZlIHJlZmVyZW5jZXMgZm9yIEdDXG4gICAgYWkgPSBmYWkgPSBudWxsO1xuICAgIHByZXYgPSBJZ25vcmU7XG4gICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH1cbiAgfVxuICBsZXQgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IChwcmV2ID0gSWdub3JlLCByZXNvbHZlKHApKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUmVzcG9uc2UgPSBhaS50aHJvdz8uKGV4KSA/PyBhaS5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICAgICAgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgKGFpKSBhbmQgY29uc3VtZXIgKHJlamVjdClcbiAgICAgICAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShzb3VyY2VSZXNwb25zZSkpIHNvdXJjZVJlc3BvbnNlLnRoZW4ocmVqZWN0LHJlamVjdCk7XG4gICAgICAgICAgICAgICAgZWxzZSByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICBleCA9PiB7XG4gICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgcHJldiA9IElnbm9yZTsgLy8gUmVtb3ZlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICAgIH1cbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgcHJldiA9IElnbm9yZTsgLy8gUmVtb3ZlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICBjb25zdCBzb3VyY2VSZXNwb25zZSA9IGFpLnRocm93Py4oZXgpID8/IGFpLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAoYWkpIGFuZCBjb25zdW1lciAocmVqZWN0KVxuICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZVJlc3BvbnNlKSkgc291cmNlUmVzcG9uc2UudGhlbihyZWplY3QsIHJlamVjdCk7XG4gICAgICAgICAgZWxzZSByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogc291cmNlUmVzcG9uc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93Py4oZXgpID8/IGFpPy5yZXR1cm4/LihleCkpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9XG4gIH07XG4gIC8vIGlmIChERUJVRykgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZhaSwnZGVidWc6IHNvdXJjZSBhc3luY0l0ZXJhdG9yJyx7XG4gIC8vICAgdmFsdWU6IG5ldyBXZWFrUmVmKHNvdXJjZSlcbiAgLy8gfSlcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoaXQ/LmRvbmUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgYWkhLm5leHQoKVxuICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGN1cnJlbnQ/LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KTtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgICAgIGN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpIHtcbiAgICAvLyBAdHMtaWdub3JlOiByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IG1haSA9IGN1cnJlbnQgPSBudWxsO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cblxuICBsZXQgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgZmluYWwgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93Py4oZXgpID8/IGFpPy5yZXR1cm4/LihleCkpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG50eXBlIFdoZW5QYXJhbWV0ZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFZhbGlkV2hlblNlbGVjdG9yPElEUz5cbnwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbnwgUHJvbWlzZTxhbnk+IC8qIEp1c3QgZ2V0cyB3cmFwcGVkIGluIGEgc2luZ2xlIGB5aWVsZGAgKi9cbnwgQXN5bmNJdGVyYWJsZTxhbnk+XG5cbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFdoZW5QYXJhbWV0ZXI8SURTPj5cblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXJcblxuLy8gVGhlIGV4dGVuZGVkIGl0ZXJhdG9yIHRoYXQgc3VwcG9ydHMgYXN5bmMgaXRlcmF0b3IgbWFwcGluZywgY2hhaW5pbmcsIGV0Y1xuZXhwb3J0IHR5cGUgV2hlblJldHVybjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgTWFwcGFibGVJdGVyYWJsZTxcbiAgICBBc3luY0V4dHJhSXRlcmFibGU8XG4gICAgICBXaGVuSXRlcmF0ZWRUeXBlPFM+Pj5cblxudHlwZSBFbXB0eU9iamVjdCA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIG5ldmVyPlxuXG5pbnRlcmZhY2UgU3BlY2lhbFdoZW5FdmVudHMge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn1cblxuaW50ZXJmYWNlIFdoZW5FdmVudHMgZXh0ZW5kcyBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAsIFNwZWNpYWxXaGVuRXZlbnRzIHt9XG50eXBlIEV2ZW50TmFtZUxpc3Q8VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBgJHtTfSwke0V2ZW50TmFtZUxpc3Q8Uj59YFxuICA6IG5ldmVyXG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyXG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG4vLyBOb3RlOiB0aGlzIHNsb3dzIGRvd24gdHlwZXNjcmlwdC4gU2ltcGx5IGRlZmluaW5nIGBDU1NJZGVudGlmaWVyID0gc3RyaW5nYCBpcyBxdWlja2VyLCBidXQgcHJldmVudHMgd2hlbiB2YWxpZGF0aW5nIHN1Yi1JRFNzIG9yIHNlbGVjdG9yIGZvcm1hdHRpbmdcbnR5cGUgQ1NTSWRlbnRpZmllcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCMke0lEU31gIHwgYCMke0lEU30+YCB8IGAuJHtzdHJpbmd9YCB8IGBbJHtzdHJpbmd9XWBcblxuLyogVmFsaWRXaGVuU2VsZWN0b3JzIGFyZTpcbiAgICBAc3RhcnRcbiAgICBAcmVhZHlcbiAgICBldmVudDpzZWxlY3RvclxuICAgIGV2ZW50ICAgICAgICAgICBcInRoaXNcIiBlbGVtZW50LCBldmVudCB0eXBlPSdldmVudCdcbiAgICBzZWxlY3RvciAgICAgICAgc3BlY2lmaWNlZCBzZWxlY3RvcnMsIGltcGxpZXMgXCJjaGFuZ2VcIiBldmVudFxuKi9cblxuZXhwb3J0IHR5cGUgVmFsaWRXaGVuU2VsZWN0b3I8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAke2tleW9mIFNwZWNpYWxXaGVuRXZlbnRzfWBcbiAgfCBgJHtFdmVudEF0dHJpYnV0ZX06JHtDU1NJZGVudGlmaWVyPElEUz59YFxuICB8IEV2ZW50QXR0cmlidXRlXG4gIHwgQ1NTSWRlbnRpZmllcjxJRFM+XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPiA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlclxuXG50eXBlIEV4dHJhY3RFdmVudE5hbWVzPFM+XG4gID0gUyBleHRlbmRzIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzID8gU1xuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBWfToke0NTU0lkZW50aWZpZXJ9YCA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHMgPyBFdmVudE5hbWVVbmlvbjxTPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxTPlxuICA6IFMgZXh0ZW5kcyBDU1NJZGVudGlmaWVyID8gJ2NoYW5nZSdcbiAgOiBuZXZlclxuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XVxuXG4vKiogd2hlbiAqKi9cbmludGVyZmFjZSBFdmVudE9ic2VydmF0aW9uPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4ge1xuICBwdXNoOiAoZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKT0+dm9pZDtcbiAgdGVybWluYXRlOiAoZXg6IEVycm9yKT0+dm9pZDtcbiAgY29udGFpbmVyUmVmOiBXZWFrUmVmPEVsZW1lbnQ+XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsO1xuICBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW47XG59XG5cbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IFdlYWtNYXA8RG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBNYXA8a2V5b2YgV2hlbkV2ZW50cywgU2V0PEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPj4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyh0aGlzKSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQodGhpcywgbmV3IE1hcCgpKTtcblxuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQodGhpcykhLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyUmVmLCBzZWxlY3RvciwgaW5jbHVkZUNoaWxkcmVuIH0gPSBvO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBjb250YWluZXJSZWYuZGVyZWYoKTtcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWNvbnRhaW5lci5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXI/LmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGluY2x1ZGVDaGlsZHJlbiA/IG4uY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gbikgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGluY2x1ZGVDaGlsZHJlbiA/IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpIDogZXYudGFyZ2V0ID09PSBjb250YWluZXIgKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzOiBzdHJpbmcpOiBzIGlzIENTU0lkZW50aWZpZXIge1xuICByZXR1cm4gQm9vbGVhbihzICYmIChzLnN0YXJ0c1dpdGgoJyMnKSB8fCBzLnN0YXJ0c1dpdGgoJy4nKSB8fCAocy5zdGFydHNXaXRoKCdbJykgJiYgcy5lbmRzV2l0aCgnXScpKSkpO1xufVxuXG5mdW5jdGlvbiBjaGlsZGxlc3M8VCBleHRlbmRzIHN0cmluZyB8IG51bGw+KHNlbDogVCk6IFQgZXh0ZW5kcyBudWxsID8geyBpbmNsdWRlQ2hpbGRyZW46IHRydWUsIHNlbGVjdG9yOiBudWxsIH0gOiB7IGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbiwgc2VsZWN0b3I6IFQgfSB7XG4gIGNvbnN0IGluY2x1ZGVDaGlsZHJlbiA9ICFzZWwgfHwgIXNlbC5lbmRzV2l0aCgnPicpXG4gIHJldHVybiB7IGluY2x1ZGVDaGlsZHJlbiwgc2VsZWN0b3I6IGluY2x1ZGVDaGlsZHJlbiA/IHNlbCA6IHNlbC5zbGljZSgwLC0xKSB9IGFzIGFueTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXaGVuU2VsZWN0b3I8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPih3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pOiB1bmRlZmluZWQgfCBbUmV0dXJuVHlwZTx0eXBlb2YgY2hpbGRsZXNzPiwga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXSB7XG4gIGNvbnN0IHBhcnRzID0gd2hhdC5zcGxpdCgnOicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgcmV0dXJuIFtjaGlsZGxlc3MocGFydHNbMF0pLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbeyBpbmNsdWRlQ2hpbGRyZW46IHRydWUsIHNlbGVjdG9yOiBudWxsIH0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgcmV0dXJuIFtjaGlsZGxlc3MocGFydHNbMV0pLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbeyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yfSwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIrd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChjb250YWluZXIub3duZXJEb2N1bWVudCwgbmV3IE1hcCgpKTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmhhcyhldmVudE5hbWUpKSB7XG4gICAgY29udGFpbmVyLm93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGRvY0V2ZW50SGFuZGxlciwge1xuICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgIGNhcHR1cmU6IHRydWVcbiAgICB9KTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICB9XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuZ2V0KGV2ZW50TmFtZSk7XG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IG9ic2VydmF0aW9ucyEuZGVsZXRlKGRldGFpbHMpKTtcbiAgY29uc3QgZGV0YWlsczogRXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lclJlZjogbmV3IFdlYWtSZWYoY29udGFpbmVyKSxcbiAgICBpbmNsdWRlQ2hpbGRyZW4sXG4gICAgc2VsZWN0b3JcbiAgfTtcblxuICBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgc2VsZWN0b3IgPyBbc2VsZWN0b3JdIDogdW5kZWZpbmVkKVxuICAgIC50aGVuKF8gPT4gb2JzZXJ2YXRpb25zIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIGRvbmVJbW1lZGlhdGVseTxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICByZXR1cm4gdW5kZWZpbmVkIGFzIFo7XG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgY29uc3QgaXNNaXNzaW5nID0gKHNlbDogQ1NTSWRlbnRpZmllciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciA9PiBCb29sZWFuKHR5cGVvZiBzZWwgPT09ICdzdHJpbmcnICYmICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5tYXAodyA9PiB3Py5zZWxlY3RvcikuZmlsdGVyKGlzTWlzc2luZyk7XG5cbiAgICBsZXQgZXZlbnRzOiBBc3luY0l0ZXJhdG9yPGFueSwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy50aHJvdykgcmV0dXJuIGV2ZW50cy50aHJvdyhleCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICB9LFxuICAgICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8ucmV0dXJuKSByZXR1cm4gZXZlbnRzLnJldHVybih2KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgfSxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGlmIChldmVudHMpIHJldHVybiBldmVudHMubmV4dCgpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgbWlzc2luZykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogZG9uZUltbWVkaWF0ZWx5KCk7XG5cbiAgICAgICAgICAvLyBOb3cgZXZlcnl0aGluZyBpcyByZWFkeSwgd2Ugc2ltcGx5IGRlbGVnYXRlIGFsbCBhc3luYyBvcHMgdG8gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvciBcImV2ZW50c1wiXG4gICAgICAgICAgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhhaSkpO1xuICB9XG5cbiAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgIDogKGRvbmVJbW1lZGlhdGVseTxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyOiBFbGVtZW50LCBzZWxlY3RvcnM/OiBzdHJpbmdbXSkge1xuICBmdW5jdGlvbiBjb250YWluZXJJc0luRE9NKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChjb250YWluZXIuaXNDb25uZWN0ZWQpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICAgICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gWy4uLnIucmVtb3ZlZE5vZGVzXS5zb21lKHIgPT4gciA9PT0gY29udGFpbmVyIHx8IHIuY29udGFpbnMoY29udGFpbmVyKSkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJSZW1vdmVkIGZyb20gRE9NXCIpKTtcbiAgICAgICAgfVxuICAgICAgfSkub2JzZXJ2ZShjb250YWluZXIub3duZXJEb2N1bWVudC5ib2R5LCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgICAgfSlcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgYEVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHM6YCk7XG4gICAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKHN0YWNrICsgXCJcXG5cIiArIGNvbnRhaW5lci5vdXRlckhUTUwpO1xuICAgICAgICAvL3JlamVjdChuZXcgRXJyb3IoXCJFbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kc1wiKSk7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQobWlzc2luZzogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICAgIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90aGluZyBpcyBtaXNzaW5nXG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcblxuICAgIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHM6IGApID8/ICc/Pyc7XG4gICAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKHN0YWNrICsgbWlzc2luZyArIFwiXFxuXCIpO1xuICAgICAgfSwgdGltZU91dFdhcm4pO1xuXG4gICAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBjb250YWluZXJJc0luRE9NKCkudGhlbigoKSA9PiBhbGxTZWxlY3RvcnNQcmVzZW50KHNlbGVjdG9ycykpXG4gIHJldHVybiBjb250YWluZXJJc0luRE9NKCk7XG59XG4iLCAiLyogVHlwZXMgZm9yIHRhZyBjcmVhdGlvbiwgaW1wbGVtZW50ZWQgYnkgYHRhZygpYCBpbiBhaS11aS50cy5cbiAgTm8gY29kZS9kYXRhIGlzIGRlY2xhcmVkIGluIHRoaXMgZmlsZSAoZXhjZXB0IHRoZSByZS1leHBvcnRlZCBzeW1ib2xzIGZyb20gaXRlcmF0b3JzLnRzKS5cbiovXG5cbmltcG9ydCB0eXBlIHsgQXN5bmNQcm92aWRlciwgSWdub3JlLCBJdGVyYWJsZVByb3BlcnRpZXMsIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuaW1wb3J0IHR5cGUgeyBVbmlxdWVJRCB9IGZyb20gXCIuL2FpLXVpLmpzXCI7XG5cbmV4cG9ydCB0eXBlIENoaWxkVGFncyA9IE5vZGUgLy8gVGhpbmdzIHRoYXQgYXJlIERPTSBub2RlcyAoaW5jbHVkaW5nIGVsZW1lbnRzKVxuICB8IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gLy8gVGhpbmdzIHRoYXQgY2FuIGJlIGNvbnZlcnRlZCB0byB0ZXh0IG5vZGVzIHZpYSB0b1N0cmluZ1xuICB8IHVuZGVmaW5lZCAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICB8IHR5cGVvZiBJZ25vcmUgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgLy8gTkI6IHdlIGNhbid0IGNoZWNrIHRoZSBjb250YWluZWQgdHlwZSBhdCBydW50aW1lLCBzbyB3ZSBoYXZlIHRvIGJlIGxpYmVyYWxcbiAgLy8gYW5kIHdhaXQgZm9yIHRoZSBkZS1jb250YWlubWVudCB0byBmYWlsIGlmIGl0IHR1cm5zIG91dCB0byBub3QgYmUgYSBgQ2hpbGRUYWdzYFxuICB8IEFzeW5jSXRlcmFibGU8Q2hpbGRUYWdzPiB8IEFzeW5jSXRlcmF0b3I8Q2hpbGRUYWdzPiB8IFByb21pc2VMaWtlPENoaWxkVGFncz4gLy8gVGhpbmdzIHRoYXQgd2lsbCByZXNvbHZlIHRvIGFueSBvZiB0aGUgYWJvdmVcbiAgfCBBcnJheTxDaGlsZFRhZ3M+XG4gIHwgSXRlcmFibGU8Q2hpbGRUYWdzPiAvLyBJdGVyYWJsZSB0aGluZ3MgdGhhdCBob2xkIHRoZSBhYm92ZSwgbGlrZSBBcnJheXMsIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdFxuXG4vLyBEZWJ1ZyB1c2Ugb25seVxuLy8gZXhwb3J0IHR5cGUgRmxhdHRlbjxPPiA9IFt7XG4vLyAgIFtLIGluIGtleW9mIE9dOiBPW0tdXG4vLyB9XVtudW1iZXJdO1xuXG4vLyBleHBvcnQgdHlwZSBEZWVwRmxhdHRlbjxPPiA9IFt7XG4vLyAgIFtLIGluIGtleW9mIE9dOiBGbGF0dGVuPE9bS10+XG4vLyB9XVtudW1iZXJdO1xuXG5cbi8qIFR5cGVzIHVzZWQgdG8gdmFsaWRhdGUgYW4gZXh0ZW5kZWQgdGFnIGRlY2xhcmF0aW9uICovXG5cbnR5cGUgRGVlcFBhcnRpYWw8WD4gPSBbWF0gZXh0ZW5kcyBbe31dID8geyBbSyBpbiBrZXlvZiBYXT86IERlZXBQYXJ0aWFsPFhbS10+IH0gOiBYXG50eXBlIE5ldmVyRW1wdHk8TyBleHRlbmRzIG9iamVjdD4gPSB7fSBleHRlbmRzIE8gPyBuZXZlciA6IE9cbnR5cGUgT21pdFR5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gbmV2ZXIgOiBLXTogVFtLXSB9XVtudW1iZXJdXG50eXBlIFBpY2tUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IEsgOiBuZXZlcl06IFRbS10gfV1bbnVtYmVyXVxuXG4vLyBGb3IgaW5mb3JtYXRpdmUgcHVycG9zZXMgLSB1bnVzZWQgaW4gcHJhY3RpY2VcbmludGVyZmFjZSBfTm90X0RlY2xhcmVkXyB7IH1cbmludGVyZmFjZSBfTm90X0FycmF5XyB7IH1cbnR5cGUgRXhjZXNzS2V5czxBLCBCPiA9XG4gIEEgZXh0ZW5kcyBhbnlbXVxuICA/IEIgZXh0ZW5kcyBhbnlbXVxuICA/IEV4Y2Vzc0tleXM8QVtudW1iZXJdLCBCW251bWJlcl0+XG4gIDogX05vdF9BcnJheV9cbiAgOiBCIGV4dGVuZHMgYW55W11cbiAgPyBfTm90X0FycmF5X1xuICA6IE5ldmVyRW1wdHk8T21pdFR5cGU8e1xuICAgIFtLIGluIGtleW9mIEFdOiBLIGV4dGVuZHMga2V5b2YgQlxuICAgID8gQVtLXSBleHRlbmRzIChCW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBCW0tdIDogRGVlcFBhcnRpYWw8QltLXT4pXG4gICAgPyBuZXZlciA6IEJbS11cbiAgICA6IF9Ob3RfRGVjbGFyZWRfXG4gIH0sIG5ldmVyPj5cblxudHlwZSBPdmVybGFwcGluZ0tleXM8QSxCPiA9IEIgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDogQSBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBrZXlvZiBBICYga2V5b2YgQlxuXG50eXBlIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXMsIFJlc3VsdCA9IG5ldmVyPlxuICA9IChPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PlxuICApIGV4dGVuZHMgbmV2ZXJcbiAgPyBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7ICdgb3ZlcnJpZGVgIGhhcyBwcm9wZXJ0aWVzIG5vdCBpbiB0aGUgYmFzZSB0YWcgb3Igb2YgdGhlIHdyb25nIHR5cGUsIGFuZCBzaG91bGQgbWF0Y2gnOiBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gfVxuICA6IE9taXRUeXBlPHtcbiAgICAnYGRlY2xhcmVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgb3ZlcnJpZGVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT4sXG4gICAgJ2BvdmVycmlkZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgfSwgbmV2ZXI+XG5cbi8qIFR5cGVzIHRoYXQgZm9ybSB0aGUgZGVzY3JpcHRpb24gb2YgYW4gZXh0ZW5kZWQgdGFnICovXG5cbmV4cG9ydCB0eXBlIE92ZXJyaWRlcyA9IHtcbiAgLyogVmFsdWVzIGZvciBwcm9wZXJ0aWVzIHRoYXQgYWxyZWFkeSBleGlzdCBpbiBhbnkgYmFzZSBhIHRhZyBpcyBleHRlbmRlZCBmcm9tICovXG4gIG92ZXJyaWRlPzogb2JqZWN0O1xuICAvKiBEZWNsYXJhdGlvbiBhbmQgZGVmYXVsdCB2YWx1ZXMgZm9yIG5ldyBwcm9wZXJ0aWVzIGluIHRoaXMgdGFnIGRlZmluaXRpb24uICovXG4gIGRlY2xhcmU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlZXMgZm9yIG5vdyBwcm9wZXJ0aWVzIHRoYXQgYXJlIGJveGVkIGJ5IGRlZmluZUl0ZXJhYmxlUHJvcGVydGllcyAqL1xuICBpdGVyYWJsZT86IHsgW2s6IHN0cmluZ106IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9O1xuICAvKiBTcGVjaWZpY2F0aW9uIG9mIHRoZSB0eXBlcyBvZiBlbGVtZW50cyBieSBJRCB0aGF0IGFyZSBjb250YWluZWQgYnkgdGhpcyB0YWcgKi9cbiAgaWRzPzogeyBbaWQ6IHN0cmluZ106IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+OyB9O1xuICAvKiBTdGF0aWMgQ1NTIHJlZmVyZW5jZWQgYnkgdGhpcyB0YWcgKi9cbiAgc3R5bGVzPzogc3RyaW5nO1xufVxuXG50eXBlIElEUzxJPiA9IEkgZXh0ZW5kcyBvYmplY3QgPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBJW0pdIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4gPyBSZXR1cm5UeXBlPElbSl0+IDogbmV2ZXI7XG4gIH1cbn0gOiB7IGlkczoge30gfVxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RlZCA9IHtcbiAgY29uc3RydWN0ZWQ6ICgpID0+IChDaGlsZFRhZ3MgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZCB8IENoaWxkVGFncz4pO1xufVxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBhdHRyaWJ1dGVzIGZyb20gYW4gRXhUYWdDcmVhdG9yXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXR0cmlidXRlczxUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gVCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBCYXNlQXR0cnM+XG4gID8gQmFzZUF0dHJzXG4gIDogbmV2ZXJcblxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgaXRlcmFibGUgYXR0cmlidXRlcyBmcm9tIHRoZSBfYW5jZXN0b3JzXyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQmFzZUl0ZXJhYmxlczxCYXNlPiA9XG4gIEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgX0Jhc2UsIGluZmVyIFN1cGVyLCBpbmZlciBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMsIGluZmVyIF9TdGF0aWNzPlxuICA/IEJhc2VJdGVyYWJsZXM8U3VwZXI+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXSBleHRlbmRzIG9iamVjdFxuICAgICAgPyBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgICAgIDoge31cbiAgICA6IEJhc2VJdGVyYWJsZXM8U3VwZXI+ICYgU3VwZXJEZWZzWydpdGVyYWJsZSddXG4gIDogbmV2ZXJcblxuLy8gV29yayBvdXQgdGhlIHR5cGVzIG9mIGFsbCB0aGUgbm9uLWl0ZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gRXhUYWdDcmVhdG9yXG50eXBlIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPSB7XG4gICAgaWRzOiA8XG4gICAgICBjb25zdCBLIGV4dGVuZHMga2V5b2YgRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPixcbiAgICAgIGNvbnN0IFRDRiBleHRlbmRzIFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+ID0gRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPltLXVxuICAgID4oXG4gICAgICBhdHRyczp7IGlkOiBLIH0gJiBFeGNsdWRlPFBhcmFtZXRlcnM8VENGPlswXSwgQ2hpbGRUYWdzPixcbiAgICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXVxuICAgICkgPT4gUmV0dXJuVHlwZTxUQ0Y+XG4gIH1cbiAgJiBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9IEJhc2VJdGVyYWJsZXM8QmFzZT4gJiBEWydpdGVyYWJsZSddXG5cbmV4cG9ydCBjb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3RvckNhbGxTdGFjayBleHRlbmRzIFRhZ0NyZWF0aW9uT3B0aW9ucyB7XG4gIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gIFtrOiBzdHJpbmddOiB1bmtub3duXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb24geyAoYXR0cnM6IENvbnN0cnVjdG9yQ2FsbFN0YWNrIHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBFbGVtZW50IH1cblxuaW50ZXJmYWNlIEluc3RhbmNlVW5pcXVlSUQgeyBbVW5pcXVlSURdOiBzdHJpbmcgfVxuZXhwb3J0IHR5cGUgSW5zdGFuY2U8VCA9IEluc3RhbmNlVW5pcXVlSUQ+ID0gSW5zdGFuY2VVbmlxdWVJRCAmIFRcblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICBzdXBlcjogVGFnQ3JlYXRvcjxFbGVtZW50PjtcbiAgZGVmaW5pdGlvbjogT3ZlcnJpZGVzO1xuICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gIGV4dGVuZGVkOiAodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSA9PiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xufVxuXG5pbnRlcmZhY2UgVGFnQ29uc3R1Y3RvciB7XG4gIGNvbnN0cnVjdG9yOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xufVxuXG50eXBlIENvbWJpbmVkVGhpc1R5cGU8QmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzPiA9XG4gIFRhZ0NvbnN0dWN0b3IgJlxuICBSZWFkV3JpdGVBdHRyaWJ1dGVzPFxuICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlLEQ+PlxuICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPixcbiAgICBEWydkZWNsYXJlJ11cbiAgICAmIERbJ292ZXJyaWRlJ11cbiAgICAmIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD5cbiAgICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gID5cblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXM+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbj5cblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgZXh0ZW5kcyBJbnN0YW5jZVVuaXF1ZUlEID0gSW5zdGFuY2VVbmlxdWVJRFxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucz5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsIFJlc3VsdD4gPVxuICBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBjb25zdHJ1Y3RlZDogYW55IH1cbiAgPyBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgQ29uc3RydWN0ZWRcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcImNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+aW5mZXIgUlxuICAgICAgPyAoKGU6IEUpPT5SKSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD5cbnR5cGUgUG9zc2libHlBc3luYzxYPiA9IFtYXSBleHRlbmRzIFtvYmplY3RdIC8qIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb24gKi9cbiAgPyBYIGV4dGVuZHMgQXN5bmNQcm92aWRlcjxpbmZlciBVPlxuICAgID8gWCBleHRlbmRzIChBc3luY1Byb3ZpZGVyPFU+ICYgVSlcbiAgICAgID8gVSB8IEFzeW5jQXR0cjxVPiAvLyBpdGVyYWJsZSBwcm9wZXJ0eVxuICAgICAgOiBYIHwgUHJvbWlzZUxpa2U8WD4gLy8gc29tZSBvdGhlciBBc3luY1Byb3ZpZGVyXG4gICAgOiBYIGV4dGVuZHMgKGFueVtdIHwgRnVuY3Rpb24pXG4gICAgICA/IFggfCBBc3luY0F0dHI8WD4gIC8vIEFycmF5IG9yIEZ1bmN0aW9uLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgYXN5bmNcbiAgICAgIDogeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT4gfSB8IFBhcnRpYWw8WD4gfCBBc3luY0F0dHI8UGFydGlhbDxYPj4gLy8gT3RoZXIgb2JqZWN0IC0gcGFydGlhbGx5LCBwb3NzaWJsZSBhc3luY1xuICA6IFggfCBBc3luY0F0dHI8WD4gLy8gU29tZXRoaW5nIGVsc2UgKG51bWJlciwgZXRjKSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGFzeW5jXG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+KTtcbiAgfSlcbiAgOiAoT21pdDxFLCAnYXR0cmlidXRlcyc+KVxuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdXG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxCYXNlPiAmIFRoaXNUeXBlPEJhc2U+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxCYXNlPlxuXG4vKiBBIFRhZ0NyZWF0b3IgaXMgVGFnQ3JlYXRvckZ1bmN0aW9uIGRlY29yYXRlZCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcy4gVGhlIFN1cGVyICYgU3RhdGljcyBhcmdzIGFyZSBvbmx5XG5ldmVyIHNwZWNpZmllZCBieSBFeHRlbmRlZFRhZyAoaW50ZXJuYWxseSksIGFuZCBzbyBpcyBub3QgZXhwb3J0ZWQgKi9cbnR5cGUgRXhUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3QsXG4gIFN1cGVyIGV4dGVuZHMgKHVua25vd24gfCBFeFRhZ0NyZWF0b3I8YW55PikgPSB1bmtub3duLFxuICBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMgPSB7fSxcbiAgU3RhdGljcyA9IHt9LFxuPiA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiBJbnN0YW5jZVVuaXF1ZUlEOyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbn0gJiBJbnN0YW5jZVVuaXF1ZUlEICZcbi8vIGBTdGF0aWNzYCBoZXJlIGlzIHRoYXQgc2FtZSBhcyBTdGF0aWNSZWZlcmVuY2VzPFN1cGVyLCBTdXBlckRlZnM+LCBidXQgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBicmVha3MgVFNcbi8vIHNvIHdlIGNvbXB1dGUgdGhlIFN0YXRpY3Mgb3V0c2lkZSB0aGlzIHR5cGUgZGVjbGFyYXRpb24gYXMgcGFzcyB0aGVtIGFzIGEgcmVzdWx0XG5TdGF0aWNzXG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2ZXIsIG5ldmVyLCB7fT5cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQ08sSUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFFBQVEsV0FBVyxPQUFPLE1BQU0sbUJBQW1CLENBQUMsS0FBSztBQUU5SCxJQUFNLGNBQWM7QUFFM0IsSUFBTSxXQUFXO0FBQUEsRUFDZixPQUFPLE1BQVc7QUFDaEIsUUFBSSxNQUFPLFNBQVEsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsRUFDbkc7QUFBQSxFQUNBLFFBQVEsTUFBVztBQUNqQixRQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLGtCQUFpQixJQUFJLENBQUM7QUFBQSxFQUNyRztBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLEtBQUssaUJBQWlCLEdBQUcsSUFBSTtBQUFBLEVBQ2xEO0FBQ0Y7OztBQ1pBLElBQU0sVUFBVSxPQUFPLG1CQUFtQjtBQVMxQyxJQUFNLFVBQVUsQ0FBQyxNQUFTO0FBQUM7QUFDM0IsSUFBSSxLQUFLO0FBQ0YsU0FBUyxXQUFrQztBQUNoRCxNQUFJLFVBQStDO0FBQ25ELE1BQUksU0FBK0I7QUFDbkMsUUFBTSxVQUFVLElBQUksUUFBVyxJQUFJLE1BQU0sQ0FBQyxTQUFTLE1BQU0sSUFBSSxDQUFDO0FBQzlELFVBQVEsVUFBVTtBQUNsQixVQUFRLFNBQVM7QUFDakIsTUFBSSxPQUFPO0FBQ1QsWUFBUSxPQUFPLElBQUk7QUFDbkIsVUFBTSxlQUFlLElBQUksTUFBTSxFQUFFO0FBQ2pDLFlBQVEsTUFBTSxRQUFPLGNBQWMsU0FBUyxJQUFJLGlCQUFpQixRQUFTLFNBQVEsSUFBSSxzQkFBc0IsSUFBSSxpQkFBaUIsWUFBWSxJQUFJLE1BQVM7QUFBQSxFQUM1SjtBQUNBLFNBQU87QUFDVDtBQUdPLFNBQVMsYUFBYSxHQUE0QjtBQUN2RCxTQUFPLEtBQUssT0FBTyxNQUFNLFlBQVksT0FBTyxNQUFNO0FBQ3BEO0FBRU8sU0FBUyxjQUFpQixHQUE2QjtBQUM1RCxTQUFPLGFBQWEsQ0FBQyxLQUFNLFVBQVUsS0FBTSxPQUFPLEVBQUUsU0FBUztBQUMvRDs7O0FDbkNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBb0NPLElBQU0sY0FBYyxPQUFPLGFBQWE7QUF3RHhDLFNBQVMsZ0JBQTZCLEdBQWtEO0FBQzdGLFNBQU8sYUFBYSxDQUFDLEtBQUssVUFBVSxLQUFLLE9BQU8sR0FBRyxTQUFTO0FBQzlEO0FBQ08sU0FBUyxnQkFBNkIsR0FBa0Q7QUFDN0YsU0FBTyxhQUFhLENBQUMsS0FBTSxPQUFPLGlCQUFpQixLQUFNLE9BQU8sRUFBRSxPQUFPLGFBQWEsTUFBTTtBQUM5RjtBQUNPLFNBQVMsWUFBeUIsR0FBd0Y7QUFDL0gsU0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLGdCQUFnQixDQUFDO0FBQ2hEO0FBSU8sU0FBUyxjQUFpQixHQUFxQjtBQUNwRCxNQUFJLGdCQUFnQixDQUFDLEVBQUcsUUFBTztBQUMvQixNQUFJLGdCQUFnQixDQUFDLEVBQUcsUUFBTyxFQUFFLE9BQU8sYUFBYSxFQUFFO0FBQ3ZELFFBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUN6QztBQUdPLElBQU0sY0FBYztBQUFBLEVBQ3pCLFVBQ0UsSUFDQSxlQUFrQyxRQUNsQztBQUNBLFdBQU8sVUFBVSxNQUFNLElBQUksWUFBWTtBQUFBLEVBQ3pDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsU0FBK0UsR0FBTTtBQUNuRixXQUFPLE1BQU0sTUFBTSxHQUFHLENBQUM7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsUUFBaUUsUUFBVztBQUMxRSxXQUFPLFFBQVEsT0FBTyxPQUFPLEVBQUUsU0FBUyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFDekQ7QUFDRjtBQUVBLElBQU0sWUFBWSxDQUFDLEdBQUcsT0FBTyxzQkFBc0IsV0FBVyxHQUFHLEdBQUcsT0FBTyxLQUFLLFdBQVcsQ0FBQztBQUc1RixJQUFNLG1CQUFtQixPQUFPLGtCQUFrQjtBQUNsRCxTQUFTLGFBQWlELEdBQU0sR0FBTTtBQUNwRSxRQUFNLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUMsR0FBRyxHQUFHLE9BQU8sc0JBQXNCLENBQUMsQ0FBQztBQUNsRixhQUFXLEtBQUssTUFBTTtBQUNwQixXQUFPLGVBQWUsR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLHlCQUF5QixHQUFHLENBQUMsR0FBRyxZQUFZLE1BQU0sQ0FBQztBQUFBLEVBQzdGO0FBQ0EsTUFBSSxPQUFPO0FBQ1QsUUFBSSxFQUFFLG9CQUFvQixHQUFJLFFBQU8sZUFBZSxHQUFHLGtCQUFrQixFQUFFLE9BQU8sSUFBSSxNQUFNLEVBQUUsTUFBTSxDQUFDO0FBQUEsRUFDdkc7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFNLFdBQVcsT0FBTyxTQUFTO0FBQ2pDLElBQU0sU0FBUyxPQUFPLE9BQU87QUFDN0IsU0FBUyxnQ0FBbUMsT0FBTyxNQUFNO0FBQUUsR0FBRztBQUM1RCxRQUFNLElBQUk7QUFBQSxJQUNSLENBQUMsUUFBUSxHQUFHLENBQUM7QUFBQSxJQUNiLENBQUMsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUVYLENBQUMsT0FBTyxhQUFhLElBQUk7QUFDdkIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE9BQU87QUFDTCxVQUFJLEVBQUUsTUFBTSxHQUFHLFFBQVE7QUFDckIsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFFO0FBQUEsTUFDM0M7QUFFQSxVQUFJLENBQUMsRUFBRSxRQUFRO0FBQ2IsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxPQUFVLENBQUM7QUFFbEUsWUFBTSxRQUFRLFNBQTRCO0FBRzFDLFlBQU0sTUFBTSxRQUFNO0FBQUEsTUFBRSxDQUFDO0FBQ3JCLFFBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUN6QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsT0FBTyxHQUFhO0FBQ2xCLFlBQU0sUUFBUSxFQUFFLE1BQU0sTUFBZSxPQUFPLE9BQVU7QUFDdEQsVUFBSSxFQUFFLFFBQVEsR0FBRztBQUNmLFlBQUk7QUFBRSxlQUFLO0FBQUEsUUFBRSxTQUFTLElBQUk7QUFBQSxRQUFFO0FBQzVCLGVBQU8sRUFBRSxRQUFRLEVBQUU7QUFDakIsWUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFHLFFBQVEsS0FBSztBQUNsQyxVQUFFLE1BQU0sSUFBSSxFQUFFLFFBQVEsSUFBSTtBQUFBLE1BQzVCO0FBQ0EsYUFBTyxRQUFRLFFBQVEsS0FBSztBQUFBLElBQzlCO0FBQUEsSUFFQSxTQUFTLE1BQWE7QUFDcEIsWUFBTSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFDcEQsVUFBSSxFQUFFLFFBQVEsR0FBRztBQUNmLFlBQUk7QUFBRSxlQUFLO0FBQUEsUUFBRSxTQUFTLElBQUk7QUFBQSxRQUFFO0FBQzVCLGVBQU8sRUFBRSxRQUFRLEVBQUU7QUFDakIsWUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFHLE9BQU8sTUFBTSxLQUFLO0FBQ3ZDLFVBQUUsTUFBTSxJQUFJLEVBQUUsUUFBUSxJQUFJO0FBQUEsTUFDNUI7QUFDQSxhQUFPLFFBQVEsUUFBUSxLQUFLO0FBQUEsSUFDOUI7QUFBQSxJQUVBLElBQUksU0FBUztBQUNYLFVBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRyxRQUFPO0FBQ3ZCLGFBQU8sRUFBRSxNQUFNLEVBQUU7QUFBQSxJQUNuQjtBQUFBLElBRUEsS0FBSyxPQUFVO0FBQ2IsVUFBSSxDQUFDLEVBQUUsUUFBUTtBQUNiLGVBQU87QUFFVCxVQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVE7QUFDdEIsVUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFHLFFBQVEsRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsTUFDbkQsT0FBTztBQUNMLFlBQUksQ0FBQyxFQUFFLE1BQU0sR0FBRztBQUNkLG1CQUFRLElBQUksaURBQWlEO0FBQUEsUUFDL0QsT0FBTztBQUNMLFlBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsUUFDdkM7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsU0FBTyxnQkFBZ0IsQ0FBQztBQUMxQjtBQUVBLElBQU0sWUFBWSxPQUFPLFVBQVU7QUFDbkMsU0FBUyx3Q0FBMkMsT0FBTyxNQUFNO0FBQUUsR0FBRztBQUNwRSxRQUFNLElBQUksZ0NBQW1DLElBQUk7QUFDakQsSUFBRSxTQUFTLElBQUksb0JBQUksSUFBTztBQUUxQixJQUFFLE9BQU8sU0FBVSxPQUFVO0FBQzNCLFFBQUksQ0FBQyxFQUFFLFFBQVE7QUFDYixhQUFPO0FBR1QsUUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUs7QUFDeEIsYUFBTztBQUVULFFBQUksRUFBRSxRQUFRLEVBQUUsUUFBUTtBQUN0QixRQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUs7QUFDdEIsWUFBTSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUk7QUFDMUIsUUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxLQUFLLENBQUM7QUFDMUMsUUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLElBQ2xDLE9BQU87QUFDTCxVQUFJLENBQUMsRUFBRSxNQUFNLEdBQUc7QUFDZCxpQkFBUSxJQUFJLGlEQUFpRDtBQUFBLE1BQy9ELFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLE9BQUssRUFBRSxVQUFVLEtBQUssR0FBRztBQUNsRCxVQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLE1BQ3ZDO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsU0FBTztBQUNUO0FBR08sSUFBTSwwQkFBZ0Y7QUFDdEYsSUFBTSxrQ0FBd0Y7QUFnQnJHLElBQU0sd0JBQXdCLE9BQU8sdUJBQXVCO0FBQ3JELFNBQVMsdUJBQTJHLEtBQVEsTUFBUyxHQUErQztBQUl6TCxNQUFJLGVBQWUsTUFBTTtBQUN2QixtQkFBZSxNQUFNO0FBQ3JCLFVBQU0sS0FBSyxnQ0FBbUM7QUFDOUMsVUFBTSxLQUFLLEdBQUcsTUFBTTtBQUNwQixVQUFNLElBQUksR0FBRyxPQUFPLGFBQWEsRUFBRTtBQUNuQyxXQUFPLE9BQU8sYUFBYSxJQUFJLEdBQUcsT0FBTyxhQUFhO0FBQ3RELFdBQU8sR0FBRztBQUNWLGNBQVUsUUFBUTtBQUFBO0FBQUEsTUFDaEIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFtQjtBQUFBLEtBQUM7QUFDcEMsUUFBSSxFQUFFLHlCQUF5QjtBQUM3QixtQkFBYSxHQUFHLE1BQU07QUFDeEIsV0FBTztBQUFBLEVBQ1Q7QUFHQSxXQUFTLGdCQUFvRCxRQUFXO0FBQ3RFLFdBQU87QUFBQSxNQUNMLENBQUMsTUFBTSxHQUFHLFlBQTRCLE1BQWE7QUFDakQscUJBQWE7QUFFYixlQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxJQUFJO0FBQUEsTUFDbkM7QUFBQSxJQUNGLEVBQUUsTUFBTTtBQUFBLEVBQ1Y7QUFFQSxRQUFNLFNBQVMsRUFBRSxDQUFDLE9BQU8sYUFBYSxHQUFHLGFBQWE7QUFDdEQsWUFBVSxRQUFRLENBQUM7QUFBQTtBQUFBLElBQ2pCLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixDQUFDO0FBQUEsR0FBQztBQUNoQyxNQUFJLE9BQU8sTUFBTSxZQUFZLEtBQUssZUFBZSxLQUFLLEVBQUUsV0FBVyxNQUFNLFdBQVc7QUFDbEYsV0FBTyxXQUFXLElBQUksRUFBRSxXQUFXO0FBQUEsRUFDckM7QUFHQSxNQUFJLE9BQTJDLENBQUNBLE9BQVM7QUFDdkQsaUJBQWE7QUFDYixXQUFPLEtBQUtBLEVBQUM7QUFBQSxFQUNmO0FBRUEsTUFBSSxJQUFJLElBQUksR0FBRyxNQUFNO0FBQ3JCLE1BQUksUUFBc0M7QUFFMUMsU0FBTyxlQUFlLEtBQUssTUFBTTtBQUFBLElBQy9CLE1BQVM7QUFBRSxhQUFPO0FBQUEsSUFBRTtBQUFBLElBQ3BCLElBQUlBLElBQThCO0FBQ2hDLFVBQUlBLE9BQU0sR0FBRztBQUNYLFlBQUksZ0JBQWdCQSxFQUFDLEdBQUc7QUFZdEIsY0FBSSxVQUFVQTtBQUNaO0FBRUYsa0JBQVFBO0FBQ1IsY0FBSSxRQUFRLFFBQVEsSUFBSSxNQUFNLElBQUk7QUFDbEMsY0FBSTtBQUNGLHFCQUFRLEtBQUssSUFBSSxNQUFNLGFBQWEsS0FBSyxTQUFTLENBQUMsOEVBQThFLENBQUM7QUFDcEksa0JBQVEsS0FBS0EsSUFBRyxPQUFLO0FBQ25CLGdCQUFJQSxPQUFNLE9BQU87QUFFZixvQkFBTSxJQUFJLE1BQU0sbUJBQW1CLEtBQUssU0FBUyxDQUFDLDJDQUEyQyxFQUFFLE9BQU8sTUFBTSxDQUFDO0FBQUEsWUFDL0c7QUFDQSxpQkFBSyxHQUFHLFFBQVEsQ0FBTTtBQUFBLFVBQ3hCLENBQUMsRUFBRSxNQUFNLFFBQU0sU0FBUSxLQUFLLEVBQUUsQ0FBQyxFQUM1QixRQUFRLE1BQU9BLE9BQU0sVUFBVyxRQUFRLE9BQVU7QUFHckQ7QUFBQSxRQUNGLE9BQU87QUFDTCxjQUFJLFNBQVMsT0FBTztBQUNsQixxQkFBUSxJQUFJLGFBQWEsS0FBSyxTQUFTLENBQUMsMEVBQTBFO0FBQUEsVUFDcEg7QUFDQSxjQUFJLElBQUlBLElBQUcsTUFBTTtBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUNBLFdBQUtBLElBQUcsUUFBUSxDQUFNO0FBQUEsSUFDeEI7QUFBQSxJQUNBLFlBQVk7QUFBQSxFQUNkLENBQUM7QUFDRCxTQUFPO0FBRVAsV0FBUyxJQUFPQyxJQUFNLEtBQXVEO0FBQzNFLFFBQUlBLE9BQU0sUUFBUUEsT0FBTSxRQUFXO0FBQ2pDLGFBQU8sYUFBYSxPQUFPLE9BQU8sTUFBTTtBQUFBLFFBQ3RDLFNBQVMsRUFBRSxRQUFRO0FBQUUsaUJBQU9BO0FBQUEsUUFBRSxHQUFHLFVBQVUsTUFBTSxjQUFjLEtBQUs7QUFBQSxRQUNwRSxRQUFRLEVBQUUsUUFBUTtBQUFFLGlCQUFPQTtBQUFBLFFBQUUsR0FBRyxVQUFVLE1BQU0sY0FBYyxLQUFLO0FBQUEsTUFDckUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxJQUNUO0FBQ0EsWUFBUSxPQUFPQSxJQUFHO0FBQUEsTUFDaEIsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUVILGVBQU8sYUFBYSxPQUFPQSxFQUFDLEdBQUcsT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNoRCxTQUFTO0FBQUUsbUJBQU9BLEdBQUUsUUFBUTtBQUFBLFVBQUU7QUFBQSxRQUNoQyxDQUFDLENBQUM7QUFBQSxNQUNKLEtBQUs7QUFLSCxlQUFPLFVBQVVBLElBQUcsR0FBRztBQUFBLElBRTNCO0FBQ0EsVUFBTSxJQUFJLFVBQVUsNENBQTRDLE9BQU9BLEtBQUksR0FBRztBQUFBLEVBQ2hGO0FBSUEsV0FBUyx1QkFBdUIsR0FBb0M7QUFDbEUsV0FBTyxhQUFhLENBQUMsS0FBSyx5QkFBeUI7QUFBQSxFQUNyRDtBQUNBLFdBQVMsWUFBWSxHQUFRLE1BQWM7QUFDekMsVUFBTSxTQUFTLEtBQUssTUFBTSxHQUFHLEVBQUUsTUFBTSxDQUFDO0FBQ3RDLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxXQUFZLElBQUksSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLFFBQVksSUFBSTtBQUMvRSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsVUFBVUEsSUFBTSxLQUEyQztBQUNsRSxRQUFJO0FBQ0osUUFBSTtBQUNKLFdBQU8sSUFBSSxNQUFNQSxJQUFhLFFBQVEsQ0FBQztBQUV2QyxhQUFTLFFBQVEsT0FBTyxJQUEwQjtBQUNoRCxhQUFPO0FBQUE7QUFBQSxRQUVMLElBQUksUUFBUSxLQUFLO0FBQ2YsaUJBQU8sUUFBUSx5QkFBeUIsUUFBUSxPQUFPLGVBQWUsT0FBTyxVQUFVLE9BQU87QUFBQSxRQUNoRztBQUFBO0FBQUEsUUFFQSxJQUFJLFFBQVEsS0FBSyxPQUFPLFVBQVU7QUFDaEMsY0FBSSxPQUFPLE9BQU8sS0FBSyxHQUFHLEdBQUc7QUFDM0Isa0JBQU0sSUFBSSxNQUFNLGNBQWMsS0FBSyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxTQUFTLENBQUMsaUNBQWlDO0FBQUEsVUFDekc7QUFDQSxjQUFJLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUSxNQUFNLE9BQU87QUFDaEQsaUJBQUssRUFBRSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsR0FBQUEsSUFBRyxLQUFLLEVBQUUsQ0FBUTtBQUFBLFVBQ3REO0FBQ0EsaUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxPQUFPLFFBQVE7QUFBQSxRQUNqRDtBQUFBLFFBQ0EsZUFBZSxRQUFRLEtBQUs7QUFDMUIsY0FBSSxRQUFRLGVBQWUsUUFBUSxHQUFHLEdBQUc7QUFDdkMsaUJBQUssRUFBRSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsR0FBQUEsSUFBRyxLQUFLLEVBQUUsQ0FBUTtBQUNwRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQTtBQUFBLFFBRUEsSUFBSSxRQUFRLEtBQUssVUFBVTtBQUV6QixjQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsR0FBRztBQUMzQixnQkFBSSxDQUFDLEtBQUssUUFBUTtBQUNoQiw0Q0FBZ0IsVUFBVSxLQUFLLE9BQUssdUJBQXVCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQztBQUM5RixxQkFBTyxZQUFZLEdBQXVCO0FBQUEsWUFDNUMsT0FBTztBQUNMLHNDQUFhLFVBQVUsS0FBSyxPQUFLLHVCQUF1QixDQUFDLElBQUksRUFBRSxxQkFBcUIsSUFBSSxFQUFFLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQztBQUU1RyxrQkFBSSxLQUFLLFVBQVUsVUFBVSxDQUFDLEdBQUcsTUFBTTtBQUNyQyxzQkFBTUQsS0FBSSxZQUFZLEVBQUUsR0FBRyxJQUFJO0FBQy9CLHVCQUFPLE1BQU1BLE1BQUssRUFBRSxTQUFTLFFBQVEsRUFBRSxLQUFLLFdBQVcsSUFBSSxJQUFJQSxLQUFJO0FBQUEsY0FDckUsR0FBRyxRQUFRLFlBQVlDLElBQUcsSUFBSSxDQUFDO0FBQy9CLHFCQUFPLEdBQUcsR0FBc0I7QUFBQSxZQUNsQztBQUFBLFVBQ0Y7QUFHQSxjQUFJLFFBQVEsVUFBVyxRQUFPLE1BQU0sWUFBWUEsSUFBRyxJQUFJO0FBQ3ZELGNBQUksUUFBUSxPQUFPLGFBQWE7QUFFOUIsbUJBQU8sU0FBVSxNQUF3QztBQUN2RCxrQkFBSSxRQUFRLElBQUksUUFBUSxHQUFHO0FBQ3pCLHVCQUFPLFFBQVEsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFLEtBQUssUUFBUSxJQUFJO0FBQzNELGtCQUFJLFNBQVMsU0FBVSxRQUFPLE9BQU8sU0FBUztBQUM5QyxrQkFBSSxTQUFTLFNBQVUsUUFBTyxPQUFPLE1BQU07QUFDM0MscUJBQU8sT0FBTyxRQUFRO0FBQUEsWUFDeEI7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixpQkFBSyxFQUFFLE9BQU8sV0FBVyxPQUFPLE9BQU8sUUFBUSxHQUFHLE1BQU0sRUFBRSxlQUFlLFVBQVUsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUNySCxvQkFBTSxRQUFRLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUTtBQUMvQyxxQkFBUSxPQUFPLFVBQVUsY0FBZSxZQUFZLEtBQUssSUFDckQsUUFDQSxJQUFJLE1BQU0sT0FBTyxLQUFLLEdBQUcsUUFBUSxPQUFPLE1BQU0sR0FBRyxDQUFDO0FBQUEsWUFDeEQ7QUFBQSxVQUNGO0FBRUEsaUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQWFPLElBQU0sUUFBUSxJQUFnSCxPQUFVO0FBQzdJLFFBQU0sS0FBSyxvQkFBSSxJQUE4QztBQUM3RCxRQUFNLFdBQVcsb0JBQUksSUFBa0U7QUFFdkYsTUFBSSxPQUFPLE1BQU07QUFDZixXQUFPLE1BQU07QUFBQSxJQUFFO0FBQ2YsYUFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxZQUFNLElBQUksR0FBRyxDQUFDO0FBQ2QsWUFBTSxPQUFPLE9BQU8saUJBQWlCLElBQUksRUFBRSxPQUFPLGFBQWEsRUFBRSxJQUFJO0FBQ3JFLFNBQUcsSUFBSSxHQUFHLElBQUk7QUFDZCxlQUFTLElBQUksR0FBRyxLQUFLLEtBQUssRUFBRSxLQUFLLGFBQVcsRUFBRSxLQUFLLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFBQSxJQUNsRTtBQUFBLEVBQ0Y7QUFFQSxRQUFNLFVBQWdDLElBQUksTUFBTSxHQUFHLE1BQU07QUFFekQsUUFBTSxTQUEyQztBQUFBLElBQy9DLENBQUMsT0FBTyxhQUFhLElBQUk7QUFBRSxhQUFPO0FBQUEsSUFBTztBQUFBLElBQ3pDLE9BQU87QUFDTCxXQUFLO0FBQ0wsYUFBTyxTQUFTLE9BQ1osUUFBUSxLQUFLLFNBQVMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLE1BQU07QUFDMUQsWUFBSSxPQUFPLE1BQU07QUFDZixtQkFBUyxPQUFPLEdBQUc7QUFDbkIsYUFBRyxPQUFPLEdBQUc7QUFDYixrQkFBUSxHQUFHLElBQUksT0FBTztBQUN0QixpQkFBTyxPQUFPLEtBQUs7QUFBQSxRQUNyQixPQUFPO0FBQ0wsbUJBQVM7QUFBQSxZQUFJO0FBQUEsWUFDWCxHQUFHLElBQUksR0FBRyxJQUNOLEdBQUcsSUFBSSxHQUFHLEVBQUcsS0FBSyxFQUFFLEtBQUssQ0FBQUMsYUFBVyxFQUFFLEtBQUssUUFBQUEsUUFBTyxFQUFFLEVBQUUsTUFBTSxTQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxFQUFFLEVBQUUsSUFDOUcsUUFBUSxRQUFRLEVBQUUsS0FBSyxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVSxFQUFFLENBQUM7QUFBQSxVQUFDO0FBQ3hFLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0YsQ0FBQyxFQUFFLE1BQU0sUUFBTTtBQUVYLGVBQU8sT0FBTyxNQUFPLEVBQUU7QUFBQSxNQUMzQixDQUFDLElBQ0MsUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sUUFBUSxDQUFDO0FBQUEsSUFDN0Q7QUFBQSxJQUNBLE1BQU0sT0FBTyxHQUFHO0FBQ2QsaUJBQVcsT0FBTyxHQUFHLEtBQUssR0FBRztBQUMzQixZQUFJLFNBQVMsSUFBSSxHQUFHLEdBQUc7QUFDckIsbUJBQVMsT0FBTyxHQUFHO0FBQ25CLGtCQUFRLEdBQUcsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLEdBQUcsU0FBUyxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssT0FBSyxFQUFFLE9BQU8sUUFBTSxFQUFFO0FBQUEsUUFDbEc7QUFBQSxNQUNGO0FBQ0EsYUFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUN0QztBQUFBLElBQ0EsTUFBTSxNQUFNLElBQVM7QUFDbkIsaUJBQVcsT0FBTyxHQUFHLEtBQUssR0FBRztBQUMzQixZQUFJLFNBQVMsSUFBSSxHQUFHLEdBQUc7QUFDckIsbUJBQVMsT0FBTyxHQUFHO0FBQ25CLGtCQUFRLEdBQUcsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLEdBQUcsUUFBUSxFQUFFLEVBQUUsS0FBSyxPQUFLLEVBQUUsT0FBTyxDQUFBQyxRQUFNQSxHQUFFO0FBQUEsUUFDM0U7QUFBQSxNQUNGO0FBRUEsYUFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixNQUFxRDtBQUM5RTtBQWNPLElBQU0sVUFBVSxDQUE2QixLQUFRLE9BQXVCLENBQUMsTUFBaUM7QUFDbkgsUUFBTSxjQUF1QyxDQUFDO0FBQzlDLFFBQU0sS0FBSyxvQkFBSSxJQUFrRDtBQUNqRSxNQUFJO0FBQ0osUUFBTSxLQUFLO0FBQUEsSUFDVCxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQUUsYUFBTztBQUFBLElBQUc7QUFBQSxJQUNyQyxPQUF5RDtBQUN2RCxVQUFJLE9BQU8sUUFBVztBQUNwQixhQUFLLElBQUksSUFBSSxPQUFPLFFBQVEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNO0FBQ2pELGFBQUcsSUFBSSxHQUFHLElBQUksT0FBTyxhQUFhLEVBQUcsQ0FBQztBQUN0QyxpQkFBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRyxLQUFLLEVBQUUsS0FBSyxTQUFPLEVBQUUsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsUUFDMUQsQ0FBQyxDQUFDO0FBQUEsTUFDSjtBQUVBLGFBQVEsU0FBUyxPQUF5RDtBQUN4RSxlQUFPLFFBQVEsS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNO0FBQ25ELGNBQUksR0FBRyxNQUFNO0FBQ1gsZUFBRyxPQUFPLENBQUM7QUFDWCxlQUFHLE9BQU8sQ0FBQztBQUNYLGdCQUFJLENBQUMsR0FBRztBQUNOLHFCQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVTtBQUN4QyxtQkFBTyxLQUFLO0FBQUEsVUFDZCxPQUFPO0FBRUwsd0JBQVksQ0FBQyxJQUFJLEdBQUc7QUFDcEIsZUFBRyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRyxLQUFLLEVBQUUsS0FBSyxDQUFBQyxTQUFPLEVBQUUsR0FBRyxJQUFBQSxJQUFHLEVBQUUsQ0FBQztBQUFBLFVBQ3JEO0FBQ0EsY0FBSSxLQUFLLGVBQWU7QUFDdEIsZ0JBQUksT0FBTyxLQUFLLFdBQVcsRUFBRSxTQUFTLE9BQU8sS0FBSyxHQUFHLEVBQUU7QUFDckQscUJBQU8sS0FBSztBQUFBLFVBQ2hCO0FBQ0EsaUJBQU8sRUFBRSxNQUFNLE9BQU8sT0FBTyxZQUFZO0FBQUEsUUFDM0MsQ0FBQztBQUFBLE1BQ0gsRUFBRztBQUFBLElBQ0w7QUFBQSxJQUNBLE9BQU8sR0FBUztBQUNkLGlCQUFXLE1BQU0sR0FBRyxPQUFPLEdBQUc7QUFDMUIsV0FBRyxTQUFTLENBQUM7QUFBQSxNQUNqQjtBQUFDO0FBQ0QsYUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFBQSxJQUNqRDtBQUFBLElBQ0EsTUFBTSxJQUFTO0FBQ2IsaUJBQVcsTUFBTSxHQUFHLE9BQU87QUFDekIsV0FBRyxRQUFRLEVBQUU7QUFDZixhQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLElBQ2xEO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLEVBQUU7QUFDM0I7QUFHQSxTQUFTLGdCQUFtQixHQUFvQztBQUM5RCxTQUFPLGdCQUFnQixDQUFDLEtBQ25CLFVBQVUsTUFBTSxPQUFNLEtBQUssS0FBTyxFQUFVLENBQUMsTUFBTSxZQUFZLENBQUMsQ0FBQztBQUN4RTtBQUdPLFNBQVMsZ0JBQThDLElBQStFO0FBQzNJLE1BQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHO0FBQ3hCLGlCQUFhLElBQUksV0FBVztBQUFBLEVBQzlCO0FBQ0EsU0FBTztBQUNUO0FBRU8sU0FBUyxpQkFBNEUsR0FBTTtBQUNoRyxTQUFPLFlBQWEsTUFBb0M7QUFDdEQsVUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQ3BCLFdBQU8sZ0JBQWdCLEVBQUU7QUFBQSxFQUMzQjtBQUNGO0FBWUEsZUFBZSxRQUF3RCxHQUE0RTtBQUNqSixNQUFJLE9BQTZDO0FBQ2pELG1CQUFpQixLQUFLLE1BQStDO0FBQ25FLFdBQU8sSUFBSSxDQUFDO0FBQUEsRUFDZDtBQUNBLFFBQU07QUFDUjtBQU1PLElBQU0sU0FBUyxPQUFPLFFBQVE7QUFJckMsU0FBUyxZQUFrQixHQUFxQixNQUFtQixRQUEyQztBQUM1RyxNQUFJLGNBQWMsQ0FBQztBQUNqQixXQUFPLEVBQUUsS0FBSyxNQUFNLE1BQU07QUFDNUIsTUFBSTtBQUNGLFdBQU8sS0FBSyxDQUFDO0FBQUEsRUFDZixTQUFTLElBQUk7QUFDWCxXQUFPLE9BQU8sRUFBRTtBQUFBLEVBQ2xCO0FBQ0Y7QUFFTyxTQUFTLFVBQXdDLFFBQ3RELElBQ0EsZUFBa0MsUUFDbEMsT0FBMEIsUUFDSDtBQUN2QixNQUFJO0FBQ0osV0FBUyxLQUFLLEdBQWtHO0FBRTlHLFNBQUssTUFBTTtBQUNYLFdBQU87QUFDUCxXQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxNQUFNO0FBQUEsRUFDdkM7QUFDQSxNQUFJLE1BQWdDO0FBQUEsSUFDbEMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUN2QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsUUFBUSxNQUF3QjtBQUM5QixVQUFJLGlCQUFpQixRQUFRO0FBQzNCLGNBQU0sT0FBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE9BQU8sT0FBTyxhQUFhLENBQUM7QUFDakUsdUJBQWU7QUFDZixlQUFPO0FBQUEsTUFDVDtBQUVBLGFBQU8sSUFBSSxRQUEyQixTQUFTLEtBQUssU0FBUyxRQUFRO0FBQ25FLFlBQUksQ0FBQztBQUNILGVBQUssT0FBTyxPQUFPLGFBQWEsRUFBRztBQUNyQyxXQUFHLEtBQUssR0FBRyxJQUFJLEVBQUU7QUFBQSxVQUNmLE9BQUssRUFBRSxRQUNGLE9BQU8sUUFBUSxRQUFRLENBQUMsS0FDekI7QUFBQSxZQUFZLEdBQUcsRUFBRSxPQUFPLElBQUk7QUFBQSxZQUM1QixPQUFLLE1BQU0sU0FDUCxLQUFLLFNBQVMsTUFBTSxJQUNwQixRQUFRLEVBQUUsTUFBTSxPQUFPLE9BQU8sT0FBTyxFQUFFLENBQUM7QUFBQSxZQUM1QyxRQUFNO0FBQ0oscUJBQU87QUFFUCxvQkFBTSxpQkFBaUIsR0FBRyxRQUFRLEVBQUUsS0FBSyxHQUFHLFNBQVMsRUFBRTtBQUV2RCxrQkFBSSxjQUFjLGNBQWMsRUFBRyxnQkFBZSxLQUFLLFFBQU8sTUFBTTtBQUFBLGtCQUMvRCxRQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsWUFDdkM7QUFBQSxVQUNGO0FBQUEsVUFDRixRQUFNO0FBRUosbUJBQU87QUFDUCxtQkFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLFVBQ2xDO0FBQUEsUUFDRixFQUFFLE1BQU0sUUFBTTtBQUVaLGlCQUFPO0FBQ1AsZ0JBQU0saUJBQWlCLEdBQUcsUUFBUSxFQUFFLEtBQUssR0FBRyxTQUFTLEVBQUU7QUFFdkQsY0FBSSxjQUFjLGNBQWMsRUFBRyxnQkFBZSxLQUFLLFFBQVEsTUFBTTtBQUFBLGNBQ2hFLFFBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxlQUFlLENBQUM7QUFBQSxRQUNuRCxDQUFDO0FBQUEsTUFDSCxDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsTUFBTSxJQUFTO0FBRWIsYUFBTyxRQUFRLFFBQVEsSUFBSSxRQUFRLEVBQUUsS0FBSyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxNQUFNLElBQUk7QUFBQSxJQUM3RTtBQUFBLElBRUEsT0FBTyxHQUFTO0FBRWQsYUFBTyxRQUFRLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDekQ7QUFBQSxFQUNGO0FBSUEsU0FBTyxnQkFBZ0IsR0FBRztBQUM1QjtBQUVBLFNBQVMsSUFBMkMsUUFBa0U7QUFDcEgsU0FBTyxVQUFVLE1BQU0sTUFBTTtBQUMvQjtBQUVBLFNBQVMsT0FBMkMsSUFBK0c7QUFDakssU0FBTyxVQUFVLE1BQU0sT0FBTSxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxNQUFPO0FBQzlEO0FBRUEsU0FBUyxPQUEyQyxJQUFpSjtBQUNuTSxTQUFPLEtBQ0gsVUFBVSxNQUFNLE9BQU8sR0FBRyxNQUFPLE1BQU0sVUFBVSxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUssSUFBSSxNQUFNLElBQzdFLFVBQVUsTUFBTSxDQUFDLEdBQUcsTUFBTSxNQUFNLElBQUksU0FBUyxDQUFDO0FBQ3BEO0FBRUEsU0FBUyxVQUEwRSxXQUE4RDtBQUMvSSxTQUFPLFVBQVUsTUFBTSxPQUFLLEdBQUcsU0FBUztBQUMxQztBQUVBLFNBQVMsUUFBNEMsSUFBMkc7QUFDOUosU0FBTyxVQUFVLE1BQU0sT0FBSyxJQUFJLFFBQWdDLGFBQVc7QUFBRSxPQUFHLE1BQU0sUUFBUSxDQUFDLENBQUM7QUFBRyxXQUFPO0FBQUEsRUFBRSxDQUFDLENBQUM7QUFDaEg7QUFFQSxTQUFTLFFBQXNGO0FBRTdGLFFBQU0sU0FBUztBQUNmLE1BQUksWUFBWTtBQUNoQixNQUFJO0FBQ0osTUFBSSxLQUFtRDtBQUd2RCxXQUFTLEtBQUssSUFBNkI7QUFDekMsUUFBSSxHQUFJLFNBQVEsUUFBUSxFQUFFO0FBQzFCLFFBQUksSUFBSSxNQUFNO0FBRVosZ0JBQVU7QUFBQSxJQUNaLE9BQU87QUFDTCxnQkFBVSxTQUE0QjtBQUN0QyxTQUFJLEtBQUssRUFDTixLQUFLLElBQUksRUFDVCxNQUFNLFdBQVM7QUFDZCxpQkFBUyxPQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBRTVDLGtCQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0Y7QUFFQSxXQUFTLEtBQUssR0FBbUc7QUFFL0csU0FBSyxNQUFNLFVBQVU7QUFDckIsV0FBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsTUFBTTtBQUFBLEVBQ3ZDO0FBRUEsTUFBSSxNQUFnQztBQUFBLElBQ2xDLENBQUMsT0FBTyxhQUFhLElBQUk7QUFDdkIsbUJBQWE7QUFDYixhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsT0FBTztBQUNMLFVBQUksQ0FBQyxJQUFJO0FBQ1AsYUFBSyxPQUFPLE9BQU8sYUFBYSxFQUFHO0FBQ25DLGFBQUs7QUFBQSxNQUNQO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE1BQU0sSUFBUztBQUViLFVBQUksWUFBWTtBQUNkLGNBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUNoRCxtQkFBYTtBQUNiLFVBQUk7QUFDRixlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUNsRCxhQUFPLFFBQVEsUUFBUSxJQUFJLFFBQVEsRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLE1BQU0sSUFBSTtBQUFBLElBQzdFO0FBQUEsSUFFQSxPQUFPLEdBQVM7QUFFZCxVQUFJLFlBQVk7QUFDZCxjQUFNLElBQUksTUFBTSw4QkFBOEI7QUFDaEQsbUJBQWE7QUFDYixVQUFJO0FBQ0YsZUFBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFDakQsYUFBTyxRQUFRLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDekQ7QUFBQSxFQUNGO0FBQ0EsU0FBTyxnQkFBZ0IsR0FBRztBQUM1QjtBQUVPLFNBQVMsK0JBQStCO0FBQzdDLE1BQUksSUFBSyxtQkFBbUI7QUFBQSxFQUFFLEVBQUc7QUFDakMsU0FBTyxHQUFHO0FBQ1IsVUFBTSxPQUFPLE9BQU8seUJBQXlCLEdBQUcsT0FBTyxhQUFhO0FBQ3BFLFFBQUksTUFBTTtBQUNSLHNCQUFnQixDQUFDO0FBQ2pCO0FBQUEsSUFDRjtBQUNBLFFBQUksT0FBTyxlQUFlLENBQUM7QUFBQSxFQUM3QjtBQUNBLE1BQUksQ0FBQyxHQUFHO0FBQ04sYUFBUSxLQUFLLDREQUE0RDtBQUFBLEVBQzNFO0FBQ0Y7OztBQzd1QkEsSUFBTSxvQkFBb0Isb0JBQUksUUFBc0g7QUFFcEosU0FBUyxnQkFBd0csSUFBNEM7QUFDM0osTUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUk7QUFDN0Isc0JBQWtCLElBQUksTUFBTSxvQkFBSSxJQUFJLENBQUM7QUFFdkMsUUFBTSxlQUFlLGtCQUFrQixJQUFJLElBQUksRUFBRyxJQUFJLEdBQUcsSUFBeUM7QUFDbEcsTUFBSSxjQUFjO0FBQ2hCLGVBQVcsS0FBSyxjQUFjO0FBQzVCLFVBQUk7QUFDRixjQUFNLEVBQUUsTUFBTSxXQUFXLGNBQWMsVUFBVSxnQkFBZ0IsSUFBSTtBQUNyRSxjQUFNLFlBQVksYUFBYSxNQUFNO0FBQ3JDLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxhQUFhO0FBQ3hDLGdCQUFNLE1BQU0saUJBQWlCLFdBQVcsS0FBSyxPQUFPLFlBQVksTUFBTTtBQUN0RSx1QkFBYSxPQUFPLENBQUM7QUFDckIsb0JBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQzFCLE9BQU87QUFDTCxjQUFJLEdBQUcsa0JBQWtCLE1BQU07QUFDN0IsZ0JBQUksVUFBVTtBQUNaLG9CQUFNLFFBQVEsVUFBVSxpQkFBaUIsUUFBUTtBQUNqRCx5QkFBVyxLQUFLLE9BQU87QUFDckIscUJBQUssa0JBQWtCLEVBQUUsU0FBUyxHQUFHLE1BQU0sSUFBSSxHQUFHLFdBQVcsTUFBTSxVQUFVLFNBQVMsQ0FBQztBQUNyRix1QkFBSyxFQUFFO0FBQUEsY0FDWDtBQUFBLFlBQ0YsT0FBTztBQUNMLGtCQUFJLGtCQUFrQixVQUFVLFNBQVMsR0FBRyxNQUFNLElBQUksR0FBRyxXQUFXO0FBQ2xFLHFCQUFLLEVBQUU7QUFBQSxZQUNYO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFNBQVMsSUFBSTtBQUNYLGlCQUFRLEtBQUssbUJBQW1CLEVBQUU7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTLGNBQWMsR0FBK0I7QUFDcEQsU0FBTyxRQUFRLE1BQU0sRUFBRSxXQUFXLEdBQUcsS0FBSyxFQUFFLFdBQVcsR0FBRyxLQUFNLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxTQUFTLEdBQUcsRUFBRztBQUN4RztBQUVBLFNBQVMsVUFBbUMsS0FBZ0g7QUFDMUosUUFBTSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLEdBQUc7QUFDakQsU0FBTyxFQUFFLGlCQUFpQixVQUFVLGtCQUFrQixNQUFNLElBQUksTUFBTSxHQUFFLEVBQUUsRUFBRTtBQUM5RTtBQUVBLFNBQVMsa0JBQTRDLE1BQXFIO0FBQ3hLLFFBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QixNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN4QixhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFFLFFBQVE7QUFDdEMsV0FBTyxDQUFDLEVBQUUsaUJBQWlCLE1BQU0sVUFBVSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQXNDO0FBQUEsRUFDbEc7QUFDQSxNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN0RCxhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFzQztBQUFBLEVBQzVFO0FBQ0EsU0FBTztBQUNUO0FBRUEsU0FBUyxRQUFRLFNBQXVCO0FBQ3RDLFFBQU0sSUFBSSxNQUFNLE9BQU87QUFDekI7QUFFQSxTQUFTLFVBQW9DLFdBQW9CLE1BQXNDO0FBQ3JHLFFBQU0sQ0FBQyxFQUFFLGlCQUFpQixTQUFRLEdBQUcsU0FBUyxJQUFJLGtCQUFrQixJQUFJLEtBQUssUUFBUSwyQkFBeUIsSUFBSTtBQUVsSCxNQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxhQUFhO0FBQ2hELHNCQUFrQixJQUFJLFVBQVUsZUFBZSxvQkFBSSxJQUFJLENBQUM7QUFFMUQsTUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUyxHQUFHO0FBQ25FLGNBQVUsY0FBYyxpQkFBaUIsV0FBVyxpQkFBaUI7QUFBQSxNQUNuRSxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQ0Qsc0JBQWtCLElBQUksVUFBVSxhQUFhLEVBQUcsSUFBSSxXQUFXLG9CQUFJLElBQUksQ0FBQztBQUFBLEVBQzFFO0FBRUEsUUFBTSxlQUFlLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUztBQUNsRixRQUFNLFFBQVEsd0JBQXdGLE1BQU0sYUFBYyxPQUFPLE9BQU8sQ0FBQztBQUN6SSxRQUFNLFVBQStEO0FBQUEsSUFDbkUsTUFBTSxNQUFNO0FBQUEsSUFDWixVQUFVLElBQVc7QUFBRSxZQUFNLFNBQVMsRUFBRTtBQUFBLElBQUM7QUFBQSxJQUN6QyxjQUFjLElBQUksUUFBUSxTQUFTO0FBQUEsSUFDbkM7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVBLCtCQUE2QixXQUFXLFdBQVcsQ0FBQyxRQUFRLElBQUksTUFBUyxFQUN0RSxLQUFLLE9BQUssYUFBYyxJQUFJLE9BQU8sQ0FBQztBQUV2QyxTQUFPLE1BQU0sTUFBTTtBQUNyQjtBQUVBLGdCQUFnQixrQkFBK0M7QUFDN0QsU0FBTztBQUNUO0FBSUEsU0FBUyxXQUErQyxLQUE2QjtBQUNuRixXQUFTLHNCQUFzQixRQUF1QztBQUNwRSxXQUFPLElBQUksSUFBSSxNQUFNO0FBQUEsRUFDdkI7QUFFQSxTQUFPLE9BQU8sT0FBTyxnQkFBZ0IscUJBQW9ELEdBQUc7QUFBQSxJQUMxRixDQUFDLE9BQU8sYUFBYSxHQUFHLE1BQU0sSUFBSSxPQUFPLGFBQWEsRUFBRTtBQUFBLEVBQzFELENBQUM7QUFDSDtBQUVBLFNBQVMsb0JBQW9CLE1BQWdEO0FBQzNFLE1BQUksQ0FBQztBQUNILFVBQU0sSUFBSSxNQUFNLCtDQUErQyxLQUFLLFVBQVUsSUFBSSxDQUFDO0FBQ3JGLFNBQU8sT0FBTyxTQUFTLFlBQVksS0FBSyxDQUFDLE1BQU0sT0FBTyxRQUFRLGtCQUFrQixJQUFJLENBQUM7QUFDdkY7QUFFQSxnQkFBZ0IsS0FBUSxHQUFlO0FBQ3JDLFFBQU07QUFDUjtBQUVPLFNBQVMsS0FBK0IsY0FBdUIsU0FBMkI7QUFDL0YsTUFBSSxDQUFDLFdBQVcsUUFBUSxXQUFXLEdBQUc7QUFDcEMsV0FBTyxXQUFXLFVBQVUsV0FBVyxRQUFRLENBQUM7QUFBQSxFQUNsRDtBQUVBLFFBQU0sWUFBWSxRQUFRLE9BQU8sVUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxVQUFRLE9BQU8sU0FBUyxXQUM5RyxVQUFVLFdBQVcsSUFBSSxJQUN6QixnQkFBZ0IsVUFDZCxVQUFVLE1BQU0sUUFBUSxJQUN4QixjQUFjLElBQUksSUFDaEIsS0FBSyxJQUFJLElBQ1QsSUFBSTtBQUVaLE1BQUksUUFBUSxTQUFTLFFBQVEsR0FBRztBQUM5QixVQUFNLFFBQW1DO0FBQUEsTUFDdkMsQ0FBQyxPQUFPLGFBQWEsR0FBRyxNQUFNO0FBQUEsTUFDOUIsT0FBTztBQUNMLGNBQU0sT0FBTyxNQUFNLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLE9BQVUsQ0FBQztBQUNuRSxlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsTUFDbkQ7QUFBQSxJQUNGO0FBQ0EsY0FBVSxLQUFLLEtBQUs7QUFBQSxFQUN0QjtBQUVBLE1BQUksUUFBUSxTQUFTLFFBQVEsR0FBRztBQUM5QixVQUFNLGlCQUFpQixRQUFRLE9BQU8sbUJBQW1CLEVBQUUsSUFBSSxVQUFRLGtCQUFrQixJQUFJLElBQUksQ0FBQyxDQUFDO0FBRW5HLFVBQU0sWUFBWSxDQUFDLFFBQXlFLFFBQVEsT0FBTyxRQUFRLFlBQVksQ0FBQyxVQUFVLGNBQWMsR0FBRyxDQUFDO0FBRTVKLFVBQU0sVUFBVSxlQUFlLElBQUksT0FBSyxHQUFHLFFBQVEsRUFBRSxPQUFPLFNBQVM7QUFFckUsUUFBSSxTQUF5RDtBQUM3RCxVQUFNLEtBQWlDO0FBQUEsTUFDckMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUFFLGVBQU87QUFBQSxNQUFHO0FBQUEsTUFDckMsTUFBTSxJQUFTO0FBQ2IsWUFBSSxRQUFRLE1BQU8sUUFBTyxPQUFPLE1BQU0sRUFBRTtBQUN6QyxlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ2xEO0FBQUEsTUFDQSxPQUFPLEdBQVM7QUFDZCxZQUFJLFFBQVEsT0FBUSxRQUFPLE9BQU8sT0FBTyxDQUFDO0FBQzFDLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDO0FBQUEsTUFDakQ7QUFBQSxNQUNBLE9BQU87QUFDTCxZQUFJLE9BQVEsUUFBTyxPQUFPLEtBQUs7QUFFL0IsZUFBTyw2QkFBNkIsV0FBVyxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQ2pFLGdCQUFNQyxVQUFVLFVBQVUsU0FBUyxJQUNqQyxNQUFNLEdBQUcsU0FBUyxJQUNsQixVQUFVLFdBQVcsSUFDbkIsVUFBVSxDQUFDLElBQ1gsZ0JBQWdCO0FBSXBCLG1CQUFTQSxRQUFPLE9BQU8sYUFBYSxFQUFFO0FBRXRDLGlCQUFPLEVBQUUsTUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQUEsUUFDbEMsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQ0EsV0FBTyxXQUFXLGdCQUFnQixFQUFFLENBQUM7QUFBQSxFQUN2QztBQUVBLFFBQU0sU0FBVSxVQUFVLFNBQVMsSUFDL0IsTUFBTSxHQUFHLFNBQVMsSUFDbEIsVUFBVSxXQUFXLElBQ25CLFVBQVUsQ0FBQyxJQUNWLGdCQUFxQztBQUU1QyxTQUFPLFdBQVcsZ0JBQWdCLE1BQU0sQ0FBQztBQUMzQztBQUVBLFNBQVMsNkJBQTZCLFdBQW9CLFdBQXNCO0FBQzlFLFdBQVMsbUJBQWtDO0FBQ3pDLFFBQUksVUFBVTtBQUNaLGFBQU8sUUFBUSxRQUFRO0FBRXpCLFVBQU0sVUFBVSxJQUFJLFFBQWMsQ0FBQyxTQUFTLFdBQVc7QUFDckQsYUFBTyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsYUFBYTtBQUNqRCxZQUFJLFFBQVEsS0FBSyxPQUFLLEVBQUUsWUFBWSxNQUFNLEdBQUc7QUFDM0MsY0FBSSxVQUFVLGFBQWE7QUFDekIscUJBQVMsV0FBVztBQUNwQixvQkFBUTtBQUFBLFVBQ1Y7QUFBQSxRQUNGO0FBQ0EsWUFBSSxRQUFRLEtBQUssT0FBSyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFBQyxPQUFLQSxPQUFNLGFBQWFBLEdBQUUsU0FBUyxTQUFTLENBQUMsQ0FBQyxHQUFHO0FBQzlGLG1CQUFTLFdBQVc7QUFDcEIsaUJBQU8sSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBQUEsUUFDdEM7QUFBQSxNQUNGLENBQUMsRUFBRSxRQUFRLFVBQVUsY0FBYyxNQUFNO0FBQUEsUUFDdkMsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLE1BQ2IsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUVELFFBQUksT0FBTztBQUNULFlBQU0sUUFBUSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsVUFBVSw2QkFBNkIsY0FBYyxHQUFJLFdBQVc7QUFDN0csWUFBTSxZQUFZLFdBQVcsTUFBTTtBQUNqQyxpQkFBUSxLQUFLLFFBQVEsT0FBTyxVQUFVLFNBQVM7QUFBQSxNQUVqRCxHQUFHLFdBQVc7QUFFZCxjQUFRLFFBQVEsTUFBTSxhQUFhLFNBQVMsQ0FBQztBQUFBLElBQy9DO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLG9CQUFvQixTQUFrQztBQUM3RCxjQUFVLFFBQVEsT0FBTyxTQUFPLENBQUMsVUFBVSxjQUFjLEdBQUcsQ0FBQztBQUM3RCxRQUFJLENBQUMsUUFBUSxRQUFRO0FBQ25CLGFBQU8sUUFBUSxRQUFRO0FBQUEsSUFDekI7QUFFQSxVQUFNLFVBQVUsSUFBSSxRQUFjLGFBQVcsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLGFBQWE7QUFDdkYsVUFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLFlBQVksTUFBTSxHQUFHO0FBQzNDLFlBQUksUUFBUSxNQUFNLFNBQU8sVUFBVSxjQUFjLEdBQUcsQ0FBQyxHQUFHO0FBQ3RELG1CQUFTLFdBQVc7QUFDcEIsa0JBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQyxFQUFFLFFBQVEsV0FBVztBQUFBLE1BQ3BCLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxJQUNiLENBQUMsQ0FBQztBQUdGLFFBQUksT0FBTztBQUNULFlBQU0sUUFBUSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsVUFBVSwyQkFBMkIsY0FBYyxHQUFJLFlBQVksS0FBSztBQUNqSCxZQUFNLFlBQVksV0FBVyxNQUFNO0FBQ2pDLGlCQUFRLEtBQUssUUFBUSxVQUFVLElBQUk7QUFBQSxNQUNyQyxHQUFHLFdBQVc7QUFFZCxjQUFRLFFBQVEsTUFBTSxhQUFhLFNBQVMsQ0FBQztBQUFBLElBQy9DO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLFdBQVc7QUFDYixXQUFPLGlCQUFpQixFQUFFLEtBQUssTUFBTSxvQkFBb0IsU0FBUyxDQUFDO0FBQ3JFLFNBQU8saUJBQWlCO0FBQzFCOzs7QUNsT08sSUFBTSxrQkFBa0IsT0FBTyxXQUFXOzs7QUx0SDFDLElBQU0sV0FBVyxPQUFPLFdBQVc7QUFDMUMsSUFBTSxhQUFhLE9BQU8sWUFBWTtBQUN0QyxJQUFNLGNBQWMsT0FBTyxrQkFBa0I7QUFDN0MsSUFBTSx3QkFBd0I7QUFFOUIsSUFBTSxVQUFVLFFBQ2IsQ0FBQyxNQUFXLGFBQWEsT0FDeEIsZUFBZSxJQUFJLEVBQUUsWUFBWSxHQUFHLEVBQUUsV0FBVyxJQUFJLEVBQUUsUUFBUSxLQUMvRCxPQUFPLENBQUMsSUFDVixDQUFDLE1BQVk7QUFpRWYsSUFBSSxVQUFVO0FBQ2QsSUFBTSxlQUFlO0FBQUEsRUFDbkI7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQVc7QUFBQSxFQUFRO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQWM7QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQ3BIO0FBQUEsRUFBVTtBQUFBLEVBQVc7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFZO0FBQUEsRUFBUTtBQUFBLEVBQVk7QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQVc7QUFBQSxFQUFPO0FBQUEsRUFBVTtBQUFBLEVBQ3JIO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUztBQUFBLEVBQVk7QUFBQSxFQUFjO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFRO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFDckg7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUN4SDtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBWTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBWTtBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBSztBQUFBLEVBQVc7QUFBQSxFQUNwSDtBQUFBLEVBQVk7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQVc7QUFBQSxFQUFVO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFVO0FBQUEsRUFDdEg7QUFBQSxFQUFVO0FBQUEsRUFBUztBQUFBLEVBQU87QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBTTtBQUFBLEVBQVk7QUFBQSxFQUFZO0FBQUEsRUFBUztBQUFBLEVBQU07QUFBQSxFQUFTO0FBQUEsRUFDcEg7QUFBQSxFQUFTO0FBQUEsRUFBTTtBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQU87QUFBQSxFQUFTO0FBQ3JEO0FBRUEsU0FBUyxrQkFBeUI7QUFDaEMsUUFBTSxJQUFJLE1BQU0sMENBQTBDO0FBQzVEO0FBR0EsSUFBTSxzQkFBc0IsQ0FBQyxHQUFHLE9BQU8sS0FBSyxPQUFPLDBCQUEwQixTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUUsTUFBTTtBQUNqSCxJQUFFLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDZixTQUFPO0FBQ1QsR0FBRSxDQUFDLENBQTJCO0FBQzlCLFNBQVMsT0FBT0MsS0FBcUI7QUFBRSxTQUFPQSxPQUFNLHNCQUFzQixvQkFBb0JBLEdBQXNDLElBQUlBO0FBQUc7QUFFM0ksU0FBUyxXQUFXLEdBQXdCO0FBQzFDLFNBQU8sT0FBTyxNQUFNLFlBQ2YsT0FBTyxNQUFNLFlBQ2IsT0FBTyxNQUFNLGFBQ2IsYUFBYSxRQUNiLGFBQWEsWUFDYixhQUFhLGtCQUNiLE1BQU0sUUFDTixNQUFNLFVBRU4sTUFBTSxRQUFRLENBQUMsS0FDZixjQUFjLENBQUMsS0FDZixZQUFZLENBQUMsS0FDWixPQUFPLE1BQU0sWUFBWSxPQUFPLFlBQVksS0FBSyxPQUFPLEVBQUUsT0FBTyxRQUFRLE1BQU07QUFDdkY7QUFJTyxJQUFNLE1BQWlCLFNBSzVCLElBQ0EsSUFDQSxJQUN5QztBQVd6QyxRQUFNLENBQUMsV0FBVyxNQUFNLE9BQU8sSUFBSyxPQUFPLE9BQU8sWUFBYSxPQUFPLE9BQ2xFLENBQUMsSUFBSSxJQUFjLEVBQXVDLElBQzFELE1BQU0sUUFBUSxFQUFFLElBQ2QsQ0FBQyxNQUFNLElBQWMsRUFBdUMsSUFDNUQsQ0FBQyxNQUFNLGNBQWMsRUFBdUM7QUFFbEUsUUFBTSxtQkFBbUIsU0FBUztBQUNsQyxRQUFNLFVBQVUsU0FBUyxZQUFZLFdBQVc7QUFDaEQsUUFBTSxZQUFZLFFBQVEsZ0JBQWdCO0FBQzFDLFFBQU0scUJBQXFCLFNBQVMsWUFBWSxTQUFTQyxvQkFBbUIsRUFBRSxNQUFNLEdBQTZDO0FBQy9ILFdBQU8sUUFBUSxjQUFjLGlCQUFpQixRQUFRLE1BQU0sU0FBUyxJQUFJLGFBQWEsS0FBSyxVQUFVLE9BQU8sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUN0SDtBQUVBLFFBQU0sZUFBZSxnQkFBZ0IsT0FBTztBQUU1QyxXQUFTLG9CQUFvQixPQUFhO0FBQ3hDLFdBQU8sUUFBUSxjQUFjLFFBQU8sTUFBTSxTQUFTLElBQUcsUUFDbEQsSUFBSSxNQUFNLFNBQVMsRUFBRSxPQUFPLFFBQVEsWUFBWSxFQUFFLEtBQUssWUFDdkQsU0FBUztBQUFBLEVBQ2Y7QUFFQSxNQUFJLENBQUMsU0FBUyxlQUFlLHFCQUFxQixHQUFHO0FBQ25ELFlBQVEsS0FBSyxZQUFZLE9BQU8sT0FBTyxRQUFRLGNBQWMsT0FBTyxHQUFHLEVBQUMsSUFBSSxzQkFBcUIsQ0FBRSxDQUFDO0FBQUEsRUFDdEc7QUFHQSxRQUFNLFNBQVMsb0JBQUksSUFBWTtBQUMvQixRQUFNLGdCQUFrQyxPQUFPO0FBQUEsSUFDN0M7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsUUFDSixVQUFVO0FBQUEsUUFDVixjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixPQUFPLFlBQWEsTUFBc0I7QUFDeEMsaUJBQU8sS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQzNCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsR0FBRyxPQUFPLHlCQUF5QixRQUFRLFdBQVcsWUFBWTtBQUFBLFFBQ2xFLElBQW1CLEdBQVc7QUFDNUIsY0FBSSxZQUFZLENBQUMsR0FBRztBQUNsQixrQkFBTSxLQUFLLGdCQUFnQixDQUFDLElBQUksSUFBSSxFQUFFLE9BQU8sYUFBYSxFQUFFO0FBQzVELGtCQUFNLE9BQU8sTUFBTSxHQUFHLEtBQUssRUFBRTtBQUFBLGNBQzNCLENBQUMsRUFBRSxNQUFNLE1BQU0sTUFBTTtBQUFFLDRCQUFZLE1BQU0sS0FBSztBQUFHLHdCQUFRLEtBQUs7QUFBQSxjQUFFO0FBQUEsY0FDaEUsUUFBTSxTQUFRLEtBQUssRUFBRTtBQUFBLFlBQUM7QUFDeEIsaUJBQUs7QUFBQSxVQUNQLE1BQ0ssYUFBWSxNQUFNLENBQUM7QUFBQSxRQUMxQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQTtBQUFBO0FBQUEsUUFHSCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixLQUFLO0FBQUEsUUFDTCxNQUFtQjtBQUVqQixnQkFBTSxVQUFVLElBQUksTUFBTyxNQUFJO0FBQUEsVUFBQyxHQUE0RDtBQUFBLFlBQzFGLE1BQU0sUUFBUSxTQUFTLE1BQU07QUFDM0Isa0JBQUk7QUFDRix1QkFBTyxRQUFRLFlBQVksV0FBVyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUk7QUFBQSxjQUMvRCxTQUFTLElBQUk7QUFDWCxzQkFBTSxJQUFJLE1BQU0sYUFBYSxPQUFPLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxFQUFFLE9BQU8sR0FBRyxDQUFDO0FBQUEsY0FDNUY7QUFBQSxZQUNGO0FBQUEsWUFDQSxXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxZQUNoQixLQUFLO0FBQUEsWUFDTCxnQkFBZ0I7QUFBQSxZQUNoQixpQkFBaUI7QUFBRSxxQkFBTztBQUFBLFlBQUs7QUFBQSxZQUMvQixlQUFlO0FBQUUscUJBQU87QUFBQSxZQUFNO0FBQUEsWUFDOUIsb0JBQW9CO0FBQUUscUJBQU87QUFBQSxZQUFLO0FBQUEsWUFDbEMseUJBQXlCLFFBQVEsR0FBRztBQUNsQyxrQkFBSSxLQUFLLElBQUssUUFBUSxHQUFHLElBQUk7QUFDM0IsdUJBQU8sUUFBUSx5QkFBeUIsUUFBUSxPQUFPLENBQUMsQ0FBQztBQUFBLFlBQzdEO0FBQUEsWUFDQSxJQUFJLFFBQVEsR0FBRztBQUNiLG9CQUFNLElBQUksS0FBSyxJQUFLLFFBQVEsR0FBRyxJQUFJO0FBQ25DLHFCQUFPLFFBQVEsQ0FBQztBQUFBLFlBQ2xCO0FBQUEsWUFDQSxTQUFTLENBQUMsV0FBVztBQUNuQixvQkFBTSxNQUFNLENBQUMsR0FBRyxLQUFLLGlCQUFpQixNQUFNLENBQUMsRUFBRSxJQUFJLE9BQUssRUFBRSxFQUFFO0FBQzVELG9CQUFNQyxVQUFTLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDO0FBQy9CLGtCQUFJLFNBQVMsSUFBSSxXQUFXQSxRQUFPO0FBQ2pDLHlCQUFRLElBQUkscURBQXFEQSxPQUFNO0FBQ3pFLHFCQUFPQTtBQUFBLFlBQ1Q7QUFBQSxZQUNBLEtBQUssQ0FBQyxRQUFRLEdBQUcsYUFBYTtBQUM1QixrQkFBSSxPQUFPLE1BQU0sVUFBVTtBQUN6QixzQkFBTSxLQUFLLE9BQU8sQ0FBQztBQUVuQixvQkFBSSxNQUFNLFFBQVE7QUFFaEIsd0JBQU0sTUFBTSxPQUFPLEVBQUUsRUFBRSxNQUFNO0FBQzdCLHNCQUFJLE9BQU8sSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFDMUMsMkJBQU87QUFDVCx5QkFBTyxPQUFPLEVBQUU7QUFBQSxnQkFDbEI7QUFDQSxvQkFBSTtBQUNKLG9CQUFJLE9BQU87QUFDVCx3QkFBTSxLQUFLLEtBQUssaUJBQWlCLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztBQUNwRCxzQkFBSSxHQUFHLFNBQVMsR0FBRztBQUNqQix3QkFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUc7QUFDbEIsNkJBQU8sSUFBSSxDQUFDO0FBQ1osK0JBQVE7QUFBQSx3QkFBSSwyREFBMkQsQ0FBQztBQUFBO0FBQUEsc0JBQThCO0FBQUEsb0JBQ3hHO0FBQUEsa0JBQ0Y7QUFDQSxzQkFBSSxHQUFHLENBQUM7QUFBQSxnQkFDVixPQUFPO0FBQ0wsc0JBQUksS0FBSyxjQUFjLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLO0FBQUEsZ0JBQ2pEO0FBQ0Esb0JBQUk7QUFDRiwwQkFBUSxJQUFJLFFBQVEsSUFBSSxJQUFJLFFBQVEsQ0FBQyxHQUFHLE1BQU07QUFDaEQsdUJBQU87QUFBQSxjQUNUO0FBQUEsWUFDRjtBQUFBLFVBQ0YsQ0FBQztBQUVELGlCQUFPLGVBQWUsTUFBTSxPQUFPO0FBQUEsWUFDakMsY0FBYztBQUFBLFlBQ2QsWUFBWTtBQUFBLFlBQ1osS0FBSztBQUFBLFlBQ0wsTUFBTTtBQUFFLHFCQUFPO0FBQUEsWUFBUTtBQUFBLFVBQ3pCLENBQUM7QUFHRCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLFNBQVMsd0JBQXdCO0FBQ25DLFdBQU8sZUFBZSxlQUFjLG9CQUFtQjtBQUFBLE1BQ3JELGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxNQUNaLEtBQUssU0FBUyxJQUFjO0FBQzFCLHFCQUFhLFVBQVUsQ0FBQyxJQUFJLEdBQUcsYUFBYSxFQUFFO0FBQUEsTUFDaEQ7QUFBQSxNQUNBLEtBQUssV0FBVTtBQUNiLHFCQUFhLGtCQUFrQixNQUFNLFdBQVc7QUFBQSxNQUNsRDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFFQSxNQUFJO0FBQ0YsZUFBVyxlQUFlLGdCQUFnQjtBQUU1QyxZQUFVLFNBQVMsV0FBb0U7QUFDckYsYUFBUyxhQUFhLEdBQWM7QUFDbEMsYUFBUSxNQUFNLFVBQWEsTUFBTSxRQUFRLE1BQU07QUFBQSxJQUNqRDtBQUVBLGVBQVcsS0FBSyxXQUFXO0FBQ3pCLFVBQUksYUFBYSxDQUFDO0FBQ2hCO0FBRUYsVUFBSSxjQUFjLENBQUMsR0FBRztBQUNwQixZQUFJLElBQTZCLENBQUMsb0JBQW9CLENBQUM7QUFDdkQsVUFBRSxLQUFLLGlCQUFlO0FBQ3BCLGdCQUFNLE1BQU07QUFDWixjQUFJLEtBQUs7QUFDUCxnQkFBSSxDQUFDLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFDMUIseUJBQWEsVUFBVSxHQUFHLFlBQVksTUFBSztBQUFFLGtCQUFJO0FBQUEsWUFBVSxDQUFDO0FBQzVELHFCQUFTLElBQUUsR0FBRyxJQUFJLElBQUksUUFBUSxLQUFLO0FBQ2pDLGtCQUFJLE1BQU07QUFDUixvQkFBSSxDQUFDLEVBQUUsWUFBWSxHQUFHLENBQUM7QUFBQTtBQUV6QixvQkFBSSxDQUFDLEVBQUUsT0FBTztBQUFBLFlBQ2hCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsQ0FBQztBQUVELFlBQUksRUFBRyxRQUFPO0FBQ2Q7QUFBQSxNQUNGO0FBRUEsVUFBSSxhQUFhLE1BQU07QUFDckIsY0FBTTtBQUNOO0FBQUEsTUFDRjtBQU9BLFVBQUksS0FBSyxPQUFPLE1BQU0sWUFBWSxPQUFPLFlBQVksS0FBSyxFQUFFLE9BQU8saUJBQWlCLE1BQU0sRUFBRSxPQUFPLFFBQVEsR0FBRztBQUM1RyxtQkFBVyxNQUFNO0FBQ2YsaUJBQU8sTUFBTSxFQUFFO0FBQ2pCO0FBQUEsTUFDRjtBQUVBLFVBQUksWUFBdUIsQ0FBQyxHQUFHO0FBQzdCLGNBQU0saUJBQWlCLFFBQVMsT0FBTyxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsWUFBWSxhQUFhLElBQUs7QUFDaEcsWUFBSSxLQUFLLGdCQUFnQixDQUFDLElBQUksSUFBSSxFQUFFLE9BQU8sYUFBYSxFQUFFO0FBQzFELFlBQUksZ0JBQWdCO0FBRXBCLGNBQU0sa0JBQWtCLENBQUMsUUFBaUIsVUFBVTtBQUNsRCxjQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7QUFDdEIsbUJBQU87QUFDVCxjQUFJLFNBQVMsWUFBWSxNQUFNLE1BQU0sT0FBSyxhQUFhLElBQUksQ0FBQyxDQUFDLEdBQUc7QUFFOUQsd0JBQVksT0FBTyxRQUFRLE9BQUssYUFBYSxJQUFJLENBQUMsQ0FBQztBQUNuRCxrQkFBTSxNQUFNLHFEQUNSLFlBQVksTUFBTSxJQUFJLE9BQU8sRUFBRSxLQUFLLElBQUksSUFDeEM7QUFFSix3QkFBWSxRQUFRO0FBQ3BCLGVBQUcsU0FBUyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBRTFCLGlCQUFLO0FBQ0wsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBR0EsY0FBTSxVQUFVLEVBQUUsUUFBUTtBQUMxQixjQUFNLGNBQWM7QUFBQSxVQUNsQixPQUFTLFlBQVksSUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDO0FBQUEsVUFDakQsQ0FBQyxPQUFPLFFBQVEsSUFBSTtBQUNsQixtQkFBTyxLQUFLLFFBQVEsT0FBTyxRQUFRLEVBQUUsS0FBTSxFQUFFLE9BQU87QUFBRSxxQkFBTyxFQUFFLE1BQU0sTUFBZSxPQUFPLE9BQVU7QUFBQSxZQUFFLEVBQUU7QUFBQSxVQUMzRztBQUFBLFFBQ0Y7QUFDQSxZQUFJLENBQUMsWUFBWSxNQUFPO0FBQ3RCLHNCQUFZLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQztBQUM1QyxxQkFBYSxVQUFVLFlBQVksT0FBTyxZQUFXLGVBQWU7QUFHcEUsY0FBTSxpQkFBaUIsU0FDbEIsTUFBTTtBQUNQLGdCQUFNLFlBQVksS0FBSyxJQUFJLElBQUk7QUFDL0IsZ0JBQU0sWUFBWSxJQUFJLE1BQU0sWUFBWSxFQUFFO0FBQzFDLGNBQUksSUFBSSxNQUFNO0FBQ1osZ0JBQUksaUJBQWlCLGFBQWEsWUFBWSxLQUFLLElBQUksR0FBRztBQUN4RCxrQkFBSSxNQUFNO0FBQUEsY0FBRTtBQUNaLHVCQUFRLEtBQUssbUNBQW1DLGNBQWMsR0FBSSxtREFBbUQsV0FBVyxZQUFZLE9BQU8sSUFBSSxPQUFPLENBQUM7QUFBQSxZQUNqSztBQUFBLFVBQ0Y7QUFDQSxpQkFBTztBQUFBLFFBQ1QsR0FBRyxJQUNEO0FBRUosU0FBQyxTQUFTLE9BQU87QUFDZixhQUFHLEtBQUssRUFBRSxLQUFLLFFBQU07QUFDbkIsZ0JBQUksQ0FBQyxHQUFHLE1BQU07QUFDWixrQkFBSSxDQUFDLFlBQVksT0FBTztBQUN0QixvQkFBSSxRQUFRLElBQUksTUFBTSxvQkFBb0IsQ0FBQztBQUMzQztBQUFBLGNBQ0Y7QUFDQSxvQkFBTSxVQUFVLFlBQVksTUFBTSxPQUFPLE9BQUssRUFBRSxXQUFXO0FBQzNELG9CQUFNLElBQUksZ0JBQWdCLFlBQVksUUFBUTtBQUM5QyxrQkFBSSxpQkFBaUIsUUFBUSxPQUFRLGlCQUFnQjtBQUVyRCxrQkFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsTUFBTSxHQUFHO0FBQy9CLGlDQUFpQjtBQUNqQiw2QkFBYSxVQUFVLFlBQVksT0FBTyxVQUFVO0FBRXBELDRCQUFZLFFBQVEsQ0FBQyxHQUFHLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQzlDLG9CQUFJLENBQUMsWUFBWSxNQUFNO0FBQ3JCLDhCQUFZLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQztBQUM1Qyw2QkFBYSxVQUFVLFlBQVksT0FBTyxZQUFXLGVBQWU7QUFFcEUseUJBQVMsSUFBRSxHQUFHLElBQUUsRUFBRSxRQUFRLEtBQUs7QUFDN0Isc0JBQUksTUFBSTtBQUNOLHNCQUFFLENBQUMsRUFBRSxZQUFZLEdBQUcsWUFBWSxLQUFLO0FBQUEsMkJBQzlCLENBQUMsWUFBWSxNQUFNLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDdkMsc0JBQUUsQ0FBQyxFQUFFLE9BQU87QUFDZCwrQkFBYSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQUEsZ0JBQ3ZCO0FBRUEscUJBQUs7QUFBQSxjQUNQO0FBQUEsWUFDRjtBQUFBLFVBQ0YsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxlQUFvQjtBQUM1QixrQkFBTSxJQUFJLFlBQVksT0FBTyxPQUFPLENBQUFDLE9BQUssUUFBUUEsSUFBRyxVQUFVLENBQUM7QUFDL0QsZ0JBQUksR0FBRyxRQUFRO0FBQ2IsZ0JBQUUsQ0FBQyxFQUFFLFlBQVksbUJBQW1CLEVBQUUsT0FBTyxZQUFZLFNBQVMsV0FBVyxDQUFDLENBQUM7QUFDL0UsZ0JBQUUsTUFBTSxDQUFDLEVBQUUsUUFBUSxPQUFLLEdBQUcsT0FBTyxDQUFDO0FBQUEsWUFDckMsTUFDSyxVQUFRLEtBQUssc0JBQXNCLFlBQVksWUFBWSxPQUFPLElBQUksT0FBTyxDQUFDO0FBRW5GLHdCQUFZLFFBQVE7QUFFcEIsaUJBQUs7QUFBQSxVQUNQLENBQUM7QUFBQSxRQUNILEdBQUc7QUFFSCxZQUFJLFlBQVksTUFBTyxRQUFPO0FBQzlCO0FBQUEsTUFDRjtBQUVBLFlBQU0sUUFBUSxlQUFlLEVBQUUsU0FBUyxDQUFDO0FBQUEsSUFDM0M7QUFBQSxFQUNGO0FBRUEsTUFBSSxDQUFDLFdBQVc7QUFDZCxXQUFPLE9BQU8sS0FBSztBQUFBLE1BQ2pCO0FBQUE7QUFBQSxNQUNBO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUdBLFFBQU0sdUJBQXVCLE9BQU8sZUFBZSxDQUFDLENBQUM7QUFFckQsV0FBUyxXQUFXLEdBQTBDLEdBQVEsYUFBMEI7QUFDOUYsUUFBSSxNQUFNLFFBQVEsTUFBTSxVQUFhLE9BQU8sTUFBTSxZQUFZLE1BQU07QUFDbEU7QUFFRixlQUFXLENBQUMsR0FBRyxPQUFPLEtBQUssT0FBTyxRQUFRLE9BQU8sMEJBQTBCLENBQUMsQ0FBQyxHQUFHO0FBQzlFLFVBQUk7QUFDRixZQUFJLFdBQVcsU0FBUztBQUN0QixnQkFBTSxRQUFRLFFBQVE7QUFFdEIsY0FBSSxTQUFTLFlBQXFCLEtBQUssR0FBRztBQUN4QyxtQkFBTyxlQUFlLEdBQUcsR0FBRyxPQUFPO0FBQUEsVUFDckMsT0FBTztBQUdMLGdCQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxjQUFjLEtBQUssR0FBRztBQUMvRCxrQkFBSSxFQUFFLEtBQUssSUFBSTtBQU1iLG9CQUFJLGFBQWE7QUFDZixzQkFBSSxPQUFPLGVBQWUsS0FBSyxNQUFNLHdCQUF3QixDQUFDLE9BQU8sZUFBZSxLQUFLLEdBQUc7QUFFMUYsK0JBQVcsUUFBUSxRQUFRLENBQUMsR0FBRyxLQUFLO0FBQUEsa0JBQ3RDLFdBQVcsTUFBTSxRQUFRLEtBQUssR0FBRztBQUUvQiwrQkFBVyxRQUFRLFFBQVEsQ0FBQyxHQUFHLEtBQUs7QUFBQSxrQkFDdEMsT0FBTztBQUVMLDZCQUFRLEtBQUsscUJBQXFCLENBQUMsNkdBQTZHLEdBQUcsS0FBSztBQUFBLGtCQUMxSjtBQUFBLGdCQUNGO0FBQ0EsdUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLGNBQ3JDLE9BQU87QUFDTCxvQkFBSSxpQkFBaUIsTUFBTTtBQUN6QiwyQkFBUSxLQUFLLHFNQUFxTSxDQUFDLFlBQVksUUFBUSxLQUFLLENBQUMsaUJBQWlCLGFBQWEsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbFMsb0JBQUUsQ0FBQyxJQUFJO0FBQUEsZ0JBQ1QsT0FBTztBQUNMLHNCQUFJLEVBQUUsQ0FBQyxNQUFNLE9BQU87QUFJbEIsd0JBQUksTUFBTSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxNQUFNLFFBQVE7QUFDdkQsMEJBQUksTUFBTSxnQkFBZ0IsVUFBVSxNQUFNLGdCQUFnQixPQUFPO0FBQy9ELG1DQUFXLEVBQUUsQ0FBQyxJQUFJLElBQUssTUFBTSxlQUFjLEtBQUs7QUFBQSxzQkFDbEQsT0FBTztBQUVMLDBCQUFFLENBQUMsSUFBSTtBQUFBLHNCQUNUO0FBQUEsb0JBQ0YsT0FBTztBQUVMLGlDQUFXLEVBQUUsQ0FBQyxHQUFHLEtBQUs7QUFBQSxvQkFDeEI7QUFBQSxrQkFDRjtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUFBLFlBQ0YsT0FBTztBQUVMLGtCQUFJLEVBQUUsQ0FBQyxNQUFNO0FBQ1gsa0JBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUFBLFlBQ2Q7QUFBQSxVQUNGO0FBQUEsUUFDRixPQUFPO0FBRUwsaUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLFFBQ3JDO0FBQUEsTUFDRixTQUFTLElBQWE7QUFDcEIsaUJBQVEsS0FBSyxjQUFjLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRTtBQUN0QyxjQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsV0FBUyxNQUFTLEdBQVM7QUFDekIsVUFBTSxJQUFJLEdBQUcsUUFBUTtBQUNyQixXQUFRLE1BQU0sUUFBUSxDQUFDLElBQUksTUFBTSxVQUFVLElBQUksS0FBSyxHQUFHLEtBQUssSUFBSTtBQUFBLEVBQ2xFO0FBRUEsV0FBUyxZQUFZLE1BQVksT0FBNEI7QUFFM0QsUUFBSSxFQUFFLG1CQUFtQixRQUFRO0FBQy9CLE9BQUMsU0FBUyxPQUFPLEdBQVEsR0FBYztBQUNyQyxZQUFJLE1BQU0sUUFBUSxNQUFNLFVBQWEsT0FBTyxNQUFNO0FBQ2hEO0FBRUYsY0FBTSxnQkFBZ0IsT0FBTyxRQUFRLE9BQU8sMEJBQTBCLENBQUMsQ0FBQztBQUN4RSxZQUFJLENBQUMsTUFBTSxRQUFRLENBQUMsR0FBRztBQUNyQix3QkFBYyxLQUFLLE9BQUs7QUFDdEIsa0JBQU0sT0FBTyxPQUFPLHlCQUF5QixHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELGdCQUFJLE1BQU07QUFDUixrQkFBSSxXQUFXLEtBQU0sUUFBTztBQUM1QixrQkFBSSxTQUFTLEtBQU0sUUFBTztBQUMxQixrQkFBSSxTQUFTLEtBQU0sUUFBTztBQUFBLFlBQzVCO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBRUEsY0FBTSxNQUFNLGFBQWEsRUFBRSxhQUFhLFlBQWEsYUFBYSxjQUM5RCxDQUFDLEdBQVcsTUFBVztBQUFFLFlBQUUsQ0FBQyxJQUFJO0FBQUEsUUFBRSxJQUNsQyxDQUFDLEdBQVcsTUFBVztBQUN2QixlQUFLLE1BQU0sUUFBUSxPQUFPLE1BQU0sWUFBWSxPQUFPLE1BQU0sYUFBYSxPQUFPLE1BQU0sY0FDN0UsRUFBRSxLQUFLLE1BQU0sT0FBTyxFQUFFLENBQW1CLE1BQU07QUFDbkQsY0FBRSxhQUFhLE1BQU0sY0FBYyxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFBQTtBQUV6RCxjQUFFLENBQUMsSUFBSTtBQUFBLFFBQ1g7QUFFRixtQkFBVyxDQUFDLEdBQUcsT0FBTyxLQUFLLGVBQWU7QUFDeEMsY0FBSTtBQUNGLGdCQUFJLFdBQVcsU0FBUztBQUN0QixvQkFBTSxRQUFRLFFBQVE7QUFDdEIsa0JBQUksWUFBcUIsS0FBSyxHQUFHO0FBQy9CLCtCQUFlLE9BQU8sQ0FBQztBQUFBLGNBQ3pCLFdBQVcsY0FBYyxLQUFLLEdBQUc7QUFDL0Isc0JBQU0sS0FBSyxPQUFLO0FBQ2Qsc0JBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxHQUFHO0FBQzNCLHdCQUFJLEtBQUssT0FBTyxNQUFNLFVBQVU7QUFFOUIsMEJBQUksWUFBcUIsQ0FBQyxHQUFHO0FBQzNCLHVDQUFlLEdBQUcsQ0FBQztBQUFBLHNCQUNyQixPQUFPO0FBQ0wscUNBQWEsR0FBRyxDQUFDO0FBQUEsc0JBQ25CO0FBQUEsb0JBQ0YsT0FBTztBQUNMLDBCQUFJLEVBQUUsQ0FBQyxNQUFNO0FBQ1gsNEJBQUksR0FBRyxDQUFDO0FBQUEsb0JBQ1o7QUFBQSxrQkFDRjtBQUFBLGdCQUNGLEdBQUcsV0FBUyxTQUFRLElBQUksb0NBQW9DLENBQUMsS0FBSyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFBQSxjQUN0RixXQUFXLENBQUMsWUFBcUIsS0FBSyxHQUFHO0FBRXZDLG9CQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxjQUFjLEtBQUs7QUFDNUQsK0JBQWEsT0FBTyxDQUFDO0FBQUEscUJBQ2xCO0FBQ0gsc0JBQUksRUFBRSxDQUFDLE1BQU07QUFDWCx3QkFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQUEsZ0JBQ2Y7QUFBQSxjQUNGO0FBQUEsWUFDRixPQUFPO0FBRUwscUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLFlBQ3JDO0FBQUEsVUFDRixTQUFTLElBQWE7QUFDcEIscUJBQVEsS0FBSyxlQUFlLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRTtBQUN2QyxrQkFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBRUEsaUJBQVMsZUFBZSxNQUF1RSxHQUFXO0FBQ3hHLGdCQUFNLEtBQUssY0FBYyxJQUFJO0FBRTdCLGNBQUksWUFBWSxLQUFLLElBQUksSUFBSTtBQUM3QixnQkFBTSxZQUFZLFNBQVMsSUFBSSxNQUFNLFlBQVksRUFBRTtBQUVuRCxjQUFJLFVBQVU7QUFDZCxnQkFBTSxTQUFTLENBQUMsT0FBZ0M7QUFDOUMsZ0JBQUksQ0FBQyxHQUFHLE1BQU07QUFDWix3QkFBVSxXQUFXLEtBQUs7QUFFMUIsa0JBQUksYUFBYSxJQUFJLElBQUksR0FBRztBQUMxQixzQkFBTSxnQkFBZ0I7QUFDdEIsbUJBQUcsU0FBUztBQUNaO0FBQUEsY0FDRjtBQUVBLG9CQUFNLFFBQVEsTUFBTSxHQUFHLEtBQUs7QUFDNUIsa0JBQUksT0FBTyxVQUFVLFlBQVksVUFBVSxNQUFNO0FBYS9DLHNCQUFNLFdBQVcsT0FBTyx5QkFBeUIsR0FBRyxDQUFDO0FBQ3JELG9CQUFJLE1BQU0sV0FBVyxDQUFDLFVBQVU7QUFDOUIseUJBQU8sRUFBRSxDQUFDLEdBQUcsS0FBSztBQUFBO0FBRWxCLHNCQUFJLEdBQUcsS0FBSztBQUFBLGNBQ2hCLE9BQU87QUFFTCxvQkFBSSxVQUFVO0FBQ1osc0JBQUksR0FBRyxLQUFLO0FBQUEsY0FDaEI7QUFFQSxrQkFBSSxTQUFTLENBQUMsV0FBVyxZQUFZLEtBQUssSUFBSSxHQUFHO0FBQy9DLDRCQUFZLE9BQU87QUFDbkIseUJBQVEsS0FBSyxpQ0FBaUMsQ0FBQyx1QkFBdUIsY0FBWSxHQUFJO0FBQUEsb0JBQXNFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFBSyxTQUFTLEVBQUU7QUFBQSxjQUMzTDtBQUVBLGlCQUFHLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFBQSxZQUNwQztBQUFBLFVBQ0Y7QUFDQSxnQkFBTSxRQUFRLENBQUMsZUFBb0I7QUFDakMsZ0JBQUksWUFBWTtBQUNkLHVCQUFRLEtBQUssaUNBQWlDLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxXQUFXLFFBQVEsSUFBSSxDQUFDO0FBQ2pHLG1CQUFLLFlBQVksbUJBQW1CLEVBQUUsT0FBTyxXQUFXLENBQUMsQ0FBQztBQUFBLFlBQzVEO0FBQUEsVUFDRjtBQUVBLGdCQUFNLFVBQVUsS0FBSyxRQUFRO0FBQzdCLGNBQUksWUFBWSxVQUFhLFlBQVksUUFBUSxDQUFDLFlBQVksT0FBTztBQUNuRSxtQkFBTyxFQUFFLE1BQU0sT0FBTyxPQUFPLFFBQVEsQ0FBQztBQUFBO0FBRXRDLGVBQUcsS0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLE1BQU0sS0FBSztBQUNwQyx1QkFBYSxVQUFVLENBQUMsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUFBLFFBQ3ZEO0FBRUEsaUJBQVMsYUFBYSxPQUFZLEdBQVc7QUFDM0MsY0FBSSxpQkFBaUIsTUFBTTtBQUN6QixxQkFBUSxLQUFLLHFNQUFxTSxDQUFDLFlBQVksUUFBUSxLQUFLLENBQUMsaUJBQWlCLGdCQUFnQixPQUFPLFFBQVEsSUFBSSxJQUFJLElBQUksRUFBRTtBQUMzUyxnQkFBSSxHQUFHLEtBQUs7QUFBQSxVQUNkLE9BQU87QUFJTCxnQkFBSSxFQUFFLEtBQUssTUFBTSxFQUFFLENBQUMsTUFBTSxTQUFVLE1BQU0sUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFdBQVcsTUFBTSxRQUFTO0FBQ3hGLGtCQUFJLE1BQU0sZ0JBQWdCLFVBQVUsTUFBTSxnQkFBZ0IsT0FBTztBQUMvRCxzQkFBTSxPQUFPLElBQUssTUFBTTtBQUN4Qix1QkFBTyxNQUFNLEtBQUs7QUFDbEIsb0JBQUksR0FBRyxJQUFJO0FBQUEsY0FFYixPQUFPO0FBRUwsb0JBQUksR0FBRyxLQUFLO0FBQUEsY0FDZDtBQUFBLFlBQ0YsT0FBTztBQUNMLGtCQUFJLE9BQU8seUJBQXlCLEdBQUcsQ0FBQyxHQUFHO0FBQ3pDLG9CQUFJLEdBQUcsS0FBSztBQUFBO0FBRVosdUJBQU8sRUFBRSxDQUFDLEdBQUcsS0FBSztBQUFBLFlBQ3RCO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLEdBQUcsTUFBTSxLQUFLO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBV0EsV0FBUyxlQUFnRCxHQUFRO0FBQy9ELGFBQVMsSUFBSSxFQUFFLGFBQWEsR0FBRyxJQUFJLEVBQUUsT0FBTztBQUMxQyxVQUFJLE1BQU07QUFDUixlQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxTQUFvQyxZQUE4RDtBQUN6RyxVQUFNLHFCQUFzQixPQUFPLGVBQWUsYUFDOUMsQ0FBQyxhQUF1QixPQUFPLE9BQU8sQ0FBQyxHQUFHLFlBQVksUUFBUSxJQUM5RDtBQUVKLFVBQU0sY0FBYyxLQUFLLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxXQUFXLFNBQVMsRUFBRSxJQUFJLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQztBQUMzRyxVQUFNLG1CQUE4QixtQkFBbUIsRUFBRSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7QUFFbEYsUUFBSSxpQkFBaUIsUUFBUTtBQUMzQixlQUFTLGVBQWUscUJBQXFCLEdBQUcsWUFBWSxRQUFRLGVBQWUsaUJBQWlCLFNBQVMsSUFBSSxDQUFDO0FBQUEsSUFDcEg7QUFLQSxVQUFNLGNBQWlDLENBQUMsVUFBVSxhQUFhO0FBQzdELFlBQU0sVUFBVSxXQUFXLEtBQUs7QUFDaEMsWUFBTSxlQUE0QyxDQUFDO0FBQ25ELFlBQU0sZ0JBQWdCLEVBQUUsQ0FBQyxlQUFlLElBQUksVUFBVSxlQUFlLE1BQU0sZUFBZSxNQUFNLGFBQWE7QUFDN0csWUFBTSxJQUFJLFVBQVUsS0FBSyxlQUFlLE9BQU8sR0FBRyxRQUFRLElBQUksS0FBSyxlQUFlLEdBQUcsUUFBUTtBQUM3RixRQUFFLGNBQWM7QUFDaEIsWUFBTSxnQkFBZ0IsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQ3BFLG9CQUFjLGVBQWUsRUFBRSxLQUFLLGFBQWE7QUFDakQsVUFBSSxPQUFPO0FBRVQsY0FBTSxjQUFjLENBQUMsU0FBOEIsUUFBZ0I7QUFDakUsbUJBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxFQUFFO0FBQzdCLGdCQUFJLEVBQUUsWUFBWSxXQUFXLE9BQU8sRUFBRSxXQUFXLFFBQVMsUUFBTztBQUNuRSxpQkFBTztBQUFBLFFBQ1Q7QUFDQSxZQUFJLGNBQWMsU0FBUztBQUN6QixnQkFBTSxRQUFRLE9BQU8sS0FBSyxjQUFjLE9BQU8sRUFBRSxPQUFPLE9BQU0sS0FBSyxLQUFNLFlBQVksTUFBTSxDQUFDLENBQUM7QUFDN0YsY0FBSSxNQUFNLFFBQVE7QUFDaEIscUJBQVEsSUFBSSxrQkFBa0IsS0FBSyxRQUFRLFVBQVUsSUFBSSwyQkFBMkIsS0FBSyxRQUFRLENBQUMsR0FBRztBQUFBLFVBQ3ZHO0FBQUEsUUFDRjtBQUNBLFlBQUksY0FBYyxVQUFVO0FBQzFCLGdCQUFNLFFBQVEsT0FBTyxLQUFLLGNBQWMsUUFBUSxFQUFFLE9BQU8sT0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLG9CQUFvQixLQUFLLHFCQUFxQixDQUFDLFlBQVksTUFBTSxDQUFDLENBQUM7QUFDaEosY0FBSSxNQUFNLFFBQVE7QUFDaEIscUJBQVEsSUFBSSxvQkFBb0IsS0FBSyxRQUFRLFVBQVUsSUFBSSwwQkFBMEIsS0FBSyxRQUFRLENBQUMsR0FBRztBQUFBLFVBQ3hHO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFDQSxpQkFBVyxHQUFHLGNBQWMsU0FBUyxJQUFJO0FBQ3pDLGlCQUFXLEdBQUcsY0FBYyxRQUFRO0FBQ3BDLFlBQU0sV0FBVyxvQkFBSSxJQUFZO0FBQ2pDLG9CQUFjLFlBQVksT0FBTyxLQUFLLGNBQWMsUUFBUSxFQUFFLFFBQVEsT0FBSztBQUN6RSxZQUFJLEtBQUssR0FBRztBQUNWLG1CQUFRLElBQUksb0RBQW9ELENBQUMsc0NBQXNDO0FBQ3ZHLG1CQUFTLElBQUksQ0FBQztBQUFBLFFBQ2hCLE9BQU87QUFDTCxpQ0FBdUIsR0FBRyxHQUFHLGNBQWMsU0FBVSxDQUF3QyxDQUFDO0FBQUEsUUFDaEc7QUFBQSxNQUNGLENBQUM7QUFDRCxVQUFJLGNBQWMsZUFBZSxNQUFNLGNBQWM7QUFDbkQsWUFBSSxDQUFDO0FBQ0gsc0JBQVksR0FBRyxLQUFLO0FBQ3RCLG1CQUFXLFFBQVEsY0FBYztBQUMvQixnQkFBTUMsWUFBVyxNQUFNLGFBQWEsS0FBSyxDQUFDO0FBQzFDLGNBQUksV0FBV0EsU0FBUTtBQUNyQixjQUFFLE9BQU8sR0FBRyxNQUFNQSxTQUFRLENBQUM7QUFBQSxRQUMvQjtBQUlBLGNBQU0sZ0NBQWdDLENBQUM7QUFDdkMsWUFBSSxtQkFBbUI7QUFDdkIsbUJBQVcsUUFBUSxjQUFjO0FBQy9CLGNBQUksS0FBSyxTQUFVLFlBQVcsS0FBSyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFFN0Qsa0JBQU0sYUFBYSxDQUFDLFdBQVcsS0FBSztBQUNwQyxnQkFBSyxTQUFTLElBQUksQ0FBQyxLQUFLLGNBQWUsRUFBRSxlQUFlLENBQUMsY0FBYyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxNQUFNLENBQUMsQ0FBQyxLQUFLO0FBQzVHLG9CQUFNLFFBQVEsRUFBRSxDQUFtQixHQUFHLFFBQVE7QUFDOUMsa0JBQUksVUFBVSxRQUFXO0FBRXZCLDhDQUE4QixDQUFDLElBQUk7QUFDbkMsbUNBQW1CO0FBQUEsY0FDckI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFDQSxZQUFJO0FBQ0YsaUJBQU8sT0FBTyxHQUFHLDZCQUE2QjtBQUFBLE1BQ2xEO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFFQSxVQUFNLFlBQXVDLE9BQU8sT0FBTyxhQUFhO0FBQUEsTUFDdEUsT0FBTztBQUFBLE1BQ1AsWUFBWSxPQUFPLE9BQU8sa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQUEsTUFDdkU7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNiLGNBQU0sT0FBTyxDQUFDLEdBQUcsT0FBTyxLQUFLLGlCQUFpQixXQUFXLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxLQUFLLGlCQUFpQixZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQzdHLGVBQU8sR0FBRyxVQUFVLElBQUksTUFBTSxLQUFLLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFBYyxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQzNFO0FBQUEsSUFDRixDQUFDO0FBQ0QsV0FBTyxlQUFlLFdBQVcsT0FBTyxhQUFhO0FBQUEsTUFDbkQsT0FBTztBQUFBLE1BQ1AsVUFBVTtBQUFBLE1BQ1YsY0FBYztBQUFBLElBQ2hCLENBQUM7QUFFRCxVQUFNLFlBQVksQ0FBQztBQUNuQixLQUFDLFNBQVMsVUFBVSxTQUE4QjtBQUNoRCxVQUFJLFNBQVM7QUFDWCxrQkFBVSxRQUFRLEtBQUs7QUFFekIsWUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBSSxPQUFPO0FBQ1QsbUJBQVcsV0FBVyxPQUFPLFFBQVE7QUFDckMsbUJBQVcsV0FBVyxPQUFPLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0YsR0FBRyxJQUFJO0FBQ1AsZUFBVyxXQUFXLGlCQUFpQixRQUFRO0FBQy9DLGVBQVcsV0FBVyxpQkFBaUIsT0FBTztBQUM5QyxXQUFPLGlCQUFpQixXQUFXLE9BQU8sMEJBQTBCLFNBQVMsQ0FBQztBQUc5RSxVQUFNLGNBQWMsYUFDZixlQUFlLGFBQ2YsT0FBTyxVQUFVLGNBQWMsV0FDaEMsVUFBVSxZQUNWO0FBQ0osVUFBTSxXQUFXLFFBQVMsSUFBSSxNQUFNLEVBQUUsT0FBTyxNQUFNLElBQUksRUFBRSxDQUFDLEtBQUssS0FBTTtBQUVyRSxXQUFPLGVBQWUsV0FBVyxRQUFRO0FBQUEsTUFDdkMsT0FBTyxTQUFTLFlBQVksUUFBUSxRQUFRLEdBQUcsSUFBSSxXQUFXO0FBQUEsSUFDaEUsQ0FBQztBQUVELFFBQUksT0FBTztBQUNULFlBQU0sb0JBQW9CLE9BQU8sS0FBSyxnQkFBZ0IsRUFBRSxPQUFPLE9BQUssQ0FBQyxDQUFDLFVBQVUsT0FBTyxlQUFlLFdBQVcsWUFBWSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDcEosVUFBSSxrQkFBa0IsUUFBUTtBQUM1QixpQkFBUSxJQUFJLEdBQUcsVUFBVSxJQUFJLDZCQUE2QixpQkFBaUIsc0JBQXNCO0FBQUEsTUFDbkc7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLGdCQUFnRCxDQUFDLE1BQU0sVUFBVTtBQUFBO0FBQUEsSUFFckUsZ0JBQWdCLE9BQU8sT0FDckIsT0FBTyxTQUFTLFlBQVksUUFBUSxrQkFBa0IsZ0JBQWdCLElBQUksRUFBRSxPQUFPLFFBQVEsSUFDM0YsU0FBUyxnQkFBZ0IsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQy9ELE9BQU8sU0FBUyxhQUFhLEtBQUssT0FBTyxRQUFRLElBQ2pELG1CQUFtQixFQUFFLE9BQU8sSUFBSSxNQUFNLG1DQUFtQyxJQUFJLEVBQUUsQ0FBQztBQUFBO0FBR3BGLFFBQU0sa0JBSUY7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUlBLFdBQVMsVUFBVSxHQUFxRTtBQUN0RixRQUFJLGdCQUFnQixDQUFDO0FBRW5CLGFBQU8sZ0JBQWdCLENBQUM7QUFFMUIsVUFBTSxhQUFhLENBQUMsVUFBaUUsYUFBMEI7QUFDN0csVUFBSSxXQUFXLEtBQUssR0FBRztBQUNyQixpQkFBUyxRQUFRLEtBQUs7QUFDdEIsZ0JBQVEsQ0FBQztBQUFBLE1BQ1g7QUFHQSxVQUFJLENBQUMsV0FBVyxLQUFLLEdBQUc7QUFDdEIsWUFBSSxNQUFNLFVBQVU7QUFDbEI7QUFDQSxpQkFBTyxNQUFNO0FBQUEsUUFDZjtBQUdBLGNBQU0sSUFBSSxZQUNOLFFBQVEsZ0JBQWdCLFdBQXFCLEVBQUUsWUFBWSxDQUFDLElBQzVELFFBQVEsY0FBYyxDQUFDO0FBQzNCLFVBQUUsY0FBYztBQUVoQixtQkFBVyxHQUFHLGFBQWE7QUFDM0Isb0JBQVksR0FBRyxLQUFLO0FBR3BCLFVBQUUsT0FBTyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBRUEsVUFBTSxvQkFBa0QsT0FBTyxPQUFPLFlBQVk7QUFBQSxNQUNoRixPQUFPLE1BQU07QUFBRSxjQUFNLElBQUksTUFBTSxtRkFBbUY7QUFBQSxNQUFFO0FBQUEsTUFDcEg7QUFBQTtBQUFBLE1BQ0EsVUFBVTtBQUFFLGVBQU8sZ0JBQWdCLGFBQWEsRUFBRSxHQUFHLFlBQVksT0FBTyxFQUFFLEdBQUcsQ0FBQztBQUFBLE1BQUk7QUFBQSxJQUNwRixDQUFDO0FBRUQsV0FBTyxlQUFlLFlBQVksT0FBTyxhQUFhO0FBQUEsTUFDcEQsT0FBTztBQUFBLE1BQ1AsVUFBVTtBQUFBLE1BQ1YsY0FBYztBQUFBLElBQ2hCLENBQUM7QUFFRCxXQUFPLGVBQWUsWUFBWSxRQUFRLEVBQUUsT0FBTyxNQUFNLElBQUksSUFBSSxDQUFDO0FBRWxFLFdBQU8sZ0JBQWdCLENBQUMsSUFBSTtBQUFBLEVBQzlCO0FBRUEsT0FBSyxRQUFRLFNBQVM7QUFHdEIsU0FBTztBQUNUO0FBTUEsU0FBUyxnQkFBZ0IsTUFBWTtBQUNuQyxRQUFNLFVBQVUsb0JBQUksUUFBYztBQUNsQyxRQUFNLFdBQW9FLG9CQUFJLFFBQVE7QUFDdEYsV0FBUyxLQUFLLE9BQWlCO0FBQzdCLGVBQVcsUUFBUSxPQUFPO0FBRXhCLFVBQUksQ0FBQyxLQUFLLGFBQWE7QUFDckIsZ0JBQVEsSUFBSSxJQUFJO0FBQ2hCLGFBQUssS0FBSyxVQUFVO0FBRXBCLGNBQU0sYUFBYSxTQUFTLElBQUksSUFBSTtBQUNwQyxZQUFJLFlBQVk7QUFDZCxtQkFBUyxPQUFPLElBQUk7QUFDcEIscUJBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxZQUFZLFFBQVEsRUFBRyxLQUFJO0FBQUUsY0FBRSxLQUFLLElBQUk7QUFBQSxVQUFFLFNBQVMsSUFBSTtBQUM3RSxxQkFBUSxLQUFLLDJDQUEyQyxNQUFNLEdBQUcsUUFBUSxJQUFJLENBQUM7QUFBQSxVQUNoRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGlCQUFpQixDQUFDLGNBQWM7QUFDbEMsY0FBVSxRQUFRLFNBQVUsR0FBRztBQUM3QixVQUFJLEVBQUUsU0FBUyxlQUFlLEVBQUUsYUFBYTtBQUMzQyxhQUFLLEVBQUUsWUFBWTtBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNILENBQUMsRUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLE1BQU0sV0FBVyxLQUFLLENBQUM7QUFFbkQsU0FBTztBQUFBLElBQ0wsSUFBSSxHQUFRO0FBQUUsYUFBTyxRQUFRLElBQUksQ0FBQztBQUFBLElBQUU7QUFBQSxJQUNwQyxJQUFJLEdBQVE7QUFBRSxhQUFPLFFBQVEsSUFBSSxDQUFDO0FBQUEsSUFBRTtBQUFBLElBQ3BDLGtCQUFrQixHQUFTLE1BQWM7QUFDdkMsYUFBTyxTQUFTLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSTtBQUFBLElBQ2xDO0FBQUEsSUFDQSxVQUFVLEdBQVcsTUFBdUIsU0FBOEI7QUFDeEUsVUFBSSxTQUFTO0FBQ1gsVUFBRSxRQUFRLENBQUFDLE9BQUs7QUFDYixnQkFBTUMsT0FBTSxTQUFTLElBQUlELEVBQUMsS0FBSyxvQkFBSSxJQUErQjtBQUNsRSxtQkFBUyxJQUFJQSxJQUFHQyxJQUFHO0FBQ25CLFVBQUFBLEtBQUksSUFBSSxNQUFNLE9BQU87QUFBQSxRQUN2QixDQUFDO0FBQUEsTUFDSCxPQUNLO0FBQ0gsVUFBRSxRQUFRLENBQUFELE9BQUs7QUFDYixnQkFBTUMsT0FBTSxTQUFTLElBQUlELEVBQUM7QUFDMUIsY0FBSUMsTUFBSztBQUNQLFlBQUFBLEtBQUksT0FBTyxJQUFJO0FBQ2YsZ0JBQUksQ0FBQ0EsS0FBSTtBQUNQLHVCQUFTLE9BQU9ELEVBQUM7QUFBQSxVQUNyQjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJ2IiwgImEiLCAicmVzdWx0IiwgImV4IiwgImlyIiwgIm1lcmdlZCIsICJyIiwgImlkIiwgIkR5YW1pY0VsZW1lbnRFcnJvciIsICJ1bmlxdWUiLCAibiIsICJjaGlsZHJlbiIsICJlIiwgIm1hcCJdCn0K
