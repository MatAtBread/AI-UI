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
  Ready: () => Ready,
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
      case "function":
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
          if (key === "valueOf" || key === "toJSON" && !("toJSON" in target))
            return () => destructure(a2, path);
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
var Ready = Object.freeze({});
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
          return { done: false, value: Ready };
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuLCBSZWFkeSB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgdHlwZSB7IENoaWxkVGFncywgSW5zdGFuY2UsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcydcbmV4cG9ydCAqIGFzIEl0ZXJhdG9ycyBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbmNvbnN0IHRyYWNrTm9kZXMgPSBTeW1ib2woXCJ0cmFja05vZGVzXCIpO1xuY29uc3QgdHJhY2tMZWdhY3kgPSBTeW1ib2woXCJvblJlbW92YWxGcm9tRE9NXCIpO1xuY29uc3QgYWl1aUV4dGVuZGVkVGFnU3R5bGVzID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcblxuY29uc3QgbG9nTm9kZSA9IERFQlVHXG4/ICgobjogYW55KSA9PiBuIGluc3RhbmNlb2YgTm9kZVxuICA/ICdvdXRlckhUTUwnIGluIG4gPyBuLm91dGVySFRNTCA6IGAke24udGV4dENvbnRlbnR9ICR7bi5ub2RlTmFtZX1gXG4gIDogU3RyaW5nKG4pKVxuOiAobjogTm9kZSkgPT4gdW5kZWZpbmVkO1xuXG4vKiBBIGhvbGRlciBmb3IgY29tbW9uUHJvcGVydGllcyBzcGVjaWZpZWQgd2hlbiBgdGFnKC4uLnApYCBpcyBpbnZva2VkLCB3aGljaCBhcmUgYWx3YXlzXG4gIGFwcGxpZWQgKG1peGVkIGluKSB3aGVuIGFuIGVsZW1lbnQgaXMgY3JlYXRlZCAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWdGdW5jdGlvbk9wdGlvbnM8T3RoZXJNZW1iZXJzIGV4dGVuZHMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PiA9IHt9PiB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnMgfCB1bmRlZmluZWRcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICBFcnJvclRhZz86IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50ICYgeyBlcnJvcjogYW55IH0+XG4gIC8qKiBAZGVwcmVjYXRlZCAtIGxlZ2FjeSBzdXBwb3J0ICovXG4gIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fSAmICh1bmRlZmluZWQgfCAoKGF0dHJzOiBvYmplY3QsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gUmV0dXJuVHlwZTxUYWdDcmVhdG9yRnVuY3Rpb248YW55Pj4pKVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbiAgLy8gVGhpcyBpcyBhIHZlcnkgaW5jb21wbGV0ZSB0eXBlLiBJbiBwcmFjdGljZSwgc2V0KGssIGF0dHJzKSByZXF1aXJlcyBhIGRlZXBseSBwYXJ0aWFsIHNldCBvZlxuICAvLyBhdHRyaWJ1dGVzLCBpbiBleGFjdGx5IHRoZSBzYW1lIHdheSBhcyBhIFRhZ0Z1bmN0aW9uJ3MgZmlyc3Qgb2JqZWN0IHBhcmFtZXRlclxuICBzZXQgYXR0cmlidXRlcyhhdHRyczogb2JqZWN0KTtcbiAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwXG59XG5cbi8vIFN1cHBvcnQgZm9yIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2h0bSAob3IgaW1wb3J0IGh0bSBmcm9tICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2h0bS9kaXN0L2h0bS5tb2R1bGUuanMnKVxuLy8gTm90ZTogc2FtZSBzaWduYXR1cmUgYXMgUmVhY3QuY3JlYXRlRWxlbWVudFxudHlwZSBDcmVhdGVFbGVtZW50Tm9kZVR5cGUgPSBUYWdDcmVhdG9yRnVuY3Rpb248YW55PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBcbnR5cGUgQ3JlYXRlRWxlbWVudEZyYWdtZW50ID0gQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddO1xuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVFbGVtZW50IHtcbiAgLy8gU3VwcG9ydCBmb3IgaHRtLCBKU1gsIGV0Y1xuICBjcmVhdGVFbGVtZW50PE4gZXh0ZW5kcyAoQ3JlYXRlRWxlbWVudE5vZGVUeXBlIHwgQ3JlYXRlRWxlbWVudEZyYWdtZW50KT4oXG4gICAgLy8gXCJuYW1lXCIgY2FuIGEgSFRNTCB0YWcgc3RyaW5nLCBhbiBleGlzdGluZyBub2RlIChqdXN0IHJldHVybnMgaXRzZWxmKSwgb3IgYSB0YWcgZnVuY3Rpb25cbiAgICBuYW1lOiBOLFxuICAgIC8vIFRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gaW5pdGlhbGlzZSB0aGUgbm9kZSAoaWYgYSBzdHJpbmcgb3IgZnVuY3Rpb24gLSBpZ25vcmUgaWYgaXQncyBhbHJlYWR5IGEgbm9kZSlcbiAgICBhdHRyczogYW55LFxuICAgIC8vIFRoZSBjaGlsZHJlblxuICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IE4gZXh0ZW5kcyBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPyBOb2RlW10gOiBOb2RlO1xuICB9XG5cbi8qIFRoZSBpbnRlcmZhY2UgdGhhdCBjcmVhdGVzIGEgc2V0IG9mIFRhZ0NyZWF0b3JzIGZvciB0aGUgc3BlY2lmaWVkIERPTSB0YWdzICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0xvYWRlciB7XG4gIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKTogKE5vZGUgfCAoLypQICYqLyAoRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMpKSlbXTtcbiAgVW5pcXVlSUQ6IHR5cGVvZiBVbmlxdWVJRFxuXG4gIC8qXG4gICBTaWduYXR1cmVzIGZvciB0aGUgdGFnIGxvYWRlci4gQWxsIHBhcmFtcyBhcmUgb3B0aW9uYWwgaW4gYW55IGNvbWJpbmF0aW9uLFxuICAgYnV0IG11c3QgYmUgaW4gb3JkZXI6XG4gICAgICB0YWcoXG4gICAgICAgICAgP25hbWVTcGFjZT86IHN0cmluZywgIC8vIGFic2VudCBuYW1lU3BhY2UgaW1wbGllcyBIVE1MXG4gICAgICAgICAgP3RhZ3M/OiBzdHJpbmdbXSwgICAgIC8vIGFic2VudCB0YWdzIGRlZmF1bHRzIHRvIGFsbCBjb21tb24gSFRNTCB0YWdzXG4gICAgICAgICAgP2NvbW1vblByb3BlcnRpZXM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0Pih0YWdzOiBUYWdzW10sIG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMgb2JqZWN0PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMgb2JqZWN0XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXTtcblxuICBjb25zdCBjb21tb25Qcm9wZXJ0aWVzID0gb3B0aW9ucz8uY29tbW9uUHJvcGVydGllcztcbiAgY29uc3QgdGhpc0RvYyA9IG9wdGlvbnM/LmRvY3VtZW50ID8/IGdsb2JhbFRoaXMuZG9jdW1lbnQ7XG4gIGNvbnN0IGlzVGVzdEVudiA9IHRoaXNEb2MuZG9jdW1lbnRVUkkgPT09ICdhYm91dDp0ZXN0aW5nJztcbiAgY29uc3QgRHlhbWljRWxlbWVudEVycm9yID0gb3B0aW9ucz8uRXJyb3JUYWcgfHwgZnVuY3Rpb24gRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3IgfTogeyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj4gfSkge1xuICAgIHJldHVybiB0aGlzRG9jLmNyZWF0ZUNvbW1lbnQoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnRvU3RyaW5nKCkgOiAnRXJyb3I6XFxuJyArIEpTT04uc3RyaW5naWZ5KGVycm9yLCBudWxsLCAyKSk7XG4gIH1cblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYyk7XG5cbiAgZnVuY3Rpb24gRG9tUHJvbWlzZUNvbnRhaW5lcihsYWJlbD86IGFueSkge1xuICAgIHJldHVybiB0aGlzRG9jLmNyZWF0ZUNvbW1lbnQobGFiZWw/IGxhYmVsLnRvU3RyaW5nKCkgOkRFQlVHXG4gICAgICA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiXG4gICAgICA6IFwicHJvbWlzZVwiKVxuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhaXVpRXh0ZW5kZWRUYWdTdHlsZXMpKSB7XG4gICAgdGhpc0RvYy5oZWFkLmFwcGVuZENoaWxkKE9iamVjdC5hc3NpZ24odGhpc0RvYy5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIiksIHtpZDogYWl1aUV4dGVuZGVkVGFnU3R5bGVzfSApKTtcbiAgfVxuXG4gIC8qIFByb3BlcnRpZXMgYXBwbGllZCB0byBldmVyeSB0YWcgd2hpY2ggY2FuIGJlIGltcGxlbWVudGVkIGJ5IHJlZmVyZW5jZSwgc2ltaWxhciB0byBwcm90b3R5cGVzICovXG4gIGNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0YWdQcm90b3R5cGVzOiBQb0VsZW1lbnRNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIHtcbiAgICAgIHdoZW46IHtcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKC4uLndoYXQ6IFdoZW5QYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KHRoaXM6IEVsZW1lbnQsIGE6IG9iamVjdCkge1xuICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgICAgIGV4ID0+IGNvbnNvbGUud2FybihleCkpO1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaWRzOiB7XG4gICAgICAgIC8vIC5pZHMgaXMgYSBnZXR0ZXIgdGhhdCB3aGVuIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vIGxhemlseSBjcmVhdGVzIGEgUHJveHkgdGhhdCBwcm92aWRlcyBsaXZlIGFjY2VzcyB0byBjaGlsZHJlbiBieSBpZFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICBnZXQodGhpczogRWxlbWVudCkge1xuICAgICAgICAgIC8vIE5vdyB3ZSd2ZSBiZWVuIGFjY2Vzc2VkLCBjcmVhdGUgdGhlIHByb3h5XG4gICAgICAgICAgY29uc3QgaWRQcm94eSA9IG5ldyBQcm94eSgoKCk9Pnt9KSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIFdlYWtSZWY8RWxlbWVudD4+LCB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0FyZy5jb25zdHJ1Y3Rvci5kZWZpbml0aW9uLmlkc1thcmdzWzBdLmlkXSguLi5hcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgPGVsdD4uaWRzLiR7YXJncz8uWzBdPy5pZH0gaXMgbm90IGEgdGFnLWNyZWF0aW5nIGZ1bmN0aW9uYCwgeyBjYXVzZTogZXggfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdHJ1Y3Q6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZjogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7IHJldHVybiBudWxsIH0sXG4gICAgICAgICAgICBpc0V4dGVuc2libGUoKSB7IHJldHVybiBmYWxzZSB9LFxuICAgICAgICAgICAgcHJldmVudEV4dGVuc2lvbnMoKSB7IHJldHVybiB0cnVlIH0sXG4gICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXlGb3IocCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhcyh0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpO1xuICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvd25LZXlzOiAodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGlkcyA9IFsuLi50aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYFtpZF1gKV0ubWFwKGUgPT4gZS5pZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IFsuLi5uZXcgU2V0KGlkcyldO1xuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgaWRzLmxlbmd0aCAhPT0gdW5pcXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50IGlkc2AsIHVuaXF1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiB1bmlxdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwLCByZWNlaXZlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGsgPSBrZXlGb3IocCk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UndmUgY2FjaGVkIHRoaXMgSUQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmIChwayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBlbGVtZW50IGlzIHN0aWxsIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBlbGVtZW50IHdpdGggdGhlIHNhbWUgSURcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRhcmdldFtwa10uZGVyZWYoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgcmVmLmlkID09PSBwICYmIHRoaXMuY29udGFpbnMocmVmKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbcGtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZTogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIENTUy5lc2NhcGUocCkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50cyB3aXRoIElEIFwiJHtwfVwiYC8qLGBcXG5cXHQke2xvZ05vZGUodGhpcyl9YCovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZSA9IG5sWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUocCkpID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUpXG4gICAgICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIHBrLCBuZXcgV2Vha1JlZihlKSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uYW5kIHJlcGxhY2UgdGhlIGdldHRlciB3aXRoIHRoZSBQcm94eVxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWRzJywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gaWRQcm94eSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi4uYW5kIHJldHVybiB0aGF0IGZyb20gdGhlIGdldHRlciwgc28gc3Vic2VxdWVudCBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGFjY2Vzc2VzIGdvIHZpYSB0aGUgUHJveHlcbiAgICAgICAgICByZXR1cm4gaWRQcm94eTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICBpZiAob3B0aW9ucz8uZW5hYmxlT25SZW1vdmVkRnJvbURPTSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdQcm90b3R5cGVzLCdvblJlbW92ZWRGcm9tRE9NJyx7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHNldDogZnVuY3Rpb24oZm4/OiAoKT0+dm9pZCl7XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoW3RoaXNdLCB0cmFja0xlZ2FjeSwgZm4pO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLmdldFJlbW92YWxIYW5kbGVyKHRoaXMsIHRyYWNrTGVnYWN5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKiBBZGQgYW55IHVzZXIgc3VwcGxpZWQgcHJvdG90eXBlcyAqL1xuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uICpub2RlcyguLi5jaGlsZFRhZ3M6IENoaWxkVGFnc1tdKTogSXRlcmFibGVJdGVyYXRvcjxDaGlsZE5vZGUsIHZvaWQsIHVua25vd24+IHtcbiAgICBmdW5jdGlvbiBub3RWaWFibGVUYWcoYzogQ2hpbGRUYWdzKSB7XG4gICAgICByZXR1cm4gKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGMgb2YgY2hpbGRUYWdzKSB7XG4gICAgICBpZiAobm90VmlhYmxlVGFnKGMpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgbGV0IGc6IENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIGMudGhlbihyZXBsYWNlbWVudCA9PiB7XG4gICAgICAgICAgY29uc3Qgb2xkID0gZztcbiAgICAgICAgICBpZiAob2xkKSB7XG4gICAgICAgICAgICBnID0gWy4uLm5vZGVzKHJlcGxhY2VtZW50KV07XG4gICAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKGcsIHRyYWNrTm9kZXMsICgpPT4geyBnID0gdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgZm9yIChsZXQgaT0wOyBpIDwgb2xkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChpID09PSAwKVxuICAgICAgICAgICAgICAgIG9sZFtpXS5yZXBsYWNlV2l0aCguLi5nKTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBvbGRbaV0ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZykgeWllbGQgKmc7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgeWllbGQgYyBhcyBDaGlsZE5vZGU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBoYXZlIGFuIGludGVyZXN0aW5nIGNhc2UgaGVyZSB3aGVyZSBhbiBpdGVyYWJsZSBTdHJpbmcgaXMgYW4gb2JqZWN0IHdpdGggYm90aCBTeW1ib2wuaXRlcmF0b3JcbiAgICAgIC8vIChpbmhlcml0ZWQgZnJvbSB0aGUgU3RyaW5nIHByb3RvdHlwZSkgYW5kIFN5bWJvbC5hc3luY0l0ZXJhdG9yIChhcyBpdCdzIGJlZW4gYXVnbWVudGVkIGJ5IGJveGVkKCkpXG4gICAgICAvLyBidXQgd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGNhc2VzIGxpa2UgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0LCBhcnJheSwgZXRjLiwgbm90IHRoZSBmdW5reSBvbmVzXG4gICAgICAvLyBJdCB1c2VkIHRvIGJlIGFmdGVyIHRoZSBpc0FzeW5jSXRlcigpIHRlc3QsIGJ1dCBhIG5vbi1Bc3luY0l0ZXJhdG9yICptYXkqIGFsc28gYmUgYSBzeW5jIGl0ZXJhYmxlXG4gICAgICAvLyBGb3Igbm93LCB3ZSBleGNsdWRlIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSBpbiB0aGlzIGNhc2UuXG4gICAgICBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGMgJiYgIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSAmJiBjW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjKVxuICAgICAgICAgIHlpZWxkICpub2RlcyhjaCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBc3luY0l0ZXI8Q2hpbGRUYWdzPihjKSkge1xuICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgbGV0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCB0ZXJtaW5hdGVTb3VyY2UgPSAoZm9yY2U6IGJvb2xlYW4gPSBmYWxzZSkgPT4ge1xuICAgICAgICAgIGlmICghYXAgfHwgIXJlcGxhY2VtZW50Lm5vZGVzKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgaWYgKGZvcmNlIHx8IHJlcGxhY2VtZW50Lm5vZGVzLmV2ZXJ5KGUgPT4gcmVtb3ZlZE5vZGVzLmhhcyhlKSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICByZXBsYWNlbWVudC5ub2Rlcz8uZm9yRWFjaChlID0+IHJlbW92ZWROb2Rlcy5hZGQoZSkpO1xuICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50OiBcIlxuICAgICAgICAgICAgICArIHJlcGxhY2VtZW50Lm5vZGVzLm1hcChsb2dOb2RlKS5qb2luKCdcXG4nKVxuICAgICAgICAgICAgICArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IG51bGw7XG4gICAgICAgICAgICBhcC5yZXR1cm4/LihuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIGFwID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhpcyBhc3luYyBpdGVyYXRvciBpcyBhIGJveGVkIG9iamVjdCB0aGF0IGFsc28gaG9sZHMgYSB2YWx1ZVxuICAgICAgICBjb25zdCB1bmJveGVkID0gYy52YWx1ZU9mKCk7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0ge1xuICAgICAgICAgIG5vZGVzOiAoKHVuYm94ZWQgPT09IGMpID8gW10gOiBbLi4ubm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXSkgYXMgQ2hpbGROb2RlW10gfCB1bmRlZmluZWQsXG4gICAgICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub2Rlcz8uW1N5bWJvbC5pdGVyYXRvcl0oKSA/PyAoeyBuZXh0KCkgeyByZXR1cm4geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0gfSB9IGFzIEl0ZXJhdG9yPENoaWxkTm9kZT4pXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzIS5sZW5ndGgpXG4gICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcyEsdHJhY2tOb2Rlcyx0ZXJtaW5hdGVTb3VyY2UpO1xuXG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgY29uc3QgZGVidWdVbm1vdW50ZWQgPSBERUJVR1xuICAgICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG4gICAgICAgICAgICBsZXQgZiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBmID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsIGNyZWF0ZWRCeSwgcmVwbGFjZW1lbnQubm9kZXM/Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgIH0pKClcbiAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgKGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgICAgYXAubmV4dCgpLnRoZW4oZXMgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGlmICghcmVwbGFjZW1lbnQubm9kZXMpIHtcbiAgICAgICAgICAgICAgICBhcD8udGhyb3c/LihuZXcgRXJyb3IoXCJBbHJlYWR5IHRlcm5pbWF0ZWRcIikpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gcmVwbGFjZW1lbnQubm9kZXMuZmlsdGVyKGUgPT4gZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gcmVwbGFjZW1lbnQubm9kZXMgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghdGVybWluYXRlU291cmNlKCFuLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z1VubW91bnRlZD8uKCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcywgdHJhY2tOb2Rlcyk7XG5cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFsuLi5ub2Rlcyh1bmJveChlcy52YWx1ZSkpXTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChyZXBsYWNlbWVudC5ub2RlcywgdHJhY2tOb2Rlcyx0ZXJtaW5hdGVTb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaT0wOyBpPG4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpPT09MClcbiAgICAgICAgICAgICAgICAgICAgblswXS5yZXBsYWNlV2l0aCguLi5yZXBsYWNlbWVudC5ub2Rlcyk7XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICghcmVwbGFjZW1lbnQubm9kZXMuaW5jbHVkZXMobltpXSkpXG4gICAgICAgICAgICAgICAgICAgIG5baV0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICByZW1vdmVkTm9kZXMuYWRkKG5baV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmNhdGNoKChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSByZXBsYWNlbWVudC5ub2Rlcz8uZmlsdGVyKG4gPT4gQm9vbGVhbihuPy5wYXJlbnROb2RlKSk7XG4gICAgICAgICAgICBpZiAobj8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWU/LnZhbHVlID8/IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgICBuLnNsaWNlKDEpLmZvckVhY2goZSA9PiBlPy5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybihcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCByZXBsYWNlbWVudC5ub2Rlcz8ubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBudWxsO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICBhcCA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm5vZGVzKSB5aWVsZCogcmVwbGFjZW1lbnQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB5aWVsZCB0aGlzRG9jLmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgbm9kZXMsICAgIC8vIEJ1aWxkIERPTSBOb2RlW10gZnJvbSBDaGlsZFRhZ3NcbiAgICAgIFVuaXF1ZUlEXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtkIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoZCkgOiBkfWApO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveDxUPihhOiBUKTogVCB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodiwgdW5ib3gpIDogdikgYXMgVDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IE5vZGUsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNldCA9IGlzVGVzdEVudiB8fCAhKGQgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAoZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICAgID8gKGs6IHN0cmluZywgdjogYW55KSA9PiB7IGRba10gPSB2IH1cbiAgICAgICAgICA6IChrOiBzdHJpbmcsIHY6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKCh2ID09PSBudWxsIHx8IHR5cGVvZiB2ID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nIHx8IHR5cGVvZiB2ID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgJiYgKCEoayBpbiBkKSB8fCB0eXBlb2YgZFtrIGFzIGtleW9mIHR5cGVvZiBkXSAhPT0gJ3N0cmluZycpKVxuICAgICAgICAgICAgICBkLnNldEF0dHJpYnV0ZShrID09PSAnY2xhc3NOYW1lJyA/ICdjbGFzcycgOiBrLCBTdHJpbmcodikpO1xuICAgICAgICAgICAgZWxzZSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlZE5vZGVzLmhhcyhiYXNlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodiAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodiwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldChrLCB2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IGNvbnNvbGUubG9nKGBFeGNlcHRpb24gaW4gcHJvbWlzZWQgYXR0cmlidXRlICcke2t9J2AsIGVycm9yLCBsb2dOb2RlKGQpKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHNldChrLCBzW2tdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZShpdGVyOiBBc3luY0l0ZXJhYmxlPHVua25vd24+IHwgQXN5bmNJdGVyYXRvcjx1bmtub3duLCBhbnksIHVuZGVmaW5lZD4sIGs6IHN0cmluZykge1xuICAgICAgICAgIGNvbnN0IGFwID0gYXN5bmNJdGVyYXRvcihpdGVyKTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgICAgbGV0IG1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgbW91bnRlZCA9IG1vdW50ZWQgfHwgYmFzZS5pc0Nvbm5lY3RlZDtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBiZWVuIG1vdW50ZWQgYmVmb3JlLCBidXQgYXJlbid0IG5vdywgcmVtb3ZlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICBpZiAocmVtb3ZlZE5vZGVzLmhhcyhiYXNlKSkge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiKG5vZGUgcmVtb3ZlZClcIik7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc3REZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKTtcbiAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmICFtb3VudGVkICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW1lbnQgd2l0aCBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIG5vdCBtb3VudGVkIGFmdGVyICR7dGltZU91dFdhcm4vMTAwMH0gc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLlxcbkVsZW1lbnQgY29udGFpbnM6ICR7bG9nTm9kZShiYXNlKX1cXG4ke2NyZWF0ZWRCeX1gKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvclZhbHVlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkR5bmFtaWMgYXR0cmlidXRlIHRlcm1pbmF0aW9uXCIsIGVycm9yVmFsdWUsIGssIGxvZ05vZGUoZCksIGNyZWF0ZWRCeSwgbG9nTm9kZShiYXNlKSk7XG4gICAgICAgICAgICAgIGJhc2UuYXBwZW5kQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHVuYm94ZWQgPSBpdGVyLnZhbHVlT2YoKTtcbiAgICAgICAgICBpZiAodW5ib3hlZCAhPT0gdW5kZWZpbmVkICYmIHVuYm94ZWQgIT09IGl0ZXIgJiYgIWlzQXN5bmNJdGVyKHVuYm94ZWQpKVxuICAgICAgICAgICAgdXBkYXRlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB1bmJveGVkIH0pO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoW2Jhc2VdLCBrLCAoKSA9PiBhcC5yZXR1cm4/LigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQoaywgY29weSk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKHRoaXM6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIGU6IGFueSkge1xuICAgIGZvciAobGV0IGMgPSBlLmNvbnN0cnVjdG9yOyBjOyBjID0gYy5zdXBlcikge1xuICAgICAgaWYgKGMgPT09IHRoaXMpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmRlZCh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpIHtcbiAgICBjb25zdCBpbnN0YW5jZURlZmluaXRpb24gPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICA/IChpbnN0YW5jZTogSW5zdGFuY2UpID0+IE9iamVjdC5hc3NpZ24oe30sIF9vdmVycmlkZXMsIGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgKGlkQ291bnQrKykudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG4gICAgY29uc3Qgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk/LmFwcGVuZENoaWxkKHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgIH1cblxuICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgIC8vIChmaW5hbGx5KSBhc3NpZ25pbmcgdGhvc2Ugc3BlY2lmaWVkIGJ5IHRoZSBpbnN0YW50aWF0aW9uXG4gICAgY29uc3QgZXh0ZW5kVGFnRm46IEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgY29uc3Qgbm9BdHRycyA9IGlzQ2hpbGRUYWcoYXR0cnMpO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGNvbnN0IGlzQW5jZXN0cmFsID0gKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBrZXkgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihrID0+IChrIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVjbGFyZWQga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGFscmVhZHkgZXhpc3QgaW4gYmFzZSAnJHt0aGlzLnZhbHVlT2YoKX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKS5maWx0ZXIoayA9PiAhKGsgaW4gZSkgJiYgIShjb21tb25Qcm9wZXJ0aWVzICYmIGsgaW4gY29tbW9uUHJvcGVydGllcykgJiYgIWlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIGNvbnN0IHJlQXNzaWduID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICAgIHJlQXNzaWduLmFkZChrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGUhW2sgYXMga2V5b2YgdHlwZW9mIHRhZ0RlZmluaXRpb24uaXRlcmFibGVdKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGUuYXBwZW5kKC4uLm5vZGVzKGNoaWxkcmVuKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlLCB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgICAgLy8gYnkgYXNzaWduUHJvcHMgZnJvbSBhIGZ1dHVyZVxuICAgICAgICBjb25zdCBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlcyA9IHt9O1xuICAgICAgICBsZXQgaGFzSW5pdGlhbFZhbHVlcyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgaWYgKGJhc2UuaXRlcmFibGUpIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhiYXNlLml0ZXJhYmxlKSkge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgc2VsZi1hc3NpZ24gaXRlcmFibGVzIHRoYXQgaGF2ZSB0aGVtc2VsdmVzIGJlZW4gYXNzaWduZWQgd2l0aCBmdXR1cmVzXG4gICAgICAgICAgICBjb25zdCBhdHRyRXhpc3RzID0gIW5vQXR0cnMgJiYgayBpbiBhdHRycztcbiAgICAgICAgICAgIGlmICgocmVBc3NpZ24uaGFzKGspICYmIGF0dHJFeGlzdHMpIHx8ICEoYXR0ckV4aXN0cyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV0/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlc1trXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGhhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNJbml0aWFsVmFsdWVzKVxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oZSwgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kVGFnOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICBleHRlbmRlZCxcbiAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUgfHwge30pLCAuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLml0ZXJhYmxlIHx8IHt9KV07XG4gICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gXG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCBmdWxsUHJvdG8gPSB7fTtcbiAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4pIHtcbiAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgd2Fsa1Byb3RvKGNyZWF0b3Iuc3VwZXIpO1xuXG4gICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgIH1cbiAgICB9KSh0aGlzKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5vdmVycmlkZSk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcblxuICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgIDogdW5pcXVlVGFnSUQ7XG4gICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/IChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdID8/ICcnKSA6ICcnO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3QgZXh0cmFVbmtub3duUHJvcHMgPSBPYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zKS5maWx0ZXIoayA9PiAhWydzdHlsZXMnLCAnaWRzJywgJ2NvbnN0cnVjdGVkJywgJ2RlY2xhcmUnLCAnb3ZlcnJpZGUnLCAnaXRlcmFibGUnXS5pbmNsdWRlcyhrKSk7XG4gICAgICBpZiAoZXh0cmFVbmtub3duUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2V4dGVuZFRhZy5uYW1lfSBkZWZpbmVzIGV4dHJhbmVvdXMga2V5cyAnJHtleHRyYVVua25vd25Qcm9wc30nLCB3aGljaCBhcmUgdW5rbm93bmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kVGFnO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlRWxlbWVudDogQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddID0gKG5hbWUsIGF0dHJzLCAuLi5jaGlsZHJlbikgPT5cbiAgICAvLyBAdHMtaWdub3JlOiBFeHByZXNzaW9uIHByb2R1Y2VzIGEgdW5pb24gdHlwZSB0aGF0IGlzIHRvbyBjb21wbGV4IHRvIHJlcHJlc2VudC50cygyNTkwKVxuICAgIG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgIDogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIG5hbWUgaW4gYmFzZVRhZ0NyZWF0b3JzID8gYmFzZVRhZ0NyZWF0b3JzW25hbWVdKGF0dHJzLCBjaGlsZHJlbilcbiAgICA6IG5hbWUgPT09IGJhc2VUYWdDcmVhdG9ycy5jcmVhdGVFbGVtZW50ID8gWy4uLm5vZGVzKC4uLmNoaWxkcmVuKV1cbiAgICA6IHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nID8gbmFtZShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogbmV3IEVycm9yKFwiSWxsZWdhbCB0eXBlIGluIGNyZWF0ZUVsZW1lbnQ6XCIgKyBuYW1lKSB9KVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oazogSyk6IFRhZ0NyZWF0b3I8USAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWc8RSBleHRlbmRzIEVsZW1lbnQ+KGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIEUgJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnKGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIE5hbWVzcGFjZWRFbGVtZW50QmFzZSAmIFBvRWxlbWVudE1ldGhvZHM+IHtcbiAgICBpZiAoYmFzZVRhZ0NyZWF0b3JzW2tdKVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXTtcblxuICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnM6IFEgJiBQb0VsZW1lbnRNZXRob2RzICYgVGFnQ3JlYXRpb25PcHRpb25zIHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IHtcbiAgICAgIGlmIChpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgYXR0cnMgPSB7fSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgaWYgKGF0dHJzLmRlYnVnZ2VyKSB7XG4gICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgID8gdGhpc0RvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlIGFzIHN0cmluZywgay50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIDogdGhpc0RvYy5jcmVhdGVFbGVtZW50KGspO1xuICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcblxuICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyguLi5jaGlsZHJlbikpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmNsdWRpbmdFeHRlbmRlciA9IDxUYWdDcmVhdG9yPEVsZW1lbnQ+Pjx1bmtub3duPk9iamVjdC5hc3NpZ24odGFnQ3JlYXRvciwge1xuICAgICAgc3VwZXI6ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpIH0sXG4gICAgICBleHRlbmRlZCwgLy8gSG93IHRvIGV4dGVuZCB0aGlzIChiYXNlKSB0YWdcbiAgICAgIHZhbHVlT2YoKSB7IHJldHVybiBgVGFnQ3JlYXRvcjogPCR7bmFtZVNwYWNlIHx8ICcnfSR7bmFtZVNwYWNlID8gJzo6JyA6ICcnfSR7a30+YCB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba10gPSBpbmNsdWRpbmdFeHRlbmRlcjtcbiAgfVxuXG4gIHRhZ3MuZm9yRWFjaChjcmVhdGVUYWcpO1xuXG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn1cblxuLyogRE9NIG5vZGUgcmVtb3ZhbCBsb2dpYyAqL1xudHlwZSBQaWNrQnlUeXBlPFQsIFZhbHVlPiA9IHtcbiAgW1AgaW4ga2V5b2YgVCBhcyBUW1BdIGV4dGVuZHMgVmFsdWUgfCB1bmRlZmluZWQgPyBQIDogbmV2ZXJdOiBUW1BdXG59XG5mdW5jdGlvbiBtdXRhdGlvblRyYWNrZXIocm9vdDogTm9kZSkge1xuICBjb25zdCB0cmFja2VkID0gbmV3IFdlYWtTZXQ8Tm9kZT4oKTtcbiAgY29uc3QgcmVtb3ZhbHM6IFdlYWtNYXA8Tm9kZSwgTWFwPFN5bWJvbCB8IHN0cmluZywgKHRoaXM6IE5vZGUpPT52b2lkPj4gPSBuZXcgV2Vha01hcCgpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoIW5vZGUuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgLy8gTW9kZXJuIG9uUmVtb3ZlZEZyb21ET00gc3VwcG9ydFxuICAgICAgICBjb25zdCByZW1vdmFsU2V0ID0gcmVtb3ZhbHMuZ2V0KG5vZGUpO1xuICAgICAgICBpZiAocmVtb3ZhbFNldCkge1xuICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShub2RlKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB4XSBvZiByZW1vdmFsU2V0Py5lbnRyaWVzKCkpIHRyeSB7IHguY2FsbChub2RlKSB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSWdub3JlZCBleGNlcHRpb24gaGFuZGxpbmcgbm9kZSByZW1vdmFsXCIsIG5hbWUsIHgsIGxvZ05vZGUobm9kZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnICYmIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aClcbiAgICAgICAgd2FsayhtLnJlbW92ZWROb2RlcylcbiAgICB9KTtcbiAgfSkub2JzZXJ2ZShyb290LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICByZXR1cm4ge1xuICAgIGhhcyhlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuaGFzKGUpIH0sXG4gICAgYWRkKGU6Tm9kZSkgeyByZXR1cm4gdHJhY2tlZC5hZGQoZSkgfSxcbiAgICBnZXRSZW1vdmFsSGFuZGxlcihlOiBOb2RlLCBuYW1lOiBTeW1ib2wpIHtcbiAgICAgIHJldHVybiByZW1vdmFscy5nZXQoZSk/LmdldChuYW1lKTtcbiAgICB9LFxuICAgIG9uUmVtb3ZhbChlOiBOb2RlW10sIG5hbWU6IFN5bWJvbCB8IHN0cmluZywgaGFuZGxlcj86ICh0aGlzOiBOb2RlKT0+dm9pZCkge1xuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgZS5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IHJlbW92YWxzLmdldChlKSA/PyBuZXcgTWFwPFN5bWJvbCB8IHN0cmluZywgKCk9PnZvaWQ+KCk7XG4gICAgICAgICAgcmVtb3ZhbHMuc2V0KGUsIG1hcCk7XG4gICAgICAgICAgbWFwLnNldChuYW1lLCBoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZS5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IHJlbW92YWxzLmdldChlKTtcbiAgICAgICAgICBpZiAobWFwKSB7XG4gICAgICAgICAgICBtYXAuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCFtYXAuc2l6ZSlcbiAgICAgICAgICAgICAgcmVtb3ZhbHMuZGVsZXRlKGUpXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuIiwgIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBCb29sZWFuKGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykpIHx8IGZhbHNlO1xuZXhwb3J0IHsgX2NvbnNvbGUgYXMgY29uc29sZSB9O1xuZXhwb3J0IGNvbnN0IHRpbWVPdXRXYXJuID0gNTAwMDtcblxuY29uc3QgX2NvbnNvbGUgPSB7XG4gIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCcoQUktVUkpIExPRzonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgd2FybiguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUud2FybignKEFJLVVJKSBXQVJOOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICBpbmZvKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5pbmZvKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmNvbnN0IGRlYnVnSWQgPSBTeW1ib2woXCJkZWZlcnJlZFByb21pc2VJRFwiKTtcblxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG4gIFtkZWJ1Z0lkXT86IG51bWJlclxufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5sZXQgaWQgPSAxO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIHByb21pc2VbZGVidWdJZF0gPSBpZCsrO1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gVHJ1ZSBpZiBgZXhwciBpbiB4YCBpcyB2YWxpZFxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh4OiBhbnkpOiB4IGlzIEZ1bmN0aW9uIHwge30ge1xuICByZXR1cm4geCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UoeCkgJiYgKCd0aGVuJyBpbiB4KSAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIlxuaW1wb3J0IHsgRGVmZXJyZWRQcm9taXNlLCBkZWZlcnJlZCwgaXNPYmplY3RMaWtlLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlvblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdGUgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgVGhpcyByZWxpZXMgb24gYSBoYWNrIHRvIGB3cmFwQXN5bmNIZWxwZXJgIGluIGl0ZXJhdG9ycy50cyB3aGljaCAqYWNjZXB0cyogYSBQYXJ0aWFsPEFzeW5jSXRlcmF0b3I+XG4gIGJ1dCBjYXN0cyBpdCB0byBhIEFzeW5jSXRlcmF0b3IgYmVmb3JlIHVzZS5cblxuICBUaGUgaXRlcmFiaWxpdHkgb2YgcHJvcGVydHlzIG9mIGFuIG9iamVjdCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBwcmVzZW5jZSBhbmQgdmFsdWUgb2YgdGhlIGBJdGVyYWJpbGl0eWAgc3ltYm9sLlxuICBCeSBkZWZhdWx0LCB0aGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgZGVlcCBtYXBwaW5nLCBzbyBhbiBpdGVyYWJsZSBwcm9wZXJ0eSAnb2JqJyBpcyBpdHNlbGZcbiAgaXRlcmFibGUsIGFzIGFyZSBpdCdzIG1lbWJlcnMuIFRoZSBvbmx5IGRlZmluZWQgdmFsdWUgYXQgcHJlc2VudCBpcyBcInNoYWxsb3dcIiwgaW4gd2hpY2ggY2FzZSAnb2JqJyByZW1haW5zXG4gIGl0ZXJhYmxlLCBidXQgaXQncyBtZW1iZXRycyBhcmUganVzdCBQT0pTIHZhbHVlcy5cbiovXG5cbi8vIEJhc2UgdHlwZXMgdGhhdCBjYW4gYmUgbWFkZSBkZWZpbmVkIGFzIGl0ZXJhYmxlOiBiYXNpY2FsbHkgYW55dGhpbmdcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgPSAoc3RyaW5nIHwgbnVtYmVyIHwgYmlnaW50IHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwgfCBvYmplY3QgfCBGdW5jdGlvbiB8IHN5bWJvbClcbi8vIFdlIHNob3VsZCBleGNsdWRlIEFzeW5jSXRlcmFibGUgZnJvbSB0aGUgdHlwZXMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gaXRlcmFibGVzIChhbmQgdGhlcmVmb3JlIHBhc3NlZCB0byBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KVxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVZhbHVlID0gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSAvLyBFeGNsdWRlPEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUsIEFzeW5jSXRlcmF0b3I8YW55PiB8IEFzeW5jSXRlcmFibGU8YW55Pj5cblxuZXhwb3J0IGNvbnN0IEl0ZXJhYmlsaXR5ID0gU3ltYm9sKFwiSXRlcmFiaWxpdHlcIik7XG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiB7IFtJdGVyYWJpbGl0eV06IERlcHRoIH1cblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBUaGlzIGlzIHBhdGNoIHRvIHRoZSBzdGQgbGliIGRlZmluaXRpb24gb2YgQXJyYXk8VD4uIEkgZG9uJ3Qga25vdyB3aHkgaXQncyBhYnNlbnQsXG4gIC8vIGFzIHRoaXMgaXMgdGhlIGltcGxlbWVudGF0aW9uIGluIGFsbCBKYXZhU2NyaXB0IGVuZ2luZXMuIEl0IGlzIHByb2JhYmx5IGEgcmVzdWx0XG4gIC8vIG9mIGl0cyBhYnNlbmNlIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3ZhbHVlcyxcbiAgLy8gd2hpY2ggaW5oZXJpdHMgZnJvbSB0aGUgT2JqZWN0LnByb3RvdHlwZSwgd2hpY2ggbWFrZXMgbm8gY2xhaW0gZm9yIHRoZSByZXR1cm4gdHlwZVxuICAvLyBzaW5jZSBpdCBjb3VsZCBiZSBvdmVycmlkZGVtLiBIb3dldmVyLCBpbiB0aGF0IGNhc2UsIGEgVFMgZGVmbiBzaG91bGQgYWxzbyBvdmVycmlkZSBpdFxuICAvLyBsaWtlIE51bWJlciwgU3RyaW5nLCBCb29sZWFuIGV0YyBkby5cbiAgaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICB2YWx1ZU9mKCk6IEFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczogVCk6IElzSXRlcmFibGVQcm9wZXJ0eTxULCBPYmplY3Q+XG4gIH1cbn1cblxuLypcbiAgICAgIEJlY2F1c2UgVFMgZG9lc24ndCBpbXBsZW1lbnQgc2VwYXJhdGUgdHlwZXMgZm9yIHJlYWQvd3JpdGUsIG9yIGNvbXB1dGVkIGdldHRlci9zZXR0ZXIgbmFtZXMgKHdoaWNoIERPIGFsbG93XG4gICAgICBkaWZmZXJlbnQgdHlwZXMgZm9yIGFzc2lnbm1lbnQgYW5kIGV2YWx1YXRpb24pLCBpdCBpcyBub3QgcG9zc2libGUgdG8gZGVmaW5lIHR5cGUgZm9yIGFycmF5IG1lbWJlcnMgdGhhdCBwZXJtaXRcbiAgICAgIGRlcmVmZXJlbmNpbmcgb2Ygbm9uLWNsYXNoaW5oIGFycmF5IGtleXMgc3VjaCBhcyBgam9pbmAgb3IgYHNvcnRgIGFuZCBBc3luY0l0ZXJhdG9yIG1ldGhvZHMgd2hpY2ggYWxzbyBhbGxvd3NcbiAgICAgIHNpbXBsZSBhc3NpZ25tZW50IG9mIHRoZSBmb3JtIGB0aGlzLml0ZXJhYmxlQXJyYXlNZW1iZXIgPSBbLi4uXWAuXG5cbiAgICAgIFRoZSBDT1JSRUNUIHR5cGUgZm9yIHRoZXNlIGZpZWxkcyB3b3VsZCBiZSAoaWYgVFMgaGFkIHN5bnRheCBmb3IgaXQpOlxuICAgICAgZ2V0IFtLXSAoKTogT21pdDxBcnJheTxFICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEU+LCBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXM+ICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEVbXT5cbiAgICAgIHNldCBbS10gKCk6IEFycmF5PEU+IHwgQXN5bmNFeHRyYUl0ZXJhYmxlPEVbXT5cbiovXG50eXBlIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cyA9IGtleW9mIEFycmF5PGFueT4gJiBrZXlvZiBBc3luY0l0ZXJhYmxlSGVscGVyc1xuXG5leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBbVF0gZXh0ZW5kcyBbaW5mZXIgVV0gPyBVICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VT4+IDogbmV2ZXI7XG5cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxUPiA9IFtUXSBleHRlbmRzIFtpbmZlciBJUF0gP1xuICBbSVBdIGV4dGVuZHMgW1BhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPHVua25vd24+Pl0gfCBbSXRlcmFiaWxpdHk8J3NoYWxsb3cnPl0gPyBJUFxuICA6IFtJUF0gZXh0ZW5kcyBbb2JqZWN0XSA/XG4gICAgSVAgZXh0ZW5kcyBBcnJheTxpbmZlciBFPiA/IE9taXQ8SXRlcmFibGVQcm9wZXJ0aWVzPEU+W10sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+PlxuICA6IHsgW0sgaW4ga2V5b2YgSVBdOiBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+ICYgSXRlcmFibGVUeXBlPElQW0tdPiB9XG4gIDogSXRlcmFibGVUeXBlPElQPlxuICA6IG5ldmVyO1xuXG5leHBvcnQgdHlwZSBJc0l0ZXJhYmxlUHJvcGVydHk8USwgUiA9IG5ldmVyPiA9IFtRXSBleHRlbmRzIFtQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxpbmZlciBWPj5dID8gViA6IFJcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5jb25zdCBpdGVyYXRvckNhbGxTaXRlID0gU3ltYm9sKFwiSXRlcmF0b3JDYWxsU2l0ZVwiKTtcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbjxEIGV4dGVuZHMgb2JqZWN0LCBTIGV4dGVuZHMgb2JqZWN0PihkOiBELCBzOiBTKSB7XG4gIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocyksIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyldO1xuICBmb3IgKGNvbnN0IGsgb2Yga2V5cykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCB7IC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocywgayksIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICB9XG4gIGlmIChERUJVRykge1xuICAgIGlmICghKGl0ZXJhdG9yQ2FsbFNpdGUgaW4gZCkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBpdGVyYXRvckNhbGxTaXRlLCB7IHZhbHVlOiBuZXcgRXJyb3IoKS5zdGFjayB9KVxuICB9XG4gIHJldHVybiBkIGFzIEQgJiBTO1xufVxuXG5jb25zdCBfcGVuZGluZyA9IFN5bWJvbCgncGVuZGluZycpO1xuY29uc3QgX2l0ZW1zID0gU3ltYm9sKCdpdGVtcycpO1xuZnVuY3Rpb24gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSB7XG4gICAgW19wZW5kaW5nXTogW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbCxcbiAgICBbX2l0ZW1zXTogW10gYXMgSXRlcmF0b3JSZXN1bHQ8VD5bXSB8IG51bGwsXG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHEgYXMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKHFbX2l0ZW1zXT8ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocVtfaXRlbXNdLnNoaWZ0KCkhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBxW19wZW5kaW5nXS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiB1bmtub3duKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgdGhyb3coLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlamVjdCh2YWx1ZS52YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbX2l0ZW1zXS5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBfaW5mbGlnaHQgPSBTeW1ib2woJ2luZmxpZ2h0Jyk7XG5mdW5jdGlvbiBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+PiAmIHsgW19pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW19pbmZsaWdodF0gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgcS5wdXNoID0gZnVuY3Rpb24gKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERlYm91bmNlXG4gICAgaWYgKHFbX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICBxW19pbmZsaWdodF0uYWRkKHZhbHVlKTtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdi52YWx1ZSA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyBvYmplY3QsIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTogZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGFzICh0eXBlb2YgYXN5bmNFeHRyYXMpW01dXG4gICAgfVttZXRob2RdO1xuICB9XG5cbiAgY29uc3QgZXh0cmFzID0geyBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiBpbml0SXRlcmF0b3IgfSBhcyBBc3luY0V4dHJhSXRlcmFibGU8Vj4gJiB7IFtJdGVyYWJpbGl0eV0/OiAnc2hhbGxvdycgfTtcbiAgZXh0cmFLZXlzLmZvckVhY2goKGspID0+IC8vIEB0cy1pZ25vcmVcbiAgICBleHRyYXNba10gPSBsYXp5QXN5bmNNZXRob2QoaykpXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2ICYmIHZbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpIHtcbiAgICBleHRyYXNbSXRlcmFiaWxpdHldID0gdltJdGVyYWJpbGl0eV07XG4gIH1cblxuICAvLyBMYXppbHkgaW5pdGlhbGl6ZSBgcHVzaGBcbiAgbGV0IHB1c2g6IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+WydwdXNoJ10gPSAodjogVikgPT4ge1xuICAgIGluaXRJdGVyYXRvcigpOyAvLyBVcGRhdGVzIGBwdXNoYCB0byByZWZlcmVuY2UgdGhlIG11bHRpLXF1ZXVlXG4gICAgcmV0dXJuIHB1c2godik7XG4gIH1cblxuICBsZXQgYSA9IGJveCh2LCBleHRyYXMpO1xuICBsZXQgcGlwZWQ6IEFzeW5jSXRlcmFibGU8Vj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgIGdldCgpOiBWIHsgcmV0dXJuIGEgfSxcbiAgICBzZXQodjogViB8IEFzeW5jRXh0cmFJdGVyYWJsZTxWPikge1xuICAgICAgaWYgKHYgIT09IGEpIHtcbiAgICAgICAgaWYgKGlzQXN5bmNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgIC8vIEFzc2lnbmluZyBtdWx0aXBsZSBhc3luYyBpdGVyYXRvcnMgdG8gYSBzaW5nbGUgaXRlcmFibGUgaXMgcHJvYmFibHkgYVxuICAgICAgICAgIC8vIGJhZCBpZGVhIGZyb20gYSByZWFzb25pbmcgcG9pbnQgb2YgdmlldywgYW5kIG11bHRpcGxlIGltcGxlbWVudGF0aW9uc1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZTpcbiAgICAgICAgICAvLyAgKiBtZXJnZT9cbiAgICAgICAgICAvLyAgKiBpZ25vcmUgc3Vic2VxdWVudCBhc3NpZ25tZW50cz9cbiAgICAgICAgICAvLyAgKiB0ZXJtaW5hdGUgdGhlIGZpcnN0IHRoZW4gY29uc3VtZSB0aGUgc2Vjb25kP1xuICAgICAgICAgIC8vIFRoZSBzb2x1dGlvbiBoZXJlIChvbmUgb2YgbWFueSBwb3NzaWJpbGl0aWVzKSBpcyB0aGUgbGV0dGVyOiBvbmx5IHRvIGFsbG93XG4gICAgICAgICAgLy8gbW9zdCByZWNlbnQgYXNzaWdubWVudCB0byB3b3JrLCB0ZXJtaW5hdGluZyBhbnkgcHJlY2VlZGluZyBpdGVyYXRvciB3aGVuIGl0IG5leHRcbiAgICAgICAgICAvLyB5aWVsZHMgYW5kIGZpbmRzIHRoaXMgY29uc3VtZXIgaGFzIGJlZW4gcmUtYXNzaWduZWQuXG5cbiAgICAgICAgICAvLyBJZiB0aGUgaXRlcmF0b3IgaGFzIGJlZW4gcmVhc3NpZ25lZCB3aXRoIG5vIGNoYW5nZSwganVzdCBpZ25vcmUgaXQsIGFzIHdlJ3JlIGFscmVhZHkgY29uc3VtaW5nIGl0XG4gICAgICAgICAgaWYgKHBpcGVkID09PSB2KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgcGlwZWQgPSB2IGFzIEFzeW5jSXRlcmFibGU8Vj47XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8obmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2IGFzIEFzeW5jSXRlcmFibGU8Vj4sIHkgPT4ge1xuICAgICAgICAgICAgaWYgKHYgIT09IHBpcGVkKSB7XG4gICAgICAgICAgICAgIC8vIFdlJ3JlIGJlaW5nIHBpcGVkIGZyb20gc29tZXRoaW5nIGVsc2UuIFdlIHdhbnQgdG8gc3RvcCB0aGF0IG9uZSBhbmQgZ2V0IHBpcGVkIGZyb20gdGhpcyBvbmVcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaXBlZCBpdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIHJlcGxhY2VkIGJ5IGFub3RoZXIgaXRlcmF0b3JgLCB7IGNhdXNlOiBzdGFjayB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB1c2goeT8udmFsdWVPZigpIGFzIFYpXG4gICAgICAgICAgfSkuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+ICh2ID09PSBwaXBlZCkgJiYgKHBpcGVkID0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgICAvLyBFYXJseSByZXR1cm4gYXMgd2UncmUgZ29pbmcgdG8gcGlwZSB2YWx1ZXMgaW4gbGF0ZXJcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBpcGVkICYmIERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IHBpcGVkIGZyb20gYW5vdGhlciBpdGVyYXRvciwgYW5kIG1pZ2h0IGJlIG92ZXJyd2l0dGVuIGxhdGVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8Vj4pOiBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+IHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH1cbiAgICAgIH0pLCBwZHMpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QoYSksIE9iamVjdC5hc3NpZ24ocGRzLCB7XG4gICAgICAgICAgdG9KU09OKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfVxuICAgICAgICB9KSk7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAvLyBUaGUgcHJveGllcyBhcmUgcmVjdXJzaXZlLCBzbyB0aGF0IGlmIGFuIG9iamVjdCBjb250YWlucyBvYmplY3RzLCB0aGV5IHRvbyBhcmUgcHJveGllZC4gT2JqZWN0cyBjb250YWluaW5nIHByaW1pdGl2ZXMgcmVtYWluIHByb3hpZWQgdG9cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBnZXQvc2V0L3NlbGV0ZSBpbiBwbGFjZSBvZiB0aGUgdXN1YWwgcHJpbWl0aXZlIGJveGluZyB2aWEgT2JqZWN0KHByaW1pdGl2ZVZhbHVlKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBib3hPYmplY3QoYSwgcGRzKTtcblxuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBvZiB0eXBlIFwiJyArIHR5cGVvZiBhICsgJ1wiJyk7XG4gIH1cblxuICB0eXBlIFdpdGhQYXRoID0geyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhOiBWLCBwYXRoOiBzdHJpbmcgfCBudWxsIH0gfTtcbiAgdHlwZSBQb3NzaWJseVdpdGhQYXRoID0gViB8IFdpdGhQYXRoO1xuICBmdW5jdGlvbiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG86IFBvc3NpYmx5V2l0aFBhdGgpOiBvIGlzIFdpdGhQYXRoIHtcbiAgICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aCAmJiAoKG8gPSBvPy5bZmllbGRzW2ldXSkgIT09IHVuZGVmaW5lZCk7IGkrKyk7XG4gICAgcmV0dXJuIG87XG4gIH1cbiAgZnVuY3Rpb24gYm94T2JqZWN0KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFBvc3NpYmx5V2l0aFBhdGg+KSB7XG4gICAgbGV0IHdpdGhQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICAgIHJldHVybiBuZXcgUHJveHkoYSBhcyBvYmplY3QsIGhhbmRsZXIoKSkgYXMgViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIocGF0aCA9ICcnKTogUHJveHlIYW5kbGVyPG9iamVjdD4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQSBib3hlZCBvYmplY3QgaGFzIGl0cyBvd24ga2V5cywgYW5kIHRoZSBrZXlzIG9mIGFuIEFzeW5jRXh0cmFJdGVyYWJsZVxuICAgICAgICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5ID09PSBfcHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGEga2V5IGlzIHNldCBpbiB0aGUgdGFyZ2V0LCBwdXNoIHRoZSBjaGFuZ2VcbiAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgd2l0aG91dFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXS5hIDogbyk7XG4gICAgICAgICAgICAgIHJldHVybiB3aXRob3V0UGF0aFtrZXkgYXMga2V5b2YgdHlwZW9mIHBkc107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aXRoUGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdIDogeyBhOiBvLCBwYXRoOiBudWxsIH0pO1xuXG4gICAgICAgICAgICAgIGxldCBhaSA9IGZpbHRlck1hcCh3aXRoUGF0aCwgKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gZGVzdHJ1Y3R1cmUoby5hLCBwYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCAhPT0gdiB8fCBvLnBhdGggPT09IG51bGwgfHwgby5wYXRoLnN0YXJ0c1dpdGgocGF0aCkgPyB2IDogSWdub3JlO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnIHx8IChrZXkgPT09ICd0b0pTT04nICYmICEoJ3RvSlNPTicgaW4gdGFyZ2V0KSkpXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoaW50PzogJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuLy9jb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdCA9IG5ldyBNYXA8bnVtYmVyLCAodW5kZWZpbmVkIHwgQXN5bmNJdGVyYXRvcjxhbnk+KT4oKTtcbiAgY29uc3QgcHJvbWlzZXMgPSBuZXcgTWFwPG51bWJlcixQcm9taXNlPHsga2V5OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55PiB9Pj4oKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCkgPT4geyB9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBjb25zdCBpdGVyID0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSA/IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgOiBhIGFzIEFzeW5jSXRlcmF0b3I8YW55PjtcbiAgICAgIGl0LnNldChuLCBpdGVyKTtcbiAgICAgIHByb21pc2VzLnNldChuLCBpdGVyLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBrZXk6IG4sIHJlc3VsdCB9KSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IChUWWllbGQgfCBUUmV0dXJuKVtdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBwcm9taXNlcy5zaXplXG4gICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzLnZhbHVlcygpKS50aGVuKCh7IGtleSwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgaXQuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZXMuc2V0KGtleSxcbiAgICAgICAgICAgICAgaXQuaGFzKGtleSlcbiAgICAgICAgICAgICAgICA/IGl0LmdldChrZXkpIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsga2V5LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGtleSwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9IH0pKVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsga2V5LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9IH0pKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdyEoZXgpIC8vID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBpdC5rZXlzKCkpIHtcbiAgICAgICAgaWYgKHByb21pc2VzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgcmVzdWx0c1trZXldID0gYXdhaXQgaXQuZ2V0KGtleSk/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGl0LmtleXMoKSkge1xuICAgICAgICBpZiAocHJvbWlzZXMuaGFzKGtleSkpIHtcbiAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICByZXN1bHRzW2tleV0gPSBhd2FpdCBpdC5nZXQoa2V5KT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQgYXMgdW5rbm93biBhcyBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8QVtudW1iZXJdPik7XG59XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZSA9IHsgW2s6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbF06IFBhcnRpYWxJdGVyYWJsZSB9O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSB7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmVPcHRpb25zIHtcbiAgaWdub3JlUGFydGlhbD86IGJvb2xlYW47IC8vIFNldCB0byBhdm9pZCB5aWVsZGluZyBpZiBzb21lIHNvdXJjZXMgYXJlIGFic2VudFxufVxuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4oc3JjOiBTLCBvcHRzOiBDb21iaW5lT3B0aW9ucyA9IHt9KTogQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPiA9PiB7XG4gIGNvbnN0IGFjY3VtdWxhdGVkOiBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPiA9IHt9O1xuICBjb25zdCBzaSA9IG5ldyBNYXA8c3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCBBc3luY0l0ZXJhdG9yPGFueT4+KCk7XG4gIGxldCBwYzogTWFwPHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgUHJvbWlzZTx7IGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT4+OyAvLyBJbml0aWFsaXplZCBsYXppbHlcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSkgPT4ge1xuICAgICAgICAgIHNpLnNldChrLCBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpKTtcbiAgICAgICAgICByZXR1cm4gW2ssIHNpLmdldChrKSEubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGssIGlyIH0pKV07XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMudmFsdWVzKCkpLnRoZW4oKHsgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwYy5kZWxldGUoayk7XG4gICAgICAgICAgICBzaS5kZWxldGUoayk7XG4gICAgICAgICAgICBpZiAoIXBjLnNpemUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICBwYy5zZXQoaywgc2kuZ2V0KGspIS5uZXh0KCkudGhlbihpciA9PiAoeyBrLCBpciB9KSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3QgYWkgb2Ygc2kudmFsdWVzKCkpIHtcbiAgICAgICAgICBhaS5yZXR1cm4/Lih2KVxuICAgICAgfTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICB9LFxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3QgYWkgb2Ygc2kudmFsdWVzKCkpXG4gICAgICAgIGFpLnRocm93Py4oZXgpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn1cblxuXG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGU8VD4oaTogYW55KTogaSBpcyBBc3luY0V4dHJhSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgJiYgZXh0cmFLZXlzLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgKGkgYXMgYW55KVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuXG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnM8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4oYWk6IEEpOiBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IHVua25vd24+IHtcbiAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgYXNzaWduSGlkZGVuKGFpLCBhc3luY0V4dHJhcyk7XG4gIH1cbiAgcmV0dXJuIGFpIGFzIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICYgQSA6IG5ldmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzPEcgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFIsIFIgZXh0ZW5kcyBBc3luY0dlbmVyYXRvcj4oZzogRykge1xuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEY+ID1cbiAgRiBleHRlbmRzICgpID0+IEFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVuZGVmaW5lZCB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPiA9IHVuZGVmaW5lZDtcbiAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMgYXMgQXN5bmNJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pikge1xuICAgIGxhc3QgPSBmPy4odSk7XG4gIH1cbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPik7XG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuXG50eXBlIFBhcnRpYWxJdGVyYWJsZTxUID0gYW55PiA9IFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUPj47XG5cbmZ1bmN0aW9uIHJlc29sdmVTeW5jPFosIFI+KHY6IE1heWJlUHJvbWlzZWQ8Wj4sIHRoZW46ICh2OiBaKSA9PiBSLCBleGNlcHQ6ICh4OiBhbnkpID0+IGFueSk6IE1heWJlUHJvbWlzZWQ8Uj4ge1xuICBpZiAoaXNQcm9taXNlTGlrZSh2KSlcbiAgICByZXR1cm4gdi50aGVuKHRoZW4sIGV4Y2VwdCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHRoZW4odilcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXR1cm4gZXhjZXB0KGV4KVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpe1xuICAgIC8vIEB0cy1pZ25vcmUgLSByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IGZhaSA9IG51bGw7XG4gICAgcHJldiA9IElnbm9yZTtcbiAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfVxuICB9XG4gIGxldCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gKHByZXYgPSBJZ25vcmUsIHJlc29sdmUocCkpXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VSZXNwb25zZSA9IGFpLnRocm93Py4oZXgpID8/IGFpLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgICAgICAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAoYWkpIGFuZCBjb25zdW1lciAocmVqZWN0KVxuICAgICAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZVJlc3BvbnNlKSkgc291cmNlUmVzcG9uc2UudGhlbihyZWplY3QscmVqZWN0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVJlc3BvbnNlID0gYWkudGhyb3c/LihleCkgPz8gYWkucmV0dXJuPy4oZXgpO1xuICAgICAgICAgIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIChhaSkgYW5kIGNvbnN1bWVyIChyZWplY3QpXG4gICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlUmVzcG9uc2UpKSBzb3VyY2VSZXNwb25zZS50aGVuKHJlamVjdCwgcmVqZWN0KTtcbiAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBzb3VyY2VSZXNwb25zZSB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lLCBkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoaXQ/LmRvbmUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgYWkhLm5leHQoKVxuICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGN1cnJlbnQ/LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KTtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgICAgIGN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpIHtcbiAgICAvLyBAdHMtaWdub3JlOiByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IG1haSA9IGN1cnJlbnQgPSBudWxsO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cblxuICBsZXQgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgZmluYWwgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93Py4oZXgpID8/IGFpPy5yZXR1cm4/LihleCkpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG50eXBlIFdoZW5QYXJhbWV0ZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFZhbGlkV2hlblNlbGVjdG9yPElEUz5cbiAgfCBFbGVtZW50IC8qIEltcGxpZXMgXCJjaGFuZ2VcIiBldmVudCAqL1xuICB8IFByb21pc2U8YW55PiAvKiBKdXN0IGdldHMgd3JhcHBlZCBpbiBhIHNpbmdsZSBgeWllbGRgICovXG4gIHwgQXN5bmNJdGVyYWJsZTxhbnk+XG5cbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFdoZW5QYXJhbWV0ZXI8SURTPj5cblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXJcblxuLy8gVGhlIGV4dGVuZGVkIGl0ZXJhdG9yIHRoYXQgc3VwcG9ydHMgYXN5bmMgaXRlcmF0b3IgbWFwcGluZywgY2hhaW5pbmcsIGV0Y1xuZXhwb3J0IHR5cGUgV2hlblJldHVybjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgTWFwcGFibGVJdGVyYWJsZTxcbiAgICBBc3luY0V4dHJhSXRlcmFibGU8XG4gICAgICBXaGVuSXRlcmF0ZWRUeXBlPFM+Pj5cblxudHlwZSBFbXB0eU9iamVjdCA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIG5ldmVyPlxuXG5pbnRlcmZhY2UgU3BlY2lhbFdoZW5FdmVudHMge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn1cblxuZXhwb3J0IGNvbnN0IFJlYWR5ID0gT2JqZWN0LmZyZWV6ZSh7fSk7XG5cbmludGVyZmFjZSBXaGVuRXZlbnRzIGV4dGVuZHMgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwLCBTcGVjaWFsV2hlbkV2ZW50cyB7fVxudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlclxuXG50eXBlIEV2ZW50TmFtZVVuaW9uPFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogUyB8IEV2ZW50TmFtZUxpc3Q8Uj5cbiAgOiBuZXZlclxuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxuLy8gTm90ZTogdGhpcyBzbG93cyBkb3duIHR5cGVzY3JpcHQuIFNpbXBseSBkZWZpbmluZyBgQ1NTSWRlbnRpZmllciA9IHN0cmluZ2AgaXMgcXVpY2tlciwgYnV0IHByZXZlbnRzIHdoZW4gdmFsaWRhdGluZyBzdWItSURTcyBvciBzZWxlY3RvciBmb3JtYXR0aW5nXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8IGAjJHtJRFN9PmAgfCBgLiR7c3RyaW5nfWAgfCBgWyR7c3RyaW5nfV1gXG5cbi8qIFZhbGlkV2hlblNlbGVjdG9ycyBhcmU6XG4gICAgQHN0YXJ0XG4gICAgQHJlYWR5XG4gICAgZXZlbnQ6c2VsZWN0b3JcbiAgICBldmVudCAgICAgICAgICAgXCJ0aGlzXCIgZWxlbWVudCwgZXZlbnQgdHlwZT0nZXZlbnQnXG4gICAgc2VsZWN0b3IgICAgICAgIHNwZWNpZmljZWQgc2VsZWN0b3JzLCBpbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnRcbiovXG5cbmV4cG9ydCB0eXBlIFZhbGlkV2hlblNlbGVjdG9yPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgJHtrZXlvZiBTcGVjaWFsV2hlbkV2ZW50c31gXG4gIHwgYCR7RXZlbnRBdHRyaWJ1dGV9OiR7Q1NTSWRlbnRpZmllcjxJRFM+fWBcbiAgfCBFdmVudEF0dHJpYnV0ZVxuICB8IENTU0lkZW50aWZpZXI8SURTPlxuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz4gPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXJcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtDU1NJZGVudGlmaWVyfWAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzID8gRXZlbnROYW1lVW5pb248Uz4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Uz5cbiAgOiBTIGV4dGVuZHMgQ1NTSWRlbnRpZmllciA/ICdjaGFuZ2UnXG4gIDogbmV2ZXJcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl1cblxuLyoqIHdoZW4gKiovXG5pbnRlcmZhY2UgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lclJlZjogV2Vha1JlZjxFbGVtZW50PlxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbDtcbiAgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuO1xufVxuXG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBXZWFrTWFwPERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXModGhpcykpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KHRoaXMpIS5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lclJlZiwgc2VsZWN0b3IsIGluY2x1ZGVDaGlsZHJlbiB9ID0gbztcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gY29udGFpbmVyUmVmLmRlcmVmKCk7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyPy5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChpbmNsdWRlQ2hpbGRyZW4gPyBuLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IG4pICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gPyBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gY29udGFpbmVyIClcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRsZXNzPFQgZXh0ZW5kcyBzdHJpbmcgfCBudWxsPihzZWw6IFQpOiBUIGV4dGVuZHMgbnVsbCA/IHsgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9IDogeyBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIHNlbGVjdG9yOiBUIH0ge1xuICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSAhc2VsIHx8ICFzZWwuZW5kc1dpdGgoJz4nKVxuICByZXR1cm4geyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yOiBpbmNsdWRlQ2hpbGRyZW4gPyBzZWwgOiBzZWwuc2xpY2UoMCwtMSkgfSBhcyBhbnk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW1JldHVyblR5cGU8dHlwZW9mIGNoaWxkbGVzcz4sIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzBdKSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW3sgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9LCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzFdKSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3sgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3Rvcn0sIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGNvbnRhaW5lci5vd25lckRvY3VtZW50KSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQsIG5ldyBNYXAoKSk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5oYXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnRhaW5lci5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmdldChldmVudE5hbWUpO1xuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBvYnNlcnZhdGlvbnMhLmRlbGV0ZShkZXRhaWxzKSk7XG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXJSZWY6IG5ldyBXZWFrUmVmKGNvbnRhaW5lciksXG4gICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgIHNlbGVjdG9yXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IG9ic2VydmF0aW9ucyEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBkb25lSW1tZWRpYXRlbHk8Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgcmV0dXJuIHVuZGVmaW5lZCBhcyBaO1xufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcik6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGNvbnN0IGlzTWlzc2luZyA9IChzZWw6IENTU0lkZW50aWZpZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIgPT4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMubWFwKHcgPT4gdz8uc2VsZWN0b3IpLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IGRvbmVJbW1lZGlhdGVseSgpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogUmVhZHkgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChkb25lSW1tZWRpYXRlbHk8V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgZnVuY3Rpb24gY29udGFpbmVySXNJbkRPTSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgIGlmIChjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IFsuLi5yLnJlbW92ZWROb2Rlc10uc29tZShyID0+IHIgPT09IGNvbnRhaW5lciB8fCByLmNvbnRhaW5zKGNvbnRhaW5lcikpKSkge1xuICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiUmVtb3ZlZCBmcm9tIERPTVwiKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9ic2VydmUoY29udGFpbmVyLm93bmVyRG9jdW1lbnQuYm9keSwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBFbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyICR7dGltZU91dFdhcm4gLyAxMDAwfSBzZWNvbmRzOmApO1xuICAgICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihzdGFjayArIFwiXFxuXCIgKyBjb250YWluZXIub3V0ZXJIVE1MKTtcbiAgICAgICAgLy9yZWplY3QobmV3IEVycm9yKFwiRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHNcIikpO1xuICAgICAgfSwgdGltZU91dFdhcm4pO1xuXG4gICAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhbGxTZWxlY3RvcnNQcmVzZW50KG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSlcbiAgICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICBpZiAobWlzc2luZy5ldmVyeShzZWwgPT4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9KSk7XG5cbiAgICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgYE1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyICR7dGltZU91dFdhcm4gLyAxMDAwfSBzZWNvbmRzOiBgKSA/PyAnPz8nO1xuICAgICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihzdGFjayArIG1pc3NpbmcgKyBcIlxcblwiKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG4gIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICByZXR1cm4gY29udGFpbmVySXNJbkRPTSgpLnRoZW4oKCkgPT4gYWxsU2VsZWN0b3JzUHJlc2VudChzZWxlY3RvcnMpKVxuICByZXR1cm4gY29udGFpbmVySXNJbkRPTSgpO1xufVxuIiwgIi8qIFR5cGVzIGZvciB0YWcgY3JlYXRpb24sIGltcGxlbWVudGVkIGJ5IGB0YWcoKWAgaW4gYWktdWkudHMuXG4gIE5vIGNvZGUvZGF0YSBpcyBkZWNsYXJlZCBpbiB0aGlzIGZpbGUgKGV4Y2VwdCB0aGUgcmUtZXhwb3J0ZWQgc3ltYm9scyBmcm9tIGl0ZXJhdG9ycy50cykuXG4qL1xuXG5pbXBvcnQgdHlwZSB7IEFzeW5jUHJvdmlkZXIsIElnbm9yZSwgSXRlcmFibGVQcm9wZXJ0aWVzLCBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlLCBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz4gLy8gSXRlcmFibGUgdGhpbmdzIHRoYXQgaG9sZCB0aGUgYWJvdmUsIGxpa2UgQXJyYXlzLCBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3RcblxuLyogVHlwZXMgdXNlZCB0byB2YWxpZGF0ZSBhbiBleHRlbmRlZCB0YWcgZGVjbGFyYXRpb24gKi9cblxudHlwZSBEZWVwUGFydGlhbDxYPiA9IFtYXSBleHRlbmRzIFt7fV0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFhcbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogT1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuLyogVHlwZXMgdGhhdCBmb3JtIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleHRlbmRlZCB0YWcgKi9cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICAvKiBWYWx1ZXMgZm9yIHByb3BlcnRpZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIGFueSBiYXNlIGEgdGFnIGlzIGV4dGVuZGVkIGZyb20gKi9cbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgbmV3IHByb3BlcnRpZXMgaW4gdGhpcyB0YWcgZGVmaW5pdGlvbi4gKi9cbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgLyogRGVjbGFyYXRpb24gYW5kIGRlZmF1bHQgdmFsdWVlcyBmb3Igbm93IHByb3BlcnRpZXMgdGhhdCBhcmUgYm94ZWQgYnkgZGVmaW5lSXRlcmFibGVQcm9wZXJ0aWVzICovXG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIC8qIFNwZWNpZmljYXRpb24gb2YgdGhlIHR5cGVzIG9mIGVsZW1lbnRzIGJ5IElEIHRoYXQgYXJlIGNvbnRhaW5lZCBieSB0aGlzIHRhZyAqL1xuICBpZHM/OiB7IFtpZDogc3RyaW5nXTogVGFnQ3JlYXRvckZ1bmN0aW9uPGFueT47IH07XG4gIC8qIFN0YXRpYyBDU1MgcmVmZXJlbmNlZCBieSB0aGlzIHRhZyAqL1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUYWdDcmVhdG9yRm9ySURTPEkgZXh0ZW5kcyBOb25OdWxsYWJsZTxPdmVycmlkZXNbJ2lkcyddPj4ge1xuICA8Y29uc3QgSyBleHRlbmRzIGtleW9mIEk+KFxuICAgIGF0dHJzOnsgaWQ6IEsgfSAmIEV4Y2x1ZGU8UGFyYW1ldGVyczxJW0tdPlswXSwgQ2hpbGRUYWdzPixcbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgKTogUmV0dXJuVHlwZTxJW0tdPlxufVxuXG50eXBlIElEUzxJIGV4dGVuZHMgT3ZlcnJpZGVzWydpZHMnXT4gPSBJIGV4dGVuZHMgTm9uTnVsbGFibGU8T3ZlcnJpZGVzWydpZHMnXT4gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBSZXR1cm5UeXBlPElbSl0+O1xuICB9ICYgVGFnQ3JlYXRvckZvcklEUzxJPlxufSA6IHsgaWRzOiB7fSB9XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGF0dHJpYnV0ZXMgZnJvbSBhbiBFeFRhZ0NyZWF0b3JcbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPSBUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIEJhc2VBdHRycz5cbiAgPyBCYXNlQXR0cnNcbiAgOiBuZXZlclxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQmFzZSwgaW5mZXIgU3VwZXIsIGluZmVyIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX1N0YXRpY3M+XG4gID8gQmFzZUl0ZXJhYmxlczxTdXBlcj4gZXh0ZW5kcyBuZXZlclxuICAgID8gU3VwZXJEZWZzWydpdGVyYWJsZSddIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXVxuICAgICAgOiB7fVxuICAgIDogQmFzZUl0ZXJhYmxlczxTdXBlcj4gJiBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgOiBuZXZlclxuXG4vLyBXb3JrIG91dCB0aGUgdHlwZXMgb2YgYWxsIHRoZSBub24taXRlcmFibGUgcHJvcGVydGllcyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9XG4gIERbJ2RlY2xhcmUnXVxuICAmIERbJ292ZXJyaWRlJ11cbiAgJiBJRFM8RFsnaWRzJ10+XG4gICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgRFsnaXRlcmFibGUnXT5cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ11cblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9yQ2FsbFN0YWNrIGV4dGVuZHMgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXTtcbiAgW2s6IHN0cmluZ106IHVua25vd25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbiB7IChhdHRyczogQ29uc3RydWN0b3JDYWxsU3RhY2sgfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IEVsZW1lbnQgfVxuXG5pbnRlcmZhY2UgSW5zdGFuY2VVbmlxdWVJRCB7IFtVbmlxdWVJRF06IHN0cmluZyB9XG5leHBvcnQgdHlwZSBJbnN0YW5jZTxUID0gSW5zdGFuY2VVbmlxdWVJRD4gPSBJbnN0YW5jZVVuaXF1ZUlEICYgVFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yIHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID1cbiAgVGFnQ29uc3R1Y3RvciAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+PlxuICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4sXG4gICAgRFsnZGVjbGFyZSddXG4gICAgJiBEWydvdmVycmlkZSddXG4gICAgJiBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxELCBCYXNlPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4+XG4gID5cblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbj5cblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgZXh0ZW5kcyBJbnN0YW5jZVVuaXF1ZUlEID0gSW5zdGFuY2VVbmlxdWVJRFxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0lzSXRlcmFibGVQcm9wZXJ0eVZhbHVlPFQsIFByZWZpeCBleHRlbmRzIHN0cmluZyA9ICcnPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgPyBuZXZlciAvLyBUaGlzIGlzbid0IGEgcHJvYmxlbSBhcyBpdCdzIGFuIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBGdW5jdGlvblxuICAgID8geyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gfSAvLyBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIGRvZXNuJ3QgYWxsb3cgRnVuY3Rpb25zXG4gICAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBvYmplY3QgLy8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSBhbGxvd3Mgb2JqZWN0cyBpZiB0aGV5IGFyZSBhcmUgbWFwcyBvZiBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlc1xuICAgICAgPyBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBBcnJheTxpbmZlciBaPiAvLyAuLi4ub3IgYXJyYXlzIG9mIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVzXG4gICAgICAgID8gWiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA/IG5ldmVyIDogeyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFpbXSwgdW5kZWZpbmVkPiB9Ly8gSWYgaXQncyBhbiBhcnJheW0gY2hlY2sgdGhlIGFycmF5IG1lbWJlciB1bmlvbiBpcyBhbHNvIGFzc2lnbmFibGUgdG8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZVxuICAgICAgICA6IENoZWNrSXNJdGVyYWJsZVByb3BlcnR5VmFsdWU8RXhjbHVkZTxUW0tdLCB1bmRlZmluZWQ+LCBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfS5gPlxuICAgICAgOiB7IFtQIGluIGAke1ByZWZpeH0ke0sgJiBzdHJpbmd9YF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiB9XG59W2tleW9mIFRdIGV4dGVuZHMgaW5mZXIgT1xuICA/IHsgW0sgaW4ga2V5b2YgT106IE9bS10gfVxuICA6IG5ldmVyO1xuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG4gIFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiY29uc3RydWN0ZWRgIGRvZXMgbm90IHJldHVybiBDaGlsZFRhZ3NcIjogU3VwcGxpZWREZWZpbml0aW9uc1snY29uc3RydWN0ZWQnXSB9XG4gIDogRXhjZXNzS2V5czxTdXBwbGllZERlZmluaXRpb25zLCBPdmVycmlkZXMgJiBDb25zdHJ1Y3RlZD4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBpdGVyYWJsZTogYW55IH1cbiAgICAgID8geyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIG5vbi1pdGVyYWJsZSB0eXBlc1wiOiBFeGNsdWRlPENoZWNrSXNJdGVyYWJsZVByb3BlcnR5VmFsdWU8U3VwcGxpZWREZWZpbml0aW9uc1snaXRlcmFibGUnXT4sIHVuZGVmaW5lZD4gfVxuICAgICAgOiB7IFwiVGhlIGV4dGVuZGVkIHRhZyBkZWZpbnRpb24gY29udGFpbnMgdW5rbm93biBvciBpbmNvcnJlY3RseSB0eXBlZCBrZXlzXCI6IGtleW9mIEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IH1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdDcmVhdGlvbk9wdGlvbnMge1xuICBkZWJ1Z2dlcj86IGJvb2xlYW5cbn1cblxudHlwZSBSZVR5cGVkRXZlbnRIYW5kbGVyczxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEsgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzXG4gICAgPyBFeGNsdWRlPEdsb2JhbEV2ZW50SGFuZGxlcnNbS10sIG51bGw+IGV4dGVuZHMgKGU6IGluZmVyIEUpPT5pbmZlciBSXG4gICAgICA/ICgoZTogRSk9PlIpIHwgbnVsbFxuICAgICAgOiBUW0tdXG4gICAgOiBUW0tdXG59XG5cbnR5cGUgQXN5bmNBdHRyPFg+ID0gQXN5bmNQcm92aWRlcjxYPiB8IFByb21pc2VMaWtlPEFzeW5jUHJvdmlkZXI8WD4gfCBYPlxudHlwZSBQb3NzaWJseUFzeW5jPFg+ID0gW1hdIGV4dGVuZHMgW29iamVjdF0gLyogTm90IFwibmFrZWRcIiB0byBwcmV2ZW50IHVuaW9uIGRpc3RyaWJ1dGlvbiAqL1xuICA/IFggZXh0ZW5kcyBBc3luY1Byb3ZpZGVyPGluZmVyIFU+XG4gICAgPyBYIGV4dGVuZHMgKEFzeW5jUHJvdmlkZXI8VT4gJiBVKVxuICAgICAgPyBVIHwgQXN5bmNBdHRyPFU+IC8vIGl0ZXJhYmxlIHByb3BlcnR5XG4gICAgICA6IFggfCBQcm9taXNlTGlrZTxYPiAvLyBzb21lIG90aGVyIEFzeW5jUHJvdmlkZXJcbiAgICA6IFggZXh0ZW5kcyAoYW55W10gfCBGdW5jdGlvbilcbiAgICAgID8gWCB8IEFzeW5jQXR0cjxYPiAgLy8gQXJyYXkgb3IgRnVuY3Rpb24sIHdoaWNoIGNhbiBiZSBwcm92aWRlZCBhc3luY1xuICAgICAgOiB7IFtLIGluIGtleW9mIFhdPzogUG9zc2libHlBc3luYzxYW0tdPiB9IHwgUGFydGlhbDxYPiB8IEFzeW5jQXR0cjxQYXJ0aWFsPFg+PiAvLyBPdGhlciBvYmplY3QgLSBwYXJ0aWFsbHksIHBvc3NpYmxlIGFzeW5jXG4gIDogWCB8IEFzeW5jQXR0cjxYPiAvLyBTb21ldGhpbmcgZWxzZSAobnVtYmVyLCBldGMpLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgYXN5bmNcblxudHlwZSBSZWFkV3JpdGVBdHRyaWJ1dGVzPEUsIEJhc2UgPSBFPiA9IEUgZXh0ZW5kcyB7IGF0dHJpYnV0ZXM6IGFueSB9XG4gID8gKE9taXQ8RSwgJ2F0dHJpYnV0ZXMnPiAmIHtcbiAgICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXA7XG4gICAgc2V0IGF0dHJpYnV0ZXModjogUG9zc2libHlBc3luYzxPbWl0PEJhc2UsJ2F0dHJpYnV0ZXMnPj4pO1xuICB9KVxuICA6IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4pXG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBcmdzPEE+ID0gW10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9uc10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9ucywgLi4uQ2hpbGRUYWdzW11dIHwgQ2hpbGRUYWdzW11cbi8qIEEgVGFnQ3JlYXRvciBpcyBhIGZ1bmN0aW9uIHRoYXQgb3B0aW9uYWxseSB0YWtlcyBhdHRyaWJ1dGVzICYgY2hpbGRyZW4sIGFuZCBjcmVhdGVzIHRoZSB0YWdzLlxuICBUaGUgYXR0cmlidXRlcyBhcmUgUG9zc2libHlBc3luYy4gVGhlIHJldHVybiBoYXMgYGNvbnN0cnVjdG9yYCBzZXQgdG8gdGhpcyBmdW5jdGlvbiAoc2luY2UgaXQgaW5zdGFudGlhdGVkIGl0KVxuKi9cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JGdW5jdGlvbjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9ICguLi5hcmdzOiBUYWdDcmVhdG9yQXJnczxQb3NzaWJseUFzeW5jPEJhc2U+ICYgVGhpc1R5cGU8QmFzZT4+KSA9PiBSZWFkV3JpdGVBdHRyaWJ1dGVzPEJhc2U+XG5cbi8qIEEgVGFnQ3JlYXRvciBpcyBUYWdDcmVhdG9yRnVuY3Rpb24gZGVjb3JhdGVkIHdpdGggc29tZSBleHRyYSBtZXRob2RzLiBUaGUgU3VwZXIgJiBTdGF0aWNzIGFyZ3MgYXJlIG9ubHlcbmV2ZXIgc3BlY2lmaWVkIGJ5IEV4dGVuZGVkVGFnIChpbnRlcm5hbGx5KSwgYW5kIHNvIGlzIG5vdCBleHBvcnRlZCAqL1xudHlwZSBFeFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdCxcbiAgU3VwZXIgZXh0ZW5kcyAodW5rbm93biB8IEV4VGFnQ3JlYXRvcjxhbnk+KSA9IHVua25vd24sXG4gIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcyA9IHt9LFxuICBTdGF0aWNzID0ge30sXG4+ID0gVGFnQ3JlYXRvckZ1bmN0aW9uPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+PiAmIHtcbiAgLyogSXQgY2FuIGFsc28gYmUgZXh0ZW5kZWQgKi9cbiAgZXh0ZW5kZWQ6IEV4dGVuZGVkVGFnXG4gIC8qIEl0IGlzIGJhc2VkIG9uIGEgXCJzdXBlclwiIFRhZ0NyZWF0b3IgKi9cbiAgc3VwZXI6IFN1cGVyXG4gIC8qIEl0IGhhcyBhIGZ1bmN0aW9uIHRoYXQgZXhwb3NlcyB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgdGFncyBpdCBjcmVhdGVzIGFuZCBpdHMgc3VwZXIgKi9cbiAgZGVmaW5pdGlvbj86IE92ZXJyaWRlcyAmIEluc3RhbmNlVW5pcXVlSUQ7IC8qIENvbnRhaW5zIHRoZSBkZWZpbml0aW9ucyAmIFVuaXF1ZUlEIGZvciBhbiBleHRlbmRlZCB0YWcuIHVuZGVmaW5lZCBmb3IgYmFzZSB0YWdzICovXG4gIC8qIEl0IGhhcyBhIG5hbWUgKHNldCB0byBhIGNsYXNzIG9yIGRlZmluaXRpb24gbG9jYXRpb24pLCB3aGljaCBpcyBoZWxwZnVsIHdoZW4gZGVidWdnaW5nICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgLyogQ2FuIHRlc3QgaWYgYW4gZWxlbWVudCB3YXMgY3JlYXRlZCBieSB0aGlzIGZ1bmN0aW9uIG9yIGEgYmFzZSB0YWcgZnVuY3Rpb24gKi9cbiAgW1N5bWJvbC5oYXNJbnN0YW5jZV0oZWx0OiBhbnkpOiBib29sZWFuO1xufSAmIEluc3RhbmNlVW5pcXVlSUQgJlxuLy8gYFN0YXRpY3NgIGhlcmUgaXMgdGhhdCBzYW1lIGFzIFN0YXRpY1JlZmVyZW5jZXM8U3VwZXIsIFN1cGVyRGVmcz4sIGJ1dCB0aGUgY2lyY3VsYXIgcmVmZXJlbmNlIGJyZWFrcyBUU1xuLy8gc28gd2UgY29tcHV0ZSB0aGUgU3RhdGljcyBvdXRzaWRlIHRoaXMgdHlwZSBkZWNsYXJhdGlvbiBhcyBwYXNzIHRoZW0gYXMgYSByZXN1bHRcblN0YXRpY3NcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9IEV4VGFnQ3JlYXRvcjxCYXNlLCBuZXZlciwgbmV2ZXIsIHt9PlxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NPLElBQU0sUUFBUSxXQUFXLFNBQVMsT0FBTyxXQUFXLFNBQVMsUUFBUSxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixDQUFDLEtBQUs7QUFFOUgsSUFBTSxjQUFjO0FBRTNCLElBQU0sV0FBVztBQUFBLEVBQ2YsT0FBTyxNQUFXO0FBQ2hCLFFBQUksTUFBTyxTQUFRLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsa0JBQWlCLElBQUksQ0FBQztBQUFBLEVBQ25HO0FBQUEsRUFDQSxRQUFRLE1BQVc7QUFDakIsUUFBSSxNQUFPLFNBQVEsS0FBSyxpQkFBaUIsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsRUFDckc7QUFBQSxFQUNBLFFBQVEsTUFBVztBQUNqQixRQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLElBQUk7QUFBQSxFQUNsRDtBQUNGOzs7QUNaQSxJ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QVc7QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFjO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUNwSDtBQUFBLEVBQVU7QUFBQSxFQUFXO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFPO0FBQUEsRUFBWTtBQUFBLEVBQVE7QUFBQSxFQUFZO0FBQUEsRUFBTTtBQUFBLEVBQU87QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFBLEVBQVU7QUFBQSxFQUNySDtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQVM7QUFBQSxFQUFZO0FBQUEsRUFBYztBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ3JIO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQUs7QUFBQSxFQUFVO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFDeEg7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQVk7QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVk7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQUs7QUFBQSxFQUFXO0FBQUEsRUFDcEg7QUFBQSxFQUFZO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFXO0FBQUEsRUFBVTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBVTtBQUFBLEVBQ3RIO0FBQUEsRUFBVTtBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBVztB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O0FBQUEsSUFDcEMsa0JBQWtCLEdBQVMsTUFBYztBQUN2QyxhQUFPLFNBQVMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJO0FBQUEsSUFDbEM7QUFBQSxJQUNBLFVBQVUsR0FBVyxNQUF1QixTQUE4QjtBQUN4RSxVQUFJLFNBQVM7QUFDWCxVQUFFLFFBQVEsQ0FBQUMsT0FBSztBQUNiLGdCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQyxLQUFLLG9CQUFJLElBQStCO0FBQ2xFLG1CQUFTLElBQUlBLElBQUdDLElBQUc7QUFDbkIsVUFBQUEsS0FBSSxJQUFJLE1BQU0sT0FBTztBQUFBLFFBQ3ZCLENBQUM7QUFBQSxNQUNILE9BQ0s7QUFDSCxVQUFFLFFBQVEsQ0FBQUQsT0FBSztBQUNiLGdCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQztBQUMxQixjQUFJQyxNQUFLO0FBQ1AsWUFBQUEsS0FBSSxPQUFPLElBQUk7QUFDZixnQkFBSSxDQUFDQSxLQUFJO0FBQ1AsdUJBQVMsT0FBT0QsRUFBQztBQUFBLFVBQ3JCO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAibWVyZ2VkIiwgInIiLCAiaWQiLCAiRHlhbWljRWxlbWVudEVycm9yIiwgInVuaXF1ZSIsICJuIiwgImNoaWxkcmVuIiwgImUiLCAibWFwIl0KfQo=
