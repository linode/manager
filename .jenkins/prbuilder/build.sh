#!/bin/bash

set -e -x

npm install

npm run build
npm run-script coverage
