
const getEltInfo = () => {
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
      if (nodeName === '#text') {
        if (n.textContent?.match(/^\s+$/))
          return null;
        return "`" + n.textContent + "`" + pad.slice(0, -4);
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
            [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad).slice(0, -2) + ']';
        return undefined;
      }
      if (!hasAttrs && n.childNodes.length === 0)
        return nodeName + '()';
      if (!hasAttrs && n.childNodes.length === 1)
        return nodeName + '(' + (codify(n.childNodes[0], nest, true) || '') + ')';
      return nodeName + '(' +
        attrs +
        (attrs && (n.childNodes.length > 0) ? ",\n" + pad : '') +
        (nest < 20
          ? [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad)
          : '...') +
        ')';
    })(n);
    return `import { tag } from '@matatbread/ai-ui';
const { ${Object.keys(nodeNames)} } = tag();
const _ = ${rootNode}.extended({
  ${rootAttrs ? `override:${rootAttrs},` : ''}
  ${markup ? `constructed() {
    return ${markup}
  }` : ''}
});
    `;
  }

  function noProto(o) {
    return typeof o === 'object' && o
      ? Object.create(null,
        Object.fromEntries(Object.entries(o).map(([k, v]) => [
          v[Symbol.asyncIterator] ? k + ' 💥' : k, 
          {
            value: typeof v === 'function' ? v : v?.valueOf(),
            enumerable: true
          }
        ]))
      )
      : o;
  }
  function explainConstructor(c) {
    const props = {
      [c.name]: {
        enumerable: true,
        value: c.definition
          ? Object.assign(noProto(c.definition), {
            ['super ' + c.super.name]: c.super
              ? explainConstructor(c.super)[c.super.name]
              : noProto(c.super)
          })
          : Object.getPrototypeOf($0)
      }
    }
    return Object.create(null, props);
  }
  const props = explainConstructor($0.constructor);
  Object.defineProperties(props, {
    'AI-UI Code Snippet': {
      value: codify($0)
    },

    'Element properties': {
      // TODO: Find a way to see what attrs aren't the same as the proto values?
      // Object.getPrototypeOf($0)[Symbol.toStringTag]
      value: Object.defineProperty(noProto($0), 'Prototype properties', { value: Object.getPrototypeOf($0) })
    }
  });

  return props;
}

chrome.devtools.panels.elements.createSidebarPane(
  'AI-UI',
  (sidebar) => {
    const updateElementProperties = () => sidebar.setExpression('(' + getEltInfo.toString() + ')()');
    updateElementProperties();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
  }
);
