#!/bin/bash

set -e -x

npm install

echo 'export const client_id = "foo"; export const client_secret = "bar";' > src/secrets.js

npm run build
npm run-script coverage
