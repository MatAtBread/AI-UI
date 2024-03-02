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

TODO: Permit manual editing of the .expected files to enable regexp wildcards.

*/

import ts from '../module/node_modules/typescript';
import '../module/node_modules/colors';
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const { JSDOM } = require("../module/node_modules/jsdom");

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

  return jsCode.outputText.replace('"use strict";','');
}

// Globals to simulate DOM
const window = new JSDOM().window;
Object.assign(globalThis, {
  document: window.document,
  Element: window.Element,
  Node: window.Node,
  NodeList: window.NodeList,
  HTMLCollection: window.HTMLCollection,
});

const AI = require('../module/dist/ai-ui.cjs.js')// as { Iterators: Iterators };

async function captureLogs(file: string) {
  const fnCode = transpile(file);
  const fn = eval("(async function({console,Test,require,Iterators,tag,when}) {\n" + fnCode + "\n})");
  const logs: string[][] = [];
  await fn({
    Iterators: AI.Iterators,
    tag: AI.tag,
    when: AI.when,

    require(module: string){
      if (module === '../../module/src/ai-ui')
        return AI;
      return require(module);
    },
    Test:{
      sleep: async function sleep<T>(n: number): Promise<T> {
        return new Promise<T>(resolve => setTimeout(resolve, n *1000));
      },
      count: async function *count(n :number = 10) {
        for (let i=0; i<n; i++)
          yield i;
      }
    },
    console: {
      log(...args: any[]) {
        logs.push(args.map(a => JSON.stringify(a)));
      }
    }
  })
  return logs;
}

class CompareError extends Error {
  expected: string[];
  result: string[];
  file: string;
  constructor(msg: string, file: string, expected: string[], result: string[]) {
    super(msg);
    this.file = file;
    this.expected = expected;
    this.result = result;
  }
}

async function compareResults(file: string, updateResults: boolean) {
  const resultFile = file.replace(/\.ts$/,'.expected');
  const results = await captureLogs(file);
  if (updateResults || !existsSync(resultFile)) {
    console.log("Updating ",resultFile.magenta);
    writeFileSync(resultFile, "[\n  "+results.map(r => JSON.stringify(r)).join(",\n  ")+"\n]");
  }

  const expected = JSON.parse(readFileSync(resultFile).toString());
  // check results against this run
  if (results.length !== expected.length)
    throw new CompareError("Expected length !== results length", file, expected[0], results[0]);

  for (let i = 0; i < results.length; i++) {
    checkLogResult(expected[i],results[i]);
  }

  function checkLogResult(expected: string[], result: string[]) {
    if (expected.length !== result.length) {
      throw new CompareError("Expected length !== results length", file, expected, result);
    }
    for (let i = 0; i < result.length; i++) {
      const x = JSON.parse(expected[i]);
      const r = JSON.parse(result[i]);
      if (x !== r)
        throw new CompareError("Expected length !== results length", file, x, r);
    }
  }  
}

const files = readdirSync(path.join(__dirname,'tests')).filter(file => file !== 'index.ts' && !file.startsWith('-') && !file.endsWith('.d.ts') && file.endsWith('.ts'));
const options = process.argv.filter(file => file.startsWith('-'));
(async ()=>{
  const update = (options.includes('--update') || options.includes('--U'));
  for (const file of files) {
    try {
      await compareResults(path.join(__dirname, 'tests', file), update);
      console.log("pass\t".green, file)
    } catch (ex) {
      console.log("FAIL\t".red, file, ex?.toString().red)
    }
  }
})();
