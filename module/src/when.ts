import { isPromiseLike } from './deferred.js';
import { deferred } from "./deferred.js";
import { PushIterator, pushIterator, iterableHelpers, asyncExtras, merge, AsyncExtraIterable } from "./iterators.js";

/*
  `when(....)` is both an AsyncIterable of the events it can generate by observation, 
  and a function that can map those events to a specified type, eg:
  
  this.when('keyup:#elemet') => AsyncIterable<KeyboardEvent>
  this.when('#elemet')(e => e.target) => AsyncIterable<EventTarget>
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


type EventAttribute = `${keyof GlobalEventHandlersEventMap}`
type CSSIdentifier = `${"." | "#"}${string}` | `[${string}]`

/* ValidWhenSelectors are:
    @start
    @ready
    event:selector
    event           "this" element, event type='event'
    selector        specificed selectors, implies "change" event
*/    

export type ValidWhenSelector = `${keyof SpecialWhenEvents}`
  | `${EventAttribute}:${CSSIdentifier}`
  | EventAttribute
  | CSSIdentifier;

type IsValidWhenSelector<S>
  = S extends ValidWhenSelector ? S : never;

type ExtractEventNames<S>
  = S extends keyof SpecialWhenEvents ? S
  : S extends `${infer V}:${infer L extends CSSIdentifier}`
  ? EventNameUnion<V> extends never ? never : EventNameUnion<V>
  : S extends `${infer L extends CSSIdentifier}`
  ? 'change'
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
          if (ev.target instanceof Node) {
            if (selector) {
              const nodes = container.querySelectorAll(selector);
              for (const n of nodes) {
                if ((ev.target === n || n.contains(ev.target)) && container.contains(n))
                  push.push(ev)
              }
            } else {
              if ((ev.target === container || container.contains(ev.target)))
                push.push(ev)
            }
          }
        }
      } catch (ex) {
        console.warn('docEventHandler', ex);
      }
    }
  }
}

function isCSSSelector(s: string): s is CSSIdentifier {
  return Boolean(s && (s.startsWith('#') || s.startsWith('.') || (s.startsWith('[') && s.endsWith(']'))));
}

function parseWhenSelector<EventName extends string>(what: IsValidWhenSelector<EventName>): undefined | [CSSIdentifier | null, keyof GlobalEventHandlersEventMap] {
  const parts = what.split(':');
  if (parts.length === 1) {
    if (isCSSSelector(parts[0]))
      return [parts[0],"change"];
    return [null, parts[0] as keyof GlobalEventHandlersEventMap];
  } 
  if (parts.length === 2) {
    if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
    return [parts[1], parts[0] as keyof GlobalEventHandlersEventMap]
  }
  return undefined;
}

function doThrow(message: string):never {
  throw new Error(message);
}

function whenEvent<EventName extends string>(container: Element, what: IsValidWhenSelector<EventName>) {
  const [selector, eventName] = parseWhenSelector(what) ?? doThrow("Invalid WhenSelector: "+what);

  if (!eventObservations.has(eventName)) {
    document.addEventListener(eventName, docEventHandler, {
      passive: true,
      capture: true
    });
    eventObservations.set(eventName, new Set());
  }

  const push = pushIterator<GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]>(() => eventObservations.get(eventName)?.delete(details));
  const details: EventObservation<Exclude<ExtractEventNames<EventName>, keyof SpecialWhenEvents>> = {
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

  return Object.assign(iterableHelpers(mappableAsyncIterable as unknown as AsyncIterable<A>), {
    [Symbol.asyncIterator]: () => src[Symbol.asyncIterator]()
  }) as MappableIterable<A>;
}

function isValidWhenSelector(what: WhenParameters[number]): what is ValidWhenSelector {
  if (!what)
    throw new Error('Falsy async source will never be ready\n\n' + JSON.stringify(what));
  return typeof what === 'string' && what[0] !== '@' && Boolean(parseWhenSelector(what));
}

async function* once<T>(p: Promise<T>) {
  yield p;
}

export function when<S extends WhenParameters>(container: Element, ...sources: S): WhenReturn<S> {
  if (!sources || sources.length === 0) {
    return chainAsync(whenEvent(container, "change")) as unknown as WhenReturn<S>;
  }

  const iterators = sources.filter(what => typeof what !== 'string' || what[0] !== '@').map(what => typeof what === 'string'
    ? whenEvent(container, what)
    : what instanceof Element
      ? whenEvent(what, "change")
      : isPromiseLike(what)
        ? once(what)
        : what);

  if (sources.includes('@start')) {
    const start: AsyncIterableIterator<{}> = {
      [Symbol.asyncIterator]: () => start,
      next() {
        const d = deferred<IteratorReturnResult<{}>>();
        requestAnimationFrame(() => d.resolve({ done: true, value: {} }));
        return d;
      }
    };
    iterators.push(start);
  }

  if (sources.includes('@ready')) {
    const watchSelectors = sources.filter(isValidWhenSelector).map(what => parseWhenSelector(what)?.[0]);

    function isMissing(sel: CSSIdentifier | null | undefined): sel is CSSIdentifier {
      return Boolean(typeof sel === 'string' && !container.querySelector(sel));
    }

    const missing = watchSelectors.filter(isMissing);

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
