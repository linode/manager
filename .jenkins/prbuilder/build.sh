#!/bin/bash

set -e -x

npm install

npm run-script coverage
