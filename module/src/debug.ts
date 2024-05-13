// @ts-ignore
export const DEBUG = globalThis.DEBUG == '*' || globalThis.DEBUG == true || globalThis.DEBUG?.match(/(^|\W)AI-UI(\W|$)/) || false;

const _console = {
  log(...args: any) {
    if (DEBUG) console.log('(AI-UI) LOG:', ...args)
  },
  warn(...args: any) {
    if (DEBUG) console.warn('(AI-UI) WARN:', ...args)
  },
  info(...args: any) {
    if (DEBUG) console.info('(AI-UI) INFO:', ...args)
  }
}

export { _console as console };
