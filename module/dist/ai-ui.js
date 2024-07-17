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
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUcgPyAoKG46IE5vZGUpID0+IGBcIiR7J2lubmVySFRNTCcgaW4gbiA/IG4uaW5uZXJIVE1MIDogbi50ZXh0Q29udGVudH1cImApIDogKG46IE5vZGUpID0+IHVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT4gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnNcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICAvKiogQGRlcHJlY2F0ZWQgLSBsZWdhY3kgc3VwcG9ydCAqL1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NPzogYm9vbGVhblxufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8vIFRoaXMgaXMgYSB2ZXJ5IGluY29tcGxldGUgdHlwZS4gSW4gcHJhY3RpY2UsIHNldChhdHRycykgcmVxdWlyZXMgYSBkZWVwbHkgcGFydGlhbCBzZXQgb2ZcbiAgLy8gYXR0cmlidXRlcywgaW4gZXhhY3RseSB0aGUgc2FtZSB3YXkgYXMgYSBUYWdGdW5jdGlvbidzIGZpcnN0IG9iamVjdCBwYXJhbWV0ZXJcbiAgc2V0IGF0dHJpYnV0ZXMoYXR0cnM6IG9iamVjdCk7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcFxufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYywgJ3JlbW92ZWROb2RlcycsIG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG4gIGNvbnN0IHBvU3R5bGVFbHQgPSB0aGlzRG9jLmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKTtcbiAgcG9TdHlsZUVsdC5pZCA9IFwiLS1haS11aS1leHRlbmRlZC10YWctc3R5bGVzLVwiO1xuXG4gIC8qIFByb3BlcnRpZXMgYXBwbGllZCB0byBldmVyeSB0YWcgd2hpY2ggY2FuIGJlIGltcGxlbWVudGVkIGJ5IHJlZmVyZW5jZSwgc2ltaWxhciB0byBwcm90b3R5cGVzICovXG4gIGNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0YWdQcm90b3R5cGVzOiBQb0VsZW1lbnRNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIHtcbiAgICAgIHdoZW46IHtcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKC4uLndoYXQ6IFdoZW5QYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KHRoaXM6IEVsZW1lbnQsIGE6IG9iamVjdCkge1xuICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgICAgIGV4ID0+IGNvbnNvbGUud2FybihleCkpO1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaWRzOiB7XG4gICAgICAgIC8vIC5pZHMgaXMgYSBnZXR0ZXIgdGhhdCB3aGVuIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vIGxhemlseSBjcmVhdGVzIGEgUHJveHkgdGhhdCBwcm92aWRlcyBsaXZlIGFjY2VzcyB0byBjaGlsZHJlbiBieSBpZFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICBnZXQodGhpczogRWxlbWVudCkge1xuICAgICAgICAgIC8vIE5vdyB3ZSd2ZSBiZWVuIGFjY2Vzc2VkLCBjcmVhdGUgdGhlIHByb3h5XG4gICAgICAgICAgY29uc3QgaWRQcm94eSA9IG5ldyBQcm94eSgoKCk9Pnt9KSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIFdlYWtSZWY8RWxlbWVudD4+LCB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0FyZy5jb25zdHJ1Y3Rvci5kZWZpbml0aW9uLmlkc1thcmdzWzBdLmlkXSguLi5hcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgPGVsdD4uaWRzLiR7YXJncz8uWzBdPy5pZH0gaXMgbm90IGEgdGFnLWNyZWF0aW5nIGZ1bmN0aW9uYCwgeyBjYXVzZTogZXggfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdHJ1Y3Q6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZjogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7IHJldHVybiBudWxsIH0sXG4gICAgICAgICAgICBpc0V4dGVuc2libGUoKSB7IHJldHVybiBmYWxzZSB9LFxuICAgICAgICAgICAgcHJldmVudEV4dGVuc2lvbnMoKSB7IHJldHVybiB0cnVlIH0sXG4gICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXCIsdGFyZ2V0LHApO1xuICAgICAgICAgICAgICBpZiAodGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5Rm9yKHApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXModGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3duS2V5czogKHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBpZHMgPSBbLi4udGhpcy5xdWVyeVNlbGVjdG9yQWxsKGBbaWRdYCldLm1hcChlID0+IGUuaWQpO1xuICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbLi4ubmV3IFNldChpZHMpXTtcbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIGlkcy5sZW5ndGggIT09IHVuaXF1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudCBpZHNgLCB1bmlxdWUpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm93bktleXNcIix0YXJnZXQsdW5pcXVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuaXF1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHAsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0XCIsdGFyZ2V0LHApO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGsgPSBrZXlGb3IocCk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UndmUgY2FjaGVkIHRoaXMgSUQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmIChwayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBlbGVtZW50IGlzIHN0aWxsIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBlbGVtZW50IHdpdGggdGhlIHNhbWUgSURcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRhcmdldFtwa10uZGVyZWYoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgcmVmLmlkID09PSBwICYmIHRoaXMuY29udGFpbnMocmVmKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbcGtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZTogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIENTUy5lc2NhcGUocCkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50cyB3aXRoIElEIFwiJHtwfVwiYC8qLGBcXG5cXHQke2xvZ05vZGUodGhpcyl9YCovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZSA9IG5sWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUocCkpID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUpXG4gICAgICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIHBrLCBuZXcgV2Vha1JlZihlKSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uYW5kIHJlcGxhY2UgdGhlIGdldHRlciB3aXRoIHRoZSBQcm94eVxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWRzJywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gaWRQcm94eSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi4uYW5kIHJldHVybiB0aGF0IGZyb20gdGhlIGdldHRlciwgc28gc3Vic2VxdWVudCBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGFjY2Vzc2VzIGdvIHZpYSB0aGUgUHJveHlcbiAgICAgICAgICByZXR1cm4gaWRQcm94eTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKiBBZGQgYW55IHVzZXIgc3VwcGxpZWQgcHJvdG90eXBlcyAqL1xuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4gZy5yZXBsYWNlV2l0aCguLi5ub2RlcyhyKSksXG4gICAgICAgICAgKHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKHgsIGxvZ05vZGUoZykpO1xuICAgICAgICAgICAgZy5yZXBsYWNlV2l0aChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogeCB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgYXBwZW5kZWQucHVzaChjKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBoYXZlIGFuIGludGVyZXN0aW5nIGNhc2UgaGVyZSB3aGVyZSBhbiBpdGVyYWJsZSBTdHJpbmcgaXMgYW4gb2JqZWN0IHdpdGggYm90aCBTeW1ib2wuaXRlcmF0b3JcbiAgICAgIC8vIChpbmhlcml0ZWQgZnJvbSB0aGUgU3RyaW5nIHByb3RvdHlwZSkgYW5kIFN5bWJvbC5hc3luY0l0ZXJhdG9yIChhcyBpdCdzIGJlZW4gYXVnbWVudGVkIGJ5IGJveGVkKCkpXG4gICAgICAvLyBidXQgd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGNhc2VzIGxpa2UgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0LCBhcnJheSwgZXRjLiwgbm90IHRoZSBmdWtueSBvbmVzXG4gICAgICAvLyBJdCB1c2VkIHRvIGJlIGFmdGVyIHRoZSBpc0FzeW5jSXRlcigpIHRlc3QsIGJ1dCBhIG5vbi1Bc3luY0l0ZXJhdG9yICptYXkqIGFsc28gYmUgYSBzeW5jIGl0ZXJhYmxlXG4gICAgICAvLyBGb3Igbm93LCB3ZSBleGNsdWRlIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSBpbiB0aGlzIGNhc2UuXG4gICAgICBpZiAoYyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGMgJiYgIShTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBjKSAmJiBjW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGMpIGNoaWxkcmVuKGQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FzeW5jSXRlcjxDaGlsZFRhZ3M+KGMpKSB7XG4gICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICBjb25zdCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhpcyBhc3luYyBpdGVyYXRvciBpcyBhIGJveGVkIG9iamVjdCB0aGF0IGFsc28gaG9sZHMgYSB2YWx1ZVxuICAgICAgICBjb25zdCB1bmJveGVkID0gYy52YWx1ZU9mKCk7XG4gICAgICAgIGNvbnN0IGRwbSA9ICh1bmJveGVkID09PSB1bmRlZmluZWQgfHwgdW5ib3hlZCA9PT0gYykgPyBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXSA6IG5vZGVzKHVuYm94ZWQgYXMgQ2hpbGRUYWdzKVxuXG4gICAgICAgIGxldCB0ID0gZHBtLmxlbmd0aCA/IGRwbSA6IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKC4uLnQpO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIERFQlVHIHN1cHBvcnRcbiAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gdC5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKSBhcyBDaGlsZE5vZGVbXTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHQgPSBbRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IGVycm9yVmFsdWUgfSldO1xuICAgICAgICAgICAgblswXS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgY3JlYXRlZEJ5LCB0Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgdCA9IFtdO1xuICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDxDaGlsZFRhZ3M+KSA9PiB7XG4gICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDaGlsZE5vZGVbXSwgc2luY2Ugd2UgdGVzdGVkIC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSB0LmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gdCA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkLmxlbmd0aCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmICghbi5sZW5ndGggfHwgdC5ldmVyeShlID0+IHJlbW92ZWROb2RlcyhlKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBBc3luYyBlbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLmAsIGNyZWF0ZWRCeSwgdC5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSBub2Rlcyh1bmJveChlcy52YWx1ZSkgYXMgQ2hpbGRUYWdzKTtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdGVkIGV4cHJlc3Npb24geWllbGRzIG5vIG5vZGVzLCBzdHVmZiBpbiBhIERvbVByb21pc2VDb250YWluZXIgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgICBpZiAoIXQubGVuZ3RoKSB0LnB1c2goRG9tUHJvbWlzZUNvbnRhaW5lcigpKTtcbiAgICAgICAgICAgICAgKG5bMF0gYXMgQ2hpbGROb2RlKS5yZXBsYWNlV2l0aCguLi50KTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gIXQuaW5jbHVkZXMoZSkgJiYgZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChlKSk7XG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRlcm1pbmF0ZSB0aGUgaXRlcmF0b3Igc291cmNlXG4gICAgICAgICAgICAgIHQgPSBbXTtcbiAgICAgICAgICAgICAgYXAucmV0dXJuPy4oZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBwZW5kZWQucHVzaCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKGMudG9TdHJpbmcoKSkpO1xuICAgIH0pKGMpO1xuICAgIHJldHVybiBhcHBlbmRlZDtcbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgYXMgYSBjaGlsZFwiLCBrLCBsb2dOb2RlKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94KGE6IHVua25vd24pOiB1bmtub3duIHtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsIHVuYm94KSA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KGEgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAodiAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHYsIGspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHNldCBhdHRyaWJ1dGVcIiwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUodmFsdWU6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgY29uc3QgYXAgPSBhc3luY0l0ZXJhdG9yKHZhbHVlKTtcbiAgICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYml0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2RlcyhiYXNlKSB8fCAoIW5vdFlldE1vdW50ZWQgJiYgIW1vdW50ZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBFbGVtZW50IGRvZXMgbm90IGV4aXN0IGluIGRvY3VtZW50IHdoZW4gc2V0dGluZyBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIHRvOlxcbiR7bG9nTm9kZShiYXNlKX1gKTtcbiAgICAgICAgICAgICAgICBhcC5yZXR1cm4/LigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW91bnRlZCkgbm90WWV0TW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAobm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbWVudCB3aXRoIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBpdCBpcyBuZXZlciBtb3VudGVkLCBpdCB3aWxsIGxlYWsuXFxuRWxlbWVudCBjb250YWluczogJHtsb2dOb2RlKGJhc2UpfVxcbiR7Y3JlYXRlZEJ5fWApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gKGVycm9yVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRHluYW1pYyBhdHRyaWJ1dGUgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgaywgZCwgY3JlYXRlZEJ5LCBsb2dOb2RlKGJhc2UpKTtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRDaGlsZChEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVuYm94ZWQgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSB2YWx1ZSAmJiAhaXNBc3luY0l0ZXIodW5ib3hlZCkpXG4gICAgICAgICAgICB1cGRhdGUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHVuYm94ZWQgfSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXAubmV4dCgpLnRoZW4odXBkYXRlKS5jYXRjaChlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXNcIiwgaywgbG9nTm9kZSh2YWx1ZSkpO1xuICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBkW2tdID0gY29weTtcbiAgICAgICAgICAgICAgICAvL2Fzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIHBvU3R5bGVFbHQuYXBwZW5kQ2hpbGQodGhpc0RvYy5jcmVhdGVUZXh0Tm9kZShzdGF0aWNFeHRlbnNpb25zLnN0eWxlcyArICdcXG4nKSk7XG4gICAgICBpZiAoIXRoaXNEb2MuaGVhZC5jb250YWlucyhwb1N0eWxlRWx0KSkge1xuICAgICAgICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQocG9TdHlsZUVsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpIH0pKSBhcyBOb2RlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4sIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIC8vIExlZ2FjeSBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgaWYgKGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gJiYgJ29uUmVtb3ZlZEZyb21ET00nIGluIG5vZGUgJiYgdHlwZW9mIG5vZGUub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJykgbm9kZS5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbVt0cmFja10ubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChub2RlOiBOb2RlKSB7XG4gICAgcmV0dXJuIHRyYWNrZWQuaGFzKG5vZGUpO1xuICB9XG59XG4iLCAiLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGNvbnN0IERFQlVHID0gZ2xvYmFsVGhpcy5ERUJVRyA9PSAnKicgfHwgZ2xvYmFsVGhpcy5ERUJVRyA9PSB0cnVlIHx8IGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykgfHwgZmFsc2U7XG5leHBvcnQgeyBfY29uc29sZSBhcyBjb25zb2xlIH07XG5leHBvcnQgY29uc3QgdGltZU91dFdhcm4gPSA1MDAwO1xuXG5jb25zdCBfY29uc29sZSA9IHtcbiAgbG9nKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJyhBSS1VSSkgTE9HOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICB3YXJuKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS53YXJuKCcoQUktVUkpIFdBUk46JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIGluZm8oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLnRyYWNlKCcoQUktVUkpIElORk86JywgLi4uYXJncylcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiO1xuXG4vLyBDcmVhdGUgYSBkZWZlcnJlZCBQcm9taXNlLCB3aGljaCBjYW4gYmUgYXN5bmNocm9ub3VzbHkvZXh0ZXJuYWxseSByZXNvbHZlZCBvciByZWplY3RlZC5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG4vLyBVc2VkIHRvIHN1cHByZXNzIFRTIGVycm9yIGFib3V0IHVzZSBiZWZvcmUgaW5pdGlhbGlzYXRpb25cbmNvbnN0IG5vdGhpbmcgPSAodjogYW55KT0+e307XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpaW9uXG4gIHdvcmtzIGZvciByZXRyaWV2YWwgKHRoZSBnZXR0ZXIpLCBvciBpdCB3b3JrcyBmb3IgYXNzaWdubWVudHMgKHRoZSBzZXR0ZXIpLCBidXQgdGhlcmUnc1xuICBubyBUUyBzeW50YXggdGhhdCBwZXJtaXRzIGNvcnJlY3QgdHlwZS1jaGVja2luZyBhdCBwcmVzZW50LlxuXG4gIElkZWFsbHksIGl0IHdvdWxkIGJlOlxuXG4gIHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IHtcbiAgICBnZXQgW0sgaW4ga2V5b2YgSVBdKCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxJUFtLXT4gJiBJUFtLXVxuICAgIHNldCBbSyBpbiBrZXlvZiBJUF0odjogSVBbS10pXG4gIH1cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM4MjZcblxuICBXZSBjaG9vc2UgdGhlIGZvbGxvd2luZyB0eXBlIGRlc2NyaXB0aW9uIHRvIGF2b2lkIHRoZSBpc3N1ZXMgYWJvdmUuIEJlY2F1c2UgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZVxuICBpcyBQYXJ0aWFsIGl0IGNhbiBiZSBvbWl0dGVkIGZyb20gYXNzaWdubWVudHM6XG4gICAgdGhpcy5wcm9wID0gdmFsdWU7ICAvLyBWYWxpZCwgYXMgbG9uZyBhcyB2YWx1cyBoYXMgdGhlIHNhbWUgdHlwZSBhcyB0aGUgcHJvcFxuICAuLi5hbmQgd2hlbiByZXRyaWV2ZWQgaXQgd2lsbCBiZSB0aGUgdmFsdWUgdHlwZSwgYW5kIG9wdGlvbmFsbHkgdGhlIGFzeW5jIGl0ZXJhdG9yOlxuICAgIERpdih0aGlzLnByb3ApIDsgLy8gdGhlIHZhbHVlXG4gICAgdGhpcy5wcm9wLm1hcCEoLi4uLikgIC8vIHRoZSBpdGVyYXRvciAobm90ZSB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoaWNoICphY2NlcHRzKiBhIFBhcnRpYWw8QXN5bmNJdGVyYXRvcj5cbiAgYnV0IGNhc3RzIGl0IHRvIGEgQXN5bmNJdGVyYXRvciBiZWZvcmUgdXNlLlxuXG4gIFRoZSBpdGVyYWJpbGl0eSBvZiBwcm9wZXJ0eXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gIEJ5IGRlZmF1bHQsIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIGRvZXMgYSBkZWVwIG1hcHBpbmcsIHNvIGFuIGl0ZXJhYmxlIHByb3BlcnR5ICdvYmonIGlzIGl0c2VsZlxuICBpdGVyYWJsZSwgYXMgYXJlIGl0J3MgbWVtYmVycy4gVGhlIG9ubHkgZGVmaW5lZCB2YWx1ZSBhdCBwcmVzZW50IGlzIFwic2hhbGxvd1wiLCBpbiB3aGljaCBjYXNlICdvYmonIHJlbWFpbnNcbiAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuKi9cblxuLy8gQmFzZSB0eXBlcyB0aGF0IGNhbiBiZSBtYWRlIGRlZmluZWQgYXMgaXRlcmFibGU6IGJhc2ljYWxseSBhbnl0aGluZywgX2V4Y2VwdF8gYSBmdW5jdGlvblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCk7XG4vLyBXZSBzaG91bGQgZXhjbHVkZSBBc3luY0l0ZXJhYmxlIGZyb20gdGhlIHR5cGVzIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGl0ZXJhYmxlcyAoYW5kIHRoZXJlZm9yZSBwYXNzZWQgdG8gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSlcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgfCBJdGVyYWJsZVByb3BlcnR5VmFsdWVbXSB8IHsgW2s6IHN0cmluZyB8IHN5bWJvbCB8IG51bWJlcl06IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9O1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gVGhpcyBpcyBwYXRjaCB0byB0aGUgc3RkIGxpYiBkZWZpbml0aW9uIG9mIEFycmF5PFQ+LiBJIGRvbid0IGtub3cgd2h5IGl0J3MgYWJzZW50LFxuICAvLyBhcyB0aGlzIGlzIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBhbGwgSmF2YVNjcmlwdCBlbmdpbmVzLiBJdCBpcyBwcm9iYWJseSBhIHJlc3VsdFxuICAvLyBvZiBpdHMgYWJzZW5jZSBpbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS92YWx1ZXMsXG4gIC8vIHdoaWNoIGluaGVyaXRzIGZyb20gdGhlIE9iamVjdC5wcm90b3R5cGUsIHdoaWNoIG1ha2VzIG5vIGNsYWltIGZvciB0aGUgcmV0dXJuIHR5cGVcbiAgLy8gc2luY2UgaXQgY291bGQgYmUgb3ZlcnJpZGRlbS4gSG93ZXZlciwgaW4gdGhhdCBjYXNlLCBhIFRTIGRlZm4gc2hvdWxkIGFsc28gb3ZlcnJpZGVcbiAgLy8gaXQsIGxpa2UgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gZXRjIGRvLlxuICBpbnRlcmZhY2UgQXJyYXk8VD4ge1xuICAgIHZhbHVlT2YoKTogQXJyYXk8VD47XG4gIH1cbiAgLy8gQXMgYWJvdmUsIHRoZSByZXR1cm4gdHlwZSBjb3VsZCBiZSBUIHJhdGhlciB0aGFuIE9iamVjdCwgc2luY2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBpbXBsLFxuICAvLyBidXQgaXQncyBub3QsIGZvciBzb21lIHJlYXNvbi5cbiAgaW50ZXJmYWNlIE9iamVjdCB7XG4gICAgdmFsdWVPZjxUPih0aGlzOiBUKTogVCBleHRlbmRzIEl0ZXJhYmxlVHlwZTxpbmZlciBaPiA/IFogOiBPYmplY3Q7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCwgdHlwZW9mIEl0ZXJhYmlsaXR5Pl06IEl0ZXJhYmxlVHlwZTxJUFtLXT5cbn0gOiAoe1xuICBbSyBpbiBrZXlvZiBJUF06IChcbiAgICBJUFtLXSBleHRlbmRzIEFycmF5PGluZmVyIEU+XG4gICAgPyAoSXRlcmFibGVQcm9wZXJ0aWVzPEU+W10gfCBJdGVyYWJsZVByb3BlcnRpZXM8RVtdPilcbiAgICA6ICgoXG4gICAgICBJUFtLXSBleHRlbmRzIG9iamVjdFxuICAgICAgPyBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+XG4gICAgICA6IElQW0tdXG4gICAgKSAmIEl0ZXJhYmxlVHlwZTxJUFtLXT4pXG4gIClcbn0pXG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7XG4gIHB1c2godmFsdWU6IFQpOiBib29sZWFuO1xuICByZWFkb25seSBsZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3luY0V4dHJhSXRlcmFibGU8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7IH1cblxuLy8gTkI6IFRoaXMgYWxzbyAoaW5jb3JyZWN0bHkpIHBhc3NlcyBzeW5jIGl0ZXJhdG9ycywgYXMgdGhlIHByb3RvY29sIG5hbWVzIGFyZSB0aGUgc2FtZVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgJ25leHQnIGluIG8gJiYgdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBvKSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYXRvcihvKSkgcmV0dXJuIG87XG4gIGlmIChpc0FzeW5jSXRlcmFibGUobykpIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYW4gYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5leHBvcnQgY29uc3QgYXN5bmNFeHRyYXMgPSB7XG4gIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLFxuICAgIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICAgIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbiAgKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlKVxuICB9LFxuICBtYXAsXG4gIGZpbHRlcixcbiAgdW5pcXVlLFxuICB3YWl0Rm9yLFxuICBtdWx0aSxcbiAgaW5pdGlhbGx5LFxuICBjb25zdW1lLFxuICBtZXJnZTxULCBBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+W10+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgLi4ubTogQSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgfSxcbiAgY29tYmluZTxULCBTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCBvdGhlcnM6IFMpIHtcbiAgICByZXR1cm4gY29tYmluZShPYmplY3QuYXNzaWduKHsgJ190aGlzJzogdGhpcyB9LCBvdGhlcnMpKTtcbiAgfVxufTtcblxuY29uc3QgZXh0cmFLZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYXN5bmNFeHRyYXMpLCAuLi5PYmplY3Qua2V5cyhhc3luY0V4dHJhcyldIGFzIChrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXMpW107XG5cbi8vIExpa2UgT2JqZWN0LmFzc2lnbiwgYnV0IHRoZSBhc3NpZ25lZCBwcm9wZXJ0aWVzIGFyZSBub3QgZW51bWVyYWJsZVxuZnVuY3Rpb24gYXNzaWduSGlkZGVuPEQgZXh0ZW5kcyB7fSwgUyBleHRlbmRzIHt9PihkOiBELCBzOiBTKSB7XG4gIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocyksIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyldO1xuICBmb3IgKGNvbnN0IGsgb2Yga2V5cykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCB7IC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocywgayksIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICB9XG4gIHJldHVybiBkIGFzIEQgJiBTO1xufVxuXG5jb25zdCBfcGVuZGluZyA9IFN5bWJvbCgncGVuZGluZycpO1xuY29uc3QgX2l0ZW1zID0gU3ltYm9sKCdpdGVtcycpO1xuZnVuY3Rpb24gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSB7XG4gICAgW19wZW5kaW5nXTogW10gYXMgRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQ+PltdIHwgbnVsbCxcbiAgICBbX2l0ZW1zXTogW10gYXMgSXRlcmF0b3JSZXN1bHQ8VD5bXSB8IG51bGwsXG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIHEgYXMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKHFbX2l0ZW1zXT8ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocVtfaXRlbXNdLnNoaWZ0KCkhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICAvLyBXZSBpbnN0YWxsIGEgY2F0Y2ggaGFuZGxlciBhcyB0aGUgcHJvbWlzZSBtaWdodCBiZSBsZWdpdGltYXRlbHkgcmVqZWN0IGJlZm9yZSBhbnl0aGluZyB3YWl0cyBmb3IgaXQsXG4gICAgICAvLyBhbmQgdGhpcyBzdXBwcmVzc2VzIHRoZSB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZy5cbiAgICAgIHZhbHVlLmNhdGNoKGV4ID0+IHsgfSk7XG4gICAgICBxW19wZW5kaW5nXS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcmV0dXJuKHY/OiB1bmtub3duKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgdGhyb3coLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogYXJnc1swXSB9O1xuICAgICAgaWYgKHFbX3BlbmRpbmddKSB7XG4gICAgICAgIHRyeSB7IHN0b3AoKSB9IGNhdGNoIChleCkgeyB9XG4gICAgICAgIHdoaWxlIChxW19wZW5kaW5nXS5sZW5ndGgpXG4gICAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkgcmV0dXJuIC0xOyAvLyBUaGUgcXVldWUgaGFzIG5vIGNvbnN1bWVycyBhbmQgaGFzIHRlcm1pbmF0ZWQuXG4gICAgICByZXR1cm4gcVtfaXRlbXNdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmNvbnN0IF9pbmZsaWdodCA9IFN5bWJvbCgnaW5mbGlnaHQnKTtcbmZ1bmN0aW9uIGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3ApIGFzIFJldHVyblR5cGU8dHlwZW9mIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4+ICYgeyBbX2luZmxpZ2h0XTogU2V0PFQ+IH07XG4gIHFbX2luZmxpZ2h0XSA9IG5ldyBTZXQ8VD4oKTtcblxuICBxLnB1c2ggPSBmdW5jdGlvbiAodmFsdWU6IFQpIHtcbiAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRGVib3VuY2VcbiAgICBpZiAocVtfaW5mbGlnaHRdLmhhcyh2YWx1ZSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgIHFbX2luZmxpZ2h0XS5hZGQodmFsdWUpO1xuICAgICAgY29uc3QgcCA9IHFbX3BlbmRpbmddLnBvcCgpITtcbiAgICAgIHAuZmluYWxseSgoKSA9PiBxW19pbmZsaWdodF0uZGVsZXRlKHZhbHVlKSk7XG4gICAgICBwLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgfSBlbHNlIGlmICghcVtfaXRlbXNdLmZpbmQodiA9PiB2LnZhbHVlID09PSB2YWx1ZSkpIHtcbiAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBxO1xufVxuXG4vLyBSZS1leHBvcnQgdG8gaGlkZSB0aGUgaW50ZXJuYWxzXG5leHBvcnQgY29uc3QgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuZXhwb3J0IGNvbnN0IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5jb25zdCBfcHJveGllZEFzeW5jSXRlcmF0b3IgPSBTeW1ib2woJ19wcm94aWVkQXN5bmNJdGVyYXRvcicpO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUl0ZXJhYmxlUHJvcGVydHk8VCBleHRlbmRzIHt9LCBjb25zdCBOIGV4dGVuZHMgc3RyaW5nIHwgc3ltYm9sLCBWIGV4dGVuZHMgSXRlcmFibGVQcm9wZXJ0eVZhbHVlPihvYmo6IFQsIG5hbWU6IE4sIHY6IFYpOiBUICYgSXRlcmFibGVQcm9wZXJ0aWVzPHsgW2sgaW4gTl06IFYgfT4ge1xuICAvLyBNYWtlIGBhYCBhbiBBc3luY0V4dHJhSXRlcmFibGUuIFdlIGRvbid0IGRvIHRoaXMgdW50aWwgYSBjb25zdW1lciBhY3R1YWxseSB0cmllcyB0b1xuICAvLyBhY2Nlc3MgdGhlIGl0ZXJhdG9yIG1ldGhvZHMgdG8gcHJldmVudCBsZWFrcyB3aGVyZSBhbiBpdGVyYWJsZSBpcyBjcmVhdGVkLCBidXRcbiAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gIGxldCBpbml0SXRlcmF0b3IgPSAoKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICBjb25zdCBiaSA9IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl07XG4gICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgZXh0cmFLZXlzLmZvckVhY2goayA9PiAvLyBAdHMtaWdub3JlXG4gICAgICBleHRyYXNba10gPSBiW2sgYXMga2V5b2YgdHlwZW9mIGJdKTtcbiAgICBpZiAoIShfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gYSkpXG4gICAgICBhc3NpZ25IaWRkZW4oYSwgZXh0cmFzKTtcbiAgICByZXR1cm4gYjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBzdHVicyB0aGF0IGxhemlseSBjcmVhdGUgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZSBpbnRlcmZhY2Ugd2hlbiBpbnZva2VkXG4gIGZ1bmN0aW9uIGxhenlBc3luY01ldGhvZDxNIGV4dGVuZHMga2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzPihtZXRob2Q6IE0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgW21ldGhvZF06IGZ1bmN0aW9uICh0aGlzOiB1bmtub3duLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICByZXR1cm4gYVttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBhcyAodHlwZW9mIGFzeW5jRXh0cmFzKVtNXVxuICAgIH1bbWV0aG9kXTtcbiAgfVxuXG4gIHR5cGUgSGVscGVyRGVzY3JpcHRvcnM8VD4gPSB7XG4gICAgW0sgaW4ga2V5b2YgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+XTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+W0tdPlxuICB9ICYge1xuICAgIFtJdGVyYWJpbGl0eV0/OiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjwnc2hhbGxvdyc+XG4gIH07XG5cbiAgY29uc3QgZXh0cmFzID0geyBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiBpbml0SXRlcmF0b3IgfSBhcyBBc3luY0V4dHJhSXRlcmFibGU8Vj4gJiB7IFtJdGVyYWJpbGl0eV0/OiAnc2hhbGxvdycgfTtcbiAgZXh0cmFLZXlzLmZvckVhY2goKGspID0+IC8vIEB0cy1pZ25vcmVcbiAgICBleHRyYXNba10gPSBsYXp5QXN5bmNNZXRob2QoaykpXG4gIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAmJiBJdGVyYWJpbGl0eSBpbiB2ICYmIHZbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpIHtcbiAgICBleHRyYXNbSXRlcmFiaWxpdHldID0gdltJdGVyYWJpbGl0eV07XG4gIH1cblxuICAvLyBMYXppbHkgaW5pdGlhbGl6ZSBgcHVzaGBcbiAgbGV0IHB1c2g6IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+WydwdXNoJ10gPSAodjogVikgPT4ge1xuICAgIGluaXRJdGVyYXRvcigpOyAvLyBVcGRhdGVzIGBwdXNoYCB0byByZWZlcmVuY2UgdGhlIG11bHRpLXF1ZXVlXG4gICAgcmV0dXJuIHB1c2godik7XG4gIH1cblxuICBsZXQgYSA9IGJveCh2LCBleHRyYXMpO1xuICBsZXQgcGlwZWQ6IEFzeW5jSXRlcmFibGU8Vj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgIGdldCgpOiBWIHsgcmV0dXJuIGEgfSxcbiAgICBzZXQodjogViB8IEFzeW5jRXh0cmFJdGVyYWJsZTxWPikge1xuICAgICAgaWYgKHYgIT09IGEpIHtcbiAgICAgICAgaWYgKGlzQXN5bmNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgIC8vIEFzc2lnbmluZyBtdWx0aXBsZSBhc3luYyBpdGVyYXRvcnMgdG8gYSBzaW5nbGUgaXRlcmFibGUgaXMgcHJvYmFibHkgYVxuICAgICAgICAgIC8vIGJhZCBpZGVhIGZyb20gYSByZWFzb25pbmcgcG9pbnQgb2YgdmlldywgYW5kIG11bHRpcGxlIGltcGxlbWVudGF0aW9uc1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZTpcbiAgICAgICAgICAvLyAgKiBtZXJnZT9cbiAgICAgICAgICAvLyAgKiBpZ25vcmUgc3Vic2VxdWVudCBhc3NpZ25tZW50cz9cbiAgICAgICAgICAvLyAgKiB0ZXJtaW5hdGUgdGhlIGZpcnN0IHRoZW4gY29uc3VtZSB0aGUgc2Vjb25kP1xuICAgICAgICAgIC8vIFRoZSBzb2x1dGlvbiBoZXJlIChvbmUgb2YgbWFueSBwb3NzaWJpbGl0aWVzKSBpcyB0aGUgbGV0dGVyOiBvbmx5IHRvIGFsbG93XG4gICAgICAgICAgLy8gbW9zdCByZWNlbnQgYXNzaWdubWVudCB0byB3b3JrLCB0ZXJtaW5hdGluZyBhbnkgcHJlY2VlZGluZyBpdGVyYXRvciB3aGVuIGl0IG5leHRcbiAgICAgICAgICAvLyB5aWVsZHMgYW5kIGZpbmRzIHRoaXMgY29uc3VtZXIgaGFzIGJlZW4gcmUtYXNzaWduZWQuXG5cbiAgICAgICAgICAvLyBJZiB0aGUgaXRlcmF0b3IgaGFzIGJlZW4gcmVhc3NpZ25lZCB3aXRoIG5vIGNoYW5nZSwganVzdCBpZ25vcmUgaXQsIGFzIHdlJ3JlIGFscmVhZHkgY29uc3VtaW5nIGl0XG4gICAgICAgICAgaWYgKHBpcGVkID09PSB2KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgcGlwZWQgPSB2O1xuICAgICAgICAgIGxldCBzdGFjayA9IERFQlVHID8gbmV3IEVycm9yKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKERFQlVHKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKG5ldyBFcnJvcihgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBoYXMgYmVlbiBhc3NpZ25lZCB0byBjb25zdW1lIGFub3RoZXIgaXRlcmF0b3IuIERpZCB5b3UgbWVhbiB0byBkZWNsYXJlIGl0P2ApKTtcbiAgICAgICAgICBjb25zdW1lLmNhbGwodiwgeSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAsIHsgY2F1c2U6IHN0YWNrIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHVzaCh5Py52YWx1ZU9mKCkgYXMgVilcbiAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGV4ID0+IGNvbnNvbGUuaW5mbyhleCkpXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiAodiA9PT0gcGlwZWQpICYmIChwaXBlZCA9IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgICAgLy8gRWFybHkgcmV0dXJuIGFzIHdlJ3JlIGdvaW5nIHRvIHBpcGUgdmFsdWVzIGluIGxhdGVyXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwaXBlZCAmJiBERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaXMgYWxyZWFkeSBwaXBlZCBmcm9tIGFub3RoZXIgaXRlcmF0b3IsIGFuZCBtaWdodCBiZSBvdmVycndpdHRlbiBsYXRlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhID0gYm94KHYsIGV4dHJhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHB1c2godj8udmFsdWVPZigpIGFzIFYpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIG9iaiBhcyBhbnk7XG5cbiAgZnVuY3Rpb24gYm94PFY+KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KTogViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiB7XG4gICAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICB2YWx1ZU9mOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRvSlNPTjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9XG4gICAgICB9KSwgcGRzKTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIC8vIEJveGVzIHR5cGVzLCBpbmNsdWRpbmcgQmlnSW50XG4gICAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0KGEpLCBPYmplY3QuYXNzaWduKHBkcywge1xuICAgICAgICAgIHRvSlNPTigpIHsgcmV0dXJuIGEudmFsdWVPZigpIH1cbiAgICAgICAgfSkpO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgLy8gV2UgYm94IG9iamVjdHMgYnkgY3JlYXRpbmcgYSBQcm94eSBmb3IgdGhlIG9iamVjdCB0aGF0IHB1c2hlcyBvbiBnZXQvc2V0L2RlbGV0ZSwgYW5kIG1hcHMgdGhlIHN1cHBsaWVkIGFzeW5jIGl0ZXJhdG9yIHRvIHB1c2ggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgICAgLy8gVGhlIHByb3hpZXMgYXJlIHJlY3Vyc2l2ZSwgc28gdGhhdCBpZiBhbiBvYmplY3QgY29udGFpbnMgb2JqZWN0cywgdGhleSB0b28gYXJlIHByb3hpZWQuIE9iamVjdHMgY29udGFpbmluZyBwcmltaXRpdmVzIHJlbWFpbiBwcm94aWVkIHRvXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgZ2V0L3NldC9zZWxldGUgaW4gcGxhY2Ugb2YgdGhlIHVzdWFsIHByaW1pdGl2ZSBib3hpbmcgdmlhIE9iamVjdChwcmltaXRpdmVWYWx1ZSlcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gYm94T2JqZWN0KGEsIHBkcyk7XG5cbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSXRlcmFibGUgcHJvcGVydGllcyBjYW5ub3QgYmUgb2YgdHlwZSBcIicgKyB0eXBlb2YgYSArICdcIicpO1xuICB9XG5cbiAgdHlwZSBXaXRoUGF0aCA9IHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYTogViwgcGF0aDogc3RyaW5nIHwgbnVsbCB9IH07XG4gIHR5cGUgUG9zc2libHlXaXRoUGF0aCA9IFYgfCBXaXRoUGF0aDtcbiAgZnVuY3Rpb24gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvOiBQb3NzaWJseVdpdGhQYXRoKTogbyBpcyBXaXRoUGF0aCB7XG4gICAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiBfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gbztcbiAgfVxuICBmdW5jdGlvbiBkZXN0cnVjdHVyZShvOiBhbnksIHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZpZWxkcyA9IHBhdGguc3BsaXQoJy4nKS5zbGljZSgxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGggJiYgKChvID0gbz8uW2ZpZWxkc1tpXV0pICE9PSB1bmRlZmluZWQpOyBpKyspO1xuICAgIHJldHVybiBvO1xuICB9XG4gIGZ1bmN0aW9uIGJveE9iamVjdChhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxQb3NzaWJseVdpdGhQYXRoPikge1xuICAgIGxldCB3aXRoUGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFdpdGhQYXRoW3R5cGVvZiBfcHJveGllZEFzeW5jSXRlcmF0b3JdPjtcbiAgICBsZXQgd2l0aG91dFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcbiAgICByZXR1cm4gbmV3IFByb3h5KGEgYXMgb2JqZWN0LCBoYW5kbGVyKCkpIGFzIFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKHBhdGggPSAnJyk6IFByb3h5SGFuZGxlcjxvYmplY3Q+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC8vIEEgYm94ZWQgb2JqZWN0IGhhcyBpdHMgb3duIGtleXMsIGFuZCB0aGUga2V5cyBvZiBhbiBBc3luY0V4dHJhSXRlcmFibGVcbiAgICAgICAgaGFzKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGtleSA9PT0gX3Byb3hpZWRBc3luY0l0ZXJhdG9yIHx8IGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlIHx8IGtleSBpbiB0YXJnZXQgfHwga2V5IGluIHBkcztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBhIGtleSBpcyBzZXQgaW4gdGhlIHRhcmdldCwgcHVzaCB0aGUgY2hhbmdlXG4gICAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgJHtuYW1lLnRvU3RyaW5nKCl9JHtwYXRofS4ke2tleS50b1N0cmluZygpfSBhcyBpdCBpcyBwYXJ0IG9mIGFzeW5jSXRlcmF0b3JgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIGlmIChSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGdldHRpbmcgdGhlIHZhbHVlIG9mIGEgYm94ZWQgb2JqZWN0IG1lbWJlciwgcHJlZmVyIGFzeW5jRXh0cmFJdGVyYWJsZSBvdmVyIHRhcmdldCBrZXlzXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGFuIGFzeW5jRXh0cmFJdGVyYWJsZSBtZW1iZXIsIGNyZWF0ZSB0aGUgbWFwcGVkIHF1ZXVlIHRvIGdlbmVyYXRlIGl0XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ocGRzLCBrZXkpKSB7XG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHdpdGhvdXRQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0uYSA6IG8pO1xuICAgICAgICAgICAgICByZXR1cm4gd2l0aG91dFBhdGhba2V5IGFzIGtleW9mIHR5cGVvZiBwZHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2l0aFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXSA6IHsgYTogbywgcGF0aDogbnVsbCB9KTtcblxuICAgICAgICAgICAgICBsZXQgYWkgPSBmaWx0ZXJNYXAod2l0aFBhdGgsIChvLCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGRlc3RydWN0dXJlKG8uYSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgIT09IHYgfHwgby5wYXRoID09PSBudWxsIHx8IG8ucGF0aC5zdGFydHNXaXRoKHBhdGgpID8gdiA6IElnbm9yZTtcbiAgICAgICAgICAgICAgfSwgSWdub3JlLCBkZXN0cnVjdHVyZShhLCBwYXRoKSk7XG4gICAgICAgICAgICAgIHJldHVybiBhaVtrZXkgYXMga2V5b2YgdHlwZW9mIGFpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGUga2V5IGlzIGEgdGFyZ2V0IHByb3BlcnR5LCBjcmVhdGUgdGhlIHByb3h5IHRvIGhhbmRsZSBpdFxuICAgICAgICAgIGlmIChrZXkgPT09ICd2YWx1ZU9mJykgcmV0dXJuICgpID0+IGRlc3RydWN0dXJlKGEsIHBhdGgpO1xuICAgICAgICAgIGlmIChrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlLCBzaW5jZSBTeW1ib2wudG9QcmltaXRpdmUgaXMgaW4gaGEoKSwgd2UgbmVlZCB0byBpbXBsZW1lbnQgaXRcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaGludD86ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgaWYgKFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHRhcmdldCkuY2FsbCh0YXJnZXQsIGhpbnQpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ3N0cmluZycpIHJldHVybiB0YXJnZXQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdudW1iZXInKSByZXR1cm4gTnVtYmVyKHRhcmdldCk7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudmFsdWVPZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICgoIShrZXkgaW4gdGFyZ2V0KSB8fCBPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSkgJiYgIShJdGVyYWJpbGl0eSBpbiB0YXJnZXQgJiYgdGFyZ2V0W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGZpZWxkID09PSAnZnVuY3Rpb24nKSB8fCBpc0FzeW5jSXRlcihmaWVsZClcbiAgICAgICAgICAgICAgICA/IGZpZWxkXG4gICAgICAgICAgICAgICAgOiBuZXcgUHJveHkoT2JqZWN0KGZpZWxkKSwgaGFuZGxlcihwYXRoICsgJy4nICsga2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBzeW1ib2xpYyBlbnRyeSwgb3IgYSBwcm90b3R5cGljYWwgdmFsdWUgKHNpbmNlIGl0J3MgaW4gdGhlIHRhcmdldCwgYnV0IG5vdCBhIHRhcmdldCBwcm9wZXJ0eSlcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKlxuICBFeHRlbnNpb25zIHRvIHRoZSBBc3luY0l0ZXJhYmxlOlxuKi9cbmNvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG5cbi8qIE1lcmdlIGFzeW5jSXRlcmFibGVzIGludG8gYSBzaW5nbGUgYXN5bmNJdGVyYWJsZSAqL1xuXG4vKiBUUyBoYWNrIHRvIGV4cG9zZSB0aGUgcmV0dXJuIEFzeW5jR2VuZXJhdG9yIGEgZ2VuZXJhdG9yIG9mIHRoZSB1bmlvbiBvZiB0aGUgbWVyZ2VkIHR5cGVzICovXG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+ID0gVFtdIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGluZmVyIFU+PltdID8gVSA6IG5ldmVyO1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8VD4gPSBBc3luY0l0ZXJhYmxlPENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+PjtcblxuZXhwb3J0IGNvbnN0IG1lcmdlID0gPEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4+W10sIFRZaWVsZCwgVFJldHVybiwgVE5leHQ+KC4uLmFpOiBBKSA9PiB7XG4gIGNvbnN0IGl0OiAodW5kZWZpbmVkIHwgQXN5bmNJdGVyYXRvcjxhbnk+KVtdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG4gIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHsgaWR4OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55PiB9PltdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgbGV0IGluaXQgPSAoKSA9PiB7XG4gICAgaW5pdCA9ICgpID0+IHsgfVxuICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYWkubGVuZ3RoOyBuKyspIHtcbiAgICAgIGNvbnN0IGEgPSBhaVtuXSBhcyBBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+O1xuICAgICAgcHJvbWlzZXNbbl0gPSAoaXRbbl0gPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhXG4gICAgICAgID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICAgICAgICA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+KVxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBpZHg6IG4sIHJlc3VsdCB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBbXTtcbiAgbGV0IGNvdW50ID0gcHJvbWlzZXMubGVuZ3RoO1xuXG4gIGNvbnN0IG1lcmdlZDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFbbnVtYmVyXT4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIG1lcmdlZCB9LFxuICAgIG5leHQoKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gY291bnRcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMpLnRoZW4oKHsgaWR4LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBmb3JldmVyO1xuICAgICAgICAgICAgcmVzdWx0c1tpZHhdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWllbGQgaW50ZXJtZWRpYXRlIHJldHVybiB2YWx1ZXMsIHdlIGp1c3Qga2VlcCB0aGVtIGluIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIHJldHVybiB7IGRvbmU6IGNvdW50ID09PSAwLCB2YWx1ZTogcmVzdWx0LnZhbHVlIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBgZXhgIGlzIHRoZSB1bmRlcmx5aW5nIGFzeW5jIGl0ZXJhdGlvbiBleGNlcHRpb25cbiAgICAgICAgICAgIHByb21pc2VzW2lkeF0gPSBpdFtpZHhdXG4gICAgICAgICAgICAgID8gaXRbaWR4XSEubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGlkeCwgcmVzdWx0IH0pKS5jYXRjaChleCA9PiAoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSB9KSlcbiAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBpZHgsIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChleCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdz8uKGV4KSA/PyBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBuZXcgRXJyb3IoXCJJdGVyYXRvciBtZXJnZSBleGNlcHRpb25cIikgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHJlc3VsdHMgfSk7XG4gICAgfSxcbiAgICBhc3luYyByZXR1cm4ocikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy5yZXR1cm4/Lih7IGRvbmU6IHRydWUsIHZhbHVlOiByIH0pLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfSxcbiAgICBhc3luYyB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9taXNlc1tpXSAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHByb21pc2VzW2ldID0gZm9yZXZlcjtcbiAgICAgICAgICByZXN1bHRzW2ldID0gYXdhaXQgaXRbaV0/LnRocm93Py4oZXgpLnRoZW4odiA9PiB2LnZhbHVlLCBleCA9PiBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJlY2F1c2Ugd2UndmUgcGFzc2VkIHRoZSBleGNlcHRpb24gb24gdG8gYWxsIHRoZSBzb3VyY2VzLCB3ZSdyZSBub3cgZG9uZVxuICAgICAgLy8gcHJldmlvdXNseTogcmV0dXJuIFByb21pc2UucmVqZWN0KGV4KTtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IEFzeW5jRXh0cmFJdGVyYWJsZTx7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tYmluZU9wdGlvbnMge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG59XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lID0gPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPihzcmM6IFMsIG9wdHM6IENvbWJpbmVPcHRpb25zID0ge30pOiBDb21iaW5lZEl0ZXJhYmxlUmVzdWx0PFM+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0ge307XG4gIGxldCBwYzogUHJvbWlzZTx7IGlkeDogbnVtYmVyLCBrOiBzdHJpbmcsIGlyOiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+W107XG4gIGxldCBzaTogQXN5bmNJdGVyYXRvcjxhbnk+W10gPSBbXTtcbiAgbGV0IGFjdGl2ZTogbnVtYmVyID0gMDtcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBPYmplY3QuZW50cmllcyhzcmMpLm1hcCgoW2ssIHNpdF0sIGlkeCkgPT4ge1xuICAgICAgICAgIGFjdGl2ZSArPSAxO1xuICAgICAgICAgIHNpW2lkeF0gPSBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICAgIHJldHVybiBzaVtpZHhdLm5leHQoKS50aGVuKGlyID0+ICh7IHNpLCBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoZnVuY3Rpb24gc3RlcCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKHBjKS50aGVuKCh7IGlkeCwgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwY1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgIGFjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICBwY1tpZHhdID0gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBpZHgsIGssIGlyIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdHMuaWdub3JlUGFydGlhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFjY3VtdWxhdGVkKS5sZW5ndGggPCBPYmplY3Qua2V5cyhzcmMpLmxlbmd0aClcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICB9KVxuICAgICAgfSkoKTtcbiAgICB9LFxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICBwYy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKHAgIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBzaVtpZHhdLnJldHVybj8uKHYpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgIH0sXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgcGMuZm9yRWFjaCgocCwgaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS50aHJvdz8uKGV4KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGPiA9XG4gIEYgZXh0ZW5kcyAoKSA9PiBBc3luY0l0ZXJhdG9yPGluZmVyIFQ+XG4gID8gVCA6IG5ldmVyO1xuXG5hc3luYyBmdW5jdGlvbiBjb25zdW1lPFUgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+KHRoaXM6IFUsIGY/OiAodTogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBsYXN0OiB1bmRlZmluZWQgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pIHtcbiAgICBsYXN0ID0gZj8uKHUpO1xuICB9XG4gIGF3YWl0IGxhc3Q7XG59XG5cbnR5cGUgTWFwcGVyPFUsIFI+ID0gKChvOiBVLCBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSkgPT4gTWF5YmVQcm9taXNlZDxSIHwgdHlwZW9mIElnbm9yZT4pO1xudHlwZSBNYXliZVByb21pc2VkPFQ+ID0gUHJvbWlzZUxpa2U8VD4gfCBUO1xuXG4vKiBBIGdlbmVyYWwgZmlsdGVyICYgbWFwcGVyIHRoYXQgY2FuIGhhbmRsZSBleGNlcHRpb25zICYgcmV0dXJucyAqL1xuZXhwb3J0IGNvbnN0IElnbm9yZSA9IFN5bWJvbChcIklnbm9yZVwiKTtcblxudHlwZSBQYXJ0aWFsSXRlcmFibGU8VCA9IGFueT4gPSBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VD4+O1xuXG5mdW5jdGlvbiByZXNvbHZlU3luYzxaLCBSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOiAodjogWikgPT4gUiwgZXhjZXB0OiAoeDogYW55KSA9PiBhbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGlzUHJvbWlzZUxpa2UodikpXG4gICAgcmV0dXJuIHYudGhlbih0aGVuLCBleGNlcHQpO1xuICB0cnkgeyByZXR1cm4gdGhlbih2KSB9IGNhdGNoIChleCkgeyByZXR1cm4gZXhjZXB0KGV4KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBjb25zdCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gcmVzb2x2ZShwKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4uLlxuICAgICAgICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIC0gZm9yIG5vdyB3ZSBpZ25vcmUgdGhlIHJlc3VsdCBvZiB0aGUgdGVybWluYXRpb25cbiAgICAgICAgICAgICAgICByZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7IC8vIFRlcm1pbmF0ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcblxuICAgICAgICAgIGV4ID0+XG4gICAgICAgICAgICAvLyBUaGUgc291cmNlIHRocmV3LiBUZWxsIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIC8vIFRoZSBjYWxsYmFjayB0aHJld1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoIWl0Py5kb25lKSB7XG4gICAgICBjdXJyZW50ID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICBhaSEubmV4dCgpXG4gICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBjdXJyZW50LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIGNvbnN1bWVycyArPSAxO1xuICAgICAgcmV0dXJuIG1haTtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmICghYWkpIHtcbiAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBzdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudC8vLnRoZW4oemFsZ28gPT4gemFsZ28pO1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaT8ucmV0dXJuPy4oZXgpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEdsb2JhbEFzeW5jR2VuZXJhdG9ycygpIHtcbiAgbGV0IGcgPSAoYXN5bmMgZnVuY3Rpb24qICgpIHsgfSkoKTtcbiAgd2hpbGUgKGcpIHtcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnLCBTeW1ib2wuYXN5bmNJdGVyYXRvcik7XG4gICAgaWYgKGRlc2MpIHtcbiAgICAgIGl0ZXJhYmxlSGVscGVycyhnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBnID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGcpO1xuICB9XG4gIGlmICghZykge1xuICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBhdWdtZW50IHRoZSBwcm90b3R5cGUgb2YgYChhc3luYyBmdW5jdGlvbiooKSkoKWBcIik7XG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlLCB0aW1lT3V0V2FybiB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgaXRlcmFibGVIZWxwZXJzLCBtZXJnZSwgQXN5bmNFeHRyYUl0ZXJhYmxlLCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvciB9IGZyb20gXCIuL2l0ZXJhdG9ycy5qc1wiO1xuXG4vKlxuICBgd2hlbiguLi4uKWAgaXMgYm90aCBhbiBBc3luY0l0ZXJhYmxlIG9mIHRoZSBldmVudHMgaXQgY2FuIGdlbmVyYXRlIGJ5IG9ic2VydmF0aW9uLFxuICBhbmQgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYXAgdGhvc2UgZXZlbnRzIHRvIGEgc3BlY2lmaWVkIHR5cGUsIGVnOlxuXG4gIHRoaXMud2hlbigna2V5dXA6I2VsZW1ldCcpID0+IEFzeW5jSXRlcmFibGU8S2V5Ym9hcmRFdmVudD5cbiAgdGhpcy53aGVuKCcjZWxlbWV0JykoZSA9PiBlLnRhcmdldCkgPT4gQXN5bmNJdGVyYWJsZTxFdmVudFRhcmdldD5cbiovXG4vLyBWYXJhcmdzIHR5cGUgcGFzc2VkIHRvIFwid2hlblwiXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxcbiAgQXN5bmNJdGVyYWJsZTxhbnk+XG4gIHwgVmFsaWRXaGVuU2VsZWN0b3I8SURTPlxuICB8IEVsZW1lbnQgLyogSW1wbGllcyBcImNoYW5nZVwiIGV2ZW50ICovXG4gIHwgUHJvbWlzZTxhbnk+IC8qIEp1c3QgZ2V0cyB3cmFwcGVkIGluIGEgc2luZ2xlIGB5aWVsZGAgKi9cbj47XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gICAgQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmXG4gICAgKDxSPihtYXBwZXI6ICh2YWx1ZTogQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXIpID0+IFIpID0+IChBc3luY0V4dHJhSXRlcmFibGU8QXdhaXRlZDxSPj4pKVxuICA6IG5ldmVyO1xuXG4vLyBUaGUgZXh0ZW5kZWQgaXRlcmF0b3IgdGhhdCBzdXBwb3J0cyBhc3luYyBpdGVyYXRvciBtYXBwaW5nLCBjaGFpbmluZywgZXRjXG5leHBvcnQgdHlwZSBXaGVuUmV0dXJuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICBNYXBwYWJsZUl0ZXJhYmxlPFxuICAgIEFzeW5jRXh0cmFJdGVyYWJsZTxcbiAgICAgIFdoZW5JdGVyYXRlZFR5cGU8Uz4+PjtcblxudHlwZSBFbXB0eU9iamVjdCA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIG5ldmVyPjtcblxudHlwZSBTcGVjaWFsV2hlbkV2ZW50cyA9IHtcbiAgXCJAc3RhcnRcIjogRW1wdHlPYmplY3QsICAvLyBBbHdheXMgZmlyZXMgd2hlbiByZWZlcmVuY2VkXG4gIFwiQHJlYWR5XCI6IEVtcHR5T2JqZWN0ICAgLy8gRmlyZXMgd2hlbiBhbGwgRWxlbWVudCBzcGVjaWZpZWQgc291cmNlcyBhcmUgbW91bnRlZCBpbiB0aGUgRE9NXG59O1xudHlwZSBXaGVuRXZlbnRzID0gR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwICYgU3BlY2lhbFdoZW5FdmVudHM7XG50eXBlIEV2ZW50TmFtZUxpc3Q8VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBgJHtTfSwke0V2ZW50TmFtZUxpc3Q8Uj59YFxuICA6IG5ldmVyO1xuXG50eXBlIEV2ZW50TmFtZVVuaW9uPFQgZXh0ZW5kcyBzdHJpbmc+ID0gVCBleHRlbmRzIGtleW9mIFdoZW5FdmVudHNcbiAgPyBUXG4gIDogVCBleHRlbmRzIGAke2luZmVyIFMgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzfSwke2luZmVyIFJ9YFxuICA/IEV2ZW50TmFtZUxpc3Q8Uj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogUyB8IEV2ZW50TmFtZUxpc3Q8Uj5cbiAgOiBuZXZlcjtcblxuXG50eXBlIEV2ZW50QXR0cmlidXRlID0gYCR7a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwfWBcbnR5cGUgQ1NTSWRlbnRpZmllcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCMke0lEU31gIHxgLiR7c3RyaW5nfWAgfCBgWyR7c3RyaW5nfV1gXG5cbi8qIFZhbGlkV2hlblNlbGVjdG9ycyBhcmU6XG4gICAgQHN0YXJ0XG4gICAgQHJlYWR5XG4gICAgZXZlbnQ6c2VsZWN0b3JcbiAgICBldmVudCAgICAgICAgICAgXCJ0aGlzXCIgZWxlbWVudCwgZXZlbnQgdHlwZT0nZXZlbnQnXG4gICAgc2VsZWN0b3IgICAgICAgIHNwZWNpZmljZWQgc2VsZWN0b3JzLCBpbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnRcbiovXG5cbmV4cG9ydCB0eXBlIFZhbGlkV2hlblNlbGVjdG9yPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgJHtrZXlvZiBTcGVjaWFsV2hlbkV2ZW50c31gXG4gIHwgYCR7RXZlbnRBdHRyaWJ1dGV9OiR7Q1NTSWRlbnRpZmllcjxJRFM+fWBcbiAgfCBFdmVudEF0dHJpYnV0ZVxuICB8IENTU0lkZW50aWZpZXI8SURTPjtcblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+XG4gID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyO1xuXG50eXBlIEV4dHJhY3RFdmVudE5hbWVzPFM+XG4gID0gUyBleHRlbmRzIGtleW9mIFNwZWNpYWxXaGVuRXZlbnRzID8gU1xuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBWfToke2luZmVyIEwgZXh0ZW5kcyBDU1NJZGVudGlmaWVyfWBcbiAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBgJHtpbmZlciBMIGV4dGVuZHMgQ1NTSWRlbnRpZmllcn1gXG4gID8gJ2NoYW5nZSdcbiAgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl07XG5cbi8qKiB3aGVuICoqL1xudHlwZSBFdmVudE9ic2VydmF0aW9uPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXI6IEVsZW1lbnRcbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGxcbn07XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBXZWFrTWFwPERvY3VtZW50LCBNYXA8a2V5b2YgV2hlbkV2ZW50cywgU2V0PEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPj4+PigpO1xuXG5mdW5jdGlvbiBkb2NFdmVudEhhbmRsZXI8RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPih0aGlzOiBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKHRoaXMpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldCh0aGlzLCBuZXcgTWFwKCkpO1xuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldCh0aGlzKSEuZ2V0KGV2LnR5cGUgYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwKTtcbiAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXIsIHNlbGVjdG9yIH0gPSBvO1xuICAgICAgICBpZiAoIWNvbnRhaW5lci5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IFwiQ29udGFpbmVyIGAjXCIgKyBjb250YWluZXIuaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICB0ZXJtaW5hdGUobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0ID09PSBuIHx8IG4uY29udGFpbnMoZXYudGFyZ2V0KSkgJiYgY29udGFpbmVyLmNvbnRhaW5zKG4pKVxuICAgICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKChldi50YXJnZXQgPT09IGNvbnRhaW5lciB8fCBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSkpXG4gICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUud2FybignZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW0NTU0lkZW50aWZpZXIgfCBudWxsLCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW3BhcnRzWzBdLFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbbnVsbCwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW3BhcnRzWzFdLCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZG9UaHJvdyhtZXNzYWdlOiBzdHJpbmcpOm5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbc2VsZWN0b3IsIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGNvbnRhaW5lci5vd25lckRvY3VtZW50KSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQsIG5ldyBNYXAoKSk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5oYXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnRhaW5lci5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCk/LmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuXG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiAvKkV2ZW50T2JzZXJ2YXRpb248RXhjbHVkZTxFeHRyYWN0RXZlbnROYW1lczxFdmVudE5hbWU+LCBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cz4+Ki8gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyLFxuICAgIHNlbGVjdG9yOiBzZWxlY3RvciB8fCBudWxsXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCk/LmdldChldmVudE5hbWUpIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG5ldmVyR29ubmFIYXBwZW48Wj4oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFo+IHtcbiAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4ge30pO1xuICB5aWVsZCB1bmRlZmluZWQgYXMgWjsgLy8gTmV2ZXIgc2hvdWxkIGJlIGV4ZWN1dGVkXG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyc1tudW1iZXJdKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgZnVuY3Rpb24gaXNNaXNzaW5nKHNlbDogQ1NTSWRlbnRpZmllciB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0eXBlb2Ygc2VsID09PSAnc3RyaW5nJyAmJiAhY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3Ioc2VsKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLmZpbHRlcihpc01pc3NpbmcpO1xuXG4gICAgbGV0IGV2ZW50czogQXN5bmNJdGVyYXRvcjxhbnksIGFueSwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPGFueT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gYWkgfSxcbiAgICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8udGhyb3cpIHJldHVybiBldmVudHMudGhyb3coZXgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgfSxcbiAgICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnJldHVybikgcmV0dXJuIGV2ZW50cy5yZXR1cm4odik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIH0sXG4gICAgICBuZXh0KCkge1xuICAgICAgICBpZiAoZXZlbnRzKSByZXR1cm4gZXZlbnRzLm5leHQoKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIG1pc3NpbmcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICAgICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gICAgICAgICAgLy8gTm93IGV2ZXJ5dGhpbmcgaXMgcmVhZHksIHdlIHNpbXBseSBkZWxlZ2F0ZSBhbGwgYXN5bmMgb3BzIHRvIHRoZSB1bmRlcmx5aW5nXG4gICAgICAgICAgLy8gbWVyZ2VkIGFzeW5jSXRlcmF0b3IgXCJldmVudHNcIlxuICAgICAgICAgIGV2ZW50cyA9IG1lcmdlZFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyhpdGVyYWJsZUhlbHBlcnMoYWkpKTtcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZCA9IChpdGVyYXRvcnMubGVuZ3RoID4gMSlcbiAgICA/IG1lcmdlKC4uLml0ZXJhdG9ycylcbiAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgID8gaXRlcmF0b3JzWzBdXG4gICAgICA6IChuZXZlckdvbm5hSGFwcGVuPFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudElzSW5ET00oZWx0OiBFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChlbHQuaXNDb25uZWN0ZWQpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmRzLCBtdXRhdGlvbikgPT4ge1xuICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgIGlmIChlbHQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KS5vYnNlcnZlKGVsdC5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyOiBFbGVtZW50LCBzZWxlY3RvcnM/OiBzdHJpbmdbXSkge1xuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGFsbFNlbGVjdG9yc1ByZXNlbnQoY29udGFpbmVyLCBzZWxlY3RvcnMpLFxuICAgICAgZWxlbWVudElzSW5ET00oY29udGFpbmVyKVxuICAgIF0pO1xuICByZXR1cm4gZWxlbWVudElzSW5ET00oY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChjb250YWluZXI6IEVsZW1lbnQsIG1pc3Npbmc6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdGhpbmcgaXMgbWlzc2luZ1xuICB9XG5cbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShjb250YWluZXIsIHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZVxuICB9KSk7XG5cbiAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgXCJNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciA1IHNlY29uZHM6XCIpO1xuICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKHN0YWNrLCBtaXNzaW5nKTtcbiAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcywgSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5pbXBvcnQgdHlwZSB7IFVuaXF1ZUlEIH0gZnJvbSBcIi4vYWktdWkuanNcIjtcblxuZXhwb3J0IHR5cGUgQ2hpbGRUYWdzID0gTm9kZSAvLyBUaGluZ3MgdGhhdCBhcmUgRE9NIG5vZGVzIChpbmNsdWRpbmcgZWxlbWVudHMpXG4gIHwgbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiAvLyBUaGluZ3MgdGhhdCBjYW4gYmUgY29udmVydGVkIHRvIHRleHQgbm9kZXMgdmlhIHRvU3RyaW5nXG4gIHwgdW5kZWZpbmVkIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIHwgdHlwZW9mIElnbm9yZSAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICAvLyBOQjogd2UgY2FuJ3QgY2hlY2sgdGhlIGNvbnRhaW5lZCB0eXBlIGF0IHJ1bnRpbWUsIHNvIHdlIGhhdmUgdG8gYmUgbGliZXJhbFxuICAvLyBhbmQgd2FpdCBmb3IgdGhlIGRlLWNvbnRhaW5tZW50IHRvIGZhaWwgaWYgaXQgdHVybnMgb3V0IHRvIG5vdCBiZSBhIGBDaGlsZFRhZ3NgXG4gIHwgQXN5bmNJdGVyYWJsZTxDaGlsZFRhZ3M+IHwgQXN5bmNJdGVyYXRvcjxDaGlsZFRhZ3M+IHwgUHJvbWlzZUxpa2U8Q2hpbGRUYWdzPiAvLyBUaGluZ3MgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW55IG9mIHRoZSBhYm92ZVxuICB8IEFycmF5PENoaWxkVGFncz5cbiAgfCBJdGVyYWJsZTxDaGlsZFRhZ3M+OyAvLyBJdGVyYWJsZSB0aGluZ3MgdGhhdCBob2xkIHRoZSBhYm92ZSwgbGlrZSBBcnJheXMsIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdFxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD47XG5cbmV4cG9ydCB0eXBlIFBvc3NpYmx5QXN5bmM8WD4gPVxuICBbWF0gZXh0ZW5kcyBbb2JqZWN0XSAvLyBOb3QgXCJuYWtlZFwiIHRvIHByZXZlbnQgdW5pb24gZGlzdHJpYnV0aW9uXG4gID8gWCBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBVPlxuICA/IFBvc3NpYmx5QXN5bmM8VT5cbiAgOiBYIGV4dGVuZHMgRnVuY3Rpb25cbiAgPyBYIHwgQXN5bmNBdHRyPFg+XG4gIDogQXN5bmNBdHRyPFBhcnRpYWw8WD4+IHwgeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT47IH1cbiAgOiBYIHwgQXN5bmNBdHRyPFg+IHwgdW5kZWZpbmVkO1xuXG50eXBlIERlZXBQYXJ0aWFsPFg+ID0gW1hdIGV4dGVuZHMgW29iamVjdF0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFg7XG5cbmV4cG9ydCB0eXBlIEluc3RhbmNlPFQgPSB7fT4gPSB7IFtVbmlxdWVJRF06IHN0cmluZyB9ICYgVDtcblxuLy8gSW50ZXJuYWwgdHlwZXMgc3VwcG9ydGluZyBUYWdDcmVhdG9yXG50eXBlIEFzeW5jR2VuZXJhdGVkT2JqZWN0PFggZXh0ZW5kcyBvYmplY3Q+ID0ge1xuICBbSyBpbiBrZXlvZiBYXTogWFtLXSBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBWYWx1ZT4gPyBWYWx1ZSA6IFhbS11cbn1cblxudHlwZSBJRFM8ST4gPSBJIGV4dGVuZHMge30gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBJW0pdIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4gPyBSZXR1cm5UeXBlPElbSl0+IDogbmV2ZXI7XG4gIH1cbn0gOiB7IGlkczoge30gfVxuXG50eXBlIFJlVHlwZWRFdmVudEhhbmRsZXJzPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogSyBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNcbiAgICA/IEV4Y2x1ZGU8R2xvYmFsRXZlbnRIYW5kbGVyc1tLXSwgbnVsbD4gZXh0ZW5kcyAoZTogaW5mZXIgRSk9PmFueVxuICAgICAgPyAodGhpczogVCwgZTogRSk9PmFueSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIFJlYWRXcml0ZUF0dHJpYnV0ZXM8RSwgQmFzZSA9IEU+ID0gRSBleHRlbmRzIHsgYXR0cmlidXRlczogYW55IH1cbiAgPyAoT21pdDxFLCAnYXR0cmlidXRlcyc+ICYge1xuICAgIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcDtcbiAgICBzZXQgYXR0cmlidXRlcyh2OiBEZWVwUGFydGlhbDxQb3NzaWJseUFzeW5jPE9taXQ8QmFzZSwnYXR0cmlidXRlcyc+Pj4pO1xuICB9KVxuICA6IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4pXG5cbmV4cG9ydCB0eXBlIEZsYXR0ZW48Tz4gPSBbe1xuICBbSyBpbiBrZXlvZiBPXTogT1tLXVxufV1bbnVtYmVyXTtcblxuZXhwb3J0IHR5cGUgRGVlcEZsYXR0ZW48Tz4gPSBbe1xuICBbSyBpbiBrZXlvZiBPXTogRmxhdHRlbjxPW0tdPlxufV1bbnVtYmVyXTtcblxudHlwZSBOZXZlckVtcHR5PE8gZXh0ZW5kcyBvYmplY3Q+ID0ge30gZXh0ZW5kcyBPID8gbmV2ZXIgOiBPO1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCO1xuXG50eXBlIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXMsIFJlc3VsdCA9IG5ldmVyPlxuICA9IChPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PlxuICApIGV4dGVuZHMgbmV2ZXJcbiAgPyBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7ICdgb3ZlcnJpZGVgIGhhcyBwcm9wZXJ0aWVzIG5vdCBpbiB0aGUgYmFzZSB0YWcgb3Igb2YgdGhlIHdyb25nIHR5cGUsIGFuZCBzaG91bGQgbWF0Y2gnOiBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gfVxuICA6IE9taXRUeXBlPHtcbiAgICAnYGRlY2xhcmVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgb3ZlcnJpZGVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT4sXG4gICAgJ2BvdmVycmlkZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgfSwgbmV2ZXI+XG5cbmV4cG9ydCB0eXBlIE92ZXJyaWRlcyA9IHtcbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIGRlY2xhcmU/OiBvYmplY3Q7XG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIGlkcz86IHsgW2lkOiBzdHJpbmddOiBUYWdDcmVhdG9yRnVuY3Rpb248YW55PjsgfTtcbiAgc3R5bGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RlZCA9IHtcbiAgY29uc3RydWN0ZWQ6ICgpID0+IChDaGlsZFRhZ3MgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZCB8IENoaWxkVGFncz4pO1xufVxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgYXR0cmlidXRlcyBmcm9tIGFuIEV4VGFnQ3JlYXRvclxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8VCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9IFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgQmFzZUF0dHJzPlxuICA/IEJhc2VBdHRyc1xuICA6IG5ldmVyO1xuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQSwgaW5mZXIgQiwgaW5mZXIgRCBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX0Q+XG4gID8gQmFzZUl0ZXJhYmxlczxCPiBleHRlbmRzIG5ldmVyXG4gICAgPyBEWydpdGVyYWJsZSddIGV4dGVuZHMgdW5rbm93blxuICAgICAgPyB7fVxuICAgICAgOiBEWydpdGVyYWJsZSddXG4gICAgOiBCYXNlSXRlcmFibGVzPEI+ICYgRFsnaXRlcmFibGUnXVxuICA6IG5ldmVyO1xuXG50eXBlIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICB7XG4gICAgaWRzOiA8Y29uc3QgSyBleHRlbmRzIGtleW9mIEV4Y2x1ZGU8RFsnaWRzJ10sIHVuZGVmaW5lZD4sIGNvbnN0IFRDRiBleHRlbmRzIFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+ID0gRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPltLXT4oXG4gICAgICBhdHRyczp7IGlkOiBLIH0gJiBFeGNsdWRlPFBhcmFtZXRlcnM8VENGPlswXSwgQ2hpbGRUYWdzPixcbiAgICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXVxuICAgICkgPT4gUmV0dXJuVHlwZTxUQ0Y+XG4gIH1cbiAgJiBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+O1xuXG50eXBlIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPSBCYXNlSXRlcmFibGVzPEJhc2U+ICYgRFsnaXRlcmFibGUnXTtcblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvckNhbGxTdGFjayA9IHsgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXSB9O1xuXG5leHBvcnQgdHlwZSBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRyczogVGFnQ3JlYXRpb25PcHRpb25zICYgQ29uc3RydWN0b3JDYWxsU3RhY2sgJiB7XG4gIFtrOiBzdHJpbmddOiB1bmtub3duO1xufSB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBFbGVtZW50XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSBleHRlbmRzIEV4dGVuZFRhZ0Z1bmN0aW9uIHtcbiAgc3VwZXI6IFRhZ0NyZWF0b3I8RWxlbWVudD47XG4gIGRlZmluaXRpb246IE92ZXJyaWRlcztcbiAgdmFsdWVPZjogKCkgPT4gc3RyaW5nO1xuICBleHRlbmRlZDogKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkgPT4gRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxuaW50ZXJmYWNlIFRhZ0NvbnN0dWN0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4ge1xuICBjb25zdHJ1Y3RvcjogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZTtcbn1cblxudHlwZSBDb21iaW5lZFRoaXNUeXBlPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICBUYWdDb25zdHVjdG9yPEJhc2U+ICZcbiAgUmVhZFdyaXRlQXR0cmlidXRlczxcbiAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgICAmIEFzeW5jR2VuZXJhdGVkT2JqZWN0PENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+LFxuICAgIERbJ2RlY2xhcmUnXVxuICAgICYgRFsnb3ZlcnJpZGUnXVxuICAgICYgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZSxEPj5cbiAgPjtcblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXM+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbiAgPjtcblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgPSBhbnlcbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogKGluc3Q6VGFnSW5zdGFuY2UpID0+IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucz5cbiAgICAgID5cbiAgICA+XG4gID5cblxuICA8XG4gICAgQmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PixcbiAgICBTdXBwbGllZERlZmluaXRpb25zLFxuICAgIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID0gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgOiB7fVxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG59XG5cbnR5cGUgQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLCBSZXN1bHQ+ID1cblN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiY29uc3RydWN0ZWRgIGRvZXMgbm90IHJldHVybiBDaGlsZFRhZ3NcIjogU3VwcGxpZWREZWZpbml0aW9uc1snY29uc3RydWN0ZWQnXSB9XG4gIDogRXhjZXNzS2V5czxTdXBwbGllZERlZmluaXRpb25zLCBPdmVycmlkZXMgJiBDb25zdHJ1Y3RlZD4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiVGhlIGV4dGVuZGVkIHRhZyBkZWZpbnRpb24gY29udGFpbnMgdW5rbm93biBvciBpbmNvcnJlY3RseSB0eXBlZCBrZXlzXCI6IGtleW9mIEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IH1cblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRpb25PcHRpb25zID0ge1xuICBkZWJ1Z2dlcj86IGJvb2xlYW5cbn07XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBcmdzPEE+ID0gW10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9uc10gfCBbQSAmIFRhZ0NyZWF0aW9uT3B0aW9ucywgLi4uQ2hpbGRUYWdzW11dIHwgQ2hpbGRUYWdzW107XG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiBUaGlzVHlwZTxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4+KSA9PiBSZWFkV3JpdGVBdHRyaWJ1dGVzPFJlVHlwZWRFdmVudEhhbmRsZXJzPEJhc2U+PjtcblxuLyogQSBUYWdDcmVhdG9yIGlzIFRhZ0NyZWF0b3JGdW5jdGlvbiBkZWNvcmF0ZWQgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMuIFRoZSBTdXBlciAmIFN0YXRpY3MgYXJncyBhcmUgb25seVxuZXZlciBzcGVjaWZpZWQgYnkgRXh0ZW5kZWRUYWcgKGludGVybmFsbHkpLCBhbmQgc28gaXMgbm90IGV4cG9ydGVkICovXG50eXBlIEV4VGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0LFxuICBTdXBlciBleHRlbmRzICh1bmtub3duIHwgRXhUYWdDcmVhdG9yPGFueT4pID0gdW5rbm93bixcbiAgU3VwZXJEZWZzIGV4dGVuZHMgT3ZlcnJpZGVzID0ge30sXG4gIFN0YXRpY3MgPSB7fSxcbj4gPSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZT4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiB7IFtVbmlxdWVJRF06IHN0cmluZyB9OyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbiAgW1VuaXF1ZUlEXTogc3RyaW5nO1xufSAmXG4vLyBgU3RhdGljc2AgaGVyZSBpcyB0aGF0IHNhbWUgYXMgU3RhdGljUmVmZXJlbmNlczxTdXBlciwgU3VwZXJEZWZzPiwgYnV0IHRoZSBjaXJjdWxhciByZWZlcmVuY2UgYnJlYWtzIFRTXG4vLyBzbyB3ZSBjb21wdXRlIHRoZSBTdGF0aWNzIG91dHNpZGUgdGhpcyB0eXBlIGRlY2xhcmF0aW9uIGFzIHBhc3MgdGhlbSBhcyBhIHJlc3VsdFxuU3RhdGljcztcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0PiA9IEV4VGFnQ3JlYXRvcjxCYXNlLCBuZXZlciwgbmV2ZXIsIHt9PjtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNDTyxNQUFNLFFBQVEsV0FBVyxTQUFTLE9BQU8sV0FBVyxTQUFTLFFBQVEsV0FBVyxPQUFPLE1BQU0sbUJBQW1CLEtBQUs7QUFFckgsTUFBTSxjQUFjO0FBRTNCLE1BQU0sV0FBVztBQUFBLElBQ2YsT0FBTyxNQUFXO0FBQ2hCLFVBQUksTUFBTyxTQUFRLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLE1BQU0sRUFBRSxPQUFPLFFBQVEsa0JBQWlCLElBQUksQ0FBQztBQUFBLElBQ25HO0FBQUEsSUFDQSxRQUFRLE1BQVc7QUFDakIsVUFBSSxNQUFPLFNBQVEsS0FBSyxpQkFBaUIsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsSUFDckc7QUFBQSxJQUNBLFFBQVEsTUFBVztBQUNqQixVQUFJLE1BQU8sU0FBUSxNQUFNLGlCQUFpQixHQUFHLElBQUk7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7OztBQ05BLE1BQU0sVUFBVSxDQUFDLE1BQVM7QUFBQSxFQUFDO0FBRXBCLFdBQVMsV0FBa0M7QUFDaEQsUUFBSSxVQUErQztBQUNuRCxRQUFJLFNBQStCO0FBQ25DLFVBQU0sVUFBVSxJQUFJLFFBQVcsSUFBSSxNQUFNLENBQUMsU0FBUyxNQUFNLElBQUksQ0FBQztBQUM5RCxZQUFRLFVBQVU7QUFDbEIsWUFBUSxTQUFTO0FBQ2pCLFFBQUksT0FBTztBQUNULFlBQU0sZUFBZSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxjQUFRLE1BQU0sUUFBTyxjQUFjLFNBQVMsSUFBSSxpQkFBaUIs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O0FBQUEsSUFBTTtBQUFBLElBQU87QUFBQSxJQUFXO0FBQUEsSUFBTztBQUFBLElBQVU7QUFBQSxJQUNySDtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQVM7QUFBQSxJQUFZO0FBQUEsSUFBYztBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBUTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQ3JIO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFVO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFVO0FBQUEsSUFBTTtBQUFBLElBQVE7QUFBQSxJQUFRO0FBQUEsSUFDeEg7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBTztBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFBTTtBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQUs7QUFBQSxJQUFXO0FBQUEsSUFDcEg7QUFBQSxJQUFZO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFXO0FBQUEsSUFBVTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBVTtBQUFBLElBQ3RIO0FBQUEsSUFBVTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFBVztBQUFBLElBQU87QUFBQSxJQUFTO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFZO0FBQUEsSUFBWTtBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBUztBQUFBLElBQ3BIO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFTO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLEVBQ3JEO0FB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
