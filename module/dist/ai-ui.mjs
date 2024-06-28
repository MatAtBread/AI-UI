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
function assignHidden(d, s) {
  const keys = [...Object.getOwnPropertyNames(s), ...Object.getOwnPropertySymbols(s)];
  for (const k of keys) {
    Object.defineProperty(d, k, { ...Object.getOwnPropertyDescriptor(s, k), enumerable: false });
  }
  return d;
}
var _pending = Symbol("_pending");
var _items = Symbol("_items");
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
    q[_inflight].add(value);
    if (q[_pending].length) {
      const p = q[_pending].pop();
      p.finally(() => q[_inflight].delete(value));
      p.resolve({ done: false, value });
    } else {
      if (!q[_items]) {
        _console.log("Discarding queue push as there are no consumers");
      } else if (!q[_items].find((v) => v === value)) {
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
              withPath ?? (withPath = filterMap(pds, (o) => isProxiedAsyncIterator(o) ? o[_proxiedAsyncIterator] : { a: o, path: "" }));
              let ai = filterMap(withPath, (o, p) => {
                const v2 = destructure(o.a, path);
                return p !== v2 || o.path.startsWith(path) ? v2 : Ignore;
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
            if (!(key in target)) {
              Reflect.set(target, key, void 0, target);
            }
            if (Object.hasOwn(target, key) && !(Iterability in target && target[Iterability] === "shallow")) {
              return new Proxy(Object(Reflect.get(target, key, receiver)), handler(path + "." + key));
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
      tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach((k) => {
        if (k in e) {
          _console.log(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RlYnVnLnRzIiwgIi4uL3NyYy9kZWZlcnJlZC50cyIsICIuLi9zcmMvaXRlcmF0b3JzLnRzIiwgIi4uL3NyYy93aGVuLnRzIiwgIi4uL3NyYy9haS11aS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzKVxuICB9LFxuICBpbmZvKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5kZWJ1ZygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5leHBvcnQgdHlwZSBEZWZlcnJlZFByb21pc2U8VD4gPSBQcm9taXNlPFQ+ICYge1xuICByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZDtcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmZXJyZWQ8VD4oKTogRGVmZXJyZWRQcm9taXNlPFQ+IHtcbiAgbGV0IHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkID0gbm90aGluZztcbiAgbGV0IHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSBub3RoaW5nO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcikgYXMgRGVmZXJyZWRQcm9taXNlPFQ+O1xuICBwcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgcHJvbWlzZS5jYXRjaChleCA9PiAoZXggaW5zdGFuY2VvZiBFcnJvciB8fCBleD8udmFsdWUgaW5zdGFuY2VvZiBFcnJvcikgPyBjb25zb2xlLmxvZyhcIkRlZmVycmVkIHJlamVjdGlvblwiLCBleCwgXCJhbGxvY2F0ZWQgYXQgXCIsIGluaXRMb2NhdGlvbikgOiB1bmRlZmluZWQpO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBUcnVlIGlmIGBleHByIGluIHhgIGlzIHZhbGlkXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3RMaWtlKHg6IGFueSk6IHggaXMgRnVuY3Rpb24gfCB7fSB7XG4gIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlTGlrZTxUPih4OiBhbnkpOiB4IGlzIFByb21pc2VMaWtlPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh4KSAmJiAoJ3RoZW4nIGluIHgpICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiXG5pbXBvcnQgeyBEZWZlcnJlZFByb21pc2UsIGRlZmVycmVkLCBpc09iamVjdExpa2UsIGlzUHJvbWlzZUxpa2UgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiXG5cbi8qIEl0ZXJhYmxlUHJvcGVydGllcyBjYW4ndCBiZSBjb3JyZWN0bHkgdHlwZWQgaW4gVFMgcmlnaHQgbm93LCBlaXRoZXIgdGhlIGRlY2xhcmF0aWluXG4gIHdvcmtzIGZvciByZXRyaWV2YWwgKHRoZSBnZXR0ZXIpLCBvciBpdCB3b3JrcyBmb3IgYXNzaWdubWVudHMgKHRoZSBzZXR0ZXIpLCBidXQgdGhlcmUnc1xuICBubyBUUyBzeW50YXggdGhhdCBwZXJtaXRzIGNvcnJlY3QgdHlwZS1jaGVja2luZyBhdCBwcmVzZW50LlxuXG4gIElkZWFsbHksIGl0IHdvdWxkIGJlOlxuXG4gIHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IHtcbiAgICBnZXQgW0sgaW4ga2V5b2YgSVBdKCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxJUFtLXT4gJiBJUFtLXVxuICAgIHNldCBbSyBpbiBrZXlvZiBJUF0odjogSVBbS10pXG4gIH1cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM4MjZcblxuICBXZSBjaG9vc2UgdGhlIGZvbGxvd2luZyB0eXBlIGRlc2NyaXB0aW9uIHRvIGF2b2lkIHRoZSBpc3N1ZXMgYWJvdmUuIEJlY2F1c2UgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZVxuICBpcyBQYXJ0aWFsIGl0IGNhbiBiZSBvbWl0dGVkIGZyb20gYXNzaWdubWVudHM6XG4gICAgdGhpcy5wcm9wID0gdmFsdWU7ICAvLyBWYWxpZCwgYXMgbG9uZyBhcyB2YWx1cyBoYXMgdGhlIHNhbWUgdHlwZSBhcyB0aGUgcHJvcFxuICAuLi5hbmQgd2hlbiByZXRyaWV2ZWQgaXQgd2lsbCBiZSB0aGUgdmFsdWUgdHlwZSwgYW5kIG9wdGlvbmFsbHkgdGhlIGFzeW5jIGl0ZXJhdG9yOlxuICAgIERpdih0aGlzLnByb3ApIDsgLy8gdGhlIHZhbHVlXG4gICAgdGhpcy5wcm9wLm1hcCEoLi4uLikgIC8vIHRoZSBpdGVyYXRvciAobm90IHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hlbiAqYWNjZXB0cyogYSBQYXJ0aWFsPEFzeW5jSXRlcmF0b3I+XG4gIGJ1dCBjYXN0cyBpdCB0byBhIEFzeW5jSXRlcmF0b3IgYmVmb3JlIHVzZS5cblxuICBUaGUgaXRlcmFiaWxpdHkgb2YgcHJvcGVydHlzIG9mIGFuIG9iamVjdCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBwcmVzZW5jZSBhbmQgdmFsdWUgb2YgdGhlIGBJdGVyYWJpbGl0eWAgc3ltYm9sLlxuICBCeSBkZWZhdWx0LCB0aGUgY3VycmVudGx5IGltcGxlbWVudGF0aW9uIGRvZXMgYSBvbmUtbGV2ZWwgZGVlcCBtYXBwaW5nLCBzbyBhbiBpdGVyYWJsZSBwcm9wZXJ0eSAnb2JqJyBpcyBpdHNlbGZcbiAgaXRlcmFibGUsIGFzIGFyZSBpdCdzIG1lbWJlcnMuIFRoZSBvbmx5IGRlZmluZWQgdmFsdWUgYXQgcHJlc2VudCBpcyBcInNoYWxsb3dcIiwgaW4gd2hpY2ggY2FzZSAnb2JqJyByZW1haW5zXG4gIGl0ZXJhYmxlLCBidXQgaXQncyBtZW1iZXRycyBhcmUganVzdCBQT0pTIHZhbHVlcy5cbiovXG5cbi8vIEJhc2UgdHlwZXMgdGhhdCBjYW4gYmUgbWFkZSBkZWZpbmVkIGFzIGl0ZXJhYmxlOiBiYXNpY2FsbHkgYW55dGhpbmcsIF9leGNlcHRfIGEgZnVuY3Rpb25cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgPSAoc3RyaW5nIHwgbnVtYmVyIHwgYmlnaW50IHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwpO1xuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWV9O1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLHR5cGVvZiBJdGVyYWJpbGl0eT5dOiBJdGVyYWJsZVR5cGU8SVBbS10+XG59IDoge1xuICBbSyBpbiBrZXlvZiBJUF06IChJUFtLXSBleHRlbmRzIG9iamVjdCA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT4gOiBJUFtLXSkgJiBJdGVyYWJsZVR5cGU8SVBbS10+XG59XG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7XG4gIHB1c2godmFsdWU6IFQpOiBib29sZWFuO1xuICByZWFkb25seSBsZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3luY0V4dHJhSXRlcmFibGU8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7IH1cblxuLy8gTkI6IFRoaXMgYWxzbyAoaW5jb3JyZWN0bHkpIHBhc3NlcyBzeW5jIGl0ZXJhdG9ycywgYXMgdGhlIHByb3RvY29sIG5hbWVzIGFyZSB0aGUgc2FtZVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgJ25leHQnIGluIG8gJiYgdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBvKSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5jb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2V9KTtcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ19wZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ19pdGVtcycpO1xuZnVuY3Rpb24gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSB7XG4gICAgW19wZW5kaW5nXTogW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbCxcbiAgICBbX2l0ZW1zXTogW10gYXMgSXRlcmF0b3JSZXN1bHQ8VD5bXSB8IG51bGwsXG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHEgYXMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKHFbX2l0ZW1zXT8ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocVtfaXRlbXNdLnNoaWZ0KCkhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBxW19wZW5kaW5nXS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiB1bmtub3duKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgdGhyb3coLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkgcmV0dXJuIC0xOyAvLyBUaGUgcXVldWUgaGFzIG5vIGNvbnN1bWVycyBhbmQgaGFzIHRlcm1pbmF0ZWQuXG4gICAgICByZXR1cm4gcVtfaXRlbXNdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmNvbnN0IF9pbmZsaWdodCA9IFN5bWJvbCgnaW5mbGlnaHQnKTtcbmZ1bmN0aW9uIGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3ApIGFzIFJldHVyblR5cGU8dHlwZW9mIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4+ICYgeyBbX2luZmxpZ2h0XTogU2V0PFQ+IH07XG4gIHFbX2luZmxpZ2h0XSA9IG5ldyBTZXQ8VD4oKTtcblxuICBxLnB1c2ggPSBmdW5jdGlvbiAodmFsdWU6IFQpIHtcbiAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRGVib3VuY2VcbiAgICBpZiAocVtfaW5mbGlnaHRdLmhhcyh2YWx1ZSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIHFbX2luZmxpZ2h0XS5hZGQodmFsdWUpO1xuICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdiA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyB7fSwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYseSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAseyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB9fTtcbiAgdHlwZSBQb3NzaWJseVdpdGhQYXRoID0gViB8IFdpdGhQYXRoO1xuICBmdW5jdGlvbiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG86IFBvc3NpYmx5V2l0aFBhdGgpOiBvIGlzIFdpdGhQYXRoIHtcbiAgICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aCAmJiAoKG8gPSBvPy5bZmllbGRzW2ldXSkgIT09IHVuZGVmaW5lZCk7IGkrKykgO1xuICAgIHJldHVybiBvO1xuICB9XG4gIGZ1bmN0aW9uIGJveE9iamVjdChhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxQb3NzaWJseVdpdGhQYXRoPikge1xuICAgIGxldCB3aXRoUGF0aDogIEFzeW5jRXh0cmFJdGVyYWJsZTxXaXRoUGF0aFt0eXBlb2YgX3Byb3hpZWRBc3luY0l0ZXJhdG9yXT47XG4gICAgbGV0IHdpdGhvdXRQYXRoOiAgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICAgIHJldHVybiBuZXcgUHJveHkoYSBhcyBvYmplY3QsIGhhbmRsZXIoKSkgYXMgViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIocGF0aCA9ICcnKTogUHJveHlIYW5kbGVyPG9iamVjdD4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQSBib3hlZCBvYmplY3QgaGFzIGl0cyBvd24ga2V5cywgYW5kIHRoZSBrZXlzIG9mIGFuIEFzeW5jRXh0cmFJdGVyYWJsZVxuICAgICAgICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5ID09PSBfcHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGEga2V5IGlzIHNldCBpbiB0aGUgdGFyZ2V0LCBwdXNoIHRoZSBjaGFuZ2VcbiAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsa2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0ICR7bmFtZS50b1N0cmluZygpfSR7cGF0aH0uJHtrZXkudG9TdHJpbmcoKX0gYXMgaXQgaXMgcGFydCBvZiBhc3luY0l0ZXJhdG9yYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7YSxwYXRofSB9IGFzIGFueSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICBpZiAoUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXToge2EscGF0aH0gfSBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBnZXR0aW5nIHRoZSB2YWx1ZSBvZiBhIGJveGVkIG9iamVjdCBtZW1iZXIsIHByZWZlciBhc3luY0V4dHJhSXRlcmFibGUgb3ZlciB0YXJnZXQga2V5c1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhbiBhc3luY0V4dHJhSXRlcmFibGUgbWVtYmVyLCBjcmVhdGUgdGhlIG1hcHBlZCBxdWV1ZSB0byBnZW5lcmF0ZSBpdFxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcyxrZXkpKSB7XG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHdpdGhvdXRQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0uYSA6IG8pO1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2l0aFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXSA6IHsgYTogbywgcGF0aDogJycgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aC5zdGFydHNXaXRoKHBhdGgpID8gdiA6IElnbm9yZSA7XG4gICAgICAgICAgICAgIH0sIElnbm9yZSwgZGVzdHJ1Y3R1cmUoYSwgcGF0aCkpO1xuICAgICAgICAgICAgICByZXR1cm4gYWlba2V5IGFzIGtleW9mIHR5cGVvZiBhaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhIHRhcmdldCBwcm9wZXJ0eSwgY3JlYXRlIHRoZSBwcm94eSB0byBoYW5kbGUgaXRcbiAgICAgICAgICBpZiAoa2V5ID09PSAndmFsdWVPZicpIHJldHVybiAoKSA9PiBkZXN0cnVjdHVyZShhLCBwYXRoKTtcbiAgICAgICAgICBpZiAoa2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUpIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSwgc2luY2UgU3ltYm9sLnRvUHJpbWl0aXZlIGlzIGluIGhhKCksIHdlIG5lZWQgdG8gaW1wbGVtZW50IGl0XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oaGludD86J3N0cmluZyd8J251bWJlcid8J2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgIGlmIChSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCB0YXJnZXQpLmNhbGwodGFyZ2V0LCBoaW50KTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gdGFyZ2V0LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnbnVtYmVyJykgcmV0dXJuIE51bWJlcih0YXJnZXQpO1xuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgYnJhbmQgbmV3IGtleSB3aXRoaW4gdGhlIHRhcmdldFxuICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdW5kZWZpbmVkLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpICYmICEoSXRlcmFiaWxpdHkgaW4gdGFyZ2V0ICYmIHRhcmdldFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm94eShPYmplY3QoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSksIGhhbmRsZXIocGF0aCArICcuJyArIGtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaGlzIGlzIGEgc3ltYm9saWMgZW50cnksIG9yIGEgcHJvdG90eXBpY2FsIHZhbHVlIChzaW5jZSBpdCdzIGluIHRoZSB0YXJnZXQsIGJ1dCBub3QgYSB0YXJnZXQgcHJvcGVydHkpXG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLypcbiAgRXh0ZW5zaW9ucyB0byB0aGUgQXN5bmNJdGVyYWJsZTpcbiovXG5cbi8qIE1lcmdlIGFzeW5jSXRlcmFibGVzIGludG8gYSBzaW5nbGUgYXN5bmNJdGVyYWJsZSAqL1xuXG4vKiBUUyBoYWNrIHRvIGV4cG9zZSB0aGUgcmV0dXJuIEFzeW5jR2VuZXJhdG9yIGEgZ2VuZXJhdG9yIG9mIHRoZSB1bmlvbiBvZiB0aGUgbWVyZ2VkIHR5cGVzICovXG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+ID0gVFtdIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGluZmVyIFU+PltdID8gVSA6IG5ldmVyO1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8VD4gPSBBc3luY0l0ZXJhYmxlPENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+PjtcblxuZXhwb3J0IGNvbnN0IG1lcmdlID0gPEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4+W10sIFRZaWVsZCwgVFJldHVybiwgVE5leHQ+KC4uLmFpOiBBKSA9PiB7XG4gIGNvbnN0IGl0OiAodW5kZWZpbmVkIHwgQXN5bmNJdGVyYXRvcjxhbnk+KVtdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHtpZHg6IG51bWJlciwgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxhbnk+fT5bXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuXG4gIGxldCBpbml0ID0gKCkgPT4ge1xuICAgIGluaXQgPSAoKT0+e31cbiAgICBmb3IgKGxldCBuID0gMDsgbiA8IGFpLmxlbmd0aDsgbisrKSB7XG4gICAgICBjb25zdCBhID0gYWlbbl0gYXMgQXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0PjtcbiAgICAgIHByb21pc2VzW25dID0gKGl0W25dID0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYVxuICAgICAgICA/IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICAgICAgOiBhIGFzIEFzeW5jSXRlcmF0b3I8YW55PilcbiAgICAgICAgLm5leHQoKVxuICAgICAgICAudGhlbihyZXN1bHQgPT4gKHsgaWR4OiBuLCByZXN1bHQgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IChUWWllbGQgfCBUUmV0dXJuKVtdID0gW107XG4gIGNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG4gIGxldCBjb3VudCA9IHByb21pc2VzLmxlbmd0aDtcblxuICBjb25zdCBtZXJnZWQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxBW251bWJlcl0+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBtZXJnZWQgfSxcbiAgICBuZXh0KCkge1xuICAgICAgaW5pdCgpO1xuICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzKS50aGVuKCh7IGlkeCwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHlpZWxkIGludGVybWVkaWF0ZSByZXR1cm4gdmFsdWVzLCB3ZSBqdXN0IGtlZXAgdGhlbSBpbiByZXN1bHRzXG4gICAgICAgICAgICAvLyByZXR1cm4geyBkb25lOiBjb3VudCA9PT0gMCwgdmFsdWU6IHJlc3VsdC52YWx1ZSB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYGV4YCBpcyB0aGUgdW5kZXJseWluZyBhc3luYyBpdGVyYXRpb24gZXhjZXB0aW9uXG4gICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gaXRbaWR4XVxuICAgICAgICAgICAgICA/IGl0W2lkeF0hLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH19KSlcbiAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBpZHgsIHJlc3VsdDoge2RvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWR9IH0pXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIHJldHVybiBtZXJnZWQudGhyb3c/LihleCkgPz8gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgZXhjZXB0aW9uXCIpIH0pO1xuICAgICAgICB9KVxuICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgcmV0dXJuKHIpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8ucmV0dXJuPy4oeyBkb25lOiB0cnVlLCB2YWx1ZTogciB9KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH0sXG4gICAgYXN5bmMgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy50aHJvdz8uKGV4KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgIC8vIHByZXZpb3VzbHk6IHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQgYXMgdW5rbm93biBhcyBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8QVtudW1iZXJdPik7XG59XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZSA9IHsgW2s6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbF06IFBhcnRpYWxJdGVyYWJsZSB9O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSB7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmVPcHRpb25zIHtcbiAgaWdub3JlUGFydGlhbD86IGJvb2xlYW47IC8vIFNldCB0byBhdm9pZCB5aWVsZGluZyBpZiBzb21lIHNvdXJjZXMgYXJlIGFic2VudFxufVxuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4oc3JjOiBTLCBvcHRzOiBDb21iaW5lT3B0aW9ucyA9IHt9KTogQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPiA9PiB7XG4gIGNvbnN0IGFjY3VtdWxhdGVkOiBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPiA9IHt9O1xuICBsZXQgcGM6IFByb21pc2U8e2lkeDogbnVtYmVyLCBrOiBzdHJpbmcsIGlyOiBJdGVyYXRvclJlc3VsdDxhbnk+fT5bXTtcbiAgbGV0IHNpOiBBc3luY0l0ZXJhdG9yPGFueT5bXSA9IFtdO1xuICBsZXQgYWN0aXZlOm51bWJlciA9IDA7XG4gIGNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHt9KTtcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssc2l0XSwgaWR4KSA9PiB7XG4gICAgICAgICAgYWN0aXZlICs9IDE7XG4gICAgICAgICAgc2lbaWR4XSA9IHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgICAgcmV0dXJuIHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHtzaSxpZHgsayxpcn0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoZnVuY3Rpb24gc3RlcCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKHBjKS50aGVuKCh7IGlkeCwgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwY1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgIGFjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICBwY1tpZHhdID0gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdHMuaWdub3JlUGFydGlhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFjY3VtdWxhdGVkKS5sZW5ndGggPCBPYmplY3Qua2V5cyhzcmMpLmxlbmd0aClcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICB9KVxuICAgICAgfSkoKTtcbiAgICB9LFxuICAgIHJldHVybih2PzogYW55KXtcbiAgICAgIHBjLmZvckVhY2goKHAsaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS5yZXR1cm4/Lih2KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICB9LFxuICAgIHRocm93KGV4OiBhbnkpe1xuICAgICAgcGMuZm9yRWFjaCgocCxpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnRocm93Py4oZXgpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn1cblxuXG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGU8VD4oaTogYW55KTogaSBpcyBBc3luY0V4dHJhSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgJiYgZXh0cmFLZXlzLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgKGkgYXMgYW55KVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuXG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnM8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4oYWk6IEEpOiBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IHVua25vd24+IHtcbiAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgYXNzaWduSGlkZGVuKGFpLCBhc3luY0V4dHJhcyk7XG4gIH1cbiAgcmV0dXJuIGFpIGFzIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICYgQSA6IG5ldmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzPEcgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFIsIFIgZXh0ZW5kcyBBc3luY0dlbmVyYXRvcj4oZzogRykge1xuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6UGFyYW1ldGVyczxHPik6IFJldHVyblR5cGU8Rz4ge1xuICAgIGNvbnN0IGFpID0gZyguLi5hcmdzKTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFpKSBhcyBSZXR1cm5UeXBlPEc+O1xuICB9IGFzICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KSA9PiBSZXR1cm5UeXBlPEc+ICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFJldHVyblR5cGU8Rz4gZXh0ZW5kcyBBc3luY0dlbmVyYXRvcjxpbmZlciBUPiA/IFQgOiB1bmtub3duPlxufVxuXG4vKiBBc3luY0l0ZXJhYmxlIGhlbHBlcnMsIHdoaWNoIGNhbiBiZSBhdHRhY2hlZCB0byBhbiBBc3luY0l0ZXJhdG9yIHdpdGggYHdpdGhIZWxwZXJzKGFpKWAsIGFuZCBpbnZva2VkIGRpcmVjdGx5IGZvciBmb3JlaWduIGFzeW5jSXRlcmF0b3JzICovXG5cbi8qIHR5cGVzIHRoYXQgYWNjZXB0IFBhcnRpYWxzIGFzIHBvdGVudGlhbGx1IGFzeW5jIGl0ZXJhdG9ycywgc2luY2Ugd2UgcGVybWl0IHRoaXMgSU4gVFlQSU5HIHNvXG4gIGl0ZXJhYmxlIHByb3BlcnRpZXMgZG9uJ3QgY29tcGxhaW4gb24gZXZlcnkgYWNjZXNzIGFzIHRoZXkgYXJlIGRlY2xhcmVkIGFzIFYgJiBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8Vj4+XG4gIGR1ZSB0byB0aGUgc2V0dGVycyBhbmQgZ2V0dGVycyBoYXZpbmcgZGlmZmVyZW50IHR5cGVzLCBidXQgdW5kZWNsYXJhYmxlIGluIFRTIGR1ZSB0byBzeW50YXggbGltaXRhdGlvbnMgKi9cbnR5cGUgSGVscGVyQXN5bmNJdGVyYWJsZTxRIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+PiA9IEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8UT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT47XG50eXBlIEhlbHBlckFzeW5jSXRlcmF0b3I8RiwgQW5kID0ge30sIE9yID0gbmV2ZXI+ID1cbiAgRiBleHRlbmRzICgpPT5Bc3luY0l0ZXJhdG9yPGluZmVyIFQ+XG4gID8gVCA6IG5ldmVyO1xuXG5hc3luYyBmdW5jdGlvbiBjb25zdW1lPFUgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+KHRoaXM6IFUsIGY/OiAodTogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBsYXN0OiB1bmRlZmluZWQgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pIHtcbiAgICBsYXN0ID0gZj8uKHUpO1xuICB9XG4gIGF3YWl0IGxhc3Q7XG59XG5cbnR5cGUgTWFwcGVyPFUsIFI+ID0gKChvOiBVLCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4pO1xudHlwZSBNYXliZVByb21pc2VkPFQ+ID0gUHJvbWlzZUxpa2U8VD4gfCBUO1xuXG4vKiBBIGdlbmVyYWwgZmlsdGVyICYgbWFwcGVyIHRoYXQgY2FuIGhhbmRsZSBleGNlcHRpb25zICYgcmV0dXJucyAqL1xuZXhwb3J0IGNvbnN0IElnbm9yZSA9IFN5bWJvbChcIklnbm9yZVwiKTtcblxudHlwZSBQYXJ0aWFsSXRlcmFibGU8VCA9IGFueT4gPSBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VD4+O1xuXG5mdW5jdGlvbiByZXNvbHZlU3luYzxaLFI+KHY6IE1heWJlUHJvbWlzZWQ8Wj4sIHRoZW46KHY6Wik9PlIsIGV4Y2VwdDooeDphbnkpPT5hbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGlzUHJvbWlzZUxpa2UodikpXG4gICAgcmV0dXJuIHYudGhlbih0aGVuLGV4Y2VwdCk7XG4gIHRyeSB7IHJldHVybiB0aGVuKHYpIH0gY2F0Y2ggKGV4KSB7IHJldHVybiBleGNlcHQoZXgpIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPihzb3VyY2U6IFUsXG4gIGZuOiBNYXBwZXI8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgUj4sXG4gIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmUsXG4gIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGNvbnN0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgcmV0dXJuIGluaXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyByZXNvbHZlKHApXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuXG4gICAgICAgICAgZXggPT5cbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgKS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIHRocmV3XG4gICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCk7IC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93ID8gYWkudGhyb3coZXgpIDogYWk/LnJldHVybj8uKGV4KSkudGhlbih2ID0+ICh7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9KSlcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmICghaXQ/LmRvbmUpIHtcbiAgICAgIGN1cnJlbnQgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIGFpIS5uZXh0KClcbiAgICAgICAgLnRoZW4oc3RlcClcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50Ly8udGhlbih6YWxnbyA9PiB6YWxnbyk7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiogKCkgeyB9KSgpO1xuICB3aGlsZSAoZykge1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGcsIFN5bWJvbC5hc3luY0l0ZXJhdG9yKTtcbiAgICBpZiAoZGVzYykge1xuICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGcgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZyk7XG4gIH1cbiAgaWYgKCFnKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiB7IFtrOiBzdHJpbmddOiB1bmRlZmluZWQgfSwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0gIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufTtcbnR5cGUgV2hlbkV2ZW50cyA9IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCAmIFNwZWNpYWxXaGVuRXZlbnRzO1xudHlwZSBFdmVudE5hbWVMaXN0PFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogYCR7U30sJHtFdmVudE5hbWVMaXN0PFI+fWBcbiAgOiBuZXZlcjtcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXI7XG5cblxudHlwZSBFdmVudEF0dHJpYnV0ZSA9IGAke2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcH1gXG50eXBlIENTU0lkZW50aWZpZXI8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAjJHtJRFN9YCB8YC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/ICdjaGFuZ2UnXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dO1xuXG4vKiogd2hlbiAqKi9cbnR5cGUgRXZlbnRPYnNlcnZhdGlvbjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+ID0ge1xuICBwdXNoOiAoZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKT0+dm9pZDtcbiAgdGVybWluYXRlOiAoZXg6IEVycm9yKT0+dm9pZDtcbiAgY29udGFpbmVyOiBFbGVtZW50XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsXG59O1xuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldi50eXBlIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCk7XG4gIGlmIChvYnNlcnZhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb2JzZXJ2YXRpb25zKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHB1c2gsIHRlcm1pbmF0ZSwgY29udGFpbmVyLCBzZWxlY3RvciB9ID0gbztcbiAgICAgICAgaWYgKCFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyLmlkICsgXCI+XCIgKyAoc2VsZWN0b3IgfHwgJycpICsgXCJgIHJlbW92ZWQgZnJvbSBET00uIFJlbW92aW5nIHN1YnNjcmlwdGlvblwiO1xuICAgICAgICAgIG9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgdGVybWluYXRlKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZXYudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gbiB8fCBuLmNvbnRhaW5zKGV2LnRhcmdldCkpICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBjb250YWluZXIgfHwgY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkpKVxuICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2RvY0V2ZW50SGFuZGxlcicsIGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDU1NTZWxlY3RvcihzOiBzdHJpbmcpOiBzIGlzIENTU0lkZW50aWZpZXIge1xuICByZXR1cm4gQm9vbGVhbihzICYmIChzLnN0YXJ0c1dpdGgoJyMnKSB8fCBzLnN0YXJ0c1dpdGgoJy4nKSB8fCAocy5zdGFydHNXaXRoKCdbJykgJiYgcy5lbmRzV2l0aCgnXScpKSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtDU1NJZGVudGlmaWVyIHwgbnVsbCwga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXSB7XG4gIGNvbnN0IHBhcnRzID0gd2hhdC5zcGxpdCgnOicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgICAgcmV0dXJuIFtwYXJ0c1swXSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW251bGwsIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3NlbGVjdG9yLCBldmVudE5hbWVdID0gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkgPz8gZG9UaHJvdyhcIkludmFsaWQgV2hlblNlbGVjdG9yOiBcIit3aGF0KTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhldmVudE5hbWUpKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGRvY0V2ZW50SGFuZGxlciwge1xuICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgIGNhcHR1cmU6IHRydWVcbiAgICB9KTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoZXZlbnROYW1lLCBuZXcgU2V0KCkpO1xuICB9XG5cbiAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBba2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXT4oKCkgPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSk/LmRlbGV0ZShkZXRhaWxzKSk7XG5cbiAgY29uc3QgZGV0YWlsczogRXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+IC8qRXZlbnRPYnNlcnZhdGlvbjxFeGNsdWRlPEV4dHJhY3RFdmVudE5hbWVzPEV2ZW50TmFtZT4sIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzPj4qLyA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXIsXG4gICAgc2VsZWN0b3I6IHNlbGVjdG9yIHx8IG51bGxcbiAgfTtcblxuICBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgc2VsZWN0b3IgPyBbc2VsZWN0b3JdIDogdW5kZWZpbmVkKVxuICAgIC50aGVuKF8gPT4gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGV2ZW50TmFtZSkhLmFkZChkZXRhaWxzKSk7XG5cbiAgcmV0dXJuIHF1ZXVlLm11bHRpKCkgO1xufVxuXG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbjxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBhd2FpdCBuZXcgUHJvbWlzZSgoKSA9PiB7fSk7XG4gIHlpZWxkIHVuZGVmaW5lZCBhcyBaOyAvLyBOZXZlciBzaG91bGQgYmUgZXhlY3V0ZWRcbn1cblxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmM8QSBleHRlbmRzIEFzeW5jRXh0cmFJdGVyYWJsZTxYPiwgWD4oc3JjOiBBKTogTWFwcGFibGVJdGVyYWJsZTxBPiB7XG4gIGZ1bmN0aW9uIG1hcHBhYmxlQXN5bmNJdGVyYWJsZShtYXBwZXI6IFBhcmFtZXRlcnM8dHlwZW9mIHNyYy5tYXA+WzBdKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAobWFwcGVyKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUgYXMgdW5rbm93biBhcyBBc3luY0l0ZXJhYmxlPEE+KSwge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICB9KSBhcyBNYXBwYWJsZUl0ZXJhYmxlPEE+O1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkV2hlblNlbGVjdG9yKHdoYXQ6IFdoZW5QYXJhbWV0ZXJzW251bWJlcl0pOiB3aGF0IGlzIFZhbGlkV2hlblNlbGVjdG9yIHtcbiAgaWYgKCF3aGF0KVxuICAgIHRocm93IG5ldyBFcnJvcignRmFsc3kgYXN5bmMgc291cmNlIHdpbGwgbmV2ZXIgYmUgcmVhZHlcXG5cXG4nICsgSlNPTi5zdHJpbmdpZnkod2hhdCkpO1xuICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG9uY2U8VD4ocDogUHJvbWlzZTxUPikge1xuICB5aWVsZCBwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hlbjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+KGNvbnRhaW5lcjogRWxlbWVudCwgLi4uc291cmNlczogUyk6IFdoZW5SZXR1cm48Uz4ge1xuICBpZiAoIXNvdXJjZXMgfHwgc291cmNlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSkgYXMgdW5rbm93biBhcyBXaGVuUmV0dXJuPFM+O1xuICB9XG5cbiAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICA/IHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpXG4gICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICA/IG9uY2Uod2hhdClcbiAgICAgICAgOiB3aGF0KTtcblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICBjb25zdCBzdGFydDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHt9PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHN0YXJ0LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfSlcbiAgICAgIH1cbiAgICB9O1xuICAgIGl0ZXJhdG9ycy5wdXNoKHN0YXJ0KTtcbiAgfVxuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgIGNvbnN0IHdhdGNoU2VsZWN0b3JzID0gc291cmNlcy5maWx0ZXIoaXNWYWxpZFdoZW5TZWxlY3RvcikubWFwKHdoYXQgPT4gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCk/LlswXSk7XG5cbiAgICBmdW5jdGlvbiBpc01pc3Npbmcoc2VsOiBDU1NJZGVudGlmaWVyIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHNlbCBpcyBDU1NJZGVudGlmaWVyIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHR5cGVvZiBzZWwgPT09ICdzdHJpbmcnICYmICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcbiAgICB9XG5cbiAgICBjb25zdCBtaXNzaW5nID0gd2F0Y2hTZWxlY3RvcnMuZmlsdGVyKGlzTWlzc2luZyk7XG5cbiAgICBsZXQgZXZlbnRzOiBBc3luY0l0ZXJhdG9yPGFueSwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy50aHJvdykgcmV0dXJuIGV2ZW50cy50aHJvdyhleCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICB9LFxuICAgICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8ucmV0dXJuKSByZXR1cm4gZXZlbnRzLnJldHVybih2KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgfSxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGlmIChldmVudHMpIHJldHVybiBldmVudHMubmV4dCgpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgbWlzc2luZykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogKG5ldmVyR29ubmFIYXBwZW48V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgICAgICAgICAvLyBOb3cgZXZlcnl0aGluZyBpcyByZWFkeSwgd2Ugc2ltcGx5IGRlbGVnYXRlIGFsbCBhc3luYyBvcHMgdG8gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvciBcImV2ZW50c1wiXG4gICAgICAgICAgZXZlbnRzID0gbWVyZ2VkW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhhaSkpO1xuICB9XG5cbiAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgIDogKG5ldmVyR29ubmFIYXBwZW48V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKG1lcmdlZCkpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50SXNJbkRPTShlbHQ6IEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKGVsdC5pc0Nvbm5lY3RlZClcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKGVsdC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGlmIChzZWxlY3RvcnM/Lmxlbmd0aClcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXIsIHNlbGVjdG9ycyksXG4gICAgICBlbGVtZW50SXNJbkRPTShjb250YWluZXIpXG4gICAgXSk7XG4gIHJldHVybiBlbGVtZW50SXNJbkRPTShjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBhbGxTZWxlY3RvcnNQcmVzZW50KGNvbnRhaW5lcjogRWxlbWVudCwgbWlzc2luZzogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbWlzc2luZyA9IG1pc3NpbmcuZmlsdGVyKHNlbCA9PiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSlcbiAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90aGluZyBpcyBtaXNzaW5nXG4gIH1cblxuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICBpZiAobWlzc2luZy5ldmVyeShzZWwgPT4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSkpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlXG4gIH0pKTtcblxuICAvKiBkZWJ1Z2dpbmcgaGVscDogd2FybiBpZiB3YWl0aW5nIGEgbG9uZyB0aW1lIGZvciBhIHNlbGVjdG9ycyB0byBiZSByZWFkeSAqL1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBcIk1pc3Npbmcgc2VsZWN0b3JzIGFmdGVyIDUgc2Vjb25kczpcIik7XG4gICAgY29uc3Qgd2FyblRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oc3RhY2ssIG1pc3NpbmcpO1xuICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwgImltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IElnbm9yZSwgYXN5bmNJdGVyYXRvciwgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSwgaXNBc3luY0l0ZXIsIGlzQXN5bmNJdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3JzLmpzJztcbmltcG9ydCB7IFdoZW5QYXJhbWV0ZXJzLCBXaGVuUmV0dXJuLCB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmltcG9ydCB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcblxuLyogRXhwb3J0IHVzZWZ1bCBzdHVmZiBmb3IgdXNlcnMgb2YgdGhlIGJ1bmRsZWQgY29kZSAqL1xuZXhwb3J0IHsgd2hlbiB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgdHlwZSB7IENoaWxkVGFncywgSW5zdGFuY2UsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcydcbmV4cG9ydCAqIGFzIEl0ZXJhdG9ycyBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcblxuY29uc3QgbG9nTm9kZSA9IERFQlVHID8gKChuOiBOb2RlKSA9PiBgXCIkeydpbm5lckhUTUwnIGluIG4gPyBuLmlubmVySFRNTCA6IG4udGV4dENvbnRlbnR9XCJgKSA6IChuOiBOb2RlKT0+dW5kZWZpbmVkO1xuXG4vKiBBIGhvbGRlciBmb3IgY29tbW9uUHJvcGVydGllcyBzcGVjaWZpZWQgd2hlbiBgdGFnKC4uLnApYCBpcyBpbnZva2VkLCB3aGljaCBhcmUgYWx3YXlzXG4gIGFwcGxpZWQgKG1peGVkIGluKSB3aGVuIGFuIGVsZW1lbnQgaXMgY3JlYXRlZCAqL1xudHlwZSBUYWdGdW5jdGlvbk9wdGlvbnM8T3RoZXJNZW1iZXJzIGV4dGVuZHMge30gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM6IE90aGVyTWVtYmVyc1xufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8qIGFsc29cbiAgc2V0IGF0dHJpYnV0ZXMoLi4ucG9zc2libGUgYXR0cmlidXRlcyk7IC8vIGhhcyB0byBiZSBlbmNsb3NlZCBieSB0YWcoKSB0byBhY2Nlc3MgYXNzaWduUHJvcHNcbiAgKi9cbn1cblxuLy8gU3VwcG9ydCBmb3IgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaHRtIChvciBpbXBvcnQgaHRtIGZyb20gJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vaHRtL2Rpc3QvaHRtLm1vZHVsZS5qcycpXG4vLyBOb3RlOiBzYW1lIHNpZ25hdHVyZSBhcyBSZWFjdC5jcmVhdGVFbGVtZW50XG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUVsZW1lbnQge1xuICAvLyBTdXBwb3J0IGZvciBodG0sIEpTWCwgZXRjXG4gIGNyZWF0ZUVsZW1lbnQoXG4gICAgLy8gXCJuYW1lXCIgY2FuIGEgSFRNTCB0YWcgc3RyaW5nLCBhbiBleGlzdGluZyBub2RlIChqdXN0IHJldHVybnMgaXRzZWxmKSwgb3IgYSB0YWcgZnVuY3Rpb25cbiAgICBuYW1lOiBUYWdDcmVhdG9yRnVuY3Rpb248RWxlbWVudD4gfCBOb2RlIHwga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLFxuICAgIC8vIFRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gaW5pdGlhbGlzZSB0aGUgbm9kZSAoaWYgYSBzdHJpbmcgb3IgZnVuY3Rpb24gLSBpZ25vcmUgaWYgaXQncyBhbHJlYWR5IGEgbm9kZSlcbiAgICBhdHRyczogYW55LFxuICAgIC8vIFRoZSBjaGlsZHJlblxuICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IE5vZGU7XG59XG5cbi8qIFRoZSBpbnRlcmZhY2UgdGhhdCBjcmVhdGVzIGEgc2V0IG9mIFRhZ0NyZWF0b3JzIGZvciB0aGUgc3BlY2lmaWVkIERPTSB0YWdzICovXG5pbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIixcImFiYnJcIixcImFkZHJlc3NcIixcImFyZWFcIixcImFydGljbGVcIixcImFzaWRlXCIsXCJhdWRpb1wiLFwiYlwiLFwiYmFzZVwiLFwiYmRpXCIsXCJiZG9cIixcImJsb2NrcXVvdGVcIixcImJvZHlcIixcImJyXCIsXCJidXR0b25cIixcbiAgXCJjYW52YXNcIixcImNhcHRpb25cIixcImNpdGVcIixcImNvZGVcIixcImNvbFwiLFwiY29sZ3JvdXBcIixcImRhdGFcIixcImRhdGFsaXN0XCIsXCJkZFwiLFwiZGVsXCIsXCJkZXRhaWxzXCIsXCJkZm5cIixcImRpYWxvZ1wiLFwiZGl2XCIsXG4gIFwiZGxcIixcImR0XCIsXCJlbVwiLFwiZW1iZWRcIixcImZpZWxkc2V0XCIsXCJmaWdjYXB0aW9uXCIsXCJmaWd1cmVcIixcImZvb3RlclwiLFwiZm9ybVwiLFwiaDFcIixcImgyXCIsXCJoM1wiLFwiaDRcIixcImg1XCIsXCJoNlwiLFwiaGVhZFwiLFxuICBcImhlYWRlclwiLFwiaGdyb3VwXCIsXCJoclwiLFwiaHRtbFwiLFwiaVwiLFwiaWZyYW1lXCIsXCJpbWdcIixcImlucHV0XCIsXCJpbnNcIixcImtiZFwiLFwibGFiZWxcIixcImxlZ2VuZFwiLFwibGlcIixcImxpbmtcIixcIm1haW5cIixcIm1hcFwiLFxuICBcIm1hcmtcIixcIm1lbnVcIixcIm1ldGFcIixcIm1ldGVyXCIsXCJuYXZcIixcIm5vc2NyaXB0XCIsXCJvYmplY3RcIixcIm9sXCIsXCJvcHRncm91cFwiLFwib3B0aW9uXCIsXCJvdXRwdXRcIixcInBcIixcInBpY3R1cmVcIixcInByZVwiLFxuICBcInByb2dyZXNzXCIsXCJxXCIsXCJycFwiLFwicnRcIixcInJ1YnlcIixcInNcIixcInNhbXBcIixcInNjcmlwdFwiLFwic2VhcmNoXCIsXCJzZWN0aW9uXCIsXCJzZWxlY3RcIixcInNsb3RcIixcInNtYWxsXCIsXCJzb3VyY2VcIixcInNwYW5cIixcbiAgXCJzdHJvbmdcIixcInN0eWxlXCIsXCJzdWJcIixcInN1bW1hcnlcIixcInN1cFwiLFwidGFibGVcIixcInRib2R5XCIsXCJ0ZFwiLFwidGVtcGxhdGVcIixcInRleHRhcmVhXCIsXCJ0Zm9vdFwiLFwidGhcIixcInRoZWFkXCIsXCJ0aW1lXCIsXG4gIFwidGl0bGVcIixcInRyXCIsXCJ0cmFja1wiLFwidVwiLFwidWxcIixcInZhclwiLFwidmlkZW9cIixcIndiclwiXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBlbGVtZW50UHJvdHlwZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHtcbiAgZ2V0IGlkcygpIHtcbiAgICByZXR1cm4gZ2V0RWxlbWVudElkTWFwKHRoaXMpO1xuICB9LFxuICBzZXQgaWRzKHY6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBpZHMgb24gJyArIHRoaXMudmFsdWVPZigpKTtcbiAgfSxcbiAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICB9XG59IGFzIFBvRWxlbWVudE1ldGhvZHMgJiBUaGlzVHlwZTxFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz4pO1xuXG5jb25zdCBwb1N0eWxlRWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpO1xucG9TdHlsZUVsdC5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzLVwiO1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuXG5leHBvcnQgY29uc3QgdGFnID0gPFRhZ0xvYWRlcj5mdW5jdGlvbiA8VGFncyBleHRlbmRzIHN0cmluZyxcbiAgVDEgZXh0ZW5kcyAoc3RyaW5nIHwgVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgVDIgZXh0ZW5kcyAoVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgUSBleHRlbmRzIHt9XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XTtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIoZG9jdW1lbnQsJ3JlbW92ZWROb2RlcycpO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgY2FsbGVkICovXG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAgZWxlbWVudFByb3R5cGVcbiAgKTtcblxuICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsJ2F0dHJpYnV0ZXMnKSxcbiAgICBzZXQodGhpczogRWxlbWVudCwgYTogb2JqZWN0KSB7XG4gICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9ICgpPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4gZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyKSksXG4gICAgICAgICAgKHg6YW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oeCxsb2dOb2RlKGcpKTtcbiAgICAgICAgICAgIGcucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogeH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1a255IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYykgY2hpbGRyZW4oZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG5cbiAgICAgICAgbGV0IHQgPSBkcG0ubGVuZ3RoID8gZHBtIDogW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIGFwcGVuZGVkLnB1c2goLi4udCk7XG4gICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpIGFzIENoaWxkTm9kZVtdO1xuICAgICAgICAgIGlmIChuLmxlbmd0aCkge1xuICAgICAgICAgICAgdCA9IFtEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiBlcnJvclZhbHVlfSldO1xuICAgICAgICAgICAgblswXS5yZXBsYWNlV2l0aCguLi50KTsgLy9hcHBlbmRCZWZvcmUoblswXSwgLi4udCk7XG4gICAgICAgICAgICBuLnNsaWNlKDEpLmZvckVhY2goZSA9PiBlPy5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgY29uc29sZS53YXJuKCBcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCBjcmVhdGVkQnksIHQubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICB0ID0gW107XG4gICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDxDaGlsZFRhZ3M+KSA9PiB7XG4gICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDaGlsZE5vZGVbXSwgc2luY2Ugd2UgdGVzdGVkIC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gdCA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGggfHwgdC5ldmVyeShlID0+IHJlbW92ZWROb2RlcyhlKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBBc3luYyBlbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsY3JlYXRlZEJ5LCB0Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdCA9IG5vZGVzKHVuYm94KGVzLnZhbHVlKSBhcyBDaGlsZFRhZ3MpO1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgaXRlcmF0ZWQgZXhwcmVzc2lvbiB5aWVsZHMgbm8gbm9kZXMsIHN0dWZmIGluIGEgRG9tUHJvbWlzZUNvbnRhaW5lciBmb3IgdGhlIG5leHQgaXRlcmF0aW9uXG4gICAgICAgICAgICAgIGlmICghdC5sZW5ndGgpIHQucHVzaChEb21Qcm9taXNlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgICAoblswXSBhcyBDaGlsZE5vZGUpLnJlcGxhY2VXaXRoKC4uLnQpO1xuICAgICAgICAgICAgICBuLnNsaWNlKDEpLmZvckVhY2goZSA9PiAhdC5pbmNsdWRlcyhlKSAmJiBlLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgd2VudCB3cm9uZy4gVGVybWluYXRlIHRoZSBpdGVyYXRvciBzb3VyY2VcbiAgICAgICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgICAgICBhcC5yZXR1cm4/LihleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcHBlbmRlZC5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgIH0pKGMpO1xuICAgIHJldHVybiBhcHBlbmRlZDtcbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcse1xuICAgICAgbm9kZXMsICAgIC8vIEJ1aWxkIERPTSBOb2RlW10gZnJvbSBDaGlsZFRhZ3NcbiAgICAgIFVuaXF1ZUlEXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciBhcyBhIGNoaWxkXCIsIGssIGxvZ05vZGUodmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oIFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94KGE6IHVua25vd24pOiB1bmtub3duIHtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsdW5ib3gpIDogdjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IE5vZGUsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoKGEsYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCxhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKHYgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhpcyBwcm9taXNlIHJlc29sdmVkIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2KSkge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHYsIGspO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBzZXQgYXR0cmlidXRlXCIsIGVycm9yKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybiggXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZTogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlczogSXRlcmF0b3JSZXN1bHQ8dW5rbm93bj4pID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc3REZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKTtcbiAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNyYyBpcyBub3QgYW4gb2JqZWN0IChvciBpcyBudWxsKSAtIGp1c3QgYXNzaWduIGl0LCB1bmxlc3MgaXQncyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gYmFzZS5pc0Nvbm5lY3RlZDtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBiZWVuIG1vdW50ZWQgYmVmb3JlLCBiaXQgYXJlbid0IG5vdywgcmVtb3ZlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICBpZiAocmVtb3ZlZE5vZGVzKGJhc2UpIHx8ICghbm90WWV0TW91bnRlZCAmJiAhbW91bnRlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgdG86XFxuJHtsb2dOb2RlKGJhc2UpfWApO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oIFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgY3JlYXRlZEJ5LCBsb2dOb2RlKGJhc2UpKTtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduT2JqZWN0KHZhbHVlOiBhbnksIGs6IHN0cmluZykge1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzXCIsIGssIGxvZ05vZGUodmFsdWUpKTtcbiAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZFtrXSA9IGNvcHk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspPy5zZXQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6e1xuICAgIGRlYnVnZ2VyPzogdW5rbm93bjtcbiAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gICAgW2s6IHN0cmluZ106IHVua25vd247XG4gIH0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG4gIGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICAgIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICAgIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gICAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG4gIH1cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LF9vdmVycmlkZXMsaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikrKGlkQ291bnQrKykudG9TdHJpbmcoMzYpK01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGxldCBzdGF0aWNFeHRlbnNpb25zOiBPdmVycmlkZXMgPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAvKiBcIlN0YXRpY2FsbHlcIiBjcmVhdGUgYW55IHN0eWxlcyByZXF1aXJlZCBieSB0aGlzIHdpZGdldCAqL1xuICAgIGlmIChzdGF0aWNFeHRlbnNpb25zLnN0eWxlcykge1xuICAgICAgcG9TdHlsZUVsdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIWRvY3VtZW50LmhlYWQuY29udGFpbnMocG9TdHlsZUVsdCkpIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChwb1N0eWxlRWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKSA7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrICB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGZ1bmN0aW9uIGlzQW5jZXN0cmFsKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGQ6IHN0cmluZykge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYgZCBpbiBmLmRlZmluaXRpb24uZGVjbGFyZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLmRlY2xhcmUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkuZmlsdGVyKGQgPT4gKGQgaW4gZSkgfHwgaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLGQpKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIHRhZ0RlZmluaXRpb24uaXRlcmFibGUgJiYgT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5pdGVyYWJsZSkuZm9yRWFjaChrID0+IHtcbiAgICAgICAgaWYgKGsgaW4gZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBJZ25vcmluZyBhdHRlbXB0IHRvIHJlLWRlZmluZSBpdGVyYWJsZSBwcm9wZXJ0eSBcIiR7a31cIiBhcyBpdCBjb3VsZCBhbHJlYWR5IGhhdmUgY29uc3VtZXJzYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgaWYgKCEoIW5vQXR0cnMgJiYgayBpbiBhdHRycyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV07XG4gICAgICAgICAgICAgIGlmICh2YWx1ZT8udmFsdWVPZigpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBlW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csJy0nKSArIGNhbGxTaXRlK1wiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgICAgcmV0dXJuIChuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IG5vZGVzKC4uLmNoaWxkcmVuKVxuICAgICAgICAgIDogdHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicgPyBuYW1lKGF0dHJzLCBjaGlsZHJlbilcbiAgICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICAgIDogbmFtZSBpbnN0YW5jZW9mIE5vZGUgPyBuYW1lXG4gICAgICAgICAgOiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogbmV3IEVycm9yKFwiSWxsZWdhbCB0eXBlIGluIGNyZWF0ZUVsZW1lbnQ6XCIgKyBuYW1lKX0pKSBhcyBOb2RlXG4gICAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oazogSyk6IFRhZ0NyZWF0b3I8USAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWc8RSBleHRlbmRzIEVsZW1lbnQ+KGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIEUgJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnKGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIE5hbWVzcGFjZWRFbGVtZW50QmFzZSAmIFBvRWxlbWVudE1ldGhvZHM+IHtcbiAgICBpZiAoYmFzZVRhZ0NyZWF0b3JzW2tdKVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXTtcblxuICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnM6IFEgJiBQb0VsZW1lbnRNZXRob2RzICYgUGFydGlhbDx7XG4gICAgICBkZWJ1Z2dlcj86IGFueTtcbiAgICAgIGRvY3VtZW50PzogRG9jdW1lbnQ7XG4gICAgfT4gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4ge1xuICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQoYXR0cnMpO1xuICAgICAgICBhdHRycyA9IHt9IGFzIGFueTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICBkZWxldGUgYXR0cnMuZGVidWdnZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UgYXMgc3RyaW5nLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKT0+eyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBpbnZva2UgbmF0aXZlIGVsZW1lbmV0IGNvbnN0cnVjdG9ycyBkaXJlY3RseS4gVXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cIikgfSxcbiAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICB9XG5cbiAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufVxuXG5mdW5jdGlvbiBEb21Qcm9taXNlQ29udGFpbmVyKCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChERUJVRyA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiIDogXCJwcm9taXNlXCIpXG59XG5cbmZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06eyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj59KSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicrSlNPTi5zdHJpbmdpZnkoZXJyb3IsbnVsbCwyKSk7XG59XG5cbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHt9IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChcbiAgICAgICAgICByZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0LmlzQ29ubmVjdGVkKS5mb3JFYWNoKFxuICAgICAgICAgICAgICBlbHQgPT4ge1xuICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4pe1xuICBjb25zdCB0cmFja2VkID0gbmV3IFdlYWtTZXQ8Tm9kZT4oKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3Qpe1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbS5yZW1vdmVkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGU6IE5vZGUpIHtcbiAgICByZXR1cm4gdHJhY2tlZC5oYXMobm9kZSk7XG4gIH1cbn1cblxuY29uc3Qgd2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkTWFwKG5vZGU/OiBFbGVtZW50IHwgRG9jdW1lbnQsIGlkcz86IFJlY29yZDxzdHJpbmcsIEVsZW1lbnQ+KSB7XG4gIG5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuICBpZHMgPSBpZHMgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIikuZm9yRWFjaChmdW5jdGlvbiAoZWx0KSB7XG4gICAgICBpZiAoZWx0LmlkKSB7XG4gICAgICAgIGlmICghaWRzIVtlbHQuaWRdKVxuICAgICAgICAgIGlkcyFbZWx0LmlkXSA9IGVsdDtcbiAgICAgICAgZWxzZSBpZiAoREVCVUcpIHtcbiAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMoZWx0LmlkKSkge1xuICAgICAgICAgICAgd2FybmVkLmFkZChlbHQuaWQpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQgLyosIGVsdCwgaWRzIVtlbHQuaWRdKi8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBpZHM7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQ08sSUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixLQUFLO0FBRXJILElBQU0sY0FBYztBQUUzQixJQUFNLFdBQVc7QUFBQSxFQUNmLE9BQU8sTUFBVztBQUNoQixRQUFJLE1BQU8sU0FBUSxJQUFJLGdCQUFnQixHQUFHLElBQUk7QUFBQSxFQUNoRDtBQUFBLEVBQ0EsUUFBUSxNQUFXO0FBQ2pCLFFBQUksTUFBTyxTQUFRLEtBQUssaUJBQWlCLEdBQUcsSUFBSTtBQUFBLEVBQ2xEO0FBQUEsRUFDQSxRQUFRLE1BQVc7QUFDakIsUUFBSSxNQUFPLFNBQVEsTUFBTSxpQkFBaUIsR0FBRyxJQUFJO0FBQUEsRUFDbkQ7QUFDRjs7O0FDTkEsSUFBTSxVQUFVLENBQUMsTUFBUztBQUFDO0FBRXBCLFNBQVMsV0FBa0M7QUFDaEQsTUFBSSxVQUErQztBQUNuRCxNQUFJLFNBQStCO0FBQ25DLFFBQU0sVUFBVSxJQUFJLFFBQVcsSUFBSSxNQUFNLENBQUMsU0FBUyxNQUFNLElBQUksQ0FBQztBQUM5RCxVQUFRLFVBQVU7QUFDbEIsVUFBUSxTQUFTO0FBQ2pCLE1BQUksT0FBTztBQUNULFVBQU0sZUFBZSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxZQUFRLE1BQU0sUUFBTyxjQUFjLFNBQVMsSUFBSSxpQkFBaUIsUUFBUyxTQUFRLElBQUksc0JBQXNCLElBQUksaUJBQWlCLFlBQVksSUFBSSxNQUFTO0FBQUEsRUFDNUo7QUFDQSxTQUFPO0FBQ1Q7QUFHTyxTQUFTLGFBQWEsR0FBNEI7QUFDdkQsU0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLE9B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O0FBQUEsRUFBTztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBVTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBSTtBQUFBLEVBQU87QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQWE7QUFBQSxFQUFPO0FBQUEsRUFBSztBQUFBLEVBQ3RHO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQU07QUFBQSxFQUFXO0FBQUEsRUFBTztBQUFBLEVBQVc7QUFBQSxFQUFLO0FBQUEsRUFBTTtBQUFBLEVBQVU7QUFBQSxFQUFNO0FBQUEsRUFBUztBQUFBLEVBQ3hHO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBUTtBQUFBLEVBQVc7QUFBQSxFQUFhO0FBQUEsRUFBUztBQUFBLEVBQVM7QUFBQSxFQUFPO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFLO0FBQUEsRUFDdEc7QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQUs7QUFBQSxFQUFPO0FBQUEsRUFBSTtBQUFBLEVBQVM7QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUN6RztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBTztBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFLO0FBQUEsRUFBVztBQUFBLEVBQVM7QUFBQSxFQUFTO0FBQUEsRUFBSTtBQUFBLEVBQVU7QUFBQSxFQUN2RztBQUFBLEVBQVc7QUFBQSxFQUFJO0FBQUEsRUFBSztBQUFBLEVBQUs7QUFBQSxFQUFPO0FBQUEsRUFBSTtBQUFBLEVBQU87QUFBQSxFQUFTO0FBQUEsRUFBUztBQUFBLEVBQVU7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFDeEc7QUFB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SSxLQUFLLGtCQUFrQjtBQUN6QixTQUFLLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxTQUFVLEtBQUs7QUFDbkQsVUFBSSxJQUFJLElBQUk7QUFDVixZQUFJLENBQUMsSUFBSyxJQUFJLEVBQUU7QUFDZCxjQUFLLElBQUksRUFBRSxJQUFJO0FBQUEsaUJBQ1IsT0FBTztBQUNkLGNBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDdkIsbUJBQU8sSUFBSSxJQUFJLEVBQUU7QUFDakIscUJBQVE7QUFBQSxjQUFLO0FBQUEsY0FBaUMsSUFBSTtBQUFBO0FBQUEsWUFBMEI7QUFBQSxVQUM5RTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJpc01pc3NpbmciLCAibWVyZ2VkIiwgImMiLCAibiIsICJ2YWx1ZSIsICJpc0FuY2VzdHJhbCIsICJjaGlsZHJlbiJdCn0K
