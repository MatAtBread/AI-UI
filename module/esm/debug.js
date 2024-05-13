// @ts-ignore
export const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
const _console = {
    log(...args) {
        if (DEBUG)
            console.log('(AI-UI) LOG:', ...args);
    },
    warn(...args) {
        if (DEBUG)
            console.warn('(AI-UI) WARN:', ...args);
    },
    info(...args) {
        if (DEBUG)
            console.info('(AI-UI) INFO:', ...args);
    }
};
export { _console as console };
