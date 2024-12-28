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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuY29uc3QgdHJhY2tOb2RlcyA9IFN5bWJvbChcInRyYWNrTm9kZXNcIik7XG5jb25zdCB0cmFja0xlZ2FjeSA9IFN5bWJvbChcIm9uUmVtb3ZhbEZyb21ET01cIik7XG5jb25zdCBhaXVpRXh0ZW5kZWRUYWdTdHlsZXMgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUdcbj8gKChuOiBhbnkpID0+IG4gaW5zdGFuY2VvZiBOb2RlXG4gID8gJ291dGVySFRNTCcgaW4gbiA/IG4ub3V0ZXJIVE1MIDogYCR7bi50ZXh0Q29udGVudH0gJHtuLm5vZGVOYW1lfWBcbiAgOiBTdHJpbmcobikpXG46IChuOiBOb2RlKSA9PiB1bmRlZmluZWQ7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBhbnk+ID0ge30+IHtcbiAgY29tbW9uUHJvcGVydGllcz86IE90aGVyTWVtYmVycyB8IHVuZGVmaW5lZFxuICBkb2N1bWVudD86IERvY3VtZW50XG4gIEVycm9yVGFnPzogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQgJiB7IGVycm9yOiBhbnkgfT5cbiAgLyoqIEBkZXByZWNhdGVkIC0gbGVnYWN5IHN1cHBvcnQgKi9cbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTT86IGJvb2xlYW5cbn1cblxuLyogTWVtYmVycyBhcHBsaWVkIHRvIEVWRVJZIHRhZyBjcmVhdGVkLCBldmVuIGJhc2UgdGFncyAqL1xuaW50ZXJmYWNlIFBvRWxlbWVudE1ldGhvZHMge1xuICBnZXQgaWRzKCk6IHt9ICYgKHVuZGVmaW5lZCB8ICgoYXR0cnM6IG9iamVjdCwgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBSZXR1cm5UeXBlPFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+PikpXG4gIHdoZW48VCBleHRlbmRzIEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzLCBTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM8RXhjbHVkZTxrZXlvZiBUWydpZHMnXSwgbnVtYmVyIHwgc3ltYm9sPj4+KHRoaXM6IFQsIC4uLndoYXQ6IFMpOiBXaGVuUmV0dXJuPFM+O1xuICAvLyBUaGlzIGlzIGEgdmVyeSBpbmNvbXBsZXRlIHR5cGUuIEluIHByYWN0aWNlLCBzZXQoaywgYXR0cnMpIHJlcXVpcmVzIGEgZGVlcGx5IHBhcnRpYWwgc2V0IG9mXG4gIC8vIGF0dHJpYnV0ZXMsIGluIGV4YWN0bHkgdGhlIHNhbWUgd2F5IGFzIGEgVGFnRnVuY3Rpb24ncyBmaXJzdCBvYmplY3QgcGFyYW1ldGVyXG4gIHNldCBhdHRyaWJ1dGVzKGF0dHJzOiBvYmplY3QpO1xuICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXBcbn1cblxuLy8gU3VwcG9ydCBmb3IgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaHRtIChvciBpbXBvcnQgaHRtIGZyb20gJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vaHRtL2Rpc3QvaHRtLm1vZHVsZS5qcycpXG4vLyBOb3RlOiBzYW1lIHNpZ25hdHVyZSBhcyBSZWFjdC5jcmVhdGVFbGVtZW50XG50eXBlIENyZWF0ZUVsZW1lbnROb2RlVHlwZSA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcFxudHlwZSBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPSBDcmVhdGVFbGVtZW50WydjcmVhdGVFbGVtZW50J107XG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUVsZW1lbnQge1xuICAvLyBTdXBwb3J0IGZvciBodG0sIEpTWCwgZXRjXG4gIGNyZWF0ZUVsZW1lbnQ8TiBleHRlbmRzIChDcmVhdGVFbGVtZW50Tm9kZVR5cGUgfCBDcmVhdGVFbGVtZW50RnJhZ21lbnQpPihcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IE4sXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTiBleHRlbmRzIENyZWF0ZUVsZW1lbnRGcmFnbWVudCA/IE5vZGVbXSA6IE5vZGU7XG4gIH1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiAvLyBhYnNlbnQgaW1wbGllcyBub25lIGFyZSBkZWZpbmVkXG4gICAgICApXG5cbiAgICAgIGVnOlxuICAgICAgICB0YWdzKCkgIC8vIHJldHVybnMgVGFnQ3JlYXRvcnMgZm9yIGFsbCBIVE1MIHRhZ3NcbiAgICAgICAgdGFncyhbJ2RpdicsJ2J1dHRvbiddLCB7IG15VGhpbmcoKSB7fSB9KVxuICAgICAgICB0YWdzKCdodHRwOi8vbmFtZXNwYWNlJyxbJ0ZvcmVpZ24nXSwgeyBpc0ZvcmVpZ246IHRydWUgfSlcbiAgKi9cblxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPih0YWdzOiBUYWdzW10pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIG9iamVjdD4obmFtZVNwYWNlOiBudWxsIHwgdW5kZWZpbmVkIHwgJycsIHRhZ3M6IFRhZ3NbXSwgb3B0aW9ucz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gVGFnc106IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudD4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgXCJkbFwiLCBcImR0XCIsIFwiZW1cIiwgXCJlbWJlZFwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLCBcImZvcm1cIiwgXCJoMVwiLCBcImgyXCIsIFwiaDNcIiwgXCJoNFwiLCBcImg1XCIsIFwiaDZcIiwgXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICBcInByb2dyZXNzXCIsIFwicVwiLCBcInJwXCIsIFwicnRcIiwgXCJydWJ5XCIsIFwic1wiLCBcInNhbXBcIiwgXCJzY3JpcHRcIiwgXCJzZWFyY2hcIiwgXCJzZWN0aW9uXCIsIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic291cmNlXCIsIFwic3BhblwiLFxuICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gaWRzSW5hY2Nlc3NpYmxlKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiPGVsdD4uaWRzIGlzIGEgcmVhZC1vbmx5IG1hcCBvZiBFbGVtZW50c1wiKVxufVxuXG4vKiBTeW1ib2xzIHVzZWQgdG8gaG9sZCBJRHMgdGhhdCBjbGFzaCB3aXRoIGZ1bmN0aW9uIHByb3RvdHlwZSBuYW1lcywgc28gdGhhdCB0aGUgUHJveHkgZm9yIGlkcyBjYW4gYmUgbWFkZSBjYWxsYWJsZSAqL1xuY29uc3Qgc2FmZUZ1bmN0aW9uU3ltYm9scyA9IFsuLi5PYmplY3Qua2V5cyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhGdW5jdGlvbi5wcm90b3R5cGUpKV0ucmVkdWNlKChhLGIpID0+IHtcbiAgYVtiXSA9IFN5bWJvbChiKTtcbiAgcmV0dXJuIGE7XG59LHt9IGFzIFJlY29yZDxzdHJpbmcsIHN5bWJvbD4pO1xuZnVuY3Rpb24ga2V5Rm9yKGlkOiBzdHJpbmcgfCBzeW1ib2wpIHsgcmV0dXJuIGlkIGluIHNhZmVGdW5jdGlvblN5bWJvbHMgPyBzYWZlRnVuY3Rpb25TeW1ib2xzW2lkIGFzIGtleW9mIHR5cGVvZiBzYWZlRnVuY3Rpb25TeW1ib2xzXSA6IGlkIH07XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgfHwgeCA9PT0gbnVsbFxuICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiB4ICYmIHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG4vKiB0YWcgKi9cblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyBvYmplY3Rcbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gfCB1bmRlZmluZWRdO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcbiAgY29uc3QgaXNUZXN0RW52ID0gdGhpc0RvYy5kb2N1bWVudFVSSSA9PT0gJ2Fib3V0OnRlc3RpbmcnO1xuICBjb25zdCBEeWFtaWNFbGVtZW50RXJyb3IgPSBvcHRpb25zPy5FcnJvclRhZyB8fCBmdW5jdGlvbiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvciB9OiB7IGVycm9yOiBFcnJvciB8IEl0ZXJhdG9yUmVzdWx0PEVycm9yPiB9KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IudG9TdHJpbmcoKSA6ICdFcnJvcjpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZWROb2RlcyA9IG11dGF0aW9uVHJhY2tlcih0aGlzRG9jKTtcblxuICBmdW5jdGlvbiBEb21Qcm9taXNlQ29udGFpbmVyKGxhYmVsPzogYW55KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChsYWJlbD8gbGFiZWwudG9TdHJpbmcoKSA6REVCVUdcbiAgICAgID8gbmV3IEVycm9yKFwicHJvbWlzZVwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJykgfHwgXCJwcm9taXNlXCJcbiAgICAgIDogXCJwcm9taXNlXCIpXG4gIH1cblxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQoT2JqZWN0LmFzc2lnbih0aGlzRG9jLmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKSwge2lkOiBhaXVpRXh0ZW5kZWRUYWdTdHlsZXN9ICkpO1xuICB9XG5cbiAgLyogUHJvcGVydGllcyBhcHBsaWVkIHRvIGV2ZXJ5IHRhZyB3aGljaCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgcmVmZXJlbmNlLCBzaW1pbGFyIHRvIHByb3RvdHlwZXMgKi9cbiAgY29uc3Qgd2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXM6IFBvRWxlbWVudE1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAge1xuICAgICAgd2hlbjoge1xuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoLi4ud2hhdDogV2hlblBhcmFtZXRlcnMpIHtcbiAgICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQodGhpczogRWxlbWVudCwgYTogb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGEpKSB7XG4gICAgICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICgpID0+IGFpLm5leHQoKS50aGVuKFxuICAgICAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpZHM6IHtcbiAgICAgICAgLy8gLmlkcyBpcyBhIGdldHRlciB0aGF0IHdoZW4gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gbGF6aWx5IGNyZWF0ZXMgYSBQcm94eSB0aGF0IHByb3ZpZGVzIGxpdmUgYWNjZXNzIHRvIGNoaWxkcmVuIGJ5IGlkXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgIGdldCh0aGlzOiBFbGVtZW50KSB7XG4gICAgICAgICAgLy8gTm93IHdlJ3ZlIGJlZW4gYWNjZXNzZWQsIGNyZWF0ZSB0aGUgcHJveHlcbiAgICAgICAgICBjb25zdCBpZFByb3h5ID0gbmV3IFByb3h5KCgoKT0+e30pIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgV2Vha1JlZjxFbGVtZW50Pj4sIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldCwgdGhpc0FyZywgYXJncykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQXJnLmNvbnN0cnVjdG9yLmRlZmluaXRpb24uaWRzW2FyZ3NbMF0uaWRdKC4uLmFyZ3MpXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8ZWx0Pi5pZHMuJHthcmdzPy5bMF0/LmlkfSBpcyBub3QgYSB0YWctY3JlYXRpbmcgZnVuY3Rpb25gLCB7IGNhdXNlOiBleCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnN0cnVjdDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlbGV0ZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldFByb3RvdHlwZU9mOiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXRQcm90b3R5cGVPZigpIHsgcmV0dXJuIG51bGwgfSxcbiAgICAgICAgICAgIGlzRXh0ZW5zaWJsZSgpIHsgcmV0dXJuIGZhbHNlIH0sXG4gICAgICAgICAgICBwcmV2ZW50RXh0ZW5zaW9ucygpIHsgcmV0dXJuIHRydWUgfSxcbiAgICAgICAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleUZvcihwKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFzKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG93bktleXM6ICh0YXJnZXQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaWRzID0gWy4uLnRoaXMucXVlcnlTZWxlY3RvckFsbChgW2lkXWApXS5tYXAoZSA9PiBlLmlkKTtcbiAgICAgICAgICAgICAgY29uc3QgdW5pcXVlID0gWy4uLm5ldyBTZXQoaWRzKV07XG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBpZHMubGVuZ3RoICE9PSB1bmlxdWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnQgaWRzYCwgdW5pcXVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuaXF1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHAsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwayA9IGtleUZvcihwKTtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSd2ZSBjYWNoZWQgdGhpcyBJRCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgaWYgKHBrIGluIHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGVsZW1lbnQgaXMgc3RpbGwgY29udGFpbmVkIHdpdGhpbiB0aGlzIGVsZW1lbnQgd2l0aCB0aGUgc2FtZSBJRFxuICAgICAgICAgICAgICAgICAgY29uc3QgcmVmID0gdGFyZ2V0W3BrXS5kZXJlZigpO1xuICAgICAgICAgICAgICAgICAgaWYgKHJlZiAmJiByZWYuaWQgPT09IHAgJiYgdGhpcy5jb250YWlucyhyZWYpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVmO1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIHRhcmdldFtwa107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBlOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJyMnICsgQ1NTLmVzY2FwZShwKSk7XG4gICAgICAgICAgICAgICAgICBpZiAobmwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMocCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICB3YXJuZWQuYWRkKHApO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnRzIHdpdGggSUQgXCIke3B9XCJgLyosYFxcblxcdCR7bG9nTm9kZSh0aGlzKX1gKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlID0gbmxbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJyMnICsgQ1NTLmVzY2FwZShwKSkgPz8gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZSlcbiAgICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwgcGssIG5ldyBXZWFrUmVmKGUpLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi5hbmQgcmVwbGFjZSB0aGUgZ2V0dGVyIHdpdGggdGhlIFByb3h5XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZHMnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXQoKSB7IHJldHVybiBpZFByb3h5IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLi5hbmQgcmV0dXJuIHRoYXQgZnJvbSB0aGUgZ2V0dGVyLCBzbyBzdWJzZXF1ZW50IHByb3BlcnR5XG4gICAgICAgICAgLy8gYWNjZXNzZXMgZ28gdmlhIHRoZSBQcm94eVxuICAgICAgICAgIHJldHVybiBpZFByb3h5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIGlmIChvcHRpb25zPy5lbmFibGVPblJlbW92ZWRGcm9tRE9NKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsJ29uUmVtb3ZlZEZyb21ET00nLHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgc2V0OiBmdW5jdGlvbihmbj86ICgpPT52b2lkKXtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChbdGhpc10sIHRyYWNrTGVnYWN5LCBmbik7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZW1vdmVkTm9kZXMuZ2V0UmVtb3ZhbEhhbmRsZXIodGhpcywgdHJhY2tMZWdhY3kpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qIEFkZCBhbnkgdXNlciBzdXBwbGllZCBwcm90b3R5cGVzICovXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gKm5vZGVzKC4uLmNoaWxkVGFnczogQ2hpbGRUYWdzW10pOiBJdGVyYWJsZUl0ZXJhdG9yPENoaWxkTm9kZSwgdm9pZCwgdW5rbm93bj4ge1xuICAgIGZ1bmN0aW9uIG5vdFZpYWJsZVRhZyhjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIHJldHVybiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwgfHwgYyA9PT0gSWdub3JlKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYyBvZiBjaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChub3RWaWFibGVUYWcoYykpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICBsZXQgZzogQ2hpbGROb2RlW10gfCB1bmRlZmluZWQgPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYy50aGVuKHJlcGxhY2VtZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICAgIGcgPSBbLi4ubm9kZXMocmVwbGFjZW1lbnQpXTtcbiAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoZywgdHJhY2tOb2RlcywgKCk9PiB7IGcgPSB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGkgPT09IDApXG4gICAgICAgICAgICAgICAgb2xkW2ldLnJlcGxhY2VXaXRoKC4uLmcpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIG9sZFtpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChnKSB5aWVsZCAqZztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB5aWVsZCBjIGFzIENoaWxkTm9kZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1bmt5IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGMpXG4gICAgICAgICAgeWllbGQgKm5vZGVzKGNoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FzeW5jSXRlcjxDaGlsZFRhZ3M+KGMpKSB7XG4gICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICBsZXQgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHRlcm1pbmF0ZVNvdXJjZSA9IChmb3JjZTogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgaWYgKCFhcCB8fCAhcmVwbGFjZW1lbnQubm9kZXMpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBpZiAoZm9yY2UgfHwgcmVwbGFjZW1lbnQubm9kZXMuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMuaGFzKGUpKSkge1xuICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzPy5mb3JFYWNoKGUgPT4gcmVtb3ZlZE5vZGVzLmFkZChlKSk7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiXG4gICAgICAgICAgICAgICsgcmVwbGFjZW1lbnQubm9kZXMubWFwKGxvZ05vZGUpLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICAgICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSB7XG4gICAgICAgICAgbm9kZXM6ICgodW5ib3hlZCA9PT0gYykgPyBbXSA6IFsuLi5ub2Rlcyh1bmJveGVkIC8qIHdlIG5lZWQgdGhpcyBjYXN0IGFzIElzSXRlcmFibGVQcm9wZXJ0eSBkb2Vzbid0ICh5ZXQpIHdvcmsgd2l0aCBhcnJheXMgKi8gYXMgQ2hpbGRUYWdzKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2RlcyEubGVuZ3RoKVxuICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMhLHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGNvbnN0IGRlYnVnVW5tb3VudGVkID0gREVCVUdcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgICAgbGV0IGYgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgZiA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgIGFwLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgYXA/LnRocm93Py4obmV3IEVycm9yKFwiQWxyZWFkeSB0ZXJuaW1hdGVkXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihlID0+IGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHJlcGxhY2VtZW50Lm5vZGVzIDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgbW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIXRlcm1pbmF0ZVNvdXJjZSghbi5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWdVbm1vdW50ZWQ/LigpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbLi4ubm9kZXModW5ib3goZXMudmFsdWUpKV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaTxuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaT09PTApXG4gICAgICAgICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQubm9kZXMpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKG5baV0pKVxuICAgICAgICAgICAgICAgICAgICBuW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChuW2ldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnQubm9kZXM/LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgaWYgKG4/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlPy52YWx1ZSA/PyBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgcmVwbGFjZW1lbnQubm9kZXM/Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KSgpO1xuXG4gICAgICAgIGlmIChyZXBsYWNlbWVudC5ub2RlcykgeWllbGQqIHJlcGxhY2VtZW50O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgeWllbGQgdGhpc0RvYy5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXMuIFByb3BldHk6ICcke2t9JyB2YWx1ZTogJHtsb2dOb2RlKHZhbHVlKX0gZGVzdGluYXRpb246ICR7ZCBpbnN0YW5jZW9mIE5vZGUgPyBsb2dOb2RlKGQpIDogZH1gKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5ib3g8VD4oYTogVCk6IFQge1xuICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIChBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsIHVuYm94KSA6IHYpIGFzIFQ7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KGEgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXQgPSBpc1Rlc3RFbnYgfHwgIShkIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgKGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgICA/IChrOiBzdHJpbmcsIHY6IGFueSkgPT4geyBkW2tdID0gdiB9XG4gICAgICAgICAgOiAoazogc3RyaW5nLCB2OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmICgodiA9PT0gbnVsbCB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICYmICghKGsgaW4gZCkgfHwgdHlwZW9mIGRbayBhcyBrZXlvZiB0eXBlb2YgZF0gIT09ICdzdHJpbmcnKSlcbiAgICAgICAgICAgICAgZC5zZXRBdHRyaWJ1dGUoayA9PT0gJ2NsYXNzTmFtZScgPyAnY2xhc3MnIDogaywgU3RyaW5nKHYpKTtcbiAgICAgICAgICAgIGVsc2UgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBkW2tdID0gdjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHYsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQoaywgdik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBjb25zb2xlLmxvZyhgRXhjZXB0aW9uIGluIHByb21pc2VkIGF0dHJpYnV0ZSAnJHtrfSdgLCBlcnJvciwgbG9nTm9kZShkKSkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzZXQoaywgc1trXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUoaXRlcjogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IoaXRlcik7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICAgIGxldCBtb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIG1vdW50ZWQgPSBtb3VudGVkIHx8IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYnV0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIihub2RlIHJlbW92ZWQpXCIpO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiAhbW91bnRlZCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyb3JWYWx1ZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSB0ZXJtaW5hdGlvblwiLCBlcnJvclZhbHVlLCBrLCBsb2dOb2RlKGQpLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1bmJveGVkID0gaXRlci52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSBpdGVyICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFtiYXNlXSwgaywgKCkgPT4gYXAucmV0dXJuPy4oKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtiYXNlIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoYmFzZSkgOiBiYXNlfWApO1xuICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2V0KGssIGNvcHkpO1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LCBfb3ZlcnJpZGVzLCBpbnN0YW5jZSlcbiAgICAgIDogX292ZXJyaWRlc1xuXG4gICAgY29uc3QgdW5pcXVlVGFnSUQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIChpZENvdW50KyspLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGNvbnN0IHN0YXRpY0V4dGVuc2lvbnM6IE92ZXJyaWRlcyA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgIC8qIFwiU3RhdGljYWxseVwiIGNyZWF0ZSBhbnkgc3R5bGVzIHJlcXVpcmVkIGJ5IHRoaXMgd2lkZ2V0ICovXG4gICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhaXVpRXh0ZW5kZWRUYWdTdHlsZXMpPy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgIGNvbnN0IG5ld0NhbGxTdGFjazogKENvbnN0cnVjdGVkICYgT3ZlcnJpZGVzKVtdID0gW107XG4gICAgICBjb25zdCBjb21iaW5lZEF0dHJzID0geyBbY2FsbFN0YWNrU3ltYm9sXTogKG5vQXR0cnMgPyBuZXdDYWxsU3RhY2sgOiBhdHRyc1tjYWxsU3RhY2tTeW1ib2xdKSA/PyBuZXdDYWxsU3RhY2sgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBjb25zdCBpc0FuY2VzdHJhbCA9IChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYga2V5IGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoayA9PiAoayBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGsgPT4gIShrIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBrIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZUVsZW1lbnQ6IENyZWF0ZUVsZW1lbnRbJ2NyZWF0ZUVsZW1lbnQnXSA9IChuYW1lLCBhdHRycywgLi4uY2hpbGRyZW4pID0+XG4gICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICBuYW1lIGluc3RhbmNlb2YgTm9kZSA/IG5hbWVcbiAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/IGJhc2VUYWdDcmVhdG9yc1tuYW1lXShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IFsuLi5ub2RlcyguLi5jaGlsZHJlbildXG4gICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgIDogRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSkgfSlcblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUpIHtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGNvbnN0IHJlbW92YWxzOiBXZWFrTWFwPE5vZGUsIE1hcDxTeW1ib2wgfCBzdHJpbmcsICh0aGlzOiBOb2RlKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgeF0gb2YgcmVtb3ZhbFNldD8uZW50cmllcygpKSB0cnkgeyB4LmNhbGwobm9kZSkgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIklnbm9yZWQgZXhjZXB0aW9uIGhhbmRsaW5nIG5vZGUgcmVtb3ZhbFwiLCBuYW1lLCB4LCBsb2dOb2RlKG5vZGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgIHdhbGsobS5yZW1vdmVkTm9kZXMpXG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXMoZTpOb2RlKSB7IHJldHVybiB0cmFja2VkLmhhcyhlKSB9LFxuICAgIGFkZChlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuYWRkKGUpIH0sXG4gICAgZ2V0UmVtb3ZhbEhhbmRsZXIoZTogTm9kZSwgbmFtZTogU3ltYm9sKSB7XG4gICAgICByZXR1cm4gcmVtb3ZhbHMuZ2V0KGUpPy5nZXQobmFtZSk7XG4gICAgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBTeW1ib2wgfCBzdHJpbmcsIGhhbmRsZXI/OiAodGhpczogTm9kZSk9PnZvaWQpIHtcbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSkgPz8gbmV3IE1hcDxTeW1ib2wgfCBzdHJpbmcsICgpPT52b2lkPigpO1xuICAgICAgICAgIHJlbW92YWxzLnNldChlLCBtYXApO1xuICAgICAgICAgIG1hcC5zZXQobmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSk7XG4gICAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWFwLnNpemUpXG4gICAgICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgQm9vbGVhbihnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuaW5mbygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5jb25zdCBkZWJ1Z0lkID0gU3ltYm9sKFwiZGVmZXJyZWRQcm9taXNlSURcIik7XG5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xuICBbZGVidWdJZF0/OiBudW1iZXJcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xubGV0IGlkID0gMTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBwcm9taXNlW2RlYnVnSWRdID0gaWQrKztcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gZG9lcyBhIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nLCBfZXhjZXB0XyBhIGZ1bmN0aW9uXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKVxuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfVxuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfVxuLy9leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBUICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VD4+XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gVGhpcyBpcyBwYXRjaCB0byB0aGUgc3RkIGxpYiBkZWZpbml0aW9uIG9mIEFycmF5PFQ+LiBJIGRvbid0IGtub3cgd2h5IGl0J3MgYWJzZW50LFxuICAvLyBhcyB0aGlzIGlzIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBhbGwgSmF2YVNjcmlwdCBlbmdpbmVzLiBJdCBpcyBwcm9iYWJseSBhIHJlc3VsdFxuICAvLyBvZiBpdHMgYWJzZW5jZSBpbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS92YWx1ZXMsXG4gIC8vIHdoaWNoIGluaGVyaXRzIGZyb20gdGhlIE9iamVjdC5wcm90b3R5cGUsIHdoaWNoIG1ha2VzIG5vIGNsYWltIGZvciB0aGUgcmV0dXJuIHR5cGVcbiAgLy8gc2luY2UgaXQgY291bGQgYmUgb3ZlcnJpZGRlbS4gSG93ZXZlciwgaW4gdGhhdCBjYXNlLCBhIFRTIGRlZm4gc2hvdWxkIGFsc28gb3ZlcnJpZGUgaXRcbiAgLy8gbGlrZSBOdW1iZXIsIFN0cmluZywgQm9vbGVhbiBldGMgZG8uXG4gIGludGVyZmFjZSBBcnJheTxUPiB7XG4gICAgdmFsdWVPZigpOiBBcnJheTxUPjtcbiAgfVxuICAvLyBBcyBhYm92ZSwgdGhlIHJldHVybiB0eXBlIGNvdWxkIGJlIFQgcmF0aGVyIHRoYW4gT2JqZWN0LCBzaW5jZSB0aGlzIGlzIHRoZSBkZWZhdWx0IGltcGwsXG4gIC8vIGJ1dCBpdCdzIG5vdCwgZm9yIHNvbWUgcmVhc29uLlxuICBpbnRlcmZhY2UgT2JqZWN0IHtcbiAgICB2YWx1ZU9mPFQ+KHRoaXM6IFQpOiBJc0l0ZXJhYmxlUHJvcGVydHk8VCwgT2JqZWN0PjtcbiAgfVxufVxuXG4vKlxuICAgICAgQmVjYXVzZSBUUyBkb2Vzbid0IGltcGxlbWVudCBzZXBhcmF0ZSB0eXBlcyBmb3IgcmVhZC93cml0ZSwgb3IgY29tcHV0ZWQgZ2V0dGVyL3NldHRlciBuYW1lcyAod2hpY2ggRE8gYWxsb3dcbiAgICAgIGRpZmZlcmVudCB0eXBlcyBmb3IgYXNzaWdubWVudCBhbmQgZXZhbHVhdGlvbiksIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBkZWZpbmUgdHlwZSBmb3IgYXJyYXkgbWVtYmVycyB0aGF0IHBlcm1pdFxuICAgICAgZGVyZWZlcmVuY2luZyBvZiBub24tY2xhc2hpbmggYXJyYXkga2V5cyBzdWNoIGFzIGBqb2luYCBvciBgc29ydGAgYW5kIEFzeW5jSXRlcmF0b3IgbWV0aG9kcyB3aGljaCBhbHNvIGFsbG93c1xuICAgICAgc2ltcGxlIGFzc2lnbm1lbnQgb2YgdGhlIGZvcm0gYHRoaXMuaXRlcmFibGVBcnJheU1lbWJlciA9IFsuLi5dYC5cblxuICAgICAgVGhlIENPUlJFQ1QgdHlwZSBmb3IgdGhlc2UgZmllbGRzIHdvdWxkIGJlIChpZiBUUyBoYWQgc3ludGF4IGZvciBpdCk6XG4gICAgICBnZXQgW0tdICgpOiBPbWl0PEFycmF5PEUgJiBBc3luY0V4dHJhSXRlcmFibGU8RT4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgc2V0IFtLXSAoKTogQXJyYXk8RT4gfCBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuKi9cbnR5cGUgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzID0ga2V5b2YgQXJyYXk8YW55PiAmIGtleW9mIEFzeW5jSXRlcmFibGVIZWxwZXJzXG5cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFtUXSBleHRlbmRzIFtpbmZlciBVXSA/IFUgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxVPj4gOiBuZXZlcjtcblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPFQ+ID0gW1RdIGV4dGVuZHMgW2luZmVyIElQXSA/XG4gIFtJUF0gZXh0ZW5kcyBbUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8dW5rbm93bj4+XSA/IElQXG4gIDogW0lQXSBleHRlbmRzIFtvYmplY3RdID8gSVAgZXh0ZW5kcyBBcnJheTxpbmZlciBFPiA/IE9taXQ8QXJyYXk8SXRlcmFibGVQcm9wZXJ0aWVzPEU+PiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPElQPj4gOiB7XG4gICAgW0sgaW4ga2V5b2YgSVBdOiBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+XG4gIH0gJiBJdGVyYWJsZVR5cGU8SVA+XG4gIDogSXRlcmFibGVUeXBlPElQPlxuICA6IG5ldmVyO1xuXG5leHBvcnQgdHlwZSBJc0l0ZXJhYmxlUHJvcGVydHk8USwgUiA9IG5ldmVyPiA9IFtRXSBleHRlbmRzIFtQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxpbmZlciBWPj5dID8gViA6IFJcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5jb25zdCBpdGVyYXRvckNhbGxTaXRlID0gU3ltYm9sKFwiSXRlcmF0b3JDYWxsU2l0ZVwiKTtcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbjxEIGV4dGVuZHMgb2JqZWN0LCBTIGV4dGVuZHMgb2JqZWN0PihkOiBELCBzOiBTKSB7XG4gIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocyksIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyldO1xuICBmb3IgKGNvbnN0IGsgb2Yga2V5cykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCB7IC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocywgayksIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICB9XG4gIGlmIChERUJVRykge1xuICAgIGlmICghKGl0ZXJhdG9yQ2FsbFNpdGUgaW4gZCkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBpdGVyYXRvckNhbGxTaXRlLCB7IHZhbHVlOiBuZXcgRXJyb3IoKS5zdGFjayB9KVxuICB9XG4gIHJldHVybiBkIGFzIEQgJiBTO1xufVxuXG5jb25zdCBfcGVuZGluZyA9IFN5bWJvbCgncGVuZGluZycpO1xuY29uc3QgX2l0ZW1zID0gU3ltYm9sKCdpdGVtcycpO1xuZnVuY3Rpb24gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSB7XG4gICAgW19wZW5kaW5nXTogW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbCxcbiAgICBbX2l0ZW1zXTogW10gYXMgSXRlcmF0b3JSZXN1bHQ8VD5bXSB8IG51bGwsXG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHEgYXMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKHFbX2l0ZW1zXT8ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocVtfaXRlbXNdLnNoaWZ0KCkhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBxW19wZW5kaW5nXS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiB1bmtub3duKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgdGhyb3coLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlamVjdCh2YWx1ZS52YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbX2l0ZW1zXS5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBfaW5mbGlnaHQgPSBTeW1ib2woJ2luZmxpZ2h0Jyk7XG5mdW5jdGlvbiBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+PiAmIHsgW19pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW19pbmZsaWdodF0gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgcS5wdXNoID0gZnVuY3Rpb24gKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERlYm91bmNlXG4gICAgaWYgKHFbX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICBxW19pbmZsaWdodF0uYWRkKHZhbHVlKTtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdi52YWx1ZSA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyBvYmplY3QsIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTogZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGFzICh0eXBlb2YgYXN5bmNFeHRyYXMpW01dXG4gICAgfVttZXRob2RdO1xuICB9XG5cbiAgY29uc3QgZXh0cmFzID0geyBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiBpbml0SXRlcmF0b3IgfSBhcyBBc3luY0V4dHJhSXRlcmFibGU8Vj4gJiB7IFtJdGVyYWJpbGl0eV0/OiAnc2hhbGxvdycgfTtcbiAgZXh0cmFLZXlzLmZvckVhY2goKGspID0+IC8vIEB0cy1pZ25vcmVcbiAgICBleHRyYXNba10gPSBsYXp5QXN5bmNNZXRob2QoaykpXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2ICYmIHZbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpIHtcbiAgICBleHRyYXNbSXRlcmFiaWxpdHldID0gdltJdGVyYWJpbGl0eV07XG4gIH1cblxuICAvLyBMYXppbHkgaW5pdGlhbGl6ZSBgcHVzaGBcbiAgbGV0IHB1c2g6IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+WydwdXNoJ10gPSAodjogVikgPT4ge1xuICAgIGluaXRJdGVyYXRvcigpOyAvLyBVcGRhdGVzIGBwdXNoYCB0byByZWZlcmVuY2UgdGhlIG11bHRpLXF1ZXVlXG4gICAgcmV0dXJuIHB1c2godik7XG4gIH1cblxuICBsZXQgYSA9IGJveCh2LCBleHRyYXMpO1xuICBsZXQgcGlwZWQ6IEFzeW5jSXRlcmFibGU8Vj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgIGdldCgpOiBWIHsgcmV0dXJuIGEgfSxcbiAgICBzZXQodjogViB8IEFzeW5jRXh0cmFJdGVyYWJsZTxWPikge1xuICAgICAgaWYgKHYgIT09IGEpIHtcbiAgICAgICAgaWYgKGlzQXN5bmNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgIC8vIEFzc2lnbmluZyBtdWx0aXBsZSBhc3luYyBpdGVyYXRvcnMgdG8gYSBzaW5nbGUgaXRlcmFibGUgaXMgcHJvYmFibHkgYVxuICAgICAgICAgIC8vIGJhZCBpZGVhIGZyb20gYSByZWFzb25pbmcgcG9pbnQgb2YgdmlldywgYW5kIG11bHRpcGxlIGltcGxlbWVudGF0aW9uc1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZTpcbiAgICAgICAgICAvLyAgKiBtZXJnZT9cbiAgICAgICAgICAvLyAgKiBpZ25vcmUgc3Vic2VxdWVudCBhc3NpZ25tZW50cz9cbiAgICAgICAgICAvLyAgKiB0ZXJtaW5hdGUgdGhlIGZpcnN0IHRoZW4gY29uc3VtZSB0aGUgc2Vjb25kP1xuICAgICAgICAgIC8vIFRoZSBzb2x1dGlvbiBoZXJlIChvbmUgb2YgbWFueSBwb3NzaWJpbGl0aWVzKSBpcyB0aGUgbGV0dGVyOiBvbmx5IHRvIGFsbG93XG4gICAgICAgICAgLy8gbW9zdCByZWNlbnQgYXNzaWdubWVudCB0byB3b3JrLCB0ZXJtaW5hdGluZyBhbnkgcHJlY2VlZGluZyBpdGVyYXRvciB3aGVuIGl0IG5leHRcbiAgICAgICAgICAvLyB5aWVsZHMgYW5kIGZpbmRzIHRoaXMgY29uc3VtZXIgaGFzIGJlZW4gcmUtYXNzaWduZWQuXG5cbiAgICAgICAgICAvLyBJZiB0aGUgaXRlcmF0b3IgaGFzIGJlZW4gcmVhc3NpZ25lZCB3aXRoIG5vIGNoYW5nZSwganVzdCBpZ25vcmUgaXQsIGFzIHdlJ3JlIGFscmVhZHkgY29uc3VtaW5nIGl0XG4gICAgICAgICAgaWYgKHBpcGVkID09PSB2KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgcGlwZWQgPSB2O1xuICAgICAgICAgIGxldCBzdGFjayA9IERFQlVHID8gbmV3IEVycm9yKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiBhc3NpZ25lZCB0byBjb25zdW1lIGFub3RoZXIgaXRlcmF0b3IuIERpZCB5b3UgbWVhbiB0byBkZWNsYXJlIGl0P2ApKTtcbiAgICAgICAgICBjb25zdW1lLmNhbGwodiwgeSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAsIHsgY2F1c2U6IHN0YWNrIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHVzaCh5Py52YWx1ZU9mKCkgYXMgVilcbiAgICAgICAgICB9KS5jYXRjaChleCA9PiBjb25zb2xlLmluZm8oZXgpKVxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LFxuICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfVxuICAgICAgfSksIHBkcyk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdChhKSwgT2JqZWN0LmFzc2lnbihwZHMsIHtcbiAgICAgICAgICB0b0pTT04oKSB7IHJldHVybiBhLnZhbHVlT2YoKSB9XG4gICAgICAgIH0pKTtcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8vIFdlIGJveCBvYmplY3RzIGJ5IGNyZWF0aW5nIGEgUHJveHkgZm9yIHRoZSBvYmplY3QgdGhhdCBwdXNoZXMgb24gZ2V0L3NldC9kZWxldGUsIGFuZCBtYXBzIHRoZSBzdXBwbGllZCBhc3luYyBpdGVyYXRvciB0byBwdXNoIHRoZSBzcGVjaWZpZWQga2V5XG4gICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAvLyBoYW5kbGUgdGhlIGdldC9zZXQvc2VsZXRlIGluIHBsYWNlIG9mIHRoZSB1c3VhbCBwcmltaXRpdmUgYm94aW5nIHZpYSBPYmplY3QocHJpbWl0aXZlVmFsdWUpXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB8IG51bGwgfSB9O1xuICB0eXBlIFBvc3NpYmx5V2l0aFBhdGggPSBWIHwgV2l0aFBhdGg7XG4gIGZ1bmN0aW9uIGlzUHJveGllZEFzeW5jSXRlcmF0b3IobzogUG9zc2libHlXaXRoUGF0aCk6IG8gaXMgV2l0aFBhdGgge1xuICAgIHJldHVybiBpc09iamVjdExpa2UobykgJiYgX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIG87XG4gIH1cbiAgZnVuY3Rpb24gZGVzdHJ1Y3R1cmUobzogYW55LCBwYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmaWVsZHMgPSBwYXRoLnNwbGl0KCcuJykuc2xpY2UoMSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoICYmICgobyA9IG8/LltmaWVsZHNbaV1dKSAhPT0gdW5kZWZpbmVkKTsgaSsrKTtcbiAgICByZXR1cm4gbztcbiAgfVxuICBmdW5jdGlvbiBib3hPYmplY3QoYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8UG9zc2libHlXaXRoUGF0aD4pIHtcbiAgICBsZXQgd2l0aFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxXaXRoUGF0aFt0eXBlb2YgX3Byb3hpZWRBc3luY0l0ZXJhdG9yXT47XG4gICAgbGV0IHdpdGhvdXRQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG4gICAgcmV0dXJuIG5ldyBQcm94eShhIGFzIG9iamVjdCwgaGFuZGxlcigpKSBhcyBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihwYXRoID0gJycpOiBQcm94eUhhbmRsZXI8b2JqZWN0PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBBIGJveGVkIG9iamVjdCBoYXMgaXRzIG93biBrZXlzLCBhbmQgdGhlIGtleXMgb2YgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlXG4gICAgICAgIGhhcyh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIHJldHVybiBrZXkgPT09IF9wcm94aWVkQXN5bmNJdGVyYXRvciB8fCBrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSB8fCBrZXkgaW4gdGFyZ2V0IHx8IGtleSBpbiBwZHM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gYSBrZXkgaXMgc2V0IGluIHRoZSB0YXJnZXQsIHB1c2ggdGhlIGNoYW5nZVxuICAgICAgICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0ICR7bmFtZS50b1N0cmluZygpfSR7cGF0aH0uJHtrZXkudG9TdHJpbmcoKX0gYXMgaXQgaXMgcGFydCBvZiBhc3luY0l0ZXJhdG9yYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICBpZiAoUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBnZXR0aW5nIHRoZSB2YWx1ZSBvZiBhIGJveGVkIG9iamVjdCBtZW1iZXIsIHByZWZlciBhc3luY0V4dHJhSXRlcmFibGUgb3ZlciB0YXJnZXQga2V5c1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhbiBhc3luY0V4dHJhSXRlcmFibGUgbWVtYmVyLCBjcmVhdGUgdGhlIG1hcHBlZCBxdWV1ZSB0byBnZW5lcmF0ZSBpdFxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICB3aXRob3V0UGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHdpdGhvdXRQYXRoW2tleSBhcyBrZXlvZiB0eXBlb2YgcGRzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdpdGhQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0gOiB7IGE6IG8sIHBhdGg6IG51bGwgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aCA9PT0gbnVsbCB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmU7XG4gICAgICAgICAgICAgIH0sIElnbm9yZSwgZGVzdHJ1Y3R1cmUoYSwgcGF0aCkpO1xuICAgICAgICAgICAgICByZXR1cm4gYWlba2V5IGFzIGtleW9mIHR5cGVvZiBhaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhIHRhcmdldCBwcm9wZXJ0eSwgY3JlYXRlIHRoZSBwcm94eSB0byBoYW5kbGUgaXRcbiAgICAgICAgICBpZiAoa2V5ID09PSAndmFsdWVPZicpIHJldHVybiAoKSA9PiBkZXN0cnVjdHVyZShhLCBwYXRoKTtcbiAgICAgICAgICBpZiAoa2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUpIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSwgc2luY2UgU3ltYm9sLnRvUHJpbWl0aXZlIGlzIGluIGhhKCksIHdlIG5lZWQgdG8gaW1wbGVtZW50IGl0XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGhpbnQ/OiAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgIGlmIChSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCB0YXJnZXQpLmNhbGwodGFyZ2V0LCBoaW50KTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gdGFyZ2V0LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnbnVtYmVyJykgcmV0dXJuIE51bWJlcih0YXJnZXQpO1xuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoKCEoa2V5IGluIHRhcmdldCkgfHwgT2JqZWN0Lmhhc093bih0YXJnZXQsIGtleSkpICYmICEoSXRlcmFiaWxpdHkgaW4gdGFyZ2V0ICYmIHRhcmdldFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBmaWVsZCA9PT0gJ2Z1bmN0aW9uJykgfHwgaXNBc3luY0l0ZXIoZmllbGQpXG4gICAgICAgICAgICAgICAgPyBmaWVsZFxuICAgICAgICAgICAgICAgIDogbmV3IFByb3h5KE9iamVjdChmaWVsZCksIGhhbmRsZXIocGF0aCArICcuJyArIGtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaGlzIGlzIGEgc3ltYm9saWMgZW50cnksIG9yIGEgcHJvdG90eXBpY2FsIHZhbHVlIChzaW5jZSBpdCdzIGluIHRoZSB0YXJnZXQsIGJ1dCBub3QgYSB0YXJnZXQgcHJvcGVydHkpXG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLypcbiAgRXh0ZW5zaW9ucyB0byB0aGUgQXN5bmNJdGVyYWJsZTpcbiovXG4vL2NvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG5cbi8qIE1lcmdlIGFzeW5jSXRlcmFibGVzIGludG8gYSBzaW5nbGUgYXN5bmNJdGVyYWJsZSAqL1xuXG4vKiBUUyBoYWNrIHRvIGV4cG9zZSB0aGUgcmV0dXJuIEFzeW5jR2VuZXJhdG9yIGEgZ2VuZXJhdG9yIG9mIHRoZSB1bmlvbiBvZiB0aGUgbWVyZ2VkIHR5cGVzICovXG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+ID0gVFtdIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGluZmVyIFU+PltdID8gVSA6IG5ldmVyO1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8VD4gPSBBc3luY0l0ZXJhYmxlPENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+PjtcblxuZXhwb3J0IGNvbnN0IG1lcmdlID0gPEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4+W10sIFRZaWVsZCwgVFJldHVybiwgVE5leHQ+KC4uLmFpOiBBKSA9PiB7XG4gIGNvbnN0IGl0ID0gbmV3IE1hcDxudW1iZXIsICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pPigpO1xuICBjb25zdCBwcm9taXNlcyA9IG5ldyBNYXA8bnVtYmVyLFByb21pc2U8eyBrZXk6IG51bWJlciwgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+PigpO1xuXG4gIGxldCBpbml0ID0gKCkgPT4ge1xuICAgIGluaXQgPSAoKSA9PiB7IH1cbiAgICBmb3IgKGxldCBuID0gMDsgbiA8IGFpLmxlbmd0aDsgbisrKSB7XG4gICAgICBjb25zdCBhID0gYWlbbl0gYXMgQXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0PjtcbiAgICAgIGNvbnN0IGl0ZXIgPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+O1xuICAgICAgaXQuc2V0KG4sIGl0ZXIpO1xuICAgICAgcHJvbWlzZXMuc2V0KG4sIGl0ZXIubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGtleTogbiwgcmVzdWx0IH0pKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBjb25zdCBtZXJnZWQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxBW251bWJlcl0+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBtZXJnZWQgfSxcbiAgICBuZXh0KCkge1xuICAgICAgaW5pdCgpO1xuICAgICAgcmV0dXJuIHByb21pc2VzLnNpemVcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMudmFsdWVzKCkpLnRoZW4oKHsga2V5LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBpdC5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlcy5zZXQoa2V5LFxuICAgICAgICAgICAgICBpdC5oYXMoa2V5KVxuICAgICAgICAgICAgICAgID8gaXQuZ2V0KGtleSkhLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBrZXksIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsga2V5LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0gfSkpXG4gICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBrZXksIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgICAgLy8gYGV4YCBpcyB0aGUgdW5kZXJseWluZyBhc3luYyBpdGVyYXRpb24gZXhjZXB0aW9uXG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93IShleCkgLy8gPz8gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgZXhjZXB0aW9uXCIpIH0pO1xuICAgICAgICB9KVxuICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgcmV0dXJuKHIpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGl0LmtleXMoKSkge1xuICAgICAgICBpZiAocHJvbWlzZXMuaGFzKGtleSkpIHtcbiAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICByZXN1bHRzW2tleV0gPSBhd2FpdCBpdC5nZXQoa2V5KT8ucmV0dXJuPy4oeyBkb25lOiB0cnVlLCB2YWx1ZTogciB9KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH0sXG4gICAgYXN5bmMgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgaXQua2V5cygpKSB7XG4gICAgICAgIGlmIChwcm9taXNlcy5oYXMoa2V5KSkge1xuICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGF3YWl0IGl0LmdldChrZXkpPy50aHJvdz8uKGV4KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGNvbnN0IHNpID0gbmV3IE1hcDxzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIEFzeW5jSXRlcmF0b3I8YW55Pj4oKTtcbiAgbGV0IHBjOiBNYXA8c3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCBQcm9taXNlPHsgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55PiB9Pj47IC8vIEluaXRpYWxpemVkIGxhemlseVxuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLCBzaXRdKSA9PiB7XG4gICAgICAgICAgc2kuc2V0KGssIHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCkpO1xuICAgICAgICAgIHJldHVybiBbaywgc2kuZ2V0KGspIS5uZXh0KCkudGhlbihpciA9PiAoeyBzaSwgaywgaXIgfSkpXTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYy52YWx1ZXMoKSkudGhlbigoeyBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjLmRlbGV0ZShrKTtcbiAgICAgICAgICAgIHNpLmRlbGV0ZShrKTtcbiAgICAgICAgICAgIGlmICghcGMuc2l6ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjLnNldChrLCBzaS5nZXQoaykhLm5leHQoKS50aGVuKGlyID0+ICh7IGssIGlyIH0pKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgZm9yIChjb25zdCBhaSBvZiBzaS52YWx1ZXMoKSkge1xuICAgICAgICAgIGFpLnJldHVybj8uKHYpXG4gICAgICB9O1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChjb25zdCBhaSBvZiBzaS52YWx1ZXMoKSlcbiAgICAgICAgYWkudGhyb3c/LihleClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBhc3NpZ25IaWRkZW4oYWksIGFzeW5jRXh0cmFzKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBc3luY0V4dHJhSXRlcmFibGU8VD4gJiBBIDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczogUGFyYW1ldGVyczxHPik6IFJldHVyblR5cGU8Rz4ge1xuICAgIGNvbnN0IGFpID0gZyguLi5hcmdzKTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFpKSBhcyBSZXR1cm5UeXBlPEc+O1xuICB9IGFzICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KSA9PiBSZXR1cm5UeXBlPEc+ICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFJldHVyblR5cGU8Rz4gZXh0ZW5kcyBBc3luY0dlbmVyYXRvcjxpbmZlciBUPiA/IFQgOiB1bmtub3duPlxufVxuXG4vKiBBc3luY0l0ZXJhYmxlIGhlbHBlcnMsIHdoaWNoIGNhbiBiZSBhdHRhY2hlZCB0byBhbiBBc3luY0l0ZXJhdG9yIHdpdGggYHdpdGhIZWxwZXJzKGFpKWAsIGFuZCBpbnZva2VkIGRpcmVjdGx5IGZvciBmb3JlaWduIGFzeW5jSXRlcmF0b3JzICovXG5cbi8qIHR5cGVzIHRoYXQgYWNjZXB0IFBhcnRpYWxzIGFzIHBvdGVudGlhbGx1IGFzeW5jIGl0ZXJhdG9ycywgc2luY2Ugd2UgcGVybWl0IHRoaXMgSU4gVFlQSU5HIHNvXG4gIGl0ZXJhYmxlIHByb3BlcnRpZXMgZG9uJ3QgY29tcGxhaW4gb24gZXZlcnkgYWNjZXNzIGFzIHRoZXkgYXJlIGRlY2xhcmVkIGFzIFYgJiBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8Vj4+XG4gIGR1ZSB0byB0aGUgc2V0dGVycyBhbmQgZ2V0dGVycyBoYXZpbmcgZGlmZmVyZW50IHR5cGVzLCBidXQgdW5kZWNsYXJhYmxlIGluIFRTIGR1ZSB0byBzeW50YXggbGltaXRhdGlvbnMgKi9cbnR5cGUgSGVscGVyQXN5bmNJdGVyYWJsZTxRIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+PiA9IEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8UT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT47XG50eXBlIEhlbHBlckFzeW5jSXRlcmF0b3I8Rj4gPVxuICBGIGV4dGVuZHMgKCkgPT4gQXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WiwgUj4odjogTWF5YmVQcm9taXNlZDxaPiwgdGhlbjogKHY6IFopID0+IFIsIGV4Y2VwdDogKHg6IGFueSkgPT4gYW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbiwgZXhjZXB0KTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdGhlbih2KVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldHVybiBleGNlcHQoZXgpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4sXG4gIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmUsXG4gIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCl7XG4gICAgLy8gQHRzLWlnbm9yZSAtIHJlbW92ZSByZWZlcmVuY2VzIGZvciBHQ1xuICAgIGFpID0gZmFpID0gbnVsbDtcbiAgICBwcmV2ID0gSWdub3JlO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cbiAgbGV0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyAocHJldiA9IElnbm9yZSwgcmVzb2x2ZShwKSlcbiAgICAgICAgICAgIDogcmVzb2x2ZVN5bmMoZm4ocC52YWx1ZSwgcHJldiksXG4gICAgICAgICAgICAgIGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgPyBzdGVwKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLFxuICAgICAgICAgICAgICBleCA9PiB7XG4gICAgICAgICAgICAgICAgcHJldiA9IElnbm9yZTsgLy8gUmVtb3ZlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZVJlc3BvbnNlID0gYWkudGhyb3c/LihleCkgPz8gYWkucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgICAgIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIChhaSkgYW5kIGNvbnN1bWVyIChyZWplY3QpXG4gICAgICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlUmVzcG9uc2UpKSBzb3VyY2VSZXNwb25zZS50aGVuKHJlamVjdCxyZWplY3QpO1xuICAgICAgICAgICAgICAgIGVsc2UgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgLy8gVGhlIHNvdXJjZSB0aHJldy4gVGVsbCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgICB9XG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgY29uc3Qgc291cmNlUmVzcG9uc2UgPSBhaS50aHJvdz8uKGV4KSA/PyBhaS5yZXR1cm4/LihleCk7XG4gICAgICAgICAgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgKGFpKSBhbmQgY29uc3VtZXIgKHJlamVjdClcbiAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShzb3VyY2VSZXNwb25zZSkpIHNvdXJjZVJlc3BvbnNlLnRoZW4ocmVqZWN0LCByZWplY3QpO1xuICAgICAgICAgIGVsc2UgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHNvdXJjZVJlc3BvbnNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdz8uKGV4KSA/PyBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgfVxuICB9O1xuICAvLyBpZiAoREVCVUcpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmYWksJ2RlYnVnOiBzb3VyY2UgYXN5bmNJdGVyYXRvcicse1xuICAvLyAgIHZhbHVlOiBuZXcgV2Vha1JlZihzb3VyY2UpXG4gIC8vIH0pXG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoZmFpKVxufVxuXG5mdW5jdGlvbiBtYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSwgbWFwcGVyOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG1hcHBlcik7XG59XG5cbmZ1bmN0aW9uIGZpbHRlcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgYXN5bmMgbyA9PiAoYXdhaXQgZm4obykgPyBvIDogSWdub3JlKSk7XG59XG5cbmZ1bmN0aW9uIHVuaXF1ZTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBmbj86IChuZXh0OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZm5cbiAgICA/IGZpbHRlck1hcCh0aGlzLCBhc3luYyAobywgcCkgPT4gKHAgPT09IElnbm9yZSB8fCBhd2FpdCBmbihvLCBwKSkgPyBvIDogSWdub3JlKVxuICAgIDogZmlsdGVyTWFwKHRoaXMsIChvLCBwKSA9PiBvID09PSBwID8gSWdub3JlIDogbyk7XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxseTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBJID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPj4odGhpczogVSwgaW5pdFZhbHVlOiBJKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4gfCBJPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBvLCBpbml0VmFsdWUpO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9yPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGNiOiAoZG9uZTogKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpID0+IHZvaWQpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbmV3IFByb21pc2U8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ocmVzb2x2ZSA9PiB7IGNiKCgpID0+IHJlc29sdmUobykpOyByZXR1cm4gbyB9KSk7XG59XG5cbmZ1bmN0aW9uIG11bHRpPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICB0eXBlIFQgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+O1xuICBjb25zdCBzb3VyY2UgPSB0aGlzO1xuICBsZXQgY29uc3VtZXJzID0gMDtcbiAgbGV0IGN1cnJlbnQ6IERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxULCBhbnk+PjtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPFQsIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgc291cmNlIGhhcyBwcm9kdWNlZCBhIG5ldyByZXN1bHRcbiAgZnVuY3Rpb24gc3RlcChpdD86IEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4pIHtcbiAgICBpZiAoaXQpIGN1cnJlbnQucmVzb2x2ZShpdCk7XG4gICAgaWYgKGl0Py5kb25lKSB7XG4gICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjdXJyZW50Py5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXJyb3IgfSk7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2VcbiAgICAgICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZG9uZSh2OiBJdGVyYXRvclJlc3VsdDxIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFU+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+LCBhbnk+IHwgdW5kZWZpbmVkKSB7XG4gICAgLy8gQHRzLWlnbm9yZTogcmVtb3ZlIHJlZmVyZW5jZXMgZm9yIEdDXG4gICAgYWkgPSBtYWkgPSBjdXJyZW50ID0gbnVsbDtcbiAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfVxuICB9XG5cbiAgbGV0IG1haTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgIHJldHVybiBtYWk7XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAoIWFpKSB7XG4gICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdz8uKGV4KSA/PyBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWFpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IGl0ZXJhYmxlSGVscGVycywgbWVyZ2UsIEFzeW5jRXh0cmFJdGVyYWJsZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuLypcbiAgYHdoZW4oLi4uLilgIGlzIGJvdGggYW4gQXN5bmNJdGVyYWJsZSBvZiB0aGUgZXZlbnRzIGl0IGNhbiBnZW5lcmF0ZSBieSBvYnNlcnZhdGlvbixcbiAgYW5kIGEgZnVuY3Rpb24gdGhhdCBjYW4gbWFwIHRob3NlIGV2ZW50cyB0byBhIHNwZWNpZmllZCB0eXBlLCBlZzpcblxuICB0aGlzLndoZW4oJ2tleXVwOiNlbGVtZXQnKSA9PiBBc3luY0l0ZXJhYmxlPEtleWJvYXJkRXZlbnQ+XG4gIHRoaXMud2hlbignI2VsZW1ldCcpKGUgPT4gZS50YXJnZXQpID0+IEFzeW5jSXRlcmFibGU8RXZlbnRUYXJnZXQ+XG4qL1xuLy8gVmFyYXJncyB0eXBlIHBhc3NlZCB0byBcIndoZW5cIlxudHlwZSBXaGVuUGFyYW1ldGVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG58IEVsZW1lbnQgLyogSW1wbGllcyBcImNoYW5nZVwiIGV2ZW50ICovXG58IFByb21pc2U8YW55PiAvKiBKdXN0IGdldHMgd3JhcHBlZCBpbiBhIHNpbmdsZSBgeWllbGRgICovXG58IEFzeW5jSXRlcmFibGU8YW55PlxuXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxXaGVuUGFyYW1ldGVyPElEUz4+XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyXG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+XG5cbnR5cGUgRW1wdHlPYmplY3QgPSBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBuZXZlcj5cblxuaW50ZXJmYWNlIFNwZWNpYWxXaGVuRXZlbnRzIHtcbiAgXCJAc3RhcnRcIjogRW1wdHlPYmplY3QsICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IEVtcHR5T2JqZWN0ICAgLy8gRmlyZXMgd2hlbiBhbGwgRWxlbWVudCBzcGVjaWZpZWQgc291cmNlcyBhcmUgbW91bnRlZCBpbiB0aGUgRE9NXG59XG5cbmludGVyZmFjZSBXaGVuRXZlbnRzIGV4dGVuZHMgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwLCBTcGVjaWFsV2hlbkV2ZW50cyB7fVxudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlclxuXG50eXBlIEV2ZW50TmFtZVVuaW9uPFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogUyB8IEV2ZW50TmFtZUxpc3Q8Uj5cbiAgOiBuZXZlclxuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxuLy8gTm90ZTogdGhpcyBzbG93cyBkb3duIHR5cGVzY3JpcHQuIFNpbXBseSBkZWZpbmluZyBgQ1NTSWRlbnRpZmllciA9IHN0cmluZ2AgaXMgcXVpY2tlciwgYnV0IHByZXZlbnRzIHdoZW4gdmFsaWRhdGluZyBzdWItSURTcyBvciBzZWxlY3RvciBmb3JtYXR0aW5nXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8IGAjJHtJRFN9PmAgfCBgLiR7c3RyaW5nfWAgfCBgWyR7c3RyaW5nfV1gXG5cbi8qIFZhbGlkV2hlblNlbGVjdG9ycyBhcmU6XG4gICAgQHN0YXJ0XG4gICAgQHJlYWR5XG4gICAgZXZlbnQ6c2VsZWN0b3JcbiAgICBldmVudCAgICAgICAgICAgXCJ0aGlzXCIgZWxlbWVudCwgZXZlbnQgdHlwZT0nZXZlbnQnXG4gICAgc2VsZWN0b3IgICAgICAgIHNwZWNpZmljZWQgc2VsZWN0b3JzLCBpbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnRcbiovXG5cbmV4cG9ydCB0eXBlIFZhbGlkV2hlblNlbGVjdG9yPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgJHtrZXlvZiBTcGVjaWFsV2hlbkV2ZW50c31gXG4gIHwgYCR7RXZlbnRBdHRyaWJ1dGV9OiR7Q1NTSWRlbnRpZmllcjxJRFM+fWBcbiAgfCBFdmVudEF0dHJpYnV0ZVxuICB8IENTU0lkZW50aWZpZXI8SURTPlxuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz4gPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXJcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtDU1NJZGVudGlmaWVyfWAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzID8gRXZlbnROYW1lVW5pb248Uz4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Uz5cbiAgOiBTIGV4dGVuZHMgQ1NTSWRlbnRpZmllciA/ICdjaGFuZ2UnXG4gIDogbmV2ZXJcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl1cblxuLyoqIHdoZW4gKiovXG5pbnRlcmZhY2UgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lclJlZjogV2Vha1JlZjxFbGVtZW50PlxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbDtcbiAgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuO1xufVxuXG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBXZWFrTWFwPERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXModGhpcykpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KHRoaXMpIS5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lclJlZiwgc2VsZWN0b3IsIGluY2x1ZGVDaGlsZHJlbiB9ID0gbztcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gY29udGFpbmVyUmVmLmRlcmVmKCk7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyPy5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChpbmNsdWRlQ2hpbGRyZW4gPyBuLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IG4pICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gPyBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gY29udGFpbmVyIClcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRsZXNzPFQgZXh0ZW5kcyBzdHJpbmcgfCBudWxsPihzZWw6IFQpOiBUIGV4dGVuZHMgbnVsbCA/IHsgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9IDogeyBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIHNlbGVjdG9yOiBUIH0ge1xuICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSAhc2VsIHx8ICFzZWwuZW5kc1dpdGgoJz4nKVxuICByZXR1cm4geyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yOiBpbmNsdWRlQ2hpbGRyZW4gPyBzZWwgOiBzZWwuc2xpY2UoMCwtMSkgfSBhcyBhbnk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW1JldHVyblR5cGU8dHlwZW9mIGNoaWxkbGVzcz4sIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzBdKSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW3sgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9LCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzFdKSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3sgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3Rvcn0sIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGNvbnRhaW5lci5vd25lckRvY3VtZW50KSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQsIG5ldyBNYXAoKSk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5oYXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnRhaW5lci5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmdldChldmVudE5hbWUpO1xuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBvYnNlcnZhdGlvbnMhLmRlbGV0ZShkZXRhaWxzKSk7XG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXJSZWY6IG5ldyBXZWFrUmVmKGNvbnRhaW5lciksXG4gICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgIHNlbGVjdG9yXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IG9ic2VydmF0aW9ucyEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBkb25lSW1tZWRpYXRlbHk8Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgcmV0dXJuIHVuZGVmaW5lZCBhcyBaO1xufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcik6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGNvbnN0IGlzTWlzc2luZyA9IChzZWw6IENTU0lkZW50aWZpZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIgPT4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMubWFwKHcgPT4gdz8uc2VsZWN0b3IpLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IGRvbmVJbW1lZGlhdGVseSgpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChkb25lSW1tZWRpYXRlbHk8V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgZnVuY3Rpb24gY29udGFpbmVySXNJbkRPTSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgIGlmIChjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IFsuLi5yLnJlbW92ZWROb2Rlc10uc29tZShyID0+IHIgPT09IGNvbnRhaW5lciB8fCByLmNvbnRhaW5zKGNvbnRhaW5lcikpKSkge1xuICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiUmVtb3ZlZCBmcm9tIERPTVwiKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9ic2VydmUoY29udGFpbmVyLm93bmVyRG9jdW1lbnQuYm9keSwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBFbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyICR7dGltZU91dFdhcm4gLyAxMDAwfSBzZWNvbmRzOmApO1xuICAgICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihzdGFjayArIFwiXFxuXCIgKyBjb250YWluZXIub3V0ZXJIVE1MKTtcbiAgICAgICAgLy9yZWplY3QobmV3IEVycm9yKFwiRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHNcIikpO1xuICAgICAgfSwgdGltZU91dFdhcm4pO1xuXG4gICAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhbGxTZWxlY3RvcnNQcmVzZW50KG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSlcbiAgICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICBpZiAobWlzc2luZy5ldmVyeShzZWwgPT4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KSk7XG5cbiAgICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgYE1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyICR7dGltZU91dFdhcm4gLyAxMDAwfSBzZWNvbmRzOiBgKSA/PyAnPz8nO1xuICAgICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihzdGFjayArIG1pc3NpbmcgKyBcIlxcblwiKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG4gIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICByZXR1cm4gY29udGFpbmVySXNJbkRPTSgpLnRoZW4oKCkgPT4gYWxsU2VsZWN0b3JzUHJlc2VudChzZWxlY3RvcnMpKVxuICByZXR1cm4gY29udGFpbmVySXNJbkRPTSgpO1xufVxuIiwgIi8qIFR5cGVzIGZvciB0YWcgY3JlYXRpb24sIGltcGxlbWVudGVkIGJ5IGB0YWcoKWAgaW4gYWktdWkudHMuXG4gIE5vIGNvZGUvZGF0YSBpcyBkZWNsYXJlZCBpbiB0aGlzIGZpbGUgKGV4Y2VwdCB0aGUgcmUtZXhwb3J0ZWQgc3ltYm9scyBmcm9tIGl0ZXJhdG9ycy50cykuXG4qL1xuXG5pbXBvcnQgdHlwZSB7IEFzeW5jUHJvdmlkZXIsIElnbm9yZSwgSXRlcmFibGVQcm9wZXJ0aWVzLCBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz4gLy8gSXRlcmFibGUgdGhpbmdzIHRoYXQgaG9sZCB0aGUgYWJvdmUsIGxpa2UgQXJyYXlzLCBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3RcblxuLyogVHlwZXMgdXNlZCB0byB2YWxpZGF0ZSBhbiBleHRlbmRlZCB0YWcgZGVjbGFyYXRpb24gKi9cblxudHlwZSBEZWVwUGFydGlhbDxYPiA9IFtYXSBleHRlbmRzIFt7fV0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFhcbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogT1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuLyogVHlwZXMgdGhhdCBmb3JtIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleHRlbmRlZCB0YWcgKi9cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICAvKiBWYWx1ZXMgZm9yIHByb3BlcnRpZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIGFueSBiYXNlIGEgdGFnIGlzIGV4dGVuZGVkIGZyb20gKi9cbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgbmV3IHByb3BlcnRpZXMgaW4gdGhpcyB0YWcgZGVmaW5pdGlvbi4gKi9cbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgLyogRGVjbGFyYXRpb24gYW5kIGRlZmF1bHQgdmFsdWVlcyBmb3Igbm93IHByb3BlcnRpZXMgdGhhdCBhcmUgYm94ZWQgYnkgZGVmaW5lSXRlcmFibGVQcm9wZXJ0aWVzICovXG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIC8qIFNwZWNpZmljYXRpb24gb2YgdGhlIHR5cGVzIG9mIGVsZW1lbnRzIGJ5IElEIHRoYXQgYXJlIGNvbnRhaW5lZCBieSB0aGlzIHRhZyAqL1xuICBpZHM/OiB7IFtpZDogc3RyaW5nXTogVGFnQ3JlYXRvckZ1bmN0aW9uPGFueT47IH07XG4gIC8qIFN0YXRpYyBDU1MgcmVmZXJlbmNlZCBieSB0aGlzIHRhZyAqL1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUYWdDcmVhdG9yRm9ySURTPEkgZXh0ZW5kcyBOb25OdWxsYWJsZTxPdmVycmlkZXNbJ2lkcyddPj4ge1xuICA8Y29uc3QgSyBleHRlbmRzIGtleW9mIEk+KFxuICAgIGF0dHJzOnsgaWQ6IEsgfSAmIEV4Y2x1ZGU8UGFyYW1ldGVyczxJW0tdPlswXSwgQ2hpbGRUYWdzPixcbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgKTogUmV0dXJuVHlwZTxJW0tdPlxufVxuXG50eXBlIElEUzxJIGV4dGVuZHMgT3ZlcnJpZGVzWydpZHMnXT4gPSBJIGV4dGVuZHMgTm9uTnVsbGFibGU8T3ZlcnJpZGVzWydpZHMnXT4gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBSZXR1cm5UeXBlPElbSl0+O1xuICB9ICYgVGFnQ3JlYXRvckZvcklEUzxJPlxufSA6IHsgaWRzOiB7fSB9XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGF0dHJpYnV0ZXMgZnJvbSBhbiBFeFRhZ0NyZWF0b3JcbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPSBUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIEJhc2VBdHRycz5cbiAgPyBCYXNlQXR0cnNcbiAgOiBuZXZlclxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQmFzZSwgaW5mZXIgU3VwZXIsIGluZmVyIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX1N0YXRpY3M+XG4gID8gQmFzZUl0ZXJhYmxlczxTdXBlcj4gZXh0ZW5kcyBuZXZlclxuICAgID8gU3VwZXJEZWZzWydpdGVyYWJsZSddIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXVxuICAgICAgOiB7fVxuICAgIDogQmFzZUl0ZXJhYmxlczxTdXBlcj4gJiBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgOiBuZXZlclxuXG4vLyBXb3JrIG91dCB0aGUgdHlwZXMgb2YgYWxsIHRoZSBub24taXRlcmFibGUgcHJvcGVydGllcyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9XG4gIERbJ2RlY2xhcmUnXVxuICAmIERbJ292ZXJyaWRlJ11cbiAgJiBJRFM8RFsnaWRzJ10+XG4gICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgRFsnaXRlcmFibGUnXT5cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ11cblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9yQ2FsbFN0YWNrIGV4dGVuZHMgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXTtcbiAgW2s6IHN0cmluZ106IHVua25vd25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbiB7IChhdHRyczogQ29uc3RydWN0b3JDYWxsU3RhY2sgfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IEVsZW1lbnQgfVxuXG5pbnRlcmZhY2UgSW5zdGFuY2VVbmlxdWVJRCB7IFtVbmlxdWVJRF06IHN0cmluZyB9XG5leHBvcnQgdHlwZSBJbnN0YW5jZTxUID0gSW5zdGFuY2VVbmlxdWVJRD4gPSBJbnN0YW5jZVVuaXF1ZUlEICYgVFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yIHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID1cbiAgVGFnQ29uc3R1Y3RvciAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+PlxuICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4sXG4gICAgRFsnZGVjbGFyZSddXG4gICAgJiBEWydvdmVycmlkZSddXG4gICAgJiBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxELCBCYXNlPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4+XG4gID5cblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbj5cblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgZXh0ZW5kcyBJbnN0YW5jZVVuaXF1ZUlEID0gSW5zdGFuY2VVbmlxdWVJRFxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsIFJlc3VsdD4gPVxuICBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBjb25zdHJ1Y3RlZDogYW55IH1cbiAgPyBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgQ29uc3RydWN0ZWRcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcImNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+aW5mZXIgUlxuICAgICAgPyAoKGU6IEUpPT5SKSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD5cbnR5cGUgUG9zc2libHlBc3luYzxYPiA9IFtYXSBleHRlbmRzIFtvYmplY3RdIC8qIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb24gKi9cbiAgPyBYIGV4dGVuZHMgQXN5bmNQcm92aWRlcjxpbmZlciBVPlxuICAgID8gWCBleHRlbmRzIChBc3luY1Byb3ZpZGVyPFU+ICYgVSlcbiAgICAgID8gVSB8IEFzeW5jQXR0cjxVPiAvLyBpdGVyYWJsZSBwcm9wZXJ0eVxuICAgICAgOiBYIHwgUHJvbWlzZUxpa2U8WD4gLy8gc29tZSBvdGhlciBBc3luY1Byb3ZpZGVyXG4gICAgOiBYIGV4dGVuZHMgKGFueVtdIHwgRnVuY3Rpb24pXG4gICAgICA/IFggfCBBc3luY0F0dHI8WD4gIC8vIEFycmF5IG9yIEZ1bmN0aW9uLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgYXN5bmNcbiAgICAgIDogeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT4gfSB8IFBhcnRpYWw8WD4gfCBBc3luY0F0dHI8UGFydGlhbDxYPj4gLy8gT3RoZXIgb2JqZWN0IC0gcGFydGlhbGx5LCBwb3NzaWJsZSBhc3luY1xuICA6IFggfCBBc3luY0F0dHI8WD4gLy8gU29tZXRoaW5nIGVsc2UgKG51bWJlciwgZXRjKSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGFzeW5jXG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+KTtcbiAgfSlcbiAgOiAoT21pdDxFLCAnYXR0cmlidXRlcyc+KVxuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdXG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxCYXNlPiAmIFRoaXNUeXBlPEJhc2U+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxCYXNlPlxuXG4vKiBBIFRhZ0NyZWF0b3IgaXMgVGFnQ3JlYXRvckZ1bmN0aW9uIGRlY29yYXRlZCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcy4gVGhlIFN1cGVyICYgU3RhdGljcyBhcmdzIGFyZSBvbmx5XG5ldmVyIHNwZWNpZmllZCBieSBFeHRlbmRlZFRhZyAoaW50ZXJuYWxseSksIGFuZCBzbyBpcyBub3QgZXhwb3J0ZWQgKi9cbnR5cGUgRXhUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3QsXG4gIFN1cGVyIGV4dGVuZHMgKHVua25vd24gfCBFeFRhZ0NyZWF0b3I8YW55PikgPSB1bmtub3duLFxuICBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMgPSB7fSxcbiAgU3RhdGljcyA9IHt9LFxuPiA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiBJbnN0YW5jZVVuaXF1ZUlEOyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbn0gJiBJbnN0YW5jZVVuaXF1ZUlEICZcbi8vIGBTdGF0aWNzYCBoZXJlIGlzIHRoYXQgc2FtZSBhcyBTdGF0aWNSZWZlcmVuY2VzPFN1cGVyLCBTdXBlckRlZnM+LCBidXQgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBicmVha3MgVFNcbi8vIHNvIHdlIGNvbXB1dGUgdGhlIFN0YXRpY3Mgb3V0c2lkZSB0aGlzIHR5cGUgZGVjbGFyYXRpb24gYXMgcGFzcyB0aGVtIGFzIGEgcmVzdWx0XG5TdGF0aWNzXG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2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QUcsS0FBSTtBQUFFLGNBQUUsS0FBSyxJQUFJO0FBQUEsVUFBRSxTQUFTLElBQUk7QUFDN0UscUJBQVEsS0FBSywyQ0FBMkMsTUFBTSxHQUFHLFFBQVEsSUFBSSxDQUFDO0FBQUEsVUFDaEY7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsTUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGNBQVUsUUFBUSxTQUFVLEdBQUc7QUFDN0IsVUFBSSxFQUFFLFNBQVMsZUFBZSxFQUFFLGFBQWE7QUFDM0MsYUFBSyxFQUFFLFlBQVk7QUFBQSxJQUN2QixDQUFDO0FBQUEsRUFDSCxDQUFDLEVBQUUsUUFBUSxNQUFNLEVBQUUsU0FBUyxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBRW5ELFNBQU87QUFBQSxJQUNMLElBQUksR0FBUTtBQUFFLGFBQU8sUUFBUSxJQUFJLENBQUM7QUFBQSxJQUFFO0FBQUEsSUFDcEMsSUFBSSxHQUFRO0FBQUUsYUFBTyxRQUFRLElBQUksQ0FBQztBQUFBLElBQUU7QUFBQSxJQUNwQyxrQkFBa0IsR0FBUyxNQUFjO0FBQ3ZDLGFBQU8sU0FBUyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUk7QUFBQSxJQUNsQztBQUFBLElBQ0EsVUFBVSxHQUFXLE1BQXVCLFNBQThCO0FBQ3hFLFVBQUksU0FBUztBQUNYLFVBQUUsUUFBUSxDQUFBQyxPQUFLO0FBQ2IsZ0JBQU1DLE9BQU0sU0FBUyxJQUFJRCxFQUFDLEtBQUssb0JBQUksSUFBK0I7QUFDbEUsbUJBQVMsSUFBSUEsSUFBR0MsSUFBRztBQUNuQixVQUFBQSxLQUFJLElBQUksTUFBTSxPQUFPO0FBQUEsUUFDdkIsQ0FBQztBQUFBLE1BQ0gsT0FDSztBQUNILFVBQUUsUUFBUSxDQUFBRCxPQUFLO0FBQ2IsZ0JBQU1DLE9BQU0sU0FBUyxJQUFJRCxFQUFDO0FBQzFCLGNBQUlDLE1BQUs7QUFDUCxZQUFBQSxLQUFJLE9BQU8sSUFBSTtBQUNmLGdCQUFJLENBQUNBLEtBQUk7QUFDUCx1QkFBUyxPQUFPRCxFQUFDO0FBQUEsVUFDckI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJtZXJnZWQiLCAiciIsICJpZCIsICJEeWFtaWNFbGVtZW50RXJyb3IiLCAidW5pcXVlIiwgIm4iLCAiY2hpbGRyZW4iLCAiZSIsICJtYXAiXQp9Cg==
