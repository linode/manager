#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const BASE_PATH = './src/data';

const dirPath = path.join(BASE_PATH, 'objects');
const files = fs.readdirSync(dirPath);
files.filter(function(fileName) {
  return path.extname(fileName) === '.json';
}).forEach(function(fileName) {
  const filePath = path.join(dirPath, fileName);
  console.log(filePath);
  const data = JSON.stringify(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  const asModule = `module.exports = ${data};`;

  const newFileName = `${fileName.split('.')[0]}.js`;
  const newFilePath = path.join(dirPath, newFileName);

  fs.writeFileSync(newFilePath, asModule);
});
