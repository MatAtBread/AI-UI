/* AI-UI TEST HARNESS

Simulates DOM via JSDOM. Preloads AI-UI for testing.

Test files should be located in the `tests` directory, and can import AI-UI types and references with:

  import { Iterators } from '../../module/src/ai-ui';

The test harness functions should be referenced via:

  /// <reference path="../test.env.d.ts"/>

...which can also be used to describe any additional functions made available to the tests.

The TS transpiler is configured to permit top-level await for convenience.

Tests should use console.log(...) to report progress. The first time the test harness is run (or if
run with the --update or -U options), these are captured and stored in the *.expected files. Subsequent
runs will compare the output with the same file.

The .expected.json can be modified *by hand* and the entries (which represent the output of each `console.log` call
in the test script) can be changed from a string to a object of the form:

  { "regex": "expr" }

...and the test result output will be tested against the regex as opposed to strict equality.

*/

import ts from '../module/node_modules/typescript';
import '../module/node_modules/colors';
import { readFileSync, existsSync, writeFileSync, readdirSync, lstatSync } from 'fs';
import path from 'path';

const { JSDOM } = require("../module/node_modules/jsdom");
// Globals to simulate DOM
const window = new JSDOM().window;
Object.assign(globalThis, {
  document: window.document,
  Element: window.Element,
  Node: window.Node,
  NodeList: window.NodeList,
  HTMLCollection: window.HTMLCollection,
  Event: window.Event,
  MutationObserver: window.MutationObserver,
});

const AI = require('../module/dist/ai-ui.cjs.js');

// Load, transpile and run all the locally defined tests

function transpile(tsFile: string) {
  const tsCode = readFileSync(tsFile).toString();

  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      "module": 1,
      "skipLibCheck": true,
      "lib": ["lib.es2020.d.ts"],
      "target": 7,
      "inlineSourceMap": false,
      "sourceMap": false
    }
  });

  return jsCode.outputText.replace('"use strict";', '');
}

const dateRegex = '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)$';

const exclusions = (file: string) => file !== 'index.ts' && !file.startsWith('-') && !file.endsWith('.d.ts') && file.endsWith('.ts');
const options = process.argv.slice(2).filter(file => file.startsWith('-'));
const update = (options.includes('--update') || options.includes('-U'));
const logRun = (options.includes('--log') || options.includes('-l'));
const noTimeout = (options.includes('--no-timeout') || options.includes('-T'));

function sleep<T>(n: number, t: T): Promise<T> {
  return new Promise<T>((resolve, reject) => setTimeout(() => (t instanceof Error ? reject(t) : resolve(t)), n * 1000));
}

function unbox(a: any):any {
  if (a && typeof a === 'object') {
    if (a instanceof Date) {
      a.toJSON = function(){ return dateRegex };
      return a;
    }
    if (Array.isArray(a)) {
      return a.map(a => unbox(a));
    }
    a = a.valueOf();
    if (typeof a !== 'object')
      return a;
    return Object.fromEntries(Object.entries(a).map(([k,v]) => [
      k,
      (v && typeof v === 'object' && 'toJSON' in v)
        ? (Symbol.asyncIterator in v && 'toJSON' in v) ? unbox((v as any).toJSON()) : unbox(v)
        : v
    ]));
  }
  return isNotNullish(a) ? a : null;//a?.[Symbol.toPrimitive]() ?? null;
}

async function captureLogs(file: string) {
  const fnCode = transpile(file);
  const logs: unknown[][] = [];
  let line = 1;
  function log(...args: unknown[]) {
    // Unbox iterables
    args = unbox(args);
    logs.push([line,...args]);
    if (logRun) {
      console.log((String(line++) + ")").padEnd(5).grey, ...args);
    } else {
      console.log("|/-\\|/-\\"[line++%8]);
      console.log("\x1B[2A");
    }
  }
  const env = {
    ...AI,
    require(module: string) {
      if (module === '../../module/src/ai-ui')
        return AI;
      return require(module);
    },
    Test: {
      sleep,
      count: async function* count(n: number = 10) {
        for (let i = 0; i < n; i++)
          yield i;
      },
      response: undefined
    },
    console: {
      log
    }
  };
  await Promise.race([
    eval(`(async function({${Object.keys(env)}}) {\n${fnCode}\n})`)(env),
    noTimeout ? new Promise(() => { }) : sleep(30, new Error(`Timeout running ${file}`))
  ]);
  await env.Test.response;
  return logs;
}

class CompareError extends Error {
  file: string;
  constructor(msg: string, file: string) {
    super(msg);
    this.file = file;
  }
}

function exactRegExpPattern(inputString: string) {
  // Escape any special characters in the input string
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stringify(v: any) {
  return JSON.stringify(v, function (key: string, value: any) {
    if (value instanceof RegExp || value === dateRegex) {
      return value.toString();
    }
    if (typeof value === 'string') {
      return exactRegExpPattern(value);
    }
    return value ?? null;
  })
}

async function compareResults(file: string, updateResults: boolean) {
  const resultFile = file.replace(/\.ts$/, '.expected.json');
  const lines = await captureLogs(file);
  if (updateResults || !existsSync(resultFile)) {
    console.log("Updating ", resultFile.magenta);
    writeFileSync(resultFile, "[\n  " + lines.map(stringify).join(",\n  ") + "\n]");
  }

  const expected = JSON.parse(readFileSync(resultFile).toString(),
    function (key: string, value: any) {
      return typeof value === 'string' ? new RegExp(value,"s") : value;
    }
  );

  // check results against this run
  if (lines.length !== expected.length)
    throw new CompareError(`Expected ${expected.length} lines, results ${lines.length} lines`, file);

  for (let i = 0; i < lines.length; i++) {
    const expect = expected[i];
    const result = lines[i];
    if (expect.length !== result.length) {
      //      throw new CompareError(`Line ${i + 1}: expected ${expect.length} fields (${expected}), results ${result.length} (${results}) fields`, file);
      throw new CompareError(`Line ${i + 1}: expected ${expect.length} fields, results ${result.length} fields`, file);
    }
    for (let j = 0; j < result.length; j++) {
      const x = expect[j];
      const r = result[j];
      if (!fuzzyRegExEq(x, r)) {
        const sx = stringify(x);
        const sr = stringify(r);
        throw new CompareError(`Line ${i + 1} field ${j + 1}\nexpected:\n${sx.yellow}\nresult:\n${sr.cyan}`, file);
      }
    }
  }
}

function fuzzyRegExEq(a: any, b: any) {
  // Unbox iterable properties
  a = a ?? null;
  b = b ?? null;
  if (a === b) return true;

  if (a instanceof Date)
    a = a.toISOString();
  if (b instanceof Date)
    b = b.toISOString();

  if (a === b) return true;

  if (a instanceof RegExp)
    return isNotNullish(b) && a.test(b.toString());
  if (b instanceof RegExp)
    return isNotNullish(a) && b.test(a.toString());

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!fuzzyRegExEq(a[i], b[i])) return false;
      return true;
    }

    // if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    // if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      let key = keys[i];
      if (!fuzzyRegExEq(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

function isNotNullish<T>(a: T | null | undefined): a is T {
  return a !== null && a !== undefined;
}

const files = new Set(process.argv.slice(2).filter(exclusions));
let dirs = process.argv.slice(2).filter(p => !p.startsWith('-') && existsSync(p) && lstatSync(p).isDirectory());
if (dirs.length + files.size === 0) dirs = ['../testing/tests'];
const foundFiles = dirs.map(dir => readdirSync(path.join(__dirname, dir)).map(file => path.join(__dirname, dir, file))).flat().filter(exclusions);
foundFiles.forEach(file => files.add(file));

(async () => {
  let failed: string[] = [];
  let passed = 0;
  for (const file of files) {
    try {
      console.log(" run ".blue, file);
      console.log("\x1B[2A");
      await compareResults(file, update);
      console.log("pass ".green, file);
      passed += 1;
    } catch (ex) {
      failed.push(file);
      console.log("FAIL".bgRed + " ", file.red, ex?.toString().red)
    }
  }
  if (failed.length) {
    console.log(passed + failed.length, "tests:", passed, "passes".green, failed.length, "failures".red, '\n  '+failed.map(name => name.red).join('\n  '));
    process.exit(1);
  } else {
    console.log(passed + failed.length, "tests:", passed, "passes".green);
    process.exit(0);
  }
})();
