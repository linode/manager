#!/bin/bash

set -e -x

npm install

npm test -- -R xunit-file
