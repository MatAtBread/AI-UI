import { isPromiseLike } from './deferred.js';
import { Ignore, asyncIterator, defineIterableProperty, isAsyncIter, isAsyncIterator } from './iterators.js';
import { WhenParameters, WhenReturn, when } from './when.js';
import { DEBUG, console, timeOutWarn } from './debug.js';
import type { ChildTags, Constructed, Instance, Overrides, TagCreationOptions, TagCreator, TagCreatorFunction, ExtendTagFunctionInstance, ExtendTagFunction } from './tags.js';
import { callStackSymbol } from './tags.js';

/* Export useful stuff for users of the bundled code */
export { when, Ready } from './when.js';
export type { ChildTags, Instance, TagCreator, TagCreatorFunction } from './tags.js'
export * as Iterators from './iterators.js';

export const UniqueID = Symbol("Unique ID");
const trackNodes = Symbol("trackNodes");
const trackLegacy = Symbol("onRemovalFromDOM");
const aiuiExtendedTagStyles = "--ai-ui-extended-tag-styles";

const logNode = DEBUG
? ((n: any) => n instanceof Node
  ? 'outerHTML' in n ? n.outerHTML : `${n.textContent} ${n.nodeName}`
  : String(n))
: (n: Node) => undefined;

/* A holder for commonProperties specified when `tag(...p)` is invoked, which are always
  applied (mixed in) when an element is created */
export interface TagFunctionOptions<OtherMembers extends Record<string | symbol, any> = {}> {
  commonProperties?: OtherMembers | undefined
  document?: Document
  ErrorTag?: TagCreatorFunction<Element & { error: any }>
  /** @deprecated - legacy support */
  enableOnRemovedFromDOM?: boolean
}

/* Members applied to EVERY tag created, even base tags */
interface PoElementMethods {
  get ids(): {} & (undefined | ((attrs: object, ...children: ChildTags[]) => ReturnType<TagCreatorFunction<any>>))
  when<T extends Element & PoElementMethods, S extends WhenParameters<Exclude<keyof T['ids'], number | symbol>>>(this: T, ...what: S): WhenReturn<S>;
  // This is a very incomplete type. In practice, set(k, attrs) requires a deeply partial set of
  // attributes, in exactly the same way as a TagFunction's first object parameter
  set attributes(attrs: object);
  get attributes(): NamedNodeMap
}

// Support for https://www.npmjs.com/package/htm (or import htm from 'https://cdn.jsdelivr.net/npm/htm/dist/htm.module.js')
// Note: same signature as React.createElement
type CreateElementNodeType = TagCreatorFunction<any> | Node | keyof HTMLElementTagNameMap
type CreateElementFragment = CreateElement['createElement'];
export interface CreateElement {
  // Support for htm, JSX, etc
  createElement<N extends (CreateElementNodeType | CreateElementFragment)>(
    // "name" can a HTML tag string, an existing node (just returns itself), or a tag function
    name: N,
    // The attributes used to initialise the node (if a string or function - ignore if it's already a node)
    attrs: any,
    // The children
    ...children: ChildTags[]): N extends CreateElementFragment ? Node[] : Node;
  }

/* The interface that creates a set of TagCreators for the specified DOM tags */
export interface TagLoader {
  nodes(...c: ChildTags[]): (Node | (/*P &*/ (Element & PoElementMethods)))[];
  UniqueID: typeof UniqueID

  /*
   Signatures for the tag loader. All params are optional in any combination,
   but must be in order:
      tag(
          ?nameSpace?: string,  // absent nameSpace implies HTML
          ?tags?: string[],     // absent tags defaults to all common HTML tags
          ?commonProperties?: TagFunctionOptions<Q> // absent implies none are defined
      )

      eg:
        tags()  // returns TagCreators for all HTML tags
        tags(['div','button'], { myThing() {} })
        tags('http://namespace',['Foreign'], { isForeign: true })
  */

  <Tags extends keyof HTMLElementTagNameMap>(): { [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap>(tags: Tags[]): { [k in Lowercase<Tags>]: TagCreator<PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap, Q extends object>(options: TagFunctionOptions<Q>): { [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends keyof HTMLElementTagNameMap, Q extends object>(tags: Tags[], options: TagFunctionOptions<Q>): { [k in Lowercase<Tags>]: TagCreator<Q & PoElementMethods & HTMLElementTagNameMap[k]> } & CreateElement
  <Tags extends string, Q extends object>(nameSpace: null | undefined | '', tags: Tags[], options?: TagFunctionOptions<Q>): { [k in Tags]: TagCreator<Q & PoElementMethods & HTMLElement> } & CreateElement
  <Tags extends string, Q extends object>(nameSpace: string, tags: Tags[], options?: TagFunctionOptions<Q>): Record<string, TagCreator<Q & PoElementMethods & Element>> & CreateElement
}

let idCount = 0;
const standandTags = [
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button",
  "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div",
  "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head",
  "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map",
  "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre",
  "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "search", "section", "select", "slot", "small", "source", "span",
  "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time",
  "title", "tr", "track", "u", "ul", "var", "video", "wbr"
] as const;

function idsInaccessible(): never {
  throw new Error("<elt>.ids is a read-only map of Elements")
}

/* Symbols used to hold IDs that clash with function prototype names, so that the Proxy for ids can be made callable */
const safeFunctionSymbols = [...Object.keys(Object.getOwnPropertyDescriptors(Function.prototype))].reduce((a,b) => {
  a[b] = Symbol(b);
  return a;
},{} as Record<string, symbol>);
function keyFor(id: string | symbol) { return id in safeFunctionSymbols ? safeFunctionSymbols[id as keyof typeof safeFunctionSymbols] : id };

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

export const tag = <TagLoader>function <Tags extends string,
  T1 extends (string | Tags[] | TagFunctionOptions<Q>),
  T2 extends (Tags[] | TagFunctionOptions<Q>),
  Q extends object
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
    ? [_1, _2 as Tags[], _3 as TagFunctionOptions<Q> | undefined]
    : Array.isArray(_1)
      ? [null, _1 as Tags[], _2 as TagFunctionOptions<Q> | undefined]
      : [null, standandTags, _1 as TagFunctionOptions<Q> | undefined];

  const commonProperties = options?.commonProperties;
  const thisDoc = options?.document ?? globalThis.document;
  const isTestEnv = thisDoc.documentURI === 'about:testing';
  const DynamicElementError = options?.ErrorTag || function DyamicElementError({ error }: { error: Error | IteratorResult<Error> }) {
    return thisDoc.createComment(error instanceof Error ? error.toString() : 'Error:\n' + JSON.stringify(error, null, 2));
  }

  const removedNodes = mutationTracker(thisDoc);

  function DomPromiseContainer(label?: any) {
    return thisDoc.createComment(label? label.toString() :DEBUG
      ? new Error("promise").stack?.replace(/^Error: /, '') || "promise"
      : "promise")
  }

  if (!document.getElementById(aiuiExtendedTagStyles)) {
    thisDoc.head.appendChild(Object.assign(thisDoc.createElement("STYLE"), {id: aiuiExtendedTagStyles} ));
  }

  /* Properties applied to every tag which can be implemented by reference, similar to prototypes */
  const warned = new Set<string>();
  const tagPrototypes: PoElementMethods = Object.create(
    null,
    {
      when: {
        writable: false,
        configurable: true,
        enumerable: false,
        value: function (...what: WhenParameters) {
          return when(this, ...what)
        }
      },
      attributes: {
        ...Object.getOwnPropertyDescriptor(Element.prototype, 'attributes'),
        set(this: Element, a: object) {
          if (isAsyncIter(a)) {
            const ai = isAsyncIterator(a) ? a : a[Symbol.asyncIterator]();
            const step = () => ai.next().then(
              ({ done, value }) => { assignProps(this, value); done || step() },
              ex => console.warn(ex));
            step();
          }
          else assignProps(this, a);
        }
      },
      ids: {
        // .ids is a getter that when invoked for the first time
        // lazily creates a Proxy that provides live access to children by id
        configurable: true,
        enumerable: true,
        set: idsInaccessible,
        get(this: Element) {
          // Now we've been accessed, create the proxy
          const idProxy = new Proxy((()=>{}) as unknown as Record<string | symbol, WeakRef<Element>>, {
            apply(target, thisArg, args) {
              try {
                return thisArg.constructor.definition.ids[args[0].id](...args)
              } catch (ex) {
                throw new Error(`<elt>.ids.${args?.[0]?.id} is not a tag-creating function`, { cause: ex });
              }
            },
            construct: idsInaccessible,
            defineProperty: idsInaccessible,
            deleteProperty: idsInaccessible,
            set: idsInaccessible,
            setPrototypeOf: idsInaccessible,
            getPrototypeOf() { return null },
            isExtensible() { return false },
            preventExtensions() { return true },
            getOwnPropertyDescriptor(target, p) {
              if (this.get!(target, p, null))
                return Reflect.getOwnPropertyDescriptor(target, keyFor(p));
            },
            has(target, p) {
              const r = this.get!(target, p, null);
              return Boolean(r);
            },
            ownKeys: (target) => {
              const ids = [...this.querySelectorAll(`[id]`)].map(e => e.id);
              const unique = [...new Set(ids)];
              if (DEBUG && ids.length !== unique.length)
                console.log(`Element contains multiple, shadowed decendant ids`, unique);
              return unique;
            },
            get: (target, p, receiver) => {
              if (typeof p === 'string') {
                const pk = keyFor(p);
                // Check if we've cached this ID already
                if (pk in target) {
                  // Check the element is still contained within this element with the same ID
                  const ref = target[pk].deref();
                  if (ref && ref.id === p && this.contains(ref))
                    return ref;
                  delete target[pk];
                }
                let e: Element | undefined;
                if (DEBUG) {
                  const nl = this.querySelectorAll('#' + CSS.escape(p));
                  if (nl.length > 1) {
                    if (!warned.has(p)) {
                      warned.add(p);
                      console.log(`Element contains multiple, shadowed decendants with ID "${p}"`/*,`\n\t${logNode(this)}`*/);
                    }
                  }
                  e = nl[0];
                } else {
                  e = this.querySelector('#' + CSS.escape(p)) ?? undefined;
                }
                if (e)
                  Reflect.set(target, pk, new WeakRef(e), target);
                return e;
              }
            }
          });
          // ..and replace the getter with the Proxy
          Object.defineProperty(this, 'ids', {
            configurable: true,
            enumerable: true,
            set: idsInaccessible,
            get() { return idProxy }
          });
          // ...and return that from the getter, so subsequent property
          // accesses go via the Proxy
          return idProxy;
        }
      }
    }
  );

  if (options?.enableOnRemovedFromDOM) {
    Object.defineProperty(tagPrototypes,'onRemovedFromDOM',{
      configurable: true,
      enumerable: false,
      set: function(fn?: ()=>void){
        removedNodes.onRemoval([this], trackLegacy, fn);
      },
      get: function(){
        removedNodes.getRemovalHandler(this, trackLegacy);
      }
    });
  }
  /* Add any user supplied prototypes */
  if (commonProperties)
    deepDefine(tagPrototypes, commonProperties);

  function *nodes(...childTags: ChildTags[]): IterableIterator<ChildNode, void, unknown> {
    function notViableTag(c: ChildTags) {
      return (c === undefined || c === null || c === Ignore)
    }

    for (const c of childTags) {
      if (notViableTag(c))
        continue;

      if (isPromiseLike(c)) {
        let g: ChildNode[] | undefined = [DomPromiseContainer()];
        c.then(replacement => {
          const old = g;
          if (old) {
            g = [...nodes(replacement)];
            removedNodes.onRemoval(g, trackNodes, ()=> { g = undefined });
            for (let i=0; i < old.length; i++) {
              if (i === 0)
                old[i].replaceWith(...g);
              else
              old[i].remove();
            }
          }
        });

        if (g) yield *g;
        continue;
      }

      if (c instanceof Node) {
        yield c as ChildNode;
        continue;
      }

      // We have an interesting case here where an iterable String is an object with both Symbol.iterator
      // (inherited from the String prototype) and Symbol.asyncIterator (as it's been augmented by boxed())
      // but we're only interested in cases like HTMLCollection, NodeList, array, etc., not the funky ones
      // It used to be after the isAsyncIter() test, but a non-AsyncIterator *may* also be a sync iterable
      // For now, we exclude (Symbol.asyncIterator in c) in this case.
      if (c && typeof c === 'object' && Symbol.iterator in c && !(Symbol.asyncIterator in c) && c[Symbol.iterator]) {
        for (const ch of c)
          yield *nodes(ch);
        continue;
      }

      if (isAsyncIter<ChildTags>(c)) {
        const insertionStack = DEBUG ? ('\n' + new Error().stack?.replace(/^Error: /, "Insertion :")) : '';
        let ap = isAsyncIterator(c) ? c : c[Symbol.asyncIterator]();
        let notYetMounted = true;

        const terminateSource = (force: boolean = false) => {
          if (!ap || !replacement.nodes)
            return true;
          if (force || replacement.nodes.every(e => removedNodes.has(e))) {
            // We're done - terminate the source quietly (ie this is not an exception as it's expected, but we're done)
            replacement.nodes?.forEach(e => removedNodes.add(e));
            const msg = "Element(s) have been removed from the document: "
              + replacement.nodes.map(logNode).join('\n')
              + insertionStack;
            // @ts-ignore: release reference for GC
            replacement.nodes = null;
            ap.return?.(new Error(msg));
            // @ts-ignore: release reference for GC
            ap = null;
            return true;
          }
          return false;
        }

        // It's possible that this async iterator is a boxed object that also holds a value
        const unboxed = c.valueOf();
        const replacement = {
          nodes: ((unboxed === c) ? [] : [...nodes(unboxed as ChildTags)]) as ChildNode[] | undefined,
          [Symbol.iterator]() {
            return this.nodes?.[Symbol.iterator]() ?? ({ next() { return { done: true as const, value: undefined } } } as Iterator<ChildNode>)
          }
        };
        if (!replacement.nodes!.length)
          replacement.nodes = [DomPromiseContainer()];
        removedNodes.onRemoval(replacement.nodes!,trackNodes,terminateSource);

        // DEBUG support
        const debugUnmounted = DEBUG
          ? (() => {
            const createdAt = Date.now() + timeOutWarn;
            const createdBy = new Error("Created by").stack;
            let f = () => {
              if (notYetMounted && createdAt && createdAt < Date.now()) {
                f = () => { };
                console.warn(`Async element not mounted after ${timeOutWarn / 1000} seconds. If it is never mounted, it will leak.`, createdBy, replacement.nodes?.map(logNode));
              }
            }
            return f;
          })()
          : null;

        (function step() {
          ap.next().then(es => {
            if (!es.done) {
              if (!replacement.nodes) {
                ap?.throw?.(new Error("Already ternimated"));
                return;
              }
              const mounted = replacement.nodes.filter(e => e.isConnected);
              const n = notYetMounted ? replacement.nodes : mounted;
              if (notYetMounted && mounted.length) notYetMounted = false;

              if (!terminateSource(!n.length)) {
                debugUnmounted?.();
                removedNodes.onRemoval(replacement.nodes, trackNodes);

                replacement.nodes = [...nodes(unbox(es.value))];
                if (!replacement.nodes.length)
                  replacement.nodes = [DomPromiseContainer()];
                removedNodes.onRemoval(replacement.nodes, trackNodes,terminateSource);

                for (let i=0; i<n.length; i++) {
                  if (i===0)
                    n[0].replaceWith(...replacement.nodes);
                  else if (!replacement.nodes.includes(n[i]))
                    n[i].remove();
                  removedNodes.add(n[i]);
                }

                step();
              }
            }
          }).catch((errorValue: any) => {
            const n = replacement.nodes?.filter(n => Boolean(n?.parentNode));
            if (n?.length) {
              n[0].replaceWith(DynamicElementError({ error: errorValue?.value ?? errorValue }));
              n.slice(1).forEach(e => e?.remove());
            }
            else console.warn("Can't report error", errorValue, replacement.nodes?.map(logNode));
            // @ts-ignore: release reference for GC
            replacement.nodes = null;
            // @ts-ignore: release reference for GC
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
                  console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${d instanceof Node ? logNode(d) : d}`);
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
        console.warn("deepAssign", k, s[k], ex);
        throw ex;
      }
    }
  }

  function unbox<T>(a: T): T {
    const v = a?.valueOf();
    return (Array.isArray(v) ? Array.prototype.map.call(v, unbox) : v) as T;
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
          sourceEntries.sort(a => {
            const desc = Object.getOwnPropertyDescriptor(d, a[0]);
            if (desc) {
              if ('value' in desc) return -1;
              if ('set' in desc) return 1;
              if ('get' in desc) return 1;
            }
            return 0;
          });
        }

        const set = isTestEnv || !(d instanceof Element) || (d instanceof HTMLElement)
          ? (k: string, v: any) => { d[k] = v }
          : (k: string, v: any) => {
            if ((v === null || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string')
              && (!(k in d) || typeof d[k as keyof typeof d] !== 'string'))
              d.setAttribute(k === 'className' ? 'class' : k, String(v));
            else // @ts-ignore
              d[k] = v;
          }

        for (const [k, srcDesc] of sourceEntries) {
          try {
            if ('value' in srcDesc) {
              const value = srcDesc.value;
              if (isAsyncIter<unknown>(value)) {
                assignIterable(value, k);
              } else if (isPromiseLike(value)) {
                value.then(v => {
                  if (!removedNodes.has(base)) {
                    if (v && typeof v === 'object') {
                      // Special case: this promise resolved to an async iterator
                      if (isAsyncIter<unknown>(v)) {
                        assignIterable(v, k);
                      } else {
                        assignObject(v, k);
                      }
                    } else {
                      if (s[k] !== undefined)
                        set(k, v);
                    }
                  }
                }, error => console.log(`Exception in promised attribute '${k}'`, error, logNode(d)));
              } else if (!isAsyncIter<unknown>(value)) {
                // This has a real value, which might be an object
                if (value && typeof value === 'object' && !isPromiseLike(value))
                  assignObject(value, k);
                else {
                  if (s[k] !== undefined)
                    set(k, s[k]);
                }
              }
            } else {
              // Copy the definition of the getter/setter
              Object.defineProperty(d, k, srcDesc);
            }
          } catch (ex: unknown) {
            console.warn("assignProps", k, s[k], ex);
            throw ex;
          }
        }

        function assignIterable(iter: AsyncIterable<unknown> | AsyncIterator<unknown, any, undefined>, k: string) {
          const ap = asyncIterator(iter);
          // DEBUG support
          let createdAt = Date.now() + timeOutWarn;
          const createdBy = DEBUG && new Error("Created by").stack;

          let mounted = false;
          const update = (es: IteratorResult<unknown>) => {
            if (!es.done) {
              mounted = mounted || base.isConnected;
              // If we have been mounted before, but aren't now, remove the consumer
              if (removedNodes.has(base)) {
                error("(node removed)");
                ap.return?.();
                return;
              }

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
                  set(k, value);
              } else {
                // Src is not an object (or is null) - just assign it, unless it's undefined
                if (value !== undefined)
                  set(k, value);
              }

              if (DEBUG && !mounted && createdAt < Date.now()) {
                createdAt = Number.MAX_SAFE_INTEGER;
                console.warn(`Element with async attribute '${k}' not mounted after ${timeOutWarn/1000} seconds. If it is never mounted, it will leak.\nElement contains: ${logNode(base)}\n${createdBy}`);
              }

              ap.next().then(update).catch(error);
            }
          }
          const error = (errorValue: any) => {
            if (errorValue) {
              console.warn("Dynamic attribute termination", errorValue, k, logNode(d), createdBy, logNode(base));
              base.appendChild(DynamicElementError({ error: errorValue }));
            }
          }

          const unboxed = iter.valueOf();
          if (unboxed !== undefined && unboxed !== iter && !isAsyncIter(unboxed))
            update({ done: false, value: unboxed });
          else
            ap.next().then(update).catch(error);
          removedNodes.onRemoval([base], k, () => ap.return?.());
        }

        function assignObject(value: any, k: string) {
          if (value instanceof Node) {
            console.info(`Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or via a collection such as .childNodes. Propety: '${k}' value: ${logNode(value)} destination: ${base instanceof Node ? logNode(base) : base}`);
            set(k, value);
          } else {
            // Note - if we're copying to ourself (or an array of different length),
            // we're decoupling common object references, so we need a clean object to
            // assign into
            if (!(k in d) || d[k] === value || (Array.isArray(d[k]) && d[k].length !== value.length)) {
              if (value.constructor === Object || value.constructor === Array) {
                const copy = new (value.constructor);
                assign(copy, value);
                set(k, copy);
                //assign(d[k], value);
              } else {
                // This is some sort of constructed object, which we can't clone, so we have to copy by reference
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

  /*
  Extend a component class with create a new component class factory:
      const NewDiv = Div.extended({ overrides })
          ...or...
      const NewDic = Div.extended((instance:{ arbitrary-type }) => ({ overrides }))
         ...later...
      const eltNewDiv = NewDiv({attrs},...children)
  */

  function tagHasInstance(this: ExtendTagFunctionInstance, e: any) {
    for (let c = e.constructor; c; c = c.super) {
      if (c === this)
        return true;
    }
    return false;
  }

  function extended(this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) {
    const instanceDefinition = (typeof _overrides !== 'function')
      ? (instance: Instance) => Object.assign({}, _overrides, instance)
      : _overrides

    const uniqueTagID = Date.now().toString(36) + (idCount++).toString(36) + Math.random().toString(36).slice(2);
    const staticExtensions: Overrides = instanceDefinition({ [UniqueID]: uniqueTagID });
    /* "Statically" create any styles required by this widget */
    if (staticExtensions.styles) {
      document.getElementById(aiuiExtendedTagStyles)?.appendChild(thisDoc.createTextNode(staticExtensions.styles + '\n'));
    }

    // "this" is the tag we're being extended from, as it's always called as: `(this).extended`
    // Here's where we actually create the tag, by accumulating all the base attributes and
    // (finally) assigning those specified by the instantiation
    const extendTagFn: ExtendTagFunction = (attrs, ...children) => {
      const noAttrs = isChildTag(attrs);
      const newCallStack: (Constructed & Overrides)[] = [];
      const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack }
      const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
      e.constructor = extendTag;
      const tagDefinition = instanceDefinition({ [UniqueID]: uniqueTagID });
      combinedAttrs[callStackSymbol].push(tagDefinition);
      if (DEBUG) {
        // Validate declare and override
        const isAncestral = (creator: TagCreator<Element>, key: string) => {
          for (let f = creator; f; f = f.super)
            if (f.definition?.declare && key in f.definition.declare) return true;
          return false;
        }
        if (tagDefinition.declare) {
          const clash = Object.keys(tagDefinition.declare).filter(k => (k in e) || isAncestral(this, k));
          if (clash.length) {
            console.log(`Declared keys '${clash}' in ${extendTag.name} already exist in base '${this.valueOf()}'`);
          }
        }
        if (tagDefinition.override) {
          const clash = Object.keys(tagDefinition.override).filter(k => !(k in e) && !(commonProperties && k in commonProperties) && !isAncestral(this, k));
          if (clash.length) {
            console.log(`Overridden keys '${clash}' in ${extendTag.name} do not exist in base '${this.valueOf()}'`);
          }
        }
      }
      deepDefine(e, tagDefinition.declare, true);
      deepDefine(e, tagDefinition.override);
      const reAssign = new Set<string>();
      tagDefinition.iterable && Object.keys(tagDefinition.iterable).forEach(k => {
        if (k in e) {
          console.log(`Ignoring attempt to re-define iterable property "${k}" as it could already have consumers`);
          reAssign.add(k);
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
        const combinedInitialIterableValues = {};
        let hasInitialValues = false;
        for (const base of newCallStack) {
          if (base.iterable) for (const k of Object.keys(base.iterable)) {
            // We don't self-assign iterables that have themselves been assigned with futures
            const attrExists = !noAttrs && k in attrs;
            if ((reAssign.has(k) && attrExists) || !(attrExists && (!isPromiseLike(attrs[k]) || !isAsyncIter(attrs[k])))) {
              const value = e[k as keyof typeof e]?.valueOf();
              if (value !== undefined) {
                // @ts-ignore - some props of e (HTMLElement) are read-only, and we don't know if k is one of them.
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
      value: "<ai-" + creatorName.replace(/\s+/g, '-') + callSite + ">"
    });

    if (DEBUG) {
      const extraUnknownProps = Object.keys(staticExtensions).filter(k => !['styles', 'ids', 'constructed', 'declare', 'override', 'iterable'].includes(k));
      if (extraUnknownProps.length) {
        console.log(`${extendTag.name} defines extraneous keys '${extraUnknownProps}', which are unknown`);
      }
    }
    return extendTag;
  }

  const createElement: CreateElement['createElement'] = (name, attrs, ...children) =>
    // @ts-ignore: Expression produces a union type that is too complex to represent.ts(2590)
    name instanceof Node ? name
    : typeof name === 'string' && name in baseTagCreators ? baseTagCreators[name](attrs, children)
    : name === baseTagCreators.createElement ? [...nodes(...children)]
    : typeof name === 'function' ? name(attrs, children)
    : DynamicElementError({ error: new Error("Illegal type in createElement:" + name) })

  // @ts-ignore
  const baseTagCreators: CreateElement & {
    [K in keyof HTMLElementTagNameMap]?: TagCreator<Q & HTMLElementTagNameMap[K] & PoElementMethods>
  } & {
    [n: string]: TagCreator<Q & Element & PoElementMethods>
  } = {
    createElement
  }

  function createTag<K extends keyof HTMLElementTagNameMap>(k: K): TagCreator<Q & HTMLElementTagNameMap[K] & PoElementMethods>;
  function createTag<E extends Element>(k: string): TagCreator<Q & E & PoElementMethods>;
  function createTag(k: string): TagCreator<Q & NamespacedElementBase & PoElementMethods> {
    if (baseTagCreators[k])
      // @ts-ignore
      return baseTagCreators[k];

    const tagCreator = (attrs: Q & PoElementMethods & TagCreationOptions | ChildTags, ...children: ChildTags[]) => {
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

        // Create element
        const e = nameSpace
          ? thisDoc.createElementNS(nameSpace as string, k.toLowerCase())
          : thisDoc.createElement(k);
        e.constructor = tagCreator;

        deepDefine(e, tagPrototypes);
        assignProps(e, attrs);

        // Append any children
        e.append(...nodes(...children));
        return e;
      }
    }

    const includingExtender = <TagCreator<Element>><unknown>Object.assign(tagCreator, {
      super: () => { throw new Error("Can't invoke native elemenet constructors directly. Use document.createElement().") },
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

/* DOM node removal logic */
type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}
function mutationTracker(root: Node) {
  const tracked = new WeakSet<Node>();
  const removals: WeakMap<Node, Map<Symbol | string, (this: Node)=>void>> = new WeakMap();
  function walk(nodes: NodeList) {
    for (const node of nodes) {
      // In case it's be re-added/moved
      if (!node.isConnected) {
        tracked.add(node);
        walk(node.childNodes);
        // Modern onRemovedFromDOM support
        const removalSet = removals.get(node);
        if (removalSet) {
          removals.delete(node);
          for (const [name, x] of removalSet?.entries()) try { x.call(node) } catch (ex) {
            console.info("Ignored exception handling node removal", name, x, logNode(node));
          }
        }
      }
    }
  }
  new MutationObserver((mutations) => {
    mutations.forEach(function (m) {
      if (m.type === 'childList' && m.removedNodes.length)
        walk(m.removedNodes)
    });
  }).observe(root, { subtree: true, childList: true });

  return {
    has(e:Node) { return tracked.has(e) },
    add(e:Node) { return tracked.add(e) },
    getRemovalHandler(e: Node, name: Symbol) {
      return removals.get(e)?.get(name);
    },
    onRemoval(e: Node[], name: Symbol | string, handler?: (this: Node)=>void) {
      if (handler) {
        e.forEach(e => {
          const map = removals.get(e) ?? new Map<Symbol | string, ()=>void>();
          removals.set(e, map);
          map.set(name, handler);
        });
      }
      else {
        e.forEach(e => {
          const map = removals.get(e);
          if (map) {
            map.delete(name);
            if (!map.size)
              removals.delete(e)
          }
        });
      }
    }
  }
}

