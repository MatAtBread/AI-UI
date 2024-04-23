// @ts-ignore
export const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
export function log(...args:any) {
    if (DEBUG) console.log('(AI-UI)', ...args)
}
