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
    Ready: () => Ready,
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
    once: () => once,
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
      const sources = Object.assign({ "_this": this }, others);
      return combine(sources, opts);
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
    const accumulated = opts.initially ? opts.initially : {};
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
        return (function step() {
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
        })();
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
  async function* once(v) {
    yield v;
  }
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
          if (isPromiseLike(initialValue)) {
            const init = initialValue.then((value) => ({ done: false, value }));
            initialValue = Ignore;
            return init;
          } else {
            const init = Promise.resolve({ done: false, value: initialValue });
            initialValue = Ignore;
            return init;
          }
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
    const consumers = /* @__PURE__ */ new Set();
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
        return Object.create(mai, Object.getOwnPropertyDescriptors({
          next() {
            if (!ai) {
              ai = source[Symbol.asyncIterator]();
              step();
            }
            consumers.add(this);
            return current;
          },
          throw(ex) {
            if (!consumers.has(this))
              throw new Error("AsyncIterator protocol error");
            consumers.delete(this);
            if (consumers.size)
              return Promise.resolve({ done: true, value: ex });
            return Promise.resolve(ai?.throw?.(ex) ?? ai?.return?.(ex)).then(done, done);
          },
          return(v) {
            if (!consumers.has(this))
              throw new Error("AsyncIterator protocol error");
            consumers.delete(this);
            if (consumers.size)
              return Promise.resolve({ done: true, value: v });
            return Promise.resolve(ai?.return?.(v)).then(done, done);
          }
        }));
      }
    };
    return iterableHelpers(mai);
  }
  function augmentGlobalAsyncGenerators() {
    let g = (async function* () {
    })();
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
      let target = ev.target;
      while (target instanceof Node) {
        const containerObservations = observations.get(target);
        if (containerObservations) {
          for (const o of containerObservations) {
            try {
              const { push, terminate, containerRef, selector, includeChildren } = o;
              const container = containerRef.deref();
              if (!container || !container.isConnected) {
                const msg = "Container `#" + container?.id + ">" + (selector || "") + "` removed from DOM. Removing subscription";
                containerObservations.delete(o);
                terminate(new Error(msg));
              } else {
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
            } catch (ex) {
              _console.warn("docEventHandler", ex);
            }
          }
        }
        if (target === this) break;
        target = target.parentNode;
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
      eventObservations.get(container.ownerDocument).set(eventName, /* @__PURE__ */ new Map());
    }
    const observations = eventObservations.get(container.ownerDocument).get(eventName);
    if (!observations.has(container))
      observations.set(container, /* @__PURE__ */ new Set());
    const containerObservations = observations.get(container);
    const queue = queueIteratableIterator(() => containerObservations.delete(details));
    const details = {
      push: queue.push,
      terminate(ex) {
        queue.return?.(ex);
      },
      containerRef: new WeakRef(container),
      includeChildren,
      selector
    };
    containerAndSelectorsMounted(container, selector ? [selector] : void 0).then((_) => containerObservations.add(details));
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
  async function* once2(p) {
    yield p;
  }
  function when(container, ...sources) {
    if (!sources || sources.length === 0) {
      return chainAsync(whenEvent(container, "change"));
    }
    const iterators = sources.filter((what) => typeof what !== "string" || what[0] !== "@").map((what) => typeof what === "string" ? whenEvent(container, what) : what instanceof Element ? whenEvent(what, "change") : isPromiseLike(what) ? once2(what) : what);
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
  var logNode = DEBUG ? ((n) => n instanceof Node ? "outerHTML" in n ? n.outerHTML : `${n.textContent} ${n.nodeName}` : String(n)) : (n) => void 0;
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
            const idProxy = new Proxy((() => {
            }), {
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
            let ap = asyncIterator(iter);
            let createdAt = Date.now() + timeOutWarn;
            const createdBy = DEBUG && new Error("Created by").stack;
            let mounted = false;
            const update = (es) => {
              if (!es.done) {
                mounted = mounted || base.isConnected;
                if (removedNodes.has(base)) {
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
            removedNodes.onRemoval([base], k, () => {
              ap.return?.();
              ap = null;
            });
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
  return __toCommonJS(ai_ui_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FpLXVpLnRzIiwgIi4uL3NyYy9kZWJ1Zy50cyIsICIuLi9zcmMvZGVmZXJyZWQudHMiLCAiLi4vc3JjL2l0ZXJhdG9ycy50cyIsICIuLi9zcmMvd2hlbi50cyIsICIuLi9zcmMvdGFncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgaXNQcm9taXNlTGlrZSB9IGZyb20gJy4vZGVmZXJyZWQuanMnO1xuaW1wb3J0IHsgSWdub3JlLCBhc3luY0l0ZXJhdG9yLCBkZWZpbmVJdGVyYWJsZVByb3BlcnR5LCBpc0FzeW5jSXRlciwgaXNBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcnMuanMnO1xuaW1wb3J0IHsgV2hlblBhcmFtZXRlcnMsIFdoZW5SZXR1cm4sIHdoZW4gfSBmcm9tICcuL3doZW4uanMnO1xuaW1wb3J0IHsgREVCVUcsIGNvbnNvbGUsIHRpbWVPdXRXYXJuIH0gZnJvbSAnLi9kZWJ1Zy5qcyc7XG5pbXBvcnQgdHlwZSB7IENoaWxkVGFncywgQ29uc3RydWN0ZWQsIEluc3RhbmNlLCBPdmVycmlkZXMsIFRhZ0NyZWF0aW9uT3B0aW9ucywgVGFnQ3JlYXRvciwgVGFnQ3JlYXRvckZ1bmN0aW9uLCBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlLCBFeHRlbmRUYWdGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcyc7XG5pbXBvcnQgeyBjYWxsU3RhY2tTeW1ib2wgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG4vKiBFeHBvcnQgdXNlZnVsIHN0dWZmIGZvciB1c2VycyBvZiB0aGUgYnVuZGxlZCBjb2RlICovXG5leHBvcnQgeyB3aGVuLCBSZWFkeSB9IGZyb20gJy4vd2hlbi5qcyc7XG5leHBvcnQgdHlwZSB7IENoaWxkVGFncywgSW5zdGFuY2UsIFRhZ0NyZWF0b3IsIFRhZ0NyZWF0b3JGdW5jdGlvbiB9IGZyb20gJy4vdGFncy5qcydcbmV4cG9ydCAqIGFzIEl0ZXJhdG9ycyBmcm9tICcuL2l0ZXJhdG9ycy5qcyc7XG5cbmV4cG9ydCBjb25zdCBVbmlxdWVJRCA9IFN5bWJvbChcIlVuaXF1ZSBJRFwiKTtcbmNvbnN0IHRyYWNrTm9kZXMgPSBTeW1ib2woXCJ0cmFja05vZGVzXCIpO1xuY29uc3QgdHJhY2tMZWdhY3kgPSBTeW1ib2woXCJvblJlbW92YWxGcm9tRE9NXCIpO1xuY29uc3QgYWl1aUV4dGVuZGVkVGFnU3R5bGVzID0gXCItLWFpLXVpLWV4dGVuZGVkLXRhZy1zdHlsZXNcIjtcblxuY29uc3QgbG9nTm9kZSA9IERFQlVHXG4/ICgobjogYW55KSA9PiBuIGluc3RhbmNlb2YgTm9kZVxuICA/ICdvdXRlckhUTUwnIGluIG4gPyBuLm91dGVySFRNTCA6IGAke24udGV4dENvbnRlbnR9ICR7bi5ub2RlTmFtZX1gXG4gIDogU3RyaW5nKG4pKVxuOiAobjogTm9kZSkgPT4gdW5kZWZpbmVkO1xuXG4vKiBBIGhvbGRlciBmb3IgY29tbW9uUHJvcGVydGllcyBzcGVjaWZpZWQgd2hlbiBgdGFnKC4uLnApYCBpcyBpbnZva2VkLCB3aGljaCBhcmUgYWx3YXlzXG4gIGFwcGxpZWQgKG1peGVkIGluKSB3aGVuIGFuIGVsZW1lbnQgaXMgY3JlYXRlZCAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWdGdW5jdGlvbk9wdGlvbnM8T3RoZXJNZW1iZXJzIGV4dGVuZHMgUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PiA9IHt9PiB7XG4gIGNvbW1vblByb3BlcnRpZXM/OiBPdGhlck1lbWJlcnMgfCB1bmRlZmluZWRcbiAgZG9jdW1lbnQ/OiBEb2N1bWVudFxuICBFcnJvclRhZz86IFRhZ0NyZWF0b3JGdW5jdGlvbjxFbGVtZW50ICYgeyBlcnJvcjogYW55IH0+XG4gIC8qKiBAZGVwcmVjYXRlZCAtIGxlZ2FjeSBzdXBwb3J0ICovXG4gIGVuYWJsZU9uUmVtb3ZlZEZyb21ET00/OiBib29sZWFuXG59XG5cbi8qIE1lbWJlcnMgYXBwbGllZCB0byBFVkVSWSB0YWcgY3JlYXRlZCwgZXZlbiBiYXNlIHRhZ3MgKi9cbmludGVyZmFjZSBQb0VsZW1lbnRNZXRob2RzIHtcbiAgZ2V0IGlkcygpOiB7fSAmICh1bmRlZmluZWQgfCAoKGF0dHJzOiBvYmplY3QsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSkgPT4gUmV0dXJuVHlwZTxUYWdDcmVhdG9yRnVuY3Rpb248YW55Pj4pKVxuICB3aGVuPFQgZXh0ZW5kcyBFbGVtZW50ICYgUG9FbGVtZW50TWV0aG9kcywgUyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPEV4Y2x1ZGU8a2V5b2YgVFsnaWRzJ10sIG51bWJlciB8IHN5bWJvbD4+Pih0aGlzOiBULCAuLi53aGF0OiBTKTogV2hlblJldHVybjxTPjtcbiAgLy8gVGhpcyBpcyBhIHZlcnkgaW5jb21wbGV0ZSB0eXBlLiBJbiBwcmFjdGljZSwgc2V0KGssIGF0dHJzKSByZXF1aXJlcyBhIGRlZXBseSBwYXJ0aWFsIHNldCBvZlxuICAvLyBhdHRyaWJ1dGVzLCBpbiBleGFjdGx5IHRoZSBzYW1lIHdheSBhcyBhIFRhZ0Z1bmN0aW9uJ3MgZmlyc3Qgb2JqZWN0IHBhcmFtZXRlclxuICBzZXQgYXR0cmlidXRlcyhhdHRyczogb2JqZWN0KTtcbiAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwXG59XG5cbi8vIFN1cHBvcnQgZm9yIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2h0bSAob3IgaW1wb3J0IGh0bSBmcm9tICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2h0bS9kaXN0L2h0bS5tb2R1bGUuanMnKVxuLy8gTm90ZTogc2FtZSBzaWduYXR1cmUgYXMgUmVhY3QuY3JlYXRlRWxlbWVudFxudHlwZSBDcmVhdGVFbGVtZW50Tm9kZVR5cGUgPSBUYWdDcmVhdG9yRnVuY3Rpb248YW55PiB8IE5vZGUgfCBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBcbnR5cGUgQ3JlYXRlRWxlbWVudEZyYWdtZW50ID0gQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddO1xuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVFbGVtZW50IHtcbiAgLy8gU3VwcG9ydCBmb3IgaHRtLCBKU1gsIGV0Y1xuICBjcmVhdGVFbGVtZW50PE4gZXh0ZW5kcyAoQ3JlYXRlRWxlbWVudE5vZGVUeXBlIHwgQ3JlYXRlRWxlbWVudEZyYWdtZW50KT4oXG4gICAgLy8gXCJuYW1lXCIgY2FuIGEgSFRNTCB0YWcgc3RyaW5nLCBhbiBleGlzdGluZyBub2RlIChqdXN0IHJldHVybnMgaXRzZWxmKSwgb3IgYSB0YWcgZnVuY3Rpb25cbiAgICBuYW1lOiBOLFxuICAgIC8vIFRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gaW5pdGlhbGlzZSB0aGUgbm9kZSAoaWYgYSBzdHJpbmcgb3IgZnVuY3Rpb24gLSBpZ25vcmUgaWYgaXQncyBhbHJlYWR5IGEgbm9kZSlcbiAgICBhdHRyczogYW55LFxuICAgIC8vIFRoZSBjaGlsZHJlblxuICAgIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IE4gZXh0ZW5kcyBDcmVhdGVFbGVtZW50RnJhZ21lbnQgPyBOb2RlW10gOiBOb2RlO1xuICB9XG5cbi8qIFRoZSBpbnRlcmZhY2UgdGhhdCBjcmVhdGVzIGEgc2V0IG9mIFRhZ0NyZWF0b3JzIGZvciB0aGUgc3BlY2lmaWVkIERPTSB0YWdzICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZ0xvYWRlciB7XG4gIG5vZGVzKC4uLmM6IENoaWxkVGFnc1tdKTogKE5vZGUgfCAoLypQICYqLyAoRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHMpKSlbXTtcbiAgVW5pcXVlSUQ6IHR5cGVvZiBVbmlxdWVJRFxuXG4gIC8qXG4gICBTaWduYXR1cmVzIGZvciB0aGUgdGFnIGxvYWRlci4gQWxsIHBhcmFtcyBhcmUgb3B0aW9uYWwgaW4gYW55IGNvbWJpbmF0aW9uLFxuICAgYnV0IG11c3QgYmUgaW4gb3JkZXI6XG4gICAgICB0YWcoXG4gICAgICAgICAgP25hbWVTcGFjZT86IHN0cmluZywgIC8vIGFic2VudCBuYW1lU3BhY2UgaW1wbGllcyBIVE1MXG4gICAgICAgICAgP3RhZ3M/OiBzdHJpbmdbXSwgICAgIC8vIGFic2VudCB0YWdzIGRlZmF1bHRzIHRvIGFsbCBjb21tb24gSFRNTCB0YWdzXG4gICAgICAgICAgP2NvbW1vblByb3BlcnRpZXM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4gLy8gYWJzZW50IGltcGxpZXMgbm9uZSBhcmUgZGVmaW5lZFxuICAgICAgKVxuXG4gICAgICBlZzpcbiAgICAgICAgdGFncygpICAvLyByZXR1cm5zIFRhZ0NyZWF0b3JzIGZvciBhbGwgSFRNTCB0YWdzXG4gICAgICAgIHRhZ3MoWydkaXYnLCdidXR0b24nXSwgeyBteVRoaW5nKCkge30gfSlcbiAgICAgICAgdGFncygnaHR0cDovL25hbWVzcGFjZScsWydGb3JlaWduJ10sIHsgaXNGb3JlaWduOiB0cnVlIH0pXG4gICovXG5cbiAgPFRhZ3MgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KCk6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW2tdPiB9ICYgQ3JlYXRlRWxlbWVudFxuICA8VGFncyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnczogVGFnc1tdKTogeyBbayBpbiBMb3dlcmNhc2U8VGFncz5dOiBUYWdDcmVhdG9yPFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0PihvcHRpb25zOiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIExvd2VyY2FzZTxUYWdzPl06IFRhZ0NyZWF0b3I8USAmIFBvRWxlbWVudE1ldGhvZHMgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBba10+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBRIGV4dGVuZHMgb2JqZWN0Pih0YWdzOiBUYWdzW10sIG9wdGlvbnM6IFRhZ0Z1bmN0aW9uT3B0aW9uczxRPik6IHsgW2sgaW4gTG93ZXJjYXNlPFRhZ3M+XTogVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEhUTUxFbGVtZW50VGFnTmFtZU1hcFtrXT4gfSAmIENyZWF0ZUVsZW1lbnRcbiAgPFRhZ3MgZXh0ZW5kcyBzdHJpbmcsIFEgZXh0ZW5kcyBvYmplY3Q+KG5hbWVTcGFjZTogbnVsbCB8IHVuZGVmaW5lZCB8ICcnLCB0YWdzOiBUYWdzW10sIG9wdGlvbnM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pOiB7IFtrIGluIFRhZ3NdOiBUYWdDcmVhdG9yPFEgJiBQb0VsZW1lbnRNZXRob2RzICYgSFRNTEVsZW1lbnQ+IH0gJiBDcmVhdGVFbGVtZW50XG4gIDxUYWdzIGV4dGVuZHMgc3RyaW5nLCBRIGV4dGVuZHMgb2JqZWN0PihuYW1lU3BhY2U6IHN0cmluZywgdGFnczogVGFnc1tdLCBvcHRpb25zPzogVGFnRnVuY3Rpb25PcHRpb25zPFE+KTogUmVjb3JkPHN0cmluZywgVGFnQ3JlYXRvcjxRICYgUG9FbGVtZW50TWV0aG9kcyAmIEVsZW1lbnQ+PiAmIENyZWF0ZUVsZW1lbnRcbn1cblxubGV0IGlkQ291bnQgPSAwO1xuY29uc3Qgc3RhbmRhbmRUYWdzID0gW1xuICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFyZWFcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiYXNlXCIsIFwiYmRpXCIsIFwiYmRvXCIsIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJiclwiLCBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLCBcImNvbFwiLCBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsIFwiZGl2XCIsXG4gIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZW1iZWRcIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIiwgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLFxuICBcImhlYWRlclwiLCBcImhncm91cFwiLCBcImhyXCIsIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJsaW5rXCIsIFwibWFpblwiLCBcIm1hcFwiLFxuICBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0YVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLCBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIixcbiAgXCJwcm9ncmVzc1wiLCBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLCBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNvdXJjZVwiLCBcInNwYW5cIixcbiAgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIiwgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLCBcInRoZWFkXCIsIFwidGltZVwiLFxuICBcInRpdGxlXCIsIFwidHJcIiwgXCJ0cmFja1wiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsIFwid2JyXCJcbl0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGlkc0luYWNjZXNzaWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcIjxlbHQ+LmlkcyBpcyBhIHJlYWQtb25seSBtYXAgb2YgRWxlbWVudHNcIilcbn1cblxuLyogU3ltYm9scyB1c2VkIHRvIGhvbGQgSURzIHRoYXQgY2xhc2ggd2l0aCBmdW5jdGlvbiBwcm90b3R5cGUgbmFtZXMsIHNvIHRoYXQgdGhlIFByb3h5IGZvciBpZHMgY2FuIGJlIG1hZGUgY2FsbGFibGUgKi9cbmNvbnN0IHNhZmVGdW5jdGlvblN5bWJvbHMgPSBbLi4uT2JqZWN0LmtleXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoRnVuY3Rpb24ucHJvdG90eXBlKSldLnJlZHVjZSgoYSxiKSA9PiB7XG4gIGFbYl0gPSBTeW1ib2woYik7XG4gIHJldHVybiBhO1xufSx7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzeW1ib2w+KTtcbmZ1bmN0aW9uIGtleUZvcihpZDogc3RyaW5nIHwgc3ltYm9sKSB7IHJldHVybiBpZCBpbiBzYWZlRnVuY3Rpb25TeW1ib2xzID8gc2FmZUZ1bmN0aW9uU3ltYm9sc1tpZCBhcyBrZXlvZiB0eXBlb2Ygc2FmZUZ1bmN0aW9uU3ltYm9sc10gOiBpZCB9O1xuXG5mdW5jdGlvbiBpc0NoaWxkVGFnKHg6IGFueSk6IHggaXMgQ2hpbGRUYWdzIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJ1xuICAgIHx8IHR5cGVvZiB4ID09PSAnYm9vbGVhbidcbiAgICB8fCB4IGluc3RhbmNlb2YgTm9kZVxuICAgIHx8IHggaW5zdGFuY2VvZiBOb2RlTGlzdFxuICAgIHx8IHggaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvblxuICAgIHx8IHggPT09IG51bGxcbiAgICB8fCB4ID09PSB1bmRlZmluZWRcbiAgICAvLyBDYW4ndCBhY3R1YWxseSB0ZXN0IGZvciB0aGUgY29udGFpbmVkIHR5cGUsIHNvIHdlIGFzc3VtZSBpdCdzIGEgQ2hpbGRUYWcgYW5kIGxldCBpdCBmYWlsIGF0IHJ1bnRpbWVcbiAgICB8fCBBcnJheS5pc0FycmF5KHgpXG4gICAgfHwgaXNQcm9taXNlTGlrZSh4KVxuICAgIHx8IGlzQXN5bmNJdGVyKHgpXG4gICAgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4geCAmJiB0eXBlb2YgeFtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyogdGFnICovXG5cbmV4cG9ydCBjb25zdCB0YWcgPSA8VGFnTG9hZGVyPmZ1bmN0aW9uIDxUYWdzIGV4dGVuZHMgc3RyaW5nLFxuICBUMSBleHRlbmRzIChzdHJpbmcgfCBUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBUMiBleHRlbmRzIChUYWdzW10gfCBUYWdGdW5jdGlvbk9wdGlvbnM8UT4pLFxuICBRIGV4dGVuZHMgb2JqZWN0XG4+KFxuICBfMTogVDEsXG4gIF8yOiBUMixcbiAgXzM/OiBUYWdGdW5jdGlvbk9wdGlvbnM8UT5cbik6IFJlY29yZDxzdHJpbmcsIFRhZ0NyZWF0b3I8USAmIEVsZW1lbnQ+PiB7XG4gIHR5cGUgTmFtZXNwYWNlZEVsZW1lbnRCYXNlID0gVDEgZXh0ZW5kcyBzdHJpbmcgPyBUMSBleHRlbmRzICcnID8gSFRNTEVsZW1lbnQgOiBFbGVtZW50IDogSFRNTEVsZW1lbnQ7XG5cbiAgLyogV29yayBvdXQgd2hpY2ggcGFyYW1ldGVyIGlzIHdoaWNoLiBUaGVyZSBhcmUgNiB2YXJpYXRpb25zOlxuICAgIHRhZygpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgdGFnKGNvbW1vblByb3BlcnRpZXMpICAgICAgICAgICAgICAgICAgICAgICAgICAgW29iamVjdF1cbiAgICB0YWcodGFnc1tdKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RyaW5nW11dXG4gICAgdGFnKHRhZ3NbXSwgY29tbW9uUHJvcGVydGllcykgICAgICAgICAgICAgICAgICAgW3N0cmluZ1tdLCBvYmplY3RdXG4gICAgdGFnKG5hbWVzcGFjZSB8IG51bGwsIHRhZ3NbXSkgICAgICAgICAgICAgICAgICAgW3N0cmluZyB8IG51bGwsIHN0cmluZ1tdXVxuICAgIHRhZyhuYW1lc3BhY2UgfCBudWxsLCB0YWdzW10sIGNvbW1vblByb3BlcnRpZXMpIFtzdHJpbmcgfCBudWxsLCBzdHJpbmdbXSwgb2JqZWN0XVxuICAqL1xuICBjb25zdCBbbmFtZVNwYWNlLCB0YWdzLCBvcHRpb25zXSA9ICh0eXBlb2YgXzEgPT09ICdzdHJpbmcnKSB8fCBfMSA9PT0gbnVsbFxuICAgID8gW18xLCBfMiBhcyBUYWdzW10sIF8zIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICA6IEFycmF5LmlzQXJyYXkoXzEpXG4gICAgICA/IFtudWxsLCBfMSBhcyBUYWdzW10sIF8yIGFzIFRhZ0Z1bmN0aW9uT3B0aW9uczxRPiB8IHVuZGVmaW5lZF1cbiAgICAgIDogW251bGwsIHN0YW5kYW5kVGFncywgXzEgYXMgVGFnRnVuY3Rpb25PcHRpb25zPFE+IHwgdW5kZWZpbmVkXTtcblxuICBjb25zdCBjb21tb25Qcm9wZXJ0aWVzID0gb3B0aW9ucz8uY29tbW9uUHJvcGVydGllcztcbiAgY29uc3QgdGhpc0RvYyA9IG9wdGlvbnM/LmRvY3VtZW50ID8/IGdsb2JhbFRoaXMuZG9jdW1lbnQ7XG4gIGNvbnN0IGlzVGVzdEVudiA9IHRoaXNEb2MuZG9jdW1lbnRVUkkgPT09ICdhYm91dDp0ZXN0aW5nJztcbiAgY29uc3QgRHluYW1pY0VsZW1lbnRFcnJvciA9IG9wdGlvbnM/LkVycm9yVGFnIHx8IGZ1bmN0aW9uIER5YW1pY0VsZW1lbnRFcnJvcih7IGVycm9yIH06IHsgZXJyb3I6IEVycm9yIHwgSXRlcmF0b3JSZXN1bHQ8RXJyb3I+IH0pIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci50b1N0cmluZygpIDogJ0Vycm9yOlxcbicgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgMikpO1xuICB9XG5cbiAgY29uc3QgcmVtb3ZlZE5vZGVzID0gbXV0YXRpb25UcmFja2VyKHRoaXNEb2MpO1xuXG4gIGZ1bmN0aW9uIERvbVByb21pc2VDb250YWluZXIobGFiZWw/OiBhbnkpIHtcbiAgICByZXR1cm4gdGhpc0RvYy5jcmVhdGVDb21tZW50KGxhYmVsPyBsYWJlbC50b1N0cmluZygpIDpERUJVR1xuICAgICAgPyBuZXcgRXJyb3IoXCJwcm9taXNlXCIpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sICcnKSB8fCBcInByb21pc2VcIlxuICAgICAgOiBcInByb21pc2VcIilcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYWl1aUV4dGVuZGVkVGFnU3R5bGVzKSkge1xuICAgIHRoaXNEb2MuaGVhZC5hcHBlbmRDaGlsZChPYmplY3QuYXNzaWduKHRoaXNEb2MuY3JlYXRlRWxlbWVudChcIlNUWUxFXCIpLCB7aWQ6IGFpdWlFeHRlbmRlZFRhZ1N0eWxlc30gKSk7XG4gIH1cblxuICAvKiBQcm9wZXJ0aWVzIGFwcGxpZWQgdG8gZXZlcnkgdGFnIHdoaWNoIGNhbiBiZSBpbXBsZW1lbnRlZCBieSByZWZlcmVuY2UsIHNpbWlsYXIgdG8gcHJvdG90eXBlcyAqL1xuICBjb25zdCB3YXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdGFnUHJvdG90eXBlczogUG9FbGVtZW50TWV0aG9kcyA9IE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbCxcbiAgICB7XG4gICAgICB3aGVuOiB7XG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICguLi53aGF0OiBXaGVuUGFyYW1ldGVycykge1xuICAgICAgICAgIHJldHVybiB3aGVuKHRoaXMsIC4uLndoYXQpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdhdHRyaWJ1dGVzJyksXG4gICAgICAgIHNldCh0aGlzOiBFbGVtZW50LCBhOiBvYmplY3QpIHtcbiAgICAgICAgICBpZiAoaXNBc3luY0l0ZXIoYSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFpID0gaXNBc3luY0l0ZXJhdG9yKGEpID8gYSA6IGFbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gKCkgPT4gYWkubmV4dCgpLnRoZW4oXG4gICAgICAgICAgICAgICh7IGRvbmUsIHZhbHVlIH0pID0+IHsgYXNzaWduUHJvcHModGhpcywgdmFsdWUpOyBkb25lIHx8IHN0ZXAoKSB9LFxuICAgICAgICAgICAgICBleCA9PiBjb25zb2xlLndhcm4oZXgpKTtcbiAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBhc3NpZ25Qcm9wcyh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlkczoge1xuICAgICAgICAvLyAuaWRzIGlzIGEgZ2V0dGVyIHRoYXQgd2hlbiBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyBsYXppbHkgY3JlYXRlcyBhIFByb3h5IHRoYXQgcHJvdmlkZXMgbGl2ZSBhY2Nlc3MgdG8gY2hpbGRyZW4gYnkgaWRcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgZ2V0KHRoaXM6IEVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBOb3cgd2UndmUgYmVlbiBhY2Nlc3NlZCwgY3JlYXRlIHRoZSBwcm94eVxuICAgICAgICAgIGNvbnN0IGlkUHJveHkgPSBuZXcgUHJveHkoKCgpPT57fSkgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBXZWFrUmVmPEVsZW1lbnQ+Piwge1xuICAgICAgICAgICAgYXBwbHkodGFyZ2V0LCB0aGlzQXJnLCBhcmdzKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNBcmcuY29uc3RydWN0b3IuZGVmaW5pdGlvbi5pZHNbYXJnc1swXS5pZF0oLi4uYXJncylcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDxlbHQ+Lmlkcy4ke2FyZ3M/LlswXT8uaWR9IGlzIG5vdCBhIHRhZy1jcmVhdGluZyBmdW5jdGlvbmAsIHsgY2F1c2U6IGV4IH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uc3RydWN0OiBpZHNJbmFjY2Vzc2libGUsXG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eTogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgZGVsZXRlUHJvcGVydHk6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIHNldDogaWRzSW5hY2Nlc3NpYmxlLFxuICAgICAgICAgICAgc2V0UHJvdG90eXBlT2Y6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldFByb3RvdHlwZU9mKCkgeyByZXR1cm4gbnVsbCB9LFxuICAgICAgICAgICAgaXNFeHRlbnNpYmxlKCkgeyByZXR1cm4gZmFsc2UgfSxcbiAgICAgICAgICAgIHByZXZlbnRFeHRlbnNpb25zKCkgeyByZXR1cm4gdHJ1ZSB9LFxuICAgICAgICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcCkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5nZXQhKHRhcmdldCwgcCwgbnVsbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5Rm9yKHApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXModGFyZ2V0LCBwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmdldCEodGFyZ2V0LCBwLCBudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3duS2V5czogKHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBpZHMgPSBbLi4udGhpcy5xdWVyeVNlbGVjdG9yQWxsKGBbaWRdYCldLm1hcChlID0+IGUuaWQpO1xuICAgICAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbLi4ubmV3IFNldChpZHMpXTtcbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmIGlkcy5sZW5ndGggIT09IHVuaXF1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudCBpZHNgLCB1bmlxdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gdW5pcXVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcCwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBrID0ga2V5Rm9yKHApO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlJ3ZlIGNhY2hlZCB0aGlzIElEIGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAocGsgaW4gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgZWxlbWVudCBpcyBzdGlsbCBjb250YWluZWQgd2l0aGluIHRoaXMgZWxlbWVudCB3aXRoIHRoZSBzYW1lIElEXG4gICAgICAgICAgICAgICAgICBjb25zdCByZWYgPSB0YXJnZXRbcGtdLmRlcmVmKCk7XG4gICAgICAgICAgICAgICAgICBpZiAocmVmICYmIHJlZi5pZCA9PT0gcCAmJiB0aGlzLmNvbnRhaW5zKHJlZikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWY7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgdGFyZ2V0W3BrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGU6IEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBubCA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnIycgKyBDU1MuZXNjYXBlKHApKTtcbiAgICAgICAgICAgICAgICAgIGlmIChubC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghd2FybmVkLmhhcyhwKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHdhcm5lZC5hZGQocCk7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsZW1lbnQgY29udGFpbnMgbXVsdGlwbGUsIHNoYWRvd2VkIGRlY2VuZGFudHMgd2l0aCBJRCBcIiR7cH1cImAvKixgXFxuXFx0JHtsb2dOb2RlKHRoaXMpfWAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGUgPSBubFswXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZSA9IHRoaXMucXVlcnlTZWxlY3RvcignIycgKyBDU1MuZXNjYXBlKHApKSA/PyB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlKVxuICAgICAgICAgICAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBwaywgbmV3IFdlYWtSZWYoZSksIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAuLmFuZCByZXBsYWNlIHRoZSBnZXR0ZXIgd2l0aCB0aGUgUHJveHlcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lkcycsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBzZXQ6IGlkc0luYWNjZXNzaWJsZSxcbiAgICAgICAgICAgIGdldCgpIHsgcmV0dXJuIGlkUHJveHkgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIC4uLmFuZCByZXR1cm4gdGhhdCBmcm9tIHRoZSBnZXR0ZXIsIHNvIHN1YnNlcXVlbnQgcHJvcGVydHlcbiAgICAgICAgICAvLyBhY2Nlc3NlcyBnbyB2aWEgdGhlIFByb3h5XG4gICAgICAgICAgcmV0dXJuIGlkUHJveHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgaWYgKG9wdGlvbnM/LmVuYWJsZU9uUmVtb3ZlZEZyb21ET00pIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFnUHJvdG90eXBlcywnb25SZW1vdmVkRnJvbURPTScse1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBzZXQ6IGZ1bmN0aW9uKGZuPzogKCk9PnZvaWQpe1xuICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFt0aGlzXSwgdHJhY2tMZWdhY3ksIGZuKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlbW92ZWROb2Rlcy5nZXRSZW1vdmFsSGFuZGxlcih0aGlzLCB0cmFja0xlZ2FjeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyogQWRkIGFueSB1c2VyIHN1cHBsaWVkIHByb3RvdHlwZXMgKi9cbiAgaWYgKGNvbW1vblByb3BlcnRpZXMpXG4gICAgZGVlcERlZmluZSh0YWdQcm90b3R5cGVzLCBjb21tb25Qcm9wZXJ0aWVzKTtcblxuICBmdW5jdGlvbiAqbm9kZXMoLi4uY2hpbGRUYWdzOiBDaGlsZFRhZ3NbXSk6IEl0ZXJhYmxlSXRlcmF0b3I8Q2hpbGROb2RlLCB2b2lkLCB1bmtub3duPiB7XG4gICAgZnVuY3Rpb24gbm90VmlhYmxlVGFnKGM6IENoaWxkVGFncykge1xuICAgICAgcmV0dXJuIChjID09PSB1bmRlZmluZWQgfHwgYyA9PT0gbnVsbCB8fCBjID09PSBJZ25vcmUpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjIG9mIGNoaWxkVGFncykge1xuICAgICAgaWYgKG5vdFZpYWJsZVRhZyhjKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGlmIChpc1Byb21pc2VMaWtlKGMpKSB7XG4gICAgICAgIGxldCBnOiBDaGlsZE5vZGVbXSB8IHVuZGVmaW5lZCA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICBjLnRoZW4ocmVwbGFjZW1lbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IG9sZCA9IGc7XG4gICAgICAgICAgaWYgKG9sZCkge1xuICAgICAgICAgICAgZyA9IFsuLi5ub2RlcyhyZXBsYWNlbWVudCldO1xuICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLm9uUmVtb3ZhbChnLCB0cmFja05vZGVzLCAoKT0+IHsgZyA9IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaSA8IG9sZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgICAgICAgICBvbGRbaV0ucmVwbGFjZVdpdGgoLi4uZyk7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgb2xkW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGcpIHlpZWxkICpnO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHlpZWxkIGMgYXMgQ2hpbGROb2RlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgaGF2ZSBhbiBpbnRlcmVzdGluZyBjYXNlIGhlcmUgd2hlcmUgYW4gaXRlcmFibGUgU3RyaW5nIGlzIGFuIG9iamVjdCB3aXRoIGJvdGggU3ltYm9sLml0ZXJhdG9yXG4gICAgICAvLyAoaW5oZXJpdGVkIGZyb20gdGhlIFN0cmluZyBwcm90b3R5cGUpIGFuZCBTeW1ib2wuYXN5bmNJdGVyYXRvciAoYXMgaXQncyBiZWVuIGF1Z21lbnRlZCBieSBib3hlZCgpKVxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBjYXNlcyBsaWtlIEhUTUxDb2xsZWN0aW9uLCBOb2RlTGlzdCwgYXJyYXksIGV0Yy4sIG5vdCB0aGUgZnVua3kgb25lc1xuICAgICAgLy8gSXQgdXNlZCB0byBiZSBhZnRlciB0aGUgaXNBc3luY0l0ZXIoKSB0ZXN0LCBidXQgYSBub24tQXN5bmNJdGVyYXRvciAqbWF5KiBhbHNvIGJlIGEgc3luYyBpdGVyYWJsZVxuICAgICAgLy8gRm9yIG5vdywgd2UgZXhjbHVkZSAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgaW4gdGhpcyBjYXNlLlxuICAgICAgaWYgKGMgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBjICYmICEoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gYykgJiYgY1tTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgYylcbiAgICAgICAgICB5aWVsZCAqbm9kZXMoY2gpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXN5bmNJdGVyPENoaWxkVGFncz4oYykpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0aW9uU3RhY2sgPSBERUJVRyA/ICgnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3I6IC8sIFwiSW5zZXJ0aW9uIDpcIikpIDogJyc7XG4gICAgICAgIGxldCBhcCA9IGlzQXN5bmNJdGVyYXRvcihjKSA/IGMgOiBjW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICBsZXQgbm90WWV0TW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgdGVybWluYXRlU291cmNlID0gKGZvcmNlOiBib29sZWFuID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBpZiAoIWFwIHx8ICFyZXBsYWNlbWVudC5ub2RlcylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIGlmIChmb3JjZSB8fCByZXBsYWNlbWVudC5ub2Rlcy5ldmVyeShlID0+IHJlbW92ZWROb2Rlcy5oYXMoZSkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBkb25lIC0gdGVybWluYXRlIHRoZSBzb3VyY2UgcXVpZXRseSAoaWUgdGhpcyBpcyBub3QgYW4gZXhjZXB0aW9uIGFzIGl0J3MgZXhwZWN0ZWQsIGJ1dCB3ZSdyZSBkb25lKVxuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXM/LmZvckVhY2goZSA9PiByZW1vdmVkTm9kZXMuYWRkKGUpKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwiRWxlbWVudChzKSBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudDogXCJcbiAgICAgICAgICAgICAgKyByZXBsYWNlbWVudC5ub2Rlcy5tYXAobG9nTm9kZSkuam9pbignXFxuJylcbiAgICAgICAgICAgICAgKyBpbnNlcnRpb25TdGFjaztcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBudWxsO1xuICAgICAgICAgICAgYXAucmV0dXJuPy4obmV3IEVycm9yKG1zZykpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICBhcCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoaXMgYXN5bmMgaXRlcmF0b3IgaXMgYSBib3hlZCBvYmplY3QgdGhhdCBhbHNvIGhvbGRzIGEgdmFsdWVcbiAgICAgICAgY29uc3QgdW5ib3hlZCA9IGMudmFsdWVPZigpO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHtcbiAgICAgICAgICBub2RlczogKCh1bmJveGVkID09PSBjKSA/IFtdIDogWy4uLm5vZGVzKHVuYm94ZWQgYXMgQ2hpbGRUYWdzKV0pIGFzIENoaWxkTm9kZVtdIHwgdW5kZWZpbmVkLFxuICAgICAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM/LltTeW1ib2wuaXRlcmF0b3JdKCkgPz8gKHsgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9IH0gfSBhcyBJdGVyYXRvcjxDaGlsZE5vZGU+KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2RlcyEubGVuZ3RoKVxuICAgICAgICAgIHJlcGxhY2VtZW50Lm5vZGVzID0gW0RvbVByb21pc2VDb250YWluZXIoKV07XG4gICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMhLHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgIGNvbnN0IGRlYnVnVW5tb3VudGVkID0gREVCVUdcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBEYXRlLm5vdygpICsgdGltZU91dFdhcm47XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuICAgICAgICAgICAgbGV0IGYgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChub3RZZXRNb3VudGVkICYmIGNyZWF0ZWRBdCAmJiBjcmVhdGVkQXQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgZiA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFzeW5jIGVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgJHt0aW1lT3V0V2FybiAvIDEwMDB9IHNlY29uZHMuIElmIGl0IGlzIG5ldmVyIG1vdW50ZWQsIGl0IHdpbGwgbGVhay5gLCBjcmVhdGVkQnksIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIChmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgIGFwLm5leHQoKS50aGVuKGVzID0+IHtcbiAgICAgICAgICAgIGlmICghZXMuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgYXA/LnRocm93Py4obmV3IEVycm9yKFwiQWxyZWFkeSB0ZXJuaW1hdGVkXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbW91bnRlZCA9IHJlcGxhY2VtZW50Lm5vZGVzLmZpbHRlcihlID0+IGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBuID0gbm90WWV0TW91bnRlZCA/IHJlcGxhY2VtZW50Lm5vZGVzIDogbW91bnRlZDtcbiAgICAgICAgICAgICAgaWYgKG5vdFlldE1vdW50ZWQgJiYgbW91bnRlZC5sZW5ndGgpIG5vdFlldE1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoIXRlcm1pbmF0ZVNvdXJjZSghbi5sZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWdVbm1vdW50ZWQ/LigpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubm9kZXMgPSBbLi4ubm9kZXModW5ib3goZXMudmFsdWUpKV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudC5ub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IFtEb21Qcm9taXNlQ29udGFpbmVyKCldO1xuICAgICAgICAgICAgICAgIHJlbW92ZWROb2Rlcy5vblJlbW92YWwocmVwbGFjZW1lbnQubm9kZXMsIHRyYWNrTm9kZXMsdGVybWluYXRlU291cmNlKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk9MDsgaTxuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaT09PTApXG4gICAgICAgICAgICAgICAgICAgIG5bMF0ucmVwbGFjZVdpdGgoLi4ucmVwbGFjZW1lbnQubm9kZXMpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlcGxhY2VtZW50Lm5vZGVzLmluY2x1ZGVzKG5baV0pKVxuICAgICAgICAgICAgICAgICAgICBuW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChuW2ldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3JWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuID0gcmVwbGFjZW1lbnQubm9kZXM/LmZpbHRlcihuID0+IEJvb2xlYW4obj8ucGFyZW50Tm9kZSkpO1xuICAgICAgICAgICAgaWYgKG4/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBuWzBdLnJlcGxhY2VXaXRoKER5bmFtaWNFbGVtZW50RXJyb3IoeyBlcnJvcjogZXJyb3JWYWx1ZT8udmFsdWUgPz8gZXJyb3JWYWx1ZSB9KSk7XG4gICAgICAgICAgICAgIG4uc2xpY2UoMSkuZm9yRWFjaChlID0+IGU/LnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgY29uc29sZS53YXJuKFwiQ2FuJ3QgcmVwb3J0IGVycm9yXCIsIGVycm9yVmFsdWUsIHJlcGxhY2VtZW50Lm5vZGVzPy5tYXAobG9nTm9kZSkpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogcmVsZWFzZSByZWZlcmVuY2UgZm9yIEdDXG4gICAgICAgICAgICByZXBsYWNlbWVudC5ub2RlcyA9IG51bGw7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiByZWxlYXNlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgIGFwID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkoKTtcblxuICAgICAgICBpZiAocmVwbGFjZW1lbnQubm9kZXMpIHlpZWxkKiByZXBsYWNlbWVudDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHlpZWxkIHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoYy50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIW5hbWVTcGFjZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGFnLCB7XG4gICAgICBub2RlcywgICAgLy8gQnVpbGQgRE9NIE5vZGVbXSBmcm9tIENoaWxkVGFnc1xuICAgICAgVW5pcXVlSURcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBKdXN0IGRlZXAgY29weSBhbiBvYmplY3QgKi9cbiAgY29uc3QgcGxhaW5PYmplY3RQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pO1xuICAvKiogUm91dGluZSB0byAqZGVmaW5lKiBwcm9wZXJ0aWVzIG9uIGEgZGVzdCBvYmplY3QgZnJvbSBhIHNyYyBvYmplY3QgKiovXG4gIGZ1bmN0aW9uIGRlZXBEZWZpbmUoZDogUmVjb3JkPHN0cmluZyB8IHN5bWJvbCB8IG51bWJlciwgYW55PiwgczogYW55LCBkZWNsYXJhdGlvbj86IHRydWUpOiB2b2lkIHtcbiAgICBpZiAocyA9PT0gbnVsbCB8fCBzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHMgIT09ICdvYmplY3QnIHx8IHMgPT09IGQpXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IFtrLCBzcmNEZXNjXSBvZiBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICgndmFsdWUnIGluIHNyY0Rlc2MpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaGFzIGEgcmVhbCB2YWx1ZSwgd2hpY2ggbWlnaHQgYmUgYW4gb2JqZWN0LCBzbyB3ZSdsbCBkZWVwRGVmaW5lIGl0IHVubGVzcyBpdCdzIGFcbiAgICAgICAgICAgIC8vIFByb21pc2Ugb3IgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBqdXN0IGFzc2lnbiBpdFxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIWlzUHJvbWlzZUxpa2UodmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmICghKGsgaW4gZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IHZhbHVlIGluIHRoZSBkZXN0aW5hdGlvbiwganVzdCBkZWZpbmUgaXQgdG8gYmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHNvdXJjZVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzb3VyY2UgdmFsdWUgaXMgYW4gb2JqZWN0LCBhbmQgd2UncmUgZGVjbGFyaW5nIGl0ICh0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGEgbmV3IG9uZSksIHRha2VcbiAgICAgICAgICAgICAgICAvLyBhIGNvcHkgc28gYXMgdG8gbm90IHJlLXVzZSB0aGUgcmVmZXJlbmNlIGFuZCBwb2xsdXRlIHRoZSBkZWNsYXJhdGlvbi4gTm90ZTogdGhpcyBpcyBwcm9iYWJseVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIGRlZmF1bHQgZm9yIGFueSBcIm9iamVjdHNcIiBpbiBhIGRlY2xhcmF0aW9uIHRoYXQgYXJlIHBsYWluIGFuZCBub3Qgc29tZSBjbGFzcyB0eXBlXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2FuJ3QgYmUgY29waWVkXG4gICAgICAgICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKSA9PT0gcGxhaW5PYmplY3RQcm90b3R5cGUgfHwgIU9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwbGFpbiBvYmplY3QgY2FuIGJlIGRlZXAtY29waWVkIGJ5IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoc3JjRGVzYy52YWx1ZSA9IHt9LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuIGFycmF5IGNhbiBiZSBkZWVwIGNvcGllZCBieSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKHNyY0Rlc2MudmFsdWUgPSBbXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXIgb2JqZWN0IGxpa2UgdGhpbmdzIChyZWdleHBzLCBkYXRlcywgY2xhc3NlcywgZXRjKSBjYW4ndCBiZSBkZWVwLWNvcGllZCByZWxpYWJseVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERlY2xhcmVkIHByb3BldHkgJyR7a30nIGlzIG5vdCBhIHBsYWluIG9iamVjdCBhbmQgbXVzdCBiZSBhc3NpZ25lZCBieSByZWZlcmVuY2UsIHBvc3NpYmx5IHBvbGx1dGluZyBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyB0YWdgLCBkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2QgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShkKSA6IGR9YCk7XG4gICAgICAgICAgICAgICAgICBkW2tdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkW2tdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBpbnRvXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRba10pICYmIGRba10ubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEZWZpbmUoZFtrXSA9IG5ldyAodmFsdWUuY29uc3RydWN0b3IpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcmVndWxhciBvYmplY3QsIHNvIHdlIGRlZXBEZWZpbmUgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICBkZWVwRGVmaW5lKGRba10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBqdXN0IGEgcHJpbWl0aXZlIHZhbHVlLCBvciBhIFByb21pc2VcbiAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBkW2tdID0gc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkLCBrLCBzcmNEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiZGVlcEFzc2lnblwiLCBrLCBzW2tdLCBleCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVuYm94PFQ+KGE6IFQpOiBUIHtcbiAgICBpZiAoYSA9PT0gbnVsbCkgcmV0dXJuIG51bGwgYXMgVDtcbiAgICBjb25zdCB2ID0gYT8udmFsdWVPZigpO1xuICAgIHJldHVybiAoQXJyYXkuaXNBcnJheSh2KSA/IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh2LCB1bmJveCkgOiB2KSBhcyBUO1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduUHJvcHMoYmFzZTogTm9kZSwgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAvLyBDb3B5IHByb3AgaGllcmFyY2h5IG9udG8gdGhlIGVsZW1lbnQgdmlhIHRoZSBhc3NzaWdubWVudCBvcGVyYXRvciBpbiBvcmRlciB0byBydW4gc2V0dGVyc1xuICAgIGlmICghKGNhbGxTdGFja1N5bWJvbCBpbiBwcm9wcykpIHtcbiAgICAgIChmdW5jdGlvbiBhc3NpZ24oZDogYW55LCBzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHMgPT09IG51bGwgfHwgcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzICE9PSAnb2JqZWN0JylcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wcyBiZWZvcmUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgIGNvbnN0IHNvdXJjZUVudHJpZXMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzKSk7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzKSkge1xuICAgICAgICAgIHNvdXJjZUVudHJpZXMuc29ydChhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGQsIGFbMF0pO1xuICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYykgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICBpZiAoJ3NldCcgaW4gZGVzYykgcmV0dXJuIDE7XG4gICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKSByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2V0ID0gaXNUZXN0RW52IHx8ICEoZCBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8IChkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgICAgPyAoazogc3RyaW5nLCB2OiBhbnkpID0+IHsgZFtrXSA9IHYgfVxuICAgICAgICAgIDogKGs6IHN0cmluZywgdjogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoKHYgPT09IG51bGwgfHwgdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2ID09PSAnYm9vbGVhbicgfHwgdHlwZW9mIHYgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAmJiAoIShrIGluIGQpIHx8IHR5cGVvZiBkW2sgYXMga2V5b2YgdHlwZW9mIGRdICE9PSAnc3RyaW5nJykpXG4gICAgICAgICAgICAgIGQuc2V0QXR0cmlidXRlKGsgPT09ICdjbGFzc05hbWUnID8gJ2NsYXNzJyA6IGssIFN0cmluZyh2KSk7XG4gICAgICAgICAgICBlbHNlIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgZFtrXSA9IHY7XG4gICAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2ssIHNyY0Rlc2NdIG9mIHNvdXJjZUVudHJpZXMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCd2YWx1ZScgaW4gc3JjRGVzYykge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNyY0Rlc2MudmFsdWU7XG4gICAgICAgICAgICAgIGlmIChpc0FzeW5jSXRlcjx1bmtub3duPih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlTGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKHYgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVkTm9kZXMuaGFzKGJhc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhpcyBwcm9taXNlIHJlc29sdmVkIHRvIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXN5bmNJdGVyPHVua25vd24+KHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25JdGVyYWJsZSh2LCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduT2JqZWN0KHYsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoc1trXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0KGssIHYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4gY29uc29sZS5sb2coYEV4Y2VwdGlvbiBpbiBwcm9taXNlZCBhdHRyaWJ1dGUgJyR7a30nYCwgZXJyb3IsIGxvZ05vZGUoZCkpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNBc3luY0l0ZXI8dW5rbm93bj4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXMgYSByZWFsIHZhbHVlLCB3aGljaCBtaWdodCBiZSBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhaXNQcm9taXNlTGlrZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICBhc3NpZ25PYmplY3QodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHNba10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2V0KGssIHNba10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ29weSB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZ2V0dGVyL3NldHRlclxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZCwgaywgc3JjRGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXg6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcImFzc2lnblByb3BzXCIsIGssIHNba10sIGV4KTtcbiAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbkl0ZXJhYmxlKGl0ZXI6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4gfCBBc3luY0l0ZXJhdG9yPHVua25vd24sIGFueSwgdW5kZWZpbmVkPiwgazogc3RyaW5nKSB7XG4gICAgICAgICAgbGV0IGFwID0gYXN5bmNJdGVyYXRvcihpdGVyKTtcbiAgICAgICAgICAvLyBERUJVRyBzdXBwb3J0XG4gICAgICAgICAgbGV0IGNyZWF0ZWRBdCA9IERhdGUubm93KCkgKyB0aW1lT3V0V2FybjtcbiAgICAgICAgICBjb25zdCBjcmVhdGVkQnkgPSBERUJVRyAmJiBuZXcgRXJyb3IoXCJDcmVhdGVkIGJ5XCIpLnN0YWNrO1xuXG4gICAgICAgICAgbGV0IG1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoZXM6IEl0ZXJhdG9yUmVzdWx0PHVua25vd24+KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgbW91bnRlZCA9IG1vdW50ZWQgfHwgYmFzZS5pc0Nvbm5lY3RlZDtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBiZWVuIG1vdW50ZWQgYmVmb3JlLCBidXQgYXJlbid0IG5vdywgcmVtb3ZlIHRoZSBjb25zdW1lclxuICAgICAgICAgICAgICBpZiAocmVtb3ZlZE5vZGVzLmhhcyhiYXNlKSkge1xuICAgICAgICAgICAgICAgIC8qIFdlIGRvbid0IG5lZWQgdG8gY2xvc2UgdGhlIGl0ZXJhdG9yIGhlcmUgYXMgaXQgbXVzdCBoYXZlIGJlZW4gZG9uZSBpZiBpdCdzIGluIHJlbW92ZWROb2RlcyAqL1xuICAgICAgICAgICAgICAgIC8vIGVycm9yKFwiKG5vZGUgcmVtb3ZlZClcIik7XG4gICAgICAgICAgICAgICAgLy8gYXAucmV0dXJuPy4oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHVuYm94KGVzLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICBUSElTIElTIEpVU1QgQSBIQUNLOiBgc3R5bGVgIGhhcyB0byBiZSBzZXQgbWVtYmVyIGJ5IG1lbWJlciwgZWc6XG4gICAgICAgICAgICAgICAgZS5zdHlsZS5jb2xvciA9ICdibHVlJyAgICAgICAgLS0tIHdvcmtzXG4gICAgICAgICAgICAgICAgZS5zdHlsZSA9IHsgY29sb3I6ICdibHVlJyB9ICAgLS0tIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICAgICB3aGVyZWFzIGluIGdlbmVyYWwgd2hlbiBhc3NpZ25pbmcgdG8gcHJvcGVydHkgd2UgbGV0IHRoZSByZWNlaXZlclxuICAgICAgICAgICAgICBkbyBhbnkgd29yayBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIG9iamVjdC4gVGhpcyBtaWdodCBiZSBiZXR0ZXIgaGFuZGxlZFxuICAgICAgICAgICAgICBieSBoYXZpbmcgYSBzZXR0ZXIgZm9yIGBzdHlsZWAgaW4gdGhlIFBvRWxlbWVudE1ldGhvZHMgdGhhdCBpcyBzZW5zaXRpdmVcbiAgICAgICAgICAgICAgdG8gdGhlIHR5cGUgKHN0cmluZ3xvYmplY3QpIGJlaW5nIHBhc3NlZCBzbyB3ZSBjYW4ganVzdCBkbyBhIHN0cmFpZ2h0XG4gICAgICAgICAgICAgIGFzc2lnbm1lbnQgYWxsIHRoZSB0aW1lLCBvciBtYWtpbmcgdGhlIGRlY3Npb24gYmFzZWQgb24gdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiB0aGUgcHJvdG90eXBlIGNoYWluIGFuZCBhc3N1bWluZyBhbnl0aGluZyBiZWxvdyBcIlBPXCIgbXVzdCBiZVxuICAgICAgICAgICAgICBhIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc3REZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKTtcbiAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ3N0eWxlJyB8fCAhZGVzdERlc2M/LnNldClcbiAgICAgICAgICAgICAgICAgIGFzc2lnbihkW2tdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgc2V0KGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcmMgaXMgbm90IGFuIG9iamVjdCAob3IgaXMgbnVsbCkgLSBqdXN0IGFzc2lnbiBpdCwgdW5sZXNzIGl0J3MgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKERFQlVHICYmICFtb3VudGVkICYmIGNyZWF0ZWRBdCA8IERhdGUubm93KCkpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW1lbnQgd2l0aCBhc3luYyBhdHRyaWJ1dGUgJyR7a30nIG5vdCBtb3VudGVkIGFmdGVyICR7dGltZU91dFdhcm4vMTAwMH0gc2Vjb25kcy4gSWYgaXQgaXMgbmV2ZXIgbW91bnRlZCwgaXQgd2lsbCBsZWFrLlxcbkVsZW1lbnQgY29udGFpbnM6ICR7bG9nTm9kZShiYXNlKX1cXG4ke2NyZWF0ZWRCeX1gKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFwLm5leHQoKS50aGVuKHVwZGF0ZSkuY2F0Y2goZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlcnJvciA9IChlcnJvclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvclZhbHVlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkR5bmFtaWMgYXR0cmlidXRlIHRlcm1pbmF0aW9uXCIsIGVycm9yVmFsdWUsIGssIGxvZ05vZGUoZCksIGNyZWF0ZWRCeSwgbG9nTm9kZShiYXNlKSk7XG4gICAgICAgICAgICAgIGJhc2UuYXBwZW5kQ2hpbGQoRHluYW1pY0VsZW1lbnRFcnJvcih7IGVycm9yOiBlcnJvclZhbHVlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1bmJveGVkID0gaXRlci52YWx1ZU9mKCk7XG4gICAgICAgICAgaWYgKHVuYm94ZWQgIT09IHVuZGVmaW5lZCAmJiB1bmJveGVkICE9PSBpdGVyICYmICFpc0FzeW5jSXRlcih1bmJveGVkKSlcbiAgICAgICAgICAgIHVwZGF0ZSh7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdW5ib3hlZCB9KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcC5uZXh0KCkudGhlbih1cGRhdGUpLmNhdGNoKGVycm9yKTtcbiAgICAgICAgICByZW1vdmVkTm9kZXMub25SZW1vdmFsKFtiYXNlXSwgaywgKCkgPT4gIHsgYXAucmV0dXJuPy4oKTsgKGFwIGFzIGFueSkgPSBudWxsOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFzc2lnbk9iamVjdCh2YWx1ZTogYW55LCBrOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEhhdmluZyBET00gTm9kZXMgYXMgcHJvcGVydGllcyBvZiBvdGhlciBET00gTm9kZXMgaXMgYSBiYWQgaWRlYSBhcyBpdCBtYWtlcyB0aGUgRE9NIHRyZWUgaW50byBhIGN5Y2xpYyBncmFwaC4gWW91IHNob3VsZCByZWZlcmVuY2Ugbm9kZXMgYnkgSUQgb3IgdmlhIGEgY29sbGVjdGlvbiBzdWNoIGFzIC5jaGlsZE5vZGVzLiBQcm9wZXR5OiAnJHtrfScgdmFsdWU6ICR7bG9nTm9kZSh2YWx1ZSl9IGRlc3RpbmF0aW9uOiAke2Jhc2UgaW5zdGFuY2VvZiBOb2RlID8gbG9nTm9kZShiYXNlKSA6IGJhc2V9YCk7XG4gICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3RlIC0gaWYgd2UncmUgY29weWluZyB0byBvdXJzZWxmIChvciBhbiBhcnJheSBvZiBkaWZmZXJlbnQgbGVuZ3RoKSxcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRlY291cGxpbmcgY29tbW9uIG9iamVjdCByZWZlcmVuY2VzLCBzbyB3ZSBuZWVkIGEgY2xlYW4gb2JqZWN0IHRvXG4gICAgICAgICAgICAvLyBhc3NpZ24gaW50b1xuICAgICAgICAgICAgaWYgKCEoayBpbiBkKSB8fCBkW2tdID09PSB2YWx1ZSB8fCAoQXJyYXkuaXNBcnJheShkW2tdKSAmJiBkW2tdLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gbmV3ICh2YWx1ZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICAgICAgYXNzaWduKGNvcHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQoaywgY29weSk7XG4gICAgICAgICAgICAgICAgLy9hc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc29tZSBzb3J0IG9mIGNvbnN0cnVjdGVkIG9iamVjdCwgd2hpY2ggd2UgY2FuJ3QgY2xvbmUsIHNvIHdlIGhhdmUgdG8gY29weSBieSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBzZXQoaywgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkLCBrKT8uc2V0KVxuICAgICAgICAgICAgICAgIHNldChrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhc3NpZ24oZFtrXSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkoYmFzZSwgcHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIEV4dGVuZCBhIGNvbXBvbmVudCBjbGFzcyB3aXRoIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgY2xhc3MgZmFjdG9yeTpcbiAgICAgIGNvbnN0IE5ld0RpdiA9IERpdi5leHRlbmRlZCh7IG92ZXJyaWRlcyB9KVxuICAgICAgICAgIC4uLm9yLi4uXG4gICAgICBjb25zdCBOZXdEaWMgPSBEaXYuZXh0ZW5kZWQoKGluc3RhbmNlOnsgYXJiaXRyYXJ5LXR5cGUgfSkgPT4gKHsgb3ZlcnJpZGVzIH0pKVxuICAgICAgICAgLi4ubGF0ZXIuLi5cbiAgICAgIGNvbnN0IGVsdE5ld0RpdiA9IE5ld0Rpdih7YXR0cnN9LC4uLmNoaWxkcmVuKVxuICAqL1xuXG4gIGZ1bmN0aW9uIHRhZ0hhc0luc3RhbmNlKHRoaXM6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UsIGU6IGFueSkge1xuICAgIGZvciAobGV0IGMgPSBlLmNvbnN0cnVjdG9yOyBjOyBjID0gYy5zdXBlcikge1xuICAgICAgaWYgKGMgPT09IHRoaXMpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmRlZCh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpIHtcbiAgICBjb25zdCBpbnN0YW5jZURlZmluaXRpb24gPSAodHlwZW9mIF9vdmVycmlkZXMgIT09ICdmdW5jdGlvbicpXG4gICAgICA/IChpbnN0YW5jZTogSW5zdGFuY2UpID0+IE9iamVjdC5hc3NpZ24oe30sIF9vdmVycmlkZXMsIGluc3RhbmNlKVxuICAgICAgOiBfb3ZlcnJpZGVzXG5cbiAgICBjb25zdCB1bmlxdWVUYWdJRCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgKGlkQ291bnQrKykudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG4gICAgY29uc3Qgc3RhdGljRXh0ZW5zaW9uczogT3ZlcnJpZGVzID0gaW5zdGFuY2VEZWZpbml0aW9uKHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSk7XG4gICAgLyogXCJTdGF0aWNhbGx5XCIgY3JlYXRlIGFueSBzdHlsZXMgcmVxdWlyZWQgYnkgdGhpcyB3aWRnZXQgKi9cbiAgICBpZiAoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFpdWlFeHRlbmRlZFRhZ1N0eWxlcyk/LmFwcGVuZENoaWxkKHRoaXNEb2MuY3JlYXRlVGV4dE5vZGUoc3RhdGljRXh0ZW5zaW9ucy5zdHlsZXMgKyAnXFxuJykpO1xuICAgIH1cblxuICAgIC8vIFwidGhpc1wiIGlzIHRoZSB0YWcgd2UncmUgYmVpbmcgZXh0ZW5kZWQgZnJvbSwgYXMgaXQncyBhbHdheXMgY2FsbGVkIGFzOiBgKHRoaXMpLmV4dGVuZGVkYFxuICAgIC8vIEhlcmUncyB3aGVyZSB3ZSBhY3R1YWxseSBjcmVhdGUgdGhlIHRhZywgYnkgYWNjdW11bGF0aW5nIGFsbCB0aGUgYmFzZSBhdHRyaWJ1dGVzIGFuZFxuICAgIC8vIChmaW5hbGx5KSBhc3NpZ25pbmcgdGhvc2Ugc3BlY2lmaWVkIGJ5IHRoZSBpbnN0YW50aWF0aW9uXG4gICAgY29uc3QgZXh0ZW5kVGFnRm46IEV4dGVuZFRhZ0Z1bmN0aW9uID0gKGF0dHJzLCAuLi5jaGlsZHJlbikgPT4ge1xuICAgICAgY29uc3Qgbm9BdHRycyA9IGlzQ2hpbGRUYWcoYXR0cnMpO1xuICAgICAgY29uc3QgbmV3Q2FsbFN0YWNrOiAoQ29uc3RydWN0ZWQgJiBPdmVycmlkZXMpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNvbWJpbmVkQXR0cnMgPSB7IFtjYWxsU3RhY2tTeW1ib2xdOiAobm9BdHRycyA/IG5ld0NhbGxTdGFjayA6IGF0dHJzW2NhbGxTdGFja1N5bWJvbF0pID8/IG5ld0NhbGxTdGFjayB9XG4gICAgICBjb25zdCBlID0gbm9BdHRycyA/IHRoaXMoY29tYmluZWRBdHRycywgYXR0cnMsIC4uLmNoaWxkcmVuKSA6IHRoaXMoY29tYmluZWRBdHRycywgLi4uY2hpbGRyZW4pO1xuICAgICAgZS5jb25zdHJ1Y3RvciA9IGV4dGVuZFRhZztcbiAgICAgIGNvbnN0IHRhZ0RlZmluaXRpb24gPSBpbnN0YW5jZURlZmluaXRpb24oeyBbVW5pcXVlSURdOiB1bmlxdWVUYWdJRCB9KTtcbiAgICAgIGNvbWJpbmVkQXR0cnNbY2FsbFN0YWNrU3ltYm9sXS5wdXNoKHRhZ0RlZmluaXRpb24pO1xuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGRlY2xhcmUgYW5kIG92ZXJyaWRlXG4gICAgICAgIGNvbnN0IGlzQW5jZXN0cmFsID0gKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4sIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgZiA9IGNyZWF0b3I7IGY7IGYgPSBmLnN1cGVyKVxuICAgICAgICAgICAgaWYgKGYuZGVmaW5pdGlvbj8uZGVjbGFyZSAmJiBrZXkgaW4gZi5kZWZpbml0aW9uLmRlY2xhcmUpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnRGVmaW5pdGlvbi5kZWNsYXJlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLmRlY2xhcmUpLmZpbHRlcihrID0+IChrIGluIGUpIHx8IGlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVjbGFyZWQga2V5cyAnJHtjbGFzaH0nIGluICR7ZXh0ZW5kVGFnLm5hbWV9IGFscmVhZHkgZXhpc3QgaW4gYmFzZSAnJHt0aGlzLnZhbHVlT2YoKX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKSB7XG4gICAgICAgICAgY29uc3QgY2xhc2ggPSBPYmplY3Qua2V5cyh0YWdEZWZpbml0aW9uLm92ZXJyaWRlKS5maWx0ZXIoayA9PiAhKGsgaW4gZSkgJiYgIShjb21tb25Qcm9wZXJ0aWVzICYmIGsgaW4gY29tbW9uUHJvcGVydGllcykgJiYgIWlzQW5jZXN0cmFsKHRoaXMsIGspKTtcbiAgICAgICAgICBpZiAoY2xhc2gubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3ZlcnJpZGRlbiBrZXlzICcke2NsYXNofScgaW4gJHtleHRlbmRUYWcubmFtZX0gZG8gbm90IGV4aXN0IGluIGJhc2UgJyR7dGhpcy52YWx1ZU9mKCl9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLmRlY2xhcmUsIHRydWUpO1xuICAgICAgZGVlcERlZmluZShlLCB0YWdEZWZpbml0aW9uLm92ZXJyaWRlKTtcbiAgICAgIGNvbnN0IHJlQXNzaWduID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICB0YWdEZWZpbml0aW9uLml0ZXJhYmxlICYmIE9iamVjdC5rZXlzKHRhZ0RlZmluaXRpb24uaXRlcmFibGUpLmZvckVhY2goayA9PiB7XG4gICAgICAgIGlmIChrIGluIGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgSWdub3JpbmcgYXR0ZW1wdCB0byByZS1kZWZpbmUgaXRlcmFibGUgcHJvcGVydHkgXCIke2t9XCIgYXMgaXQgY291bGQgYWxyZWFkeSBoYXZlIGNvbnN1bWVyc2ApO1xuICAgICAgICAgIHJlQXNzaWduLmFkZChrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZpbmVJdGVyYWJsZVByb3BlcnR5KGUsIGssIHRhZ0RlZmluaXRpb24uaXRlcmFibGUhW2sgYXMga2V5b2YgdHlwZW9mIHRhZ0RlZmluaXRpb24uaXRlcmFibGVdKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChjb21iaW5lZEF0dHJzW2NhbGxTdGFja1N5bWJvbF0gPT09IG5ld0NhbGxTdGFjaykge1xuICAgICAgICBpZiAoIW5vQXR0cnMpXG4gICAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBiYXNlPy5jb25zdHJ1Y3RlZD8uY2FsbChlKTtcbiAgICAgICAgICBpZiAoaXNDaGlsZFRhZyhjaGlsZHJlbikpIC8vIHRlY2huaWNhbGx5IG5vdCBuZWNlc3NhcnksIHNpbmNlIFwidm9pZFwiIGlzIGdvaW5nIHRvIGJlIHVuZGVmaW5lZCBpbiA5OS45JSBvZiBjYXNlcy5cbiAgICAgICAgICAgIGUuYXBwZW5kKC4uLm5vZGVzKGNoaWxkcmVuKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB0aGUgZnVsbCB0cmVlIG9mIGF1Z21lbnRlZCBET00gZWxlbWVudHMgaGFzIGJlZW4gY29uc3RydWN0ZWQsIGZpcmUgYWxsIHRoZSBpdGVyYWJsZSBwcm9wZWVydGllc1xuICAgICAgICAvLyBzbyB0aGUgZnVsbCBoaWVyYXJjaHkgZ2V0cyB0byBjb25zdW1lIHRoZSBpbml0aWFsIHN0YXRlLCB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgICAgLy8gYnkgYXNzaWduUHJvcHMgZnJvbSBhIGZ1dHVyZVxuICAgICAgICBjb25zdCBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlcyA9IHt9O1xuICAgICAgICBsZXQgaGFzSW5pdGlhbFZhbHVlcyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgbmV3Q2FsbFN0YWNrKSB7XG4gICAgICAgICAgaWYgKGJhc2UuaXRlcmFibGUpIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhiYXNlLml0ZXJhYmxlKSkge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgc2VsZi1hc3NpZ24gaXRlcmFibGVzIHRoYXQgaGF2ZSB0aGVtc2VsdmVzIGJlZW4gYXNzaWduZWQgd2l0aCBmdXR1cmVzXG4gICAgICAgICAgICBjb25zdCBhdHRyRXhpc3RzID0gIW5vQXR0cnMgJiYgayBpbiBhdHRycztcbiAgICAgICAgICAgIGlmICgocmVBc3NpZ24uaGFzKGspICYmIGF0dHJFeGlzdHMpIHx8ICEoYXR0ckV4aXN0cyAmJiAoIWlzUHJvbWlzZUxpa2UoYXR0cnNba10pIHx8ICFpc0FzeW5jSXRlcihhdHRyc1trXSkpKSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVbayBhcyBrZXlvZiB0eXBlb2YgZV0/LnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gc29tZSBwcm9wcyBvZiBlIChIVE1MRWxlbWVudCkgYXJlIHJlYWQtb25seSwgYW5kIHdlIGRvbid0IGtub3cgaWYgayBpcyBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICBjb21iaW5lZEluaXRpYWxJdGVyYWJsZVZhbHVlc1trXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGhhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNJbml0aWFsVmFsdWVzKVxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oZSwgY29tYmluZWRJbml0aWFsSXRlcmFibGVWYWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kVGFnOiBFeHRlbmRUYWdGdW5jdGlvbkluc3RhbmNlID0gT2JqZWN0LmFzc2lnbihleHRlbmRUYWdGbiwge1xuICAgICAgc3VwZXI6IHRoaXMsXG4gICAgICBkZWZpbml0aW9uOiBPYmplY3QuYXNzaWduKHN0YXRpY0V4dGVuc2lvbnMsIHsgW1VuaXF1ZUlEXTogdW5pcXVlVGFnSUQgfSksXG4gICAgICBleHRlbmRlZCxcbiAgICAgIHZhbHVlT2Y6ICgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLmRlY2xhcmUgfHwge30pLCAuLi5PYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zLml0ZXJhYmxlIHx8IHt9KV07XG4gICAgICAgIHJldHVybiBgJHtleHRlbmRUYWcubmFtZX06IHske2tleXMuam9pbignLCAnKX19XFxuIFxcdTIxQUEgJHt0aGlzLnZhbHVlT2YoKX1gXG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICB2YWx1ZTogdGFnSGFzSW5zdGFuY2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCBmdWxsUHJvdG8gPSB7fTtcbiAgICAoZnVuY3Rpb24gd2Fsa1Byb3RvKGNyZWF0b3I6IFRhZ0NyZWF0b3I8RWxlbWVudD4pIHtcbiAgICAgIGlmIChjcmVhdG9yPy5zdXBlcilcbiAgICAgICAgd2Fsa1Byb3RvKGNyZWF0b3Iuc3VwZXIpO1xuXG4gICAgICBjb25zdCBwcm90byA9IGNyZWF0b3IuZGVmaW5pdGlvbjtcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgcHJvdG8/Lm92ZXJyaWRlKTtcbiAgICAgICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHByb3RvPy5kZWNsYXJlKTtcbiAgICAgIH1cbiAgICB9KSh0aGlzKTtcbiAgICBkZWVwRGVmaW5lKGZ1bGxQcm90bywgc3RhdGljRXh0ZW5zaW9ucy5vdmVycmlkZSk7XG4gICAgZGVlcERlZmluZShmdWxsUHJvdG8sIHN0YXRpY0V4dGVuc2lvbnMuZGVjbGFyZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXh0ZW5kVGFnLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhmdWxsUHJvdG8pKTtcblxuICAgIC8vIEF0dGVtcHQgdG8gbWFrZSB1cCBhIG1lYW5pbmdmdTtsIG5hbWUgZm9yIHRoaXMgZXh0ZW5kZWQgdGFnXG4gICAgY29uc3QgY3JlYXRvck5hbWUgPSBmdWxsUHJvdG9cbiAgICAgICYmICdjbGFzc05hbWUnIGluIGZ1bGxQcm90b1xuICAgICAgJiYgdHlwZW9mIGZ1bGxQcm90by5jbGFzc05hbWUgPT09ICdzdHJpbmcnXG4gICAgICA/IGZ1bGxQcm90by5jbGFzc05hbWVcbiAgICAgIDogdW5pcXVlVGFnSUQ7XG4gICAgY29uc3QgY2FsbFNpdGUgPSBERUJVRyA/IChuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoJ1xcbicpWzJdID8/ICcnKSA6ICcnO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZFRhZywgXCJuYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBcIjxhaS1cIiArIGNyZWF0b3JOYW1lLnJlcGxhY2UoL1xccysvZywgJy0nKSArIGNhbGxTaXRlICsgXCI+XCJcbiAgICB9KTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc3QgZXh0cmFVbmtub3duUHJvcHMgPSBPYmplY3Qua2V5cyhzdGF0aWNFeHRlbnNpb25zKS5maWx0ZXIoayA9PiAhWydzdHlsZXMnLCAnaWRzJywgJ2NvbnN0cnVjdGVkJywgJ2RlY2xhcmUnLCAnb3ZlcnJpZGUnLCAnaXRlcmFibGUnXS5pbmNsdWRlcyhrKSk7XG4gICAgICBpZiAoZXh0cmFVbmtub3duUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2V4dGVuZFRhZy5uYW1lfSBkZWZpbmVzIGV4dHJhbmVvdXMga2V5cyAnJHtleHRyYVVua25vd25Qcm9wc30nLCB3aGljaCBhcmUgdW5rbm93bmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kVGFnO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlRWxlbWVudDogQ3JlYXRlRWxlbWVudFsnY3JlYXRlRWxlbWVudCddID0gKG5hbWUsIGF0dHJzLCAuLi5jaGlsZHJlbikgPT5cbiAgICAvLyBAdHMtaWdub3JlOiBFeHByZXNzaW9uIHByb2R1Y2VzIGEgdW5pb24gdHlwZSB0aGF0IGlzIHRvbyBjb21wbGV4IHRvIHJlcHJlc2VudC50cygyNTkwKVxuICAgIG5hbWUgaW5zdGFuY2VvZiBOb2RlID8gbmFtZVxuICAgIDogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIG5hbWUgaW4gYmFzZVRhZ0NyZWF0b3JzID8gYmFzZVRhZ0NyZWF0b3JzW25hbWVdKGF0dHJzLCBjaGlsZHJlbilcbiAgICA6IG5hbWUgPT09IGJhc2VUYWdDcmVhdG9ycy5jcmVhdGVFbGVtZW50ID8gWy4uLm5vZGVzKC4uLmNoaWxkcmVuKV1cbiAgICA6IHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nID8gbmFtZShhdHRycywgY2hpbGRyZW4pXG4gICAgOiBEeW5hbWljRWxlbWVudEVycm9yKHsgZXJyb3I6IG5ldyBFcnJvcihcIklsbGVnYWwgdHlwZSBpbiBjcmVhdGVFbGVtZW50OlwiICsgbmFtZSkgfSlcblxuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGJhc2VUYWdDcmVhdG9yczogQ3JlYXRlRWxlbWVudCAmIHtcbiAgICBbSyBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdPzogVGFnQ3JlYXRvcjxRICYgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdICYgUG9FbGVtZW50TWV0aG9kcz5cbiAgfSAmIHtcbiAgICBbbjogc3RyaW5nXTogVGFnQ3JlYXRvcjxRICYgRWxlbWVudCAmIFBvRWxlbWVudE1ldGhvZHM+XG4gIH0gPSB7XG4gICAgY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KGs6IEspOiBUYWdDcmVhdG9yPFEgJiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gJiBQb0VsZW1lbnRNZXRob2RzPjtcbiAgZnVuY3Rpb24gY3JlYXRlVGFnPEUgZXh0ZW5kcyBFbGVtZW50PihrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBFICYgUG9FbGVtZW50TWV0aG9kcz47XG4gIGZ1bmN0aW9uIGNyZWF0ZVRhZyhrOiBzdHJpbmcpOiBUYWdDcmVhdG9yPFEgJiBOYW1lc3BhY2VkRWxlbWVudEJhc2UgJiBQb0VsZW1lbnRNZXRob2RzPiB7XG4gICAgaWYgKGJhc2VUYWdDcmVhdG9yc1trXSlcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBiYXNlVGFnQ3JlYXRvcnNba107XG5cbiAgICBjb25zdCB0YWdDcmVhdG9yID0gKGF0dHJzOiBRICYgUG9FbGVtZW50TWV0aG9kcyAmIFRhZ0NyZWF0aW9uT3B0aW9ucyB8IENoaWxkVGFncywgLi4uY2hpbGRyZW46IENoaWxkVGFnc1tdKSA9PiB7XG4gICAgICBpZiAoaXNDaGlsZFRhZyhhdHRycykpIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdChhdHRycyk7XG4gICAgICAgIGF0dHJzID0ge30gYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHRlc3QgaXMgYWx3YXlzIHRydWUsIGJ1dCBuYXJyb3dzIHRoZSB0eXBlIG9mIGF0dHJzIHRvIGF2b2lkIGZ1cnRoZXIgZXJyb3JzXG4gICAgICBpZiAoIWlzQ2hpbGRUYWcoYXR0cnMpKSB7XG4gICAgICAgIGlmIChhdHRycy5kZWJ1Z2dlcikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGRlbGV0ZSBhdHRycy5kZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGUgPSBuYW1lU3BhY2VcbiAgICAgICAgICA/IHRoaXNEb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVTcGFjZSBhcyBzdHJpbmcsIGsudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICA6IHRoaXNEb2MuY3JlYXRlRWxlbWVudChrKTtcbiAgICAgICAgZS5jb25zdHJ1Y3RvciA9IHRhZ0NyZWF0b3I7XG5cbiAgICAgICAgZGVlcERlZmluZShlLCB0YWdQcm90b3R5cGVzKTtcbiAgICAgICAgYXNzaWduUHJvcHMoZSwgYXR0cnMpO1xuXG4gICAgICAgIC8vIEFwcGVuZCBhbnkgY2hpbGRyZW5cbiAgICAgICAgZS5hcHBlbmQoLi4ubm9kZXMoLi4uY2hpbGRyZW4pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkaW5nRXh0ZW5kZXIgPSA8VGFnQ3JlYXRvcjxFbGVtZW50Pj48dW5rbm93bj5PYmplY3QuYXNzaWduKHRhZ0NyZWF0b3IsIHtcbiAgICAgIHN1cGVyOiAoKSA9PiB7IHRocm93IG5ldyBFcnJvcihcIkNhbid0IGludm9rZSBuYXRpdmUgZWxlbWVuZXQgY29uc3RydWN0b3JzIGRpcmVjdGx5LiBVc2UgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlwiKSB9LFxuICAgICAgZXh0ZW5kZWQsIC8vIEhvdyB0byBleHRlbmQgdGhpcyAoYmFzZSkgdGFnXG4gICAgICB2YWx1ZU9mKCkgeyByZXR1cm4gYFRhZ0NyZWF0b3I6IDwke25hbWVTcGFjZSB8fCAnJ30ke25hbWVTcGFjZSA/ICc6OicgOiAnJ30ke2t9PmAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgdmFsdWU6IHRhZ0hhc0luc3RhbmNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhZ0NyZWF0b3IsIFwibmFtZVwiLCB7IHZhbHVlOiAnPCcgKyBrICsgJz4nIH0pO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gYmFzZVRhZ0NyZWF0b3JzW2tdID0gaW5jbHVkaW5nRXh0ZW5kZXI7XG4gIH1cblxuICB0YWdzLmZvckVhY2goY3JlYXRlVGFnKTtcblxuICAvLyBAdHMtaWdub3JlXG4gIHJldHVybiBiYXNlVGFnQ3JlYXRvcnM7XG59XG5cbi8qIERPTSBub2RlIHJlbW92YWwgbG9naWMgKi9cbnR5cGUgUGlja0J5VHlwZTxULCBWYWx1ZT4gPSB7XG4gIFtQIGluIGtleW9mIFQgYXMgVFtQXSBleHRlbmRzIFZhbHVlIHwgdW5kZWZpbmVkID8gUCA6IG5ldmVyXTogVFtQXVxufVxuZnVuY3Rpb24gbXV0YXRpb25UcmFja2VyKHJvb3Q6IE5vZGUpIHtcbiAgY29uc3QgdHJhY2tlZCA9IG5ldyBXZWFrU2V0PE5vZGU+KCk7XG4gIGNvbnN0IHJlbW92YWxzOiBXZWFrTWFwPE5vZGUsIE1hcDxTeW1ib2wgfCBzdHJpbmcsICh0aGlzOiBOb2RlKT0+dm9pZD4+ID0gbmV3IFdlYWtNYXAoKTtcbiAgZnVuY3Rpb24gd2Fsayhub2RlczogTm9kZUxpc3QpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIC8vIEluIGNhc2UgaXQncyBiZSByZS1hZGRlZC9tb3ZlZFxuICAgICAgaWYgKCFub2RlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRyYWNrZWQuYWRkKG5vZGUpO1xuICAgICAgICB3YWxrKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIC8vIE1vZGVybiBvblJlbW92ZWRGcm9tRE9NIHN1cHBvcnRcbiAgICAgICAgY29uc3QgcmVtb3ZhbFNldCA9IHJlbW92YWxzLmdldChub2RlKTtcbiAgICAgICAgaWYgKHJlbW92YWxTZXQpIHtcbiAgICAgICAgICByZW1vdmFscy5kZWxldGUobm9kZSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgeF0gb2YgcmVtb3ZhbFNldD8uZW50cmllcygpKSB0cnkgeyB4LmNhbGwobm9kZSkgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIklnbm9yZWQgZXhjZXB0aW9uIGhhbmRsaW5nIG5vZGUgcmVtb3ZhbFwiLCBuYW1lLCB4LCBsb2dOb2RlKG5vZGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0JyAmJiBtLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgIHdhbGsobS5yZW1vdmVkTm9kZXMpXG4gICAgfSk7XG4gIH0pLm9ic2VydmUocm9vdCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXMoZTpOb2RlKSB7IHJldHVybiB0cmFja2VkLmhhcyhlKSB9LFxuICAgIGFkZChlOk5vZGUpIHsgcmV0dXJuIHRyYWNrZWQuYWRkKGUpIH0sXG4gICAgZ2V0UmVtb3ZhbEhhbmRsZXIoZTogTm9kZSwgbmFtZTogU3ltYm9sKSB7XG4gICAgICByZXR1cm4gcmVtb3ZhbHMuZ2V0KGUpPy5nZXQobmFtZSk7XG4gICAgfSxcbiAgICBvblJlbW92YWwoZTogTm9kZVtdLCBuYW1lOiBTeW1ib2wgfCBzdHJpbmcsIGhhbmRsZXI/OiAodGhpczogTm9kZSk9PnZvaWQpIHtcbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSkgPz8gbmV3IE1hcDxTeW1ib2wgfCBzdHJpbmcsICgpPT52b2lkPigpO1xuICAgICAgICAgIHJlbW92YWxzLnNldChlLCBtYXApO1xuICAgICAgICAgIG1hcC5zZXQobmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICBjb25zdCBtYXAgPSByZW1vdmFscy5nZXQoZSk7XG4gICAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWFwLnNpemUpXG4gICAgICAgICAgICAgIHJlbW92YWxzLmRlbGV0ZShlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsICIvLyBAdHMtaWdub3JlXG5leHBvcnQgY29uc3QgREVCVUcgPSBnbG9iYWxUaGlzLkRFQlVHID09ICcqJyB8fCBnbG9iYWxUaGlzLkRFQlVHID09IHRydWUgfHwgQm9vbGVhbihnbG9iYWxUaGlzLkRFQlVHPy5tYXRjaCgvKF58XFxXKUFJLVVJKFxcV3wkKS8pKSB8fCBmYWxzZTtcbmV4cG9ydCB7IF9jb25zb2xlIGFzIGNvbnNvbGUgfTtcbmV4cG9ydCBjb25zdCB0aW1lT3V0V2FybiA9IDUwMDA7XG5cbmNvbnN0IF9jb25zb2xlID0ge1xuICBsb2coLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnKEFJLVVJKSBMT0c6JywgLi4uYXJncywgbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL0Vycm9yXFxuXFxzKi4qXFxuLywnXFxuJykpXG4gIH0sXG4gIHdhcm4oLi4uYXJnczogYW55KSB7XG4gICAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oJyhBSS1VSSkgV0FSTjonLCAuLi5hcmdzLCBuZXcgRXJyb3IoKS5zdGFjaz8ucmVwbGFjZSgvRXJyb3JcXG5cXHMqLipcXG4vLCdcXG4nKSlcbiAgfSxcbiAgaW5mbyguLi5hcmdzOiBhbnkpIHtcbiAgICBpZiAoREVCVUcpIGNvbnNvbGUuaW5mbygnKEFJLVVJKSBJTkZPOicsIC4uLmFyZ3MpXG4gIH1cbn1cblxuIiwgImltcG9ydCB7IERFQlVHLCBjb25zb2xlIH0gZnJvbSBcIi4vZGVidWcuanNcIjtcblxuLy8gQ3JlYXRlIGEgZGVmZXJyZWQgUHJvbWlzZSwgd2hpY2ggY2FuIGJlIGFzeW5jaHJvbm91c2x5L2V4dGVybmFsbHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG5jb25zdCBkZWJ1Z0lkID0gU3ltYm9sKFwiZGVmZXJyZWRQcm9taXNlSURcIik7XG5cbmV4cG9ydCB0eXBlIERlZmVycmVkUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICByZWplY3Q6ICh2YWx1ZTogYW55KSA9PiB2b2lkO1xuICBbZGVidWdJZF0/OiBudW1iZXJcbn1cblxuLy8gVXNlZCB0byBzdXBwcmVzcyBUUyBlcnJvciBhYm91dCB1c2UgYmVmb3JlIGluaXRpYWxpc2F0aW9uXG5jb25zdCBub3RoaW5nID0gKHY6IGFueSk9Pnt9O1xubGV0IGlkID0gMTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZDxUPigpOiBEZWZlcnJlZFByb21pc2U8VD4ge1xuICBsZXQgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQgPSBub3RoaW5nO1xuICBsZXQgcmVqZWN0OiAodmFsdWU6IGFueSkgPT4gdm9pZCA9IG5vdGhpbmc7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigoLi4ucikgPT4gW3Jlc29sdmUsIHJlamVjdF0gPSByKSBhcyBEZWZlcnJlZFByb21pc2U8VD47XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqZWN0O1xuICBpZiAoREVCVUcpIHtcbiAgICBwcm9taXNlW2RlYnVnSWRdID0gaWQrKztcbiAgICBjb25zdCBpbml0TG9jYXRpb24gPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBwcm9taXNlLmNhdGNoKGV4ID0+IChleCBpbnN0YW5jZW9mIEVycm9yIHx8IGV4Py52YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSA/IGNvbnNvbGUubG9nKFwiRGVmZXJyZWQgcmVqZWN0aW9uXCIsIGV4LCBcImFsbG9jYXRlZCBhdCBcIiwgaW5pdExvY2F0aW9uKSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbi8vIFRydWUgaWYgYGV4cHIgaW4geGAgaXMgdmFsaWRcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdExpa2UoeDogYW55KTogeCBpcyBGdW5jdGlvbiB8IHt9IHtcbiAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VMaWtlPFQ+KHg6IGFueSk6IHggaXMgUHJvbWlzZUxpa2U8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHgpICYmICgndGhlbicgaW4geCkgJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSB9IGZyb20gXCIuL2RlYnVnLmpzXCJcbmltcG9ydCB7IERlZmVycmVkUHJvbWlzZSwgZGVmZXJyZWQsIGlzT2JqZWN0TGlrZSwgaXNQcm9taXNlTGlrZSB9IGZyb20gXCIuL2RlZmVycmVkLmpzXCJcblxuLyogSXRlcmFibGVQcm9wZXJ0aWVzIGNhbid0IGJlIGNvcnJlY3RseSB0eXBlZCBpbiBUUyByaWdodCBub3csIGVpdGhlciB0aGUgZGVjbGFyYXRpb25cbiAgd29ya3MgZm9yIHJldHJpZXZhbCAodGhlIGdldHRlciksIG9yIGl0IHdvcmtzIGZvciBhc3NpZ25tZW50cyAodGhlIHNldHRlciksIGJ1dCB0aGVyZSdzXG4gIG5vIFRTIHN5bnRheCB0aGF0IHBlcm1pdHMgY29ycmVjdCB0eXBlLWNoZWNraW5nIGF0IHByZXNlbnQuXG5cbiAgSWRlYWxseSwgaXQgd291bGQgYmU6XG5cbiAgdHlwZSBJdGVyYWJsZVByb3BlcnRpZXM8SVA+ID0ge1xuICAgIGdldCBbSyBpbiBrZXlvZiBJUF0oKTogQXN5bmNFeHRyYUl0ZXJhYmxlPElQW0tdPiAmIElQW0tdXG4gICAgc2V0IFtLIGluIGtleW9mIElQXSh2OiBJUFtLXSlcbiAgfVxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzgyNlxuXG4gIFdlIGNob29zZSB0aGUgZm9sbG93aW5nIHR5cGUgZGVzY3JpcHRpb24gdG8gYXZvaWQgdGhlIGlzc3VlcyBhYm92ZS4gQmVjYXVzZSB0aGUgQXN5bmNFeHRyYUl0ZXJhYmxlXG4gIGlzIFBhcnRpYWwgaXQgY2FuIGJlIG9taXR0ZWQgZnJvbSBhc3NpZ25tZW50czpcbiAgICB0aGlzLnByb3AgPSB2YWx1ZTsgIC8vIFZhbGlkLCBhcyBsb25nIGFzIHZhbHVzIGhhcyB0aGUgc2FtZSB0eXBlIGFzIHRoZSBwcm9wXG4gIC4uLmFuZCB3aGVuIHJldHJpZXZlZCBpdCB3aWxsIGJlIHRoZSB2YWx1ZSB0eXBlLCBhbmQgb3B0aW9uYWxseSB0aGUgYXN5bmMgaXRlcmF0b3I6XG4gICAgRGl2KHRoaXMucHJvcCkgOyAvLyB0aGUgdmFsdWVcbiAgICB0aGlzLnByb3AubWFwISguLi4uKSAgLy8gdGhlIGl0ZXJhdG9yIChub3RlIHRoZSB0cmFpbGluZyAnIScgdG8gYXNzZXJ0IG5vbi1udWxsIHZhbHVlKVxuXG4gIFRoaXMgcmVsaWVzIG9uIGEgaGFjayB0byBgd3JhcEFzeW5jSGVscGVyYCBpbiBpdGVyYXRvcnMudHMgd2hpY2ggKmFjY2VwdHMqIGEgUGFydGlhbDxBc3luY0l0ZXJhdG9yPlxuICBidXQgY2FzdHMgaXQgdG8gYSBBc3luY0l0ZXJhdG9yIGJlZm9yZSB1c2UuXG5cbiAgVGhlIGl0ZXJhYmlsaXR5IG9mIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGlzIGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIGFuZCB2YWx1ZSBvZiB0aGUgYEl0ZXJhYmlsaXR5YCBzeW1ib2wuXG4gIEJ5IGRlZmF1bHQsIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIGRvZXMgYSBkZWVwIG1hcHBpbmcsIHNvIGFuIGl0ZXJhYmxlIHByb3BlcnR5ICdvYmonIGlzIGl0c2VsZlxuICBpdGVyYWJsZSwgYXMgYXJlIGl0J3MgbWVtYmVycy4gVGhlIG9ubHkgZGVmaW5lZCB2YWx1ZSBhdCBwcmVzZW50IGlzIFwic2hhbGxvd1wiLCBpbiB3aGljaCBjYXNlICdvYmonIHJlbWFpbnNcbiAgaXRlcmFibGUsIGJ1dCBpdCdzIG1lbWJldHJzIGFyZSBqdXN0IFBPSlMgdmFsdWVzLlxuKi9cblxuLy8gQmFzZSB0eXBlcyB0aGF0IGNhbiBiZSBtYWRlIGRlZmluZWQgYXMgaXRlcmFibGU6IGJhc2ljYWxseSBhbnl0aGluZ1xuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSA9IChzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCB8IG9iamVjdCB8IEZ1bmN0aW9uIHwgc3ltYm9sKVxuLy8gV2Ugc2hvdWxkIGV4Y2x1ZGUgQXN5bmNJdGVyYWJsZSBmcm9tIHRoZSB0eXBlcyB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBpdGVyYWJsZXMgKGFuZCB0aGVyZWZvcmUgcGFzc2VkIHRvIGRlZmluZUl0ZXJhYmxlUHJvcGVydHkpXG5leHBvcnQgdHlwZSBJdGVyYWJsZVByb3BlcnR5VmFsdWUgPSBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIC8vIEV4Y2x1ZGU8SXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSwgQXN5bmNJdGVyYXRvcjxhbnk+IHwgQXN5bmNJdGVyYWJsZTxhbnk+PlxuXG5leHBvcnQgY29uc3QgSXRlcmFiaWxpdHkgPSBTeW1ib2woXCJJdGVyYWJpbGl0eVwiKTtcbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFiaWxpdHk8RGVwdGggZXh0ZW5kcyAnc2hhbGxvdycgPSAnc2hhbGxvdyc+IHsgW0l0ZXJhYmlsaXR5XTogRGVwdGggfVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIFRoaXMgaXMgcGF0Y2ggdG8gdGhlIHN0ZCBsaWIgZGVmaW5pdGlvbiBvZiBBcnJheTxUPi4gSSBkb24ndCBrbm93IHdoeSBpdCdzIGFic2VudCxcbiAgLy8gYXMgdGhpcyBpcyB0aGUgaW1wbGVtZW50YXRpb24gaW4gYWxsIEphdmFTY3JpcHQgZW5naW5lcy4gSXQgaXMgcHJvYmFibHkgYSByZXN1bHRcbiAgLy8gb2YgaXRzIGFic2VuY2UgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvdmFsdWVzLFxuICAvLyB3aGljaCBpbmhlcml0cyBmcm9tIHRoZSBPYmplY3QucHJvdG90eXBlLCB3aGljaCBtYWtlcyBubyBjbGFpbSBmb3IgdGhlIHJldHVybiB0eXBlXG4gIC8vIHNpbmNlIGl0IGNvdWxkIGJlIG92ZXJyaWRkZW0uIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSwgYSBUUyBkZWZuIHNob3VsZCBhbHNvIG92ZXJyaWRlIGl0XG4gIC8vIGxpa2UgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gZXRjIGRvLlxuICBpbnRlcmZhY2UgQXJyYXk8VD4ge1xuICAgIHZhbHVlT2YoKTogQXJyYXk8VD47XG4gIH1cbiAgLy8gQXMgYWJvdmUsIHRoZSByZXR1cm4gdHlwZSBjb3VsZCBiZSBUIHJhdGhlciB0aGFuIE9iamVjdCwgc2luY2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBpbXBsLFxuICAvLyBidXQgaXQncyBub3QsIGZvciBzb21lIHJlYXNvbi5cbiAgaW50ZXJmYWNlIE9iamVjdCB7XG4gICAgdmFsdWVPZjxUPih0aGlzOiBUKTogSXNJdGVyYWJsZVByb3BlcnR5PFQsIE9iamVjdD5cbiAgfVxufVxuXG4vKlxuICAgICAgQmVjYXVzZSBUUyBkb2Vzbid0IGltcGxlbWVudCBzZXBhcmF0ZSB0eXBlcyBmb3IgcmVhZC93cml0ZSwgb3IgY29tcHV0ZWQgZ2V0dGVyL3NldHRlciBuYW1lcyAod2hpY2ggRE8gYWxsb3dcbiAgICAgIGRpZmZlcmVudCB0eXBlcyBmb3IgYXNzaWdubWVudCBhbmQgZXZhbHVhdGlvbiksIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBkZWZpbmUgdHlwZSBmb3IgYXJyYXkgbWVtYmVycyB0aGF0IHBlcm1pdFxuICAgICAgZGVyZWZlcmVuY2luZyBvZiBub24tY2xhc2hpbmggYXJyYXkga2V5cyBzdWNoIGFzIGBqb2luYCBvciBgc29ydGAgYW5kIEFzeW5jSXRlcmF0b3IgbWV0aG9kcyB3aGljaCBhbHNvIGFsbG93c1xuICAgICAgc2ltcGxlIGFzc2lnbm1lbnQgb2YgdGhlIGZvcm0gYHRoaXMuaXRlcmFibGVBcnJheU1lbWJlciA9IFsuLi5dYC5cblxuICAgICAgVGhlIENPUlJFQ1QgdHlwZSBmb3IgdGhlc2UgZmllbGRzIHdvdWxkIGJlIChpZiBUUyBoYWQgc3ludGF4IGZvciBpdCk6XG4gICAgICBnZXQgW0tdICgpOiBPbWl0PEFycmF5PEUgJiBBc3luY0V4dHJhSXRlcmFibGU8RT4sIE5vbkFjY2Vzc2libGVJdGVyYWJsZUFycmF5S2V5cz4gJiBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuICAgICAgc2V0IFtLXSAoKTogQXJyYXk8RT4gfCBBc3luY0V4dHJhSXRlcmFibGU8RVtdPlxuKi9cbnR5cGUgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzID0ga2V5b2YgQXJyYXk8YW55PiAmIGtleW9mIEFzeW5jSXRlcmFibGVIZWxwZXJzXG5cbmV4cG9ydCB0eXBlIEl0ZXJhYmxlVHlwZTxUPiA9IFtUXSBleHRlbmRzIFtpbmZlciBVXSA/IFUgJiBQYXJ0aWFsPEFzeW5jRXh0cmFJdGVyYWJsZTxVPj4gOiBuZXZlcjtcblxuZXhwb3J0IHR5cGUgSXRlcmFibGVQcm9wZXJ0aWVzPFQ+ID0gW1RdIGV4dGVuZHMgW2luZmVyIElQXSA/XG4gIFtJUF0gZXh0ZW5kcyBbUGFydGlhbDxBc3luY0V4dHJhSXRlcmFibGU8dW5rbm93bj4+XSB8IFtJdGVyYWJpbGl0eTwnc2hhbGxvdyc+XSA/IElQXG4gIDogW0lQXSBleHRlbmRzIFtvYmplY3RdID9cbiAgICBJUCBleHRlbmRzIEFycmF5PGluZmVyIEU+ID8gT21pdDxJdGVyYWJsZVByb3BlcnRpZXM8RT5bXSwgTm9uQWNjZXNzaWJsZUl0ZXJhYmxlQXJyYXlLZXlzPiAmIFBhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPEVbXT4+XG4gIDogeyBbSyBpbiBrZXlvZiBJUF06IEl0ZXJhYmxlUHJvcGVydGllczxJUFtLXT4gJiBJdGVyYWJsZVR5cGU8SVBbS10+IH1cbiAgOiBJdGVyYWJsZVR5cGU8SVA+XG4gIDogbmV2ZXI7XG5cbmV4cG9ydCB0eXBlIElzSXRlcmFibGVQcm9wZXJ0eTxRLCBSID0gbmV2ZXI+ID0gW1FdIGV4dGVuZHMgW1BhcnRpYWw8QXN5bmNFeHRyYUl0ZXJhYmxlPGluZmVyIFY+Pl0gPyBWIDogUlxuXG4vKiBUaGluZ3MgdG8gc3VwcGxpZW1lbnQgdGhlIEpTIGJhc2UgQXN5bmNJdGVyYWJsZSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPiBleHRlbmRzIEFzeW5jSXRlcmFibGVJdGVyYXRvcjxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMge1xuICBwdXNoKHZhbHVlOiBUKTogYm9vbGVhbjtcbiAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxUPiwgQXN5bmNJdGVyYWJsZUhlbHBlcnMgeyB9XG5cbi8vIE5COiBUaGlzIGFsc28gKGluY29ycmVjdGx5KSBwYXNzZXMgc3luYyBpdGVyYXRvcnMsIGFzIHRoZSBwcm90b2NvbCBuYW1lcyBhcmUgdGhlIHNhbWVcbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW5jSXRlcmF0b3I8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmF0b3I8VD4pOiBvIGlzIEFzeW5jSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKG8pICYmICduZXh0JyBpbiBvICYmIHR5cGVvZiBvPy5uZXh0ID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlPFQgPSB1bmtub3duPihvOiBhbnkgfCBBc3luY0l0ZXJhYmxlPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZShvKSAmJiAoU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gbykgJiYgdHlwZW9mIG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nXG59XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXI8VCA9IHVua25vd24+KG86IGFueSB8IEFzeW5jSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhdG9yPFQ+KTogbyBpcyBBc3luY0l0ZXJhYmxlPFQ+IHwgQXN5bmNJdGVyYXRvcjxUPiB7XG4gIHJldHVybiBpc0FzeW5jSXRlcmFibGUobykgfHwgaXNBc3luY0l0ZXJhdG9yKG8pXG59XG5cbmV4cG9ydCB0eXBlIEFzeW5jUHJvdmlkZXI8VD4gPSBBc3luY0l0ZXJhdG9yPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPlxuXG5leHBvcnQgZnVuY3Rpb24gYXN5bmNJdGVyYXRvcjxUPihvOiBBc3luY1Byb3ZpZGVyPFQ+KSB7XG4gIGlmIChpc0FzeW5jSXRlcmF0b3IobykpIHJldHVybiBvO1xuICBpZiAoaXNBc3luY0l0ZXJhYmxlKG8pKSByZXR1cm4gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFuIGFzeW5jIHByb3ZpZGVyXCIpO1xufVxuXG50eXBlIEFzeW5jSXRlcmFibGVIZWxwZXJzID0gdHlwZW9mIGFzeW5jRXh0cmFzO1xuZXhwb3J0IGNvbnN0IGFzeW5jRXh0cmFzID0ge1xuICBmaWx0ZXJNYXA8VSBleHRlbmRzIFBhcnRpYWxJdGVyYWJsZSwgUj4odGhpczogVSxcbiAgICBmbjogTWFwcGVyPEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIFI+LFxuICAgIGluaXRpYWxWYWx1ZTogTm9JbmZlcjxSPiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmVcbiAgKSB7XG4gICAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlKVxuICB9LFxuICBtYXAsXG4gIGZpbHRlcixcbiAgdW5pcXVlLFxuICB3YWl0Rm9yLFxuICBtdWx0aSxcbiAgaW5pdGlhbGx5LFxuICBjb25zdW1lLFxuICBtZXJnZTxULCBBIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGFueT4+W10+KHRoaXM6IFBhcnRpYWxJdGVyYWJsZTxUPiwgLi4ubTogQSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCAuLi5tKTtcbiAgfSxcbiAgY29tYmluZTxUIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPFQ+PiwgUyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGUsIE8gZXh0ZW5kcyBDb21iaW5lT3B0aW9uczxTICYgeyBfdGhpczogVCB9Pj4odGhpczogUGFydGlhbEl0ZXJhYmxlPFQ+LCBvdGhlcnM6IFMsIG9wdHM6IE8gPSB7fSBhcyBPKSB7XG4gICAgY29uc3Qgc291cmNlcyA9IE9iamVjdC5hc3NpZ24oeyAnX3RoaXMnOiB0aGlzIH0sIG90aGVycyk7XG4gICAgcmV0dXJuIGNvbWJpbmUoc291cmNlcywgb3B0cyk7XG4gIH1cbn07XG5cbmNvbnN0IGV4dHJhS2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGFzeW5jRXh0cmFzKSwgLi4uT2JqZWN0LmtleXMoYXN5bmNFeHRyYXMpXSBhcyAoa2V5b2YgdHlwZW9mIGFzeW5jRXh0cmFzKVtdO1xuXG4vLyBMaWtlIE9iamVjdC5hc3NpZ24sIGJ1dCB0aGUgYXNzaWduZWQgcHJvcGVydGllcyBhcmUgbm90IGVudW1lcmFibGVcbmNvbnN0IGl0ZXJhdG9yQ2FsbFNpdGUgPSBTeW1ib2woXCJJdGVyYXRvckNhbGxTaXRlXCIpO1xuZnVuY3Rpb24gYXNzaWduSGlkZGVuPEQgZXh0ZW5kcyBvYmplY3QsIFMgZXh0ZW5kcyBvYmplY3Q+KGQ6IEQsIHM6IFMpIHtcbiAgY29uc3Qga2V5cyA9IFsuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzKSwgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKV07XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGssIHsgLi4uT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzLCBrKSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgaWYgKERFQlVHKSB7XG4gICAgaWYgKCEoaXRlcmF0b3JDYWxsU2l0ZSBpbiBkKSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KGQsIGl0ZXJhdG9yQ2FsbFNpdGUsIHsgdmFsdWU6IG5ldyBFcnJvcigpLnN0YWNrIH0pXG4gIH1cbiAgcmV0dXJuIGQgYXMgRCAmIFM7XG59XG5cbmNvbnN0IF9wZW5kaW5nID0gU3ltYm9sKCdwZW5kaW5nJyk7XG5jb25zdCBfaXRlbXMgPSBTeW1ib2woJ2l0ZW1zJyk7XG5mdW5jdGlvbiBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3AgPSAoKSA9PiB7IH0pIHtcbiAgY29uc3QgcSA9IHtcbiAgICBbX3BlbmRpbmddOiBbXSBhcyBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VD4+W10gfCBudWxsLFxuICAgIFtfaXRlbXNdOiBbXSBhcyBJdGVyYXRvclJlc3VsdDxUPltdIHwgbnVsbCxcblxuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gcSBhcyBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VD47XG4gICAgfSxcblxuICAgIG5leHQoKSB7XG4gICAgICBpZiAocVtfaXRlbXNdPy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShxW19pdGVtc10uc2hpZnQoKSEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSBhcyBjb25zdCwgdmFsdWU6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBkZWZlcnJlZDxJdGVyYXRvclJlc3VsdDxUPj4oKTtcbiAgICAgIC8vIFdlIGluc3RhbGwgYSBjYXRjaCBoYW5kbGVyIGFzIHRoZSBwcm9taXNlIG1pZ2h0IGxlZ2l0aW1hdGVseSByZWplY3QgYmVmb3JlIGFueXRoaW5nIHdhaXRzIGZvciBpdCxcbiAgICAgIC8vIGFuZCB0aGlzIHN1cHByZXNzZXMgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nLlxuICAgICAgdmFsdWUuY2F0Y2goZXggPT4geyB9KTtcbiAgICAgIHFbX3BlbmRpbmddLnVuc2hpZnQodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICByZXR1cm4odj86IHVua25vd24pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0geyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogdW5kZWZpbmVkIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIHFbX2l0ZW1zXSA9IHFbX3BlbmRpbmddID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB0aHJvdyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiBhcmdzWzBdIH07XG4gICAgICBpZiAocVtfcGVuZGluZ10pIHtcbiAgICAgICAgdHJ5IHsgc3RvcCgpIH0gY2F0Y2ggKGV4KSB7IH1cbiAgICAgICAgd2hpbGUgKHFbX3BlbmRpbmddLmxlbmd0aClcbiAgICAgICAgICBxW19wZW5kaW5nXS5wb3AoKSEucmVqZWN0KHZhbHVlLnZhbHVlKTtcbiAgICAgICAgcVtfaXRlbXNdID0gcVtfcGVuZGluZ10gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICBpZiAoIXFbX2l0ZW1zXSkgcmV0dXJuIC0xOyAvLyBUaGUgcXVldWUgaGFzIG5vIGNvbnN1bWVycyBhbmQgaGFzIHRlcm1pbmF0ZWQuXG4gICAgICByZXR1cm4gcVtfaXRlbXNdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgcHVzaCh2YWx1ZTogVCkge1xuICAgICAgaWYgKCFxW19wZW5kaW5nXSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAocVtfcGVuZGluZ10ubGVuZ3RoKSB7XG4gICAgICAgIHFbX3BlbmRpbmddLnBvcCgpIS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFxW19pdGVtc10pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGlzY2FyZGluZyBxdWV1ZSBwdXNoIGFzIHRoZXJlIGFyZSBubyBjb25zdW1lcnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxW19pdGVtc10ucHVzaCh7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMocSk7XG59XG5cbmNvbnN0IF9pbmZsaWdodCA9IFN5bWJvbCgnaW5mbGlnaHQnKTtcbmZ1bmN0aW9uIGludGVybmFsRGVib3VuY2VRdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxUPihzdG9wID0gKCkgPT4geyB9KSB7XG4gIGNvbnN0IHEgPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFQ+KHN0b3ApIGFzIFJldHVyblR5cGU8dHlwZW9mIGludGVybmFsUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4+ICYgeyBbX2luZmxpZ2h0XTogU2V0PFQ+IH07XG4gIHFbX2luZmxpZ2h0XSA9IG5ldyBTZXQ8VD4oKTtcblxuICBxLnB1c2ggPSBmdW5jdGlvbiAodmFsdWU6IFQpIHtcbiAgICBpZiAoIXFbX3BlbmRpbmddKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRGVib3VuY2VcbiAgICBpZiAocVtfaW5mbGlnaHRdLmhhcyh2YWx1ZSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGlmIChxW19wZW5kaW5nXS5sZW5ndGgpIHtcbiAgICAgIHFbX2luZmxpZ2h0XS5hZGQodmFsdWUpO1xuICAgICAgY29uc3QgcCA9IHFbX3BlbmRpbmddLnBvcCgpITtcbiAgICAgIHAuZmluYWxseSgoKSA9PiBxW19pbmZsaWdodF0uZGVsZXRlKHZhbHVlKSk7XG4gICAgICBwLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcVtfaXRlbXNdKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjYXJkaW5nIHF1ZXVlIHB1c2ggYXMgdGhlcmUgYXJlIG5vIGNvbnN1bWVycycpO1xuICAgICAgfSBlbHNlIGlmICghcVtfaXRlbXNdLmZpbmQodiA9PiB2LnZhbHVlID09PSB2YWx1ZSkpIHtcbiAgICAgICAgcVtfaXRlbXNdLnB1c2goeyBkb25lOiBmYWxzZSwgdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBxO1xufVxuXG4vLyBSZS1leHBvcnQgdG8gaGlkZSB0aGUgaW50ZXJuYWxzXG5leHBvcnQgY29uc3QgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbFF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yO1xuZXhwb3J0IGNvbnN0IGRlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I6IDxUPihzdG9wPzogKCkgPT4gdm9pZCkgPT4gUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8VD4gPSBpbnRlcm5hbERlYm91bmNlUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIE9iamVjdENvbnN0cnVjdG9yIHtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzPFQsIE0gZXh0ZW5kcyB7IFtLOiBzdHJpbmcgfCBzeW1ib2xdOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+IH0+KG86IFQsIHByb3BlcnRpZXM6IE0gJiBUaGlzVHlwZTxhbnk+KTogVCAmIHtcbiAgICAgIFtLIGluIGtleW9mIE1dOiBNW0tdIGV4dGVuZHMgVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICB9O1xuICB9XG59XG5cbi8qIERlZmluZSBhIFwiaXRlcmFibGUgcHJvcGVydHlcIiBvbiBgb2JqYC5cbiAgIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhvbGRzIGEgYm94ZWQgKHdpdGhpbiBhbiBPYmplY3QoKSBjYWxsKSB2YWx1ZSwgYW5kIGlzIGFsc28gYW4gQXN5bmNJdGVyYWJsZUl0ZXJhdG9yLiB3aGljaFxuICAgeWllbGRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIHNldC5cbiAgIFRoaXMgcm91dGluZSBjcmVhdGVzIHRoZSBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LCBhbmQgbWFuYWdlcyB0aGUgYWFzc29jaWF0ZWQgYXN5bmMgaXRlcmF0b3IuXG4qL1xuXG5jb25zdCBfcHJveGllZEFzeW5jSXRlcmF0b3IgPSBTeW1ib2woJ19wcm94aWVkQXN5bmNJdGVyYXRvcicpO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUl0ZXJhYmxlUHJvcGVydHk8VCBleHRlbmRzIG9iamVjdCwgY29uc3QgTiBleHRlbmRzIHN0cmluZyB8IHN5bWJvbCwgViBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZT4ob2JqOiBULCBuYW1lOiBOLCB2OiBWKTogVCAmIEl0ZXJhYmxlUHJvcGVydGllczx7IFtrIGluIE5dOiBWIH0+IHtcbiAgLy8gTWFrZSBgYWAgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlLiBXZSBkb24ndCBkbyB0aGlzIHVudGlsIGEgY29uc3VtZXIgYWN0dWFsbHkgdHJpZXMgdG9cbiAgLy8gYWNjZXNzIHRoZSBpdGVyYXRvciBtZXRob2RzIHRvIHByZXZlbnQgbGVha3Mgd2hlcmUgYW4gaXRlcmFibGUgaXMgY3JlYXRlZCwgYnV0XG4gIC8vIG5ldmVyIHJlZmVyZW5jZWQsIGFuZCB0aGVyZWZvcmUgY2Fubm90IGJlIGNvbnN1bWVkIGFuZCB1bHRpbWF0ZWx5IGNsb3NlZFxuICBsZXQgaW5pdEl0ZXJhdG9yID0gKCkgPT4ge1xuICAgIGluaXRJdGVyYXRvciA9ICgpID0+IGI7XG4gICAgY29uc3QgYmkgPSBkZWJvdW5jZVF1ZXVlSXRlcmF0YWJsZUl0ZXJhdG9yPFY+KCk7XG4gICAgY29uc3QgbWkgPSBiaS5tdWx0aSgpO1xuICAgIGNvbnN0IGIgPSBtaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcbiAgICBleHRyYXNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gbWlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xuICAgIHB1c2ggPSBiaS5wdXNoO1xuICAgIGV4dHJhS2V5cy5mb3JFYWNoKGsgPT4gLy8gQHRzLWlnbm9yZVxuICAgICAgZXh0cmFzW2tdID0gYltrIGFzIGtleW9mIHR5cGVvZiBiXSk7XG4gICAgaWYgKCEoX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIGEpKVxuICAgICAgYXNzaWduSGlkZGVuKGEsIGV4dHJhcyk7XG4gICAgcmV0dXJuIGI7XG4gIH1cblxuICAvLyBDcmVhdGUgc3R1YnMgdGhhdCBsYXppbHkgY3JlYXRlIHRoZSBBc3luY0V4dHJhSXRlcmFibGUgaW50ZXJmYWNlIHdoZW4gaW52b2tlZFxuICBmdW5jdGlvbiBsYXp5QXN5bmNNZXRob2Q8TSBleHRlbmRzIGtleW9mIHR5cGVvZiBhc3luY0V4dHJhcz4obWV0aG9kOiBNKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFttZXRob2RdOiBmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgaW5pdEl0ZXJhdG9yKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBGaXhcbiAgICAgICAgcmV0dXJuIGFbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gYXMgKHR5cGVvZiBhc3luY0V4dHJhcylbTV1cbiAgICB9W21ldGhvZF07XG4gIH1cblxuICBjb25zdCBleHRyYXMgPSB7IFtTeW1ib2wuYXN5bmNJdGVyYXRvcl06IGluaXRJdGVyYXRvciB9IGFzIEFzeW5jRXh0cmFJdGVyYWJsZTxWPiAmIHsgW0l0ZXJhYmlsaXR5XT86ICdzaGFsbG93JyB9O1xuICBleHRyYUtleXMuZm9yRWFjaCgoaykgPT4gLy8gQHRzLWlnbm9yZVxuICAgIGV4dHJhc1trXSA9IGxhenlBc3luY01ldGhvZChrKSlcbiAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmIEl0ZXJhYmlsaXR5IGluIHYgJiYgdltJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93Jykge1xuICAgIGV4dHJhc1tJdGVyYWJpbGl0eV0gPSB2W0l0ZXJhYmlsaXR5XTtcbiAgfVxuXG4gIC8vIExhemlseSBpbml0aWFsaXplIGBwdXNoYFxuICBsZXQgcHVzaDogUXVldWVJdGVyYXRhYmxlSXRlcmF0b3I8Vj5bJ3B1c2gnXSA9ICh2OiBWKSA9PiB7XG4gICAgaW5pdEl0ZXJhdG9yKCk7IC8vIFVwZGF0ZXMgYHB1c2hgIHRvIHJlZmVyZW5jZSB0aGUgbXVsdGktcXVldWVcbiAgICByZXR1cm4gcHVzaCh2KTtcbiAgfVxuXG4gIGxldCBhID0gYm94KHYsIGV4dHJhcyk7XG4gIGxldCBwaXBlZDogQXN5bmNJdGVyYWJsZTxWPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgZ2V0KCk6IFYgeyByZXR1cm4gYSB9LFxuICAgIHNldCh2OiBWIHwgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+KSB7XG4gICAgICBpZiAodiAhPT0gYSkge1xuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgLy8gQXNzaWduaW5nIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyB0byBhIHNpbmdsZSBpdGVyYWJsZSBpcyBwcm9iYWJseSBhXG4gICAgICAgICAgLy8gYmFkIGlkZWEgZnJvbSBhIHJlYXNvbmluZyBwb2ludCBvZiB2aWV3LCBhbmQgbXVsdGlwbGUgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlOlxuICAgICAgICAgIC8vICAqIG1lcmdlP1xuICAgICAgICAgIC8vICAqIGlnbm9yZSBzdWJzZXF1ZW50IGFzc2lnbm1lbnRzP1xuICAgICAgICAgIC8vICAqIHRlcm1pbmF0ZSB0aGUgZmlyc3QgdGhlbiBjb25zdW1lIHRoZSBzZWNvbmQ/XG4gICAgICAgICAgLy8gVGhlIHNvbHV0aW9uIGhlcmUgKG9uZSBvZiBtYW55IHBvc3NpYmlsaXRpZXMpIGlzIHRoZSBsZXR0ZXI6IG9ubHkgdG8gYWxsb3dcbiAgICAgICAgICAvLyBtb3N0IHJlY2VudCBhc3NpZ25tZW50IHRvIHdvcmssIHRlcm1pbmF0aW5nIGFueSBwcmVjZWVkaW5nIGl0ZXJhdG9yIHdoZW4gaXQgbmV4dFxuICAgICAgICAgIC8vIHlpZWxkcyBhbmQgZmluZHMgdGhpcyBjb25zdW1lciBoYXMgYmVlbiByZS1hc3NpZ25lZC5cblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVyYXRvciBoYXMgYmVlbiByZWFzc2lnbmVkIHdpdGggbm8gY2hhbmdlLCBqdXN0IGlnbm9yZSBpdCwgYXMgd2UncmUgYWxyZWFkeSBjb25zdW1pbmcgaXRcbiAgICAgICAgICBpZiAocGlwZWQgPT09IHYpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICBwaXBlZCA9IHYgYXMgQXN5bmNJdGVyYWJsZTxWPjtcbiAgICAgICAgICBsZXQgc3RhY2sgPSBERUJVRyA/IG5ldyBFcnJvcigpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChERUJVRylcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhuZXcgRXJyb3IoYEl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gY29uc3VtZSBhbm90aGVyIGl0ZXJhdG9yLiBEaWQgeW91IG1lYW4gdG8gZGVjbGFyZSBpdD9gKSk7XG4gICAgICAgICAgY29uc3VtZS5jYWxsKHYgYXMgQXN5bmNJdGVyYWJsZTxWPiwgeSA9PiB7XG4gICAgICAgICAgICBpZiAodiAhPT0gcGlwZWQpIHtcbiAgICAgICAgICAgICAgLy8gV2UncmUgYmVpbmcgcGlwZWQgZnJvbSBzb21ldGhpbmcgZWxzZS4gV2Ugd2FudCB0byBzdG9wIHRoYXQgb25lIGFuZCBnZXQgcGlwZWQgZnJvbSB0aGlzIG9uZVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpcGVkIGl0ZXJhYmxlIFwiJHtuYW1lLnRvU3RyaW5nKCl9XCIgaGFzIGJlZW4gcmVwbGFjZWQgYnkgYW5vdGhlciBpdGVyYXRvcmAsIHsgY2F1c2U6IHN0YWNrIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHVzaCh5Py52YWx1ZU9mKCkgYXMgVilcbiAgICAgICAgICB9KS5jYXRjaChleCA9PiBjb25zb2xlLmluZm8oZXgpKVxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4gKHYgPT09IHBpcGVkKSAmJiAocGlwZWQgPSB1bmRlZmluZWQpKTtcblxuICAgICAgICAgIC8vIEVhcmx5IHJldHVybiBhcyB3ZSdyZSBnb2luZyB0byBwaXBlIHZhbHVlcyBpbiBsYXRlclxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGlwZWQgJiYgREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYWJsZSBcIiR7bmFtZS50b1N0cmluZygpfVwiIGlzIGFscmVhZHkgcGlwZWQgZnJvbSBhbm90aGVyIGl0ZXJhdG9yLCBhbmQgbWlnaHQgYmUgb3ZlcnJ3aXR0ZW4gbGF0ZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYSA9IGJveCh2LCBleHRyYXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdXNoKHY/LnZhbHVlT2YoKSBhcyBWKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBvYmogYXMgYW55O1xuXG4gIGZ1bmN0aW9uIGJveDxWPihhOiBWLCBwZHM6IEFzeW5jRXh0cmFJdGVyYWJsZTxWPik6IFYgJiBBc3luY0V4dHJhSXRlcmFibGU8Vj4ge1xuICAgIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFzc2lnbkhpZGRlbihPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgdmFsdWVPZjogeyB2YWx1ZSgpIHsgcmV0dXJuIGEgfSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LFxuICAgICAgICB0b0pTT046IHsgdmFsdWUoKSB7IHJldHVybiBhIH0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfVxuICAgICAgfSksIHBkcyk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIGEpIHtcbiAgICAgIGNhc2UgJ2JpZ2ludCc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAvLyBCb3hlcyB0eXBlcywgaW5jbHVkaW5nIEJpZ0ludFxuICAgICAgICByZXR1cm4gYXNzaWduSGlkZGVuKE9iamVjdChhKSwgT2JqZWN0LmFzc2lnbihwZHMsIHtcbiAgICAgICAgICB0b0pTT04oKSB7IHJldHVybiBhLnZhbHVlT2YoKSB9XG4gICAgICAgIH0pKTtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIC8vIFdlIGJveCBvYmplY3RzIGJ5IGNyZWF0aW5nIGEgUHJveHkgZm9yIHRoZSBvYmplY3QgdGhhdCBwdXNoZXMgb24gZ2V0L3NldC9kZWxldGUsIGFuZCBtYXBzIHRoZSBzdXBwbGllZCBhc3luYyBpdGVyYXRvciB0byBwdXNoIHRoZSBzcGVjaWZpZWQga2V5XG4gICAgICAgIC8vIFRoZSBwcm94aWVzIGFyZSByZWN1cnNpdmUsIHNvIHRoYXQgaWYgYW4gb2JqZWN0IGNvbnRhaW5zIG9iamVjdHMsIHRoZXkgdG9vIGFyZSBwcm94aWVkLiBPYmplY3RzIGNvbnRhaW5pbmcgcHJpbWl0aXZlcyByZW1haW4gcHJveGllZCB0b1xuICAgICAgICAvLyBoYW5kbGUgdGhlIGdldC9zZXQvc2VsZXRlIGluIHBsYWNlIG9mIHRoZSB1c3VhbCBwcmltaXRpdmUgYm94aW5nIHZpYSBPYmplY3QocHJpbWl0aXZlVmFsdWUpXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJveE9iamVjdChhLCBwZHMpO1xuXG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0l0ZXJhYmxlIHByb3BlcnRpZXMgY2Fubm90IGJlIG9mIHR5cGUgXCInICsgdHlwZW9mIGEgKyAnXCInKTtcbiAgfVxuXG4gIHR5cGUgV2l0aFBhdGggPSB7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGE6IFYsIHBhdGg6IHN0cmluZyB8IG51bGwgfSB9O1xuICB0eXBlIFBvc3NpYmx5V2l0aFBhdGggPSBWIHwgV2l0aFBhdGg7XG4gIGZ1bmN0aW9uIGlzUHJveGllZEFzeW5jSXRlcmF0b3IobzogUG9zc2libHlXaXRoUGF0aCk6IG8gaXMgV2l0aFBhdGgge1xuICAgIHJldHVybiBpc09iamVjdExpa2UobykgJiYgX3Byb3hpZWRBc3luY0l0ZXJhdG9yIGluIG87XG4gIH1cbiAgZnVuY3Rpb24gZGVzdHJ1Y3R1cmUobzogYW55LCBwYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmaWVsZHMgPSBwYXRoLnNwbGl0KCcuJykuc2xpY2UoMSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoICYmICgobyA9IG8/LltmaWVsZHNbaV1dKSAhPT0gdW5kZWZpbmVkKTsgaSsrKTtcbiAgICByZXR1cm4gbztcbiAgfVxuICBmdW5jdGlvbiBib3hPYmplY3QoYTogViwgcGRzOiBBc3luY0V4dHJhSXRlcmFibGU8UG9zc2libHlXaXRoUGF0aD4pIHtcbiAgICBsZXQgd2l0aFBhdGg6IEFzeW5jRXh0cmFJdGVyYWJsZTxXaXRoUGF0aFt0eXBlb2YgX3Byb3hpZWRBc3luY0l0ZXJhdG9yXT47XG4gICAgbGV0IHdpdGhvdXRQYXRoOiBBc3luY0V4dHJhSXRlcmFibGU8Vj47XG4gICAgcmV0dXJuIG5ldyBQcm94eShhIGFzIG9iamVjdCwgaGFuZGxlcigpKSBhcyBWICYgQXN5bmNFeHRyYUl0ZXJhYmxlPFY+O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihwYXRoID0gJycpOiBQcm94eUhhbmRsZXI8b2JqZWN0PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBBIGJveGVkIG9iamVjdCBoYXMgaXRzIG93biBrZXlzLCBhbmQgdGhlIGtleXMgb2YgYW4gQXN5bmNFeHRyYUl0ZXJhYmxlXG4gICAgICAgIGhhcyh0YXJnZXQsIGtleSkge1xuICAgICAgICAgIHJldHVybiBrZXkgPT09IF9wcm94aWVkQXN5bmNJdGVyYXRvciB8fCBrZXkgPT09IFN5bWJvbC50b1ByaW1pdGl2ZSB8fCBrZXkgaW4gdGFyZ2V0IHx8IGtleSBpbiBwZHM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFdoZW4gYSBrZXkgaXMgc2V0IGluIHRoZSB0YXJnZXQsIHB1c2ggdGhlIGNoYW5nZVxuICAgICAgICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0ICR7bmFtZS50b1N0cmluZygpfSR7cGF0aH0uJHtrZXkudG9TdHJpbmcoKX0gYXMgaXQgaXMgcGFydCBvZiBhc3luY0l0ZXJhdG9yYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcHVzaCh7IFtfcHJveGllZEFzeW5jSXRlcmF0b3JdOiB7IGEsIHBhdGggfSB9IGFzIGFueSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICBpZiAoUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgICAgIHB1c2goeyBbX3Byb3hpZWRBc3luY0l0ZXJhdG9yXTogeyBhLCBwYXRoIH0gfSBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gV2hlbiBnZXR0aW5nIHRoZSB2YWx1ZSBvZiBhIGJveGVkIG9iamVjdCBtZW1iZXIsIHByZWZlciBhc3luY0V4dHJhSXRlcmFibGUgb3ZlciB0YXJnZXQga2V5c1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhbiBhc3luY0V4dHJhSXRlcmFibGUgbWVtYmVyLCBjcmVhdGUgdGhlIG1hcHBlZCBxdWV1ZSB0byBnZW5lcmF0ZSBpdFxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duKHBkcywga2V5KSkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICB3aXRob3V0UGF0aCA/Pz0gZmlsdGVyTWFwKHBkcywgbyA9PiBpc1Byb3hpZWRBc3luY0l0ZXJhdG9yKG8pID8gb1tfcHJveGllZEFzeW5jSXRlcmF0b3JdLmEgOiBvKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHdpdGhvdXRQYXRoW2tleSBhcyBrZXlvZiB0eXBlb2YgcGRzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdpdGhQYXRoID8/PSBmaWx0ZXJNYXAocGRzLCBvID0+IGlzUHJveGllZEFzeW5jSXRlcmF0b3IobykgPyBvW19wcm94aWVkQXN5bmNJdGVyYXRvcl0gOiB7IGE6IG8sIHBhdGg6IG51bGwgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IGFpID0gZmlsdGVyTWFwKHdpdGhQYXRoLCAobywgcCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBkZXN0cnVjdHVyZShvLmEsIHBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwICE9PSB2IHx8IG8ucGF0aCA9PT0gbnVsbCB8fCBvLnBhdGguc3RhcnRzV2l0aChwYXRoKSA/IHYgOiBJZ25vcmU7XG4gICAgICAgICAgICAgIH0sIElnbm9yZSwgZGVzdHJ1Y3R1cmUoYSwgcGF0aCkpO1xuICAgICAgICAgICAgICByZXR1cm4gYWlba2V5IGFzIGtleW9mIHR5cGVvZiBhaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIGtleSBpcyBhIHRhcmdldCBwcm9wZXJ0eSwgY3JlYXRlIHRoZSBwcm94eSB0byBoYW5kbGUgaXRcbiAgICAgICAgICBpZiAoa2V5ID09PSAndmFsdWVPZicgfHwgKGtleSA9PT0gJ3RvSlNPTicgJiYgISgndG9KU09OJyBpbiB0YXJnZXQpKSlcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBkZXN0cnVjdHVyZShhLCBwYXRoKTtcbiAgICAgICAgICBpZiAoa2V5ID09PSBTeW1ib2wudG9QcmltaXRpdmUpIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSwgc2luY2UgU3ltYm9sLnRvUHJpbWl0aXZlIGlzIGluIGhhKCksIHdlIG5lZWQgdG8gaW1wbGVtZW50IGl0XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGhpbnQ/OiAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgIGlmIChSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCB0YXJnZXQpLmNhbGwodGFyZ2V0LCBoaW50KTtcbiAgICAgICAgICAgICAgaWYgKGhpbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gdGFyZ2V0LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIGlmIChoaW50ID09PSAnbnVtYmVyJykgcmV0dXJuIE51bWJlcih0YXJnZXQpO1xuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoKCEoa2V5IGluIHRhcmdldCkgfHwgT2JqZWN0Lmhhc093bih0YXJnZXQsIGtleSkpICYmICEoSXRlcmFiaWxpdHkgaW4gdGFyZ2V0ICYmIHRhcmdldFtJdGVyYWJpbGl0eV0gPT09ICdzaGFsbG93JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBmaWVsZCA9PT0gJ2Z1bmN0aW9uJykgfHwgaXNBc3luY0l0ZXIoZmllbGQpXG4gICAgICAgICAgICAgICAgPyBmaWVsZFxuICAgICAgICAgICAgICAgIDogbmV3IFByb3h5KE9iamVjdChmaWVsZCksIGhhbmRsZXIocGF0aCArICcuJyArIGtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaGlzIGlzIGEgc3ltYm9saWMgZW50cnksIG9yIGEgcHJvdG90eXBpY2FsIHZhbHVlIChzaW5jZSBpdCdzIGluIHRoZSB0YXJnZXQsIGJ1dCBub3QgYSB0YXJnZXQgcHJvcGVydHkpXG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLypcbiAgRXh0ZW5zaW9ucyB0byB0aGUgQXN5bmNJdGVyYWJsZTpcbiovXG4vL2NvbnN0IGZvcmV2ZXIgPSBuZXcgUHJvbWlzZTxhbnk+KCgpID0+IHsgfSk7XG5cbi8qIE1lcmdlIGFzeW5jSXRlcmFibGVzIGludG8gYSBzaW5nbGUgYXN5bmNJdGVyYWJsZSAqL1xuXG4vKiBUUyBoYWNrIHRvIGV4cG9zZSB0aGUgcmV0dXJuIEFzeW5jR2VuZXJhdG9yIGEgZ2VuZXJhdG9yIG9mIHRoZSB1bmlvbiBvZiB0aGUgbWVyZ2VkIHR5cGVzICovXG50eXBlIENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+ID0gVFtdIGV4dGVuZHMgUGFydGlhbDxBc3luY0l0ZXJhYmxlPGluZmVyIFU+PltdID8gVSA6IG5ldmVyO1xudHlwZSBDb2xsYXBzZUl0ZXJhYmxlVHlwZXM8VD4gPSBBc3luY0l0ZXJhYmxlPENvbGxhcHNlSXRlcmFibGVUeXBlPFQ+PjtcblxuZXhwb3J0IGNvbnN0IG1lcmdlID0gPEEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VFlpZWxkPiB8IEFzeW5jSXRlcmF0b3I8VFlpZWxkLCBUUmV0dXJuLCBUTmV4dD4+W10sIFRZaWVsZCwgVFJldHVybiwgVE5leHQ+KC4uLmFpOiBBKSA9PiB7XG4gIGNvbnN0IGl0ID0gbmV3IE1hcDxudW1iZXIsICh1bmRlZmluZWQgfCBBc3luY0l0ZXJhdG9yPGFueT4pPigpO1xuICBjb25zdCBwcm9taXNlcyA9IG5ldyBNYXA8bnVtYmVyLFByb21pc2U8eyBrZXk6IG51bWJlciwgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxhbnk+IH0+PigpO1xuXG4gIGxldCBpbml0ID0gKCkgPT4ge1xuICAgIGluaXQgPSAoKSA9PiB7IH1cbiAgICBmb3IgKGxldCBuID0gMDsgbiA8IGFpLmxlbmd0aDsgbisrKSB7XG4gICAgICBjb25zdCBhID0gYWlbbl0gYXMgQXN5bmNJdGVyYWJsZTxUWWllbGQ+IHwgQXN5bmNJdGVyYXRvcjxUWWllbGQsIFRSZXR1cm4sIFROZXh0PjtcbiAgICAgIGNvbnN0IGl0ZXIgPSBTeW1ib2wuYXN5bmNJdGVyYXRvciBpbiBhID8gYVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSA6IGEgYXMgQXN5bmNJdGVyYXRvcjxhbnk+O1xuICAgICAgaXQuc2V0KG4sIGl0ZXIpO1xuICAgICAgcHJvbWlzZXMuc2V0KG4sIGl0ZXIubmV4dCgpLnRoZW4ocmVzdWx0ID0+ICh7IGtleTogbiwgcmVzdWx0IH0pKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogKFRZaWVsZCB8IFRSZXR1cm4pW10gPSBuZXcgQXJyYXkoYWkubGVuZ3RoKTtcblxuICBjb25zdCBtZXJnZWQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxBW251bWJlcl0+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBtZXJnZWQgfSxcbiAgICBuZXh0KCkge1xuICAgICAgaW5pdCgpO1xuICAgICAgcmV0dXJuIHByb21pc2VzLnNpemVcbiAgICAgICAgPyBQcm9taXNlLnJhY2UocHJvbWlzZXMudmFsdWVzKCkpLnRoZW4oKHsga2V5LCByZXN1bHQgfSkgPT4ge1xuICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgcHJvbWlzZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBpdC5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQubmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlcy5zZXQoa2V5LFxuICAgICAgICAgICAgICBpdC5oYXMoa2V5KVxuICAgICAgICAgICAgICAgID8gaXQuZ2V0KGtleSkhLm5leHQoKS50aGVuKHJlc3VsdCA9PiAoeyBrZXksIHJlc3VsdCB9KSkuY2F0Y2goZXggPT4gKHsga2V5LCByZXN1bHQ6IHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0gfSkpXG4gICAgICAgICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBrZXksIHJlc3VsdDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXggPT4ge1xuICAgICAgICAgICAgLy8gYGV4YCBpcyB0aGUgdW5kZXJseWluZyBhc3luYyBpdGVyYXRpb24gZXhjZXB0aW9uXG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkLnRocm93IShleCkgLy8gPz8gUHJvbWlzZS5yZWplY3QoeyBkb25lOiB0cnVlIGFzIGNvbnN0LCB2YWx1ZTogbmV3IEVycm9yKFwiSXRlcmF0b3IgbWVyZ2UgZXhjZXB0aW9uXCIpIH0pO1xuICAgICAgICB9KVxuICAgICAgICA6IFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUgYXMgY29uc3QsIHZhbHVlOiByZXN1bHRzIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgcmV0dXJuKHIpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGl0LmtleXMoKSkge1xuICAgICAgICBpZiAocHJvbWlzZXMuaGFzKGtleSkpIHtcbiAgICAgICAgICBwcm9taXNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICByZXN1bHRzW2tleV0gPSBhd2FpdCBpdC5nZXQoa2V5KT8ucmV0dXJuPy4oeyBkb25lOiB0cnVlLCB2YWx1ZTogciB9KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogcmVzdWx0cyB9O1xuICAgIH0sXG4gICAgYXN5bmMgdGhyb3coZXg6IGFueSkge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgaXQua2V5cygpKSB7XG4gICAgICAgIGlmIChwcm9taXNlcy5oYXMoa2V5KSkge1xuICAgICAgICAgIHByb21pc2VzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGF3YWl0IGl0LmdldChrZXkpPy50aHJvdz8uKGV4KS50aGVuKHYgPT4gdi52YWx1ZSwgZXggPT4gZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCZWNhdXNlIHdlJ3ZlIHBhc3NlZCB0aGUgZXhjZXB0aW9uIG9uIHRvIGFsbCB0aGUgc291cmNlcywgd2UncmUgbm93IGRvbmVcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiByZXN1bHRzIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gaXRlcmFibGVIZWxwZXJzKG1lcmdlZCBhcyB1bmtub3duIGFzIENvbGxhcHNlSXRlcmFibGVUeXBlczxBW251bWJlcl0+KTtcbn1cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlID0geyBbazogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sXTogUGFydGlhbEl0ZXJhYmxlIH07XG50eXBlIENvbWJpbmVkSXRlcmFibGVUeXBlPFMgZXh0ZW5kcyBDb21iaW5lZEl0ZXJhYmxlPiA9IHtcbiAgW0sgaW4ga2V5b2YgU10/OiBTW0tdIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlPGluZmVyIFQ+ID8gVCA6IG5ldmVyXG59O1xudHlwZSBSZXF1aXJlZENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8UyBleHRlbmRzIENvbWJpbmVkSXRlcmFibGU+ID0gQXN5bmNFeHRyYUl0ZXJhYmxlPHtcbiAgW0sgaW4ga2V5b2YgU106IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xudHlwZSBQYXJ0aWFsQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4gPSBBc3luY0V4dHJhSXRlcmFibGU8e1xuICBbSyBpbiBrZXlvZiBTXT86IFNbS10gZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbn0+O1xuZXhwb3J0IGludGVyZmFjZSBDb21iaW5lT3B0aW9uczxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZT4ge1xuICBpZ25vcmVQYXJ0aWFsPzogYm9vbGVhbjsgLy8gU2V0IHRvIGF2b2lkIHlpZWxkaW5nIGlmIHNvbWUgc291cmNlcyBhcmUgYWJzZW50XG4gIGluaXRpYWxseT86IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+OyAvLyBvcHRpb25hbCBpbml0aWFsIHZhbHVlcyBmb3IgaW5kaXZpZHVhbCBmaWVsZHNcbn1cbnR5cGUgQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZSwgTyBleHRlbmRzIENvbWJpbmVPcHRpb25zPFM+PiA9IHRydWUgZXh0ZW5kcyBPWydpZ25vcmVQYXJ0aWFsJ10gPyBSZXF1aXJlZENvbWJpbmVkSXRlcmFibGVSZXN1bHQ8Uz4gOiBQYXJ0aWFsQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTPlxuXG5leHBvcnQgY29uc3QgY29tYmluZSA9IDxTIGV4dGVuZHMgQ29tYmluZWRJdGVyYWJsZSwgTyBleHRlbmRzIENvbWJpbmVPcHRpb25zPFM+PihzcmM6IFMsIG9wdHMgPSB7fSBhcyBPKTogQ29tYmluZWRJdGVyYWJsZVJlc3VsdDxTLE8+ID0+IHtcbiAgY29uc3QgYWNjdW11bGF0ZWQ6IENvbWJpbmVkSXRlcmFibGVUeXBlPFM+ID0gb3B0cy5pbml0aWFsbHkgPyBvcHRzLmluaXRpYWxseSA6IHt9O1xuICBjb25zdCBzaSA9IG5ldyBNYXA8c3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCBBc3luY0l0ZXJhdG9yPGFueT4+KCk7XG4gIGxldCBwYzogTWFwPHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgUHJvbWlzZTx7IGs6IHN0cmluZywgaXI6IEl0ZXJhdG9yUmVzdWx0PGFueT4gfT4+OyAvLyBJbml0aWFsaXplZCBsYXppbHlcbiAgY29uc3QgY2kgPSB7XG4gICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpIHsgcmV0dXJuIGNpIH0sXG4gICAgbmV4dCgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PENvbWJpbmVkSXRlcmFibGVUeXBlPFM+Pj4ge1xuICAgICAgaWYgKHBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGMgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHNyYykubWFwKChbaywgc2l0XSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHNpdFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgICAgc2kuc2V0KGssIHNvdXJjZSk7XG4gICAgICAgICAgcmV0dXJuIFtrLCBzb3VyY2UubmV4dCgpLnRoZW4oaXIgPT4gKHsgc2ksIGssIGlyIH0pKV07XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChmdW5jdGlvbiBzdGVwKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8Q29tYmluZWRJdGVyYWJsZVR5cGU8Uz4+PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UocGMudmFsdWVzKCkpLnRoZW4oKHsgaywgaXIgfSkgPT4ge1xuICAgICAgICAgIGlmIChpci5kb25lKSB7XG4gICAgICAgICAgICBwYy5kZWxldGUoayk7XG4gICAgICAgICAgICBzaS5kZWxldGUoayk7XG4gICAgICAgICAgICBpZiAoIXBjLnNpemUpXG4gICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjY3VtdWxhdGVkW2sgYXMga2V5b2YgdHlwZW9mIGFjY3VtdWxhdGVkXSA9IGlyLnZhbHVlO1xuICAgICAgICAgICAgcGMuc2V0KGssIHNpLmdldChrKSEubmV4dCgpLnRoZW4oaXIgPT4gKHsgaywgaXIgfSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdHMuaWdub3JlUGFydGlhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFjY3VtdWxhdGVkKS5sZW5ndGggPCBPYmplY3Qua2V5cyhzcmMpLmxlbmd0aClcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBhY2N1bXVsYXRlZCB9O1xuICAgICAgICB9KVxuICAgICAgfSkoKTtcbiAgICB9LFxuICAgIHJldHVybih2PzogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGFpIG9mIHNpLnZhbHVlcygpKSB7XG4gICAgICAgICAgYWkucmV0dXJuPy4odilcbiAgICAgIH07XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG4gICAgfSxcbiAgICB0aHJvdyhleDogYW55KSB7XG4gICAgICBmb3IgKGNvbnN0IGFpIG9mIHNpLnZhbHVlcygpKVxuICAgICAgICBhaS50aHJvdz8uKGV4KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhjaSk7XG59XG5cblxuZnVuY3Rpb24gaXNFeHRyYUl0ZXJhYmxlPFQ+KGk6IGFueSk6IGkgaXMgQXN5bmNFeHRyYUl0ZXJhYmxlPFQ+IHtcbiAgcmV0dXJuIGlzQXN5bmNJdGVyYWJsZShpKVxuICAgICYmIGV4dHJhS2V5cy5ldmVyeShrID0+IChrIGluIGkpICYmIChpIGFzIGFueSlba10gPT09IGFzeW5jRXh0cmFzW2tdKTtcbn1cblxuLy8gQXR0YWNoIHRoZSBwcmUtZGVmaW5lZCBoZWxwZXJzIG9udG8gYW4gQXN5bmNJdGVyYWJsZSBhbmQgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3QgY29ycmVjdGx5IHR5cGVkXG5leHBvcnQgZnVuY3Rpb24gaXRlcmFibGVIZWxwZXJzPEEgZXh0ZW5kcyBBc3luY0l0ZXJhYmxlPGFueT4+KGFpOiBBKTogQSAmIEFzeW5jRXh0cmFJdGVyYWJsZTxBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiB1bmtub3duPiB7XG4gIGlmICghaXNFeHRyYUl0ZXJhYmxlKGFpKSkge1xuICAgIGFzc2lnbkhpZGRlbihhaSwgYXN5bmNFeHRyYXMpO1xuICB9XG4gIHJldHVybiBhaSBhcyBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IEFzeW5jRXh0cmFJdGVyYWJsZTxUPiAmIEEgOiBuZXZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdG9ySGVscGVyczxHIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBSLCBSIGV4dGVuZHMgQXN5bmNHZW5lcmF0b3I+KGc6IEcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOiBQYXJhbWV0ZXJzPEc+KTogUmV0dXJuVHlwZTxHPiB7XG4gICAgY29uc3QgYWkgPSBnKC4uLmFyZ3MpO1xuICAgIHJldHVybiBpdGVyYWJsZUhlbHBlcnMoYWkpIGFzIFJldHVyblR5cGU8Rz47XG4gIH0gYXMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rz4pID0+IFJldHVyblR5cGU8Rz4gJiBBc3luY0V4dHJhSXRlcmFibGU8UmV0dXJuVHlwZTxHPiBleHRlbmRzIEFzeW5jR2VuZXJhdG9yPGluZmVyIFQ+ID8gVCA6IHVua25vd24+XG59XG5cbi8qIEFzeW5jSXRlcmFibGUgaGVscGVycywgd2hpY2ggY2FuIGJlIGF0dGFjaGVkIHRvIGFuIEFzeW5jSXRlcmF0b3Igd2l0aCBgd2l0aEhlbHBlcnMoYWkpYCwgYW5kIGludm9rZWQgZGlyZWN0bHkgZm9yIGZvcmVpZ24gYXN5bmNJdGVyYXRvcnMgKi9cblxuLyogdHlwZXMgdGhhdCBhY2NlcHQgUGFydGlhbHMgYXMgcG90ZW50aWFsbHUgYXN5bmMgaXRlcmF0b3JzLCBzaW5jZSB3ZSBwZXJtaXQgdGhpcyBJTiBUWVBJTkcgc29cbiAgaXRlcmFibGUgcHJvcGVydGllcyBkb24ndCBjb21wbGFpbiBvbiBldmVyeSBhY2Nlc3MgYXMgdGhleSBhcmUgZGVjbGFyZWQgYXMgViAmIFBhcnRpYWw8QXN5bmNJdGVyYWJsZTxWPj5cbiAgZHVlIHRvIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGhhdmluZyBkaWZmZXJlbnQgdHlwZXMsIGJ1dCB1bmRlY2xhcmFibGUgaW4gVFMgZHVlIHRvIHN5bnRheCBsaW1pdGF0aW9ucyAqL1xudHlwZSBIZWxwZXJBc3luY0l0ZXJhYmxlPFEgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+ID0gSGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxRPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPjtcbnR5cGUgSGVscGVyQXN5bmNJdGVyYXRvcjxGPiA9XG4gIEYgZXh0ZW5kcyAoKSA9PiBBc3luY0l0ZXJhdG9yPGluZmVyIFQ+XG4gID8gVCA6IG5ldmVyO1xuXG5hc3luYyBmdW5jdGlvbiBjb25zdW1lPFUgZXh0ZW5kcyBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8YW55Pj4+KHRoaXM6IFUsIGY/OiAodTogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBsYXN0OiB1bmRlZmluZWQgfCB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG4gIGZvciBhd2FpdCAoY29uc3QgdSBvZiB0aGlzIGFzIEFzeW5jSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4pIHtcbiAgICBsYXN0ID0gZj8uKHUpO1xuICB9XG4gIGF3YWl0IGxhc3Q7XG59XG5cbi8qIEEgZ2VuZXJhbCBmaWx0ZXIgJiBtYXBwZXIgdGhhdCBjYW4gaGFuZGxlIGV4Y2VwdGlvbnMgJiByZXR1cm5zICovXG5leHBvcnQgY29uc3QgSWdub3JlID0gU3ltYm9sKFwiSWdub3JlXCIpO1xuZXhwb3J0IHR5cGUgTWFwcGVyPFUsIFI+ID0gKG86IFUsIHByZXY6IE5vSW5mZXI8Uj4gfCB0eXBlb2YgSWdub3JlKSA9PiBQcm9taXNlTGlrZTxSIHwgdHlwZW9mIElnbm9yZT4gfCBSIHwgdHlwZW9mIElnbm9yZTtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiAqb25jZTxUPih2OlQpIHtcbiAgeWllbGQgdjtcbn1cblxudHlwZSBQYXJ0aWFsSXRlcmFibGU8VCA9IGFueT4gPSBQYXJ0aWFsPEFzeW5jSXRlcmFibGU8VD4+O1xuXG50eXBlIE1heWJlUHJvbWlzZWQ8VD4gPSBQcm9taXNlTGlrZTxUPiB8IFQ7XG5mdW5jdGlvbiByZXNvbHZlU3luYzxaLCBSPih2OiBNYXliZVByb21pc2VkPFo+LCB0aGVuOiAodjogWikgPT4gUiwgZXhjZXB0OiAoeDogYW55KSA9PiBhbnkpOiBNYXliZVByb21pc2VkPFI+IHtcbiAgaWYgKGlzUHJvbWlzZUxpa2UodikpXG4gICAgcmV0dXJuIHYudGhlbih0aGVuLCBleGNlcHQpO1xuICB0cnkge1xuICAgIHJldHVybiB0aGVuKHYpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0dXJuIGV4Y2VwdChleClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWFwPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIFI+KHNvdXJjZTogVSxcbiAgZm46IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPixcbiAgaW5pdGlhbFZhbHVlOiBOb0luZmVyPFI+IHwgUHJvbWlzZTxOb0luZmVyPFI+PiB8IHR5cGVvZiBJZ25vcmUgPSBJZ25vcmUsXG4gIHByZXY6IE5vSW5mZXI8Uj4gfCB0eXBlb2YgSWdub3JlID0gSWdub3JlXG4pOiBBc3luY0V4dHJhSXRlcmFibGU8Uj4ge1xuICBsZXQgYWk6IEFzeW5jSXRlcmF0b3I8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj47XG4gIGZ1bmN0aW9uIGRvbmUodjogSXRlcmF0b3JSZXN1bHQ8SGVscGVyQXN5bmNJdGVyYXRvcjxSZXF1aXJlZDxVPlt0eXBlb2YgU3ltYm9sLmFzeW5jSXRlcmF0b3JdPiwgYW55PiB8IHVuZGVmaW5lZCl7XG4gICAgLy8gQHRzLWlnbm9yZSAtIHJlbW92ZSByZWZlcmVuY2VzIGZvciBHQ1xuICAgIGFpID0gZmFpID0gbnVsbDtcbiAgICBwcmV2ID0gSWdub3JlO1xuICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiB2Py52YWx1ZSB9XG4gIH1cbiAgbGV0IGZhaTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFI+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gZmFpO1xuICAgIH0sXG5cbiAgICBuZXh0KC4uLmFyZ3M6IFtdIHwgW3VuZGVmaW5lZF0pIHtcbiAgICAgIGlmIChpbml0aWFsVmFsdWUgIT09IElnbm9yZSkge1xuICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShpbml0aWFsVmFsdWUpKSB7XG4gICAgICAgICAgY29uc3QgaW5pdCA9IGluaXRpYWxWYWx1ZS50aGVuKHZhbHVlID0+ICh7ZG9uZTpmYWxzZSwgdmFsdWUgfSkpO1xuICAgICAgICAgIGluaXRpYWxWYWx1ZSA9IElnbm9yZTtcbiAgICAgICAgICByZXR1cm4gaW5pdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbml0ID0gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogZmFsc2UsIHZhbHVlOiBpbml0aWFsVmFsdWUgfSk7XG4gICAgICAgICAgaW5pdGlhbFZhbHVlID0gSWdub3JlO1xuICAgICAgICAgIHJldHVybiBpbml0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxSPj4oZnVuY3Rpb24gc3RlcChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFhaSlcbiAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgIGFpLm5leHQoLi4uYXJncykudGhlbihcbiAgICAgICAgICBwID0+IHAuZG9uZVxuICAgICAgICAgICAgPyAocHJldiA9IElnbm9yZSwgcmVzb2x2ZShwKSlcbiAgICAgICAgICAgIDogcmVzb2x2ZVN5bmMoZm4ocC52YWx1ZSwgcHJldiksXG4gICAgICAgICAgICAgIGYgPT4gZiA9PT0gSWdub3JlXG4gICAgICAgICAgICAgICAgPyBzdGVwKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICA6IHJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHByZXYgPSBmIH0pLFxuICAgICAgICAgICAgICBleCA9PiB7XG4gICAgICAgICAgICAgICAgcHJldiA9IElnbm9yZTsgLy8gUmVtb3ZlIHJlZmVyZW5jZSBmb3IgR0NcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsdGVyIGZ1bmN0aW9uIGZhaWxlZC4gV2UgY2hlY2sgYWkgaGVyZSBhcyBpdCBtaWdodCBoYXZlIGJlZW4gdGVybWluYXRlZCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUmVzcG9uc2UgPSBhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KTtcbiAgICAgICAgICAgICAgICAvLyBUZXJtaW5hdGUgdGhlIHNvdXJjZSAoYWkpIGFuZCBjb25zdW1lciAocmVqZWN0KVxuICAgICAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZVJlc3BvbnNlKSkgc291cmNlUmVzcG9uc2UudGhlbihyZWplY3QscmVqZWN0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBleCB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIGV4ID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgdGhyZXcuIFRlbGwgdGhlIGNvbnN1bWVyXG4gICAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgICAgcmVqZWN0KHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pXG4gICAgICAgICAgfVxuICAgICAgICApLmNhdGNoKGV4ID0+IHtcbiAgICAgICAgICAvLyBUaGUgY2FsbGJhY2sgdGhyZXdcbiAgICAgICAgICBwcmV2ID0gSWdub3JlOyAvLyBSZW1vdmUgcmVmZXJlbmNlIGZvciBHQ1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVJlc3BvbnNlID0gYWkudGhyb3c/LihleCkgPz8gYWkucmV0dXJuPy4oZXgpO1xuICAgICAgICAgIC8vIFRlcm1pbmF0ZSB0aGUgc291cmNlIChhaSkgYW5kIGNvbnN1bWVyIChyZWplY3QpXG4gICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlUmVzcG9uc2UpKSBzb3VyY2VSZXNwb25zZS50aGVuKHJlamVjdCwgcmVqZWN0KTtcbiAgICAgICAgICBlbHNlIHJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBzb3VyY2VSZXNwb25zZSB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHdhbnRzIHVzIHRvIGV4aXQgd2l0aCBhbiBleGNlcHRpb24uIFRlbGwgdGhlIHNvdXJjZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhaT8udGhyb3c/LihleCkgPz8gYWk/LnJldHVybj8uKGV4KSkudGhlbihkb25lLCBkb25lKVxuICAgIH0sXG5cbiAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgLy8gVGhlIGNvbnN1bWVyIHRvbGQgdXMgdG8gcmV0dXJuLCBzbyB3ZSBuZWVkIHRvIHRlcm1pbmF0ZSB0aGUgc291cmNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFpPy5yZXR1cm4/Lih2KSkudGhlbihkb25lLCBkb25lKVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGl0ZXJhYmxlSGVscGVycyhmYWkpXG59XG5cbmZ1bmN0aW9uIG1hcDxVIGV4dGVuZHMgUGFydGlhbEl0ZXJhYmxlLCBSPih0aGlzOiBVLCBtYXBwZXI6IE1hcHBlcjxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+LCBSPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxSPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbWFwcGVyKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuOiAobzogSGVscGVyQXN5bmNJdGVyYWJsZTxVPikgPT4gYm9vbGVhbiB8IFByb21pc2VMaWtlPGJvb2xlYW4+KTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4+IHtcbiAgcmV0dXJuIGZpbHRlck1hcCh0aGlzLCBhc3luYyBvID0+IChhd2FpdCBmbihvKSA/IG8gOiBJZ25vcmUpKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGZuPzogKG5leHQ6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4sIHByZXY6IEhlbHBlckFzeW5jSXRlcmFibGU8VT4pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxib29sZWFuPik6IEFzeW5jRXh0cmFJdGVyYWJsZTxIZWxwZXJBc3luY0l0ZXJhYmxlPFU+PiB7XG4gIHJldHVybiBmblxuICAgID8gZmlsdGVyTWFwKHRoaXMsIGFzeW5jIChvLCBwKSA9PiAocCA9PT0gSWdub3JlIHx8IGF3YWl0IGZuKG8sIHApKSA/IG8gOiBJZ25vcmUpXG4gICAgOiBmaWx0ZXJNYXAodGhpcywgKG8sIHApID0+IG8gPT09IHAgPyBJZ25vcmUgOiBvKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGx5PFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGUsIEkgZXh0ZW5kcyBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+ID0gSGVscGVyQXN5bmNJdGVyYWJsZTxVPj4odGhpczogVSwgaW5pdFZhbHVlOiBJKTogQXN5bmNFeHRyYUl0ZXJhYmxlPEhlbHBlckFzeW5jSXRlcmFibGU8VT4gfCBJPiB7XG4gIHJldHVybiBmaWx0ZXJNYXAodGhpcywgbyA9PiBvLCBpbml0VmFsdWUpO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9yPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUsIGNiOiAoZG9uZTogKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpID0+IHZvaWQpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICByZXR1cm4gZmlsdGVyTWFwKHRoaXMsIG8gPT4gbmV3IFByb21pc2U8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ocmVzb2x2ZSA9PiB7IGNiKCgpID0+IHJlc29sdmUobykpOyByZXR1cm4gbyB9KSk7XG59XG5cbmZ1bmN0aW9uIG11bHRpPFUgZXh0ZW5kcyBQYXJ0aWFsSXRlcmFibGU+KHRoaXM6IFUpOiBBc3luY0V4dHJhSXRlcmFibGU8SGVscGVyQXN5bmNJdGVyYWJsZTxVPj4ge1xuICB0eXBlIFQgPSBIZWxwZXJBc3luY0l0ZXJhYmxlPFU+O1xuICBjb25zdCBzb3VyY2UgPSB0aGlzO1xuICBjb25zdCBjb25zdW1lcnMgPSBuZXcgU2V0PEFzeW5jSXRlcmF0b3I8VD4+KCk7XG4gIGxldCBjdXJyZW50OiBEZWZlcnJlZFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8VCwgYW55Pj47XG4gIGxldCBhaTogQXN5bmNJdGVyYXRvcjxULCBhbnksIHVuZGVmaW5lZD4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIHNvdXJjZSBoYXMgcHJvZHVjZWQgYSBuZXcgcmVzdWx0XG4gIGZ1bmN0aW9uIHN0ZXAoaXQ/OiBJdGVyYXRvclJlc3VsdDxULCBhbnk+KSB7XG4gICAgaWYgKGl0KSBjdXJyZW50Py5yZXNvbHZlKGl0KTtcbiAgICBpZiAoaXQ/LmRvbmUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGRlZmVycmVkPEl0ZXJhdG9yUmVzdWx0PFQ+PigpO1xuICAgICAgaWYgKGFpKSB7XG4gICAgICAgIGFpLm5leHQoKVxuICAgICAgICAgIC50aGVuKHN0ZXApXG4gICAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIGN1cnJlbnQ/LnJlamVjdCh7IGRvbmU6IHRydWUsIHZhbHVlOiBlcnJvciB9KTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHJlbGVhc2UgcmVmZXJlbmNlXG4gICAgICAgICAgICBjdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJyZW50LnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZG9uZSh2OiBJdGVyYXRvclJlc3VsdDxIZWxwZXJBc3luY0l0ZXJhdG9yPFJlcXVpcmVkPFU+W3R5cGVvZiBTeW1ib2wuYXN5bmNJdGVyYXRvcl0+LCBhbnk+IHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgcmVzdWx0ID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdj8udmFsdWUgfTtcbiAgICAvLyBAdHMtaWdub3JlOiByZW1vdmUgcmVmZXJlbmNlcyBmb3IgR0NcbiAgICBhaSA9IG1haSA9IGN1cnJlbnQgPSBudWxsO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBsZXQgbWFpOiBBc3luY0l0ZXJhYmxlPFQ+ID0ge1xuICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShtYWksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHtcbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICBpZiAoIWFpKSB7XG4gICAgICAgICAgICBhaSA9IHNvdXJjZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0hKCk7XG4gICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN1bWVycy5hZGQodGhpcyk7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB3YW50cyB1cyB0byBleGl0IHdpdGggYW4gZXhjZXB0aW9uLiBUZWxsIHRoZSBzb3VyY2UgaWYgd2UncmUgdGhlIGZpbmFsIG9uZVxuICAgICAgICAgIGlmICghY29uc3VtZXJzLmhhcyh0aGlzKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jSXRlcmF0b3IgcHJvdG9jb2wgZXJyb3JcIik7XG4gICAgICAgICAgY29uc3VtZXJzLmRlbGV0ZSh0aGlzKTtcbiAgICAgICAgICBpZiAoY29uc3VtZXJzLnNpemUpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgZG9uZTogdHJ1ZSwgdmFsdWU6IGV4IH0pO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnRocm93Py4oZXgpID8/IGFpPy5yZXR1cm4/LihleCkpLnRoZW4oZG9uZSwgZG9uZSlcbiAgICAgICAgfSxcblxuICAgICAgICByZXR1cm4odj86IGFueSkge1xuICAgICAgICAgIC8vIFRoZSBjb25zdW1lciB0b2xkIHVzIHRvIHJldHVybiwgc28gd2UgbmVlZCB0byB0ZXJtaW5hdGUgdGhlIHNvdXJjZSBpZiB3ZSdyZSB0aGUgb25seSBvbmVcbiAgICAgICAgICBpZiAoIWNvbnN1bWVycy5oYXModGhpcykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luY0l0ZXJhdG9yIHByb3RvY29sIGVycm9yXCIpO1xuICAgICAgICAgIGNvbnN1bWVycy5kZWxldGUodGhpcyk7XG4gICAgICAgICAgaWYgKGNvbnN1bWVycy5zaXplKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYWk/LnJldHVybj8uKHYpKS50aGVuKGRvbmUsIGRvbmUpXG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBpdGVyYWJsZUhlbHBlcnMobWFpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRHbG9iYWxBc3luY0dlbmVyYXRvcnMoKSB7XG4gIGxldCBnID0gKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pKCk7XG4gIHdoaWxlIChnKSB7XG4gICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZywgU3ltYm9sLmFzeW5jSXRlcmF0b3IpO1xuICAgIGlmIChkZXNjKSB7XG4gICAgICBpdGVyYWJsZUhlbHBlcnMoZyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihnKTtcbiAgfVxuICBpZiAoIWcpIHtcbiAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gYXVnbWVudCB0aGUgcHJvdG90eXBlIG9mIGAoYXN5bmMgZnVuY3Rpb24qKCkpKClgXCIpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBERUJVRywgY29uc29sZSwgdGltZU91dFdhcm4gfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGlzUHJvbWlzZUxpa2UgfSBmcm9tICcuL2RlZmVycmVkLmpzJztcbmltcG9ydCB7IGl0ZXJhYmxlSGVscGVycywgbWVyZ2UsIEFzeW5jRXh0cmFJdGVyYWJsZSwgcXVldWVJdGVyYXRhYmxlSXRlcmF0b3IgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcblxuLypcbiAgYHdoZW4oLi4uLilgIGlzIGJvdGggYW4gQXN5bmNJdGVyYWJsZSBvZiB0aGUgZXZlbnRzIGl0IGNhbiBnZW5lcmF0ZSBieSBvYnNlcnZhdGlvbixcbiAgYW5kIGEgZnVuY3Rpb24gdGhhdCBjYW4gbWFwIHRob3NlIGV2ZW50cyB0byBhIHNwZWNpZmllZCB0eXBlLCBlZzpcblxuICB0aGlzLndoZW4oJ2tleXVwOiNlbGVtZXQnKSA9PiBBc3luY0l0ZXJhYmxlPEtleWJvYXJkRXZlbnQ+XG4gIHRoaXMud2hlbignI2VsZW1ldCcpKGUgPT4gZS50YXJnZXQpID0+IEFzeW5jSXRlcmFibGU8RXZlbnRUYXJnZXQ+XG4qL1xuLy8gVmFyYXJncyB0eXBlIHBhc3NlZCB0byBcIndoZW5cIlxudHlwZSBXaGVuUGFyYW1ldGVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBWYWxpZFdoZW5TZWxlY3RvcjxJRFM+XG4gIHwgRWxlbWVudCAvKiBJbXBsaWVzIFwiY2hhbmdlXCIgZXZlbnQgKi9cbiAgfCBQcm9taXNlPGFueT4gLyogSnVzdCBnZXRzIHdyYXBwZWQgaW4gYSBzaW5nbGUgYHlpZWxkYCAqL1xuICB8IEFzeW5jSXRlcmFibGU8YW55PlxuXG5leHBvcnQgdHlwZSBXaGVuUGFyYW1ldGVyczxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gUmVhZG9ubHlBcnJheTxXaGVuUGFyYW1ldGVyPElEUz4+XG5cbi8vIFRoZSBJdGVyYXRlZCB0eXBlIGdlbmVyYXRlZCBieSBcIndoZW5cIiwgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnNcbnR5cGUgV2hlbkl0ZXJhdGVkVHlwZTxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgKEV4dHJhY3Q8U1tudW1iZXJdLCBBc3luY0l0ZXJhYmxlPGFueT4+IGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBJPiA/IHVua25vd24gZXh0ZW5kcyBJID8gbmV2ZXIgOiBJIDogbmV2ZXIpXG4gIHwgRXh0cmFjdEV2ZW50czxFeHRyYWN0PFNbbnVtYmVyXSwgc3RyaW5nPj5cbiAgfCAoRXh0cmFjdDxTW251bWJlcl0sIEVsZW1lbnQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50KVxuXG50eXBlIE1hcHBhYmxlSXRlcmFibGU8QSBleHRlbmRzIEFzeW5jSXRlcmFibGU8YW55Pj4gPVxuICBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/XG4gIEEgJiBBc3luY0V4dHJhSXRlcmFibGU8VD4gJlxuICAoPFI+KG1hcHBlcjogKHZhbHVlOiBBIGV4dGVuZHMgQXN5bmNJdGVyYWJsZTxpbmZlciBUPiA/IFQgOiBuZXZlcikgPT4gUikgPT4gKEFzeW5jRXh0cmFJdGVyYWJsZTxBd2FpdGVkPFI+PikpXG4gIDogbmV2ZXJcblxuLy8gVGhlIGV4dGVuZGVkIGl0ZXJhdG9yIHRoYXQgc3VwcG9ydHMgYXN5bmMgaXRlcmF0b3IgbWFwcGluZywgY2hhaW5pbmcsIGV0Y1xuZXhwb3J0IHR5cGUgV2hlblJldHVybjxTIGV4dGVuZHMgV2hlblBhcmFtZXRlcnM+ID1cbiAgTWFwcGFibGVJdGVyYWJsZTxcbiAgICBBc3luY0V4dHJhSXRlcmFibGU8XG4gICAgICBXaGVuSXRlcmF0ZWRUeXBlPFM+Pj5cblxudHlwZSBFbXB0eU9iamVjdCA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIsIG5ldmVyPlxuXG5pbnRlcmZhY2UgU3BlY2lhbFdoZW5FdmVudHMge1xuICBcIkBzdGFydFwiOiBFbXB0eU9iamVjdCwgIC8vIEFsd2F5cyBmaXJlcyB3aGVuIHJlZmVyZW5jZWRcbiAgXCJAcmVhZHlcIjogRW1wdHlPYmplY3QgICAvLyBGaXJlcyB3aGVuIGFsbCBFbGVtZW50IHNwZWNpZmllZCBzb3VyY2VzIGFyZSBtb3VudGVkIGluIHRoZSBET01cbn1cblxuZXhwb3J0IGNvbnN0IFJlYWR5ID0gT2JqZWN0LmZyZWV6ZSh7fSk7XG5cbmludGVyZmFjZSBXaGVuRXZlbnRzIGV4dGVuZHMgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwLCBTcGVjaWFsV2hlbkV2ZW50cyB7IH1cbnR5cGUgRXZlbnROYW1lTGlzdDxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IGAke1N9LCR7RXZlbnROYW1lTGlzdDxSPn1gXG4gIDogbmV2ZXJcblxudHlwZSBFdmVudE5hbWVVbmlvbjxUIGV4dGVuZHMgc3RyaW5nPiA9IFQgZXh0ZW5kcyBrZXlvZiBXaGVuRXZlbnRzXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBgJHtpbmZlciBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50c30sJHtpbmZlciBSfWBcbiAgPyBFdmVudE5hbWVMaXN0PFI+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFMgfCBFdmVudE5hbWVMaXN0PFI+XG4gIDogbmV2ZXJcblxuXG50eXBlIEV2ZW50QXR0cmlidXRlID0gYCR7a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwfWBcbi8vIE5vdGU6IHRoaXMgc2xvd3MgZG93biB0eXBlc2NyaXB0LiBTaW1wbHkgZGVmaW5pbmcgYENTU0lkZW50aWZpZXIgPSBzdHJpbmdgIGlzIHF1aWNrZXIsIGJ1dCBwcmV2ZW50cyB3aGVuIHZhbGlkYXRpbmcgc3ViLUlEU3Mgb3Igc2VsZWN0b3IgZm9ybWF0dGluZ1xudHlwZSBDU1NJZGVudGlmaWVyPElEUyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSBgIyR7SURTfWAgfCBgIyR7SURTfT5gIHwgYC4ke3N0cmluZ31gIHwgYFske3N0cmluZ31dYFxuXG4vKiBWYWxpZFdoZW5TZWxlY3RvcnMgYXJlOlxuICAgIEBzdGFydFxuICAgIEByZWFkeVxuICAgIGV2ZW50OnNlbGVjdG9yXG4gICAgZXZlbnQgICAgICAgICAgIFwidGhpc1wiIGVsZW1lbnQsIGV2ZW50IHR5cGU9J2V2ZW50J1xuICAgIHNlbGVjdG9yICAgICAgICBzcGVjaWZpY2VkIHNlbGVjdG9ycywgaW1wbGllcyBcImNoYW5nZVwiIGV2ZW50XG4qL1xuXG5leHBvcnQgdHlwZSBWYWxpZFdoZW5TZWxlY3RvcjxJRFMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0gYCR7a2V5b2YgU3BlY2lhbFdoZW5FdmVudHN9YFxuICB8IGAke0V2ZW50QXR0cmlidXRlfToke0NTU0lkZW50aWZpZXI8SURTPn1gXG4gIHwgRXZlbnRBdHRyaWJ1dGVcbiAgfCBDU1NJZGVudGlmaWVyPElEUz5cblxudHlwZSBJc1ZhbGlkV2hlblNlbGVjdG9yPFM+ID0gUyBleHRlbmRzIFZhbGlkV2hlblNlbGVjdG9yID8gUyA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50TmFtZXM8Uz5cbiAgPSBTIGV4dGVuZHMga2V5b2YgU3BlY2lhbFdoZW5FdmVudHMgPyBTXG4gIDogUyBleHRlbmRzIGAke2luZmVyIFZ9OiR7Q1NTSWRlbnRpZmllcn1gID8gRXZlbnROYW1lVW5pb248Vj4gZXh0ZW5kcyBuZXZlciA/IG5ldmVyIDogRXZlbnROYW1lVW5pb248Vj5cbiAgOiBTIGV4dGVuZHMga2V5b2YgV2hlbkV2ZW50cyA/IEV2ZW50TmFtZVVuaW9uPFM+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IEV2ZW50TmFtZVVuaW9uPFM+XG4gIDogUyBleHRlbmRzIENTU0lkZW50aWZpZXIgPyAnY2hhbmdlJ1xuICA6IG5ldmVyXG5cbnR5cGUgRXh0cmFjdEV2ZW50czxTPiA9IFdoZW5FdmVudHNbRXh0cmFjdEV2ZW50TmFtZXM8Uz5dXG5cbi8qKiB3aGVuICoqL1xuaW50ZXJmYWNlIEV2ZW50T2JzZXJ2YXRpb248RXZlbnROYW1lIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiB7XG4gIHB1c2g6IChldjogR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwW0V2ZW50TmFtZV0pID0+IHZvaWQ7XG4gIHRlcm1pbmF0ZTogKGV4OiBFcnJvcikgPT4gdm9pZDtcbiAgY29udGFpbmVyUmVmOiBXZWFrUmVmPEVsZW1lbnQ+XG4gIHNlbGVjdG9yOiBzdHJpbmcgfCBudWxsO1xuICBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW47XG59XG5cbmNvbnN0IGV2ZW50T2JzZXJ2YXRpb25zID0gbmV3IFdlYWtNYXA8RG9jdW1lbnRGcmFnbWVudCB8IERvY3VtZW50LCBNYXA8a2V5b2YgV2hlbkV2ZW50cywgTWFwPEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHwgRG9jdW1lbnQsIFNldDxFdmVudE9ic2VydmF0aW9uPGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcD4+Pj4+KCk7XG5cbmZ1bmN0aW9uIGRvY0V2ZW50SGFuZGxlcjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXA+KHRoaXM6IERvY3VtZW50RnJhZ21lbnQgfCBEb2N1bWVudCwgZXY6IEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcFtFdmVudE5hbWVdKSB7XG4gIGlmICghZXZlbnRPYnNlcnZhdGlvbnMuaGFzKHRoaXMpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldCh0aGlzLCBuZXcgTWFwKCkpO1xuXG4gIGNvbnN0IG9ic2VydmF0aW9ucyA9IGV2ZW50T2JzZXJ2YXRpb25zLmdldCh0aGlzKSEuZ2V0KGV2LnR5cGUgYXMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwKTtcbiAgaWYgKG9ic2VydmF0aW9ucykge1xuICAgIGxldCB0YXJnZXQgPSBldi50YXJnZXQ7XG4gICAgd2hpbGUgKHRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lck9ic2VydmF0aW9ucyA9IG9ic2VydmF0aW9ucy5nZXQodGFyZ2V0IGFzIEVsZW1lbnQpO1xuICAgICAgaWYgKGNvbnRhaW5lck9ic2VydmF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2YgY29udGFpbmVyT2JzZXJ2YXRpb25zKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcHVzaCwgdGVybWluYXRlLCBjb250YWluZXJSZWYsIHNlbGVjdG9yLCBpbmNsdWRlQ2hpbGRyZW4gfSA9IG87XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBjb250YWluZXJSZWYuZGVyZWYoKTtcbiAgICAgICAgICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgY29uc3QgbXNnID0gXCJDb250YWluZXIgYCNcIiArIGNvbnRhaW5lcj8uaWQgKyBcIj5cIiArIChzZWxlY3RvciB8fCAnJykgKyBcImAgcmVtb3ZlZCBmcm9tIERPTS4gUmVtb3Zpbmcgc3Vic2NyaXB0aW9uXCI7XG4gICAgICAgICAgICAgIGNvbnRhaW5lck9ic2VydmF0aW9ucy5kZWxldGUobyk7XG4gICAgICAgICAgICAgIHRlcm1pbmF0ZShuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgIGlmICgoaW5jbHVkZUNoaWxkcmVuID8gbi5jb250YWlucyhldi50YXJnZXQgYXMgTm9kZSkgOiBldi50YXJnZXQgPT09IG4pICYmIGNvbnRhaW5lci5jb250YWlucyhuKSlcbiAgICAgICAgICAgICAgICAgICAgcHVzaChldilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVDaGlsZHJlbiA/IGNvbnRhaW5lci5jb250YWlucyhldi50YXJnZXQgYXMgTm9kZSkgOiBldi50YXJnZXQgPT09IGNvbnRhaW5lcilcbiAgICAgICAgICAgICAgICAgIHB1c2goZXYpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdkb2NFdmVudEhhbmRsZXInLCBleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQgPT09IHRoaXMpIGJyZWFrO1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ1NTU2VsZWN0b3Ioczogc3RyaW5nKTogcyBpcyBDU1NJZGVudGlmaWVyIHtcbiAgcmV0dXJuIEJvb2xlYW4ocyAmJiAocy5zdGFydHNXaXRoKCcjJykgfHwgcy5zdGFydHNXaXRoKCcuJykgfHwgKHMuc3RhcnRzV2l0aCgnWycpICYmIHMuZW5kc1dpdGgoJ10nKSkpKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRsZXNzPFQgZXh0ZW5kcyBzdHJpbmcgfCBudWxsPihzZWw6IFQpOiBUIGV4dGVuZHMgbnVsbCA/IHsgaW5jbHVkZUNoaWxkcmVuOiB0cnVlLCBzZWxlY3RvcjogbnVsbCB9IDogeyBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIHNlbGVjdG9yOiBUIH0ge1xuICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSAhc2VsIHx8ICFzZWwuZW5kc1dpdGgoJz4nKVxuICByZXR1cm4geyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yOiBpbmNsdWRlQ2hpbGRyZW4gPyBzZWwgOiBzZWwuc2xpY2UoMCwgLTEpIH0gYXMgYW55O1xufVxuXG5mdW5jdGlvbiBwYXJzZVdoZW5TZWxlY3RvcjxFdmVudE5hbWUgZXh0ZW5kcyBzdHJpbmc+KHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPik6IHVuZGVmaW5lZCB8IFtSZXR1cm5UeXBlPHR5cGVvZiBjaGlsZGxlc3M+LCBrZXlvZiBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBdIHtcbiAgY29uc3QgcGFydHMgPSB3aGF0LnNwbGl0KCc6Jyk7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1swXSksIFwiY2hhbmdlXCJdO1xuICAgIHJldHVybiBbeyBpbmNsdWRlQ2hpbGRyZW46IHRydWUsIHNlbGVjdG9yOiBudWxsIH0sIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF07XG4gIH1cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc0NTU1NlbGVjdG9yKHBhcnRzWzFdKSAmJiAhaXNDU1NTZWxlY3RvcihwYXJ0c1swXSkpXG4gICAgICByZXR1cm4gW2NoaWxkbGVzcyhwYXJ0c1sxXSksIHBhcnRzWzBdIGFzIGtleW9mIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcF1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkb1Rocm93KG1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB3aGVuRXZlbnQ8RXZlbnROYW1lIGV4dGVuZHMgc3RyaW5nPihjb250YWluZXI6IEVsZW1lbnQsIHdoYXQ6IElzVmFsaWRXaGVuU2VsZWN0b3I8RXZlbnROYW1lPikge1xuICBjb25zdCBbeyBpbmNsdWRlQ2hpbGRyZW4sIHNlbGVjdG9yIH0sIGV2ZW50TmFtZV0gPSBwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSA/PyBkb1Rocm93KFwiSW52YWxpZCBXaGVuU2VsZWN0b3I6IFwiICsgd2hhdCk7XG5cbiAgaWYgKCFldmVudE9ic2VydmF0aW9ucy5oYXMoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpKVxuICAgIGV2ZW50T2JzZXJ2YXRpb25zLnNldChjb250YWluZXIub3duZXJEb2N1bWVudCwgbmV3IE1hcCgpKTtcblxuICBpZiAoIWV2ZW50T2JzZXJ2YXRpb25zLmdldChjb250YWluZXIub3duZXJEb2N1bWVudCkhLmhhcyhldmVudE5hbWUpKSB7XG4gICAgY29udGFpbmVyLm93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGRvY0V2ZW50SGFuZGxlciwge1xuICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgIGNhcHR1cmU6IHRydWVcbiAgICB9KTtcbiAgICBldmVudE9ic2VydmF0aW9ucy5nZXQoY29udGFpbmVyLm93bmVyRG9jdW1lbnQpIS5zZXQoZXZlbnROYW1lLCBuZXcgTWFwKCkpO1xuICB9XG5cbiAgY29uc3Qgb2JzZXJ2YXRpb25zID0gZXZlbnRPYnNlcnZhdGlvbnMuZ2V0KGNvbnRhaW5lci5vd25lckRvY3VtZW50KSEuZ2V0KGV2ZW50TmFtZSkhO1xuICBpZiAoIW9ic2VydmF0aW9ucy5oYXMoY29udGFpbmVyKSlcbiAgICBvYnNlcnZhdGlvbnMuc2V0KGNvbnRhaW5lciwgbmV3IFNldCgpKTtcbiAgY29uc3QgY29udGFpbmVyT2JzZXJ2YXRpb25zID0gb2JzZXJ2YXRpb25zLmdldChjb250YWluZXIpITtcbiAgY29uc3QgcXVldWUgPSBxdWV1ZUl0ZXJhdGFibGVJdGVyYXRvcjxHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXBba2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwXT4oKCkgPT4gY29udGFpbmVyT2JzZXJ2YXRpb25zLmRlbGV0ZShkZXRhaWxzKSk7XG4gIGNvbnN0IGRldGFpbHM6IEV2ZW50T2JzZXJ2YXRpb248a2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwPiA9IHtcbiAgICBwdXNoOiBxdWV1ZS5wdXNoLFxuICAgIHRlcm1pbmF0ZShleDogRXJyb3IpIHsgcXVldWUucmV0dXJuPy4oZXgpIH0sXG4gICAgY29udGFpbmVyUmVmOiBuZXcgV2Vha1JlZihjb250YWluZXIpLFxuICAgIGluY2x1ZGVDaGlsZHJlbixcbiAgICBzZWxlY3RvclxuICB9O1xuXG4gIGNvbnRhaW5lckFuZFNlbGVjdG9yc01vdW50ZWQoY29udGFpbmVyLCBzZWxlY3RvciA/IFtzZWxlY3Rvcl0gOiB1bmRlZmluZWQpXG4gICAgLnRoZW4oXyA9PiBjb250YWluZXJPYnNlcnZhdGlvbnMuYWRkKGRldGFpbHMpKTtcblxuICByZXR1cm4gcXVldWUubXVsdGkoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24qIGRvbmVJbW1lZGlhdGVseTxaPigpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Wj4ge1xuICByZXR1cm4gdW5kZWZpbmVkIGFzIFo7XG59XG5cbi8qIFN5bnRhY3RpYyBzdWdhcjogY2hhaW5Bc3luYyBkZWNvcmF0ZXMgdGhlIHNwZWNpZmllZCBpdGVyYXRvciBzbyBpdCBjYW4gYmUgbWFwcGVkIGJ5XG4gIGEgZm9sbG93aW5nIGZ1bmN0aW9uLCBvciB1c2VkIGRpcmVjdGx5IGFzIGFuIGl0ZXJhYmxlICovXG5mdW5jdGlvbiBjaGFpbkFzeW5jPEEgZXh0ZW5kcyBBc3luY0V4dHJhSXRlcmFibGU8WD4sIFg+KHNyYzogQSk6IE1hcHBhYmxlSXRlcmFibGU8QT4ge1xuICBmdW5jdGlvbiBtYXBwYWJsZUFzeW5jSXRlcmFibGUobWFwcGVyOiBQYXJhbWV0ZXJzPHR5cGVvZiBzcmMubWFwPlswXSkge1xuICAgIHJldHVybiBzcmMubWFwKG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihpdGVyYWJsZUhlbHBlcnMobWFwcGFibGVBc3luY0l0ZXJhYmxlIGFzIHVua25vd24gYXMgQXN5bmNJdGVyYWJsZTxBPiksIHtcbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzcmNbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKClcbiAgfSkgYXMgTWFwcGFibGVJdGVyYWJsZTxBPjtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFdoZW5TZWxlY3Rvcih3aGF0OiBXaGVuUGFyYW1ldGVyKTogd2hhdCBpcyBWYWxpZFdoZW5TZWxlY3RvciB7XG4gIGlmICghd2hhdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhbHN5IGFzeW5jIHNvdXJjZSB3aWxsIG5ldmVyIGJlIHJlYWR5XFxuXFxuJyArIEpTT04uc3RyaW5naWZ5KHdoYXQpKTtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnc3RyaW5nJyAmJiB3aGF0WzBdICE9PSAnQCcgJiYgQm9vbGVhbihwYXJzZVdoZW5TZWxlY3Rvcih3aGF0KSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBvbmNlPFQ+KHA6IFByb21pc2U8VD4pIHtcbiAgeWllbGQgcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW48UyBleHRlbmRzIFdoZW5QYXJhbWV0ZXJzPihjb250YWluZXI6IEVsZW1lbnQsIC4uLnNvdXJjZXM6IFMpOiBXaGVuUmV0dXJuPFM+IHtcbiAgaWYgKCFzb3VyY2VzIHx8IHNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNoYWluQXN5bmMod2hlbkV2ZW50KGNvbnRhaW5lciwgXCJjaGFuZ2VcIikpIGFzIHVua25vd24gYXMgV2hlblJldHVybjxTPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9ycyA9IHNvdXJjZXMuZmlsdGVyKHdoYXQgPT4gdHlwZW9mIHdoYXQgIT09ICdzdHJpbmcnIHx8IHdoYXRbMF0gIT09ICdAJykubWFwKHdoYXQgPT4gdHlwZW9mIHdoYXQgPT09ICdzdHJpbmcnXG4gICAgPyB3aGVuRXZlbnQoY29udGFpbmVyLCB3aGF0KVxuICAgIDogd2hhdCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gd2hlbkV2ZW50KHdoYXQsIFwiY2hhbmdlXCIpXG4gICAgICA6IGlzUHJvbWlzZUxpa2Uod2hhdClcbiAgICAgICAgPyBvbmNlKHdoYXQpXG4gICAgICAgIDogd2hhdCk7XG5cbiAgaWYgKHNvdXJjZXMuaW5jbHVkZXMoJ0BzdGFydCcpKSB7XG4gICAgY29uc3Qgc3RhcnQ6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjx7fT4gPSB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiBzdGFydCxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIHN0YXJ0Lm5leHQgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0pXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiBmYWxzZSwgdmFsdWU6IHt9IH0pXG4gICAgICB9XG4gICAgfTtcbiAgICBpdGVyYXRvcnMucHVzaChzdGFydCk7XG4gIH1cblxuICBpZiAoc291cmNlcy5pbmNsdWRlcygnQHJlYWR5JykpIHtcbiAgICBjb25zdCB3YXRjaFNlbGVjdG9ycyA9IHNvdXJjZXMuZmlsdGVyKGlzVmFsaWRXaGVuU2VsZWN0b3IpLm1hcCh3aGF0ID0+IHBhcnNlV2hlblNlbGVjdG9yKHdoYXQpPy5bMF0pO1xuXG4gICAgY29uc3QgaXNNaXNzaW5nID0gKHNlbDogQ1NTSWRlbnRpZmllciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBzZWwgaXMgQ1NTSWRlbnRpZmllciA9PiBCb29sZWFuKHR5cGVvZiBzZWwgPT09ICdzdHJpbmcnICYmICFjb250YWluZXIucXVlcnlTZWxlY3RvcihzZWwpKTtcblxuICAgIGNvbnN0IG1pc3NpbmcgPSB3YXRjaFNlbGVjdG9ycy5tYXAodyA9PiB3Py5zZWxlY3RvcikuZmlsdGVyKGlzTWlzc2luZyk7XG5cbiAgICBsZXQgZXZlbnRzOiBBc3luY0l0ZXJhdG9yPGFueSwgYW55LCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8YW55PiA9IHtcbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7IHJldHVybiBhaSB9LFxuICAgICAgdGhyb3coZXg6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnRzPy50aHJvdykgcmV0dXJuIGV2ZW50cy50aHJvdyhleCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBkb25lOiB0cnVlLCB2YWx1ZTogZXggfSk7XG4gICAgICB9LFxuICAgICAgcmV0dXJuKHY/OiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50cz8ucmV0dXJuKSByZXR1cm4gZXZlbnRzLnJldHVybih2KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRvbmU6IHRydWUsIHZhbHVlOiB2IH0pO1xuICAgICAgfSxcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGlmIChldmVudHMpIHJldHVybiBldmVudHMubmV4dCgpO1xuXG4gICAgICAgIHJldHVybiBjb250YWluZXJBbmRTZWxlY3RvcnNNb3VudGVkKGNvbnRhaW5lciwgbWlzc2luZykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVyZ2VkID0gKGl0ZXJhdG9ycy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgICAgICAgICA6IGl0ZXJhdG9ycy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgPyBpdGVyYXRvcnNbMF1cbiAgICAgICAgICAgICAgOiBkb25lSW1tZWRpYXRlbHkoKTtcblxuICAgICAgICAgIC8vIE5vdyBldmVyeXRoaW5nIGlzIHJlYWR5LCB3ZSBzaW1wbHkgZGVsZWdhdGUgYWxsIGFzeW5jIG9wcyB0byB0aGUgdW5kZXJseWluZ1xuICAgICAgICAgIC8vIG1lcmdlZCBhc3luY0l0ZXJhdG9yIFwiZXZlbnRzXCJcbiAgICAgICAgICBldmVudHMgPSBtZXJnZWRbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IFJlYWR5IH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNoYWluQXN5bmMoaXRlcmFibGVIZWxwZXJzKGFpKSk7XG4gIH1cblxuICBjb25zdCBtZXJnZWQgPSAoaXRlcmF0b3JzLmxlbmd0aCA+IDEpXG4gICAgPyBtZXJnZSguLi5pdGVyYXRvcnMpXG4gICAgOiBpdGVyYXRvcnMubGVuZ3RoID09PSAxXG4gICAgICA/IGl0ZXJhdG9yc1swXVxuICAgICAgOiAoZG9uZUltbWVkaWF0ZWx5PFdoZW5JdGVyYXRlZFR5cGU8Uz4+KCkpO1xuXG4gIHJldHVybiBjaGFpbkFzeW5jKGl0ZXJhYmxlSGVscGVycyhtZXJnZWQpKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyQW5kU2VsZWN0b3JzTW91bnRlZChjb250YWluZXI6IEVsZW1lbnQsIHNlbGVjdG9ycz86IHN0cmluZ1tdKSB7XG4gIGZ1bmN0aW9uIGNvbnRhaW5lcklzSW5ET00oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRhaW5lci5pc0Nvbm5lY3RlZClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMsIG11dGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVyLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiBbLi4uci5yZW1vdmVkTm9kZXNdLnNvbWUociA9PiByID09PSBjb250YWluZXIgfHwgci5jb250YWlucyhjb250YWluZXIpKSkpIHtcbiAgICAgICAgICBtdXRhdGlvbi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbW92ZWQgZnJvbSBET01cIikpO1xuICAgICAgICB9XG4gICAgICB9KS5vYnNlcnZlKGNvbnRhaW5lci5vd25lckRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5yZXBsYWNlKC9eRXJyb3IvLCBgRWxlbWVudCBub3QgbW91bnRlZCBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczpgKTtcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBcIlxcblwiICsgY29udGFpbmVyLm91dGVySFRNTCk7XG4gICAgICAgIC8vcmVqZWN0KG5ldyBFcnJvcihcIkVsZW1lbnQgbm90IG1vdW50ZWQgYWZ0ZXIgNSBzZWNvbmRzXCIpKTtcbiAgICAgIH0sIHRpbWVPdXRXYXJuKTtcblxuICAgICAgcHJvbWlzZS5maW5hbGx5KCgpID0+IGNsZWFyVGltZW91dCh3YXJuVGltZXIpKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsU2VsZWN0b3JzUHJlc2VudChtaXNzaW5nOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIG1pc3NpbmcgPSBtaXNzaW5nLmZpbHRlcihzZWwgPT4gIWNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpXG4gICAgaWYgKCFtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3RoaW5nIGlzIG1pc3NpbmdcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkcywgbXV0YXRpb24pID0+IHtcbiAgICAgIGlmIChyZWNvcmRzLnNvbWUociA9PiByLmFkZGVkTm9kZXM/Lmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKG1pc3NpbmcuZXZlcnkoc2VsID0+IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbCkpKSB7XG4gICAgICAgICAgbXV0YXRpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9ic2VydmUoY29udGFpbmVyLCB7XG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgfSkpO1xuXG4gICAgLyogZGVidWdnaW5nIGhlbHA6IHdhcm4gaWYgd2FpdGluZyBhIGxvbmcgdGltZSBmb3IgYSBzZWxlY3RvcnMgdG8gYmUgcmVhZHkgKi9cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnJlcGxhY2UoL15FcnJvci8sIGBNaXNzaW5nIHNlbGVjdG9ycyBhZnRlciAke3RpbWVPdXRXYXJuIC8gMTAwMH0gc2Vjb25kczogYCkgPz8gJz8/JztcbiAgICAgIGNvbnN0IHdhcm5UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oc3RhY2sgKyBtaXNzaW5nICsgXCJcXG5cIik7XG4gICAgICB9LCB0aW1lT3V0V2Fybik7XG5cbiAgICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQod2FyblRpbWVyKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBpZiAoc2VsZWN0b3JzPy5sZW5ndGgpXG4gICAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKS50aGVuKCgpID0+IGFsbFNlbGVjdG9yc1ByZXNlbnQoc2VsZWN0b3JzKSlcbiAgcmV0dXJuIGNvbnRhaW5lcklzSW5ET00oKTtcbn1cbiIsICIvKiBUeXBlcyBmb3IgdGFnIGNyZWF0aW9uLCBpbXBsZW1lbnRlZCBieSBgdGFnKClgIGluIGFpLXVpLnRzLlxuICBObyBjb2RlL2RhdGEgaXMgZGVjbGFyZWQgaW4gdGhpcyBmaWxlIChleGNlcHQgdGhlIHJlLWV4cG9ydGVkIHN5bWJvbHMgZnJvbSBpdGVyYXRvcnMudHMpLlxuKi9cblxuaW1wb3J0IHR5cGUgeyBBc3luY1Byb3ZpZGVyLCBJZ25vcmUsIEl0ZXJhYmxlUHJvcGVydGllcywgSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSwgSXRlcmFibGVQcm9wZXJ0eVZhbHVlLCBJdGVyYWJsZVR5cGUgfSBmcm9tIFwiLi9pdGVyYXRvcnMuanNcIjtcbmltcG9ydCB0eXBlIHsgVW5pcXVlSUQgfSBmcm9tIFwiLi9haS11aS5qc1wiO1xuXG5leHBvcnQgdHlwZSBDaGlsZFRhZ3MgPSBOb2RlIC8vIFRoaW5ncyB0aGF0IGFyZSBET00gbm9kZXMgKGluY2x1ZGluZyBlbGVtZW50cylcbiAgfCBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIC8vIFRoaW5ncyB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gdGV4dCBub2RlcyB2aWEgdG9TdHJpbmdcbiAgfCB1bmRlZmluZWQgLy8gQSB2YWx1ZSB0aGF0IHdvbid0IGdlbmVyYXRlIGFuIGVsZW1lbnRcbiAgfCB0eXBlb2YgSWdub3JlIC8vIEEgdmFsdWUgdGhhdCB3b24ndCBnZW5lcmF0ZSBhbiBlbGVtZW50XG4gIC8vIE5COiB3ZSBjYW4ndCBjaGVjayB0aGUgY29udGFpbmVkIHR5cGUgYXQgcnVudGltZSwgc28gd2UgaGF2ZSB0byBiZSBsaWJlcmFsXG4gIC8vIGFuZCB3YWl0IGZvciB0aGUgZGUtY29udGFpbm1lbnQgdG8gZmFpbCBpZiBpdCB0dXJucyBvdXQgdG8gbm90IGJlIGEgYENoaWxkVGFnc2BcbiAgfCBBc3luY0l0ZXJhYmxlPENoaWxkVGFncz4gfCBBc3luY0l0ZXJhdG9yPENoaWxkVGFncz4gfCBQcm9taXNlTGlrZTxDaGlsZFRhZ3M+IC8vIFRoaW5ncyB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbnkgb2YgdGhlIGFib3ZlXG4gIHwgQXJyYXk8Q2hpbGRUYWdzPlxuICB8IEl0ZXJhYmxlPENoaWxkVGFncz4gLy8gSXRlcmFibGUgdGhpbmdzIHRoYXQgaG9sZCB0aGUgYWJvdmUsIGxpa2UgQXJyYXlzLCBIVE1MQ29sbGVjdGlvbiwgTm9kZUxpc3RcblxuLyogVHlwZXMgdXNlZCB0byB2YWxpZGF0ZSBhbiBleHRlbmRlZCB0YWcgZGVjbGFyYXRpb24gKi9cblxudHlwZSBEZWVwUGFydGlhbDxYPiA9IFtYXSBleHRlbmRzIFt7fV0gPyB7IFtLIGluIGtleW9mIFhdPzogRGVlcFBhcnRpYWw8WFtLXT4gfSA6IFhcbnR5cGUgTmV2ZXJFbXB0eTxPIGV4dGVuZHMgb2JqZWN0PiA9IHt9IGV4dGVuZHMgTyA/IG5ldmVyIDogT1xudHlwZSBPbWl0VHlwZTxULCBWPiA9IFt7IFtLIGluIGtleW9mIFQgYXMgVFtLXSBleHRlbmRzIFYgPyBuZXZlciA6IEtdOiBUW0tdIH1dW251bWJlcl1cbnR5cGUgUGlja1R5cGU8VCwgVj4gPSBbeyBbSyBpbiBrZXlvZiBUIGFzIFRbS10gZXh0ZW5kcyBWID8gSyA6IG5ldmVyXTogVFtLXSB9XVtudW1iZXJdXG5cbi8vIEZvciBpbmZvcm1hdGl2ZSBwdXJwb3NlcyAtIHVudXNlZCBpbiBwcmFjdGljZVxuaW50ZXJmYWNlIF9Ob3RfRGVjbGFyZWRfIHsgfVxuaW50ZXJmYWNlIF9Ob3RfQXJyYXlfIHsgfVxudHlwZSBFeGNlc3NLZXlzPEEsIEI+ID1cbiAgQSBleHRlbmRzIGFueVtdXG4gID8gQiBleHRlbmRzIGFueVtdXG4gID8gRXhjZXNzS2V5czxBW251bWJlcl0sIEJbbnVtYmVyXT5cbiAgOiBfTm90X0FycmF5X1xuICA6IEIgZXh0ZW5kcyBhbnlbXVxuICA/IF9Ob3RfQXJyYXlfXG4gIDogTmV2ZXJFbXB0eTxPbWl0VHlwZTx7XG4gICAgW0sgaW4ga2V5b2YgQV06IEsgZXh0ZW5kcyBrZXlvZiBCXG4gICAgPyBBW0tdIGV4dGVuZHMgKEJbS10gZXh0ZW5kcyBGdW5jdGlvbiA/IEJbS10gOiBEZWVwUGFydGlhbDxCW0tdPilcbiAgICA/IG5ldmVyIDogQltLXVxuICAgIDogX05vdF9EZWNsYXJlZF9cbiAgfSwgbmV2ZXI+PlxuXG50eXBlIE92ZXJsYXBwaW5nS2V5czxBLEI+ID0gQiBleHRlbmRzIG5ldmVyID8gbmV2ZXJcbiAgOiBBIGV4dGVuZHMgbmV2ZXIgPyBuZXZlclxuICA6IGtleW9mIEEgJiBrZXlvZiBCXG5cbnR5cGUgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55PiwgRCBleHRlbmRzIE92ZXJyaWRlcywgUmVzdWx0ID0gbmV2ZXI+XG4gID0gKE92ZXJsYXBwaW5nS2V5czxEWydvdmVycmlkZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ2RlY2xhcmUnXT5cbiAgICB8IE92ZXJsYXBwaW5nS2V5czxEWydpdGVyYWJsZSddLERbJ292ZXJyaWRlJ10+XG4gICAgfCBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxPbWl0PFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2VDcmVhdG9yPiwga2V5b2YgQmFzZUl0ZXJhYmxlczxCYXNlQ3JlYXRvcj4+PlxuICAgIHwgT3ZlcmxhcHBpbmdLZXlzPERbJ2RlY2xhcmUnXSxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4+XG4gICkgZXh0ZW5kcyBuZXZlclxuICA/IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiBleHRlbmRzIG5ldmVyXG4gICAgPyBSZXN1bHRcbiAgICA6IHsgJ2BvdmVycmlkZWAgaGFzIHByb3BlcnRpZXMgbm90IGluIHRoZSBiYXNlIHRhZyBvciBvZiB0aGUgd3JvbmcgdHlwZSwgYW5kIHNob3VsZCBtYXRjaCc6IEV4Y2Vzc0tleXM8RFsnb3ZlcnJpZGUnXSwgVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PiB9XG4gIDogT21pdFR5cGU8e1xuICAgICdgZGVjbGFyZWAgY2xhc2hlcyB3aXRoIGJhc2UgcHJvcGVydGllcyc6IE92ZXJsYXBwaW5nS2V5czxEWydkZWNsYXJlJ10sVGFnQ3JlYXRvckF0dHJpYnV0ZXM8QmFzZUNyZWF0b3I+PixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYmFzZSBwcm9wZXJ0aWVzJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlQ3JlYXRvcj4sIGtleW9mIEJhc2VJdGVyYWJsZXM8QmFzZUNyZWF0b3I+Pj4sXG4gICAgJ2BpdGVyYWJsZWAgY2xhc2hlcyB3aXRoIGBvdmVycmlkZWAnOiBPdmVybGFwcGluZ0tleXM8RFsnaXRlcmFibGUnXSxEWydvdmVycmlkZSddPixcbiAgICAnYGl0ZXJhYmxlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ2l0ZXJhYmxlJ10sRFsnZGVjbGFyZSddPixcbiAgICAnYG92ZXJyaWRlYCBjbGFzaGVzIHdpdGggYGRlY2xhcmVgJzogT3ZlcmxhcHBpbmdLZXlzPERbJ292ZXJyaWRlJ10sRFsnZGVjbGFyZSddPlxuICB9LCBuZXZlcj5cblxuLyogVHlwZXMgdGhhdCBmb3JtIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleHRlbmRlZCB0YWcgKi9cblxuZXhwb3J0IHR5cGUgT3ZlcnJpZGVzID0ge1xuICAvKiBWYWx1ZXMgZm9yIHByb3BlcnRpZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIGFueSBiYXNlIGEgdGFnIGlzIGV4dGVuZGVkIGZyb20gKi9cbiAgb3ZlcnJpZGU/OiBvYmplY3Q7XG4gIC8qIERlY2xhcmF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgbmV3IHByb3BlcnRpZXMgaW4gdGhpcyB0YWcgZGVmaW5pdGlvbi4gKi9cbiAgZGVjbGFyZT86IG9iamVjdDtcbiAgLyogRGVjbGFyYXRpb24gYW5kIGRlZmF1bHQgdmFsdWVlcyBmb3Igbm93IHByb3BlcnRpZXMgdGhhdCBhcmUgYm94ZWQgYnkgZGVmaW5lSXRlcmFibGVQcm9wZXJ0aWVzICovXG4gIGl0ZXJhYmxlPzogeyBbazogc3RyaW5nXTogSXRlcmFibGVQcm9wZXJ0eVZhbHVlIH07XG4gIC8qIFNwZWNpZmljYXRpb24gb2YgdGhlIHR5cGVzIG9mIGVsZW1lbnRzIGJ5IElEIHRoYXQgYXJlIGNvbnRhaW5lZCBieSB0aGlzIHRhZyAqL1xuICBpZHM/OiB7IFtpZDogc3RyaW5nXTogVGFnQ3JlYXRvckZ1bmN0aW9uPGFueT47IH07XG4gIC8qIFN0YXRpYyBDU1MgcmVmZXJlbmNlZCBieSB0aGlzIHRhZyAqL1xuICBzdHlsZXM/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUYWdDcmVhdG9yRm9ySURTPEkgZXh0ZW5kcyBOb25OdWxsYWJsZTxPdmVycmlkZXNbJ2lkcyddPj4ge1xuICA8Y29uc3QgSyBleHRlbmRzIGtleW9mIEk+KFxuICAgIGF0dHJzOnsgaWQ6IEsgfSAmIEV4Y2x1ZGU8UGFyYW1ldGVyczxJW0tdPlswXSwgQ2hpbGRUYWdzPixcbiAgICAuLi5jaGlsZHJlbjogQ2hpbGRUYWdzW11cbiAgKTogUmV0dXJuVHlwZTxJW0tdPlxufVxuXG50eXBlIElEUzxJIGV4dGVuZHMgT3ZlcnJpZGVzWydpZHMnXT4gPSBJIGV4dGVuZHMgTm9uTnVsbGFibGU8T3ZlcnJpZGVzWydpZHMnXT4gPyB7XG4gIGlkczoge1xuICAgIFtKIGluIGtleW9mIEldOiBSZXR1cm5UeXBlPElbSl0+O1xuICB9ICYgVGFnQ3JlYXRvckZvcklEUzxJPlxufSA6IHsgaWRzOiB7fSB9XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdGVkID0ge1xuICBjb25zdHJ1Y3RlZDogKCkgPT4gKENoaWxkVGFncyB8IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkIHwgQ2hpbGRUYWdzPiB8IEl0ZXJhYmxlVHlwZTx2b2lkIHwgQ2hpbGRUYWdzPik7XG59XG5cbi8vIEluZmVyIHRoZSBlZmZlY3RpdmUgc2V0IG9mIGF0dHJpYnV0ZXMgZnJvbSBhbiBFeFRhZ0NyZWF0b3JcbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPFQgZXh0ZW5kcyBFeFRhZ0NyZWF0b3I8YW55Pj4gPSBUIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGluZmVyIEJhc2VBdHRycz5cbiAgPyBCYXNlQXR0cnNcbiAgOiBuZXZlclxuXG4vLyBJbmZlciB0aGUgZWZmZWN0aXZlIHNldCBvZiBpdGVyYWJsZSBhdHRyaWJ1dGVzIGZyb20gdGhlIF9hbmNlc3RvcnNfIG9mIGFuIEV4VGFnQ3JlYXRvclxudHlwZSBCYXNlSXRlcmFibGVzPEJhc2U+ID1cbiAgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxpbmZlciBfQmFzZSwgaW5mZXIgU3VwZXIsIGluZmVyIFN1cGVyRGVmcyBleHRlbmRzIE92ZXJyaWRlcywgaW5mZXIgX1N0YXRpY3M+XG4gID8gQmFzZUl0ZXJhYmxlczxTdXBlcj4gZXh0ZW5kcyBuZXZlclxuICAgID8gU3VwZXJEZWZzWydpdGVyYWJsZSddIGV4dGVuZHMgb2JqZWN0XG4gICAgICA/IFN1cGVyRGVmc1snaXRlcmFibGUnXVxuICAgICAgOiB7fVxuICAgIDogQmFzZUl0ZXJhYmxlczxTdXBlcj4gJiBTdXBlckRlZnNbJ2l0ZXJhYmxlJ11cbiAgOiBuZXZlclxuXG4vLyBXb3JrIG91dCB0aGUgdHlwZXMgb2YgYWxsIHRoZSBub24taXRlcmFibGUgcHJvcGVydGllcyBvZiBhbiBFeFRhZ0NyZWF0b3JcbnR5cGUgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCBleHRlbmRzIE92ZXJyaWRlcywgQmFzZSBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+PiA9XG4gIERbJ2RlY2xhcmUnXVxuICAmIERbJ292ZXJyaWRlJ11cbiAgJiBJRFM8RFsnaWRzJ10+XG4gICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgRFsnaXRlcmFibGUnXT5cblxudHlwZSBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gQmFzZUl0ZXJhYmxlczxCYXNlPiAmIERbJ2l0ZXJhYmxlJ11cblxuZXhwb3J0IGNvbnN0IGNhbGxTdGFja1N5bWJvbCA9IFN5bWJvbCgnY2FsbFN0YWNrJyk7XG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9yQ2FsbFN0YWNrIGV4dGVuZHMgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgW2NhbGxTdGFja1N5bWJvbF0/OiBPdmVycmlkZXNbXTtcbiAgW2s6IHN0cmluZ106IHVua25vd25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRUYWdGdW5jdGlvbiB7IChhdHRyczogQ29uc3RydWN0b3JDYWxsU3RhY2sgfCBDaGlsZFRhZ3MsIC4uLmNoaWxkcmVuOiBDaGlsZFRhZ3NbXSk6IEVsZW1lbnQgfVxuXG5pbnRlcmZhY2UgSW5zdGFuY2VVbmlxdWVJRCB7IFtVbmlxdWVJRF06IHN0cmluZyB9XG5leHBvcnQgdHlwZSBJbnN0YW5jZTxUID0gSW5zdGFuY2VVbmlxdWVJRD4gPSBJbnN0YW5jZVVuaXF1ZUlEICYgVFxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2UgZXh0ZW5kcyBFeHRlbmRUYWdGdW5jdGlvbiB7XG4gIHN1cGVyOiBUYWdDcmVhdG9yPEVsZW1lbnQ+O1xuICBkZWZpbml0aW9uOiBPdmVycmlkZXM7XG4gIHZhbHVlT2Y6ICgpID0+IHN0cmluZztcbiAgZXh0ZW5kZWQ6ICh0aGlzOiBUYWdDcmVhdG9yPEVsZW1lbnQ+LCBfb3ZlcnJpZGVzOiBPdmVycmlkZXMgfCAoKGluc3RhbmNlPzogSW5zdGFuY2UpID0+IE92ZXJyaWRlcykpID0+IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbmludGVyZmFjZSBUYWdDb25zdHVjdG9yIHtcbiAgY29uc3RydWN0b3I6IEV4dGVuZFRhZ0Z1bmN0aW9uSW5zdGFuY2U7XG59XG5cbnR5cGUgQ29tYmluZWRUaGlzVHlwZTxEIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID1cbiAgVGFnQ29uc3R1Y3RvciAmXG4gIFJlYWRXcml0ZUF0dHJpYnV0ZXM8XG4gICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPEQsIEJhc2U+PlxuICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4sXG4gICAgRFsnZGVjbGFyZSddXG4gICAgJiBEWydvdmVycmlkZSddXG4gICAgJiBDb21iaW5lZEl0ZXJhYmxlUHJvcGVydGllczxELCBCYXNlPlxuICAgICYgT21pdDxUYWdDcmVhdG9yQXR0cmlidXRlczxCYXNlPiwga2V5b2YgQ29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RCwgQmFzZT4+XG4gID5cblxudHlwZSBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzLCBCYXNlIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4+ID0gUGlja1R5cGU8XG4gIERlZmluaXRpb25zWydkZWNsYXJlJ11cbiAgJiBEZWZpbml0aW9uc1snb3ZlcnJpZGUnXVxuICAmIFRhZ0NyZWF0b3JBdHRyaWJ1dGVzPEJhc2U+LFxuICBhbnlcbj5cblxuLy8gYHRoaXNgIGluIHRoaXMuZXh0ZW5kZWQoLi4uKSBpcyBCYXNlQ3JlYXRvclxuaW50ZXJmYWNlIEV4dGVuZGVkVGFnIHtcbiAgPFxuICAgIEJhc2VDcmVhdG9yIGV4dGVuZHMgRXhUYWdDcmVhdG9yPGFueT4sXG4gICAgU3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICBEZWZpbml0aW9ucyBleHRlbmRzIE92ZXJyaWRlcyA9IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPyBTdXBwbGllZERlZmluaXRpb25zIDoge30sXG4gICAgVGFnSW5zdGFuY2UgZXh0ZW5kcyBJbnN0YW5jZVVuaXF1ZUlEID0gSW5zdGFuY2VVbmlxdWVJRFxuICA+KHRoaXM6IEJhc2VDcmVhdG9yLCBfOiAoaW5zdDpUYWdJbnN0YW5jZSkgPT4gU3VwcGxpZWREZWZpbml0aW9ucyAmIFRoaXNUeXBlPENvbWJpbmVkVGhpc1R5cGU8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj4pXG4gIDogQ2hlY2tDb25zdHJ1Y3RlZFJldHVybjxTdXBwbGllZERlZmluaXRpb25zLFxuICAgICAgQ2hlY2tQcm9wZXJ0eUNsYXNoZXM8QmFzZUNyZWF0b3IsIERlZmluaXRpb25zLFxuICAgICAgRXhUYWdDcmVhdG9yPFxuICAgICAgICBJdGVyYWJsZVByb3BlcnRpZXM8Q29tYmluZWRJdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPj5cbiAgICAgICAgJiBDb21iaW5lZE5vbkl0ZXJhYmxlUHJvcGVydGllczxEZWZpbml0aW9ucywgQmFzZUNyZWF0b3I+LFxuICAgICAgICBCYXNlQ3JlYXRvcixcbiAgICAgICAgRGVmaW5pdGlvbnMsXG4gICAgICAgIFN0YXRpY1JlZmVyZW5jZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPlxuICAgICAgPlxuICAgID5cbiAgPlxuXG4gIDxcbiAgICBCYXNlQ3JlYXRvciBleHRlbmRzIEV4VGFnQ3JlYXRvcjxhbnk+LFxuICAgIFN1cHBsaWVkRGVmaW5pdGlvbnMsXG4gICAgRGVmaW5pdGlvbnMgZXh0ZW5kcyBPdmVycmlkZXMgPSBTdXBwbGllZERlZmluaXRpb25zIGV4dGVuZHMgT3ZlcnJpZGVzID8gU3VwcGxpZWREZWZpbml0aW9ucyA6IHt9XG4gID4odGhpczogQmFzZUNyZWF0b3IsIF86IFN1cHBsaWVkRGVmaW5pdGlvbnMgJiBUaGlzVHlwZTxDb21iaW5lZFRoaXNUeXBlPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+KVxuICA6IENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucyxcbiAgICAgIENoZWNrUHJvcGVydHlDbGFzaGVzPEJhc2VDcmVhdG9yLCBEZWZpbml0aW9ucyxcbiAgICAgIEV4VGFnQ3JlYXRvcjxcbiAgICAgICAgSXRlcmFibGVQcm9wZXJ0aWVzPENvbWJpbmVkSXRlcmFibGVQcm9wZXJ0aWVzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj4+XG4gICAgICAgICYgQ29tYmluZWROb25JdGVyYWJsZVByb3BlcnRpZXM8RGVmaW5pdGlvbnMsIEJhc2VDcmVhdG9yPixcbiAgICAgICAgQmFzZUNyZWF0b3IsXG4gICAgICAgIERlZmluaXRpb25zLFxuICAgICAgICBTdGF0aWNSZWZlcmVuY2VzPERlZmluaXRpb25zLCBCYXNlQ3JlYXRvcj5cbiAgICAgID5cbiAgICA+XG4gID5cbn1cblxudHlwZSBDaGVja0lzSXRlcmFibGVQcm9wZXJ0eVZhbHVlPFQsIFByZWZpeCBleHRlbmRzIHN0cmluZyA9ICcnPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgPyBuZXZlciAvLyBUaGlzIGlzbid0IGEgcHJvYmxlbSBhcyBpdCdzIGFuIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVcbiAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBGdW5jdGlvblxuICAgID8geyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gfSAvLyBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlIGRvZXNuJ3QgYWxsb3cgRnVuY3Rpb25zXG4gICAgOiBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBvYmplY3QgLy8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZSBhbGxvd3Mgb2JqZWN0cyBpZiB0aGV5IGFyZSBhcmUgbWFwcyBvZiBJdGVyYWJsZVByb3BlcnR5UHJpbWl0aXZlc1xuICAgICAgPyBFeGNsdWRlPFRbS10sIHVuZGVmaW5lZD4gZXh0ZW5kcyBBcnJheTxpbmZlciBaPiAvLyAuLi4ub3IgYXJyYXlzIG9mIEl0ZXJhYmxlUHJvcGVydHlQcmltaXRpdmVzXG4gICAgICAgID8gWiBleHRlbmRzIEl0ZXJhYmxlUHJvcGVydHlWYWx1ZSA/IG5ldmVyIDogeyBbUCBpbiBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfWBdOiBFeGNsdWRlPFpbXSwgdW5kZWZpbmVkPiB9Ly8gSWYgaXQncyBhbiBhcnJheW0gY2hlY2sgdGhlIGFycmF5IG1lbWJlciB1bmlvbiBpcyBhbHNvIGFzc2lnbmFibGUgdG8gSXRlcmFibGVQcm9wZXJ0eVByaW1pdGl2ZVxuICAgICAgICA6IENoZWNrSXNJdGVyYWJsZVByb3BlcnR5VmFsdWU8RXhjbHVkZTxUW0tdLCB1bmRlZmluZWQ+LCBgJHtQcmVmaXh9JHtLICYgc3RyaW5nfS5gPlxuICAgICAgOiB7IFtQIGluIGAke1ByZWZpeH0ke0sgJiBzdHJpbmd9YF06IEV4Y2x1ZGU8VFtLXSwgdW5kZWZpbmVkPiB9XG59W2tleW9mIFRdIGV4dGVuZHMgaW5mZXIgT1xuICA/IHsgW0sgaW4ga2V5b2YgT106IE9bS10gfVxuICA6IG5ldmVyO1xuXG50eXBlIENoZWNrQ29uc3RydWN0ZWRSZXR1cm48U3VwcGxpZWREZWZpbml0aW9ucywgUmVzdWx0PiA9XG4gIFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyB7IGNvbnN0cnVjdGVkOiBhbnkgfVxuICA/IFN1cHBsaWVkRGVmaW5pdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RlZFxuICAgID8gUmVzdWx0XG4gICAgOiB7IFwiYGNvbnN0cnVjdGVkYCBkb2VzIG5vdCByZXR1cm4gQ2hpbGRUYWdzXCI6IFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2NvbnN0cnVjdGVkJ10gfVxuICA6IEV4Y2Vzc0tleXM8U3VwcGxpZWREZWZpbml0aW9ucywgT3ZlcnJpZGVzICYgQ29uc3RydWN0ZWQ+IGV4dGVuZHMgbmV2ZXJcbiAgICA/IFJlc3VsdFxuICAgIDogU3VwcGxpZWREZWZpbml0aW9ucyBleHRlbmRzIHsgaXRlcmFibGU6IGFueSB9XG4gICAgICA/IHsgXCJUaGUgZXh0ZW5kZWQgdGFnIGRlZmludGlvbiBjb250YWlucyBub24taXRlcmFibGUgdHlwZXNcIjogRXhjbHVkZTxDaGVja0lzSXRlcmFibGVQcm9wZXJ0eVZhbHVlPFN1cHBsaWVkRGVmaW5pdGlvbnNbJ2l0ZXJhYmxlJ10+LCB1bmRlZmluZWQ+IH1cbiAgICAgIDogeyBcIlRoZSBleHRlbmRlZCB0YWcgZGVmaW50aW9uIGNvbnRhaW5zIHVua25vd24gb3IgaW5jb3JyZWN0bHkgdHlwZWQga2V5c1wiOiBrZXlvZiBFeGNlc3NLZXlzPFN1cHBsaWVkRGVmaW5pdGlvbnMsIE92ZXJyaWRlcyAmIENvbnN0cnVjdGVkPiB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnQ3JlYXRpb25PcHRpb25zIHtcbiAgZGVidWdnZXI/OiBib29sZWFuXG59XG5cbnR5cGUgUmVUeXBlZEV2ZW50SGFuZGxlcnM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMga2V5b2YgR2xvYmFsRXZlbnRIYW5kbGVyc1xuICAgID8gRXhjbHVkZTxHbG9iYWxFdmVudEhhbmRsZXJzW0tdLCBudWxsPiBleHRlbmRzIChlOiBpbmZlciBFKT0+aW5mZXIgUlxuICAgICAgPyAoKGU6IEUpPT5SKSB8IG51bGxcbiAgICAgIDogVFtLXVxuICAgIDogVFtLXVxufVxuXG50eXBlIEFzeW5jQXR0cjxYPiA9IEFzeW5jUHJvdmlkZXI8WD4gfCBQcm9taXNlTGlrZTxBc3luY1Byb3ZpZGVyPFg+IHwgWD5cbnR5cGUgUG9zc2libHlBc3luYzxYPiA9IFtYXSBleHRlbmRzIFtvYmplY3RdIC8qIE5vdCBcIm5ha2VkXCIgdG8gcHJldmVudCB1bmlvbiBkaXN0cmlidXRpb24gKi9cbiAgPyBYIGV4dGVuZHMgQXN5bmNQcm92aWRlcjxpbmZlciBVPlxuICAgID8gWCBleHRlbmRzIChBc3luY1Byb3ZpZGVyPFU+ICYgVSlcbiAgICAgID8gVSB8IEFzeW5jQXR0cjxVPiAvLyBpdGVyYWJsZSBwcm9wZXJ0eVxuICAgICAgOiBYIHwgUHJvbWlzZUxpa2U8WD4gLy8gc29tZSBvdGhlciBBc3luY1Byb3ZpZGVyXG4gICAgOiBYIGV4dGVuZHMgKGFueVtdIHwgRnVuY3Rpb24pXG4gICAgICA/IFggfCBBc3luY0F0dHI8WD4gIC8vIEFycmF5IG9yIEZ1bmN0aW9uLCB3aGljaCBjYW4gYmUgcHJvdmlkZWQgYXN5bmNcbiAgICAgIDogeyBbSyBpbiBrZXlvZiBYXT86IFBvc3NpYmx5QXN5bmM8WFtLXT4gfSB8IFBhcnRpYWw8WD4gfCBBc3luY0F0dHI8UGFydGlhbDxYPj4gLy8gT3RoZXIgb2JqZWN0IC0gcGFydGlhbGx5LCBwb3NzaWJsZSBhc3luY1xuICA6IFggfCBBc3luY0F0dHI8WD4gLy8gU29tZXRoaW5nIGVsc2UgKG51bWJlciwgZXRjKSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGFzeW5jXG5cbnR5cGUgUmVhZFdyaXRlQXR0cmlidXRlczxFLCBCYXNlID0gRT4gPSBFIGV4dGVuZHMgeyBhdHRyaWJ1dGVzOiBhbnkgfVxuICA/IChPbWl0PEUsICdhdHRyaWJ1dGVzJz4gJiB7XG4gICAgZ2V0IGF0dHJpYnV0ZXMoKTogTmFtZWROb2RlTWFwO1xuICAgIHNldCBhdHRyaWJ1dGVzKHY6IFBvc3NpYmx5QXN5bmM8T21pdDxCYXNlLCdhdHRyaWJ1dGVzJz4+KTtcbiAgfSlcbiAgOiAoT21pdDxFLCAnYXR0cmlidXRlcyc+KVxuXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yQXJnczxBPiA9IFtdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnNdIHwgW0EgJiBUYWdDcmVhdGlvbk9wdGlvbnMsIC4uLkNoaWxkVGFnc1tdXSB8IENoaWxkVGFnc1tdXG4vKiBBIFRhZ0NyZWF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgdGFrZXMgYXR0cmlidXRlcyAmIGNoaWxkcmVuLCBhbmQgY3JlYXRlcyB0aGUgdGFncy5cbiAgVGhlIGF0dHJpYnV0ZXMgYXJlIFBvc3NpYmx5QXN5bmMuIFRoZSByZXR1cm4gaGFzIGBjb25zdHJ1Y3RvcmAgc2V0IHRvIHRoaXMgZnVuY3Rpb24gKHNpbmNlIGl0IGluc3RhbnRpYXRlZCBpdClcbiovXG5leHBvcnQgdHlwZSBUYWdDcmVhdG9yRnVuY3Rpb248QmFzZSBleHRlbmRzIG9iamVjdD4gPSAoLi4uYXJnczogVGFnQ3JlYXRvckFyZ3M8UG9zc2libHlBc3luYzxCYXNlPiAmIFRoaXNUeXBlPEJhc2U+PikgPT4gUmVhZFdyaXRlQXR0cmlidXRlczxCYXNlPlxuXG4vKiBBIFRhZ0NyZWF0b3IgaXMgVGFnQ3JlYXRvckZ1bmN0aW9uIGRlY29yYXRlZCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcy4gVGhlIFN1cGVyICYgU3RhdGljcyBhcmdzIGFyZSBvbmx5XG5ldmVyIHNwZWNpZmllZCBieSBFeHRlbmRlZFRhZyAoaW50ZXJuYWxseSksIGFuZCBzbyBpcyBub3QgZXhwb3J0ZWQgKi9cbnR5cGUgRXhUYWdDcmVhdG9yPEJhc2UgZXh0ZW5kcyBvYmplY3QsXG4gIFN1cGVyIGV4dGVuZHMgKHVua25vd24gfCBFeFRhZ0NyZWF0b3I8YW55PikgPSB1bmtub3duLFxuICBTdXBlckRlZnMgZXh0ZW5kcyBPdmVycmlkZXMgPSB7fSxcbiAgU3RhdGljcyA9IHt9LFxuPiA9IFRhZ0NyZWF0b3JGdW5jdGlvbjxSZVR5cGVkRXZlbnRIYW5kbGVyczxCYXNlPj4gJiB7XG4gIC8qIEl0IGNhbiBhbHNvIGJlIGV4dGVuZGVkICovXG4gIGV4dGVuZGVkOiBFeHRlbmRlZFRhZ1xuICAvKiBJdCBpcyBiYXNlZCBvbiBhIFwic3VwZXJcIiBUYWdDcmVhdG9yICovXG4gIHN1cGVyOiBTdXBlclxuICAvKiBJdCBoYXMgYSBmdW5jdGlvbiB0aGF0IGV4cG9zZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHRhZ3MgaXQgY3JlYXRlcyBhbmQgaXRzIHN1cGVyICovXG4gIGRlZmluaXRpb24/OiBPdmVycmlkZXMgJiBJbnN0YW5jZVVuaXF1ZUlEOyAvKiBDb250YWlucyB0aGUgZGVmaW5pdGlvbnMgJiBVbmlxdWVJRCBmb3IgYW4gZXh0ZW5kZWQgdGFnLiB1bmRlZmluZWQgZm9yIGJhc2UgdGFncyAqL1xuICAvKiBJdCBoYXMgYSBuYW1lIChzZXQgdG8gYSBjbGFzcyBvciBkZWZpbml0aW9uIGxvY2F0aW9uKSwgd2hpY2ggaXMgaGVscGZ1bCB3aGVuIGRlYnVnZ2luZyAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIC8qIENhbiB0ZXN0IGlmIGFuIGVsZW1lbnQgd2FzIGNyZWF0ZWQgYnkgdGhpcyBmdW5jdGlvbiBvciBhIGJhc2UgdGFnIGZ1bmN0aW9uICovXG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdKGVsdDogYW55KTogYm9vbGVhbjtcbn0gJiBJbnN0YW5jZVVuaXF1ZUlEICZcbi8vIGBTdGF0aWNzYCBoZXJlIGlzIHRoYXQgc2FtZSBhcyBTdGF0aWNSZWZlcmVuY2VzPFN1cGVyLCBTdXBlckRlZnM+LCBidXQgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBicmVha3MgVFNcbi8vIHNvIHdlIGNvbXB1dGUgdGhlIFN0YXRpY3Mgb3V0c2lkZSB0aGlzIHR5cGUgZGVjbGFyYXRpb24gYXMgcGFzcyB0aGVtIGFzIGEgcmVzdWx0XG5TdGF0aWNzXG5cbmV4cG9ydCB0eXBlIFRhZ0NyZWF0b3I8QmFzZSBleHRlbmRzIG9iamVjdD4gPSBFeFRhZ0NyZWF0b3I8QmFzZSwgbmV2ZXIsIG5ldmVyLCB7fT5cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NPLE1BQU0sUUFB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SSxDQUFDLEtBQUssYUFBYTtBQUNyQixrQkFBUSxJQUFJLElBQUk7QUFDaEIsZUFBSyxLQUFLLFVBQVU7QUFFcEIsZ0JBQU0sYUFBYSxTQUFTLElBQUksSUFBSTtBQUNwQyxjQUFJLFlBQVk7QUFDZCxxQkFBUyxPQUFPLElBQUk7QUFDcEIsdUJBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxZQUFZLFFBQVEsRUFBRyxLQUFJO0FBQUUsZ0JBQUUsS0FBSyxJQUFJO0FBQUEsWUFBRSxTQUFTLElBQUk7QUFDN0UsdUJBQVEsS0FBSywyQ0FBMkMsTUFBTSxHQUFHLFFBQVEsSUFBSSxDQUFDO0FBQUEsWUFDaEY7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxpQkFBaUIsQ0FBQyxjQUFjO0FBQ2xDLGdCQUFVLFFBQVEsU0FBVSxHQUFHO0FBQzdCLFlBQUksRUFBRSxTQUFTLGVBQWUsRUFBRSxhQUFhO0FBQzNDLGVBQUssRUFBRSxZQUFZO0FBQUEsTUFDdkIsQ0FBQztBQUFBLElBQ0gsQ0FBQyxFQUFFLFFBQVEsTUFBTSxFQUFFLFNBQVMsTUFBTSxXQUFXLEtBQUssQ0FBQztBQUVuRCxXQUFPO0FBQUEsTUFDTCxJQUFJLEdBQVE7QUFBRSxlQUFPLFFBQVEsSUFBSSxDQUFDO0FBQUEsTUFBRTtBQUFBLE1BQ3BDLElBQUksR0FBUTtBQUFFLGVBQU8sUUFBUSxJQUFJLENBQUM7QUFBQSxNQUFFO0FBQUEsTUFDcEMsa0JBQWtCLEdBQVMsTUFBYztBQUN2QyxlQUFPLFNBQVMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJO0FBQUEsTUFDbEM7QUFBQSxNQUNBLFVBQVUsR0FBVyxNQUF1QixTQUE4QjtBQUN4RSxZQUFJLFNBQVM7QUFDWCxZQUFFLFFBQVEsQ0FBQUMsT0FBSztBQUNiLGtCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQyxLQUFLLG9CQUFJLElBQStCO0FBQ2xFLHFCQUFTLElBQUlBLElBQUdDLElBQUc7QUFDbkIsWUFBQUEsS0FBSSxJQUFJLE1BQU0sT0FBTztBQUFBLFVBQ3ZCLENBQUM7QUFBQSxRQUNILE9BQ0s7QUFDSCxZQUFFLFFBQVEsQ0FBQUQsT0FBSztBQUNiLGtCQUFNQyxPQUFNLFNBQVMsSUFBSUQsRUFBQztBQUMxQixnQkFBSUMsTUFBSztBQUNQLGNBQUFBLEtBQUksT0FBTyxJQUFJO0FBQ2Ysa0JBQUksQ0FBQ0EsS0FBSTtBQUNQLHlCQUFTLE9BQU9ELEVBQUM7QUFBQSxZQUNyQjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInYiLCAiYSIsICJyZXN1bHQiLCAiZXgiLCAiaXIiLCAib25jZSIsICJtZXJnZWQiLCAiciIsICJpZCIsICJ1bmlxdWUiLCAibiIsICJjaGlsZHJlbiIsICJlIiwgIm1hcCJdCn0K
