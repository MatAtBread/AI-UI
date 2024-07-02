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
        }, writable: true },
        toJSON: { value() {
          return a2;
        }, writable: true }
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
var eventObservations = /* @__PURE__ */ new Map();
function docEventHandler(ev) {
  const observations = eventObservations.get(ev.type);
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
      _console.warn(stack, missing);
    }, timeOutWarn);
    promise.finally(() => clearTimeout(warnTimer));
  }
  return promise;
}

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
var elementProtype = Object.getOwnPropertyDescriptors({
  get ids() {
    return getElementIdMap(this);
  },
  set ids(v) {
    throw new Error("Cannot set ids on " + this.valueOf());
  },
  when: function(...what) {
    return when(this, ...what);
  }
});
var poStyleElt = document.createElement("STYLE");
poStyleElt.id = "--ai-ui-extended-tag-styles-";
function isChildTag(x) {
  return typeof x === "string" || typeof x === "number" || typeof x === "boolean" || x instanceof Node || x instanceof NodeList || x instanceof HTMLCollection || x === null || x === void 0 || Array.isArray(x) || isPromiseLike(x) || isAsyncIter(x) || typeof x === "object" && Symbol.iterator in x && typeof x[Symbol.iterator] === "function";
}
var callStackSymbol = Symbol("callStack");
var tag = function(_1, _2, _3) {
  const [nameSpace, tags, options] = typeof _1 === "string" || _1 === null ? [_1, _2, _3] : Array.isArray(_1) ? [null, _1, _2] : [null, standandTags, _1];
  const removedNodes = mutationTracker(document, "removedNodes");
  const commonProperties = options?.commonProperties;
  const tagPrototypes = Object.create(
    null,
    elementProtype
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
          (ex) => _console.warn(ex)
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
          ap.return?.(error);
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
      appended.push(document.createTextNode(c2.toString()));
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
function DomPromiseContainer() {
  return document.createComment(DEBUG ? new Error("promise").stack?.replace(/^Error: /, "") || "promise" : "promise");
}
function DyamicElementError({ error }) {
  return document.createComment(error instanceof Error ? error.toString() : "Error:\n" + JSON.stringify(error, null, 2));
}
var enableOnRemovedFromDOM = function() {
  enableOnRemovedFromDOM = function() {
  };
  new MutationObserver((mutations) => {
    mutations.forEach(function(m) {
      if (m.type === "childList") {
        m.removedNodes.forEach(
          (removed) => removed && removed instanceof Element && [...removed.getElementsByTagName("*"), removed].filter((elt) => !elt.isConnected).forEach(
            (elt) => {
              "onRemovedFromDOM" in elt && typeof elt.onRemovedFromDOM === "function" && elt.onRemovedFromDOM();
            }
          )
        );
      }
    });
  }).observe(document.body, { subtree: true, childList: true });
};
function mutationTracker(root, track) {
  const tracked = /* @__PURE__ */ new WeakSet();
  function walk(nodes) {
    for (const node of nodes) {
      if (track === "addedNodes" === node.isConnected) {
        walk(node.childNodes);
        tracked.add(node);
      }
    }
  }
  new MutationObserver((mutations) => {
    mutations.forEach(function(m) {
      if (m.type === "childList" && m.removedNodes.length) {
        walk(m[track]);
      }
    });
  }).observe(root, { subtree: true, childList: true });
  return function(node) {
    return tracked.has(node);
  };
}
var warned = /* @__PURE__ */ new Set();
function getElementIdMap(node, ids) {
  node = node || document;
  ids = ids || /* @__PURE__ */ Object.create(null);
  if (node.querySelectorAll) {
    node.querySelectorAll("[id]").forEach(function(elt) {
      if (elt.id) {
        if (!ids[elt.id])
          ids[elt.id] = elt;
        else if (DEBUG) {
          if (!warned.has(elt.id)) {
            warned.add(elt.id);
            _console.info(
              "Shadowed multiple element IDs",
              elt.id
              /*, elt, ids![elt.id]*/
            );
          }
        }
      }
    });
  }
  return ids;
}
export {
  iterators_exports as Iterators,
  UniqueID,
  enableOnRemovedFromDOM,
  getElementIdMap,
  tag,
  when
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RlYnVnLnRzIiwgIi4uL3NyYy9kZWZlcnJlZC50cyIsICIuLi9zcmMvaXRlcmF0b3JzLnRzIiwgIi4uL3NyYy93aGVuLnRzIiwgIi4uL3NyYy9haS11aS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLnRyYWNlKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpaW5cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3QgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgVGhpcyByZWxpZXMgb24gYSBoYWNrIHRvIGB3cmFwQXN5bmNIZWxwZXJgIGluIGl0ZXJhdG9ycy50cyB3aGVuICphY2NlcHRzKiBhIFBhcnRpYWw8QXN5bmNJdGVyYXRvcj5cbiAgYnV0IGNhc3RzIGl0IHRvIGEgQXN5bmNJdGVyYXRvciBiZWZvcmUgdXNlLlxuXG4gIFRoZSBpdGVyYWJpbGl0eSBvZiBwcm9wZXJ0eXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gIEJ5IGRlZmF1bHQsIHRoZSBjdXJyZW50bHkgaW1wbGVtZW50YXRpb24gZG9lcyBhIG9uZS1sZXZlbCBkZWVwIG1hcHBpbmcsIHNvIGFuIGl0ZXJhYmxlIHByb3BlcnR5ICdvYmonIGlzIGl0c2VsZlxuICBpdGVyYWJsZSwgYXMgYXJlIGl0J3MgbWVtYmVycy4gVGhlIG9ubHkgZGVmaW5lZCB2YWx1ZSBhdCBwcmVzZW50IGlzIFwic2hhbGxvd1wiLCBpbiB3aGljaCBjYXNlICdvYmonIHJlbWFpbnNcbiAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuKi9cblxuLy8gQmFzZSB0eXBlcyB0aGF0IGNhbiBiZSBtYWRlIGRlZmluZWQgYXMgaXRlcmFibGU6IGJhc2ljYWxseSBhbnl0aGluZywgX2V4Y2VwdF8gYSBmdW5jdGlvblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCk7XG4vLyBXZSBzaG91bGQgZXhjbHVkZSBBc3luY0l0ZXJhYmxlIGZyb20gdGhlIHR5cGVzIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGl0ZXJhYmxlcyAoYW5kIHRoZXJlZm9yZSBwYXNzZWQgdG8gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSlcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgfCBJdGVyYWJsZVByb3BlcnR5VmFsdWVbXSB8IHsgW2s6IHN0cmluZyB8IHN5bWJvbCB8IG51bWJlcl06IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZX07XG5cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IHR5cGUgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+ID0geyBbSXRlcmFiaWxpdHldOiBEZXB0aCB9O1xuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gVCAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+PjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBUaGlzIGlzIHBhdGNoIHRvIHRoZSBzdGQgbGliIGRlZmluaXRpb24gb2YgQXJyYXk8VD4uIEkgZG9uJ3Qga25vdyB3aHkgaXQncyBhYnNlbnQsXG4gIC8vIGFzIHRoaXMgaXMgdGhlIGltcGxlbWVudGF0aW9uIGluIGFsbCBKYXZhU2NyaXB0IGVuZ2luZXMuIEl0IGlzIHByb2JhYmx5IGEgcmVzdWx0XG4gIC8vIG9mIGl0cyBhYnNlbmNlIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3ZhbHVlcyxcbiAgLy8gd2hpY2ggaW5oZXJpdHMgZnJvbSB0aGUgT2JqZWN0LnByb3RvdHlwZSwgd2hpY2ggbWFrZXMgbm8gY2xhaW0gZm9yIHRoZSByZXR1cm4gdHlwZVxuICAvLyBzaW5jZSBpdCBjb3VsZCBiZSBvdmVycmlkZGVtLiBIb3dldmVyLCBpbiB0aGF0IGNhc2UsIGEgVFMgZGVmbiBzaG91bGQgYWxzbyBvdmVycmlkZVxuICAvLyBpdCwgbGlrZSBOdW1iZXIsIFN0cmluZywgQm9vbGVhbiBldGMgZG8uXG4gIGludGVyZmFjZSBBcnJheTxUPiB7XG4gICAgdmFsdWVPZigpOkFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczpUKTogVCBleHRlbmRzIEl0ZXJhYmxlVHlwZTxpbmZlciBaPiA/IFogOiBPYmplY3Q7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCx0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6ICh7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IChJdGVyYWJsZVByb3BlcnRpZXM8RT5bXSB8IEl0ZXJhYmxlUHJvcGVydGllczxFW10+KVxuICAgIDogKChcbiAgICAgIElQW0tdIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT5cbiAgICAgIDogSVBbS11cbiAgICApICYgSXRlcmFibGVUeXBlPElQW0tdPilcbiAgKVxufSlcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2V9KTtcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ3BlbmRpbmcnKTtcbmNvbnN0IF9pdGVtcyA9IFN5bWJvbCgnaXRlbXMnKTtcbmZ1bmN0aW9uIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0ge1xuICAgIFtfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW19pdGVtc106IFtdIGFzIEl0ZXJhdG9yUmVzdWx0PFQ+W10gfCBudWxsLFxuXG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxIGFzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPjtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChxW19pdGVtc10/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHFbX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHRoaXMgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgcVtfcGVuZGluZ10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybih2PzogdW5rbm93bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbX2l0ZW1zXS5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBfaW5mbGlnaHQgPSBTeW1ib2woJ2luZmxpZ2h0Jyk7XG5mdW5jdGlvbiBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+PiAmIHsgW19pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW19pbmZsaWdodF0gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgcS5wdXNoID0gZnVuY3Rpb24gKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERlYm91bmNlXG4gICAgaWYgKHFbX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICBxW19pbmZsaWdodF0uYWRkKHZhbHVlKTtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdi52YWx1ZSA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyB7fSwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYseSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAseyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB8IG51bGwgfX07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspIDtcbiAgICByZXR1cm4gbztcbiAgfVxuICBmdW5jdGlvbiBib3hPYmplY3QoYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8UG9zc2libHlXaXRoUGF0aD4pIHtcbiAgICBsZXQgd2l0aFBhdGg6ICBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXToge2EscGF0aH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHthLHBhdGh9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsa2V5KSkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICB3aXRob3V0UGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHdpdGhvdXRQYXRoW2tleSBhcyBrZXlvZiB0eXBlb2YgcGRzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdpdGhQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0gOiB7IGE6IG8sIHBhdGg6IG51bGwgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aCA9PT0gbnVsbCB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmUgO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGhpbnQ/OidzdHJpbmcnfCdudW1iZXInfCdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdDogKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55PilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx7aWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCk9Pnt9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9fSkpXG4gICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHtkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHtpZHg6IG51bWJlciwgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTpudW1iZXIgPSAwO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7fSk7XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7c2ksaWR4LGssaXJ9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICBhY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGNbaWR4XSA9IHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KXtcbiAgICAgIHBjLmZvckVhY2goKHAsaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOlBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEYsIEFuZCA9IHt9LCBPciA9IG5ldmVyPiA9XG4gIEYgZXh0ZW5kcyAoKT0+QXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WixSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOih2OlopPT5SLCBleGNlcHQ6KHg6YW55KT0+YW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbixleGNlcHQpO1xuICB0cnkgeyByZXR1cm4gdGhlbih2KSB9IGNhdGNoIChleCkgeyByZXR1cm4gZXhjZXB0KGV4KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBjb25zdCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7IC8vIFRlcm1pbmF0ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcblxuICAgICAgICAgIGV4ID0+XG4gICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoIWl0Py5kb25lKSB7XG4gICAgICBjdXJyZW50ID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICBhaSEubmV4dCgpXG4gICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudC8vLnRoZW4oemFsZ28gPT4gemFsZ28pO1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxcbiAgQXN5bmNJdGVyYWJsZTxhbnk+XG4gIHwgVmFsaWRXaGVuU2VsZWN0b3I8SURTPlxuICB8IEVsZW1lbnQgLyogSW1wbGllcyBcImNoYW5nZVwiIGV2ZW50ICovXG4gIHwgUHJvbWlzZTxhbnk+IC8qIEp1c3QgZ2V0cyB3cmFwcGVkIGluIGEgc2luZ2xlIGB5aWVsZGAgKi9cbj47XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyO1xuXG4vLyBUaGUgZXh0ZW5kZWQgaXRlcmF0b3IgdGhhdCBzdXBwb3J0cyBhc3luYyBpdGVyYXRvciBtYXBwaW5nLCBjaGFpbmluZywgZXRjXG5leHBvcnQgdHlwZSBXaGVuUmV0dXJuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICBNYXBwYWJsZUl0ZXJhYmxlPFxuICAgIEFzeW5jRXh0cmFJdGVyYWJsZTxcbiAgICAgIFdoZW5JdGVyYXRlZFR5cGU8Uz4+PjtcblxudHlwZSBTcGVjaWFsV2hlbkV2ZW50cyA9IHtcbiAgXCJAc3RhcnRcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0sICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IHsgW2s6IHN0cmluZ106IHVuZGVmaW5lZCB9ICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfGAuJHtzdHJpbmd9YCB8IGBbJHtzdHJpbmd9XWBcblxuLyogVmFsaWRXaGVuU2VsZWN0b3JzIGFyZTpcbiAgICBAc3RhcnRcbiAgICBAcmVhZHlcbiAgICBldmVudDpzZWxlY3RvclxuICAgIGV2ZW50ICAgICAgICAgICBcInRoaXNcIiBlbGVtZW50LCBldmVudCB0eXBlPSdldmVudCdcbiAgICBzZWxlY3RvciAgICAgICAgc3BlY2lmaWNlZCBzZWxlY3RvcnMsIGltcGxpZXMgXCJjaGFuZ2VcIiBldmVudFxuKi9cblxuZXhwb3J0IHR5cGUgVmFsaWRXaGVuU2VsZWN0b3I8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAke2tleW9mIFNwZWNpYWxXaGVuRXZlbnRzfWBcbiAgfCBgJHtFdmVudEF0dHJpYnV0ZX06JHtDU1NJZGVudGlmaWVyPElEUz59YFxuICB8IEV2ZW50QXR0cmlidXRlXG4gIHwgQ1NTSWRlbnRpZmllcjxJRFM+O1xuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz5cbiAgPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIGAke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyAnY2hhbmdlJ1xuICA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XTtcblxuLyoqIHdoZW4gKiovXG50eXBlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lcjogRWxlbWVudFxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbFxufTtcbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IE1hcDxrZXlvZiBXaGVuRXZlbnRzLCBTZXQ8RXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lciwgc2VsZWN0b3IgfSA9IG87XG4gICAgICAgIGlmICghY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lci5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IG4gfHwgbi5jb250YWlucyhldi50YXJnZXQpKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXaGVuU2VsZWN0b3I8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPih3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pOiB1bmRlZmluZWQgfCBbQ1NTSWRlbnRpZmllciB8IG51bGwsIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbcGFydHNbMF0sXCJjaGFuZ2VcIl07XG4gICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6bmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIHdoZW5FdmVudDxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KGNvbnRhaW5lcjogRWxlbWVudCwgd2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KSB7XG4gIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIrd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuXG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyLFxuICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW48Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4ge30pO1xuICB5aWVsZCB1bmRlZmluZWQgYXMgWjsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyc1tudW1iZXJdKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbDogQ1NTSWRlbnRpZmllciB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0OiBFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChlbHQuaXNDb25uZWN0ZWQpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChlbHQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyOiBFbGVtZW50LCBzZWxlY3RvcnM/OiBzdHJpbmdbXSkge1xuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgIF0pO1xuICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXI6IEVsZW1lbnQsIG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICB9XG5cbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG5cbiAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsICJpbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBJZ25vcmUsIGFzeW5jSXRlcmF0b3IsIGRlZmluZUl0ZXJhYmxlUHJvcGVydHksIGlzQXN5bmNJdGVyLCBpc0FzeW5jSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5pbXBvcnQgeyBXaGVuUGFyYW1ldGVycywgV2hlblJldHVybiwgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5pbXBvcnQgeyBDaGlsZFRhZ3MsIENvbnN0cnVjdGVkLCBJbnN0YW5jZSwgT3ZlcnJpZGVzLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5cbi8qIEV4cG9ydCB1c2VmdWwgc3R1ZmYgZm9yIHVzZXJzIG9mIHRoZSBidW5kbGVkIGNvZGUgKi9cbmV4cG9ydCB7IHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuZXhwb3J0IHR5cGUgeyBDaGlsZFRhZ3MsIEluc3RhbmNlLCBUYWdDcmVhdG9yLCBUYWdDcmVhdG9yRnVuY3Rpb24gfSBmcm9tICcuL3RhZ3MuanMnXG5leHBvcnQgKiBhcyBJdGVyYXRvcnMgZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuXG5leHBvcnQgY29uc3QgVW5pcXVlSUQgPSBTeW1ib2woXCJVbmlxdWUgSURcIik7XG5cbmNvbnN0IGxvZ05vZGUgPSBERUJVRyA/ICgobjogTm9kZSkgPT4gYFwiJHsnaW5uZXJIVE1MJyBpbiBuID8gbi5pbm5lckhUTUwgOiBuLnRleHRDb250ZW50fVwiYCkgOiAobjogTm9kZSk9PnVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIHt9ID0ge30+ID0ge1xuICBjb21tb25Qcm9wZXJ0aWVzOiBPdGhlck1lbWJlcnNcbn1cblxuLyogTWVtYmVycyBhcHBsaWVkIHRvIEVWRVJZIHRhZyBjcmVhdGVkLCBldmVuIGJhc2UgdGFncyAqL1xuaW50ZXJmYWNlIFBvRWxlbWVudE1ldGhvZHMge1xuICBnZXQgaWRzKCk6IHt9XG4gIHdoZW48VCBleHRlbmRzIEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzLCBTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM8RXhjbHVkZTxrZXlvZiBUWydpZHMnXSwgbnVtYmVyIHwgc3ltYm9sPj4+KHRoaXM6IFQsIC4uLndoYXQ6IFMpOiBXaGVuUmV0dXJuPFM+O1xuICAvKiBhbHNvXG4gIHNldCBhdHRyaWJ1dGVzKC4uLnBvc3NpYmxlIGF0dHJpYnV0ZXMpOyAvLyBoYXMgdG8gYmUgZW5jbG9zZWQgYnkgdGFnKCkgdG8gYWNjZXNzIGFzc2lnblByb3BzXG4gICovXG59XG5cbi8vIFN1cHBvcnQgZm9yIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2h0bSAob3IgaW1wb3J0IGh0bSBmcm9tICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2h0bS9kaXN0L2h0bS5tb2R1bGUuanMnKVxuLy8gTm90ZTogc2FtZSBzaWduYXR1cmUgYXMgUmVhY3QuY3JlYXRlRWxlbWVudFxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVFbGVtZW50IHtcbiAgLy8gU3VwcG9ydCBmb3IgaHRtLCBKU1gsIGV0Y1xuICBjcmVhdGVFbGVtZW50KFxuICAgIC8vIFwibmFtZVwiIGNhbiBhIEhUTUwgdGFnIHN0cmluZywgYW4gZXhpc3Rpbmcgbm9kZSAoanVzdCByZXR1cm5zIGl0c2VsZiksIG9yIGEgdGFnIGZ1bmN0aW9uXG4gICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAvLyBUaGUgYXR0cmlidXRlcyB1c2VkIHRvIGluaXRpYWxpc2UgdGhlIG5vZGUgKGlmIGEgc3RyaW5nIG9yIGZ1bmN0aW9uIC0gaWdub3JlIGlmIGl0J3MgYWxyZWFkeSBhIG5vZGUpXG4gICAgYXR0cnM6IGFueSxcbiAgICAvLyBUaGUgY2hpbGRyZW5cbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlO1xufVxuXG4vKiBUaGUgaW50ZXJmYWNlIHRoYXQgY3JlYXRlcyBhIHNldCBvZiBUYWdDcmVhdG9ycyBmb3IgdGhlIHNwZWNpZmllZCBET00gdGFncyAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWdMb2FkZXIge1xuICBub2RlcyguLi5jOiBDaGlsZFRhZ3NbXSk6IChOb2RlIHwgKC8qUCAmKi8gKEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzKSkpW107XG4gIFVuaXF1ZUlEOiB0eXBlb2YgVW5pcXVlSURcblxuICAvKlxuICAgU2lnbmF0dXJlcyBmb3IgdGhlIHRhZyBsb2FkZXIuIEFsbCBwYXJhbXMgYXJlIG9wdGlvbmFsIGluIGFueSBjb21iaW5hdGlvbixcbiAgIGJ1dCBtdXN0IGJlIGluIG9yZGVyOlxuICAgICAgdGFnKFxuICAgICAgICAgID9uYW1lU3BhY2U/OiBzdHJpbmcsICAvLyBhYnNlbnQgbmFtZVNwYWNlIGltcGxpZXMgSFRNTFxuICAgICAgICAgID90YWdzPzogc3RyaW5nW10sICAgICAvLyBhYnNlbnQgdGFncyBkZWZhdWx0cyB0byBhbGwgY29tbW9uIEhUTUwgdGFnc1xuICAgICAgICAgID9jb21tb25Qcm9wZXJ0aWVzPzogQ29tbW9uUHJvcGVydGllc0NvbnN0cmFpbnQgLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyB7fT4odGFnczogVGFnc1tdLCBvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLFwiYWJiclwiLFwiYWRkcmVzc1wiLFwiYXJlYVwiLFwiYXJ0aWNsZVwiLFwiYXNpZGVcIixcImF1ZGlvXCIsXCJiXCIsXCJiYXNlXCIsXCJiZGlcIixcImJkb1wiLFwiYmxvY2txdW90ZVwiLFwiYm9keVwiLFwiYnJcIixcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFwiY2FwdGlvblwiLFwiY2l0ZVwiLFwiY29kZVwiLFwiY29sXCIsXCJjb2xncm91cFwiLFwiZGF0YVwiLFwiZGF0YWxpc3RcIixcImRkXCIsXCJkZWxcIixcImRldGFpbHNcIixcImRmblwiLFwiZGlhbG9nXCIsXCJkaXZcIixcbiAgXCJkbFwiLFwiZHRcIixcImVtXCIsXCJlbWJlZFwiLFwiZmllbGRzZXRcIixcImZpZ2NhcHRpb25cIixcImZpZ3VyZVwiLFwiZm9vdGVyXCIsXCJmb3JtXCIsXCJoMVwiLFwiaDJcIixcImgzXCIsXCJoNFwiLFwiaDVcIixcImg2XCIsXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXCJoZ3JvdXBcIixcImhyXCIsXCJodG1sXCIsXCJpXCIsXCJpZnJhbWVcIixcImltZ1wiLFwiaW5wdXRcIixcImluc1wiLFwia2JkXCIsXCJsYWJlbFwiLFwibGVnZW5kXCIsXCJsaVwiLFwibGlua1wiLFwibWFpblwiLFwibWFwXCIsXG4gIFwibWFya1wiLFwibWVudVwiLFwibWV0YVwiLFwibWV0ZXJcIixcIm5hdlwiLFwibm9zY3JpcHRcIixcIm9iamVjdFwiLFwib2xcIixcIm9wdGdyb3VwXCIsXCJvcHRpb25cIixcIm91dHB1dFwiLFwicFwiLFwicGljdHVyZVwiLFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcInFcIixcInJwXCIsXCJydFwiLFwicnVieVwiLFwic1wiLFwic2FtcFwiLFwic2NyaXB0XCIsXCJzZWFyY2hcIixcInNlY3Rpb25cIixcInNlbGVjdFwiLFwic2xvdFwiLFwic21hbGxcIixcInNvdXJjZVwiLFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFwic3R5bGVcIixcInN1YlwiLFwic3VtbWFyeVwiLFwic3VwXCIsXCJ0YWJsZVwiLFwidGJvZHlcIixcInRkXCIsXCJ0ZW1wbGF0ZVwiLFwidGV4dGFyZWFcIixcInRmb290XCIsXCJ0aFwiLFwidGhlYWRcIixcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFwidHJcIixcInRyYWNrXCIsXCJ1XCIsXCJ1bFwiLFwidmFyXCIsXCJ2aWRlb1wiLFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IGVsZW1lbnRQcm90eXBlID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoe1xuICBnZXQgaWRzKCkge1xuICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gIH0sXG4gIHNldCBpZHModjogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICB9LFxuICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gIH1cbn0gYXMgUG9FbGVtZW50TWV0aG9kcyAmIFRoaXNUeXBlPEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzPik7XG5cbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXMtXCI7XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgfHwgeCA9PT0gbnVsbFxuICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiB4ICYmIHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG4vKiB0YWcgKi9cbmNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IHJlbW92ZWROb2RlcyA9IG11dGF0aW9uVHJhY2tlcihkb2N1bWVudCwncmVtb3ZlZE5vZGVzJyk7XG5cbiAgY29uc3QgY29tbW9uUHJvcGVydGllcyA9IG9wdGlvbnM/LmNvbW1vblByb3BlcnRpZXM7XG4gIC8qIE5vdGU6IHdlIHVzZSBwcm9wZXJ0eSBkZWZpbnRpb24gKGFuZCBub3Qgb2JqZWN0IHNwcmVhZCkgc28gZ2V0dGVycyAobGlrZSBgaWRzYClcbiAgICBhcmUgbm90IGV2YWx1YXRlZCB1bnRpbCBjYWxsZWQgKi9cbiAgY29uc3QgdGFnUHJvdG90eXBlcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbCxcbiAgICBlbGVtZW50UHJvdHlwZVxuICApO1xuXG4gIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gIC8vIHRvIGNvcHkgYSBnZXR0ZXIvc2V0dGVyIHBhaXIgZnJvbSBhbm90aGVyIG9iamVjdFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywgJ2F0dHJpYnV0ZXMnLCB7XG4gICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwnYXR0cmlidXRlcycpLFxuICAgIHNldCh0aGlzOiBFbGVtZW50LCBhOiBvYmplY3QpIHtcbiAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBjb25zdCBzdGVwID0gKCk9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oZXgpKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pIHtcbiAgICBjb25zdCBhcHBlbmRlZDogTm9kZVtdID0gW107XG4gICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGM6IENoaWxkVGFncyk6IHZvaWQge1xuICAgICAgaWYgKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgY29uc3QgZzogQ2hpbGROb2RlID0gRG9tUHJvbWlzZUNvbnRhaW5lcigpO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGcpO1xuICAgICAgICBjLnRoZW4ociA9PiBnLnJlcGxhY2VXaXRoKC4uLm5vZGVzKHIpKSxcbiAgICAgICAgICAoeDphbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybih4LGxvZ05vZGUoZykpO1xuICAgICAgICAgICAgZy5yZXBsYWNlV2l0aChEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiB4fSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgaGF2ZSBhbiBpbnRlcmVzdGluZyBjYXNlIGhlcmUgd2hlcmUgYW4gaXRlcmFibGUgU3RyaW5nIGlzIGFuIG9iamVjdCB3aXRoIGJvdGggU3ltYm9sLml0ZXJhdG9yXG4gICAgICAvLyAoaW5oZXJpdGVkIGZyb20gdGhlIFN0cmluZyBwcm90b3R5cGUpIGFuZCBTeW1ib2wuYXN5bmNJdGVyYXRvciAoYXMgaXQncyBiZWVuIGF1Z21lbnRlZCBieSBib3hlZCgpKVxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXNlcyBsaWtlIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdCwgYXJyYXksIGV0Yy4sIG5vdCB0aGUgZnVrbnkgb25lc1xuICAgICAgLy8gSXQgdXNlZCB0byBiZSBhZnRlciB0aGUgaXNBc3luY0l0ZXIoKSB0ZXN0LCBidXQgYSBub24tQXN5bmNJdGVyYXRvciAqbWF5KiBhbHNvIGJlIGEgc3luYyBpdGVyYWJsZVxuICAgICAgLy8gRm9yIG5vdywgd2UgZXhjbHVkZSAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgaW4gdGhpcyBjYXNlLlxuICAgICAgaWYgKGMgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBjICYmICEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgJiYgY1tTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBjKSBjaGlsZHJlbihkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBc3luY0l0ZXI8Q2hpbGRUYWdzPihjKSkge1xuICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCBkcG0gPSAodW5ib3hlZCA9PT0gdW5kZWZpbmVkIHx8IHVuYm94ZWQgPT09IGMpID8gW0RvbVByb21pc2VDb250YWluZXIoKV0gOiBub2Rlcyh1bmJveGVkIGFzIENoaWxkVGFncylcblxuICAgICAgICBsZXQgdCA9IGRwbS5sZW5ndGggPyBkcG0gOiBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYXBwZW5kZWQucHVzaCguLi50KTtcbiAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IERFQlVHICYmIG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgbiA9IHQuZmlsdGVyKG4gPT4gQm9vbGVhbihuPy5wYXJlbnROb2RlKSkgYXMgQ2hpbGROb2RlW107XG4gICAgICAgICAgaWYgKG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0ID0gW0R5YW1pY0VsZW1lbnRFcnJvcih7ZXJyb3I6IGVycm9yVmFsdWV9KV07XG4gICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKC4uLnQpO1xuICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybiggXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgY3JlYXRlZEJ5LCB0Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlczogSXRlcmF0b3JSZXN1bHQ8Q2hpbGRUYWdzPikgPT4ge1xuICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gQ2hpbGROb2RlW10sIHNpbmNlIHdlIHRlc3RlZCAucGFyZW50Tm9kZVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gdC5maWx0ZXIoZSA9PiBlPy5wYXJlbnROb2RlICYmIGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHQgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAobW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoIHx8IHQuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMoZSkpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgICAgICB0ID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50OiBcIiArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgbm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLGNyZWF0ZWRCeSwgdC5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICBpZiAoIXQubGVuZ3RoKSB0LnB1c2goRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgKG5bMF0gYXMgQ2hpbGROb2RlKS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICB9KShjKTtcbiAgICByZXR1cm4gYXBwZW5kZWQ7XG4gIH1cblxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveChhOiB1bmtub3duKTogdW5rbm93biB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KChhLGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2RlcyhiYXNlKSB8fCAoIW5vdFlldE1vdW50ZWQgJiYgIW1vdW50ZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBFbGVtZW50IGRvZXMgbm90IGV4aXN0IGluIGRvY3VtZW50IHdoZW4gc2V0dGluZyBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIHRvOlxcbiR7bG9nTm9kZShiYXNlKX1gKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW91bnRlZCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuXFxuRWxlbWVudCBjb250YWluczogJHtsb2dOb2RlKGJhc2UpfVxcbiR7Y3JlYXRlZEJ5fWApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCBcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGNyZWF0ZWRCeSwgbG9nTm9kZShiYXNlKSk7XG4gICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgIGJhc2UuYXBwZW5kQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1bmJveGVkID0gdmFsdWUudmFsdWVPZigpO1xuICAgICAgICAgIGlmICh1bmJveGVkICE9PSB1bmRlZmluZWQgJiYgdW5ib3hlZCAhPT0gdmFsdWUgJiYgIWlzQXN5bmNJdGVyKHVuYm94ZWQpKVxuICAgICAgICAgICAgdXBkYXRlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB1bmJveGVkIH0pO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlOiBhbnksIGs6IHN0cmluZykge1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzXCIsIGssIGxvZ05vZGUodmFsdWUpKTtcbiAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZFtrXSA9IGNvcHk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspPy5zZXQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6e1xuICAgIGRlYnVnZ2VyPzogdW5rbm93bjtcbiAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gICAgW2s6IHN0cmluZ106IHVua25vd247XG4gIH0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG4gIGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICAgIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICAgIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gICAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG4gIH1cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LF9vdmVycmlkZXMsaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikrKGlkQ291bnQrKykudG9TdHJpbmcoMzYpK01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGxldCBzdGF0aWNFeHRlbnNpb25zOiBPdmVycmlkZXMgPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAvKiBcIlN0YXRpY2FsbHlcIiBjcmVhdGUgYW55IHN0eWxlcyByZXF1aXJlZCBieSB0aGlzIHdpZGdldCAqL1xuICAgIGlmIChzdGF0aWNFeHRlbnNpb25zLnN0eWxlcykge1xuICAgICAgcG9TdHlsZUVsdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChwb1N0eWxlRWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKSA7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrICB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGZ1bmN0aW9uIGlzQW5jZXN0cmFsKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGQ6IHN0cmluZykge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYgZCBpbiBmLmRlZmluaXRpb24uZGVjbGFyZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLmRlY2xhcmUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkuZmlsdGVyKGQgPT4gKGQgaW4gZSkgfHwgaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLGQpKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIGNvbnN0IHJlQXNzaWduID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICAgIHJlQXNzaWduLmFkZChrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGUhW2sgYXMga2V5b2YgdHlwZW9mIHRhZ0RlZmluaXRpb24uaXRlcmFibGVdKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGUuYXBwZW5kKC4uLm5vZGVzKGNoaWxkcmVuKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlLCB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgICAgLy8gYnkgYXNzaWduUHJvcHMgZnJvbSBhIGZ1dHVyZVxuICAgICAgICBjb25zdCBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlcyA9IHt9O1xuICAgICAgICBsZXQgaGFzSW5pdGlhbFZhbHVlcyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgaWYgKGJhc2UuaXRlcmFibGUpIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhiYXNlLml0ZXJhYmxlKSkge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgc2VsZi1hc3NpZ24gaXRlcmFibGVzIHRoYXQgaGF2ZSB0aGVtc2VsdmVzIGJlZW4gYXNzaWduZWQgd2l0aCBmdXR1cmVzXG4gICAgICAgICAgICBjb25zdCBhdHRyRXhpc3RzID0gIW5vQXR0cnMgJiYgayBpbiBhdHRycztcbiAgICAgICAgICAgIGlmICgocmVBc3NpZ24uaGFzKGspICYmIGF0dHJFeGlzdHMpIHx8ICEoYXR0ckV4aXN0cyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV0/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlc1trXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGhhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNJbml0aWFsVmFsdWVzKVxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oZSwgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kVGFnOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICBleHRlbmRlZCxcbiAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUgfHwge30pLCAuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLml0ZXJhYmxlIHx8IHt9KV07XG4gICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gXG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCBmdWxsUHJvdG8gPSB7fTtcbiAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4pIHtcbiAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgd2Fsa1Byb3RvKGNyZWF0b3Iuc3VwZXIpO1xuXG4gICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgIH1cbiAgICB9KSh0aGlzKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5vdmVycmlkZSk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcblxuICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgIDogdW5pcXVlVGFnSUQ7XG4gICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/IChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdID8/ICcnKSA6ICcnO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywnLScpICsgY2FsbFNpdGUrXCI+XCJcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3QgZXh0cmFVbmtub3duUHJvcHMgPSBPYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zKS5maWx0ZXIoayA9PiAhWydzdHlsZXMnLCAnaWRzJywgJ2NvbnN0cnVjdGVkJywgJ2RlY2xhcmUnLCAnb3ZlcnJpZGUnLCAnaXRlcmFibGUnXS5pbmNsdWRlcyhrKSk7XG4gICAgICBpZiAoZXh0cmFVbmtub3duUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2V4dGVuZFRhZy5uYW1lfSBkZWZpbmVzIGV4dHJhbmVvdXMga2V5cyAnJHtleHRyYVVua25vd25Qcm9wc30nLCB3aGljaCBhcmUgdW5rbm93bmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kVGFnO1xuICB9XG5cbiAgLy8gQHRzLWlnbm9yZVxuICBjb25zdCBiYXNlVGFnQ3JlYXRvcnM6IENyZWF0ZUVsZW1lbnQgJiB7XG4gICAgW0sgaW4ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwXT86IFRhZ0NyZWF0b3I8USAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gJiB7XG4gICAgW246IHN0cmluZ106IFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ID0ge1xuICAgIGNyZWF0ZUVsZW1lbnQoXG4gICAgICBuYW1lOiBUYWdDcmVhdG9yRnVuY3Rpb248RWxlbWVudD4gfCBOb2RlIHwga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLFxuICAgICAgYXR0cnM6IGFueSxcbiAgICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IE5vZGUge1xuICAgICAgICByZXR1cm4gKG5hbWUgPT09IGJhc2VUYWdDcmVhdG9ycy5jcmVhdGVFbGVtZW50ID8gbm9kZXMoLi4uY2hpbGRyZW4pXG4gICAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICAgIDogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIG5hbWUgaW4gYmFzZVRhZ0NyZWF0b3JzID9cbiAgICAgICAgICAvLyBAdHMtaWdub3JlOiBFeHByZXNzaW9uIHByb2R1Y2VzIGEgdW5pb24gdHlwZSB0aGF0IGlzIHRvbyBjb21wbGV4IHRvIHJlcHJlc2VudC50cygyNTkwKVxuICAgICAgICAgIGJhc2VUYWdDcmVhdG9yc1tuYW1lXShhdHRycywgY2hpbGRyZW4pXG4gICAgICAgICAgOiBuYW1lIGluc3RhbmNlb2YgTm9kZSA/IG5hbWVcbiAgICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpfSkpIGFzIE5vZGVcbiAgICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZzxLIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPihrOiBLKTogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZzxFIGV4dGVuZHMgRWxlbWVudD4oazogc3RyaW5nKTogVGFnQ3JlYXRvcjxRICYgRSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWcoazogc3RyaW5nKTogVGFnQ3JlYXRvcjxRICYgTmFtZXNwYWNlZEVsZW1lbnRCYXNlICYgUG9FbGVtZW50TWV0aG9kcz4ge1xuICAgIGlmIChiYXNlVGFnQ3JlYXRvcnNba10pXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdO1xuXG4gICAgY29uc3QgdGFnQ3JlYXRvciA9IChhdHRyczogUSAmIFBvRWxlbWVudE1ldGhvZHMgJiBQYXJ0aWFsPHtcbiAgICAgIGRlYnVnZ2VyPzogYW55O1xuICAgICAgZG9jdW1lbnQ/OiBEb2N1bWVudDtcbiAgICB9PiB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBsZXQgZG9jID0gZG9jdW1lbnQ7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cnMuZG9jdW1lbnQpIHtcbiAgICAgICAgICBkb2MgPSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgICBkZWxldGUgYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgZWxlbWVudFxuICAgICAgICBjb25zdCBlID0gbmFtZVNwYWNlXG4gICAgICAgICAgPyBkb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IGRvYy5jcmVhdGVFbGVtZW50KGspO1xuICAgICAgICBlLmNvbnN0cnVjdG9yID0gdGFnQ3JlYXRvcjtcblxuICAgICAgICBkZWVwRGVmaW5lKGUsIHRhZ1Byb3RvdHlwZXMpO1xuICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGFueSBjaGlsZHJlblxuICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyguLi5jaGlsZHJlbikpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmNsdWRpbmdFeHRlbmRlciA9IDxUYWdDcmVhdG9yPEVsZW1lbnQ+Pjx1bmtub3duPk9iamVjdC5hc3NpZ24odGFnQ3JlYXRvciwge1xuICAgICAgc3VwZXI6ICgpPT57IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbmZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIoKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KERFQlVHIFxuICAgID8gbmV3IEVycm9yKFwicHJvbWlzZVwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJykgfHwgXCJwcm9taXNlXCIgXG4gICAgOiBcInByb21pc2VcIilcbn1cblxuZnVuY3Rpb24gRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3IgfTp7IGVycm9yOiBFcnJvciB8IEl0ZXJhdG9yUmVzdWx0PEVycm9yPn0pIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnRvU3RyaW5nKCkgOiAnRXJyb3I6XFxuJytKU09OLnN0cmluZ2lmeShlcnJvcixudWxsLDIpKTtcbn1cblxuZXhwb3J0IGxldCBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NID0gZnVuY3Rpb24gKCkge30gLy8gT25seSBjcmVhdGUgdGhlIG9ic2VydmVyIG9uY2VcbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICBtLnJlbW92ZWROb2Rlcy5mb3JFYWNoKFxuICAgICAgICAgIHJlbW92ZWQgPT4gcmVtb3ZlZCAmJiByZW1vdmVkIGluc3RhbmNlb2YgRWxlbWVudCAmJlxuICAgICAgICAgICAgWy4uLnJlbW92ZWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLCByZW1vdmVkXS5maWx0ZXIoZWx0ID0+ICFlbHQuaXNDb25uZWN0ZWQpLmZvckVhY2goXG4gICAgICAgICAgICAgIGVsdCA9PiB7XG4gICAgICAgICAgICAgICAgJ29uUmVtb3ZlZEZyb21ET00nIGluIGVsdCAmJiB0eXBlb2YgZWx0Lm9uUmVtb3ZlZEZyb21ET00gPT09ICdmdW5jdGlvbicgJiYgZWx0Lm9uUmVtb3ZlZEZyb21ET00oKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbn1cblxuLyogRE9NIG5vZGUgcmVtb3ZhbCBsb2dpYyAqL1xudHlwZSBQaWNrQnlUeXBlPFQsIFZhbHVlPiA9IHtcbiAgW1AgaW4ga2V5b2YgVCBhcyBUW1BdIGV4dGVuZHMgVmFsdWUgfCB1bmRlZmluZWQgPyBQIDogbmV2ZXJdOiBUW1BdXG59XG5mdW5jdGlvbiBtdXRhdGlvblRyYWNrZXIocm9vdDogTm9kZSwgdHJhY2s6IGtleW9mIFBpY2tCeVR5cGU8TXV0YXRpb25SZWNvcmQsIE5vZGVMaXN0Pil7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCl7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAvLyBJbiBjYXNlIGl0J3MgYmUgcmUtYWRkZWQvbW92ZWRcbiAgICAgIGlmICgodHJhY2sgPT09ICdhZGRlZE5vZGVzJykgPT09IG5vZGUuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgd2Fsayhub2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICB0cmFja2VkLmFkZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgd2FsayhtW3RyYWNrXSlcbiAgICAgIH1cbiAgICB9KTtcbiAgfSkub2JzZXJ2ZShyb290LCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZTogTm9kZSkge1xuICAgIHJldHVybiB0cmFja2VkLmhhcyhub2RlKTtcbiAgfVxufVxuXG5jb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50SWRNYXAobm9kZT86IEVsZW1lbnQgfCBEb2N1bWVudCwgaWRzPzogUmVjb3JkPHN0cmluZywgRWxlbWVudD4pIHtcbiAgbm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG4gIGlkcyA9IGlkcyB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChlbHQpIHtcbiAgICAgIGlmIChlbHQuaWQpIHtcbiAgICAgICAgaWYgKCFpZHMhW2VsdC5pZF0pXG4gICAgICAgICAgaWRzIVtlbHQuaWRdID0gZWx0O1xuICAgICAgICBlbHNlIGlmIChERUJVRykge1xuICAgICAgICAgIGlmICghd2FybmVkLmhhcyhlbHQuaWQpKSB7XG4gICAgICAgICAgICB3YXJuZWQuYWRkKGVsdC5pZClcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIlNoYWRvd2VkIG11bHRpcGxlIGVsZW1lbnQgSURzXCIsIGVsdC5pZCAvKiwgZWx0LCBpZHMhW2VsdC5pZF0qLyk7XG4gICAgICAgICAgfVxuICAgICAgICB9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QUEsRUFBTztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBVTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBSTtBQUFBLEVBQU87QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQWE7QUFBQSxFQUFPO0FBQUEsRUFBSztBQUFBLEVBQ3RHO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQU07QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFBLEVBQVc7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUztBQUFBLEVBQ3hHO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQVc7QUFBQSxFQUFhO0FBQUEsRUFBUztBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDdEc7QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFPO0FBQUEsRUFBSTtBQUFBLEVBQVM7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUN6RztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBSTtBQUFBLEVBQVU7QUFBQSxFQUN2RztBQUFBLEVBQVc7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFPO0FBQUEsRUFBSTtBQUFBLEVBQU87QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFDeEc7QUFBQSxFQUFTO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFVO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVc7QUFBQSxFQUFXO0FBQUEsRUFBUTtBQUFBLEVBQUs7QUFBQSxFQUFRO0FBQUEsRUFDdkc7QUFBQSxFQUFRO0FBQUEsRUFBSztBQUFBLEVBQVE7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQU07QUFBQSxFQUFRO0FBQzlDO0FBRUEsSUFBTSxpQkFBaUIsT0FBTywwQkFBMEI7QUFBQSxFQUN0RCxJQUFJLE1BQU07QUFDUixXQUFPLGdCQUFnQixJQUFJO0FBQUEsRUFDN0I7QUFBQSxFQUNBLElBQUksSUFBSSxHQUFRO0FBQ2QsVUFBTSxJQUFJLE1BQU0sdUJBQXVCLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdkQ7QUFBQSxFQUNBLE1BQU0sWUFBYSxNQUFNO0FBQ3ZCLFdBQU8sS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLEVBQzNCO0FBQ0YsQ0FBNEQ7QUFFNUQsSUFBTSxhQUFhLFNBQVMsY0FBYyxPQUFPO0FBQ2pELFdBQVcsS0FBSztBQUVoQixTQUFTLFdBQVcsR0FBd0I7QUFDMUMsU0FBTyxPQUFPLE1BQU0sWUFDZixPQUFPLE1BQU0sWUFDYixPQUFPLE1BQU0sYUFDYixhQUFhLFFBQ2IsYUFBYSxZQUNiLGFBQWEsa0JBQ2IsTUFBTSxRQUNOLE1BQU0sVUFFTixNQUFNLFFBQVEsQ0FBQyxLQUNmLGNBQWMsQ0FBQyxLQUNmLFlBQVksQ0FBQyxLQUNaLE9BQU8sTUFBTSxZQUFZLE9BQU8sWUFBWSxLQUFLLE9BQU8sRUFBRSxPQUFPLFFBQVEsTUFBTTtBQUN2RjtBQUdBLElBQU0sa0JBQWtCLE9BQU8sV0FBVztBQUVuQyxJQUFNLE1BQWlCLFNBSzVCLElBQ0EsSUFDQSxJQUN5QztBQVd6QyxRQUFNLENBQUMsV0FBVyxNQUFNLE9BQU8sSUFBSyxPQUFPLE9BQU8sWUFBYSxPQUFPLE9BQ2xFLENBQUMsSUFBSSxJQUFjLEVBQTJCLElBQzlDLE1BQU0sUUFBUSxFQUFFLElBQ2QsQ0FBQyxNQUFNLElBQWMsRUFBMkIsSUFDaEQsQ0FBQyxNQUFNLGNBQWMsRUFBMkI7QUFFdEQsUUFBTSxlQUFlLGdCQUFnQixVQUFTLGNBQWM7QUFFNUQsUUFBTSxtQkFBbUIsU0FBUztBQUdsQyxRQUFNLGdCQUFnQixPQUFPO0FBQUEsSUFDM0I7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUlBLFNBQU8sZUFBZSxlQUFlLGNBQWM7QUFBQSxJQUNqRCxHQUFHLE9BQU8seUJBQXlCLFFBQVEsV0FBVSxZQUFZO0FBQUEsSUFDakUsSUFBbUIsR0FBVztBQUM1QixVQUFJLFlBQVksQ0FBQyxHQUFHO0FBQ2xCLGNBQU0sS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksRUFBRSxPQUFPLGFBQWEsRUFBRTtBQUM1RCxjQUFNLE9BQU8sTUFBSyxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQzFCLENBQUMsRUFBRSxNQUFNLE1BQU0sTUFBTTtBQUFFLHdCQUFZLE1BQU0sS0FBSztBQUFHLG9CQUFRLEtBQUs7QUFBQSxVQUFFO0FBQUEsVUFDaEUsUUFBTSxTQUFRLEtBQUssRUFBRTtBQUFBLFFBQUM7QUFDeEIsYUFBSztBQUFBLE1BQ1AsTUFDSyxhQUFZLE1BQU0sQ0FBQztBQUFBLElBQzFCO0FBQUEsRUFDRixDQUFDO0FBRUQsTUFBSTtBQUNGLGVBQVcsZUFBZSxnQkFBZ0I7QUFFNUMsV0FBUyxTQUFTLEdBQWdCO0FBQ2hDLFVBQU0sV0FBbUIsQ0FBQztBQUMxQixLQUFDLFNBQVMsU0FBU0MsSUFBb0I7QUFDckMsVUFBSUEsT0FBTSxVQUFhQSxPQUFNLFFBQVFBLE9BQU07QUFDekM7QUFDRixVQUFJLGNBQWNBLEVBQUMsR0FBRztBQUNwQixjQUFNLElBQWUsb0JBQW9CO0FBQ3pDLGlCQUFTLEtBQUssQ0FBQztBQUNmLFFBQUFBLEdBQUU7QUFBQSxVQUFLLE9BQUssRUFBRSxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFBQSxVQUNuQyxDQUFDLE1BQVU7QUFDVCxxQkFBUSxLQUFLLEdBQUUsUUFBUSxDQUFDLENBQUM7QUFDekIsY0FBRSxZQUFZLG1CQUFtQixFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7QUFBQSxVQUM5QztBQUFBLFFBQ0Y7QUFDQTtBQUFBLE1BQ0Y7QUFDQSxVQUFJQSxjQUFhLE1BQU07QUFDckIsaUJBQVMsS0FBS0EsRUFBQztBQUNmO0FBQUEsTUFDRjtBQU9BLFVBQUlBLE1BQUssT0FBT0EsT0FBTSxZQUFZLE9BQU8sWUFBWUEsTUFBSyxFQUFFLE9BQU8saUJBQWlCQSxPQUFNQSxHQUFFLE9BQU8sUUFBUSxHQUFHO0FBQzVHLG1CQUFXLEtBQUtBLEdBQUcsVUFBUyxDQUFDO0FBQzdCO0FBQUEsTUFDRjtBQUVBLFVBQUksWUFBdUJBLEVBQUMsR0FBRztBQUM3QixjQUFNLGlCQUFpQixRQUFTLE9BQU8sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLFlBQVksYUFBYSxJQUFLO0FBQ2hHLGNBQU0sS0FBSyxnQkFBZ0JBLEVBQUMsSUFBSUEsS0FBSUEsR0FBRSxPQUFPLGFBQWEsRUFBRTtBQUU1RCxjQUFNLFVBQVVBLEdBQUUsUUFBUTtBQUMxQixjQUFNLE1BQU8sWUFBWSxVQUFhLFlBQVlBLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLE1BQU0sT0FBb0I7QUFFM0csWUFBSSxJQUFJLElBQUksU0FBUyxNQUFNLENBQUMsb0JBQW9CLENBQUM7QUFDakQsaUJBQVMsS0FBSyxHQUFHLENBQUM7QUFDbEIsWUFBSSxnQkFBZ0I7QUFFcEIsWUFBSSxZQUFZLEtBQUssSUFBSSxJQUFJO0FBQzdCLGNBQU0sWUFBWSxTQUFTLElBQUksTUFBTSxZQUFZLEVBQUU7QUFFbkQsY0FBTSxRQUFRLENBQUMsZUFBb0I7QUFDakMsZ0JBQU0sSUFBSSxFQUFFLE9BQU8sQ0FBQUMsT0FBSyxRQUFRQSxJQUFHLFVBQVUsQ0FBQztBQUM5QyxjQUFJLEVBQUUsUUFBUTtBQUNaLGdCQUFJLENBQUMsbUJBQW1CLEVBQUMsT0FBTyxXQUFVLENBQUMsQ0FBQztBQUM1QyxjQUFFLENBQUMsRUFBRSxZQUFZLEdBQUcsQ0FBQztBQUNyQixjQUFFLE1BQU0sQ0FBQyxFQUFFLFFBQVEsT0FBSyxHQUFHLFdBQVksWUFBWSxDQUFDLENBQUM7QUFBQSxVQUN2RCxNQUNLLFVBQVEsS0FBTSxzQkFBc0IsWUFBWSxXQUFXLEVBQUUsSUFBSSxPQUFPLENBQUM7QUFDOUUsY0FBSSxDQUFDO0FBQ0wsYUFBRyxTQUFTLEtBQUs7QUFBQSxRQUNuQjtBQUVBLGNBQU0sU0FBUyxDQUFDLE9BQWtDO0FBQ2hELGNBQUksQ0FBQyxHQUFHLE1BQU07QUFDWixnQkFBSTtBQUVGLG9CQUFNLFVBQVUsRUFBRSxPQUFPLE9BQUssR0FBRyxjQUFjLEVBQUUsV0FBVztBQUM1RCxvQkFBTSxJQUFJLGdCQUFnQixJQUFJO0FBQzlCLGtCQUFJLFFBQVEsT0FBUSxpQkFBZ0I7QUFFcEMsa0JBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLE9BQUssYUFBYSxDQUFDLENBQUMsR0FBRztBQUU5QyxvQkFBSSxDQUFDO0FBQ0wsc0JBQU0sTUFBTSxxREFBcUQ7QUFDakUsbUJBQUcsU0FBUyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQzFCO0FBQUEsY0FDRjtBQUVBLGtCQUFJLFNBQVMsaUJBQWlCLGFBQWEsWUFBWSxLQUFLLElBQUksR0FBRztBQUNqRSw0QkFBWSxPQUFPO0FBQ25CLHlCQUFRLEtBQUssb0ZBQW1GLFdBQVcsRUFBRSxJQUFJLE9BQU8sQ0FBQztBQUFBLGNBQzNIO0FBQ0Esa0JBQUksTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFjO0FBRXRDLGtCQUFJLENBQUMsRUFBRSxPQUFRLEdBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUMzQyxjQUFDLEVBQUUsQ0FBQyxFQUFnQixZQUFZLEdBQUcsQ0FBQztBQUNwQyxnQkFBRSxNQUFNLENBQUMsRUFBRSxRQUFRLE9BQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxZQUFZLENBQUMsQ0FBQztBQUN0RSxpQkFBRyxLQUFLLEVBQUUsS0FBSyxNQUFNLEVBQUUsTUFBTSxLQUFLO0FBQUEsWUFDcEMsU0FBUyxJQUFJO0FBRVgsa0JBQUksQ0FBQztBQUNMLGlCQUFHLFNBQVMsRUFBRTtBQUFBLFlBQ2hCO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFDQSxXQUFHLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFDbEM7QUFBQSxNQUNGO0FBQ0EsZUFBUyxLQUFLLFNBQVMsZUFBZUQsR0FBRSxTQUFTLENBQUMsQ0FBQztBQUFBLElBQ3JELEdBQUcsQ0FBQztBQUNKLFdBQU87QUFBQSxFQUNUO0FBRUEsTUFBSSxDQUFDLFdBQVc7QUFDZCxXQUFPLE9BQU8sS0FBSTtBQUFBLE1BQ2hCO0FBQUE7QUFBQSxNQUNBO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUdBLFFBQU0sdUJBQXVCLE9BQU8sZUFBZSxDQUFDLENBQUM7QUFFckQsV0FBUyxXQUFXLEdBQTBDLEdBQVEsYUFBMEI7QUFDOUYsUUFBSSxNQUFNLFFBQVEsTUFBTSxVQUFhLE9BQU8sTUFBTSxZQUFZLE1BQU07QUFDbEU7QUFFRixlQUFXLENBQUMsR0FBRyxPQUFPLEtBQUssT0FBTyxRQUFRLE9BQU8sMEJBQTBCLENBQUMsQ0FBQyxHQUFHO0FBQzlFLFVBQUk7QUFDRixZQUFJLFdBQVcsU0FBUztBQUN0QixnQkFBTSxRQUFRLFFBQVE7QUFFdEIsY0FBSSxTQUFTLFlBQXFCLEtBQUssR0FBRztBQUN4QyxtQkFBTyxlQUFlLEdBQUcsR0FBRyxPQUFPO0FBQUEsVUFDckMsT0FBTztBQUdMLGdCQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxjQUFjLEtBQUssR0FBRztBQUMvRCxrQkFBSSxFQUFFLEtBQUssSUFBSTtBQU1iLG9CQUFJLGFBQWE7QUFDZixzQkFBSSxPQUFPLGVBQWUsS0FBSyxNQUFNLHdCQUF3QixDQUFDLE9BQU8sZUFBZSxLQUFLLEdBQUc7QUFFMUYsK0JBQVcsUUFBUSxRQUFRLENBQUMsR0FBRyxLQUFLO0FBQUEsa0JBQ3RDLFdBQVcsTUFBTSxRQUFRLEtBQUssR0FBRztBQUUvQiwrQkFBVyxRQUFRLFFBQVEsQ0FBQyxHQUFHLEtBQUs7QUFBQSxrQkFDdEMsT0FBTztBQUVMLDZCQUFRLEtBQUsscUJBQXFCLENBQUMsNkdBQTZHLEdBQUcsS0FBSztBQUFBLGtCQUMxSjtBQUFBLGdCQUNGO0FBQ0EsdUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLGNBQ3JDLE9BQU87QUFDTCxvQkFBSSxpQkFBaUIsTUFBTTtBQUN6QiwyQkFBUSxLQUFLLGdLQUFnSyxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQzlMLG9CQUFFLENBQUMsSUFBSTtBQUFBLGdCQUNULE9BQU87QUFDTCxzQkFBSSxFQUFFLENBQUMsTUFBTSxPQUFPO0FBSWxCLHdCQUFJLE1BQU0sUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFdBQVcsTUFBTSxRQUFRO0FBQ3ZELDBCQUFJLE1BQU0sZ0JBQWdCLFVBQVUsTUFBTSxnQkFBZ0IsT0FBTztBQUMvRCxtQ0FBVyxFQUFFLENBQUMsSUFBSSxJQUFLLE1BQU0sZUFBYyxLQUFLO0FBQUEsc0JBQ2xELE9BQU87QUFFTCwwQkFBRSxDQUFDLElBQUk7QUFBQSxzQkFDVDtBQUFBLG9CQUNGLE9BQU87QUFFTCxpQ0FBVyxFQUFFLENBQUMsR0FBRyxLQUFLO0FBQUEsb0JBQ3hCO0FBQUEsa0JBQ0Y7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFBQSxZQUNGLE9BQU87QUFFTCxrQkFBSSxFQUFFLENBQUMsTUFBTTtBQUNYLGtCQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFBQSxZQUNkO0FBQUEsVUFDRjtBQUFBLFFBQ0YsT0FBTztBQUVMLGlCQUFPLGVBQWUsR0FBRyxHQUFHLE9BQU87QUFBQSxRQUNyQztBQUFBLE1BQ0YsU0FBUyxJQUFhO0FBQ3BCLGlCQUFRLEtBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUU7QUFDdkMsY0FBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFdBQVMsTUFBTSxHQUFxQjtBQUNsQyxVQUFNLElBQUksR0FBRyxRQUFRO0FBQ3JCLFdBQU8sTUFBTSxRQUFRLENBQUMsSUFBSSxNQUFNLFVBQVUsSUFBSSxLQUFLLEdBQUUsS0FBSyxJQUFJO0FBQUEsRUFDaEU7QUFFQSxXQUFTLFlBQVksTUFBWSxPQUE0QjtBQUUzRCxRQUFJLEVBQUUsbUJBQW1CLFFBQVE7QUFDL0IsT0FBQyxTQUFTLE9BQU8sR0FBUSxHQUFjO0FBQ3JDLFlBQUksTUFBTSxRQUFRLE1BQU0sVUFBYSxPQUFPLE1BQU07QUFDaEQ7QUFFRixjQUFNLGdCQUFnQixPQUFPLFFBQVEsT0FBTywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3hFLFlBQUksQ0FBQyxNQUFNLFFBQVEsQ0FBQyxHQUFHO0FBQ3JCLHdCQUFjLEtBQUssQ0FBQyxHQUFFLE1BQU07QUFDMUIsa0JBQU0sT0FBTyxPQUFPLHlCQUF5QixHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELGdCQUFJLE1BQU07QUFDUixrQkFBSSxXQUFXLEtBQU0sUUFBTztBQUM1QixrQkFBSSxTQUFTLEtBQU0sUUFBTztBQUMxQixrQkFBSSxTQUFTLEtBQU0sUUFBTztBQUFBLFlBQzVCO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBQ0EsbUJBQVcsQ0FBQyxHQUFHLE9BQU8sS0FBSyxlQUFlO0FBQ3hDLGNBQUk7QUFDRixnQkFBSSxXQUFXLFNBQVM7QUFDdEIsb0JBQU0sUUFBUSxRQUFRO0FBQ3RCLGtCQUFJLFlBQXFCLEtBQUssR0FBRztBQUMvQiwrQkFBZSxPQUFPLENBQUM7QUFBQSxjQUN6QixXQUFXLGNBQWMsS0FBSyxHQUFHO0FBQy9CLHNCQUFNLEtBQUssT0FBSztBQUNkLHNCQUFJLEtBQUssT0FBTyxNQUFNLFVBQVU7QUFFOUIsd0JBQUksWUFBcUIsQ0FBQyxHQUFHO0FBQzNCLHFDQUFlLEdBQUcsQ0FBQztBQUFBLG9CQUNyQixPQUFPO0FBQ0wsbUNBQWEsR0FBRyxDQUFDO0FBQUEsb0JBQ25CO0FBQUEsa0JBQ0YsT0FBTztBQUNMLHdCQUFJLEVBQUUsQ0FBQyxNQUFNO0FBQ1gsd0JBQUUsQ0FBQyxJQUFJO0FBQUEsa0JBQ1g7QUFBQSxnQkFDRixHQUFHLFdBQVMsU0FBUSxJQUFJLDJCQUEyQixLQUFLLENBQUM7QUFBQSxjQUMzRCxXQUFXLENBQUMsWUFBcUIsS0FBSyxHQUFHO0FBRXZDLG9CQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxjQUFjLEtBQUs7QUFDNUQsK0JBQWEsT0FBTyxDQUFDO0FBQUEscUJBQ2xCO0FBQ0gsc0JBQUksRUFBRSxDQUFDLE1BQU07QUFDWCxzQkFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQUEsZ0JBQ2Q7QUFBQSxjQUNGO0FBQUEsWUFDRixPQUFPO0FBRUwscUJBQU8sZUFBZSxHQUFHLEdBQUcsT0FBTztBQUFBLFlBQ3JDO0FBQUEsVUFDRixTQUFTLElBQWE7QUFDcEIscUJBQVEsS0FBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRTtBQUN4QyxrQkFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBRUEsaUJBQVMsZUFBZSxPQUF3RSxHQUFXO0FBQ3pHLGdCQUFNLEtBQUssY0FBYyxLQUFLO0FBQzlCLGNBQUksZ0JBQWdCO0FBRXBCLGNBQUksWUFBWSxLQUFLLElBQUksSUFBSTtBQUM3QixnQkFBTSxZQUFZLFNBQVMsSUFBSSxNQUFNLFlBQVksRUFBRTtBQUNuRCxnQkFBTSxTQUFTLENBQUMsT0FBZ0M7QUFDOUMsZ0JBQUksQ0FBQyxHQUFHLE1BQU07QUFDWixvQkFBTUUsU0FBUSxNQUFNLEdBQUcsS0FBSztBQUM1QixrQkFBSSxPQUFPQSxXQUFVLFlBQVlBLFdBQVUsTUFBTTtBQWEvQyxzQkFBTSxXQUFXLE9BQU8seUJBQXlCLEdBQUcsQ0FBQztBQUNyRCxvQkFBSSxNQUFNLFdBQVcsQ0FBQyxVQUFVO0FBQzlCLHlCQUFPLEVBQUUsQ0FBQyxHQUFHQSxNQUFLO0FBQUE7QUFFbEIsb0JBQUUsQ0FBQyxJQUFJQTtBQUFBLGNBQ1gsT0FBTztBQUVMLG9CQUFJQSxXQUFVO0FBQ1osb0JBQUUsQ0FBQyxJQUFJQTtBQUFBLGNBQ1g7QUFDQSxvQkFBTSxVQUFVLEtBQUs7QUFFckIsa0JBQUksYUFBYSxJQUFJLEtBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFVO0FBQ3RELHlCQUFRLEtBQUssb0VBQW9FLENBQUM7QUFBQSxFQUFVLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDM0csbUJBQUcsU0FBUztBQUNaO0FBQUEsY0FDRjtBQUNBLGtCQUFJLFFBQVMsaUJBQWdCO0FBQzdCLGtCQUFJLGlCQUFpQixhQUFhLFlBQVksS0FBSyxJQUFJLEdBQUc7QUFDeEQsNEJBQVksT0FBTztBQUNuQix5QkFBUSxLQUFLLGlDQUFpQyxDQUFDO0FBQUEsb0JBQTJGLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFBSyxTQUFTLEVBQUU7QUFBQSxjQUN6SztBQUVBLGlCQUFHLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFBQSxZQUNwQztBQUFBLFVBQ0Y7QUFDQSxnQkFBTSxRQUFRLENBQUMsZUFBb0I7QUFDakMscUJBQVEsS0FBTSwyQkFBMkIsWUFBWSxHQUFHLEdBQUcsV0FBVyxRQUFRLElBQUksQ0FBQztBQUNuRixlQUFHLFNBQVMsVUFBVTtBQUN0QixpQkFBSyxZQUFZLG1CQUFtQixFQUFFLE9BQU8sV0FBVyxDQUFDLENBQUM7QUFBQSxVQUM1RDtBQUNBLGdCQUFNLFVBQVUsTUFBTSxRQUFRO0FBQzlCLGNBQUksWUFBWSxVQUFhLFlBQVksU0FBUyxDQUFDLFlBQVksT0FBTztBQUNwRSxtQkFBTyxFQUFFLE1BQU0sT0FBTyxPQUFPLFFBQVEsQ0FBQztBQUFBO0FBRXRDLGVBQUcsS0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLE1BQU0sS0FBSztBQUFBLFFBQ3RDO0FBRUEsaUJBQVMsYUFBYSxPQUFZLEdBQVc7QUFDM0MsY0FBSSxpQkFBaUIsTUFBTTtBQUN6QixxQkFBUSxLQUFLLDBMQUEwTCxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQ3hOLGNBQUUsQ0FBQyxJQUFJO0FBQUEsVUFDVCxPQUFPO0FBSUwsZ0JBQUksRUFBRSxLQUFLLE1BQU0sRUFBRSxDQUFDLE1BQU0sU0FBVSxNQUFNLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxXQUFXLE1BQU0sUUFBUztBQUN4RixrQkFBSSxNQUFNLGdCQUFnQixVQUFVLE1BQU0sZ0JBQWdCLE9BQU87QUFDL0Qsc0JBQU0sT0FBTyxJQUFLLE1BQU07QUFDeEIsdUJBQU8sTUFBTSxLQUFLO0FBQ2xCLGtCQUFFLENBQUMsSUFBSTtBQUFBLGNBRVQsT0FBTztBQUVMLGtCQUFFLENBQUMsSUFBSTtBQUFBLGNBQ1Q7QUFBQSxZQUNGLE9BQU87QUFDTCxrQkFBSSxPQUFPLHlCQUF5QixHQUFHLENBQUMsR0FBRztBQUN6QyxrQkFBRSxDQUFDLElBQUk7QUFBQTtBQUdQLHVCQUFPLEVBQUUsQ0FBQyxHQUFHLEtBQUs7QUFBQSxZQUN0QjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixHQUFHLE1BQU0sS0FBSztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQXlCQSxXQUFTLGVBQWdELEdBQVE7QUFDL0QsYUFBUyxJQUFJLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxPQUFPO0FBQzFDLFVBQUksTUFBTTtBQUNSLGVBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTLFNBQW9DLFlBQThEO0FBQ3pHLFVBQU0scUJBQXNCLE9BQU8sZUFBZSxhQUM5QyxDQUFDLGFBQXVCLE9BQU8sT0FBTyxDQUFDLEdBQUUsWUFBVyxRQUFRLElBQzVEO0FBRUosVUFBTSxjQUFjLEtBQUssSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFHLFdBQVcsU0FBUyxFQUFFLElBQUUsS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDO0FBQ3ZHLFFBQUksbUJBQThCLG1CQUFtQixFQUFFLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztBQUVoRixRQUFJLGlCQUFpQixRQUFRO0FBQzNCLGlCQUFXLFlBQVksU0FBUyxlQUFlLGlCQUFpQixTQUFTLElBQUksQ0FBQztBQUM5RSxVQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsVUFBVSxHQUFHO0FBQ3ZDLGlCQUFTLEtBQUssWUFBWSxVQUFVO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBS0EsVUFBTSxjQUFpQyxDQUFDLFVBQVUsYUFBYTtBQUM3RCxZQUFNLFVBQVUsV0FBVyxLQUFLO0FBQ2hDLFlBQU0sZUFBNEMsQ0FBQztBQUNuRCxZQUFNLGdCQUFnQixFQUFFLENBQUMsZUFBZSxJQUFJLFVBQVUsZUFBZSxNQUFNLGVBQWUsTUFBTSxhQUFjO0FBQzlHLFlBQU0sSUFBSSxVQUFVLEtBQUssZUFBZSxPQUFPLEdBQUcsUUFBUSxJQUFJLEtBQUssZUFBZSxHQUFHLFFBQVE7QUFDN0YsUUFBRSxjQUFjO0FBQ2hCLFlBQU0sZ0JBQWdCLG1CQUFtQixFQUFFLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztBQUNwRSxvQkFBYyxlQUFlLEVBQUUsS0FBSyxhQUFhO0FBQ2pELFVBQUksT0FBTztBQUVULFlBQVNDLGVBQVQsU0FBcUIsU0FBOEIsR0FBVztBQUM1RCxtQkFBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLEVBQUU7QUFDN0IsZ0JBQUksRUFBRSxZQUFZLFdBQVcsS0FBSyxFQUFFLFdBQVcsUUFBUyxRQUFPO0FBQ2pFLGlCQUFPO0FBQUEsUUFDVDtBQUpTLDBCQUFBQTtBQUtULFlBQUksY0FBYyxTQUFTO0FBQ3pCLGdCQUFNLFFBQVEsT0FBTyxLQUFLLGNBQWMsT0FBTyxFQUFFLE9BQU8sT0FBTSxLQUFLLEtBQU1BLGFBQVksTUFBSyxDQUFDLENBQUM7QUFDNUYsY0FBSSxNQUFNLFFBQVE7QUFDaEIscUJBQVEsSUFBSSxrQkFBa0IsS0FBSyxRQUFRLFVBQVUsSUFBSSwyQkFBMkIsS0FBSyxRQUFRLENBQUMsR0FBRztBQUFBLFVBQ3ZHO0FBQUEsUUFDRjtBQUNBLFlBQUksY0FBYyxVQUFVO0FBQzFCLGdCQUFNLFFBQVEsT0FBTyxLQUFLLGNBQWMsUUFBUSxFQUFFLE9BQU8sT0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLG9CQUFvQixLQUFLLHFCQUFxQixDQUFDQSxhQUFZLE1BQUssQ0FBQyxDQUFDO0FBQy9JLGNBQUksTUFBTSxRQUFRO0FBQ2hCLHFCQUFRLElBQUksb0JBQW9CLEtBQUssUUFBUSxVQUFVLElBQUksMEJBQTBCLEtBQUssUUFBUSxDQUFDLEdBQUc7QUFBQSxVQUN4RztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsaUJBQVcsR0FBRyxjQUFjLFNBQVMsSUFBSTtBQUN6QyxpQkFBVyxHQUFHLGNBQWMsUUFBUTtBQUNwQyxZQUFNLFdBQVcsb0JBQUksSUFBWTtBQUNqQyxvQkFBYyxZQUFZLE9BQU8sS0FBSyxjQUFjLFFBQVEsRUFBRSxRQUFRLE9BQUs7QUFDekUsWUFBSSxLQUFLLEdBQUc7QUFDVixtQkFBUSxJQUFJLG9EQUFvRCxDQUFDLHNDQUFzQztBQUN2RyxtQkFBUyxJQUFJLENBQUM7QUFBQSxRQUNoQixPQUFPO0FBQ0wsaUNBQXVCLEdBQUcsR0FBRyxjQUFjLFNBQVUsQ0FBd0MsQ0FBQztBQUFBLFFBQ2hHO0FBQUEsTUFDRixDQUFDO0FBQ0QsVUFBSSxjQUFjLGVBQWUsTUFBTSxjQUFjO0FBQ25ELFlBQUksQ0FBQztBQUNILHNCQUFZLEdBQUcsS0FBSztBQUN0QixtQkFBVyxRQUFRLGNBQWM7QUFDL0IsZ0JBQU1DLFlBQVcsTUFBTSxhQUFhLEtBQUssQ0FBQztBQUMxQyxjQUFJLFdBQVdBLFNBQVE7QUFDckIsY0FBRSxPQUFPLEdBQUcsTUFBTUEsU0FBUSxDQUFDO0FBQUEsUUFDL0I7QUFJQSxjQUFNLGdDQUFnQyxDQUFDO0FBQ3ZDLFlBQUksbUJBQW1CO0FBQ3ZCLG1CQUFXLFFBQVEsY0FBYztBQUMvQixjQUFJLEtBQUssU0FBVSxZQUFXLEtBQUssT0FBTyxLQUFLLEtBQUssUUFBUSxHQUFHO0FBRTdELGtCQUFNLGFBQWEsQ0FBQyxXQUFXLEtBQUs7QUFDcEMsZ0JBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxjQUFlLEVBQUUsZUFBZSxDQUFDLGNBQWMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksTUFBTSxDQUFDLENBQUMsS0FBSztBQUM1RyxvQkFBTSxRQUFRLEVBQUUsQ0FBbUIsR0FBRyxRQUFRO0FBQzlDLGtCQUFJLFVBQVUsUUFBVztBQUV2Qiw4Q0FBOEIsQ0FBQyxJQUFJO0FBQ25DLG1DQUFtQjtBQUFBLGNBQ3JCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQ0EsWUFBSTtBQUNGLGlCQUFPLE9BQU8sR0FBRyw2QkFBNkI7QUFBQSxNQUNsRDtBQUNBLGFBQU87QUFBQSxJQUNUO0FBRUEsVUFBTSxZQUF1QyxPQUFPLE9BQU8sYUFBYTtBQUFBLE1BQ3RFLE9BQU87QUFBQSxNQUNQLFlBQVksT0FBTyxPQUFPLGtCQUFrQixFQUFFLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztBQUFBLE1BQ3ZFO0FBQUEsTUFDQSxTQUFTLE1BQU07QUFDYixjQUFNLE9BQU8sQ0FBQyxHQUFHLE9BQU8sS0FBSyxpQkFBaUIsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sS0FBSyxpQkFBaUIsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUM3RyxlQUFPLEdBQUcsVUFBVSxJQUFJLE1BQU0sS0FBSyxLQUFLLElBQUksQ0FBQztBQUFBLFVBQWMsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUMzRTtBQUFBLElBQ0YsQ0FBQztBQUNELFdBQU8sZUFBZSxXQUFXLE9BQU8sYUFBYTtBQUFBLE1BQ25ELE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxNQUNWLGNBQWM7QUFBQSxJQUNoQixDQUFDO0FBRUQsVUFBTSxZQUFZLENBQUM7QUFDbkIsS0FBQyxTQUFTLFVBQVUsU0FBOEI7QUFDaEQsVUFBSSxTQUFTO0FBQ1gsa0JBQVUsUUFBUSxLQUFLO0FBRXpCLFlBQU0sUUFBUSxRQUFRO0FBQ3RCLFVBQUksT0FBTztBQUNULG1CQUFXLFdBQVcsT0FBTyxRQUFRO0FBQ3JDLG1CQUFXLFdBQVcsT0FBTyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGLEdBQUcsSUFBSTtBQUNQLGVBQVcsV0FBVyxpQkFBaUIsUUFBUTtBQUMvQyxlQUFXLFdBQVcsaUJBQWlCLE9BQU87QUFDOUMsV0FBTyxpQkFBaUIsV0FBVyxPQUFPLDBCQUEwQixTQUFTLENBQUM7QUFHOUUsVUFBTSxjQUFjLGFBQ2YsZUFBZSxhQUNmLE9BQU8sVUFBVSxjQUFjLFdBQ2hDLFVBQVUsWUFDVjtBQUNKLFVBQU0sV0FBVyxRQUFTLElBQUksTUFBTSxFQUFFLE9BQU8sTUFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQU07QUFFckUsV0FBTyxlQUFlLFdBQVcsUUFBUTtBQUFBLE1BQ3ZDLE9BQU8sU0FBUyxZQUFZLFFBQVEsUUFBTyxHQUFHLElBQUksV0FBUztBQUFBLElBQzdELENBQUM7QUFFRCxRQUFJLE9BQU87QUFDVCxZQUFNLG9CQUFvQixPQUFPLEtBQUssZ0JBQWdCLEVBQUUsT0FBTyxPQUFLLENBQUMsQ0FBQyxVQUFVLE9BQU8sZUFBZSxXQUFXLFlBQVksVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3BKLFVBQUksa0JBQWtCLFFBQVE7QUFDNUIsaUJBQVEsSUFBSSxHQUFHLFVBQVUsSUFBSSw2QkFBNkIsaUJBQWlCLHNCQUFzQjtBQUFBLE1BQ25HO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBR0EsUUFBTSxrQkFJRjtBQUFBLElBQ0YsY0FDRSxNQUNBLFVBQ0csVUFBNkI7QUFDOUIsYUFBUSxTQUFTLGdCQUFnQixnQkFBZ0IsTUFBTSxHQUFHLFFBQVEsSUFDOUQsT0FBTyxTQUFTLGFBQWEsS0FBSyxPQUFPLFFBQVEsSUFDakQsT0FBTyxTQUFTLFlBQVksUUFBUTtBQUFBO0FBQUEsUUFFdEMsZ0JBQWdCLElBQUksRUFBRSxPQUFPLFFBQVE7QUFBQSxVQUNuQyxnQkFBZ0IsT0FBTyxPQUN2QixtQkFBbUIsRUFBRSxPQUFPLElBQUksTUFBTSxtQ0FBbUMsSUFBSSxFQUFDLENBQUM7QUFBQSxJQUNyRjtBQUFBLEVBQ0o7QUFJQSxXQUFTLFVBQVUsR0FBcUU7QUFDdEYsUUFBSSxnQkFBZ0IsQ0FBQztBQUVuQixhQUFPLGdCQUFnQixDQUFDO0FBRTFCLFVBQU0sYUFBYSxDQUFDLFVBR0QsYUFBMEI7QUFDM0MsVUFBSSxNQUFNO0FBQ1YsVUFBSSxXQUFXLEtBQUssR0FBRztBQUNyQixpQkFBUyxRQUFRLEtBQUs7QUFDdEIsZ0JBQVEsQ0FBQztBQUFBLE1BQ1g7QUFHQSxVQUFJLENBQUMsV0FBVyxLQUFLLEdBQUc7QUFDdEIsWUFBSSxNQUFNLFVBQVU7QUFDbEI7QUFDQSxpQkFBTyxNQUFNO0FBQUEsUUFDZjtBQUNBLFlBQUksTUFBTSxVQUFVO0FBQ2xCLGdCQUFNLE1BQU07QUFDWixpQkFBTyxNQUFNO0FBQUEsUUFDZjtBQUdBLGNBQU0sSUFBSSxZQUNOLElBQUksZ0JBQWdCLFdBQXFCLEVBQUUsWUFBWSxDQUFDLElBQ3hELElBQUksY0FBYyxDQUFDO0FBQ3ZCLFVBQUUsY0FBYztBQUVoQixtQkFBVyxHQUFHLGFBQWE7QUFDM0Isb0JBQVksR0FBRyxLQUFLO0FBR3BCLFVBQUUsT0FBTyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBRUEsVUFBTSxvQkFBa0QsT0FBTyxPQUFPLFlBQVk7QUFBQSxNQUNoRixPQUFPLE1BQUk7QUFBRSxjQUFNLElBQUksTUFBTSxtRkFBbUY7QUFBQSxNQUFFO0FBQUEsTUFDbEg7QUFBQTtBQUFBLE1BQ0EsVUFBVTtBQUFFLGVBQU8sZ0JBQWdCLGFBQWEsRUFBRSxHQUFHLFlBQVksT0FBTyxFQUFFLEdBQUcsQ0FBQztBQUFBLE1BQUk7QUFBQSxJQUNwRixDQUFDO0FBRUQsV0FBTyxlQUFlLFlBQVksT0FBTyxhQUFhO0FBQUEsTUFDcEQsT0FBTztBQUFBLE1BQ1AsVUFBVTtBQUFBLE1BQ1YsY0FBYztBQUFBLElBQ2hCLENBQUM7QUFFRCxXQUFPLGVBQWUsWUFBWSxRQUFRLEVBQUUsT0FBTyxNQUFNLElBQUksSUFBSSxDQUFDO0FBRWxFLFdBQU8sZ0JBQWdCLENBQUMsSUFBSTtBQUFBLEVBQzlCO0FBRUEsT0FBSyxRQUFRLFNBQVM7QUFHdEIsU0FBTztBQUNUO0FBRUEsU0FBUyxzQkFBc0I7QUFDN0IsU0FBTyxTQUFTLGNBQWMsUUFDMUIsSUFBSSxNQUFNLFNBQVMsRUFBRSxPQUFPLFFBQVEsWUFBWSxFQUFFLEtBQUssWUFDdkQsU0FBUztBQUNmO0FBRUEsU0FBUyxtQkFBbUIsRUFBRSxNQUFNLEdBQTJDO0FBQzdFLFNBQU8sU0FBUyxjQUFjLGlCQUFpQixRQUFRLE1BQU0sU0FBUyxJQUFJLGFBQVcsS0FBSyxVQUFVLE9BQU0sTUFBSyxDQUFDLENBQUM7QUFDbkg7QUFFTyxJQUFJLHlCQUF5QixXQUFZO0FBQzlDLDJCQUF5QixXQUFZO0FBQUEsRUFBQztBQUN0QyxNQUFJLGlCQUFpQixDQUFDLGNBQWM7QUFDbEMsY0FBVSxRQUFRLFNBQVUsR0FBRztBQUM3QixVQUFJLEVBQUUsU0FBUyxhQUFhO0FBQzFCLFVBQUUsYUFBYTtBQUFBLFVBQ2IsYUFBVyxXQUFXLG1CQUFtQixXQUN2QyxDQUFDLEdBQUcsUUFBUSxxQkFBcUIsR0FBRyxHQUFHLE9BQU8sRUFBRSxPQUFPLFNBQU8sQ0FBQyxJQUFJLFdBQVcsRUFBRTtBQUFBLFlBQzlFLFNBQU87QUFDTCxvQ0FBc0IsT0FBTyxPQUFPLElBQUkscUJBQXFCLGNBQWMsSUFBSSxpQkFBaUI7QUFBQSxZQUNsRztBQUFBLFVBQ0Y7QUFBQSxRQUFDO0FBQUEsTUFDUDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQyxFQUFFLFFBQVEsU0FBUyxNQUFNLEVBQUUsU0FBUyxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBQzlEO0FBTUEsU0FBUyxnQkFBZ0IsTUFBWSxPQUFrRDtBQUNyRixRQUFNLFVBQVUsb0JBQUksUUFBYztBQUNsQyxXQUFTLEtBQUssT0FBZ0I7QUFDNUIsZUFBVyxRQUFRLE9BQU87QUFFeEIsVUFBSyxVQUFVLGlCQUFrQixLQUFLLGFBQWE7QUFDakQsYUFBSyxLQUFLLFVBQVU7QUFDcEIsZ0JBQVEsSUFBSSxJQUFJO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksaUJBQWlCLENBQUMsY0FBYztBQUNsQyxjQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFVBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxhQUFhLFFBQVE7QUFDbkQsYUFBSyxFQUFFLEtBQUssQ0FBQztBQUFBLE1BQ2Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILENBQUMsRUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLE1BQU0sV0FBVyxLQUFLLENBQUM7QUFFbkQsU0FBTyxTQUFTLE1BQVk7QUFDMUIsV0FBTyxRQUFRLElBQUksSUFBSTtBQUFBLEVBQ3pCO0FBQ0Y7QUFFQSxJQUFNLFNBQVMsb0JBQUksSUFBWTtBQUN4QixTQUFTLGdCQUFnQixNQUEyQixLQUErQjtBQUN4RixTQUFPLFFBQVE7QUFDZixRQUFNLE9BQU8sdUJBQU8sT0FBTyxJQUFJO0FBQy9CLE1BQUksS0FBSyxrQkFBa0I7QUFDekIsU0FBSyxpQkFBaUIsTUFBTSxFQUFFLFFBQVEsU0FBVSxLQUFLO0FBQ25ELFVBQUksSUFBSSxJQUFJO0FBQ1YsWUFBSSxDQUFDLElBQUssSUFBSSxFQUFFO0FBQ2QsY0FBSyxJQUFJLEVBQUUsSUFBSTtBQUFBLGlCQUNSLE9BQU87QUFDZCxjQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ3ZCLG1CQUFPLElBQUksSUFBSSxFQUFFO0FBQ2pCLHFCQUFRO0FBQUEsY0FBSztBQUFBLGNBQWlDLElBQUk7QUFBQTtBQUFBLFlBQTBCO0FBQUEsVUFDOUU7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDQSxTQUFPO0FBQ1Q7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAiaXNNaXNzaW5nIiwgIm1lcmdlZCIsICJjIiwgIm4iLCAidmFsdWUiLCAiaXNBbmNlc3RyYWwiLCAiY2hpbGRyZW4iXQp9Cg==
