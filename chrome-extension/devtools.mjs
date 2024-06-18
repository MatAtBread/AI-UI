import { getEltInfo } from "./getEltInfo.mjs";

chrome.devtools.panels.elements.createSidebarPane(
  'AI-UI',
  (sidebar) => {
    const updateElementProperties = () => { 
      sidebar.setExpression('(' + getEltInfo.toString() + ')()');
    };
    updateElementProperties();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
  }
);
