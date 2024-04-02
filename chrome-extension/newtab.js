chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tabId = tabs[0].id;
    const e = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => new Promise(resolve => {
            const hilite = {
                opacity: '0.5',
                backgroundColor: 'rgba(150,30,150,0.3)'
            }
            const over = { elt: undefined, style: {}};
            const mouseover = e => {
                if (over.elt) {
                    Object.assign(over.elt.style, over.style);
                }
                const elt = document.elementFromPoint(e.clientX, e.clientY);
                over.elt = elt;
                over.style = {};
                Object.keys(hilite).forEach(k => over.style[k] = elt.style[k]);
                Object.assign(elt.style, hilite);
                //console.log(over.elt,over.elt.constructor.valueOf());
            };
            const mousedown = e => {
                mouseover(e);
                document.removeEventListener("mouseover", mouseover);
                document.removeEventListener("mousedown", mousedown);
                if (over.elt) {
                    Object.assign(over.elt.style, over.style);
                }
                resolve(over.elt.constructor.valueOf().toString());
                console.log(over.elt,over.elt.constructor.valueOf());
                over.elt = undefined;
            };

            document.addEventListener("mouseover", mouseover);
            document.addEventListener("mousedown", mousedown);
        }),
        args: []
      });
    console.log("AI-UI-X",e);
 });