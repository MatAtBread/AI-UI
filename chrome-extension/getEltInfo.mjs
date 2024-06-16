export const getEltInfo = () => {
  function codify(n) {
    function attrName(s) {
      if (s === 'class')
        return 'className';
      if (s === 'for')
        return 'htmlFor';
      if (s.includes('-'))
        return s.split('-').map((p, i) => i > 0 ? p.slice(0, 1).toUpperCase() + p.slice(1) : p).join('');
      return s;
    }
    const nodeNames = {};
    let rootAttrs = '';
    let rootNode = '';
    const markup = (function codify(n, nest = 0, noPad = false) {
      const pad = noPad ? '' : '\n' + ' '.repeat(nest * 2 + 6);
      const nodeName = n.nodeName.toLowerCase();
      //      if (nodeName === 'script') return 'script()'+pad;
      if (nodeName === '#text') {
        if (n.textContent?.match(/^\s+$/))
          return null;
        if (n.textContent.includes('\n') || n.textContent.includes('\t') || n.textContent.includes('"') || n.textContent.includes('`') || n.textContent.includes("\""))
          return "`" + n.textContent + "`"; // + pad.slice(0, -4);
        return "'" + n.textContent + "'"; // + pad.slice(0, -4);
      }
      if (nodeName === '#comment')
        return "/*" + n.nodeValue + "*/";
      nodeNames[nodeName] = true;
      let attrs = pad;
      let hasAttrs = false;
      if ('attributes' in n && n.attributes.length > 0) {
        hasAttrs = true;
        attrs = "{";
        if (n.attributes.length === 1) {
          attrs += ` ${attrName(n.attributes[0].name)}: ${JSON.stringify(n.attributes[0].value)} }`;
        }
        else {
          for (const a of n.attributes) {
            attrs += pad + '  ';
            attrs += `${attrName(a.name)}: ${JSON.stringify(a.value)},`;
          }
          attrs = attrs.slice(0, -1) + pad + "}";
        }
      }
      if (nest === 0) {
        rootAttrs = hasAttrs ? attrs : '';
        rootNode = nodeName;
        if (n.childNodes.length)
          return '[' + pad +
            [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad) /*.slice(0, -4)*/ + ']';
        return undefined;
      }
      if (!hasAttrs && n.childNodes.length === 0)
        return nodeName + '()';
      if (!hasAttrs && n.childNodes.length === 1)
        return nodeName + '(' + (codify(n.childNodes[0], nest, true) || '') + ')';
      return nodeName + '(' +
        attrs +
        (hasAttrs && attrs && (n.childNodes.length > 0) ? "," + pad : '') +
        (nest < 20
          ? [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad)
          : '...') +
        pad.slice(0, -2) + ')';
    })(n);
    return `import { tag } from '@matatbread/ai-ui';
const { ${Object.keys(nodeNames)} } = tag();
export default ${rootNode}.extended({
  ${rootAttrs ? `override: ${rootAttrs},` : ''}
  ${markup ? `constructed() {
    return ${markup}
  }` : ''}
});
    `;
  }

  function noProto(o, deep) {
    function unbox(v) {
      if (v === null || v === undefined || !(v.valueOf)) return v;
      return v.valueOf();
    }
    try {
      return typeof o === 'object' && o && !Array.isArray(o)
        ? Object.create(null,
          Object.fromEntries(Object.entries(o).map(([k, v]) => [
            (v && v[Symbol.asyncIterator]) ? k + ' 💥' : k,
            {
              value: typeof v === 'function' ? v : deep ? noProto(unbox(v), deep) : unbox(v),
              enumerable: Object.getOwnPropertyDescriptor(o, k).enumerable
            }
          ]))
        )
        : o;
    } catch (ex) {
      return o;
    }
  }

  function explainConstructor(c) {
    const props = {
      [c.name]: {
        enumerable: true,
        value: c.definition
          ? Object.assign(noProto(c.definition, true), {
            ['super ' + c.super.name]: c.super
              ? explainConstructor(c.super)[c.super.name]
              : noProto(c.super, true)
          })
          : Object.getPrototypeOf($0)
      }
    };
    return Object.create(null, props);
  }
  const props = explainConstructor($0.constructor);

  function showProperties(o) {
    const d = noProto(o);
    let c = o.constructor;
    while (c) {
      if (c.definition) {
        if (c.definition.override)
          Object.defineProperties(d, Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(c.definition.override)).filter(([name, pd]) => !(name in o)).map(([name, pd]) => [name, ((pd.enumerable = false), pd)])));
        if (c.definition.declare)
          Object.defineProperties(d, Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(c.definition.declare)).filter(([name, pd]) => !(name in o)).map(([name, pd]) => [name, ((pd.enumerable = false), pd)])));
      }
      c = c.super;
    }
    // \u00AD is a hack to place this at the end of the properties, as dev tools draws in code-point order, and it's non-visible
    return Object.defineProperty(d, '\u00ADPrototype properties', { value: Object.getPrototypeOf(o) });
  }

  Object.defineProperties(props, {
    'AI-UI Code Snippet': {
      value: codify($0)
    },

    'Element properties': {
      value: showProperties($0)
    }
  });

  return props;
};
