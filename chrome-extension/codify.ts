/** Convert any live node into an AI-UI extended component
 * 1) Copy the function `codify` into your Chrome Dev tools console.
 * 2) Select a node in the inspector
 * 3) run "console.log(codify($0))"
 * 4) Copy the output and save as file, remembering to give your extended tag a name other than "_"
 */

function codify(n: Node | Element): string | null {
  function attrName(s: string) {
    if (s === 'class') return 'className';
    if (s === 'for') return 'htmlFor';
    if (s.includes('-'))
      return s.split('-').map((p, i) => i > 0 ? p.slice(0, 1).toUpperCase() + p.slice(1) : p).join('');
    return s;
  }

  const nodeNames: Record<string, any> = {};
  let rootAttrs: string = '';
  let rootNode: string = '';

  const markup = (function codify(n: Node | Element, nest = 0, noPad = false): string | null {
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
        attrs += ` ${attrName(n.attributes[0].name)}: ${JSON.stringify(n.attributes[0].value)} },` + pad;
      } else {
        for (const a of n.attributes) {
          attrs += pad + '  ';
          attrs += `${attrName(a.name)}: ${JSON.stringify(a.value)},`;
        }
        attrs = attrs.slice(0, -1) + pad + "}";
        if (n.childNodes.length > 0) attrs += ",\n" + pad
      }
    }

    if (nest === 0) {
      rootAttrs = hasAttrs ? attrs : '';
      rootNode = nodeName;
      return '[' + pad + 
        [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad).slice(0,-2) + ']'
    }
    if (!hasAttrs && n.childNodes.length === 0)
      return nodeName + '()';

    if (!hasAttrs && n.childNodes.length === 1)
      return nodeName + '(' + (codify(n.childNodes[0], nest, true) || '') + ')';

    return nodeName + '(' +
      attrs +
      (nest < 20
        ? [...n.childNodes].map(n => codify(n, nest + 1)).filter(s => s != null).join("," + pad)
        : '...') +
      ')';
  })(n);

  return `import { tag } from '../module/esm/ai-ui.js';
const { ${Object.keys(nodeNames)} } = tag();
const _ = ${rootNode}.extended({
  ${rootAttrs ? `declare:${rootAttrs}` : ''}
  constructed() {
    return ${markup}
  }
});
`
}
