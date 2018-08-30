#!/bin/bash

for spec in $(git diff --name-only develop | grep 'spec.js'); do
  yarn e2e --file $spec
done

