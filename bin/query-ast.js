#!/usr/bin/env node

const babylon = require('babylon');
const jsonpath = require('jsonpath');

const fs = require("fs");

const filename = process.argv[2];
if (!filename) {
  console.error("no filename specified");
  process.exit(0);
}

const query = process.argv[3];
if (!query) {
  console.error("no query specified");
  process.exit(0);
}

const file = fs.readFileSync(filename, "utf8");
const ast  = babylon.parse(file, {
    sourceType: "module",
    plugins: [
        "estree",
        "jsx",
        "flow",
        "doExpressions",
        "objectRestSpread",
        "decorators",
        "classProperties",
        "exportExtensions",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "dynamicImport",
    ]
});
const result = jsonpath.query(ast, query);

result.forEach(instance => {
    const { start, end } = instance.loc;
    console.log(`${filename}: ${start.line}:${start.column}-${end.line}:${end.column}`);
});
