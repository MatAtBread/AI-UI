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
var DEBUG = globalThis.DEBUG == "*" || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
var timeOutWarn = 5e3;
var _console = {
  log(...args) {
    if (DEBUG) console.log("(AI-UI) LOG:", ...args, new Error().stack?.replace(/Error\n\s*.*\n/, "\n"));
  },
  warn(...args) {
    if (DEBUG) console.warn("(AI-UI) WARN:", ...args, new Error().stack?.replace(/Error\n\s*.*\n/, "\n"));
  },
  info(...args) {
    if (DEBUG) console.trace("(AI-UI) INFO:", ...args);
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
var eventObservations = /* @__PURE__ */ new WeakMap();
function docEventHandler(ev) {
  if (!eventObservations.has(this))
    eventObservations.set(this, /* @__PURE__ */ new Map());
  const observations = eventObservations.get(this).get(ev.type);
  if (observations) {
    for (const o of observations) {
      try {
        const { push, terminate, container, selector } = o;
        if (!container.isConnected) {
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
  if (!eventObservations.has(container.ownerDocument))
    eventObservations.set(container.ownerDocument, /* @__PURE__ */ new Map());
  if (!eventObservations.get(container.ownerDocument).has(eventName)) {
    container.ownerDocument.addEventListener(eventName, docEventHandler, {
      passive: true,
      capture: true
    });
    eventObservations.get(container.ownerDocument).set(eventName, /* @__PURE__ */ new Set());
  }
  const queue = queueIteratableIterator(() => eventObservations.get(container.ownerDocument)?.get(eventName)?.delete(details));
  const details = {
    push: queue.push,
    terminate(ex) {
      queue.return?.(ex);
    },
    container,
    selector: selector || null
  };
  containerAndSelectorsMounted(container, selector ? [selector] : void 0).then((_) => eventObservations.get(container.ownerDocument)?.get(eventName).add(details));
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
  if (elt.isConnected)
    return Promise.resolve();
  return new Promise((resolve) => new MutationObserver((records, mutation) => {
    if (records.some((r) => r.addedNodes?.length)) {
      if (elt.isConnected) {
        mutation.disconnect();
        resolve();
      }
    }
  }).observe(elt.ownerDocument.body, {
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

// src/tags.ts
var callStackSymbol = Symbol("callStack");

// src/ai-ui.ts
var UniqueID = Symbol("Unique ID");
var logNode = DEBUG ? (n) => `"${"innerHTML" in n ? n.innerHTML : n.textContent}"` : (n) => void 0;
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
  function DomPromiseContainer() {
    return thisDoc.createComment(DEBUG ? new Error("promise").stack?.replace(/^Error: /, "") || "promise" : "promise");
  }
  function DyamicElementError({ error }) {
    return thisDoc.createComment(error instanceof Error ? error.toString() : "Error:\n" + JSON.stringify(error, null, 2));
  }
  const poStyleElt = thisDoc.createElement("STYLE");
  poStyleElt.id = "--ai-ui-extended-tag-styles-";
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
              _console.log("getOwnPropertyDescriptor", target, p);
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
              _console.log("ownKeys", target, unique2);
              return unique2;
            },
            get: (target, p, receiver) => {
              _console.log("get", target, p);
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
            _console.warn(x, logNode(g));
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
        let t = dpm.length ? dpm : [DomPromiseContainer()];
        appended.push(...t);
        let notYetMounted = true;
        let createdAt = Date.now() + timeOutWarn;
        const createdBy = DEBUG && new Error("Created by").stack;
        const error = (errorValue) => {
          const n = t.filter((n2) => Boolean(n2?.parentNode));
          if (n.length) {
            t = [DyamicElementError({ error: errorValue })];
            n[0].replaceWith(...t);
            n.slice(1).forEach((e) => e?.parentNode.removeChild(e));
          } else _console.warn("Can't report error", errorValue, createdBy, t.map(logNode));
          t = [];
          ap.return?.(errorValue);
        };
        const update = (es) => {
          if (!es.done) {
            try {
              const mounted = t.filter((e) => e?.parentNode && e.isConnected);
              const n = notYetMounted ? t : mounted;
              if (mounted.length) notYetMounted = false;
              if (!n.length || t.every((e) => removedNodes(e))) {
                t = [];
                const msg = "Element(s) have been removed from the document: " + insertionStack;
                ap.return?.(new Error(msg));
                return;
              }
              if (DEBUG && notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Async element not mounted after 5 seconds. If it is never mounted, it will leak.`, createdBy, t.map(logNode));
              }
              t = nodes(unbox(es.value));
              if (!t.length) t.push(DomPromiseContainer());
              n[0].replaceWith(...t);
              n.slice(1).forEach((e) => !t.includes(e) && e.parentNode?.removeChild(e));
              ap.next().then(update).catch(error);
            } catch (ex) {
              t = [];
              ap.return?.(ex);
            }
          }
        };
        ap.next().then(update).catch(error);
        return;
      }
      appended.push(thisDoc.createTextNode(c2.toString()));
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
                  _console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, logNode(value));
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
              if (removedNodes(base) || !notYetMounted && !mounted) {
                _console.info(`Element does not exist in document when setting async attribute '${k}' to:
${logNode(base)}`);
                ap.return?.();
                return;
              }
              if (mounted) notYetMounted = false;
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Element with async attribute '${k}' not mounted after 5 seconds. If it is never mounted, it will leak.
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
            _console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes", k, logNode(value));
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
      poStyleElt.appendChild(thisDoc.createTextNode(staticExtensions.styles + "\n"));
      if (!thisDoc.head.contains(poStyleElt)) {
        thisDoc.head.appendChild(poStyleElt);
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
  return function(node) {
    return tracked.has(node);
  };
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUcgPyAoKG46IE5vZGUpID0+IGBcIiR7J2lubmVySFRNTCcgaW4gbiA/IG4uaW5uZXJIVE1MIDogbi50ZXh0Q29udGVudH1cImApIDogKG46IE5vZGUpID0+IHVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT4gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnNcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICAvKiogQGRlcHJlY2F0ZWQgLSBsZWdhY3kgc3VwcG9ydCAqL1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NPzogYm9vbGVhblxufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8vIFRoaXMgaXMgYSB2ZXJ5IGluY29tcGxldGUgdHlwZS4gSW4gcHJhY3RpY2UsIHNldChhdHRycykgcmVxdWlyZXMgYSBkZWVwbHkgcGFydGlhbCBzZXQgb2ZcbiAgLy8gYXR0cmlidXRlcywgaW4gZXhhY3RseSB0aGUgc2FtZSB3YXkgYXMgYSBUYWdGdW5jdGlvbidzIGZpcnN0IG9iamVjdCBwYXJhbWV0ZXJcbiAgc2V0IGF0dHJpYnV0ZXMoYXR0cnM6IG9iamVjdCk7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcFxufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYywgJ3JlbW92ZWROb2RlcycsIG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG4gIGNvbnN0IHBvU3R5bGVFbHQgPSB0aGlzRG9jLmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbiAgcG9TdHlsZUVsdC5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzLVwiO1xuXG4gIC8qIFByb3BlcnRpZXMgYXBwbGllZCB0byBldmVyeSB0YWcgd2hpY2ggY2FuIGJlIGltcGxlbWVudGVkIGJ5IHJlZmVyZW5jZSwgc2ltaWxhciB0byBwcm90b3R5cGVzICovXG4gIGNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0YWdQcm90b3R5cGVzOiBQb0VsZW1lbnRNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIHtcbiAgICAgIHdoZW46IHtcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKC4uLndoYXQ6IFdoZW5QYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KHRoaXM6IEVsZW1lbnQsIGE6IG9iamVjdCkge1xuICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgICAgIGV4ID0+IGNvbnNvbGUud2FybihleCkpO1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaWRzOiB7XG4gICAgICAgIC8vIC5pZHMgaXMgYSBnZXR0ZXIgdGhhdCB3aGVuIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vIGxhemlseSBjcmVhdGVzIGEgUHJveHkgdGhhdCBwcm92aWRlcyBsaXZlIGFjY2VzcyB0byBjaGlsZHJlbiBieSBpZFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICBnZXQodGhpczogRWxlbWVudCkge1xuICAgICAgICAgIC8vIE5vdyB3ZSd2ZSBiZWVuIGFjY2Vzc2VkLCBjcmVhdGUgdGhlIHByb3h5XG4gICAgICAgICAgY29uc3QgaWRQcm94eSA9IG5ldyBQcm94eSgoKCk9Pnt9KSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIFdlYWtSZWY8RWxlbWVudD4+LCB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0FyZy5jb25zdHJ1Y3Rvci5kZWZpbml0aW9uLmlkc1thcmdzWzBdLmlkXSguLi5hcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgPGVsdD4uaWRzLiR7YXJncz8uWzBdPy5pZH0gaXMgbm90IGEgdGFnLWNyZWF0aW5nIGZ1bmN0aW9uYCwgeyBjYXVzZTogZXggfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdHJ1Y3Q6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZjogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7IHJldHVybiBudWxsIH0sXG4gICAgICAgICAgICBpc0V4dGVuc2libGUoKSB7IHJldHVybiBmYWxzZSB9LFxuICAgICAgICAgICAgcHJldmVudEV4dGVuc2lvbnMoKSB7IHJldHVybiB0cnVlIH0sXG4gICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXCIsdGFyZ2V0LHApO1xuICAgICAgICAgICAgICBpZiAodGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5Rm9yKHApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXModGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3duS2V5czogKHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBpZHMgPSBbLi4udGhpcy5xdWVyeVNlbGVjdG9yQWxsKGBbaWRdYCldLm1hcChlID0+IGUuaWQpO1xuICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbLi4ubmV3IFNldChpZHMpXTtcbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIGlkcy5sZW5ndGggIT09IHVuaXF1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudCBpZHNgLCB1bmlxdWUpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm93bktleXNcIix0YXJnZXQsdW5pcXVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuaXF1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHAsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0XCIsdGFyZ2V0LHApO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGsgPSBrZXlGb3IocCk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UndmUgY2FjaGVkIHRoaXMgSUQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmIChwayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBlbGVtZW50IGlzIHN0aWxsIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBlbGVtZW50IHdpdGggdGhlIHNhbWUgSURcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRhcmdldFtwa10uZGVyZWYoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgcmVmLmlkID09PSBwICYmIHRoaXMuY29udGFpbnMocmVmKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbcGtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZTogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIENTUy5lc2NhcGUocCkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50cyB3aXRoIElEIFwiJHtwfVwiYC8qLGBcXG5cXHQke2xvZ05vZGUodGhpcyl9YCovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZSA9IG5sWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUocCkpID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUpXG4gICAgICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIHBrLCBuZXcgV2Vha1JlZihlKSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uYW5kIHJlcGxhY2UgdGhlIGdldHRlciB3aXRoIHRoZSBQcm94eVxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWRzJywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gaWRQcm94eSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi4uYW5kIHJldHVybiB0aGF0IGZyb20gdGhlIGdldHRlciwgc28gc3Vic2VxdWVudCBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGFjY2Vzc2VzIGdvIHZpYSB0aGUgUHJveHlcbiAgICAgICAgICByZXR1cm4gaWRQcm94eTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKiBBZGQgYW55IHVzZXIgc3VwcGxpZWQgcHJvdG90eXBlcyAqL1xuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4gZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyKSksXG4gICAgICAgICAgKHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKHgsIGxvZ05vZGUoZykpO1xuICAgICAgICAgICAgZy5yZXBsYWNlV2l0aChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogeCB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgYXBwZW5kZWQucHVzaChjKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBoYXZlIGFuIGludGVyZXN0aW5nIGNhc2UgaGVyZSB3aGVyZSBhbiBpdGVyYWJsZSBTdHJpbmcgaXMgYW4gb2JqZWN0IHdpdGggYm90aCBTeW1ib2wuaXRlcmF0b3JcbiAgICAgIC8vIChpbmhlcml0ZWQgZnJvbSB0aGUgU3RyaW5nIHByb3RvdHlwZSkgYW5kIFN5bWJvbC5hc3luY0l0ZXJhdG9yIChhcyBpdCdzIGJlZW4gYXVnbWVudGVkIGJ5IGJveGVkKCkpXG4gICAgICAvLyBidXQgd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGNhc2VzIGxpa2UgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0LCBhcnJheSwgZXRjLiwgbm90IHRoZSBmdWtueSBvbmVzXG4gICAgICAvLyBJdCB1c2VkIHRvIGJlIGFmdGVyIHRoZSBpc0FzeW5jSXRlcigpIHRlc3QsIGJ1dCBhIG5vbi1Bc3luY0l0ZXJhdG9yICptYXkqIGFsc28gYmUgYSBzeW5jIGl0ZXJhYmxlXG4gICAgICAvLyBGb3Igbm93LCB3ZSBleGNsdWRlIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSBpbiB0aGlzIGNhc2UuXG4gICAgICBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGMgJiYgIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSAmJiBjW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGMpIGNoaWxkcmVuKGQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FzeW5jSXRlcjxDaGlsZFRhZ3M+KGMpKSB7XG4gICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICBjb25zdCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhpcyBhc3luYyBpdGVyYXRvciBpcyBhIGJveGVkIG9iamVjdCB0aGF0IGFsc28gaG9sZHMgYSB2YWx1ZVxuICAgICAgICBjb25zdCB1bmJveGVkID0gYy52YWx1ZU9mKCk7XG4gICAgICAgIGNvbnN0IGRwbSA9ICh1bmJveGVkID09PSB1bmRlZmluZWQgfHwgdW5ib3hlZCA9PT0gYykgPyBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXSA6IG5vZGVzKHVuYm94ZWQgYXMgQ2hpbGRUYWdzKVxuXG4gICAgICAgIGxldCB0ID0gZHBtLmxlbmd0aCA/IGRwbSA6IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKC4uLnQpO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKSBhcyBDaGlsZE5vZGVbXTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHQgPSBbRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSldO1xuICAgICAgICAgICAgblswXS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgY3JlYXRlZEJ5LCB0Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDxDaGlsZFRhZ3M+KSA9PiB7XG4gICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDaGlsZE5vZGVbXSwgc2luY2Ugd2UgdGVzdGVkIC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gdCA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGggfHwgdC5ldmVyeShlID0+IHJlbW92ZWROb2RlcyhlKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBBc3luYyBlbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsIGNyZWF0ZWRCeSwgdC5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICBpZiAoIXQubGVuZ3RoKSB0LnB1c2goRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgKG5bMF0gYXMgQ2hpbGROb2RlKS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgIH0pKGMpO1xuICAgIHJldHVybiBhcHBlbmRlZDtcbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94KGE6IHVua25vd24pOiB1bmtub3duIHtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsIHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KGEgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAodiAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHYsIGspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHNldCBhdHRyaWJ1dGVcIiwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2RlcyhiYXNlKSB8fCAoIW5vdFlldE1vdW50ZWQgJiYgIW1vdW50ZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBFbGVtZW50IGRvZXMgbm90IGV4aXN0IGluIGRvY3VtZW50IHdoZW4gc2V0dGluZyBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIHRvOlxcbiR7bG9nTm9kZShiYXNlKX1gKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW91bnRlZCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuXFxuRWxlbWVudCBjb250YWluczogJHtsb2dOb2RlKGJhc2UpfVxcbiR7Y3JlYXRlZEJ5fWApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgY3JlYXRlZEJ5LCBsb2dOb2RlKGJhc2UpKTtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVuYm94ZWQgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSB2YWx1ZSAmJiAhaXNBc3luY0l0ZXIodW5ib3hlZCkpXG4gICAgICAgICAgICB1cGRhdGUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHVuYm94ZWQgfSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXNcIiwgaywgbG9nTm9kZSh2YWx1ZSkpO1xuICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBkW2tdID0gY29weTtcbiAgICAgICAgICAgICAgICAvL2Fzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQodGhpc0RvYy5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIXRoaXNEb2MuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpIH0pKSBhcyBOb2RlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4sIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIC8vIExlZ2FjeSBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgaWYgKGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gJiYgJ29uUmVtb3ZlZEZyb21ET00nIGluIG5vZGUgJiYgdHlwZW9mIG5vZGUub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJykgbm9kZS5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbVt0cmFja10ubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChub2RlOiBOb2RlKSB7XG4gICAgcmV0dXJuIHRyYWNrZWQuaGFzKG5vZGUpO1xuICB9XG59XG4iLCAiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLnRyYWNlKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gZG9lcyBhIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nLCBfZXhjZXB0XyBhIGZ1bmN0aW9uXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKTtcbi8vIFdlIHNob3VsZCBleGNsdWRlIEFzeW5jSXRlcmFibGUgZnJvbSB0aGUgdHlwZXMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gaXRlcmFibGVzIChhbmQgdGhlcmVmb3JlIHBhc3NlZCB0byBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KVxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVZhbHVlID0gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSB8IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZVtdIHwgeyBbazogc3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG5cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IHR5cGUgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+ID0geyBbSXRlcmFiaWxpdHldOiBEZXB0aCB9O1xuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gVCAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+PjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBUaGlzIGlzIHBhdGNoIHRvIHRoZSBzdGQgbGliIGRlZmluaXRpb24gb2YgQXJyYXk8VD4uIEkgZG9uJ3Qga25vdyB3aHkgaXQncyBhYnNlbnQsXG4gIC8vIGFzIHRoaXMgaXMgdGhlIGltcGxlbWVudGF0aW9uIGluIGFsbCBKYXZhU2NyaXB0IGVuZ2luZXMuIEl0IGlzIHByb2JhYmx5IGEgcmVzdWx0XG4gIC8vIG9mIGl0cyBhYnNlbmNlIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3ZhbHVlcyxcbiAgLy8gd2hpY2ggaW5oZXJpdHMgZnJvbSB0aGUgT2JqZWN0LnByb3RvdHlwZSwgd2hpY2ggbWFrZXMgbm8gY2xhaW0gZm9yIHRoZSByZXR1cm4gdHlwZVxuICAvLyBzaW5jZSBpdCBjb3VsZCBiZSBvdmVycmlkZGVtLiBIb3dldmVyLCBpbiB0aGF0IGNhc2UsIGEgVFMgZGVmbiBzaG91bGQgYWxzbyBvdmVycmlkZVxuICAvLyBpdCwgbGlrZSBOdW1iZXIsIFN0cmluZywgQm9vbGVhbiBldGMgZG8uXG4gIGludGVyZmFjZSBBcnJheTxUPiB7XG4gICAgdmFsdWVPZigpOiBBcnJheTxUPjtcbiAgfVxuICAvLyBBcyBhYm92ZSwgdGhlIHJldHVybiB0eXBlIGNvdWxkIGJlIFQgcmF0aGVyIHRoYW4gT2JqZWN0LCBzaW5jZSB0aGlzIGlzIHRoZSBkZWZhdWx0IGltcGwsXG4gIC8vIGJ1dCBpdCdzIG5vdCwgZm9yIHNvbWUgcmVhc29uLlxuICBpbnRlcmZhY2UgT2JqZWN0IHtcbiAgICB2YWx1ZU9mPFQ+KHRoaXM6IFQpOiBUIGV4dGVuZHMgSXRlcmFibGVUeXBlPGluZmVyIFo+ID8gWiA6IE9iamVjdDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLCB0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6ICh7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IChJdGVyYWJsZVByb3BlcnRpZXM8RT5bXSB8IEl0ZXJhYmxlUHJvcGVydGllczxFW10+KVxuICAgIDogKChcbiAgICAgIElQW0tdIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT5cbiAgICAgIDogSVBbS11cbiAgICApICYgSXRlcmFibGVUeXBlPElQW0tdPilcbiAgKVxufSlcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgcmV0dXJuIGQgYXMgRCAmIFM7XG59XG5cbmNvbnN0IF9wZW5kaW5nID0gU3ltYm9sKCdwZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbX3BlbmRpbmddOiBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsLFxuICAgIFtfaXRlbXNdOiBbXSBhcyBJdGVyYXRvclJlc3VsdDxUPltdIHwgbnVsbCxcblxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcSBhcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD47XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAocVtfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW19pdGVtc10uc2hpZnQoKSEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGJlIGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCB0aGlzIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIHFbX3BlbmRpbmddLnVuc2hpZnQodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4odj86IHVua25vd24pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSByZXR1cm4gLTE7IC8vIFRoZSBxdWV1ZSBoYXMgbm8gY29uc3VtZXJzIGFuZCBoYXMgdGVybWluYXRlZC5cbiAgICAgIHJldHVybiBxW19pdGVtc10ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBwdXNoKHZhbHVlOiBUKSB7XG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuY29uc3QgX2luZmxpZ2h0ID0gU3ltYm9sKCdpbmZsaWdodCcpO1xuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtfaW5mbGlnaHRdOiBTZXQ8VD4gfTtcbiAgcVtfaW5mbGlnaHRdID0gbmV3IFNldDxUPigpO1xuXG4gIHEucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZTogVCkge1xuICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW19pbmZsaWdodF0uaGFzKHZhbHVlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgcVtfaW5mbGlnaHRdLmFkZCh2YWx1ZSk7XG4gICAgICBjb25zdCBwID0gcVtfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbX2luZmxpZ2h0XS5kZWxldGUodmFsdWUpKTtcbiAgICAgIHAucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICB9IGVsc2UgaWYgKCFxW19pdGVtc10uZmluZCh2ID0+IHYudmFsdWUgPT09IHZhbHVlKSkge1xuICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHE7XG59XG5cbi8vIFJlLWV4cG9ydCB0byBoaWRlIHRoZSBpbnRlcm5hbHNcbmV4cG9ydCBjb25zdCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5leHBvcnQgY29uc3QgZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmNvbnN0IF9wcm94aWVkQXN5bmNJdGVyYXRvciA9IFN5bWJvbCgnX3Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTogZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gRml4XG4gICAgICAgIHJldHVybiBhW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGFzICh0eXBlb2YgYXN5bmNFeHRyYXMpW01dXG4gICAgfVttZXRob2RdO1xuICB9XG5cbiAgdHlwZSBIZWxwZXJEZXNjcmlwdG9yczxUPiA9IHtcbiAgICBbSyBpbiBrZXlvZiBBc3luY0V4dHJhSXRlcmFibGU8VD5dOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxBc3luY0V4dHJhSXRlcmFibGU8VD5bS10+XG4gIH0gJiB7XG4gICAgW0l0ZXJhYmlsaXR5XT86IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPCdzaGFsbG93Jz5cbiAgfTtcblxuICBjb25zdCBleHRyYXMgPSB7IFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IGluaXRJdGVyYXRvciB9IGFzIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiAmIHsgW0l0ZXJhYmlsaXR5XT86ICdzaGFsbG93JyB9O1xuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT4gLy8gQHRzLWlnbm9yZVxuICAgIGV4dHJhc1trXSA9IGxhenlBc3luY01ldGhvZChrKSlcbiAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYgJiYgdltJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSB2W0l0ZXJhYmlsaXR5XTtcbiAgfVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTxWPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWIHwgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHY7XG4gICAgICAgICAgbGV0IHN0YWNrID0gREVCVUcgPyBuZXcgRXJyb3IoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8obmV3IEVycm9yKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGNvbnN1bWUgYW5vdGhlciBpdGVyYXRvci4gRGlkIHlvdSBtZWFuIHRvIGRlY2xhcmUgaXQ/YCkpO1xuICAgICAgICAgIGNvbnN1bWUuY2FsbCh2LCB5ID0+IHtcbiAgICAgICAgICAgIGlmICh2ICE9PSBwaXBlZCkge1xuICAgICAgICAgICAgICAvLyBXZSdyZSBiZWluZyBwaXBlZCBmcm9tIHNvbWV0aGluZyBlbHNlLiBXZSB3YW50IHRvIHN0b3AgdGhhdCBvbmUgYW5kIGdldCBwaXBlZCBmcm9tIHRoaXMgb25lXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGlwZWQgaXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiByZXBsYWNlZCBieSBhbm90aGVyIGl0ZXJhdG9yYCwgeyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+ICh2ID09PSBwaXBlZCkgJiYgKHBpcGVkID0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgICAvLyBFYXJseSByZXR1cm4gYXMgd2UncmUgZ29pbmcgdG8gcGlwZSB2YWx1ZXMgaW4gbGF0ZXJcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBpcGVkICYmIERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IHBpcGVkIGZyb20gYW5vdGhlciBpdGVyYXRvciwgYW5kIG1pZ2h0IGJlIG92ZXJyd2l0dGVuIGxhdGVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8Vj4pOiBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+IHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH1cbiAgICAgIH0pLCBwZHMpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QoYSksIE9iamVjdC5hc3NpZ24ocGRzLCB7XG4gICAgICAgICAgdG9KU09OKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfVxuICAgICAgICB9KSk7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAvLyBUaGUgcHJveGllcyBhcmUgcmVjdXJzaXZlLCBzbyB0aGF0IGlmIGFuIG9iamVjdCBjb250YWlucyBvYmplY3RzLCB0aGV5IHRvbyBhcmUgcHJveGllZC4gT2JqZWN0cyBjb250YWluaW5nIHByaW1pdGl2ZXMgcmVtYWluIHByb3hpZWQgdG9cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBnZXQvc2V0L3NlbGV0ZSBpbiBwbGFjZSBvZiB0aGUgdXN1YWwgcHJpbWl0aXZlIGJveGluZyB2aWEgT2JqZWN0KHByaW1pdGl2ZVZhbHVlKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBib3hPYmplY3QoYSwgcGRzKTtcblxuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBvZiB0eXBlIFwiJyArIHR5cGVvZiBhICsgJ1wiJyk7XG4gIH1cblxuICB0eXBlIFdpdGhQYXRoID0geyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhOiBWLCBwYXRoOiBzdHJpbmcgfCBudWxsIH0gfTtcbiAgdHlwZSBQb3NzaWJseVdpdGhQYXRoID0gViB8IFdpdGhQYXRoO1xuICBmdW5jdGlvbiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG86IFBvc3NpYmx5V2l0aFBhdGgpOiBvIGlzIFdpdGhQYXRoIHtcbiAgICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aCAmJiAoKG8gPSBvPy5bZmllbGRzW2ldXSkgIT09IHVuZGVmaW5lZCk7IGkrKyk7XG4gICAgcmV0dXJuIG87XG4gIH1cbiAgZnVuY3Rpb24gYm94T2JqZWN0KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFBvc3NpYmx5V2l0aFBhdGg+KSB7XG4gICAgbGV0IHdpdGhQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICAgIHJldHVybiBuZXcgUHJveHkoYSBhcyBvYmplY3QsIGhhbmRsZXIoKSkgYXMgViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIocGF0aCA9ICcnKTogUHJveHlIYW5kbGVyPG9iamVjdD4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQSBib3hlZCBvYmplY3QgaGFzIGl0cyBvd24ga2V5cywgYW5kIHRoZSBrZXlzIG9mIGFuIEFzeW5jRXh0cmFJdGVyYWJsZVxuICAgICAgICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5ID09PSBfcHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGEga2V5IGlzIHNldCBpbiB0aGUgdGFyZ2V0LCBwdXNoIHRoZSBjaGFuZ2VcbiAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgd2l0aG91dFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXS5hIDogbyk7XG4gICAgICAgICAgICAgIHJldHVybiB3aXRob3V0UGF0aFtrZXkgYXMga2V5b2YgdHlwZW9mIHBkc107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aXRoUGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdIDogeyBhOiBvLCBwYXRoOiBudWxsIH0pO1xuXG4gICAgICAgICAgICAgIGxldCBhaSA9IGZpbHRlck1hcCh3aXRoUGF0aCwgKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gZGVzdHJ1Y3R1cmUoby5hLCBwYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCAhPT0gdiB8fCBvLnBhdGggPT09IG51bGwgfHwgby5wYXRoLnN0YXJ0c1dpdGgocGF0aCkgPyB2IDogSWdub3JlO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoaW50PzogJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuY29uc3QgZm9yZXZlciA9IG5ldyBQcm9taXNlPGFueT4oKCkgPT4geyB9KTtcblxuLyogTWVyZ2UgYXN5bmNJdGVyYWJsZXMgaW50byBhIHNpbmdsZSBhc3luY0l0ZXJhYmxlICovXG5cbi8qIFRTIGhhY2sgdG8gZXhwb3NlIHRoZSByZXR1cm4gQXN5bmNHZW5lcmF0b3IgYSBnZW5lcmF0b3Igb2YgdGhlIHVuaW9uIG9mIHRoZSBtZXJnZWQgdHlwZXMgKi9cbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGU8VD4gPSBUW10gZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8aW5mZXIgVT4+W10gPyBVIDogbmV2ZXI7XG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlczxUPiA9IEFzeW5jSXRlcmFibGU8Q29sbGFwc2VJdGVyYWJsZVR5cGU8VD4+O1xuXG5leHBvcnQgY29uc3QgbWVyZ2UgPSA8QSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0Pj5bXSwgVFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4oLi4uYWk6IEEpID0+IHtcbiAgY29uc3QgaXQ6ICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcbiAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8eyBpZHg6IG51bWJlciwgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCkgPT4geyB9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9IH0pKVxuICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHsgaWR4OiBudW1iZXIsIGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT5bXTtcbiAgbGV0IHNpOiBBc3luY0l0ZXJhdG9yPGFueT5bXSA9IFtdO1xuICBsZXQgYWN0aXZlOiBudW1iZXIgPSAwO1xuICBjb25zdCBjaSA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gY2kgfSxcbiAgICBuZXh0KCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICBpZiAocGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYyA9IE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSwgaWR4KSA9PiB7XG4gICAgICAgICAgYWN0aXZlICs9IDE7XG4gICAgICAgICAgc2lbaWR4XSA9IHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgICAgcmV0dXJuIHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGlkeCwgaywgaXIgfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMpLnRoZW4oKHsgaWR4LCBrLCBpciB9KSA9PiB7XG4gICAgICAgICAgaWYgKGlyLmRvbmUpIHtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgYWN0aXZlIC09IDE7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYWNjdW11bGF0ZWRba10gPSBpci52YWx1ZTtcbiAgICAgICAgICAgIHBjW2lkeF0gPSBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IGlkeCwgaywgaXIgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIHBjLmZvckVhY2goKHAsIGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICBwYy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnRocm93Py4oZXgpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn1cblxuXG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGU8VD4oaTogYW55KTogaSBpcyBBc3luY0V4dHJhSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgJiYgZXh0cmFLZXlzLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgKGkgYXMgYW55KVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuXG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnM8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4oYWk6IEEpOiBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IHVua25vd24+IHtcbiAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgYXNzaWduSGlkZGVuKGFpLCBhc3luY0V4dHJhcyk7XG4gIH1cbiAgcmV0dXJuIGFpIGFzIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICYgQSA6IG5ldmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzPEcgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFIsIFIgZXh0ZW5kcyBBc3luY0dlbmVyYXRvcj4oZzogRykge1xuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEY+ID1cbiAgRiBleHRlbmRzICgpID0+IEFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVuZGVmaW5lZCB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPiA9IHVuZGVmaW5lZDtcbiAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMgYXMgQXN5bmNJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pikge1xuICAgIGxhc3QgPSBmPy4odSk7XG4gIH1cbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPik7XG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuXG50eXBlIFBhcnRpYWxJdGVyYWJsZTxUID0gYW55PiA9IFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUPj47XG5cbmZ1bmN0aW9uIHJlc29sdmVTeW5jPFosIFI+KHY6IE1heWJlUHJvbWlzZWQ8Wj4sIHRoZW46ICh2OiBaKSA9PiBSLCBleGNlcHQ6ICh4OiBhbnkpID0+IGFueSk6IE1heWJlUHJvbWlzZWQ8Uj4ge1xuICBpZiAoaXNQcm9taXNlTGlrZSh2KSlcbiAgICByZXR1cm4gdi50aGVuKHRoZW4sIGV4Y2VwdCk7XG4gIHRyeSB7IHJldHVybiB0aGVuKHYpIH0gY2F0Y2ggKGV4KSB7IHJldHVybiBleGNlcHQoZXgpIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4sXG4gIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmUsXG4gIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGNvbnN0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyByZXNvbHZlKHApXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuXG4gICAgICAgICAgZXggPT5cbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmICghaXQ/LmRvbmUpIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50Ly8udGhlbih6YWxnbyA9PiB6YWxnbyk7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiogKCkgeyB9KSgpO1xuICB3aGlsZSAoZykge1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGcsIFN5bWJvbC5hc3luY0l0ZXJhdG9yKTtcbiAgICBpZiAoZGVzYykge1xuICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGcgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZyk7XG4gIH1cbiAgaWYgKCFnKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIEVtcHR5T2JqZWN0ID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgbmV2ZXI+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfGAuJHtzdHJpbmd9YCB8IGBbJHtzdHJpbmd9XWBcblxuLyogVmFsaWRXaGVuU2VsZWN0b3JzIGFyZTpcbiAgICBAc3RhcnRcbiAgICBAcmVhZHlcbiAgICBldmVudDpzZWxlY3RvclxuICAgIGV2ZW50ICAgICAgICAgICBcInRoaXNcIiBlbGVtZW50LCBldmVudCB0eXBlPSdldmVudCdcbiAgICBzZWxlY3RvciAgICAgICAgc3BlY2lmaWNlZCBzZWxlY3RvcnMsIGltcGxpZXMgXCJjaGFuZ2VcIiBldmVudFxuKi9cblxuZXhwb3J0IHR5cGUgVmFsaWRXaGVuU2VsZWN0b3I8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAke2tleW9mIFNwZWNpYWxXaGVuRXZlbnRzfWBcbiAgfCBgJHtFdmVudEF0dHJpYnV0ZX06JHtDU1NJZGVudGlmaWVyPElEUz59YFxuICB8IEV2ZW50QXR0cmlidXRlXG4gIHwgQ1NTSWRlbnRpZmllcjxJRFM+O1xuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz5cbiAgPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIGAke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyAnY2hhbmdlJ1xuICA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XTtcblxuLyoqIHdoZW4gKiovXG50eXBlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lcjogRWxlbWVudFxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbFxufTtcbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IFdlYWtNYXA8RG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBNYXA8a2V5b2YgV2hlbkV2ZW50cywgU2V0PEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPj4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyh0aGlzKSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQodGhpcywgbmV3IE1hcCgpKTtcblxuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQodGhpcykhLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgaWYgKCFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBjb250YWluZXIgfHwgY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkpKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzOiBzdHJpbmcpOiBzIGlzIENTU0lkZW50aWZpZXIge1xuICByZXR1cm4gQm9vbGVhbihzICYmIChzLnN0YXJ0c1dpdGgoJyMnKSB8fCBzLnN0YXJ0c1dpdGgoJy4nKSB8fCAocy5zdGFydHNXaXRoKCdbJykgJiYgcy5lbmRzV2l0aCgnXScpKSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtDU1NJZGVudGlmaWVyIHwgbnVsbCwga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXSB7XG4gIGNvbnN0IHBhcnRzID0gd2hhdC5zcGxpdCgnOicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgcmV0dXJuIFtwYXJ0c1swXSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3NlbGVjdG9yLCBldmVudE5hbWVdID0gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkgPz8gZG9UaHJvdyhcIkludmFsaWQgV2hlblNlbGVjdG9yOiBcIit3aGF0KTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhjb250YWluZXIub3duZXJEb2N1bWVudCkpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50LCBuZXcgTWFwKCkpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBjb250YWluZXIub3duZXJEb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBxdWV1ZSA9IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdPigoKSA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpPy5nZXQoZXZlbnROYW1lKT8uZGVsZXRlKGRldGFpbHMpKTtcblxuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gLypFdmVudE9ic2VydmF0aW9uPEV4Y2x1ZGU8RXh0cmFjdEV2ZW50TmFtZXM8RXZlbnROYW1lPiwga2V5b2YgU3BlY2lhbFdoZW5FdmVudHM+PiovID0ge1xuICAgIHB1c2g6IHF1ZXVlLnB1c2gsXG4gICAgdGVybWluYXRlKGV4OiBFcnJvcikgeyBxdWV1ZS5yZXR1cm4/LihleCl9LFxuICAgIGNvbnRhaW5lcixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgbnVsbFxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpPy5nZXQoZXZlbnROYW1lKSEuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKSA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBuZXZlckdvbm5hSGFwcGVuPFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWw6IENTU0lkZW50aWZpZXIgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGxldCBldmVudHM6IEFzeW5jSXRlcmF0b3I8YW55LCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxhbnk+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGFpIH0sXG4gICAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnRocm93KSByZXR1cm4gZXZlbnRzLnRocm93KGV4KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIH0sXG4gICAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy5yZXR1cm4pIHJldHVybiBldmVudHMucmV0dXJuKHYpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICB9LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgaWYgKGV2ZW50cykgcmV0dXJuIGV2ZW50cy5uZXh0KCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBtaXNzaW5nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbjxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAobmV2ZXJHb25uYUhhcHBlbjxXaGVuSXRlcmF0ZWRUeXBlPFM+PigpKTtcblxuICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMobWVyZ2VkKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKGVsdDogRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoZWx0LmlzQ29ubmVjdGVkKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAoZWx0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShlbHQub3duZXJEb2N1bWVudC5ib2R5LCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lcjogRWxlbWVudCwgc2VsZWN0b3JzPzogc3RyaW5nW10pIHtcbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lciwgc2VsZWN0b3JzKSxcbiAgICAgIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcilcbiAgICBdKTtcbiAgcmV0dXJuIGVsZW1lbnRJc0luRE9NKGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyOiBFbGVtZW50LCBtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICBpZiAoIW1pc3NpbmcubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWVcbiAgfSkpO1xuXG4gIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIFwiTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgNSBzZWNvbmRzOlwiKTtcbiAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihzdGFjaywgbWlzc2luZyk7XG4gICAgfSwgdGltZU91dFdhcm4pO1xuXG4gICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59XG4iLCAiLyogVHlwZXMgZm9yIHRhZyBjcmVhdGlvbiwgaW1wbGVtZW50ZWQgYnkgYHRhZygpYCBpbiBhaS11aS50cy5cbiAgTm8gY29kZS9kYXRhIGlzIGRlY2xhcmVkIGluIHRoaXMgZmlsZSAoZXhjZXB0IHRoZSByZS1leHBvcnRlZCBzeW1ib2xzIGZyb20gaXRlcmF0b3JzLnRzKS5cbiovXG5cbmltcG9ydCB0eXBlIHsgQXN5bmNQcm92aWRlciwgSWdub3JlLCBJdGVyYWJsZVByb3BlcnRpZXMsIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuaW1wb3J0IHR5cGUgeyBVbmlxdWVJRCB9IGZyb20gXCIuL2FpLXVpLmpzXCI7XG5cbmV4cG9ydCB0eXBlIENoaWxkVGFncyA9IE5vZGUgLy8gVGhpbmdzIHRoYXQgYXJlIERPTSBub2RlcyAoaW5jbHVkaW5nIGVsZW1lbnRzKVxuICB8IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gLy8gVGhpbmdzIHRoYXQgY2FuIGJlIGNvbnZlcnRlZCB0byB0ZXh0IG5vZGVzIHZpYSB0b1N0cmluZ1xuICB8IHVuZGVmaW5lZCAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICB8IHR5cGVvZiBJZ25vcmUgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgLy8gTkI6IHdlIGNhbid0IGNoZWNrIHRoZSBjb250YWluZWQgdHlwZSBhdCBydW50aW1lLCBzbyB3ZSBoYXZlIHRvIGJlIGxpYmVyYWxcbiAgLy8gYW5kIHdhaXQgZm9yIHRoZSBkZS1jb250YWlubWVudCB0byBmYWlsIGlmIGl0IHR1cm5zIG91dCB0byBub3QgYmUgYSBgQ2hpbGRUYWdzYFxuICB8IEFzeW5jSXRlcmFibGU8Q2hpbGRUYWdzPiB8IEFzeW5jSXRlcmF0b3I8Q2hpbGRUYWdzPiB8IFByb21pc2VMaWtlPENoaWxkVGFncz4gLy8gVGhpbmdzIHRoYXQgd2lsbCByZXNvbHZlIHRvIGFueSBvZiB0aGUgYWJvdmVcbiAgfCBBcnJheTxDaGlsZFRhZ3M+XG4gIHwgSXRlcmFibGU8Q2hpbGRUYWdzPjsgLy8gSXRlcmFibGUgdGhpbmdzIHRoYXQgaG9sZCB0aGUgYWJvdmUsIGxpa2UgQXJyYXlzLCBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3RcblxudHlwZSBBc3luY0F0dHI8WD4gPSBBc3luY1Byb3ZpZGVyPFg+IHwgUHJvbWlzZUxpa2U8QXN5bmNQcm92aWRlcjxYPiB8IFg+O1xuXG5leHBvcnQgdHlwZSBQb3NzaWJseUFzeW5jPFg+ID1cbiAgW1hdIGV4dGVuZHMgW29iamVjdF0gLy8gTm90IFwibmFrZWRcIiB0byBwcmV2ZW50IHVuaW9uIGRpc3RyaWJ1dGlvblxuICA/IFggZXh0ZW5kcyBBc3luY0F0dHI8aW5mZXIgVT5cbiAgPyBQb3NzaWJseUFzeW5jPFU+XG4gIDogWCBleHRlbmRzIEZ1bmN0aW9uXG4gID8gWCB8IEFzeW5jQXR0cjxYPlxuICA6IEFzeW5jQXR0cjxQYXJ0aWFsPFg+PiB8IHsgW0sgaW4ga2V5b2YgWF0/OiBQb3NzaWJseUFzeW5jPFhbS10+OyB9XG4gIDogWCB8IEFzeW5jQXR0cjxYPiB8IHVuZGVmaW5lZDtcblxudHlwZSBEZWVwUGFydGlhbDxYPiA9IFtYXSBleHRlbmRzIFtvYmplY3RdID8geyBbSyBpbiBrZXlvZiBYXT86IERlZXBQYXJ0aWFsPFhbS10+IH0gOiBYO1xuXG5leHBvcnQgdHlwZSBJbnN0YW5jZTxUID0ge30+ID0geyBbVW5pcXVlSURdOiBzdHJpbmcgfSAmIFQ7XG5cbi8vIEludGVybmFsIHR5cGVzIHN1cHBvcnRpbmcgVGFnQ3JlYXRvclxudHlwZSBBc3luY0dlbmVyYXRlZE9iamVjdDxYIGV4dGVuZHMgb2JqZWN0PiA9IHtcbiAgW0sgaW4ga2V5b2YgWF06IFhbS10gZXh0ZW5kcyBBc3luY0F0dHI8aW5mZXIgVmFsdWU+ID8gVmFsdWUgOiBYW0tdXG59XG5cbnR5cGUgSURTPEk+ID0gSSBleHRlbmRzIHt9ID8ge1xuICBpZHM6IHtcbiAgICBbSiBpbiBrZXlvZiBJXTogSVtKXSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+ID8gUmV0dXJuVHlwZTxJW0pdPiA6IG5ldmVyO1xuICB9XG59IDogeyBpZHM6IHt9IH1cblxudHlwZSBSZVR5cGVkRXZlbnRIYW5kbGVyczxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEsgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzXG4gICAgPyBFeGNsdWRlPEdsb2JhbEV2ZW50SGFuZGxlcnNbS10sIG51bGw+IGV4dGVuZHMgKGU6IGluZmVyIEUpPT5hbnlcbiAgICAgID8gKHRoaXM6IFQsIGU6IEUpPT5hbnkgfCBudWxsXG4gICAgICA6IFRbS11cbiAgICA6IFRbS11cbn1cblxudHlwZSBSZWFkV3JpdGVBdHRyaWJ1dGVzPEUsIEJhc2UgPSBFPiA9IEUgZXh0ZW5kcyB7IGF0dHJpYnV0ZXM6IGFueSB9XG4gID8gKE9taXQ8RSwgJ2F0dHJpYnV0ZXMnPiAmIHtcbiAgICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXA7XG4gICAgc2V0IGF0dHJpYnV0ZXModjogRGVlcFBhcnRpYWw8UG9zc2libHlBc3luYzxPbWl0PEJhc2UsJ2F0dHJpYnV0ZXMnPj4+KTtcbiAgfSlcbiAgOiAoT21pdDxFLCAnYXR0cmlidXRlcyc+KVxuXG5leHBvcnQgdHlwZSBGbGF0dGVuPE8+ID0gW3tcbiAgW0sgaW4ga2V5b2YgT106IE9bS11cbn1dW251bWJlcl07XG5cbmV4cG9ydCB0eXBlIERlZXBGbGF0dGVuPE8+ID0gW3tcbiAgW0sgaW4ga2V5b2YgT106IEZsYXR0ZW48T1tLXT5cbn1dW251bWJlcl07XG5cbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogTztcbnR5cGUgT21pdFR5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gbmV2ZXIgOiBLXTogVFtLXSB9XVtudW1iZXJdXG50eXBlIFBpY2tUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IEsgOiBuZXZlcl06IFRbS10gfV1bbnVtYmVyXVxuXG4vLyBGb3IgaW5mb3JtYXRpdmUgcHVycG9zZXMgLSB1bnVzZWQgaW4gcHJhY3RpY2VcbmludGVyZmFjZSBfTm90X0RlY2xhcmVkXyB7IH1cbmludGVyZmFjZSBfTm90X0FycmF5XyB7IH1cbnR5cGUgRXhjZXNzS2V5czxBLCBCPiA9XG4gIEEgZXh0ZW5kcyBhbnlbXVxuICA/IEIgZXh0ZW5kcyBhbnlbXVxuICA/IEV4Y2Vzc0tleXM8QVtudW1iZXJdLCBCW251bWJlcl0+XG4gIDogX05vdF9BcnJheV9cbiAgOiBCIGV4dGVuZHMgYW55W11cbiAgPyBfTm90X0FycmF5X1xuICA6IE5ldmVyRW1wdHk8T21pdFR5cGU8e1xuICAgIFtLIGluIGtleW9mIEFdOiBLIGV4dGVuZHMga2V5b2YgQlxuICAgID8gQVtLXSBleHRlbmRzIChCW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBCW0tdIDogRGVlcFBhcnRpYWw8QltLXT4pXG4gICAgPyBuZXZlciA6IEJbS11cbiAgICA6IF9Ob3RfRGVjbGFyZWRfXG4gIH0sIG5ldmVyPj5cblxudHlwZSBPdmVybGFwcGluZ0tleXM8QSxCPiA9IEIgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDogQSBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBrZXlvZiBBICYga2V5b2YgQjtcblxudHlwZSBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LCBEIGV4dGVuZHMgT3ZlcnJpZGVzLCBSZXN1bHQgPSBuZXZlcj5cbiAgPSAoT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj5cbiAgKSBleHRlbmRzIG5ldmVyXG4gID8gRXhjZXNzS2V5czxEWydvdmVycmlkZSddLCBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyAnYG92ZXJyaWRlYCBoYXMgcHJvcGVydGllcyBub3QgaW4gdGhlIGJhc2UgdGFnIG9yIG9mIHRoZSB3cm9uZyB0eXBlLCBhbmQgc2hvdWxkIG1hdGNoJzogRXhjZXNzS2V5czxEWydvdmVycmlkZSddLCBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+IH1cbiAgOiBPbWl0VHlwZTx7XG4gICAgJ2BkZWNsYXJlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYG92ZXJyaWRlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgZGVjbGFyZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+LFxuICAgICdgb3ZlcnJpZGVgIGNsYXNoZXMgd2l0aCBgZGVjbGFyZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gIH0sIG5ldmVyPlxuXG5leHBvcnQgdHlwZSBPdmVycmlkZXMgPSB7XG4gIG92ZXJyaWRlPzogb2JqZWN0O1xuICBkZWNsYXJlPzogb2JqZWN0O1xuICBpdGVyYWJsZT86IHsgW2s6IHN0cmluZ106IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9O1xuICBpZHM/OiB7IFtpZDogc3RyaW5nXTogVGFnQ3JlYXRvckZ1bmN0aW9uPGFueT47IH07XG4gIHN0eWxlcz86IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0ZWQgPSB7XG4gIGNvbnN0cnVjdGVkOiAoKSA9PiAoQ2hpbGRUYWdzIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQgfCBDaGlsZFRhZ3M+KTtcbn1cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGF0dHJpYnV0ZXMgZnJvbSBhbiBFeFRhZ0NyZWF0b3JcbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPSBUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIEJhc2VBdHRycz5cbiAgPyBCYXNlQXR0cnNcbiAgOiBuZXZlcjtcblxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgaXRlcmFibGUgYXR0cmlidXRlcyBmcm9tIHRoZSBfYW5jZXN0b3JzXyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQmFzZUl0ZXJhYmxlczxCYXNlPiA9XG4gIEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgX0EsIGluZmVyIEIsIGluZmVyIEQgZXh0ZW5kcyBPdmVycmlkZXMsIGluZmVyIF9EPlxuICA/IEJhc2VJdGVyYWJsZXM8Qj4gZXh0ZW5kcyBuZXZlclxuICAgID8gRFsnaXRlcmFibGUnXSBleHRlbmRzIHVua25vd25cbiAgICAgID8ge31cbiAgICAgIDogRFsnaXRlcmFibGUnXVxuICAgIDogQmFzZUl0ZXJhYmxlczxCPiAmIERbJ2l0ZXJhYmxlJ11cbiAgOiBuZXZlcjtcblxudHlwZSBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXM+ID1cbiAge1xuICAgIGlkczogPGNvbnN0IEsgZXh0ZW5kcyBrZXlvZiBFeGNsdWRlPERbJ2lkcyddLCB1bmRlZmluZWQ+LCBjb25zdCBUQ0YgZXh0ZW5kcyBUYWdDcmVhdG9yRnVuY3Rpb248YW55PiA9IEV4Y2x1ZGU8RFsnaWRzJ10sIHVuZGVmaW5lZD5bS10+KFxuICAgICAgYXR0cnM6eyBpZDogSyB9ICYgRXhjbHVkZTxQYXJhbWV0ZXJzPFRDRj5bMF0sIENoaWxkVGFncz4sXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgICApID0+IFJldHVyblR5cGU8VENGPlxuICB9XG4gICYgRFsnZGVjbGFyZSddXG4gICYgRFsnb3ZlcnJpZGUnXVxuICAmIElEUzxEWydpZHMnXT5cbiAgJiBPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LCBrZXlvZiBEWydpdGVyYWJsZSddPjtcblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXM+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ107XG5cbmV4cG9ydCBjb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3JDYWxsU3RhY2sgPSB7IFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW10gfTtcblxuZXhwb3J0IHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6IFRhZ0NyZWF0aW9uT3B0aW9ucyAmIENvbnN0cnVjdG9yQ2FsbFN0YWNrICYge1xuICBbazogc3RyaW5nXTogdW5rbm93bjtcbn0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3Q+IHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXM+ID1cbiAgVGFnQ29uc3R1Y3RvcjxCYXNlPiAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gICAgJiBBc3luY0dlbmVyYXRlZE9iamVjdDxDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlLEQ+PixcbiAgICBEWydkZWNsYXJlJ11cbiAgICAmIERbJ292ZXJyaWRlJ11cbiAgICAmIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD5cbiAgICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gID47XG5cbnR5cGUgU3RhdGljUmVmZXJlbmNlczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzPiA9IFBpY2tUeXBlPFxuICBEZWZpbml0aW9uc1snZGVjbGFyZSddXG4gICYgRGVmaW5pdGlvbnNbJ292ZXJyaWRlJ11cbiAgJiBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPixcbiAgYW55XG4gID47XG5cbi8vIGB0aGlzYCBpbiB0aGlzLmV4dGVuZGVkKC4uLikgaXMgQmFzZUNyZWF0b3JcbmludGVyZmFjZSBFeHRlbmRlZFRhZyB7XG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9LFxuICAgIFRhZ0luc3RhbmNlID0gYW55XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IChpbnN0OlRhZ0luc3RhbmNlKSA9PiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG5cbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge31cbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zPlxuICAgICAgPlxuICAgID5cbiAgPlxufVxuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG5TdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBjb25zdHJ1Y3RlZDogYW55IH1cbiAgPyBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgQ29uc3RydWN0ZWRcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcImNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0aW9uT3B0aW9ucyA9IHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59O1xuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdO1xuLyogQSBUYWdDcmVhdG9yIGlzIGEgZnVuY3Rpb24gdGhhdCBvcHRpb25hbGx5IHRha2VzIGF0dHJpYnV0ZXMgJiBjaGlsZHJlbiwgYW5kIGNyZWF0ZXMgdGhlIHRhZ3MuXG4gIFRoZSBhdHRyaWJ1dGVzIGFyZSBQb3NzaWJseUFzeW5jLiBUaGUgcmV0dXJuIGhhcyBgY29uc3RydWN0b3JgIHNldCB0byB0aGlzIGZ1bmN0aW9uIChzaW5jZSBpdCBpbnN0YW50aWF0ZWQgaXQpXG4qL1xuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckZ1bmN0aW9uPEJhc2UgZXh0ZW5kcyBvYmplY3Q+ID0gKC4uLmFyZ3M6IFRhZ0NyZWF0b3JBcmdzPFBvc3NpYmx5QXN5bmM8UmVUeXBlZEV2ZW50SGFuZGxlcnM8QmFzZT4+ICYgVGhpc1R5cGU8UmVUeXBlZEV2ZW50SGFuZGxlcnM8QmFzZT4+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj47XG5cbi8qIEEgVGFnQ3JlYXRvciBpcyBUYWdDcmVhdG9yRnVuY3Rpb24gZGVjb3JhdGVkIHdpdGggc29tZSBleHRyYSBtZXRob2RzLiBUaGUgU3VwZXIgJiBTdGF0aWNzIGFyZ3MgYXJlIG9ubHlcbmV2ZXIgc3BlY2lmaWVkIGJ5IEV4dGVuZGVkVGFnIChpbnRlcm5hbGx5KSwgYW5kIHNvIGlzIG5vdCBleHBvcnRlZCAqL1xudHlwZSBFeFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdCxcbiAgU3VwZXIgZXh0ZW5kcyAodW5rbm93biB8IEV4VGFnQ3JlYXRvcjxhbnk+KSA9IHVua25vd24sXG4gIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcyA9IHt9LFxuICBTdGF0aWNzID0ge30sXG4+ID0gVGFnQ3JlYXRvckZ1bmN0aW9uPEJhc2U+ICYge1xuICAvKiBJdCBjYW4gYWxzbyBiZSBleHRlbmRlZCAqL1xuICBleHRlbmRlZDogRXh0ZW5kZWRUYWdcbiAgLyogSXQgaXMgYmFzZWQgb24gYSBcInN1cGVyXCIgVGFnQ3JlYXRvciAqL1xuICBzdXBlcjogU3VwZXJcbiAgLyogSXQgaGFzIGEgZnVuY3Rpb24gdGhhdCBleHBvc2VzIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSB0YWdzIGl0IGNyZWF0ZXMgYW5kIGl0cyBzdXBlciAqL1xuICBkZWZpbml0aW9uPzogT3ZlcnJpZGVzICYgeyBbVW5pcXVlSURdOiBzdHJpbmcgfTsgLyogQ29udGFpbnMgdGhlIGRlZmluaXRpb25zICYgVW5pcXVlSUQgZm9yIGFuIGV4dGVuZGVkIHRhZy4gdW5kZWZpbmVkIGZvciBiYXNlIHRhZ3MgKi9cbiAgLyogSXQgaGFzIGEgbmFtZSAoc2V0IHRvIGEgY2xhc3Mgb3IgZGVmaW5pdGlvbiBsb2NhdGlvbiksIHdoaWNoIGlzIGhlbHBmdWwgd2hlbiBkZWJ1Z2dpbmcgKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAvKiBDYW4gdGVzdCBpZiBhbiBlbGVtZW50IHdhcyBjcmVhdGVkIGJ5IHRoaXMgZnVuY3Rpb24gb3IgYSBiYXNlIHRhZyBmdW5jdGlvbiAqL1xuICBbU3ltYm9sLmhhc0luc3RhbmNlXShlbHQ6IGFueSk6IGJvb2xlYW47XG4gIFtVbmlxdWVJRF06IHN0cmluZztcbn0gJlxuLy8gYFN0YXRpY3NgIGhlcmUgaXMgdGhhdCBzYW1lIGFzIFN0YXRpY1JlZmVyZW5jZXM8U3VwZXIsIFN1cGVyRGVmcz4sIGJ1dCB0aGUgY2lyY3VsYXIgcmVmZXJlbmNlIGJyZWFrcyBUU1xuLy8gc28gd2UgY29tcHV0ZSB0aGUgU3RhdGljcyBvdXRzaWRlIHRoaXMgdHlwZSBkZWNsYXJhdGlvbiBhcyBwYXNzIHRoZW0gYXMgYSByZXN1bHRcblN0YXRpY3M7XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2ZXIsIG5ldmVyLCB7fT47XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NPLElBQU0sUUFBUSxXQUFXLFNBQVMsT0FBTyxXQUFXLFNBQVMsUUFBUSxXQUFXLE9BQU8sTUFBTSxtQkFBbUIsS0FBSztBQUVySCxJQUFNLGNBQWM7QUFFM0IsSUFBTSxXQUFXO0FBQUEsRUFDZixPQUFPLE1BQVc7QUFDaEIsUUFBSSxNQUFPLFNBQVEsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsRUFDbkc7QUFBQSxFQUNBLFFBQVEsTUFBVztBQUNqQixRQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLGtCQUFpQixJQUFJLENBQUM7QUFBQSxFQUNyRztBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLE1BQU0saUJBQWlCLEdBQUcsSUFBSTtBQUFBLEVBQ25EO0FBQ0Y7OztBQ05BLElBQU0sVUFBVSxDQUFDLE1BQVM7QUFBQztBQUVwQixTQUFTLFdBQWtDO0FBQ2hELE1BQUksVUFBK0M7QUFDbkQsTUFBSSxTQUErQjtBQUNuQyxRQUFNLFVBQVUsSUFBSSxRQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsTUFBTSxJQUFJLENBQUM7QUFDOUQsVUFBUSxVQUFVO0FBQ2xCLFVBQVEsU0FBUztBQUNqQixNQUFJLE9BQU87QUFDVCxVQUFNLGVBQWUsSUFBSSxNQUFNLEVBQUU7QUFDakMsWUFBUSxN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QUFDVDtBQU1BLFNBQVMsZ0JBQWdCLE1BQVksT0FBbUQsd0JBQWtDO0FBQ3hILFFBQU0sVUFBVSxvQkFBSSxRQUFjO0FBQ2xDLFdBQVMsS0FBSyxPQUFpQjtBQUM3QixlQUFXLFFBQVEsT0FBTztBQUV4QixVQUFLLFVBQVUsaUJBQWtCLEtBQUssYUFBYTtBQUNqRCxhQUFLLEtBQUssVUFBVTtBQUNwQixnQkFBUSxJQUFJLElBQUk7QUFFaEIsWUFBSSwwQkFBMEIsc0JBQXNCLFFBQVEsT0FBTyxLQUFLLHFCQUFxQixXQUFZLE1BQUssaUJBQWlCO0FBQUEsTUFDakk7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksaUJBQWlCLENBQUMsY0FBYztBQUNsQyxjQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFVBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxLQUFLLEVBQUUsUUFBUTtBQUM3QyxhQUFLLEVBQUUsS0FBSyxDQUFDO0FBQUEsTUFDZjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQyxFQUFFLFFBQVEsTUFBTSxFQUFFLFNBQVMsTUFBTSxXQUFXLEtBQUssQ0FBQztBQUVuRCxTQUFPLFNBQVUsTUFBWTtBQUMzQixXQUFPLFFBQVEsSUFBSSxJQUFJO0FBQUEsRUFDekI7QUFDRjsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJpc01pc3NpbmciLCAibWVyZ2VkIiwgInVuaXF1ZSIsICJjIiwgIm4iLCAidmFsdWUiLCAiaXNBbmNlc3RyYWwiLCAiY2hpbGRyZW4iXQp9Cg==
