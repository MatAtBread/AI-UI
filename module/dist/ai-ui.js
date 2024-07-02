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
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgQ2hpbGRUYWdzLCBDb25zdHJ1Y3RlZCwgSW5zdGFuY2UsIE92ZXJyaWRlcywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJztcbmltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUcgPyAoKG46IE5vZGUpID0+IGBcIiR7J2lubmVySFRNTCcgaW4gbiA/IG4uaW5uZXJIVE1MIDogbi50ZXh0Q29udGVudH1cImApIDogKG46IE5vZGUpPT51bmRlZmluZWQ7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG50eXBlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyB7fSA9IHt9PiA9IHtcbiAgY29tbW9uUHJvcGVydGllczogT3RoZXJNZW1iZXJzXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbiAgLyogYWxzb1xuICBzZXQgYXR0cmlidXRlcyguLi5wb3NzaWJsZSBhdHRyaWJ1dGVzKTsgLy8gaGFzIHRvIGJlIGVuY2xvc2VkIGJ5IHRhZygpIHRvIGFjY2VzcyBhc3NpZ25Qcm9wc1xuICAqL1xufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIixcImFiYnJcIixcImFkZHJlc3NcIixcImFyZWFcIixcImFydGljbGVcIixcImFzaWRlXCIsXCJhdWRpb1wiLFwiYlwiLFwiYmFzZVwiLFwiYmRpXCIsXCJiZG9cIixcImJsb2NrcXVvdGVcIixcImJvZHlcIixcImJyXCIsXCJidXR0b25cIixcbiAgXCJjYW52YXNcIixcImNhcHRpb25cIixcImNpdGVcIixcImNvZGVcIixcImNvbFwiLFwiY29sZ3JvdXBcIixcImRhdGFcIixcImRhdGFsaXN0XCIsXCJkZFwiLFwiZGVsXCIsXCJkZXRhaWxzXCIsXCJkZm5cIixcImRpYWxvZ1wiLFwiZGl2XCIsXG4gIFwiZGxcIixcImR0XCIsXCJlbVwiLFwiZW1iZWRcIixcImZpZWxkc2V0XCIsXCJmaWdjYXB0aW9uXCIsXCJmaWd1cmVcIixcImZvb3RlclwiLFwiZm9ybVwiLFwiaDFcIixcImgyXCIsXCJoM1wiLFwiaDRcIixcImg1XCIsXCJoNlwiLFwiaGVhZFwiLFxuICBcImhlYWRlclwiLFwiaGdyb3VwXCIsXCJoclwiLFwiaHRtbFwiLFwiaVwiLFwiaWZyYW1lXCIsXCJpbWdcIixcImlucHV0XCIsXCJpbnNcIixcImtiZFwiLFwibGFiZWxcIixcImxlZ2VuZFwiLFwibGlcIixcImxpbmtcIixcIm1haW5cIixcIm1hcFwiLFxuICBcIm1hcmtcIixcIm1lbnVcIixcIm1ldGFcIixcIm1ldGVyXCIsXCJuYXZcIixcIm5vc2NyaXB0XCIsXCJvYmplY3RcIixcIm9sXCIsXCJvcHRncm91cFwiLFwib3B0aW9uXCIsXCJvdXRwdXRcIixcInBcIixcInBpY3R1cmVcIixcInByZVwiLFxuICBcInByb2dyZXNzXCIsXCJxXCIsXCJycFwiLFwicnRcIixcInJ1YnlcIixcInNcIixcInNhbXBcIixcInNjcmlwdFwiLFwic2VhcmNoXCIsXCJzZWN0aW9uXCIsXCJzZWxlY3RcIixcInNsb3RcIixcInNtYWxsXCIsXCJzb3VyY2VcIixcInNwYW5cIixcbiAgXCJzdHJvbmdcIixcInN0eWxlXCIsXCJzdWJcIixcInN1bW1hcnlcIixcInN1cFwiLFwidGFibGVcIixcInRib2R5XCIsXCJ0ZFwiLFwidGVtcGxhdGVcIixcInRleHRhcmVhXCIsXCJ0Zm9vdFwiLFwidGhcIixcInRoZWFkXCIsXCJ0aW1lXCIsXG4gIFwidGl0bGVcIixcInRyXCIsXCJ0cmFja1wiLFwidVwiLFwidWxcIixcInZhclwiLFwidmlkZW9cIixcIndiclwiXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBlbGVtZW50UHJvdHlwZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHtcbiAgZ2V0IGlkcygpIHtcbiAgICByZXR1cm4gZ2V0RWxlbWVudElkTWFwKHRoaXMpO1xuICB9LFxuICBzZXQgaWRzKHY6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBpZHMgb24gJyArIHRoaXMudmFsdWVPZigpKTtcbiAgfSxcbiAgd2hlbjogZnVuY3Rpb24gKC4uLndoYXQpIHtcbiAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICB9XG59IGFzIFBvRWxlbWVudE1ldGhvZHMgJiBUaGlzVHlwZTxFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz4pO1xuXG5jb25zdCBwb1N0eWxlRWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpO1xucG9TdHlsZUVsdC5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzLVwiO1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5jb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuXG5leHBvcnQgY29uc3QgdGFnID0gPFRhZ0xvYWRlcj5mdW5jdGlvbiA8VGFncyBleHRlbmRzIHN0cmluZyxcbiAgVDEgZXh0ZW5kcyAoc3RyaW5nIHwgVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgVDIgZXh0ZW5kcyAoVGFnc1tdIHwgVGFnRnVuY3Rpb25PcHRpb25zPFE+KSxcbiAgUSBleHRlbmRzIHt9XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPl1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XTtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIoZG9jdW1lbnQsJ3JlbW92ZWROb2RlcycpO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICAvKiBOb3RlOiB3ZSB1c2UgcHJvcGVydHkgZGVmaW50aW9uIChhbmQgbm90IG9iamVjdCBzcHJlYWQpIHNvIGdldHRlcnMgKGxpa2UgYGlkc2ApXG4gICAgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgY2FsbGVkICovXG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAgZWxlbWVudFByb3R5cGVcbiAgKTtcblxuICAvLyBXZSBkbyB0aGlzIGhlcmUgYW5kIG5vdCBpbiBlbGVtZW50UHJvdHlwZSBhcyB0aGVyZSdzIG5vIHN5bnRheFxuICAvLyB0byBjb3B5IGEgZ2V0dGVyL3NldHRlciBwYWlyIGZyb20gYW5vdGhlciBvYmplY3RcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsICdhdHRyaWJ1dGVzJywge1xuICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsJ2F0dHJpYnV0ZXMnKSxcbiAgICBzZXQodGhpczogRWxlbWVudCwgYTogb2JqZWN0KSB7XG4gICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9ICgpPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4gZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyKSksXG4gICAgICAgICAgKHg6YW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oeCxsb2dOb2RlKGcpKTtcbiAgICAgICAgICAgIGcucmVwbGFjZVdpdGgoRHlhbWljRWxlbWVudEVycm9yKHtlcnJvcjogeH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1a255IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYykgY2hpbGRyZW4oZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgZHBtID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtEb21Qcm9taXNlQ29udGFpbmVyKCldIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG5cbiAgICAgICAgbGV0IHQgPSBkcG0ubGVuZ3RoID8gZHBtIDogW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIGFwcGVuZGVkLnB1c2goLi4udCk7XG4gICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG4gPSB0LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpIGFzIENoaWxkTm9kZVtdO1xuICAgICAgICAgIGlmIChuLmxlbmd0aCkge1xuICAgICAgICAgICAgdCA9IFtEeWFtaWNFbGVtZW50RXJyb3Ioe2Vycm9yOiBlcnJvclZhbHVlfSldO1xuICAgICAgICAgICAgblswXS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oIFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIGNyZWF0ZWRCeSwgdC5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICBhcC5yZXR1cm4/LihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PENoaWxkVGFncz4pID0+IHtcbiAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIENoaWxkTm9kZVtdLCBzaW5jZSB3ZSB0ZXN0ZWQgLnBhcmVudE5vZGVcbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHQuZmlsdGVyKGUgPT4gZT8ucGFyZW50Tm9kZSAmJiBlLmlzQ29ubmVjdGVkKTtcbiAgICAgICAgICAgICAgY29uc3QgbiA9IG5vdFlldE1vdW50ZWQgPyB0IDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG1vdW50ZWQubGVuZ3RoKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCB8fCB0LmV2ZXJ5KGUgPT4gcmVtb3ZlZE5vZGVzKGUpKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRvbmUgLSB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBxdWlldGx5IChpZSB0aGlzIGlzIG5vdCBhbiBleGNlcHRpb24gYXMgaXQncyBleHBlY3RlZCwgYnV0IHdlJ3JlIGRvbmUpXG4gICAgICAgICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudDogXCIgKyBpbnNlcnRpb25TdGFjaztcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LihuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuYCxjcmVhdGVkQnksIHQubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0ID0gbm9kZXModW5ib3goZXMudmFsdWUpIGFzIENoaWxkVGFncyk7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRlZCBleHByZXNzaW9uIHlpZWxkcyBubyBub2Rlcywgc3R1ZmYgaW4gYSBEb21Qcm9taXNlQ29udGFpbmVyIGZvciB0aGUgbmV4dCBpdGVyYXRpb25cbiAgICAgICAgICAgICAgaWYgKCF0Lmxlbmd0aCkgdC5wdXNoKERvbVByb21pc2VDb250YWluZXIoKSk7XG4gICAgICAgICAgICAgIChuWzBdIGFzIENoaWxkTm9kZSkucmVwbGFjZVdpdGgoLi4udCk7XG4gICAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+ICF0LmluY2x1ZGVzKGUpICYmIGUucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nLiBUZXJtaW5hdGUgdGhlIGl0ZXJhdG9yIHNvdXJjZVxuICAgICAgICAgICAgICB0ID0gW107XG4gICAgICAgICAgICAgIGFwLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwcGVuZGVkLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKSk7XG4gICAgfSkoYyk7XG4gICAgcmV0dXJuIGFwcGVuZGVkO1xuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZyx7XG4gICAgICBub2RlcywgICAgLy8gQnVpbGQgRE9NIE5vZGVbXSBmcm9tIENoaWxkVGFnc1xuICAgICAgVW5pcXVlSURcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgY29uc3QgcGxhaW5PYmplY3RQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pO1xuICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZDogUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgYW55PiwgczogYW55LCBkZWNsYXJhdGlvbj86IHRydWUpOiB2b2lkIHtcbiAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzb3VyY2UgdmFsdWUgaXMgYW4gb2JqZWN0LCBhbmQgd2UncmUgZGVjbGFyaW5nIGl0ICh0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGEgbmV3IG9uZSksIHRha2VcbiAgICAgICAgICAgICAgICAvLyBhIGNvcHkgc28gYXMgdG8gbm90IHJlLXVzZSB0aGUgcmVmZXJlbmNlIGFuZCBwb2xsdXRlIHRoZSBkZWNsYXJhdGlvbi4gTm90ZTogdGhpcyBpcyBwcm9iYWJseVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuJ3QgYmUgY29waWVkXG4gICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSA9PT0gcGxhaW5PYmplY3RQcm90b3R5cGUgfHwgIU9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwbGFpbiBvYmplY3QgY2FuIGJlIGRlZXAtY29waWVkIGJ5IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIGFycmF5IGNhbiBiZSBkZWVwIGNvcGllZCBieSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSBbXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgb2JqZWN0IGxpa2UgdGhpbmdzIChyZWdleHBzLCBkYXRlcywgY2xhc3NlcywgZXRjKSBjYW4ndCBiZSBkZWVwLWNvcGllZCByZWxpYWJseVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERlY2xhcmVkIHByb3BldHkgJyR7a30nIGlzIG5vdCBhIHBsYWluIG9iamVjdCBhbmQgbXVzdCBiZSBhc3NpZ25lZCBieSByZWZlcmVuY2UsIHBvc3NpYmx5IHBvbGx1dGluZyBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyB0YWdgLCBkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIGFzIGEgY2hpbGRcIiwgaywgbG9nTm9kZSh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybiggXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5ib3goYTogdW5rbm93bik6IHVua25vd24ge1xuICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodix1bmJveCkgOiB2O1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZTogTm9kZSwgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgIGlmICghKGNhbGxTdGFja1N5bWJvbCBpbiBwcm9wcykpIHtcbiAgICAgIChmdW5jdGlvbiBhc3NpZ24oZDogYW55LCBzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wcyBiZWZvcmUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgIGNvbnN0IHNvdXJjZUVudHJpZXMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSk7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzKSkge1xuICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydCgoYSxiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLGFbMF0pO1xuICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYykgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICBpZiAoJ3NldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKSByZXR1cm4gMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAodiAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHYsIGspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHNldCBhdHRyaWJ1dGVcIiwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCBcImFzc2lnblByb3BzXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbkl0ZXJhYmxlKHZhbHVlOiBBc3luY0l0ZXJhYmxlPHVua25vd24+IHwgQXN5bmNJdGVyYXRvcjx1bmtub3duLCBhbnksIHVuZGVmaW5lZD4sIGs6IHN0cmluZykge1xuICAgICAgICAgIGNvbnN0IGFwID0gYXN5bmNJdGVyYXRvcih2YWx1ZSk7XG4gICAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuICAgICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICAgIGNvbnN0IGNyZWF0ZWRCeSA9IERFQlVHICYmIG5ldyBFcnJvcihcIkNyZWF0ZWQgYnlcIikuc3RhY2s7XG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGJlZW4gbW91bnRlZCBiZWZvcmUsIGJpdCBhcmVuJ3Qgbm93LCByZW1vdmUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIGlmIChyZW1vdmVkTm9kZXMoYmFzZSkgfHwgKCFub3RZZXRNb3VudGVkICYmICFtb3VudGVkKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgRWxlbWVudCBkb2VzIG5vdCBleGlzdCBpbiBkb2N1bWVudCB3aGVuIHNldHRpbmcgYXN5bmMgYXR0cmlidXRlICcke2t9JyB0bzpcXG4ke2xvZ05vZGUoYmFzZSl9YCk7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1vdW50ZWQpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgY3JlYXRlZEF0ICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW1lbnQgd2l0aCBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLlxcbkVsZW1lbnQgY29udGFpbnM6ICR7bG9nTm9kZShiYXNlKX1cXG4ke2NyZWF0ZWRCeX1gKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybiggXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdW5ib3hlZCA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICAgICAgICBpZiAodW5ib3hlZCAhPT0gdW5kZWZpbmVkICYmIHVuYm94ZWQgIT09IHZhbHVlICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlc1wiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICB0eXBlIEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzOntcbiAgICBkZWJ1Z2dlcj86IHVua25vd247XG4gICAgZG9jdW1lbnQ/OiBEb2N1bWVudDtcbiAgICBbY2FsbFN0YWNrU3ltYm9sXT86IE92ZXJyaWRlc1tdO1xuICAgIFtrOiBzdHJpbmddOiB1bmtub3duO1xuICB9IHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pID0+IEVsZW1lbnRcblxuICBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgICBzdXBlcjogVGFnQ3JlYXRvcjxFbGVtZW50PjtcbiAgICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gICAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICAgIGV4dGVuZGVkOiAodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSA9PiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSxfb3ZlcnJpZGVzLGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpKyhpZENvdW50KyspLnRvU3RyaW5nKDM2KStNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgICAgaWYgKCFkb2N1bWVudC5oZWFkLmNvbnRhaW5zKHBvU3R5bGVFbHQpKSB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycykgO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayAgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBmdW5jdGlvbiBpc0FuY2VzdHJhbChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBkOiBzdHJpbmcpIHtcbiAgICAgICAgICBmb3IgKGxldCBmID0gY3JlYXRvcjsgZjsgZiA9IGYuc3VwZXIpXG4gICAgICAgICAgICBpZiAoZi5kZWZpbml0aW9uPy5kZWNsYXJlICYmIGQgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihkID0+IChkIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsZCkpO1xuICAgICAgICAgIGlmIChjbGFzaC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBEZWNsYXJlZCBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gYWxyZWFkeSBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpIHtcbiAgICAgICAgICBjb25zdCBjbGFzaCA9IE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24ub3ZlcnJpZGUpLmZpbHRlcihkID0+ICEoZCBpbiBlKSAmJiAhKGNvbW1vblByb3BlcnRpZXMgJiYgZCBpbiBjb21tb25Qcm9wZXJ0aWVzKSAmJiAhaXNBbmNlc3RyYWwodGhpcyxkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csJy0nKSArIGNhbGxTaXRlK1wiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgICAgcmV0dXJuIChuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IG5vZGVzKC4uLmNoaWxkcmVuKVxuICAgICAgICAgIDogdHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicgPyBuYW1lKGF0dHJzLCBjaGlsZHJlbilcbiAgICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICAgIDogbmFtZSBpbnN0YW5jZW9mIE5vZGUgPyBuYW1lXG4gICAgICAgICAgOiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogbmV3IEVycm9yKFwiSWxsZWdhbCB0eXBlIGluIGNyZWF0ZUVsZW1lbnQ6XCIgKyBuYW1lKX0pKSBhcyBOb2RlXG4gICAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oazogSyk6IFRhZ0NyZWF0b3I8USAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSAmIFBvRWxlbWVudE1ldGhvZHM+O1xuICBmdW5jdGlvbiBjcmVhdGVUYWc8RSBleHRlbmRzIEVsZW1lbnQ+KGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIEUgJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnKGs6IHN0cmluZyk6IFRhZ0NyZWF0b3I8USAmIE5hbWVzcGFjZWRFbGVtZW50QmFzZSAmIFBvRWxlbWVudE1ldGhvZHM+IHtcbiAgICBpZiAoYmFzZVRhZ0NyZWF0b3JzW2tdKVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXTtcblxuICAgIGNvbnN0IHRhZ0NyZWF0b3IgPSAoYXR0cnM6IFEgJiBQb0VsZW1lbnRNZXRob2RzICYgUGFydGlhbDx7XG4gICAgICBkZWJ1Z2dlcj86IGFueTtcbiAgICAgIGRvY3VtZW50PzogRG9jdW1lbnQ7XG4gICAgfT4gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4ge1xuICAgICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgICAgaWYgKGlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQoYXR0cnMpO1xuICAgICAgICBhdHRycyA9IHt9IGFzIGFueTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyB0ZXN0IGlzIGFsd2F5cyB0cnVlLCBidXQgbmFycm93cyB0aGUgdHlwZSBvZiBhdHRycyB0byBhdm9pZCBmdXJ0aGVyIGVycm9yc1xuICAgICAgaWYgKCFpc0NoaWxkVGFnKGF0dHJzKSkge1xuICAgICAgICBpZiAoYXR0cnMuZGVidWdnZXIpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICBkZWxldGUgYXR0cnMuZGVidWdnZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJzLmRvY3VtZW50KSB7XG4gICAgICAgICAgZG9jID0gYXR0cnMuZG9jdW1lbnQ7XG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZSA9IG5hbWVTcGFjZVxuICAgICAgICAgID8gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lU3BhY2UgYXMgc3RyaW5nLCBrLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgOiBkb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKT0+eyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBpbnZva2UgbmF0aXZlIGVsZW1lbmV0IGNvbnN0cnVjdG9ycyBkaXJlY3RseS4gVXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cIikgfSxcbiAgICAgIGV4dGVuZGVkLCAvLyBIb3cgdG8gZXh0ZW5kIHRoaXMgKGJhc2UpIHRhZ1xuICAgICAgdmFsdWVPZigpIHsgcmV0dXJuIGBUYWdDcmVhdG9yOiA8JHtuYW1lU3BhY2UgfHwgJyd9JHtuYW1lU3BhY2UgPyAnOjonIDogJyd9JHtrfT5gIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIHZhbHVlOiB0YWdIYXNJbnN0YW5jZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YWdDcmVhdG9yLCBcIm5hbWVcIiwgeyB2YWx1ZTogJzwnICsgayArICc+JyB9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIGJhc2VUYWdDcmVhdG9yc1trXSA9IGluY2x1ZGluZ0V4dGVuZGVyO1xuICB9XG5cbiAgdGFncy5mb3JFYWNoKGNyZWF0ZVRhZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzO1xufVxuXG5mdW5jdGlvbiBEb21Qcm9taXNlQ29udGFpbmVyKCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChERUJVRyBcbiAgICA/IG5ldyBFcnJvcihcInByb21pc2VcIikuc3RhY2s/LnJlcGxhY2UoL15FcnJvcjogLywgJycpIHx8IFwicHJvbWlzZVwiIFxuICAgIDogXCJwcm9taXNlXCIpXG59XG5cbmZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06eyBlcnJvcjogRXJyb3IgfCBJdGVyYXRvclJlc3VsdDxFcnJvcj59KSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicrSlNPTi5zdHJpbmdpZnkoZXJyb3IsbnVsbCwyKSk7XG59XG5cbmV4cG9ydCBsZXQgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHtcbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTSA9IGZ1bmN0aW9uICgpIHt9IC8vIE9ubHkgY3JlYXRlIHRoZSBvYnNlcnZlciBvbmNlXG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgbS5yZW1vdmVkTm9kZXMuZm9yRWFjaChcbiAgICAgICAgICByZW1vdmVkID0+IHJlbW92ZWQgJiYgcmVtb3ZlZCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIFsuLi5yZW1vdmVkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSwgcmVtb3ZlZF0uZmlsdGVyKGVsdCA9PiAhZWx0LmlzQ29ubmVjdGVkKS5mb3JFYWNoKFxuICAgICAgICAgICAgICBlbHQgPT4ge1xuICAgICAgICAgICAgICAgICdvblJlbW92ZWRGcm9tRE9NJyBpbiBlbHQgJiYgdHlwZW9mIGVsdC5vblJlbW92ZWRGcm9tRE9NID09PSAnZnVuY3Rpb24nICYmIGVsdC5vblJlbW92ZWRGcm9tRE9NKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4pe1xuICBjb25zdCB0cmFja2VkID0gbmV3IFdlYWtTZXQ8Tm9kZT4oKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3Qpe1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbS5yZW1vdmVkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGU6IE5vZGUpIHtcbiAgICByZXR1cm4gdHJhY2tlZC5oYXMobm9kZSk7XG4gIH1cbn1cblxuY29uc3Qgd2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkTWFwKG5vZGU/OiBFbGVtZW50IHwgRG9jdW1lbnQsIGlkcz86IFJlY29yZDxzdHJpbmcsIEVsZW1lbnQ+KSB7XG4gIG5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuICBpZHMgPSBpZHMgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIikuZm9yRWFjaChmdW5jdGlvbiAoZWx0KSB7XG4gICAgICBpZiAoZWx0LmlkKSB7XG4gICAgICAgIGlmICghaWRzIVtlbHQuaWRdKVxuICAgICAgICAgIGlkcyFbZWx0LmlkXSA9IGVsdDtcbiAgICAgICAgZWxzZSBpZiAoREVCVUcpIHtcbiAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMoZWx0LmlkKSkge1xuICAgICAgICAgICAgd2FybmVkLmFkZChlbHQuaWQpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJTaGFkb3dlZCBtdWx0aXBsZSBlbGVtZW50IElEc1wiLCBlbHQuaWQgLyosIGVsdCwgaWRzIVtlbHQuaWRdKi8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBpZHM7XG59XG4iLCAiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLnRyYWNlKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpaW5cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3QgdGhlIHRyYWlsaW5nICchJyB0byBhc3NlcnQgbm9uLW51bGwgdmFsdWUpXG5cbiAgVGhpcyByZWxpZXMgb24gYSBoYWNrIHRvIGB3cmFwQXN5bmNIZWxwZXJgIGluIGl0ZXJhdG9ycy50cyB3aGVuICphY2NlcHRzKiBhIFBhcnRpYWw8QXN5bmNJdGVyYXRvcj5cbiAgYnV0IGNhc3RzIGl0IHRvIGEgQXN5bmNJdGVyYXRvciBiZWZvcmUgdXNlLlxuXG4gIFRoZSBpdGVyYWJpbGl0eSBvZiBwcm9wZXJ0eXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gIEJ5IGRlZmF1bHQsIHRoZSBjdXJyZW50bHkgaW1wbGVtZW50YXRpb24gZG9lcyBhIG9uZS1sZXZlbCBkZWVwIG1hcHBpbmcsIHNvIGFuIGl0ZXJhYmxlIHByb3BlcnR5ICdvYmonIGlzIGl0c2VsZlxuICBpdGVyYWJsZSwgYXMgYXJlIGl0J3MgbWVtYmVycy4gVGhlIG9ubHkgZGVmaW5lZCB2YWx1ZSBhdCBwcmVzZW50IGlzIFwic2hhbGxvd1wiLCBpbiB3aGljaCBjYXNlICdvYmonIHJlbWFpbnNcbiAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuKi9cblxuLy8gQmFzZSB0eXBlcyB0aGF0IGNhbiBiZSBtYWRlIGRlZmluZWQgYXMgaXRlcmFibGU6IGJhc2ljYWxseSBhbnl0aGluZywgX2V4Y2VwdF8gYSBmdW5jdGlvblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCk7XG4vLyBXZSBzaG91bGQgZXhjbHVkZSBBc3luY0l0ZXJhYmxlIGZyb20gdGhlIHR5cGVzIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGl0ZXJhYmxlcyAoYW5kIHRoZXJlZm9yZSBwYXNzZWQgdG8gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSlcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgfCBJdGVyYWJsZVByb3BlcnR5VmFsdWVbXSB8IHsgW2s6IHN0cmluZyB8IHN5bWJvbCB8IG51bWJlcl06IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZX07XG5cbmV4cG9ydCBjb25zdCBJdGVyYWJpbGl0eSA9IFN5bWJvbChcIkl0ZXJhYmlsaXR5XCIpO1xuZXhwb3J0IHR5cGUgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+ID0geyBbSXRlcmFiaWxpdHldOiBEZXB0aCB9O1xuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gVCAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+PjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBUaGlzIGlzIHBhdGNoIHRvIHRoZSBzdGQgbGliIGRlZmluaXRpb24gb2YgQXJyYXk8VD4uIEkgZG9uJ3Qga25vdyB3aHkgaXQncyBhYnNlbnQsXG4gIC8vIGFzIHRoaXMgaXMgdGhlIGltcGxlbWVudGF0aW9uIGluIGFsbCBKYXZhU2NyaXB0IGVuZ2luZXMuIEl0IGlzIHByb2JhYmx5IGEgcmVzdWx0XG4gIC8vIG9mIGl0cyBhYnNlbmNlIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3ZhbHVlcyxcbiAgLy8gd2hpY2ggaW5oZXJpdHMgZnJvbSB0aGUgT2JqZWN0LnByb3RvdHlwZSwgd2hpY2ggbWFrZXMgbm8gY2xhaW0gZm9yIHRoZSByZXR1cm4gdHlwZVxuICAvLyBzaW5jZSBpdCBjb3VsZCBiZSBvdmVycmlkZGVtLiBIb3dldmVyLCBpbiB0aGF0IGNhc2UsIGEgVFMgZGVmbiBzaG91bGQgYWxzbyBvdmVycmlkZVxuICAvLyBpdCwgbGlrZSBOdW1iZXIsIFN0cmluZywgQm9vbGVhbiBldGMgZG8uXG4gIGludGVyZmFjZSBBcnJheTxUPiB7XG4gICAgdmFsdWVPZigpOkFycmF5PFQ+O1xuICB9XG4gIC8vIEFzIGFib3ZlLCB0aGUgcmV0dXJuIHR5cGUgY291bGQgYmUgVCByYXRoZXIgdGhhbiBPYmplY3QsIHNpbmNlIHRoaXMgaXMgdGhlIGRlZmF1bHQgaW1wbCxcbiAgLy8gYnV0IGl0J3Mgbm90LCBmb3Igc29tZSByZWFzb24uXG4gIGludGVyZmFjZSBPYmplY3Qge1xuICAgIHZhbHVlT2Y8VD4odGhpczpUKTogVCBleHRlbmRzIEl0ZXJhYmxlVHlwZTxpbmZlciBaPiA/IFogOiBPYmplY3Q7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCx0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6ICh7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IChJdGVyYWJsZVByb3BlcnRpZXM8RT5bXSB8IEl0ZXJhYmxlUHJvcGVydGllczxFW10+KVxuICAgIDogKChcbiAgICAgIElQW0tdIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT5cbiAgICAgIDogSVBbS11cbiAgICApICYgSXRlcmFibGVUeXBlPElQW0tdPilcbiAgKVxufSlcblxuLyogVGhpbmdzIHRvIHN1cHBsaWVtZW50IHRoZSBKUyBiYXNlIEFzeW5jSXRlcmFibGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHtcbiAgcHVzaCh2YWx1ZTogVCk6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGU8VD4sIEFzeW5jSXRlcmFibGVIZWxwZXJzIHsgfVxuXG4vLyBOQjogVGhpcyBhbHNvIChpbmNvcnJlY3RseSkgcGFzc2VzIHN5bmMgaXRlcmF0b3JzLCBhcyB0aGUgcHJvdG9jb2wgbmFtZXMgYXJlIHRoZSBzYW1lXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhdG9yPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAnbmV4dCcgaW4gbyAmJiB0eXBlb2Ygbz8ubmV4dCA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYWJsZTxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIG8pICYmIHR5cGVvZiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJ1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKG8pIHx8IGlzQXN5bmNJdGVyYXRvcihvKVxufVxuXG5leHBvcnQgdHlwZSBBc3luY1Byb3ZpZGVyPFQ+ID0gQXN5bmNJdGVyYXRvcjxUPiB8IEFzeW5jSXRlcmFibGU8VD5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jSXRlcmF0b3I8VD4obzogQXN5bmNQcm92aWRlcjxUPikge1xuICBpZiAoaXNBc3luY0l0ZXJhdG9yKG8pKSByZXR1cm4gbztcbiAgaWYgKGlzQXN5bmNJdGVyYWJsZShvKSkgcmV0dXJuIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHRocm93IG5ldyBFcnJvcihcIk5vdCBhbiBhc3luYyBwcm92aWRlclwiKTtcbn1cblxudHlwZSBBc3luY0l0ZXJhYmxlSGVscGVycyA9IHR5cGVvZiBhc3luY0V4dHJhcztcbmV4cG9ydCBjb25zdCBhc3luY0V4dHJhcyA9IHtcbiAgZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsXG4gICAgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4sXG4gICAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuICApIHtcbiAgICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGZuLCBpbml0aWFsVmFsdWUpXG4gIH0sXG4gIG1hcCxcbiAgZmlsdGVyLFxuICB1bmlxdWUsXG4gIHdhaXRGb3IsXG4gIG11bHRpLFxuICBpbml0aWFsbHksXG4gIGNvbnN1bWUsXG4gIG1lcmdlPFQsIEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj5bXT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCAuLi5tOiBBKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIC4uLm0pO1xuICB9LFxuICBjb21iaW5lPFQsIFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIG90aGVyczogUykge1xuICAgIHJldHVybiBjb21iaW5lKE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycykpO1xuICB9XG59O1xuXG5jb25zdCBleHRyYUtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhc3luY0V4dHJhcyksIC4uLk9iamVjdC5rZXlzKGFzeW5jRXh0cmFzKV0gYXMgKGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcylbXTtcblxuLy8gTGlrZSBPYmplY3QuYXNzaWduLCBidXQgdGhlIGFzc2lnbmVkIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIHt9LCBTIGV4dGVuZHMge30+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2V9KTtcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ3BlbmRpbmcnKTtcbmNvbnN0IF9pdGVtcyA9IFN5bWJvbCgnaXRlbXMnKTtcbmZ1bmN0aW9uIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0ge1xuICAgIFtfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW19pdGVtc106IFtdIGFzIEl0ZXJhdG9yUmVzdWx0PFQ+W10gfCBudWxsLFxuXG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxIGFzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPjtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChxW19pdGVtc10/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHFbX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHRoaXMgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgcVtfcGVuZGluZ10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybih2PzogdW5rbm93bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbX2l0ZW1zXS5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBfaW5mbGlnaHQgPSBTeW1ib2woJ2luZmxpZ2h0Jyk7XG5mdW5jdGlvbiBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+PiAmIHsgW19pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW19pbmZsaWdodF0gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgcS5wdXNoID0gZnVuY3Rpb24gKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERlYm91bmNlXG4gICAgaWYgKHFbX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICBxW19pbmZsaWdodF0uYWRkKHZhbHVlKTtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdi52YWx1ZSA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyB7fSwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgIGV4dHJhc1trXSA9IGJbayBhcyBrZXlvZiB0eXBlb2YgYl0pO1xuICAgIGlmICghKF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBhKSlcbiAgICAgIGFzc2lnbkhpZGRlbihhLCBleHRyYXMpO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHN0dWJzIHRoYXQgbGF6aWx5IGNyZWF0ZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlIGludGVyZmFjZSB3aGVuIGludm9rZWRcbiAgZnVuY3Rpb24gbGF6eUFzeW5jTWV0aG9kPE0gZXh0ZW5kcyBrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXM+KG1ldGhvZDogTSkge1xuICAgIHJldHVybiB7XG4gICAgICBbbWV0aG9kXTpmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGluaXRJdGVyYXRvcigpO1xuICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYseSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAseyBjYXVzZTogc3RhY2sgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwdXNoKHk/LnZhbHVlT2YoKSBhcyBWKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB8IG51bGwgfX07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspIDtcbiAgICByZXR1cm4gbztcbiAgfVxuICBmdW5jdGlvbiBib3hPYmplY3QoYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8UG9zc2libHlXaXRoUGF0aD4pIHtcbiAgICBsZXQgd2l0aFBhdGg6ICBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXToge2EscGF0aH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHthLHBhdGh9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsa2V5KSkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICB3aXRob3V0UGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHdpdGhvdXRQYXRoW2tleSBhcyBrZXlvZiB0eXBlb2YgcGRzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdpdGhQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0gOiB7IGE6IG8sIHBhdGg6IG51bGwgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aCA9PT0gbnVsbCB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmUgO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGhpbnQ/OidzdHJpbmcnfCdudW1iZXInfCdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdDogKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55PilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx7aWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCk9Pnt9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBwcm9taXNlc1tuXSA9IChpdFtuXSA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGFcbiAgICAgICAgPyBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gICAgICAgIDogYSBhcyBBc3luY0l0ZXJhdG9yPGFueT4pXG4gICAgICAgIC5uZXh0KClcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+ICh7IGlkeDogbiwgcmVzdWx0IH0pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiAoVFlpZWxkIHwgVFJldHVybilbXSA9IFtdO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuICBsZXQgY291bnQgPSBwcm9taXNlcy5sZW5ndGg7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBjb3VudFxuICAgICAgICA/IFByb21pc2UucmFjZShwcm9taXNlcykudGhlbigoeyBpZHgsIHJlc3VsdCB9KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICByZXN1bHRzW2lkeF0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5aWVsZCBpbnRlcm1lZGlhdGUgcmV0dXJuIHZhbHVlcywgd2UganVzdCBrZWVwIHRoZW0gaW4gcmVzdWx0c1xuICAgICAgICAgICAgLy8gcmV0dXJuIHsgZG9uZTogY291bnQgPT09IDAsIHZhbHVlOiByZXN1bHQudmFsdWUgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC5uZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcHJvbWlzZXNbaWR4XSA9IGl0W2lkeF1cbiAgICAgICAgICAgICAgPyBpdFtpZHhdIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsgaWR4LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGlkeCwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9fSkpXG4gICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHtkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkfSB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93Py4oZXgpID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICAvLyBwcmV2aW91c2x5OiByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWVyZ2VkIGFzIHVua25vd24gYXMgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPEFbbnVtYmVyXT4pO1xufVxuXG50eXBlIENvbWJpbmVkSXRlcmFibGUgPSB7IFtrOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2xdOiBQYXJ0aWFsSXRlcmFibGUgfTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVR5cGU8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0ge1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn07XG50eXBlIENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59PjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9ucyB7XG4gIGlnbm9yZVBhcnRpYWw/OiBib29sZWFuOyAvLyBTZXQgdG8gYXZvaWQgeWllbGRpbmcgaWYgc29tZSBzb3VyY2VzIGFyZSBhYnNlbnRcbn1cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSA8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHNyYzogUywgb3B0czogQ29tYmluZU9wdGlvbnMgPSB7fSk6IENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gPT4ge1xuICBjb25zdCBhY2N1bXVsYXRlZDogQ29tYmluZWRJdGVyYWJsZVR5cGU8Uz4gPSB7fTtcbiAgbGV0IHBjOiBQcm9taXNlPHtpZHg6IG51bWJlciwgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55Pn0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTpudW1iZXIgPSAwO1xuICBjb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7fSk7XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7c2ksaWR4LGssaXJ9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICBhY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGNbaWR4XSA9IHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSl7XG4gICAgICBwYy5mb3JFYWNoKChwLGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0ucmV0dXJuPy4odilcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KXtcbiAgICAgIHBjLmZvckVhY2goKHAsaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOlBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEYsIEFuZCA9IHt9LCBPciA9IG5ldmVyPiA9XG4gIEYgZXh0ZW5kcyAoKT0+QXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WixSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOih2OlopPT5SLCBleGNlcHQ6KHg6YW55KT0+YW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbixleGNlcHQpO1xuICB0cnkgeyByZXR1cm4gdGhlbih2KSB9IGNhdGNoIChleCkgeyByZXR1cm4gZXhjZXB0KGV4KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBjb25zdCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7IC8vIFRlcm1pbmF0ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcblxuICAgICAgICAgIGV4ID0+XG4gICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoIWl0Py5kb25lKSB7XG4gICAgICBjdXJyZW50ID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICBhaSEubmV4dCgpXG4gICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudC8vLnRoZW4oemFsZ28gPT4gemFsZ28pO1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxcbiAgQXN5bmNJdGVyYWJsZTxhbnk+XG4gIHwgVmFsaWRXaGVuU2VsZWN0b3I8SURTPlxuICB8IEVsZW1lbnQgLyogSW1wbGllcyBcImNoYW5nZVwiIGV2ZW50ICovXG4gIHwgUHJvbWlzZTxhbnk+IC8qIEp1c3QgZ2V0cyB3cmFwcGVkIGluIGEgc2luZ2xlIGB5aWVsZGAgKi9cbj47XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyO1xuXG4vLyBUaGUgZXh0ZW5kZWQgaXRlcmF0b3IgdGhhdCBzdXBwb3J0cyBhc3luYyBpdGVyYXRvciBtYXBwaW5nLCBjaGFpbmluZywgZXRjXG5leHBvcnQgdHlwZSBXaGVuUmV0dXJuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICBNYXBwYWJsZUl0ZXJhYmxlPFxuICAgIEFzeW5jRXh0cmFJdGVyYWJsZTxcbiAgICAgIFdoZW5JdGVyYXRlZFR5cGU8Uz4+PjtcblxudHlwZSBTcGVjaWFsV2hlbkV2ZW50cyA9IHtcbiAgXCJAc3RhcnRcIjogeyBbazogc3RyaW5nXTogdW5kZWZpbmVkIH0sICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IHsgW2s6IHN0cmluZ106IHVuZGVmaW5lZCB9ICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfGAuJHtzdHJpbmd9YCB8IGBbJHtzdHJpbmd9XWBcblxuLyogVmFsaWRXaGVuU2VsZWN0b3JzIGFyZTpcbiAgICBAc3RhcnRcbiAgICBAcmVhZHlcbiAgICBldmVudDpzZWxlY3RvclxuICAgIGV2ZW50ICAgICAgICAgICBcInRoaXNcIiBlbGVtZW50LCBldmVudCB0eXBlPSdldmVudCdcbiAgICBzZWxlY3RvciAgICAgICAgc3BlY2lmaWNlZCBzZWxlY3RvcnMsIGltcGxpZXMgXCJjaGFuZ2VcIiBldmVudFxuKi9cblxuZXhwb3J0IHR5cGUgVmFsaWRXaGVuU2VsZWN0b3I8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IGAke2tleW9mIFNwZWNpYWxXaGVuRXZlbnRzfWBcbiAgfCBgJHtFdmVudEF0dHJpYnV0ZX06JHtDU1NJZGVudGlmaWVyPElEUz59YFxuICB8IEV2ZW50QXR0cmlidXRlXG4gIHwgQ1NTSWRlbnRpZmllcjxJRFM+O1xuXG50eXBlIElzVmFsaWRXaGVuU2VsZWN0b3I8Uz5cbiAgPSBTIGV4dGVuZHMgVmFsaWRXaGVuU2VsZWN0b3IgPyBTIDogbmV2ZXI7XG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7aW5mZXIgTCBleHRlbmRzIENTU0lkZW50aWZpZXJ9YFxuICA/IEV2ZW50TmFtZVVuaW9uPFY+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFY+XG4gIDogUyBleHRlbmRzIGAke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyAnY2hhbmdlJ1xuICA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudHM8Uz4gPSBXaGVuRXZlbnRzW0V4dHJhY3RFdmVudE5hbWVzPFM+XTtcblxuLyoqIHdoZW4gKiovXG50eXBlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgcHVzaDogKGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSk9PnZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcik9PnZvaWQ7XG4gIGNvbnRhaW5lcjogRWxlbWVudFxuICBzZWxlY3Rvcjogc3RyaW5nIHwgbnVsbFxufTtcbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IE1hcDxrZXlvZiBXaGVuRXZlbnRzLCBTZXQ8RXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnQsIGV2OiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBbRXZlbnROYW1lXSkge1xuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lciwgc2VsZWN0b3IgfSA9IG87XG4gICAgICAgIGlmICghY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lci5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IG4gfHwgbi5jb250YWlucyhldi50YXJnZXQpKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoKGV2LnRhcmdldCA9PT0gY29udGFpbmVyIHx8IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQpKSlcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXaGVuU2VsZWN0b3I8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPih3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pOiB1bmRlZmluZWQgfCBbQ1NTSWRlbnRpZmllciB8IG51bGwsIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbcGFydHNbMF0sXCJjaGFuZ2VcIl07XG4gICAgcmV0dXJuIFtudWxsLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6bmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIHdoZW5FdmVudDxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KGNvbnRhaW5lcjogRWxlbWVudCwgd2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KSB7XG4gIGNvbnN0IFtzZWxlY3RvciwgZXZlbnROYW1lXSA9IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpID8/IGRvVGhyb3coXCJJbnZhbGlkIFdoZW5TZWxlY3RvcjogXCIrd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoZXZlbnROYW1lKSkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuXG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyLFxuICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChldmVudE5hbWUpIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW48Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4ge30pO1xuICB5aWVsZCB1bmRlZmluZWQgYXMgWjsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyc1tudW1iZXJdKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbDogQ1NTSWRlbnRpZmllciB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0OiBFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChlbHQuaXNDb25uZWN0ZWQpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChlbHQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyOiBFbGVtZW50LCBzZWxlY3RvcnM/OiBzdHJpbmdbXSkge1xuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgIF0pO1xuICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXI6IEVsZW1lbnQsIG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICB9XG5cbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG5cbiAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0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LGNBQWMsSUFBSSxpQkFBaUI7QUFBQSxjQUNsRztBQUFBLFlBQ0Y7QUFBQSxVQUFDO0FBQUEsUUFDUDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsQ0FBQyxFQUFFLFFBQVEsU0FBUyxNQUFNLEVBQUUsU0FBUyxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBQUEsRUFDOUQ7QUFNQSxXQUFTLGdCQUFnQixNQUFZLE9BQWtEO0FBQ3JGLFVBQU0sVUFBVSxvQkFBSSxRQUFjO0FBQ2xDLGFBQVMsS0FBSyxPQUFnQjtBQUM1QixpQkFBVyxRQUFRLE9BQU87QUFFeEIsWUFBSyxVQUFVLGlCQUFrQixLQUFLLGFBQWE7QUFDakQsZUFBSyxLQUFLLFVBQVU7QUFDcEIsa0JBQVEsSUFBSSxJQUFJO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLFFBQUksaUJBQWlCLENBQUMsY0FBYztBQUNsQyxnQkFBVSxRQUFRLFNBQVUsR0FBRztBQUM3QixZQUFJLEVBQUUsU0FBUyxlQUFlLEVBQUUsYUFBYSxRQUFRO0FBQ25ELGVBQUssRUFBRSxLQUFLLENBQUM7QUFBQSxRQUNmO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxDQUFDLEVBQUUsUUFBUSxNQUFNLEVBQUUsU0FBUyxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBRW5ELFdBQU8sU0FBUyxNQUFZO0FBQzFCLGFBQU8sUUFBUSxJQUFJLElBQUk7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFFQSxNQUFNLFNBQVMsb0JBQUksSUFBWTtBQUN4QixXQUFTLGdCQUFnQixNQUEyQixLQUErQjtBQUN4RixXQUFPLFFBQVE7QUFDZixVQUFNLE9BQU8sdUJBQU8sT0FBTyxJQUFJO0FBQy9CLFFBQUksS0FBSyxrQkFBa0I7QUFDekIsV0FBSyxpQkFBaUIsTUFBTSxFQUFFLFFBQVEsU0FBVSxLQUFLO0FBQ25ELFlBQUksSUFBSSxJQUFJO0FBQ1YsY0FBSSxDQUFDLElBQUssSUFBSSxFQUFFO0FBQ2QsZ0JBQUssSUFBSSxFQUFFLElBQUk7QUFBQSxtQkFDUixPQUFPO0FBQ2QsZ0JBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDdkIscUJBQU8sSUFBSSxJQUFJLEVBQUU7QUFDakIsdUJBQVE7QUFBQSxnQkFBSztBQUFBLGdCQUFpQyxJQUFJO0FBQUE7QUFBQSxjQUEwQjtBQUFBLFlBQzlFO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAiaXNNaXNzaW5nIiwgIm1lcmdlZCIsICJjIiwgIm4iLCAidmFsdWUiLCAiaXNBbmNlc3RyYWwiLCAiY2hpbGRyZW4iXQp9Cg==
