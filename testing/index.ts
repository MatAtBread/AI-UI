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
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const { JSDOM } = require("../module/node_modules/jsdom");
const deepEqual = require('../module/node_modules/fast-deep-equal/es6');

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

const exclusions = (file: string) => file !== 'index.ts' && !file.startsWith('-') && !file.endsWith('.d.ts') && file.endsWith('.ts');
const files = process.argv.slice(2).filter(exclusions);
const options = process.argv.slice(2).filter(file => file.startsWith('-'));
const update = (options.includes('--update') || options.includes('-U'));
const logRun = (options.includes('--log') || options.includes('-l'));

function sleep<T>(n: number, t: T): Promise<T> {
  return new Promise<T>((resolve,reject) => setTimeout(()=>(t instanceof Error ? reject(t) : resolve(t)), n * 1000));
}

async function captureLogs(file: string) {
  const fnCode = transpile(file);
  const fn = eval("(async function({console,Test,require,Iterators,tag,when}) {\n" + fnCode + "\n})");
  const logs: string[][] = [];
  let line = 1;
  const done = fn({
    Iterators: AI.Iterators,
    tag: AI.tag,
    when: AI.when,

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
      }
    },
    console: {
      log(...args: any[]) {
        if (logRun) {
          console.log((String(line++)+")").padEnd(5).grey,...args);
        }
        logs.push(args.map(a => JSON.stringify(a)));
      }
    }
  });
  await Promise.race([done,sleep(30, new Error(`Timeout running ${file}`))])
  return logs;
}

class CompareError extends Error {
  file: string;
  constructor(msg: string, file: string) {
    super(msg);
    this.file = file;
  }
}

async function compareResults(file: string, updateResults: boolean) {
  const resultFile = file.replace(/\.ts$/, '.expected.json');
  const results = await captureLogs(file);
  if (updateResults || !existsSync(resultFile)) {
    console.log("Updating ", resultFile.magenta);
    writeFileSync(resultFile, "[\n  " + results.map(r => JSON.stringify(r)).join(",\n  ") + "\n]");
  }

  const expected = JSON.parse(readFileSync(resultFile).toString(),
    function(key: string, value: any){
      return (key === 'regex') ? new RegExp(value) : value;
    }
  );

  // check results against this run
  if (results.length !== expected.length)
    throw new CompareError(`Expected ${expected.length} lines, results ${results.length} lines`, file);

  for (let i = 0; i < results.length; i++) {
    const expect = expected[i];
    const result = results[i];
    if (expect.length !== result.length) {
      throw new CompareError(`Line ${i + 1}: expected ${expect.length} fields (${expected}), results ${result.length} (${results}) fields`, file);
    }
    for (let j = 0; j < result.length; j++) {
      const x = expect[j];
      const r = result[j];
      if (x.regex && x.regex instanceof RegExp
        ? !x.regex.test(r.toString())
        : !deepEqual(x, r)
      )
        throw new CompareError(`Line ${i + 1} field ${j + 1}: expected ${x.regex ? x.regex : x}, result ${r}`, file);
    }
  }
}

(async () => {
  let failed = 0;
  for (const file of files.length ? files : readdirSync(path.join(__dirname, 'tests')).filter(exclusions)) {
    try {
      console.log("run  ".blue, file);
      await compareResults(path.join(__dirname, 'tests', file), update);
      console.log("\x1B[2A");
      console.log("pass ".green, file);
    } catch (ex) {
      failed += 1;
      console.log("FAIL".bgRed + " ", file.red, ex?.toString().red)
    }
  }
  if (failed) {
    console.log(failed, "failures".red);
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
