// @ts-ignore
export const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;
export { _console as console };
export const timeOutWarn = 5000;

const _console = {
  log(...args: any) {
    if (DEBUG) console.log('(AI-UI) LOG:', ...args)
  },
  warn(...args: any) {
    if (DEBUG) console.warn('(AI-UI) WARN:', ...args)
  },
  info(...args: any) {
    if (DEBUG) console.debug('(AI-UI) INFO:', ...args)
  }
}

