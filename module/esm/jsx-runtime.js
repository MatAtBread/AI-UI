import { tag } from "./ai-ui.js";
/* Support for React.createElement */
const tagCreators = tag();
function AIUIJSX(tagName, attrs, ...children) {
    return (tagName === AIUIJSX ? children
        : typeof tagName === 'string'
            ? tagCreators[tagName]?.(attrs, ...children)
            : tagName(attrs, ...children));
}
export default {
    AIUIJSX
};
