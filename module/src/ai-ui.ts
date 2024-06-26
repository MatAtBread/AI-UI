import { isPromiseLike } from './deferred.js';
import { Ignore, asyncIterator, defineIterableProperty, isAsyncIter, isAsyncIterator } from './iterators.js';
import { WhenParameters, WhenReturn, when } from './when.js';
import { ChildTags, Constructed, Instance, Overrides, TagCreator, TagCreatorFunction } from './tags.js';
import { DEBUG, console, timeOutWarn } from './debug.js';

/* Export useful stuff for users of the bundled code */
export { when } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags.js'
export * as Iterators from './iterators.js';

export const UniqueID = Symbol("Unique ID");

const logNode = DEBUG ? ((n: Node) => `"${'innerHTML' in n ? n.innerHTML : n.textContent}"`) : (n: Node)=>undefined;

/* A holder for commonProperties specified when `tag(...p)` is invoked, which are always
  applied (mixed in) when an element is created */
type TagFunctionOptions<OtherMembers extends {} = {}> = {
  commonProperties: OtherMembers
}

/* Members applied to EVERY tag created, even base tags */
interface PoElementMethods {
  get ids(): {}
  when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
  /* also
  set attributes(...possible attributes); // has to be enclosed by tag() to access assignProps
  */
}

// Support for https://www.npmjs.com/package/htm (or import htm from 'https://cdn.jsdelivr.net/npm/htm/dist/htm.module.js')
// Note: same signature as React.createElement
export interface CreateElement {
  // Support for htm, JSX, etc
  createElement(
    // "name" can a HTML tag string, an existing node (just returns itself), or a tag function
    name: TagCreatorFunction<Element> | Node | keyof HTMLElementTagNameMap,
    // The attributes used to initialise the node (if a string or function - ignore if it's already a node)
    attrs: any,
    // The children
    ...children: ChildTags[]): Node;
}

/* The interface that creates a set of TagCreators for the specified DOM tags */
interface TagLoader {
  nodes(...c: ChildTags[]): (Node | (/*P &*/ (Element & PoElementMethods)))[];
  UniqueID: typeof UniqueID

  /*
   Signatures for the tag loader. All params are optional in any combination,
   but must be in order:
      tag(
          ?nameSpace?: string,  // absent nameSpace implies HTML
          ?tags?: string[],     // absent tags defaults to all common HTML tags
          ?commonProperties?: CommonPropertiesConstraint // absent implies none are defined
      )

      eg:
        tags()  // returns TagCreators for all HTML tags
        tags(['div','button'], { myThing() {} })
        tags('http://namespace',['Foreign'], { isForeign: true })
  */

  <Tags extends keyof HTMLElementTagNameMap>(): { [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap>(tags: Tags[]): { [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(options: TagFunctionOptions<Q>): { [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap, Q extends {}>(tags: Tags[], options: TagFunctionOptions<Q>): { [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends string, Q extends {}>(nameSpace: null | undefined | '', tags: Tags[], options?: TagFunctionOptions<Q>): { [k in Tags]: TagCreator<Q & PoElementMethods & HTMLElement> } & CreateElement
  <Tags extends string, Q extends {}>(nameSpace: string, tags: Tags[], options?: TagFunctionOptions<Q>): Record<string, TagCreator<Q & PoElementMethods & Element>> & CreateElement
}

let idCount = 0;
const standandTags = [
  "a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button",
  "canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div",
  "dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head",
  "header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map",
  "mark","menu","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","picture","pre",
  "progress","q","rp","rt","ruby","s","samp","script","search","section","select","slot","small","source","span",
  "strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time",
  "title","tr","track","u","ul","var","video","wbr"
] as const;

const elementProtype = Object.getOwnPropertyDescriptors({
  get ids() {
    return getElementIdMap(this);
  },
  set ids(v: any) {
    throw new Error('Cannot set ids on ' + this.valueOf());
  },
  when: function (...what) {
    return when(this, ...what)
  }
} as PoElementMethods & ThisType<Element & PoElementMethods>);

const poStyleElt = document.createElement("STYLE");
poStyleElt.id = "--ai-ui-extended-tag-styles-";

function isChildTag(x: any): x is ChildTags {
  return typeof x === 'string'
    || typeof x === 'number'
    || typeof x === 'boolean'
    || x instanceof Node
    || x instanceof NodeList
    || x instanceof HTMLCollection
    || x === null
    || x === undefined
    // Can't actually test for the contained type, so we assume it's a ChildTag and let it fail at runtime
    || Array.isArray(x)
    || isPromiseLike(x)
    || isAsyncIter(x)
    || (typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function');
}

/* tag */
const callStackSymbol = Symbol('callStack');

export const tag = <TagLoader>function <Tags extends string,
  T1 extends (string | Tags[] | TagFunctionOptions<Q>),
  T2 extends (Tags[] | TagFunctionOptions<Q>),
  Q extends {}
>(
  _1: T1,
  _2: T2,
  _3?: TagFunctionOptions<Q>
): Record<string, TagCreator<Q & Element>> {
  type NamespacedElementBase = T1 extends string ? T1 extends '' ? HTMLElement : Element : HTMLElement;

  /* Work out which parameter is which. There are 6 variations:
    tag()                                           []
    tag(commonProperties)                           [object]
    tag(tags[])                                     [string[]]
    tag(tags[], commonProperties)                   [string[], object]
    tag(namespace | null, tags[])                   [string | null, string[]]
    tag(namespace | null, tags[], commonProperties) [string | null, string[], object]
  */
  const [nameSpace, tags, options] = (typeof _1 === 'string') || _1 === null
    ? [_1, _2 as Tags[], _3 as TagFunctionOptions<Q>]
    : Array.isArray(_1)
      ? [null, _1 as Tags[], _2 as TagFunctionOptions<Q>]
      : [null, standandTags, _1 as TagFunctionOptions<Q>];

  const removedNodes = mutationTracker(document,'removedNodes');

  const commonProperties = options?.commonProperties;
  /* Note: we use property defintion (and not object spread) so getters (like `ids`)
    are not evaluated until called */
  const tagPrototypes = Object.create(
    null,
    elementProtype
  );

  // We do this here and not in elementProtype as there's no syntax
  // to copy a getter/setter pair from another object
  Object.defineProperty(tagPrototypes, 'attributes', {
    ...Object.getOwnPropertyDescriptor(Element.prototype,'attributes'),
    set(this: Element, a: object) {
      if (isAsyncIter(a)) {
        const ai = isAsyncIterator(a) ? a : a[Symbol.asyncIterator]();
        const step = ()=> ai.next().then(
          ({ done, value }) => { assignProps(this, value); done || step() },
          ex => console.warn(ex));
        step();
      }
      else assignProps(this, a);
    }
  });

  if (commonProperties)
    deepDefine(tagPrototypes, commonProperties);

  function nodes(...c: ChildTags[]) {
    const appended: Node[] = [];
    (function children(c: ChildTags): void {
      if (c === undefined || c === null || c === Ignore)
        return;
      if (isPromiseLike(c)) {
        const g: ChildNode = DomPromiseContainer();
        appended.push(g);
        c.then(r => g.replaceWith(...nodes(r)),
          (x:any) => {
            console.warn(x,logNode(g));
            g.replaceWith(DyamicElementError({error: x}));
          }
        );
        return;
      }
      if (c instanceof Node) {
        appended.push(c);
        return;
      }

      // We have an interesting case here where an iterable String is an object with both Symbol.iterator
      // (inherited from the String prototype) and Symbol.asyncIterator (as it's been augmented by boxed())
      // but we're only interested in cases like HTMLCollection, NodeList, array, etc., not the fukny ones
      // It used to be after the isAsyncIter() test, but a non-AsyncIterator *may* also be a sync iterable
      // For now, we exclude (Symbol.asyncIterator in c) in this case.
      if (c && typeof c === 'object' && Symbol.iterator in c && !(Symbol.asyncIterator in c) && c[Symbol.iterator]) {
        for (const d of c) children(d);
        return;
      }

      if (isAsyncIter<ChildTags>(c)) {
        const insertionStack = DEBUG ? ('\n' + new Error().stack?.replace(/^Error: /, "Insertion :")) : '';
        const ap = isAsyncIterator(c) ? c : c[Symbol.asyncIterator]();
        // It's possible that this async iterator is a boxed object that also holds a value
        const unboxed = c.valueOf();
        const dpm = (unboxed === undefined || unboxed === c) ? [DomPromiseContainer()] : nodes(unboxed as ChildTags)
        appended.push(...dpm);

        let t = dpm;
        let notYetMounted = true;
        // DEBUG support
        let createdAt = Date.now() + timeOutWarn;
        const createdBy = DEBUG && new Error("Created by").stack;

        const error = (errorValue: any) => {
          const n = t.filter(n => Boolean(n?.parentNode)) as ChildNode[];
          if (n.length) {
            t = [DyamicElementError({error: errorValue})];
            n[0].replaceWith(...t); //appendBefore(n[0], ...t);
            n.slice(1).forEach(e => e?.parentNode!.removeChild(e));
          }
          else console.warn( "Can't report error", errorValue, createdBy, t.map(logNode));
          t = [];
          ap.return?.(error);
        }

        const update = (es: IteratorResult<ChildTags>) => {
          if (!es.done) {
            try {
              // ChildNode[], since we tested .parentNode
              const mounted = t.filter(e => e?.parentNode && e.isConnected);
              const n = notYetMounted ? t : mounted;
              if (mounted.length) notYetMounted = false;

              if (!n.length || t.every(e => removedNodes(e))) {
                // We're done - terminate the source quietly (ie this is not an exception as it's expected, but we're done)
                t = [];
                const msg = "Element(s) have been removed from the document: " + insertionStack;
                ap.return?.(new Error(msg));
                return;
              }

              if (DEBUG && notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                console.warn(`Async element not mounted after 5 seconds. If it is never mounted, it will leak.`,createdBy, t.map(logNode));
              }
              t = nodes(unbox(es.value) as ChildTags);
              // If the iterated expression yields no nodes, stuff in a DomPromiseContainer for the next iteration
              if (!t.length) t.push(DomPromiseContainer());
              (n[0] as ChildNode).replaceWith(...t);
              n.slice(1).forEach(e => !t.includes(e) && e.parentNode?.removeChild(e));
              ap.next().then(update).catch(error);
            } catch (ex) {
              // Something went wrong. Terminate the iterator source
              t = [];
              ap.return?.(ex);
            }
          }
        }
        ap.next().then(update).catch(error);
        return;
      }
      appended.push(document.createTextNode(c.toString()));
    })(c);
    return appended;
  }

  if (!nameSpace) {
    Object.assign(tag,{
      nodes,    // Build DOM Node[] from ChildTags
      UniqueID
    });
  }

  /** Just deep copy an object */
  const plainObjectPrototype = Object.getPrototypeOf({});
  /** Routine to *define* properties on a dest object from a src object **/
  function deepDefine(d: Record<string | symbol | number, any>, s: any, declaration?: true): void {
    if (s === null || s === undefined || typeof s !== 'object' || s === d)
      return;

    for (const [k, srcDesc] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
      try {
        if ('value' in srcDesc) {
          const value = srcDesc.value;

          if (value && isAsyncIter<unknown>(value)) {
            Object.defineProperty(d, k, srcDesc);
          } else {
            // This has a real value, which might be an object, so we'll deepDefine it unless it's a
            // Promise or a function, in which case we just assign it
            if (value && typeof value === 'object' && !isPromiseLike(value)) {
              if (!(k in d)) {
                // If this is a new value in the destination, just define it to be the same value as the source
                // If the source value is an object, and we're declaring it (therefore it should be a new one), take
                // a copy so as to not re-use the reference and pollute the declaration. Note: this is probably
                // a better default for any "objects" in a declaration that are plain and not some class type
                // which can't be copied
                if (declaration) {
                  if (Object.getPrototypeOf(value) === plainObjectPrototype || !Object.getPrototypeOf(value)) {
                    // A plain object can be deep-copied by field
                    deepDefine(srcDesc.value = {}, value);
                  } else if (Array.isArray(value)) {
                    // An array can be deep copied by index
                    deepDefine(srcDesc.value = [], value);
                  } else {
                    // Other object like things (regexps, dates, classes, etc) can't be deep-copied reliably
                    console.warn(`Declared propety '${k}' is not a plain object and must be assigned by reference, possibly polluting other instances of this tag`, d, value);
                  }
                }
                Object.defineProperty(d, k, srcDesc);
              } else {
                if (value instanceof Node) {
                  console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, logNode(value));
                  d[k] = value;
                } else {
                  if (d[k] !== value) {
                    // Note - if we're copying to an array of different length
                    // we're decoupling common object references, so we need a clean object to
                    // assign into
                    if (Array.isArray(d[k]) && d[k].length !== value.length) {
                      if (value.constructor === Object || value.constructor === Array) {
                        deepDefine(d[k] = new (value.constructor), value);
                      } else {
                        // This is some sort of constructed object, which we can't clone, so we have to copy by reference
                        d[k] = value;
                      }
                    } else {
                      // This is just a regular object, so we deepDefine recursively
                      deepDefine(d[k], value);
                    }
                  }
                }
              }
            } else {
              // This is just a primitive value, or a Promise
              if (s[k] !== undefined)
                d[k] = s[k];
            }
          }
        } else {
          // Copy the definition of the getter/setter
          Object.defineProperty(d, k, srcDesc);
        }
      } catch (ex: unknown) {
        console.warn( "deepAssign", k, s[k], ex);
        throw ex;
      }
    }
  }

  function unbox(a: unknown): unknown {
    const v = a?.valueOf();
    return Array.isArray(v) ? Array.prototype.map.call(v,unbox) : v;
  }

  function assignProps(base: Node, props: Record<string, any>) {
    // Copy prop hierarchy onto the element via the asssignment operator in order to run setters
    if (!(callStackSymbol in props)) {
      (function assign(d: any, s: any): void {
        if (s === null || s === undefined || typeof s !== 'object')
          return;
        // static props before getters/setters
        const sourceEntries = Object.entries(Object.getOwnPropertyDescriptors(s));
        if (!Array.isArray(s)) {
          sourceEntries.sort((a,b) => {
            const desc = Object.getOwnPropertyDescriptor(d,a[0]);
            if (desc) {
              if ('value' in desc) return -1;
              if ('set' in desc) return 1;
              if ('get' in desc) return 0.5;
            }
            return 0;
          });
        }
        for (const [k, srcDesc] of sourceEntries) {
          try {
            if ('value' in srcDesc) {
              const value = srcDesc.value;
              if (isAsyncIter<unknown>(value)) {
                assignIterable(value, k);
              } else if (isPromiseLike(value)) {
                value.then(v => {
                  if (v && typeof v === 'object') {
                    // Special case: this promise resolved to an async iterator
                    if (isAsyncIter<unknown>(v)) {
                      assignIterable(v, k);
                    } else {
                      assignObject(v, k);
                    }
                  } else {
                    if (s[k] !== undefined)
                      d[k] = v;
                  }
                }, error => console.log("Failed to set attribute", error));
              } else if (!isAsyncIter<unknown>(value)) {
                // This has a real value, which might be an object
                if (value && typeof value === 'object' && !isPromiseLike(value))
                  assignObject(value, k);
                else {
                  if (s[k] !== undefined)
                    d[k] = s[k];
                }
              }
            } else {
              // Copy the definition of the getter/setter
              Object.defineProperty(d, k, srcDesc);
            }
          } catch (ex: unknown) {
            console.warn( "assignProps", k, s[k], ex);
            throw ex;
          }
        }

        function assignIterable(value: AsyncIterable<unknown> | AsyncIterator<unknown, any, undefined>, k: string) {
          const ap = asyncIterator(value);
          let notYetMounted = true;
          // DEBUG support
          let createdAt = Date.now() + timeOutWarn;
          const createdBy = DEBUG && new Error("Created by").stack;
          const update = (es: IteratorResult<unknown>) => {
            if (!es.done) {
              const value = unbox(es.value);
              if (typeof value === 'object' && value !== null) {
                  /*
                THIS IS JUST A HACK: `style` has to be set member by member, eg:
                  e.style.color = 'blue'        --- works
                  e.style = { color: 'blue' }   --- doesn't work
                whereas in general when assigning to property we let the receiver
                do any work necessary to parse the object. This might be better handled
                by having a setter for `style` in the PoElementMethods that is sensitive
                to the type (string|object) being passed so we can just do a straight
                assignment all the time, or making the decsion based on the location of the
                property in the prototype chain and assuming anything below "PO" must be
                a primitive
                */
                const destDesc = Object.getOwnPropertyDescriptor(d, k);
                if (k === 'style' || !destDesc?.set)
                  assign(d[k], value);
                else
                  d[k] = value;
              } else {
                // Src is not an object (or is null) - just assign it, unless it's undefined
                if (value !== undefined)
                  d[k] = value;
              }
              const mounted = base.isConnected;
              // If we have been mounted before, bit aren't now, remove the consumer
              if (removedNodes(base) || (!notYetMounted && !mounted)) {
                console.info(`Element does not exist in document when setting async attribute '${k}' to:\n${logNode(base)}`);
                ap.return?.();
                return;
              }
              if (mounted) notYetMounted = false;
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                console.warn(`Element with async attribute '${k}' not mounted after 5 seconds. If it is never mounted, it will leak.\nElement contains: ${logNode(base)}\n${createdBy}`);
              }

              ap.next().then(update).catch(error);
            }
          }
          const error = (errorValue: any) => {
            console.warn( "Dynamic attribute error", errorValue, k, d, createdBy, logNode(base));
            ap.return?.(errorValue);
            base.appendChild(DyamicElementError({ error: errorValue }));
          }
          ap.next().then(update).catch(error);
        }

        function assignObject(value: any, k: string) {
          if (value instanceof Node) {
            console.info("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes", k, logNode(value));
            d[k] = value;
          } else {
            // Note - if we're copying to ourself (or an array of different length),
            // we're decoupling common object references, so we need a clean object to
            // assign into
            if (!(k in d) || d[k] === value || (Array.isArray(d[k]) && d[k].length !== value.length)) {
              if (value.constructor === Object || value.constructor === Array) {
                const copy = new (value.constructor);
                assign(copy, value);
                d[k] = copy;
                //assign(d[k], value);
              } else {
                // This is some sort of constructed object, which we can't clone, so we have to copy by reference
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

  /*
  Extend a component class with create a new component class factory:
      const NewDiv = Div.extended({ overrides })
          ...or...
      const NewDic = Div.extended((instance:{ arbitrary-type }) => ({ overrides }))
         ...later...
      const eltNewDiv = NewDiv({attrs},...children)
  */

  type ExtendTagFunction = (attrs:{
    debugger?: unknown;
    document?: Document;
    [callStackSymbol]?: Overrides[];
    [k: string]: unknown;
  } | ChildTags, ...children: ChildTags[]) => Element

  interface ExtendTagFunctionInstance extends ExtendTagFunction {
    super: TagCreator<Element>;
    definition: Overrides;
    valueOf: () => string;
    extended: (this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) => ExtendTagFunctionInstance;
  }

  function tagHasInstance(this: ExtendTagFunctionInstance, e: any) {
    for (let c = e.constructor; c; c = c.super) {
      if (c === this)
        return true;
    }
    return false;
  }

  function extended(this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) {
    const instanceDefinition = (typeof _overrides !== 'function')
      ? (instance: Instance) => Object.assign({},_overrides,instance)
      : _overrides

    const uniqueTagID = Date.now().toString(36)+(idCount++).toString(36)+Math.random().toString(36).slice(2);
    let staticExtensions: Overrides = instanceDefinition({ [UniqueID]: uniqueTagID });
    /* "Statically" create any styles required by this widget */
    if (staticExtensions.styles) {
      poStyleElt.appendChild(document.createTextNode(staticExtensions.styles + '\n'));
      if (!document.head.contains(poStyleElt)) {
        document.head.appendChild(poStyleElt);
      }
    }

    // "this" is the tag we're being extended from, as it's always called as: `(this).extended`
    // Here's where we actually create the tag, by accumulating all the base attributes and
    // (finally) assigning those specified by the instantiation
    const extendTagFn: ExtendTagFunction = (attrs, ...children) => {
      const noAttrs = isChildTag(attrs) ;
      const newCallStack: (Constructed & Overrides)[] = [];
      const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack  }
      const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
      e.constructor = extendTag;
      const tagDefinition = instanceDefinition({ [UniqueID]: uniqueTagID });
      combinedAttrs[callStackSymbol].push(tagDefinition);
      if (DEBUG) {
        // Validate declare and override
        function isAncestral(creator: TagCreator<Element>, d: string) {
          for (let f = creator; f; f = f.super)
            if (f.definition?.declare && d in f.definition.declare) return true;
          return false;
        }
        if (tagDefinition.declare) {
          const clash = Object.keys(tagDefinition.declare).filter(d => (d in e) || isAncestral(this,d));
          if (clash.length) {
            console.log(`Declared keys '${clash}' in ${extendTag.name} already exist in base '${this.valueOf()}'`);
          }
        }
        if (tagDefinition.override) {
          const clash = Object.keys(tagDefinition.override).filter(d => !(d in e) && !(commonProperties && d in commonProperties) && !isAncestral(this,d));
          if (clash.length) {
            console.log(`Overridden keys '${clash}' in ${extendTag.name} do not exist in base '${this.valueOf()}'`);
          }
        }
      }
      deepDefine(e, tagDefinition.declare, true);
      deepDefine(e, tagDefinition.override);
      tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach(k => {
        if (k in e) {
          console.log(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
        } else {
          defineIterableProperty(e, k, tagDefinition.iterable![k as keyof typeof tagDefinition.iterable])
        }
      });
      if (combinedAttrs[callStackSymbol] === newCallStack) {
        if (!noAttrs)
          assignProps(e, attrs);
        for (const base of newCallStack) {
          const children = base?.constructed?.call(e);
          if (isChildTag(children)) // technically not necessary, since "void" is going to be undefined in 99.9% of cases.
            e.append(...nodes(children));
        }
        // Once the full tree of augmented DOM elements has been constructed, fire all the iterable propeerties
        // so the full hierarchy gets to consume the initial state, unless they have been assigned
        // by assignProps from a future
        for (const base of newCallStack) {
          if (base.iterable) for (const k of Object.keys(base.iterable)) {
            // We don't self-assign iterables that have themselves been assigned with futures
            if (!(!noAttrs && k in attrs && (!isPromiseLike(attrs[k]) || !isAsyncIter(attrs[k])))) {
              const value = e[k as keyof typeof e];
              if (value?.valueOf() !== undefined) {
                // @ts-ignore - some props of e (HTMLElement) are read-only, and we don't know if k is one of them.
                e[k] = value;
              }
            }
          }
        }
      }
      return e;
    }

    const extendTag: ExtendTagFunctionInstance = Object.assign(extendTagFn, {
      super: this,
      definition: Object.assign(staticExtensions, { [UniqueID]: uniqueTagID }),
      extended,
      valueOf: () => {
        const keys = [...Object.keys(staticExtensions.declare || {}), ...Object.keys(staticExtensions.iterable || {})];
        return `${extendTag.name}: {${keys.join(', ')}}\n \u21AA ${this.valueOf()}`
      }
    });
    Object.defineProperty(extendTag, Symbol.hasInstance, {
      value: tagHasInstance,
      writable: true,
      configurable: true
    })

    const fullProto = {};
    (function walkProto(creator: TagCreator<Element>) {
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

    // Attempt to make up a meaningfu;l name for this extended tag
    const creatorName = fullProto
      && 'className' in fullProto
      && typeof fullProto.className === 'string'
      ? fullProto.className
      : uniqueTagID;
    const callSite = DEBUG ? (new Error().stack?.split('\n')[2] ?? '') : '';

    Object.defineProperty(extendTag, "name", {
      value: "<ai-" + creatorName.replace(/\s+/g,'-') + callSite+">"
    });

    if (DEBUG) {
      const extraUnknownProps = Object.keys(staticExtensions).filter(k => !['styles', 'ids', 'constructed', 'declare', 'override', 'iterable'].includes(k));
      if (extraUnknownProps.length) {
        console.log(`${extendTag.name} defines extraneous keys '${extraUnknownProps}', which are unknown`);
      }
    }
    return extendTag;
  }

  // @ts-ignore
  const baseTagCreators: CreateElement & {
    [K in keyof HTMLElementTagNameMap]?: TagCreator<Q & HTMLElementTagNameMap[K] & PoElementMethods>
  } & {
    [n: string]: TagCreator<Q & Element & PoElementMethods>
  } = {
    createElement(
      name: TagCreatorFunction<Element> | Node | keyof HTMLElementTagNameMap,
      attrs: any,
      ...children: ChildTags[]): Node {
        return (name === baseTagCreators.createElement ? nodes(...children)
          : typeof name === 'function' ? name(attrs, children)
          : typeof name === 'string' && name in baseTagCreators ?
          // @ts-ignore: Expression produces a union type that is too complex to represent.ts(2590)
          baseTagCreators[name](attrs, children)
          : name instanceof Node ? name
          : DyamicElementError({ error: new Error("Illegal type in createElement:" + name)})) as Node
      }
  }

  function createTag<K extends keyof HTMLElementTagNameMap>(k: K): TagCreator<Q & HTMLElementTagNameMap[K] & PoElementMethods>;
  function createTag<E extends Element>(k: string): TagCreator<Q & E & PoElementMethods>;
  function createTag(k: string): TagCreator<Q & NamespacedElementBase & PoElementMethods> {
    if (baseTagCreators[k])
      // @ts-ignore
      return baseTagCreators[k];

    const tagCreator = (attrs: Q & PoElementMethods & Partial<{
      debugger?: any;
      document?: Document;
    }> | ChildTags, ...children: ChildTags[]) => {
      let doc = document;
      if (isChildTag(attrs)) {
        children.unshift(attrs);
        attrs = {} as any;
      }

      // This test is always true, but narrows the type of attrs to avoid further errors
      if (!isChildTag(attrs)) {
        if (attrs.debugger) {
          debugger;
          delete attrs.debugger;
        }
        if (attrs.document) {
          doc = attrs.document;
          delete attrs.document;
        }

        // Create element
        const e = nameSpace
          ? doc.createElementNS(nameSpace as string, k.toLowerCase())
          : doc.createElement(k);
        e.constructor = tagCreator;

        deepDefine(e, tagPrototypes);
        assignProps(e, attrs);

        // Append any children
        e.append(...nodes(...children));
        return e;
      }
    }

    const includingExtender = <TagCreator<Element>><unknown>Object.assign(tagCreator, {
      super: ()=>{ throw new Error("Can't invoke native elemenet constructors directly. Use document.createElement().") },
      extended, // How to extend this (base) tag
      valueOf() { return `TagCreator: <${nameSpace || ''}${nameSpace ? '::' : ''}${k}>` }
    });

    Object.defineProperty(tagCreator, Symbol.hasInstance, {
      value: tagHasInstance,
      writable: true,
      configurable: true
    })

    Object.defineProperty(tagCreator, "name", { value: '<' + k + '>' });
    // @ts-ignore
    return baseTagCreators[k] = includingExtender;
  }

  tags.forEach(createTag);

  // @ts-ignore
  return baseTagCreators;
}

function DomPromiseContainer() {
  return document.createComment(DEBUG ? new Error("promise").stack?.replace(/^Error: /, '') || "promise" : "promise")
}

function DyamicElementError({ error }:{ error: Error | IteratorResult<Error>}) {
  return document.createComment(error instanceof Error ? error.toString() : 'Error:\n'+JSON.stringify(error,null,2));
}

export let enableOnRemovedFromDOM = function () {
  enableOnRemovedFromDOM = function () {} // Only create the observer once
  new MutationObserver((mutations) => {
    mutations.forEach(function (m) {
      if (m.type === 'childList') {
        m.removedNodes.forEach(
          removed => removed && removed instanceof Element &&
            [...removed.getElementsByTagName("*"), removed].filter(elt => !elt.isConnected).forEach(
              elt => {
                'onRemovedFromDOM' in elt && typeof elt.onRemovedFromDOM === 'function' && elt.onRemovedFromDOM()
              }
            ));
      }
    });
  }).observe(document.body, { subtree: true, childList: true });
}

/* DOM node removal logic */
type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}
function mutationTracker(root: Node, track: keyof PickByType<MutationRecord, NodeList>){
  const tracked = new WeakSet<Node>();
  function walk(nodes: NodeList){
    for (const node of nodes) {
      // In case it's be re-added/moved
      if ((track === 'addedNodes') === node.isConnected) {
        walk(node.childNodes);
        tracked.add(node);
      }
    }
  }
  new MutationObserver((mutations) => {
    mutations.forEach(function (m) {
      if (m.type === 'childList' && m.removedNodes.length) {
        walk(m[track])
      }
    });
  }).observe(root, { subtree: true, childList: true });

  return function(node: Node) {
    return tracked.has(node);
  }
}

const warned = new Set<string>();
export function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>) {
  node = node || document;
  ids = ids || Object.create(null);
  if (node.querySelectorAll) {
    node.querySelectorAll("[id]").forEach(function (elt) {
      if (elt.id) {
        if (!ids![elt.id])
          ids![elt.id] = elt;
        else if (DEBUG) {
          if (!warned.has(elt.id)) {
            warned.add(elt.id)
            console.info("Shadowed multiple element IDs", elt.id /*, elt, ids![elt.id]*/);
          }
        }
      }
    });
  }
  return ids;
}
