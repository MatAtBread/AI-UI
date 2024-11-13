// @ts-ignore
export const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || Boolean(globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/)) || false;
export { _console as console };
export const timeOutWarn = 5000;
const _console = {
    log(...args) {
        if (DEBUG)
            console.log('(AI-UI) LOG:', ...args, new Error().stack?.replace(/Error\n\s*.*\n/, '\n'));
    },
    warn(...args) {
        if (DEBUG)
            console.warn('(AI-UI) WARN:', ...args, new Error().stack?.replace(/Error\n\s*.*\n/, '\n'));
    },
    info(...args) {
        if (DEBUG)
            console.trace('(AI-UI) INFO:', ...args);
    }
};
