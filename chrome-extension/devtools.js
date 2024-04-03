if (window.location.search) {
  document.body.innerHTML = decodeURIComponent(window.location.search.slice(1));
} else {
  const getEltInfo = function () {
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
      return typeof o === 'object' && o ? Object.create(null, Object.getOwnPropertyDescriptors(o)) : o;
    }
    function explainConstructor(c, code) {
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
      if (code) {
        props['AI-UI Code Snippet'] = {
          value: code
        };
        props['Element'] = {
          value: $0
        }
      }
      return Object.create(null, props);
    }
    return explainConstructor($0.constructor, codify($0))
  }

  chrome.devtools.panels.elements.createSidebarPane(
    'AI-UI',
    function (sidebar) {
      async function updateElementProperties() {
        // function htmlEscape(str) {
        //   return str
        //     .replace(/&/g, '&amp')
        //     .replace(/'/g, '&apos')
        //     .replace(/"/g, '&quot')
        //     .replace(/>/g, '&gt')
        //     .replace(/</g, '&lt');
        // }
        sidebar.setExpression('(' + getEltInfo.toString() + ')()');
        //                 const res = await chrome.devtools.inspectedWindow.eval(
        //                     '(' + getEltInfo.toString() + ')()',
        //                     function (res, error) {
        //                         const markup = `
        // <h1>${htmlEscape(res.Name)}</h1>
        // <h2>Extended</h2>
        // <pre>${htmlEscape(res.Extensions)}</pre>
        // <h2>Codified Tag</h2>
        // <pre>${htmlEscape(res.Code)}</pre>`;
        //                         sidebar.setPage('devtools.html?' + encodeURIComponent(markup));
        //                     }
        //                 );

      }
      updateElementProperties();
      chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
    }
  );
}