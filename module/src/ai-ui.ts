import { isPromiseLike } from './deferred.js';
import { defineIterableProperty, isAsyncIter, isAsyncIterable, isAsyncIterator } from './iterators.js';
import { WhenParameters, WhenReturn, when } from './when.js';
import { AsyncProvider, ChildTags, Instance, Overrides, TagCreator } from './tags'

/* Export useful stuff for users of the bundled code */
export { when } from './when.js';
export { ChildTags, Instance, TagCreator } from './tags'
export * as Iterators from './iterators.js';

const DEBUG = true;

/* A holder for prototypes specified when `tag(...p)` is invoked, which are always
  applied (mixed in) when an element is created */
type OtherMembers = { };

/* Members applied to EVERY tag created, even base tags */
interface PoElementMethods {
  get ids(): Record<string, Element | undefined>;
  when<S extends WhenParameters>(...what: S): WhenReturn<S>;
}

/* The interface that creates a set of TagCreators for the specified DOM tags */
interface TagLoader {
  /** @deprecated - Legacy function similar to Element.append/before/after */
  appender(container: Node, before?: Node): (c: ChildTags) => (Node | (/*P &*/ (Element & PoElementMethods)))[];
  nodes(...c: ChildTags[]): (Node | (/*P &*/ (Element & PoElementMethods)))[];

  /*
   Signatures for the tag loader. All params are optional in any combination, 
   but must be in order:
      tag(
          ?nameSpace?: string,  // absent nameSpace implies HTML
          ?tags?: string[],     // absent tags defaults to all common HTML tags
          ?prototypes?: PrototypeConstraint // absent prototypes implies none are defined
      )

      eg:
        tags()  // returns TagCreators for all HTML tags
        tags(['div','button'], { myThing() {} })
        tags('http://namespace',['Foreign'], { isForeign: true })
  */
  <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(prototypes?: P): { [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]> };
  <Tags extends keyof HTMLElementTagNameMap, P extends OtherMembers>(tags: Tags[], prototypes?: P): { [k in Lowercase<Tags>]: TagCreator<P & PoElementMethods & HTMLElementTagNameMap[k]> };
  <Tags extends string, P extends (Partial<HTMLElement> & OtherMembers)>(nameSpace: null | undefined | '', tags: Tags[], prototypes?: P): { [k in Tags]: TagCreator<P & PoElementMethods & HTMLUnknownElement> };
  <Tags extends string, P extends (Partial<Element> & OtherMembers)>(nameSpace: string, tags: Tags[], prototypes?: P): Record<string, TagCreator<P & PoElementMethods & Element>>;
}

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

const elementProtype: PoElementMethods & ThisType<Element & PoElementMethods> = {
  get ids() {
    return getElementIdMap(this, /*Object.create(this.defaults) ||*/);
  },
  set ids(v: any) {
    throw new Error('Cannot set ids on ' + this.valueOf());
  },

  /* EXPERIMENTAL: Allow a partial style object to be assigned to `style`
  set style(s: any) {
    const pd = getProtoPropertyDescriptor(this,'style');
    if (typeof s === 'object') {
      deepAssign(pd?.get.call(this),s);
    } else {
      pd?.set.call(this,s);
    }
  },
  get style() {
    const pd = getProtoPropertyDescriptor(this,'style');
    return pd?.get.call(this);
  },*/

  when: function (...what) {
    return when(this, ...what)
  }
};

const poStyleElt = document.createElement("STYLE");
poStyleElt.id = "--ai-ui-extended-tag-styles";

function asyncIterator<T>(o: AsyncProvider<T>) {
  if (isAsyncIterable(o)) return o[Symbol.asyncIterator]();
  if (isAsyncIterator(o)) return o;
  throw new Error("Not as async provider");
}

function isChildTag(x: any): x is ChildTags {
  return typeof x === 'string'
    || typeof x === 'number'
    || typeof x === 'function'
    || x instanceof Node
    || x instanceof NodeList
    || x instanceof HTMLCollection
    || x === null
    || x === undefined
    // Can't actually test for the contained type, so we assume it's a ChildTag and let it fail at runtime
    || Array.isArray(x)
    || isPromiseLike(x)
    || isAsyncIter(x)
    || typeof x[Symbol.iterator] === 'function';
}

/* tag */
const callStackSymbol = Symbol('callStack');

export const tag = <TagLoader>function <Tags extends string,
  E extends Element,
  P extends (Partial<E> & OtherMembers),
  T1 extends (string | Tags[] | P),
  T2 extends (Tags[] | P)
>(
  _1: T1,
  _2: T2,
  _3?: P
): Record<string, TagCreator<P & Element>> {
  type NamespacedElementBase = T1 extends string ? T1 extends '' ? HTMLElement : Element : HTMLElement;

  /* Work out which parameter is which. There are 4 variations:
    tag()                                       []
    tag(prototypes)                             [object]
    tag(tags[])                                 [string[]]
    tag(tags[], prototypes)                     [string[], object]
    tag(namespace | null, tags[])               [string | null, string[]]
    tag(namespace | null, tags[],prototypes)    [string | null, string[], object]
  */
  const [nameSpace, tags, prototypes] = (typeof _1 === 'string') || _1 === null
    ? [_1, _2 as Tags[], _3 as P]
    : Array.isArray(_1)
      ? [null, _1 as Tags[], _2 as P] 
      : [null, standandTags, _1 as P];

  /* Note: we use deepAssign (and not object spread) so getters (like `ids`)
    are not evaluated until called */
  const tagPrototypes = Object.create(
    null,
    Object.getOwnPropertyDescriptors(elementProtype), // We know it's not nested
  );
  if (prototypes)
    deepDefine(tagPrototypes, prototypes);

  function nodes(...c: ChildTags[]) {
    const appended: (Node | ReturnType<typeof DomPromiseContainer>)[] = [];
    (function children(c: ChildTags) {
      if (c === undefined || c === null)
        return;
      if (isPromiseLike(c)) {
        let g: Node[] = [DomPromiseContainer()];
        appended.push(g[0]);
        c.then(r => {
          const n = nodes(r);
          const old = g;
          if (old[0].parentElement) {
            appender(old[0].parentElement, old[0])(n);
            old.forEach(e => e.parentElement?.removeChild(e));
          }
          g = n;
        }, x => {
          console.warn(x);
          appender(g[0])(DyamicElementError({error: x}));
        });
        return;
      }
      if (c instanceof Node) {
        appended.push(c);
        return;
      }

      if (isAsyncIter<ChildTags>(c)) {
        const insertionStack = DEBUG ? ('\n' + new Error().stack?.replace(/^Error: /, "Insertion :")) : '';
        const ap = isAsyncIterable(c) ? c[Symbol.asyncIterator]() : c;
        const dpm = DomPromiseContainer();
        appended.push(dpm);

        let t: ReturnType<ReturnType<typeof appender>> = [dpm];

        const error = (errorValue: any) => {
          ap.return?.(errorValue);
          const n = (Array.isArray(t) ? t : [t]).filter(n => Boolean(n));
          if (n[0].parentNode) {
            t = appender(n[0].parentNode, n[0])(DyamicElementError({error: errorValue}));
            n.forEach(e => e.parentNode?.removeChild(e));
          }
          else
            console.warn("Can't report error", errorValue, t);
        }

        const update = (es: IteratorResult<ChildTags>) => {
          if (!es.done) {
            const n = (Array.isArray(t) ? t : [t]).filter(e => e.ownerDocument?.body.contains(e));
            if (!n.length || !n[0].parentNode)
              throw new Error("Element(s) no longer exist in document" + insertionStack);

            t = appender(n[0].parentNode, n[0])(es.value?.valueOf() as ChildTags ?? DomPromiseContainer());
            n.forEach(e => e.parentNode?.removeChild(e));
            ap.next().then(update).catch(error);
          }
        };
        ap.next().then(update).catch(error);
        return;
      }
      if (typeof c === 'object' && c?.[Symbol.iterator]) {
        for (const d of c) children(d);
        return;
      }
      appended.push(document.createTextNode(c.toString()));
    })(c);
    return appended;
  }

  function appender(container: Node, before?: Node | null) {
    if (before === undefined)
      before = null;
    return function (c: ChildTags) {
      const children = nodes(c);
      if (before) {
        // "before", being a node, could be #text node
        if (before instanceof Element) {
          Element.prototype.before.call(before, ...children)
        } else {
          // We're a text node - work backwards and insert *after* the preceeding Element
          const parent = before.parentElement;
          if (!parent)
            throw new Error("Parent is null");

          if (parent !== container) {
            console.warn("Container mismatch??");
          }
          for (let i = 0; i < children.length; i++)
            parent.insertBefore(children[i], before);
        }
      } else {
        Element.prototype.append.call(container, ...children)
      }

      return children;
    }
  }
  if (!nameSpace) {
    tag.appender = appender;  // Legacy RTA support
    tag.nodes = nodes;        // Preferred interface
  }


  /** Routine to *define* properties on a dest object from a src object **/
  function deepDefine(d: Record<string | symbol | number, any>, s: any): void {
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
                // If this is a new value in the destination, just define it to be the same property as the source
                Object.defineProperty(d, k, srcDesc);
              } else {
                if (value instanceof Node) {
                  console.warn("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
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

  function assignProps(base: Element, props: Record<string, any>) {
    // Copy prop hierarchy onto the element via the asssignment operator in order to run setters
    if (!(callStackSymbol in props)) {
      (function assign(d: any, s: any): void {
        if (s === null || s === undefined || typeof s !== 'object')
          return;
        for (const [k, srcDesc] of Object.entries(Object.getOwnPropertyDescriptors(s))) {
          try {
            if ('value' in srcDesc) {
              const value = srcDesc.value;
              if (isAsyncIter<unknown>(value)) {
                const ap = asyncIterator(value);
                const update = (es: IteratorResult<unknown>) => {
                  if (!base.ownerDocument.contains(base)) {
                    /* This element has been removed from the doc. Tell the source ap
                      to stop sending us stuff */
                    //throw new Error("Element no longer exists in document (update " + k + ")");
                    ap.return?.(new Error("Element no longer exists in document (update " + k + ")"));
                    return;
                  }

                  if (!es.done) {
                    const value = es.value?.valueOf();
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
                    ap.next().then(update).catch(error);
                  }
                };
                const error = (errorValue: any) => {
                  ap.return?.(errorValue);
                  console.warn("Dynamic attribute error", errorValue, k, d, base);
                  appender(base)(DyamicElementError({error: errorValue}));
                }
                ap.next().then(update).catch(error);
              } 
              
              if (!isAsyncIter<unknown>(value)) {
                // This has a real value, which might be an object
                if (value && typeof value === 'object' && !isPromiseLike(value)) {
                  if (value instanceof Node) {
                    console.warn("Having DOM Nodes as properties of other DOM Nodes is a bad idea as it makes the DOM tree into a cyclic graph. You should reference nodes by ID or as a child", k, value);
                    d[k] = value;
                  } else {
                    // Note - if we're copying to ourself (or an array of different length), 
                    // we're decoupling common object references, so we need a clean object to 
                    // assign into
                    if (!(k in d) || d[k] === value || (Array.isArray(d[k]) && d[k].length !== value.length)) {
                      if (value.constructor === Object || value.constructor === Array) {
                        d[k] = new (value.constructor);
                        assign(d[k], value);
                      } else {
                        // This is some sort of constructed object, which we can't clone, so we have to copy by reference
                        d[k] = value;
                      }
                    } else {
                      if (Object.getOwnPropertyDescriptor(d,k)?.set)
                        d[k] = value;
                      else
                       assign(d[k], value);
                    }
                  }

                } else {
                  if (s[k] !== undefined)
                    d[k] = s[k];
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

  function extended(this: TagCreator<Element>, _overrides: Overrides | ((instance?: Instance) => Overrides)) {
    const overrides = (typeof _overrides !== 'function')
      ? (instance: Instance) => _overrides
      : _overrides

    const staticInstance = {} as Instance;
    let staticExtensions: Overrides = overrides(staticInstance);
    /* "Statically" create any styles required by this widget */
    if (staticExtensions.styles) {
      poStyleElt.appendChild(document.createTextNode(staticExtensions.styles));
      if (!document.head.contains(poStyleElt)) {
        document.head.appendChild(poStyleElt);
      }
    }

    // "this" is the tag we're being extended from, as it's always called as: `(this).extended`
    // Here's where we actually create the tag, by accumulating all the base attributes and
    // (finally) assigning those specified by the instantiation
    const extendTagFn = (attrs: {
      debugger?: any;
      document?: Document;
      [callStackSymbol]?: Overrides[];
    } | ChildTags, ...children: ChildTags[]) => {
      const noAttrs = isChildTag(attrs) ;
      const newCallStack: Overrides[] = [];
      const combinedAttrs = { [callStackSymbol]: (noAttrs ? newCallStack : attrs[callStackSymbol]) ?? newCallStack  };
      const e = noAttrs ? this(combinedAttrs, attrs, ...children) : this(combinedAttrs, ...children);
      e.constructor = extendTag;
      const ped = {} as Instance;
      const tagDefinition = overrides(ped);
      combinedAttrs[callStackSymbol].push(tagDefinition);
      deepDefine(e, tagDefinition.prototype);
      deepDefine(e, tagDefinition.override);
      deepDefine(e, tagDefinition.declare);
      const iterableKeys = tagDefinition.iterable && Object.keys(tagDefinition.iterable);
      iterableKeys?.forEach(k => {
        defineIterableProperty(e, k, tagDefinition.iterable![k as keyof typeof tagDefinition.iterable])
      });
      if (combinedAttrs[callStackSymbol] === newCallStack) {
        if (!noAttrs)
          assignProps(e, attrs);
        while (newCallStack.length) {
          const base = newCallStack.shift();
          const children = base?.constructed?.call(e);
          if (isChildTag(children)) // technically not necessary, since "void" is going to be undefined in 99.9% of cases.
            appender(e)(children);
        }
        // @ts-ignore
        iterableKeys?.forEach(k => e[k] = e[k].valueOf());
      }
      return e;
    }

    const extendTag = </*TagCreator<Element>*/any>Object.assign(extendTagFn, {
      super: this,
      overrides,
      extended,
      valueOf: () => {
        const keys = [...Object.keys(staticExtensions.declare || {})/*, ...Object.keys(staticExtensions.prototype || {})*/];
        return `${extendTag.name}: {${keys.join(', ')}}\n \u21AA ${this.valueOf()}`
      }
    });

    const fullProto = {};
    (function walkProto(creator: TagCreator<Element>) {
      if (creator?.super)
        walkProto(creator.super);

      const proto = creator.overrides?.(staticInstance);
      if (proto) {
        deepDefine(fullProto, proto?.prototype);
        deepDefine(fullProto, proto?.override);
        deepDefine(fullProto, proto?.declare);
      }
    })(this);
    deepDefine(fullProto, staticExtensions.prototype);
    deepDefine(fullProto, staticExtensions.override);
    deepDefine(fullProto, staticExtensions.declare);
    Object.defineProperties(extendTag, Object.getOwnPropertyDescriptors(fullProto));

    // Attempt to make up a meaningfu;l name for this extended tag
    const creatorName = fullProto
      && 'className' in fullProto 
      && typeof fullProto.className === 'string' 
      ? fullProto.className
      : '?';
    const callSite = DEBUG ? ' @'+(new Error().stack?.split('\n')[2]?.match(/\((.*)\)/)?.[1] ?? '?') : '';

    Object.defineProperty(extendTag, "name", { 
      value: "<ai-" + creatorName.replace(/\s+/g,'-') + callSite+">" 
    });

    return extendTag;
  }

  const baseTagCreators: {
    [K in keyof HTMLElementTagNameMap]?: TagCreator<P & HTMLElementTagNameMap[K] & PoElementMethods>
  } & {
    [n: string]: TagCreator<P & Element & P & PoElementMethods>
  } = {};

  function createTag<K extends keyof HTMLElementTagNameMap>(k: K): TagCreator<P & HTMLElementTagNameMap[K] & PoElementMethods>;
  function createTag<E extends Element>(k: string): TagCreator<P & E & PoElementMethods>;
  function createTag(k: string): TagCreator<P & NamespacedElementBase & PoElementMethods> {
    if (baseTagCreators[k])
      // @ts-ignore
      return baseTagCreators[k];

    const tagCreator = (attrs: P & PoElementMethods & Partial<{
      debugger?: any;
      document?: Document;
    }> | ChildTags, ...children: ChildTags[]) => {
      let doc = document;
      if (isChildTag(attrs)) {
        children.unshift(attrs);
        attrs = { prototype: {} } as any;
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
          ? doc.createElementNS(nameSpace, k.toLowerCase())
          : doc.createElement(k);
        e.constructor = tagCreator;

        deepDefine(e, tagPrototypes);
        assignProps(e, attrs);

        // Append any children
        appender(e)(children);
        return e;
      }
    }

    const includingExtender = <TagCreator<Element>><unknown>Object.assign(tagCreator, {
      super: ()=>{ throw new Error("Can't invoke native elemenet constructors directly. Use document.createElement().") },
      extended, // How to extend this (base) tag
      valueOf() { return `TagCreator: <${nameSpace || ''}${nameSpace ? '::' : ''}${k}>` }
    });

    Object.defineProperty(tagCreator, "name", { value: '<' + k + '>' });
    // @ts-ignore
    return baseTagCreators[k] = includingExtender;
  }

  tags.forEach(createTag);

  // @ts-ignore
  return baseTagCreators;
};

const { "ai-ui-container": AsyncDOMContainer } = tag('', ["ai-ui-container"]);
const DomPromiseContainer = AsyncDOMContainer.extended({
  styles: `
  ai-ui-container.promise {
    display: ${DEBUG ? 'inline' : 'none'};
    color: #888;
    font-size: 0.75em;
  }
  ai-ui-container.promise:after {
    content: "⋯";
  }`,
  override: {
    className: 'promise'
  },
  constructed() {
    return AsyncDOMContainer({ style: { display: 'none' } }, DEBUG 
      ? new Error("Constructed").stack?.replace(/^Error: /, '')
      : undefined);
  }
});
const DyamicElementError = AsyncDOMContainer.extended({
  styles: `
  ai-ui-container.error {
    display: block;
    color: #b33;
  }`,
  override: {
    className: 'error'
  },
  declare: {
    error: undefined as any
  },
  constructed(){
    return (typeof this.error === 'object') 
      ? this.error instanceof Error 
        ? this.error.message 
        : JSON.stringify(this.error) 
      : String(this.error); 
  }
});

export let enableOnRemovedFromDOM = function () {
  enableOnRemovedFromDOM = function () { }; // Only create the observer once
  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'childList') {
        m.removedNodes.forEach(
          removed => removed && removed instanceof Element &&
            [...removed.getElementsByTagName("*"), removed].filter(elt => !elt.ownerDocument.contains(elt)).forEach(
              elt => {
                'onRemovedFromDOM' in elt && typeof elt.onRemovedFromDOM === 'function' && elt.onRemovedFromDOM()
              }
            ));
      }
    });
  }).observe(document.body, { subtree: true, childList: true });
};

export function getElementIdMap(node?: Element | Document, ids?: Record<string, Element>) {
  node = node || document;
  ids = ids || {};
  if (node.querySelectorAll) {
    node.querySelectorAll("[id]").forEach(function (elt) {
      if (elt.id) {
        if (!ids![elt.id])
          ids![elt.id] = elt;
        //else console.warn("Shadowed element ID",elt.id,elt,ids[elt.id])
      }
    });
  }
  return ids;
}


