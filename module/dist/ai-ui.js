"use strict";
var AIUI = (() => {
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
    enableOnRemovedFromDOM: () => enableOnRemovedFromDOM,
    getElementIdMap: () => getElementIdMap,
    tag: () => tag,
    when: () => when
  });

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
    return typeof o?.next === "function";
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
  var queue_pending = Symbol("pending");
  var queue_items = Symbol("items");
  function internalQueueIteratableIterator(stop = () => {
  }) {
    const q = {
      [queue_pending]: [],
      [queue_items]: [],
      [Symbol.asyncIterator]() {
        return q;
      },
      next() {
        if (q[queue_items]?.length) {
          return Promise.resolve(q[queue_items].shift());
        }
        const value = deferred();
        value.catch((ex) => {
        });
        q[queue_pending].unshift(value);
        return value;
      },
      return(v) {
        const value = { done: true, value: void 0 };
        if (q[queue_pending]) {
          try {
            stop();
          } catch (ex) {
          }
          while (q[queue_pending].length)
            q[queue_pending].pop().resolve(value);
          q[queue_items] = q[queue_pending] = null;
        }
        return Promise.resolve(value);
      },
      throw(...args) {
        const value = { done: true, value: args[0] };
        if (q[queue_pending]) {
          try {
            stop();
          } catch (ex) {
          }
          while (q[queue_pending].length)
            q[queue_pending].pop().reject(value);
          q[queue_items] = q[queue_pending] = null;
        }
        return Promise.reject(value);
      },
      get length() {
        if (!q[queue_items]) return -1;
        return q[queue_items].length;
      },
      push(value) {
        if (!q[queue_pending])
          return false;
        if (q[queue_pending].length) {
          q[queue_pending].pop().resolve({ done: false, value });
        } else {
          if (!q[queue_items]) {
            _console.log("Discarding queue push as there are no consumers");
          } else {
            q[queue_items].push({ done: false, value });
          }
        }
        return true;
      }
    };
    return iterableHelpers(q);
  }
  var queue_inflight = Symbol("inflight");
  function internalDebounceQueueIteratableIterator(stop = () => {
  }) {
    const q = internalQueueIteratableIterator(stop);
    q[queue_inflight] = /* @__PURE__ */ new Set();
    q.push = function(value) {
      if (!q[queue_pending])
        return false;
      if (q[queue_inflight].has(value))
        return true;
      q[queue_inflight].add(value);
      if (q[queue_pending].length) {
        const p = q[queue_pending].pop();
        p.finally(() => q[queue_inflight].delete(value));
        p.resolve({ done: false, value });
      } else {
        if (!q[queue_items]) {
          _console.log("Discarding queue push as there are no consumers");
        } else if (!q[queue_items].find((v) => v === value)) {
          q[queue_items].push({ done: false, value });
        }
      }
      return true;
    };
    return q;
  }
  var queueIteratableIterator = internalQueueIteratableIterator;
  var debounceQueueIteratableIterator = internalDebounceQueueIteratableIterator;
  var ProxiedAsyncIterator = Symbol("ProxiedAsyncIterator");
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
      if (!(ProxiedAsyncIterator in a))
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
              _console.log("piped push", y);
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
        _console.log("set push", v2);
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
            toJSON: { value() {
              return a2.valueOf();
            }, writable: true }
          }));
        case "object":
          return boxObject(a2, pds);
      }
      throw new TypeError('Iterable properties cannot be of type "' + typeof a2 + '"');
    }
    function isProxiedAsyncIterator(o) {
      return isObjectLike(o) && ProxiedAsyncIterator in o;
    }
    function destructure(o, path) {
      const fields = path.split(".").slice(1);
      for (let i = 0; i < fields.length; i++) o = o?.[fields[i]];
      return o;
    }
    function boxObject(a2, pds) {
      const keyIterator = /* @__PURE__ */ new Map();
      const withPath = filterMap(pds, (o) => isProxiedAsyncIterator(o) ? o[ProxiedAsyncIterator] : { a: o, path: "" });
      const withoutPath = filterMap(pds, (o) => isProxiedAsyncIterator(o) ? o[ProxiedAsyncIterator].a : o);
      function handler(path = "") {
        return {
          has(target, key) {
            return key === ProxiedAsyncIterator || key in target || key in pds;
          },
          get(target, key, receiver) {
            if (key === "valueOf") return () => destructure(a2, path);
            if (key in pds) {
              if (!path.length) {
                return withoutPath[key];
              }
              let ai = keyIterator.get(path);
              if (!ai) {
                ai = filterMap(withPath, (o, p) => {
                  const v2 = destructure(o.a, path);
                  return p !== v2 || o.path.startsWith(path) ? v2 : Ignore;
                }, Ignore, destructure(a2, path));
                keyIterator.set(path, ai);
              }
              return ai[key];
            }
            if (typeof key === "string") {
              if (Object.hasOwn(target, key)) {
                return new Proxy(Object(Reflect.get(target, key, receiver)), handler(path + "." + key));
              }
              if (!(key in target)) {
                return new Proxy({}, handler(path + "." + key));
              }
            }
            return Reflect.get(target, key, receiver);
          },
          set(target, key, value, receiver) {
            if (key in pds) {
              throw new Error(`Cannot set iterable property ${name.toString()}${path}.${key.toString()} as it is part of asyncIterator`);
            }
            if (Reflect.get(target, key, receiver) !== value) {
              push({ [ProxiedAsyncIterator]: { a: a2, path } });
            }
            return Reflect.set(target, key, value, receiver);
          },
          deleteProperty(target, key) {
            if (key in pds) {
              throw new Error(`Cannot set iterable property ${name.toString()}${path}.${key.toString()} as it is part of asyncIterator`);
            }
            if (Object.hasOwn(target, key))
              push({ [ProxiedAsyncIterator]: { a: a2, path } });
            return Reflect.deleteProperty(target, key);
          }
        };
      }
      return new Proxy(a2, handler());
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
          appended.push(...dpm);
          let t = dpm;
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
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUcgPyAoKG46IE5vZGUpID0+IGBcIiR7J2lubmVySFRNTCcgaW4gbiA/IG4uaW5uZXJIVE1MIDogbi50ZXh0Q29udGVudH1cImApIDogKG46IE5vZGUpPT51bmRlZmluZWQ7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG50eXBlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyB7fSA9IHt9PiA9IHtcbiAgY29tbW9uUHJvcGVydGllczogT3RoZXJNZW1iZXJzXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbiAgLyogYWxzb1xuICBzZXQgYXR0cmlidXRlcyguLi5wb3NzaWJsZSBhdHRyaWJ1dGVzKTsgLy8gaGFzIHRvIGJlIGVuY2xvc2VkIGJ5IHRhZygpIHRvIGFjY2VzcyBhc3NpZ25Qcm9wc1xuICAqL1xufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmludGVyZmFjZSBUYWdMb2FkZXIge1xuICBub2RlcyguLi5jOiBDaGlsZFRhZ3NbXSk6IChOb2RlIHwgKC8qUCAmKi8gKEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzKSkpW107XG4gIFVuaXF1ZUlEOiB0eXBlb2YgVW5pcXVlSURcblxuICAvKlxuICAgU2lnbmF0dXJlcyBmb3IgdGhlIHRhZyBsb2FkZXIuIEFsbCBwYXJhbXMgYXJlIG9wdGlvbmFsIGluIGFueSBjb21iaW5hdGlvbixcbiAgIGJ1dCBtdXN0IGJlIGluIG9yZGVyOlxuICAgICAgdGFnKFxuICAgICAgICAgID9uYW1lU3BhY2U/OiBzdHJpbmcsICAvLyBhYnNlbnQgbmFtZVNwYWNlIGltcGxpZXMgSFRNTFxuICAgICAgICAgID90YWdzPzogc3RyaW5nW10sICAgICAvLyBhYnNlbnQgdGFncyBkZWZhdWx0cyB0byBhbGwgY29tbW9uIEhUTUwgdGFnc1xuICAgICAgICAgID9jb21tb25Qcm9wZXJ0aWVzPzogQ29tbW9uUHJvcGVydGllc0NvbnN0cmFpbnQgLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyB7fT4odGFnczogVGFnc1tdLCBvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMge30+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLFwiYWJiclwiLFwiYWRkcmVzc1wiLFwiYXJlYVwiLFwiYXJ0aWNsZVwiLFwiYXNpZGVcIixcImF1ZGlvXCIsXCJiXCIsXCJiYXNlXCIsXCJiZGlcIixcImJkb1wiLFwiYmxvY2txdW90ZVwiLFwiYm9keVwiLFwiYnJcIixcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFwiY2FwdGlvblwiLFwiY2l0ZVwiLFwiY29kZVwiLFwiY29sXCIsXCJjb2xncm91cFwiLFwiZGF0YVwiLFwiZGF0YWxpc3RcIixcImRkXCIsXCJkZWxcIixcImRldGFpbHNcIixcImRmblwiLFwiZGlhbG9nXCIsXCJkaXZcIixcbiAgXCJkbFwiLFwiZHRcIixcImVtXCIsXCJlbWJlZFwiLFwiZmllbGRzZXRcIixcImZpZ2NhcHRpb25cIixcImZpZ3VyZVwiLFwiZm9vdGVyXCIsXCJmb3JtXCIsXCJoMVwiLFwiaDJcIixcImgzXCIsXCJoNFwiLFwiaDVcIixcImg2XCIsXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXCJoZ3JvdXBcIixcImhyXCIsXCJodG1sXCIsXCJpXCIsXCJpZnJhbWVcIixcImltZ1wiLFwiaW5wdXRcIixcImluc1wiLFwia2JkXCIsXCJsYWJlbFwiLFwibGVnZW5kXCIsXCJsaVwiLFwibGlua1wiLFwibWFpblwiLFwibWFwXCIsXG4gIFwibWFya1wiLFwibWVudVwiLFwibWV0YVwiLFwibWV0ZXJcIixcIm5hdlwiLFwibm9zY3JpcHRcIixcIm9iamVjdFwiLFwib2xcIixcIm9wdGdyb3VwXCIsXCJvcHRpb25cIixcIm91dHB1dFwiLFwicFwiLFwicGljdHVyZVwiLFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcInFcIixcInJwXCIsXCJydFwiLFwicnVieVwiLFwic1wiLFwic2FtcFwiLFwic2NyaXB0XCIsXCJzZWFyY2hcIixcInNlY3Rpb25cIixcInNlbGVjdFwiLFwic2xvdFwiLFwic21hbGxcIixcInNvdXJjZVwiLFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFwic3R5bGVcIixcInN1YlwiLFwic3VtbWFyeVwiLFwic3VwXCIsXCJ0YWJsZVwiLFwidGJvZHlcIixcInRkXCIsXCJ0ZW1wbGF0ZVwiLFwidGV4dGFyZWFcIixcInRmb290XCIsXCJ0aFwiLFwidGhlYWRcIixcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFwidHJcIixcInRyYWNrXCIsXCJ1XCIsXCJ1bFwiLFwidmFyXCIsXCJ2aWRlb1wiLFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IGVsZW1lbnRQcm90eXBlID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoe1xuICBnZXQgaWRzKCkge1xuICAgIHJldHVybiBnZXRFbGVtZW50SWRNYXAodGhpcyk7XG4gIH0sXG4gIHNldCBpZHModjogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IGlkcyBvbiAnICsgdGhpcy52YWx1ZU9mKCkpO1xuICB9LFxuICB3aGVuOiBmdW5jdGlvbiAoLi4ud2hhdCkge1xuICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gIH1cbn0gYXMgUG9FbGVtZW50TWV0aG9kcyAmIFRoaXNUeXBlPEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzPik7XG5cbmNvbnN0IHBvU3R5bGVFbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiU1RZTEVcIik7XG5wb1N0eWxlRWx0LmlkID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXMtXCI7XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgfHwgeCA9PT0gbnVsbFxuICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiB4ICYmIHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG4vKiB0YWcgKi9cbmNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IHJlbW92ZWROb2RlcyA9IG11dGF0aW9uVHJhY2tlcihkb2N1bWVudCwncmVtb3ZlZE5vZGVzJyk7XG5cbiAgY29uc3QgY29tbW9uUHJvcGVydGllcyA9IG9wdGlvbnM/LmNvbW1vblByb3BlcnRpZXM7XG4gIC8qIE5vdGU6IHdlIHVzZSBwcm9wZXJ0eSBkZWZpbnRpb24gKGFuZCBub3Qgb2JqZWN0IHNwcmVhZCkgc28gZ2V0dGVycyAobGlrZSBgaWRzYClcbiAgICBhcmUgbm90IGV2YWx1YXRlZCB1bnRpbCBjYWxsZWQgKi9cbiAgY29uc3QgdGFnUHJvdG90eXBlcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbCxcbiAgICBlbGVtZW50UHJvdHlwZVxuICApO1xuXG4gIC8vIFdlIGRvIHRoaXMgaGVyZSBhbmQgbm90IGluIGVsZW1lbnRQcm90eXBlIGFzIHRoZXJlJ3Mgbm8gc3ludGF4XG4gIC8vIHRvIGNvcHkgYSBnZXR0ZXIvc2V0dGVyIHBhaXIgZnJvbSBhbm90aGVyIG9iamVjdFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywgJ2F0dHJpYnV0ZXMnLCB7XG4gICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwnYXR0cmlidXRlcycpLFxuICAgIHNldCh0aGlzOiBFbGVtZW50LCBhOiBvYmplY3QpIHtcbiAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBjb25zdCBzdGVwID0gKCk9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oZXgpKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pIHtcbiAgICBjb25zdCBhcHBlbmRlZDogTm9kZVtdID0gW107XG4gICAgKGZ1bmN0aW9uIGNoaWxkcmVuKGM6IENoaWxkVGFncyk6IHZvaWQge1xuICAgICAgaWYgKGMgPT09IHVuZGVmaW5lZCB8fCBjID09PSBudWxsIHx8IGMgPT09IElnbm9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGlzUHJvbWlzZUxpa2UoYykpIHtcbiAgICAgICAgY29uc3QgZzogQ2hpbGROb2RlID0gRG9tUHJvbWlzZUNvbnRhaW5lcigpO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGcpO1xuICAgICAgICBjLnRoZW4ociA9PiBnLnJlcGxhY2VXaXRoKC4uLm5vZGVzKHIpKSxcbiAgICAgICAgICAoeDphbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybih4LGxvZ05vZGUoZykpO1xuICAgICAgICAgICAgZy5yZXBsYWNlV2l0aChEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiB4fSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIGFwcGVuZGVkLnB1c2goYyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgaGF2ZSBhbiBpbnRlcmVzdGluZyBjYXNlIGhlcmUgd2hlcmUgYW4gaXRlcmFibGUgU3RyaW5nIGlzIGFuIG9iamVjdCB3aXRoIGJvdGggU3ltYm9sLml0ZXJhdG9yXG4gICAgICAvLyAoaW5oZXJpdGVkIGZyb20gdGhlIFN0cmluZyBwcm90b3R5cGUpIGFuZCBTeW1ib2wuYXN5bmNJdGVyYXRvciAoYXMgaXQncyBiZWVuIGF1Z21lbnRlZCBieSBib3hlZCgpKVxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXNlcyBsaWtlIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdCwgYXJyYXksIGV0Yy4sIG5vdCB0aGUgZnVrbnkgb25lc1xuICAgICAgLy8gSXQgdXNlZCB0byBiZSBhZnRlciB0aGUgaXNBc3luY0l0ZXIoKSB0ZXN0LCBidXQgYSBub24tQXN5bmNJdGVyYXRvciAqbWF5KiBhbHNvIGJlIGEgc3luYyBpdGVyYWJsZVxuICAgICAgLy8gRm9yIG5vdywgd2UgZXhjbHVkZSAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgaW4gdGhpcyBjYXNlLlxuICAgICAgaWYgKGMgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBjICYmICEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgJiYgY1tTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBjKSBjaGlsZHJlbihkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBc3luY0l0ZXI8Q2hpbGRUYWdzPihjKSkge1xuICAgICAgICBjb25zdCBpbnNlcnRpb25TdGFjayA9IERFQlVHID8gKCdcXG4nICsgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgXCJJbnNlcnRpb24gOlwiKSkgOiAnJztcbiAgICAgICAgY29uc3QgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCBkcG0gPSAodW5ib3hlZCA9PT0gdW5kZWZpbmVkIHx8IHVuYm94ZWQgPT09IGMpID8gW0RvbVByb21pc2VDb250YWluZXIoKV0gOiBub2Rlcyh1bmJveGVkIGFzIENoaWxkVGFncylcbiAgICAgICAgYXBwZW5kZWQucHVzaCguLi5kcG0pO1xuXG4gICAgICAgIGxldCB0ID0gZHBtO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKSBhcyBDaGlsZE5vZGVbXTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHQgPSBbRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogZXJyb3JWYWx1ZX0pXTtcbiAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4udCk7IC8vYXBwZW5kQmVmb3JlKG5bMF0sIC4uLnQpO1xuICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybiggXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgY3JlYXRlZEJ5LCB0Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlczogSXRlcmF0b3JSZXN1bHQ8Q2hpbGRUYWdzPikgPT4ge1xuICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gQ2hpbGROb2RlW10sIHNpbmNlIHdlIHRlc3RlZCAucGFyZW50Tm9kZVxuICAgICAgICAgICAgICBjb25zdCBtb3VudGVkID0gdC5maWx0ZXIoZSA9PiBlPy5wYXJlbnROb2RlICYmIGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHQgOiBtb3VudGVkO1xuICAgICAgICAgICAgICBpZiAobW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIW4ubGVuZ3RoIHx8IHQuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMoZSkpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgICAgICB0ID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50OiBcIiArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgbm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciA1IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLGNyZWF0ZWRCeSwgdC5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICBpZiAoIXQubGVuZ3RoKSB0LnB1c2goRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgKG5bMF0gYXMgQ2hpbGROb2RlKS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpKTtcbiAgICB9KShjKTtcbiAgICByZXR1cm4gYXBwZW5kZWQ7XG4gIH1cblxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKCBcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveChhOiB1bmtub3duKTogdW5rbm93biB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KChhLGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oIFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2RlcyhiYXNlKSB8fCAoIW5vdFlldE1vdW50ZWQgJiYgIW1vdW50ZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBFbGVtZW50IGRvZXMgbm90IGV4aXN0IGluIGRvY3VtZW50IHdoZW4gc2V0dGluZyBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIHRvOlxcbiR7bG9nTm9kZShiYXNlKX1gKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW91bnRlZCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuXFxuRWxlbWVudCBjb250YWluczogJHtsb2dOb2RlKGJhc2UpfVxcbiR7Y3JlYXRlZEJ5fWApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCBcIkR5bmFtaWMgYXR0cmlidXRlIGVycm9yXCIsIGVycm9yVmFsdWUsIGssIGQsIGNyZWF0ZWRCeSwgbG9nTm9kZShiYXNlKSk7XG4gICAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvclZhbHVlKTtcbiAgICAgICAgICAgIGJhc2UuYXBwZW5kQ2hpbGQoRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlc1wiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICB0eXBlIEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzOntcbiAgICBkZWJ1Z2dlcj86IHVua25vd247XG4gICAgZG9jdW1lbnQ/OiBEb2N1bWVudDtcbiAgICBbY2FsbFN0YWNrU3ltYm9sXT86IE92ZXJyaWRlc1tdO1xuICAgIFtrOiBzdHJpbmddOiB1bmtub3duO1xuICB9IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IEVsZW1lbnRcblxuICBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgICBzdXBlcjogVGFnQ3JlYXRvcjxFbGVtZW50PjtcbiAgICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gICAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICAgIGV4dGVuZGVkOiAodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSA9PiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSxfb3ZlcnJpZGVzLGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpKyhpZENvdW50KyspLnRvU3RyaW5nKDM2KStNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgICAgaWYgKCFkb2N1bWVudC5oZWFkLmNvbnRhaW5zKHBvU3R5bGVFbHQpKSB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycykgO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayAgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBmdW5jdGlvbiBpc0FuY2VzdHJhbChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBkOiBzdHJpbmcpIHtcbiAgICAgICAgICBmb3IgKGxldCBmID0gY3JlYXRvcjsgZjsgZiA9IGYuc3VwZXIpXG4gICAgICAgICAgICBpZiAoZi5kZWZpbml0aW9uPy5kZWNsYXJlICYmIGQgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihkID0+IChkIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsZCkpO1xuICAgICAgICAgIGlmIChjbGFzaC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBEZWNsYXJlZCBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gYWxyZWFkeSBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpLmZpbHRlcihkID0+ICEoZCBpbiBlKSAmJiAhKGNvbW1vblByb3BlcnRpZXMgJiYgZCBpbiBjb21tb25Qcm9wZXJ0aWVzKSAmJiAhaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkoZSwgaywgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSFbayBhcyBrZXlvZiB0eXBlb2YgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZV0pXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXSA9PT0gbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgIGlmICghbm9BdHRycylcbiAgICAgICAgICBhc3NpZ25Qcm9wcyhlLCBhdHRycyk7XG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGJhc2U/LmNvbnN0cnVjdGVkPy5jYWxsKGUpO1xuICAgICAgICAgIGlmIChpc0NoaWxkVGFnKGNoaWxkcmVuKSkgLy8gdGVjaG5pY2FsbHkgbm90IG5lY2Vzc2FyeSwgc2luY2UgXCJ2b2lkXCIgaXMgZ29pbmcgdG8gYmUgdW5kZWZpbmVkIGluIDk5LjklIG9mIGNhc2VzLlxuICAgICAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoY2hpbGRyZW4pKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHRoZSBmdWxsIHRyZWUgb2YgYXVnbWVudGVkIERPTSBlbGVtZW50cyBoYXMgYmVlbiBjb25zdHJ1Y3RlZCwgZmlyZSBhbGwgdGhlIGl0ZXJhYmxlIHByb3BlZXJ0aWVzXG4gICAgICAgIC8vIHNvIHRoZSBmdWxsIGhpZXJhcmNoeSBnZXRzIHRvIGNvbnN1bWUgdGhlIGluaXRpYWwgc3RhdGUsIHVubGVzcyB0aGV5IGhhdmUgYmVlbiBhc3NpZ25lZFxuICAgICAgICAvLyBieSBhc3NpZ25Qcm9wcyBmcm9tIGEgZnV0dXJlXG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgICBpZiAoYmFzZS5pdGVyYWJsZSkgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGJhc2UuaXRlcmFibGUpKSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBzZWxmLWFzc2lnbiBpdGVyYWJsZXMgdGhhdCBoYXZlIHRoZW1zZWx2ZXMgYmVlbiBhc3NpZ25lZCB3aXRoIGZ1dHVyZXNcbiAgICAgICAgICAgIGlmICghKCFub0F0dHJzICYmIGsgaW4gYXR0cnMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdO1xuICAgICAgICAgICAgICBpZiAodmFsdWU/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgZVtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICBjb25zdCBleHRlbmRUYWc6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgPSBPYmplY3QuYXNzaWduKGV4dGVuZFRhZ0ZuLCB7XG4gICAgICBzdXBlcjogdGhpcyxcbiAgICAgIGRlZmluaXRpb246IE9iamVjdC5hc3NpZ24oc3RhdGljRXh0ZW5zaW9ucywgeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KSxcbiAgICAgIGV4dGVuZGVkLFxuICAgICAgdmFsdWVPZjogKCkgPT4ge1xuICAgICAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSB8fCB7fSksIC4uLk9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMuaXRlcmFibGUgfHwge30pXTtcbiAgICAgICAgcmV0dXJuIGAke2V4dGVuZFRhZy5uYW1lfTogeyR7a2V5cy5qb2luKCcsICcpfX1cXG4gXFx1MjFBQSAke3RoaXMudmFsdWVPZigpfWBcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIGNvbnN0IGZ1bGxQcm90byA9IHt9O1xuICAgIChmdW5jdGlvbiB3YWxrUHJvdG8oY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50Pikge1xuICAgICAgaWYgKGNyZWF0b3I/LnN1cGVyKVxuICAgICAgICB3YWxrUHJvdG8oY3JlYXRvci5zdXBlcik7XG5cbiAgICAgIGNvbnN0IHByb3RvID0gY3JlYXRvci5kZWZpbml0aW9uO1xuICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8ub3ZlcnJpZGUpO1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/LmRlY2xhcmUpO1xuICAgICAgfVxuICAgIH0pKHRoaXMpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLm92ZXJyaWRlKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHRlbmRUYWcsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGZ1bGxQcm90bykpO1xuXG4gICAgLy8gQXR0ZW1wdCB0byBtYWtlIHVwIGEgbWVhbmluZ2Z1O2wgbmFtZSBmb3IgdGhpcyBleHRlbmRlZCB0YWdcbiAgICBjb25zdCBjcmVhdG9yTmFtZSA9IGZ1bGxQcm90b1xuICAgICAgJiYgJ2NsYXNzTmFtZScgaW4gZnVsbFByb3RvXG4gICAgICAmJiB0eXBlb2YgZnVsbFByb3RvLmNsYXNzTmFtZSA9PT0gJ3N0cmluZydcbiAgICAgID8gZnVsbFByb3RvLmNsYXNzTmFtZVxuICAgICAgOiB1bmlxdWVUYWdJRDtcbiAgICBjb25zdCBjYWxsU2l0ZSA9IERFQlVHID8gKG5ldyBFcnJvcigpLnN0YWNrPy5zcGxpdCgnXFxuJylbMl0gPz8gJycpIDogJyc7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kVGFnLCBcIm5hbWVcIiwge1xuICAgICAgdmFsdWU6IFwiPGFpLVwiICsgY3JlYXRvck5hbWUucmVwbGFjZSgvXFxzKy9nLCctJykgKyBjYWxsU2l0ZStcIj5cIlxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBleHRyYVVua25vd25Qcm9wcyA9IE9iamVjdC5rZXlzKHN0YXRpY0V4dGVuc2lvbnMpLmZpbHRlcihrID0+ICFbJ3N0eWxlcycsICdpZHMnLCAnY29uc3RydWN0ZWQnLCAnZGVjbGFyZScsICdvdmVycmlkZScsICdpdGVyYWJsZSddLmluY2x1ZGVzKGspKTtcbiAgICAgIGlmIChleHRyYVVua25vd25Qcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXh0ZW5kVGFnLm5hbWV9IGRlZmluZXMgZXh0cmFuZW91cyBrZXlzICcke2V4dHJhVW5rbm93blByb3BzfScsIHdoaWNoIGFyZSB1bmtub3duYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBleHRlbmRUYWc7XG4gIH1cblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudChcbiAgICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgICBhdHRyczogYW55LFxuICAgICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZSB7XG4gICAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nID8gbmFtZShhdHRycywgY2hpbGRyZW4pXG4gICAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgbmFtZSBpbiBiYXNlVGFnQ3JlYXRvcnMgP1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgYmFzZVRhZ0NyZWF0b3JzW25hbWVdKGF0dHJzLCBjaGlsZHJlbilcbiAgICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICAgIDogRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSl9KSkgYXMgTm9kZVxuICAgICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFBhcnRpYWw8e1xuICAgICAgZGVidWdnZXI/OiBhbnk7XG4gICAgICBkb2N1bWVudD86IERvY3VtZW50O1xuICAgIH0+IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IHtcbiAgICAgIGxldCBkb2MgPSBkb2N1bWVudDtcbiAgICAgIGlmIChpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KGF0dHJzKTtcbiAgICAgICAgYXR0cnMgPSB7fSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgdGVzdCBpcyBhbHdheXMgdHJ1ZSwgYnV0IG5hcnJvd3MgdGhlIHR5cGUgb2YgYXR0cnMgdG8gYXZvaWQgZnVydGhlciBlcnJvcnNcbiAgICAgIGlmICghaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgaWYgKGF0dHJzLmRlYnVnZ2VyKSB7XG4gICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRycy5kb2N1bWVudCkge1xuICAgICAgICAgIGRvYyA9IGF0dHJzLmRvY3VtZW50O1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kb2N1bWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZVNwYWNlIGFzIHN0cmluZywgay50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIDogZG9jLmNyZWF0ZUVsZW1lbnQoayk7XG4gICAgICAgIGUuY29uc3RydWN0b3IgPSB0YWdDcmVhdG9yO1xuXG4gICAgICAgIGRlZXBEZWZpbmUoZSwgdGFnUHJvdG90eXBlcyk7XG4gICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcblxuICAgICAgICAvLyBBcHBlbmQgYW55IGNoaWxkcmVuXG4gICAgICAgIGUuYXBwZW5kKC4uLm5vZGVzKC4uLmNoaWxkcmVuKSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGluY2x1ZGluZ0V4dGVuZGVyID0gPFRhZ0NyZWF0b3I8RWxlbWVudD4+PHVua25vd24+T2JqZWN0LmFzc2lnbih0YWdDcmVhdG9yLCB7XG4gICAgICBzdXBlcjogKCk9PnsgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW52b2tlIG5hdGl2ZSBlbGVtZW5ldCBjb25zdHJ1Y3RvcnMgZGlyZWN0bHkuIFVzZSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXCIpIH0sXG4gICAgICBleHRlbmRlZCwgLy8gSG93IHRvIGV4dGVuZCB0aGlzIChiYXNlKSB0YWdcbiAgICAgIHZhbHVlT2YoKSB7IHJldHVybiBgVGFnQ3JlYXRvcjogPCR7bmFtZVNwYWNlIHx8ICcnfSR7bmFtZVNwYWNlID8gJzo6JyA6ICcnfSR7a30+YCB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnQ3JlYXRvciwgXCJuYW1lXCIsIHsgdmFsdWU6ICc8JyArIGsgKyAnPicgfSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba10gPSBpbmNsdWRpbmdFeHRlbmRlcjtcbiAgfVxuXG4gIHRhZ3MuZm9yRWFjaChjcmVhdGVUYWcpO1xuXG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIGJhc2VUYWdDcmVhdG9ycztcbn1cblxuZnVuY3Rpb24gRG9tUHJvbWlzZUNvbnRhaW5lcigpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoREVCVUcgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIiA6IFwicHJvbWlzZVwiKVxufVxuXG5mdW5jdGlvbiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvciB9OnsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+fSkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IudG9TdHJpbmcoKSA6ICdFcnJvcjpcXG4nK0pTT04uc3RyaW5naWZ5KGVycm9yLG51bGwsMikpO1xufVxuXG5leHBvcnQgbGV0IGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7XG4gIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gPSBmdW5jdGlvbiAoKSB7fSAvLyBPbmx5IGNyZWF0ZSB0aGUgb2JzZXJ2ZXIgb25jZVxuICBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgICAgIG0ucmVtb3ZlZE5vZGVzLmZvckVhY2goXG4gICAgICAgICAgcmVtb3ZlZCA9PiByZW1vdmVkICYmIHJlbW92ZWQgaW5zdGFuY2VvZiBFbGVtZW50ICYmXG4gICAgICAgICAgICBbLi4ucmVtb3ZlZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIiksIHJlbW92ZWRdLmZpbHRlcihlbHQgPT4gIWVsdC5pc0Nvbm5lY3RlZCkuZm9yRWFjaChcbiAgICAgICAgICAgICAgZWx0ID0+IHtcbiAgICAgICAgICAgICAgICAnb25SZW1vdmVkRnJvbURPTScgaW4gZWx0ICYmIHR5cGVvZiBlbHQub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJyAmJiBlbHQub25SZW1vdmVkRnJvbURPTSgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG4vKiBET00gbm9kZSByZW1vdmFsIGxvZ2ljICovXG50eXBlIFBpY2tCeVR5cGU8VCwgVmFsdWU+ID0ge1xuICBbUCBpbiBrZXlvZiBUIGFzIFRbUF0gZXh0ZW5kcyBWYWx1ZSB8IHVuZGVmaW5lZCA/IFAgOiBuZXZlcl06IFRbUF1cbn1cbmZ1bmN0aW9uIG11dGF0aW9uVHJhY2tlcihyb290OiBOb2RlLCB0cmFjazoga2V5b2YgUGlja0J5VHlwZTxNdXRhdGlvblJlY29yZCwgTm9kZUxpc3Q+KXtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGZ1bmN0aW9uIHdhbGsobm9kZXM6IE5vZGVMaXN0KXtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCh0cmFjayA9PT0gJ2FkZGVkTm9kZXMnKSA9PT0gbm9kZS5pc0Nvbm5lY3RlZCkge1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnICYmIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICB3YWxrKG1bdHJhY2tdKVxuICAgICAgfVxuICAgIH0pO1xuICB9KS5vYnNlcnZlKHJvb3QsIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlOiBOb2RlKSB7XG4gICAgcmV0dXJuIHRyYWNrZWQuaGFzKG5vZGUpO1xuICB9XG59XG5cbmNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRJZE1hcChub2RlPzogRWxlbWVudCB8IERvY3VtZW50LCBpZHM/OiBSZWNvcmQ8c3RyaW5nLCBFbGVtZW50Pikge1xuICBub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbiAgaWRzID0gaWRzIHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWRdXCIpLmZvckVhY2goZnVuY3Rpb24gKGVsdCkge1xuICAgICAgaWYgKGVsdC5pZCkge1xuICAgICAgICBpZiAoIWlkcyFbZWx0LmlkXSlcbiAgICAgICAgICBpZHMhW2VsdC5pZF0gPSBlbHQ7XG4gICAgICAgIGVsc2UgaWYgKERFQlVHKSB7XG4gICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKGVsdC5pZCkpIHtcbiAgICAgICAgICAgIHdhcm5lZC5hZGQoZWx0LmlkKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiU2hhZG93ZWQgbXVsdGlwbGUgZWxlbWVudCBJRHNcIiwgZWx0LmlkIC8qLCBlbHQsIGlkcyFbZWx0LmlkXSovKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaWRzO1xufVxuIiwgIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pIHx8IGZhbHNlO1xuZXhwb3J0IHsgX2NvbnNvbGUgYXMgY29uc29sZSB9O1xuZXhwb3J0IGNvbnN0IHRpbWVPdXRXYXJuID0gNTAwMDtcblxuY29uc3QgX2NvbnNvbGUgPSB7XG4gIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCcoQUktVUkpIExPRzonLCAuLi5hcmdzKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncylcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuZGVidWcoJyhBSS1VSSkgSU5GTzonLCAuLi5hcmdzKVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCI7XG5cbi8vIENyZWF0ZSBhIGRlZmVycmVkIFByb21pc2UsIHdoaWNoIGNhbiBiZSBhc3luY2hyb25vdXNseS9leHRlcm5hbGx5IHJlc29sdmVkIG9yIHJlamVjdGVkLlxuZXhwb3J0IHR5cGUgRGVmZXJyZWRQcm9taXNlPFQ+ID0gUHJvbWlzZTxUPiAmIHtcbiAgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFVzZWQgdG8gc3VwcHJlc3MgVFMgZXJyb3IgYWJvdXQgdXNlIGJlZm9yZSBpbml0aWFsaXNhdGlvblxuY29uc3Qgbm90aGluZyA9ICh2OiBhbnkpPT57fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVycmVkPFQ+KCk6IERlZmVycmVkUHJvbWlzZTxUPiB7XG4gIGxldCByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGxldCByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gbm90aGluZztcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KCguLi5yKSA9PiBbcmVzb2x2ZSwgcmVqZWN0XSA9IHIpIGFzIERlZmVycmVkUHJvbWlzZTxUPjtcbiAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgcHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnN0IGluaXRMb2NhdGlvbiA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgIHByb21pc2UuY2F0Y2goZXggPT4gKGV4IGluc3RhbmNlb2YgRXJyb3IgfHwgZXg/LnZhbHVlIGluc3RhbmNlb2YgRXJyb3IpID8gY29uc29sZS5sb2coXCJEZWZlcnJlZCByZWplY3Rpb25cIiwgZXgsIFwiYWxsb2NhdGVkIGF0IFwiLCBpbml0TG9jYXRpb24pIDogdW5kZWZpbmVkKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLy8gVHJ1ZSBpZiBgZXhwciBpbiB4YCBpcyB2YWxpZFxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh4OiBhbnkpOiB4IGlzIEZ1bmN0aW9uIHwge30ge1xuICByZXR1cm4geCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbidcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oeDogYW55KTogeCBpcyBQcm9taXNlTGlrZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UoeCkgJiYgKCd0aGVuJyBpbiB4KSAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIlxuaW1wb3J0IHsgRGVmZXJyZWRQcm9taXNlLCBkZWZlcnJlZCwgaXNPYmplY3RMaWtlLCBpc1Byb21pc2VMaWtlIH0gZnJvbSBcIi4vZGVmZXJyZWQuanNcIlxuXG4vKiBJdGVyYWJsZVByb3BlcnRpZXMgY2FuJ3QgYmUgY29ycmVjdGx5IHR5cGVkIGluIFRTIHJpZ2h0IG5vdywgZWl0aGVyIHRoZSBkZWNsYXJhdGlpblxuICB3b3JrcyBmb3IgcmV0cmlldmFsICh0aGUgZ2V0dGVyKSwgb3IgaXQgd29ya3MgZm9yIGFzc2lnbm1lbnRzICh0aGUgc2V0dGVyKSwgYnV0IHRoZXJlJ3NcbiAgbm8gVFMgc3ludGF4IHRoYXQgcGVybWl0cyBjb3JyZWN0IHR5cGUtY2hlY2tpbmcgYXQgcHJlc2VudC5cblxuICBJZGVhbGx5LCBpdCB3b3VsZCBiZTpcblxuICB0eXBlIEl0ZXJhYmxlUHJvcGVydGllczxJUD4gPSB7XG4gICAgZ2V0IFtLIGluIGtleW9mIElQXSgpOiBBc3luY0V4dHJhSXRlcmFibGU8SVBbS10+ICYgSVBbS11cbiAgICBzZXQgW0sgaW4ga2V5b2YgSVBdKHY6IElQW0tdKVxuICB9XG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzODI2XG5cbiAgV2UgY2hvb3NlIHRoZSBmb2xsb3dpbmcgdHlwZSBkZXNjcmlwdGlvbiB0byBhdm9pZCB0aGUgaXNzdWVzIGFib3ZlLiBCZWNhdXNlIHRoZSBBc3luY0V4dHJhSXRlcmFibGVcbiAgaXMgUGFydGlhbCBpdCBjYW4gYmUgb21pdHRlZCBmcm9tIGFzc2lnbm1lbnRzOlxuICAgIHRoaXMucHJvcCA9IHZhbHVlOyAgLy8gVmFsaWQsIGFzIGxvbmcgYXMgdmFsdXMgaGFzIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHByb3BcbiAgLi4uYW5kIHdoZW4gcmV0cmlldmVkIGl0IHdpbGwgYmUgdGhlIHZhbHVlIHR5cGUsIGFuZCBvcHRpb25hbGx5IHRoZSBhc3luYyBpdGVyYXRvcjpcbiAgICBEaXYodGhpcy5wcm9wKSA7IC8vIHRoZSB2YWx1ZVxuICAgIHRoaXMucHJvcC5tYXAhKC4uLi4pICAvLyB0aGUgaXRlcmF0b3IgKG5vdCB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoZW4gKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnRseSBpbXBsZW1lbnRhdGlvbiBkb2VzIGEgb25lLWxldmVsIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nLCBfZXhjZXB0XyBhIGZ1bmN0aW9uXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKTtcbi8vIFdlIHNob3VsZCBleGNsdWRlIEFzeW5jSXRlcmFibGUgZnJvbSB0aGUgdHlwZXMgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gaXRlcmFibGVzIChhbmQgdGhlcmVmb3JlIHBhc3NlZCB0byBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KVxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVZhbHVlID0gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSB8IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZVtdIHwgeyBbazogc3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlfTtcblxuZXhwb3J0IGNvbnN0IEl0ZXJhYmlsaXR5ID0gU3ltYm9sKFwiSXRlcmFiaWxpdHlcIik7XG5leHBvcnQgdHlwZSBJdGVyYWJpbGl0eTxEZXB0aCBleHRlbmRzICdzaGFsbG93JyA9ICdzaGFsbG93Jz4gPSB7IFtJdGVyYWJpbGl0eV06IERlcHRoIH07XG5leHBvcnQgdHlwZSBJdGVyYWJsZVR5cGU8VD4gPSBUICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8VD4+O1xuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCx0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6IHtcbiAgW0sgaW4ga2V5b2YgSVBdOiAoSVBbS10gZXh0ZW5kcyBvYmplY3QgPyBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+IDogSVBbS10pICYgSXRlcmFibGVUeXBlPElQW0tdPlxufVxuXG4vKiBUaGluZ3MgdG8gc3VwcGxpZW1lbnQgdGhlIEpTIGJhc2UgQXN5bmNJdGVyYWJsZSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMge1xuICBwdXNoKHZhbHVlOiBUKTogYm9vbGVhbjtcbiAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbi8vIE5COiBUaGlzIGFsc28gKGluY29ycmVjdGx5KSBwYXNzZXMgc3luYyBpdGVyYXRvcnMsIGFzIHRoZSBwcm90b2NvbCBuYW1lcyBhcmUgdGhlIHNhbWVcbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBvKSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXMgYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5jb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2V9KTtcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgcXVldWVfcGVuZGluZyA9IFN5bWJvbCgncGVuZGluZycpO1xuY29uc3QgcXVldWVfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbcXVldWVfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW3F1ZXVlX2l0ZW1zXTogW10gYXMgSXRlcmF0b3JSZXN1bHQ8VD5bXSB8IG51bGwsXG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHEgYXMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKHFbcXVldWVfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW3F1ZXVlX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBxW3F1ZXVlX3BlbmRpbmddIS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiB1bmtub3duKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKHFbcXVldWVfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbcXVldWVfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbcXVldWVfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBxW3F1ZXVlX2l0ZW1zXSA9IHFbcXVldWVfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW3F1ZXVlX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW3F1ZXVlX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW3F1ZXVlX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUpO1xuICAgICAgICBxW3F1ZXVlX2l0ZW1zXSA9IHFbcXVldWVfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtxdWV1ZV9pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbcXVldWVfaXRlbXNdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFxW3F1ZXVlX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW3F1ZXVlX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW3F1ZXVlX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFxW3F1ZXVlX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbcXVldWVfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBxdWV1ZV9pbmZsaWdodCA9IFN5bWJvbCgnaW5mbGlnaHQnKTtcblxuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtxdWV1ZV9pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW3F1ZXVlX2luZmxpZ2h0XSA9IG5ldyBTZXQ8VD4oKTtcblxuICBxLnB1c2ggPSBmdW5jdGlvbiAodmFsdWU6IFQpIHtcbiAgICBpZiAoIXFbcXVldWVfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW3F1ZXVlX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBxW3F1ZXVlX2luZmxpZ2h0XS5hZGQodmFsdWUpO1xuICAgIGlmIChxW3F1ZXVlX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgY29uc3QgcCA9IHFbcXVldWVfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbcXVldWVfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbcXVldWVfaXRlbXNdKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgfSBlbHNlIGlmICghcVtxdWV1ZV9pdGVtc10uZmluZCh2ID0+IHYgPT09IHZhbHVlKSkge1xuICAgICAgICBxW3F1ZXVlX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgUHJveGllZEFzeW5jSXRlcmF0b3IgPSBTeW1ib2woJ1Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMge30sIGNvbnN0IE4gZXh0ZW5kcyBzdHJpbmcgfCBzeW1ib2wsIFYgZXh0ZW5kcyBJdGVyYWJsZVByb3BlcnR5VmFsdWU+KG9iajogVCwgbmFtZTogTiwgdjogVik6IFQgJiBJdGVyYWJsZVByb3BlcnRpZXM8eyBbayBpbiBOXTogViB9PiB7XG4gIC8vIE1ha2UgYGFgIGFuIEFzeW5jRXh0cmFJdGVyYWJsZS4gV2UgZG9uJ3QgZG8gdGhpcyB1bnRpbCBhIGNvbnN1bWVyIGFjdHVhbGx5IHRyaWVzIHRvXG4gIC8vIGFjY2VzcyB0aGUgaXRlcmF0b3IgbWV0aG9kcyB0byBwcmV2ZW50IGxlYWtzIHdoZXJlIGFuIGl0ZXJhYmxlIGlzIGNyZWF0ZWQsIGJ1dFxuICAvLyBuZXZlciByZWZlcmVuY2VkLCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBiZSBjb25zdW1lZCBhbmQgdWx0aW1hdGVseSBjbG9zZWRcbiAgbGV0IGluaXRJdGVyYXRvciA9ICgpID0+IHtcbiAgICBpbml0SXRlcmF0b3IgPSAoKSA9PiBiO1xuICAgIGNvbnN0IGJpID0gZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPigpO1xuICAgIGNvbnN0IG1pID0gYmkubXVsdGkoKTtcbiAgICBjb25zdCBiID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgZXh0cmFzW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICBwdXNoID0gYmkucHVzaDtcbiAgICBleHRyYUtleXMuZm9yRWFjaChrID0+IC8vIEB0cy1pZ25vcmVcbiAgICAgICBleHRyYXNba10gPSBiW2sgYXMga2V5b2YgdHlwZW9mIGJdKTtcbiAgICBpZiAoIShQcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYseSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAseyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInBpcGVkIHB1c2hcIix5KTtcbiAgICAgICAgICAgIHB1c2goeT8udmFsdWVPZigpIGFzIFYpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCAmJiBERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBwaXBlZCBmcm9tIGFub3RoZXIgaXRlcmF0b3IsIGFuZCBtaWdodCBiZSBvdmVycndpdHRlbiBsYXRlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwic2V0IHB1c2hcIix2KTtcbiAgICAgIHB1c2godj8udmFsdWVPZigpIGFzIFYpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIG9iaiBhcyBhbnk7XG5cbiAgZnVuY3Rpb24gYm94PFY+KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgIH0pLCBwZHMpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QoYSksIE9iamVjdC5hc3NpZ24ocGRzLCB7XG4gICAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfSwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KSk7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgIC8vIFdlIGJveCBvYmplY3RzIGJ5IGNyZWF0aW5nIGEgUHJveHkgZm9yIHRoZSBvYmplY3QgdGhhdCBwdXNoZXMgb24gZ2V0L3NldC9kZWxldGUsIGFuZCBtYXBzIHRoZSBzdXBwbGllZCBhc3luYyBpdGVyYXRvciB0byBwdXNoIHRoZSBzcGVjaWZpZWQga2V5XG4gICAgICAgICAgLy8gVGhlIHByb3hpZXMgYXJlIHJlY3Vyc2l2ZSwgc28gdGhhdCBpZiBhbiBvYmplY3QgY29udGFpbnMgb2JqZWN0cywgdGhleSB0b28gYXJlIHByb3hpZWQuIE9iamVjdHMgY29udGFpbmluZyBwcmltaXRpdmVzIHJlbWFpbiBwcm94aWVkIHRvXG4gICAgICAgICAgLy8gaGFuZGxlIHRoZSBnZXQvc2V0L3NlbGV0ZSBpbiBwbGFjZSBvZiB0aGUgdXN1YWwgcHJpbWl0aXZlIGJveGluZyB2aWEgT2JqZWN0KHByaW1pdGl2ZVZhbHVlKVxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICByZXR1cm4gYm94T2JqZWN0KGEsIHBkcyk7XG5cbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG5cbiAgdHlwZSBXaXRoUGF0aCA9IHsgW1Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhOiBWLCBwYXRoOiBzdHJpbmcgfX07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBQcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSBvID0gbz8uW2ZpZWxkc1tpXV07XG4gICAgcmV0dXJuIG87XG4gIH1cbiAgZnVuY3Rpb24gYm94T2JqZWN0KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFBvc3NpYmx5V2l0aFBhdGg+KSB7XG4gICAgY29uc3Qga2V5SXRlcmF0b3IgPSBuZXcgTWFwPHN0cmluZyxBc3luY0V4dHJhSXRlcmFibGU8YW55Pj4oKTtcbiAgICBjb25zdCB3aXRoUGF0aCA9IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bUHJveGllZEFzeW5jSXRlcmF0b3JdIDogeyBhOiBvLCBwYXRoOiAnJyB9KTtcbiAgICBjb25zdCB3aXRob3V0UGF0aCA9IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bUHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gUHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG5cbiAgICAgICAgICBpZiAoa2V5IGluIHBkcykge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGFpID0ga2V5SXRlcmF0b3IuZ2V0KHBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhaSkge1xuICAgICAgICAgICAgICBhaSA9IGZpbHRlck1hcCh3aXRoUGF0aCwgKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gZGVzdHJ1Y3R1cmUoby5hLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHBhdGgsa2V5LG8ucGF0aCx2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCAhPT0gdiB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmUgO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAga2V5SXRlcmF0b3Iuc2V0KHBhdGgsIGFpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhaVtrZXkgYXMga2V5b2YgdHlwZW9mIGFpXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSkge1xuICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb3h5KE9iamVjdChSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpKSwgaGFuZGxlcihwYXRoICsgJy4nICsga2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgYnJhbmQgbmV3IGtleSB3aXRoaW4gdGhlIHRhcmdldFxuICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb3h5KHt9LCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChrZXkgaW4gcGRzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgaXRlcmFibGUgcHJvcGVydHkgJHtuYW1lLnRvU3RyaW5nKCl9JHtwYXRofS4ke2tleS50b1N0cmluZygpfSBhcyBpdCBpcyBwYXJ0IG9mIGFzeW5jSXRlcmF0b3JgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVE9ETzogY2xvc2UgdGhlIHF1ZXVlICh2aWEgcHVzaD8pIGFuZCB0aGF0IG9mIGFueSBjb250YWluZWQgcHJvcGV0aWVzXG4gICAgICAgICAgaWYgKFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoKHsgW1Byb3hpZWRBc3luY0l0ZXJhdG9yXToge2EscGF0aH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKGtleSBpbiBwZHMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCBpdGVyYWJsZSBwcm9wZXJ0eSAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUT0RPOiBjbG9zZSB0aGUgcXVldWUgKHZpYSBwdXNoPykgYW5kIHRoYXQgb2YgYW55IGNvbnRhaW5lZCBwcm9wZXRpZXNcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bih0YXJnZXQsIGtleSkpXG4gICAgICAgICAgICBwdXNoKHsgW1Byb3hpZWRBc3luY0l0ZXJhdG9yXToge2EscGF0aH0gfSBhcyBhbnkpO1xuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KTtcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm94eShhIGFzIG9iamVjdCwgaGFuZGxlcigpKSBhcyBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdDogKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55PilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx7aWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCk9Pnt9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9fSkpXG4gICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHtkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHtpZHg6IG51bWJlciwgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTpudW1iZXIgPSAwO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7fSk7XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7c2ksaWR4LGssaXJ9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICBhY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGNbaWR4XSA9IHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KXtcbiAgICAgIHBjLmZvckVhY2goKHAsaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOlBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEYsIEFuZCA9IHt9LCBPciA9IG5ldmVyPiA9XG4gIEYgZXh0ZW5kcyAoKT0+QXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WixSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOih2OlopPT5SLCBleGNlcHQ6KHg6YW55KT0+YW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbixleGNlcHQpO1xuICB0cnkgeyByZXR1cm4gdGhlbih2KSB9IGNhdGNoIChleCkgeyByZXR1cm4gZXhjZXB0KGV4KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBjb25zdCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7IC8vIFRlcm1pbmF0ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcblxuICAgICAgICAgIGV4ID0+XG4gICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoIWl0Py5kb25lKSB7XG4gICAgICBjdXJyZW50ID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICBhaSEubmV4dCgpXG4gICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudC8vLnRoZW4oemFsZ28gPT4gemFsZ28pO1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxcbiAgQXN5bmNJdGVyYWJsZTxhbnk+XG4gIHwgVmFsaWRXaGVuU2VsZWN0b3I8SURTPlxuICB8IEVsZW1lbnQgLyogSW1wbGllcyBcImNoYW5nZVwiIGV2ZW50ICovXG4gIHwgUHJvbWlzZTxhbnk+IC8qIEp1c3QgZ2V0cyB3cmFwcGVkIGluIGEgc2luZ2xlIGB5aWVsZGAgKi9cbj47XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyO1xuXG4vLyBUaGUgZXh0ZW5kZWQgaXRlcmF0b3IgdGhhdCBzdXBwb3J0cyBhc3luYyBpdGVyYXRvciBtYXBwaW5nLCBjaGFpbmluZywgZXRjXG5leHBvcnQgdHlwZSBXaGVuUmV0dXJuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICBNYXBwYWJsZUl0ZXJhYmxlPFxuICAgIEFzeW5jRXh0cmFJdGVyYWJsZTxcbiAgICAgIFdoZW5JdGVyYXRlZFR5cGU8Uz4+PjtcblxudHlwZSBTcGVjaWFsV2hlbkV2ZW50cyA9IHtcbiAgXCJAc3RhcnRcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0sICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IHsgW2s6IHN0cmluZ106IHVuZGVmaW5lZCB9ICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfGAuJHtzdHJpbmd9YCB8IGBbJHtzdHJpbmd9XWBcblxuLyogVmFsaWRXaGVuU2VsZWN0b3JzIGFyZTpcbiAgICBAc3RhcnRcbiAgICBAcmVhZHlcbiAgICBldmVudDpzZWxlY3RvclxuICAgIGV2ZW50ICAgICAgICAgICBcInRoaXNcIiBlbGVtZW50LCBldmVudCB0eXBlPSdldmVudCdcbiAgICBzZWxlY3RvciAgICAgICAgc3BlY2lmaWNlZCBzZWxlY3RvcnMsIGltcGxpZXMgXCJjaGFuZ2VcIiBldmVudFxuKi9cblxuZXhwb3J0IHR5cGUgVmFsaWRXaGVuU2VsZWN0b3I8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAke2tleW9mIFNwZWNpYWxXaGVuRXZlbnRzfWBcbiAgfCBgJHtFdmVudEF0dHJpYnV0ZX06JHtDU1NJZGVudGlmaWVyPElEUz59YFxuICB8IEV2ZW50QXR0cmlidXRlXG4gIHwgQ1NTSWRlbnRpZmllcjxJRFM+O1xuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz5cbiAgPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIGAke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyAnY2hhbmdlJ1xuICA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XTtcblxuLyoqIHdoZW4gKiovXG50eXBlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lcjogRWxlbWVudFxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbFxufTtcbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IE1hcDxrZXlvZiBXaGVuRXZlbnRzLCBTZXQ8RXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lciwgc2VsZWN0b3IgfSA9IG87XG4gICAgICAgIGlmICghY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lci5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IG4gfHwgbi5jb250YWlucyhldi50YXJnZXQpKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXaGVuU2VsZWN0b3I8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPih3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pOiB1bmRlZmluZWQgfCBbQ1NTSWRlbnRpZmllciB8IG51bGwsIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbcGFydHNbMF0sXCJjaGFuZ2VcIl07XG4gICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6bmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIHdoZW5FdmVudDxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KGNvbnRhaW5lcjogRWxlbWVudCwgd2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KSB7XG4gIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIrd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuXG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyLFxuICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW48Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4ge30pO1xuICB5aWVsZCB1bmRlZmluZWQgYXMgWjsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyc1tudW1iZXJdKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbDogQ1NTSWRlbnRpZmllciB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0OiBFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChlbHQuaXNDb25uZWN0ZWQpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChlbHQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyOiBFbGVtZW50LCBzZWxlY3RvcnM/OiBzdHJpbmdbXSkge1xuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgIF0pO1xuICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXI6IEVsZW1lbnQsIG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICB9XG5cbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG5cbiAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQ08sTUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFdBQVcsT0FBTyxNQUFNLG1CQUFtQixLQUFLO0FBRXJILE1BQU0sY0FBYztBQUUzQixNQUFNLFdBQVc7QUFBQSxJQUNmLE9BQU8sTUFBVztBQUNoQixVQUFJLE1BQU8sU0FBUSxJQUFJLGdCQUFnQixHQUFHLElBQUk7QUFBQSxJQUNoRDtBQUFBLElBQ0EsUUFBUSxNQUFXO0FBQ2pCLFVBQUksTUFBTyxTQUFRLEtBQUssaUJBQWlCLEdBQUcsSUFBSTtBQUFBLElBQ2xEO0FBQUEsSUFDQSxRQUFRLE1BQVc7QUFDakIsVUFBSSxNQUFPLFNBQVEsTUFBTSxpQkFBaUIsR0FBRyxJ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QUM5RDtBQU1BLFdBQVMsZ0JBQWdCLE1BQVksT0FBa0Q7QUFDckYsVUFBTSxVQUFVLG9CQUFJLFFBQWM7QUFDbEMsYUFBUyxLQUFLLE9BQWdCO0FBQzVCLGlCQUFXLFFBQVEsT0FBTztBQUV4QixZQUFLLFVBQVUsaUJBQWtCLEtBQUssYUFBYTtBQUNqRCxlQUFLLEtBQUssVUFBVTtBQUNwQixrQkFBUSxJQUFJLElBQUk7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGdCQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFlBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxhQUFhLFFBQVE7QUFDbkQsZUFBSyxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQ2Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILENBQUMsRUFBRSxRQUFRLE1BQU0sRUFBRSxTQUFTLE1BQU0sV0FBVyxLQUFLLENBQUM7QUFFbkQsV0FBTyxTQUFTLE1BQVk7QUFDMUIsYUFBTyxRQUFRLElBQUksSUFBSTtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUVBLE1BQU0sU0FBUyxvQkFBSSxJQUFZO0FBQ3hCLFdBQVMsZ0JBQWdCLE1BQTJCLEtBQStCO0FBQ3hGLFdBQU8sUUFBUTtBQUNmLFVBQU0sT0FBTyx1QkFBTyxPQUFPLElBQUk7QUFDL0IsUUFBSSxLQUFLLGtCQUFrQjtBQUN6QixXQUFLLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxTQUFVLEtBQUs7QUFDbkQsWUFBSSxJQUFJLElBQUk7QUFDVixjQUFJLENBQUMsSUFBSyxJQUFJLEVBQUU7QUFDZCxnQkFBSyxJQUFJLEVBQUUsSUFBSTtBQUFBLG1CQUNSLE9BQU87QUFDZCxnQkFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUUsR0FBRztBQUN2QixxQkFBTyxJQUFJLElBQUksRUFBRTtBQUNqQix1QkFBUTtBQUFBLGdCQUFLO0FBQUEsZ0JBQWlDLElBQUk7QUFBQTtBQUFBLGNBQTBCO0FBQUEsWUFDOUU7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFDQSxXQUFPO0FBQUEsRUFDVDsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJpc01pc3NpbmciLCAibWVyZ2VkIiwgImMiLCAibiIsICJ2YWx1ZSIsICJpc0FuY2VzdHJhbCIsICJjaGlsZHJlbiJdCn0K
