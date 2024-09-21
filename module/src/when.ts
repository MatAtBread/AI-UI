import { DEBUG, console, timeOutWarn } from './debug.js';
import { isPromiseLike } from './deferred.js';
import { iterableHelpers, merge, AsyncExtraIterable, queueIteratableIterator } from "./iterators.js";

/*
  `when(....)` is both an AsyncIterable of the events it can generate by observation,
  and a function that can map those events to a specified type, eg:

  this.when('keyup:#elemet') => AsyncIterable<KeyboardEvent>
  this.when('#elemet')(e => e.target) => AsyncIterable<EventTarget>
*/
// Varargs type passed to "when"
export type WhenParameters<IDS extends string = string> = ReadonlyArray<
  AsyncIterable<any>
  | ValidWhenSelector<IDS>
  | Element /* Implies "change" event */
  | Promise<any> /* Just gets wrapped in a single `yield` */
>;

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

type EmptyObject = Record<string | symbol | number, never>;

type SpecialWhenEvents = {
  "@start": EmptyObject,  // Always fires when referenced
  "@ready": EmptyObject   // Fires when all Element specified sources are mounted in the DOM
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
type CSSIdentifier<IDS extends string = string> = `#${IDS}` | `#${IDS}>` | `.${string}` | `[${string}]`

/* ValidWhenSelectors are:
    @start
    @ready
    event:selector
    event           "this" element, event type='event'
    selector        specificed selectors, implies "change" event
*/

export type ValidWhenSelector<IDS extends string = string> = `${keyof SpecialWhenEvents}`
  | `${EventAttribute}:${CSSIdentifier<IDS>}`
  | EventAttribute
  | CSSIdentifier<IDS>;

type IsValidWhenSelector<S>
  = S extends ValidWhenSelector ? S : never;

type ExtractEventNames<S>
  = S extends keyof SpecialWhenEvents ? S
  : S extends `${infer V}:${CSSIdentifier}`
  ? EventNameUnion<V> extends never ? never : EventNameUnion<V>
  : S extends CSSIdentifier
  ? 'change'
  : never;

type ExtractEvents<S> = WhenEvents[ExtractEventNames<S>];

/** when **/
type EventObservation<EventName extends keyof GlobalEventHandlersEventMap> = {
  push: (ev: GlobalEventHandlersEventMap[EventName])=>void;
  terminate: (ex: Error)=>void;
  container: Element
  selector: string | null;
  includeChildren: boolean;
};
const eventObservations = new WeakMap<DocumentFragment | Document, Map<keyof WhenEvents, Set<EventObservation<keyof GlobalEventHandlersEventMap>>>>();

function docEventHandler<EventName extends keyof GlobalEventHandlersEventMap>(this: DocumentFragment | Document, ev: GlobalEventHandlersEventMap[EventName]) {
  if (!eventObservations.has(this))
    eventObservations.set(this, new Map());

  const observations = eventObservations.get(this)!.get(ev.type as keyof GlobalEventHandlersEventMap);
  if (observations) {
    for (const o of observations) {
      try {
        const { push, terminate, container, selector, includeChildren } = o;
        if (!container.isConnected) {
          const msg = "Container `#" + container.id + ">" + (selector || '') + "` removed from DOM. Removing subscription";
          observations.delete(o);
          terminate(new Error(msg));
        } else {
          if (ev.target instanceof Node) {
            if (selector) {
              const nodes = container.querySelectorAll(selector);
              for (const n of nodes) {
                if ((includeChildren ? n.contains(ev.target) : ev.target === n) && container.contains(n))
                  push(ev)
              }
            } else {
              if (includeChildren ? container.contains(ev.target) : ev.target === container )
                push(ev)
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

function childless<T extends string | null>(sel: T): T extends null ? { includeChildren: true, selector: null } : { includeChildren: boolean, selector: T } {
  const includeChildren = !sel || !sel.endsWith('>')
  return { includeChildren, selector: includeChildren ? sel : sel.slice(0,-1) } as any;
}

function parseWhenSelector<EventName extends string>(what: IsValidWhenSelector<EventName>): undefined | [ReturnType<typeof childless>, keyof GlobalEventHandlersEventMap] {
  const parts = what.split(':');
  if (parts.length === 1) {
    if (isCSSSelector(parts[0]))
      return [childless(parts[0]),"change"];
    return [{ includeChildren: true, selector: null }, parts[0] as keyof GlobalEventHandlersEventMap];
  }
  if (parts.length === 2) {
    if (isCSSSelector(parts[1]) && !isCSSSelector(parts[0]))
    return [childless(parts[1]), parts[0] as keyof GlobalEventHandlersEventMap]
  }
  return undefined;
}

function doThrow(message: string):never {
  throw new Error(message);
}

function whenEvent<EventName extends string>(container: Element, what: IsValidWhenSelector<EventName>) {
  const [{ includeChildren, selector}, eventName] = parseWhenSelector(what) ?? doThrow("Invalid WhenSelector: "+what);

  if (!eventObservations.has(container.ownerDocument))
    eventObservations.set(container.ownerDocument, new Map());

  if (!eventObservations.get(container.ownerDocument)!.has(eventName)) {
    container.ownerDocument.addEventListener(eventName, docEventHandler, {
      passive: true,
      capture: true
    });
    eventObservations.get(container.ownerDocument)!.set(eventName, new Set());
  }

  const queue = queueIteratableIterator<GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]>(() => eventObservations.get(container.ownerDocument)?.get(eventName)?.delete(details));

  const details: EventObservation<keyof GlobalEventHandlersEventMap> = {
    push: queue.push,
    terminate(ex: Error) { queue.return?.(ex)},
    container,
    includeChildren,
    selector
  };

  containerAndSelectorsMounted(container, selector ? [selector] : undefined)
    .then(_ => eventObservations.get(container.ownerDocument)?.get(eventName)!.add(details));

  return queue.multi() ;
}

async function* neverGonnaHappen<Z>(): AsyncIterableIterator<Z> {
  await new Promise(() => {});
  yield undefined as Z; // Never should be executed
}

/* Syntactic sugar: chainAsync decorates the specified iterator so it can be mapped by
  a following function, or used directly as an iterable */
function chainAsync<A extends AsyncExtraIterable<X>, X>(src: A): MappableIterable<A> {
  function mappableAsyncIterable(mapper: Parameters<typeof src.map>[0]) {
    return src.map(mapper);
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
        start.next = () => Promise.resolve({ done: true, value: undefined })
        return Promise.resolve({ done: false, value: {} })
      }
    };
    iterators.push(start);
  }

  if (sources.includes('@ready')) {
    const watchSelectors = sources.filter(isValidWhenSelector).map(what => parseWhenSelector(what)?.[0]);

    function isMissing(sel: CSSIdentifier | string | null | undefined): sel is CSSIdentifier {
      return Boolean(typeof sel === 'string' && !container.querySelector(sel));
    }

    const missing = watchSelectors.map(w => w?.selector).filter(isMissing);

    let events: AsyncIterator<any, any, undefined> | undefined = undefined;
    const ai: AsyncIterableIterator<any> = {
      [Symbol.asyncIterator]() { return ai },
      throw(ex: any) {
        if (events?.throw) return events.throw(ex);
        return Promise.resolve({ done: true, value: ex });
      },
      return(v?: any) {
        if (events?.return) return events.return(v);
        return Promise.resolve({ done: true, value: v });
      },
      next() {
        if (events) return events.next();

        return containerAndSelectorsMounted(container, missing).then(() => {
          const merged = (iterators.length > 1)
          ? merge(...iterators)
          : iterators.length === 1
            ? iterators[0]
            : (neverGonnaHappen<WhenIteratedType<S>>());

          // Now everything is ready, we simply delegate all async ops to the underlying
          // merged asyncIterator "events"
          events = merged[Symbol.asyncIterator]();
          if (!events)
            return { done: true, value: undefined };

          return { done: false, value: {} };
        });
      }
    };
    return chainAsync(iterableHelpers(ai));
  }

  const merged = (iterators.length > 1)
    ? merge(...iterators)
    : iterators.length === 1
      ? iterators[0]
      : (neverGonnaHappen<WhenIteratedType<S>>());

  return chainAsync(iterableHelpers(merged));
}

function elementIsInDOM(elt: Element): Promise<void> {
  if (elt.isConnected)
    return Promise.resolve();

  return new Promise<void>(resolve => new MutationObserver((records, mutation) => {
    if (records.some(r => r.addedNodes?.length)) {
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

function containerAndSelectorsMounted(container: Element, selectors?: string[]) {
  if (selectors?.length)
    return Promise.all([
      allSelectorsPresent(container, selectors),
      elementIsInDOM(container)
    ]);
  return elementIsInDOM(container);
}

function allSelectorsPresent(container: Element, missing: string[]): Promise<void> {
  missing = missing.filter(sel => !container.querySelector(sel))
  if (!missing.length) {
    return Promise.resolve(); // Nothing is missing
  }

  const promise = new Promise<void>(resolve => new MutationObserver((records, mutation) => {
    if (records.some(r => r.addedNodes?.length)) {
      if (missing.every(sel => container.querySelector(sel))) {
        mutation.disconnect();
        resolve();
      }
    }
  }).observe(container, {
    subtree: true,
    childList: true
  }));

  /* debugging help: warn if waiting a long time for a selectors to be ready */
  if (DEBUG) {
    const stack = new Error().stack?.replace(/^Error/, "Missing selectors after 5 seconds:");
    const warnTimer = setTimeout(() => {
      console.warn(stack, missing);
    }, timeOutWarn);

    promise.finally(() => clearTimeout(warnTimer))
  }

  return promise;
}
