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
  combine(others, opts = {}) {
    return combine(Object.assign({ "_this": this }, others), opts);
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
          const source = sit[Symbol.asyncIterator]();
          si.set(k, source);
          return [k, source.next().then((ir) => ({ si, k, ir }))];
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
              const sourceResponse = ai?.throw?.(ex) ?? ai?.return?.(ex);
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
    if (it) current?.resolve(it);
    if (it?.done) {
      current = null;
    } else {
      current = deferred();
      if (ai) {
        ai.next().then(step).catch((error) => {
          current?.reject({ done: true, value: error });
          current = null;
        });
      } else {
        current.resolve({ done: true, value: void 0 });
      }
    }
  }
  function done(v) {
    const result = { done: true, value: v?.value };
    ai = mai = current = null;
    return result;
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
  const DynamicElementError = options?.ErrorTag || function DyamicElementError({ error }) {
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
              n[0].replaceWith(DynamicElementError({ error: errorValue?.value ?? errorValue }));
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
    if (a === null) return null;
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
              base.appendChild(DynamicElementError({ error: errorValue }));
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
    name instanceof Node ? name : typeof name === "string" && name in baseTagCreators ? baseTagCreators[name](attrs, children) : name === baseTagCreators.createElement ? [...nodes(...children)] : typeof name === "function" ? name(attrs, children) : DynamicElementError({ error: new Error("Illegal type in createElement:" + name) })
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuLCBSZWFkeSB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgdHlwZSB7IENoaWxkVGFncywgSW5zdGFuY2UsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcydcbmV4cG9ydCAqIGFzIEl0ZXJhdG9ycyBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbmNvbnN0IHRyYWNrTm9kZXMgPSBTeW1ib2woXCJ0cmFja05vZGVzXCIpO1xuY29uc3QgdHJhY2tMZWdhY3kgPSBTeW1ib2woXCJvblJlbW92YWxGcm9tRE9NXCIpO1xuY29uc3QgYWl1aUV4dGVuZGVkVGFnU3R5bGVzID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcblxuY29uc3QgbG9nTm9kZSA9IERFQlVHXG4/ICgobjogYW55KSA9PiBuIGluc3RhbmNlb2YgTm9kZVxuICA/ICdvdXRlckhUTUwnIGluIG4gPyBuLm91dGVySFRNTCA6IGAke24udGV4dENvbnRlbnR9ICR7bi5ub2RlTmFtZX1gXG4gIDogU3RyaW5nKG4pKVxuOiAobjogTm9kZSkgPT4gdW5kZWZpbmVkO1xuXG4vKiBBIGhvbGRlciBmb3IgY29tbW9uUHJvcGVydGllcyBzcGVjaWZpZWQgd2hlbiBgdGFnKC4uLnApYCBpcyBpbnZva2VkLCB3aGljaCBhcmUgYWx3YXlzXG4gIGFwcGxpZWQgKG1peGVkIGluKSB3aGVuIGFuIGVsZW1lbnQgaXMgY3JlYXRlZCAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWdGdW5jdGlvbk9wdGlvbnM8T3RoZXJNZW1iZXJzIGV4dGVuZHMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PiA9IHt9PiB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnMgfCB1bmRlZmluZWRcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICBFcnJvclRhZz86IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50ICYgeyBlcnJvcjogYW55IH0+XG4gIC8qKiBAZGVwcmVjYXRlZCAtIGxlZ2FjeSBzdXBwb3J0ICovXG4gIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fSAmICh1bmRlZmluZWQgfCAoKGF0dHJzOiBvYmplY3QsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gUmV0dXJuVHlwZTxUYWdDcmVhdG9yRnVuY3Rpb248YW55Pj4pKVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbiAgLy8gVGhpcyBpcyBhIHZlcnkgaW5jb21wbGV0ZSB0eXBlLiBJbiBwcmFjdGljZSwgc2V0KGssIGF0dHJzKSByZXF1aXJlcyBhIGRlZXBseSBwYXJ0aWFsIHNldCBvZlxuICAvLyBhdHRyaWJ1dGVzLCBpbiBleGFjdGx5IHRoZSBzYW1lIHdheSBhcyBhIFRhZ0Z1bmN0aW9uJ3MgZmlyc3Qgb2JqZWN0IHBhcmFtZXRlclxuICBzZXQgYXR0cmlidXRlcyhhdHRyczogb2JqZWN0KTtcbiAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwXG59XG5cbi8vIFN1cHBvcnQgZm9yIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2h0bSAob3IgaW1wb3J0IGh0bSBmcm9tICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2h0bS9kaXN0L2h0bS5tb2R1bGUuanMnKVxuLy8gTm90ZTogc2FtZSBzaWduYXR1cmUgYXMgUmVhY3QuY3JlYXRlRWxlbWVudFxudHlwZSBDcmVhdGVFbGVtZW50Tm9kZVR5cGUgPSBUYWdDcmVhdG9yRnVuY3Rpb248YW55PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBcbnR5cGUgQ3JlYXRlRWxlbWVudEZyYWdtZW50ID0gQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddO1xuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVFbGVtZW50IHtcbiAgLy8gU3VwcG9ydCBmb3IgaHRtLCBKU1gsIGV0Y1xuICBjcmVhdGVFbGVtZW50PE4gZXh0ZW5kcyAoQ3JlYXRlRWxlbWVudE5vZGVUeXBlIHwgQ3JlYXRlRWxlbWVudEZyYWdtZW50KT4oXG4gICAgLy8gXCJuYW1lXCIgY2FuIGEgSFRNTCB0YWcgc3RyaW5nLCBhbiBleGlzdGluZyBub2RlIChqdXN0IHJldHVybnMgaXRzZWxmKSwgb3IgYSB0YWcgZnVuY3Rpb25cbiAgICBuYW1lOiBOLFxuICAgIC8vIFRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gaW5pdGlhbGlzZSB0aGUgbm9kZSAoaWYgYSBzdHJpbmcgb3IgZnVuY3Rpb24gLSBpZ25vcmUgaWYgaXQncyBhbHJlYWR5IGEgbm9kZSlcbiAgICBhdHRyczogYW55LFxuICAgIC8vIFRoZSBjaGlsZHJlblxuICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IE4gZXh0ZW5kcyBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPyBOb2RlW10gOiBOb2RlO1xuICB9XG5cbi8qIFRoZSBpbnRlcmZhY2UgdGhhdCBjcmVhdGVzIGEgc2V0IG9mIFRhZ0NyZWF0b3JzIGZvciB0aGUgc3BlY2lmaWVkIERPTSB0YWdzICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0xvYWRlciB7XG4gIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKTogKE5vZGUgfCAoLypQICYqLyAoRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMpKSlbXTtcbiAgVW5pcXVlSUQ6IHR5cGVvZiBVbmlxdWVJRFxuXG4gIC8qXG4gICBTaWduYXR1cmVzIGZvciB0aGUgdGFnIGxvYWRlci4gQWxsIHBhcmFtcyBhcmUgb3B0aW9uYWwgaW4gYW55IGNvbWJpbmF0aW9uLFxuICAgYnV0IG11c3QgYmUgaW4gb3JkZXI6XG4gICAgICB0YWcoXG4gICAgICAgICAgP25hbWVTcGFjZT86IHN0cmluZywgIC8vIGFic2VudCBuYW1lU3BhY2UgaW1wbGllcyBIVE1MXG4gICAgICAgICAgP3RhZ3M/OiBzdHJpbmdbXSwgICAgIC8vIGFic2VudCB0YWdzIGRlZmF1bHRzIHRvIGFsbCBjb21tb24gSFRNTCB0YWdzXG4gICAgICAgICAgP2NvbW1vblByb3BlcnRpZXM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0Pih0YWdzOiBUYWdzW10sIG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMgb2JqZWN0PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMgb2JqZWN0XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXTtcblxuICBjb25zdCBjb21tb25Qcm9wZXJ0aWVzID0gb3B0aW9ucz8uY29tbW9uUHJvcGVydGllcztcbiAgY29uc3QgdGhpc0RvYyA9IG9wdGlvbnM/LmRvY3VtZW50ID8/IGdsb2JhbFRoaXMuZG9jdW1lbnQ7XG4gIGNvbnN0IGlzVGVzdEVudiA9IHRoaXNEb2MuZG9jdW1lbnRVUkkgPT09ICdhYm91dDp0ZXN0aW5nJztcbiAgY29uc3QgRHluYW1pY0VsZW1lbnRFcnJvciA9IG9wdGlvbnM/LkVycm9yVGFnIHx8IGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG5cbiAgY29uc3QgcmVtb3ZlZE5vZGVzID0gbXV0YXRpb25UcmFja2VyKHRoaXNEb2MpO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIobGFiZWw/OiBhbnkpIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGxhYmVsPyBsYWJlbC50b1N0cmluZygpIDpERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYWl1aUV4dGVuZGVkVGFnU3R5bGVzKSkge1xuICAgIHRoaXNEb2MuaGVhZC5hcHBlbmRDaGlsZChPYmplY3QuYXNzaWduKHRoaXNEb2MuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpLCB7aWQ6IGFpdWlFeHRlbmRlZFRhZ1N0eWxlc30gKSk7XG4gIH1cblxuICAvKiBQcm9wZXJ0aWVzIGFwcGxpZWQgdG8gZXZlcnkgdGFnIHdoaWNoIGNhbiBiZSBpbXBsZW1lbnRlZCBieSByZWZlcmVuY2UsIHNpbWlsYXIgdG8gcHJvdG90eXBlcyAqL1xuICBjb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdGFnUHJvdG90eXBlczogUG9FbGVtZW50TWV0aG9kcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbCxcbiAgICB7XG4gICAgICB3aGVuOiB7XG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICguLi53aGF0OiBXaGVuUGFyYW1ldGVycykge1xuICAgICAgICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdhdHRyaWJ1dGVzJyksXG4gICAgICAgIHNldCh0aGlzOiBFbGVtZW50LCBhOiBvYmplY3QpIHtcbiAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFpID0gaXNBc3luY0l0ZXJhdG9yKGEpID8gYSA6IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gKCkgPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgICAgICh7IGRvbmUsIHZhbHVlIH0pID0+IHsgYXNzaWduUHJvcHModGhpcywgdmFsdWUpOyBkb25lIHx8IHN0ZXAoKSB9LFxuICAgICAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oZXgpKTtcbiAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlkczoge1xuICAgICAgICAvLyAuaWRzIGlzIGEgZ2V0dGVyIHRoYXQgd2hlbiBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyBsYXppbHkgY3JlYXRlcyBhIFByb3h5IHRoYXQgcHJvdmlkZXMgbGl2ZSBhY2Nlc3MgdG8gY2hpbGRyZW4gYnkgaWRcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgZ2V0KHRoaXM6IEVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBOb3cgd2UndmUgYmVlbiBhY2Nlc3NlZCwgY3JlYXRlIHRoZSBwcm94eVxuICAgICAgICAgIGNvbnN0IGlkUHJveHkgPSBuZXcgUHJveHkoKCgpPT57fSkgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBXZWFrUmVmPEVsZW1lbnQ+Piwge1xuICAgICAgICAgICAgYXBwbHkodGFyZ2V0LCB0aGlzQXJnLCBhcmdzKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNBcmcuY29uc3RydWN0b3IuZGVmaW5pdGlvbi5pZHNbYXJnc1swXS5pZF0oLi4uYXJncylcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDxlbHQ+Lmlkcy4ke2FyZ3M/LlswXT8uaWR9IGlzIG5vdCBhIHRhZy1jcmVhdGluZyBmdW5jdGlvbmAsIHsgY2F1c2U6IGV4IH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uc3RydWN0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVsZXRlUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0UHJvdG90eXBlT2Y6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldFByb3RvdHlwZU9mKCkgeyByZXR1cm4gbnVsbCB9LFxuICAgICAgICAgICAgaXNFeHRlbnNpYmxlKCkgeyByZXR1cm4gZmFsc2UgfSxcbiAgICAgICAgICAgIHByZXZlbnRFeHRlbnNpb25zKCkgeyByZXR1cm4gdHJ1ZSB9LFxuICAgICAgICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5Rm9yKHApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXModGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3duS2V5czogKHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBpZHMgPSBbLi4udGhpcy5xdWVyeVNlbGVjdG9yQWxsKGBbaWRdYCldLm1hcChlID0+IGUuaWQpO1xuICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbLi4ubmV3IFNldChpZHMpXTtcbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIGlkcy5sZW5ndGggIT09IHVuaXF1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudCBpZHNgLCB1bmlxdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gdW5pcXVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcCwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBrID0ga2V5Rm9yKHApO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlJ3ZlIGNhY2hlZCB0aGlzIElEIGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAocGsgaW4gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgZWxlbWVudCBpcyBzdGlsbCBjb250YWluZWQgd2l0aGluIHRoaXMgZWxlbWVudCB3aXRoIHRoZSBzYW1lIElEXG4gICAgICAgICAgICAgICAgICBjb25zdCByZWYgPSB0YXJnZXRbcGtdLmRlcmVmKCk7XG4gICAgICAgICAgICAgICAgICBpZiAocmVmICYmIHJlZi5pZCA9PT0gcCAmJiB0aGlzLmNvbnRhaW5zKHJlZikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWY7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgdGFyZ2V0W3BrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGU6IEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBubCA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnIycgKyBDU1MuZXNjYXBlKHApKTtcbiAgICAgICAgICAgICAgICAgIGlmIChubC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghd2FybmVkLmhhcyhwKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHdhcm5lZC5hZGQocCk7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudHMgd2l0aCBJRCBcIiR7cH1cImAvKixgXFxuXFx0JHtsb2dOb2RlKHRoaXMpfWAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGUgPSBubFswXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZSA9IHRoaXMucXVlcnlTZWxlY3RvcignIycgKyBDU1MuZXNjYXBlKHApKSA/PyB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlKVxuICAgICAgICAgICAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBwaywgbmV3IFdlYWtSZWYoZSksIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLmFuZCByZXBsYWNlIHRoZSBnZXR0ZXIgd2l0aCB0aGUgUHJveHlcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lkcycsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldCgpIHsgcmV0dXJuIGlkUHJveHkgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uLmFuZCByZXR1cm4gdGhhdCBmcm9tIHRoZSBnZXR0ZXIsIHNvIHN1YnNlcXVlbnQgcHJvcGVydHlcbiAgICAgICAgICAvLyBhY2Nlc3NlcyBnbyB2aWEgdGhlIFByb3h5XG4gICAgICAgICAgcmV0dXJuIGlkUHJveHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgaWYgKG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywnb25SZW1vdmVkRnJvbURPTScse1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBzZXQ6IGZ1bmN0aW9uKGZuPzogKCk9PnZvaWQpe1xuICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFt0aGlzXSwgdHJhY2tMZWdhY3ksIGZuKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlbW92ZWROb2Rlcy5nZXRSZW1vdmFsSGFuZGxlcih0aGlzLCB0cmFja0xlZ2FjeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyogQWRkIGFueSB1c2VyIHN1cHBsaWVkIHByb3RvdHlwZXMgKi9cbiAgaWYgKGNvbW1vblByb3BlcnRpZXMpXG4gICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBjb21tb25Qcm9wZXJ0aWVzKTtcblxuICBmdW5jdGlvbiAqbm9kZXMoLi4uY2hpbGRUYWdzOiBDaGlsZFRhZ3NbXSk6IEl0ZXJhYmxlSXRlcmF0b3I8Q2hpbGROb2RlLCB2b2lkLCB1bmtub3duPiB7XG4gICAgZnVuY3Rpb24gbm90VmlhYmxlVGFnKGM6IENoaWxkVGFncykge1xuICAgICAgcmV0dXJuIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjIG9mIGNoaWxkVGFncykge1xuICAgICAgaWYgKG5vdFZpYWJsZVRhZyhjKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGxldCBnOiBDaGlsZE5vZGVbXSB8IHVuZGVmaW5lZCA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBjLnRoZW4ocmVwbGFjZW1lbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgaWYgKG9sZCkge1xuICAgICAgICAgICAgZyA9IFsuLi5ub2RlcyhyZXBsYWNlbWVudCldO1xuICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChnLCB0cmFja05vZGVzLCAoKT0+IHsgZyA9IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaSA8IG9sZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgICAgICAgICBvbGRbaV0ucmVwbGFjZVdpdGgoLi4uZyk7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgb2xkW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGcpIHlpZWxkICpnO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHlpZWxkIGMgYXMgQ2hpbGROb2RlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgaGF2ZSBhbiBpbnRlcmVzdGluZyBjYXNlIGhlcmUgd2hlcmUgYW4gaXRlcmFibGUgU3RyaW5nIGlzIGFuIG9iamVjdCB3aXRoIGJvdGggU3ltYm9sLml0ZXJhdG9yXG4gICAgICAvLyAoaW5oZXJpdGVkIGZyb20gdGhlIFN0cmluZyBwcm90b3R5cGUpIGFuZCBTeW1ib2wuYXN5bmNJdGVyYXRvciAoYXMgaXQncyBiZWVuIGF1Z21lbnRlZCBieSBib3hlZCgpKVxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXNlcyBsaWtlIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdCwgYXJyYXksIGV0Yy4sIG5vdCB0aGUgZnVua3kgb25lc1xuICAgICAgLy8gSXQgdXNlZCB0byBiZSBhZnRlciB0aGUgaXNBc3luY0l0ZXIoKSB0ZXN0LCBidXQgYSBub24tQXN5bmNJdGVyYXRvciAqbWF5KiBhbHNvIGJlIGEgc3luYyBpdGVyYWJsZVxuICAgICAgLy8gRm9yIG5vdywgd2UgZXhjbHVkZSAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgaW4gdGhpcyBjYXNlLlxuICAgICAgaWYgKGMgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBjICYmICEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgJiYgY1tTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgYylcbiAgICAgICAgICB5aWVsZCAqbm9kZXMoY2gpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGxldCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgdGVybWluYXRlU291cmNlID0gKGZvcmNlOiBib29sZWFuID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBpZiAoIWFwIHx8ICFyZXBsYWNlbWVudC5ub2RlcylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIGlmIChmb3JjZSB8fCByZXBsYWNlbWVudC5ub2Rlcy5ldmVyeShlID0+IHJlbW92ZWROb2Rlcy5oYXMoZSkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXM/LmZvckVhY2goZSA9PiByZW1vdmVkTm9kZXMuYWRkKGUpKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudDogXCJcbiAgICAgICAgICAgICAgKyByZXBsYWNlbWVudC5ub2Rlcy5tYXAobG9nTm9kZSkuam9pbignXFxuJylcbiAgICAgICAgICAgICAgKyBpbnNlcnRpb25TdGFjaztcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBudWxsO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICBhcCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHtcbiAgICAgICAgICBub2RlczogKCh1bmJveGVkID09PSBjKSA/IFtdIDogWy4uLm5vZGVzKHVuYm94ZWQgYXMgQ2hpbGRUYWdzKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2RlcyEubGVuZ3RoKVxuICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMhLHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGNvbnN0IGRlYnVnVW5tb3VudGVkID0gREVCVUdcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgICAgbGV0IGYgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgZiA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgIGFwLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgYXA/LnRocm93Py4obmV3IEVycm9yKFwiQWxyZWFkeSB0ZXJuaW1hdGVkXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihlID0+IGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHJlcGxhY2VtZW50Lm5vZGVzIDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgbW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIXRlcm1pbmF0ZVNvdXJjZSghbi5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWdVbm1vdW50ZWQ/LigpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbLi4ubm9kZXModW5ib3goZXMudmFsdWUpKV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaTxuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaT09PTApXG4gICAgICAgICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQubm9kZXMpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKG5baV0pKVxuICAgICAgICAgICAgICAgICAgICBuW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChuW2ldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnQubm9kZXM/LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgaWYgKG4/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKER5bmFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZT8udmFsdWUgPz8gZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgY29uc29sZS53YXJuKFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IG51bGw7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIGFwID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkoKTtcblxuICAgICAgICBpZiAocmVwbGFjZW1lbnQubm9kZXMpIHlpZWxkKiByZXBsYWNlbWVudDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHlpZWxkIHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLCB7XG4gICAgICBub2RlcywgICAgLy8gQnVpbGQgRE9NIE5vZGVbXSBmcm9tIENoaWxkVGFnc1xuICAgICAgVW5pcXVlSURcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgY29uc3QgcGxhaW5PYmplY3RQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pO1xuICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZDogUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgYW55PiwgczogYW55LCBkZWNsYXJhdGlvbj86IHRydWUpOiB2b2lkIHtcbiAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzb3VyY2UgdmFsdWUgaXMgYW4gb2JqZWN0LCBhbmQgd2UncmUgZGVjbGFyaW5nIGl0ICh0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGEgbmV3IG9uZSksIHRha2VcbiAgICAgICAgICAgICAgICAvLyBhIGNvcHkgc28gYXMgdG8gbm90IHJlLXVzZSB0aGUgcmVmZXJlbmNlIGFuZCBwb2xsdXRlIHRoZSBkZWNsYXJhdGlvbi4gTm90ZTogdGhpcyBpcyBwcm9iYWJseVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuJ3QgYmUgY29waWVkXG4gICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSA9PT0gcGxhaW5PYmplY3RQcm90b3R5cGUgfHwgIU9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwbGFpbiBvYmplY3QgY2FuIGJlIGRlZXAtY29waWVkIGJ5IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIGFycmF5IGNhbiBiZSBkZWVwIGNvcGllZCBieSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSBbXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgb2JqZWN0IGxpa2UgdGhpbmdzIChyZWdleHBzLCBkYXRlcywgY2xhc3NlcywgZXRjKSBjYW4ndCBiZSBkZWVwLWNvcGllZCByZWxpYWJseVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERlY2xhcmVkIHByb3BldHkgJyR7a30nIGlzIG5vdCBhIHBsYWluIG9iamVjdCBhbmQgbXVzdCBiZSBhc3NpZ25lZCBieSByZWZlcmVuY2UsIHBvc3NpYmx5IHBvbGx1dGluZyBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyB0YWdgLCBkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2QgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShkKSA6IGR9YCk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94PFQ+KGE6IFQpOiBUIHtcbiAgICBpZiAoYSA9PT0gbnVsbCkgcmV0dXJuIG51bGwgYXMgVDtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiAoQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LCB1bmJveCkgOiB2KSBhcyBUO1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZTogTm9kZSwgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgIGlmICghKGNhbGxTdGFja1N5bWJvbCBpbiBwcm9wcykpIHtcbiAgICAgIChmdW5jdGlvbiBhc3NpZ24oZDogYW55LCBzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wcyBiZWZvcmUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgIGNvbnN0IHNvdXJjZUVudHJpZXMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSk7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzKSkge1xuICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydChhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGFbMF0pO1xuICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYykgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICBpZiAoJ3NldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2V0ID0gaXNUZXN0RW52IHx8ICEoZCBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8IChkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgICAgPyAoazogc3RyaW5nLCB2OiBhbnkpID0+IHsgZFtrXSA9IHYgfVxuICAgICAgICAgIDogKGs6IHN0cmluZywgdjogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoKHYgPT09IG51bGwgfHwgdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2ID09PSAnYm9vbGVhbicgfHwgdHlwZW9mIHYgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAmJiAoIShrIGluIGQpIHx8IHR5cGVvZiBkW2sgYXMga2V5b2YgdHlwZW9mIGRdICE9PSAnc3RyaW5nJykpXG4gICAgICAgICAgICAgIGQuc2V0QXR0cmlidXRlKGsgPT09ICdjbGFzc05hbWUnID8gJ2NsYXNzJyA6IGssIFN0cmluZyh2KSk7XG4gICAgICAgICAgICBlbHNlIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKHYgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVkTm9kZXMuaGFzKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhpcyBwcm9taXNlIHJlc29sdmVkIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHYsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0KGssIHYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coYEV4Y2VwdGlvbiBpbiBwcm9taXNlZCBhdHRyaWJ1dGUgJyR7a30nYCwgZXJyb3IsIGxvZ05vZGUoZCkpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2V0KGssIHNba10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcImFzc2lnblByb3BzXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbkl0ZXJhYmxlKGl0ZXI6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKGl0ZXIpO1xuICAgICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IERFQlVHICYmIG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG5cbiAgICAgICAgICBsZXQgbW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlczogSXRlcmF0b3JSZXN1bHQ8dW5rbm93bj4pID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBtb3VudGVkID0gbW91bnRlZCB8fCBiYXNlLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGJlZW4gbW91bnRlZCBiZWZvcmUsIGJ1dCBhcmVuJ3Qgbm93LCByZW1vdmUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaGFzKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCIobm9kZSByZW1vdmVkKVwiKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNyYyBpcyBub3QgYW4gb2JqZWN0IChvciBpcyBudWxsKSAtIGp1c3QgYXNzaWduIGl0LCB1bmxlc3MgaXQncyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgIW1vdW50ZWQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2Fybi8xMDAwfSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuXFxuRWxlbWVudCBjb250YWluczogJHtsb2dOb2RlKGJhc2UpfVxcbiR7Y3JlYXRlZEJ5fWApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm9yVmFsdWUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRHluYW1pYyBhdHRyaWJ1dGUgdGVybWluYXRpb25cIiwgZXJyb3JWYWx1ZSwgaywgbG9nTm9kZShkKSwgY3JlYXRlZEJ5LCBsb2dOb2RlKGJhc2UpKTtcbiAgICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeW5hbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHVuYm94ZWQgPSBpdGVyLnZhbHVlT2YoKTtcbiAgICAgICAgICBpZiAodW5ib3hlZCAhPT0gdW5kZWZpbmVkICYmIHVuYm94ZWQgIT09IGl0ZXIgJiYgIWlzQXN5bmNJdGVyKHVuYm94ZWQpKVxuICAgICAgICAgICAgdXBkYXRlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB1bmJveGVkIH0pO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoW2Jhc2VdLCBrLCAoKSA9PiBhcC5yZXR1cm4/LigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQoaywgY29weSk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKHRoaXM6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIGU6IGFueSkge1xuICAgIGZvciAobGV0IGMgPSBlLmNvbnN0cnVjdG9yOyBjOyBjID0gYy5zdXBlcikge1xuICAgICAgaWYgKGMgPT09IHRoaXMpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmRlZCh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpIHtcbiAgICBjb25zdCBpbnN0YW5jZURlZmluaXRpb24gPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICA/IChpbnN0YW5jZTogSW5zdGFuY2UpID0+IE9iamVjdC5hc3NpZ24oe30sIF9vdmVycmlkZXMsIGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgKGlkQ291bnQrKykudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG4gICAgY29uc3Qgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk/LmFwcGVuZENoaWxkKHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgIH1cblxuICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgIC8vIChmaW5hbGx5KSBhc3NpZ25pbmcgdGhvc2Ugc3BlY2lmaWVkIGJ5IHRoZSBpbnN0YW50aWF0aW9uXG4gICAgY29uc3QgZXh0ZW5kVGFnRm46IEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgY29uc3Qgbm9BdHRycyA9IGlzQ2hpbGRUYWcoYXR0cnMpO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGNvbnN0IGlzQW5jZXN0cmFsID0gKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBrZXkgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihrID0+IChrIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVjbGFyZWQga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGFscmVhZHkgZXhpc3QgaW4gYmFzZSAnJHt0aGlzLnZhbHVlT2YoKX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKS5maWx0ZXIoayA9PiAhKGsgaW4gZSkgJiYgIShjb21tb25Qcm9wZXJ0aWVzICYmIGsgaW4gY29tbW9uUHJvcGVydGllcykgJiYgIWlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIGNvbnN0IHJlQXNzaWduID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICAgIHJlQXNzaWduLmFkZChrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGUhW2sgYXMga2V5b2YgdHlwZW9mIHRhZ0RlZmluaXRpb24uaXRlcmFibGVdKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGUuYXBwZW5kKC4uLm5vZGVzKGNoaWxkcmVuKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlLCB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgICAgLy8gYnkgYXNzaWduUHJvcHMgZnJvbSBhIGZ1dHVyZVxuICAgICAgICBjb25zdCBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlcyA9IHt9O1xuICAgICAgICBsZXQgaGFzSW5pdGlhbFZhbHVlcyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgaWYgKGJhc2UuaXRlcmFibGUpIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhiYXNlLml0ZXJhYmxlKSkge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgc2VsZi1hc3NpZ24gaXRlcmFibGVzIHRoYXQgaGF2ZSB0aGVtc2VsdmVzIGJlZW4gYXNzaWduZWQgd2l0aCBmdXR1cmVzXG4gICAgICAgICAgICBjb25zdCBhdHRyRXhpc3RzID0gIW5vQXR0cnMgJiYgayBpbiBhdHRycztcbiAgICAgICAgICAgIGlmICgocmVBc3NpZ24uaGFzKGspICYmIGF0dHJFeGlzdHMpIHx8ICEoYXR0ckV4aXN0cyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV0/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlc1trXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGhhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNJbml0aWFsVmFsdWVzKVxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oZSwgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kVGFnOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICBleHRlbmRlZCxcbiAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUgfHwge30pLCAuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLml0ZXJhYmxlIHx8IHt9KV07XG4gICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gXG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCBmdWxsUHJvdG8gPSB7fTtcbiAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4pIHtcbiAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgd2Fsa1Byb3RvKGNyZWF0b3Iuc3VwZXIpO1xuXG4gICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgIH1cbiAgICB9KSh0aGlzKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5vdmVycmlkZSk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcblxuICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgIDogdW5pcXVlVGFnSUQ7XG4gICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/IChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdID8/ICcnKSA6ICcnO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3QgZXh0cmFVbmtub3duUHJvcHMgPSBPYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zKS5maWx0ZXIoayA9PiAhWydzdHlsZXMnLCAnaWRzJywgJ2NvbnN0cnVjdGVkJywgJ2RlY2xhcmUnLCAnb3ZlcnJpZGUnLCAnaXRlcmFibGUnXS5pbmNsdWRlcyhrKSk7XG4gICAgICBpZiAoZXh0cmFVbmtub3duUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2V4dGVuZFRhZy5uYW1lfSBkZWZpbmVzIGV4dHJhbmVvdXMga2V5cyAnJHtleHRyYVVua25vd25Qcm9wc30nLCB3aGljaCBhcmUgdW5rbm93bmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kVGFnO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlRWxlbWVudDogQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddID0gKG5hbWUsIGF0dHJzLCAuLi5jaGlsZHJlbikgPT5cbiAgICAvLyBAdHMtaWdub3JlOiBFeHByZXNzaW9uIHByb2R1Y2VzIGEgdW5pb24gdHlwZSB0aGF0IGlzIHRvbyBjb21wbGV4IHRvIHJlcHJlc2VudC50cygyNTkwKVxuICAgIG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgIDogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIG5hbWUgaW4gYmFzZVRhZ0NyZWF0b3JzID8gYmFzZVRhZ0NyZWF0b3JzW25hbWVdKGF0dHJzLCBjaGlsZHJlbilcbiAgICA6IG5hbWUgPT09IGJhc2VUYWdDcmVhdG9ycy5jcmVhdGVFbGVtZW50ID8gWy4uLm5vZGVzKC4uLmNoaWxkcmVuKV1cbiAgICA6IHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nID8gbmFtZShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBEeW5hbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSkgfSlcblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUpIHtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGNvbnN0IHJlbW92YWxzOiBXZWFrTWFwPE5vZGUsIE1hcDxTeW1ib2wgfCBzdHJpbmcsICh0aGlzOiBOb2RlKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgeF0gb2YgcmVtb3ZhbFNldD8uZW50cmllcygpKSB0cnkgeyB4LmNhbGwobm9kZSkgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIklnbm9yZWQgZXhjZXB0aW9uIGhhbmRsaW5nIG5vZGUgcmVtb3ZhbFwiLCBuYW1lLCB4LCBsb2dOb2RlKG5vZGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgIHdhbGsobS5yZW1vdmVkTm9kZXMpXG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXMoZTpOb2RlKSB7IHJldHVybiB0cmFja2VkLmhhcyhlKSB9LFxuICAgIGFkZChlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuYWRkKGUpIH0sXG4gICAgZ2V0UmVtb3ZhbEhhbmRsZXIoZTogTm9kZSwgbmFtZTogU3ltYm9sKSB7XG4gICAgICByZXR1cm4gcmVtb3ZhbHMuZ2V0KGUpPy5nZXQobmFtZSk7XG4gICAgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBTeW1ib2wgfCBzdHJpbmcsIGhhbmRsZXI/OiAodGhpczogTm9kZSk9PnZvaWQpIHtcbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSkgPz8gbmV3IE1hcDxTeW1ib2wgfCBzdHJpbmcsICgpPT52b2lkPigpO1xuICAgICAgICAgIHJlbW92YWxzLnNldChlLCBtYXApO1xuICAgICAgICAgIG1hcC5zZXQobmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSk7XG4gICAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWFwLnNpemUpXG4gICAgICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgQm9vbGVhbihnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuaW5mbygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5jb25zdCBkZWJ1Z0lkID0gU3ltYm9sKFwiZGVmZXJyZWRQcm9taXNlSURcIik7XG5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xuICBbZGVidWdJZF0/OiBudW1iZXJcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xubGV0IGlkID0gMTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBwcm9taXNlW2RlYnVnSWRdID0gaWQrKztcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gZG9lcyBhIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsIHwgb2JqZWN0IHwgRnVuY3Rpb24gfCBzeW1ib2wpXG4vLyBXZSBzaG91bGQgZXhjbHVkZSBBc3luY0l0ZXJhYmxlIGZyb20gdGhlIHR5cGVzIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGl0ZXJhYmxlcyAoYW5kIHRoZXJlZm9yZSBwYXNzZWQgdG8gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSlcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgLy8gRXhjbHVkZTxJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlLCBBc3luY0l0ZXJhdG9yPGFueT4gfCBBc3luY0l0ZXJhYmxlPGFueT4+XG5cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJpbGl0eTxEZXB0aCBleHRlbmRzICdzaGFsbG93JyA9ICdzaGFsbG93Jz4geyBbSXRlcmFiaWxpdHldOiBEZXB0aCB9XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gVGhpcyBpcyBwYXRjaCB0byB0aGUgc3RkIGxpYiBkZWZpbml0aW9uIG9mIEFycmF5PFQ+LiBJIGRvbid0IGtub3cgd2h5IGl0J3MgYWJzZW50LFxuICAvLyBhcyB0aGlzIGlzIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBhbGwgSmF2YVNjcmlwdCBlbmdpbmVzLiBJdCBpcyBwcm9iYWJseSBhIHJlc3VsdFxuICAvLyBvZiBpdHMgYWJzZW5jZSBpbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS92YWx1ZXMsXG4gIC8vIHdoaWNoIGluaGVyaXRzIGZyb20gdGhlIE9iamVjdC5wcm90b3R5cGUsIHdoaWNoIG1ha2VzIG5vIGNsYWltIGZvciB0aGUgcmV0dXJuIHR5cGVcbiAgLy8gc2luY2UgaXQgY291bGQgYmUgb3ZlcnJpZGRlbS4gSG93ZXZlciwgaW4gdGhhdCBjYXNlLCBhIFRTIGRlZm4gc2hvdWxkIGFsc28gb3ZlcnJpZGUgaXRcbiAgLy8gbGlrZSBOdW1iZXIsIFN0cmluZywgQm9vbGVhbiBldGMgZG8uXG4gIGludGVyZmFjZSBBcnJheTxUPiB7XG4gICAgdmFsdWVPZigpOiBBcnJheTxUPjtcbiAgfVxuICAvLyBBcyBhYm92ZSwgdGhlIHJldHVybiB0eXBlIGNvdWxkIGJlIFQgcmF0aGVyIHRoYW4gT2JqZWN0LCBzaW5jZSB0aGlzIGlzIHRoZSBkZWZhdWx0IGltcGwsXG4gIC8vIGJ1dCBpdCdzIG5vdCwgZm9yIHNvbWUgcmVhc29uLlxuICBpbnRlcmZhY2UgT2JqZWN0IHtcbiAgICB2YWx1ZU9mPFQ+KHRoaXM6IFQpOiBJc0l0ZXJhYmxlUHJvcGVydHk8VCwgT2JqZWN0PlxuICB9XG59XG5cbi8qXG4gICAgICBCZWNhdXNlIFRTIGRvZXNuJ3QgaW1wbGVtZW50IHNlcGFyYXRlIHR5cGVzIGZvciByZWFkL3dyaXRlLCBvciBjb21wdXRlZCBnZXR0ZXIvc2V0dGVyIG5hbWVzICh3aGljaCBETyBhbGxvd1xuICAgICAgZGlmZmVyZW50IHR5cGVzIGZvciBhc3NpZ25tZW50IGFuZCBldmFsdWF0aW9uKSwgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGRlZmluZSB0eXBlIGZvciBhcnJheSBtZW1iZXJzIHRoYXQgcGVybWl0XG4gICAgICBkZXJlZmVyZW5jaW5nIG9mIG5vbi1jbGFzaGluaCBhcnJheSBrZXlzIHN1Y2ggYXMgYGpvaW5gIG9yIGBzb3J0YCBhbmQgQXN5bmNJdGVyYXRvciBtZXRob2RzIHdoaWNoIGFsc28gYWxsb3dzXG4gICAgICBzaW1wbGUgYXNzaWdubWVudCBvZiB0aGUgZm9ybSBgdGhpcy5pdGVyYWJsZUFycmF5TWVtYmVyID0gWy4uLl1gLlxuXG4gICAgICBUaGUgQ09SUkVDVCB0eXBlIGZvciB0aGVzZSBmaWVsZHMgd291bGQgYmUgKGlmIFRTIGhhZCBzeW50YXggZm9yIGl0KTpcbiAgICAgIGdldCBbS10gKCk6IE9taXQ8QXJyYXk8RSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFPiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4gICAgICBzZXQgW0tdICgpOiBBcnJheTxFPiB8IEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4qL1xudHlwZSBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXMgPSBrZXlvZiBBcnJheTxhbnk+ICYga2V5b2YgQXN5bmNJdGVyYWJsZUhlbHBlcnNcblxuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gW1RdIGV4dGVuZHMgW2luZmVyIFVdID8gVSAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFU+PiA6IG5ldmVyO1xuXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8VD4gPSBbVF0gZXh0ZW5kcyBbaW5mZXIgSVBdID9cbiAgW0lQXSBleHRlbmRzIFtQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTx1bmtub3duPj5dIHwgW0l0ZXJhYmlsaXR5PCdzaGFsbG93Jz5dID8gSVBcbiAgOiBbSVBdIGV4dGVuZHMgW29iamVjdF0gP1xuICAgIElQIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT4gPyBPbWl0PEl0ZXJhYmxlUHJvcGVydGllczxFPltdLCBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXM+ICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8RVtdPj5cbiAgOiB7IFtLIGluIGtleW9mIElQXTogSXRlcmFibGVQcm9wZXJ0aWVzPElQW0tdPiAmIEl0ZXJhYmxlVHlwZTxJUFtLXT4gfVxuICA6IEl0ZXJhYmxlVHlwZTxJUD5cbiAgOiBuZXZlcjtcblxuZXhwb3J0IHR5cGUgSXNJdGVyYWJsZVByb3BlcnR5PFEsIFIgPSBuZXZlcj4gPSBbUV0gZXh0ZW5kcyBbUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8aW5mZXIgVj4+XSA/IFYgOiBSXG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7XG4gIHB1c2godmFsdWU6IFQpOiBib29sZWFuO1xuICByZWFkb25seSBsZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3luY0V4dHJhSXRlcmFibGU8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7IH1cblxuLy8gTkI6IFRoaXMgYWxzbyAoaW5jb3JyZWN0bHkpIHBhc3NlcyBzeW5jIGl0ZXJhdG9ycywgYXMgdGhlIHByb3RvY29sIG5hbWVzIGFyZSB0aGUgc2FtZVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgJ25leHQnIGluIG8gJiYgdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBvKSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYXRvcihvKSkgcmV0dXJuIG87XG4gIGlmIChpc0FzeW5jSXRlcmFibGUobykpIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYW4gYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5leHBvcnQgY29uc3QgYXN5bmNFeHRyYXMgPSB7XG4gIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLFxuICAgIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICAgIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbiAgKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlKVxuICB9LFxuICBtYXAsXG4gIGZpbHRlcixcbiAgdW5pcXVlLFxuICB3YWl0Rm9yLFxuICBtdWx0aSxcbiAgaW5pdGlhbGx5LFxuICBjb25zdW1lLFxuICBtZXJnZTxULCBBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+W10+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgLi4ubTogQSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgfSxcbiAgY29tYmluZTxULCBTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZSwgTyBleHRlbmRzIENvbWJpbmVPcHRpb25zPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUywgb3B0czogTyA9IHt9IGFzIE8pIHtcbiAgICByZXR1cm4gY29tYmluZShPYmplY3QuYXNzaWduKHsgJ190aGlzJzogdGhpcyB9LCBvdGhlcnMpLCBvcHRzKTtcbiAgfVxufTtcblxuY29uc3QgZXh0cmFLZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYXN5bmNFeHRyYXMpLCAuLi5PYmplY3Qua2V5cyhhc3luY0V4dHJhcyldIGFzIChrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXMpW107XG5cbi8vIExpa2UgT2JqZWN0LmFzc2lnbiwgYnV0IHRoZSBhc3NpZ25lZCBwcm9wZXJ0aWVzIGFyZSBub3QgZW51bWVyYWJsZVxuY29uc3QgaXRlcmF0b3JDYWxsU2l0ZSA9IFN5bWJvbChcIkl0ZXJhdG9yQ2FsbFNpdGVcIik7XG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIG9iamVjdCwgUyBleHRlbmRzIG9iamVjdD4oZDogRCwgczogUykge1xuICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHMpLCAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpXTtcbiAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgeyAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHMsIGspLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgfVxuICBpZiAoREVCVUcpIHtcbiAgICBpZiAoIShpdGVyYXRvckNhbGxTaXRlIGluIGQpKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaXRlcmF0b3JDYWxsU2l0ZSwgeyB2YWx1ZTogbmV3IEVycm9yKCkuc3RhY2sgfSlcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ3BlbmRpbmcnKTtcbmNvbnN0IF9pdGVtcyA9IFN5bWJvbCgnaXRlbXMnKTtcbmZ1bmN0aW9uIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0ge1xuICAgIFtfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW19pdGVtc106IFtdIGFzIEl0ZXJhdG9yUmVzdWx0PFQ+W10gfCBudWxsLFxuXG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxIGFzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPjtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChxW19pdGVtc10/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHFbX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHRoaXMgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgcVtfcGVuZGluZ10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybih2PzogdW5rbm93bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUudmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSByZXR1cm4gLTE7IC8vIFRoZSBxdWV1ZSBoYXMgbm8gY29uc3VtZXJzIGFuZCBoYXMgdGVybWluYXRlZC5cbiAgICAgIHJldHVybiBxW19pdGVtc10ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBwdXNoKHZhbHVlOiBUKSB7XG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuY29uc3QgX2luZmxpZ2h0ID0gU3ltYm9sKCdpbmZsaWdodCcpO1xuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtfaW5mbGlnaHRdOiBTZXQ8VD4gfTtcbiAgcVtfaW5mbGlnaHRdID0gbmV3IFNldDxUPigpO1xuXG4gIHEucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZTogVCkge1xuICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW19pbmZsaWdodF0uaGFzKHZhbHVlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgcVtfaW5mbGlnaHRdLmFkZCh2YWx1ZSk7XG4gICAgICBjb25zdCBwID0gcVtfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbX2luZmxpZ2h0XS5kZWxldGUodmFsdWUpKTtcbiAgICAgIHAucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICB9IGVsc2UgaWYgKCFxW19pdGVtc10uZmluZCh2ID0+IHYudmFsdWUgPT09IHZhbHVlKSkge1xuICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHE7XG59XG5cbi8vIFJlLWV4cG9ydCB0byBoaWRlIHRoZSBpbnRlcm5hbHNcbmV4cG9ydCBjb25zdCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5leHBvcnQgY29uc3QgZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmNvbnN0IF9wcm94aWVkQXN5bmNJdGVyYXRvciA9IFN5bWJvbCgnX3Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMgb2JqZWN0LCBjb25zdCBOIGV4dGVuZHMgc3RyaW5nIHwgc3ltYm9sLCBWIGV4dGVuZHMgSXRlcmFibGVQcm9wZXJ0eVZhbHVlPihvYmo6IFQsIG5hbWU6IE4sIHY6IFYpOiBUICYgSXRlcmFibGVQcm9wZXJ0aWVzPHsgW2sgaW4gTl06IFYgfT4ge1xuICAvLyBNYWtlIGBhYCBhbiBBc3luY0V4dHJhSXRlcmFibGUuIFdlIGRvbid0IGRvIHRoaXMgdW50aWwgYSBjb25zdW1lciBhY3R1YWxseSB0cmllcyB0b1xuICAvLyBhY2Nlc3MgdGhlIGl0ZXJhdG9yIG1ldGhvZHMgdG8gcHJldmVudCBsZWFrcyB3aGVyZSBhbiBpdGVyYWJsZSBpcyBjcmVhdGVkLCBidXRcbiAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gIGxldCBpbml0SXRlcmF0b3IgPSAoKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICBjb25zdCBiaSA9IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl07XG4gICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgZXh0cmFLZXlzLmZvckVhY2goayA9PiAvLyBAdHMtaWdub3JlXG4gICAgICBleHRyYXNba10gPSBiW2sgYXMga2V5b2YgdHlwZW9mIGJdKTtcbiAgICBpZiAoIShfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gYSkpXG4gICAgICBhc3NpZ25IaWRkZW4oYSwgZXh0cmFzKTtcbiAgICByZXR1cm4gYjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBzdHVicyB0aGF0IGxhemlseSBjcmVhdGUgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZSBpbnRlcmZhY2Ugd2hlbiBpbnZva2VkXG4gIGZ1bmN0aW9uIGxhenlBc3luY01ldGhvZDxNIGV4dGVuZHMga2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzPihtZXRob2Q6IE0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgW21ldGhvZF06IGZ1bmN0aW9uICh0aGlzOiB1bmtub3duLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICByZXR1cm4gYVttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBhcyAodHlwZW9mIGFzeW5jRXh0cmFzKVtNXVxuICAgIH1bbWV0aG9kXTtcbiAgfVxuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdiBhcyBBc3luY0l0ZXJhYmxlPFY+O1xuICAgICAgICAgIGxldCBzdGFjayA9IERFQlVHID8gbmV3IEVycm9yKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiBhc3NpZ25lZCB0byBjb25zdW1lIGFub3RoZXIgaXRlcmF0b3IuIERpZCB5b3UgbWVhbiB0byBkZWNsYXJlIGl0P2ApKTtcbiAgICAgICAgICBjb25zdW1lLmNhbGwodiBhcyBBc3luY0l0ZXJhYmxlPFY+LCB5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCwgeyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCAmJiBERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBwaXBlZCBmcm9tIGFub3RoZXIgaXRlcmF0b3IsIGFuZCBtaWdodCBiZSBvdmVycndpdHRlbiBsYXRlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHB1c2godj8udmFsdWVPZigpIGFzIFYpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIG9iaiBhcyBhbnk7XG5cbiAgZnVuY3Rpb24gYm94PFY+KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgLy8gV2UgYm94IG9iamVjdHMgYnkgY3JlYXRpbmcgYSBQcm94eSBmb3IgdGhlIG9iamVjdCB0aGF0IHB1c2hlcyBvbiBnZXQvc2V0L2RlbGV0ZSwgYW5kIG1hcHMgdGhlIHN1cHBsaWVkIGFzeW5jIGl0ZXJhdG9yIHRvIHB1c2ggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgICAgLy8gVGhlIHByb3hpZXMgYXJlIHJlY3Vyc2l2ZSwgc28gdGhhdCBpZiBhbiBvYmplY3QgY29udGFpbnMgb2JqZWN0cywgdGhleSB0b28gYXJlIHByb3hpZWQuIE9iamVjdHMgY29udGFpbmluZyBwcmltaXRpdmVzIHJlbWFpbiBwcm94aWVkIHRvXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYm94T2JqZWN0KGEsIHBkcyk7XG5cbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG5cbiAgdHlwZSBXaXRoUGF0aCA9IHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYTogViwgcGF0aDogc3RyaW5nIHwgbnVsbCB9IH07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspO1xuICAgIHJldHVybiBvO1xuICB9XG4gIGZ1bmN0aW9uIGJveE9iamVjdChhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxQb3NzaWJseVdpdGhQYXRoPikge1xuICAgIGxldCB3aXRoUGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFdpdGhQYXRoW3R5cGVvZiBfcHJveGllZEFzeW5jSXRlcmF0b3JdPjtcbiAgICBsZXQgd2l0aG91dFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgJHtuYW1lLnRvU3RyaW5nKCl9JHtwYXRofS4ke2tleS50b1N0cmluZygpfSBhcyBpdCBpcyBwYXJ0IG9mIGFzeW5jSXRlcmF0b3JgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIGlmIChSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGdldHRpbmcgdGhlIHZhbHVlIG9mIGEgYm94ZWQgb2JqZWN0IG1lbWJlciwgcHJlZmVyIGFzeW5jRXh0cmFJdGVyYWJsZSBvdmVyIHRhcmdldCBrZXlzXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGFuIGFzeW5jRXh0cmFJdGVyYWJsZSBtZW1iZXIsIGNyZWF0ZSB0aGUgbWFwcGVkIHF1ZXVlIHRvIGdlbmVyYXRlIGl0XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHdpdGhvdXRQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0uYSA6IG8pO1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2l0aFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXSA6IHsgYTogbywgcGF0aDogbnVsbCB9KTtcblxuICAgICAgICAgICAgICBsZXQgYWkgPSBmaWx0ZXJNYXAod2l0aFBhdGgsIChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGRlc3RydWN0dXJlKG8uYSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgIT09IHYgfHwgby5wYXRoID09PSBudWxsIHx8IG8ucGF0aC5zdGFydHNXaXRoKHBhdGgpID8gdiA6IElnbm9yZTtcbiAgICAgICAgICAgICAgfSwgSWdub3JlLCBkZXN0cnVjdHVyZShhLCBwYXRoKSk7XG4gICAgICAgICAgICAgIHJldHVybiBhaVtrZXkgYXMga2V5b2YgdHlwZW9mIGFpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGEgdGFyZ2V0IHByb3BlcnR5LCBjcmVhdGUgdGhlIHByb3h5IHRvIGhhbmRsZSBpdFxuICAgICAgICAgIGlmIChrZXkgPT09ICd2YWx1ZU9mJyB8fCAoa2V5ID09PSAndG9KU09OJyAmJiAhKCd0b0pTT04nIGluIHRhcmdldCkpKVxuICAgICAgICAgICAgcmV0dXJuICgpID0+IGRlc3RydWN0dXJlKGEsIHBhdGgpO1xuICAgICAgICAgIGlmIChrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlLCBzaW5jZSBTeW1ib2wudG9QcmltaXRpdmUgaXMgaW4gaGEoKSwgd2UgbmVlZCB0byBpbXBsZW1lbnQgaXRcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaGludD86ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHRhcmdldCkuY2FsbCh0YXJnZXQsIGhpbnQpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ3N0cmluZycpIHJldHVybiB0YXJnZXQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdudW1iZXInKSByZXR1cm4gTnVtYmVyKHRhcmdldCk7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudmFsdWVPZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICgoIShrZXkgaW4gdGFyZ2V0KSB8fCBPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSkgJiYgIShJdGVyYWJpbGl0eSBpbiB0YXJnZXQgJiYgdGFyZ2V0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGZpZWxkID09PSAnZnVuY3Rpb24nKSB8fCBpc0FzeW5jSXRlcihmaWVsZClcbiAgICAgICAgICAgICAgICA/IGZpZWxkXG4gICAgICAgICAgICAgICAgOiBuZXcgUHJveHkoT2JqZWN0KGZpZWxkKSwgaGFuZGxlcihwYXRoICsgJy4nICsga2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBzeW1ib2xpYyBlbnRyeSwgb3IgYSBwcm90b3R5cGljYWwgdmFsdWUgKHNpbmNlIGl0J3MgaW4gdGhlIHRhcmdldCwgYnV0IG5vdCBhIHRhcmdldCBwcm9wZXJ0eSlcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cbi8vY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQgPSBuZXcgTWFwPG51bWJlciwgKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55Pik+KCk7XG4gIGNvbnN0IHByb21pc2VzID0gbmV3IE1hcDxudW1iZXIsUHJvbWlzZTx7IGtleTogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT4+KCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpID0+IHsgfVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgY29uc3QgaXRlciA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGEgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT47XG4gICAgICBpdC5zZXQobiwgaXRlcik7XG4gICAgICBwcm9taXNlcy5zZXQobiwgaXRlci5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsga2V5OiBuLCByZXN1bHQgfSkpKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gcHJvbWlzZXMuc2l6ZVxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcy52YWx1ZXMoKSkudGhlbigoeyBrZXksIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGl0LmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2VzLnNldChrZXksXG4gICAgICAgICAgICAgIGl0LmhhcyhrZXkpXG4gICAgICAgICAgICAgICAgPyBpdC5nZXQoa2V5KSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGtleSwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBrZXksIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSB9KSlcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGtleSwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSB9KSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQudGhyb3chKGV4KSAvLyA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgaXQua2V5cygpKSB7XG4gICAgICAgIGlmIChwcm9taXNlcy5oYXMoa2V5KSkge1xuICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGF3YWl0IGl0LmdldChrZXkpPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBpdC5rZXlzKCkpIHtcbiAgICAgICAgaWYgKHByb21pc2VzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgcmVzdWx0c1trZXldID0gYXdhaXQgaXQuZ2V0KGtleSk/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIFJlcXVpcmVkQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXTogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG50eXBlIFBhcnRpYWxDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmVPcHRpb25zIHtcbiAgaWdub3JlUGFydGlhbD86IGJvb2xlYW47IC8vIFNldCB0byBhdm9pZCB5aWVsZGluZyBpZiBzb21lIHNvdXJjZXMgYXJlIGFic2VudFxufVxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlLCBPIGV4dGVuZHMgQ29tYmluZU9wdGlvbnM+ID0gdHJ1ZSBleHRlbmRzIE9bJ2lnbm9yZVBhcnRpYWwnXSA/IFJlcXVpcmVkQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPiA6IFBhcnRpYWxDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlLCBPIGV4dGVuZHMgQ29tYmluZU9wdGlvbnM+KHNyYzogUywgb3B0cyA9IHt9IGFzIE8pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMsTz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgY29uc3Qgc2kgPSBuZXcgTWFwPHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgQXN5bmNJdGVyYXRvcjxhbnk+PigpO1xuICBsZXQgcGM6IE1hcDxzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIFByb21pc2U8eyBrOiBzdHJpbmcsIGlyOiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+PjsgLy8gSW5pdGlhbGl6ZWQgbGF6aWx5XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gbmV3IE1hcChPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssIHNpdF0pID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHNpLnNldChrLCBzb3VyY2UpO1xuICAgICAgICAgIHJldHVybiBbaywgc291cmNlLm5leHQoKS50aGVuKGlyID0+ICh7IHNpLCBrLCBpciB9KSldO1xuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoZnVuY3Rpb24gc3RlcCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKHBjLnZhbHVlcygpKS50aGVuKCh7IGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGMuZGVsZXRlKGspO1xuICAgICAgICAgICAgc2kuZGVsZXRlKGspO1xuICAgICAgICAgICAgaWYgKCFwYy5zaXplKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrIGFzIGtleW9mIHR5cGVvZiBhY2N1bXVsYXRlZF0gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjLnNldChrLCBzaS5nZXQoaykhLm5leHQoKS50aGVuKGlyID0+ICh7IGssIGlyIH0pKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgZm9yIChjb25zdCBhaSBvZiBzaS52YWx1ZXMoKSkge1xuICAgICAgICAgIGFpLnJldHVybj8uKHYpXG4gICAgICB9O1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChjb25zdCBhaSBvZiBzaS52YWx1ZXMoKSlcbiAgICAgICAgYWkudGhyb3c/LihleClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBhc3NpZ25IaWRkZW4oYWksIGFzeW5jRXh0cmFzKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBc3luY0V4dHJhSXRlcmFibGU8VD4gJiBBIDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczogUGFyYW1ldGVyczxHPik6IFJldHVyblR5cGU8Rz4ge1xuICAgIGNvbnN0IGFpID0gZyguLi5hcmdzKTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFpKSBhcyBSZXR1cm5UeXBlPEc+O1xuICB9IGFzICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KSA9PiBSZXR1cm5UeXBlPEc+ICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFJldHVyblR5cGU8Rz4gZXh0ZW5kcyBBc3luY0dlbmVyYXRvcjxpbmZlciBUPiA/IFQgOiB1bmtub3duPlxufVxuXG4vKiBBc3luY0l0ZXJhYmxlIGhlbHBlcnMsIHdoaWNoIGNhbiBiZSBhdHRhY2hlZCB0byBhbiBBc3luY0l0ZXJhdG9yIHdpdGggYHdpdGhIZWxwZXJzKGFpKWAsIGFuZCBpbnZva2VkIGRpcmVjdGx5IGZvciBmb3JlaWduIGFzeW5jSXRlcmF0b3JzICovXG5cbi8qIHR5cGVzIHRoYXQgYWNjZXB0IFBhcnRpYWxzIGFzIHBvdGVudGlhbGx1IGFzeW5jIGl0ZXJhdG9ycywgc2luY2Ugd2UgcGVybWl0IHRoaXMgSU4gVFlQSU5HIHNvXG4gIGl0ZXJhYmxlIHByb3BlcnRpZXMgZG9uJ3QgY29tcGxhaW4gb24gZXZlcnkgYWNjZXNzIGFzIHRoZXkgYXJlIGRlY2xhcmVkIGFzIFYgJiBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8Vj4+XG4gIGR1ZSB0byB0aGUgc2V0dGVycyBhbmQgZ2V0dGVycyBoYXZpbmcgZGlmZmVyZW50IHR5cGVzLCBidXQgdW5kZWNsYXJhYmxlIGluIFRTIGR1ZSB0byBzeW50YXggbGltaXRhdGlvbnMgKi9cbnR5cGUgSGVscGVyQXN5bmNJdGVyYWJsZTxRIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+PiA9IEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8UT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT47XG50eXBlIEhlbHBlckFzeW5jSXRlcmF0b3I8Rj4gPVxuICBGIGV4dGVuZHMgKCkgPT4gQXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WiwgUj4odjogTWF5YmVQcm9taXNlZDxaPiwgdGhlbjogKHY6IFopID0+IFIsIGV4Y2VwdDogKHg6IGFueSkgPT4gYW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbiwgZXhjZXB0KTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdGhlbih2KVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldHVybiBleGNlcHQoZXgpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4sXG4gIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmUsXG4gIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCl7XG4gICAgLy8gQHRzLWlnbm9yZSAtIHJlbW92ZSByZWZlcmVuY2VzIGZvciBHQ1xuICAgIGFpID0gZmFpID0gbnVsbDtcbiAgICBwcmV2ID0gSWdub3JlO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cbiAgbGV0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyAocHJldiA9IElnbm9yZSwgcmVzb2x2ZShwKSlcbiAgICAgICAgICAgIDogcmVzb2x2ZVN5bmMoZm4ocC52YWx1ZSwgcHJldiksXG4gICAgICAgICAgICAgIGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgPyBzdGVwKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLFxuICAgICAgICAgICAgICBleCA9PiB7XG4gICAgICAgICAgICAgICAgcHJldiA9IElnbm9yZTsgLy8gUmVtb3ZlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4gV2UgY2hlY2sgYWkgaGVyZSBhcyBpdCBtaWdodCBoYXZlIGJlZW4gdGVybWluYXRlZCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUmVzcG9uc2UgPSBhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgICAgICAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAoYWkpIGFuZCBjb25zdW1lciAocmVqZWN0KVxuICAgICAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZVJlc3BvbnNlKSkgc291cmNlUmVzcG9uc2UudGhlbihyZWplY3QscmVqZWN0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVJlc3BvbnNlID0gYWkudGhyb3c/LihleCkgPz8gYWkucmV0dXJuPy4oZXgpO1xuICAgICAgICAgIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIChhaSkgYW5kIGNvbnN1bWVyIChyZWplY3QpXG4gICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlUmVzcG9uc2UpKSBzb3VyY2VSZXNwb25zZS50aGVuKHJlamVjdCwgcmVqZWN0KTtcbiAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBzb3VyY2VSZXNwb25zZSB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lLCBkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudD8ucmVzb2x2ZShpdCk7XG4gICAgaWYgKGl0Py5kb25lKSB7XG4gICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGlmIChhaSkge1xuICAgICAgICBhaS5uZXh0KClcbiAgICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICBjdXJyZW50Py5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXJyb3IgfSk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZVxuICAgICAgICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3VycmVudC5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH07XG4gICAgLy8gQHRzLWlnbm9yZTogcmVtb3ZlIHJlZmVyZW5jZXMgZm9yIEdDXG4gICAgYWkgPSBtYWkgPSBjdXJyZW50ID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgbGV0IG1haTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgIHJldHVybiBtYWk7XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAoIWFpKSB7XG4gICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdz8uKGV4KSA/PyBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWFpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IGl0ZXJhYmxlSGVscGVycywgbWVyZ2UsIEFzeW5jRXh0cmFJdGVyYWJsZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuLypcbiAgYHdoZW4oLi4uLilgIGlzIGJvdGggYW4gQXN5bmNJdGVyYWJsZSBvZiB0aGUgZXZlbnRzIGl0IGNhbiBnZW5lcmF0ZSBieSBvYnNlcnZhdGlvbixcbiAgYW5kIGEgZnVuY3Rpb24gdGhhdCBjYW4gbWFwIHRob3NlIGV2ZW50cyB0byBhIHNwZWNpZmllZCB0eXBlLCBlZzpcblxuICB0aGlzLndoZW4oJ2tleXVwOiNlbGVtZXQnKSA9PiBBc3luY0l0ZXJhYmxlPEtleWJvYXJkRXZlbnQ+XG4gIHRoaXMud2hlbignI2VsZW1ldCcpKGUgPT4gZS50YXJnZXQpID0+IEFzeW5jSXRlcmFibGU8RXZlbnRUYXJnZXQ+XG4qL1xuLy8gVmFyYXJncyB0eXBlIHBhc3NlZCB0byBcIndoZW5cIlxudHlwZSBXaGVuUGFyYW1ldGVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuICB8IEFzeW5jSXRlcmFibGU8YW55PlxuXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxXaGVuUGFyYW1ldGVyPElEUz4+XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyXG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+XG5cbnR5cGUgRW1wdHlPYmplY3QgPSBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBuZXZlcj5cblxuaW50ZXJmYWNlIFNwZWNpYWxXaGVuRXZlbnRzIHtcbiAgXCJAc3RhcnRcIjogRW1wdHlPYmplY3QsICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IEVtcHR5T2JqZWN0ICAgLy8gRmlyZXMgd2hlbiBhbGwgRWxlbWVudCBzcGVjaWZpZWQgc291cmNlcyBhcmUgbW91bnRlZCBpbiB0aGUgRE9NXG59XG5cbmV4cG9ydCBjb25zdCBSZWFkeSA9IE9iamVjdC5mcmVlemUoe30pO1xuXG5pbnRlcmZhY2UgV2hlbkV2ZW50cyBleHRlbmRzIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCwgU3BlY2lhbFdoZW5FdmVudHMge31cbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXJcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXJcblxuXG50eXBlIEV2ZW50QXR0cmlidXRlID0gYCR7a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwfWBcbi8vIE5vdGU6IHRoaXMgc2xvd3MgZG93biB0eXBlc2NyaXB0LiBTaW1wbHkgZGVmaW5pbmcgYENTU0lkZW50aWZpZXIgPSBzdHJpbmdgIGlzIHF1aWNrZXIsIGJ1dCBwcmV2ZW50cyB3aGVuIHZhbGlkYXRpbmcgc3ViLUlEU3Mgb3Igc2VsZWN0b3IgZm9ybWF0dGluZ1xudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfCBgIyR7SURTfT5gIHwgYC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz5cblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+ID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7Q1NTSWRlbnRpZmllcn1gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50cyA/IEV2ZW50TmFtZVVuaW9uPFM+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFM+XG4gIDogUyBleHRlbmRzIENTU0lkZW50aWZpZXIgPyAnY2hhbmdlJ1xuICA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dXG5cbi8qKiB3aGVuICoqL1xuaW50ZXJmYWNlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXJSZWY6IFdlYWtSZWY8RWxlbWVudD5cbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGw7XG4gIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbjtcbn1cblxuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgV2Vha01hcDxEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIE1hcDxrZXlvZiBXaGVuRXZlbnRzLCBTZXQ8RXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+Pj4+KCk7XG5cbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+KHRoaXM6IERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKHRoaXMpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldCh0aGlzLCBuZXcgTWFwKCkpO1xuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldCh0aGlzKSEuZ2V0KGV2LnR5cGUgYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwKTtcbiAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXJSZWYsIHNlbGVjdG9yLCBpbmNsdWRlQ2hpbGRyZW4gfSA9IG87XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGNvbnRhaW5lclJlZi5kZXJlZigpO1xuICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lcj8uaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICB0ZXJtaW5hdGUobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgIGlmICgoaW5jbHVkZUNoaWxkcmVuID8gbi5jb250YWlucyhldi50YXJnZXQpIDogZXYudGFyZ2V0ID09PSBuKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoaW5jbHVkZUNoaWxkcmVuID8gY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IGNvbnRhaW5lciApXG4gICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUud2FybignZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIGNoaWxkbGVzczxUIGV4dGVuZHMgc3RyaW5nIHwgbnVsbD4oc2VsOiBUKTogVCBleHRlbmRzIG51bGwgPyB7IGluY2x1ZGVDaGlsZHJlbjogdHJ1ZSwgc2VsZWN0b3I6IG51bGwgfSA6IHsgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuLCBzZWxlY3RvcjogVCB9IHtcbiAgY29uc3QgaW5jbHVkZUNoaWxkcmVuID0gIXNlbCB8fCAhc2VsLmVuZHNXaXRoKCc+JylcbiAgcmV0dXJuIHsgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3RvcjogaW5jbHVkZUNoaWxkcmVuID8gc2VsIDogc2VsLnNsaWNlKDAsLTEpIH0gYXMgYW55O1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtSZXR1cm5UeXBlPHR5cGVvZiBjaGlsZGxlc3M+LCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1swXSksXCJjaGFuZ2VcIl07XG4gICAgcmV0dXJuIFt7IGluY2x1ZGVDaGlsZHJlbjogdHJ1ZSwgc2VsZWN0b3I6IG51bGwgfSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1sxXSksIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6bmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIHdoZW5FdmVudDxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KGNvbnRhaW5lcjogRWxlbWVudCwgd2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KSB7XG4gIGNvbnN0IFt7IGluY2x1ZGVDaGlsZHJlbiwgc2VsZWN0b3J9LCBldmVudE5hbWVdID0gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkgPz8gZG9UaHJvdyhcIkludmFsaWQgV2hlblNlbGVjdG9yOiBcIit3aGF0KTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhjb250YWluZXIub3duZXJEb2N1bWVudCkpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50LCBuZXcgTWFwKCkpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBjb250YWluZXIub3duZXJEb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5nZXQoZXZlbnROYW1lKTtcbiAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBba2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXT4oKCkgPT4gb2JzZXJ2YXRpb25zIS5kZWxldGUoZGV0YWlscykpO1xuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyUmVmOiBuZXcgV2Vha1JlZihjb250YWluZXIpLFxuICAgIGluY2x1ZGVDaGlsZHJlbixcbiAgICBzZWxlY3RvclxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBvYnNlcnZhdGlvbnMhLmFkZChkZXRhaWxzKSk7XG5cbiAgcmV0dXJuIHF1ZXVlLm11bHRpKCkgO1xufVxuXG5hc3luYyBmdW5jdGlvbiogZG9uZUltbWVkaWF0ZWx5PFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIHJldHVybiB1bmRlZmluZWQgYXMgWjtcbn1cblxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmM8QSBleHRlbmRzIEFzeW5jRXh0cmFJdGVyYWJsZTxYPiwgWD4oc3JjOiBBKTogTWFwcGFibGVJdGVyYWJsZTxBPiB7XG4gIGZ1bmN0aW9uIG1hcHBhYmxlQXN5bmNJdGVyYWJsZShtYXBwZXI6IFBhcmFtZXRlcnM8dHlwZW9mIHNyYy5tYXA+WzBdKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAobWFwcGVyKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUgYXMgdW5rbm93biBhcyBBc3luY0l0ZXJhYmxlPEE+KSwge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICB9KSBhcyBNYXBwYWJsZUl0ZXJhYmxlPEE+O1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkV2hlblNlbGVjdG9yKHdoYXQ6IFdoZW5QYXJhbWV0ZXIpOiB3aGF0IGlzIFZhbGlkV2hlblNlbGVjdG9yIHtcbiAgaWYgKCF3aGF0KVxuICAgIHRocm93IG5ldyBFcnJvcignRmFsc3kgYXN5bmMgc291cmNlIHdpbGwgbmV2ZXIgYmUgcmVhZHlcXG5cXG4nICsgSlNPTi5zdHJpbmdpZnkod2hhdCkpO1xuICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG9uY2U8VD4ocDogUHJvbWlzZTxUPikge1xuICB5aWVsZCBwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hlbjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+KGNvbnRhaW5lcjogRWxlbWVudCwgLi4uc291cmNlczogUyk6IFdoZW5SZXR1cm48Uz4ge1xuICBpZiAoIXNvdXJjZXMgfHwgc291cmNlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSkgYXMgdW5rbm93biBhcyBXaGVuUmV0dXJuPFM+O1xuICB9XG5cbiAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICA/IHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpXG4gICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICA/IG9uY2Uod2hhdClcbiAgICAgICAgOiB3aGF0KTtcblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICBjb25zdCBzdGFydDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHt9PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHN0YXJ0LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfSlcbiAgICAgIH1cbiAgICB9O1xuICAgIGl0ZXJhdG9ycy5wdXNoKHN0YXJ0KTtcbiAgfVxuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgIGNvbnN0IHdhdGNoU2VsZWN0b3JzID0gc291cmNlcy5maWx0ZXIoaXNWYWxpZFdoZW5TZWxlY3RvcikubWFwKHdoYXQgPT4gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCk/LlswXSk7XG5cbiAgICBjb25zdCBpc01pc3NpbmcgPSAoc2VsOiBDU1NJZGVudGlmaWVyIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHNlbCBpcyBDU1NJZGVudGlmaWVyID0+IEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLm1hcCh3ID0+IHc/LnNlbGVjdG9yKS5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGxldCBldmVudHM6IEFzeW5jSXRlcmF0b3I8YW55LCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxhbnk+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGFpIH0sXG4gICAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnRocm93KSByZXR1cm4gZXZlbnRzLnRocm93KGV4KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIH0sXG4gICAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy5yZXR1cm4pIHJldHVybiBldmVudHMucmV0dXJuKHYpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICB9LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgaWYgKGV2ZW50cykgcmV0dXJuIGV2ZW50cy5uZXh0KCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBtaXNzaW5nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgOiBkb25lSW1tZWRpYXRlbHkoKTtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IFJlYWR5IH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAoZG9uZUltbWVkaWF0ZWx5PFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGZ1bmN0aW9uIGNvbnRhaW5lcklzSW5ET00oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiBbLi4uci5yZW1vdmVkTm9kZXNdLnNvbWUociA9PiByID09PSBjb250YWluZXIgfHwgci5jb250YWlucyhjb250YWluZXIpKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbW92ZWQgZnJvbSBET01cIikpO1xuICAgICAgICB9XG4gICAgICB9KS5vYnNlcnZlKGNvbnRhaW5lci5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczpgKTtcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBcIlxcblwiICsgY29udGFpbmVyLm91dGVySFRNTCk7XG4gICAgICAgIC8vcmVqZWN0KG5ldyBFcnJvcihcIkVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzXCIpKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuXG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczogYCkgPz8gJz8/JztcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBtaXNzaW5nICsgXCJcXG5cIik7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKS50aGVuKCgpID0+IGFsbFNlbGVjdG9yc1ByZXNlbnQoc2VsZWN0b3JzKSlcbiAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcywgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlLCBJdGVyYWJsZVR5cGUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz4gLy8gSXRlcmFibGUgdGhpbmdzIHRoYXQgaG9sZCB0aGUgYWJvdmUsIGxpa2UgQXJyYXlzLCBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3RcblxuLyogVHlwZXMgdXNlZCB0byB2YWxpZGF0ZSBhbiBleHRlbmRlZCB0YWcgZGVjbGFyYXRpb24gKi9cblxudHlwZSBEZWVwUGFydGlhbDxYPiA9IFtYXSBleHRlbmRzIFt7fV0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFhcbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogT1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuLyogVHlwZXMgdGhhdCBmb3JtIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleHRlbmRlZCB0YWcgKi9cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICAvKiBWYWx1ZXMgZm9yIHByb3BlcnRpZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIGFueSBiYXNlIGEgdGFnIGlzIGV4dGVuZGVkIGZyb20gKi9cbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgbmV3IHByb3BlcnRpZXMgaW4gdGhpcyB0YWcgZGVmaW5pdGlvbi4gKi9cbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgLyogRGVjbGFyYXRpb24gYW5kIGRlZmF1bHQgdmFsdWVlcyBmb3Igbm93IHByb3BlcnRpZXMgdGhhdCBhcmUgYm94ZWQgYnkgZGVmaW5lSXRlcmFibGVQcm9wZXJ0aWVzICovXG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIC8qIFNwZWNpZmljYXRpb24gb2YgdGhlIHR5cGVzIG9mIGVsZW1lbnRzIGJ5IElEIHRoYXQgYXJlIGNvbnRhaW5lZCBieSB0aGlzIHRhZyAqL1xuICBpZHM/OiB7IFtpZDogc3RyaW5nXTogVGFnQ3JlYXRvckZ1bmN0aW9uPGFueT47IH07XG4gIC8qIFN0YXRpYyBDU1MgcmVmZXJlbmNlZCBieSB0aGlzIHRhZyAqL1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUYWdDcmVhdG9yRm9ySURTPEkgZXh0ZW5kcyBOb25OdWxsYWJsZTxPdmVycmlkZXNbJ2lkcyddPj4ge1xuICA8Y29uc3QgSyBleHRlbmRzIGtleW9mIEk+KFxuICAgIGF0dHJzOnsgaWQ6IEsgfSAmIEV4Y2x1ZGU8UGFyYW1ldGVyczxJW0tdPlswXSwgQ2hpbGRUYWdzPixcbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgKTogUmV0dXJuVHlwZTxJW0tdPlxufVxuXG50eXBlIElEUzxJIGV4dGVuZHMgT3ZlcnJpZGVzWydpZHMnXT4gPSBJIGV4dGVuZHMgTm9uTnVsbGFibGU8T3ZlcnJpZGVzWydpZHMnXT4gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBSZXR1cm5UeXBlPElbSl0+O1xuICB9ICYgVGFnQ3JlYXRvckZvcklEUzxJPlxufSA6IHsgaWRzOiB7fSB9XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPiB8IEl0ZXJhYmxlVHlwZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGF0dHJpYnV0ZXMgZnJvbSBhbiBFeFRhZ0NyZWF0b3JcbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPSBUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIEJhc2VBdHRycz5cbiAgPyBCYXNlQXR0cnNcbiAgOiBuZXZlclxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQmFzZSwgaW5mZXIgU3VwZXIsIGluZmVyIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX1N0YXRpY3M+XG4gID8gQmFzZUl0ZXJhYmxlczxTdXBlcj4gZXh0ZW5kcyBuZXZlclxuICAgID8gU3VwZXJEZWZzWydpdGVyYWJsZSddIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXVxuICAgICAgOiB7fVxuICAgIDogQmFzZUl0ZXJhYmxlczxTdXBlcj4gJiBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgOiBuZXZlclxuXG4vLyBXb3JrIG91dCB0aGUgdHlwZXMgb2YgYWxsIHRoZSBub24taXRlcmFibGUgcHJvcGVydGllcyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9XG4gIERbJ2RlY2xhcmUnXVxuICAmIERbJ292ZXJyaWRlJ11cbiAgJiBJRFM8RFsnaWRzJ10+XG4gICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgRFsnaXRlcmFibGUnXT5cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ11cblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9yQ2FsbFN0YWNrIGV4dGVuZHMgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXTtcbiAgW2s6IHN0cmluZ106IHVua25vd25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbiB7IChhdHRyczogQ29uc3RydWN0b3JDYWxsU3RhY2sgfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IEVsZW1lbnQgfVxuXG5pbnRlcmZhY2UgSW5zdGFuY2VVbmlxdWVJRCB7IFtVbmlxdWVJRF06IHN0cmluZyB9XG5leHBvcnQgdHlwZSBJbnN0YW5jZTxUID0gSW5zdGFuY2VVbmlxdWVJRD4gPSBJbnN0YW5jZVVuaXF1ZUlEICYgVFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yIHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID1cbiAgVGFnQ29uc3R1Y3RvciAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+PlxuICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4sXG4gICAgRFsnZGVjbGFyZSddXG4gICAgJiBEWydvdmVycmlkZSddXG4gICAgJiBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxELCBCYXNlPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4+XG4gID5cblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbj5cblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgZXh0ZW5kcyBJbnN0YW5jZVVuaXF1ZUlEID0gSW5zdGFuY2VVbmlxdWVJRFxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0lzSXRlcmFibGVQcm9wZXJ0eVZhbHVlPFQsIFByZWZpeCBleHRlbmRzIHN0cmluZyA9ICcnPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgPyBuZXZlciAvLyBUaGlzIGlzbid0IGEgcHJvYmxlbSBhcyBpdCdzIGFuIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBGdW5jdGlvblxuICAgID8geyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gfSAvLyBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIGRvZXNuJ3QgYWxsb3cgRnVuY3Rpb25zXG4gICAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBvYmplY3QgLy8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSBhbGxvd3Mgb2JqZWN0cyBpZiB0aGV5IGFyZSBhcmUgbWFwcyBvZiBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlc1xuICAgICAgPyBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBBcnJheTxpbmZlciBaPiAvLyAuLi4ub3IgYXJyYXlzIG9mIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVzXG4gICAgICAgID8gWiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA/IG5ldmVyIDogeyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFpbXSwgdW5kZWZpbmVkPiB9Ly8gSWYgaXQncyBhbiBhcnJheW0gY2hlY2sgdGhlIGFycmF5IG1lbWJlciB1bmlvbiBpcyBhbHNvIGFzc2lnbmFibGUgdG8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZVxuICAgICAgICA6IENoZWNrSXNJdGVyYWJsZVByb3BlcnR5VmFsdWU8RXhjbHVkZTxUW0tdLCB1bmRlZmluZWQ+LCBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfS5gPlxuICAgICAgOiB7IFtQIGluIGAke1ByZWZpeH0ke0sgJiBzdHJpbmd9YF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiB9XG59W2tleW9mIFRdIGV4dGVuZHMgaW5mZXIgT1xuICA/IHsgW0sgaW4ga2V5b2YgT106IE9bS10gfVxuICA6IG5ldmVyO1xuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG4gIFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiYGNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIHsgaXRlcmFibGU6IGFueSB9XG4gICAgICA/IHsgXCJUaGUgZXh0ZW5kZWQgdGFnIGRlZmludGlvbiBjb250YWlucyBub24taXRlcmFibGUgdHlwZXNcIjogRXhjbHVkZTxDaGVja0lzSXRlcmFibGVQcm9wZXJ0eVZhbHVlPFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2l0ZXJhYmxlJ10+LCB1bmRlZmluZWQ+IH1cbiAgICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+aW5mZXIgUlxuICAgICAgPyAoKGU6IEUpPT5SKSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD5cbnR5cGUgUG9zc2libHlBc3luYzxYPiA9IFtYXSBleHRlbmRzIFtvYmplY3RdIC8qIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb24gKi9cbiAgPyBYIGV4dGVuZHMgQXN5bmNQcm92aWRlcjxpbmZlciBVPlxuICAgID8gWCBleHRlbmRzIChBc3luY1Byb3ZpZGVyPFU+ICYgVSlcbiAgICAgID8gVSB8IEFzeW5jQXR0cjxVPiAvLyBpdGVyYWJsZSBwcm9wZXJ0eVxuICAgICAgOiBYIHwgUHJvbWlzZUxpa2U8WD4gLy8gc29tZSBvdGhlciBBc3luY1Byb3ZpZGVyXG4gICAgOiBYIGV4dGVuZHMgKGFueVtdIHwgRnVuY3Rpb24pXG4gICAgICA/IFggfCBBc3luY0F0dHI8WD4gIC8vIEFycmF5IG9yIEZ1bmN0aW9uLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgYXN5bmNcbiAgICAgIDogeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT4gfSB8IFBhcnRpYWw8WD4gfCBBc3luY0F0dHI8UGFydGlhbDxYPj4gLy8gT3RoZXIgb2JqZWN0IC0gcGFydGlhbGx5LCBwb3NzaWJsZSBhc3luY1xuICA6IFggfCBBc3luY0F0dHI8WD4gLy8gU29tZXRoaW5nIGVsc2UgKG51bWJlciwgZXRjKSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGFzeW5jXG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+KTtcbiAgfSlcbiAgOiAoT21pdDxFLCAnYXR0cmlidXRlcyc+KVxuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdXG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxCYXNlPiAmIFRoaXNUeXBlPEJhc2U+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxCYXNlPlxuXG4vKiBBIFRhZ0NyZWF0b3IgaXMgVGFnQ3JlYXRvckZ1bmN0aW9uIGRlY29yYXRlZCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcy4gVGhlIFN1cGVyICYgU3RhdGljcyBhcmdzIGFyZSBvbmx5XG5ldmVyIHNwZWNpZmllZCBieSBFeHRlbmRlZFRhZyAoaW50ZXJuYWxseSksIGFuZCBzbyBpcyBub3QgZXhwb3J0ZWQgKi9cbnR5cGUgRXhUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3QsXG4gIFN1cGVyIGV4dGVuZHMgKHVua25vd24gfCBFeFRhZ0NyZWF0b3I8YW55PikgPSB1bmtub3duLFxuICBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMgPSB7fSxcbiAgU3RhdGljcyA9IHt9LFxuPiA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiBJbnN0YW5jZVVuaXF1ZUlEOyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbn0gJiBJbnN0YW5jZVVuaXF1ZUlEICZcbi8vIGBTdGF0aWNzYCBoZXJlIGlzIHRoYXQgc2FtZSBhcyBTdGF0aWNSZWZlcmVuY2VzPFN1cGVyLCBTdXBlckRlZnM+LCBidXQgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBicmVha3MgVFNcbi8vIHNvIHdlIGNvbXB1dGUgdGhlIFN0YXRpY3Mgb3V0c2lkZSB0aGlzIHR5cGUgZGVjbGFyYXRpb24gYXMgcGFzcyB0aGVtIGFzIGEgcmVzdWx0XG5TdGF0aWNzXG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2ZXIsIG5ldmVyLCB7fT5cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNDTyxJQUFNLFFBQVEsV0FBVyxTQUFTLE9BQU8sV0FBVyxTQUFTLFFBQVEsUUFBUSxXQUFXLE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxLQUFLO0FBRTlILElBQU0sY0FBYztBQUUzQixJQUFNLFdBQVc7QUFBQSxFQUNmLE9BQU8sTUFBVztBQUNoQixRQUFJLE1BQU8sU0FBUSxJQUFJLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLGtCQUFpQixJQUFJLENBQUM7QUFBQSxFQUNuRztBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLEtBQUssaUJBQWlCLEdBQUcsTUFBTSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsa0JBQWlCLElBQUksQ0FBQztBQUFBLEVBQ3JHO0FBQUEsRUFDQSxRQUFRLE1BQVc7QUFDakIsUUFBSSxNQUFPLFNBQVEsS0FBSyxpQkFBaUIsR0FBRyxJQUFJO0FBQUEsRUFDbEQ7QUFDRjs7O0FDWkEsSUFBTSxVQUFVLE9BQU8sbUJBQW1CO0FBUzFDLElBQU0sVUFBVSxDQUFDLE1BQVM7QUFBQztBQUMzQixJQUFJLEtBQUs7QUFDRixTQUFTLFdBQWtDO0FBQ2hELE1BQUksVUFBK0M7QUFDbkQsTUFBSSxTQUErQjtBQUNuQyxRQUFNLFVBQVUsSUFBSSxRQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsTUFBTSxJQUFJLENBQUM7QUFDOUQsVUFBUSxVQUFVO0FBQ2xCLFVBQVEsU0FBUztBQUNqQixNQUFJLE9BQU87QUFDVCxZQUFRLE9BQU8sSUFBSTtBQUNuQixVQUFNLGVBQWUsSUFBSSxNQUFNLEVBQUU7QUFDakMsWUFBUSxNQUFNLFFBQU8sY0FBYyxTQUFTLElBQUksaUJBQWlCLFFBQVMsU0FBUSxJQUFJLHNCQUFzQixJQUFJLGlCQUFpQixZQUFZLElBQUksTUFBUztBQUFBLEVBQzVKO0FBQ0EsU0FBTztBQUNUO0FBR08sU0FBUyxhQUFhLEdBQTRCO0FBQ3ZELFNBQU8sS0FBSyxPQUFPLE1BQU0sWUFBWSxPQUFPLE1BQU07QUFDcEQ7QUFFTyxTQUFTLGNBQWlCLEdBQTZCO0FBQzVELFNBQU8sYUFBYSxDQUFDLEtBQU0sVUFBVSxLQUFNLE9BQU8sRUFBRSxTQUFTO0FBQy9EOzs7QUNuQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFvQ08sSUFBTSxjQUFjLE9BQU8sYUFBYTtBQXFEeEMsU0FBUyxnQkFBNkIsR0FBa0Q7QUFDN0YsU0FBTyxhQUFhLENBQUMsS0FBSyxVQUFVLEtBQUssT0FBTyxHQUFHLFNBQVM7QUFDOUQ7QUFDTyxTQUFTLGdCQUE2QixHQUFrRDtBQUM3RixTQUFPLGFBQWEsQ0FBQyxLQUFNLE9BQU8saUJBQWlCLEtBQU0sT0FBTyxFQUFFLE9BQU8sYUFBYSxNQUFNO0FBQzlGO0FBQ08sU0FBUyxZQUF5QixHQUF3RjtBQUMvSCxTQUFPLGdCQUFnQixDQUFDLEtBQUssZ0JBQWdCLENBQUM7QUFDaEQ7QUFJTyxTQUFTLGNBQWlCLEdBQXFCO0FBQ3BELE1BQUksZ0JBQWdCLENBQUMsRUFBRyxRQUFPO0FBQy9CLE1BQUksZ0JBQWdCLENBQUMsRUFBRyxRQUFPLEVBQUUsT0FBTyxhQUFhLEVBQUU7QUFDdkQsUUFBTSxJQUFJLE1BQU0sdUJBQXVCO0FBQ3pDO0FBR08sSUFBTSxjQUFjO0FBQUEsRUFDekIsVUFDRSxJQUNBLGVBQWtDLFFBQ2xDO0FBQ0EsV0FBTyxVQUFVLE1BQU0sSUFBSSxZQUFZO0FBQUEsRUFDekM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxTQUErRSxHQUFNO0FBQ25GLFdBQU8sTUFBTSxNQUFNLEdBQUcsQ0FBQztBQUFBLEVBQ3pCO0FBQUEsRUFDQSxRQUEyRixRQUFXLE9BQVUsQ0FBQyxHQUFRO0FBQ3ZILFdBQU8sUUFBUSxPQUFPLE9BQU8sRUFBRSxTQUFTLEtBQUssR0FBRyxNQUFNLEdBQUcsSUFBSTtBQUFBLEVBQy9EO0FBQ0Y7QUFFQSxJQUFNLFlBQVksQ0FBQyxHQUFHLE9BQU8sc0JBQXNCLFdBQVcsR0FBRyxHQUFHLE9BQU8sS0FBSyxXQUFXLENBQUM7QUFHNUYsSUFBTSxtQkFBbUIsT0FBTyxrQkFBa0I7QUFDbEQsU0FBUyxhQUFpRCxHQUFNLEdBQU07QUFDcEUsUUFBTSxPQUFPLENBQUMsR0FBRyxPQUFPLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxPQUFPLHNCQUFzQixDQUFDLENBQUM7QUFDbEYsYUFBVyxLQUFLLE1BQU07QUFDcEIsV0FBTyxlQUFlLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyx5QkFBeUIsR0FBRyxDQUFDLEdBQUcsWUFBWSxNQUFNLENBQUM7QUFBQSxFQUM3RjtBQUNBLE1BQUksT0FBTztBQUNULFFBQUksRUFBRSxvQkFBb0IsR0FBSSxRQUFPLGVBQWUsR0FBRyxrQkFBa0IsRUFBRSxPQUFPLElBQUksTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUFBLEVBQ3ZHO0FBQ0EsU0FBTztBQUNUO0FBRUEsSUFBTSxXQUFXLE9BQU8sU0FBUztBQUNqQyxJQUFNLFNBQVMsT0FBTyxPQUFPO0FBQzdCLFNBQVMsZ0NBQW1DLE9BQU8sTUFBTTtBQUFFLEdBQUc7QUFDNUQsUUFBTSxJQUFJO0FBQUEsSUFDUixDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQUEsSUFDYixDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFFWCxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQ3ZCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxPQUFPO0FBQ0wsVUFBSSxFQUFFLE1BQU0sR0FBRyxRQUFRO0FBQ3JCLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtBQUFBLE1BQzNDO0FBRUEsVUFBSSxDQUFDLEVBQUUsUUFBUTtBQUNiLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFlLE9BQU8sT0FBVSxDQUFDO0FBRWxFLFlBQU0sUUFBUSxTQUE0QjtBQUcxQyxZQUFNLE1BQU0sUUFBTTtBQUFBLE1BQUUsQ0FBQztBQUNyQixRQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFDekIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE9BQU8sR0FBYTtBQUNsQixZQUFNLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxPQUFVO0FBQ3RELFVBQUksRUFBRSxRQUFRLEdBQUc7QUFDZixZQUFJO0FBQUUsZUFBSztBQUFBLFFBQUUsU0FBUyxJQUFJO0FBQUEsUUFBRTtBQUM1QixlQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ2pCLFlBQUUsUUFBUSxFQUFFLElBQUksRUFBRyxRQUFRLEtBQUs7QUFDbEMsVUFBRSxNQUFNLElBQUksRUFBRSxRQUFRLElBQUk7QUFBQSxNQUM1QjtBQUNBLGFBQU8sUUFBUSxRQUFRLEtBQUs7QUFBQSxJQUM5QjtBQUFBLElBRUEsU0FBUyxNQUFhO0FBQ3BCLFlBQU0sUUFBUSxFQUFFLE1BQU0sTUFBZSxPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQ3BELFVBQUksRUFBRSxRQUFRLEdBQUc7QUFDZixZQUFJO0FBQUUsZUFBSztBQUFBLFFBQUUsU0FBUyxJQUFJO0FBQUEsUUFBRTtBQUM1QixlQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ2pCLFlBQUUsUUFBUSxFQUFFLElBQUksRUFBRyxPQUFPLE1BQU0sS0FBSztBQUN2QyxVQUFFLE1BQU0sSUFBSSxFQUFFLFFBQVEsSUFBSTtBQUFBLE1BQzVCO0FBQ0EsYUFBTyxRQUFRLFFBQVEsS0FBSztBQUFBLElBQzlCO0FBQUEsSUFFQSxJQUFJLFNBQVM7QUFDWCxVQUFJLENBQUMsRUFBRSxNQUFNLEVBQUcsUUFBTztBQUN2QixhQUFPLEVBQUUsTUFBTSxFQUFFO0FBQUEsSUFDbkI7QUFBQSxJQUVBLEtBQUssT0FBVTtBQUNiLFVBQUksQ0FBQyxFQUFFLFFBQVE7QUFDYixlQUFPO0FBRVQsVUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRO0FBQ3RCLFVBQUUsUUFBUSxFQUFFLElBQUksRUFBRyxRQUFRLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLE1BQ25ELE9BQU87QUFDTCxZQUFJLENBQUMsRUFBRSxNQUFNLEdBQUc7QUFDZCxtQkFBUSxJQUFJLGlEQUFpRDtBQUFBLFFBQy9ELE9BQU87QUFDTCxZQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLFFBQ3ZDO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLENBQUM7QUFDMUI7QUFFQSxJQUFNLFlBQVksT0FBTyxVQUFVO0FBQ25DLFNBQVMsd0NBQTJDLE9BQU8sTUFBTTtBQUFFLEdBQUc7QUFDcEUsUUFBTSxJQUFJLGdDQUFtQyxJQUFJO0FBQ2pELElBQUUsU0FBUyxJQUFJLG9CQUFJLElBQU87QUFFMUIsSUFBRSxPQUFPLFNBQVUsT0FBVTtBQUMzQixRQUFJLENBQUMsRUFBRSxRQUFRO0FBQ2IsYUFBTztBQUdULFFBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxLQUFLO0FBQ3hCLGFBQU87QUFFVCxRQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVE7QUFDdEIsUUFBRSxTQUFTLEVBQUUsSUFBSSxLQUFLO0FBQ3RCLFlBQU0sSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJO0FBQzFCLFFBQUUsUUFBUSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQzFDLFFBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxJQUNsQyxPQUFPO0FBQ0wsVUFBSSxDQUFDLEVBQUUsTUFBTSxHQUFHO0FBQ2QsaUJBQVEsSUFBSSxpREFBaUQ7QUFBQSxNQUMvRCxXQUFXLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxPQUFLLEVBQUUsVUFBVSxLQUFLLEdBQUc7QUFDbEQsVUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFNBQU87QUFDVDtBQUdPLElBQU0sMEJBQWdGO0FBQ3RGLElBQU0sa0NBQXdGO0FBZ0JyRyxJQUFNLHdCQUF3QixPQUFPLHVCQUF1QjtBQUNyRCxTQUFTLHVCQUEyRyxLQUFRLE1BQVMsR0FBK0M7QUFJekwsTUFBSSxlQUFlLE1BQU07QUFDdkIsbUJBQWUsTUFBTTtBQUNyQixVQUFNLEtBQUssZ0NBQW1DO0FBQzlDLFVBQU0sS0FBSyxHQUFHLE1BQU07QUFDcEIsVUFBTSxJQUFJLEdBQUcsT0FBTyxhQUFhLEVBQUU7QUFDbkMsV0FBTyxPQUFPLGFBQWEsSUFBSSxHQUFHLE9BQU8sYUFBYTtBQUN0RCxXQUFPLEdBQUc7QUFDVixjQUFVLFFBQVE7QUFBQTtBQUFBLE1BQ2hCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBbUI7QUFBQSxLQUFDO0FBQ3BDLFFBQUksRUFBRSx5QkFBeUI7QUFDN0IsbUJBQWEsR0FBRyxNQUFNO0FBQ3hCLFdBQU87QUFBQSxFQUNUO0FBR0EsV0FBUyxnQkFBb0QsUUFBVztBQUN0RSxXQUFPO0FBQUEsTUFDTCxDQUFDLE1BQU0sR0FBRyxZQUE0QixNQUFhO0FBQ2pELHFCQUFhO0FBRWIsZUFBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sSUFBSTtBQUFBLE1BQ25DO0FBQUEsSUFDRixFQUFFLE1BQU07QUFBQSxFQUNWO0FBRUEsUUFBTSxTQUFTLEVBQUUsQ0FBQyxPQUFPLGFBQWEsR0FBRyxhQUFhO0FBQ3RELFlBQVUsUUFBUSxDQUFDO0FBQUE7QUFBQSxJQUNqQixPQUFPLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQztBQUFBLEdBQUM7QUFDaEMsTUFBSSxPQUFPLE1BQU0sWUFBWSxLQUFLLGVBQWUsS0FBSyxFQUFFLFdBQVcsTUFBTSxXQUFXO0FBQ2xGLFdBQU8sV0FBVyxJQUFJLEVBQUUsV0FBVztBQUFBLEVBQ3JDO0FBR0EsTUFBSSxPQUEyQyxDQUFDQSxPQUFTO0FBQ3ZELGlCQUFhO0FBQ2IsV0FBTyxLQUFLQSxFQUFDO0FBQUEsRUFDZjtBQUVBLE1BQUksSUFBSSxJQUFJLEdBQUcsTUFBTTtBQUNyQixNQUFJLFFBQXNDO0FBRTFDLFNBQU8sZUFBZSxLQUFLLE1BQU07QUFBQSxJQUMvQixNQUFTO0FBQUUsYUFBTztBQUFBLElBQUU7QUFBQSxJQUNwQixJQUFJQSxJQUE4QjtBQUNoQyxVQUFJQSxPQUFNLEdBQUc7QUFDWCxZQUFJLGdCQUFnQkEsRUFBQyxHQUFHO0FBWXRCLGNBQUksVUFBVUE7QUFDWjtBQUVGLGtCQUFRQTtBQUNSLGNBQUksUUFBUSxRQUFRLElBQUksTUFBTSxJQUFJO0FBQ2xDLGNBQUk7QUFDRixxQkFBUSxLQUFLLElBQUksTUFBTSxhQUFhLEtBQUssU0FBUyxDQUFDLDhFQUE4RSxDQUFDO0FBQ3BJLGtCQUFRLEtBQUtBLElBQXVCLE9BQUs7QUFDdkMsZ0JBQUlBLE9BQU0sT0FBTztBQUVmLG9CQUFNLElBQUksTUFBTSxtQkFBbUIsS0FBSyxTQUFTLENBQUMsMkNBQTJDLEVBQUUsT0FBTyxNQUFNLENBQUM7QUFBQSxZQUMvRztBQUNBLGlCQUFLLEdBQUcsUUFBUSxDQUFNO0FBQUEsVUFDeEIsQ0FBQyxFQUFFLE1BQU0sUUFBTSxTQUFRLEtBQUssRUFBRSxDQUFDLEVBQzVCLFFBQVEsTUFBT0EsT0FBTSxVQUFXLFFBQVEsT0FBVTtBQUdyRDtBQUFBLFFBQ0YsT0FBTztBQUNMLGNBQUksU0FBUyxPQUFPO0FBQ2xCLHFCQUFRLElBQUksYUFBYSxLQUFLLFNBQVMsQ0FBQywwRUFBMEU7QUFBQSxVQUNwSDtBQUNBLGNBQUksSUFBSUEsSUFBRyxNQUFNO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQ0EsV0FBS0EsSUFBRyxRQUFRLENBQU07QUFBQSxJQUN4QjtBQUFBLElBQ0EsWUFBWTtBQUFBLEVBQ2QsQ0FBQztBQUNELFNBQU87QUFFUCxXQUFTLElBQU9DLElBQU0sS0FBdUQ7QUFDM0UsUUFBSUEsT0FBTSxRQUFRQSxPQUFNLFFBQVc7QUFDakMsYUFBTyxhQUFhLE9BQU8sT0FBTyxNQUFNO0FBQUEsUUFDdEMsU0FBUyxFQUFFLFFBQVE7QUFBRSxpQkFBT0E7QUFBQSxRQUFFLEdBQUcsVUFBVSxNQUFNLGNBQWMsS0FBSztBQUFBLFFBQ3BFLFFBQVEsRUFBRSxRQUFRO0FBQUUsaUJBQU9BO0FBQUEsUUFBRSxHQUFHLFVBQVUsTUFBTSxjQUFjLEtBQUs7QUFBQSxNQUNyRSxDQUFDLEdBQUcsR0FBRztBQUFBLElBQ1Q7QUFDQSxZQUFRLE9BQU9BLElBQUc7QUFBQSxNQUNoQixLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBRUgsZUFBTyxhQUFhLE9BQU9BLEVBQUMsR0FBRyxPQUFPLE9BQU8sS0FBSztBQUFBLFVBQ2hELFNBQVM7QUFBRSxtQkFBT0EsR0FBRSxRQUFRO0FBQUEsVUFBRTtBQUFBLFFBQ2hDLENBQUMsQ0FBQztBQUFBLE1BQ0osS0FBSztBQUFBLE1BQ0wsS0FBSztBQUtILGVBQU8sVUFBVUEsSUFBRyxHQUFHO0FBQUEsSUFFM0I7QUFDQSxVQUFNLElBQUksVUFBVSw0Q0FBNEMsT0FBT0EsS0FBSSxHQUFHO0FBQUEsRUFDaEY7QUFJQSxXQUFTLHVCQUF1QixHQUFvQztBQUNsRSxXQUFPLGFBQWEsQ0FBQyxLQUFLLHlCQUF5QjtBQUFBLEVBQ3JEO0FBQ0EsV0FBUyxZQUFZLEdBQVEsTUFBYztBQUN6QyxVQUFNLFNBQVMsS0FBSyxNQUFNLEdBQUcsRUFBRSxNQUFNLENBQUM7QUFDdEMsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFdBQVksSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sUUFBWSxJQUFJO0FBQy9FLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxVQUFVQSxJQUFNLEtBQTJDO0FBQ2xFLFFBQUk7QUFDSixRQUFJO0FBQ0osV0FBTyxJQUFJLE1BQU1BLElBQWEsUUFBUSxDQUFDO0FBRXZDLGFBQVMsUUFBUSxPQUFPLElBQTBCO0FBQ2hELGFBQU87QUFBQTtBQUFBLFFBRUwsSUFBSSxRQUFRLEtBQUs7QUFDZixpQkFBTyxRQUFRLHlCQUF5QixRQUFRLE9BQU8sZUFBZSxPQUFPLFVBQVUsT0FBTztBQUFBLFFBQ2hHO0FBQUE7QUFBQSxRQUVBLElBQUksUUFBUSxLQUFLLE9BQU8sVUFBVTtBQUNoQyxjQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsR0FBRztBQUMzQixrQkFBTSxJQUFJLE1BQU0sY0FBYyxLQUFLLFNBQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUM7QUFBQSxVQUN6RztBQUNBLGNBQUksUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRLE1BQU0sT0FBTztBQUNoRCxpQkFBSyxFQUFFLENBQUMscUJBQXFCLEdBQUcsRUFBRSxHQUFBQSxJQUFHLEtBQUssRUFBRSxDQUFRO0FBQUEsVUFDdEQ7QUFDQSxpQkFBTyxRQUFRLElBQUksUUFBUSxLQUFLLE9BQU8sUUFBUTtBQUFBLFFBQ2pEO0FBQUEsUUFDQSxlQUFlLFFBQVEsS0FBSztBQUMxQixjQUFJLFFBQVEsZUFBZSxRQUFRLEdBQUcsR0FBRztBQUN2QyxpQkFBSyxFQUFFLENBQUMscUJBQXFCLEdBQUcsRUFBRSxHQUFBQSxJQUFHLEtBQUssRUFBRSxDQUFRO0FBQ3BELG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBO0FBQUEsUUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVO0FBRXpCLGNBQUksT0FBTyxPQUFPLEtBQUssR0FBRyxHQUFHO0FBQzNCLGdCQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2hCLDRDQUFnQixVQUFVLEtBQUssT0FBSyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDO0FBQzlGLHFCQUFPLFlBQVksR0FBdUI7QUFBQSxZQUM1QyxPQUFPO0FBQ0wsc0NBQWEsVUFBVSxLQUFLLE9BQUssdUJBQXVCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixJQUFJLEVBQUUsR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBRTVHLGtCQUFJLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBRyxNQUFNO0FBQ3JDLHNCQUFNRCxLQUFJLFlBQVksRUFBRSxHQUFHLElBQUk7QUFDL0IsdUJBQU8sTUFBTUEsTUFBSyxFQUFFLFNBQVMsUUFBUSxFQUFFLEtBQUssV0FBVyxJQUFJLElBQUlBLEtBQUk7QUFBQSxjQUNyRSxHQUFHLFFBQVEsWUFBWUMsSUFBRyxJQUFJLENBQUM7QUFDL0IscUJBQU8sR0FBRyxHQUFzQjtBQUFBLFlBQ2xDO0FBQUEsVUFDRjtBQUdBLGNBQUksUUFBUSxhQUFjLFFBQVEsWUFBWSxFQUFFLFlBQVk7QUFDMUQsbUJBQU8sTUFBTSxZQUFZQSxJQUFHLElBQUk7QUFDbEMsY0FBSSxRQUFRLE9BQU8sYUFBYTtBQUU5QixtQkFBTyxTQUFVLE1BQXdDO0FBQ3ZELGtCQUFJLFFBQVEsSUFBSSxRQUFRLEdBQUc7QUFDekIsdUJBQU8sUUFBUSxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFDM0Qsa0JBQUksU0FBUyxTQUFVLFFBQU8sT0FBTyxTQUFTO0FBQzlDLGtCQUFJLFNBQVMsU0FBVSxRQUFPLE9BQU8sTUFBTTtBQUMzQyxxQkFBTyxPQUFPLFFBQVE7QUFBQSxZQUN4QjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGlCQUFLLEVBQUUsT0FBTyxXQUFXLE9BQU8sT0FBTyxRQUFRLEdBQUcsTUFBTSxFQUFFLGVBQWUsVUFBVSxPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQ3JILG9CQUFNLFFBQVEsUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRO0FBQy9DLHFCQUFRLE9BQU8sVUFBVSxjQUFlLFlBQVksS0FBSyxJQUNyRCxRQUNBLElBQUksTUFBTSxPQUFPLEtBQUssR0FBRyxRQUFRLE9BQU8sTUFBTSxHQUFHLENBQUM7QUFBQSxZQUN4RDtBQUFBLFVBQ0Y7QUFFQSxpQkFBTyxRQUFRLElBQUksUUFBUSxLQUFLLFFBQVE7QUFBQSxRQUMxQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBYU8sSUFBTSxRQUFRLElBQWdILE9BQVU7QUFDN0ksUUFBTSxLQUFLLG9CQUFJLElBQThDO0FBQzdELFFBQU0sV0FBVyxvQkFBSSxJQUFrRTtBQUV2RixNQUFJLE9BQU8sTUFBTTtBQUNmLFdBQU8sTUFBTTtBQUFBLElBQUU7QUFDZixhQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxLQUFLO0FBQ2xDLFlBQU0sSUFBSSxHQUFHLENBQUM7QUFDZCxZQUFNLE9BQU8sT0FBTyxpQkFBaUIsSUFBSSxFQUFFLE9BQU8sYUFBYSxFQUFFLElBQUk7QUFDckUsU0FBRyxJQUFJLEdBQUcsSUFBSTtBQUNkLGVBQVMsSUFBSSxHQUFHLEtBQUssS0FBSyxFQUFFLEtBQUssYUFBVyxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUFBLElBQ2xFO0FBQUEsRUFDRjtBQUVBLFFBQU0sVUFBZ0MsSUFBSSxNQUFNLEdBQUcsTUFBTTtBQUV6RCxRQUFNLFNBQTJDO0FBQUEsSUFDL0MsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUFFLGFBQU87QUFBQSxJQUFPO0FBQUEsSUFDekMsT0FBTztBQUNMLFdBQUs7QUFDTCxhQUFPLFNBQVMsT0FDWixRQUFRLEtBQUssU0FBUyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLE9BQU8sTUFBTTtBQUMxRCxZQUFJLE9BQU8sTUFBTTtBQUNmLG1CQUFTLE9BQU8sR0FBRztBQUNuQixhQUFHLE9BQU8sR0FBRztBQUNiLGtCQUFRLEdBQUcsSUFBSSxPQUFPO0FBQ3RCLGlCQUFPLE9BQU8sS0FBSztBQUFBLFFBQ3JCLE9BQU87QUFDTCxtQkFBUztBQUFBLFlBQUk7QUFBQSxZQUNYLEdBQUcsSUFBSSxHQUFHLElBQ04sR0FBRyxJQUFJLEdBQUcsRUFBRyxLQUFLLEVBQUUsS0FBSyxDQUFBQyxhQUFXLEVBQUUsS0FBSyxRQUFBQSxRQUFPLEVBQUUsRUFBRSxNQUFNLFNBQU8sRUFBRSxLQUFLLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLEVBQUUsRUFBRSxJQUM5RyxRQUFRLFFBQVEsRUFBRSxLQUFLLFFBQVEsRUFBRSxNQUFNLE1BQU0sT0FBTyxPQUFVLEVBQUUsQ0FBQztBQUFBLFVBQUM7QUFDeEUsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRixDQUFDLEVBQUUsTUFBTSxRQUFNO0FBRVgsZUFBTyxPQUFPLE1BQU8sRUFBRTtBQUFBLE1BQzNCLENBQUMsSUFDQyxRQUFRLFFBQVEsRUFBRSxNQUFNLE1BQWUsT0FBTyxRQUFRLENBQUM7QUFBQSxJQUM3RDtBQUFBLElBQ0EsTUFBTSxPQUFPLEdBQUc7QUFDZCxpQkFBVyxPQUFPLEdBQUcsS0FBSyxHQUFHO0FBQzNCLFlBQUksU0FBUyxJQUFJLEdBQUcsR0FBRztBQUNyQixtQkFBUyxPQUFPLEdBQUc7QUFDbkIsa0JBQVEsR0FBRyxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsR0FBRyxTQUFTLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxPQUFLLEVBQUUsT0FBTyxRQUFNLEVBQUU7QUFBQSxRQUNsRztBQUFBLE1BQ0Y7QUFDQSxhQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sUUFBUTtBQUFBLElBQ3RDO0FBQUEsSUFDQSxNQUFNLE1BQU0sSUFBUztBQUNuQixpQkFBVyxPQUFPLEdBQUcsS0FBSyxHQUFHO0FBQzNCLFlBQUksU0FBUyxJQUFJLEdBQUcsR0FBRztBQUNyQixtQkFBUyxPQUFPLEdBQUc7QUFDbkIsa0JBQVEsR0FBRyxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsR0FBRyxRQUFRLEVBQUUsRUFBRSxLQUFLLE9BQUssRUFBRSxPQUFPLENBQUFDLFFBQU1BLEdBQUU7QUFBQSxRQUMzRTtBQUFBLE1BQ0Y7QUFFQSxhQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sUUFBUTtBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNBLFNBQU8sZ0JBQWdCLE1BQXFEO0FBQzlFO0FBaUJPLElBQU0sVUFBVSxDQUF1RCxLQUFRLE9BQU8sQ0FBQyxNQUF3QztBQUNwSSxRQUFNLGNBQXVDLENBQUM7QUFDOUMsUUFBTSxLQUFLLG9CQUFJLElBQWtEO0FBQ2pFLE1BQUk7QUFDSixRQUFNLEtBQUs7QUFBQSxJQUNULENBQUMsT0FBTyxhQUFhLElBQUk7QUFBRSxhQUFPO0FBQUEsSUFBRztBQUFBLElBQ3JDLE9BQXlEO0FBQ3ZELFVBQUksT0FBTyxRQUFXO0FBQ3BCLGFBQUssSUFBSSxJQUFJLE9BQU8sUUFBUSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLE1BQU07QUFDakQsZ0JBQU0sU0FBUyxJQUFJLE9BQU8sYUFBYSxFQUFHO0FBQzFDLGFBQUcsSUFBSSxHQUFHLE1BQU07QUFDaEIsaUJBQU8sQ0FBQyxHQUFHLE9BQU8sS0FBSyxFQUFFLEtBQUssU0FBTyxFQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUFBLFFBQ3RELENBQUMsQ0FBQztBQUFBLE1BQ0o7QUFFQSxhQUFRLFNBQVMsT0FBeUQ7QUFDeEUsZUFBTyxRQUFRLEtBQUssR0FBRyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTTtBQUNuRCxjQUFJLEdBQUcsTUFBTTtBQUNYLGVBQUcsT0FBTyxDQUFDO0FBQ1gsZUFBRyxPQUFPLENBQUM7QUFDWCxnQkFBSSxDQUFDLEdBQUc7QUFDTixxQkFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLE9BQVU7QUFDeEMsbUJBQU8sS0FBSztBQUFBLFVBQ2QsT0FBTztBQUNMLHdCQUFZLENBQTZCLElBQUksR0FBRztBQUNoRCxlQUFHLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFHLEtBQUssRUFBRSxLQUFLLENBQUFDLFNBQU8sRUFBRSxHQUFHLElBQUFBLElBQUcsRUFBRSxDQUFDO0FBQUEsVUFDckQ7QUFDQSxjQUFJLEtBQUssZUFBZTtBQUN0QixnQkFBSSxPQUFPLEtBQUssV0FBVyxFQUFFLFNBQVMsT0FBTyxLQUFLLEdBQUcsRUFBRTtBQUNyRCxxQkFBTyxLQUFLO0FBQUEsVUFDaEI7QUFDQSxpQkFBTyxFQUFFLE1BQU0sT0FBTyxPQUFPLFlBQVk7QUFBQSxRQUMzQyxDQUFDO0FBQUEsTUFDSCxFQUFHO0FBQUEsSUFDTDtBQUFBLElBQ0EsT0FBTyxHQUFTO0FBQ2QsaUJBQVcsTUFBTSxHQUFHLE9BQU8sR0FBRztBQUMxQixXQUFHLFNBQVMsQ0FBQztBQUFBLE1BQ2pCO0FBQUM7QUFDRCxhQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQztBQUFBLElBQ2pEO0FBQUEsSUFDQSxNQUFNLElBQVM7QUFDYixpQkFBVyxNQUFNLEdBQUcsT0FBTztBQUN6QixXQUFHLFFBQVEsRUFBRTtBQUNmLGFBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQ0EsU0FBTyxnQkFBZ0IsRUFBRTtBQUMzQjtBQUdBLFNBQVMsZ0JBQW1CLEdBQW9DO0FBQzlELFNBQU8sZ0JBQWdCLENBQUMsS0FDbkIsVUFBVSxNQUFNLE9BQU0sS0FBSyxLQUFPLEVBQVUsQ0FBQyxNQUFNLFlBQVksQ0FBQyxDQUFDO0FBQ3hFO0FBR08sU0FBUyxnQkFBOEMsSUFBK0U7QUFDM0ksTUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUc7QUFDeEIsaUJBQWEsSUFBSSxXQUFXO0FBQUEsRUFDOUI7QUFDQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLGlCQUE0RSxHQUFNO0FBQ2hHLFNBQU8sWUFBYSxNQUFvQztBQUN0RCxVQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFDcEIsV0FBTyxnQkFBZ0IsRUFBRTtBQUFBLEVBQzNCO0FBQ0Y7QUFZQSxlQUFlLFFBQXdELEdBQTRFO0FBQ2pKLE1BQUksT0FBNkM7QUFDakQsbUJBQWlCLEtBQUssTUFBK0M7QUFDbkUsV0FBTyxJQUFJLENBQUM7QUFBQSxFQUNkO0FBQ0EsUUFBTTtBQUNSO0FBTU8sSUFBTSxTQUFTLE9BQU8sUUFBUTtBQUlyQyxTQUFTLFlBQWtCLEdBQXFCLE1BQW1CLFFBQTJDO0FBQzVHLE1BQUksY0FBYyxDQUFDO0FBQ2pCLFdBQU8sRUFBRSxLQUFLLE1BQU0sTUFBTTtBQUM1QixNQUFJO0FBQ0YsV0FBTyxLQUFLLENBQUM7QUFBQSxFQUNmLFNBQVMsSUFBSTtBQUNYLFdBQU8sT0FBTyxFQUFFO0FBQUEsRUFDbEI7QUFDRjtBQUVPLFNBQVMsVUFBd0MsUUFDdEQsSUFDQSxlQUFrQyxRQUNsQyxPQUEwQixRQUNIO0FBQ3ZCLE1BQUk7QUFDSixXQUFTLEtBQUssR0FBa0c7QUFFOUcsU0FBSyxNQUFNO0FBQ1gsV0FBTztBQUNQLFdBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLE1BQU07QUFBQSxFQUN2QztBQUNBLE1BQUksTUFBZ0M7QUFBQSxJQUNsQyxDQUFDLE9BQU8sYUFBYSxJQUFJO0FBQ3ZCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxRQUFRLE1BQXdCO0FBQzlCLFVBQUksaUJBQWlCLFFBQVE7QUFDM0IsY0FBTSxPQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sT0FBTyxPQUFPLGFBQWEsQ0FBQztBQUNqRSx1QkFBZTtBQUNmLGVBQU87QUFBQSxNQUNUO0FBRUEsYUFBTyxJQUFJLFFBQTJCLFNBQVMsS0FBSyxTQUFTLFFBQVE7QUFDbkUsWUFBSSxDQUFDO0FBQ0gsZUFBSyxPQUFPLE9BQU8sYUFBYSxFQUFHO0FBQ3JDLFdBQUcsS0FBSyxHQUFHLElBQUksRUFBRTtBQUFBLFVBQ2YsT0FBSyxFQUFFLFFBQ0YsT0FBTyxRQUFRLFFBQVEsQ0FBQyxLQUN6QjtBQUFBLFlBQVksR0FBRyxFQUFFLE9BQU8sSUFBSTtBQUFBLFlBQzVCLE9BQUssTUFBTSxTQUNQLEtBQUssU0FBUyxNQUFNLElBQ3BCLFFBQVEsRUFBRSxNQUFNLE9BQU8sT0FBTyxPQUFPLEVBQUUsQ0FBQztBQUFBLFlBQzVDLFFBQU07QUFDSixxQkFBTztBQUVQLG9CQUFNLGlCQUFpQixJQUFJLFFBQVEsRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFO0FBRXpELGtCQUFJLGNBQWMsY0FBYyxFQUFHLGdCQUFlLEtBQUssUUFBTyxNQUFNO0FBQUEsa0JBQy9ELFFBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxZQUN2QztBQUFBLFVBQ0Y7QUFBQSxVQUNGLFFBQU07QUFFSixtQkFBTztBQUNQLG1CQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQUEsVUFDbEM7QUFBQSxRQUNGLEVBQUUsTUFBTSxRQUFNO0FBRVosaUJBQU87QUFDUCxnQkFBTSxpQkFBaUIsR0FBRyxRQUFRLEVBQUUsS0FBSyxHQUFHLFNBQVMsRUFBRTtBQUV2RCxjQUFJLGNBQWMsY0FBYyxFQUFHLGdCQUFlLEtBQUssUUFBUSxNQUFNO0FBQUEsY0FDaEUsUUFBTyxFQUFFLE1BQU0sTUFBTSxPQUFPLGVBQWUsQ0FBQztBQUFBLFFBQ25ELENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNIO0FBQUEsSUFFQSxNQUFNLElBQVM7QUFFYixhQUFPLFFBQVEsUUFBUSxJQUFJLFFBQVEsRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLE1BQU0sSUFBSTtBQUFBLElBQzdFO0FBQUEsSUFFQSxPQUFPLEdBQVM7QUFFZCxhQUFPLFFBQVEsUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLElBQUk7QUFBQSxJQUN6RDtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixHQUFHO0FBQzVCO0FBRUEsU0FBUyxJQUEyQyxRQUFrRTtBQUNwSCxTQUFPLFVBQVUsTUFBTSxNQUFNO0FBQy9CO0FBRUEsU0FBUyxPQUEyQyxJQUErRztBQUNqSyxTQUFPLFVBQVUsTUFBTSxPQUFNLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLE1BQU87QUFDOUQ7QUFFQSxTQUFTLE9BQTJDLElBQWlKO0FBQ25NLFNBQU8sS0FDSCxVQUFVLE1BQU0sT0FBTyxHQUFHLE1BQU8sTUFBTSxVQUFVLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSyxJQUFJLE1BQU0sSUFDN0UsVUFBVSxNQUFNLENBQUMsR0FBRyxNQUFNLE1BQU0sSUFBSSxTQUFTLENBQUM7QUFDcEQ7QUFFQSxTQUFTLFVBQTBFLFdBQThEO0FBQy9JLFNBQU8sVUFBVSxNQUFNLE9BQUssR0FBRyxTQUFTO0FBQzFDO0FBRUEsU0FBUyxRQUE0QyxJQUEyRztBQUM5SixTQUFPLFVBQVUsTUFBTSxPQUFLLElBQUksUUFBZ0MsYUFBVztBQUFFLE9BQUcsTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFHLFdBQU87QUFBQSxFQUFFLENBQUMsQ0FBQztBQUNoSDtBQUVBLFNBQVMsUUFBc0Y7QUFFN0YsUUFBTSxTQUFTO0FBQ2YsTUFBSSxZQUFZO0FBQ2hCLE1BQUk7QUFDSixNQUFJLEtBQW1EO0FBR3ZELFdBQVMsS0FBSyxJQUE2QjtBQUN6QyxRQUFJLEdBQUksVUFBUyxRQUFRLEVBQUU7QUFDM0IsUUFBSSxJQUFJLE1BQU07QUFFWixnQkFBVTtBQUFBLElBQ1osT0FBTztBQUNMLGdCQUFVLFNBQTRCO0FBQ3RDLFVBQUksSUFBSTtBQUNOLFdBQUcsS0FBSyxFQUNMLEtBQUssSUFBSSxFQUNULE1BQU0sV0FBUztBQUNkLG1CQUFTLE9BQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFFNUMsb0JBQVU7QUFBQSxRQUNaLENBQUM7QUFBQSxNQUNILE9BQU87QUFDTCxnQkFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sT0FBVSxDQUFDO0FBQUEsTUFDbEQ7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUVBLFdBQVMsS0FBSyxHQUFtRztBQUMvRyxVQUFNLFNBQVMsRUFBRSxNQUFNLE1BQU0sT0FBTyxHQUFHLE1BQU07QUFFN0MsU0FBSyxNQUFNLFVBQVU7QUFDckIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLE1BQWdDO0FBQUEsSUFDbEMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUN2QixtQkFBYTtBQUNiLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxPQUFPO0FBQ0wsVUFBSSxDQUFDLElBQUk7QUFDUCxhQUFLLE9BQU8sT0FBTyxhQUFhLEVBQUc7QUFDbkMsYUFBSztBQUFBLE1BQ1A7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsTUFBTSxJQUFTO0FBRWIsVUFBSSxZQUFZO0FBQ2QsY0FBTSxJQUFJLE1BQU0sOEJBQThCO0FBQ2hELG1CQUFhO0FBQ2IsVUFBSTtBQUNGLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2xELGFBQU8sUUFBUSxRQUFRLElBQUksUUFBUSxFQUFFLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDN0U7QUFBQSxJQUVBLE9BQU8sR0FBUztBQUVkLFVBQUksWUFBWTtBQUNkLGNBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUNoRCxtQkFBYTtBQUNiLFVBQUk7QUFDRixlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEVBQUUsQ0FBQztBQUNqRCxhQUFPLFFBQVEsUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLElBQUk7QUFBQSxJQUN6RDtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGdCQUFnQixHQUFHO0FBQzVCO0FBRU8sU0FBUywrQkFBK0I7QUFDN0MsTUFBSSxJQUFLLG1CQUFtQjtBQUFBLEVBQUUsRUFBRztBQUNqQyxTQUFPLEdBQUc7QUFDUixVQUFNLE9BQU8sT0FBTyx5QkFBeUIsR0FBRyxPQUFPLGFBQWE7QUFDcEUsUUFBSSxNQUFNO0FBQ1Isc0JBQWdCLENBQUM7QUFDakI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxPQUFPLGVBQWUsQ0FBQztBQUFBLEVBQzdCO0FBQ0EsTUFBSSxDQUFDLEdBQUc7QUFDTixhQUFRLEtBQUssNERBQTREO0FBQUEsRUFDM0U7QUFDRjs7O0FDcHlCTyxJQUFNLFFBQVEsT0FBTyxPQUFPLENBQUMsQ0FBQztBQXFEckMsSUFBTSxvQkFBb0Isb0JBQUksUUFBc0g7QUFFcEosU0FBUyxnQkFBd0csSUFBNEM7QUFDM0osTUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUk7QUFDN0Isc0JBQWtCLElBQUksTUFBTSxvQkFBSSxJQUFJLENBQUM7QUFFdkMsUUFBTSxlQUFlLGtCQUFrQixJQUFJLElBQUksRUFBRyxJQUFJLEdBQUcsSUFBeUM7QUFDbEcsTUFBSSxjQUFjO0FBQ2hCLGVBQVcsS0FBSyxjQUFjO0FBQzVCLFVBQUk7QUFDRixjQUFNLEVBQUUsTUFBTSxXQUFXLGNBQWMsVUFBVSxnQkFBZ0IsSUFBSTtBQUNyRSxjQUFNLFlBQVksYUFBYSxNQUFNO0FBQ3JDLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxhQUFhO0FBQ3hDLGdCQUFNLE1BQU0saUJBQWlCLFdBQVcsS0FBSyxPQUFPLFlBQVksTUFBTTtBQUN0RSx1QkFBYSxPQUFPLENBQUM7QUFDckIsb0JBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQzFCLE9BQU87QUFDTCxjQUFJLEdBQUcsa0JBQWtCLE1BQU07QUFDN0IsZ0JBQUksVUFBVTtBQUNaLG9CQUFNLFFBQVEsVUFBVSxpQkFBaUIsUUFBUTtBQUNqRCx5QkFBVyxLQUFLLE9BQU87QUFDckIscUJBQUssa0JBQWtCLEVBQUUsU0FBUyxHQUFHLE1BQU0sSUFBSSxHQUFHLFdBQVcsTUFBTSxVQUFVLFNBQVMsQ0FBQztBQUNyRix1QkFBSyxFQUFFO0FBQUEsY0FDWDtBQUFBLFlBQ0YsT0FBTztBQUNMLGtCQUFJLGtCQUFrQixVQUFVLFNBQVMsR0FBRyxNQUFNLElBQUksR0FBRyxXQUFXO0FBQ2xFLHFCQUFLLEVBQUU7QUFBQSxZQUNYO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFNBQVMsSUFBSTtBQUNYLGlCQUFRLEtBQUssbUJBQW1CLEVBQUU7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTLGNBQWMsR0FBK0I7QUFDcEQsU0FBTyxRQUFRLE1BQU0sRUFBRSxXQUFXLEdBQUcsS0FBSyxFQUFFLFdBQVcsR0FBRyxLQUFNLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxTQUFTLEdBQUcsRUFBRztBQUN4RztBQUVBLFNBQVMsVUFBbUMsS0FBZ0g7QUFDMUosUUFBTSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLEdBQUc7QUFDakQsU0FBTyxFQUFFLGlCQUFpQixVQUFVLGtCQUFrQixNQUFNLElBQUksTUFBTSxHQUFFLEVBQUUsRUFBRTtBQUM5RTtBQUVBLFNBQVMsa0JBQTRDLE1BQXFIO0FBQ3hLLFFBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QixNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN4QixhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFFLFFBQVE7QUFDdEMsV0FBTyxDQUFDLEVBQUUsaUJBQWlCLE1BQU0sVUFBVSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQXNDO0FBQUEsRUFDbEc7QUFDQSxNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFFBQUksY0FBYyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxNQUFNLENBQUMsQ0FBQztBQUN0RCxhQUFPLENBQUMsVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFzQztBQUFBLEVBQzVFO0FBQ0EsU0FBTztBQUNUO0FBRUEsU0FBUyxRQUFRLFNBQXVCO0FBQ3RDLFFBQU0sSUFBSSxNQUFNLE9BQU87QUFDekI7QUFFQSxTQUFTLFVBQW9DLFdBQW9CLE1BQXNDO0FBQ3JHLFFBQU0sQ0FBQyxFQUFFLGlCQUFpQixTQUFRLEdBQUcsU0FBUyxJQUFJLGtCQUFrQixJQUFJLEtBQUssUUFBUSwyQkFBeUIsSUFBSTtBQUVsSCxNQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxhQUFhO0FBQ2hELHNCQUFrQixJQUFJLFVBQVUsZUFBZSxvQkFBSSxJQUFJLENBQUM7QUFFMUQsTUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUyxHQUFHO0FBQ25FLGNBQVUsY0FBYyxpQkFBaUIsV0FBVyxpQkFBaUI7QUFBQSxNQUNuRSxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQ0Qsc0JBQWtCLElBQUksVUFBVSxhQUFhLEVBQUcsSUFBSSxXQUFXLG9CQUFJLElBQUksQ0FBQztBQUFBLEVBQzFFO0FBRUEsUUFBTSxlQUFlLGtCQUFrQixJQUFJLFVBQVUsYUFBYSxFQUFHLElBQUksU0FBUztBQUNsRixRQUFNLFFBQVEsd0JBQXdGLE1BQU0sYUFBYyxPQUFPLE9BQU8sQ0FBQztBQUN6SSxRQUFNLFVBQStEO0FBQUEsSUFDbkUsTUFBTSxNQUFNO0FBQUEsSUFDWixVQUFVLElBQVc7QUFBRSxZQUFNLFNBQVMsRUFBRTtBQUFBLElBQUM7QUFBQSxJQUN6QyxjQUFjLElBQUksUUFBUSxTQUFTO0FBQUEsSUFDbkM7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVBLCtCQUE2QixXQUFXLFdBQVcsQ0FBQyxRQUFRLElBQUksTUFBUyxFQUN0RSxLQUFLLE9BQUssYUFBYyxJQUFJLE9BQU8sQ0FBQztBQUV2QyxTQUFPLE1BQU0sTUFBTTtBQUNyQjtBQUVBLGdCQUFnQixrQkFBK0M7QUFDN0QsU0FBTztBQUNUO0FBSUEsU0FBUyxXQUErQyxLQUE2QjtBQUNuRixXQUFTLHNCQUFzQixRQUF1QztBQUNwRSxXQUFPLElBQUksSUFBSSxNQUFNO0FBQUEsRUFDdkI7QUFFQSxTQUFPLE9BQU8sT0FBTyxnQkFBZ0IscUJBQW9ELEdBQUc7QUFBQSxJQUMxRixDQUFDLE9BQU8sYUFBYSxHQUFHLE1BQU0sSUFBSSxPQUFPLGFBQWEsRUFBRTtBQUFBLEVBQzFELENBQUM7QUFDSDtBQUVBLFNBQVMsb0JBQW9CLE1BQWdEO0FBQzNFLE1BQUksQ0FBQztBQUNILFVBQU0sSUFBSSxNQUFNLCtDQUErQyxLQUFLLFVBQVUsSUFBSSxDQUFDO0FBQ3JGLFNBQU8sT0FBTyxTQUFTLFlBQVksS0FBSyxDQUFDLE1BQU0sT0FBTyxRQUFRLGtCQUFrQixJQUFJLENBQUM7QUFDdkY7QUFFQSxnQkFBZ0IsS0FBUSxHQUFlO0FBQ3JDLFFBQU07QUFDUjtBQUVPLFNBQVMsS0FBK0IsY0FBdUIsU0FBMkI7QUFDL0YsTUFBSSxDQUFDLFdBQVcsUUFBUSxXQUFXLEdBQUc7QUFDcEMsV0FBTyxXQUFXLFVBQVUsV0FBVyxRQUFRLENBQUM7QUFBQSxFQUNsRDtBQUVBLFFBQU0sWUFBWSxRQUFRLE9BQU8sVUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxVQUFRLE9BQU8sU0FBUyxXQUM5RyxVQUFVLFdBQVcsSUFBSSxJQUN6QixnQkFBZ0IsVUFDZCxVQUFVLE1BQU0sUUFBUSxJQUN4QixjQUFjLElBQUksSUFDaEIsS0FBSyxJQUFJLElBQ1QsSUFBSTtBQUVaLE1BQUksUUFBUSxTQUFTLFFBQVEsR0FBRztBQUM5QixVQUFNLFFBQW1DO0FBQUEsTUFDdkMsQ0FBQyxPQUFPLGFBQWEsR0FBRyxNQUFNO0FBQUEsTUFDOUIsT0FBTztBQUNMLGNBQU0sT0FBTyxNQUFNLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLE9BQVUsQ0FBQztBQUNuRSxlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsTUFDbkQ7QUFBQSxJQUNGO0FBQ0EsY0FBVSxLQUFLLEtBQUs7QUFBQSxFQUN0QjtBQUVBLE1BQUksUUFBUSxTQUFTLFFBQVEsR0FBRztBQUM5QixVQUFNLGlCQUFpQixRQUFRLE9BQU8sbUJBQW1CLEVBQUUsSUFBSSxVQUFRLGtCQUFrQixJQUFJLElBQUksQ0FBQyxDQUFDO0FBRW5HLFVBQU0sWUFBWSxDQUFDLFFBQXlFLFFBQVEsT0FBTyxRQUFRLFlBQVksQ0FBQyxVQUFVLGNBQWMsR0FBRyxDQUFDO0FBRTVKLFVBQU0sVUFBVSxlQUFlLElBQUksT0FBSyxHQUFHLFFBQVEsRUFBRSxPQUFPLFNBQVM7QUFFckUsUUFBSSxTQUF5RDtBQUM3RCxVQUFNLEtBQWlDO0FBQUEsTUFDckMsQ0FBQyxPQUFPLGFBQWEsSUFBSTtBQUFFLGVBQU87QUFBQSxNQUFHO0FBQUEsTUFDckMsTUFBTSxJQUFTO0FBQ2IsWUFBSSxRQUFRLE1BQU8sUUFBTyxPQUFPLE1BQU0sRUFBRTtBQUN6QyxlQUFPLFFBQVEsUUFBUSxFQUFFLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ2xEO0FBQUEsTUFDQSxPQUFPLEdBQVM7QUFDZCxZQUFJLFFBQVEsT0FBUSxRQUFPLE9BQU8sT0FBTyxDQUFDO0FBQzFDLGVBQU8sUUFBUSxRQUFRLEVBQUUsTUFBTSxNQUFNLE9BQU8sRUFBRSxDQUFDO0FBQUEsTUFDakQ7QUFBQSxNQUNBLE9BQU87QUFDTCxZQUFJLE9BQVEsUUFBTyxPQUFPLEtBQUs7QUFFL0IsZUFBTyw2QkFBNkIsV0FBVyxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQ2pFLGdCQUFNQyxVQUFVLFVBQVUsU0FBUyxJQUNqQyxNQUFNLEdBQUcsU0FBUyxJQUNsQixVQUFVLFdBQVcsSUFDbkIsVUFBVSxDQUFDLElBQ1gsZ0JBQWdCO0FBSXBCLG1CQUFTQSxRQUFPLE9BQU8sYUFBYSxFQUFFO0FBRXRDLGlCQUFPLEVBQUUsTUFBTSxPQUFPLE9BQU8sTUFBTTtBQUFBLFFBQ3JDLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUNBLFdBQU8sV0FBVyxnQkFBZ0IsRUFBRSxDQUFDO0FBQUEsRUFDdkM7QUFFQSxRQUFNLFNBQVUsVUFBVSxTQUFTLElBQy9CLE1BQU0sR0FBRyxTQUFTLElBQ2xCLFVBQVUsV0FBVyxJQUNuQixVQUFVLENBQUMsSUFDVixnQkFBcUM7QUFFNUMsU0FBTyxXQUFXLGdCQUFnQixNQUFNLENBQUM7QUFDM0M7QUFFQSxTQUFTLDZCQUE2QixXQUFvQixXQUFzQjtBQUM5RSxXQUFTLG1CQUFrQztBQUN6QyxRQUFJLFVBQVU7QUFDWixhQUFPLFFBQVEsUUFBUTtBQUV6QixVQUFNLFVBQVUsSUFBSSxRQUFjLENBQUMsU0FBUyxXQUFXO0FBQ3JELGFBQU8sSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLGFBQWE7QUFDakQsWUFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLFlBQVksTUFBTSxHQUFHO0FBQzNDLGNBQUksVUFBVSxhQUFhO0FBQ3pCLHFCQUFTLFdBQVc7QUFDcEIsb0JBQVE7QUFBQSxVQUNWO0FBQUEsUUFDRjtBQUNBLFlBQUksUUFBUSxLQUFLLE9BQUssQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQUMsT0FBS0EsT0FBTSxhQUFhQSxHQUFFLFNBQVMsU0FBUyxDQUFDLENBQUMsR0FBRztBQUM5RixtQkFBUyxXQUFXO0FBQ3BCLGlCQUFPLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUFBLFFBQ3RDO0FBQUEsTUFDRixDQUFDLEVBQUUsUUFBUSxVQUFVLGNBQWMsTUFBTTtBQUFBLFFBQ3ZDLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxNQUNiLENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxRQUFJLE9BQU87QUFDVCxZQUFNLFFBQVEsSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLFVBQVUsNkJBQTZCLGNBQWMsR0FBSSxXQUFXO0FBQzdHLFlBQU0sWUFBWSxXQUFXLE1BQU07QUFDakMsaUJBQVEsS0FBSyxRQUFRLE9BQU8sVUFBVSxTQUFTO0FBQUEsTUFFakQsR0FBRyxXQUFXO0FBRWQsY0FBUSxRQUFRLE1BQU0sYUFBYSxTQUFTLENBQUM7QUFBQSxJQUMvQztBQUVBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxvQkFBb0IsU0FBa0M7QUFDN0QsY0FBVSxRQUFRLE9BQU8sU0FBTyxDQUFDLFVBQVUsY0FBYyxHQUFHLENBQUM7QUFDN0QsUUFBSSxDQUFDLFFBQVEsUUFBUTtBQUNuQixhQUFPLFFBQVEsUUFBUTtBQUFBLElBQ3pCO0FBRUEsVUFBTSxVQUFVLElBQUksUUFBYyxhQUFXLElBQUksaUJBQWlCLENBQUMsU0FBUyxhQUFhO0FBQ3ZGLFVBQUksUUFBUSxLQUFLLE9BQUssRUFBRSxZQUFZLE1BQU0sR0FBRztBQUMzQyxZQUFJLFFBQVEsTUFBTSxTQUFPLFVBQVUsY0FBYyxHQUFHLENBQUMsR0FBRztBQUN0RCxtQkFBUyxXQUFXO0FBQ3BCLGtCQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUMsRUFBRSxRQUFRLFdBQVc7QUFBQSxNQUNwQixTQUFTO0FBQUEsTUFDVCxXQUFXO0FBQUEsSUFDYixDQUFDLENBQUM7QUFHRixRQUFJLE9BQU87QUFDVCxZQUFNLFFBQVEsSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLFVBQVUsMkJBQTJCLGNBQWMsR0FBSSxZQUFZLEtBQUs7QUFDakgsWUFBTSxZQUFZLFdBQVcsTUFBTTtBQUNqQyxpQkFBUSxLQUFLLFFBQVEsVUFBVSxJQUFJO0FBQUEsTUFDckMsR0FBRyxXQUFXO0FBRWQsY0FBUSxRQUFRLE1BQU0sYUFBYSxTQUFTLENBQUM7QUFBQSxJQUMvQztBQUVBLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxXQUFXO0FBQ2IsV0FBTyxpQkFBaUIsRUFBRSxLQUFLLE1BQU0sb0JBQW9CLFNBQVMsQ0FBQztBQUNyRSxTQUFPLGlCQUFpQjtBQUMxQjs7O0FDL09PLElBQU0sa0JBQWtCLE9BQU8sV0FBVzs7O0FMM0cxQyxJQUFNLFdBQVcsT0FBTyxXQUFXO0FBQzFDLElBQU0sYUFBYSxPQUFPLFlBQVk7QUFDdEMsSUFBTSxjQUFjLE9BQU8sa0JBQWtCO0FBQzdDLElBQU0sd0JBQXdCO0FBRTlCLElBQU0sVUFBVSxRQUNiLENBQUMsTUFBVyxhQUFhLE9BQ3hCLGVBQWUsSUFBSSxFQUFFLFlBQVksR0FBRyxFQUFFLFdBQVcsSUFBSSxFQUFFLFFBQVEsS0FDL0QsT0FBTyxDQUFDLElBQ1YsQ0FBQyxNQUFZO0FBaUVmLElBQUksVUFBVTtBQUNkLElBQU0sZUFBZTtBQUFBLEVBQ25CO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFXO0FBQUEsRUFBUTtBQUFBLEVBQVc7QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFjO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUNwSDtBQUFBLEVBQVU7QUFBQSxFQUFXO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFPO0FBQUEsRUFBWTtBQUFBLEVBQVE7QUFBQSxFQUFZO0FBQUEsRUFBTTtBQUFBLEVBQU87QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFBLEVBQVU7QUFBQSxFQUNySDtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQVM7QUFBQSxFQUFZO0FBQUEsRUFBYztBQUFBLEVBQVU7QUFBQSxFQUFVO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQ3JIO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQUs7QUFBQSxFQUFVO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQVM7QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFDeEg7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQVk7QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVk7QUFBQSxFQUFVO0FBQUEsRUFBVTtBQUFBLEVBQUs7QUFBQSxFQUFXO0FBQUEsRUFDcEg7QUFBQSxFQUFZO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFBVTtBQUFBLEVBQVU7QUFBQSxFQUFXO0FBQUEsRUFBVTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBVTtBQUFBLEVBQ3RIO0FBQUEsRUFBVTtBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBVztBQUFBLEVBQU87QUFBQSxFQUFTO0FB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SUFBRTtBQUFBLElBQ3BDLGtCQUFrQixHQUFTLE1BQWM7QUFDdkMsYUFBTyxTQUFTLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSTtBQUFBLElBQ2xDO0FBQUEsSUFDQSxVQUFVLEdBQVcsTUFBdUIsU0FBOEI7QUFDeEUsVUFBSSxTQUFTO0FBQ1gsVUFBRSxRQUFRLENBQUFDLE9BQUs7QUFDYixnQkFBTUMsT0FBTSxTQUFTLElBQUlELEVBQUMsS0FBSyxvQkFBSSxJQUErQjtBQUNsRSxtQkFBUyxJQUFJQSxJQUFHQyxJQUFHO0FBQ25CLFVBQUFBLEtBQUksSUFBSSxNQUFNLE9BQU87QUFBQSxRQUN2QixDQUFDO0FBQUEsTUFDSCxPQUNLO0FBQ0gsVUFBRSxRQUFRLENBQUFELE9BQUs7QUFDYixnQkFBTUMsT0FBTSxTQUFTLElBQUlELEVBQUM7QUFDMUIsY0FBSUMsTUFBSztBQUNQLFlBQUFBLEtBQUksT0FBTyxJQUFJO0FBQ2YsZ0JBQUksQ0FBQ0EsS0FBSTtBQUNQLHVCQUFTLE9BQU9ELEVBQUM7QUFBQSxVQUNyQjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJ2IiwgImEiLCAicmVzdWx0IiwgImV4IiwgImlyIiwgIm1lcmdlZCIsICJyIiwgImlkIiwgInVuaXF1ZSIsICJuIiwgImNoaWxkcmVuIiwgImUiLCAibWFwIl0KfQo=
