#!/bin/bash

$PWD/scripts/wait-for-it.sh -t 250 -s manager-storybook:6006 -- yarn storybook:e2e --log
status=$? # save previous command return status
chmod 777 /src/storybook-test-results/*.xml
exit $status
