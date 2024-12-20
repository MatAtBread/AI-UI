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
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuY29uc3QgdHJhY2tOb2RlcyA9IFN5bWJvbChcInRyYWNrTm9kZXNcIik7XG5jb25zdCB0cmFja0xlZ2FjeSA9IFN5bWJvbChcIm9uUmVtb3ZhbEZyb21ET01cIik7XG5jb25zdCBhaXVpRXh0ZW5kZWRUYWdTdHlsZXMgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlc1wiO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUdcbj8gKChuOiBhbnkpID0+IG4gaW5zdGFuY2VvZiBOb2RlXG4gID8gJ291dGVySFRNTCcgaW4gbiA/IG4ub3V0ZXJIVE1MIDogYCR7bi50ZXh0Q29udGVudH0gJHtuLm5vZGVOYW1lfWBcbiAgOiBTdHJpbmcobikpXG46IChuOiBOb2RlKSA9PiB1bmRlZmluZWQ7XG5cbi8qIEEgaG9sZGVyIGZvciBjb21tb25Qcm9wZXJ0aWVzIHNwZWNpZmllZCB3aGVuIGB0YWcoLi4ucClgIGlzIGludm9rZWQsIHdoaWNoIGFyZSBhbHdheXNcbiAgYXBwbGllZCAobWl4ZWQgaW4pIHdoZW4gYW4gZWxlbWVudCBpcyBjcmVhdGVkICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0Z1bmN0aW9uT3B0aW9uczxPdGhlck1lbWJlcnMgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBhbnk+ID0ge30+IHtcbiAgY29tbW9uUHJvcGVydGllcz86IE90aGVyTWVtYmVycyB8IHVuZGVmaW5lZFxuICBkb2N1bWVudD86IERvY3VtZW50XG4gIEVycm9yVGFnPzogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQgJiB7IGVycm9yOiBhbnkgfT5cbiAgLyoqIEBkZXByZWNhdGVkIC0gbGVnYWN5IHN1cHBvcnQgKi9cbiAgZW5hYmxlT25SZW1vdmVkRnJvbURPTT86IGJvb2xlYW5cbn1cblxuLyogTWVtYmVycyBhcHBsaWVkIHRvIEVWRVJZIHRhZyBjcmVhdGVkLCBldmVuIGJhc2UgdGFncyAqL1xuaW50ZXJmYWNlIFBvRWxlbWVudE1ldGhvZHMge1xuICBnZXQgaWRzKCk6IHt9ICYgKHVuZGVmaW5lZCB8ICgoYXR0cnM6IG9iamVjdCwgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiBSZXR1cm5UeXBlPFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+PikpXG4gIHdoZW48VCBleHRlbmRzIEVsZW1lbnQgJiBQb0VsZW1lbnRNZXRob2RzLCBTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM8RXhjbHVkZTxrZXlvZiBUWydpZHMnXSwgbnVtYmVyIHwgc3ltYm9sPj4+KHRoaXM6IFQsIC4uLndoYXQ6IFMpOiBXaGVuUmV0dXJuPFM+O1xuICAvLyBUaGlzIGlzIGEgdmVyeSBpbmNvbXBsZXRlIHR5cGUuIEluIHByYWN0aWNlLCBzZXQoaywgYXR0cnMpIHJlcXVpcmVzIGEgZGVlcGx5IHBhcnRpYWwgc2V0IG9mXG4gIC8vIGF0dHJpYnV0ZXMsIGluIGV4YWN0bHkgdGhlIHNhbWUgd2F5IGFzIGEgVGFnRnVuY3Rpb24ncyBmaXJzdCBvYmplY3QgcGFyYW1ldGVyXG4gIHNldCBhdHRyaWJ1dGVzKGF0dHJzOiBvYmplY3QpO1xuICBnZXQgYXR0cmlidXRlcygpOiBOYW1lZE5vZGVNYXBcbn1cblxuLy8gU3VwcG9ydCBmb3IgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaHRtIChvciBpbXBvcnQgaHRtIGZyb20gJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vaHRtL2Rpc3QvaHRtLm1vZHVsZS5qcycpXG4vLyBOb3RlOiBzYW1lIHNpZ25hdHVyZSBhcyBSZWFjdC5jcmVhdGVFbGVtZW50XG50eXBlIENyZWF0ZUVsZW1lbnROb2RlVHlwZSA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcFxudHlwZSBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPSBDcmVhdGVFbGVtZW50WydjcmVhdGVFbGVtZW50J107XG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUVsZW1lbnQge1xuICAvLyBTdXBwb3J0IGZvciBodG0sIEpTWCwgZXRjXG4gIGNyZWF0ZUVsZW1lbnQ8TiBleHRlbmRzIChDcmVhdGVFbGVtZW50Tm9kZVR5cGUgfCBDcmVhdGVFbGVtZW50RnJhZ21lbnQpPihcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IE4sXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTiBleHRlbmRzIENyZWF0ZUVsZW1lbnRGcmFnbWVudCA/IE5vZGVbXSA6IE5vZGU7XG4gIH1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiAvLyBhYnNlbnQgaW1wbGllcyBub25lIGFyZSBkZWZpbmVkXG4gICAgICApXG5cbiAgICAgIGVnOlxuICAgICAgICB0YWdzKCkgIC8vIHJldHVybnMgVGFnQ3JlYXRvcnMgZm9yIGFsbCBIVE1MIHRhZ3NcbiAgICAgICAgdGFncyhbJ2RpdicsJ2J1dHRvbiddLCB7IG15VGhpbmcoKSB7fSB9KVxuICAgICAgICB0YWdzKCdodHRwOi8vbmFtZXNwYWNlJyxbJ0ZvcmVpZ24nXSwgeyBpc0ZvcmVpZ246IHRydWUgfSlcbiAgKi9cblxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPih0YWdzOiBUYWdzW10pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFEgZXh0ZW5kcyBvYmplY3Q+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIG9iamVjdD4obmFtZVNwYWNlOiBudWxsIHwgdW5kZWZpbmVkIHwgJycsIHRhZ3M6IFRhZ3NbXSwgb3B0aW9ucz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gVGFnc106IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudD4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogc3RyaW5nLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiBSZWNvcmQ8c3RyaW5nLCBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgRWxlbWVudD4+ICYgQ3JlYXRlRWxlbWVudFxufVxuXG5sZXQgaWRDb3VudCA9IDA7XG5jb25zdCBzdGFuZGFuZFRhZ3MgPSBbXG4gIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJlYVwiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJhc2VcIiwgXCJiZGlcIiwgXCJiZG9cIiwgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJyXCIsIFwiYnV0dG9uXCIsXG4gIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsIFwiY29sXCIsIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIiwgXCJkaXZcIixcbiAgXCJkbFwiLCBcImR0XCIsIFwiZW1cIiwgXCJlbWJlZFwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLCBcImZvcm1cIiwgXCJoMVwiLCBcImgyXCIsIFwiaDNcIiwgXCJoNFwiLCBcImg1XCIsIFwiaDZcIiwgXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsIFwiaHJcIiwgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcImxpbmtcIiwgXCJtYWluXCIsIFwibWFwXCIsXG4gIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRhXCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLFxuICBcInByb2dyZXNzXCIsIFwicVwiLCBcInJwXCIsIFwicnRcIiwgXCJydWJ5XCIsIFwic1wiLCBcInNhbXBcIiwgXCJzY3JpcHRcIiwgXCJzZWFyY2hcIiwgXCJzZWN0aW9uXCIsIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic291cmNlXCIsIFwic3BhblwiLFxuICBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLCBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsIFwidGhlYWRcIiwgXCJ0aW1lXCIsXG4gIFwidGl0bGVcIiwgXCJ0clwiLCBcInRyYWNrXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIiwgXCJ3YnJcIlxuXSBhcyBjb25zdDtcblxuZnVuY3Rpb24gaWRzSW5hY2Nlc3NpYmxlKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiPGVsdD4uaWRzIGlzIGEgcmVhZC1vbmx5IG1hcCBvZiBFbGVtZW50c1wiKVxufVxuXG4vKiBTeW1ib2xzIHVzZWQgdG8gaG9sZCBJRHMgdGhhdCBjbGFzaCB3aXRoIGZ1bmN0aW9uIHByb3RvdHlwZSBuYW1lcywgc28gdGhhdCB0aGUgUHJveHkgZm9yIGlkcyBjYW4gYmUgbWFkZSBjYWxsYWJsZSAqL1xuY29uc3Qgc2FmZUZ1bmN0aW9uU3ltYm9scyA9IFsuLi5PYmplY3Qua2V5cyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhGdW5jdGlvbi5wcm90b3R5cGUpKV0ucmVkdWNlKChhLGIpID0+IHtcbiAgYVtiXSA9IFN5bWJvbChiKTtcbiAgcmV0dXJuIGE7XG59LHt9IGFzIFJlY29yZDxzdHJpbmcsIHN5bWJvbD4pO1xuZnVuY3Rpb24ga2V5Rm9yKGlkOiBzdHJpbmcgfCBzeW1ib2wpIHsgcmV0dXJuIGlkIGluIHNhZmVGdW5jdGlvblN5bWJvbHMgPyBzYWZlRnVuY3Rpb25TeW1ib2xzW2lkIGFzIGtleW9mIHR5cGVvZiBzYWZlRnVuY3Rpb25TeW1ib2xzXSA6IGlkIH07XG5cbmZ1bmN0aW9uIGlzQ2hpbGRUYWcoeDogYW55KTogeCBpcyBDaGlsZFRhZ3Mge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnXG4gICAgfHwgdHlwZW9mIHggPT09ICdudW1iZXInXG4gICAgfHwgdHlwZW9mIHggPT09ICdib29sZWFuJ1xuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlXG4gICAgfHwgeCBpbnN0YW5jZW9mIE5vZGVMaXN0XG4gICAgfHwgeCBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uXG4gICAgfHwgeCA9PT0gbnVsbFxuICAgIHx8IHggPT09IHVuZGVmaW5lZFxuICAgIC8vIENhbid0IGFjdHVhbGx5IHRlc3QgZm9yIHRoZSBjb250YWluZWQgdHlwZSwgc28gd2UgYXNzdW1lIGl0J3MgYSBDaGlsZFRhZyBhbmQgbGV0IGl0IGZhaWwgYXQgcnVudGltZVxuICAgIHx8IEFycmF5LmlzQXJyYXkoeClcbiAgICB8fCBpc1Byb21pc2VMaWtlKHgpXG4gICAgfHwgaXNBc3luY0l0ZXIoeClcbiAgICB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiB4ICYmIHR5cGVvZiB4W1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG4vKiB0YWcgKi9cblxuZXhwb3J0IGNvbnN0IHRhZyA9IDxUYWdMb2FkZXI+ZnVuY3Rpb24gPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsXG4gIFQxIGV4dGVuZHMgKHN0cmluZyB8IFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFQyIGV4dGVuZHMgKFRhZ3NbXSB8IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiksXG4gIFEgZXh0ZW5kcyBvYmplY3Rcbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gfCB1bmRlZmluZWRdO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcbiAgY29uc3QgaXNUZXN0RW52ID0gdGhpc0RvYy5kb2N1bWVudFVSSSA9PT0gJ2Fib3V0OnRlc3RpbmcnO1xuICBjb25zdCBEeWFtaWNFbGVtZW50RXJyb3IgPSBvcHRpb25zPy5FcnJvclRhZyB8fCBmdW5jdGlvbiBEeWFtaWNFbGVtZW50RXJyb3IoeyBlcnJvciB9OiB7IGVycm9yOiBFcnJvciB8IEl0ZXJhdG9yUmVzdWx0PEVycm9yPiB9KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IudG9TdHJpbmcoKSA6ICdFcnJvcjpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZWROb2RlcyA9IG11dGF0aW9uVHJhY2tlcih0aGlzRG9jKTtcblxuICBmdW5jdGlvbiBEb21Qcm9taXNlQ29udGFpbmVyKGxhYmVsPzogYW55KSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChsYWJlbD8gbGFiZWwudG9TdHJpbmcoKSA6REVCVUdcbiAgICAgID8gbmV3IEVycm9yKFwicHJvbWlzZVwiKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCAnJykgfHwgXCJwcm9taXNlXCJcbiAgICAgIDogXCJwcm9taXNlXCIpXG4gIH1cblxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICB0aGlzRG9jLmhlYWQuYXBwZW5kQ2hpbGQoT2JqZWN0LmFzc2lnbih0aGlzRG9jLmNyZWF0ZUVsZW1lbnQoXCJTVFlMRVwiKSwge2lkOiBhaXVpRXh0ZW5kZWRUYWdTdHlsZXN9ICkpO1xuICB9XG5cbiAgLyogUHJvcGVydGllcyBhcHBsaWVkIHRvIGV2ZXJ5IHRhZyB3aGljaCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgcmVmZXJlbmNlLCBzaW1pbGFyIHRvIHByb3RvdHlwZXMgKi9cbiAgY29uc3Qgd2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHRhZ1Byb3RvdHlwZXM6IFBvRWxlbWVudE1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKFxuICAgIG51bGwsXG4gICAge1xuICAgICAgd2hlbjoge1xuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoLi4ud2hhdDogV2hlblBhcmFtZXRlcnMpIHtcbiAgICAgICAgICByZXR1cm4gd2hlbih0aGlzLCAuLi53aGF0KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnYXR0cmlidXRlcycpLFxuICAgICAgICBzZXQodGhpczogRWxlbWVudCwgYTogb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKGlzQXN5bmNJdGVyKGEpKSB7XG4gICAgICAgICAgICBjb25zdCBhaSA9IGlzQXN5bmNJdGVyYXRvcihhKSA/IGEgOiBhW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9ICgpID0+IGFpLm5leHQoKS50aGVuKFxuICAgICAgICAgICAgICAoeyBkb25lLCB2YWx1ZSB9KSA9PiB7IGFzc2lnblByb3BzKHRoaXMsIHZhbHVlKTsgZG9uZSB8fCBzdGVwKCkgfSxcbiAgICAgICAgICAgICAgZXggPT4gY29uc29sZS53YXJuKGV4KSk7XG4gICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgYXNzaWduUHJvcHModGhpcywgYSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpZHM6IHtcbiAgICAgICAgLy8gLmlkcyBpcyBhIGdldHRlciB0aGF0IHdoZW4gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gbGF6aWx5IGNyZWF0ZXMgYSBQcm94eSB0aGF0IHByb3ZpZGVzIGxpdmUgYWNjZXNzIHRvIGNoaWxkcmVuIGJ5IGlkXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgIGdldCh0aGlzOiBFbGVtZW50KSB7XG4gICAgICAgICAgLy8gTm93IHdlJ3ZlIGJlZW4gYWNjZXNzZWQsIGNyZWF0ZSB0aGUgcHJveHlcbiAgICAgICAgICBjb25zdCBpZFByb3h5ID0gbmV3IFByb3h5KCgoKT0+e30pIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgV2Vha1JlZjxFbGVtZW50Pj4sIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldCwgdGhpc0FyZywgYXJncykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQXJnLmNvbnN0cnVjdG9yLmRlZmluaXRpb24uaWRzW2FyZ3NbMF0uaWRdKC4uLmFyZ3MpXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8ZWx0Pi5pZHMuJHthcmdzPy5bMF0/LmlkfSBpcyBub3QgYSB0YWctY3JlYXRpbmcgZnVuY3Rpb25gLCB7IGNhdXNlOiBleCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnN0cnVjdDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlbGV0ZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldFByb3RvdHlwZU9mOiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXRQcm90b3R5cGVPZigpIHsgcmV0dXJuIG51bGwgfSxcbiAgICAgICAgICAgIGlzRXh0ZW5zaWJsZSgpIHsgcmV0dXJuIGZhbHNlIH0sXG4gICAgICAgICAgICBwcmV2ZW50RXh0ZW5zaW9ucygpIHsgcmV0dXJuIHRydWUgfSxcbiAgICAgICAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleUZvcihwKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFzKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG93bktleXM6ICh0YXJnZXQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaWRzID0gWy4uLnRoaXMucXVlcnlTZWxlY3RvckFsbChgW2lkXWApXS5tYXAoZSA9PiBlLmlkKTtcbiAgICAgICAgICAgICAgY29uc3QgdW5pcXVlID0gWy4uLm5ldyBTZXQoaWRzKV07XG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiBpZHMubGVuZ3RoICE9PSB1bmlxdWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnQgaWRzYCwgdW5pcXVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuaXF1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHAsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwayA9IGtleUZvcihwKTtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSd2ZSBjYWNoZWQgdGhpcyBJRCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgaWYgKHBrIGluIHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGVsZW1lbnQgaXMgc3RpbGwgY29udGFpbmVkIHdpdGhpbiB0aGlzIGVsZW1lbnQgd2l0aCB0aGUgc2FtZSBJRFxuICAgICAgICAgICAgICAgICAgY29uc3QgcmVmID0gdGFyZ2V0W3BrXS5kZXJlZigpO1xuICAgICAgICAgICAgICAgICAgaWYgKHJlZiAmJiByZWYuaWQgPT09IHAgJiYgdGhpcy5jb250YWlucyhyZWYpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVmO1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIHRhcmdldFtwa107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBlOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJyMnICsgQ1NTLmVzY2FwZShwKSk7XG4gICAgICAgICAgICAgICAgICBpZiAobmwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdhcm5lZC5oYXMocCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICB3YXJuZWQuYWRkKHApO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFbGVtZW50IGNvbnRhaW5zIG11bHRpcGxlLCBzaGFkb3dlZCBkZWNlbmRhbnRzIHdpdGggSUQgXCIke3B9XCJgLyosYFxcblxcdCR7bG9nTm9kZSh0aGlzKX1gKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlID0gbmxbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJyMnICsgQ1NTLmVzY2FwZShwKSkgPz8gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZSlcbiAgICAgICAgICAgICAgICAgIFJlZmxlY3Quc2V0KHRhcmdldCwgcGssIG5ldyBXZWFrUmVmKGUpLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi5hbmQgcmVwbGFjZSB0aGUgZ2V0dGVyIHdpdGggdGhlIFByb3h5XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZHMnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBnZXQoKSB7IHJldHVybiBpZFByb3h5IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLi5hbmQgcmV0dXJuIHRoYXQgZnJvbSB0aGUgZ2V0dGVyLCBzbyBzdWJzZXF1ZW50IHByb3BlcnR5XG4gICAgICAgICAgLy8gYWNjZXNzZXMgZ28gdmlhIHRoZSBQcm94eVxuICAgICAgICAgIHJldHVybiBpZFByb3h5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIGlmIChvcHRpb25zPy5lbmFibGVPblJlbW92ZWRGcm9tRE9NKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ1Byb3RvdHlwZXMsJ29uUmVtb3ZlZEZyb21ET00nLHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgc2V0OiBmdW5jdGlvbihmbj86ICgpPT52b2lkKXtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChbdGhpc10sIHRyYWNrTGVnYWN5LCBmbik7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZW1vdmVkTm9kZXMuZ2V0UmVtb3ZhbEhhbmRsZXIodGhpcywgdHJhY2tMZWdhY3kpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qIEFkZCBhbnkgdXNlciBzdXBwbGllZCBwcm90b3R5cGVzICovXG4gIGlmIChjb21tb25Qcm9wZXJ0aWVzKVxuICAgIGRlZXBEZWZpbmUodGFnUHJvdG90eXBlcywgY29tbW9uUHJvcGVydGllcyk7XG5cbiAgZnVuY3Rpb24gKm5vZGVzKC4uLmNoaWxkVGFnczogQ2hpbGRUYWdzW10pOiBJdGVyYWJsZUl0ZXJhdG9yPENoaWxkTm9kZSwgdm9pZCwgdW5rbm93bj4ge1xuICAgIGZ1bmN0aW9uIG5vdFZpYWJsZVRhZyhjOiBDaGlsZFRhZ3MpIHtcbiAgICAgIHJldHVybiAoYyA9PT0gdW5kZWZpbmVkIHx8IGMgPT09IG51bGwgfHwgYyA9PT0gSWdub3JlKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYyBvZiBjaGlsZFRhZ3MpIHtcbiAgICAgIGlmIChub3RWaWFibGVUYWcoYykpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaXNQcm9taXNlTGlrZShjKSkge1xuICAgICAgICBsZXQgZzogQ2hpbGROb2RlW10gfCB1bmRlZmluZWQgPSBbRG9tUHJvbWlzZUNvbnRhaW5lcigpXTtcbiAgICAgICAgYy50aGVuKHJlcGxhY2VtZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBvbGQgPSBnO1xuICAgICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICAgIGcgPSBbLi4ubm9kZXMocmVwbGFjZW1lbnQpXTtcbiAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwoZywgdHJhY2tOb2RlcywgKCk9PiB7IGcgPSB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGkgPT09IDApXG4gICAgICAgICAgICAgICAgb2xkW2ldLnJlcGxhY2VXaXRoKC4uLmcpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIG9sZFtpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChnKSB5aWVsZCAqZztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB5aWVsZCBjIGFzIENoaWxkTm9kZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1bmt5IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGMpXG4gICAgICAgICAgeWllbGQgKm5vZGVzKGNoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FzeW5jSXRlcjxDaGlsZFRhZ3M+KGMpKSB7XG4gICAgICAgIGNvbnN0IGluc2VydGlvblN0YWNrID0gREVCVUcgPyAoJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yOiAvLCBcIkluc2VydGlvbiA6XCIpKSA6ICcnO1xuICAgICAgICBsZXQgYXAgPSBpc0FzeW5jSXRlcmF0b3IoYykgPyBjIDogY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgbGV0IG5vdFlldE1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHRlcm1pbmF0ZVNvdXJjZSA9IChmb3JjZTogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgaWYgKCFhcCB8fCAhcmVwbGFjZW1lbnQubm9kZXMpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBpZiAoZm9yY2UgfHwgcmVwbGFjZW1lbnQubm9kZXMuZXZlcnkoZSA9PiByZW1vdmVkTm9kZXMuaGFzKGUpKSkge1xuICAgICAgICAgICAgLy8gV2UncmUgZG9uZSAtIHRlcm1pbmF0ZSB0aGUgc291cmNlIHF1aWV0bHkgKGllIHRoaXMgaXMgbm90IGFuIGV4Y2VwdGlvbiBhcyBpdCdzIGV4cGVjdGVkLCBidXQgd2UncmUgZG9uZSlcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzPy5mb3JFYWNoKGUgPT4gcmVtb3ZlZE5vZGVzLmFkZChlKSk7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBcIkVsZW1lbnQocykgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQ6IFwiXG4gICAgICAgICAgICAgICsgcmVwbGFjZW1lbnQubm9kZXMubWFwKGxvZ05vZGUpLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICAgICsgaW5zZXJ0aW9uU3RhY2s7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSB7XG4gICAgICAgICAgbm9kZXM6ICgodW5ib3hlZCA9PT0gYykgPyBbXSA6IFsuLi5ub2Rlcyh1bmJveGVkKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2RlcyEubGVuZ3RoKVxuICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMhLHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGNvbnN0IGRlYnVnVW5tb3VudGVkID0gREVCVUdcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgICAgbGV0IGYgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgZiA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgIGFwLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgYXA/LnRocm93Py4obmV3IEVycm9yKFwiQWxyZWFkeSB0ZXJuaW1hdGVkXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihlID0+IGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHJlcGxhY2VtZW50Lm5vZGVzIDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgbW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIXRlcm1pbmF0ZVNvdXJjZSghbi5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWdVbm1vdW50ZWQ/LigpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbLi4ubm9kZXModW5ib3goZXMudmFsdWUpKV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaTxuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaT09PTApXG4gICAgICAgICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQubm9kZXMpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKG5baV0pKVxuICAgICAgICAgICAgICAgICAgICBuW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChuW2ldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnQubm9kZXM/LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgaWYgKG4/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlPy52YWx1ZSA/PyBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBjb25zb2xlLndhcm4oXCJDYW4ndCByZXBvcnQgZXJyb3JcIiwgZXJyb3JWYWx1ZSwgcmVwbGFjZW1lbnQubm9kZXM/Lm1hcChsb2dOb2RlKSk7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gbnVsbDtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgYXAgPSBudWxsO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KSgpO1xuXG4gICAgICAgIGlmIChyZXBsYWNlbWVudC5ub2RlcykgeWllbGQqIHJlcGxhY2VtZW50O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgeWllbGQgdGhpc0RvYy5jcmVhdGVUZXh0Tm9kZShjLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbmFtZVNwYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0YWcsIHtcbiAgICAgIG5vZGVzLCAgICAvLyBCdWlsZCBET00gTm9kZVtdIGZyb20gQ2hpbGRUYWdzXG4gICAgICBVbmlxdWVJRFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEp1c3QgZGVlcCBjb3B5IGFuIG9iamVjdCAqL1xuICBjb25zdCBwbGFpbk9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG4gIC8qKiBSb3V0aW5lIHRvICpkZWZpbmUqIHByb3BlcnRpZXMgb24gYSBkZXN0IG9iamVjdCBmcm9tIGEgc3JjIG9iamVjdCAqKi9cbiAgZnVuY3Rpb24gZGVlcERlZmluZShkOiBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyLCBhbnk+LCBzOiBhbnksIGRlY2xhcmF0aW9uPzogdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcgfHwgcyA9PT0gZClcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiBpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3QsIHNvIHdlJ2xsIGRlZXBEZWZpbmUgaXQgdW5sZXNzIGl0J3MgYVxuICAgICAgICAgICAgLy8gUHJvbWlzZSBvciBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgYXNzaWduIGl0XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoayBpbiBkKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgdmFsdWUgaW4gdGhlIGRlc3RpbmF0aW9uLCBqdXN0IGRlZmluZSBpdCB0byBiZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgc291cmNlXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSB2YWx1ZSBpcyBhbiBvYmplY3QsIGFuZCB3ZSdyZSBkZWNsYXJpbmcgaXQgKHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgYSBuZXcgb25lKSwgdGFrZVxuICAgICAgICAgICAgICAgIC8vIGEgY29weSBzbyBhcyB0byBub3QgcmUtdXNlIHRoZSByZWZlcmVuY2UgYW5kIHBvbGx1dGUgdGhlIGRlY2xhcmF0aW9uLiBOb3RlOiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZGVmYXVsdCBmb3IgYW55IFwib2JqZWN0c1wiIGluIGEgZGVjbGFyYXRpb24gdGhhdCBhcmUgcGxhaW4gYW5kIG5vdCBzb21lIGNsYXNzIHR5cGVcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4ndCBiZSBjb3BpZWRcbiAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBwbGFpbk9iamVjdFByb3RvdHlwZSB8fCAhT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHBsYWluIG9iamVjdCBjYW4gYmUgZGVlcC1jb3BpZWQgYnkgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0ge30sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQW4gYXJyYXkgY2FuIGJlIGRlZXAgY29waWVkIGJ5IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IFtdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBvYmplY3QgbGlrZSB0aGluZ3MgKHJlZ2V4cHMsIGRhdGVzLCBjbGFzc2VzLCBldGMpIGNhbid0IGJlIGRlZXAtY29waWVkIHJlbGlhYmx5XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGVjbGFyZWQgcHJvcGV0eSAnJHtrfScgaXMgbm90IGEgcGxhaW4gb2JqZWN0IGFuZCBtdXN0IGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZSwgcG9zc2libHkgcG9sbHV0aW5nIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIHRhZ2AsIGQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgSGF2aW5nIERPTSBOb2RlcyBhcyBwcm9wZXJ0aWVzIG9mIG90aGVyIERPTSBOb2RlcyBpcyBhIGJhZCBpZGVhIGFzIGl0IG1ha2VzIHRoZSBET00gdHJlZSBpbnRvIGEgY3ljbGljIGdyYXBoLiBZb3Ugc2hvdWxkIHJlZmVyZW5jZSBub2RlcyBieSBJRCBvciB2aWEgYSBjb2xsZWN0aW9uIHN1Y2ggYXMgLmNoaWxkTm9kZXMuIFByb3BldHk6ICcke2t9JyB2YWx1ZTogJHtsb2dOb2RlKHZhbHVlKX0gZGVzdGluYXRpb246ICR7ZCBpbnN0YW5jZW9mIE5vZGUgPyBsb2dOb2RlKGQpIDogZH1gKTtcbiAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGRba10gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3RvciksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBzb21lIHNvcnQgb2YgY29uc3RydWN0ZWQgb2JqZWN0LCB3aGljaCB3ZSBjYW4ndCBjbG9uZSwgc28gd2UgaGF2ZSB0byBjb3B5IGJ5IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSByZWd1bGFyIG9iamVjdCwgc28gd2UgZGVlcERlZmluZSByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGp1c3QgYSBwcmltaXRpdmUgdmFsdWUsIG9yIGEgUHJvbWlzZVxuICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGRba10gPSBzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJkZWVwQXNzaWduXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5ib3g8VD4oYTogVCk6IFQge1xuICAgIGNvbnN0IHYgPSBhPy52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIChBcnJheS5pc0FycmF5KHYpID8gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHYsIHVuYm94KSA6IHYpIGFzIFQ7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25Qcm9wcyhiYXNlOiBOb2RlLCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8vIENvcHkgcHJvcCBoaWVyYXJjaHkgb250byB0aGUgZWxlbWVudCB2aWEgdGhlIGFzc3NpZ25tZW50IG9wZXJhdG9yIGluIG9yZGVyIHRvIHJ1biBzZXR0ZXJzXG4gICAgaWYgKCEoY2FsbFN0YWNrU3ltYm9sIGluIHByb3BzKSkge1xuICAgICAgKGZ1bmN0aW9uIGFzc2lnbihkOiBhbnksIHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gc3RhdGljIHByb3BzIGJlZm9yZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgY29uc3Qgc291cmNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHMpKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHMpKSB7XG4gICAgICAgICAgc291cmNlRW50cmllcy5zb3J0KGEgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgYVswXSk7XG4gICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgIGlmICgnc2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgICAgaWYgKCdnZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXQgPSBpc1Rlc3RFbnYgfHwgIShkIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgKGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgICA/IChrOiBzdHJpbmcsIHY6IGFueSkgPT4geyBkW2tdID0gdiB9XG4gICAgICAgICAgOiAoazogc3RyaW5nLCB2OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmICgodiA9PT0gbnVsbCB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICYmICghKGsgaW4gZCkgfHwgdHlwZW9mIGRbayBhcyBrZXlvZiB0eXBlb2YgZF0gIT09ICdzdHJpbmcnKSlcbiAgICAgICAgICAgICAgZC5zZXRBdHRyaWJ1dGUoayA9PT0gJ2NsYXNzTmFtZScgPyAnY2xhc3MnIDogaywgU3RyaW5nKHYpKTtcbiAgICAgICAgICAgIGVsc2UgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBkW2tdID0gdjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2Ygc291cmNlRW50cmllcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3JjRGVzYy52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnRoZW4odiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGlzIHByb21pc2UgcmVzb2x2ZWQgdG8gYW4gYXN5bmMgaXRlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbkl0ZXJhYmxlKHYsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQoaywgdik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiBjb25zb2xlLmxvZyhgRXhjZXB0aW9uIGluIHByb21pc2VkIGF0dHJpYnV0ZSAnJHtrfSdgLCBlcnJvciwgbG9nTm9kZShkKSkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzZXQoaywgc1trXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBkZWZpbml0aW9uIG9mIHRoZSBnZXR0ZXIvc2V0dGVyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleDogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzaWduUHJvcHNcIiwgaywgc1trXSwgZXgpO1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduSXRlcmFibGUoaXRlcjogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IoaXRlcik7XG4gICAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICAgIGxldCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgY29uc3QgY3JlYXRlZEJ5ID0gREVCVUcgJiYgbmV3IEVycm9yKFwiQ3JlYXRlZCBieVwiKS5zdGFjaztcblxuICAgICAgICAgIGxldCBtb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIG1vdW50ZWQgPSBtb3VudGVkIHx8IGJhc2UuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYmVlbiBtb3VudGVkIGJlZm9yZSwgYnV0IGFyZW4ndCBub3csIHJlbW92ZSB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5oYXMoYmFzZSkpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIihub2RlIHJlbW92ZWQpXCIpO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB1bmJveChlcy52YWx1ZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgVEhJUyBJUyBKVVNUIEEgSEFDSzogYHN0eWxlYCBoYXMgdG8gYmUgc2V0IG1lbWJlciBieSBtZW1iZXIsIGVnOlxuICAgICAgICAgICAgICAgIGUuc3R5bGUuY29sb3IgPSAnYmx1ZScgICAgICAgIC0tLSB3b3Jrc1xuICAgICAgICAgICAgICAgIGUuc3R5bGUgPSB7IGNvbG9yOiAnYmx1ZScgfSAgIC0tLSBkb2Vzbid0IHdvcmtcbiAgICAgICAgICAgICAgd2hlcmVhcyBpbiBnZW5lcmFsIHdoZW4gYXNzaWduaW5nIHRvIHByb3BlcnR5IHdlIGxldCB0aGUgcmVjZWl2ZXJcbiAgICAgICAgICAgICAgZG8gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSBvYmplY3QuIFRoaXMgbWlnaHQgYmUgYmV0dGVyIGhhbmRsZWRcbiAgICAgICAgICAgICAgYnkgaGF2aW5nIGEgc2V0dGVyIGZvciBgc3R5bGVgIGluIHRoZSBQb0VsZW1lbnRNZXRob2RzIHRoYXQgaXMgc2Vuc2l0aXZlXG4gICAgICAgICAgICAgIHRvIHRoZSB0eXBlIChzdHJpbmd8b2JqZWN0KSBiZWluZyBwYXNzZWQgc28gd2UgY2FuIGp1c3QgZG8gYSBzdHJhaWdodFxuICAgICAgICAgICAgICBhc3NpZ25tZW50IGFsbCB0aGUgdGltZSwgb3IgbWFraW5nIHRoZSBkZWNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgcHJvcGVydHkgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgYXNzdW1pbmcgYW55dGhpbmcgYmVsb3cgXCJQT1wiIG11c3QgYmVcbiAgICAgICAgICAgICAgYSBwcmltaXRpdmVcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBkZXN0RGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk7XG4gICAgICAgICAgICAgICAgaWYgKGsgPT09ICdzdHlsZScgfHwgIWRlc3REZXNjPy5zZXQpXG4gICAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChERUJVRyAmJiAhbW91bnRlZCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyb3JWYWx1ZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSB0ZXJtaW5hdGlvblwiLCBlcnJvclZhbHVlLCBrLCBsb2dOb2RlKGQpLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1bmJveGVkID0gaXRlci52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSBpdGVyICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFtiYXNlXSwgaywgKCkgPT4gYXAucmV0dXJuPy4oKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25PYmplY3QodmFsdWU6IGFueSwgazogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtiYXNlIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoYmFzZSkgOiBiYXNlfWApO1xuICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gb3Vyc2VsZiAob3IgYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aCksXG4gICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYXNzaWduIGludG9cbiAgICAgICAgICAgIGlmICghKGsgaW4gZCkgfHwgZFtrXSA9PT0gdmFsdWUgfHwgKEFycmF5LmlzQXJyYXkoZFtrXSkgJiYgZFtrXS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29weSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIGFzc2lnbihjb3B5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2V0KGssIGNvcHkpO1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZCwgayk/LnNldClcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKGJhc2UsIHByb3BzKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBFeHRlbmQgYSBjb21wb25lbnQgY2xhc3Mgd2l0aCBjcmVhdGUgYSBuZXcgY29tcG9uZW50IGNsYXNzIGZhY3Rvcnk6XG4gICAgICBjb25zdCBOZXdEaXYgPSBEaXYuZXh0ZW5kZWQoeyBvdmVycmlkZXMgfSlcbiAgICAgICAgICAuLi5vci4uLlxuICAgICAgY29uc3QgTmV3RGljID0gRGl2LmV4dGVuZGVkKChpbnN0YW5jZTp7IGFyYml0cmFyeS10eXBlIH0pID0+ICh7IG92ZXJyaWRlcyB9KSlcbiAgICAgICAgIC4uLmxhdGVyLi4uXG4gICAgICBjb25zdCBlbHROZXdEaXYgPSBOZXdEaXYoe2F0dHJzfSwuLi5jaGlsZHJlbilcbiAgKi9cblxuICBmdW5jdGlvbiB0YWdIYXNJbnN0YW5jZSh0aGlzOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBjID0gZS5jb25zdHJ1Y3RvcjsgYzsgYyA9IGMuc3VwZXIpIHtcbiAgICAgIGlmIChjID09PSB0aGlzKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kZWQodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSB7XG4gICAgY29uc3QgaW5zdGFuY2VEZWZpbml0aW9uID0gKHR5cGVvZiBfb3ZlcnJpZGVzICE9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoaW5zdGFuY2U6IEluc3RhbmNlKSA9PiBPYmplY3QuYXNzaWduKHt9LCBfb3ZlcnJpZGVzLCBpbnN0YW5jZSlcbiAgICAgIDogX292ZXJyaWRlc1xuXG4gICAgY29uc3QgdW5pcXVlVGFnSUQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIChpZENvdW50KyspLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpO1xuICAgIGNvbnN0IHN0YXRpY0V4dGVuc2lvbnM6IE92ZXJyaWRlcyA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgIC8qIFwiU3RhdGljYWxseVwiIGNyZWF0ZSBhbnkgc3R5bGVzIHJlcXVpcmVkIGJ5IHRoaXMgd2lkZ2V0ICovXG4gICAgaWYgKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhaXVpRXh0ZW5kZWRUYWdTdHlsZXMpPy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICB9XG5cbiAgICAvLyBcInRoaXNcIiBpcyB0aGUgdGFnIHdlJ3JlIGJlaW5nIGV4dGVuZGVkIGZyb20sIGFzIGl0J3MgYWx3YXlzIGNhbGxlZCBhczogYCh0aGlzKS5leHRlbmRlZGBcbiAgICAvLyBIZXJlJ3Mgd2hlcmUgd2UgYWN0dWFsbHkgY3JlYXRlIHRoZSB0YWcsIGJ5IGFjY3VtdWxhdGluZyBhbGwgdGhlIGJhc2UgYXR0cmlidXRlcyBhbmRcbiAgICAvLyAoZmluYWxseSkgYXNzaWduaW5nIHRob3NlIHNwZWNpZmllZCBieSB0aGUgaW5zdGFudGlhdGlvblxuICAgIGNvbnN0IGV4dGVuZFRhZ0ZuOiBFeHRlbmRUYWdGdW5jdGlvbiA9IChhdHRycywgLi4uY2hpbGRyZW4pID0+IHtcbiAgICAgIGNvbnN0IG5vQXR0cnMgPSBpc0NoaWxkVGFnKGF0dHJzKTtcbiAgICAgIGNvbnN0IG5ld0NhbGxTdGFjazogKENvbnN0cnVjdGVkICYgT3ZlcnJpZGVzKVtdID0gW107XG4gICAgICBjb25zdCBjb21iaW5lZEF0dHJzID0geyBbY2FsbFN0YWNrU3ltYm9sXTogKG5vQXR0cnMgPyBuZXdDYWxsU3RhY2sgOiBhdHRyc1tjYWxsU3RhY2tTeW1ib2xdKSA/PyBuZXdDYWxsU3RhY2sgfVxuICAgICAgY29uc3QgZSA9IG5vQXR0cnMgPyB0aGlzKGNvbWJpbmVkQXR0cnMsIGF0dHJzLCAuLi5jaGlsZHJlbikgOiB0aGlzKGNvbWJpbmVkQXR0cnMsIC4uLmNoaWxkcmVuKTtcbiAgICAgIGUuY29uc3RydWN0b3IgPSBleHRlbmRUYWc7XG4gICAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgICBjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0ucHVzaCh0YWdEZWZpbml0aW9uKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICAvLyBWYWxpZGF0ZSBkZWNsYXJlIGFuZCBvdmVycmlkZVxuICAgICAgICBjb25zdCBpc0FuY2VzdHJhbCA9IChjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGZvciAobGV0IGYgPSBjcmVhdG9yOyBmOyBmID0gZi5zdXBlcilcbiAgICAgICAgICAgIGlmIChmLmRlZmluaXRpb24/LmRlY2xhcmUgJiYga2V5IGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoayA9PiAoayBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGsgPT4gIShrIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBrIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBrKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZUVsZW1lbnQ6IENyZWF0ZUVsZW1lbnRbJ2NyZWF0ZUVsZW1lbnQnXSA9IChuYW1lLCBhdHRycywgLi4uY2hpbGRyZW4pID0+XG4gICAgLy8gQHRzLWlnbm9yZTogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0byByZXByZXNlbnQudHMoMjU5MClcbiAgICBuYW1lIGluc3RhbmNlb2YgTm9kZSA/IG5hbWVcbiAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/IGJhc2VUYWdDcmVhdG9yc1tuYW1lXShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBuYW1lID09PSBiYXNlVGFnQ3JlYXRvcnMuY3JlYXRlRWxlbWVudCA/IFsuLi5ub2RlcyguLi5jaGlsZHJlbildXG4gICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgIDogRHlhbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSkgfSlcblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUpIHtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGNvbnN0IHJlbW92YWxzOiBXZWFrTWFwPE5vZGUsIE1hcDxTeW1ib2wgfCBzdHJpbmcsICh0aGlzOiBOb2RlKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgeF0gb2YgcmVtb3ZhbFNldD8uZW50cmllcygpKSB0cnkgeyB4LmNhbGwobm9kZSkgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIklnbm9yZWQgZXhjZXB0aW9uIGhhbmRsaW5nIG5vZGUgcmVtb3ZhbFwiLCBuYW1lLCB4LCBsb2dOb2RlKG5vZGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgIHdhbGsobS5yZW1vdmVkTm9kZXMpXG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXMoZTpOb2RlKSB7IHJldHVybiB0cmFja2VkLmhhcyhlKSB9LFxuICAgIGFkZChlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuYWRkKGUpIH0sXG4gICAgZ2V0UmVtb3ZhbEhhbmRsZXIoZTogTm9kZSwgbmFtZTogU3ltYm9sKSB7XG4gICAgICByZXR1cm4gcmVtb3ZhbHMuZ2V0KGUpPy5nZXQobmFtZSk7XG4gICAgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBTeW1ib2wgfCBzdHJpbmcsIGhhbmRsZXI/OiAodGhpczogTm9kZSk9PnZvaWQpIHtcbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSkgPz8gbmV3IE1hcDxTeW1ib2wgfCBzdHJpbmcsICgpPT52b2lkPigpO1xuICAgICAgICAgIHJlbW92YWxzLnNldChlLCBtYXApO1xuICAgICAgICAgIG1hcC5zZXQobmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSk7XG4gICAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWFwLnNpemUpXG4gICAgICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgQm9vbGVhbihnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuaW5mbygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5jb25zdCBkZWJ1Z0lkID0gU3ltYm9sKFwiZGVmZXJyZWRQcm9taXNlSURcIik7XG5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xuICBbZGVidWdJZF0/OiBudW1iZXJcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xubGV0IGlkID0gMTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBwcm9taXNlW2RlYnVnSWRdID0gaWQrKztcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnR5cyBvZiBhbiBvYmplY3QgaXMgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2UgYW5kIHZhbHVlIG9mIHRoZSBgSXRlcmFiaWxpdHlgIHN5bWJvbC5cbiAgQnkgZGVmYXVsdCwgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gZG9lcyBhIGRlZXAgbWFwcGluZywgc28gYW4gaXRlcmFibGUgcHJvcGVydHkgJ29iaicgaXMgaXRzZWxmXG4gIGl0ZXJhYmxlLCBhcyBhcmUgaXQncyBtZW1iZXJzLiBUaGUgb25seSBkZWZpbmVkIHZhbHVlIGF0IHByZXNlbnQgaXMgXCJzaGFsbG93XCIsIGluIHdoaWNoIGNhc2UgJ29iaicgcmVtYWluc1xuICBpdGVyYWJsZSwgYnV0IGl0J3MgbWVtYmV0cnMgYXJlIGp1c3QgUE9KUyB2YWx1ZXMuXG4qL1xuXG4vLyBCYXNlIHR5cGVzIHRoYXQgY2FuIGJlIG1hZGUgZGVmaW5lZCBhcyBpdGVyYWJsZTogYmFzaWNhbGx5IGFueXRoaW5nLCBfZXhjZXB0XyBhIGZ1bmN0aW9uXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlID0gKHN0cmluZyB8IG51bWJlciB8IGJpZ2ludCB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsKVxuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIHwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlW10gfCB7IFtrOiBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXJdOiBJdGVyYWJsZVByb3BlcnR5VmFsdWUgfVxuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfVxuZXhwb3J0IHR5cGUgSXRlcmFibGVUeXBlPFQ+ID0gVCAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPFQ+PlxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIFRoaXMgaXMgcGF0Y2ggdG8gdGhlIHN0ZCBsaWIgZGVmaW5pdGlvbiBvZiBBcnJheTxUPi4gSSBkb24ndCBrbm93IHdoeSBpdCdzIGFic2VudCxcbiAgLy8gYXMgdGhpcyBpcyB0aGUgaW1wbGVtZW50YXRpb24gaW4gYWxsIEphdmFTY3JpcHQgZW5naW5lcy4gSXQgaXMgcHJvYmFibHkgYSByZXN1bHRcbiAgLy8gb2YgaXRzIGFic2VuY2UgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvdmFsdWVzLFxuICAvLyB3aGljaCBpbmhlcml0cyBmcm9tIHRoZSBPYmplY3QucHJvdG90eXBlLCB3aGljaCBtYWtlcyBubyBjbGFpbSBmb3IgdGhlIHJldHVybiB0eXBlXG4gIC8vIHNpbmNlIGl0IGNvdWxkIGJlIG92ZXJyaWRkZW0uIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSwgYSBUUyBkZWZuIHNob3VsZCBhbHNvIG92ZXJyaWRlIGl0XG4gIC8vIGxpa2UgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gZXRjIGRvLlxuICBpbnRlcmZhY2UgQXJyYXk8VD4ge1xuICAgIHZhbHVlT2YoKTogQXJyYXk8VD47XG4gIH1cbiAgLy8gQXMgYWJvdmUsIHRoZSByZXR1cm4gdHlwZSBjb3VsZCBiZSBUIHJhdGhlciB0aGFuIE9iamVjdCwgc2luY2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBpbXBsLFxuICAvLyBidXQgaXQncyBub3QsIGZvciBzb21lIHJlYXNvbi5cbiAgaW50ZXJmYWNlIE9iamVjdCB7XG4gICAgdmFsdWVPZjxUPih0aGlzOiBUKTogVCBleHRlbmRzIEl0ZXJhYmxlVHlwZTxpbmZlciBaPiA/IFogOiBPYmplY3Q7XG4gIH1cbn1cblxudHlwZSBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXMgPSBrZXlvZiBBcnJheTxhbnk+ICYga2V5b2YgQXN5bmNJdGVyYWJsZUhlbHBlcnNcblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IElQIGV4dGVuZHMgSXRlcmFiaWxpdHk8J3NoYWxsb3cnPiA/IHtcbiAgW0sgaW4ga2V5b2YgT21pdDxJUCwgdHlwZW9mIEl0ZXJhYmlsaXR5Pl06IEl0ZXJhYmxlVHlwZTxJUFtLXT5cbn0gOiB7XG4gIFtLIGluIGtleW9mIElQXTogKFxuICAgIElQW0tdIGV4dGVuZHMgQXJyYXk8aW5mZXIgRT5cbiAgICA/IC8qXG4gICAgICBCZWNhdXNlIFRTIGRvZXNuJ3QgaW1wbGVtZW50IHNlcGFyYXRlIHR5cGVzIGZvciByZWFkL3dyaXRlLCBvciBjb21wdXRlZCBnZXR0ZXIvc2V0dGVyIG5hbWVzICh3aGljaCBETyBhbGxvd1xuICAgICAgZGlmZmVyZW50IHR5cGVzIGZvciBhc3NpZ25tZW50IGFuZCBldmFsdWF0aW9uKSwgaXQgaXMgbm90IHBvc3NpYmxlIHRvIGRlZmluZSB0eXBlIGZvciBhcnJheSBtZW1iZXJzIHRoYXQgcGVybWl0XG4gICAgICBkZXJlZmVyZW5jaW5nIG9mIG5vbi1jbGFzaGluaCBhcnJheSBrZXlzIHN1Y2ggYXMgYGpvaW5gIG9yIGBzb3J0YCBhbmQgQXN5bmNJdGVyYXRvciBtZXRob2RzIHdoaWNoIGFsc28gYWxsb3dzXG4gICAgICBzaW1wbGUgYXNzaWdubWVudCBvZiB0aGUgZm9ybSBgdGhpcy5pdGVyYWJsZUFycmF5TWVtYmVyID0gWy4uLl1gLlxuXG4gICAgICBUaGUgQ09SUkVDVCB0eXBlIGZvciB0aGVzZSBmaWVsZHMgd291bGQgYmUgKGlmIFRTIGhhZCBzeW50YXggZm9yIGl0KTpcbiAgICAgIGdldCBbS10gKCk6IE9taXQ8QXJyYXk8RSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFPiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4gICAgICBzZXQgW0tdICgpOiBBcnJheTxFPiB8IEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4gICAgICAqL1xuICAgICAgT21pdDxBcnJheTxJdGVyYWJsZVR5cGU8RT4+LCBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXM+ICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8RVtdPj5cbiAgICA6IChcbiAgICAgIElQW0tdIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT5cbiAgICAgIDogSVBbS11cbiAgICApICYgSXRlcmFibGVUeXBlPElQW0tdPlxuICApXG59XG5cbi8qIFRoaW5ncyB0byBzdXBwbGllbWVudCB0aGUgSlMgYmFzZSBBc3luY0l0ZXJhYmxlICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7XG4gIHB1c2godmFsdWU6IFQpOiBib29sZWFuO1xuICByZWFkb25seSBsZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3luY0V4dHJhSXRlcmFibGU8VD4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPFQ+LCBBc3luY0l0ZXJhYmxlSGVscGVycyB7IH1cblxuLy8gTkI6IFRoaXMgYWxzbyAoaW5jb3JyZWN0bHkpIHBhc3NlcyBzeW5jIGl0ZXJhdG9ycywgYXMgdGhlIHByb3RvY29sIG5hbWVzIGFyZSB0aGUgc2FtZVxuZXhwb3J0IGZ1bmN0aW9uIGlzQXN5bmNJdGVyYXRvcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYXRvcjxUPik6IG8gaXMgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc09iamVjdExpa2UobykgJiYgJ25leHQnIGluIG8gJiYgdHlwZW9mIG8/Lm5leHQgPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIChTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBvKSAmJiB0eXBlb2Ygb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09ICdmdW5jdGlvbidcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcjxUID0gdW5rbm93bj4obzogYW55IHwgQXN5bmNJdGVyYWJsZTxUPiB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShvKSB8fCBpc0FzeW5jSXRlcmF0b3Iobylcbn1cblxuZXhwb3J0IHR5cGUgQXN5bmNQcm92aWRlcjxUPiA9IEFzeW5jSXRlcmF0b3I8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0l0ZXJhdG9yPFQ+KG86IEFzeW5jUHJvdmlkZXI8VD4pIHtcbiAgaWYgKGlzQXN5bmNJdGVyYXRvcihvKSkgcmV0dXJuIG87XG4gIGlmIChpc0FzeW5jSXRlcmFibGUobykpIHJldHVybiBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYW4gYXN5bmMgcHJvdmlkZXJcIik7XG59XG5cbnR5cGUgQXN5bmNJdGVyYWJsZUhlbHBlcnMgPSB0eXBlb2YgYXN5bmNFeHRyYXM7XG5leHBvcnQgY29uc3QgYXN5bmNFeHRyYXMgPSB7XG4gIGZpbHRlck1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLFxuICAgIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+LFxuICAgIGluaXRpYWxWYWx1ZTogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbiAgKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlKVxuICB9LFxuICBtYXAsXG4gIGZpbHRlcixcbiAgdW5pcXVlLFxuICB3YWl0Rm9yLFxuICBtdWx0aSxcbiAgaW5pdGlhbGx5LFxuICBjb25zdW1lLFxuICBtZXJnZTxULCBBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+W10+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgLi4ubTogQSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgfSxcbiAgY29tYmluZTxULCBTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCBvdGhlcnM6IFMpIHtcbiAgICByZXR1cm4gY29tYmluZShPYmplY3QuYXNzaWduKHsgJ190aGlzJzogdGhpcyB9LCBvdGhlcnMpKTtcbiAgfVxufTtcblxuY29uc3QgZXh0cmFLZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYXN5bmNFeHRyYXMpLCAuLi5PYmplY3Qua2V5cyhhc3luY0V4dHJhcyldIGFzIChrZXlvZiB0eXBlb2YgYXN5bmNFeHRyYXMpW107XG5cbi8vIExpa2UgT2JqZWN0LmFzc2lnbiwgYnV0IHRoZSBhc3NpZ25lZCBwcm9wZXJ0aWVzIGFyZSBub3QgZW51bWVyYWJsZVxuY29uc3QgaXRlcmF0b3JDYWxsU2l0ZSA9IFN5bWJvbChcIkl0ZXJhdG9yQ2FsbFNpdGVcIik7XG5mdW5jdGlvbiBhc3NpZ25IaWRkZW48RCBleHRlbmRzIG9iamVjdCwgUyBleHRlbmRzIG9iamVjdD4oZDogRCwgczogUykge1xuICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHMpLCAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpXTtcbiAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgeyAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHMsIGspLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgfVxuICBpZiAoREVCVUcpIHtcbiAgICBpZiAoIShpdGVyYXRvckNhbGxTaXRlIGluIGQpKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaXRlcmF0b3JDYWxsU2l0ZSwgeyB2YWx1ZTogbmV3IEVycm9yKCkuc3RhY2sgfSlcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ3BlbmRpbmcnKTtcbmNvbnN0IF9pdGVtcyA9IFN5bWJvbCgnaXRlbXMnKTtcbmZ1bmN0aW9uIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0ge1xuICAgIFtfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW19pdGVtc106IFtdIGFzIEl0ZXJhdG9yUmVzdWx0PFQ+W10gfCBudWxsLFxuXG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxIGFzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPjtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChxW19pdGVtc10/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHFbX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHRoaXMgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgcVtfcGVuZGluZ10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybih2PzogdW5rbm93bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUudmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSByZXR1cm4gLTE7IC8vIFRoZSBxdWV1ZSBoYXMgbm8gY29uc3VtZXJzIGFuZCBoYXMgdGVybWluYXRlZC5cbiAgICAgIHJldHVybiBxW19pdGVtc10ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBwdXNoKHZhbHVlOiBUKSB7XG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgICAgcVtfcGVuZGluZ10ucG9wKCkhLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhxKTtcbn1cblxuY29uc3QgX2luZmxpZ2h0ID0gU3ltYm9sKCdpbmZsaWdodCcpO1xuZnVuY3Rpb24gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCkgYXMgUmV0dXJuVHlwZTx0eXBlb2YgaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPj4gJiB7IFtfaW5mbGlnaHRdOiBTZXQ8VD4gfTtcbiAgcVtfaW5mbGlnaHRdID0gbmV3IFNldDxUPigpO1xuXG4gIHEucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZTogVCkge1xuICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEZWJvdW5jZVxuICAgIGlmIChxW19pbmZsaWdodF0uaGFzKHZhbHVlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgcVtfaW5mbGlnaHRdLmFkZCh2YWx1ZSk7XG4gICAgICBjb25zdCBwID0gcVtfcGVuZGluZ10ucG9wKCkhO1xuICAgICAgcC5maW5hbGx5KCgpID0+IHFbX2luZmxpZ2h0XS5kZWxldGUodmFsdWUpKTtcbiAgICAgIHAucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICB9IGVsc2UgaWYgKCFxW19pdGVtc10uZmluZCh2ID0+IHYudmFsdWUgPT09IHZhbHVlKSkge1xuICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHE7XG59XG5cbi8vIFJlLWV4cG9ydCB0byBoaWRlIHRoZSBpbnRlcm5hbHNcbmV4cG9ydCBjb25zdCBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5leHBvcnQgY29uc3QgZGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjogPFQ+KHN0b3A/OiAoKSA9PiB2b2lkKSA9PiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiA9IGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgT2JqZWN0Q29uc3RydWN0b3Ige1xuICAgIGRlZmluZVByb3BlcnRpZXM8VCwgTSBleHRlbmRzIHsgW0s6IHN0cmluZyB8IHN5bWJvbF06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4gfT4obzogVCwgcHJvcGVydGllczogTSAmIFRoaXNUeXBlPGFueT4pOiBUICYge1xuICAgICAgW0sgaW4ga2V5b2YgTV06IE1bS10gZXh0ZW5kcyBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxpbmZlciBUPiA/IFQgOiBuZXZlclxuICAgIH07XG4gIH1cbn1cblxuLyogRGVmaW5lIGEgXCJpdGVyYWJsZSBwcm9wZXJ0eVwiIG9uIGBvYmpgLlxuICAgVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgaG9sZHMgYSBib3hlZCAod2l0aGluIGFuIE9iamVjdCgpIGNhbGwpIHZhbHVlLCBhbmQgaXMgYWxzbyBhbiBBc3luY0l0ZXJhYmxlSXRlcmF0b3IuIHdoaWNoXG4gICB5aWVsZHMgd2hlbiB0aGUgcHJvcGVydHkgaXMgc2V0LlxuICAgVGhpcyByb3V0aW5lIGNyZWF0ZXMgdGhlIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHksIGFuZCBtYW5hZ2VzIHRoZSBhYXNzb2NpYXRlZCBhc3luYyBpdGVyYXRvci5cbiovXG5cbmNvbnN0IF9wcm94aWVkQXN5bmNJdGVyYXRvciA9IFN5bWJvbCgnX3Byb3hpZWRBc3luY0l0ZXJhdG9yJyk7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eTxUIGV4dGVuZHMgb2JqZWN0LCBjb25zdCBOIGV4dGVuZHMgc3RyaW5nIHwgc3ltYm9sLCBWIGV4dGVuZHMgSXRlcmFibGVQcm9wZXJ0eVZhbHVlPihvYmo6IFQsIG5hbWU6IE4sIHY6IFYpOiBUICYgSXRlcmFibGVQcm9wZXJ0aWVzPHsgW2sgaW4gTl06IFYgfT4ge1xuICAvLyBNYWtlIGBhYCBhbiBBc3luY0V4dHJhSXRlcmFibGUuIFdlIGRvbid0IGRvIHRoaXMgdW50aWwgYSBjb25zdW1lciBhY3R1YWxseSB0cmllcyB0b1xuICAvLyBhY2Nlc3MgdGhlIGl0ZXJhdG9yIG1ldGhvZHMgdG8gcHJldmVudCBsZWFrcyB3aGVyZSBhbiBpdGVyYWJsZSBpcyBjcmVhdGVkLCBidXRcbiAgLy8gbmV2ZXIgcmVmZXJlbmNlZCwgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYmUgY29uc3VtZWQgYW5kIHVsdGltYXRlbHkgY2xvc2VkXG4gIGxldCBpbml0SXRlcmF0b3IgPSAoKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yID0gKCkgPT4gYjtcbiAgICBjb25zdCBiaSA9IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj4oKTtcbiAgICBjb25zdCBtaSA9IGJpLm11bHRpKCk7XG4gICAgY29uc3QgYiA9IG1pW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIGV4dHJhc1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl07XG4gICAgcHVzaCA9IGJpLnB1c2g7XG4gICAgZXh0cmFLZXlzLmZvckVhY2goayA9PiAvLyBAdHMtaWdub3JlXG4gICAgICBleHRyYXNba10gPSBiW2sgYXMga2V5b2YgdHlwZW9mIGJdKTtcbiAgICBpZiAoIShfcHJveGllZEFzeW5jSXRlcmF0b3IgaW4gYSkpXG4gICAgICBhc3NpZ25IaWRkZW4oYSwgZXh0cmFzKTtcbiAgICByZXR1cm4gYjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBzdHVicyB0aGF0IGxhemlseSBjcmVhdGUgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZSBpbnRlcmZhY2Ugd2hlbiBpbnZva2VkXG4gIGZ1bmN0aW9uIGxhenlBc3luY01ldGhvZDxNIGV4dGVuZHMga2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzPihtZXRob2Q6IE0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgW21ldGhvZF06IGZ1bmN0aW9uICh0aGlzOiB1bmtub3duLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBpbml0SXRlcmF0b3IoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIEZpeFxuICAgICAgICByZXR1cm4gYVttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBhcyAodHlwZW9mIGFzeW5jRXh0cmFzKVtNXVxuICAgIH1bbWV0aG9kXTtcbiAgfVxuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYsIHkgPT4ge1xuICAgICAgICAgICAgaWYgKHYgIT09IHBpcGVkKSB7XG4gICAgICAgICAgICAgIC8vIFdlJ3JlIGJlaW5nIHBpcGVkIGZyb20gc29tZXRoaW5nIGVsc2UuIFdlIHdhbnQgdG8gc3RvcCB0aGF0IG9uZSBhbmQgZ2V0IHBpcGVkIGZyb20gdGhpcyBvbmVcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaXBlZCBpdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIHJlcGxhY2VkIGJ5IGFub3RoZXIgaXRlcmF0b3JgLCB7IGNhdXNlOiBzdGFjayB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB1c2goeT8udmFsdWVPZigpIGFzIFYpXG4gICAgICAgICAgfSkuY2F0Y2goZXggPT4gY29uc29sZS5pbmZvKGV4KSlcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+ICh2ID09PSBwaXBlZCkgJiYgKHBpcGVkID0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgICAvLyBFYXJseSByZXR1cm4gYXMgd2UncmUgZ29pbmcgdG8gcGlwZSB2YWx1ZXMgaW4gbGF0ZXJcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBpcGVkICYmIERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmFibGUgXCIke25hbWUudG9TdHJpbmcoKX1cIiBpcyBhbHJlYWR5IHBpcGVkIGZyb20gYW5vdGhlciBpdGVyYXRvciwgYW5kIG1pZ2h0IGJlIG92ZXJyd2l0dGVuIGxhdGVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGEgPSBib3godiwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVzaCh2Py52YWx1ZU9mKCkgYXMgVik7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gb2JqIGFzIGFueTtcblxuICBmdW5jdGlvbiBib3g8Vj4oYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8Vj4pOiBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+IHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBhc3NpZ25IaWRkZW4oT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgIHZhbHVlT2Y6IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSxcbiAgICAgICAgdG9KU09OOiB7IHZhbHVlKCkgeyByZXR1cm4gYSB9LCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH1cbiAgICAgIH0pLCBwZHMpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdiaWdpbnQnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgLy8gQm94ZXMgdHlwZXMsIGluY2x1ZGluZyBCaWdJbnRcbiAgICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QoYSksIE9iamVjdC5hc3NpZ24ocGRzLCB7XG4gICAgICAgICAgdG9KU09OKCkgeyByZXR1cm4gYS52YWx1ZU9mKCkgfVxuICAgICAgICB9KSk7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAvLyBXZSBib3ggb2JqZWN0cyBieSBjcmVhdGluZyBhIFByb3h5IGZvciB0aGUgb2JqZWN0IHRoYXQgcHVzaGVzIG9uIGdldC9zZXQvZGVsZXRlLCBhbmQgbWFwcyB0aGUgc3VwcGxpZWQgYXN5bmMgaXRlcmF0b3IgdG8gcHVzaCB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICAvLyBUaGUgcHJveGllcyBhcmUgcmVjdXJzaXZlLCBzbyB0aGF0IGlmIGFuIG9iamVjdCBjb250YWlucyBvYmplY3RzLCB0aGV5IHRvbyBhcmUgcHJveGllZC4gT2JqZWN0cyBjb250YWluaW5nIHByaW1pdGl2ZXMgcmVtYWluIHByb3hpZWQgdG9cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBnZXQvc2V0L3NlbGV0ZSBpbiBwbGFjZSBvZiB0aGUgdXN1YWwgcHJpbWl0aXZlIGJveGluZyB2aWEgT2JqZWN0KHByaW1pdGl2ZVZhbHVlKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBib3hPYmplY3QoYSwgcGRzKTtcblxuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJdGVyYWJsZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBvZiB0eXBlIFwiJyArIHR5cGVvZiBhICsgJ1wiJyk7XG4gIH1cblxuICB0eXBlIFdpdGhQYXRoID0geyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhOiBWLCBwYXRoOiBzdHJpbmcgfCBudWxsIH0gfTtcbiAgdHlwZSBQb3NzaWJseVdpdGhQYXRoID0gViB8IFdpdGhQYXRoO1xuICBmdW5jdGlvbiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG86IFBvc3NpYmx5V2l0aFBhdGgpOiBvIGlzIFdpdGhQYXRoIHtcbiAgICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmIF9wcm94aWVkQXN5bmNJdGVyYXRvciBpbiBvO1xuICB9XG4gIGZ1bmN0aW9uIGRlc3RydWN0dXJlKG86IGFueSwgcGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZmllbGRzID0gcGF0aC5zcGxpdCgnLicpLnNsaWNlKDEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aCAmJiAoKG8gPSBvPy5bZmllbGRzW2ldXSkgIT09IHVuZGVmaW5lZCk7IGkrKyk7XG4gICAgcmV0dXJuIG87XG4gIH1cbiAgZnVuY3Rpb24gYm94T2JqZWN0KGE6IFYsIHBkczogQXN5bmNFeHRyYUl0ZXJhYmxlPFBvc3NpYmx5V2l0aFBhdGg+KSB7XG4gICAgbGV0IHdpdGhQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8V2l0aFBhdGhbdHlwZW9mIF9wcm94aWVkQXN5bmNJdGVyYXRvcl0+O1xuICAgIGxldCB3aXRob3V0UGF0aDogQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuICAgIHJldHVybiBuZXcgUHJveHkoYSBhcyBvYmplY3QsIGhhbmRsZXIoKSkgYXMgViAmIEFzeW5jRXh0cmFJdGVyYWJsZTxWPjtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIocGF0aCA9ICcnKTogUHJveHlIYW5kbGVyPG9iamVjdD4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQSBib3hlZCBvYmplY3QgaGFzIGl0cyBvd24ga2V5cywgYW5kIHRoZSBrZXlzIG9mIGFuIEFzeW5jRXh0cmFJdGVyYWJsZVxuICAgICAgICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5ID09PSBfcHJveGllZEFzeW5jSXRlcmF0b3IgfHwga2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUgfHwga2V5IGluIHRhcmdldCB8fCBrZXkgaW4gcGRzO1xuICAgICAgICB9LFxuICAgICAgICAvLyBXaGVuIGEga2V5IGlzIHNldCBpbiB0aGUgdGFyZ2V0LCBwdXNoIHRoZSBjaGFuZ2VcbiAgICAgICAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCAke25hbWUudG9TdHJpbmcoKX0ke3BhdGh9LiR7a2V5LnRvU3RyaW5nKCl9IGFzIGl0IGlzIHBhcnQgb2YgYXN5bmNJdGVyYXRvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgaWYgKFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgICAgICBwdXNoKHsgW19wcm94aWVkQXN5bmNJdGVyYXRvcl06IHsgYSwgcGF0aCB9IH0gYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gZ2V0dGluZyB0aGUgdmFsdWUgb2YgYSBib3hlZCBvYmplY3QgbWVtYmVyLCBwcmVmZXIgYXN5bmNFeHRyYUl0ZXJhYmxlIG92ZXIgdGFyZ2V0IGtleXNcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYW4gYXN5bmNFeHRyYUl0ZXJhYmxlIG1lbWJlciwgY3JlYXRlIHRoZSBtYXBwZWQgcXVldWUgdG8gZ2VuZXJhdGUgaXRcbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihwZHMsIGtleSkpIHtcbiAgICAgICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgd2l0aG91dFBhdGggPz89IGZpbHRlck1hcChwZHMsIG8gPT4gaXNQcm94aWVkQXN5bmNJdGVyYXRvcihvKSA/IG9bX3Byb3hpZWRBc3luY0l0ZXJhdG9yXS5hIDogbyk7XG4gICAgICAgICAgICAgIHJldHVybiB3aXRob3V0UGF0aFtrZXkgYXMga2V5b2YgdHlwZW9mIHBkc107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aXRoUGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdIDogeyBhOiBvLCBwYXRoOiBudWxsIH0pO1xuXG4gICAgICAgICAgICAgIGxldCBhaSA9IGZpbHRlck1hcCh3aXRoUGF0aCwgKG8sIHApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gZGVzdHJ1Y3R1cmUoby5hLCBwYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCAhPT0gdiB8fCBvLnBhdGggPT09IG51bGwgfHwgby5wYXRoLnN0YXJ0c1dpdGgocGF0aCkgPyB2IDogSWdub3JlO1xuICAgICAgICAgICAgICB9LCBJZ25vcmUsIGRlc3RydWN0dXJlKGEsIHBhdGgpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGFpW2tleSBhcyBrZXlvZiB0eXBlb2YgYWldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBrZXkgaXMgYSB0YXJnZXQgcHJvcGVydHksIGNyZWF0ZSB0aGUgcHJveHkgdG8gaGFuZGxlIGl0XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlT2YnKSByZXR1cm4gKCkgPT4gZGVzdHJ1Y3R1cmUoYSwgcGF0aCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UsIHNpbmNlIFN5bWJvbC50b1ByaW1pdGl2ZSBpcyBpbiBoYSgpLCB3ZSBuZWVkIHRvIGltcGxlbWVudCBpdFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoaW50PzogJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgdGFyZ2V0KS5jYWxsKHRhcmdldCwgaGludCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnc3RyaW5nJykgcmV0dXJuIHRhcmdldC50b1N0cmluZygpO1xuICAgICAgICAgICAgICBpZiAoaGludCA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIodGFyZ2V0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCghKGtleSBpbiB0YXJnZXQpIHx8IE9iamVjdC5oYXNPd24odGFyZ2V0LCBrZXkpKSAmJiAhKEl0ZXJhYmlsaXR5IGluIHRhcmdldCAmJiB0YXJnZXRbSXRlcmFiaWxpdHldID09PSAnc2hhbGxvdycpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgZmllbGQgPT09ICdmdW5jdGlvbicpIHx8IGlzQXN5bmNJdGVyKGZpZWxkKVxuICAgICAgICAgICAgICAgID8gZmllbGRcbiAgICAgICAgICAgICAgICA6IG5ldyBQcm94eShPYmplY3QoZmllbGQpLCBoYW5kbGVyKHBhdGggKyAnLicgKyBrZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIHN5bWJvbGljIGVudHJ5LCBvciBhIHByb3RvdHlwaWNhbCB2YWx1ZSAoc2luY2UgaXQncyBpbiB0aGUgdGFyZ2V0LCBidXQgbm90IGEgdGFyZ2V0IHByb3BlcnR5KVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIEV4dGVuc2lvbnMgdG8gdGhlIEFzeW5jSXRlcmFibGU6XG4qL1xuLy9jb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdCA9IG5ldyBNYXA8bnVtYmVyLCAodW5kZWZpbmVkIHwgQXN5bmNJdGVyYXRvcjxhbnk+KT4oKTtcbiAgY29uc3QgcHJvbWlzZXMgPSBuZXcgTWFwPG51bWJlcixQcm9taXNlPHsga2V5OiBudW1iZXIsIHJlc3VsdDogSXRlcmF0b3JSZXN1bHQ8YW55PiB9Pj4oKTtcblxuICBsZXQgaW5pdCA9ICgpID0+IHtcbiAgICBpbml0ID0gKCkgPT4geyB9XG4gICAgZm9yIChsZXQgbiA9IDA7IG4gPCBhaS5sZW5ndGg7IG4rKykge1xuICAgICAgY29uc3QgYSA9IGFpW25dIGFzIEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD47XG4gICAgICBjb25zdCBpdGVyID0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYSA/IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgOiBhIGFzIEFzeW5jSXRlcmF0b3I8YW55PjtcbiAgICAgIGl0LnNldChuLCBpdGVyKTtcbiAgICAgIHByb21pc2VzLnNldChuLCBpdGVyLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBrZXk6IG4sIHJlc3VsdCB9KSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IChUWWllbGQgfCBUUmV0dXJuKVtdID0gbmV3IEFycmF5KGFpLmxlbmd0aCk7XG5cbiAgY29uc3QgbWVyZ2VkOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QVtudW1iZXJdPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkgeyByZXR1cm4gbWVyZ2VkIH0sXG4gICAgbmV4dCgpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBwcm9taXNlcy5zaXplXG4gICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzLnZhbHVlcygpKS50aGVuKCh7IGtleSwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgaXQuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZXMuc2V0KGtleSxcbiAgICAgICAgICAgICAgaXQuaGFzKGtleSlcbiAgICAgICAgICAgICAgICA/IGl0LmdldChrZXkpIS5uZXh0KCkudGhlbihyZXN1bHQgPT4gKHsga2V5LCByZXN1bHQgfSkpLmNhdGNoKGV4ID0+ICh7IGtleSwgcmVzdWx0OiB7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9IH0pKVxuICAgICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsga2V5LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9IH0pKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAgIC8vIGBleGAgaXMgdGhlIHVuZGVybHlpbmcgYXN5bmMgaXRlcmF0aW9uIGV4Y2VwdGlvblxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZC50aHJvdyEoZXgpIC8vID8/IFByb21pc2UucmVqZWN0KHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IG5ldyBFcnJvcihcIkl0ZXJhdG9yIG1lcmdlIGV4Y2VwdGlvblwiKSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogcmVzdWx0cyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIHJldHVybihyKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBpdC5rZXlzKCkpIHtcbiAgICAgICAgaWYgKHByb21pc2VzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgcmVzdWx0c1trZXldID0gYXdhaXQgaXQuZ2V0KGtleSk/LnJldHVybj8uKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHIgfSkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHJlc3VsdHMgfTtcbiAgICB9LFxuICAgIGFzeW5jIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGl0LmtleXMoKSkge1xuICAgICAgICBpZiAocHJvbWlzZXMuaGFzKGtleSkpIHtcbiAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICByZXN1bHRzW2tleV0gPSBhd2FpdCBpdC5nZXQoa2V5KT8udGhyb3c/LihleCkudGhlbih2ID0+IHYudmFsdWUsIGV4ID0+IGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBwYXNzZWQgdGhlIGV4Y2VwdGlvbiBvbiB0byBhbGwgdGhlIHNvdXJjZXMsIHdlJ3JlIG5vdyBkb25lXG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQgYXMgdW5rbm93biBhcyBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8QVtudW1iZXJdPik7XG59XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZSA9IHsgW2s6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbF06IFBhcnRpYWxJdGVyYWJsZSB9O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSB7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmVPcHRpb25zIHtcbiAgaWdub3JlUGFydGlhbD86IGJvb2xlYW47IC8vIFNldCB0byBhdm9pZCB5aWVsZGluZyBpZiBzb21lIHNvdXJjZXMgYXJlIGFic2VudFxufVxuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4oc3JjOiBTLCBvcHRzOiBDb21iaW5lT3B0aW9ucyA9IHt9KTogQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPiA9PiB7XG4gIGNvbnN0IGFjY3VtdWxhdGVkOiBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPiA9IHt9O1xuICBjb25zdCBzaSA9IG5ldyBNYXA8c3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCBBc3luY0l0ZXJhdG9yPGFueT4+KCk7XG4gIGxldCBwYzogTWFwPHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgUHJvbWlzZTx7IGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT4+OyAvLyBJbml0aWFsaXplZCBsYXppbHlcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSkgPT4ge1xuICAgICAgICAgIHNpLnNldChrLCBzaXRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpKTtcbiAgICAgICAgICByZXR1cm4gW2ssIHNpLmdldChrKSEubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGssIGlyIH0pKV07XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMudmFsdWVzKCkpLnRoZW4oKHsgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwYy5kZWxldGUoayk7XG4gICAgICAgICAgICBzaS5kZWxldGUoayk7XG4gICAgICAgICAgICBpZiAoIXBjLnNpemUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2tdID0gaXIudmFsdWU7XG4gICAgICAgICAgICBwYy5zZXQoaywgc2kuZ2V0KGspIS5uZXh0KCkudGhlbihpciA9PiAoeyBrLCBpciB9KSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0cy5pZ25vcmVQYXJ0aWFsKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYWNjdW11bGF0ZWQpLmxlbmd0aCA8IE9iamVjdC5rZXlzKHNyYykubGVuZ3RoKVxuICAgICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IGFjY3VtdWxhdGVkIH07XG4gICAgICAgIH0pXG4gICAgICB9KSgpO1xuICAgIH0sXG4gICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3QgYWkgb2Ygc2kudmFsdWVzKCkpIHtcbiAgICAgICAgICBhaS5yZXR1cm4/Lih2KVxuICAgICAgfTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICB9LFxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIGZvciAoY29uc3QgYWkgb2Ygc2kudmFsdWVzKCkpXG4gICAgICAgIGFpLnRocm93Py4oZXgpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGNpKTtcbn1cblxuXG5mdW5jdGlvbiBpc0V4dHJhSXRlcmFibGU8VD4oaTogYW55KTogaSBpcyBBc3luY0V4dHJhSXRlcmFibGU8VD4ge1xuICByZXR1cm4gaXNBc3luY0l0ZXJhYmxlKGkpXG4gICAgJiYgZXh0cmFLZXlzLmV2ZXJ5KGsgPT4gKGsgaW4gaSkgJiYgKGkgYXMgYW55KVtrXSA9PT0gYXN5bmNFeHRyYXNba10pO1xufVxuXG4vLyBBdHRhY2ggdGhlIHByZS1kZWZpbmVkIGhlbHBlcnMgb250byBhbiBBc3luY0l0ZXJhYmxlIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdCBjb3JyZWN0bHkgdHlwZWRcbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZUhlbHBlcnM8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4oYWk6IEEpOiBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IHVua25vd24+IHtcbiAgaWYgKCFpc0V4dHJhSXRlcmFibGUoYWkpKSB7XG4gICAgYXNzaWduSGlkZGVuKGFpLCBhc3luY0V4dHJhcyk7XG4gIH1cbiAgcmV0dXJuIGFpIGFzIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICYgQSA6IG5ldmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0b3JIZWxwZXJzPEcgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFIsIFIgZXh0ZW5kcyBBc3luY0dlbmVyYXRvcj4oZzogRykge1xuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pOiBSZXR1cm5UeXBlPEc+IHtcbiAgICBjb25zdCBhaSA9IGcoLi4uYXJncyk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhhaSkgYXMgUmV0dXJuVHlwZTxHPjtcbiAgfSBhcyAoLi4uYXJnczogUGFyYW1ldGVyczxHPikgPT4gUmV0dXJuVHlwZTxHPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxSZXR1cm5UeXBlPEc+IGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I8aW5mZXIgVD4gPyBUIDogdW5rbm93bj5cbn1cblxuLyogQXN5bmNJdGVyYWJsZSBoZWxwZXJzLCB3aGljaCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gQXN5bmNJdGVyYXRvciB3aXRoIGB3aXRoSGVscGVycyhhaSlgLCBhbmQgaW52b2tlZCBkaXJlY3RseSBmb3IgZm9yZWlnbiBhc3luY0l0ZXJhdG9ycyAqL1xuXG4vKiB0eXBlcyB0aGF0IGFjY2VwdCBQYXJ0aWFscyBhcyBwb3RlbnRpYWxsdSBhc3luYyBpdGVyYXRvcnMsIHNpbmNlIHdlIHBlcm1pdCB0aGlzIElOIFRZUElORyBzb1xuICBpdGVyYWJsZSBwcm9wZXJ0aWVzIGRvbid0IGNvbXBsYWluIG9uIGV2ZXJ5IGFjY2VzcyBhcyB0aGV5IGFyZSBkZWNsYXJlZCBhcyBWICYgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFY+PlxuICBkdWUgdG8gdGhlIHNldHRlcnMgYW5kIGdldHRlcnMgaGF2aW5nIGRpZmZlcmVudCB0eXBlcywgYnV0IHVuZGVjbGFyYWJsZSBpbiBUUyBkdWUgdG8gc3ludGF4IGxpbWl0YXRpb25zICovXG50eXBlIEhlbHBlckFzeW5jSXRlcmFibGU8USBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4gPSBIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFE+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+O1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhdG9yPEY+ID1cbiAgRiBleHRlbmRzICgpID0+IEFzeW5jSXRlcmF0b3I8aW5mZXIgVD5cbiAgPyBUIDogbmV2ZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnN1bWU8VSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+Pj4odGhpczogVSwgZj86ICh1OiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGxhc3Q6IHVuZGVmaW5lZCB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPiA9IHVuZGVmaW5lZDtcbiAgZm9yIGF3YWl0IChjb25zdCB1IG9mIHRoaXMgYXMgQXN5bmNJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pikge1xuICAgIGxhc3QgPSBmPy4odSk7XG4gIH1cbiAgYXdhaXQgbGFzdDtcbn1cblxudHlwZSBNYXBwZXI8VSwgUj4gPSAoKG86IFUsIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPik7XG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuXG50eXBlIFBhcnRpYWxJdGVyYWJsZTxUID0gYW55PiA9IFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxUPj47XG5cbmZ1bmN0aW9uIHJlc29sdmVTeW5jPFosIFI+KHY6IE1heWJlUHJvbWlzZWQ8Wj4sIHRoZW46ICh2OiBaKSA9PiBSLCBleGNlcHQ6ICh4OiBhbnkpID0+IGFueSk6IE1heWJlUHJvbWlzZWQ8Uj4ge1xuICBpZiAoaXNQcm9taXNlTGlrZSh2KSlcbiAgICByZXR1cm4gdi50aGVuKHRoZW4sIGV4Y2VwdCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHRoZW4odilcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXR1cm4gZXhjZXB0KGV4KVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4oc291cmNlOiBVLFxuICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlLFxuICBwcmV2OiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZVxuKTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgbGV0IGFpOiBBc3luY0l0ZXJhdG9yPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+O1xuICBmdW5jdGlvbiBkb25lKHY6IEl0ZXJhdG9yUmVzdWx0PEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8VT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT4sIGFueT4gfCB1bmRlZmluZWQpe1xuICAgIC8vIEB0cy1pZ25vcmUgLSByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IGZhaSA9IG51bGw7XG4gICAgcHJldiA9IElnbm9yZTtcbiAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfVxuICB9XG4gIGxldCBmYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgcmV0dXJuIGZhaTtcbiAgICB9LFxuXG4gICAgbmV4dCguLi5hcmdzOiBbXSB8IFt1bmRlZmluZWRdKSB7XG4gICAgICBpZiAoaW5pdGlhbFZhbHVlICE9PSBJZ25vcmUpIHtcbiAgICAgICAgY29uc3QgaW5pdCA9IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogaW5pdGlhbFZhbHVlIH0pO1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBJZ25vcmU7XG4gICAgICAgIHJldHVybiBpbml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Uj4+KGZ1bmN0aW9uIHN0ZXAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghYWkpXG4gICAgICAgICAgYWkgPSBzb3VyY2VbU3ltYm9sLmFzeW5jSXRlcmF0b3JdISgpO1xuICAgICAgICBhaS5uZXh0KC4uLmFyZ3MpLnRoZW4oXG4gICAgICAgICAgcCA9PiBwLmRvbmVcbiAgICAgICAgICAgID8gKHByZXYgPSBJZ25vcmUsIHJlc29sdmUocCkpXG4gICAgICAgICAgICA6IHJlc29sdmVTeW5jKGZuKHAudmFsdWUsIHByZXYpLFxuICAgICAgICAgICAgICBmID0+IGYgPT09IElnbm9yZVxuICAgICAgICAgICAgICAgID8gc3RlcChyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBwcmV2ID0gZiB9KSxcbiAgICAgICAgICAgICAgZXggPT4ge1xuICAgICAgICAgICAgICAgIHByZXYgPSBJZ25vcmU7IC8vIFJlbW92ZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZpbHRlciBmdW5jdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VSZXNwb25zZSA9IGFpLnRocm93Py4oZXgpID8/IGFpLnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgICAgICAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAoYWkpIGFuZCBjb25zdW1lciAocmVqZWN0KVxuICAgICAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZVJlc3BvbnNlKSkgc291cmNlUmVzcG9uc2UudGhlbihyZWplY3QscmVqZWN0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVJlc3BvbnNlID0gYWkudGhyb3c/LihleCkgPz8gYWkucmV0dXJuPy4oZXgpO1xuICAgICAgICAgIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIChhaSkgYW5kIGNvbnN1bWVyIChyZWplY3QpXG4gICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlUmVzcG9uc2UpKSBzb3VyY2VSZXNwb25zZS50aGVuKHJlamVjdCwgcmVqZWN0KTtcbiAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBzb3VyY2VSZXNwb25zZSB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lLCBkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgLy8gaWYgKERFQlVHKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoZmFpLCdkZWJ1Zzogc291cmNlIGFzeW5jSXRlcmF0b3InLHtcbiAgLy8gICB2YWx1ZTogbmV3IFdlYWtSZWYoc291cmNlKVxuICAvLyB9KVxuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGZhaSlcbn1cblxuZnVuY3Rpb24gbWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHRoaXM6IFUsIG1hcHBlcjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPFI+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBtYXBwZXIpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXI8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm46IChvOiBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+KSA9PiBib29sZWFuIHwgUHJvbWlzZUxpa2U8Ym9vbGVhbj4pOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIG8gPT4gKGF3YWl0IGZuKG8pID8gbyA6IElnbm9yZSkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWU8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgZm4/OiAobmV4dDogSGVscGVyQXN5bmNJdGVyYWJsZTxVPiwgcHJldjogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZuXG4gICAgPyBmaWx0ZXJNYXAodGhpcywgYXN5bmMgKG8sIHApID0+IChwID09PSBJZ25vcmUgfHwgYXdhaXQgZm4obywgcCkpID8gbyA6IElnbm9yZSlcbiAgICA6IGZpbHRlck1hcCh0aGlzLCAobywgcCkgPT4gbyA9PT0gcCA/IElnbm9yZSA6IG8pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsbHk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgSSA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHRoaXM6IFUsIGluaXRWYWx1ZTogSSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+IHwgST4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbywgaW5pdFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvcjxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVLCBjYjogKGRvbmU6ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSA9PiB2b2lkKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG5ldyBQcm9taXNlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KHJlc29sdmUgPT4geyBjYigoKSA9PiByZXNvbHZlKG8pKTsgcmV0dXJuIG8gfSkpO1xufVxuXG5mdW5jdGlvbiBtdWx0aTxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPih0aGlzOiBVKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgdHlwZSBUID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPjtcbiAgY29uc3Qgc291cmNlID0gdGhpcztcbiAgbGV0IGNvbnN1bWVycyA9IDA7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50LnJlc29sdmUoaXQpO1xuICAgIGlmIChpdD8uZG9uZSkge1xuICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2VcbiAgICAgIGN1cnJlbnQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ID0gZGVmZXJyZWQ8SXRlcmF0b3JSZXN1bHQ8VD4+KCk7XG4gICAgICBhaSEubmV4dCgpXG4gICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY3VycmVudD8ucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pO1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCkge1xuICAgIC8vIEB0cy1pZ25vcmU6IHJlbW92ZSByZWZlcmVuY2VzIGZvciBHQ1xuICAgIGFpID0gbWFpID0gY3VycmVudCA9IG51bGw7XG4gICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH1cbiAgfVxuXG4gIGxldCBtYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiA9IHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgY29uc3VtZXJzICs9IDE7XG4gICAgICByZXR1cm4gbWFpO1xuICAgIH0sXG5cbiAgICBuZXh0KCkge1xuICAgICAgaWYgKCFhaSkge1xuICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIHN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBmaW5hbCBvbmVcbiAgICAgIGlmIChjb25zdW1lcnMgPCAxKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgY29uc3VtZXJzIC09IDE7XG4gICAgICBpZiAoY29uc3VtZXJzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lLCBkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlIGlmIHdlJ3JlIHRoZSBvbmx5IG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiogKCkgeyB9KSgpO1xuICB3aGlsZSAoZykge1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGcsIFN5bWJvbC5hc3luY0l0ZXJhdG9yKTtcbiAgICBpZiAoZGVzYykge1xuICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGcgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZyk7XG4gIH1cbiAgaWYgKCFnKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbnR5cGUgV2hlblBhcmFtZXRlcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gVmFsaWRXaGVuU2VsZWN0b3I8SURTPlxufCBFbGVtZW50IC8qIEltcGxpZXMgXCJjaGFuZ2VcIiBldmVudCAqL1xufCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xufCBBc3luY0l0ZXJhYmxlPGFueT5cblxuZXhwb3J0IHR5cGUgV2hlblBhcmFtZXRlcnM8SURTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFJlYWRvbmx5QXJyYXk8V2hlblBhcmFtZXRlcjxJRFM+PlxuXG4vLyBUaGUgSXRlcmF0ZWQgdHlwZSBnZW5lcmF0ZWQgYnkgXCJ3aGVuXCIsIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzXG50eXBlIFdoZW5JdGVyYXRlZFR5cGU8UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIChFeHRyYWN0PFNbbnVtYmVyXSwgQXN5bmNJdGVyYWJsZTxhbnk+PiBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgST4gPyB1bmtub3duIGV4dGVuZHMgSSA/IG5ldmVyIDogSSA6IG5ldmVyKVxuICB8IEV4dHJhY3RFdmVudHM8RXh0cmFjdDxTW251bWJlcl0sIHN0cmluZz4+XG4gIHwgKEV4dHJhY3Q8U1tudW1iZXJdLCBFbGVtZW50PiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudClcblxudHlwZSBNYXBwYWJsZUl0ZXJhYmxlPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+ID1cbiAgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gP1xuICAgIEEgJiBBc3luY0V4dHJhSXRlcmFibGU8VD4gJlxuICAgICg8Uj4obWFwcGVyOiAodmFsdWU6IEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyKSA9PiBSKSA9PiAoQXN5bmNFeHRyYUl0ZXJhYmxlPEF3YWl0ZWQ8Uj4+KSlcbiAgOiBuZXZlclxuXG4vLyBUaGUgZXh0ZW5kZWQgaXRlcmF0b3IgdGhhdCBzdXBwb3J0cyBhc3luYyBpdGVyYXRvciBtYXBwaW5nLCBjaGFpbmluZywgZXRjXG5leHBvcnQgdHlwZSBXaGVuUmV0dXJuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICBNYXBwYWJsZUl0ZXJhYmxlPFxuICAgIEFzeW5jRXh0cmFJdGVyYWJsZTxcbiAgICAgIFdoZW5JdGVyYXRlZFR5cGU8Uz4+PlxuXG50eXBlIEVtcHR5T2JqZWN0ID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgbmV2ZXI+XG5cbmludGVyZmFjZSBTcGVjaWFsV2hlbkV2ZW50cyB7XG4gIFwiQHN0YXJ0XCI6IEVtcHR5T2JqZWN0LCAgLy8gQWx3YXlzIGZpcmVzIHdoZW4gcmVmZXJlbmNlZFxuICBcIkByZWFkeVwiOiBFbXB0eU9iamVjdCAgIC8vIEZpcmVzIHdoZW4gYWxsIEVsZW1lbnQgc3BlY2lmaWVkIHNvdXJjZXMgYXJlIG1vdW50ZWQgaW4gdGhlIERPTVxufVxuXG5pbnRlcmZhY2UgV2hlbkV2ZW50cyBleHRlbmRzIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCwgU3BlY2lhbFdoZW5FdmVudHMge31cbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXJcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXJcblxuXG50eXBlIEV2ZW50QXR0cmlidXRlID0gYCR7a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwfWBcbi8vIE5vdGU6IHRoaXMgc2xvd3MgZG93biB0eXBlc2NyaXB0LiBTaW1wbHkgZGVmaW5pbmcgYENTU0lkZW50aWZpZXIgPSBzdHJpbmdgIGlzIHF1aWNrZXIsIGJ1dCBwcmV2ZW50cyB3aGVuIHZhbGlkYXRpbmcgc3ViLUlEU3Mgb3Igc2VsZWN0b3IgZm9ybWF0dGluZ1xudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfCBgIyR7SURTfT5gIHwgYC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz5cblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+ID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7Q1NTSWRlbnRpZmllcn1gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50cyA/IEV2ZW50TmFtZVVuaW9uPFM+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFM+XG4gIDogUyBleHRlbmRzIENTU0lkZW50aWZpZXIgPyAnY2hhbmdlJ1xuICA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dXG5cbi8qKiB3aGVuICoqL1xuaW50ZXJmYWNlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXJSZWY6IFdlYWtSZWY8RWxlbWVudD5cbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGw7XG4gIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbjtcbn1cblxuY29uc3QgZXZlbnRPYnNlcnZhdGlvbnMgPSBuZXcgV2Vha01hcDxEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIE1hcDxrZXlvZiBXaGVuRXZlbnRzLCBTZXQ8RXZlbnRPYnNlcnZhdGlvbjxrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+Pj4+KCk7XG5cbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+KHRoaXM6IERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKHRoaXMpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldCh0aGlzLCBuZXcgTWFwKCkpO1xuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldCh0aGlzKSEuZ2V0KGV2LnR5cGUgYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwKTtcbiAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgIGZvciAoY29uc3QgbyBvZiBvYnNlcnZhdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXJSZWYsIHNlbGVjdG9yLCBpbmNsdWRlQ2hpbGRyZW4gfSA9IG87XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGNvbnRhaW5lclJlZi5kZXJlZigpO1xuICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lcj8uaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZShvKTtcbiAgICAgICAgICB0ZXJtaW5hdGUobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChldi50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlcykge1xuICAgICAgICAgICAgICAgIGlmICgoaW5jbHVkZUNoaWxkcmVuID8gbi5jb250YWlucyhldi50YXJnZXQpIDogZXYudGFyZ2V0ID09PSBuKSAmJiBjb250YWluZXIuY29udGFpbnMobikpXG4gICAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoaW5jbHVkZUNoaWxkcmVuID8gY29udGFpbmVyLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IGNvbnRhaW5lciApXG4gICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUud2FybignZG9jRXZlbnRIYW5kbGVyJywgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NTU1NlbGVjdG9yKHM6IHN0cmluZyk6IHMgaXMgQ1NTSWRlbnRpZmllciB7XG4gIHJldHVybiBCb29sZWFuKHMgJiYgKHMuc3RhcnRzV2l0aCgnIycpIHx8IHMuc3RhcnRzV2l0aCgnLicpIHx8IChzLnN0YXJ0c1dpdGgoJ1snKSAmJiBzLmVuZHNXaXRoKCddJykpKSk7XG59XG5cbmZ1bmN0aW9uIGNoaWxkbGVzczxUIGV4dGVuZHMgc3RyaW5nIHwgbnVsbD4oc2VsOiBUKTogVCBleHRlbmRzIG51bGwgPyB7IGluY2x1ZGVDaGlsZHJlbjogdHJ1ZSwgc2VsZWN0b3I6IG51bGwgfSA6IHsgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuLCBzZWxlY3RvcjogVCB9IHtcbiAgY29uc3QgaW5jbHVkZUNoaWxkcmVuID0gIXNlbCB8fCAhc2VsLmVuZHNXaXRoKCc+JylcbiAgcmV0dXJuIHsgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3RvcjogaW5jbHVkZUNoaWxkcmVuID8gc2VsIDogc2VsLnNsaWNlKDAsLTEpIH0gYXMgYW55O1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtSZXR1cm5UeXBlPHR5cGVvZiBjaGlsZGxlc3M+LCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1swXSksXCJjaGFuZ2VcIl07XG4gICAgcmV0dXJuIFt7IGluY2x1ZGVDaGlsZHJlbjogdHJ1ZSwgc2VsZWN0b3I6IG51bGwgfSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXTtcbiAgfVxuICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKGlzQ1NTU2VsZWN0b3IocGFydHNbMV0pICYmICFpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1sxXSksIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6bmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIHdoZW5FdmVudDxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KGNvbnRhaW5lcjogRWxlbWVudCwgd2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KSB7XG4gIGNvbnN0IFt7IGluY2x1ZGVDaGlsZHJlbiwgc2VsZWN0b3J9LCBldmVudE5hbWVdID0gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkgPz8gZG9UaHJvdyhcIkludmFsaWQgV2hlblNlbGVjdG9yOiBcIit3aGF0KTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmhhcyhjb250YWluZXIub3duZXJEb2N1bWVudCkpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50LCBuZXcgTWFwKCkpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuaGFzKGV2ZW50TmFtZSkpIHtcbiAgICBjb250YWluZXIub3duZXJEb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZG9jRXZlbnRIYW5kbGVyLCB7XG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgIH0pO1xuICAgIGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLnNldChldmVudE5hbWUsIG5ldyBTZXQoKSk7XG4gIH1cblxuICBjb25zdCBvYnNlcnZhdGlvbnMgPSBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5nZXQoZXZlbnROYW1lKTtcbiAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBba2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXT4oKCkgPT4gb2JzZXJ2YXRpb25zIS5kZWxldGUoZGV0YWlscykpO1xuICBjb25zdCBkZXRhaWxzOiBFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gICAgcHVzaDogcXVldWUucHVzaCxcbiAgICB0ZXJtaW5hdGUoZXg6IEVycm9yKSB7IHF1ZXVlLnJldHVybj8uKGV4KX0sXG4gICAgY29udGFpbmVyUmVmOiBuZXcgV2Vha1JlZihjb250YWluZXIpLFxuICAgIGluY2x1ZGVDaGlsZHJlbixcbiAgICBzZWxlY3RvclxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBvYnNlcnZhdGlvbnMhLmFkZChkZXRhaWxzKSk7XG5cbiAgcmV0dXJuIHF1ZXVlLm11bHRpKCkgO1xufVxuXG5hc3luYyBmdW5jdGlvbiogZG9uZUltbWVkaWF0ZWx5PFo+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxaPiB7XG4gIHJldHVybiB1bmRlZmluZWQgYXMgWjtcbn1cblxuLyogU3ludGFjdGljIHN1Z2FyOiBjaGFpbkFzeW5jIGRlY29yYXRlcyB0aGUgc3BlY2lmaWVkIGl0ZXJhdG9yIHNvIGl0IGNhbiBiZSBtYXBwZWQgYnlcbiAgYSBmb2xsb3dpbmcgZnVuY3Rpb24sIG9yIHVzZWQgZGlyZWN0bHkgYXMgYW4gaXRlcmFibGUgKi9cbmZ1bmN0aW9uIGNoYWluQXN5bmM8QSBleHRlbmRzIEFzeW5jRXh0cmFJdGVyYWJsZTxYPiwgWD4oc3JjOiBBKTogTWFwcGFibGVJdGVyYWJsZTxBPiB7XG4gIGZ1bmN0aW9uIG1hcHBhYmxlQXN5bmNJdGVyYWJsZShtYXBwZXI6IFBhcmFtZXRlcnM8dHlwZW9mIHNyYy5tYXA+WzBdKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAobWFwcGVyKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGl0ZXJhYmxlSGVscGVycyhtYXBwYWJsZUFzeW5jSXRlcmFibGUgYXMgdW5rbm93biBhcyBBc3luY0l0ZXJhYmxlPEE+KSwge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHNyY1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKVxuICB9KSBhcyBNYXBwYWJsZUl0ZXJhYmxlPEE+O1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkV2hlblNlbGVjdG9yKHdoYXQ6IFdoZW5QYXJhbWV0ZXIpOiB3aGF0IGlzIFZhbGlkV2hlblNlbGVjdG9yIHtcbiAgaWYgKCF3aGF0KVxuICAgIHRocm93IG5ldyBFcnJvcignRmFsc3kgYXN5bmMgc291cmNlIHdpbGwgbmV2ZXIgYmUgcmVhZHlcXG5cXG4nICsgSlNPTi5zdHJpbmdpZnkod2hhdCkpO1xuICByZXR1cm4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnICYmIHdoYXRbMF0gIT09ICdAJyAmJiBCb29sZWFuKHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIG9uY2U8VD4ocDogUHJvbWlzZTxUPikge1xuICB5aWVsZCBwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hlbjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+KGNvbnRhaW5lcjogRWxlbWVudCwgLi4uc291cmNlczogUyk6IFdoZW5SZXR1cm48Uz4ge1xuICBpZiAoIXNvdXJjZXMgfHwgc291cmNlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2hhaW5Bc3luYyh3aGVuRXZlbnQoY29udGFpbmVyLCBcImNoYW5nZVwiKSkgYXMgdW5rbm93biBhcyBXaGVuUmV0dXJuPFM+O1xuICB9XG5cbiAgY29uc3QgaXRlcmF0b3JzID0gc291cmNlcy5maWx0ZXIod2hhdCA9PiB0eXBlb2Ygd2hhdCAhPT0gJ3N0cmluZycgfHwgd2hhdFswXSAhPT0gJ0AnKS5tYXAod2hhdCA9PiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZydcbiAgICA/IHdoZW5FdmVudChjb250YWluZXIsIHdoYXQpXG4gICAgOiB3aGF0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyB3aGVuRXZlbnQod2hhdCwgXCJjaGFuZ2VcIilcbiAgICAgIDogaXNQcm9taXNlTGlrZSh3aGF0KVxuICAgICAgICA/IG9uY2Uod2hhdClcbiAgICAgICAgOiB3aGF0KTtcblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHN0YXJ0JykpIHtcbiAgICBjb25zdCBzdGFydDogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPHt9PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06ICgpID0+IHN0YXJ0LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgc3RhcnQubmV4dCA9ICgpID0+IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZToge30gfSlcbiAgICAgIH1cbiAgICB9O1xuICAgIGl0ZXJhdG9ycy5wdXNoKHN0YXJ0KTtcbiAgfVxuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAcmVhZHknKSkge1xuICAgIGNvbnN0IHdhdGNoU2VsZWN0b3JzID0gc291cmNlcy5maWx0ZXIoaXNWYWxpZFdoZW5TZWxlY3RvcikubWFwKHdoYXQgPT4gcGFyc2VXaGVuU2VsZWN0b3Iod2hhdCk/LlswXSk7XG5cbiAgICBjb25zdCBpc01pc3NpbmcgPSAoc2VsOiBDU1NJZGVudGlmaWVyIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHNlbCBpcyBDU1NJZGVudGlmaWVyID0+IEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuXG4gICAgY29uc3QgbWlzc2luZyA9IHdhdGNoU2VsZWN0b3JzLm1hcCh3ID0+IHc/LnNlbGVjdG9yKS5maWx0ZXIoaXNNaXNzaW5nKTtcblxuICAgIGxldCBldmVudHM6IEFzeW5jSXRlcmF0b3I8YW55LCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgYWk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxhbnk+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGFpIH0sXG4gICAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAgIGlmIChldmVudHM/LnRocm93KSByZXR1cm4gZXZlbnRzLnRocm93KGV4KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICAgIH0sXG4gICAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy5yZXR1cm4pIHJldHVybiBldmVudHMucmV0dXJuKHYpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgICB9LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgaWYgKGV2ZW50cykgcmV0dXJuIGV2ZW50cy5uZXh0KCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBtaXNzaW5nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgICAgICAgOiBkb25lSW1tZWRpYXRlbHkoKTtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAoZG9uZUltbWVkaWF0ZWx5PFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGZ1bmN0aW9uIGNvbnRhaW5lcklzSW5ET00oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiBbLi4uci5yZW1vdmVkTm9kZXNdLnNvbWUociA9PiByID09PSBjb250YWluZXIgfHwgci5jb250YWlucyhjb250YWluZXIpKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbW92ZWQgZnJvbSBET01cIikpO1xuICAgICAgICB9XG4gICAgICB9KS5vYnNlcnZlKGNvbnRhaW5lci5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczpgKTtcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBcIlxcblwiICsgY29udGFpbmVyLm91dGVySFRNTCk7XG4gICAgICAgIC8vcmVqZWN0KG5ldyBFcnJvcihcIkVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzXCIpKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuXG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczogYCkgPz8gJz8/JztcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBtaXNzaW5nICsgXCJcXG5cIik7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKS50aGVuKCgpID0+IGFsbFNlbGVjdG9yc1ByZXNlbnQoc2VsZWN0b3JzKSlcbiAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcywgSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5pbXBvcnQgdHlwZSB7IFVuaXF1ZUlEIH0gZnJvbSBcIi4vYWktdWkuanNcIjtcblxuZXhwb3J0IHR5cGUgQ2hpbGRUYWdzID0gTm9kZSAvLyBUaGluZ3MgdGhhdCBhcmUgRE9NIG5vZGVzIChpbmNsdWRpbmcgZWxlbWVudHMpXG4gIHwgbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiAvLyBUaGluZ3MgdGhhdCBjYW4gYmUgY29udmVydGVkIHRvIHRleHQgbm9kZXMgdmlhIHRvU3RyaW5nXG4gIHwgdW5kZWZpbmVkIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIHwgdHlwZW9mIElnbm9yZSAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICAvLyBOQjogd2UgY2FuJ3QgY2hlY2sgdGhlIGNvbnRhaW5lZCB0eXBlIGF0IHJ1bnRpbWUsIHNvIHdlIGhhdmUgdG8gYmUgbGliZXJhbFxuICAvLyBhbmQgd2FpdCBmb3IgdGhlIGRlLWNvbnRhaW5tZW50IHRvIGZhaWwgaWYgaXQgdHVybnMgb3V0IHRvIG5vdCBiZSBhIGBDaGlsZFRhZ3NgXG4gIHwgQXN5bmNJdGVyYWJsZTxDaGlsZFRhZ3M+IHwgQXN5bmNJdGVyYXRvcjxDaGlsZFRhZ3M+IHwgUHJvbWlzZUxpa2U8Q2hpbGRUYWdzPiAvLyBUaGluZ3MgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW55IG9mIHRoZSBhYm92ZVxuICB8IEFycmF5PENoaWxkVGFncz5cbiAgfCBJdGVyYWJsZTxDaGlsZFRhZ3M+IC8vIEl0ZXJhYmxlIHRoaW5ncyB0aGF0IGhvbGQgdGhlIGFib3ZlLCBsaWtlIEFycmF5cywgSFRNTENvbGxlY3Rpb24sIE5vZGVMaXN0XG5cbi8qIFR5cGVzIHVzZWQgdG8gdmFsaWRhdGUgYW4gZXh0ZW5kZWQgdGFnIGRlY2xhcmF0aW9uICovXG5cbnR5cGUgRGVlcFBhcnRpYWw8WD4gPSBbWF0gZXh0ZW5kcyBbe31dID8geyBbSyBpbiBrZXlvZiBYXT86IERlZXBQYXJ0aWFsPFhbS10+IH0gOiBYXG50eXBlIE5ldmVyRW1wdHk8TyBleHRlbmRzIG9iamVjdD4gPSB7fSBleHRlbmRzIE8gPyBuZXZlciA6IE9cbnR5cGUgT21pdFR5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gbmV2ZXIgOiBLXTogVFtLXSB9XVtudW1iZXJdXG50eXBlIFBpY2tUeXBlPFQsIFY+ID0gW3sgW0sgaW4ga2V5b2YgVCBhcyBUW0tdIGV4dGVuZHMgViA/IEsgOiBuZXZlcl06IFRbS10gfV1bbnVtYmVyXVxuXG4vLyBGb3IgaW5mb3JtYXRpdmUgcHVycG9zZXMgLSB1bnVzZWQgaW4gcHJhY3RpY2VcbmludGVyZmFjZSBfTm90X0RlY2xhcmVkXyB7IH1cbmludGVyZmFjZSBfTm90X0FycmF5XyB7IH1cbnR5cGUgRXhjZXNzS2V5czxBLCBCPiA9XG4gIEEgZXh0ZW5kcyBhbnlbXVxuICA/IEIgZXh0ZW5kcyBhbnlbXVxuICA/IEV4Y2Vzc0tleXM8QVtudW1iZXJdLCBCW251bWJlcl0+XG4gIDogX05vdF9BcnJheV9cbiAgOiBCIGV4dGVuZHMgYW55W11cbiAgPyBfTm90X0FycmF5X1xuICA6IE5ldmVyRW1wdHk8T21pdFR5cGU8e1xuICAgIFtLIGluIGtleW9mIEFdOiBLIGV4dGVuZHMga2V5b2YgQlxuICAgID8gQVtLXSBleHRlbmRzIChCW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBCW0tdIDogRGVlcFBhcnRpYWw8QltLXT4pXG4gICAgPyBuZXZlciA6IEJbS11cbiAgICA6IF9Ob3RfRGVjbGFyZWRfXG4gIH0sIG5ldmVyPj5cblxudHlwZSBPdmVybGFwcGluZ0tleXM8QSxCPiA9IEIgZXh0ZW5kcyBuZXZlciA/IG5ldmVyXG4gIDogQSBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBrZXlvZiBBICYga2V5b2YgQlxuXG50eXBlIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXMsIFJlc3VsdCA9IG5ldmVyPlxuICA9IChPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PlxuICApIGV4dGVuZHMgbmV2ZXJcbiAgPyBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7ICdgb3ZlcnJpZGVgIGhhcyBwcm9wZXJ0aWVzIG5vdCBpbiB0aGUgYmFzZSB0YWcgb3Igb2YgdGhlIHdyb25nIHR5cGUsIGFuZCBzaG91bGQgbWF0Y2gnOiBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gfVxuICA6IE9taXRUeXBlPHtcbiAgICAnYGRlY2xhcmVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgb3ZlcnJpZGVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT4sXG4gICAgJ2BvdmVycmlkZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgfSwgbmV2ZXI+XG5cbi8qIFR5cGVzIHRoYXQgZm9ybSB0aGUgZGVzY3JpcHRpb24gb2YgYW4gZXh0ZW5kZWQgdGFnICovXG5cbmV4cG9ydCB0eXBlIE92ZXJyaWRlcyA9IHtcbiAgLyogVmFsdWVzIGZvciBwcm9wZXJ0aWVzIHRoYXQgYWxyZWFkeSBleGlzdCBpbiBhbnkgYmFzZSBhIHRhZyBpcyBleHRlbmRlZCBmcm9tICovXG4gIG92ZXJyaWRlPzogb2JqZWN0O1xuICAvKiBEZWNsYXJhdGlvbiBhbmQgZGVmYXVsdCB2YWx1ZXMgZm9yIG5ldyBwcm9wZXJ0aWVzIGluIHRoaXMgdGFnIGRlZmluaXRpb24uICovXG4gIGRlY2xhcmU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlZXMgZm9yIG5vdyBwcm9wZXJ0aWVzIHRoYXQgYXJlIGJveGVkIGJ5IGRlZmluZUl0ZXJhYmxlUHJvcGVydGllcyAqL1xuICBpdGVyYWJsZT86IHsgW2s6IHN0cmluZ106IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9O1xuICAvKiBTcGVjaWZpY2F0aW9uIG9mIHRoZSB0eXBlcyBvZiBlbGVtZW50cyBieSBJRCB0aGF0IGFyZSBjb250YWluZWQgYnkgdGhpcyB0YWcgKi9cbiAgaWRzPzogeyBbaWQ6IHN0cmluZ106IFRhZ0NyZWF0b3JGdW5jdGlvbjxhbnk+OyB9O1xuICAvKiBTdGF0aWMgQ1NTIHJlZmVyZW5jZWQgYnkgdGhpcyB0YWcgKi9cbiAgc3R5bGVzPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVGFnQ3JlYXRvckZvcklEUzxJIGV4dGVuZHMgTm9uTnVsbGFibGU8T3ZlcnJpZGVzWydpZHMnXT4+IHtcbiAgPGNvbnN0IEsgZXh0ZW5kcyBrZXlvZiBJPihcbiAgICBhdHRyczp7IGlkOiBLIH0gJiBFeGNsdWRlPFBhcmFtZXRlcnM8SVtLXT5bMF0sIENoaWxkVGFncz4sXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdXG4gICk6IFJldHVyblR5cGU8SVtLXT5cbn1cblxudHlwZSBJRFM8SSBleHRlbmRzIE92ZXJyaWRlc1snaWRzJ10+ID0gSSBleHRlbmRzIE5vbk51bGxhYmxlPE92ZXJyaWRlc1snaWRzJ10+ID8ge1xuICBpZHM6IHtcbiAgICBbSiBpbiBrZXlvZiBJXTogUmV0dXJuVHlwZTxJW0pdPjtcbiAgfSAmIFRhZ0NyZWF0b3JGb3JJRFM8ST5cbn0gOiB7IGlkczoge30gfVxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RlZCA9IHtcbiAgY29uc3RydWN0ZWQ6ICgpID0+IChDaGlsZFRhZ3MgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZCB8IENoaWxkVGFncz4pO1xufVxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBhdHRyaWJ1dGVzIGZyb20gYW4gRXhUYWdDcmVhdG9yXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXR0cmlidXRlczxUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gVCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBCYXNlQXR0cnM+XG4gID8gQmFzZUF0dHJzXG4gIDogbmV2ZXJcblxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgaXRlcmFibGUgYXR0cmlidXRlcyBmcm9tIHRoZSBfYW5jZXN0b3JzXyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQmFzZUl0ZXJhYmxlczxCYXNlPiA9XG4gIEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgX0Jhc2UsIGluZmVyIFN1cGVyLCBpbmZlciBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMsIGluZmVyIF9TdGF0aWNzPlxuICA/IEJhc2VJdGVyYWJsZXM8U3VwZXI+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXSBleHRlbmRzIG9iamVjdFxuICAgICAgPyBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgICAgIDoge31cbiAgICA6IEJhc2VJdGVyYWJsZXM8U3VwZXI+ICYgU3VwZXJEZWZzWydpdGVyYWJsZSddXG4gIDogbmV2ZXJcblxuLy8gV29yayBvdXQgdGhlIHR5cGVzIG9mIGFsbCB0aGUgbm9uLWl0ZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gRXhUYWdDcmVhdG9yXG50eXBlIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEQgZXh0ZW5kcyBPdmVycmlkZXMsIEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPVxuICBEWydkZWNsYXJlJ11cbiAgJiBEWydvdmVycmlkZSddXG4gICYgSURTPERbJ2lkcyddPlxuICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIERbJ2l0ZXJhYmxlJ10+XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9IEJhc2VJdGVyYWJsZXM8QmFzZT4gJiBEWydpdGVyYWJsZSddXG5cbmV4cG9ydCBjb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3RvckNhbGxTdGFjayBleHRlbmRzIFRhZ0NyZWF0aW9uT3B0aW9ucyB7XG4gIFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW107XG4gIFtrOiBzdHJpbmddOiB1bmtub3duXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kVGFnRnVuY3Rpb24geyAoYXR0cnM6IENvbnN0cnVjdG9yQ2FsbFN0YWNrIHwgQ2hpbGRUYWdzLCAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBFbGVtZW50IH1cblxuaW50ZXJmYWNlIEluc3RhbmNlVW5pcXVlSUQgeyBbVW5pcXVlSURdOiBzdHJpbmcgfVxuZXhwb3J0IHR5cGUgSW5zdGFuY2U8VCA9IEluc3RhbmNlVW5pcXVlSUQ+ID0gSW5zdGFuY2VVbmlxdWVJRCAmIFRcblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlIGV4dGVuZHMgRXh0ZW5kVGFnRnVuY3Rpb24ge1xuICBzdXBlcjogVGFnQ3JlYXRvcjxFbGVtZW50PjtcbiAgZGVmaW5pdGlvbjogT3ZlcnJpZGVzO1xuICB2YWx1ZU9mOiAoKSA9PiBzdHJpbmc7XG4gIGV4dGVuZGVkOiAodGhpczogVGFnQ3JlYXRvcjxFbGVtZW50PiwgX292ZXJyaWRlczogT3ZlcnJpZGVzIHwgKChpbnN0YW5jZT86IEluc3RhbmNlKSA9PiBPdmVycmlkZXMpKSA9PiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xufVxuXG5pbnRlcmZhY2UgVGFnQ29uc3R1Y3RvciB7XG4gIGNvbnN0cnVjdG9yOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlO1xufVxuXG50eXBlIENvbWJpbmVkVGhpc1R5cGU8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9XG4gIFRhZ0NvbnN0dWN0b3IgJlxuICBSZWFkV3JpdGVBdHRyaWJ1dGVzPFxuICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxELCBCYXNlPj5cbiAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+LFxuICAgIERbJ2RlY2xhcmUnXVxuICAgICYgRFsnb3ZlcnJpZGUnXVxuICAgICYgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT5cbiAgICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+PlxuICA+XG5cbnR5cGUgU3RhdGljUmVmZXJlbmNlczxEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9IFBpY2tUeXBlPFxuICBEZWZpbml0aW9uc1snZGVjbGFyZSddXG4gICYgRGVmaW5pdGlvbnNbJ292ZXJyaWRlJ11cbiAgJiBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPixcbiAgYW55XG4+XG5cbi8vIGB0aGlzYCBpbiB0aGlzLmV4dGVuZGVkKC4uLikgaXMgQmFzZUNyZWF0b3JcbmludGVyZmFjZSBFeHRlbmRlZFRhZyB7XG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9LFxuICAgIFRhZ0luc3RhbmNlIGV4dGVuZHMgSW5zdGFuY2VVbmlxdWVJRCA9IEluc3RhbmNlVW5pcXVlSURcbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogKGluc3Q6VGFnSW5zdGFuY2UpID0+IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj5cbiAgICAgID5cbiAgICA+XG4gID5cblxuICA8XG4gICAgQmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PixcbiAgICBTdXBwbGllZERlZmluaXRpb25zLFxuICAgIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID0gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgOiB7fVxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+PlxuICAgICAgICAmIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+XG4gICAgICA+XG4gICAgPlxuICA+XG59XG5cbnR5cGUgQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLCBSZXN1bHQ+ID1cbiAgU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIHsgY29uc3RydWN0ZWQ6IGFueSB9XG4gID8gU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIENvbnN0cnVjdGVkXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgXCJjb25zdHJ1Y3RlZGAgZG9lcyBub3QgcmV0dXJuIENoaWxkVGFnc1wiOiBTdXBwbGllZERlZmluaXRpb25zWydjb25zdHJ1Y3RlZCddIH1cbiAgOiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgXCJUaGUgZXh0ZW5kZWQgdGFnIGRlZmludGlvbiBjb250YWlucyB1bmtub3duIG9yIGluY29ycmVjdGx5IHR5cGVkIGtleXNcIjoga2V5b2YgRXhjZXNzS2V5czxTdXBwbGllZERlZmluaXRpb25zLCBPdmVycmlkZXMgJiBDb25zdHJ1Y3RlZD4gfVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0NyZWF0aW9uT3B0aW9ucyB7XG4gIGRlYnVnZ2VyPzogYm9vbGVhblxufVxuXG50eXBlIFJlVHlwZWRFdmVudEhhbmRsZXJzPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogSyBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNcbiAgICA/IEV4Y2x1ZGU8R2xvYmFsRXZlbnRIYW5kbGVyc1tLXSwgbnVsbD4gZXh0ZW5kcyAoZTogaW5mZXIgRSk9PmluZmVyIFJcbiAgICAgID8gKChlOiBFKT0+UikgfCBudWxsXG4gICAgICA6IFRbS11cbiAgICA6IFRbS11cbn1cblxudHlwZSBBc3luY0F0dHI8WD4gPSBBc3luY1Byb3ZpZGVyPFg+IHwgUHJvbWlzZUxpa2U8QXN5bmNQcm92aWRlcjxYPiB8IFg+XG50eXBlIFBvc3NpYmx5QXN5bmM8WD4gPSBbWF0gZXh0ZW5kcyBbb2JqZWN0XSAvKiBOb3QgXCJuYWtlZFwiIHRvIHByZXZlbnQgdW5pb24gZGlzdHJpYnV0aW9uICovXG4gID8gWCBleHRlbmRzIEFzeW5jUHJvdmlkZXI8aW5mZXIgVT5cbiAgICA/IFggZXh0ZW5kcyAoQXN5bmNQcm92aWRlcjxVPiAmIFUpXG4gICAgICA/IFUgfCBBc3luY0F0dHI8VT4gLy8gaXRlcmFibGUgcHJvcGVydHlcbiAgICAgIDogWCB8IFByb21pc2VMaWtlPFg+IC8vIHNvbWUgb3RoZXIgQXN5bmNQcm92aWRlclxuICAgIDogWCBleHRlbmRzIChhbnlbXSB8IEZ1bmN0aW9uKVxuICAgICAgPyBYIHwgQXN5bmNBdHRyPFg+ICAvLyBBcnJheSBvciBGdW5jdGlvbiwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGFzeW5jXG4gICAgICA6IHsgW0sgaW4ga2V5b2YgWF0/OiBQb3NzaWJseUFzeW5jPFhbS10+IH0gfCBQYXJ0aWFsPFg+IHwgQXN5bmNBdHRyPFBhcnRpYWw8WD4+IC8vIE90aGVyIG9iamVjdCAtIHBhcnRpYWxseSwgcG9zc2libGUgYXN5bmNcbiAgOiBYIHwgQXN5bmNBdHRyPFg+IC8vIFNvbWV0aGluZyBlbHNlIChudW1iZXIsIGV0YyksIHdoaWNoIGNhbiBiZSBwcm92aWRlZCBhc3luY1xuXG50eXBlIFJlYWRXcml0ZUF0dHJpYnV0ZXM8RSwgQmFzZSA9IEU+ID0gRSBleHRlbmRzIHsgYXR0cmlidXRlczogYW55IH1cbiAgPyAoT21pdDxFLCAnYXR0cmlidXRlcyc+ICYge1xuICAgIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcDtcbiAgICBzZXQgYXR0cmlidXRlcyh2OiBQb3NzaWJseUFzeW5jPE9taXQ8QmFzZSwnYXR0cmlidXRlcyc+Pik7XG4gIH0pXG4gIDogKE9taXQ8RSwgJ2F0dHJpYnV0ZXMnPilcblxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckFyZ3M8QT4gPSBbXSB8IFtBICYgVGFnQ3JlYXRpb25PcHRpb25zXSB8IFtBICYgVGFnQ3JlYXRpb25PcHRpb25zLCAuLi5DaGlsZFRhZ3NbXV0gfCBDaGlsZFRhZ3NbXVxuLyogQSBUYWdDcmVhdG9yIGlzIGEgZnVuY3Rpb24gdGhhdCBvcHRpb25hbGx5IHRha2VzIGF0dHJpYnV0ZXMgJiBjaGlsZHJlbiwgYW5kIGNyZWF0ZXMgdGhlIHRhZ3MuXG4gIFRoZSBhdHRyaWJ1dGVzIGFyZSBQb3NzaWJseUFzeW5jLiBUaGUgcmV0dXJuIGhhcyBgY29uc3RydWN0b3JgIHNldCB0byB0aGlzIGZ1bmN0aW9uIChzaW5jZSBpdCBpbnN0YW50aWF0ZWQgaXQpXG4qL1xuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckZ1bmN0aW9uPEJhc2UgZXh0ZW5kcyBvYmplY3Q+ID0gKC4uLmFyZ3M6IFRhZ0NyZWF0b3JBcmdzPFBvc3NpYmx5QXN5bmM8QmFzZT4gJiBUaGlzVHlwZTxCYXNlPj4pID0+IFJlYWRXcml0ZUF0dHJpYnV0ZXM8QmFzZT5cblxuLyogQSBUYWdDcmVhdG9yIGlzIFRhZ0NyZWF0b3JGdW5jdGlvbiBkZWNvcmF0ZWQgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMuIFRoZSBTdXBlciAmIFN0YXRpY3MgYXJncyBhcmUgb25seVxuZXZlciBzcGVjaWZpZWQgYnkgRXh0ZW5kZWRUYWcgKGludGVybmFsbHkpLCBhbmQgc28gaXMgbm90IGV4cG9ydGVkICovXG50eXBlIEV4VGFnQ3JlYXRvcjxCYXNlIGV4dGVuZHMgb2JqZWN0LFxuICBTdXBlciBleHRlbmRzICh1bmtub3duIHwgRXhUYWdDcmVhdG9yPGFueT4pID0gdW5rbm93bixcbiAgU3VwZXJEZWZzIGV4dGVuZHMgT3ZlcnJpZGVzID0ge30sXG4gIFN0YXRpY3MgPSB7fSxcbj4gPSBUYWdDcmVhdG9yRnVuY3Rpb248UmVUeXBlZEV2ZW50SGFuZGxlcnM8QmFzZT4+ICYge1xuICAvKiBJdCBjYW4gYWxzbyBiZSBleHRlbmRlZCAqL1xuICBleHRlbmRlZDogRXh0ZW5kZWRUYWdcbiAgLyogSXQgaXMgYmFzZWQgb24gYSBcInN1cGVyXCIgVGFnQ3JlYXRvciAqL1xuICBzdXBlcjogU3VwZXJcbiAgLyogSXQgaGFzIGEgZnVuY3Rpb24gdGhhdCBleHBvc2VzIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSB0YWdzIGl0IGNyZWF0ZXMgYW5kIGl0cyBzdXBlciAqL1xuICBkZWZpbml0aW9uPzogT3ZlcnJpZGVzICYgSW5zdGFuY2VVbmlxdWVJRDsgLyogQ29udGFpbnMgdGhlIGRlZmluaXRpb25zICYgVW5pcXVlSUQgZm9yIGFuIGV4dGVuZGVkIHRhZy4gdW5kZWZpbmVkIGZvciBiYXNlIHRhZ3MgKi9cbiAgLyogSXQgaGFzIGEgbmFtZSAoc2V0IHRvIGEgY2xhc3Mgb3IgZGVmaW5pdGlvbiBsb2NhdGlvbiksIHdoaWNoIGlzIGhlbHBmdWwgd2hlbiBkZWJ1Z2dpbmcgKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAvKiBDYW4gdGVzdCBpZiBhbiBlbGVtZW50IHdhcyBjcmVhdGVkIGJ5IHRoaXMgZnVuY3Rpb24gb3IgYSBiYXNlIHRhZyBmdW5jdGlvbiAqL1xuICBbU3ltYm9sLmhhc0luc3RhbmNlXShlbHQ6IGFueSk6IGJvb2xlYW47XG59ICYgSW5zdGFuY2VVbmlxdWVJRCAmXG4vLyBgU3RhdGljc2AgaGVyZSBpcyB0aGF0IHNhbWUgYXMgU3RhdGljUmVmZXJlbmNlczxTdXBlciwgU3VwZXJEZWZzPiwgYnV0IHRoZSBjaXJjdWxhciByZWZlcmVuY2UgYnJlYWtzIFRTXG4vLyBzbyB3ZSBjb21wdXRlIHRoZSBTdGF0aWNzIG91dHNpZGUgdGhpcyB0eXBlIGRlY2xhcmF0aW9uIGFzIHBhc3MgdGhlbSBhcyBhIHJlc3VsdFxuU3RhdGljc1xuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3Q+ID0gRXhUYWdDcmVhdG9yPEJhc2UsIG5ldmVyLCBuZXZlciwge30+XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQ08sTUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFFBQVEsV0FBVyxPQUFPLE1BQU0sbUJBQW1CLENBQUMsS0FBSztBQUU5SCxNQUFNLGNBQWM7QUFFM0IsTUFBTSxXQUFXO0FBQUEsSUFDZixPQUFPLE1BQVc7QUFDaEIs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QUFDaEIsZUFBSyxLQUFLLFVBQVU7QUFFcEIsZ0JBQU0sYUFBYSxTQUFTLElBQUksSUFBSTtBQUNwQyxjQUFJLFlBQVk7QUFDZCxxQkFBUyxPQUFPLElBQUk7QUFDcEIsdUJBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxZQUFZLFFBQVEsRUFBRyxLQUFJO0FBQUUsZ0JBQUUsS0FBSyxJQUFJO0FBQUEsWUFBRSxTQUFTLElBQUk7QUFDN0UsdUJBQVEsS0FBSywyQ0FBMkMsTUFBTSxHQUFHLFFBQVEsSUFBSSxDQUFDO0FBQUEsWUFDaEY7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGdCQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFlBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxhQUFhO0FBQzNDLGVBQUssRUFBRSxZQUFZO0FBQUEsTUFDdkIsQ0FBQztBQUFBLElBQ0gsQ0FBQyxFQUFFLFFBQVEsTUFBTSxFQUFFLFNBQVMsTUFBTSxXQUFXLEtBQUssQ0FBQztBQUVuRCxXQUFPO0FBQUEsTUFDTCxJQUFJLEdBQVE7QUFBRSxlQUFPLFFBQVEsSUFBSSxDQUFDO0FBQUEsTUFBRTtBQUFBLE1BQ3BDLElBQUksR0FBUTtBQUFFLGVBQU8sUUFBUSxJQUFJLENBQUM7QUFBQSxNQUFFO0FBQUEsTUFDcEMsa0JBQWtCLEdBQVMsTUFBYztBQUN2QyxlQUFPLFNBQVMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJO0FBQUEsTUFDbEM7QUFBQSxNQUNBLFVBQVUsR0FBVyxNQUF1QixTQUE4QjtBQUN4RSxZQUFJLFNBQVM7QUFDWCxZQUFFLFFBQVEsQ0FBQUMsT0FBSztBQUNiLGtCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQyxLQUFLLG9CQUFJLElBQStCO0FBQ2xFLHFCQUFTLElBQUlBLElBQUdDLElBQUc7QUFDbkIsWUFBQUEsS0FBSSxJQUFJLE1BQU0sT0FBTztBQUFBLFVBQ3ZCLENBQUM7QUFBQSxRQUNILE9BQ0s7QUFDSCxZQUFFLFFBQVEsQ0FBQUQsT0FBSztBQUNiLGtCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQztBQUMxQixnQkFBSUMsTUFBSztBQUNQLGNBQUFBLEtBQUksT0FBTyxJQUFJO0FBQ2Ysa0JBQUksQ0FBQ0EsS0FBSTtBQUNQLHlCQUFTLE9BQU9ELEVBQUM7QUFBQSxZQUNyQjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAibWVyZ2VkIiwgInIiLCAiaWQiLCAiRHlhbWljRWxlbWVudEVycm9yIiwgInVuaXF1ZSIsICJuIiwgImNoaWxkcmVuIiwgImUiLCAibWFwIl0KfQo=
