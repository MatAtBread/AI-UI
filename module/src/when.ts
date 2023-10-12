import { isPromiseLike } from './deferred.js';
import { deferred } from "./deferred.js";
import { PushIterator, pushIterator, withHelpers, asyncExtras, merge, AsyncExtraIterable } from "./iterators.js";

/*
  `when(....)` is both an AsyncIterable of the events it can generate by observation, 
  and a function that can map those events to a specified type, eg:
  
  this.when('#elemet(keyup)') => AsyncIterable<KeyboardEvent>
  this.when('#elemet(keyup)')(e => e.target) => AsyncIterable<EventTarget>
*/
// Varargs type passed to "when"
export type WhenParameters = (
  AsyncIterable<any>
  | ValidWhenSelector
  | Element /* Implies "change" event */
  | Promise<any> /* Just gets wrapped in a single `yield` */
)[];

// The Iterated type generated by "when", based on the parameters
type WhenIteratedType<S extends WhenParameters> =
  (Extract<S[number], AsyncIterable<any>> extends AsyncIterable<infer I> ? unknown extends I ? never : I : never)
  | ExtractEvents<Extract<S[number], string>>
  | (Extract<S[number], Element> extends never ? never : Event)

type MappableIterable<A extends AsyncIterable<any>> = 
  A extends AsyncIterable<infer T> ?
    A & AsyncExtraIterable<T> &
    (<R>(mapper: (value: A extends AsyncIterable<infer T> ? T : never) => R) => (AsyncExtraIterable<Awaited<R>>))
  : never;

// The extended iterator that supports async iterator mapping, chaining, etc  
export type WhenReturn<S extends WhenParameters> =
  MappableIterable<
    AsyncExtraIterable<
      WhenIteratedType<S>>>;

type SpecialWhenEvents = {
  "@start": { [k: string]: undefined },  // Always fires when referenced
  "@ready": { [k: string]: undefined }  // Fires when all Element specified sources are mounted in the DOM
};
type WhenEvents = GlobalEventHandlersEventMap & SpecialWhenEvents;
type EventNameList<T extends string> = T extends keyof WhenEvents
  ? T
  : T extends `${infer S extends keyof WhenEvents},${infer R}`
  ? EventNameList<R> extends never ? never : `${S},${EventNameList<R>}`
  : never;

type EventNameUnion<T extends string> = T extends keyof WhenEvents
  ? T
  : T extends `${infer S extends keyof WhenEvents},${infer R}`
  ? EventNameList<R> extends never ? never : S | EventNameList<R>
  : never;

type WhenElement = `#${string}` | `.${string}`;
type EventAttribute = `(${keyof GlobalEventHandlersEventMap})`
type CSSIdentifier = `${"." | "#"}${string}`
export type ValidWhenSelector = `${keyof SpecialWhenEvents}`
  | `${CSSIdentifier}${EventAttribute}`
  | EventAttribute
  | CSSIdentifier;

type NakedWhenElement<T extends WhenElement> =
  T extends (`${string}(${string}` | `${string})${string}`) ? never : T;

type IsValidWhenSelector<S>
  = S extends keyof SpecialWhenEvents ? S
  : S extends `${infer L}(${infer V})`
  ? EventNameUnion<V> extends never ? never : S
  : S extends `${infer L}(${string})`
  ? never
  : S extends `${infer L extends WhenElement}`
  ? NakedWhenElement<L> extends never ? never : S
  : never;

type ExtractEventNames<S>
  = S extends keyof SpecialWhenEvents ? S
  : S extends `${infer L}(${infer V})`
  ? EventNameUnion<V> extends never ? never : EventNameUnion<V>
  : S extends `${infer L}(${string})`
  ? never
  : S extends `${infer L extends WhenElement}`
  ? NakedWhenElement<L> extends never ? never : 'change'
  : never;

type ExtractEvents<S> = WhenEvents[ExtractEventNames<S>];

/** when **/
type EventObservation<EventName extends keyof GlobalEventHandlersEventMap> = {
  push: PushIterator<GlobalEventHandlersEventMap[EventName]>;
  container: Element
  selector: string | null
};
const eventObservations = new Map<keyof WhenEvents, Set<EventObservation<keyof GlobalEventHandlersEventMap>>>();

function docEventHandler<EventName extends keyof GlobalEventHandlersEventMap>(this: Document, ev: GlobalEventHandlersEventMap[EventName]) {
  const observations = eventObservations.get(ev.type as keyof GlobalEventHandlersEventMap);
  if (observations) {
    for (const o of observations) {
      try {
        const { push, container, selector } = o;
        if (!document.body.contains(container)) {
          const msg = "Container `#" + container.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
          observations.delete(o);
          push[Symbol.asyncIterator]().throw?.(new Error(msg));
        } else {
          if (selector) {
            const nodes = container.querySelectorAll(selector);
            for (const n of nodes) {
              //if (ev.target === n && container.contains(n))
              if ((ev.target === n || n.contains(ev.target as Node)) && container.contains(n))
                push.push(ev)
            }
          } else {
            if (ev.target === container)
              push.push(ev)
          }
        }
      } catch (ex) {
        console.warn('docEventHandler', ex);
      }
    }
  }
}

function whenEvent<EventName extends string>(container: Element, what: IsValidWhenSelector<EventName>) {
  const parts = what.match(/(.*)?\((.+)\)$/)?.slice(1, 3) || [what, 'change'];
  const [selector, eventName] = parts as [string, keyof GlobalEventHandlersEventMap];

  if (!eventObservations.has(eventName)) {
    document.addEventListener(eventName, docEventHandler, {
      passive: true,
      capture: true
    });
    eventObservations.set(eventName, new Set());
  }

  const push = pushIterator<GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]>(() => eventObservations.get(eventName)?.delete(details));
  const details: EventObservation<Exclude<ExtractEventNames<EventName>, '@start' | '@ready'>> = {
    push,
    container,
    selector: selector || null
  };
  eventObservations.get(eventName)!.add(details);
  return push;
}

async function* neverGonnaHappen<Z>(): AsyncIterableIterator<Z> {
  try {
    await new Promise(() => { });
    yield undefined as Z; // Never should be executed
  } catch (ex) {
    console.warn('neverGonnaHappen', ex);
  }
}

/* Syntactic sugar: chainAsync decorates the specified so it can be mapped by a following function, or
  used directly as an iterable */
function chainAsync<A extends AsyncIterable<X>, X>(src: A): MappableIterable<A> {
  function mappableAsyncIterable(mapper: Parameters<typeof asyncExtras.map>[0]) {
    return asyncExtras.map.call(src, mapper) as ReturnType<typeof asyncExtras.map>;
  }

  return Object.assign(withHelpers(mappableAsyncIterable as unknown as AsyncIterable<A>), {
    [Symbol.asyncIterator]: () => src[Symbol.asyncIterator]()
  }) as MappableIterable<A>;
}

function isValidWhenSelector(what: WhenParameters[number]): what is ValidWhenSelector {
  if (!what)
    throw new Error('Falsy async source will never be ready\n\n' + JSON.stringify(what));
  return typeof what === 'string' && what[0] !== '@';
}

async function* once<T>(p: Promise<T>) {
  yield p;
}

export function when<S extends WhenParameters>(container: Element, ...sources: S): WhenReturn<S> {
  if (!sources || sources.length === 0) {
    return chainAsync(whenEvent(container, "(change)")) as unknown as WhenReturn<S>;
  }

  const iterators = sources.filter(what => typeof what !== 'string' || what[0] !== '@').map(what => typeof what === 'string'
    ? whenEvent(container, what)
    : what instanceof Element
      ? whenEvent(what, "(change)")
      : isPromiseLike(what)
        ? once(what)
        : what);

  const start: AsyncIterableIterator<{}> = {
    [Symbol.asyncIterator]: () => start,
    next() {
      const d = deferred<IteratorReturnResult<{}>>();
      requestAnimationFrame(() => d.resolve({ done: true, value: {} }));
      return d;
    }
  };

  if (sources.includes('@start'))
    iterators.push(start)

  if (sources.includes('@ready')) {
    const watchSelectors = sources.filter(isValidWhenSelector).map(what => what.split('(')[0]);

    const missing = watchSelectors.filter(sel => !container.querySelector(sel));

    const ai: AsyncIterableIterator<any> = {
      [Symbol.asyncIterator]() { return ai },
      async next() {
        await Promise.all([
          allSelectorsPresent(container, missing),
          elementIsInDOM(container)
        ])

        const merged = (iterators.length > 1)
          ? merge(...iterators)
          : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen<WhenIteratedType<S>>());
        const events = merged[Symbol.asyncIterator]();
        ai.next = () => events.next();
        ai.return = (value: any) => events.return?.(value) ?? Promise.resolve({ done: true as const, value });
        ai.throw = (...args: any[]) => events.throw?.(args) ?? Promise.reject({ done: true as const, value: args[0] });

        return { done: false, value: {} };
      }
    };
    return chainAsync(ai);
  }

  const merged = (iterators.length > 1)
    ? merge(...iterators)
    : iterators.length === 1
      ? iterators[0]
      : (neverGonnaHappen<WhenIteratedType<S>>());

  return chainAsync(merged);
}

function elementIsInDOM(elt: Element): Promise<void> {
  if (document.body.contains(elt))
    return Promise.resolve();

  const d = deferred<void>();
  new MutationObserver((records, mutation) => {
    for (const record of records) {
      if (record.addedNodes?.length) {
        if (document.body.contains(elt)) {
          mutation.disconnect();
          d.resolve();
          return;
        }
      }
    }
  }).observe(document.body, {
    subtree: true,
    childList: true
  });
  return d;
}

function allSelectorsPresent(container: Element, missing: string[]): Promise<void> {
  if (!missing.length) {
    return Promise.resolve();
  }

  const d = deferred<void>();
  /* debugging help: warn if waiting a long time for a selectors to be ready *
    const stack = new Error().stack.replace(/^Error/, "Missing selectors after 5 seconds:");
    const warn = setTimeout(() => {
      console.warn(stack, missing);
    }, 5000);

    d.finally(() => clearTimeout(warn))
  }
  /*** */

  new MutationObserver((records, mutation) => {
    for (const record of records) {
      if (record.addedNodes?.length) {
        missing = missing.filter(sel => !container.querySelector(sel));
        if (!missing.length) {
          mutation.disconnect();
          d.resolve();
          return;
        }
      }
    }
  }).observe(container, {
    subtree: true,
    childList: true
  });
  return d;
}
