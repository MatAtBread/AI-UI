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
            (p) => p.done ? (prev = Ignore, resolve(p)) : resolveSync(
              fn(p.value, prev),
              (f) => f === Ignore ? step(resolve, reject) : resolve({ done: false, value: prev = f }),
              (ex) => {
                prev = Ignore;
                ai.throw ? ai.throw(ex) : ai.return?.(ex);
                reject({ done: true, value: ex });
              }
            ),
            (ex) => {
              prev = Ignore;
              reject({ done: true, value: ex });
            }
          ).catch((ex) => {
            prev = Ignore;
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
      if (it?.done) {
        current = null;
      } else {
        current = deferred();
        ai.next().then(step).catch((error) => {
          current.reject({ done: true, value: error });
          current = null;
        });
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
    const queue = queueIteratableIterator(() => eventObservations.get(container.ownerDocument)?.get(eventName)?.delete(details));
    const details = {
      push: queue.push,
      terminate(ex) {
        queue.return?.(ex);
      },
      containerRef: new WeakRef(container),
      includeChildren,
      selector
    };
    containerAndSelectorsMounted(container, selector ? [selector] : void 0).then((_) => eventObservations.get(container.ownerDocument)?.get(eventName).add(details));
    return queue.multi();
  }
  async function* doneImmediately() {
    _console.log("doneImmediately");
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
      let isMissing2 = function(sel) {
        return Boolean(typeof sel === "string" && !container.querySelector(sel));
      };
      var isMissing = isMissing2;
      const watchSelectors = sources.filter(isValidWhenSelector).map((what) => parseWhenSelector(what)?.[0]);
      const missing = watchSelectors.map((w) => w?.selector).filter(isMissing2);
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
            const merged2 = iterators.length > 1 ? merge(...iterators) : iterators.length === 1 ? iterators[0] : void 0;
            events = merged2?.[Symbol.asyncIterator]();
            if (!events)
              return { done: true, value: void 0 };
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
    function elementIsInDOM() {
      if (container.isConnected)
        return Promise.resolve();
      let reject;
      const promise = new Promise((resolve, _reject) => {
        reject = _reject;
        return new MutationObserver((records, mutation) => {
          if (records.some((r) => r.addedNodes?.length)) {
            if (container.isConnected) {
              mutation.disconnect();
              resolve();
            }
          }
          if (records.some((r) => [...r.removedNodes].includes(container))) {
            mutation.disconnect();
            _reject(new Error("Removed from DOM"));
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
      return elementIsInDOM().then(() => allSelectorsPresent(selectors));
    return elementIsInDOM();
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
    const aiuiExtendedTagStyles = thisDoc.createElement("STYLE");
    aiuiExtendedTagStyles.id = "--ai-ui-extended-tag-styles-" + Date.now();
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
            (r) => {
              const idx = appended.indexOf(g);
              if (idx < 0) {
                _console.warn("Replacement node not in array of appended nodes! This shouldn't be possible.");
                if (DEBUG) debugger;
              }
              const replacement = nodes(r);
              removedNodes.add(appended[idx]);
              appended.splice(idx, 1, ...replacement);
              g.replaceWith(...replacement);
            },
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
          const initialNodes = unboxed === void 0 || unboxed === c2 ? [] : nodes(unboxed);
          let replacementNodes = initialNodes.length ? initialNodes : [DomPromiseContainer()];
          appended.push(...replacementNodes);
          const setReplacementNodes = (nodes2) => {
            const indices = replacementNodes.map((n) => appended.indexOf(n)).sort((a, b) => b - a);
            if (indices[indices.length - 1] < 0) {
              _console.warn("Replacement node not in array of appended nodes! This shouldn't be possible.");
              if (DEBUG) {
                debugger;
              }
            }
            indices.forEach((i) => {
              if (i >= 0) {
                removedNodes.add(appended[i]);
                appended.splice(i, 1);
              }
            });
            if (nodes2) {
              if (nodes2.length === 0) nodes2 = [DomPromiseContainer()];
              appended.splice(Math.min(...indices), 0, ...nodes2);
            }
            replacementNodes = nodes2 || [];
          };
          let notYetMounted = true;
          let createdAt = Date.now() + timeOutWarn;
          const createdBy = DEBUG && new Error("Created by").stack;
          const step = () => ap.next().then((es) => {
            if (!es.done) {
              const mounted = replacementNodes.filter((e) => e?.parentNode && e.isConnected);
              const n = notYetMounted ? replacementNodes : mounted;
              if (notYetMounted && mounted.length) notYetMounted = false;
              if (!n.length || replacementNodes.every((e) => removedNodes.has(e))) {
                setReplacementNodes(null);
                const msg = "Element(s) have been removed from the document: " + insertionStack;
                ap.return?.(new Error(msg));
                return;
              }
              if (DEBUG && notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                _console.warn(`Async element not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.`, createdBy, replacementNodes.map(logNode));
              }
              setReplacementNodes(nodes(unbox(es.value)));
              n[0].replaceWith(...replacementNodes);
              n.forEach((e) => !replacementNodes.includes(e) && e.parentNode?.removeChild(e));
              step();
            }
          }).catch((errorValue) => {
            const n = replacementNodes.filter((n2) => Boolean(n2?.parentNode));
            if (n.length) {
              setReplacementNodes([DyamicElementError({ error: errorValue })]);
              n[0].replaceWith(...replacementNodes);
              n.slice(1).forEach((e) => e?.parentNode.removeChild(e));
            } else _console.warn("Can't report error", errorValue, createdBy, replacementNodes.map(logNode));
            setReplacementNodes(null);
            ap.return?.(errorValue);
          });
          step();
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
                if (removedNodes.has(base) || !notYetMounted && !mounted) {
                  _console.info(`Element does not exist in document when setting async attribute '${k}' to:
${logNode(base)}`);
                  ap.return?.();
                  return;
                }
                if (mounted) notYetMounted = false;
                if (notYetMounted && createdAt && createdAt < Date.now()) {
                  createdAt = Number.MAX_SAFE_INTEGER;
                  _console.warn(`Element with async attribute '${k}' not mounted after ${timeOutWarn / 1e3} seconds. If it is never mounted, it will leak.
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
              _console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${base instanceof Node ? logNode(base) : base}`);
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
        aiuiExtendedTagStyles.appendChild(thisDoc.createTextNode(staticExtensions.styles + "\n"));
        if (!thisDoc.head.contains(aiuiExtendedTagStyles)) {
          thisDoc.head.appendChild(aiuiExtendedTagStyles);
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
    return tracked;
  }
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuIH0gZnJvbSAnLi93aGVuLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2hpbGRUYWdzLCBJbnN0YW5jZSwgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi90YWdzLmpzJ1xuZXhwb3J0ICogYXMgSXRlcmF0b3JzIGZyb20gJy4vaXRlcmF0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IFVuaXF1ZUlEID0gU3ltYm9sKFwiVW5pcXVlIElEXCIpO1xuXG5jb25zdCBsb2dOb2RlID0gREVCVUcgPyAoKG46IE5vZGUpID0+IGBcIiR7J2lubmVySFRNTCcgaW4gbiA/IG4uaW5uZXJIVE1MIDogbi50ZXh0Q29udGVudH1cImApIDogKG46IE5vZGUpID0+IHVuZGVmaW5lZDtcblxuLyogQSBob2xkZXIgZm9yIGNvbW1vblByb3BlcnRpZXMgc3BlY2lmaWVkIHdoZW4gYHRhZyguLi5wKWAgaXMgaW52b2tlZCwgd2hpY2ggYXJlIGFsd2F5c1xuICBhcHBsaWVkIChtaXhlZCBpbikgd2hlbiBhbiBlbGVtZW50IGlzIGNyZWF0ZWQgKi9cbnR5cGUgVGFnRnVuY3Rpb25PcHRpb25zPE90aGVyTWVtYmVycyBleHRlbmRzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT4gPSB7fT4gPSB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnNcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICAvKiogQGRlcHJlY2F0ZWQgLSBsZWdhY3kgc3VwcG9ydCAqL1xuICBlbmFibGVPblJlbW92ZWRGcm9tRE9NPzogYm9vbGVhblxufVxuXG4vKiBNZW1iZXJzIGFwcGxpZWQgdG8gRVZFUlkgdGFnIGNyZWF0ZWQsIGV2ZW4gYmFzZSB0YWdzICovXG5pbnRlcmZhY2UgUG9FbGVtZW50TWV0aG9kcyB7XG4gIGdldCBpZHMoKToge31cbiAgd2hlbjxUIGV4dGVuZHMgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMsIFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVyczxFeGNsdWRlPGtleW9mIFRbJ2lkcyddLCBudW1iZXIgfCBzeW1ib2w+Pj4odGhpczogVCwgLi4ud2hhdDogUyk6IFdoZW5SZXR1cm48Uz47XG4gIC8vIFRoaXMgaXMgYSB2ZXJ5IGluY29tcGxldGUgdHlwZS4gSW4gcHJhY3RpY2UsIHNldChhdHRycykgcmVxdWlyZXMgYSBkZWVwbHkgcGFydGlhbCBzZXQgb2ZcbiAgLy8gYXR0cmlidXRlcywgaW4gZXhhY3RseSB0aGUgc2FtZSB3YXkgYXMgYSBUYWdGdW5jdGlvbidzIGZpcnN0IG9iamVjdCBwYXJhbWV0ZXJcbiAgc2V0IGF0dHJpYnV0ZXMoYXR0cnM6IG9iamVjdCk7XG4gIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcFxufVxuXG4vLyBTdXBwb3J0IGZvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9odG0gKG9yIGltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9odG0vZGlzdC9odG0ubW9kdWxlLmpzJylcbi8vIE5vdGU6IHNhbWUgc2lnbmF0dXJlIGFzIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWxlbWVudCB7XG4gIC8vIFN1cHBvcnQgZm9yIGh0bSwgSlNYLCBldGNcbiAgY3JlYXRlRWxlbWVudChcbiAgICAvLyBcIm5hbWVcIiBjYW4gYSBIVE1MIHRhZyBzdHJpbmcsIGFuIGV4aXN0aW5nIG5vZGUgKGp1c3QgcmV0dXJucyBpdHNlbGYpLCBvciBhIHRhZyBmdW5jdGlvblxuICAgIG5hbWU6IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgLy8gVGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBpbml0aWFsaXNlIHRoZSBub2RlIChpZiBhIHN0cmluZyBvciBmdW5jdGlvbiAtIGlnbm9yZSBpZiBpdCdzIGFscmVhZHkgYSBub2RlKVxuICAgIGF0dHJzOiBhbnksXG4gICAgLy8gVGhlIGNoaWxkcmVuXG4gICAgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKTogTm9kZTtcbn1cblxuLyogVGhlIGludGVyZmFjZSB0aGF0IGNyZWF0ZXMgYSBzZXQgb2YgVGFnQ3JlYXRvcnMgZm9yIHRoZSBzcGVjaWZpZWQgRE9NIHRhZ3MgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnTG9hZGVyIHtcbiAgbm9kZXMoLi4uYzogQ2hpbGRUYWdzW10pOiAoTm9kZSB8ICgvKlAgJiovIChFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcykpKVtdO1xuICBVbmlxdWVJRDogdHlwZW9mIFVuaXF1ZUlEXG5cbiAgLypcbiAgIFNpZ25hdHVyZXMgZm9yIHRoZSB0YWcgbG9hZGVyLiBBbGwgcGFyYW1zIGFyZSBvcHRpb25hbCBpbiBhbnkgY29tYmluYXRpb24sXG4gICBidXQgbXVzdCBiZSBpbiBvcmRlcjpcbiAgICAgIHRhZyhcbiAgICAgICAgICA/bmFtZVNwYWNlPzogc3RyaW5nLCAgLy8gYWJzZW50IG5hbWVTcGFjZSBpbXBsaWVzIEhUTUxcbiAgICAgICAgICA/dGFncz86IHN0cmluZ1tdLCAgICAgLy8gYWJzZW50IHRhZ3MgZGVmYXVsdHMgdG8gYWxsIGNvbW1vbiBIVE1MIHRhZ3NcbiAgICAgICAgICA/Y29tbW9uUHJvcGVydGllcz86IENvbW1vblByb3BlcnRpZXNDb25zdHJhaW50IC8vIGFic2VudCBpbXBsaWVzIG5vbmUgYXJlIGRlZmluZWRcbiAgICAgIClcblxuICAgICAgZWc6XG4gICAgICAgIHRhZ3MoKSAgLy8gcmV0dXJucyBUYWdDcmVhdG9ycyBmb3IgYWxsIEhUTUwgdGFnc1xuICAgICAgICB0YWdzKFsnZGl2JywnYnV0dG9uJ10sIHsgbXlUaGluZygpIHt9IH0pXG4gICAgICAgIHRhZ3MoJ2h0dHA6Ly9uYW1lc3BhY2UnLFsnRm9yZWlnbiddLCB7IGlzRm9yZWlnbjogdHJ1ZSB9KVxuICAqL1xuXG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPigpOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8UG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ3M6IFRhZ3NbXSk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgUSBleHRlbmRzIHt9PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMge30+KHRhZ3M6IFRhZ3NbXSwgb3B0aW9uczogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IG51bGwgfCB1bmRlZmluZWQgfCAnJywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogeyBbayBpbiBUYWdzXTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50PiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIHN0cmluZywgUSBleHRlbmRzIHt9PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMge31cbj4oXG4gIF8xOiBUMSxcbiAgXzI6IFQyLFxuICBfMz86IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPlxuKTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgRWxlbWVudD4+IHtcbiAgdHlwZSBOYW1lc3BhY2VkRWxlbWVudEJhc2UgPSBUMSBleHRlbmRzIHN0cmluZyA/IFQxIGV4dGVuZHMgJycgPyBIVE1MRWxlbWVudCA6IEVsZW1lbnQgOiBIVE1MRWxlbWVudDtcblxuICAvKiBXb3JrIG91dCB3aGljaCBwYXJhbWV0ZXIgaXMgd2hpY2guIFRoZXJlIGFyZSA2IHZhcmlhdGlvbnM6XG4gICAgdGFnKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICB0YWcoY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgICAgICAgICBbb2JqZWN0XVxuICAgIHRhZyh0YWdzW10pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHJpbmdbXV1cbiAgICB0YWcodGFnc1tdLCBjb21tb25Qcm9wZXJ0aWVzKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nW10sIG9iamVjdF1cbiAgICB0YWcobmFtZXNwYWNlIHwgbnVsbCwgdGFnc1tdKSAgICAgICAgICAgICAgICAgICBbc3RyaW5nIHwgbnVsbCwgc3RyaW5nW11dXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdLCBvYmplY3RdXG4gICovXG4gIGNvbnN0IFtuYW1lU3BhY2UsIHRhZ3MsIG9wdGlvbnNdID0gKHR5cGVvZiBfMSA9PT0gJ3N0cmluZycpIHx8IF8xID09PSBudWxsXG4gICAgPyBbXzEsIF8yIGFzIFRhZ3NbXSwgXzMgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgIDogQXJyYXkuaXNBcnJheShfMSlcbiAgICAgID8gW251bGwsIF8xIGFzIFRhZ3NbXSwgXzIgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+XVxuICAgICAgOiBbbnVsbCwgc3RhbmRhbmRUYWdzLCBfMSBhcyBUYWdGdW5jdGlvbk9wdGlvbnM8UT5dO1xuXG4gIGNvbnN0IGNvbW1vblByb3BlcnRpZXMgPSBvcHRpb25zPy5jb21tb25Qcm9wZXJ0aWVzO1xuICBjb25zdCB0aGlzRG9jID0gb3B0aW9ucz8uZG9jdW1lbnQgPz8gZ2xvYmFsVGhpcy5kb2N1bWVudDtcblxuICBjb25zdCByZW1vdmVkTm9kZXMgPSBtdXRhdGlvblRyYWNrZXIodGhpc0RvYywgJ3JlbW92ZWROb2RlcycsIG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIHRoaXNEb2MuY3JlYXRlQ29tbWVudChERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG4gIGNvbnN0IGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyA9IHRoaXNEb2MuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpO1xuICBhaXVpRXh0ZW5kZWRUYWdTdHlsZXMuaWQgPSBcIi0tYWktdWktZXh0ZW5kZWQtdGFnLXN0eWxlcy1cIitEYXRlLm5vdygpO1xuXG4gIC8qIFByb3BlcnRpZXMgYXBwbGllZCB0byBldmVyeSB0YWcgd2hpY2ggY2FuIGJlIGltcGxlbWVudGVkIGJ5IHJlZmVyZW5jZSwgc2ltaWxhciB0byBwcm90b3R5cGVzICovXG4gIGNvbnN0IHdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0YWdQcm90b3R5cGVzOiBQb0VsZW1lbnRNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShcbiAgICBudWxsLFxuICAgIHtcbiAgICAgIHdoZW46IHtcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKC4uLndoYXQ6IFdoZW5QYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW4odGhpcywgLi4ud2hhdClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgICAgc2V0KHRoaXM6IEVsZW1lbnQsIGE6IG9iamVjdCkge1xuICAgICAgICAgIGlmIChpc0FzeW5jSXRlcihhKSkge1xuICAgICAgICAgICAgY29uc3QgYWkgPSBpc0FzeW5jSXRlcmF0b3IoYSkgPyBhIDogYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhaS5uZXh0KCkudGhlbihcbiAgICAgICAgICAgICAgKHsgZG9uZSwgdmFsdWUgfSkgPT4geyBhc3NpZ25Qcm9wcyh0aGlzLCB2YWx1ZSk7IGRvbmUgfHwgc3RlcCgpIH0sXG4gICAgICAgICAgICAgIGV4ID0+IGNvbnNvbGUud2FybihleCkpO1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGFzc2lnblByb3BzKHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaWRzOiB7XG4gICAgICAgIC8vIC5pZHMgaXMgYSBnZXR0ZXIgdGhhdCB3aGVuIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vIGxhemlseSBjcmVhdGVzIGEgUHJveHkgdGhhdCBwcm92aWRlcyBsaXZlIGFjY2VzcyB0byBjaGlsZHJlbiBieSBpZFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICBnZXQodGhpczogRWxlbWVudCkge1xuICAgICAgICAgIC8vIE5vdyB3ZSd2ZSBiZWVuIGFjY2Vzc2VkLCBjcmVhdGUgdGhlIHByb3h5XG4gICAgICAgICAgY29uc3QgaWRQcm94eSA9IG5ldyBQcm94eSgoKCk9Pnt9KSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIFdlYWtSZWY8RWxlbWVudD4+LCB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0FyZy5jb25zdHJ1Y3Rvci5kZWZpbml0aW9uLmlkc1thcmdzWzBdLmlkXSguLi5hcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgPGVsdD4uaWRzLiR7YXJncz8uWzBdPy5pZH0gaXMgbm90IGEgdGFnLWNyZWF0aW5nIGZ1bmN0aW9uYCwgeyBjYXVzZTogZXggfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdHJ1Y3Q6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZjogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7IHJldHVybiBudWxsIH0sXG4gICAgICAgICAgICBpc0V4dGVuc2libGUoKSB7IHJldHVybiBmYWxzZSB9LFxuICAgICAgICAgICAgcHJldmVudEV4dGVuc2lvbnMoKSB7IHJldHVybiB0cnVlIH0sXG4gICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXlGb3IocCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhcyh0YXJnZXQsIHApIHtcbiAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuZ2V0ISh0YXJnZXQsIHAsIG51bGwpO1xuICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvd25LZXlzOiAodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGlkcyA9IFsuLi50aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYFtpZF1gKV0ubWFwKGUgPT4gZS5pZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IFsuLi5uZXcgU2V0KGlkcyldO1xuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgaWRzLmxlbmd0aCAhPT0gdW5pcXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50IGlkc2AsIHVuaXF1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiB1bmlxdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwLCByZWNlaXZlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGsgPSBrZXlGb3IocCk7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UndmUgY2FjaGVkIHRoaXMgSUQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmIChwayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBlbGVtZW50IGlzIHN0aWxsIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBlbGVtZW50IHdpdGggdGhlIHNhbWUgSURcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRhcmdldFtwa10uZGVyZWYoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgcmVmLmlkID09PSBwICYmIHRoaXMuY29udGFpbnMocmVmKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbcGtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgZTogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIENTUy5lc2NhcGUocCkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQuaGFzKHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2FybmVkLmFkZChwKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRWxlbWVudCBjb250YWlucyBtdWx0aXBsZSwgc2hhZG93ZWQgZGVjZW5kYW50cyB3aXRoIElEIFwiJHtwfVwiYC8qLGBcXG5cXHQke2xvZ05vZGUodGhpcyl9YCovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZSA9IG5sWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcjJyArIENTUy5lc2NhcGUocCkpID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUpXG4gICAgICAgICAgICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIHBrLCBuZXcgV2Vha1JlZihlKSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uYW5kIHJlcGxhY2UgdGhlIGdldHRlciB3aXRoIHRoZSBQcm94eVxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWRzJywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gaWRQcm94eSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gLi4uYW5kIHJldHVybiB0aGF0IGZyb20gdGhlIGdldHRlciwgc28gc3Vic2VxdWVudCBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGFjY2Vzc2VzIGdvIHZpYSB0aGUgUHJveHlcbiAgICAgICAgICByZXR1cm4gaWRQcm94eTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKiBBZGQgYW55IHVzZXIgc3VwcGxpZWQgcHJvdG90eXBlcyAqL1xuICBpZiAoY29tbW9uUHJvcGVydGllcylcbiAgICBkZWVwRGVmaW5lKHRhZ1Byb3RvdHlwZXMsIGNvbW1vblByb3BlcnRpZXMpO1xuXG4gIGZ1bmN0aW9uIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKSB7XG4gICAgY29uc3QgYXBwZW5kZWQ6IE5vZGVbXSA9IFtdO1xuICAgIChmdW5jdGlvbiBjaGlsZHJlbihjOiBDaGlsZFRhZ3MpOiB2b2lkIHtcbiAgICAgIGlmIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGNvbnN0IGc6IENoaWxkTm9kZSA9IERvbVByb21pc2VDb250YWluZXIoKTtcbiAgICAgICAgYXBwZW5kZWQucHVzaChnKTtcbiAgICAgICAgYy50aGVuKHIgPT4ge1xuICAgICAgICAgIGNvbnN0IGlkeCA9IGFwcGVuZGVkLmluZGV4T2YoZyk7XG4gICAgICAgICAgaWYgKGlkeCA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignUmVwbGFjZW1lbnQgbm9kZSBub3QgaW4gYXJyYXkgb2YgYXBwZW5kZWQgbm9kZXMhIFRoaXMgc2hvdWxkblxcJ3QgYmUgcG9zc2libGUuJyk7XG4gICAgICAgICAgICBpZiAoREVCVUcpIGRlYnVnZ2VyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IG5vZGVzKHIpO1xuICAgICAgICAgIHJlbW92ZWROb2Rlcy5hZGQoYXBwZW5kZWRbaWR4XSk7XG4gICAgICAgICAgYXBwZW5kZWQuc3BsaWNlKGlkeCwgMSwgLi4ucmVwbGFjZW1lbnQpO1xuICAgICAgICAgIGcucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICAoeDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oeCwgbG9nTm9kZShnKSk7XG4gICAgICAgICAgICBnLnJlcGxhY2VXaXRoKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiB4IH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICBhcHBlbmRlZC5wdXNoKGMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gaW50ZXJlc3RpbmcgY2FzZSBoZXJlIHdoZXJlIGFuIGl0ZXJhYmxlIFN0cmluZyBpcyBhbiBvYmplY3Qgd2l0aCBib3RoIFN5bWJvbC5pdGVyYXRvclxuICAgICAgLy8gKGluaGVyaXRlZCBmcm9tIHRoZSBTdHJpbmcgcHJvdG90eXBlKSBhbmQgU3ltYm9sLmFzeW5jSXRlcmF0b3IgKGFzIGl0J3MgYmVlbiBhdWdtZW50ZWQgYnkgYm94ZWQoKSlcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gY2FzZXMgbGlrZSBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3QsIGFycmF5LCBldGMuLCBub3QgdGhlIGZ1bmt5IG9uZXNcbiAgICAgIC8vIEl0IHVzZWQgdG8gYmUgYWZ0ZXIgdGhlIGlzQXN5bmNJdGVyKCkgdGVzdCwgYnV0IGEgbm9uLUFzeW5jSXRlcmF0b3IgKm1heSogYWxzbyBiZSBhIHN5bmMgaXRlcmFibGVcbiAgICAgIC8vIEZvciBub3csIHdlIGV4Y2x1ZGUgKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpIGluIHRoaXMgY2FzZS5cbiAgICAgIGlmIChjICYmIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYyAmJiAhKFN5bWJvbC5hc3luY0l0ZXJhdG9yIGluIGMpICYmIGNbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgYykgY2hpbGRyZW4oZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGNvbnN0IGFwID0gaXNBc3luY0l0ZXJhdG9yKGMpID8gYyA6IGNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGlzIGFzeW5jIGl0ZXJhdG9yIGlzIGEgYm94ZWQgb2JqZWN0IHRoYXQgYWxzbyBob2xkcyBhIHZhbHVlXG4gICAgICAgIGNvbnN0IHVuYm94ZWQgPSBjLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3QgaW5pdGlhbE5vZGVzID0gKHVuYm94ZWQgPT09IHVuZGVmaW5lZCB8fCB1bmJveGVkID09PSBjKSA/IFtdIDogbm9kZXModW5ib3hlZCBhcyBDaGlsZFRhZ3MpXG4gICAgICAgIGxldCByZXBsYWNlbWVudE5vZGVzID0gaW5pdGlhbE5vZGVzLmxlbmd0aCA/IGluaXRpYWxOb2RlcyA6IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBhcHBlbmRlZC5wdXNoKC4uLnJlcGxhY2VtZW50Tm9kZXMpO1xuXG4gICAgICAgIGNvbnN0IHNldFJlcGxhY2VtZW50Tm9kZXMgPSAobm9kZXM6IE5vZGVbXSB8IG51bGwpID0+IHtcbiAgICAgICAgICBjb25zdCBpbmRpY2VzID0gcmVwbGFjZW1lbnROb2Rlcy5tYXAobiA9PiBhcHBlbmRlZC5pbmRleE9mKG4pKS5zb3J0KChhLGIpID0+IGItYSk7XG4gICAgICAgICAgaWYgKGluZGljZXNbaW5kaWNlcy5sZW5ndGgtMV0gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JlcGxhY2VtZW50IG5vZGUgbm90IGluIGFycmF5IG9mIGFwcGVuZGVkIG5vZGVzISBUaGlzIHNob3VsZG5cXCd0IGJlIHBvc3NpYmxlLicpO1xuICAgICAgICAgICAgaWYgKERFQlVHKSB7IGRlYnVnZ2VyIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kaWNlcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgICAgICAgaWYgKGk+PTApIHtcbiAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChhcHBlbmRlZFtpXSk7XG4gICAgICAgICAgICAgIGFwcGVuZGVkLnNwbGljZShpLDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKG5vZGVzKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgaXRlcmF0ZWQgZXhwcmVzc2lvbiB5aWVsZHMgbm8gbm9kZXMsIHN0dWZmIGluIGEgRG9tUHJvbWlzZUNvbnRhaW5lciBmb3IgdGhlIG5leHQgaXRlcmF0aW9uXG4gICAgICAgICAgICBpZiAobm9kZXMubGVuZ3RoID09PSAwKSBub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgYXBwZW5kZWQuc3BsaWNlKE1hdGgubWluKC4uLmluZGljZXMpLCAwLCAuLi5ub2Rlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcGxhY2VtZW50Tm9kZXMgPSBub2RlcyB8fCBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gREVCVUcgc3VwcG9ydFxuICAgICAgICBsZXQgY3JlYXRlZEF0ID0gRGF0ZS5ub3coKSArIHRpbWVPdXRXYXJuO1xuICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgIGNvbnN0IHN0ZXAgPSAoKSA9PiBhcC5uZXh0KClcbiAgICAgICAgLnRoZW4oZXMgPT4ge1xuICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICAvLyBDaGlsZE5vZGVbXSwgc2luY2Ugd2UgdGVzdGVkIC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSByZXBsYWNlbWVudE5vZGVzLmZpbHRlcihlID0+IGU/LnBhcmVudE5vZGUgJiYgZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBub3RZZXRNb3VudGVkID8gcmVwbGFjZW1lbnROb2RlcyA6IG1vdW50ZWQ7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIG1vdW50ZWQubGVuZ3RoKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgaWYgKCFuLmxlbmd0aCB8fCByZXBsYWNlbWVudE5vZGVzLmV2ZXJ5KGUgPT4gcmVtb3ZlZE5vZGVzLmhhcyhlKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgICAgIHNldFJlcGxhY2VtZW50Tm9kZXMobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJFbGVtZW50KHMpIGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50OiBcIiArIGluc2VydGlvblN0YWNrO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgbm90WWV0TW91bnRlZCAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXN5bmMgZWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Tm9kZXMubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRSZXBsYWNlbWVudE5vZGVzKG5vZGVzKHVuYm94KGVzLnZhbHVlKSkpO1xuICAgICAgICAgICAgICAoblswXSBhcyBDaGlsZE5vZGUpLnJlcGxhY2VXaXRoKC4uLnJlcGxhY2VtZW50Tm9kZXMpO1xuICAgICAgICAgICAgICBuLmZvckVhY2goZSA9PiAhcmVwbGFjZW1lbnROb2Rlcy5pbmNsdWRlcyhlKSAmJiBlLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGUpKTtcbiAgICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnROb2Rlcy5maWx0ZXIobiA9PiBCb29sZWFuKG4/LnBhcmVudE5vZGUpKSBhcyBDaGlsZE5vZGVbXTtcbiAgICAgICAgICBpZiAobi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNldFJlcGxhY2VtZW50Tm9kZXMoW0R5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pXSk7XG4gICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKC4uLnJlcGxhY2VtZW50Tm9kZXMpO1xuICAgICAgICAgICAgbi5zbGljZSgxKS5mb3JFYWNoKGUgPT4gZT8ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybihcIkNhbid0IHJlcG9ydCBlcnJvclwiLCBlcnJvclZhbHVlLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Tm9kZXMubWFwKGxvZ05vZGUpKTtcbiAgICAgICAgICBzZXRSZXBsYWNlbWVudE5vZGVzKG51bGwpO1xuICAgICAgICAgIGFwLnJldHVybj8uKGVycm9yVmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcHBlbmRlZC5wdXNoKHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKSk7XG4gICAgfSkoYyk7XG4gICAgcmV0dXJuIGFwcGVuZGVkO1xuICB9XG5cbiAgaWYgKCFuYW1lU3BhY2UpIHtcbiAgICBPYmplY3QuYXNzaWduKHRhZywge1xuICAgICAgbm9kZXMsICAgIC8vIEJ1aWxkIERPTSBOb2RlW10gZnJvbSBDaGlsZFRhZ3NcbiAgICAgIFVuaXF1ZUlEXG4gICAgfSk7XG4gIH1cblxuICAvKiogSnVzdCBkZWVwIGNvcHkgYW4gb2JqZWN0ICovXG4gIGNvbnN0IHBsYWluT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbiAgLyoqIFJvdXRpbmUgdG8gKmRlZmluZSogcHJvcGVydGllcyBvbiBhIGRlc3Qgb2JqZWN0IGZyb20gYSBzcmMgb2JqZWN0ICoqL1xuICBmdW5jdGlvbiBkZWVwRGVmaW5lKGQ6IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIGFueT4sIHM6IGFueSwgZGVjbGFyYXRpb24/OiB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JyB8fCBzID09PSBkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBbaywgc3JjRGVzY10gb2YgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBzcmNEZXNjKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIGlzQXN5bmNJdGVyPHVua25vd24+KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdCwgc28gd2UnbGwgZGVlcERlZmluZSBpdCB1bmxlc3MgaXQncyBhXG4gICAgICAgICAgICAvLyBQcm9taXNlIG9yIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2Ugd2UganVzdCBhc3NpZ24gaXRcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAoIShrIGluIGQpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyB2YWx1ZSBpbiB0aGUgZGVzdGluYXRpb24sIGp1c3QgZGVmaW5lIGl0IHRvIGJlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc291cmNlIHZhbHVlIGlzIGFuIG9iamVjdCwgYW5kIHdlJ3JlIGRlY2xhcmluZyBpdCAodGhlcmVmb3JlIGl0IHNob3VsZCBiZSBhIG5ldyBvbmUpLCB0YWtlXG4gICAgICAgICAgICAgICAgLy8gYSBjb3B5IHNvIGFzIHRvIG5vdCByZS11c2UgdGhlIHJlZmVyZW5jZSBhbmQgcG9sbHV0ZSB0aGUgZGVjbGFyYXRpb24uIE5vdGU6IHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciBkZWZhdWx0IGZvciBhbnkgXCJvYmplY3RzXCIgaW4gYSBkZWNsYXJhdGlvbiB0aGF0IGFyZSBwbGFpbiBhbmQgbm90IHNvbWUgY2xhc3MgdHlwZVxuICAgICAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGJlIGNvcGllZFxuICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkgPT09IHBsYWluT2JqZWN0UHJvdG90eXBlIHx8ICFPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcGxhaW4gb2JqZWN0IGNhbiBiZSBkZWVwLWNvcGllZCBieSBmaWVsZFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSB7fSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbiBhcnJheSBjYW4gYmUgZGVlcCBjb3BpZWQgYnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShzcmNEZXNjLnZhbHVlID0gW10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIG9iamVjdCBsaWtlIHRoaW5ncyAocmVnZXhwcywgZGF0ZXMsIGNsYXNzZXMsIGV0YykgY2FuJ3QgYmUgZGVlcC1jb3BpZWQgcmVsaWFibHlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBEZWNsYXJlZCBwcm9wZXR5ICcke2t9JyBpcyBub3QgYSBwbGFpbiBvYmplY3QgYW5kIG11c3QgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLCBwb3NzaWJseSBwb2xsdXRpbmcgb3RoZXIgaW5zdGFuY2VzIG9mIHRoaXMgdGFnYCwgZCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBIYXZpbmcgRE9NIE5vZGVzIGFzIHByb3BlcnRpZXMgb2Ygb3RoZXIgRE9NIE5vZGVzIGlzIGEgYmFkIGlkZWEgYXMgaXQgbWFrZXMgdGhlIERPTSB0cmVlIGludG8gYSBjeWNsaWMgZ3JhcGguIFlvdSBzaG91bGQgcmVmZXJlbmNlIG5vZGVzIGJ5IElEIG9yIHZpYSBhIGNvbGxlY3Rpb24gc3VjaCBhcyAuY2hpbGROb2Rlcy4gUHJvcGV0eTogJyR7a30nIHZhbHVlOiAke2xvZ05vZGUodmFsdWUpfSBkZXN0aW5hdGlvbjogJHtkIGluc3RhbmNlb2YgTm9kZSA/IGxvZ05vZGUoZCkgOiBkfWApO1xuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZFtrXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSAtIGlmIHdlJ3JlIGNvcHlpbmcgdG8gYW4gYXJyYXkgb2YgZGlmZmVyZW50IGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkZWNvdXBsaW5nIGNvbW1vbiBvYmplY3QgcmVmZXJlbmNlcywgc28gd2UgbmVlZCBhIGNsZWFuIG9iamVjdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10gPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHJlZ3VsYXIgb2JqZWN0LCBzbyB3ZSBkZWVwRGVmaW5lIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgZGVlcERlZmluZShkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMganVzdCBhIHByaW1pdGl2ZSB2YWx1ZSwgb3IgYSBQcm9taXNlXG4gICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgZFtrXSA9IHNba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcImRlZXBBc3NpZ25cIiwgaywgc1trXSwgZXgpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bmJveDxUPihhOiBUKTogVCB7XG4gICAgY29uc3QgdiA9IGE/LnZhbHVlT2YoKTtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkodikgPyBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodiwgdW5ib3gpIDogdikgYXMgVDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblByb3BzKGJhc2U6IE5vZGUsIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgLy8gQ29weSBwcm9wIGhpZXJhcmNoeSBvbnRvIHRoZSBlbGVtZW50IHZpYSB0aGUgYXNzc2lnbm1lbnQgb3BlcmF0b3IgaW4gb3JkZXIgdG8gcnVuIHNldHRlcnNcbiAgICBpZiAoIShjYWxsU3RhY2tTeW1ib2wgaW4gcHJvcHMpKSB7XG4gICAgICAoZnVuY3Rpb24gYXNzaWduKGQ6IGFueSwgczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChzID09PSBudWxsIHx8IHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcyAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBzdGF0aWMgcHJvcHMgYmVmb3JlIGdldHRlcnMvc2V0dGVyc1xuICAgICAgICBjb25zdCBzb3VyY2VFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMocykpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocykpIHtcbiAgICAgICAgICBzb3VyY2VFbnRyaWVzLnNvcnQoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBhWzBdKTtcbiAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2MpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHJldHVybiAxO1xuICAgICAgICAgICAgICBpZiAoJ2dldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBzb3VyY2VFbnRyaWVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcmNEZXNjLnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgYXNzaWduSXRlcmFibGUodmFsdWUsIGspO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbih2ID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoaXMgcHJvbWlzZSByZXNvbHZlZCB0byBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBc3luY0l0ZXI8dW5rbm93bj4odikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3Qodiwgayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzW2tdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coXCJGYWlsZWQgdG8gc2V0IGF0dHJpYnV0ZVwiLCBlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcyBhIHJlYWwgdmFsdWUsIHdoaWNoIG1pZ2h0IGJlIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFpc1Byb21pc2VMaWtlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIGFzc2lnbk9iamVjdCh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENvcHkgdGhlIGRlZmluaXRpb24gb2YgdGhlIGdldHRlci9zZXR0ZXJcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHNyY0Rlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGV4OiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhc3NpZ25Qcm9wc1wiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25JdGVyYWJsZSh2YWx1ZTogQXN5bmNJdGVyYWJsZTx1bmtub3duPiB8IEFzeW5jSXRlcmF0b3I8dW5rbm93biwgYW55LCB1bmRlZmluZWQ+LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBjb25zdCBhcCA9IGFzeW5jSXRlcmF0b3IodmFsdWUpO1xuICAgICAgICAgIGxldCBub3RZZXRNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgICAgY29uc3QgdXBkYXRlID0gKGVzOiBJdGVyYXRvclJlc3VsdDx1bmtub3duPikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcy5kb25lKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdW5ib3goZXMudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIFRISVMgSVMgSlVTVCBBIEhBQ0s6IGBzdHlsZWAgaGFzIHRvIGJlIHNldCBtZW1iZXIgYnkgbWVtYmVyLCBlZzpcbiAgICAgICAgICAgICAgICBlLnN0eWxlLmNvbG9yID0gJ2JsdWUnICAgICAgICAtLS0gd29ya3NcbiAgICAgICAgICAgICAgICBlLnN0eWxlID0geyBjb2xvcjogJ2JsdWUnIH0gICAtLS0gZG9lc24ndCB3b3JrXG4gICAgICAgICAgICAgIHdoZXJlYXMgaW4gZ2VuZXJhbCB3aGVuIGFzc2lnbmluZyB0byBwcm9wZXJ0eSB3ZSBsZXQgdGhlIHJlY2VpdmVyXG4gICAgICAgICAgICAgIGRvIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBwYXJzZSB0aGUgb2JqZWN0LiBUaGlzIG1pZ2h0IGJlIGJldHRlciBoYW5kbGVkXG4gICAgICAgICAgICAgIGJ5IGhhdmluZyBhIHNldHRlciBmb3IgYHN0eWxlYCBpbiB0aGUgUG9FbGVtZW50TWV0aG9kcyB0aGF0IGlzIHNlbnNpdGl2ZVxuICAgICAgICAgICAgICB0byB0aGUgdHlwZSAoc3RyaW5nfG9iamVjdCkgYmVpbmcgcGFzc2VkIHNvIHdlIGNhbiBqdXN0IGRvIGEgc3RyYWlnaHRcbiAgICAgICAgICAgICAgYXNzaWdubWVudCBhbGwgdGhlIHRpbWUsIG9yIG1ha2luZyB0aGUgZGVjc2lvbiBiYXNlZCBvbiB0aGUgbG9jYXRpb24gb2YgdGhlXG4gICAgICAgICAgICAgIHByb3BlcnR5IGluIHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIGFzc3VtaW5nIGFueXRoaW5nIGJlbG93IFwiUE9cIiBtdXN0IGJlXG4gICAgICAgICAgICAgIGEgcHJpbWl0aXZlXG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGspO1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnc3R5bGUnIHx8ICFkZXN0RGVzYz8uc2V0KVxuICAgICAgICAgICAgICAgICAgYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3JjIGlzIG5vdCBhbiBvYmplY3QgKG9yIGlzIG51bGwpIC0ganVzdCBhc3NpZ24gaXQsIHVubGVzcyBpdCdzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWQgPSBiYXNlLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGJlZW4gbW91bnRlZCBiZWZvcmUsIGJpdCBhcmVuJ3Qgbm93LCByZW1vdmUgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaGFzKGJhc2UpIHx8ICghbm90WWV0TW91bnRlZCAmJiAhbW91bnRlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gZG9jdW1lbnQgd2hlbiBzZXR0aW5nIGFzeW5jIGF0dHJpYnV0ZSAnJHtrfScgdG86XFxuJHtsb2dOb2RlKGJhc2UpfWApO1xuICAgICAgICAgICAgICAgIGFwLnJldHVybj8uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb3VudGVkKSBub3RZZXRNb3VudGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtZW50IHdpdGggYXN5bmMgYXR0cmlidXRlICcke2t9JyBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuLzEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5cXG5FbGVtZW50IGNvbnRhaW5zOiAke2xvZ05vZGUoYmFzZSl9XFxuJHtjcmVhdGVkQnl9YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEeW5hbWljIGF0dHJpYnV0ZSBlcnJvclwiLCBlcnJvclZhbHVlLCBrLCBkLCBjcmVhdGVkQnksIGxvZ05vZGUoYmFzZSkpO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4oZXJyb3JWYWx1ZSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZENoaWxkKER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdW5ib3hlZCA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICAgICAgICBpZiAodW5ib3hlZCAhPT0gdW5kZWZpbmVkICYmIHVuYm94ZWQgIT09IHZhbHVlICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdGUgLSBpZiB3ZSdyZSBjb3B5aW5nIHRvIG91cnNlbGYgKG9yIGFuIGFycmF5IG9mIGRpZmZlcmVudCBsZW5ndGgpLFxuICAgICAgICAgICAgLy8gd2UncmUgZGVjb3VwbGluZyBjb21tb24gb2JqZWN0IHJlZmVyZW5jZXMsIHNvIHdlIG5lZWQgYSBjbGVhbiBvYmplY3QgdG9cbiAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICBpZiAoIShrIGluIGQpIHx8IGRba10gPT09IHZhbHVlIHx8IChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBuZXcgKHZhbHVlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgICAgICBhc3NpZ24oY29weSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRba10gPSBjb3B5O1xuICAgICAgICAgICAgICAgIC8vYXNzaWduKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHNvbWUgc29ydCBvZiBjb25zdHJ1Y3RlZCBvYmplY3QsIHdoaWNoIHdlIGNhbid0IGNsb25lLCBzbyB3ZSBoYXZlIHRvIGNvcHkgYnkgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgZFtrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KShiYXNlLCBwcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgRXh0ZW5kIGEgY29tcG9uZW50IGNsYXNzIHdpdGggY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBjbGFzcyBmYWN0b3J5OlxuICAgICAgY29uc3QgTmV3RGl2ID0gRGl2LmV4dGVuZGVkKHsgb3ZlcnJpZGVzIH0pXG4gICAgICAgICAgLi4ub3IuLi5cbiAgICAgIGNvbnN0IE5ld0RpYyA9IERpdi5leHRlbmRlZCgoaW5zdGFuY2U6eyBhcmJpdHJhcnktdHlwZSB9KSA9PiAoeyBvdmVycmlkZXMgfSkpXG4gICAgICAgICAuLi5sYXRlci4uLlxuICAgICAgY29uc3QgZWx0TmV3RGl2ID0gTmV3RGl2KHthdHRyc30sLi4uY2hpbGRyZW4pXG4gICovXG5cbiAgZnVuY3Rpb24gdGFnSGFzSW5zdGFuY2UodGhpczogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSwgZTogYW55KSB7XG4gICAgZm9yIChsZXQgYyA9IGUuY29uc3RydWN0b3I7IGM7IGMgPSBjLnN1cGVyKSB7XG4gICAgICBpZiAoYyA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZGVkKHRoaXM6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIF9vdmVycmlkZXM6IE92ZXJyaWRlcyB8ICgoaW5zdGFuY2U/OiBJbnN0YW5jZSkgPT4gT3ZlcnJpZGVzKSkge1xuICAgIGNvbnN0IGluc3RhbmNlRGVmaW5pdGlvbiA9ICh0eXBlb2YgX292ZXJyaWRlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gT2JqZWN0LmFzc2lnbih7fSwgX292ZXJyaWRlcywgaW5zdGFuY2UpXG4gICAgICA6IF9vdmVycmlkZXNcblxuICAgIGNvbnN0IHVuaXF1ZVRhZ0lEID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyAoaWRDb3VudCsrKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcbiAgICBsZXQgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGFpdWlFeHRlbmRlZFRhZ1N0eWxlcy5hcHBlbmRDaGlsZCh0aGlzRG9jLmNyZWF0ZVRleHROb2RlKHN0YXRpY0V4dGVuc2lvbnMuc3R5bGVzICsgJ1xcbicpKTtcbiAgICAgIGlmICghdGhpc0RvYy5oZWFkLmNvbnRhaW5zKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcykpIHtcbiAgICAgICAgdGhpc0RvYy5oZWFkLmFwcGVuZENoaWxkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXCJ0aGlzXCIgaXMgdGhlIHRhZyB3ZSdyZSBiZWluZyBleHRlbmRlZCBmcm9tLCBhcyBpdCdzIGFsd2F5cyBjYWxsZWQgYXM6IGAodGhpcykuZXh0ZW5kZWRgXG4gICAgLy8gSGVyZSdzIHdoZXJlIHdlIGFjdHVhbGx5IGNyZWF0ZSB0aGUgdGFnLCBieSBhY2N1bXVsYXRpbmcgYWxsIHRoZSBiYXNlIGF0dHJpYnV0ZXMgYW5kXG4gICAgLy8gKGZpbmFsbHkpIGFzc2lnbmluZyB0aG9zZSBzcGVjaWZpZWQgYnkgdGhlIGluc3RhbnRpYXRpb25cbiAgICBjb25zdCBleHRlbmRUYWdGbjogRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnMsIC4uLmNoaWxkcmVuKSA9PiB7XG4gICAgICBjb25zdCBub0F0dHJzID0gaXNDaGlsZFRhZyhhdHRycyk7XG4gICAgICBjb25zdCBuZXdDYWxsU3RhY2s6IChDb25zdHJ1Y3RlZCAmIE92ZXJyaWRlcylbXSA9IFtdO1xuICAgICAgY29uc3QgY29tYmluZWRBdHRycyA9IHsgW2NhbGxTdGFja1N5bWJvbF06IChub0F0dHJzID8gbmV3Q2FsbFN0YWNrIDogYXR0cnNbY2FsbFN0YWNrU3ltYm9sXSkgPz8gbmV3Q2FsbFN0YWNrIH1cbiAgICAgIGNvbnN0IGUgPSBub0F0dHJzID8gdGhpcyhjb21iaW5lZEF0dHJzLCBhdHRycywgLi4uY2hpbGRyZW4pIDogdGhpcyhjb21iaW5lZEF0dHJzLCAuLi5jaGlsZHJlbik7XG4gICAgICBlLmNvbnN0cnVjdG9yID0gZXh0ZW5kVGFnO1xuICAgICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IGluc3RhbmNlRGVmaW5pdGlvbih7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pO1xuICAgICAgY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdLnB1c2godGFnRGVmaW5pdGlvbik7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZGVjbGFyZSBhbmQgb3ZlcnJpZGVcbiAgICAgICAgZnVuY3Rpb24gaXNBbmNlc3RyYWwoY3JlYXRvcjogVGFnQ3JlYXRvcjxFbGVtZW50PiwgZDogc3RyaW5nKSB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBkIGluIGYuZGVmaW5pdGlvbi5kZWNsYXJlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ0RlZmluaXRpb24uZGVjbGFyZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5kZWNsYXJlKS5maWx0ZXIoZCA9PiAoZCBpbiBlKSB8fCBpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlY2xhcmVkIGtleXMgJyR7Y2xhc2h9JyBpbiAke2V4dGVuZFRhZy5uYW1lfSBhbHJlYWR5IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5vdmVycmlkZSkge1xuICAgICAgICAgIGNvbnN0IGNsYXNoID0gT2JqZWN0LmtleXModGFnRGVmaW5pdGlvbi5vdmVycmlkZSkuZmlsdGVyKGQgPT4gIShkIGluIGUpICYmICEoY29tbW9uUHJvcGVydGllcyAmJiBkIGluIGNvbW1vblByb3BlcnRpZXMpICYmICFpc0FuY2VzdHJhbCh0aGlzLCBkKSk7XG4gICAgICAgICAgaWYgKGNsYXNoLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyaWRkZW4ga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGRvIG5vdCBleGlzdCBpbiBiYXNlICcke3RoaXMudmFsdWVPZigpfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5kZWNsYXJlLCB0cnVlKTtcbiAgICAgIGRlZXBEZWZpbmUoZSwgdGFnRGVmaW5pdGlvbi5vdmVycmlkZSk7XG4gICAgICBjb25zdCByZUFzc2lnbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgdGFnRGVmaW5pdGlvbi5pdGVyYWJsZSAmJiBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLml0ZXJhYmxlKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICBpZiAoayBpbiBlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIGF0dGVtcHQgdG8gcmUtZGVmaW5lIGl0ZXJhYmxlIHByb3BlcnR5IFwiJHtrfVwiIGFzIGl0IGNvdWxkIGFscmVhZHkgaGF2ZSBjb25zdW1lcnNgKTtcbiAgICAgICAgICByZUFzc2lnbi5hZGQoayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5lSXRlcmFibGVQcm9wZXJ0eShlLCBrLCB0YWdEZWZpbml0aW9uLml0ZXJhYmxlIVtrIGFzIGtleW9mIHR5cGVvZiB0YWdEZWZpbml0aW9uLml0ZXJhYmxlXSlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoY29tYmluZWRBdHRyc1tjYWxsU3RhY2tTeW1ib2xdID09PSBuZXdDYWxsU3RhY2spIHtcbiAgICAgICAgaWYgKCFub0F0dHJzKVxuICAgICAgICAgIGFzc2lnblByb3BzKGUsIGF0dHJzKTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmFzZT8uY29uc3RydWN0ZWQ/LmNhbGwoZSk7XG4gICAgICAgICAgaWYgKGlzQ2hpbGRUYWcoY2hpbGRyZW4pKSAvLyB0ZWNobmljYWxseSBub3QgbmVjZXNzYXJ5LCBzaW5jZSBcInZvaWRcIiBpcyBnb2luZyB0byBiZSB1bmRlZmluZWQgaW4gOTkuOSUgb2YgY2FzZXMuXG4gICAgICAgICAgICBlLmFwcGVuZCguLi5ub2RlcyhjaGlsZHJlbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2UgdGhlIGZ1bGwgdHJlZSBvZiBhdWdtZW50ZWQgRE9NIGVsZW1lbnRzIGhhcyBiZWVuIGNvbnN0cnVjdGVkLCBmaXJlIGFsbCB0aGUgaXRlcmFibGUgcHJvcGVlcnRpZXNcbiAgICAgICAgLy8gc28gdGhlIGZ1bGwgaGllcmFyY2h5IGdldHMgdG8gY29uc3VtZSB0aGUgaW5pdGlhbCBzdGF0ZSwgdW5sZXNzIHRoZXkgaGF2ZSBiZWVuIGFzc2lnbmVkXG4gICAgICAgIC8vIGJ5IGFzc2lnblByb3BzIGZyb20gYSBmdXR1cmVcbiAgICAgICAgY29uc3QgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMgPSB7fTtcbiAgICAgICAgbGV0IGhhc0luaXRpYWxWYWx1ZXMgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIG5ld0NhbGxTdGFjaykge1xuICAgICAgICAgIGlmIChiYXNlLml0ZXJhYmxlKSBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYmFzZS5pdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHNlbGYtYXNzaWduIGl0ZXJhYmxlcyB0aGF0IGhhdmUgdGhlbXNlbHZlcyBiZWVuIGFzc2lnbmVkIHdpdGggZnV0dXJlc1xuICAgICAgICAgICAgY29uc3QgYXR0ckV4aXN0cyA9ICFub0F0dHJzICYmIGsgaW4gYXR0cnM7XG4gICAgICAgICAgICBpZiAoKHJlQXNzaWduLmhhcyhrKSAmJiBhdHRyRXhpc3RzKSB8fCAhKGF0dHJFeGlzdHMgJiYgKCFpc1Byb21pc2VMaWtlKGF0dHJzW2tdKSB8fCAhaXNBc3luY0l0ZXIoYXR0cnNba10pKSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlW2sgYXMga2V5b2YgdHlwZW9mIGVdPy52YWx1ZU9mKCk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHNvbWUgcHJvcHMgb2YgZSAoSFRNTEVsZW1lbnQpIGFyZSByZWFkLW9ubHksIGFuZCB3ZSBkb24ndCBrbm93IGlmIGsgaXMgb25lIG9mIHRoZW0uXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXNba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBoYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzSW5pdGlhbFZhbHVlcylcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUsIGNvbWJpbmVkSW5pdGlhbEl0ZXJhYmxlVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZFRhZzogRXh0ZW5kVGFnRnVuY3Rpb25JbnN0YW5jZSA9IE9iamVjdC5hc3NpZ24oZXh0ZW5kVGFnRm4sIHtcbiAgICAgIHN1cGVyOiB0aGlzLFxuICAgICAgZGVmaW5pdGlvbjogT2JqZWN0LmFzc2lnbihzdGF0aWNFeHRlbnNpb25zLCB7IFtVbmlxdWVJRF06IHVuaXF1ZVRhZ0lEIH0pLFxuICAgICAgZXh0ZW5kZWQsXG4gICAgICB2YWx1ZU9mOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5kZWNsYXJlIHx8IHt9KSwgLi4uT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucy5pdGVyYWJsZSB8fCB7fSldO1xuICAgICAgICByZXR1cm4gYCR7ZXh0ZW5kVGFnLm5hbWV9OiB7JHtrZXlzLmpvaW4oJywgJyl9fVxcbiBcXHUyMUFBICR7dGhpcy52YWx1ZU9mKCl9YFxuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgZnVsbFByb3RvID0ge307XG4gICAgKGZ1bmN0aW9uIHdhbGtQcm90byhjcmVhdG9yOiBUYWdDcmVhdG9yPEVsZW1lbnQ+KSB7XG4gICAgICBpZiAoY3JlYXRvcj8uc3VwZXIpXG4gICAgICAgIHdhbGtQcm90byhjcmVhdG9yLnN1cGVyKTtcblxuICAgICAgY29uc3QgcHJvdG8gPSBjcmVhdG9yLmRlZmluaXRpb247XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5vdmVycmlkZSk7XG4gICAgICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBwcm90bz8uZGVjbGFyZSk7XG4gICAgICB9XG4gICAgfSkodGhpcyk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMub3ZlcnJpZGUpO1xuICAgIGRlZXBEZWZpbmUoZnVsbFByb3RvLCBzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4dGVuZFRhZywgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZnVsbFByb3RvKSk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIG1ha2UgdXAgYSBtZWFuaW5nZnU7bCBuYW1lIGZvciB0aGlzIGV4dGVuZGVkIHRhZ1xuICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gZnVsbFByb3RvXG4gICAgICAmJiAnY2xhc3NOYW1lJyBpbiBmdWxsUHJvdG9cbiAgICAgICYmIHR5cGVvZiBmdWxsUHJvdG8uY2xhc3NOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgPyBmdWxsUHJvdG8uY2xhc3NOYW1lXG4gICAgICA6IHVuaXF1ZVRhZ0lEO1xuICAgIGNvbnN0IGNhbGxTaXRlID0gREVCVUcgPyAobmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KCdcXG4nKVsyXSA/PyAnJykgOiAnJztcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRUYWcsIFwibmFtZVwiLCB7XG4gICAgICB2YWx1ZTogXCI8YWktXCIgKyBjcmVhdG9yTmFtZS5yZXBsYWNlKC9cXHMrL2csICctJykgKyBjYWxsU2l0ZSArIFwiPlwiXG4gICAgfSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IGV4dHJhVW5rbm93blByb3BzID0gT2JqZWN0LmtleXMoc3RhdGljRXh0ZW5zaW9ucykuZmlsdGVyKGsgPT4gIVsnc3R5bGVzJywgJ2lkcycsICdjb25zdHJ1Y3RlZCcsICdkZWNsYXJlJywgJ292ZXJyaWRlJywgJ2l0ZXJhYmxlJ10uaW5jbHVkZXMoaykpO1xuICAgICAgaWYgKGV4dHJhVW5rbm93blByb3BzLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtleHRlbmRUYWcubmFtZX0gZGVmaW5lcyBleHRyYW5lb3VzIGtleXMgJyR7ZXh0cmFVbmtub3duUHJvcHN9Jywgd2hpY2ggYXJlIHVua25vd25gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4dGVuZFRhZztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgY29uc3QgYmFzZVRhZ0NyZWF0b3JzOiBDcmVhdGVFbGVtZW50ICYge1xuICAgIFtLIGluIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcF0/OiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPlxuICB9ICYge1xuICAgIFtuOiBzdHJpbmddOiBUYWdDcmVhdG9yPFEgJiBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSA9IHtcbiAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgbmFtZTogVGFnQ3JlYXRvckZ1bmN0aW9uPEVsZW1lbnQ+IHwgTm9kZSB8IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgIGF0dHJzOiBhbnksXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW10pOiBOb2RlIHtcbiAgICAgIHJldHVybiAobmFtZSA9PT0gYmFzZVRhZ0NyZWF0b3JzLmNyZWF0ZUVsZW1lbnQgPyBub2RlcyguLi5jaGlsZHJlbilcbiAgICAgICAgOiB0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJyA/IG5hbWUoYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBuYW1lIGluIGJhc2VUYWdDcmVhdG9ycyA/XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IEV4cHJlc3Npb24gcHJvZHVjZXMgYSB1bmlvbiB0eXBlIHRoYXQgaXMgdG9vIGNvbXBsZXggdG8gcmVwcmVzZW50LnRzKDI1OTApXG4gICAgICAgICAgICBiYXNlVGFnQ3JlYXRvcnNbbmFtZV0oYXR0cnMsIGNoaWxkcmVuKVxuICAgICAgICA6IG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgICAgICA6IER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBuZXcgRXJyb3IoXCJJbGxlZ2FsIHR5cGUgaW4gY3JlYXRlRWxlbWVudDpcIiArIG5hbWUpIH0pKSBhcyBOb2RlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUsIHRyYWNrOiBrZXlvZiBQaWNrQnlUeXBlPE11dGF0aW9uUmVjb3JkLCBOb2RlTGlzdD4sIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRyYWNrZWQgPSBuZXcgV2Vha1NldDxOb2RlPigpO1xuICBmdW5jdGlvbiB3YWxrKG5vZGVzOiBOb2RlTGlzdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgLy8gSW4gY2FzZSBpdCdzIGJlIHJlLWFkZGVkL21vdmVkXG4gICAgICBpZiAoKHRyYWNrID09PSAnYWRkZWROb2RlcycpID09PSBub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHdhbGsobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgdHJhY2tlZC5hZGQobm9kZSk7XG4gICAgICAgIC8vIExlZ2FjeSBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgaWYgKGVuYWJsZU9uUmVtb3ZlZEZyb21ET00gJiYgJ29uUmVtb3ZlZEZyb21ET00nIGluIG5vZGUgJiYgdHlwZW9mIG5vZGUub25SZW1vdmVkRnJvbURPTSA9PT0gJ2Z1bmN0aW9uJykgbm9kZS5vblJlbW92ZWRGcm9tRE9NKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcgJiYgbVt0cmFja10ubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsobVt0cmFja10pXG4gICAgICB9XG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHRyYWNrZWQ7XG4gIC8vIHJldHVybiBmdW5jdGlvbiAobm9kZTogTm9kZSkge1xuICAvLyAgIHJldHVybiB0cmFja2VkLmhhcyhub2RlKTtcbiAgLy8gfVxufVxuIiwgIi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBERUJVRyA9IGdsb2JhbFRoaXMuREVCVUcgPT0gJyonIHx8IGdsb2JhbFRoaXMuREVCVUcgPT0gdHJ1ZSB8fCBCb29sZWFuKGdsb2JhbFRoaXMuREVCVUc/Lm1hdGNoKC8oXnxcXFcpQUktVUkoXFxXfCQpLykpIHx8IGZhbHNlO1xuZXhwb3J0IHsgX2NvbnNvbGUgYXMgY29uc29sZSB9O1xuZXhwb3J0IGNvbnN0IHRpbWVPdXRXYXJuID0gNTAwMDtcblxuY29uc3QgX2NvbnNvbGUgPSB7XG4gIGxvZyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCcoQUktVUkpIExPRzonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgd2FybiguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUud2FybignKEFJLVVJKSBXQVJOOicsIC4uLmFyZ3MsIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9FcnJvclxcblxccyouKlxcbi8sJ1xcbicpKVxuICB9LFxuICBpbmZvKC4uLmFyZ3M6IGFueSkge1xuICAgIGlmIChERUJVRykgY29uc29sZS50cmFjZSgnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5leHBvcnQgdHlwZSBEZWZlcnJlZFByb21pc2U8VD4gPSBQcm9taXNlPFQ+ICYge1xuICByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZDtcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmZXJyZWQ8VD4oKTogRGVmZXJyZWRQcm9taXNlPFQ+IHtcbiAgbGV0IHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkID0gbm90aGluZztcbiAgbGV0IHJlamVjdDogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSBub3RoaW5nO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKC4uLnIpID0+IFtyZXNvbHZlLCByZWplY3RdID0gcikgYXMgRGVmZXJyZWRQcm9taXNlPFQ+O1xuICBwcm9taXNlLnJlc29sdmUgPSByZXNvbHZlO1xuICBwcm9taXNlLnJlamVjdCA9IHJlamVjdDtcbiAgaWYgKERFQlVHKSB7XG4gICAgY29uc3QgaW5pdExvY2F0aW9uID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgcHJvbWlzZS5jYXRjaChleCA9PiAoZXggaW5zdGFuY2VvZiBFcnJvciB8fCBleD8udmFsdWUgaW5zdGFuY2VvZiBFcnJvcikgPyBjb25zb2xlLmxvZyhcIkRlZmVycmVkIHJlamVjdGlvblwiLCBleCwgXCJhbGxvY2F0ZWQgYXQgXCIsIGluaXRMb2NhdGlvbikgOiB1bmRlZmluZWQpO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG4vLyBUcnVlIGlmIGBleHByIGluIHhgIGlzIHZhbGlkXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3RMaWtlKHg6IGFueSk6IHggaXMgRnVuY3Rpb24gfCB7fSB7XG4gIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlTGlrZTxUPih4OiBhbnkpOiB4IGlzIFByb21pc2VMaWtlPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh4KSAmJiAoJ3RoZW4nIGluIHgpICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUgfSBmcm9tIFwiLi9kZWJ1Zy5qc1wiXG5pbXBvcnQgeyBEZWZlcnJlZFByb21pc2UsIGRlZmVycmVkLCBpc09iamVjdExpa2UsIGlzUHJvbWlzZUxpa2UgfSBmcm9tIFwiLi9kZWZlcnJlZC5qc1wiXG5cbi8qIEl0ZXJhYmxlUHJvcGVydGllcyBjYW4ndCBiZSBjb3JyZWN0bHkgdHlwZWQgaW4gVFMgcmlnaHQgbm93LCBlaXRoZXIgdGhlIGRlY2xhcmF0aW9uXG4gIHdvcmtzIGZvciByZXRyaWV2YWwgKHRoZSBnZXR0ZXIpLCBvciBpdCB3b3JrcyBmb3IgYXNzaWdubWVudHMgKHRoZSBzZXR0ZXIpLCBidXQgdGhlcmUnc1xuICBubyBUUyBzeW50YXggdGhhdCBwZXJtaXRzIGNvcnJlY3QgdHlwZS1jaGVja2luZyBhdCBwcmVzZW50LlxuXG4gIElkZWFsbHksIGl0IHdvdWxkIGJlOlxuXG4gIHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPElQPiA9IHtcbiAgICBnZXQgW0sgaW4ga2V5b2YgSVBdKCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxJUFtLXT4gJiBJUFtLXVxuICAgIHNldCBbSyBpbiBrZXlvZiBJUF0odjogSVBbS10pXG4gIH1cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM4MjZcblxuICBXZSBjaG9vc2UgdGhlIGZvbGxvd2luZyB0eXBlIGRlc2NyaXB0aW9uIHRvIGF2b2lkIHRoZSBpc3N1ZXMgYWJvdmUuIEJlY2F1c2UgdGhlIEFzeW5jRXh0cmFJdGVyYWJsZVxuICBpcyBQYXJ0aWFsIGl0IGNhbiBiZSBvbWl0dGVkIGZyb20gYXNzaWdubWVudHM6XG4gICAgdGhpcy5wcm9wID0gdmFsdWU7ICAvLyBWYWxpZCwgYXMgbG9uZyBhcyB2YWx1cyBoYXMgdGhlIHNhbWUgdHlwZSBhcyB0aGUgcHJvcFxuICAuLi5hbmQgd2hlbiByZXRyaWV2ZWQgaXQgd2lsbCBiZSB0aGUgdmFsdWUgdHlwZSwgYW5kIG9wdGlvbmFsbHkgdGhlIGFzeW5jIGl0ZXJhdG9yOlxuICAgIERpdih0aGlzLnByb3ApIDsgLy8gdGhlIHZhbHVlXG4gICAgdGhpcy5wcm9wLm1hcCEoLi4uLikgIC8vIHRoZSBpdGVyYXRvciAobm90ZSB0aGUgdHJhaWxpbmcgJyEnIHRvIGFzc2VydCBub24tbnVsbCB2YWx1ZSlcblxuICBUaGlzIHJlbGllcyBvbiBhIGhhY2sgdG8gYHdyYXBBc3luY0hlbHBlcmAgaW4gaXRlcmF0b3JzLnRzIHdoaWNoICphY2NlcHRzKiBhIFBhcnRpYWw8QXN5bmNJdGVyYXRvcj5cbiAgYnV0IGNhc3RzIGl0IHRvIGEgQXN5bmNJdGVyYXRvciBiZWZvcmUgdXNlLlxuXG4gIFRoZSBpdGVyYWJpbGl0eSBvZiBwcm9wZXJ0eXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gIEJ5IGRlZmF1bHQsIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIGRvZXMgYSBkZWVwIG1hcHBpbmcsIHNvIGFuIGl0ZXJhYmxlIHByb3BlcnR5ICdvYmonIGlzIGl0c2VsZlxuICBpdGVyYWJsZSwgYXMgYXJlIGl0J3MgbWVtYmVycy4gVGhlIG9ubHkgZGVmaW5lZCB2YWx1ZSBhdCBwcmVzZW50IGlzIFwic2hhbGxvd1wiLCBpbiB3aGljaCBjYXNlICdvYmonIHJlbWFpbnNcbiAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuKi9cblxuLy8gQmFzZSB0eXBlcyB0aGF0IGNhbiBiZSBtYWRlIGRlZmluZWQgYXMgaXRlcmFibGU6IGJhc2ljYWxseSBhbnl0aGluZywgX2V4Y2VwdF8gYSBmdW5jdGlvblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCk7XG4vLyBXZSBzaG91bGQgZXhjbHVkZSBBc3luY0l0ZXJhYmxlIGZyb20gdGhlIHR5cGVzIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGl0ZXJhYmxlcyAoYW5kIHRoZXJlZm9yZSBwYXNzZWQgdG8gZGVmaW5lSXRlcmFibGVQcm9wZXJ0eSlcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA9IEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmUgfCBJdGVyYWJsZVByb3BlcnR5VmFsdWVbXSB8IHsgW2s6IHN0cmluZyB8IHN5bWJvbCB8IG51bWJlcl06IEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSB9O1xuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmlsaXR5PERlcHRoIGV4dGVuZHMgJ3NoYWxsb3cnID0gJ3NoYWxsb3cnPiA9IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfTtcbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFQgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxUPj47XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gVGhpcyBpcyBwYXRjaCB0byB0aGUgc3RkIGxpYiBkZWZpbml0aW9uIG9mIEFycmF5PFQ+LiBJIGRvbid0IGtub3cgd2h5IGl0J3MgYWJzZW50LFxuICAvLyBhcyB0aGlzIGlzIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBhbGwgSmF2YVNjcmlwdCBlbmdpbmVzLiBJdCBpcyBwcm9iYWJseSBhIHJlc3VsdFxuICAvLyBvZiBpdHMgYWJzZW5jZSBpbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS92YWx1ZXMsXG4gIC8vIHdoaWNoIGluaGVyaXRzIGZyb20gdGhlIE9iamVjdC5wcm90b3R5cGUsIHdoaWNoIG1ha2VzIG5vIGNsYWltIGZvciB0aGUgcmV0dXJuIHR5cGVcbiAgLy8gc2luY2UgaXQgY291bGQgYmUgb3ZlcnJpZGRlbS4gSG93ZXZlciwgaW4gdGhhdCBjYXNlLCBhIFRTIGRlZm4gc2hvdWxkIGFsc28gb3ZlcnJpZGVcbiAgLy8gaXQsIGxpa2UgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gZXRjIGRvLlxuICBpbnRlcmZhY2UgQXJyYXk8VD4ge1xuICAgIHZhbHVlT2YoKTogQXJyYXk8VD47XG4gIH1cbiAgLy8gQXMgYWJvdmUsIHRoZSByZXR1cm4gdHlwZSBjb3VsZCBiZSBUIHJhdGhlciB0aGFuIE9iamVjdCwgc2luY2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBpbXBsLFxuICAvLyBidXQgaXQncyBub3QsIGZvciBzb21lIHJlYXNvbi5cbiAgaW50ZXJmYWNlIE9iamVjdCB7XG4gICAgdmFsdWVPZjxUPih0aGlzOiBUKTogVCBleHRlbmRzIEl0ZXJhYmxlVHlwZTxpbmZlciBaPiA/IFogOiBPYmplY3Q7XG4gIH1cbn1cblxudHlwZSBOb25BY2Nlc3NpYmxlSXRlcmFibGVBcnJheUtleXMgPSBrZXlvZiBBcnJheTxhbnk+ICYga2V5b2YgQXN5bmNJdGVyYWJsZUhlbHBlcnM7XG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0gSVAgZXh0ZW5kcyBJdGVyYWJpbGl0eTwnc2hhbGxvdyc+ID8ge1xuICBbSyBpbiBrZXlvZiBPbWl0PElQLCB0eXBlb2YgSXRlcmFiaWxpdHk+XTogSXRlcmFibGVUeXBlPElQW0tdPlxufSA6IHtcbiAgW0sgaW4ga2V5b2YgSVBdOiAoXG4gICAgSVBbS10gZXh0ZW5kcyBBcnJheTxpbmZlciBFPlxuICAgID8gLypcbiAgICAgIEJlY2F1c2UgVFMgZG9lc24ndCBpbXBsZW1lbnQgc2VwYXJhdGUgdHlwZXMgZm9yIHJlYWQvd3JpdGUsIG9yIGNvbXB1dGVkIGdldHRlci9zZXR0ZXIgbmFtZXMgKHdoaWNoIERPIGFsbG93XG4gICAgICBkaWZmZXJlbnQgdHlwZXMgZm9yIGFzc2lnbm1lbnQgYW5kIGV2YWx1YXRpb24pLCBpdCBpcyBub3QgcG9zc2libGUgdG8gZGVmaW5lIHR5cGUgZm9yIGFycmF5IG1lbWJlcnMgdGhhdCBwZXJtaXRcbiAgICAgIGRlcmVmZXJlbmNpbmcgb2Ygbm9uLWNsYXNoaW5oIGFycmF5IGtleXMgc3VjaCBhcyBgam9pbmAgb3IgYHNvcnRgIGFuZCBBc3luY0l0ZXJhdG9yIG1ldGhvZHMgd2hpY2ggYWxzbyBhbGxvd3NcbiAgICAgIHNpbXBsZSBhc3NpZ25tZW50IG9mIHRoZSBmb3JtIGB0aGlzLml0ZXJhYmxlQXJyYXlNZW1iZXIgPSBbLi4uXWAuXG5cbiAgICAgIFRoZSBDT1JSRUNUIHR5cGUgZm9yIHRoZXNlIGZpZWxkcyB3b3VsZCBiZSAoaWYgVFMgcGhhcyBzeW50YXggZm9yIGl0KTpcbiAgICAgIGdldCBbS10gKCk6IE9taXQ8QXJyYXk8RSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFPiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4gICAgICBzZXQgW0tdICgpOiBBcnJheTxFPiB8IEFzeW5jRXh0cmFJdGVyYWJsZTxFW10+XG4gICAgICAqL1xuICAgICAgT21pdDxBcnJheTxFICYgUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8RT4+PiwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPEVbXT4+XG4gICAgOiAoXG4gICAgICBJUFtLXSBleHRlbmRzIG9iamVjdFxuICAgICAgPyBJdGVyYWJsZVByb3BlcnRpZXM8SVBbS10+XG4gICAgICA6IElQW0tdXG4gICAgKSAmIEl0ZXJhYmxlVHlwZTxJUFtLXT5cbiAgKVxufVxuXG4vKiBUaGluZ3MgdG8gc3VwcGxpZW1lbnQgdGhlIEpTIGJhc2UgQXN5bmNJdGVyYWJsZSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMge1xuICBwdXNoKHZhbHVlOiBUKTogYm9vbGVhbjtcbiAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbi8vIE5COiBUaGlzIGFsc28gKGluY29ycmVjdGx5KSBwYXNzZXMgc3luYyBpdGVyYXRvcnMsIGFzIHRoZSBwcm90b2NvbCBuYW1lcyBhcmUgdGhlIHNhbWVcbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmICduZXh0JyBpbiBvICYmIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gbykgJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXI8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pXG59XG5cbmV4cG9ydCB0eXBlIEFzeW5jUHJvdmlkZXI8VD4gPSBBc3luY0l0ZXJhdG9yPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPlxuXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNJdGVyYXRvcjxUPihvOiBBc3luY1Byb3ZpZGVyPFQ+KSB7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKSByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFuIGFzeW5jIHByb3ZpZGVyXCIpO1xufVxuXG50eXBlIEFzeW5jSXRlcmFibGVIZWxwZXJzID0gdHlwZW9mIGFzeW5jRXh0cmFzO1xuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSxcbiAgICBmbjogKG86IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IFIgfCB0eXBlb2YgSWdub3JlKSA9PiBNYXliZVByb21pc2VkPFIgfCB0eXBlb2YgSWdub3JlPixcbiAgICBpbml0aWFsVmFsdWU6IFIgfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4gICkge1xuICAgIHJldHVybiBmaWx0ZXJNYXAodGhpcywgZm4sIGluaXRpYWxWYWx1ZSlcbiAgfSxcbiAgbWFwLFxuICBmaWx0ZXIsXG4gIHVuaXF1ZSxcbiAgd2FpdEZvcixcbiAgbXVsdGksXG4gIGluaXRpYWxseSxcbiAgY29uc3VtZSxcbiAgbWVyZ2U8VCwgQSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxhbnk+PltdPih0aGlzOiBQYXJ0aWFsSXRlcmFibGU8VD4sIC4uLm06IEEpIHtcbiAgICByZXR1cm4gbWVyZ2UodGhpcywgLi4ubSk7XG4gIH0sXG4gIGNvbWJpbmU8VCwgUyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgb3RoZXJzOiBTKSB7XG4gICAgcmV0dXJuIGNvbWJpbmUoT2JqZWN0LmFzc2lnbih7ICdfdGhpcyc6IHRoaXMgfSwgb3RoZXJzKSk7XG4gIH1cbn07XG5cbmNvbnN0IGV4dHJhS2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGFzeW5jRXh0cmFzKSwgLi4uT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXSBhcyAoa2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzKVtdO1xuXG4vLyBMaWtlIE9iamVjdC5hc3NpZ24sIGJ1dCB0aGUgYXNzaWduZWQgcHJvcGVydGllcyBhcmUgbm90IGVudW1lcmFibGVcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbjxEIGV4dGVuZHMge30sIFMgZXh0ZW5kcyB7fT4oZDogRCwgczogUykge1xuICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHMpLCAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpXTtcbiAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgeyAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHMsIGspLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgfVxuICByZXR1cm4gZCBhcyBEICYgUztcbn1cblxuY29uc3QgX3BlbmRpbmcgPSBTeW1ib2woJ3BlbmRpbmcnKTtcbmNvbnN0IF9pdGVtcyA9IFN5bWJvbCgnaXRlbXMnKTtcbmZ1bmN0aW9uIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0ge1xuICAgIFtfcGVuZGluZ106IFtdIGFzIERlZmVycmVkUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxUPj5bXSB8IG51bGwsXG4gICAgW19pdGVtc106IFtdIGFzIEl0ZXJhdG9yUmVzdWx0PFQ+W10gfCBudWxsLFxuXG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBxIGFzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPjtcbiAgICB9LFxuXG4gICAgbmV4dCgpIHtcbiAgICAgIGlmIChxW19pdGVtc10/Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHFbX2l0ZW1zXS5zaGlmdCgpISk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgLy8gV2UgaW5zdGFsbCBhIGNhdGNoIGhhbmRsZXIgYXMgdGhlIHByb21pc2UgbWlnaHQgYmUgbGVnaXRpbWF0ZWx5IHJlamVjdCBiZWZvcmUgYW55dGhpbmcgd2FpdHMgZm9yIGl0LFxuICAgICAgLy8gYW5kIHRoaXMgc3VwcHJlc3NlcyB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIHdhcm5pbmcuXG4gICAgICB2YWx1ZS5jYXRjaChleCA9PiB7IH0pO1xuICAgICAgcVtfcGVuZGluZ10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHJldHVybih2PzogdW5rbm93bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIHRocm93KC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IGFyZ3NbMF0gfTtcbiAgICAgIGlmIChxW19wZW5kaW5nXSkge1xuICAgICAgICB0cnkgeyBzdG9wKCkgfSBjYXRjaCAoZXgpIHsgfVxuICAgICAgICB3aGlsZSAocVtfcGVuZGluZ10ubGVuZ3RoKVxuICAgICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZWplY3QodmFsdWUpO1xuICAgICAgICBxW19pdGVtc10gPSBxW19wZW5kaW5nXSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgIH0sXG5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgaWYgKCFxW19pdGVtc10pIHJldHVybiAtMTsgLy8gVGhlIHF1ZXVlIGhhcyBubyBjb25zdW1lcnMgYW5kIGhhcyB0ZXJtaW5hdGVkLlxuICAgICAgcmV0dXJuIHFbX2l0ZW1zXS5sZW5ndGg7XG4gICAgfSxcblxuICAgIHB1c2godmFsdWU6IFQpIHtcbiAgICAgIGlmICghcVtfcGVuZGluZ10pXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHFbX3BlbmRpbmddLmxlbmd0aCkge1xuICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2NhcmRpbmcgcXVldWUgcHVzaCBhcyB0aGVyZSBhcmUgbm8gY29uc3VtZXJzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKHEpO1xufVxuXG5jb25zdCBfaW5mbGlnaHQgPSBTeW1ib2woJ2luZmxpZ2h0Jyk7XG5mdW5jdGlvbiBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4oc3RvcCA9ICgpID0+IHsgfSkge1xuICBjb25zdCBxID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+PiAmIHsgW19pbmZsaWdodF06IFNldDxUPiB9O1xuICBxW19pbmZsaWdodF0gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgcS5wdXNoID0gZnVuY3Rpb24gKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERlYm91bmNlXG4gICAgaWYgKHFbX2luZmxpZ2h0XS5oYXModmFsdWUpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICBxW19pbmZsaWdodF0uYWRkKHZhbHVlKTtcbiAgICAgIGNvbnN0IHAgPSBxW19wZW5kaW5nXS5wb3AoKSE7XG4gICAgICBwLmZpbmFsbHkoKCkgPT4gcVtfaW5mbGlnaHRdLmRlbGV0ZSh2YWx1ZSkpO1xuICAgICAgcC5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXFbX2l0ZW1zXS5maW5kKHYgPT4gdi52YWx1ZSA9PT0gdmFsdWUpKSB7XG4gICAgICAgIHFbX2l0ZW1zXS5wdXNoKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcTtcbn1cblxuLy8gUmUtZXhwb3J0IHRvIGhpZGUgdGhlIGludGVybmFsc1xuZXhwb3J0IGNvbnN0IHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjtcbmV4cG9ydCBjb25zdCBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yOiA8VD4oc3RvcD86ICgpID0+IHZvaWQpID0+IFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+ID0gaW50ZXJuYWxEZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBPYmplY3RDb25zdHJ1Y3RvciB7XG4gICAgZGVmaW5lUHJvcGVydGllczxULCBNIGV4dGVuZHMgeyBbSzogc3RyaW5nIHwgc3ltYm9sXTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PiB9PihvOiBULCBwcm9wZXJ0aWVzOiBNICYgVGhpc1R5cGU8YW55Pik6IFQgJiB7XG4gICAgICBbSyBpbiBrZXlvZiBNXTogTVtLXSBleHRlbmRzIFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG4gICAgfTtcbiAgfVxufVxuXG4vKiBEZWZpbmUgYSBcIml0ZXJhYmxlIHByb3BlcnR5XCIgb24gYG9iamAuXG4gICBUaGlzIGlzIGEgcHJvcGVydHkgdGhhdCBob2xkcyBhIGJveGVkICh3aXRoaW4gYW4gT2JqZWN0KCkgY2FsbCkgdmFsdWUsIGFuZCBpcyBhbHNvIGFuIEFzeW5jSXRlcmFibGVJdGVyYXRvci4gd2hpY2hcbiAgIHlpZWxkcyB3aGVuIHRoZSBwcm9wZXJ0eSBpcyBzZXQuXG4gICBUaGlzIHJvdXRpbmUgY3JlYXRlcyB0aGUgZ2V0dGVyL3NldHRlciBmb3IgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSwgYW5kIG1hbmFnZXMgdGhlIGFhc3NvY2lhdGVkIGFzeW5jIGl0ZXJhdG9yLlxuKi9cblxuY29uc3QgX3Byb3hpZWRBc3luY0l0ZXJhdG9yID0gU3ltYm9sKCdfcHJveGllZEFzeW5jSXRlcmF0b3InKTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVJdGVyYWJsZVByb3BlcnR5PFQgZXh0ZW5kcyB7fSwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgZXh0cmFzW2tdID0gYltrIGFzIGtleW9mIHR5cGVvZiBiXSk7XG4gICAgaWYgKCEoX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIGEpKVxuICAgICAgYXNzaWduSGlkZGVuKGEsIGV4dHJhcyk7XG4gICAgcmV0dXJuIGI7XG4gIH1cblxuICAvLyBDcmVhdGUgc3R1YnMgdGhhdCBsYXppbHkgY3JlYXRlIHRoZSBBc3luY0V4dHJhSXRlcmFibGUgaW50ZXJmYWNlIHdoZW4gaW52b2tlZFxuICBmdW5jdGlvbiBsYXp5QXN5bmNNZXRob2Q8TSBleHRlbmRzIGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcz4obWV0aG9kOiBNKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFttZXRob2RdOiBmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICB0eXBlIEhlbHBlckRlc2NyaXB0b3JzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIEFzeW5jRXh0cmFJdGVyYWJsZTxUPl06IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFzeW5jRXh0cmFJdGVyYWJsZTxUPltLXT5cbiAgfSAmIHtcbiAgICBbSXRlcmFiaWxpdHldPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8J3NoYWxsb3cnPlxuICB9O1xuXG4gIGNvbnN0IGV4dHJhcyA9IHsgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogaW5pdEl0ZXJhdG9yIH0gYXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+ICYgeyBbSXRlcmFiaWxpdHldPzogJ3NoYWxsb3cnIH07XG4gIGV4dHJhS2V5cy5mb3JFYWNoKChrKSA9PiAvLyBAdHMtaWdub3JlXG4gICAgZXh0cmFzW2tdID0gbGF6eUFzeW5jTWV0aG9kKGspKVxuICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgJiYgSXRlcmFiaWxpdHkgaW4gdiAmJiB2W0l0ZXJhYmlsaXR5XSA9PT0gJ3NoYWxsb3cnKSB7XG4gICAgZXh0cmFzW0l0ZXJhYmlsaXR5XSA9IHZbSXRlcmFiaWxpdHldO1xuICB9XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemUgYHB1c2hgXG4gIGxldCBwdXNoOiBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxWPlsncHVzaCddID0gKHY6IFYpID0+IHtcbiAgICBpbml0SXRlcmF0b3IoKTsgLy8gVXBkYXRlcyBgcHVzaGAgdG8gcmVmZXJlbmNlIHRoZSBtdWx0aS1xdWV1ZVxuICAgIHJldHVybiBwdXNoKHYpO1xuICB9XG5cbiAgbGV0IGEgPSBib3godiwgZXh0cmFzKTtcbiAgbGV0IHBpcGVkOiBBc3luY0l0ZXJhYmxlPFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICBnZXQoKTogViB7IHJldHVybiBhIH0sXG4gICAgc2V0KHY6IFYgfCBBc3luY0V4dHJhSXRlcmFibGU8Vj4pIHtcbiAgICAgIGlmICh2ICE9PSBhKSB7XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUodikpIHtcbiAgICAgICAgICAvLyBBc3NpZ25pbmcgbXVsdGlwbGUgYXN5bmMgaXRlcmF0b3JzIHRvIGEgc2luZ2xlIGl0ZXJhYmxlIGlzIHByb2JhYmx5IGFcbiAgICAgICAgICAvLyBiYWQgaWRlYSBmcm9tIGEgcmVhc29uaW5nIHBvaW50IG9mIHZpZXcsIGFuZCBtdWx0aXBsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGU6XG4gICAgICAgICAgLy8gICogbWVyZ2U/XG4gICAgICAgICAgLy8gICogaWdub3JlIHN1YnNlcXVlbnQgYXNzaWdubWVudHM/XG4gICAgICAgICAgLy8gICogdGVybWluYXRlIHRoZSBmaXJzdCB0aGVuIGNvbnN1bWUgdGhlIHNlY29uZD9cbiAgICAgICAgICAvLyBUaGUgc29sdXRpb24gaGVyZSAob25lIG9mIG1hbnkgcG9zc2liaWxpdGllcykgaXMgdGhlIGxldHRlcjogb25seSB0byBhbGxvd1xuICAgICAgICAgIC8vIG1vc3QgcmVjZW50IGFzc2lnbm1lbnQgdG8gd29yaywgdGVybWluYXRpbmcgYW55IHByZWNlZWRpbmcgaXRlcmF0b3Igd2hlbiBpdCBuZXh0XG4gICAgICAgICAgLy8geWllbGRzIGFuZCBmaW5kcyB0aGlzIGNvbnN1bWVyIGhhcyBiZWVuIHJlLWFzc2lnbmVkLlxuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZXJhdG9yIGhhcyBiZWVuIHJlYXNzaWduZWQgd2l0aCBubyBjaGFuZ2UsIGp1c3QgaWdub3JlIGl0LCBhcyB3ZSdyZSBhbHJlYWR5IGNvbnN1bWluZyBpdFxuICAgICAgICAgIGlmIChwaXBlZCA9PT0gdilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHBpcGVkID0gdjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYsIHkgPT4ge1xuICAgICAgICAgICAgaWYgKHYgIT09IHBpcGVkKSB7XG4gICAgICAgICAgICAgIC8vIFdlJ3JlIGJlaW5nIHBpcGVkIGZyb20gc29tZXRoaW5nIGVsc2UuIFdlIHdhbnQgdG8gc3RvcCB0aGF0IG9uZSBhbmQgZ2V0IHBpcGVkIGZyb20gdGhpcyBvbmVcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaXBlZCBpdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGhhcyBiZWVuIHJlcGxhY2VkIGJ5IGFub3RoZXIgaXRlcmF0b3JgLCB7IGNhdXNlOiBzdGFjayB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB1c2goeT8udmFsdWVPZigpIGFzIFYpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChleCA9PiBjb25zb2xlLmluZm8oZXgpKVxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LFxuICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfVxuICAgICAgfSksIHBkcyk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdChhKSwgT2JqZWN0LmFzc2lnbihwZHMsIHtcbiAgICAgICAgICB0b0pTT04oKSB7IHJldHVybiBhLnZhbHVlT2YoKSB9XG4gICAgICAgIH0pKTtcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8vIFdlIGJveCBvYmplY3RzIGJ5IGNyZWF0aW5nIGEgUHJveHkgZm9yIHRoZSBvYmplY3QgdGhhdCBwdXNoZXMgb24gZ2V0L3NldC9kZWxldGUsIGFuZCBtYXBzIHRoZSBzdXBwbGllZCBhc3luYyBpdGVyYXRvciB0byBwdXNoIHRoZSBzcGVjaWZpZWQga2V5XG4gICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAvLyBoYW5kbGUgdGhlIGdldC9zZXQvc2VsZXRlIGluIHBsYWNlIG9mIHRoZSB1c3VhbCBwcmltaXRpdmUgYm94aW5nIHZpYSBPYmplY3QocHJpbWl0aXZlVmFsdWUpXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB8IG51bGwgfSB9O1xuICB0eXBlIFBvc3NpYmx5V2l0aFBhdGggPSBWIHwgV2l0aFBhdGg7XG4gIGZ1bmN0aW9uIGlzUHJveGllZEFzeW5jSXRlcmF0b3IobzogUG9zc2libHlXaXRoUGF0aCk6IG8gaXMgV2l0aFBhdGgge1xuICAgIHJldHVybiBpc09iamVjdExpa2UobykgJiYgX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIG87XG4gIH1cbiAgZnVuY3Rpb24gZGVzdHJ1Y3R1cmUobzogYW55LCBwYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmaWVsZHMgPSBwYXRoLnNwbGl0KCcuJykuc2xpY2UoMSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoICYmICgobyA9IG8/LltmaWVsZHNbaV1dKSAhPT0gdW5kZWZpbmVkKTsgaSsrKTtcbiAgICByZXR1cm4gbztcbiAgfVxuICBmdW5jdGlvbiBib3hPYmplY3QoYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8UG9zc2libHlXaXRoUGF0aD4pIHtcbiAgICBsZXQgd2l0aFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxXaXRoUGF0aFt0eXBlb2YgX3Byb3hpZWRBc3luY0l0ZXJhdG9yXT47XG4gICAgbGV0IHdpdGhvdXRQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG4gICAgcmV0dXJuIG5ldyBQcm94eShhIGFzIG9iamVjdCwgaGFuZGxlcigpKSBhcyBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihwYXRoID0gJycpOiBQcm94eUhhbmRsZXI8b2JqZWN0PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBBIGJveGVkIG9iamVjdCBoYXMgaXRzIG93biBrZXlzLCBhbmQgdGhlIGtleXMgb2YgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlXG4gICAgICAgIGhhcyh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIHJldHVybiBrZXkgPT09IF9wcm94aWVkQXN5bmNJdGVyYXRvciB8fCBrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSB8fCBrZXkgaW4gdGFyZ2V0IHx8IGtleSBpbiBwZHM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gYSBrZXkgaXMgc2V0IGluIHRoZSB0YXJnZXQsIHB1c2ggdGhlIGNoYW5nZVxuICAgICAgICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0ICR7bmFtZS50b1N0cmluZygpfSR7cGF0aH0uJHtrZXkudG9TdHJpbmcoKX0gYXMgaXQgaXMgcGFydCBvZiBhc3luY0l0ZXJhdG9yYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICBpZiAoUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBnZXR0aW5nIHRoZSB2YWx1ZSBvZiBhIGJveGVkIG9iamVjdCBtZW1iZXIsIHByZWZlciBhc3luY0V4dHJhSXRlcmFibGUgb3ZlciB0YXJnZXQga2V5c1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhbiBhc3luY0V4dHJhSXRlcmFibGUgbWVtYmVyLCBjcmVhdGUgdGhlIG1hcHBlZCBxdWV1ZSB0byBnZW5lcmF0ZSBpdFxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICB3aXRob3V0UGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHdpdGhvdXRQYXRoW2tleSBhcyBrZXlvZiB0eXBlb2YgcGRzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdpdGhQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0gOiB7IGE6IG8sIHBhdGg6IG51bGwgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aCA9PT0gbnVsbCB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmU7XG4gICAgICAgICAgICAgIH0sIElnbm9yZSwgZGVzdHJ1Y3R1cmUoYSwgcGF0aCkpO1xuICAgICAgICAgICAgICByZXR1cm4gYWlba2V5IGFzIGtleW9mIHR5cGVvZiBhaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhIHRhcmdldCBwcm9wZXJ0eSwgY3JlYXRlIHRoZSBwcm94eSB0byBoYW5kbGUgaXRcbiAgICAgICAgICBpZiAoa2V5ID09PSAndmFsdWVPZicpIHJldHVybiAoKSA9PiBkZXN0cnVjdHVyZShhLCBwYXRoKTtcbiAgICAgICAgICBpZiAoa2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUpIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSwgc2luY2UgU3ltYm9sLnRvUHJpbWl0aXZlIGlzIGluIGhhKCksIHdlIG5lZWQgdG8gaW1wbGVtZW50IGl0XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGhpbnQ/OiAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgIGlmIChSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCB0YXJnZXQpLmNhbGwodGFyZ2V0LCBoaW50KTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gdGFyZ2V0LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnbnVtYmVyJykgcmV0dXJuIE51bWJlcih0YXJnZXQpO1xuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoKCEoa2V5IGluIHRhcmdldCkgfHwgT2JqZWN0Lmhhc093bih0YXJnZXQsIGtleSkpICYmICEoSXRlcmFiaWxpdHkgaW4gdGFyZ2V0ICYmIHRhcmdldFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBmaWVsZCA9PT0gJ2Z1bmN0aW9uJykgfHwgaXNBc3luY0l0ZXIoZmllbGQpXG4gICAgICAgICAgICAgICAgPyBmaWVsZFxuICAgICAgICAgICAgICAgIDogbmV3IFByb3h5KE9iamVjdChmaWVsZCksIGhhbmRsZXIocGF0aCArICcuJyArIGtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaGlzIGlzIGEgc3ltYm9saWMgZW50cnksIG9yIGEgcHJvdG90eXBpY2FsIHZhbHVlIChzaW5jZSBpdCdzIGluIHRoZSB0YXJnZXQsIGJ1dCBub3QgYSB0YXJnZXQgcHJvcGVydHkpXG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLypcbiAgRXh0ZW5zaW9ucyB0byB0aGUgQXN5bmNJdGVyYWJsZTpcbiovXG5jb25zdCBmb3JldmVyID0gbmV3IFByb21pc2U8YW55PigoKSA9PiB7IH0pO1xuXG4vKiBNZXJnZSBhc3luY0l0ZXJhYmxlcyBpbnRvIGEgc2luZ2xlIGFzeW5jSXRlcmFibGUgKi9cblxuLyogVFMgaGFjayB0byBleHBvc2UgdGhlIHJldHVybiBBc3luY0dlbmVyYXRvciBhIGdlbmVyYXRvciBvZiB0aGUgdW5pb24gb2YgdGhlIG1lcmdlZCB0eXBlcyAqL1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPiA9IFRbXSBleHRlbmRzIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxpbmZlciBVPj5bXSA/IFUgOiBuZXZlcjtcbnR5cGUgQ29sbGFwc2VJdGVyYWJsZVR5cGVzPFQ+ID0gQXN5bmNJdGVyYWJsZTxDb2xsYXBzZUl0ZXJhYmxlVHlwZTxUPj47XG5cbmV4cG9ydCBjb25zdCBtZXJnZSA9IDxBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFRZaWVsZD4gfCBBc3luY0l0ZXJhdG9yPFRZaWVsZCwgVFJldHVybiwgVE5leHQ+PltdLCBUWWllbGQsIFRSZXR1cm4sIFROZXh0PiguLi5haTogQSkgPT4ge1xuICBjb25zdCBpdDogKHVuZGVmaW5lZCB8IEFzeW5jSXRlcmF0b3I8YW55PilbXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx7IGlkeDogbnVtYmVyLCByZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT5bXSA9IG5ldyBBcnJheShhaS5sZW5ndGgpO1xuXG4gIGxldCBpbml0ID0gKCkgPT4ge1xuICAgIGluaXQgPSAoKSA9PiB7IH1cbiAgICBmb3IgKGxldCBuID0gMDsgbiA8IGFpLmxlbmd0aDsgbisrKSB7XG4gICAgICBjb25zdCBhID0gYWlbbl0gYXMgQXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0PjtcbiAgICAgIHByb21pc2VzW25dID0gKGl0W25dID0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYVxuICAgICAgICA/IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgICAgICAgOiBhIGFzIEFzeW5jSXRlcmF0b3I8YW55PilcbiAgICAgICAgLm5leHQoKVxuICAgICAgICAudGhlbihyZXN1bHQgPT4gKHsgaWR4OiBuLCByZXN1bHQgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IChUWWllbGQgfCBUUmV0dXJuKVtdID0gW107XG4gIGxldCBjb3VudCA9IHByb21pc2VzLmxlbmd0aDtcblxuICBjb25zdCBtZXJnZWQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxBW251bWJlcl0+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBtZXJnZWQgfSxcbiAgICBuZXh0KCkge1xuICAgICAgaW5pdCgpO1xuICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgID8gUHJvbWlzZS5yYWNlKHByb21pc2VzKS50aGVuKCh7IGlkeCwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gZm9yZXZlcjtcbiAgICAgICAgICAgIHJlc3VsdHNbaWR4XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHlpZWxkIGludGVybWVkaWF0ZSByZXR1cm4gdmFsdWVzLCB3ZSBqdXN0IGtlZXAgdGhlbSBpbiByZXN1bHRzXG4gICAgICAgICAgICAvLyByZXR1cm4geyBkb25lOiBjb3VudCA9PT0gMCwgdmFsdWU6IHJlc3VsdC52YWx1ZSB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLm5leHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYGV4YCBpcyB0aGUgdW5kZXJseWluZyBhc3luYyBpdGVyYXRpb24gZXhjZXB0aW9uXG4gICAgICAgICAgICBwcm9taXNlc1tpZHhdID0gaXRbaWR4XVxuICAgICAgICAgICAgICA/IGl0W2lkeF0hLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBpZHgsIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0gfSkpXG4gICAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHsgaWR4LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9IH0pXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgIHJldHVybiBtZXJnZWQudGhyb3c/LihleCkgPz8gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgZXhjZXB0aW9uXCIpIH0pO1xuICAgICAgICB9KVxuICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgcmV0dXJuKHIpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb21pc2VzW2ldICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgcHJvbWlzZXNbaV0gPSBmb3JldmVyO1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBhd2FpdCBpdFtpXT8ucmV0dXJuPy4oeyBkb25lOiB0cnVlLCB2YWx1ZTogciB9KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH0sXG4gICAgYXN5bmMgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvbWlzZXNbaV0gIT09IGZvcmV2ZXIpIHtcbiAgICAgICAgICBwcm9taXNlc1tpXSA9IGZvcmV2ZXI7XG4gICAgICAgICAgcmVzdWx0c1tpXSA9IGF3YWl0IGl0W2ldPy50aHJvdz8uKGV4KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgIC8vIHByZXZpb3VzbHk6IHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhtZXJnZWQgYXMgdW5rbm93biBhcyBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8QVtudW1iZXJdPik7XG59XG5cbnR5cGUgQ29tYmluZWRJdGVyYWJsZSA9IHsgW2s6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbF06IFBhcnRpYWxJdGVyYWJsZSB9O1xudHlwZSBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSB7XG4gIFtLIGluIGtleW9mIFNdPzogU1tLXSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlclxufTtcbnR5cGUgQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmVPcHRpb25zIHtcbiAgaWdub3JlUGFydGlhbD86IGJvb2xlYW47IC8vIFNldCB0byBhdm9pZCB5aWVsZGluZyBpZiBzb21lIHNvdXJjZXMgYXJlIGFic2VudFxufVxuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4oc3JjOiBTLCBvcHRzOiBDb21iaW5lT3B0aW9ucyA9IHt9KTogQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPiA9PiB7XG4gIGNvbnN0IGFjY3VtdWxhdGVkOiBDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPiA9IHt9O1xuICBsZXQgcGM6IFByb21pc2U8eyBpZHg6IG51bWJlciwgazogc3RyaW5nLCBpcjogSXRlcmF0b3JSZXN1bHQ8YW55PiB9PltdO1xuICBsZXQgc2k6IEFzeW5jSXRlcmF0b3I8YW55PltdID0gW107XG4gIGxldCBhY3RpdmU6IG51bWJlciA9IDA7XG4gIGNvbnN0IGNpID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBjaSB9LFxuICAgIG5leHQoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgIGlmIChwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBjID0gT2JqZWN0LmVudHJpZXMoc3JjKS5tYXAoKFtrLCBzaXRdLCBpZHgpID0+IHtcbiAgICAgICAgICBhY3RpdmUgKz0gMTtcbiAgICAgICAgICBzaVtpZHhdID0gc2l0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgICByZXR1cm4gc2lbaWR4XS5uZXh0KCkudGhlbihpciA9PiAoeyBzaSwgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGZ1bmN0aW9uIHN0ZXAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxDb21iaW5lZEl0ZXJhYmxlVHlwZTxTPj4+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShwYykudGhlbigoeyBpZHgsIGssIGlyIH0pID0+IHtcbiAgICAgICAgICBpZiAoaXIuZG9uZSkge1xuICAgICAgICAgICAgcGNbaWR4XSA9IGZvcmV2ZXI7XG4gICAgICAgICAgICBhY3RpdmUgLT0gMTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICAgICAgICByZXR1cm4gc3RlcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBhY2N1bXVsYXRlZFtrXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGNbaWR4XSA9IHNpW2lkeF0ubmV4dCgpLnRoZW4oaXIgPT4gKHsgaWR4LCBrLCBpciB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRzLmlnbm9yZVBhcnRpYWwpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY2N1bXVsYXRlZCkubGVuZ3RoIDwgT2JqZWN0LmtleXMoc3JjKS5sZW5ndGgpXG4gICAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogYWNjdW11bGF0ZWQgfTtcbiAgICAgICAgfSlcbiAgICAgIH0pKCk7XG4gICAgfSxcbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgcGMuZm9yRWFjaCgocCwgaWR4KSA9PiB7XG4gICAgICAgIGlmIChwICE9PSBmb3JldmVyKSB7XG4gICAgICAgICAgc2lbaWR4XS5yZXR1cm4/Lih2KVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdiB9KTtcbiAgICB9LFxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIHBjLmZvckVhY2goKHAsIGlkeCkgPT4ge1xuICAgICAgICBpZiAocCAhPT0gZm9yZXZlcikge1xuICAgICAgICAgIHNpW2lkeF0udGhyb3c/LihleClcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoY2kpO1xufVxuXG5cbmZ1bmN0aW9uIGlzRXh0cmFJdGVyYWJsZTxUPihpOiBhbnkpOiBpIGlzIEFzeW5jRXh0cmFJdGVyYWJsZTxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUoaSlcbiAgICAmJiBleHRyYUtleXMuZXZlcnkoayA9PiAoayBpbiBpKSAmJiAoaSBhcyBhbnkpW2tdID09PSBhc3luY0V4dHJhc1trXSk7XG59XG5cbi8vIEF0dGFjaCB0aGUgcHJlLWRlZmluZWQgaGVscGVycyBvbnRvIGFuIEFzeW5jSXRlcmFibGUgYW5kIHJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0IGNvcnJlY3RseSB0eXBlZFxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlSGVscGVyczxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PihhaTogQSk6IEEgJiBBc3luY0V4dHJhSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogdW5rbm93bj4ge1xuICBpZiAoIWlzRXh0cmFJdGVyYWJsZShhaSkpIHtcbiAgICBhc3NpZ25IaWRkZW4oYWksIGFzeW5jRXh0cmFzKTtcbiAgfVxuICByZXR1cm4gYWkgYXMgQSBleHRlbmRzIEFzeW5jSXRlcmFibGU8aW5mZXIgVD4gPyBBc3luY0V4dHJhSXRlcmFibGU8VD4gJiBBIDogbmV2ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRvckhlbHBlcnM8RyBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gUiwgUiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPihnOiBHKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczogUGFyYW1ldGVyczxHPik6IFJldHVyblR5cGU8Rz4ge1xuICAgIGNvbnN0IGFpID0gZyguLi5hcmdzKTtcbiAgICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKGFpKSBhcyBSZXR1cm5UeXBlPEc+O1xuICB9IGFzICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KSA9PiBSZXR1cm5UeXBlPEc+ICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFJldHVyblR5cGU8Rz4gZXh0ZW5kcyBBc3luY0dlbmVyYXRvcjxpbmZlciBUPiA/IFQgOiB1bmtub3duPlxufVxuXG4vKiBBc3luY0l0ZXJhYmxlIGhlbHBlcnMsIHdoaWNoIGNhbiBiZSBhdHRhY2hlZCB0byBhbiBBc3luY0l0ZXJhdG9yIHdpdGggYHdpdGhIZWxwZXJzKGFpKWAsIGFuZCBpbnZva2VkIGRpcmVjdGx5IGZvciBmb3JlaWduIGFzeW5jSXRlcmF0b3JzICovXG5cbi8qIHR5cGVzIHRoYXQgYWNjZXB0IFBhcnRpYWxzIGFzIHBvdGVudGlhbGx1IGFzeW5jIGl0ZXJhdG9ycywgc2luY2Ugd2UgcGVybWl0IHRoaXMgSU4gVFlQSU5HIHNvXG4gIGl0ZXJhYmxlIHByb3BlcnRpZXMgZG9uJ3QgY29tcGxhaW4gb24gZXZlcnkgYWNjZXNzIGFzIHRoZXkgYXJlIGRlY2xhcmVkIGFzIFYgJiBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8Vj4+XG4gIGR1ZSB0byB0aGUgc2V0dGVycyBhbmQgZ2V0dGVycyBoYXZpbmcgZGlmZmVyZW50IHR5cGVzLCBidXQgdW5kZWNsYXJhYmxlIGluIFRTIGR1ZSB0byBzeW50YXggbGltaXRhdGlvbnMgKi9cbnR5cGUgSGVscGVyQXN5bmNJdGVyYWJsZTxRIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+PiA9IEhlbHBlckFzeW5jSXRlcmF0b3I8UmVxdWlyZWQ8UT5bdHlwZW9mIFN5bWJvbC5hc3luY0l0ZXJhdG9yXT47XG50eXBlIEhlbHBlckFzeW5jSXRlcmF0b3I8Rj4gPVxuICBGIGV4dGVuZHMgKCkgPT4gQXN5bmNJdGVyYXRvcjxpbmZlciBUPlxuICA/IFQgOiBuZXZlcjtcblxuYXN5bmMgZnVuY3Rpb24gY29uc3VtZTxVIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+Pih0aGlzOiBVLCBmPzogKHU6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgbGFzdDogdW5kZWZpbmVkIHwgdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0gdW5kZWZpbmVkO1xuICBmb3IgYXdhaXQgKGNvbnN0IHUgb2YgdGhpcyBhcyBBc3luY0l0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+KSB7XG4gICAgbGFzdCA9IGY/Lih1KTtcbiAgfVxuICBhd2FpdCBsYXN0O1xufVxuXG50eXBlIE1hcHBlcjxVLCBSPiA9ICgobzogVSwgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUpID0+IE1heWJlUHJvbWlzZWQ8UiB8IHR5cGVvZiBJZ25vcmU+KTtcbnR5cGUgTWF5YmVQcm9taXNlZDxUPiA9IFByb21pc2VMaWtlPFQ+IHwgVDtcblxuLyogQSBnZW5lcmFsIGZpbHRlciAmIG1hcHBlciB0aGF0IGNhbiBoYW5kbGUgZXhjZXB0aW9ucyAmIHJldHVybnMgKi9cbmV4cG9ydCBjb25zdCBJZ25vcmUgPSBTeW1ib2woXCJJZ25vcmVcIik7XG5cbnR5cGUgUGFydGlhbEl0ZXJhYmxlPFQgPSBhbnk+ID0gUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bmM8WiwgUj4odjogTWF5YmVQcm9taXNlZDxaPiwgdGhlbjogKHY6IFopID0+IFIsIGV4Y2VwdDogKHg6IGFueSkgPT4gYW55KTogTWF5YmVQcm9taXNlZDxSPiB7XG4gIGlmIChpc1Byb21pc2VMaWtlKHYpKVxuICAgIHJldHVybiB2LnRoZW4odGhlbiwgZXhjZXB0KTtcbiAgdHJ5IHsgcmV0dXJuIHRoZW4odikgfSBjYXRjaCAoZXgpIHsgcmV0dXJuIGV4Y2VwdChleCkgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHNvdXJjZTogVSxcbiAgZm46IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPixcbiAgaW5pdGlhbFZhbHVlOiBSIHwgdHlwZW9mIElnbm9yZSA9IElnbm9yZSxcbiAgcHJldjogUiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PjtcbiAgY29uc3QgZmFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4gPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHtcbiAgICAgIHJldHVybiBmYWk7XG4gICAgfSxcblxuICAgIG5leHQoLi4uYXJnczogW10gfCBbdW5kZWZpbmVkXSkge1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSAhPT0gSWdub3JlKSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IGluaXRpYWxWYWx1ZSB9KTtcbiAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFI+PihmdW5jdGlvbiBzdGVwKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWFpKVxuICAgICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgYWkubmV4dCguLi5hcmdzKS50aGVuKFxuICAgICAgICAgIHAgPT4gcC5kb25lXG4gICAgICAgICAgICA/IChwcmV2ID0gSWdub3JlLCByZXNvbHZlKHApKVxuICAgICAgICAgICAgOiByZXNvbHZlU3luYyhmbihwLnZhbHVlLCBwcmV2KSxcbiAgICAgICAgICAgICAgZiA9PiBmID09PSBJZ25vcmVcbiAgICAgICAgICAgICAgICA/IHN0ZXAocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogcHJldiA9IGYgfSksXG4gICAgICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWx0ZXIgZnVuY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgICAgICAgYWkudGhyb3cgPyBhaS50aHJvdyhleCkgOiBhaS5yZXR1cm4/LihleCkgLy8gVGVybWluYXRlIHRoZSBzb3VyY2UgLSBmb3Igbm93IHdlIGlnbm9yZSB0aGUgcmVzdWx0IG9mIHRoZSB0ZXJtaW5hdGlvblxuICAgICAgICAgICAgICAgIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTsgLy8gVGVybWluYXRlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGFpLnRocm93ID8gYWkudGhyb3coZXgpIDogYWkucmV0dXJuPy4oZXgpOyAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAtIGZvciBub3cgd2UgaWdub3JlIHRoZSByZXN1bHQgb2YgdGhlIHRlcm1pbmF0aW9uXG4gICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgd2FudHMgdXMgdG8gZXhpdCB3aXRoIGFuIGV4Y2VwdGlvbi4gVGVsbCB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2VcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKHYgPT4gKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHY/LnZhbHVlIH0pKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+Pih0aGlzOiBVLCBpbml0VmFsdWU6IEkpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPiB8IEk+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBvID0+IG8sIGluaXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3I8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSwgY2I6IChkb25lOiAodmFsdWU6IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPikgPT4gdm9pZCkgPT4gdm9pZCk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBuZXcgUHJvbWlzZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PihyZXNvbHZlID0+IHsgY2IoKCkgPT4gcmVzb2x2ZShvKSk7IHJldHVybiBvIH0pKTtcbn1cblxuZnVuY3Rpb24gbXVsdGk8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZT4odGhpczogVSk6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHR5cGUgVCA9IEhlbHBlckFzeW5jSXRlcmFibGU8VT47XG4gIGNvbnN0IHNvdXJjZSA9IHRoaXM7XG4gIGxldCBjb25zdW1lcnMgPSAwO1xuICBsZXQgY3VycmVudDogRGVmZXJyZWRQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PFQsIGFueT4+O1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8VCwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBzb3VyY2UgaGFzIHByb2R1Y2VkIGEgbmV3IHJlc3VsdFxuICBmdW5jdGlvbiBzdGVwKGl0PzogSXRlcmF0b3JSZXN1bHQ8VCwgYW55Pikge1xuICAgIGlmIChpdCkgY3VycmVudC5yZXNvbHZlKGl0KTtcbiAgICBpZiAoaXQ/LmRvbmUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgYWkhLm5leHQoKVxuICAgICAgICAudGhlbihzdGVwKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGN1cnJlbnQucmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGVycm9yIH0pO1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1haTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICBjb25zdW1lcnMgKz0gMTtcbiAgICAgIHJldHVybiBtYWk7XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAoIWFpKSB7XG4gICAgICAgIGFpID0gc291cmNlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSEoKTtcbiAgICAgICAgc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIHRocm93KGV4OiBhbnkpIHtcbiAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgaWYgKGNvbnN1bWVycyA8IDEpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICBjb25zdW1lcnMgLT0gMTtcbiAgICAgIGlmIChjb25zdW1lcnMpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy50aHJvdyA/IGFpLnRocm93KGV4KSA6IGFpPy5yZXR1cm4/LihleCkpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfSxcblxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICAvLyBUaGUgY29uc3VtZXIgdG9sZCB1cyB0byByZXR1cm4sIHNvIHdlIG5lZWQgdG8gdGVybWluYXRlIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIG9ubHkgb25lXG4gICAgICBpZiAoY29uc3VtZXJzIDwgMSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmNJdGVyYXRvciBwcm90b2NvbCBlcnJvclwiKTtcbiAgICAgIGNvbnN1bWVycyAtPSAxO1xuICAgICAgaWYgKGNvbnN1bWVycylcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8ucmV0dXJuPy4odikpLnRoZW4odiA9PiAoeyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfSkpXG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1haSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50R2xvYmFsQXN5bmNHZW5lcmF0b3JzKCkge1xuICBsZXQgZyA9IChhc3luYyBmdW5jdGlvbiogKCkgeyB9KSgpO1xuICB3aGlsZSAoZykge1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGcsIFN5bWJvbC5hc3luY0l0ZXJhdG9yKTtcbiAgICBpZiAoZGVzYykge1xuICAgICAgaXRlcmFibGVIZWxwZXJzKGcpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGcgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZyk7XG4gIH1cbiAgaWYgKCFnKSB7XG4gICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGF1Z21lbnQgdGhlIHByb3RvdHlwZSBvZiBgKGFzeW5jIGZ1bmN0aW9uKigpKSgpYFwiKTtcbiAgfVxufVxuXG4iLCAiaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBpc1Byb21pc2VMaWtlIH0gZnJvbSAnLi9kZWZlcnJlZC5qcyc7XG5pbXBvcnQgeyBpdGVyYWJsZUhlbHBlcnMsIG1lcmdlLCBBc3luY0V4dHJhSXRlcmFibGUsIHF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5cbi8qXG4gIGB3aGVuKC4uLi4pYCBpcyBib3RoIGFuIEFzeW5jSXRlcmFibGUgb2YgdGhlIGV2ZW50cyBpdCBjYW4gZ2VuZXJhdGUgYnkgb2JzZXJ2YXRpb24sXG4gIGFuZCBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1hcCB0aG9zZSBldmVudHMgdG8gYSBzcGVjaWZpZWQgdHlwZSwgZWc6XG5cbiAgdGhpcy53aGVuKCdrZXl1cDojZWxlbWV0JykgPT4gQXN5bmNJdGVyYWJsZTxLZXlib2FyZEV2ZW50PlxuICB0aGlzLndoZW4oJyNlbGVtZXQnKShlID0+IGUudGFyZ2V0KSA9PiBBc3luY0l0ZXJhYmxlPEV2ZW50VGFyZ2V0PlxuKi9cbi8vIFZhcmFyZ3MgdHlwZSBwYXNzZWQgdG8gXCJ3aGVuXCJcbmV4cG9ydCB0eXBlIFdoZW5QYXJhbWV0ZXJzPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBSZWFkb25seUFycmF5PFxuICBBc3luY0l0ZXJhYmxlPGFueT5cbiAgfCBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuPjtcblxuLy8gVGhlIEl0ZXJhdGVkIHR5cGUgZ2VuZXJhdGVkIGJ5IFwid2hlblwiLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyc1xudHlwZSBXaGVuSXRlcmF0ZWRUeXBlPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4gPVxuICAoRXh0cmFjdDxTW251bWJlcl0sIEFzeW5jSXRlcmFibGU8YW55Pj4gZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIEk+ID8gdW5rbm93biBleHRlbmRzIEkgPyBuZXZlciA6IEkgOiBuZXZlcilcbiAgfCBFeHRyYWN0RXZlbnRzPEV4dHJhY3Q8U1tudW1iZXJdLCBzdHJpbmc+PlxuICB8IChFeHRyYWN0PFNbbnVtYmVyXSwgRWxlbWVudD4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnQpXG5cbnR5cGUgTWFwcGFibGVJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxhbnk+PiA9XG4gIEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGluZmVyIFQ+ID9cbiAgICBBICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+ICZcbiAgICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXI7XG5cbi8vIFRoZSBleHRlbmRlZCBpdGVyYXRvciB0aGF0IHN1cHBvcnRzIGFzeW5jIGl0ZXJhdG9yIG1hcHBpbmcsIGNoYWluaW5nLCBldGNcbmV4cG9ydCB0eXBlIFdoZW5SZXR1cm48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPiA9XG4gIE1hcHBhYmxlSXRlcmFibGU8XG4gICAgQXN5bmNFeHRyYUl0ZXJhYmxlPFxuICAgICAgV2hlbkl0ZXJhdGVkVHlwZTxTPj4+O1xuXG50eXBlIEVtcHR5T2JqZWN0ID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgbmV2ZXI+O1xuXG50eXBlIFNwZWNpYWxXaGVuRXZlbnRzID0ge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn07XG50eXBlIFdoZW5FdmVudHMgPSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAgJiBTcGVjaWFsV2hlbkV2ZW50cztcbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXI7XG5cbnR5cGUgRXZlbnROYW1lVW5pb248VCBleHRlbmRzIHN0cmluZz4gPSBUIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c1xuICA/IFRcbiAgOiBUIGV4dGVuZHMgYCR7aW5mZXIgUyBleHRlbmRzIGtleW9mIFdoZW5FdmVudHN9LCR7aW5mZXIgUn1gXG4gID8gRXZlbnROYW1lTGlzdDxSPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBTIHwgRXZlbnROYW1lTGlzdDxSPlxuICA6IG5ldmVyO1xuXG5cbnR5cGUgRXZlbnRBdHRyaWJ1dGUgPSBgJHtrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXB9YFxudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfCBgIyR7SURTfT5gIHwgYC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz47XG5cbnR5cGUgSXNWYWxpZFdoZW5TZWxlY3RvcjxTPlxuICA9IFMgZXh0ZW5kcyBWYWxpZFdoZW5TZWxlY3RvciA/IFMgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnROYW1lczxTPlxuICA9IFMgZXh0ZW5kcyBrZXlvZiBTcGVjaWFsV2hlbkV2ZW50cyA/IFNcbiAgOiBTIGV4dGVuZHMgYCR7aW5mZXIgVn06JHtDU1NJZGVudGlmaWVyfWBcbiAgPyBFdmVudE5hbWVVbmlvbjxWPiBleHRlbmRzIG5ldmVyID8gbmV2ZXIgOiBFdmVudE5hbWVVbmlvbjxWPlxuICA6IFMgZXh0ZW5kcyBDU1NJZGVudGlmaWVyXG4gID8gJ2NoYW5nZSdcbiAgOiBuZXZlcjtcblxudHlwZSBFeHRyYWN0RXZlbnRzPFM+ID0gV2hlbkV2ZW50c1tFeHRyYWN0RXZlbnROYW1lczxTPl07XG5cbi8qKiB3aGVuICoqL1xudHlwZSBFdmVudE9ic2VydmF0aW9uPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4gPSB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pPT52b2lkO1xuICB0ZXJtaW5hdGU6IChleDogRXJyb3IpPT52b2lkO1xuICBjb250YWluZXJSZWY6IFdlYWtSZWY8RWxlbWVudD5cbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGw7XG4gIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbjtcbn07XG5jb25zdCBldmVudE9ic2VydmF0aW9ucyA9IG5ldyBXZWFrTWFwPERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgTWFwPGtleW9mIFdoZW5FdmVudHMsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+Pj4oKTtcblxuZnVuY3Rpb24gZG9jRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4odGhpczogRG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pIHtcbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXModGhpcykpXG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KHRoaXMpIS5nZXQoZXYudHlwZSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXApO1xuICBpZiAob2JzZXJ2YXRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvIG9mIG9ic2VydmF0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBwdXNoLCB0ZXJtaW5hdGUsIGNvbnRhaW5lclJlZiwgc2VsZWN0b3IsIGluY2x1ZGVDaGlsZHJlbiB9ID0gbztcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gY29udGFpbmVyUmVmLmRlcmVmKCk7XG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBcIkNvbnRhaW5lciBgI1wiICsgY29udGFpbmVyPy5pZCArIFwiPlwiICsgKHNlbGVjdG9yIHx8ICcnKSArIFwiYCByZW1vdmVkIGZyb20gRE9NLiBSZW1vdmluZyBzdWJzY3JpcHRpb25cIjtcbiAgICAgICAgICBvYnNlcnZhdGlvbnMuZGVsZXRlKG8pO1xuICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGV2LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChpbmNsdWRlQ2hpbGRyZW4gPyBuLmNvbnRhaW5zKGV2LnRhcmdldCkgOiBldi50YXJnZXQgPT09IG4pICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gPyBjb250YWluZXIuY29udGFpbnMoZXYudGFyZ2V0KSA6IGV2LnRhcmdldCA9PT0gY29udGFpbmVyIClcbiAgICAgICAgICAgICAgICBwdXNoKGV2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRsZXNzPFQgZXh0ZW5kcyBzdHJpbmcgfCBudWxsPihzZWw6IFQpOiBUIGV4dGVuZHMgbnVsbCA/IHsgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9IDogeyBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIHNlbGVjdG9yOiBUIH0ge1xuICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSAhc2VsIHx8ICFzZWwuZW5kc1dpdGgoJz4nKVxuICByZXR1cm4geyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yOiBpbmNsdWRlQ2hpbGRyZW4gPyBzZWwgOiBzZWwuc2xpY2UoMCwtMSkgfSBhcyBhbnk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2hlblNlbGVjdG9yPEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4od2hhdDogSXNWYWxpZFdoZW5TZWxlY3RvcjxFdmVudE5hbWU+KTogdW5kZWZpbmVkIHwgW1JldHVyblR5cGU8dHlwZW9mIGNoaWxkbGVzcz4sIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0ge1xuICBjb25zdCBwYXJ0cyA9IHdoYXQuc3BsaXQoJzonKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzBdKSlcbiAgICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzBdKSxcImNoYW5nZVwiXTtcbiAgICByZXR1cm4gW3sgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9LCBwYXJ0c1swXSBhcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdO1xuICB9XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1sxXSkgJiYgIWlzQ1NTU2VsZWN0b3IocGFydHNbMF0pKVxuICAgIHJldHVybiBbY2hpbGRsZXNzKHBhcnRzWzFdKSwgcGFydHNbMF0gYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRvVGhyb3cobWVzc2FnZTogc3RyaW5nKTpuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2hlbkV2ZW50PEV2ZW50TmFtZSBleHRlbmRzIHN0cmluZz4oY29udGFpbmVyOiBFbGVtZW50LCB3aGF0OiBJc1ZhbGlkV2hlblNlbGVjdG9yPEV2ZW50TmFtZT4pIHtcbiAgY29uc3QgW3sgaW5jbHVkZUNoaWxkcmVuLCBzZWxlY3Rvcn0sIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiK3doYXQpO1xuXG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKGNvbnRhaW5lci5vd25lckRvY3VtZW50KSlcbiAgICBldmVudE9ic2VydmF0aW9ucy5zZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQsIG5ldyBNYXAoKSk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5oYXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnRhaW5lci5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBkb2NFdmVudEhhbmRsZXIsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICBjYXB0dXJlOiB0cnVlXG4gICAgfSk7XG4gICAgZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuc2V0KGV2ZW50TmFtZSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8R2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW2tleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF0+KCgpID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCk/LmdldChldmVudE5hbWUpPy5kZWxldGUoZGV0YWlscykpO1xuXG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpfSxcbiAgICBjb250YWluZXJSZWY6IG5ldyBXZWFrUmVmKGNvbnRhaW5lciksXG4gICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgIHNlbGVjdG9yXG4gIH07XG5cbiAgY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXIsIHNlbGVjdG9yID8gW3NlbGVjdG9yXSA6IHVuZGVmaW5lZClcbiAgICAudGhlbihfID0+IGV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCk/LmdldChldmVudE5hbWUpIS5hZGQoZGV0YWlscykpO1xuXG4gIHJldHVybiBxdWV1ZS5tdWx0aSgpIDtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIGRvbmVJbW1lZGlhdGVseTxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBjb25zb2xlLmxvZyhcImRvbmVJbW1lZGlhdGVseVwiKTtcbiAgcmV0dXJuIHVuZGVmaW5lZCBhcyBaO1xufVxuXG5hc3luYyBmdW5jdGlvbiogbmV2ZXJHb25uYUhhcHBlbjxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICBjb25zb2xlLmxvZyhcIm5ldmVyR29ubmFIYXBwZW5cIik7XG4gIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHt9KTtcbiAgeWllbGQgdW5kZWZpbmVkIGFzIFo7IC8vIE5ldmVyIHNob3VsZCBiZSBleGVjdXRlZFxufVxuXG4vKiBTeW50YWN0aWMgc3VnYXI6IGNoYWluQXN5bmMgZGVjb3JhdGVzIHRoZSBzcGVjaWZpZWQgaXRlcmF0b3Igc28gaXQgY2FuIGJlIG1hcHBlZCBieVxuICBhIGZvbGxvd2luZyBmdW5jdGlvbiwgb3IgdXNlZCBkaXJlY3RseSBhcyBhbiBpdGVyYWJsZSAqL1xuZnVuY3Rpb24gY2hhaW5Bc3luYzxBIGV4dGVuZHMgQXN5bmNFeHRyYUl0ZXJhYmxlPFg+LCBYPihzcmM6IEEpOiBNYXBwYWJsZUl0ZXJhYmxlPEE+IHtcbiAgZnVuY3Rpb24gbWFwcGFibGVBc3luY0l0ZXJhYmxlKG1hcHBlcjogUGFyYW1ldGVyczx0eXBlb2Ygc3JjLm1hcD5bMF0pIHtcbiAgICByZXR1cm4gc3JjLm1hcChtYXBwZXIpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaXRlcmFibGVIZWxwZXJzKG1hcHBhYmxlQXN5bmNJdGVyYWJsZSBhcyB1bmtub3duIGFzIEFzeW5jSXRlcmFibGU8QT4pLCB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3JjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpXG4gIH0pIGFzIE1hcHBhYmxlSXRlcmFibGU8QT47XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRXaGVuU2VsZWN0b3Iod2hhdDogV2hlblBhcmFtZXRlcnNbbnVtYmVyXSk6IHdoYXQgaXMgVmFsaWRXaGVuU2VsZWN0b3Ige1xuICBpZiAoIXdoYXQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWxzeSBhc3luYyBzb3VyY2Ugd2lsbCBuZXZlciBiZSByZWFkeVxcblxcbicgKyBKU09OLnN0cmluZ2lmeSh3aGF0KSk7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ3N0cmluZycgJiYgd2hhdFswXSAhPT0gJ0AnICYmIEJvb2xlYW4ocGFyc2VXaGVuU2VsZWN0b3Iod2hhdCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiogb25jZTxUPihwOiBQcm9taXNlPFQ+KSB7XG4gIHlpZWxkIHA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuPFMgZXh0ZW5kcyBXaGVuUGFyYW1ldGVycz4oY29udGFpbmVyOiBFbGVtZW50LCAuLi5zb3VyY2VzOiBTKTogV2hlblJldHVybjxTPiB7XG4gIGlmICghc291cmNlcyB8fCBzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjaGFpbkFzeW5jKHdoZW5FdmVudChjb250YWluZXIsIFwiY2hhbmdlXCIpKSBhcyB1bmtub3duIGFzIFdoZW5SZXR1cm48Uz47XG4gIH1cblxuICBjb25zdCBpdGVyYXRvcnMgPSBzb3VyY2VzLmZpbHRlcih3aGF0ID0+IHR5cGVvZiB3aGF0ICE9PSAnc3RyaW5nJyB8fCB3aGF0WzBdICE9PSAnQCcpLm1hcCh3aGF0ID0+IHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJ1xuICAgID8gd2hlbkV2ZW50KGNvbnRhaW5lciwgd2hhdClcbiAgICA6IHdoYXQgaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICA/IHdoZW5FdmVudCh3aGF0LCBcImNoYW5nZVwiKVxuICAgICAgOiBpc1Byb21pc2VMaWtlKHdoYXQpXG4gICAgICAgID8gb25jZSh3aGF0KVxuICAgICAgICA6IHdoYXQpO1xuXG4gIGlmIChzb3VyY2VzLmluY2x1ZGVzKCdAc3RhcnQnKSkge1xuICAgIGNvbnN0IHN0YXJ0OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8e30+ID0ge1xuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTogKCkgPT4gc3RhcnQsXG4gICAgICBuZXh0KCkge1xuICAgICAgICBzdGFydC5uZXh0ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZCB9KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiB7fSB9KVxuICAgICAgfVxuICAgIH07XG4gICAgaXRlcmF0b3JzLnB1c2goc3RhcnQpO1xuICB9XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0ByZWFkeScpKSB7XG4gICAgY29uc3Qgd2F0Y2hTZWxlY3RvcnMgPSBzb3VyY2VzLmZpbHRlcihpc1ZhbGlkV2hlblNlbGVjdG9yKS5tYXAod2hhdCA9PiBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KT8uWzBdKTtcblxuICAgIGZ1bmN0aW9uIGlzTWlzc2luZyhzZWw6IENTU0lkZW50aWZpZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc2VsIGlzIENTU0lkZW50aWZpZXIge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odHlwZW9mIHNlbCA9PT0gJ3N0cmluZycgJiYgIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5tYXAodyA9PiB3Py5zZWxlY3RvcikuZmlsdGVyKGlzTWlzc2luZyk7XG5cbiAgICBsZXQgZXZlbnRzOiBBc3luY0l0ZXJhdG9yPGFueSwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy50aHJvdykgcmV0dXJuIGV2ZW50cy50aHJvdyhleCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICB9LFxuICAgICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8ucmV0dXJuKSByZXR1cm4gZXZlbnRzLnJldHVybih2KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgfSxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGlmIChldmVudHMpIHJldHVybiBldmVudHMubmV4dCgpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgbWlzc2luZykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgID8gbWVyZ2UoLi4uaXRlcmF0b3JzKVxuICAgICAgICAgIDogaXRlcmF0b3JzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgIDogdW5kZWZpbmVkOy8vKG5ldmVyR29ubmFIYXBwZW48V2hlbkl0ZXJhdGVkVHlwZTxTPj4oKSk7XG5cbiAgICAgICAgICAvLyBOb3cgZXZlcnl0aGluZyBpcyByZWFkeSwgd2Ugc2ltcGx5IGRlbGVnYXRlIGFsbCBhc3luYyBvcHMgdG8gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICAvLyBtZXJnZWQgYXN5bmNJdGVyYXRvciBcImV2ZW50c1wiXG4gICAgICAgICAgZXZlbnRzID0gbWVyZ2VkPy5bU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAoZG9uZUltbWVkaWF0ZWx5PFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGZ1bmN0aW9uIGVsZW1lbnRJc0luRE9NKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChjb250YWluZXIuaXNDb25uZWN0ZWQpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICBsZXQgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuICAgICAgcmVqZWN0ID0gX3JlamVjdDtcbiAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IHIuYWRkZWROb2Rlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgIGlmIChjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZHMuc29tZShyID0+IFsuLi5yLnJlbW92ZWROb2Rlc10uaW5jbHVkZXMoY29udGFpbmVyKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgX3JlamVjdChuZXcgRXJyb3IoXCJSZW1vdmVkIGZyb20gRE9NXCIpKTtcbiAgICAgICAgfVxuICAgICAgfSkub2JzZXJ2ZShjb250YWluZXIub3duZXJEb2N1bWVudC5ib2R5LCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgICAgfSlcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvXkVycm9yLywgYEVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHM6YCk7XG4gICAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKHN0YWNrICsgXCJcXG5cIiArIGNvbnRhaW5lci5vdXRlckhUTUwpO1xuICAgICAgICAvL3JlamVjdChuZXcgRXJyb3IoXCJFbGVtZW50IG5vdCBtb3VudGVkIGFmdGVyIDUgc2Vjb25kc1wiKSk7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsbFNlbGVjdG9yc1ByZXNlbnQobWlzc2luZzogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBtaXNzaW5nID0gbWlzc2luZy5maWx0ZXIoc2VsID0+ICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKVxuICAgIGlmICghbWlzc2luZy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90aGluZyBpcyBtaXNzaW5nXG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICBpZiAocmVjb3Jkcy5zb21lKHIgPT4gci5hZGRlZE5vZGVzPy5sZW5ndGgpKSB7XG4gICAgICAgIGlmIChtaXNzaW5nLmV2ZXJ5KHNlbCA9PiBjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKSkge1xuICAgICAgICAgIG11dGF0aW9uLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5vYnNlcnZlKGNvbnRhaW5lciwge1xuICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgIH0pKTtcblxuICAgIC8qIGRlYnVnZ2luZyBoZWxwOiB3YXJuIGlmIHdhaXRpbmcgYSBsb25nIHRpbWUgZm9yIGEgc2VsZWN0b3JzIHRvIGJlIHJlYWR5ICovXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgTWlzc2luZyBzZWxlY3RvcnMgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHM6IGApID8/ICc/Pyc7XG4gICAgICBjb25zdCB3YXJuVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKHN0YWNrICsgbWlzc2luZyArIFwiXFxuXCIpO1xuICAgICAgfSwgdGltZU91dFdhcm4pO1xuXG4gICAgICBwcm9taXNlLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHdhcm5UaW1lcikpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbiAgaWYgKHNlbGVjdG9ycz8ubGVuZ3RoKVxuICAgIHJldHVybiBlbGVtZW50SXNJbkRPTSgpLnRoZW4oKCkgPT4gYWxsU2VsZWN0b3JzUHJlc2VudChzZWxlY3RvcnMpKVxuICByZXR1cm4gZWxlbWVudElzSW5ET00oKTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcywgSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH0gZnJvbSBcIi4vaXRlcmF0b3JzLmpzXCI7XG5pbXBvcnQgdHlwZSB7IFVuaXF1ZUlEIH0gZnJvbSBcIi4vYWktdWkuanNcIjtcblxuZXhwb3J0IHR5cGUgQ2hpbGRUYWdzID0gTm9kZSAvLyBUaGluZ3MgdGhhdCBhcmUgRE9NIG5vZGVzIChpbmNsdWRpbmcgZWxlbWVudHMpXG4gIHwgbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiAvLyBUaGluZ3MgdGhhdCBjYW4gYmUgY29udmVydGVkIHRvIHRleHQgbm9kZXMgdmlhIHRvU3RyaW5nXG4gIHwgdW5kZWZpbmVkIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIHwgdHlwZW9mIElnbm9yZSAvLyBBIHZhbHVlIHRoYXQgd29uJ3QgZ2VuZXJhdGUgYW4gZWxlbWVudFxuICAvLyBOQjogd2UgY2FuJ3QgY2hlY2sgdGhlIGNvbnRhaW5lZCB0eXBlIGF0IHJ1bnRpbWUsIHNvIHdlIGhhdmUgdG8gYmUgbGliZXJhbFxuICAvLyBhbmQgd2FpdCBmb3IgdGhlIGRlLWNvbnRhaW5tZW50IHRvIGZhaWwgaWYgaXQgdHVybnMgb3V0IHRvIG5vdCBiZSBhIGBDaGlsZFRhZ3NgXG4gIHwgQXN5bmNJdGVyYWJsZTxDaGlsZFRhZ3M+IHwgQXN5bmNJdGVyYXRvcjxDaGlsZFRhZ3M+IHwgUHJvbWlzZUxpa2U8Q2hpbGRUYWdzPiAvLyBUaGluZ3MgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW55IG9mIHRoZSBhYm92ZVxuICB8IEFycmF5PENoaWxkVGFncz5cbiAgfCBJdGVyYWJsZTxDaGlsZFRhZ3M+OyAvLyBJdGVyYWJsZSB0aGluZ3MgdGhhdCBob2xkIHRoZSBhYm92ZSwgbGlrZSBBcnJheXMsIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdFxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD47XG5cbmV4cG9ydCB0eXBlIFBvc3NpYmx5QXN5bmM8WD4gPVxuICBbWF0gZXh0ZW5kcyBbb2JqZWN0XSAvLyBOb3QgXCJuYWtlZFwiIHRvIHByZXZlbnQgdW5pb24gZGlzdHJpYnV0aW9uXG4gID8gWCBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBVPlxuICA/IFBvc3NpYmx5QXN5bmM8VT5cbiAgOiBYIGV4dGVuZHMgRnVuY3Rpb25cbiAgPyBYIHwgQXN5bmNBdHRyPFg+XG4gIDogQXN5bmNBdHRyPFBhcnRpYWw8WD4+IHwgeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT47IH1cbiAgOiBYIHwgQXN5bmNBdHRyPFg+IHwgdW5kZWZpbmVkO1xuXG50eXBlIERlZXBQYXJ0aWFsPFg+ID0gW1hdIGV4dGVuZHMgW29iamVjdF0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFg7XG5cbmV4cG9ydCB0eXBlIEluc3RhbmNlPFQgPSB7fT4gPSB7IFtVbmlxdWVJRF06IHN0cmluZyB9ICYgVDtcblxuLy8gSW50ZXJuYWwgdHlwZXMgc3VwcG9ydGluZyBUYWdDcmVhdG9yXG50eXBlIEFzeW5jR2VuZXJhdGVkT2JqZWN0PFggZXh0ZW5kcyBvYmplY3Q+ID0ge1xuICBbSyBpbiBrZXlvZiBYXTogWFtLXSBleHRlbmRzIEFzeW5jQXR0cjxpbmZlciBWYWx1ZT4gPyBWYWx1ZSA6IFhbS11cbn1cblxudHlwZSBJRFM8ST4gPSBJIGV4dGVuZHMge30gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBJW0pdIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4gPyBSZXR1cm5UeXBlPElbSl0+IDogbmV2ZXI7XG4gIH1cbn0gOiB7IGlkczoge30gfVxuXG50eXBlIFJlVHlwZWRFdmVudEhhbmRsZXJzPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogSyBleHRlbmRzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNcbiAgICA/IEV4Y2x1ZGU8R2xvYmFsRXZlbnRIYW5kbGVyc1tLXSwgbnVsbD4gZXh0ZW5kcyAoZTogaW5mZXIgRSk9PmFueVxuICAgICAgPyAodGhpczogVCwgZTogRSk9PmFueSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIFJlYWRXcml0ZUF0dHJpYnV0ZXM8RSwgQmFzZSA9IEU+ID0gRSBleHRlbmRzIHsgYXR0cmlidXRlczogYW55IH1cbiAgPyAoT21pdDxFLCAnYXR0cmlidXRlcyc+ICYge1xuICAgIGdldCBhdHRyaWJ1dGVzKCk6IE5hbWVkTm9kZU1hcDtcbiAgICBzZXQgYXR0cmlidXRlcyh2OiBEZWVwUGFydGlhbDxQb3NzaWJseUFzeW5jPE9taXQ8QmFzZSwnYXR0cmlidXRlcyc+Pj4pO1xuICB9KVxuICA6IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4pXG5cbmV4cG9ydCB0eXBlIEZsYXR0ZW48Tz4gPSBbe1xuICBbSyBpbiBrZXlvZiBPXTogT1tLXVxufV1bbnVtYmVyXTtcblxuZXhwb3J0IHR5cGUgRGVlcEZsYXR0ZW48Tz4gPSBbe1xuICBbSyBpbiBrZXlvZiBPXTogRmxhdHRlbjxPW0tdPlxufV1bbnVtYmVyXTtcblxudHlwZSBOZXZlckVtcHR5PE8gZXh0ZW5kcyBvYmplY3Q+ID0ge30gZXh0ZW5kcyBPID8gbmV2ZXIgOiBPO1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCO1xuXG50eXBlIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXMsIFJlc3VsdCA9IG5ldmVyPlxuICA9IChPdmVybGFwcGluZ0tleXM8RFsnb3ZlcnJpZGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydkZWNsYXJlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PlxuICApIGV4dGVuZHMgbmV2ZXJcbiAgPyBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gZXh0ZW5kcyBuZXZlclxuICAgID8gUmVzdWx0XG4gICAgOiB7ICdgb3ZlcnJpZGVgIGhhcyBwcm9wZXJ0aWVzIG5vdCBpbiB0aGUgYmFzZSB0YWcgb3Igb2YgdGhlIHdyb25nIHR5cGUsIGFuZCBzaG91bGQgbWF0Y2gnOiBFeGNlc3NLZXlzPERbJ292ZXJyaWRlJ10sIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4gfVxuICA6IE9taXRUeXBlPHtcbiAgICAnYGRlY2xhcmVgIGNsYXNoZXMgd2l0aCBiYXNlIHByb3BlcnRpZXMnOiBPdmVybGFwcGluZ0tleXM8RFsnZGVjbGFyZSddLFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+LCBrZXlvZiBCYXNlSXRlcmFibGVzPEJhc2VDcmVhdG9yPj4+LFxuICAgICdgaXRlcmFibGVgIGNsYXNoZXMgd2l0aCBgb3ZlcnJpZGVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnb3ZlcnJpZGUnXT4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT4sXG4gICAgJ2BvdmVycmlkZWAgY2xhc2hlcyB3aXRoIGBkZWNsYXJlYCc6IE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgfSwgbmV2ZXI+XG5cbmV4cG9ydCB0eXBlIE92ZXJyaWRlcyA9IHtcbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIGRlY2xhcmU/OiBvYmplY3Q7XG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIGlkcz86IHsgW2lkOiBzdHJpbmddOiBUYWdDcmVhdG9yRnVuY3Rpb248YW55PjsgfTtcbiAgc3R5bGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RlZCA9IHtcbiAgY29uc3RydWN0ZWQ6ICgpID0+IChDaGlsZFRhZ3MgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZCB8IENoaWxkVGFncz4pO1xufVxuLy8gSW5mZXIgdGhlIGVmZmVjdGl2ZSBzZXQgb2YgYXR0cmlidXRlcyBmcm9tIGFuIEV4VGFnQ3JlYXRvclxuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8VCBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9IFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8aW5mZXIgQmFzZUF0dHJzPlxuICA/IEJhc2VBdHRyc1xuICA6IG5ldmVyO1xuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQSwgaW5mZXIgQiwgaW5mZXIgRCBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX0Q+XG4gID8gQmFzZUl0ZXJhYmxlczxCPiBleHRlbmRzIG5ldmVyXG4gICAgPyBEWydpdGVyYWJsZSddIGV4dGVuZHMgdW5rbm93blxuICAgICAgPyB7fVxuICAgICAgOiBEWydpdGVyYWJsZSddXG4gICAgOiBCYXNlSXRlcmFibGVzPEI+ICYgRFsnaXRlcmFibGUnXVxuICA6IG5ldmVyO1xuXG50eXBlIENvbWJpbmVkTm9uSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcz4gPVxuICB7XG4gICAgaWRzOiA8XG4gICAgICBjb25zdCBLIGV4dGVuZHMga2V5b2YgRXhjbHVkZTxEWydpZHMnXSwgdW5kZWZpbmVkPiwgXG4gICAgICBjb25zdCBUQ0YgZXh0ZW5kcyBUYWdDcmVhdG9yRnVuY3Rpb248YW55PiA9IEV4Y2x1ZGU8RFsnaWRzJ10sIHVuZGVmaW5lZD5bS11cbiAgICA+KFxuICAgICAgYXR0cnM6eyBpZDogSyB9ICYgRXhjbHVkZTxQYXJhbWV0ZXJzPFRDRj5bMF0sIENoaWxkVGFncz4sXG4gICAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgICApID0+IFJldHVyblR5cGU8VENGPlxuICB9XG4gICYgRFsnZGVjbGFyZSddXG4gICYgRFsnb3ZlcnJpZGUnXVxuICAmIElEUzxEWydpZHMnXT5cbiAgJiBPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LCBrZXlvZiBEWydpdGVyYWJsZSddPjtcblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXM+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ107XG5cbmV4cG9ydCBjb25zdCBjYWxsU3RhY2tTeW1ib2wgPSBTeW1ib2woJ2NhbGxTdGFjaycpO1xuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3JDYWxsU3RhY2sgPSB7IFtjYWxsU3RhY2tTeW1ib2xdPzogT3ZlcnJpZGVzW10gfTtcblxuZXhwb3J0IHR5cGUgRXh0ZW5kVGFnRnVuY3Rpb24gPSAoYXR0cnM6IFRhZ0NyZWF0aW9uT3B0aW9ucyAmIENvbnN0cnVjdG9yQ2FsbFN0YWNrICYge1xuICBbazogc3RyaW5nXTogdW5rbm93bjtcbn0gfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gRWxlbWVudFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3Q+IHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIEQgZXh0ZW5kcyBPdmVycmlkZXM+ID1cbiAgVGFnQ29uc3R1Y3RvcjxCYXNlPiAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gICAgJiBBc3luY0dlbmVyYXRlZE9iamVjdDxDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlLEQ+PixcbiAgICBEWydkZWNsYXJlJ11cbiAgICAmIERbJ292ZXJyaWRlJ11cbiAgICAmIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD5cbiAgICAmIE9taXQ8VGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZT4sIGtleW9mIENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2UsRD4+XG4gID47XG5cbnR5cGUgU3RhdGljUmVmZXJlbmNlczxCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sIERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzPiA9IFBpY2tUeXBlPFxuICBEZWZpbml0aW9uc1snZGVjbGFyZSddXG4gICYgRGVmaW5pdGlvbnNbJ292ZXJyaWRlJ11cbiAgJiBUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPixcbiAgYW55XG4gID47XG5cbi8vIGB0aGlzYCBpbiB0aGlzLmV4dGVuZGVkKC4uLikgaXMgQmFzZUNyZWF0b3JcbmludGVyZmFjZSBFeHRlbmRlZFRhZyB7XG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9LFxuICAgIFRhZ0luc3RhbmNlID0gYW55XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IChpbnN0OlRhZ0luc3RhbmNlKSA9PiBTdXBwbGllZERlZmluaXRpb25zICYgVGhpc1R5cGU8Q29tYmluZWRUaGlzVHlwZTxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEJhc2VDcmVhdG9yLERlZmluaXRpb25zPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4sXG4gICAgICAgIEJhc2VDcmVhdG9yLFxuICAgICAgICBEZWZpbml0aW9ucyxcbiAgICAgICAgU3RhdGljUmVmZXJlbmNlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnM+XG4gICAgICA+XG4gICAgPlxuICA+XG5cbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge31cbiAgPih0aGlzOiBCYXNlQ3JlYXRvciwgXzogU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+PilcbiAgOiBDaGVja0NvbnN0cnVjdGVkUmV0dXJuPFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgICBDaGVja1Byb3BlcnR5Q2xhc2hlczxCYXNlQ3JlYXRvciwgRGVmaW5pdGlvbnMsXG4gICAgICBFeFRhZ0NyZWF0b3I8XG4gICAgICAgIEl0ZXJhYmxlUHJvcGVydGllczxDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxCYXNlQ3JlYXRvcixEZWZpbml0aW9ucz4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8QmFzZUNyZWF0b3IsRGVmaW5pdGlvbnM+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zPlxuICAgICAgPlxuICAgID5cbiAgPlxufVxuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG5TdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgeyBjb25zdHJ1Y3RlZDogYW55IH1cbiAgPyBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgQ29uc3RydWN0ZWRcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcImNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0aW9uT3B0aW9ucyA9IHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59O1xuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdO1xuLyogQSBUYWdDcmVhdG9yIGlzIGEgZnVuY3Rpb24gdGhhdCBvcHRpb25hbGx5IHRha2VzIGF0dHJpYnV0ZXMgJiBjaGlsZHJlbiwgYW5kIGNyZWF0ZXMgdGhlIHRhZ3MuXG4gIFRoZSBhdHRyaWJ1dGVzIGFyZSBQb3NzaWJseUFzeW5jLiBUaGUgcmV0dXJuIGhhcyBgY29uc3RydWN0b3JgIHNldCB0byB0aGlzIGZ1bmN0aW9uIChzaW5jZSBpdCBpbnN0YW50aWF0ZWQgaXQpXG4qL1xuZXhwb3J0IHR5cGUgVGFnQ3JlYXRvckZ1bmN0aW9uPEJhc2UgZXh0ZW5kcyBvYmplY3Q+ID0gKC4uLmFyZ3M6IFRhZ0NyZWF0b3JBcmdzPFBvc3NpYmx5QXN5bmM8UmVUeXBlZEV2ZW50SGFuZGxlcnM8QmFzZT4+ICYgVGhpc1R5cGU8UmVUeXBlZEV2ZW50SGFuZGxlcnM8QmFzZT4+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj47XG5cbi8qIEEgVGFnQ3JlYXRvciBpcyBUYWdDcmVhdG9yRnVuY3Rpb24gZGVjb3JhdGVkIHdpdGggc29tZSBleHRyYSBtZXRob2RzLiBUaGUgU3VwZXIgJiBTdGF0aWNzIGFyZ3MgYXJlIG9ubHlcbmV2ZXIgc3BlY2lmaWVkIGJ5IEV4dGVuZGVkVGFnIChpbnRlcm5hbGx5KSwgYW5kIHNvIGlzIG5vdCBleHBvcnRlZCAqL1xudHlwZSBFeFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdCxcbiAgU3VwZXIgZXh0ZW5kcyAodW5rbm93biB8IEV4VGFnQ3JlYXRvcjxhbnk+KSA9IHVua25vd24sXG4gIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcyA9IHt9LFxuICBTdGF0aWNzID0ge30sXG4+ID0gVGFnQ3JlYXRvckZ1bmN0aW9uPEJhc2U+ICYge1xuICAvKiBJdCBjYW4gYWxzbyBiZSBleHRlbmRlZCAqL1xuICBleHRlbmRlZDogRXh0ZW5kZWRUYWdcbiAgLyogSXQgaXMgYmFzZWQgb24gYSBcInN1cGVyXCIgVGFnQ3JlYXRvciAqL1xuICBzdXBlcjogU3VwZXJcbiAgLyogSXQgaGFzIGEgZnVuY3Rpb24gdGhhdCBleHBvc2VzIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSB0YWdzIGl0IGNyZWF0ZXMgYW5kIGl0cyBzdXBlciAqL1xuICBkZWZpbml0aW9uPzogT3ZlcnJpZGVzICYgeyBbVW5pcXVlSURdOiBzdHJpbmcgfTsgLyogQ29udGFpbnMgdGhlIGRlZmluaXRpb25zICYgVW5pcXVlSUQgZm9yIGFuIGV4dGVuZGVkIHRhZy4gdW5kZWZpbmVkIGZvciBiYXNlIHRhZ3MgKi9cbiAgLyogSXQgaGFzIGEgbmFtZSAoc2V0IHRvIGEgY2xhc3Mgb3IgZGVmaW5pdGlvbiBsb2NhdGlvbiksIHdoaWNoIGlzIGhlbHBmdWwgd2hlbiBkZWJ1Z2dpbmcgKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAvKiBDYW4gdGVzdCBpZiBhbiBlbGVtZW50IHdhcyBjcmVhdGVkIGJ5IHRoaXMgZnVuY3Rpb24gb3IgYSBiYXNlIHRhZyBmdW5jdGlvbiAqL1xuICBbU3ltYm9sLmhhc0luc3RhbmNlXShlbHQ6IGFueSk6IGJvb2xlYW47XG4gIFtVbmlxdWVJRF06IHN0cmluZztcbn0gJlxuLy8gYFN0YXRpY3NgIGhlcmUgaXMgdGhhdCBzYW1lIGFzIFN0YXRpY1JlZmVyZW5jZXM8U3VwZXIsIFN1cGVyRGVmcz4sIGJ1dCB0aGUgY2lyY3VsYXIgcmVmZXJlbmNlIGJyZWFrcyBUU1xuLy8gc28gd2UgY29tcHV0ZSB0aGUgU3RhdGljcyBvdXRzaWRlIHRoaXMgdHlwZSBkZWNsYXJhdGlvbiBhcyBwYXNzIHRoZW0gYXMgYSByZXN1bHRcblN0YXRpY3M7XG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2ZXIsIG5ldmVyLCB7fT47XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQ08sTUFBTSxRQUFRLFdBQVcsU0FBUyxPQUFPLFdBQVcsU0FBUyxRQUFRLFFBQVEsV0FBVyxPQUFPLE1BQU0sbUJBQW1CLENBQUMsS0FBSztBQUU5SCxNQUFNLGNBQWM7QUFFM0IsTUFBTSxXQUFXO0FBQUEsSUFDZixPQUFPLE1BQVc7QUFDaEIsVUFBSSxNQUFPLFNBQVEsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksTUFBTSxFQUFFLE9BQU8sUUFBUSxrQkFBaUIsSUFBSSxDQUFDO0FBQUEsSUFDbkc7QUFBQSxJQUNBLFFBQVEsTUFBVztBQUNqQixVQUFJLE1BQU8sU0FBUSxLQUFLLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsT0FBTyxRQUFRLGtCQUFpQixJQUFJLENBQUM7QUFBQSxJ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QSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFBVztBQUFBLElBQVM7QUFBQSxJQUFTO0FBQUEsSUFBSztBQUFBLElBQVE7QUFBQSxJQUFPO0FBQUEsSUFBTztBQUFBLElBQWM7QUFBQSxJQUFRO0FBQUEsSUFBTTtBQUFBLElBQ3BIO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQU87QUFBQSxJQUFZO0FBQUEsSUFBUTtBQUFBLElBQVk7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQVc7QUFBQSxJQUFPO0FBQUEsSUFBVTtBQUFBLElBQ3JIO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUztBQUFBLElBQVk7QUFBQSxJQUFjO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFRO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFDckg7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQU07QUFBQSxJQUFRO0FBQUEsSUFBSztBQUFBLElBQVU7QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQU87QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQVU7QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUN4SDtBQUFBLElBQVE7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUFNO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBSztBQUFBLElBQVc7QUFBQSxJQUNwSDtBQUFBLElBQVk7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFRO0FBQUEsSUFBSztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFVO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFVO0FBQUEsSUFD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aUJBQU8sZ0JBQWdCLGFBQWEsRUFBRSxHQUFHLFlBQVksT0FBTyxFQUFFLEdBQUcsQ0FBQztBQUFBLFFBQUk7QUFBQSxNQUNwRixDQUFDO0FBRUQsYUFBTyxlQUFlLFlBQVksT0FBTyxhQUFhO0FBQUEsUUFDcEQsT0FBTztBQUFBLFFBQ1AsVUFBVTtBQUFBLFFBQ1YsY0FBYztBQUFBLE1BQ2hCLENBQUM7QUFFRCxhQUFPLGVBQWUsWUFBWSxRQUFRLEVBQUUsT0FBTyxNQUFNLElBQUksSUFBSSxDQUFDO0FBRWxFLGFBQU8sZ0JBQWdCLENBQUMsSUFBSTtBQUFBLElBQzlCO0FBRUEsU0FBSyxRQUFRLFNBQVM7QUFHdEIsV0FBTztBQUFBLEVBQ1Q7QUFNQSxXQUFTLGdCQUFnQixNQUFZLE9BQW1ELHdCQUFrQztBQUN4SCxVQUFNLFVBQVUsb0JBQUksUUFBYztBQUNsQyxhQUFTLEtBQUssT0FBaUI7QUFDN0IsaUJBQVcsUUFBUSxPQUFPO0FBRXhCLFlBQUssVUFBVSxpQkFBa0IsS0FBSyxhQUFhO0FBQ2pELGVBQUssS0FBSyxVQUFVO0FBQ3BCLGtCQUFRLElBQUksSUFBSTtBQUVoQixjQUFJLDBCQUEwQixzQkFBc0IsUUFBUSxPQUFPLEtBQUsscUJBQXFCLFdBQVksTUFBSyxpQkFBaUI7QUFBQSxRQUNqSTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGdCQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFlBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxLQUFLLEVBQUUsUUFBUTtBQUM3QyxlQUFLLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFDZjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsQ0FBQyxFQUFFLFFBQVEsTUFBTSxFQUFFLFNBQVMsTUFBTSxXQUFXLEtBQUssQ0FBQztBQUVuRCxXQUFPO0FBQUEsRUFJVDsiLAogICJuYW1lcyI6IFsidiIsICJhIiwgInJlc3VsdCIsICJleCIsICJpciIsICJpc01pc3NpbmciLCAibWVyZ2VkIiwgInVuaXF1ZSIsICJjIiwgIm5vZGVzIiwgIm4iLCAidmFsdWUiLCAiaXNBbmNlc3RyYWwiLCAiY2hpbGRyZW4iXQp9Cg==
