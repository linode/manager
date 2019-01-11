#!/bin/bash
docker-compose -f visual-regression-test.yml up --build --exit-code-from manager-e2e
yarn e2e:html-report
